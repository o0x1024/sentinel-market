# X 经验语料 · csrf

来源：X 公开贴子，归入「经验」桶。给出做法/判断经验，缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[CSRF 与 CORS](../by-type/csrf.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-csrf_cors-1（20 条） · 本文 42 行

- Pentest target using the PHP Codeigniter framework? If yes, do not miss to check CSRF bypass.
- Configure Burp to ( Always add origin: http://eval.com to the request headers and if http://eval.com is reflected in the response and Allow-Credentials is present then intercept the response ) = Simple CORS Vulnerabilities.
- While testing for CSRF in APIs, if the parser breaks due to an extra = in the JSON body, try using the structure like:
  name='{"obj"="xyz',value='"} ' which would result in {"obj=":"xyz"} instead of {"obj":"xyz"}=
- In some cases to bypass samesite=lax attribute and exploit CSRF, first thing you should try is changing HTTP method to GET.
- CORS vulnerability with trusted null origin.
  Origin:null
  Access-control-allow-credentials: true
  Access-control-allow-origin:null
- Vulnerable to CORS, Add Origin header in the request and check for Reflection in Allow Origin header.
- IF CSRF is applied on all POST/PUT/PATCH requests, try replaying them as GET and also sending "_method" param with PUT/POST/Other values.
  Alternatively, some may also support "sudo_method"
- Keep a list of bugs in a mind map that you often forget to check for (lows/p3-4). CSRF is one for me.
- CSRF bypass TIP - If a protection based origin check and null origin allowed try send the request via data protocol it will send null origin
  Example:
  data:text/html;base64,...
- Tip: If CORS is configured well, Try some Cors Bypass of Prefix and Suffix match, that may succeed !
- If you are trying to generate CSRF PoC from a request with json body in Burp, try to remove the "enctype" and insert every value in a separate tag with HTML entity encoding
- Bug: CORS misconfig. led to information's leakage
  Tips: try to bypass the origin by deleting the [.] , like that [wwwTarget[.]com]
- Try changing POST request method to GET in XSRF attacks with cookies' attribute set to {Samesite: Lax}, since Lax value only applies to POST requests.
- Learn how to use macros in burpsuite
  When there's a strict csrf on webapp, or while testing APIs
  set up macros so you can easily test the web application
  Don't use extensions for setting up header based macros
- You can use ChatGPT or Caido's new ChatGPT feature to convert JSON content-type to x-www-form-urlencoded super easily. Easy CSRF check that normally requires lots of manual work.
- Ever had to test for CSRF vulnerabilities at scale on your target?
  XSRFProbe is the tool for it! It's an advanced CSRF/XSRF exploitation tool in Python and it even integrates its own crawling engine!
  https://github.com/0xInfection/XSRFProbe
- if you found a cors vulnerability, you don't need to buy a domain name to create a POC, just modify the etc/hosts file, and the domain name you want to test with you local ip address.
- Quick Tip: Hunting CORS? Go beyond payloads. In DevTools -> debugger, search for regex / RegExp and grab any domains you see. Test them as Origins — broken regex on trusted domains can = bypass. And don't forget: some may be purchasable
- CORS Misconfig.
  Weak Origin validation can be bypassed with origins like:
  domain[.]com.attacker[.]com
