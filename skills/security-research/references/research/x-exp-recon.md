# X 经验语料 · recon

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已被剥离。作者自述，未经复现验证。

原文件为逐条流水，同一条经验被不同账号反复转贴（最多的转贴 4 次），此处合并。
纯工具版本公告、纯战绩播报、无答复的提问已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[资产发现](../asset-discovery.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-recon-1（253 条）、x-recovered-recon（83 条）、x-residual-recon（43 条） · 本文 267 行

## 起手：先看固定入口

- 跑几十个工具之前，先手工看这几个文件：
  `robots.txt`
  `sitemap.xml`
  `security.txt`
  `.git/`
  `.env`
  Swagger / API 文档
  备份文件
- 侦察阶段先读 CSP 响应头——它能直接告出目标用了哪些域名。
- 不要漏掉暴露的 API 文档（Swagger 等）。设计和鉴权缺陷常在这里。
- Wayback 是 OSINT 的必需工具。用时间机器能翻出 `/api/`、JSON 之类历史端点。
- 直接用 Wayback 的 CDX API，比 `waybackurls` 强，因为过滤条件掌握在自己手里：
  `http://web.archive.org/cdx/search/cdx?url=*.target.com&output=text&fl=original&collapse=urlkey`
  加 `&filter=statuscode:200` 只保留正常响应的页面。
- WayBackURL 里按关键词捞：
  `password, secret, token, access, pwd, api, .json, =http, =%2F, =/, email=, @, ey, .txt, aws, admin, .js, config, dashboard, oauth`
  同一批关键词也要在源码里再搜一遍。
- 跑完 waybackurls / katana 之后，按扩展名捞敏感文件：
  `grep "\.txt"`
  `\.log`、`\.cache`、`\.secret`、`\.db`、`\.backup`、`\.bkp`
  `\.yml`、`\.json`、`\.gz`、`\.rar`、`\.zip`、`\.config`、`\.bin`
  @adrielsec 的版本多了 `\.bin` 与 `\.bkp`，可以合并成一条 grep。
## 子域枚举
- 核心结论只有一句：枚举的成败取决于**数据源的数量**，不是工具的速度。
  尽量多加源，并用脚本把流程串起来。
- 跑工具时务必显式指定 resolvers 文件，光这一步能差出 10–30% 的结果。
  `https://github.com/trickest/resolvers/blob/main/resolvers.txt`
- 两个立竿见影的增量：
  1. 给 subfinder 配齐 API key：182 → 322
  2. 对第一轮结果再跑一轮枚举：
  ```
  subfinder -dL sub | tee subs
  subfinder -dL subs | tee subss
  ```
  322 → 12690
- 多源的必要性实例：有漏洞的那个子域在 SecurityTrails、crt.sh、Amass、Subfinder 里都没有，
  只在 VirusTotal 上有。
- 不要用 httpx 过滤"存活子域"。httpx 只认 Web 服务，会丢掉其它端口上开着的服务。
  先用解析器筛，再谈存活。
- 层级越高的子域通常越脆弱。按层级从子域列表里提取：
  例如 `sub.target.com` 这种二级的优先看。
- 看到 `*.prod.target.com`，就按命名规律去找它的兄弟：
  `stg`、`lab`、`dev`、`stage`、`staging`
- 解析成功但不响应的子域一定要扫端口。
  先查 Archive，常常能更快发现正确的端口。
- 404 的子域不要直接放弃：
  在这个子域上跑 dirsearch / ffuf，常能翻出 200 的目录；
  或者把其它子域上已知存在的路径搬过来试。
- 另一个域名源：`https://subdomainfinder.c99.nl`，curl 拿结果再喂 httpx。
- 优先找 scope 里写着 `*.website.com` 的项目，这类范围最能发挥子域枚举。
- 除了纵向枚举，还有横向域名关联：不少 scope 允许打子公司与被收购公司，
  这类目标需要换手法（品牌名、WHOIS、ASN 反查）。
- 两例说明同一件事：子域本身会被跳转到内部鉴权页，
  但用 dork 直接命中其下某个端点，就能绕过那层跳转拿到信息泄露。
- 非英文字符的域名先转 punycode 再送 DNS，否则查不到。
## 源站 IP 与 WAF 绕过
- 被 Akamai / Cloudflare 拦住时，先找源站：
  用 Shodan 的 `http://Ssl.cert.subject.CN:"sub.domain" 200`，
  或 censys、securitytrails 查历史解析，绕开 WAF 直接打。
- 同一思路的清单版：查 SPF 记录、TXT 记录；securitytrails 的历史数据里常留着旧 IP。
- 用 censys 找到隐藏 IP 后，浏览器里直接访问 IP，WAF 就不会拦这个请求。
- 更系统的找源站法：
  1. 找一个没有 WAF 的子域
  2. 取它的 ASN
  3. 在 `bgp.he.net` 上查这个 ASN
  4. 拿到整个 IP 段，逐个验证存活
- 报告说"已修复"但只是把站点下线时：去 Shodan 搜目标名找到 IP，
  把载荷直接打到 IP 上，常常仍然有效。
- 有些开发者把 ffuf / nuclei 的 User-Agent 写进了缓存规则，导致请求全被拦。
  永远加 `--random-agent`。
- 403 绕过实例：只有 `Forward` 头的三个参数同时用上才通了，
  其它头都无效。通了之后能看到整个子域内容，包括一个内部 API。
- 403 的另一个解法：URL 末尾加一个反斜杠。
  子域根目录加 `\` 得到空白索引页，文件加 `\` 直接拿到内容。
## 隐藏参数与端点发现
- 参数发现要多工具对比：Burp 与 Arjun 都做过、每个参数都做过清洗，
  过几天换 Gospider 又翻出了新的可反射参数。
- Param Miner 可以自动枚举隐藏请求头并检查响应回显；
  拿到回显后再做 Web Cache Poisoning，把反射变成存储型。
- 容易被忘的一类：请求头本身也是参数。另外**永远换着试不同的 Content-Type**。
- 内容发现的一个高命中技巧：把子域名本身当作路径。
  `http://kvothe.target.com` → 试 `http://kvothe.target.com/kvothe/`
  然后在这个路径下做内容发现。
- 管理端点常常藏在子域名的缩写里：
  子域 `SubJoe.redacted.com` → 端点 `/sj-admin`（取子域第 1、2 个字母）。
- 从 wayback 里的 `buildManifest.js` 读敏感路径；遇到 403 就绕或爆破目录。
- ffuf 找 `.php` → arjun 找参数 → 命中反射型 XSS。
  并在报告前先想清楚怎么提升影响。
- `https://urlscan.io/search/#yourtarget.com` 能翻出目标的一个"肥"路径，
  而这个路径在任何常规来源里都看不到。
- gau 拉历史 URL → curl 验证存活 → 挑出带跳转参数的 URL，批量筛开放重定向。
- 开放重定向的实际流程（一天找到 5 个）：
  wayback URL → 过滤 → 把参数值替换成跳转载荷 → 发请求看是否跳转。
## JS 文件是主要情报源
- 从 `*.js` 里抽两样东西：子域名、端点。
- JS 里翻到 access token → 用枚举 + Wayback + 默认路由把 API 端点摸全
  → 用这个 token 读写其他用户数据。
- 401 子域 → wayback 找到 JS → 人工测到死路
  → 把 JS 交给模型，找出一个**被注释掉**的端点 → 硬试
  → 500 报错里直接吐出完整 SQL、库名、驱动名。
- 同一资产上同时报出 LFI、存储/盲 XSS、纵向越权，
  入口都是 JS 文件里泄露的路径与 API 调用。
- 报告被标 resolved 后要复验：那个 `.js` 已经 404，
  但去 urlscan.io 查该主机的历史 `.js`，同一个 API key 还在里面——
  他们只是把文件设成 404，没删 key。
- cookie 头的值也要看，以及各子域页面的源码里常埋着密钥。
- GitHub 上按配置关键字捞：
  `"http://Target.com" language:yml`
  `"Target.com" language:yml "_key"`
  `"Target.com" language:yml "admin"`
  `"Target.com" language:yml "root"`
  `"Target.com" language:yml "host"`
- `org:company extension:csv admin` —— CSV 里常有 cc、cvv、邮箱、手机号。
- 找公开 S3 桶别用 s3recon / bucket finder，直接用 ffuf/wfuzz 打，
  速度从每秒 5–10 次提到接近 300 次，只看状态码 200。
- 一条自动化链：gau → dpfilter 筛出疑似 S3 桶 → 提取桶名 → 逐个测可写。
## 云资产与 S3
- 按常见后缀批量探公开桶：
  ```
  for name in {cdn,static,dev,backup,media}; do
    aws s3 ls s3://target-$name --no-sign-request
  done
  ```
- 接管 AWS 未认领桶时，**必须注册到正确的 region**，
  否则要等一小时才能重新认领，桶可能在此期间被别人抢走。
- urlscan 用 `domain-*` 这种 dork 找第三方集成；
  CDN 截图里常直接暴露 S3 桶名 → 可接管。
- `.git` 目录与 `/.aws/credentials` 里都能翻到 AWS 凭据。
  把 `/.aws/credentials` 和 `/.aws/config` 加进字典。
- 拿到临时会话凭据后，配进 AWS CLI 实际操作，
  再用 ScoutSuite 枚举权限、找出可访问的资源与错误配置。
- 枚举 S3 桶的方法清单：Google/GitHub dork、爆破、证书透明日志、JS、CNAME、目录列举。
- 多个 S3 桶接管 + 桶内库文件泄露。
  看源码，并装 Burp 的 assets discovery 插件。
## 子域接管
- 手工流程：确认云厂商 → 查是否 NXDOMAIN → 看 CNAME 指向 → 完成接管。
- 未认领域名的接管（P2）：
  `sub.target.com` CNAME 到 `unclaimeddomain.com`，
  去域名注册商查这个域名是否可注册（Subjack 也会查这个），
  能买就直接买下来挂 PoC。
- 想提高接管报告的影响，就去给接管的域申一张 SSL 证书（Let's Encrypt 之类）。
  除少数大厂外都能申请下来。
- 接管后的影响要看云厂商支持什么，可展示：
  存储型 XSS、账号接管、CSRF、认证绕过。
- 过期 ZenDesk 应用接管的两个后续：
  1. 在 ZenDesk 后台加 SSL 证书，就能把自己的应用挂到该域名上
  2. 改 ZenDesk 主题即可拿到 XSS
- 注意 AAAA 记录：如果你的 VPS 不支持 IPv6，
  指向 IPv6 的接管点会被漏掉。
- 二阶接管：开发工具 Network 面板里那些 404 的资源请求，
  说明应用在从不存在的域名加载资源 → 该域名可被接管。
  这类漏洞稀少但值得加进框架里自动跑。
- 即使通过 DNS 校验强制了 SSL，也要测 80 端口的 HTTP 回退——
  有些服务仍然允许在 80 上完成接管。
- 监控通知里出现 `CODE: 502` 或 `ERROR: The request could not be satisfied`，
  说明接管仍然可能。
- 失效链接劫持（BLH）危险度接近子域接管，可导致：
  存储型 XSS、内容劫持、信息泄露、钓鱼。
  Burp 有对应插件。
## 常见产品与 CVE 的快速命中
- Shodan 找 Spring Boot：
  `org:YOUR_TARGET http.favicon.hash:116323821`
  然后看 actuator：`/env` 可读大概率能 RCE，`/heapdump` 可读常能翻出私钥与 token。
- `org:"xx" 200 http.favicon.hash:1428702434` 找 iDRAC 服务器，
  默认口令 `root:calvin`。
- `Ssl:"target Inc." 200` + 看 title 找 Palo Alto，
  路径 `/global-protect/login.esp`，版本 8.1.15 有洞。
- 发现 IBM Maximo Asset Management 就测 XXE（CVE-2020-4463）：
  `python3 CVE-2020-4463.py --url http://target/ -x`（`-x` 走 XXE，`-d` 走数据泄露）
- Shodan 找到 IBM HTTP Server 8.5.5 → 查 CVE → CVE-2020-4463 XXE 与 PII 泄露
  → GitHub 找 exp → 打；同一批服务器都在 Shodan 上，可批量测。
- Zimbra CVE-2022-37042 有 nuclei 模板，可无损批量检测。
- GitLab 子域：从页面源码里读 revision ID，比对是否受 CVE-2023-7028（账号接管）影响。
- CVE-2024-46990（Directus）：厂商只过滤了 `127.0.0.1` 和 `localhost`，
  用整个 `127.0.0.0/8` 段就绕过了。
  @njcve_ · 2023-03-19 早前也给过同一招：`127.0.1.2` 直接拿分。
- 鉴权流程或 OTP 走 GraphQL 时考虑批量查询攻击：
  密码重置是 4 位 pin 的话，一次查询就能试完全部排列。
- OData `$filter` 注入可导致全量用户枚举；
  再加一个代理头的技巧可以确认受限 SSRF。
- SSRF 的第一条载荷永远是 Collaborator：先确认 DNS 命中，再去追元数据。
- LeakIX 可直接按插件查：请求 `+target_name +plugin:"GitConfigHttpPlugin"`。
- 遇到 Basic Auth 页面的四件事：默认口令、测注入、动词篡改绕认证、dirsearch。
- `ssl:"target[.]com" http.title:"index of /"` 找到 8888 端口的目录页，
  默认口令 `admin2:123456` 进后台。先试最简单的东西。
- 后台面板常是隐藏的：主域上跑 `/admin`、`/dashboard`、`/cms` 等常见路径，
  再试默认口令和面板本身的弱点。
- 某些站点的 `fetch` 被 Cloudflare 拦但 `XMLHttpRequest` 能过——
  容易被忽略的差异。
## 敏感文件与泄露数据
- 在 GitHub 上找到口令但程序不接受第三方数据来源时，
  就把这个口令拿到目标站上搜：Google dork `"http://target.com" <那个口令>`。
- Trufflehog 捞 AWS API key，再用 enumerate-iam 验证权限。
- wayback 里翻到 phpMyAdmin 面板的截图，图上带着账号密码，直接登录拿分。
- 字典里加 `.github/workflows/push.yml`——CI 配置里常有数据库信息。
- `notepad.link` 之类公开记事本里有大量明文服务器密码和付费服务 API key。
- 用 Dirsearch 时带上自定义头（Cookie、JWT 等），否则会漏掉鉴权后的路径。
- 暴露的 Swagger 可导致未授权读写，甚至删库。
- GAU 里翻到缺少过期时间的缓存 token → 未授权访问多个用户账号。
- "会话不过期"这类问题在相关资产上依然存在，记得把所有关联资产都过一遍。
- Tor 隐藏服务侧可试的子域、端口、路径：
  子域前缀 `test.`
  端口 `2082, 2083, 80, 8080, 443`
  路径 `/cpanel`、`/kpanel`、`/zpanel`
  以及 `http://` 与 `https://` 互换
## 判断与心态
- 简单漏洞也可能有严重影响。报 IDOR / XSS / 信息泄露前先理解目标行业：
  医疗行业对"病人信息泄露"的重视程度远高于漏洞本身的利用难度。
- 怎么"扫一眼"就知道该测哪里：这站看着像上个世纪做的吗？
  那就去测登录、从 JS 里抠路径、查它是不是买的商用系统、然后做内容发现。
- 读别人的 writeup，然后把同一个 bug 拿到其它资产上再试一遍。
  通配符范围里，把同一个洞在每个子域上复现。
- 在一个子域上找到问题后，去其它子域再测一遍；
  表单里 name 字段的 XSS 载荷，要专门看它是否在别的子域上也有回显。
- 过去没找到洞的项目值得从零再测一遍。
  实例：一个死子域，查它的源站 IP 发现还活着，FUZZ 出 `.bashrc` 和 `.viminfo`。
- 老项目、低危起步点都不要放过。
- 把每个子域的技术栈都过一遍；如果是自研 Web 应用，就把时间投在这里。
- 按公司和子域的语义自造字典，比通用字典有效得多。
- 子域要人工逐个过，不要只依赖工具——工具的误报会带偏判断。
- 一个子域没洞就换下一个，别死磕；换目标前先休息一下。
- 测登录页时，除了搜邮箱泄露，还要用 URL、IP、甚至口令本身作为关键词去搜。
- 子域登录页的开发者通常只在前端校验 userId 格式。
  读 JS 得出格式（例如 4–5 位数字），生成 `1000-99999` 的字典，配常见口令爆破。
- 换顶级域再试（`.net`、`.co`、`.io`），可绕过 CORS、基于 Referer 的 CSRF 和开放重定向。
- 找 LFI 的顺序：Google dork 找参数 → spider 主机搜参数 → ffuf 直接打域名
  → HUNT 做被动扫描。
- 最低成本的批量收割：拉子域 → 抓 HTTP body → 找出所有隐藏/可见的
  input、textarea、checkbox → 逐字段发 XSS 载荷 → 有回显就记下来。
- 侦察的第一步其实是读目标的责任披露政策。Fuzz 找 API 端点与敏感数据入口。
- 每个"不起眼"的子域都点进去看，信息泄露常在这种地方。
- 测移动端时，别忘了一个组合：在 Web 账号上开启 2FA，
  观察移动端的 SSO 登录行为是否被影响。
- 营销子域在范围外，但通过找到隐藏的 JWT 鉴权声明端点，把它提升成了主站账号接管。
- HTML 注入做不了 XSS 也别急着报，先找升级路径。
- 登录之后再测一遍子域：有时敏感用户数据在缺少会话校验的情况下直接暴露。
- 一个 2018 年的老资产，退订功能存在时间盲注，
  从这一个入口拿到 200+ 个库。
## 工具索引
- Burp → Search → 勾正则，把 Linkfinder 的正则贴进搜索框，一次性收集子域与端点。
- 不想手工确认 ffuf 的默认响应码与长度时，用 `autoffuf.sh [url]` 自动搞定。
- ScanT3r：对 URL 用多种 HTTP 方法扫，配 waybackurls / gau 串联，
  从请求头和 URL 参数里试 XSS、SQLi、RCE、SSTI。
- back-me-up：从 gau、gauplus、katana（被动/主动）、waybackurls 收集 URL，
  再用正则捞敏感数据。
- AORT：子域枚举、DNS、域传送、WAF 识别、CMS、反代、Whois、
  接管检查、端口扫描、Wayback、邮箱，一站式。
- Web-Check：IP 信息、SSL 链、DNS 记录、cookie、响应头、域名信息、
  页面地图、服务器位置、开放端口、traceroute。
- 常用工具的最低集合：Burp、ZAP、Dirsearch、Nmap、Sublist3r、Amass、Subfinder。
- flumberboozle：把 MASSDNS 与自动上传/删除测试结合，1 分 45 秒测 2 万种排列。
- XSS / SQLi 的绕过技巧参考站 `sla.ckers.org` 与 `rdot.org` 都已下线，
  但 Wayback 有存档，例如 `web.archive.org/web/20120601043754/http://sla.ckers.org/forum/read.php?24,33903`。
