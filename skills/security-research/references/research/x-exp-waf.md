# X 经验语料 · waf

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已被剥离。作者自述，未经复现验证。
已合并同一思路的转贴簇（修复后重测、403 头、限速头、源站 IP、支付绕过）；
图片帖、纯提问、无做法的战绩帖已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[WAF 与逐层解析](../by-type/waf-bypass.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-waf-1（116 条）、x-residual-waf_bypass（3 条） · 本文 130 行

- Bypass firewalls by DNS-history. The script searches for DNS A history records and checks if the server replies for that domain.
  https://github.com/vincentcox/bypass-firewalls-by-DNS-history
- When input is only validated client-side and not server-side, you can bypass the character limit for any input field.
- Race condition -> bypass account limit that normally requires a paid subscription. Find the request that does X and submit them really fast before the check for the limit happens.
  https://bugbountyforum.com/blog/ama/jackhcable/
- WAF devs often include some sort of shared secret as a whitelist string. If the WAF has some kind of open-source version, go through the source looking for it. Once found, you have the killswitch in your hand.
- Rate Limit Bypass:
  Add these characters after the email or mobile: %09, %00
  Or add an extra header in the request: X-Forwarded-For: IP
  If it doesn't work, try adding multiple headers to bypass the function.
- Always try test card BINs or AMEX BINs followed by random CC numbers when testing a payment gateway.
- Hawkscan v1.2: new words in dico.txt, new extensions in backup check (.bkp...), test bypass of waf rate limit via X-Remote-IP, --exclude 403, filter report by http code.
- Finding the IP of a domain behind Cloudflare WAF: querying "domain.com" found no IP, but adding www before the domain gave me the origin server IP.
- Always remember to test how the WAF handles invalid unicode.
- If the application doesn't verify your email, or you can bypass verification, try registering with the org domain, e.g. user@target.com. You might get privileged access to the application.
- If chrome blocks you with "Connection is not private", just type "thisisunsafe". The warning can also be bypassed if the website sets the HTTP Strict-Transport-Security response header.
- 403 Bypass using X-Original-URL:
  Host: <redacted>.com/secure  ->  403
  Host: <redacted>.com/test/ + X-Original-URL: /secure  ->  200 OK
- Possible methods to bypass rate limits along with CAPTCHA bypass tips:
  https://blog.theinfosecguy.me/post/bypassing-rate-limit-like-pro/
- Always compare requests (before patched and after patched). Change the new request parameters with the old (before patch) parameters. If you got 200/301, you successfully bypassed the patched vulnerability.
- Sometimes the answer does not exist — literally. Try using null values or empty arrays to bypass back-end logic.
- Email verification bypass: from web, email change required verification. But in the Android app the email was not editable from the UI while the email param was still passing in the request — tampered and bypassed.
- CRLF injection: if %0A returns HTTP 403 Forbidden, try %0a to bypass the ban.
- Open-source tool to bypass 403: fakes HTTP headers and URIs, and brute directories.
  https://github.com/NumencyberLabs/bypass403
- When you encounter a 403 Forbidden page, try adding an "X-Client-IP" header with the value "127.0.0.1".
- If you are blocked by a WAF and cannot bypass it, retest on different days of the week. My target site blocked me every day except Wednesday and Sunday — on those days I looked for vulnerabilities.
- SSRF P2 at a VDP:
  - Trying with localhost or 127.0.0.1 "Not Work"
  - Trying a lot of bypasses and DNS rebind "Not Work"
  - Iterating through private IPs in the range 192.168.x.x (Working)
  - Port scan on all the private network
- Bypass 403 via domain CNAME: after you find all the domains with status code 403, try using the CNAME output to access sensitive data.
- Publicly exposed .git in a major financial target on BC, marked as "Duplicate" — but the original reporter was unable to exploit further because of an aggressive WAF. Going further got it triaged to P1.
- Android apps can try to stop us with anti-Frida protections, but a neat simple trick bypasses them (by @busk3r).
- Scanning internal IPs I got a 403 with the message "You can't access https://IP/".
  Passed the request to the proxy and changed the host header to:
  Host: localhost
- To check for CSP bypasses, use Google's official CSP evaluator: http://csp-evaluator.withgoogle.com
  Input your target's CSP header and see what it's vulnerable to.
- Bypass 403:
  - Using "X-Original-URL" header
  - Appending %2e after the first slash
  - Try add dot (.), slash (/) and semicolon (;) in the URL
  - Add "..;/" after the directory name
  - Try to uppercase the alphabet in the url
  - Also try X-Rewrite-URL
- If your target has a WAF and you want to deliver the payload from a JSON request, encode the payload as Unicode. The backend always decodes the Unicode characters, but the WAF is unable to recognize the payload.
- Bypass WAF through a large number of characters: if you encounter a WAF on POST/PUT/PATCH requests, try inserting useless characters with arbitrary data, ranging from 8 KB to 10 MB, BEFORE your malicious payload in the parameter.
- Aside from the old tricks to bypass 127.0.0.1 being blacklisted (127.1, ::80, an A record pointing to localhost etc.): INET_ATON would consider any IP within 127.0.0.1/8 the same as localhost.
  i.e. curl 127.4.142.123
- Play between the following content-types (bodies adjusted accordingly) to make the web server behave unexpectedly:
  x-www-form-urlencoded --> user=test
  application/xml --> <user>test</user>
  application/json --> {"user": "test"}
- Banking apps may detect Developer mode on Android; bypass it using the LSPosed module IAMNotADeveloper.
  https://github.com/Xposed-Modules-Repo/xyz.xfqlittlefan.notdeveloper
- CSP framing restriction bypass: they use content-security-policy: frame-ancestors 'self' https://*.foo.foo:* — check whether http://foo.foo is claimable.
  https://blog.ibrahimdraidia.com/bypass-csp-framing-restriction-rule-olx/
- Bypass domain restrictions with special characters. Emails were blocked for "http://yopmail.com" — intercepted the request and changed "i" to "İ". Done.
- If a website requires a company email and doesn't accept normal emails, test your HackerOne & Bugcrowd email:
  <H1_username>@wearehackerone.com
  <bc_username>@bugcrowdninja.com
  The message will still be received in your inbox, but this bypasses it.
- In many cases the clear text payload won't work, so try many encoded payloads such as Unicode, Hex, Numeric entities.
  https://gchq.github.io/CyberChef/
- Target restricts uploading ".bat" or other executable extensions? Try adding a dot to the extension such as "malicious.bat." and if you're lucky you bypass the restriction.
- Found a bypass of a resolved report two ways with the same method: the first bypass was on the main domain where the original report was filed, the second worked on the staging domain of the same domain.
- How I got easy account takeover:
  1- Went to https://web.archive.org
  2- Put the domain in and searched for urls
  3- Typed %40 in the filter and searched
  4- Got a lot of urls with a parameter leaking the email and password of users
- Always make a "Match and Replace" rule to replace any false to true in the response body — you will see you have unlocked a lot of paid features in your FREE plan.
  But make sure you can fully use these features and it's not just a client-side bypass.
- If any element on the website is disabled, test it and try to bypass the restriction. "Disabled" doesn't always mean dead — most hunters stop testing once the UI says "fixed".
- CRLF vulnerabilities but a firewall is standing in your way? Sometimes some odd encodings allow you to bypass firewalls.
- Rate limit bypass by deploying a network of proxies to distribute requests across multiple IP addresses (proxy scraper & check, python, nuclei template, curl) — effectively bypasses IP-based rate limits.
- Bypass 429 (Too Many Requests) — try adding these custom headers:
  X-Forwarded-For : 127.0.0.1
  X-Forwarded-Host : 127.0.0.1
  X-Client-IP : 127.0.0.1
  X-Remote-IP : 127.0.0.1
  X-Remote-Addr : 127.0.0.1
  X-Host : 127.0.0.1
  (also: previous list — X-Forwarded-Host, X-Forwarded-For; and multiple copies of the same header)
- Try custom headers to bypass captcha:
  X-Originating-IP: 127.0.0.1
  X-Forwarded-For: 127.0.0.1
  X-Remote-IP: 127.0.0.1
  X-Remote-Addr: 127.0.0.1
- Bypassed Imperva WAF using the following payload:
  %22){};%20var%20a%20=%20String.fromCharCode(97,%20108,%20101,%20114,%20116);%20window[a](%22XSS%20by%20gilsgil64%22);%20if%20(1==1)//
  Remember, always pay attention in the context!
