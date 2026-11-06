package main

// DNS 转发核心：ACL、限速、缓存、请求合并、上游故障切换。
//
// 设计要点（针对 subdomain_brute 高频查询）：
//  1. 单条连接即可承载全部查询，家庭侧只需 1 条 NAT 会话；
//  2. 相同问题合并为一次上游查询（singleflight），避免重复放大；
//  3. 正/负缓存显著减少上游压力，提升结果稳定性；
//  4. 域白名单限制可解析范围，避免成为公开递归/放大攻击源。

import (
	"container/list"
	"errors"
	"fmt"
	"net"
	"net/netip"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/miekg/dns"
)

type Config struct {
	Listen                string   `json:"listen"`
	AdminListen           string   `json:"admin_listen"`
	AdminToken            string   `json:"admin_token"`
	Upstreams             []string `json:"upstreams"`
	UpstreamTimeoutMS     int      `json:"upstream_timeout_ms"`
	UpstreamAttempts      int      `json:"upstream_attempts"`
	CacheMaxEntries       int      `json:"cache_max_entries"`
	CacheMaxTTLSeconds    int      `json:"cache_max_ttl_seconds"`
	NegativeMaxTTLSeconds int      `json:"negative_max_ttl_seconds"`
	AllowedDomains        []string `json:"allowed_domains"`
	AllowedClients        []string `json:"allowed_clients"`
	MaxQPSPerClient       int      `json:"max_qps_per_client"`
	MaxQPSTotal           int      `json:"max_qps_total"`
	MaxInflight           int      `json:"max_inflight"`
	RateLimitBurst        int      `json:"rate_limit_burst"`
	RefuseANY             bool     `json:"refuse_any"`
	QueryLogSize          int      `json:"query_log_size"`
	TunnelListen          string   `json:"tunnel_listen"`
	TunnelToken           string   `json:"tunnel_token"`
}

func defaultConfig() Config {
	return Config{
		Listen:                "0.0.0.0:24100",
		AdminListen:           "127.0.0.1:24180",
		Upstreams:             []string{"223.5.5.5:53", "119.29.29.29:53", "119.28.28.28:53", "180.76.76.76:53"},
		UpstreamTimeoutMS:     1000,
		UpstreamAttempts:      1,
		CacheMaxEntries:       200000,
		CacheMaxTTLSeconds:    3600,
		NegativeMaxTTLSeconds: 60,
		MaxQPSPerClient:       3000,
		MaxQPSTotal:           40000,
		MaxInflight:           20000,
		RateLimitBurst:        300,
		RefuseANY:             true,
		QueryLogSize:          2000,
		TunnelListen:          "0.0.0.0:24160",
	}
}

