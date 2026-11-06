# X 语料 · 回收的testcase清单

来源：X 公开贴子。本轮抽检发现这些贴子被误判为「非技术」
实际含可执行清单（多条 dork 语法 / 多个请求头 / 多步 recon / 多工具链）。
回收后归入技术语料。仅纯文本，图片与外部媒体已被剥离。
作者自述，未经复现验证。
已剔除：只有目录没有步骤的目录帖（正文以「More..」结尾）、跨号重复的战绩、
与 x-rce-1 / x-idor-1 完全重复的条目。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：本类无专属篇，按 [检测入口](../vuln-detection.md) 选择 · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-recovered-dork（24 条） · 本文 243 行

- Open Redirects can be used to:
  - Obtain XSS
  - Steal OAUTH tokens
  - Gain SSRF
  - Escalate to RCE
  - Used in chain attacks
  - Use to bypass same-origin filters
- Hands-on Broken Authentication and Session Management (WebGoat + JuiceShop):
  1. Enumerate JS files
  2. Fuzz creds using OWASP ZAP
  3. Hijack password reset link
  4. Abuse Security Questions
- Account takeover methods seen in the wild:
  1. Possible BruteForce SMS-code
  2. IDOR
  3. Improper access control
  4. CSRF on change phone
  5. Oauth hijacking
  6. Reset Password
  https://blog.deteact.com/common-flaws-of-sms-auth/
- Uploaded php shell but the path wasn't displayed.
  Searched dirsearch result, found /uploads/ — all uploaded files were being stored here.
- Recon to P1
  - Aquatone: Found "http://sub.target.com" (Intranet Service)
  - Dirsearch: Found Admin Directory
  - Further Dirsearch: Found registration endpoint
  - Client Side Bypass: Registered normal gmail account
  - Logged in w/o verification to intranet service
- Internal portal access on a big company:
  1. subdomain --> amass
  2. http://subdomain.domain.com --> ffuf
  3. all dir,file (403) but /*/*/docs not
  4. Found api endpoint to register
  5. Registered myself to the internal portal
- Reference writeups:
  1) Unrestricted File Upload — https://hackerone.com/reports/683024
  2) Sensitive Info Leaking Through DoD Owned Website — https://hackerone.com/reports/806213
  3) PII Leak — https://hackerone.com/reports/808338
  4) Open Redirect Filters — https://m0z.co/Open-Redirect-Filters/
- Bypass rate limit to account takeover:
  1. Server limited brute force OTP by ip
  2. Install & config ip rotate (burp suite extender)
  3. Send password reset code
  4. Brute force OTP with intruder
  5. Change password
- 1. Logged into the site
  2. Explored functions
  3. Used edit-this-cookie extension and copied the cookie
  4. Logged out
  5. After 2 hours, pasted the copied cookie — successful login
- Custom Nuclei templates for:
  - detecting SAP web services navigator page
  - exposed network cameras
  - detecting goAnywhere web client login panel
  - detecting Virtual EMS login panel
- RCE on an RD program:
  1. Found a subdomain http://sub.target.com with indexing enabled
  2. Found a directory called upload
  3. Got a panel to upload files without authentication
  4. Tried uploading a shell
- Bug: 2fa Bypass through password reset
  1) Create account
  2) Enable 2fa on login
  3) Go to forgot password
  4) Set password
  5) Directly login without 2fa code
- Short SQLI Story:
  1. <subdomain>.<redacted>.com -404
  2. Directory bruteforce - /gallery
  3. <subdomain>.<redacted>.com/gallery - redirected me to login page: <subdomain>.<redacted>.com/gallery/#!account
  4. Login request vulnerable to SQL injection
- Account takeover via case-sensitivity:
  1. Created an account: abcd@gmail.com, and paid for subscription
  2. Accidentally tried to login with "Abcd@gmail.com" and it was rejected
  3. Signed up again, username: "Abcd@gmail.com"
  4. Successfully logged in, acc verified and fully paid
