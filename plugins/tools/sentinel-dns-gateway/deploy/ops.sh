#!/usr/bin/env bash
# 云端网关运维快捷命令。
#
# 用法：
#   ./ops.sh status                 # 服务状态 + 计数器 + 上游健康
#   ./ops.sh queries 50             # 最近 50 条查询
#   ./ops.sh clients                # 客户端维度统计
#   ./ops.sh allow-domains add a.com b.com
#   ./ops.sh allow-clients add 1.2.3.4 10.0.0.0/8
#   ./ops.sh flush                  # 清空缓存
#   ./ops.sh resolve api.qq.com A   # 绕过缓存直接验证一次解析
#   ./ops.sh logs 100               # 最近日志
#   ./ops.sh restart
#   ./ops.sh token                  # 打印 tunnel_token / admin_token
set -euo pipefail

HOST="${HOST:-119.29.111.31}"
ADMIN_PORT="${ADMIN_PORT:-24180}"
KEY="${KEY:-$HOME/.ssh/sentinel_cloud}"
SSH=(ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "root@$HOST")

remote() { "${SSH[@]}" "$@"; }

admin_token() {
    remote "python3 -c \"import json;print(json.load(open('/etc/sentinel-dns-gateway/config.json'))['admin_token'])\""
}

api() {
    local method="$1" path="$2" body="${3:-}"
    local token; token="$(admin_token)"
    if [[ -n "$body" ]]; then
        remote "curl -sS -X $method -H 'Authorization: Bearer $token' -H 'Content-Type: application/json' -d '$body' http://127.0.0.1:$ADMIN_PORT$path"
    else
        remote "curl -sS -X $method -H 'Authorization: Bearer $token' http://127.0.0.1:$ADMIN_PORT$path"
    fi
}

command="${1:-status}"
shift || true

case "$command" in
    status)
        remote "systemctl is-active sentinel-dns-gateway"
        api GET /v1/status
        ;;
    queries)
        api GET "/v1/queries?limit=${1:-50}"
        ;;
    clients)
        api GET /v1/clients
        ;;
    allow-domains)
        action="${1:-list}"; shift || true
        if [[ "$action" == "list" ]]; then
            api GET /v1/status
        else
            items=""; for item in "$@"; do items+="\"$item\","; done
            api POST /v1/allowlist/domains "{\"$action\":[${items%,}]}"
        fi
        ;;
    allow-clients)
        action="${1:-list}"; shift || true
        if [[ "$action" == "list" ]]; then
            api GET /v1/status
        else
            items=""; for item in "$@"; do items+="\"$item\","; done
            api POST /v1/allowlist/clients "{\"$action\":[${items%,}]}"
        fi
        ;;
    flush)
        api POST /v1/cache/flush '{}'
        ;;
    resolve)
        name="${1:?需要域名}"; type="${2:-A}"
        api POST /v1/resolve "{\"name\":\"$name\",\"type\":\"$type\"}"
        ;;
    reload)
        api POST /v1/reload '{}'
        ;;
    logs)
        remote "journalctl -u sentinel-dns-gateway -n ${1:-100} --no-pager"
        ;;
    restart)
        remote "systemctl restart sentinel-dns-gateway && sleep 1.5 && systemctl is-active sentinel-dns-gateway"
        ;;
    token)
        remote "python3 -c \"import json;c=json.load(open('/etc/sentinel-dns-gateway/config.json'));print('tunnel_token='+c['tunnel_token']);print('admin_token='+c['admin_token'])\""
        ;;
    *)
        echo "未知命令: $command" >&2
        sed -n '3,16p' "${BASH_SOURCE[0]}"
        exit 2
        ;;
esac
