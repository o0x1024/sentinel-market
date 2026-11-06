# X 经验语料 · idor

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已剥离。作者自述，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[越权与对象引用](../by-type/idor-access-control.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-idor-1（67 条） · 本文 141 行

- Testing a shopping site;
  Try the XSS payload in order ID parameter once you order an item rather than just an IDOR. They forget to sanitize there coz they are meant to be just numbers ;)
- A lot of vendors fail a simple test of the discretionary access control models. A lot of them failed a simple test of S={a,b}: if you issue someone admin access to {b}, they shouldn't be able to grant perms to someone else for {a}.
- Always look for api key of admin from team members account.
  So you'll get to do every thing which admin can from team members account via api level.
- Remember: companies don't always implement security mechanisms from day one && DevOps engineers don't often deprecate old APIs.
  Leverage these facts to find shadow API endpoints that don't implement security mechanism (authorization, input filtering & rate limiting)
- If you have two accounts, admin and a user, and the admin has access to an extra endpoint like maybe /xyz then try to visit the same endpoint from the user account, and if there is no access control you end up with forced browsing issues.
- Always check your targets mobile app even if you do not understand mobile hacking, you can find juicy end points from it
- There's a object reference in the endpoint? Try bypassing security mechanism by using path traversal
- Simplest Privilege Escalation - Make Sure you examine cookies thoroughly.
  I have seen & done some Priv Escalations and IDORs with Cookies before as well.
- If you have an IDOR but cant find other uuids to exploit it, try inviting/emailing/granting privilege/looking at users profiles. You can find a ton of api endpoints that respond with uuids just by filtering manually through each request/response in http history on burp.
- You can use the Firefox dev tools to test for IDOR by right clicking on a request in the console and click "edit and resend". Make sure you replace the headers
- Many times even if you can't upgrade the role of a low-level user, you can try creating a new user with upgraded roles. Auth checks can be missing anywhere. Keep on looking out for parameters like "role", "roleid", "privileges", "level" etc, and play with them.
- While checking for IDOR, if the response is false (not 200 OK) don't forget to double-check on other side of account.
- How i was able to takeover any account on a USA DoD website? Blog post about a nice IDOR, with takeaways and tips at the end.
  https://naglinagli.github.io/DoD_IDOR/
- If you want to find out the name of underlying Amazon S3 bucket from a server then put %C0 at the end of the url
  The bucket name will be disclosed in the <URI>/bucket_name/...</URI> XML element.
  ->check the bucket for access control misconfiguration (P2/P3 bug)
- TIP- Always go through the JS files, it can give you some interesting endpoints with no security. Manual hunting is best.
- Authorize did not work when testing BACs, so it went manual: copying and pasting over 2000 URLs over 3 hours paid off. Bug bounties is for a big part to just test every single parameter and URL.
  I was also editing cookies to test POST req
- I've created a mindmap consisting of various techniques to find IDOR vulnerabilities.
  Detailed IDOR notes: http://notes.mufaddal.info/web/idor
- Found horizontal privilege escalation
  Stick with the target for long time, you will surely identify weird behavior.
  Business logic bypasses: Always check if validation is on server side or just client side.
- How to test for IDOR vulnerability?
  1-Register two accounts for each role the application supports. This will help you test lateral access control measures and privilege escalation.
- try a second-order IDOR, or even a third-order or multi-level IDOR ;) You probably need a good B2B program for this that allows multiple accounts.
- Tip-Don't test IDOR manually, try to semi-automate using authorize
  https://blog.yeswehack.com/yeswerhackers/pimpmyburp-pwnfox-autorize-find-idor/
  https://medium.com/cyberverse/automating-burp-to-find-idors-2b3dbe9fa0b8
  https://thexssrat.medium.com/idors-what-are-they-and-how-do-you-test-for-them-885c9df4af36
- Here I was able to Remove Owners from their own Group using IDOR
  When Deleting user, there was a alphanumeric 20 digit ID in request and changing that to of victim will allow you to delete victim.
- IDOR in "external status check" API leaks data about any status check on the instance
- Tip: Developers reuse code.
  Suppose you found Broken Access Control in /x endpoint, don't forget to try same thing on /y endpoint :)