- Brutelogic XSS cheat sheet (Basics / Advanced / Bypass / Exploiting / Extra / Brutal):
  https://brutelogic.com.br/blog/wp-content/uploads/2020/02/XSS-Cheat-Sheet-2020-Edition-Sample.pdf
- 2FA bypass checklist:
  9. Password Reset Disable 2FA
  10. Backup Code Abuse
  11. Clickjacking on 2FA Disabling Page
  12. Bypass 2FA with null or 000000
  13. Bypassing OTP in registration forms by repeating the form submission multiple times using repeater
- 1. Google dork: site:http://target.com intext:http://s3.amazonaws.com
  2. Found s3 bucket used for showing images on one of its websites
  3. Bucket was not registered on amazonaws
  4. Took over the bucket and hosted PoC image
- API with JWT in AuthZ header?
  1. Copy JWT b64 value
  2. Add new cookies — "auth_token", "jwt_token", "jwt", paste b64 as value
  3. Duplicate previous API call, add cookies, remove header
  4. Works? AuthN supports cookies
  5. API is 90% vulnerable to CSRF
- Open Redirect topics: bypass, reflected XSS via open redirect, common injection parameters, open redirect uploading svg files.
  https://book.hacktricks.xyz/pentesting-web/open-redirect
- Two-account method:
  - Register for 2 accounts
  - Start 2 games/ sessions, 1 in incognito browser
  - Have burp suite active
  - Replace every UserID with other users' id
  - Replace every objectID with other users' objects
  - Investigate every parameter, especially account settings params
- Detailed information about API Key / OAuth token — description, example request (curl and raw), response, regex, example key (~550 entries):
  https://github.com/daffainfo/all-about-apikey
- CVE-2021-1675 - PrintNightmare LPE (PowerShell)
  Import-Module .\cve-2021-1675.ps1
  Invoke-Nightmare -DriverName "HP" -NewUser "0day" -NewPassword "LulSpool"
  Repo: https://github.com/calebstewart/CVE-2021-1675
- Shodan dork targets worth checking:
  Containers, GitLab, MongoDB, Elastic, FTP, Memcached, DNS Recursion, Kibana,
  Prometheus, Default Passwords, Protected Objects, Moodle RXSS, Spring Boot,
  Django, Jira, Ruby, Secret Key
- Basic recon:
  - Shodan dork: ssl:http://target.com 200 ok
  - Got a few login pages
  - Github dork: "http://target.com" "password"
  - Default security mechanism with Gmail login, tried on other login pages -> internal admin access
- Information disclosure leading to sensitive credentials:
  1. navigate url: watch[.]site[.]com
  2. Go to View source page
  3. search 'username'
  4. We can see url, password and username of site[.]com
- 1) ssl:"Target"
  2) Found one public ec2 instance named "Company internal login"
  3) Login method - Okta, Auth Credentials
  4) tried admin:admin - login successful
  5) Load balancer dashboard access
- Information Disclosure Keywords:
  access, token, .json, .js, api, config, admin, dashboard, oauth, uri, url, jwt, ey, auth, csrf, key, env
- How to Burp Good — useful things in Burp Suite:
  Password brute forcing, password spraying, handling CSRF tokens, re-validating sessions, finding hidden pages, SSL stripping.
- Common Android application vulnerabilities:
  1. Android exported activities
  2. Hard-coded tokens & passwords
  3. Sensitive data in Sqlite3
  4. Security bypass using an older version
  5. API session tokens do not expire
- Broken authentication, Login with Google:
  1. Go to login page
  2. Sign in with Google
  3. Open Burpsuite and get the request
  4. Decode the signature with base64
  5. Login with the encoded value and change the email in the request
- docker pull bararchy/sectester_scanner
  sign up for http://app.neuralegion.com/signup and make an api key
  docker run -i bararchy/sectester_scanner -t TOKEN -u https://brokencrystals.com
- RCE via chat/support file upload:
  1. Find chat client
  2. Open a chat session
  3. Upload or bypass the upload file to share content with the support team
  4. Open the file
