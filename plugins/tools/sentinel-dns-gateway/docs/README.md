# sentinel-dns-gateway

为 Sentinel 的 `subdomain_brute`（以及任何高频 DNS 工具）准备的**专属 DNS 转发网关**。
目标只有一个：把子域爆破产生的海量 DNS 查询从家用路由器上挪走，让结果稳定、可复现。

## 为什么需要

子域爆破的特征是「短时间、大量、并发」DNS 查询。典型故障链：

1. 家用路由器 NAT/conntrack 表被几百上千条 UDP 会话瞬间打满；
2. 新会话被丢弃或排队，表现为随机超时、结果时多时少；
3. 换 DNS、调小并发只能缓解，无法根治 —— 瓶颈在路由器，不在上游 DNS。

另一个现实约束：不少云主机安全组默认只放行 TCP，高位 UDP 端口在链路上被静默丢弃。

因此网关采用**单条 TCP 长连接承载全部查询**：

* 家庭侧只占用 **1 条** NAT 会话，路由器不再承压；
* 云端统一做缓存、合并、重试与上游故障切换；
* 只放开一个 TCP 端口即可穿透只放行 TCP 的安全组。

```
sentinel subdomain_brute
        |  (UDP, 127.0.0.1:5533)
        v
本机垫片 (sentinel-dns-gateway -client)
        |  (TCP 24160, 单条长连接 + 5 字节帧头多路复用)
        v
云端网关 (sentinel-dns-gateway)
        |  (UDP/TCP 53, 多上游并发重试 + 正负缓存 + 请求合并)
        v
223.5.5.5 / 119.29.29.29 / 119.28.28.28 / 180.76.76.76
```

## 组件与端口

| 组件 | 监听 | 用途 |
| --- | --- | --- |
| 云端 DNS | `0.0.0.0:24100` UDP+TCP | 标准 DNS 端口；当网络放行 UDP 时可跳过垫片直连 |
| 云端隧道 | `0.0.0.0:24160` TCP | 垫片专用，携带全部查询，需 token |
| 云端管理 | `127.0.0.1:24180` TCP | `/v1/*` 状态、观测、白名单、清缓存；需 admin token，仅本机/SSH 可达 |
| 本机垫片 | `127.0.0.1:5533` UDP | 插件唯一需要配置的地址 |

> 垫片默认用 5533 而不是 5353：5353 是 mDNS 保留端口，macOS 上常被系统或其它应用
> 占用（被占用时垫片会 bind 失败并反复重启）。安装脚本会在端口被占用时直接报错并
> 提示改用 `--port`，此时插件里的 `dns_proxy.port` 要填同一个端口。

## 云端部署

```sh
# 构建（本机）
cd tools/sentinel-dns-gateway
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags "-s -w" \
  -o dist/sentinel-dns-gateway-linux-amd64 .

# 上传 + 安装为 systemd 服务（自动生成随机 token）
HOST=119.29.111.31 ./deploy/remote_deploy.sh
```

首次安装会生成 `/etc/sentinel-dns-gateway/config.json`（权限 600），其中包含随机
`admin_token` 与 `tunnel_token`。读取方式：

```sh
./deploy/ops.sh token
```

> 安全组只需放行 TCP `24160`（隧道）。管理端口绑定在 `127.0.0.1:24180`，
> 外部不可达，`ops.sh` 通过 SSH 在服务器本地调用。
> 远程运维直接 `ssh root@<host>` 后执行 `ops.sh`，不需要对公网暴露 24180。

## 本机垫片（macOS 开机自启）

```sh
./deploy/macos/install-client.sh --token <tunnel_token>
```

脚本会：

1. 复制二进制到 `~/.sentinel/bin/`；
2. 写入 `~/Library/LaunchAgents/com.sentinel.dnsgateway.shim.plist`（`RunAtLoad` + `KeepAlive`）；
3. `launchctl bootstrap` 并立即验证一次真实解析。

日志：`~/Library/Logs/sentinel-dns-gateway.log`
卸载：`./deploy/macos/uninstall-client.sh`