func (c *Config) normalize() error {
	def := defaultConfig()
	if c.Listen == "" {
		c.Listen = def.Listen
	}
	if c.AdminListen == "" {
		c.AdminListen = def.AdminListen
	}
	if len(c.Upstreams) == 0 {
		c.Upstreams = def.Upstreams
	}
	for index, upstream := range c.Upstreams {
		if _, _, err := net.SplitHostPort(upstream); err != nil {
			return fmt.Errorf("upstream %q 需要 IP:port 形式: %w", upstream, err)
		}
		c.Upstreams[index] = upstream
	}
	if c.UpstreamTimeoutMS <= 0 {
		c.UpstreamTimeoutMS = def.UpstreamTimeoutMS
	}
	if c.UpstreamAttempts <= 0 {
		c.UpstreamAttempts = def.UpstreamAttempts
	}
	if c.CacheMaxEntries <= 0 {
		c.CacheMaxEntries = def.CacheMaxEntries
	}
	if c.CacheMaxTTLSeconds <= 0 {
		c.CacheMaxTTLSeconds = def.CacheMaxTTLSeconds
	}
	if c.NegativeMaxTTLSeconds <= 0 {
		c.NegativeMaxTTLSeconds = def.NegativeMaxTTLSeconds
	}
	if c.MaxQPSPerClient <= 0 {
		c.MaxQPSPerClient = def.MaxQPSPerClient
	}
	if c.MaxQPSTotal <= 0 {
		c.MaxQPSTotal = def.MaxQPSTotal
	}
	if c.MaxInflight <= 0 {
		c.MaxInflight = def.MaxInflight
	}
	if c.RateLimitBurst <= 0 {
		c.RateLimitBurst = def.RateLimitBurst
	}
	if c.QueryLogSize <= 0 {
		c.QueryLogSize = def.QueryLogSize
	}
	if c.TunnelListen == "" {
		c.TunnelListen = def.TunnelListen
	}
	for index, domain := range c.AllowedDomains {
		domain = strings.TrimSuffix(strings.ToLower(strings.TrimSpace(domain)), ".")
		if domain == "" {
			return errors.New("allowed_domains 不能包含空值")
		}
		c.AllowedDomains[index] = domain
	}
	for index, client := range c.AllowedClients {
		client = strings.TrimSpace(client)
		if _, err := parsePrefix(client); err != nil {
			return fmt.Errorf("allowed_clients 条目 %q 非法: %w", client, err)
		}
		c.AllowedClients[index] = client
	}
	return nil
}

func parsePrefix(value string) (netip.Prefix, error) {
	if strings.Contains(value, "/") {
		return netip.ParsePrefix(value)
	}
	addr, err := netip.ParseAddr(value)
	if err != nil {
		return netip.Prefix{}, err
	}
	return netip.PrefixFrom(addr, addr.BitLen()), nil
}

// runtimeConfig 是热重载安全的配置快照。
type runtimeConfig struct {
	raw     Config
	domains []string
	clients []netip.Prefix
}

func buildRuntime(cfg Config) (*runtimeConfig, error) {
	if err := cfg.normalize(); err != nil {
		return nil, err
	}
	rt := &runtimeConfig{raw: cfg, domains: append([]string{}, cfg.AllowedDomains...)}
	for _, client := range cfg.AllowedClients {
		prefix, err := parsePrefix(client)
		if err != nil {
			return nil, err
		}
		rt.clients = append(rt.clients, prefix)
	}
	return rt, nil
}

type cacheEntry struct {
	key    string
	msg    *dns.Msg
	stored time.Time
	ttl    time.Duration
	elem   *list.Element
}

type responseCache struct {
	mu      sync.Mutex
	entries map[string]*cacheEntry
	lru     *list.List
	max     int
}

func newResponseCache(max int) *responseCache {
	if max <= 0 {
		max = 1000
	}
	return &responseCache{entries: make(map[string]*cacheEntry), lru: list.New(), max: max}
}

func (c *responseCache) resize(max int) {
	if max <= 0 {
		return
	}
	c.mu.Lock()
	c.max = max
	for len(c.entries) > c.max {
		c.evictLocked()
	}
	c.mu.Unlock()
}

func (c *responseCache) evictLocked() {
	oldest := c.lru.Back()
	if oldest == nil {
		return
	}
	entry := oldest.Value.(*cacheEntry)
	c.lru.Remove(oldest)
	delete(c.entries, entry.key)
}

func (c *responseCache) get(key string) (*dns.Msg, bool) {
	c.mu.Lock()
	entry, ok := c.entries[key]
	if !ok {
		c.mu.Unlock()
		return nil, false
	}
	if time.Since(entry.stored) >= entry.ttl {
		c.lru.Remove(entry.elem)
		delete(c.entries, key)
		c.mu.Unlock()
		return nil, false
	}
	c.lru.MoveToFront(entry.elem)
	elapsed := time.Since(entry.stored)
	msg := entry.msg.Copy()
	c.mu.Unlock()
	adjustTTL(msg, elapsed)
	return msg, true
}

