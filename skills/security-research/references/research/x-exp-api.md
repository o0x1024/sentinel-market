# X 经验语料 · api

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但缺少可直接复现的完整载荷链；
与 x-<类>-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已剥离。作者自述，未经复现验证。
跨号重复的同一结论只保留一份；纯提问、无答复的帖子、频道与工具推广已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：本类无专属篇，按 [检测入口](../vuln-detection.md) 选择 · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-api-1（23 条）、x-residual-api（4 条） · 本文 177 行

- 把精力放在难到手、打不开的端点上。例如只有持有有效证件号（巴西 CPF、CNH 等）才能访问的端点，硬啃才可能暴露新东西。
- 如果赏金项目的上传服务器在范围内，试试传 SVG。部分端点会拦，不代表所有端点都拦；SVG 可以内嵌 HTML/JS，可导致存储型 XSS。
- 拿到 RCE 不一定靠高深技巧，找暴露的 Docker API 就是简单得分点。
  http://ghostlulz.com/exposed-docker-api/
- apktool 解包 → 看 AndroidManifest.xml 找 Firebase → 在 strings.xml 里找 Firebase 数据库地址与 API key。
- API TIP 16/31 — 即使用别的代理，也始终让 Burp 在后台跑，用 tree view（免费版就有）看自己访问过的全部 API 端点。
- API TIP 17/31 — 遇到证书固定（pinning），先别急着逆向打补丁：把 iOS 和 Android 客户端、以及它们的旧版本都找一遍，很可能其中一个没开 pinning，省时间。
- API TIP 20/31 — 测 AuthN 接口时注意：生产环境多半有防爆破，但运维常把非生产环境的限速关掉，别忘记测。
- 找 REST API 的 IDOR 时，可以像 POST 那样在 GET 请求里塞 JSON 对象。有些框架认这种写法，能绕过 URL 与查询参数的过滤。
- API TIP 29/30 — API 会暴露应用的底层实现。用它去理解用户、角色、资源及其关联，进而找出漏洞；始终对 API 响应保持好奇。
- 发现请求会走向第三方服务时，塞几个特殊字符（¤ ¢ ±١٢٣٤）进去，可能逼出一个含第三方请求细节的报错，从而泄露 secret API key。
- KeyHacks — 拿到 API key 后按服务逐条验证是否仍有效的方式集合。
  https://github.com/streaak/keyhacks
- 1. 对 API 端点与参数做爆破
  2. 对每个端点试各种 HTTP 方法
  3. 为了做到第 2 步，往往需要改 Content-Type
- Parse Platform（移动后端 API）的固有安全问题研究，涉及 800 万以上用户的数据安全。
  https://healdb.tech/blog/parse.html
- 测请求走私时先打 robots.txt：多数情况下它接受任意 POST，而其它端点会拒绝。
- 先爆破子域上的 API 端点；找到后拿同样的路径去主域再试一遍，常常直接信息泄露。
- 玩 API 端点时，始终发一次非法的 Content-Type，报错响应里可能带出隐藏端点。
- CORS 想让自己域名被接受？试这个参数名：?corsDomain= （在 Yahoo 的一个端点上见过，不保证通用）。
- 若 API 端点 http://api.target.com/user/profile 只靠 cookie 校验，记得查点击劫持：
  <iframe src="http://api.target.com/user/profile"> 可用来骗取受害者数据。
- 任何端点对你做了限制（比如"点赞"次数），试试竞态条件，并尝试与其它问题链起来放大影响。
- CORS 配错且响应是 JSON 数组（形如 [{"object": "value"}]）时，试试 JSON 劫持：本质是 CSRF，诱导用户点链接，把受害者账号数据送出去。
- 看到已公开披露的 API key 泄露报告，务必回头确认这些 key 是否真被吊销——没吊销的比比皆是。
- 在一个 reddit 页面上暴露的隐藏端点里找到了反射型 XSS。做电商/销售类站点时，去相关论坛搜新端点来测。
- 拿到 api 域名后先试 /graphql 与 /graphiql，确认可访问，再用 GraphQLmap 抽数据。
- 下载目标 Android app → jadx 反编译 → 除了 API key，还要在代码与类名里搜 username、password、root、db 和公司名。
- Reflection 工具：在大量端点的隐藏参数里自动跑 XSS / SQLi / SSRF。
  https://github.com/mikey96/reflection-public