- Gorilla — wordlist tool. Build wordlists based on patterns, common password/username formats, words from scraping a web page, and extend existing wordlists using mutations.
- CrackQL — GraphQL password brute-force and fuzzing utility.
  Use cases: defense evasion, password spraying brute-forcing, 2FA OTP bypass, user account enumeration, IDOR, general fuzzing.
- Online constructor of google dorks for sensitive website pages: login pages, database files, sql error, open redirect and many others.
  https://dorks.faisalahmed.me
- Master OAuth 2.0 resources:
  1. https://owasp.org/www-pdf-archive/20151215-Top_X_OAuth_2_Hacks-asanso.pdf
  2. https://medium.com/@lokeshdlk77/stealing-facebook-mailchimp-application-oauth-2-0-access-token-3af51f89f5b0
  3. https://medium.com/a-bugz-life/the-wondeful-world-of-oauth-bug-bounty-edition-af3073b354c1
  4. https://gauravnarwani.com/misconfigured-oauth-to-account-takeover/
  5. https://medium.com/@Jacofficenkv22/oauth-misconfiguration-lead-to-complete-account-takeover-c8e4e89a96a
- IDOR to ATO:
  - register on website
  - in account settings we have a parameter called ID
  - register a second account
  - change email and id for the second account
  - email changed successfully
  - reset password then takeover
- 1. Found third-level domain
  2. Directory brute force
  3. Found "backup_1" directory > obtained archive for further analysis
  4. Dug up AWS Access Keys
  5. AWSCLI to take the S3 bucket over
  6. Able to upload/download anything
- Carnage — File Upload (Extension Bypass): tries various techniques to bypass file upload restrictions.
  https://github.com/sAjibuu/upload_bypass
- Nuclei template that analyses js files: extract tokens, endpoints, URLs, variable names (all in one).
  https://github.com/ayadim/Nuclei-bug-hunter/blob/main/file/web/js/js-analyse.yaml
- IDOR + ATO via reset password:
  - a logged in area
  - intercept password change request
  - change username to another
  - if you have successfully changed user pass, you have an IDOR + ATO
  Impact: Critical
- Hunting for phpmyadmin logins:
  nuclei -l live-subs.txt -t nuclei-templates/http/exposed-panels/phpmyadmin-panel.yaml
  Then: test default creds (root & password,..etc), fuzzing, test SQLi, response manipulation.
- Go on any website you want
  - search for this path /login
  - in Username field type: ' OR 1337=1337 LIMIT 65535 #
  - If you got blocked by WAF add in url ?bypass=true
  - BLIND SQLI WAF BYPASS
- Find a Business Logic Bug:
  1. Register a new account (note the username)
  2. Verify & activate it
  3. Delete the account
  4. Try registering again with the same username
  If blocked, it's a business logic bug — deleted usernames shouldn't be reserved.
- High-value recon targets:
  • Forgot password flows → logic bugs
  • User profile settings → IDORs
  • File upload points → RCE potential
  • Internal panels → hidden features
  • Third-party integrations → security gaps
- XSS tip: don't stop at alert(1). Real XSS impact comes from session takeover, CSRF token theft, account actions via JS, DOM persistence (stored in localStorage). If it's not exploitable, it's not a bug.
- Referer leak -> sensitive token exposure
  1. Application included auth token in URL
  2. User clicked external link from that page
  3. Browser sent full URL in Referer header
  4. External site received the token
- Insecure password policy -> weak account security
  1. Tried creating account with password 123456
  2. Application accepted weak password
  3. No complexity or strength checks enforced
  4. Accounts easily guessable via brute force
- Email enumeration -> user discovery
  1. Tested login/reset endpoint
  2. Used different email inputs
  3. Response changed for valid vs invalid users
  4. Identified registered emails
- HTML injection -> phishing attack
  1. Found input field rendering raw HTML
  2. Injected fake login form HTML
  3. Page displayed attacker-controlled form
  4. Users entered credentials into fake form
- XXE -> internal file disclosure
  1. Found XML upload/parse feature
  2. Injected external entity payload
  3. Server processed malicious XML
  4. Retrieved /etc/passwd content
