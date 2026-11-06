#!/usr/bin/env bash
# 在 macOS 上安装本机 DNS 垫片并注册为开机自启（LaunchAgent）。
#
# 用法：
#   ./install-client.sh --token <TUNNEL_TOKEN> [--server 119.29.111.31:24160] [--port 5533]
#
# 说明：
#   * 只监听 127.0.0.1，不暴露给局域网；
#   * 全部 DNS 查询经一条长连 TCP 隧道发出，家庭路由器只有 1 条 NAT 会话；
#   * 默认端口 5533：5353 是 mDNS 保留端口，macOS 上通常已被占用；
#   * 卸载见 uninstall-client.sh。
set -euo pipefail

SERVER="119.29.111.31:24160"
TOKEN=""
PORT="5533"
LABEL="com.sentinel.dnsgateway.shim"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BIN_SRC="$ROOT/dist/sentinel-dns-gateway-darwin-arm64"
BIN_DIR="$HOME/.sentinel/bin"
BIN_DST="$BIN_DIR/sentinel-dns-gateway"
LOG_DIR="$HOME/Library/Logs"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --token) TOKEN="${2:-}"; shift 2 ;;
        --server) SERVER="${2:-}"; shift 2 ;;
        --port) PORT="${2:-}"; shift 2 ;;
        *) echo "未知参数: $1" >&2; exit 2 ;;
    esac
done

if [[ -z "$TOKEN" ]]; then
    echo "缺少 --token。可在服务器上读取：python3 -c \"import json;print(json.load(open('/etc/sentinel-dns-gateway/config.json'))['tunnel_token'])\"" >&2
    exit 2
fi
if [[ ! -f "$BIN_SRC" ]]; then
    # 兼容 Intel Mac
    if [[ -f "$ROOT/dist/sentinel-dns-gateway-darwin-amd64" ]]; then
        BIN_SRC="$ROOT/dist/sentinel-dns-gateway-darwin-amd64"
    else
        echo "缺少 macOS 二进制，请先构建：CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -o dist/sentinel-dns-gateway-darwin-arm64 ." >&2
        exit 1
    fi
fi

mkdir -p "$BIN_DIR" "$LOG_DIR" "$(dirname "$PLIST")"
install -m 0755 "$BIN_SRC" "$BIN_DST"

# 已加载则先卸载，保证配置生效
launchctl bootout "gui/$UID/$LABEL" >/dev/null 2>&1 || true

# 端口被别的进程占用时立即失败，避免 LaunchAgent 反复重启并在日志里刷 bind 错误
sleep 0.3
for _ in 1 2 3 4 5; do
    lsof -nP -iUDP:"$PORT" >/dev/null 2>&1 || break
    sleep 0.4
done
if lsof -nP -iUDP:"$PORT" >/dev/null 2>&1; then
    echo "端口 $PORT 已被占用，无法启动本机垫片：" >&2
    lsof -nP -iUDP:"$PORT" | sed -n '2,4p' >&2 || true
    echo "请改用其它端口，例如 --port 5534，并在插件里把 dns_proxy.port 设为同一端口。" >&2
    exit 1
fi

cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>$BIN_DST</string>
        <string>-client</string>
        <string>-server</string>
        <string>$SERVER</string>
        <string>-token</string>
        <string>$TOKEN</string>
        <string>-listen</string>
        <string>127.0.0.1:$PORT</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>ProcessType</key>
    <string>Background</string>
    <key>ThrottleInterval</key>
    <integer>5</integer>
    <key>StandardOutPath</key>
    <string>$LOG_DIR/sentinel-dns-gateway.log</string>
    <key>StandardErrorPath</key>
    <string>$LOG_DIR/sentinel-dns-gateway.log</string>
</dict>
</plist>
PLIST_EOF

chmod 600 "$PLIST"
launchctl bootstrap "gui/$UID" "$PLIST"
sleep 1.5

echo "=== 进程 ==="
launchctl print "gui/$UID/$LABEL" 2>/dev/null | grep -E "state|pid" | head -3 || true
echo "=== 已验证解析（经垫片） ==="
dig +short +timeout=4 @127.0.0.1 -p "$PORT" www.qq.com A | head -3 || echo "解析失败，请查看 $LOG_DIR/sentinel-dns-gateway.log"
echo "=== 日志 ==="
tail -3 "$LOG_DIR/sentinel-dns-gateway.log" 2>/dev/null || true
echo
echo "垫片已就绪：127.0.0.1:${PORT}（插件配置 dns_proxy.enabled=true，host=127.0.0.1，port=${PORT} 即可使用）"
