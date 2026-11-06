# X 经验语料 · mindset

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已剥离。作者自述，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[选题与探索](../hunting-strategy.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-methodology-1（300 条）、x-methodology-2（287 条） · 本文 88 行

- A webapp redirect you from http to https? Check for CRLF injection in it.
  For example: http://example.com/%0d%0aTest:%20Test
  Make sure to open network tab open on browser. With 301/2 check the header
- Tip: read doc or code to see how signature calc if any of user input calc with it. You could try hash length extension attack
- quotes escaping does not work if .js has Content-Type: text/html in response.
  Content-Type:text/javascript "test\" - quoted
  Content-Type:text/html "test\" - just slash before quote
- Tip for day: when you get page with error try to covert method and fuzz param you could get something juice
- they use ip filtering for the admin dashboard, but the Dev version was available and that's a good source of information. always focus on dev subdomains
- Pentest for APIs? Trying to find BOLA (IDOR) vulnerabilities? IDs in the HTTP bodies/headers tend to be more vulnerable than IDs in URLs. Try to focus on them first.
- Found a way to download arbitrary files from a web server? Shift the test from black-box to white-box.
  Download the source code of the app (DLL files: use IL-spy; Compiled Java - use Luyten). Read the code and find new issues!
- The program was over 3 months old and the xss were reported around 10+ time but without impact hence discarded, until pii stealing was demonstrated and accepted.
  Lesson: never let go of a bug where you can escalate. Especially xss.
- Start high-level. Rather than just slamming xss payloads into every input, understand the app and try to find places where the app tells you "no". From there, try to work-around it.
- If you find a secure s3 bucket which is used to store data. Don't stop.
  Check the req/response or uploaded file url for AWSAccessKeyId and than search that id on Github you may get AWSAccessKeySecret.
- Only for beginners. Try to learn the basics: How a web app works, What is http, Request/response.
  Promise you it will help u a lot. Stop going after bugs. Learn the basics. It won't take months. After that read wahh
- trying random stuff to exploit a web app functionality, later took some notes, understood the architecture of the app and user related permissions, few hours later got a critical IDOR.
  Moral - Take notes and try to understand app architecture.
- always check the Cookie value.
- Troubleshooting a mismatched HTTP code with ffuf: other fuzzers found the dir as a 401, ffuf reported 403. The cause was the User-Agent header. Always use custom options.
- Always check if website was built using an open source framework, key details of cookie construction may even be publicly documented.
- When using web exploits (public/private), pass request through a web proxy. Inspect each parameter and try to understand what the request mean. This will help you with troubleshooting and porting an exploit to a slightly different target.
- 6 months ago this was just a self-XSS.
  - Going over some notes, I thought of re-checking.
  - CSRF protection had been removed from the app
  Lesson learned: Always keep notes of issues that seem unexploitable and review them regularly.
- When you are searching for IDORs focus on download(csv,pdf,etc) endpoints. Many times I found cool IDOR's at these endpoints.
- App provides "impersonate user" feature? Check if the app changes your auth_token after impersonation; If it does - make sure the impersonation token follows best practices (https://auth0.com/docs/best-practices/token-best-practices)
  It often doesn't!
- DNS rebinding risk is easy to overlook: Dns.GetHostEntry() does a first DNS query, validates the result against the allow-list, and then WebRequest does a second DNS query.
- Understand the logic behind a vulnerability's exploitation first, then try to exploit it; don't just copy paste hackerone reports or medium articles.
- URI Hash Fragments will focus input elements (not just scroll-to). I found this on an input field where I had rXSS in the value attribute. onfocus worked but needed a user to click into it. URI Hash fragment got it to pop with no click
- Want to quickly check CSP for your target? In Chrome, open your devtools, go to Lighthouse, uncheck every category except Best practices, select Desktop and generate the report. Finished? Scroll down to Trust and Safety, there you'll find all directives!
- My usual approach with "SELECT CASE WHEN (condition) THEN TO_CHAR(1/0) ELSE NULL END" would get blocked by the WAF, so in the Oracle DB docs I found another interesting way to trigger conditional errors: 1'||DECODE(SUBSTR(user,1,1),'a',1/0)||'1
- I always prefer to avoid main domain & focus on subdomain instead. Main domain is targeted by hundreds already, So go deeper, if you go deeper its more dark there & you will see its less crowded.
  Make your own word-list using CeWL or anything
- Check possible versions (automated approach) for Web API Pentesting
  AutoRepeater Burp Extension: Add a replacement rule
  Type: Request String
  Match: v2 (higher version)
  Replace: v1 (lower version)
- Bug bounty advice: If you have a GET request where developers added referer-based CSRF protection, use an on-site Open Redirect for this URL to get a whitelisted website in the Referer header. In the case when you have a POST request, try to change a method to GET.
- Note: This SSO login option was there for around a few months and I never bothered to test for such a bug thinking it would be duplicate or 90% wouldn't work
  https://hacktus.tech/oauth-misconfiguration-leading-to-unauthorized-admin-access-for-all-org-products
- Fuzz -> found a zip file -> this zip file contains users.php file -> this users.php file contains a list of names, passwords, roles, and emails.
  Passwords were hashed, but each password was the same as the user name.
- Virtual Host Misconfig.
  Try to change the Host header value with any arbitrary value you may be redirect to localhost or the first vhost in the vhost locations file, also try it with the website IP. Ex: Enter the website IP and then change the Host header value.
- Tip: Don't just fire the payloads blindly, try to understand the application where the request is interacting with the Database and then go for it !
- New to bugbounty? If you found a bug such as information disclosure, xss, ato, sqli, rate limit, etc... on single target, try it on as much targets as you have, you will find more bugs, also you will learn much more.
- I found an easy + strange DoS: Passing mathematical operation in the JSON param resulted in delaying the server response-time to match the passed operation result and causing DoS (504 Gateway Timeout)
- Bug hunting is a numbers game. There are statistics to guarantee that you will find a XSS after x URLs scanned with y tests each.
  Scale your workflow. The only thing that matters in a consistent basis is HOW MANY URLs you test.
  http://knoxss.me
- Bug type- P1 Oauth bypass leads Portal access
  Tip- try to find 3 level domains more
- Tip : if you found bug in subdomain don't forget test endpoint in other subdomains
- Sometimes when dealing with Basic Authentication, due to improper implementation, you might be able to log in without a valid username and password. Always test for this!
- Double check "array-like" parameters(such as "param[]=value") especially for SQLi vulnerabilities. And never trust automatization, focus manual hacking. Most of them are still missed by SQLMap and all other tools.
- Always test inputs in various contexts (HTML,attributes, scripts,etc.) to find vulnerabilities. Focus on reflected/stored inputs and don't ignore JSON or API-based XSS in modern apps!
- Bug: claim "admin" username lead to access admin account
  Tip: Try register "admin" username to access admin account
- Time-Based sql injection, Tips: Use waybackurl, filter alive urls, use gf |sqli| then do mass url scan in sqlmap or ghauri
- Found an HTML Injection in a Cybersecurity Solutions Provider's Newsletter Form
  Injected <button>Click Me!</button> tag → received an official confirmation email with injected button.
  - No luck with Blind XSS
  Lesson: Always sanitize user input, even in emails.
- Always read the JavaScript, sometimes you'll find low-hanging fruits like {headers: {"X-Admin-Auth": "admin-password"}}.
- CSRF tip: If you're testing for CSRF and the request is blocked because the cookie has SameSite=Lax, try switching POST req to GET and test it again
- Real lesson isn't the sqli, it's where it lived. legacy vendor apps nobody remembers deploying are all over these IP ranges and no one tests them, everyone races to the same vpn portals.
  scan the whole range. test params on auth-gated stuff. boring wins.
- HTTP/2: The Sequel is Always Worse
  https://portswigger.net/research/http2
- XSS Tip! When you get an XSS, don't stop at an alert(1), understand the application & push further.
- crt.sh v2.0: the `crt_v2.sh` script brings performance boosts and better error handling.
  https://github.com/az7rb/crt.sh
