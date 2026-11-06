# X 经验语料 · logic

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[业务逻辑](../by-type/business-logic.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-logic-1（16 条） · 本文 19 行

- To test for a race condition with Burp Intruder, use "null payloads" to send the same request repeatedly.
- Currency tampering: item priced $300; changing the parameter currency_code from USD to PKR charged PKR 300 (~$1.65).
- Price manipulation with a negative value in the Quantity parameter (-1). The manipulated amount does not appear on the cart page but is reflected on the final checkout page.
- Missing rate limit on the current-password field.
  Tip: in the account profile, start deleting your account and check whether brute-forcing the password confirmation is restricted. If not, report it. [P4]
- Price tampering escalation: the response carries the currency field ("USD"); switching it to another currency ("SAR") made all products free.
- On a private invite: walk every function until you reach the subscription page, then intercept the payment-page response with Burp Suite and inspect the comments.
- An endpoint can be rate-limited ("Too Many Requests") while the underlying function is not: it never checks how many emails a single request sends, or whether the address is duplicated.
- In a price/discount or percentage-discount field, try the payload (1,alert)(7*7)] — it may trigger discount injection or resource injection. Detectable both client side and server side.
- Bug type: business logic.
  Tip: try to use a premium plan from a free account; response manipulation often works.
