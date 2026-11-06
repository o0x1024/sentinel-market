# X 语料 · CSRF 与 CORS（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[CSRF 与 CORS](../by-type/csrf.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-csrf（24 条） · 本文 94 行

- API TIP:
  Use Mass Assignment to bypass security mechanisms.
  E.g., "enter password" mechanism:
  - `POST /api/rest_pass` requires old password.
  - `PUT /api/update_user` is vulnerable to MA == can be used to update pass without sending the old one (For CSRF)
- API Security tip:
  JSON API endpoints are vulnerable to CSRF, just set content-type to `text/plain` and see if it works.
- Bypass CSRF token in the request body
  1. e.g. {"token":"<token_here>"}
  2. Change the parameter's name to parameter array:
   token -> token[]
  3. now, {"token[]":"<anything>"}
- assetfinder http://fitbit.com | httpx -threads 300 -follow-redirects -silent | rush -j200 'curl -m5 -s -I -H "Origin:http://evil.com" {} | [[ $(grep -c "http://evil.com") -gt 0 ]] && printf "\n\033[0;32m[VUL TO CORS] - {}\e[m"' 2>/dev/null
- CSRF
  1. Generated HTML POC from burp attack failed
  2. Site used double-submit tokens
  3. Sent as blank tokens, checked response in repeater
  4. Site allowed to set CSRF header
  5. Generated POC with blank tokens -> CSRF works
- Some of my favorite CSRF protection bypasses :
  1. Remove the CSRF token
  2. Remove the token and the parameter from the request.
  3. Register 2 users. Use one user's Csrf protection token, replace other user's token with it, send the request.
- Bypassing csrf
  1) change the request methods( POST to GET)
  2) Remove the csrf param and value entirely
  3) Try to use attacker's generated csrf token (it's only one time use it should be fresh if one's it's checked on server side then we can't use it)
- You found a Endpoint where CSRF-Token is not being validated but can't perform CSRF-Attack because of CORS Policy
  Try to Fuzz Hidden Parameters using Param Miner
  POST /end.php
  GET /end.php?method=POST&token=null
- API with JWT in AuthZ header?
  1. Copy JWT b64 value
  2. Add new cookies - "auth_token", "jwt_token", "jwt", paste b64 as value
  3. Duplicate previous API call, add cookies, remove header.
  4. Works? AuthN supports cookies
  5. API is 90% vulnerable to CSRF
- CSRF to account takeover(find hidden endpoint)
  1. Login to account.
  2. Go to account setting http://target.com/account.
  3. Fuzzing http://target.com/account/FUZZ.
  4. Hidden endpoint found for email and password editing http://target.com/account/edit.
  5. CSRF.
- CSRF ON ACCOUNT DELETING FUNCTIONALITY
  1) Always remove the csrf token parameter in the request.
  After fixing the vulnerablity try to bypass the fix
  2) create a new user and capture the csrf token and check if that token accepting or not.
- CORS Misconfigs at scale
   gau "$site" | while read url; do target=$(curl -sIH "Origin: https://evil.com" -X GET $url) | if grep 'https://evil.com'; then [Potentional CORS] echo $url; else echo Nothing "$url"; fi; done
- Use another user's valid token
  POST /register HTTP/1.1
  Host: http://target.com
  ...
  username=dapos&password=123456&token=aaaaaaaaaa
  To
  username=dapos&password=123456&token=bbbbbbbbbb
- Easy CSRF I see all the time:
  1. In Burp, change request method from POST -> GET
  2. Remove CSRF token
  3. If PoC works against another user, you have CSRF
- Bypass CSRF Protection
  1. every POST/PUT/PATCH request was protected by X-CSRF-TOKEN in header
  2. changed from POST to GET and appended request body to url as request param
  3. removed X-CSRF-TOKEN from headers
  4. received 200 thus bypassed CSRF protection
- Google Dork - Apache Server Status Exposed:
  site:*/server-status apache
  Find sensitive GET requests w/ CSRF tokens & API keys.
- WordPress website with 3 vulnerabilities:
  a) /wp-json/wp/v2/users/<id> endpoint leaking all user details except passwd
  b) CORS misconfiguration
  c) xmlrpc.php vulnerability
- CSRF
  Steps to reproduce and tip:
  1- change your profile data and intercept the post request
  2- (tip) delete the verification token then generate the csrf poc
  3- send it to victum => 200 ok => victum's profile updated
- CSRF token bypass tips:
  1. Remove or leave token blank.
  2. Change POST to GET.
  3. Replace token with random value.
  4. Use random token matching constraints.
  5. Reuse a previous token.
  6. Bypass regex checks.
  7. Remove referer header.
- Quick Oneliner to Check for CORS:
  cat origins.txt | xargs -P10 -1 bash -c 'curl -s -I -H "Origin: {}" -H "Access-Control-Request-Method: GET" https://target.com | grep -q "Access-Control-Allow-Origin: {}" && echo "[+] Vulnerable: {}"'
