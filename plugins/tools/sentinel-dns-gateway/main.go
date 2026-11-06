package main

// sentinel-dns-gateway：为 Sentinel 插件（subdomain_brute 等高频 DNS 工具）
// 提供云端专属 DNS 转发网关。家庭侧只需要指向本网关的一个 UDP 端口，
// 由云端完成上游解析、缓存与失败重试，避免家用路由器被并发 DNS 打满。

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/miekg/dns"
)

const version = "1.0.0"

func main() {
	var (
		configPath = flag.String("config", "/etc/sentinel-dns-gateway/config.json", "配置文件路径")
		bench      = flag.Bool("bench", false, "压力/连通性自测模式（不启动服务）")
		target     = flag.String("target", "119.29.111.31:24100", "自测目标地址")
		domain     = flag.String("domain", "example.com", "自测使用的根域名")
		count      = flag.Int("count", 2000, "自测查询总数")
		concurrent = flag.Int("concurrency", 100, "自测并发度")
		qps        = flag.Int("qps", 0, "自测限速（0 表示不限）")
		showVer    = flag.Bool("version", false, "打印版本")
		clientMode = flag.Bool("client", false, "本机垫片模式：监听本地 UDP，转发到云端 TCP 隧道")
		serverAddr = flag.String("server", "", "隧道服务端地址，例如 119.29.111.31:24160")
		token      = flag.String("token", "", "隧道 token（与服务端 tunnel_token 一致）")
		localDNS   = flag.String("listen", "127.0.0.1:5533", "本机垫片的 UDP 监听地址")
		queryWait  = flag.Int("timeout", 6, "单次查询等待秒数")
	)
	flag.Parse()

	if *showVer {
		fmt.Println(version)
		return
	}
	if *bench {
		runBench(*target, *domain, *count, *concurrent, *qps)
		return
	}
	if *clientMode {
		if *serverAddr == "" || *token == "" {
			fmt.Fprintln(os.Stderr, "客户端模式需要 -server 与 -token")
			os.Exit(2)
		}
		logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
		slog.SetDefault(logger)
		ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
		defer stop()
		shim := NewTunnelClient(*serverAddr, *token, *localDNS, time.Duration(*queryWait)*time.Second)
		if err := shim.Run(ctx); err != nil {
			logger.Error("本机垫片退出", "error", err)
			os.Exit(1)
		}
		return
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	cfg, err := loadConfig(*configPath)
	if err != nil {
		logger.Error("加载配置失败", "path", *configPath, "error", err)
		os.Exit(1)
	}

	met := newMetrics(cfg.QueryLogSize)
	forwarder, err := NewForwarder(cfg, met)
	if err != nil {
		logger.Error("初始化转发器失败", "error", err)
		os.Exit(1)
	}
	forwarder.configFn = func(next Config) error { return saveConfig(*configPath, next) }

	udpServer := &dns.Server{Addr: cfg.Listen, Net: "udp", Handler: forwarder, UDPSize: 1232}
	tcpServer := &dns.Server{Addr: cfg.Listen, Net: "tcp", Handler: forwarder}
	admin := &http.Server{
		Addr:              cfg.AdminListen,
		Handler:           newAdminHandler(forwarder, met, *configPath),
		ReadHeaderTimeout: 5 * time.Second,
	}

	tunnel := NewTunnelServer(forwarder, met)
	if err := tunnel.Start(cfg.TunnelListen); err != nil {
		logger.Error("隧道监听失败", "addr", cfg.TunnelListen, "error", err)
		os.Exit(1)
	}
	logger.Info("TCP 隧道监听中", "addr", tunnel.Addr())

	errc := make(chan error, 3)
	go func() {
		logger.Info("DNS(UDP) 监听中", "addr", cfg.Listen)
		errc <- udpServer.ListenAndServe()
	}()
	go func() {
		logger.Info("DNS(TCP) 监听中", "addr", cfg.Listen)
		errc <- tcpServer.ListenAndServe()
	}()
	go func() {
		logger.Info("管理接口监听中", "addr", cfg.AdminListen)
		errc <- admin.ListenAndServe()
	}()

	signals := make(chan os.Signal, 2)
	signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP)
	for {
		select {
		case sig := <-signals:
			if sig == syscall.SIGHUP {
				next, err := loadConfig(*configPath)
				if err != nil {
					logger.Error("热重载失败", "error", err)
					continue
				}
				if err := forwarder.Reload(next); err != nil {
					logger.Error("热重载失败", "error", err)
					continue
				}
				logger.Info("配置已热重载", "allowed_domains", next.AllowedDomains)
				continue
			}
			logger.Info("收到退出信号，正在关闭", "signal", sig.String())
			tunnel.Stop()
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			_ = admin.Shutdown(ctx)
			_ = udpServer.ShutdownContext(ctx)
			_ = tcpServer.ShutdownContext(ctx)
			cancel()
			return
		case err := <-errc:
			if err != nil && !errors.Is(err, http.ErrServerClosed) {
				logger.Error("服务异常退出", "error", err)
				os.Exit(1)
			}
		}
	}
}

