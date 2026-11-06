#!/usr/bin/env bash
# 在云服务器上安装/升级 sentinel-dns-gateway。
# 用法（在服务器上执行）：bash install.sh
set -euo pipefail

BIN_SRC="${1:-/root/sentinel-dns-gateway.new}"
BIN_DST=/usr/local/bin/sentinel-dns-gateway
CONF_DIR=/etc/sentinel-dns-gateway
UNIT=/etc/systemd/system/sentinel-dns-gateway.service

install -m 0755 "$BIN_SRC" "$BIN_DST"
rm -f "$BIN_SRC"
mkdir -p "$CONF_DIR"
chmod 750 "$CONF_DIR"

if [ ! -f "$CONF_DIR/config.json" ]; then
    echo "[*] 首次运行，生成默认配置（含随机管理 token）"
    "$BIN_DST" -config "$CONF_DIR/config.json" -version >/dev/null
    # 触发配置生成后立即退出：用一次极短的前台运行
    timeout 2 "$BIN_DST" -config "$CONF_DIR/config.json" >/dev/null 2>&1 || true
fi
chmod 600 "$CONF_DIR/config.json" 2>/dev/null || true

if [ -f /root/sentinel-dns-gateway.service ]; then
    install -m 0644 /root/sentinel-dns-gateway.service "$UNIT"
    rm -f /root/sentinel-dns-gateway.service
fi

systemctl daemon-reload
systemctl enable sentinel-dns-gateway >/dev/null 2>&1 || true
systemctl restart sentinel-dns-gateway
sleep 1.5

echo "=== systemd ==="
systemctl is-active sentinel-dns-gateway
echo "=== healthz ==="
curl -s --max-time 3 http://127.0.0.1:24180/healthz || echo "健康检查失败"
echo
echo "=== 管理 token ==="
python3 - <<'PY'
import json
with open('/etc/sentinel-dns-gateway/config.json') as fh:
    cfg = json.load(fh)
print(cfg.get('admin_token', ''))
print('listen=%s admin=%s domain_allowlist=%s' % (cfg.get('listen'), cfg.get('admin_listen'), cfg.get('allowed_domains')))
PY