func (c *responseCache) put(key string, msg *dns.Msg, ttl time.Duration) {
	if ttl <= 0 {
		return
	}
	stored := msg.Copy()
	c.mu.Lock()
	if existing, ok := c.entries[key]; ok {
		existing.msg = stored
		existing.stored = time.Now()
		existing.ttl = ttl
		c.lru.MoveToFront(existing.elem)
		c.mu.Unlock()
		return
	}
	entry := &cacheEntry{key: key, msg: stored, stored: time.Now(), ttl: ttl}
	entry.elem = c.lru.PushFront(entry)
	c.entries[key] = entry
	for len(c.entries) > c.max {
		c.evictLocked()
	}
	c.mu.Unlock()
}

func (c *responseCache) flush() {
	c.mu.Lock()
	c.entries = make(map[string]*cacheEntry)
	c.lru.Init()
	c.mu.Unlock()
}

func (c *responseCache) size() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return len(c.entries)
}

func adjustTTL(msg *dns.Msg, elapsed time.Duration) {
	secs := uint32(elapsed / time.Second)
	if secs == 0 {
		return
	}
	for _, section := range [][]dns.RR{msg.Answer, msg.Ns, msg.Extra} {
		for _, rr := range section {
			header := rr.Header()
			if header.Rrtype == dns.TypeOPT {
				continue
			}
			if header.Ttl > secs {
				header.Ttl -= secs
			} else {
				header.Ttl = 0
			}
		}
	}
}

type bucket struct {
	tokens  float64
	last    time.Time
	touched time.Time
}

type limiter struct {
	mu      sync.Mutex
	buckets map[string]*bucket
	rate    float64
	burst   float64
}

func newLimiter(rate, burst int) *limiter {
	l := &limiter{buckets: make(map[string]*bucket)}
	l.configure(rate, burst)
	return l
}

func (l *limiter) configure(rate, burst int) {
	l.mu.Lock()
	l.rate = float64(rate)
	l.burst = float64(burst)
	l.mu.Unlock()
}

func (l *limiter) allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	b, ok := l.buckets[key]
	if !ok {
		if len(l.buckets) > 50000 {
			l.pruneLocked(now)
		}
		b = &bucket{tokens: l.burst, last: now}
		l.buckets[key] = b
	}
	elapsed := now.Sub(b.last).Seconds()
	b.tokens += elapsed * l.rate
	if b.tokens > l.burst {
		b.tokens = l.burst
	}
	b.last = now
	b.touched = now
	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}

func (l *limiter) pruneLocked(now time.Time) {
	for key, b := range l.buckets {
		if now.Sub(b.touched) > 5*time.Minute {
			delete(l.buckets, key)
		}
	}
}

type flight struct {
	done     chan struct{}
	msg      *dns.Msg
	upstream string
	err      error
}

type Forwarder struct {
	rt       atomic.Pointer[runtimeConfig]
	cache    *responseCache
	inflight chan struct{}
	metrics  *metrics
	clientRL *limiter
	globalRL *limiter
	flights  sync.Map
	configFn func(Config) error
}

func NewForwarder(cfg Config, metrics *metrics) (*Forwarder, error) {
	rt, err := buildRuntime(cfg)
	if err != nil {
		return nil, err
	}
	f := &Forwarder{
		cache:    newResponseCache(rt.raw.CacheMaxEntries),
		inflight: make(chan struct{}, rt.raw.MaxInflight),
		metrics:  metrics,
	}
	f.rt.Store(rt)
	f.clientRL = newLimiter(rt.raw.MaxQPSPerClient, rt.raw.RateLimitBurst)
	f.globalRL = newLimiter(rt.raw.MaxQPSTotal, rt.raw.MaxQPSTotal/10+100)
	return f, nil
}

func (f *Forwarder) Config() Config {
	return f.rt.Load().raw
}