- Visit the web app normally and keep logging the requests in burp, after u are done to find IDOR u can:
  - collect all parameters from request and response (it's imp to discover and try in other http requests)
  - try those across various endpoints
- Always revisit your old reports! Chances are you can bypass the fix!
  @marcos_iaf used this trick to bypass the fixes on an IDOR 3 times!
- Sometimes it's worth to check if Authorization Bearer are properly validated with different HTTP verbs.
  1. Completely Remove Authorization bearer from request with different verbs like : DELETE, PUT, GET and more.
- Key takeaways:
  - If you find an IDOR regarding UUIDs, always look for ways to leak/gather it
  - Click every button on every feature
  - Don't overlook obvious attack scenarios, you never know how secure your target is until you test it
- If you have found an IDOR in GRAPHQL which disclose info, Try to add More fields in the query and see if it responds with the info in response to increase the impact. In my case I added the email field Manually in the query to get victims email to increase impact
- When testing for IDOR on a state-changing request (PUT/DELETE/PATCH/POST), receiving 403 Forbidden Access in response does not necessarily mean the endpoint is not vulnerable. Always check the UI as well.
- Using the same user have few role (Creator)
  I get the UUID for user 2 (creator role)
  I was able to change my role from creator to account manager (Admin)
  Privilege escalated
- Vertical Privilege Escalation: how I was able to take over an admin's account from a user account via response manipulation.
  https://link.medium.com/PT4njej8Gvb
- For bypassing my previous report: Broken access control leads to unauthorized Actions
  Tip : try to bypass BAC reports, your own, or even the reports of others, there are many ways to beat the fix
- Critical IDOR (P1) now fixed.
  I found form to request meeting, the form include sensitive data.
  The data saved as PDF files as the following endpoint:
  "/node/<IDOR>/printable/pdf"
  Which is <IDOR> simple digit refers to request id.
- tipe: try to understand the site how it works through analyzing the features and internal functions site via view-source.
  Note: This must shoud be manual without tools to get the treasure
- Just found IDOR again via /node/ in Drupal instance
  When you try IDOR via /node/ instead of doing only /node/1,2,3 try /node/001, /node/011
- So in js files i user ctrl+F to search about "user_role" i found another value that's called "admin_role", so i use match and replace to replace value's, boom privilege my account to admin account with full control
- How did I test the IDOR vulnerability that leads to all user Data leakage?
  1: Change the /me endpoint to /users.
  2. Change the GET method to the POST method.
  3. Add the Content-Type: application/json header.
  4. Add this payload to the HTTP request body.
  {"ids":["1"]}
- bugbountytip: if a website does not verify email, try signing up with <whatev>@domain.com (the company email). Sometimes this gives you higher privilege like deleting/viewing any other user's profiles etc.
- Test especially functionalities which are hidden and seldom used!
  Just achieved a complete Name + NRIC + eMail leak of the entire user base via IDOR.
- Privilege escalation to compromise Confidentiality!
  While observing account management features, check whether revised permissions of low privileged users continue to access high privileged services.
- Lately, I've come across numerous access control issues. It's crucial to thoroughly check every request. Although most endpoints of an application were protected, I discovered one that remained vulnerable.
- Do not post Open redirect as Open redirect, try to chain it with other vuln.
  Do not post XSS as XSS, try to chain it with ATO or SSRF.
  Do not post IDOR as IDOR. Try increase impact by leaking PII or ATO.
- tip : when i test idor don't try test in POST request because always or sometimes get 403, then try change method request from POST to GET, Sometimes it works like this.
- An IDOR was found and bypassed 3 times. Be sure to revisit previous reports to try bypassing fixes!
  Interestingly, the last bypass just requires being logged in.
- How I found it:
  1. The special role don't have permissions to view or access the transactions.
  2. While I test different endpoint I found request allow me to download the transactions.
  3. I try this request with unauthorized user and it worked.
- Try checking a checkbox from a high privilege account and see if a low privilege account can replicate that request.
- For actions that you can only perform once like email verification and closing account, complete the process with one account, observe, then create another account to bypass using Response manipulation. Also check for referral header access controls.
- Unauthenticated IDOR leaking the User PII of one specific group, as a chain finding: 4 different endpoints chained to get the PII.
- While testing a shopping site I noticed a special offer that was intended for only one item, and by using another item's ID in the request I got a juicy discount on it.
- User A has access with TASKs, User B has no access with TASKs. Still, User B can delete any Task!
  IDOR allows this attack!
  GET /org/tasks/DeleteTask/3584041
  Still Always play with numbers.
- If privilege escalation fails (401/403) when inviting an Owner/Admin, try inviting a Manager. Low-priv users may still able to invite Managers.
- How i was able to create and forge invoices via A Broken Access Control issue at Payment processing API
  https://medium.com/@wadgamaraldeen/broken-access-control-in-a-payment-platform-api-how-i-was-able-to-create-and-forge-invoices-292c26ee63fb
- Bug: Member Can Change Super Admin
  Impact: Complete Takeover of the Organization. Delete the main Super Admin!
  Bug Type: Broken Access Control
  Tip: Test areas that look secure!
- Many bug hunters ignore blank 401 Unauthorized pages.
  If you ever land on a 401 Unauthorized page, always check the response, you might find something big.
- While testing project permissions, I discovered a Business Logic vulnerability that allows a user with Editor privileges to delete the project Owner by manipulating a GraphQL request — even though the UI blocks this action.
  https://medium.com/@B14ck/business-logic-error-deleting-the-project-owner-by-manipulating-a-graphql-request-7e3bb5883d04
- Quick Tip:
  When testing Broken Access Control, and you see WebSocket requests
  try playing with the response using Match & Replace.
  WebSockets are hard, but this trick can show hidden access issues.
- Privilege Escalation in Wordpress acf-extended Plugin
  tip: always check the post method endpoint and analyse which parameters are user control then play with them
- BAC on multi-tenant apps: joining any organization with any role, i.e. any tenant's ORG.
  This is a BIG NO for any Applications that handle multi-tenants' data!
  Tip: Always think what could be problematic for the target you are trying to HACK
- IDOR may fail not because it doesn't exist but due to a different ID format.
  My account ID started with 14, while the victim's started with 15. After creating accounts to match the 15 prefix, I was able to access another user's data.
- How a Missing GraphQL Authorization Check Exposed a HealthTech Unicorn's Medical Records
  https://medium.com/@21bec131/how-a-missing-graphql-authorization-check-exposed-a-healthtech-unicorns-medical-records-6b0074e3b016
- One of my recent Critical findings was an IDOR on Contact management endpoint.
  Steps:
  1- Create two accounts, Attacker and Victim
  2- In both accounts, create an Event and add at least one contact via: https://test.com/dash/{event_id}/promote/contact/id
- Bypassing Access Controls: How I Found an Unauthenticated Payment Processing Endpoint (CVSS 8.5)
  https://medium.com/@mgsa112233/bypassing-access-controls-how-i-found-an-unauthenticated-payment-processing-endpoint-cvss-8-5-02d972bcd57c
