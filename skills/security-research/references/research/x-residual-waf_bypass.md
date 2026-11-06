# X 语料 · 残余回收（WAF 绕过）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[WAF 与逐层解析](../by-type/waf-bypass.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-waf-1（116 条）、x-exp-waf（98 条） · 本文 17 行

- Open Redirect to Account Takeover
  First I collected all the subdomain
  assetfinder --subs-only redacted,com | httpx -silent | tee -a redacted.txt
  Crawl the parameter using Waybackurls and pass it to GF tool
- Filter login pages/sites and dig into them first:
  cat target-urls.txt | httpx -title -td -fr -sc -cl -ct -o targets.txt
- Get in-scope items and domains of any Bug Bounty program via
  curl http://term.rohsec.com/inscope/program
  Filter for only domains via
  curl http://term.rohsec.com/inscope/program?domains=1
