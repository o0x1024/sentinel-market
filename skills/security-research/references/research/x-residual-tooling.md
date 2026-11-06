# X 语料 · 残余回收（工具链用法）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[资产发现](../asset-discovery.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-tooling-1（208 条）、x-exp-tooling（16 条）、x-recovered-toolchain（11 条） · 本文 14 行

- Nuclei Template : REFLECTION
  Potential Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF) attacks, Cache Poisoning and Open URL Redirection.
  nuclei -t reflection[.]yaml -u target
- Arjun + KXSS to find parameters and test them for XSS:
  arjun -q -u target -oT arjun && cat arjun | awk -F'[?&]' '{baseUrl=$1; for(i=2; i<=NF; i++) {split($i, param, "="); print baseUrl "?" param[1] "="}}' | kxss
- Get any program's Burp Suite config file directly in your terminal:
  curl http://term.rohsec.com/burp_config/paypal