- 测 REST API 时把 Content-Type 改成 application/xml，body 换成 XML 发一次。若返回 XML 报错，就上 XXE。
- busk3r 的 Generic University docker 镜像，用来练手一个故意做成有漏洞的 API。
  https://hub.docker.com/r/busk3r/genericuniversity
- 找到能控制"存储标签"内容的端点时，XSS 往往不可行；改塞 burp collaborator，看页面（经 URI）有没有 referral 泄露，可升级成零交互 ATO。
- 始终在 URL 末尾追加一些 URL 编码字符串。若 API 会把它转给后端，可能拿到路径穿越或泄露的 key。
- 任何端点都值得用 param-miner 扫一遍隐藏参数，边手工测边让它猜。
  https://github.com/PortSwigger/param-miner
- 有人把"XML 格式的 SQLi"当成新技巧，其实和普通参数注入一样，区别只在请求体是 XML：
  ProductID=1  →  ProductID=@@version
- TIP 23/31 — API 支持发私信时，把 receiver_id 从单个字符串/整数改成数组，可能被用来刷系统。
- 挖更多 IDOR：
  1. 对象范围：私有还是公开
  2. 从 API 路由命名规律推新端点
  3. 给本来没有 ID 的请求加上 ID
  4. 替换参数名
  5. 同一参数给多个值
- SSRF 打 Google Cloud metadata；同时始终手工读 JS 文件找隐藏端点。
- 在 embed image 功能里拿到非盲 SSRF，端点是从 Google 搜出来的。
- 测密码重置 + Host Header 注入、且站点有缓存时，试着在 Host 里带端口：Host: http://target.com:22，会对应用造成 DoS。
- 返回 JSON 的 API 调用，试着把它搞崩（破坏期望的请求结构）。异常/报错响应可能是 text/html，正是 XSS 的好入口。
- 发现 Apache 的 /server-status 端点可以做监控、捞出更多端点；配合 server-status_PWN 脚本。
  https://github.com/mazen160/server-status_PWN
- POST body 里 {"username":null} 改成 {"username":"xyz"} 后，每次请求都返回一个随机的（疑似缓存的）用户资料。多试奇怪的值。
- 测 /graphql 时用 graphql-path-enum 枚举可用的 query 路径。
  https://gitlab.com/dee-see/graphql-path-enum
- 有时走应用内部的 AJAX 请求能绕过访问限制；另外隐藏参数常常就写在响应里，仔细看响应再构造请求。
- Coinbase 那个 bug 的启示：深入后端 API 调用、理解业务逻辑，把 POST/PUT body 里每个参数值都改一遍。这类 bug 就摆在明面上。
- 始终检查 API 的 CORS 配置。若允许带凭证从攻击者域发起请求，就能对已登录受害者做 CSRF，伤害很大。
- 读到那个私有文件后，几乎能访问 JS 文件里提到的每一个端点。
- 找到 Prometheus / Spring actuator 端点时记住：没有 swagger json 的情况下，它本身就是 API 定义。把不熟悉的端点全过一遍，可能撞出关键接口。
- 管理后台的 BXSS：找 contact us / feedback / report 端点，把 XSShunter payload 填进每个表单字段。若有 JS 校验，就先正常填完再拦发送请求改包。
- 用 Docker API 查镜像的环境变量与构建命令，可在 Docker Hub 上捞 TLS 私钥——实测拿到 1,551 张有效证书与 671 个不同的 AWS access key。
  https://labs.detectify.com/2022/06/16/how-to-look-for-tls-private-keys-on-docker-hub/
