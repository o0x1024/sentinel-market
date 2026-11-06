# X 语料 · 信息泄露（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[信息泄露](../by-type/info-secrets.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-infoleak（13 条） · 本文 117 行

- Leak PII sensitive API Users DATA with URL Path
  -> /api/users/user@email.com
  -> /api/users/..%2Fuser@email.com
  -> /api/account/123/
  -> /api/account/..%2F..%2F123
- Build a list of Javascript file URLs for your target and run those through Nuclei to pull out API tokens. Test the tokens and show the impact.
  nuclei -l fileWithJSURLs.txt -t exposed-tokens/
- http://api.target.com/v2/account/ID -----> 403
  Now Fuzz Faster You Fool (FFUF):
  http://api.target.com/v2/account/ID/users… ----> 200 OK
  leak very sensitive data
- Jira Information Disclosure (CVE-2020-14179)
  Endpoint: /secure/QueryComponent!Default.jspa
  For reference reports & writeups:
  inurl: /secure/QueryComponent!Default.jspa
- Exposed access.log: filter it with status code 200 responses only, then fuzz over those paths:
  cat access.log | grep " 200 " | cut -d'"' -f2 | cut -d' ' -f2 | sort -u
- Simple way to extract all JS URLs for potentially secret / sensitive information:
  cat scope.txt | subjs | tee js_url | uniq | tee js_url 2>/dev/null
- tip: If you found any sensetive url, or config.js, which is giving 404, use waybackurls:
  echo "sensetive link" | waybackurls -get-versions
  And it will give you old version of that file.
- Recent finding on @Hacker0x01,
  http://Target.com/products --> 401 response
  So used,
  http://Target.com/api/products --> 200 response, all products details exposed.
- Bug: Information disclosure
  Tip: Always grep zip files from waybackdata.
  waybackurls http://target.com | grep zip
- Information disclosure.
  If the target uses Zoho's ManageEngine then try this:
  curl -X POST -i http://redacted/servlet/GetProductVersion
- "_wpeprivate" check this directory, here lot of sensitive data
  - "_wpeprivate". ——-> 302
- CVE-2022-4346: config, email & secret keys leaks
  dorks: "aiowps_remove_wp_generator_meta_info" filetype:txt
- Here is how to find sensitive data issues:
  1) publicly exposed documents: site:http://target.com ext:doc | ext:docx | ext:odt | ext:rtf | ext:sxw | ext:psw | ext:ppt | ext:pptx | ext:pps | ext:csv
- After git disclosures. Extract usefull tokens to leak the information (any website which have token in url), with just one command.
  1) go get -u http://github.com/lc/gau
  2) echo "http://drive.google.com" | gau
  3) Read all the secrets
- A git leak can happen on any URL path, not only on the root URL (domain[.]com/.git/config).
- 403 bypass
  - Change Host header to some random value
  - Try Different HTTP METHODS
  - Try PATH Fuzzing, ex: http://site.com/.;/secret
  - Try changing HTTP Version, example HTTP/1.1 to HTTP/0.9
  - In ROR apps try adding .json at the end
  - Try adding HTTP Headers
- wp-config backup Sensitive Data Exposure: Check for `wp-config.php.bak` endpoint maybe you will get juicy data.
- Sensitive Data Exposure, DB Credential and others
  Check for `http://config.inc.php_bk` endpoint maybe you will get Sensitive information
- site:target.* inurl:'/content/dam' resulted to Sensitive Data Exposure of *.target.com
- bash_history Sensitive Data Exposure: Check for `/.bash_history` endpoint maybe you will get juicy data.
- Information disclosure | Don't Believe 403
  http://target.com => 403
  http://target.com/state => 200
- Information disclosure tip
  cat subdomains.txt | waybackurls | httpx -mc 200 -ct | grep application/json
  Make sure your target is wide scope. Analyse each URL with json data. You'll find it a lot.
- Information disclosure
  Golang Pprof Debugger
  Path: /debug/pprof/
- Trick rapida para checar js
  1: lista de arquivos js > js.txt
  2: baixe todos js
   for i in $(cat js.txt);do wget --no-check-certificate $i;done
  3: análise todos em busca de tokens/credenciais
  cat * | grep -r -E "aws_secret_key|secret token"
- While hunting on AEM, an exposed JCR node may look uninteresting, but keep playing around with the extensions and selectors used, you may find some sha-1 hashes.
- Google Dorks
  site:http://jsfiddle.net "target[.]com"
  site:http://codebeautify.org "target[.]com"
  site:http://codepen.io "target[.]com"
  site:http://pastebin.com "target[.]com"
  Find hidden endpoints and sensitive data
- Sensitive information disclosure
  Tools used: Dirsearch
  Path: "/sftp-config.json"
- First finding: sensitive info leak
  Path /index.php?s=example
  Configured without the PATHINFO parameter. This allows attackers to access all system environment parameters from index.php.
  Second finding: exposed backup file
  Path /bin.rar
- Mass hunting exposed git with hednsextractor:
  Tools: hednsextractor + httpx + DotGit Plugin
  hednsextractor -target "target" -silent | httpx -path /.git/config -mc 200 -silent
- Trufflehog + this Google dorking query to locate API keys:
  filetype: config password | api_key | API_KEY | secret_key | xml
- TIP: Always check JS files for endpoints using linkfinder or you also try this regex:
  (?<=(\"|\'|\`))\/[a-zA-Z0-9_?&=\/\-\#\.]*(?=(\"|\'|\`))
  if you didn't find much, don't forget to fuzz
- 1. Source code exposure through Git repo.
  2. Information leak through Trace.axd endpoint
  Takeaway: When encountering http://asp.net applications look for Trace.axd endpoint. It might leak information.
- Find Exposed Laravel Log Files (App Key Disclosure)
  cat subdomains.txt | httpx -silent -path /storage/logs/laravel.log -mc 200 -o laravel_logs_exposed.txt
- If an app uses PHP Laravel and has an endpoint like:
  GET /api/users/?userid=1234
  Try sending:
  GET /api/users/?userid=-1
  It might leak debug info, routes, proxies, API keys. Use it as a gadget and chain with better bugs!
- low priv user tries to access admin endpoints -> `Permission denied`
  admin visits the endpoint
  low priv user makes the request AFTER admin has visited the endpoint -> `200 OK, info disclosure`
- API misconfiguration leading to a critical PII leak of employee data
  You can add " /api/v3.2/users/export/all " to your wordlist
- Misconfigured backend exposing the entire application internals and internal credentials.
  Tips: Add these files to your wordlists: /defines.inc.php /session_start.inc.php
