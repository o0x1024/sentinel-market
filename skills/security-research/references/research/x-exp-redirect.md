# X 经验语料 · redirect

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[开放重定向](../by-type/open-redirect.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 本文 16 行

- Account takeover via open redirect parameter.
  Takeaway: always try changing the redirect_uri parameter wherever you find it.
- Some open redirect test cases and bypasses:
  -> Try using the same parameter twice: ?next=http://whitelisted.com&next=https://evil.com
  -> Try a double-URL and triple-URL encoded version of the payload
- If the target saves search history, try injecting HTML payloads there; the same spot can also give open redirect. The payload executes when a new search is performed.
- Open redirect reachable through a Chrome extension's HTML search engine: it searches saved keywords in the DOM only, not in JS.
  Tool: https://github.com/dirtycoder0124/HTML-Search-Engine---Chrome-extension