- 别忘在 JS 文件里找端点和 API key。一个 key 可能直接给到管理员权限、泄露全体用户 PII。
  https://github.com/Sachin-v3rma/Astra
- JS 文件里的路径要挨个试。曾在 JS 里找到 /customer/state，往 body 里塞 shopify_id，就能取任意用户的资料。
- OWASP API-Security 项目自带可练手的脆弱 API 环境；另可去 tryhackme 练。
  https://tryhackme.com/room/bookstoreoc
- GET 请求里有 file= 这类参数时，保持 burp logger 开启，或在浏览完全部端点后翻 burp history，再逐个测有意思的参数。这个套路也能找 XSS。
- 检查是否跑着未鉴权的 RASA 服务（响应里有 "Hello from Rasa" 即可认出）。这类实例能执行删除、更新正在运行的模型等关键操作。
- 打 API 时别忘测可能的 API 版本（改版本号往往绕过鉴权或暴露旧接口）。
- Adobe AEM：在 HTTP 参数名里编码特殊字符，有时就能绕过 AEM 过滤器。
  param:body=TEST 不通时，试 param%3Abody=TEST
- SSRF：body 里出现 {"endpoint":"/adduser","name":"test"} 时，在 / 前插入 @burpcollab.com：
  {"endpoint":"@burpcollab.com/adduser"}
  后端会拼成 https://website@burpcollab.com/adduser
- 拿到 x-api-key 后，用它去请求响应里给出的 URL，只要状态码不是 401 就说明 key 有效，可在对方私有环境里做关键操作（例：Adyen API）。
- 某 API 用 ID 参数查用户资料，换 ID 无效果，但 id=-1 有效，返回 17MB JSON。
- GraphQL 利用综述：常见漏洞点、可用工具。
  https://cybervelia.com/?p=736
- 用 Postman 测 API：拿到 GraphQL introspection 结果后粘进 Postman，query 会自动建好，省掉手工拼接口的功夫。
- 一个 GraphQL 请求暴露在范围外域名上，导致能向用户群发邮件、批量接管账号（P1）。
- GraphQL 测试用例清单。
- Web API 渗透：把 GET、POST、PUT、DELETE、PATCH，以及一个自造的方法名都发一遍，看服务器会不会给出意外信息。
- 参数类型混淆。JSON 能通就发非预期类型：
  {"username": "John"} / {"username": true} / {"username": null} / {"username": ["John", true]} / {"username": {"$neq": "lalala"}}
- 能发 XML 就查 XXE；发普通表单时试数组与字典：
  username[]=John
  username[$neq]=lalala
- 从范围外域名加载的 .js 里发现了自定义目录，对那个自定义端点做字典爆破，拿到 LFI（200 响应）——范围外域名也能出赏金。
- 爆破时撞 403？如果端点后面是反向代理，试 /;/ 、/.;/ 、//;// 这类写法，例如 /.;/example.so。
- 打 Drupal 目标时别忘了测 /node/ 端点。
- 测 JSON 端点时，把参数名改掉一个字母使其非法。服务器有时会报错并列出它接受的全部参数。
- API TIP 2/30 — GraphQL 返回敏感数据、query 里带 filter 参数时，试发空值 {"filter":""}，API 可能返回其他用户的数据。
- API TIP 17/30 — 想清楚哪些业务流被大量使用会伤害业务（下单、验券、上传图片）。这类流既能造成 DoS，也能让你的账号被封。
- 找到 XSS 后试一下 fetch() 形式的 JS payload：目标应用有时会把内容抓过去嵌进自己的端点。
- API TIP 24/30 — BOPLA / 过度数据暴露的挖法：测了几小时后，用 Burp 的 search 在响应里搜 PII，也搜业务相关的敏感字段（如汽车行业的 VIN）。
- 翻 git 仓库里的 .travis 等 CI 配置文件，它们可能公开泄露 API key。
- 端点没有扩展名、响应是 JSON 时，给它加上 .html 再带一个 XSS payload 参数，结果可能变成带 XSS 的 HTML。
- 想绕文件扩展名限制？对 filename 参数做 HTTP 参数污染。
- 原型链污染 XSS：先收集端点，找到存在 DOM 型开放重定向的端点，再对它测 PP XSS。
- 时间盲注 SQLi 的发现过程：先收集应用全部端点，用 arjun 挖出所有可能参数，逐个手工看响应里的异常，最后交 sqlmap 自动化。
- Firebase 的 11 类可打点。
- 自动提取 Firebase project ID 与 API key 的 Python 代码，附样例报告。
  https://github.com/ProjectNull0/Firebase-exploit
