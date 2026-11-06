# X 经验语料 · sqli

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已剥离。作者自述，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[SQL 注入](../by-type/sql-injection.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-sqli-1（193 条）、x-residual-sqli（26 条） · 本文 87 行

- So today I've found an SQLi in a cookie. Many people only stick to parameters. Test cookies too!
- keep in mind that SQLI may work only on HTTP, if https i was getting error, just found a sqli on a public program
- in PDF generators yu can find more than SSRF vulnerabilities, yu can also test for IDORS by changing emails or ID which can lead to reveal secrets of other users, or test for OOB SQLi & blind SQLi if the exported data come from the database.
- Sqlmap & Burp 2nd Order SQLi trick. If you need sqlmap to test a URL & check the response at another, route sqlmap through Burp & create a match/replace rule in Burp to add or modify the 'Location' header & point it to the 2nd page, sqlmap will follow redirections.
- Testing for SQLi? always remember the DBs are different. Especially concatenation & comments.
  MSSQL: abc' + 'def --
  MySQL: 'abc' || 'def' #
  Oracle: abc' || 'def' --
  * keep in mind that /*comments*/ format usually won't work inside an injection
- If you find SQL Injection in any program or product always check for the current database user role. If the user is a root and has the file write permission, we can upload a malicious file via SQL statement.
- Simply when you look for SQLi, try to change the request method from GET to POST
- When running sqlmap always proxy the traffic to burp and manually check the requests and their response time. You may find a time-based SQLi that sqlmap actually miss.
- Bug Bounty Hint
  You can try to perform Scientific Notation Bug Attack when playing with number input fields. Money amounts, currency conversion, etc.
  1.1e5 can become 110000
  Sometimes can be used for SQL injection (WAF Bypass):
  x=1' or 1.e(1) or '1'='1
- Local file inclusion discovery and exploitation tool
  https://github.com/hansmach1ne/lfimap
  Can detect LFI, RCE, SQLi and other vulns. Check documentation
- And check every Post parameter like =' (manually, burp intruder and sqlmap)
- Always use a cache buster when testing & increment it for every single request.
  I found an SQLi that is executed only when adding a cache buster :)
- If nothing works try these Blind sql payloads:
  ' AND (select 1)=1
  Guessing Table name:
  ' AND (select 1 from admin limit 0,1)=1
  ' AND (select 1 from users limit 0,1)=1
- https://medium.com/@frostnull/sql-injection-through-user-agent-44a1150f6888
  sql injection via user-agent
  - do not forget test sql injection through user-agent and referer
  - add to intruder then add payload to agent/referer
- When testing for SQLi, always remember that weak implementations often just look for common SQL injection keywords within the request, so you may be able to bypass these filters by simply encoding or escaping characters in the prohibited keywords.
- Tip: You always not get error using a ' (single quote).
- My first go to SQLi Injection Check is: ' /
  I just saw a target that didn't return anything after using just '
  but with ' /
  You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version error.
- More SQLi tips! If your input causes a server error (e.g. 500) when you inject a ' (for example) but you don't get reliable results using boolean inferential injections, try payloads which should trigger the 500 when the red condition is true.
- Sql injection leads to the access admin panel.
  Tip: Always Check Escalate bugs, not immediately report a bug!
- SQLi (Oracle DB) Found in "email=" Parameter.
  Payload:
  email=test@test.com' AND 4691=(SELECT COUNT(*) FROM ALL_USERS T1,ALL_USERS T2,ALL_USERS T3,ALL_USERS T4,ALL_USERS T5)--
- Tip: always Fuzz the User-Agent header for blind sqli.
- SQL injection thread
  It is external program, while browser I found a request, it is POST request with data JSON
  {"userName":"0a"} => response {"Exception":"No entity found for query"}
  Confirm SQLi by add ' after 0a
  {"userName":"0a'"}
- Most guides such as the OWASP cheat sheet rank prepared statements as the #1 primary mitigation for SQLi.
  But not even mitigations have their limitations.
  Consider this CVE-2024–1597 for instance. What do you think?
  https://cyberatlas.co/l/sql-injection-on-prepared-statement-cve-2024%e2%80%931597/
- Use ProxyChains to trick WAF. I was working on an SQLi and had trouble with the WAF. However, by using ProxyChains, I successfully bypassed it. Make sure you know how to configure it correctly and use good proxy lists.
- The target is a WordPress with a plugin that vulnerable to SQLi, but I got blocked by a reverse proxy WAF.
  Using WordPress PingBack for blind SSRF to reveal its IP behind the WAF, I could exploit the SQLi successfully!
- During a code review for finding vulnerabilities, only from running semgrep I got SQLi and CSRF!
  Just by using semgrep you can make real bugs.
  Now it's time for manual CR
- I started a code review on a web app using semgrep, and it found 56 findings - SQLi, SSRF and path traversal!
  But when I checked manually I found something that semgrep didn't get - file upload vuln.
  NEVER rely only on automated tools!!
- Found a potential SQLi but having a hard time extracting data from the DB due to a WAF?
  Try injecting an Out-of-Band payload for exposing the server's IP behind the WAF in order to bypass it!
  It's usually to smuggle an OOB payload
- Bug: POST REQUEST SQLI with full data dump
  Tip: test for sqli on all authenticated POST requests parameters
- Tips: Try a single ' in every param,
  If vulnerable try --sql-shell or --os-shell
- Practical Testing for: LFI, SQLi and Info disclosure
  During the test i got SQLi by Ghauri but at the end i discovered that it was a False Positive.
  And according to SQL map not vulnerable, Also WAF Detected.
- If you want to learn how to bypass WAF to exploit a Boolean-based blind SQL injection manually, this blog post is for you.
  A walkthrough of an SQLi I found on a bug bounty target behind Cloudflare's WAF
  https://blog.ryukudz.com/posts/sqli-waf-bypass/
- Don't only test the Sign Up request for SQLi, check if the app is checking email or phone or username with the backend database with extra call.
  That's sometimes an overlooked point of injection.
