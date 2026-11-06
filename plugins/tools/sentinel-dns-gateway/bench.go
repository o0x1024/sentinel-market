package main

// bench：端到端连通性/丢包自测。既可在服务器本机跑（验证服务能力），
// 也可在家用电脑跑（验证家庭出口到云端的真实丢包与延迟）。

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"sort"
	"sync"
	"sync/atomic"
	"time"

	"github.com/miekg/dns"
)

func runBench(target, domain string, count, concurrency, qps int) {
	if count <= 0 {
		count = 1000
	}
	if concurrency <= 0 {
		concurrency = 50
	}
	if concurrency > count {
		concurrency = count
	}
	if qps > 0 && qps < concurrency {
		concurrency = qps
	}

	var okCount, failCount, refused, nxdomain atomic.Int64
	latencies := make([]time.Duration, count)
	var index atomic.Int64
	var wg sync.WaitGroup

	interval := time.Duration(0)
	if qps > 0 {
		interval = time.Second / time.Duration(qps)
	}

	started := time.Now()
	jobs := make(chan int, concurrency)
	for worker := 0; worker < concurrency; worker++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			client := &dns.Client{Net: "udp", Timeout: 3 * time.Second, UDPSize: 1232}
			for indexValue := range jobs {
				name := fmt.Sprintf("bench-%06d-%04x.%s", indexValue, rand.Intn(0xffff), domain)
				query := new(dns.Msg)
				query.SetQuestion(dns.Fqdn(name), dns.TypeA)
				query.RecursionDesired = true
				begin := time.Now()
				resp, _, err := client.Exchange(query, target)
				elapsed := time.Since(begin)
				slot := index.Add(1) - 1
				if slot >= 0 && slot < int64(len(latencies)) {
					latencies[slot] = elapsed
				}
				switch {
				case err != nil:
					failCount.Add(1)
				case resp.Rcode == dns.RcodeRefused:
					refused.Add(1)
					okCount.Add(1)
				case resp.Rcode == dns.RcodeNameError:
					nxdomain.Add(1)
					okCount.Add(1)
				default:
					okCount.Add(1)
				}
				if interval > 0 {
					time.Sleep(interval)
				}
			}
		}()
	}
	for i := 0; i < count; i++ {
		jobs <- i
	}
	close(jobs)
	wg.Wait()
	totalElapsed := time.Since(started)

	valid := latencies[:min(len(latencies), int(index.Load()))]
	sort.Slice(valid, func(i, j int) bool { return valid[i] < valid[j] })
	percentile := func(p float64) float64 {
		if len(valid) == 0 {
			return 0
		}
		position := int(float64(len(valid)-1) * p)
		return float64(valid[position].Microseconds()) / 1000.0
	}

	sent := int(index.Load())
	result := map[string]any{
		"target":       target,
		"domain":       domain,
		"sent":         sent,
		"ok":           okCount.Load(),
		"failed":       failCount.Load(),
		"refused":      refused.Load(),
		"nxdomain":     nxdomain.Load(),
		"loss_percent": percentOrZero(failCount.Load(), int64(sent)),
		"elapsed_s":    totalElapsed.Seconds(),
		"qps":          float64(sent) / totalElapsed.Seconds(),
		"rtt_ms_p50":   percentile(0.50),
		"rtt_ms_p95":   percentile(0.95),
		"rtt_ms_p99":   percentile(0.99),
		"rtt_ms_max":   percentile(1.0),
	}
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	_ = encoder.Encode(result)
}

func percentOrZero(value, total int64) float64 {
	if total == 0 {
		return 0
	}
	return float64(value) * 100 / float64(total)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