// Reload 原子替换运行配置，并同步缓存与限速器容量。
func (f *Forwarder) Reload(cfg Config) error {
	rt, err := buildRuntime(cfg)
	if err != nil {
		return err
	}
	f.rt.Store(rt)
	f.cache.resize(rt.raw.CacheMaxEntries)
	f.clientRL.configure(rt.raw.MaxQPSPerClient, rt.raw.RateLimitBurst)
	f.globalRL.configure(rt.raw.MaxQPSTotal, rt.raw.MaxQPSTotal/10+100)
	if f.configFn != nil {
		return f.configFn(cfg)
	}
	return nil
}

func clientIPOf(addr net.Addr) string {
	if addr == nil {
		return "unknown"
	}
	host, _, err := net.SplitHostPort(addr.String())
	if err != nil {
		return addr.String()
	}
	return host
}

func (f *Forwarder) clientAllowed(ip string) bool {
	rt := f.rt.Load()
	if len(rt.clients) == 0 {
		return true
	}
	addr, err := netip.ParseAddr(ip)
	if err != nil {
		return false
	}
	for _, prefix := range rt.clients {
		if prefix.Contains(addr) {
			return true
		}
	}
	return false
}

func (f *Forwarder) domainAllowed(name string) bool {
	rt := f.rt.Load()
	if len(rt.domains) == 0 {
		return true
	}
	name = strings.TrimSuffix(strings.ToLower(name), ".")
	for _, domain := range rt.domains {
		if name == domain || strings.HasSuffix(name, "."+domain) {
			return true
		}
	}
	return false
}

func cacheKey(req *dns.Msg) string {
	question := req.Question[0]
	do := false
	if opt := req.IsEdns0(); opt != nil {
		do = opt.Do()
	}
	return fmt.Sprintf("%s|%d|%d|%t", strings.ToLower(question.Name), question.Qtype, question.Qclass, do)
}

