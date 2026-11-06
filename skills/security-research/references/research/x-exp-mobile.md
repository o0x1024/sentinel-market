# X 经验语料 · mobile

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[移动端](../by-type/mobile-android.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-mobile-1（8 条） · 本文 16 行

- Android bounty
  Drozer -> content provider with -u flag
  Uncovers hidden .
  Always query with '/' at end
  Sometimes you may get lucky.
- When targeting an Android app, look for custom certificate validation.
  If you find a custom TrustManager with an empty or flawed checkServerTrusted method -> you can MiTM TLS connections and exfiltrate juicy data (same for IoT)
  https://saschafahl.de/static/paper/androidssl2012.pdf
