# X 语料 · 移动端（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[移动端](../by-type/mobile-android.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-mobile（2 条） · 本文 26 行

- 1. apktool d xyz.apk
  2. cat xyz/res/values/strings.xml | grep -E 'api_key|http'

- Easy way to find unused/developer endpoints in mobile applications:
  1. Download APK
  2. Use JADX to decompile the application
  3. Use JADX GUI to search for the URL of the API, such as "http://uberinternal.com"
  https://github.com/skylot/jadx

- apktool d app.apk -o uberApk;grep -Phro "(https?://)[\w\.-/]+[\"'\`]" uberApk/ | sed 's#"##g' | anew | grep -v "w3\|android\|github\|http://schemas.android\|google\|http://goo.gl"

- Extract URL from .apk file
  - apktool -d com.uber -o uberAPK; grep -Phro "(https?://)[\w\,-/]+[\"\']" uberAPK/ | sed 's#"##g' | anew | grep -v "w3\|android\|github\|http://schemes.android\|google\|http://goo.gl"

- Mobile testing stack: termux, mitmproxy, curl.
  curl --proxy http://localhost:8080 'target'
  Intercept, modify and replay the request.

- On Android and iOS, check /assets/capacitor.config.json — it often holds useful data.
