package main

// 运行指标：全部使用原子计数，避免在数据热路径上加锁。

import (
	"sort"
	"sync"
	"sync/atomic"
	"time"
)

type latencyBuckets struct {
	mu      sync.Mutex
	buckets []int64 // 1ms,2,5,10,20,50,100,200,500,1000,5000, +Inf
	limits  []float64
	total   int64
	sumMS   int64
}

func newLatencyBuckets() *latencyBuckets {
	return &latencyBuckets{
		buckets: make([]int64, 12),
		limits:  []float64{1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 5000},
	}
}

func (l *latencyBuckets) observe(d time.Duration) {
	ms := float64(d.Microseconds()) / 1000.0
	idx := len(l.buckets) - 1
	for i, limit := range l.limits {
		if ms <= limit {
			idx = i
			break
		}
	}
	l.mu.Lock()
	l.buckets[idx]++
	l.total++
	l.sumMS += int64(ms)
	l.mu.Unlock()
}

func (l *latencyBuckets) snapshot() map[string]any {
	l.mu.Lock()
	defer l.mu.Unlock()
	buckets := make([]int64, len(l.buckets))
	copy(buckets, l.buckets)
	avg := 0.0
	if l.total > 0 {
		avg = float64(l.sumMS) / float64(l.total)
	}
	return map[string]any{
		"buckets_ms": append([]float64{}, l.limits...),
		"counts":     buckets,
		"total":      l.total,
		"avg_ms":     avg,
	}
}

type counters struct {
	queries          atomic.Int64
	cacheHits        atomic.Int64
	upstreamAnswered atomic.Int64
	coalesced        atomic.Int64
	refusedACL       atomic.Int64
	refusedDomain    atomic.Int64
	refusedRate      atomic.Int64
	refusedAny       atomic.Int64
	droppedOverload  atomic.Int64
	upstreamErrors   atomic.Int64
	upstreamTimeouts atomic.Int64
	formatErrors     atomic.Int64
	truncated        atomic.Int64
	tunnelConns      atomic.Int64
	tunnelQueries    atomic.Int64
	tunnelDropped    atomic.Int64
}

type clientStat struct {
	Queries   int64
	Refused   int64
	LastSeen  time.Time
	LastQName string
}

type queryRecord struct {
	Time       time.Time `json:"time"`
	Client     string    `json:"client"`
	Name       string    `json:"name"`
	Type       string    `json:"type"`
	Rcode      string    `json:"rcode"`
	Source     string    `json:"source"`
	Upstream   string    `json:"upstream,omitempty"`
	LatencyMS  float64   `json:"latency_ms"`
	Answers    int       `json:"answers"`
	CacheHit   bool      `json:"cache_hit"`
	DomainDeny bool      `json:"domain_denied,omitempty"`
}

type queryRing struct {
	mu    sync.Mutex
	items []queryRecord
	next  int
	full  bool
}

func newQueryRing(size int) *queryRing {
	if size <= 0 {
		size = 2000
	}
	return &queryRing{items: make([]queryRecord, size)}
}

func (q *queryRing) add(record queryRecord) {
	q.mu.Lock()
	q.items[q.next] = record
	q.next = (q.next + 1) % len(q.items)
	if q.next == 0 {
		q.full = true
	}
	q.mu.Unlock()
}

// recent 返回最近的记录，最新的在前。
func (q *queryRing) recent(limit int) []queryRecord {
	q.mu.Lock()
	defer q.mu.Unlock()
	total := q.next
	if q.full {
		total = len(q.items)
	}
	if limit <= 0 || limit > total {
		limit = total
	}
	out := make([]queryRecord, 0, limit)
	for i := 0; i < limit; i++ {
		idx := (q.next - 1 - i + len(q.items)*2) % len(q.items)
		out = append(out, q.items[idx])
	}
	return out
}

type clientTable struct {
	mu      sync.Mutex
	clients map[string]*clientStat
}

func newClientTable() *clientTable {
	return &clientTable{clients: make(map[string]*clientStat)}
}

func (c *clientTable) touch(ip, name string, refused bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	stat, ok := c.clients[ip]
	if !ok {
		stat = &clientStat{}
		c.clients[ip] = stat
	}
	stat.Queries++
	if refused {
		stat.Refused++
	}
	stat.LastSeen = time.Now()
	stat.LastQName = name
}

func (c *clientTable) snapshot() []map[string]any {
	c.mu.Lock()
	defer c.mu.Unlock()
	out := make([]map[string]any, 0, len(c.clients))
	for ip, stat := range c.clients {
		out = append(out, map[string]any{
			"client":     ip,
			"queries":    stat.Queries,
			"refused":    stat.Refused,
			"last_seen":  stat.LastSeen.Format(time.RFC3339),
			"last_qname": stat.LastQName,
		})
	}
	sort.Slice(out, func(i, j int) bool {
		return out[i]["queries"].(int64) > out[j]["queries"].(int64)
	})
	return out
}

type upstreamStat struct {
	sent      atomic.Int64
	errors    atomic.Int64
	timeout   atomic.Int64
	avgMS     atomic.Int64
	failUntil atomic.Int64
}

type metrics struct {
	startedAt time.Time
	c         counters
	latency   *latencyBuckets
	log       *queryRing
	clients   *clientTable
	upstreams sync.Map // addr -> *upstreamStat
}

func newMetrics(logSize int) *metrics {
	return &metrics{
		startedAt: time.Now(),
		latency:   newLatencyBuckets(),
		log:       newQueryRing(logSize),
		clients:   newClientTable(),
	}
}

func (m *metrics) upstream(addr string) *upstreamStat {
	if value, ok := m.upstreams.Load(addr); ok {
		return value.(*upstreamStat)
	}
	value, _ := m.upstreams.LoadOrStore(addr, &upstreamStat{})
	return value.(*upstreamStat)
}

func (m *metrics) upstreamSnapshot() map[string]any {
	out := map[string]any{}
	m.upstreams.Range(func(key, value any) bool {
		stat := value.(*upstreamStat)
		out[key.(string)] = map[string]any{
			"sent":     stat.sent.Load(),
			"errors":   stat.errors.Load(),
			"timeouts": stat.timeout.Load(),
			"avg_ms":   stat.avgMS.Load(),
		}
		return true
	})
	return out
}

func (m *metrics) snapshot(extra map[string]any) map[string]any {
	result := map[string]any{
		"uptime_seconds": int64(time.Since(m.startedAt).Seconds()),
		"counters": map[string]any{
			"queries":           m.c.queries.Load(),
			"cache_hits":        m.c.cacheHits.Load(),
			"upstream_answered": m.c.upstreamAnswered.Load(),
			"coalesced":         m.c.coalesced.Load(),
			"refused_acl":       m.c.refusedACL.Load(),
			"refused_domain":    m.c.refusedDomain.Load(),
			"refused_rate":      m.c.refusedRate.Load(),
			"refused_any":       m.c.refusedAny.Load(),
			"dropped_overload":  m.c.droppedOverload.Load(),
			"upstream_errors":   m.c.upstreamErrors.Load(),
			"upstream_timeouts": m.c.upstreamTimeouts.Load(),
			"format_errors":     m.c.formatErrors.Load(),
			"truncated":         m.c.truncated.Load(),
			"tunnel_conns":      m.c.tunnelConns.Load(),
			"tunnel_queries":    m.c.tunnelQueries.Load(),
			"tunnel_dropped":    m.c.tunnelDropped.Load(),
		},
		"latency":   m.latency.snapshot(),
		"upstreams": m.upstreamSnapshot(),
	}
	for key, value := range extra {
		result[key] = value
	}
	return result
}