> 服务端若配置了 `allowed_clients`（公网部署推荐），务必先把你家当前出口公网 IP 加进去：
> `./deploy/ops.sh allow-clients set <你的公网IP>`。否则垫片日志会出现
> `隧道鉴权失败 reason=client-not-allowed`，且解析全部超时。家宽 IP 变化后重复此命令即可。

## 插件配置

`dns_proxy` 默认关闭；只有显式 `enabled: true` 才会把网关地址插入解析器列表首位：

```json
{
  "targets": ["example.com"],
  "dictionary_id": "your-subdomain-dictionary-id",
  "transport": "udp",
  "dns_proxy": { "enabled": true, "host": "127.0.0.1", "port": 5533 }
}
```

行为约束（由 `scripts/subdomain_brute_test.mjs` 覆盖）：

* `enabled` 缺省或 `false` → 完全不改变 `resolvers`，与 1.0.x 行为一致；
* `enabled: true` → `resolvers = [网关, ...显式 resolvers]`，自动去重；
* `host` 必须是 IPv4 字面量（原生引擎只接受 IPv4），`port` 取值 1–65535，`53` 会省略端口后缀；
* `transport: "ethernet"` 与 `dns_proxy` 互斥并显式报错 —— 原始以太网路径固定发往解析器 53 端口，无法指向网关端口；
* 插件仍只做一次原生调用，`surface_artifacts` / `change_events` / 监控流格式完全不变。

## 观测与运维

```sh
./deploy/ops.sh status            # 服务状态 + 计数器 + 各上游健康
./deploy/ops.sh queries 50        # 最近 50 条查询（来源 cache/upstream、延迟、rcode）
./deploy/ops.sh clients           # 客户端维度统计（谁在打、被拒多少）
./deploy/ops.sh resolve api.qq.com A   # 绕过缓存验证一次真实解析
./deploy/ops.sh flush             # 清空缓存
./deploy/ops.sh allow-domains add example.com
./deploy/ops.sh allow-clients add 203.0.113.7
./deploy/ops.sh logs 100
./deploy/ops.sh restart
```

管理接口也可直接调用（token 见 `ops.sh token`）：

| 方法与路径 | 说明 |
| --- | --- |
| `GET /healthz` | 无鉴权健康检查 |
| `GET /v1/status` | 计数器、延迟分位、上游状态、缓存条目数 |
| `GET /v1/queries?limit=&q=` | 环形查询日志（可按名字过滤） |
| `GET /v1/clients` | 客户端统计 |
| `POST /v1/allowlist/domains` | `{"add":[...]}` / `{"remove":[...]}` / `{"set":[...]}` |
| `POST /v1/allowlist/clients` | 同上，支持单 IP 或 CIDR |
| `POST /v1/resolve` | `{"name":"a.com","type":"A"}`，绕过缓存 |
| `POST /v1/reload` | 重新读取配置文件 |
| `POST /v1/cache/flush` | 清空缓存 |
| `GET /metrics` | Prometheus 文本格式 |

## 安全模型

* **不是开放递归**：默认拒绝 `ANY`；`allowed_domains` 为空时接受任意域，生产建议按需收敛；
* **客户端白名单**：`allowed_clients` 同时限制 24100 直连与 24160 隧道来源 IP，通过
  `ops.sh allow-clients set <你的公网IP>` 修改并持久化；为空时不限制，公网部署务必设置；
* **管理面只监听本机**：`admin_listen` 默认 `127.0.0.1:24180`，公网无法访问；
* **隧道需 token**：`tunnel_token` 不匹配直接断开，且 `allowed_clients` 同样作用于隧道来源 IP；
* **隧道是明文 TCP**：token 与 DNS 查询不加密，只应经过可信链路；token 泄漏后立即
  `ops.sh token` 查看并编辑配置轮换，然后重启服务与所有垫片；
* **令牌比较常量时间**：`subtle.ConstantTimeCompare`；
* **限速双层**：每客户端 + 全局令牌桶，超限返回 `REFUSED`（不发往上游，不会被当放大器）；
* **在飞请求上限**：`max_inflight` 保护内存，超限返回 `SERVFAIL` 并计数（`dropped_overload`）；
* **热重载**：`SIGHUP` 或 `/v1/reload` 原子替换配置，无需重启。