- 翻出上一个报告，把同一个 payload 打到其它端点里同名/同类的易感参数上。
- 把若干不安全设计链起来做影响；注意任何被拼进端点 URL 的用户输入。
- 发现 Flickr API key 泄露时，用它请求下列接口即可验证，并能看到 server、title、id、secret 与 owner：
  https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=API_Key_HERE&format=json&nojsoncallback=1
- 一个 CSRF 就能重置任意注册用户的 API key —— 网站每个功能都该测 CSRF。
- PortSwigger 新增的 API 测试内容与靶场，场景比多数资料贴近真实目标。
  https://portswigger.net/web-security/api-testing
- 目标语言是 PHP 时，随便找个 .php 端点，对参数 id 和 list[select] 测 SQLi。
- 不要相信 HTTP 响应：响应里写着 false 也可能数据其实已被删除/修改。要通过 API 或 UI 复核资源是否真的还在。
- 找 API key 要既手工读 JS 文件、又用工具扫，两头都做。
- 两个快速找 SQLi 的思路：
  - 状态变更请求（POST/DELETE/PUT）里也要测 SQLi，这种请求一定会查库
  - 参数是字符串时，看能不能用 ' 或 # 打破上下文
- 零交互接管任意组织：用 GraphQL introspection 端点，把所有 query 与 mutation 都测一遍。
- 看到 Jolokia 端点 /actuator/jolokia/ 时，试着读本地文件（配置错误）：
  xxxx[.]com/actuator/jolokia/exec/com.sun.management:type=DiagnosticCommand/compilerDirectivesAdd/!/etc!/passwd