func (f *Forwarder) ServeDNS(w dns.ResponseWriter, req *dns.Msg) {
	start := time.Now()
	f.metrics.c.queries.Add(1)

	clientIP := clientIPOf(w.RemoteAddr())
	if len(req.Question) != 1 {
		f.metrics.c.formatErrors.Add(1)
		f.metrics.clients.touch(clientIP, "", true)
		reply := new(dns.Msg)
		reply.SetRcode(req, dns.RcodeFormatError)
		_ = w.WriteMsg(reply)
		return
	}
	question := req.Question[0]
	name := strings.TrimSuffix(question.Name, ".")
	qtype := dns.TypeToString[question.Qtype]

	reject := func(rcode int, source string, denied bool) {
		f.metrics.clients.touch(clientIP, name, true)
		reply := new(dns.Msg)
		reply.SetRcode(req, rcode)
		reply.RecursionAvailable = true
		_ = w.WriteMsg(reply)
		f.metrics.log.add(queryRecord{
			Time: start, Client: clientIP, Name: name, Type: qtype,
			Rcode: dns.RcodeToString[rcode], Source: source,
			LatencyMS:  float64(time.Since(start).Microseconds()) / 1000.0,
			DomainDeny: denied,
		})
	}

	if req.MsgHdr.Response {
		reject(dns.RcodeFormatError, "invalid", false)
		return
	}
	if rt := f.rt.Load(); rt.raw.RefuseANY && question.Qtype == dns.TypeANY {
		f.metrics.c.refusedAny.Add(1)
		reject(dns.RcodeRefused, "policy:any", false)
		return
	}
	if !f.clientAllowed(clientIP) {
		f.metrics.c.refusedACL.Add(1)
		reject(dns.RcodeRefused, "policy:client", false)
		return
	}
	if !f.domainAllowed(name) {
		f.metrics.c.refusedDomain.Add(1)
		reject(dns.RcodeRefused, "policy:domain", true)
		return
	}
	if !f.globalRL.allow("global") || !f.clientRL.allow(clientIP) {
		f.metrics.c.refusedRate.Add(1)
		reject(dns.RcodeRefused, "policy:rate", false)
		return
	}

	select {
	case f.inflight <- struct{}{}:
		defer func() { <-f.inflight }()
	default:
		f.metrics.c.droppedOverload.Add(1)
		reject(dns.RcodeServerFailure, "policy:overload", false)
		return
	}

	key := cacheKey(req)
	if cached, ok := f.cache.get(key); ok {
		f.metrics.c.cacheHits.Add(1)
		cached.Id = req.Id
		cached.RecursionAvailable = true
		cached.RecursionDesired = req.RecursionDesired
		f.writeReply(w, req, cached)
		f.metrics.clients.touch(clientIP, name, false)
		f.metrics.latency.observe(time.Since(start))
		f.metrics.log.add(queryRecord{
			Time: start, Client: clientIP, Name: name, Type: qtype,
			Rcode: dns.RcodeToString[cached.Rcode], Source: "cache",
			LatencyMS: float64(time.Since(start).Microseconds()) / 1000.0,
			Answers:   len(cached.Answer), CacheHit: true,
		})
		return
	}

	resp, upstream, err, coalesced := f.coalesce(key, req)
	latency := time.Since(start)
	f.metrics.latency.observe(latency)
	if coalesced {
		f.metrics.c.coalesced.Add(1)
	}
	if err != nil {
		f.metrics.c.upstreamErrors.Add(1)
		f.metrics.clients.touch(clientIP, name, false)
		reply := new(dns.Msg)
		reply.SetRcode(req, dns.RcodeServerFailure)
		reply.RecursionAvailable = true
		_ = w.WriteMsg(reply)
		f.metrics.log.add(queryRecord{
			Time: start, Client: clientIP, Name: name, Type: qtype,
			Rcode: "SERVFAIL", Source: "upstream", Upstream: upstream,
			LatencyMS: float64(latency.Microseconds()) / 1000.0,
		})
		return
	}

	resp.Id = req.Id
	resp.RecursionDesired = req.RecursionDesired
	f.writeReply(w, req, resp)
	f.metrics.clients.touch(clientIP, name, false)
	f.metrics.log.add(queryRecord{
		Time: start, Client: clientIP, Name: name, Type: qtype,
		Rcode: dns.RcodeToString[resp.Rcode], Source: "upstream", Upstream: upstream,
		LatencyMS: float64(latency.Microseconds()) / 1000.0, Answers: len(resp.Answer),
	})
}

func (f *Forwarder) writeReply(w dns.ResponseWriter, req *dns.Msg, resp *dns.Msg) {
	resp.Response = true
	if _, isTCP := w.RemoteAddr().(*net.TCPAddr); !isTCP {
		if opt := req.IsEdns0(); opt != nil {
			size := int(opt.UDPSize())
			if size < 512 {
				size = 512
			}
			resp.Truncate(size)
		} else {
			resp.Truncate(dns.MinMsgSize)
		}
		if resp.Truncated {
			f.metrics.c.truncated.Add(1)
		}
	}
	_ = w.WriteMsg(resp)
}

func (f *Forwarder) coalesce(key string, req *dns.Msg) (*dns.Msg, string, error, bool) {
	value, loaded := f.flights.LoadOrStore(key, &flight{done: make(chan struct{})})
	current := value.(*flight)
	if loaded {
		select {
		case <-current.done:
			return current.msg, current.upstream, current.err, true
		case <-time.After(8 * time.Second):
			return nil, "", errors.New("合并的查询等待超时"), true
		}
	}

	query := req.Copy()
	query.Id = dns.Id()
	resp, upstream, err := f.exchange(query)
	current.msg, current.upstream, current.err = resp, upstream, err
	close(current.done)
	f.flights.Delete(key)

	if err == nil && resp != nil {
		f.metrics.c.upstreamAnswered.Add(1)
		ttl := cacheTTL(resp, f.rt.Load().raw)
		f.cache.put(key, resp, ttl)
	}
	return resp, upstream, err, false
}

