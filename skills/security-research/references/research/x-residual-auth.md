# X 语料 · 残余回收（认证与越权）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[认证与会话](../by-type/authn-session.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-auth-1（147 条）、x-exp-auth（279 条） · 本文 15 行

- Run more than one folder which contains yaml templates:
  $ cat list | nuclei -t nuclei-templates/{files,cves,tokens} -v -o result
- If you tried to access /.git folder and got 403, try to access files after .git like: /config or /logs/HEAD
  You can test it with multiple hosts via httpx tool:
  httpx -l subs.txt -path /.git/config --status-code --silent
- Nuclei Template : REFLECTION
  Potential Cross-Site Scripting (XSS), CORS, Cross-Site Request Forgery (CSRF) attacks, Cache Poisoning and Open URL Redirection, OAUTH Redirection
  nuclei -t reflection[.]yaml -u target
