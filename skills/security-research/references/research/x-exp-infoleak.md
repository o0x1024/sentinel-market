# X 经验语料 · infoleak

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[信息泄露](../by-type/info-secrets.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-infodisc-1（44 条） · 本文 33 行

- Beyond S3: Google Cloud Storage carries the same misconfiguration exposure as S3 buckets.
  More: http://ghostlulz.com/google-cloud-storage/
- Hunt internal subdomains of a company on GitHub:
  "http://company-name.atlassian.net" password
  "http://jira.company.com" password
  "http://internal.company.com" password
  This tracks down employee Jira credentials exposed in GitHub repos.
- Admin credentials can sit in MD5 (easily decrypted).
  Tip: even on a 404 page, review the source code, including the .js files.
- Tip: while testing an admin account, always check the source view — developers sometimes leave administrator commands that reach admin functionality.
- If you manage to cache a 404 response via an extension (the error being caused by that extension), make sure no confidential information sits in the source code while you are authenticated.
- Search GitHub for leaked credentials:
  org:targetname password , DB_USERNAME
  often yields DB credentials.
- While inspecting the source of injection points, review the regex expressions in use with https://devina.io/redos-checker — an unsafe regex can give client-side DoS (ReDoS).
- An affiliate parameter of a user can leak information (P4 range).
  Tip: always watch the responses of requests.
- A Stripe secret key exposed in a JavaScript file gives access to customer details, payment data and payouts.
  Tip: check admin panels for sensitive keys — Stripe keys turn up there repeatedly.
- Top AWS S3 bugs:
  1) Misconfigured S3 buckets expose sensitive data. Check manually with %c0 on the XML error page, or detect AWS technology with Wappalyzer.
- Debug mode can leak the phpMyAdmin username and password.
  Tip: check every directory to see whether debug mode is on.
- WebSocket PII exposure: WebSockets leak personally identifiable information when not handled securely.
  Tip: always check WS responses for PII.
