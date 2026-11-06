# X 语料 · 残余回收（API 与端点）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：本类无专属篇，按 [检测入口](../vuln-detection.md) 选择 · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-api-1（23 条）、x-exp-api（180 条） · 本文 19 行

- An iOS shortcuts 'share url' looks like: https://icloud.com/shortcuts/MYSHORTCUTID
  But we can't actually download it on a computer.. can we? https://icloud.com/shortcuts/api/records/MYSHORTCUTID
  wget https://cvws.icloud-content.com/B/MYDOWNLOADURL -O foo-shortcut
  plutil -convert xml1 foo-shortcut
- Return a list of endpoints from a swagger.json.
  Pass them to your fuzzer(s).
  curl -s hxxps://petstore.swagger.io/v2/swagger.json | jq '.paths | keys[]'
- Find sensitive information with AlienVault OTX
  curl -s "https://otx.alienvault.com/api/v1/indicators/domain/…<TARGET>/url_list?limit=100&page=1" | jq -r '.url_list[].url'
- Algolia AppId+API-KEY PoC to show permissions:
  curl "https://[APP-ID]-dsn.algolia.net/1/keys/[APPKEY]?x-algolia-application-id=[APP-ID]&x-algolia-api-key=[ApiKey]"
  If ACL is Search only, it's likely to be a P5, if it has other sensitive permissions.. it's a P1/P2