func loadConfig(path string) (Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			return Config{}, err
		}
		cfg := defaultConfig()
		cfg.AdminToken = randomToken()
		if saveErr := saveConfig(path, cfg); saveErr != nil {
			return Config{}, saveErr
		}
		slog.Warn("未发现配置文件，已生成默认配置", "path", path)
		return cfg, nil
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return Config{}, err
	}
	if cfg.AdminToken == "" {
		cfg.AdminToken = randomToken()
		if err := saveConfig(path, cfg); err != nil {
			return Config{}, err
		}
	}
	if cfg.TunnelToken == "" {
		cfg.TunnelToken = randomToken()
		if err := saveConfig(path, cfg); err != nil {
			return Config{}, err
		}
	}
	if err := cfg.normalize(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func saveConfig(path string, cfg Config) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	if dir := filepath.Dir(path); dir != "" {
		if err := os.MkdirAll(dir, 0o750); err != nil {
			return err
		}
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, append(data, '\n'), 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func randomToken() string {
	buffer := make([]byte, 24)
	if _, err := rand.Read(buffer); err != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	return hex.EncodeToString(buffer)
}

func newAdminHandler(forwarder *Forwarder, met *metrics, configPath string) http.Handler {
	mux := http.NewServeMux()
	token := func() string { return forwarder.Config().AdminToken }

	auth := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			expected := token()
			provided := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
			if provided == "" {
				provided = r.URL.Query().Get("token")
			}
			if expected == "" || subtle.ConstantTimeCompare([]byte(expected), []byte(provided)) != 1 {
				writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "invalid token"})
				return
			}
			next(w, r)
		}
	}

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{"ok": true, "version": version})
	})

	mux.HandleFunc("/v1/status", auth(func(w http.ResponseWriter, r *http.Request) {
		cfg := forwarder.Config()
		writeJSON(w, http.StatusOK, met.snapshot(map[string]any{
			"version":         version,
			"listen":          cfg.Listen,
			"tunnel_listen":   cfg.TunnelListen,
			"cache_entries":   metCacheSize(forwarder),
			"allowed_domains": cfg.AllowedDomains,
			"allowed_clients": cfg.AllowedClients,
			"upstreams":       cfg.Upstreams,
		}))
	}))

	mux.HandleFunc("/v1/queries", auth(func(w http.ResponseWriter, r *http.Request) {
		limit := 100
		if raw := r.URL.Query().Get("limit"); raw != "" {
			if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
				limit = parsed
			}
		}
		needle := strings.ToLower(r.URL.Query().Get("q"))
		records := met.log.recent(limit)
		if needle != "" {
			filtered := records[:0]
			for _, record := range records {
				if strings.Contains(strings.ToLower(record.Name), needle) {
					filtered = append(filtered, record)
				}
			}
			records = filtered
		}
		writeJSON(w, http.StatusOK, map[string]any{"count": len(records), "items": records})
	}))

	mux.HandleFunc("/v1/clients", auth(func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{"items": met.clients.snapshot()})
	}))

	mux.HandleFunc("/v1/allowlist/domains", auth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "POST only"})
			return
		}
		var body struct {
			Add    []string `json:"add"`
			Remove []string `json:"remove"`
			Set    []string `json:"set"`
		}
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		cfg := forwarder.Config()
		domains := body.Set
		if body.Set == nil {
			domains = cfg.AllowedDomains
			for _, item := range body.Remove {
				item = strings.TrimSuffix(strings.ToLower(strings.TrimSpace(item)), ".")
				filtered := domains[:0]
				for _, existing := range domains {
					if existing != item {
						filtered = append(filtered, existing)
					}
				}
				domains = filtered
			}
			for _, item := range body.Add {
				item = strings.TrimSuffix(strings.ToLower(strings.TrimSpace(item)), ".")
				if item == "" {
					continue
				}
				duplicate := false
				for _, existing := range domains {
					if existing == item {
						duplicate = true
						break
					}
				}
				if !duplicate {
					domains = append(domains, item)
				}
			}
		}
		cfg.AllowedDomains = domains
		if err := forwarder.Reload(cfg); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"allowed_domains": forwarder.Config().AllowedDomains})
	}))

	mux.HandleFunc("/v1/allowlist/clients", auth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "POST only"})
			return
		}
		var body struct {
			Add    []string `json:"add"`
			Remove []string `json:"remove"`
			Set    []string `json:"set"`
		}
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		cfg := forwarder.Config()
		clients := body.Set
		if body.Set == nil {
			clients = cfg.AllowedClients
			for _, item := range body.Remove {
				filtered := clients[:0]
				for _, existing := range clients {
					if existing != strings.TrimSpace(item) {
						filtered = append(filtered, existing)
					}
				}
				clients = filtered
			}
			for _, item := range body.Add {
				item = strings.TrimSpace(item)
				if item == "" {
					continue
				}
				duplicate := false
				for _, existing := range clients {
					if existing == item {
						duplicate = true
						break
					}
				}
				if !duplicate {
					clients = append(clients, item)
				}
			}
		}
		cfg.AllowedClients = clients
		if err := forwarder.Reload(cfg); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"allowed_clients": forwarder.Config().AllowedClients})
	}))

	mux.HandleFunc("/v1/resolve", auth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "POST only"})
			return
		}
		var body struct {
			Name string `json:"name"`
			Type string `json:"type"`
		}
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		qtype := dns.TypeA
		if body.Type != "" {
			parsed, ok := dns.StringToType[strings.ToUpper(body.Type)]
			if !ok {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "unsupported type"})
				return
			}
			qtype = parsed
		}
		resp, upstream, err := forwarder.ResolveOnce(body.Name, qtype)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]any{"error": err.Error(), "upstream": upstream})
			return
		}
		answers := make([]string, 0, len(resp.Answer))
		for _, rr := range resp.Answer {
			answers = append(answers, rr.String())
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"name": body.Name, "type": dns.TypeToString[qtype],
			"rcode": dns.RcodeToString[resp.Rcode], "upstream": upstream, "answers": answers,
		})
	}))

	mux.HandleFunc("/v1/reload", auth(func(w http.ResponseWriter, r *http.Request) {
		next, err := loadConfig(configPath)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		if err := forwarder.Reload(next); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"ok": true})
	}))

	mux.HandleFunc("/v1/cache/flush", auth(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"error": "POST only"})
			return
		}
		forwarder.cache.flush()
		writeJSON(w, http.StatusOK, map[string]any{"ok": true})
	}))

	mux.HandleFunc("/metrics", auth(func(w http.ResponseWriter, r *http.Request) {
		cfg := forwarder.Config()
		counters := map[string]int64{
			"dns_queries_total":           met.c.queries.Load(),
			"dns_cache_hits_total":        met.c.cacheHits.Load(),
			"dns_upstream_answered_total": met.c.upstreamAnswered.Load(),
			"dns_coalesced_total":         met.c.coalesced.Load(),
			"dns_refused_acl_total":       met.c.refusedACL.Load(),
			"dns_refused_domain_total":    met.c.refusedDomain.Load(),
			"dns_refused_rate_total":      met.c.refusedRate.Load(),
			"dns_refused_any_total":       met.c.refusedAny.Load(),
			"dns_dropped_overload_total":  met.c.droppedOverload.Load(),
			"dns_upstream_errors_total":   met.c.upstreamErrors.Load(),
			"dns_upstream_timeouts_total": met.c.upstreamTimeouts.Load(),
			"dns_truncated_total":         met.c.truncated.Load(),
			"dns_cache_entries":           int64(metCacheSize(forwarder)),
		}
		var builder strings.Builder
		for _, key := range sortedKeys(counters) {
			fmt.Fprintf(&builder, "# TYPE %s counter\n%s %d\n", key, key, counters[key])
		}
		fmt.Fprintf(&builder, "# TYPE dns_allowed_domains gauge\ndns_allowed_domains %d\n", len(cfg.AllowedDomains))
		w.Header().Set("Content-Type", "text/plain; version=0.0.4")
		_, _ = w.Write([]byte(builder.String()))
	}))

	return mux
}

func metCacheSize(forwarder *Forwarder) int {
	return forwarder.cache.size()
}

func sortedKeys(values map[string]int64) []string {
	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	for i := 1; i < len(keys); i++ {
		for j := i; j > 0 && keys[j] < keys[j-1]; j-- {
			keys[j], keys[j-1] = keys[j-1], keys[j]
		}
	}
	return keys
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	_ = encoder.Encode(payload)
}

// 保持 net 包在最小构建中被引用（bench 与 TCP 判断共用）。
var _ = net.SplitHostPort