- Everyone knows about proxying traffic via VPN to bypass geo-based restrictions. Also relevant for bypassing particular WAFs is to consider regions — proxying via eu-west-1 or us-east-2 is very useful.
- When testing a new target located in a different country, double check with a VPN or proxy located in the same country as the target domain. This helps find and bypass geofencing infrastructure.
- Tried so many payloads but kept being blocked by word-fence WAF. Found I could inject a clickable text, and when clicked it executed the payload — WAF bypassed.
- Punycode email spoofing bug. Used a lookalike domain to bypass the email uniqueness check:
  Register with comilav831@lhory.com > use the same name as the legit user > invite the real user to the fake team. Real user joins the attacker's team and gets locked out of the real one.
- Using base85 encoding and XOR in the encode algorithm in my scripts, I easily bypassed antiviruses — simpler versions of the script were detected and prevented.
- AI red teaming: model abuse (misusing LLMs to bypass rules), output manipulation (injecting/altering structured responses).
  Test by adding `ignore previous instruction` and check whether the model obeys the user or the policy.
- Business logic vulnerability allowing subscription bypass by modifying the response from "plan":"free" → "plan":"enterprise", which enables paid features for free accounts.
- Always check websocket history — it can sometimes leak data you shouldn't have access to (403 on the HTTP endpoint, but the WS feed still delivers).
- Changing a victim's email asked for the victim's password and sent a verification email. Bypassed all that by changing the method: From PUT >> PATCH.
- Premium bypass in Spotify:
  https://medium.com/@nikhilgarg6176/how-i-discovered-a-premium-bypass-vulnerability-in-spotify-and-what-happened-next-a-first-time-748e2fda7a39
- When trying to bypass a lock screen in a mobile app, insecure exported components aren't always the only way in. Look for race conditions.
  https://byteblind.com/blog/passcode-race-condition-bypass/
- Unlimited followers for any profile:
  1. Click follow button & capture request
  2. Use intruder to repeat request 100 times -> 403 Forbidden
  3. Use repeater to send request 20 times & see the target profile gain 20 followers
  (the rate limit only applied to the intruder path)
- Using a streaming service for free: reverse proxy + multiple X-Forwarded-For HTTP headers.
- Origin IP found -> DDoS & WAF (Cloudflare) protection bypassed.
- Business logic vulnerability: first found 2024-11-15, got High (7.1). After it was resolved I bypassed it and achieved the same impact — got Medium (5.4) instead. Always try to bypass resolved bugs, and expect the severity to be argued down on the retest.
