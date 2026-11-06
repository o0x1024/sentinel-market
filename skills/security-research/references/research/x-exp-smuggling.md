# X 经验语料 · smuggling

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[请求走私](../by-type/request-smuggling.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-smuggling-1（10 条） · 本文 19 行

- Chain request smuggling into stored XSS:
  - Find a request smuggling vulnerability
  - Find a page where you can write comments
  - Abuse smuggling to capture other users' cookies and write them into a comment on your page
- HTTP request smuggling: abuse the difference in how a web server and a proxy parse the same request.
- HTTP request smuggling leads to cache poisoning.
- HTTP request smuggling in lua-nginx-module.
  Affects major proxies: Kong GW, OpenResty, Apache APISIX and more.
  Write-up: https://benasin.space/2025/03/18/OpenResty-lua-nginx-module-v0-10-26-HTTP-Request-Smuggling-in-HEAD-requests/
- CL.0 HTTP request smuggling.
  Tip: target any request that returns 3XX and smuggle it to increase impact.
