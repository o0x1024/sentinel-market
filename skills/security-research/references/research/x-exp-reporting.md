# X 经验语料 · reporting

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已剥离。作者自述，未经复现验证。
已剔除：产品推广、私人喜报（受邀/证书/排名）、纯提问、转推、只有结论没有做法的战绩帖。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[报告与定级](../reporting.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 本文 114 行

- Want to speed up your jq command line? GNU's parallel is your friend:
  parallel --bar --pipepart -a input_file --group --recend '\n' "jq '<your_escaped_query>'"
  Remember to escape your query!
- when a user/admin accidentally enters a password in the username field, that password might show up in error/access logs.
- If example[.]com points to IP 1.2.3.4 and redirect to www[.]example[.]com but www[.]example[.]com doesn't point to anything (No A, AAAA, CNAME), try submitting your HTTP request to http://1.2.3.4/ with a "HOST: www[.]example[.]com" header.
- Sometimes backend doesn't verify the role on the server-side. There was a "role" parameter and in the Request, I could change it to admin from user and it made me an admin in the organization.
  Always keep an eye on "role/role-id" params — the flaw is always in the implementation, not the parameter name.
- Recognized a mulesoft console by a "MULE_ENCODING" header, seen when trying a non-existing HTTP method.
  https://docs.mulesoft.com/apikit/3.x/apikit-console-concept
- While inviting users into your account/organization, try inviting company emails and add a new field "password": "example123" (or "pass": "example123") in the request. You may end up resetting a user password.
  Company emails come from target's GitHub Repo members or hunter.io.
- Atlassian mobile app: install, sign in, uninstall, reinstall the next day — no login was required. It only asks for credentials again if you delete the phone cache.
- Always read the .js files: the "const username and password" were in md5.
- Not a lot of hunters test for second order XS-Search attacks. Use an invalid value for non-primary parameters — depending on execution order you'll be able to measure whether the primary parameter value exists or not.
- They were using a parameter in cookies: _is-admin:false. Change to _is-admin:true and you are in.
- ALWAYS go to your account page, edit something and save, then look at the request. Often you will find parameters that are not in the UI, sometimes even sensitive ones like "is_admin:0" that you can edit to change your account status.
- If you have found server-status but there is nothing in it but statistics, try adding the full parameter:
  /server-status?full
  /server-status?full&showmodulestate
- If you found a vulnerable POST parameter, try it as a GET parameter too — it might have both.
- Cookie based authentication attack mindmap:
  https://github.com/harsh-bothra/learn365/blob/main/days/day40.md
- Always check if you can increase the impact before reporting. I escalated severity by showing how I can change admin details and fetch sensitive data using console.
- Test EVERY SINGLE FIELD. This payload checks for html, html tag attribute and js contexts:
  "'><b> fjchxhhzgx
  Then look for that random text in any context you can think of.
- Always try Host Header Injection. A successful Host Header Injection may lead to many vulnerabilities if you are lucky at that time.
- Look for parameters in the response that are not in the request when saving important data like account settings. Copy the missing parameter to the request and change its value.
- Many people are stuck on domains & subs. Make sure you portscan everything. If you see rando ports, always try and open them via http & https. Plenty of admin panels out there.
  ie: http://kvothedev.com:22290 / https://kvothedev.com:22291
- When probing for Host header injection, the first step is to test what happens when you supply an arbitrary, unrecognized domain name via the Host header.
- Both DNS queries can have a different response, and unintended servers could be reached that way. Always work with the value you first validated.
- An issue I found was rejected. First response is not always true, so when you are sure about something just try to prove it — in that case I exploited it to prove it.
- If the target has an unauthenticated Data Subject Access Request (DSAR) form, request deletion of your test account, see if the request is processed without any verification.
- As a normal user I was able to access the admin panel to change the password for any user, and to read all checker notes of the admin user.
- If you land on a Linux box, delete the IT admin's home directory and disable SSH so they can't log back in.
- If an unsafe logger is used, an attacker can inject code and execute arbitrary commands even if the page being accessed is a 404 page. Always test HTTP request headers to make sure the application handles them correctly.
- Don't forget the forgotten vulnerabilities such as CRLF.
- Parameter override: if some JSON objects are in the response but not in the request, try adding them to the request — you could override properties.
  {"id":"7"} => {"id":"7", "admin":false}
  {"id":"7", "admin":true}
- Found a parameter in the json POST data of my free-trial activation request called:
  "trial_expires":1681188815
  I was able to extend my trial by making a far-future unix time (http://epochconverter.com).
- Server Side Javascript Code Injection: the server delayed the response for 30 sec — change the values, the delay changes.
- You don't need to wait for approval to check the forgotten password feature.
- Add "test.sql", "test1.sql" and "test2.sql" to your wordlist when you FUZZ. Webmasters often forget to delete test sql files containing credentials which could be the same as the admin one.
- Can invite existing users to my organization, only 3 roles (1 - Admin, 2 - Edit Only, 3 - View Only). The invite request:
  email=test@test.com&role=1
  Effect: permanently DoS any user's account.
- Got access to admin panel using default credentials test:test — never underestimate default credentials even on big companies.
- Tried an uppercase character in the email:
  Email: existing@email.COM
  Password: Randompassword
  I was then taken to the dashboard of the already-existing account.
- Always try to send the request more than once if you received 404. It may return 200 due to misconfigurations.
- If your target runs JBoss, try /admin-console with default credentials admin:admin or admin:password.
- if "origin" header doesn't work, try "x-[org name]-origin" — same for all headers. e.g x-uber-origin, x-uber-host
- tip: check response manipulation.
- Always test the approve button on the admin side.
- Always check if you can access admin functionality — never miss the PE part.
- Got 200 OK and the tag was deleted successfully. The tag id was a simple 6 digit number, so it was possible to delete any tags.
  Always try to fuzz the request methods.
- If you found a jaspersoft panel, try default admin credentials:
  jasperadmin:jasperadmin
  superuser:superuser
- Tip for testing RBAC issues: have 2 accounts for each user role — e.g. 2 managers and 2 regular users. Test each case: user->user, user->manager, manager->manager.
- Put another BXSS payload + BHTML. Both executed in the backend portal.
  Always use a BHTML payload with your BXSS payload — this way you can track your BXSS payload.
- Got an Adobe ColdFusion instance vulnerable to CVE-2023-38205, and chained it with CVE-2024-20767 — we got the UUID which plays the key role in CVE-2024-20767.
- Bug: cash poisoning leading to DoS. Tip: try to set a malformed cookie parameter.
- If changing the Host header or X-Forwarded header doesn't work, try to add another Host header with the -:space:- trick.
- Always check for program stats & response efficiency before engaging with a program.
- Other than bounty table & response efficiency stats, also consider whether the program uses the "Environmental Score" — this increases your chance of reaching higher severity.
- Found this by searching targets for the regex /res.download\(.*\)$/  (原文该处有乱码，按语义还原为 \) ) — it found a path traversal for me.
- Admin account takeover. Tip: try this password — Welcome123. Yes, it still exists.
- Look for clear text submissions in password fields — it still exists and can give a good reward.
- Switch the request to Content-Type: application/xml or text/xml, then check the response for sensitive information.
- When you find Jenkins and there are no interesting things but only some builds, definitely check the build logs. They may reveal something really interesting — here I found the SSH password for the root user and the production server IP.
- Bug: access to ADMIN DASHBOARD using admin:admin.
  Tip: always check .js files to find related service urls, then try default uname:pass combinations.
- v5/json/password?email
  {
  "email":"victm@.com",
  "email":"attacker@.com"
  }
  If the same ("email") key occurs twice in JSON, most languages/frameworks will overwrite it with the last value.
- Bug: creating support tickets in any user account.
  Tip: on the support form request try to add some email-related parameters.
- Developer checks if the user has permission to do that, but didn't check who has permission to interact with the private dashboard — only the creator has permission on it.
- High PrivEsc scenario — no email verification:
  1. Admin invite sent to test@example.com
  2. Attacker sees the invited email
  3. Creates account with it
  4. Auto joins org as Admin
- In some applications users can create roles, but sometimes the default role has the same ID across all organizations. Always try editing some of them — deleting that role can have a big impact.
- Look for faster response times — cached responses usually arrive quicker than un-cached ones. Query parameters aren't the only cache busters; you can also use headers like "Origin" or "Accept-Encoding" if they're not part of the cache key.
- Whenever you find any panel, try default credentials like admin:admin.
- Found an object that can't be deleted? Check the request when creating a new object. If there's "system": false, try changing it to true — it might become permanent because it's considered a default system. Could be a logic flaw.
- Paths and files in URLs once reflected physical files on a computer. Now most frameworks use routing where all requests go through a single file, which works out what code to run — this means just because /admin/users exists it doesn't mean that /admin exists.
- JS wordlist extraction regex (原文为首尾被截断的片段，仅有中段可用):
  [[:lower:]]*|[[:alpha:]]+-[[:alpha:]]+-|@|\.PNG$|\.net$|\.com$|\.html$|==$|\.png$|\.jpg$|\.css$|\.gif$|\.pdf$|\.js$|\.jpeg$|\.tif$|\.tiff$|\.ttf$|\.woff$|\.woff2$|\.ico$|\.svg$|\.txt$
- 35 SSTI injections in one day, all on DELETE & GET requests. Payloads used:
  {{7*7}} {{8*7}} {{8*8}} {{111-7}} {{222-3}} {{1337/1337}} {{1337+1}} {{1337+2}} {{1331+6}} {{payloda}} {{1}} {{2}}
