#!/usr/bin/env bash
# 本地一键部署：上传二进制与 systemd 单元，然后在远端执行 install.sh。
# 用法：HOST=119.29.111.31 ./remote_deploy.sh
set -euo pipefail

HOST="${HOST:-119.29.111.31}"
KEY="${KEY:-$HOME/.ssh/sentinel_cloud}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SSH=(ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null)
SCP=(scp -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null)

[[ -f "$ROOT/dist/sentinel-dns-gateway-linux-amd64" ]] || {
    echo "缺少二进制，请先构建：CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o dist/sentinel-dns-gateway-linux-amd64 ." >&2
    exit 1
}

"${SCP[@]}" "$ROOT/dist/sentinel-dns-gateway-linux-amd64" "root@$HOST:/root/sentinel-dns-gateway.new"
"${SCP[@]}" "$ROOT/deploy/sentinel-dns-gateway.service" "root@$HOST:/root/sentinel-dns-gateway.service"
"${SCP[@]}" "$ROOT/deploy/install.sh" "root@$HOST:/root/install-dns-gateway.sh"

"${SSH[@]}" "root@$HOST" 'bash /root/install-dns-gateway.sh'