## 实测数据（家庭宽带 → 公网云主机）

| 场景 | 结果 |
| --- | --- |
| 3000 查询 / 并发 100（首版） | 0 丢包，1070 qps，p50 94 ms，p95 132 ms |
| 5000 查询 / 并发 200（批量写优化后） | 0 丢包，1605 qps，p50 72 ms，p95 145 ms |
| 3000 查询 / 并发 200（5533 端口复测） | 0 丢包，918 qps，p50 111 ms，p95 223 ms，全程仅 1 条 TCP 会话 |
| 答案一致性 | 与直连 AliDNS 逐条比对一致 |
| 云端控制面自测 | 缓存命中、非白名单域 `REFUSED`、`ANY` 拒绝、错误 token `401` 均符合预期 |

复现：

```sh
dist/sentinel-dns-gateway-darwin-arm64 -bench -target 127.0.0.1:5533 \
  -domain qq.com -count 5000 -concurrency 200
```

> 说明：该基准验证的是「本机垫片 + 隧道 + 云端转发」的端到端链路，不代表任意
> 上游 DNS 或任意目标域名的解析成功率；真实爆破结果仍受目标域、记录类型与速率影响。

## 回滚

按影响面从小到大：

1. **只关插件走网关**（最快，秒级）：
   `dns_proxy.enabled = false` 或直接删除 `dns_proxy` 字段 → 立即回到系统解析器路径。
2. **停本机垫片**：`./deploy/macos/uninstall-client.sh`
3. **停云端服务**：`ssh root@<host> systemctl disable --now sentinel-dns-gateway`
4. **彻底移除**：
   ```sh
   rm -f /usr/local/bin/sentinel-dns-gateway
   rm -rf /etc/sentinel-dns-gateway
   rm -f /etc/systemd/system/sentinel-dns-gateway.service
   systemctl daemon-reload
   ```

回滚不需要改动插件版本：`dns_proxy` 是纯增量开关，缺省即关闭。

## 故障排查

| 现象 | 排查方向 |
| --- | --- |
| 插件报解析超时 | `dig @127.0.0.1 -p 5533 www.qq.com`；看 `~/Library/Logs/sentinel-dns-gateway.log` 是否有「隧道已连接」 |
| 隧道反复重连 | 安全组是否放行 TCP 24160；`ops.sh logs 100` 看服务端是否 `auth-failed` |
| 日志 `client-not-allowed` | `allowed_clients` 不含当前家庭出口 IP；`ops.sh allow-clients set <公网IP>` 后垫片会自动重连 |
| 服务重启后约 1 分钟才恢复 | 垫片重连退避上限约 60s，属预期；日志出现「隧道已连接」即恢复 |
| 大 TXT 或截断响应超时 | 垫片只监听 UDP；响应截断后解析器会改走 TCP 5533 而失败。保持默认 `query_types:["a"]`，或直连云端口 24100（UDP+TCP） |
| 大量 `REFUSED` | `ops.sh status` 看 `refused_rate` / `refused_domain` / `refused_acl`，据此调限速或白名单 |
| 解析很慢但无丢包 | `ops.sh status` 看各上游 `avg_ms` 与 `cooling`，剔除劣质上游 |
| 结果比直连少 | 对照 `ops.sh resolve <name> A`；确认不是目标域本身 NXDOMAIN 或存在泛解析 |

## 代码结构

| 文件 | 职责 |
| --- | --- |
| `main.go` | 进程入口、配置加载/保存、信号与热重载、HTTP 管理路由 |
| `forward.go` | 转发核心：ACL、限速、LRU 缓存、singleflight、上游熔断与 TCP 回退 |
| `tunnel.go` | TCP 多路复用隧道协议，服务端与客户端垫片 |
| `metrics.go` | 原子计数器、延迟分桶、查询环形日志、客户端统计 |
| `bench.go` | 端到端连通性/丢包自测 |
| `deploy/` | systemd、远程部署、macOS LaunchAgent、运维脚本 |