func cacheTTL(resp *dns.Msg, cfg Config) time.Duration {
	negative := len(resp.Answer) == 0 || resp.Rcode == dns.RcodeNameError
	var ttl uint32
	if negative {
		ttl = uint32(cfg.NegativeMaxTTLSeconds)
		for _, rr := range resp.Ns {
			if soa, ok := rr.(*dns.SOA); ok {
				candidate := soa.Minttl
				if soa.Hdr.Ttl < candidate {
					candidate = soa.Hdr.Ttl
				}
				if candidate > 0 {
					ttl = candidate
				}
				break
			}
		}
		if ttl > uint32(cfg.NegativeMaxTTLSeconds) {
			ttl = uint32(cfg.NegativeMaxTTLSeconds)
		}
	} else {
		ttl = ^uint32(0)
		for _, rr := range resp.Answer {
			if rr.Header().Rrtype == dns.TypeOPT {
				continue
			}
			if rr.Header().Ttl < ttl {
				ttl = rr.Header().Ttl
			}
		}
		if ttl == ^uint32(0) || ttl == 0 {
			ttl = 30
		}
		if ttl > uint32(cfg.CacheMaxTTLSeconds) {
			ttl = uint32(cfg.CacheMaxTTLSeconds)
		}
	}
	if ttl == 0 {
		return 0
	}
	return time.Duration(ttl) * time.Second
}

func (f *Forwarder) exchange(req *dns.Msg) (*dns.Msg, string, error) {
	cfg := f.rt.Load().raw
	timeout := time.Duration(cfg.UpstreamTimeoutMS) * time.Millisecond
	now := time.Now().UnixMilli()
	order := make([]string, 0, len(cfg.Upstreams))
	for _, upstream := range cfg.Upstreams {
		// 熔断：最近失败的上游在冷却期内跳过，避免尾延迟被放大。
		if f.metrics.upstream(upstream).failUntil.Load() > now {
			continue
		}
		order = append(order, upstream)
	}
	if len(order) == 0 {
		order = cfg.Upstreams
	}
	var lastErr error
	for _, upstream := range order {
		stat := f.metrics.upstream(upstream)
		for attempt := 0; attempt < cfg.UpstreamAttempts; attempt++ {
			stat.sent.Add(1)
			client := &dns.Client{Net: "udp", Timeout: timeout, UDPSize: 1232}
			started := time.Now()
			resp, _, err := client.Exchange(req, upstream)
			if err != nil {
				lastErr = err
				stat.failUntil.Store(time.Now().Add(3 * time.Second).UnixMilli())
				if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
					stat.timeout.Add(1)
					f.metrics.c.upstreamTimeouts.Add(1)
				} else {
					stat.errors.Add(1)
				}
				continue
			}
			stat.avgMS.Store(time.Since(started).Milliseconds())
			stat.failUntil.Store(0)
			if resp.Truncated {
				tcpClient := &dns.Client{Net: "tcp", Timeout: timeout}
				if tcpResp, _, tcpErr := tcpClient.Exchange(req, upstream); tcpErr == nil {
					resp = tcpResp
				}
			}
			if resp.Rcode == dns.RcodeServerFailure || resp.Rcode == dns.RcodeRefused {
				lastErr = fmt.Errorf("上游 %s 返回 %s", upstream, dns.RcodeToString[resp.Rcode])
				stat.errors.Add(1)
				continue
			}
			req.Id = resp.Id
			return resp, upstream, nil
		}
	}
	if lastErr == nil {
		lastErr = errors.New("没有可用的上游服务器")
	}
	return nil, "", lastErr
}

// ResolveOnce 绕过缓存与限速，直接查询上游，用于 /v1/resolve 与 bench 诊断。
func (f *Forwarder) ResolveOnce(name string, qtype uint16) (*dns.Msg, string, error) {
	query := new(dns.Msg)
	query.SetQuestion(dns.Fqdn(name), qtype)
	query.RecursionDesired = true
	query.SetEdns0(1232, false)
	return f.exchange(query)
}
