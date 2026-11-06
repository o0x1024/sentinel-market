# X 经验语料 · cache

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[缓存投毒](../by-type/cache-poisoning.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 本文 21 行

- If the target app returns sensitive data on not-found URLs, look for cache deception: visit random invalid URLs with different extensions, then visit the same URLs from another browser to see whether anything got cached.
- Cache poisoning works against targets using Akamai.
  Always use a cache-buster to avoid collateral damage.
- Burp Suite extensions to use while hunting:
  -> Autorize: detects IDORs and broken access control
  -> Upload Scanner: tests multiple upload vulnerabilities
  -> Param Miner: passive scan for hidden or unlinked parameters, cache poisoning
- Web cache poisoning: verify manually, do not rely on scanners.
- While testing for cache poisoning, always check UTM parameters such as utm_content — responses to these often get cached.
- If the server honours the X-Http-Method-Override header during a cache poisoning attempt (and caches the response), test all HTTP verbs; behaviour can differ per verb.
- Web cache deception leads to disclosure of PII of users.
- Script to test web cache deception:
  https://github.com/c0dejump/wcDetect