- SSRF 思路：从 waymore 里提端点，找形如 Imageurl= 的参数，用 burp collab 地址测（响应是图片类型，所以能在 burp 里看到），打通用同一端点的 5 台主机。
- 测 Kentico 时看 /CMSSiteUtils 端点。若开了目录遍历，能拿到含配置文件、源码以及用户 PII（含密码）的 zip。
- 响应里含敏感信息（邮箱、cookie、地址、卡号）的端点，试着换扩展名（.js、.css、.avif、.woff）来绕过 WAF 或鉴权。
- 找到公开的 swagger 文档，就一定去测里面的 API 端点：其中常有完全不需要鉴权的接口。
- Help Scout 的 API key 泄露，涉及 6000+ 客户对话与 8000+ 明细。用 Xkeys 在 JS 文件里定位到该 key —— 任何凭据都值得追下去。
- SQLi 就在 URL 路径里：http://target.com/employees/2434*/summary/ 。该端点用路径里的数字去查库，sqlmap 一跑就到。
- 别只测最新版本：旧版本里往往留着暴露的凭据和 API 端点。
- 撞 403 别停：路径模糊测试、改请求头，或用 Burp 换方法（POST 代替 GET）。403 后面常藏着端点。
- 用带 HTML/XSS payload 的文件名建文件，找出文件名在哪里被反射；一旦 HTML 生效就直接打 XSS。
- 在同一目标上待得越久发现的端点越多；针对已有修复，始终再换一批 payload 试绕过。
- introspection 被关了，但用 GET 请求 GraphQL 服务器仍泄露了完整 schema。
- 二阶漏洞哪里都有：前端、API、后端。看到可能的 insert/update 端点，一定要去看结果页并试着注入。
- 在某 AI 软件的 API 里发现整数溢出：借此绕过 Cloudflare、拿到内部 UUID、列出库表与字段。
- 代码里看到 identity id、pool id 时，查它是否配置错误导致暴露 AWS 凭据（通常算高危/严重；本例端点仅演示用途，故为中危）。
- GraphQL 端点的 SQLi 要测在 query 参数和嵌套 filter 里。很多开发者在 resolver 层漏掉注入点。
- 只用 GET 模糊测试是错的，要 GET/POST/PUT 都发。有些路由和 API 端点只接受单一方法。
- 未鉴权的 API 端点可通过邮箱地址暴露用户敏感数据。顺带查 .js 文件，找相关服务的 URL。
- CL.0 请求走私可导致有限 DoS。每个端点都试一次走私。
- 找 IDOR 不要只递增 ID：拿别人的 ID 对同一端点试 PATCH/PUT/DELETE。鉴权常常只加在主方法上。
- 别跳过 GraphQL 功能点：这里没登录就 dump 到了 PII（受限泄露，但仍属未授权）。
- 拿到 Spring Boot actuator 的全套端点（/env、/heapdump，甚至能执行状态变更操作），绕过方式本身才是亮点。
- 打越权（BAC）时找"静默的后台端点"：本例把方法换成 GET、并把 UI 动作名直接当路径参数（无需爆破），就暴露了其他用户的数据。
- http://sub.blabla.com/contact 的 contact 表单既无验证码也无限速，且后端是 WebSocket 支撑的 API，几分钟内灌进 500 张工单。
- 碰到 InfluxDB 实例时看 /metrics 端点，它可能泄露一批无需鉴权即可访问的敏感端点。
- 竞态是金矿：用 Turbo Intruder 并行发同一请求，应用逻辑就崩。始终测创建类端点（用户、群组、支付）。
- JS 文件里翻出的隐藏端点，可用来绕过订阅（业务逻辑漏洞）。
- 主应用上的 SQLi 能执行任意 SQL 函数，两天就被"修好"并降级为 High（称只读）。绕过 WAF 用的是参数污染。
- 工具先放一边，直接扎进去：始终开着 Burp，分析页面发出的调用（两块屏更好），找 GraphQL introspection。
- ExHaunt — 在攻击者之前发现被遗弃的云端点与危险 DNS 残留。
  https://github.com/A9HORA/ExHaunt
- 爆破 id_FUZZ 出一个隐藏参数，再用语言相关的字典挖出隐藏路径。
- 永远不要相信 UI，一切以 Burp 里看到的 API 为准。
- 低权账号在带版本的端点上拿 401，去掉版本号就绕过鉴权、并暴露了敏感的证件图片：
  /omni/get/images/v2 (401)  →  /omni/get/images (成功)
- 两个项目用同一套 API，但只有新项目允许改邮箱。把新项目的端点换进旧项目，就绕过了限制并成功改掉邮箱。
- 客户端的限制/拦截一律用 Caido / Burp 拦包改后端 API 请求来绕过。
- 一个未记录的 GraphQL 端点泄露了法国公司所有者的家庭住址。
  https://medium.com/@anshbohra10/how-i-found-an-undocumented-graphql-endpoint-leaking-home-addresses-of-french-company-owners-eur-8536b9dd0ec1
- API TIP 14/30 — "/api/v1/report-v2" 是危险信号。版本号出现两次或出现在 URL 的非标准位置，说明这个端点很可能是为修补某个严重安全问题临时加的，而工程团队还没准备好真正的 v2。
- 搜索功能里本来只有 keywords，改成 email 就把受害者信息带出来了：
  GET /user/api/search?keywords=amr&q=keywords
  GET /user/api/search?email=victim@gmail.com&q=email
- 换个请求方法就绕过了隐藏逻辑 —— 本该 DELETE 的端点用 GET 打，被隐藏的评论就全部泄露：
  DELETE /api/v1/review/review_id:123  →  GET /api/v1/review/review_id:123
