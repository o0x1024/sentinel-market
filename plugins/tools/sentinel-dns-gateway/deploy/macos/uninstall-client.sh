#!/usr/bin/env bash
# 卸载 macOS 本机 DNS 垫片（保留二进制与日志，便于回滚后重装）。
set -euo pipefail

LABEL="com.sentinel.dnsgateway.shim"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

launchctl bootout "gui/$UID/$LABEL" >/dev/null 2>&1 || true
rm -f "$PLIST"

echo "已停止并移除 LaunchAgent: $LABEL"
echo "保留文件：$HOME/.sentinel/bin/sentinel-dns-gateway 与 $HOME/Library/Logs/sentinel-dns-gateway.log"
echo "如需彻底清理：rm -rf \"$HOME/.sentinel/bin/sentinel-dns-gateway\" \"$HOME/Library/Logs/sentinel-dns-gateway.log\""
