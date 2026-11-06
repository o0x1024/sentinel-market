# OAuth / OIDC 与账号绑定

适用信号：第三方登录、授权回调、code 兑换、账号关联

## 检查与最小实验

记录 client、授权服务器、资源服务器、redirect URI、浏览器会话、PKCE/state/nonce 各自用途；OAuth 授权与 OIDC 身份认证分开。用两个自建身份跑通正常流程，再只改变一个绑定条件。

| 维度 | 核对 |
|---|---|
| 回调 | 精确注册回调和实际落点；原生 loopback 端口有规范例外。开放跳转链只向获准接收端验证。 |
| 事务 | code 的客户端、回调、会话、PKCE 绑定与单次消费；没有 state 不自动缺 CSRF 防护，正确绑定的 PKCE/nonce 可能承担相应保护。 |
| 身份 | issuer/subject 与本地账号如何关联，email 是否已验证且来自可信发行者；不能仅按显示名推断账号接管。 |
| 令牌 | audience、scope、用途、刷新生命周期；令牌字符串变化不等于旧令牌已失效。 |

## 证据与反例

需要实际关联到错误测试账号、把凭据交付不应接收的受控端，或资源服务器接受错误用途的令牌。登录成功但身份仍正确、回调只反射文本、代码已拒绝，均不支持接管。

## Agent 行为

不同授权事务隔离保存，只用已授权账号和回调。不把 `nonce` 当所有 OAuth 流必需字段；对实际 flow 按 RFC 9700 核对，JWT 细节见 [JWT](jwt.md)。

有效邮箱与有效提供方令牌必须属于同一被验证身份。用两个自有提供方账号核对令牌中的可信主体与客户端声称邮箱、本地账号关联结果；分别验证“凭据有效”“邮箱存在”不能代替验证二者的绑定。邮箱大小写/规范化、未验证邮箱与合法账号合并也需分别解释，不能仅因登录成功就写账号接管。

## 调研来源

- [RFC-oauth · RFC 9700: Best Current Practice for OAuth 2.0 Security](https://www.rfc-editor.org/rfc/rfc9700.html)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

回调可用子域、开放跳转、XSS或引用接管时，先证明各组件的实际控制权，再关联同一次合法测试授权的注册回调、每跳落点、凭据表示和最终受控接收者。截图中的“token stealing”步骤是组合假设，缺少真实凭据流不能补造；access token、ID token、code的用途分别核对，取得一种值不自动允许登录或接管。仅用自有身份和合成受保护资源，不使用源图的任何凭据。

回调链接触发会话循环或持续刷新时，保存授权事务、回调消费结果、实际Cookie的Domain/Path/顺序、服务器选值与每次刷新/重签发。用两个隔离自有浏览器核对合法回调与另一事务链接的绑定、受影响会话范围及清除/恢复路径；缺state、页面循环和“可能多Cookie”分别为观察或假设，不能直接证明因果与全账号DoS。交叉参照[会话状态](authn-session.md)，不向真实用户投递链接，也不以刷新压力扩大影响。

## 登录与账号链接的不同绑定

账号链接请求同时包含提供方令牌、userid和email时，分别核对可信提供方主体、当前业务会话、被修改本地账号及链接后的登录身份。用两个自有测试账号对照允许的链接和本应拒绝的主体变化，保存最终绑定/解绑与合成资源能力；字段可改或链接成功页面不证明接管。登录流程的主体绑定正确不代表链接处理器也正确，合法管理员代链接与用户授权迁移作反例，不获取他人提供方令牌。

## state全局存在与发起会话归属

state在系统中存在，不等于它属于当前回调浏览器发起的事务。按两个隔离自有会话记录发起者、待关联的业务账号、提供商账号、state/PKCE等事务保证、回调消费和最终绑定。图示中的另一会话点击链接只是假设投递路径；在当前会话仍有其他正确绑定时应拒绝，不能用缺少某一字段替代整条链。账号链接还须核对现有主体确认与允许的提供商身份；不向真实用户发送链接，不重放有效生产code。

## 第三方创建身份之后的本地重复注册

第三方登录创建本地账号后，同邮箱本地注册可能是允许添加新认证方式、创建另一个空账号，或未经验证修改既有身份凭据。关联可信issuer/subject、本地稳定ID、原账号合成资源、邮箱验证和新增密码的所有权；仅显示相同邮箱或新密码可登录不能区分这些分支。

用自有提供方身份与隔离本地账号分析注册前后、验证前后和两种入口的绑定，核对原本受保护资源及产品允许的链接流程。源图开始已登录某Gmail账号，缺独立受害者主体/请求终态，不把它当他人账号已接管的完整证明；不使用真人邮箱或关闭验证页后假定验证已通过。

## 请求hd与可信组织身份

Google OAuth请求里的hd优化账号选择，不是应用组织授权的依据。[Google OIDC文档](https://developers.google.com/identity/openid-connect/openid-connect#hd-param)要求校验返回ID token的hd；并校验签名、iss、aud和exp，以可信issuer/sub关联身份，邮箱域名不能替代组织声明（2026-10-09核对）。

旧图仅显示公司邮箱提示与把hd改成gmail.com后回到redirect_uri的说明，无公司资源/服务端主体结果。用自有测试身份跟到已验证令牌、本地租户资格、邀请/审批和受保护合成能力；正常回调不证明组织边界被跨越。图中scope没有openid，不能把示意URL自动当完整OIDC事务；不登录真实公司或使用图中凭据。

另一旧帖写hd=http://company.com，官方示例值是example.com这类组织域而非带scheme的URL；保留来源写法，不修正为已执行成功的参数。公司邮箱预填截图只证明UI提示，[Google相关参数与令牌说明](https://developers.google.com/identity/openid-connect/openid-connect#hd-param)在2026-10-09再次核读，仍要求可信返回声明与实际应用准入检查，不能以更换提示或自有邮箱进入回调认定绕过。

## 撤销同意后的待兑换code

[原研究者CVE-2020-13294公告](https://security.lauritz-holtmann.de/advisories/cve-2020-13294/)描述GitLab作为提供方时，已有同意后签发的新code尚未兑换，用户撤销应用权限，旧待兑换code仍签出新令牌并恢复授权记录的历史机制（2026-10-09阅读）。攻击视角是持有该客户端兑换能力的服务提供方，不能混作恶意身份提供方。

分别绑定主体/client、code签发/到期/单次消费、撤销代际、兑换时点和新access/refresh/ID token的实际能力；退出本地会话、撤销同意和刷新凭据失效不是同一动作。用自有隔离提供方/客户端的无秘密记录比对正常兑换与撤销后结果，授权列表重现本身不足以证明资源访问。公告为历史版本，不认定当前GitLab仍受影响；未消费原code/token或执行外PoC，旧厂商发布链接现重定向不能当已读原发布正文。

## 错误分支的回调校验与流程图角色

无效scope与修改redirect_uri同时发生时，错误落点改变不能直接归因于scope绕过。[RFC6749错误处理](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2.1)要求无效client/redirect_uri不自动重定向；其他授权错误可回到合法回调，invalid_scope是明确错误类型。分别固定变量，记录校验时点、真正回调、state、code/token或错误参数及受影响业务（2026-10-09核读相关段落）。

授权端点和code兑换的token端点角色不同；书中流程图把兑换请求标为/oauth/authorize，不当真实部署契约。图未画state/PKCE也不证明实现没有；沿实际交易绑定、code一次性/客户端/回调绑定及现有现代安全要求核对，错误页到外域不等于凭据外送或登录接管，不触发真实授权流程。

## 联邦登录缺失邮箱时的本地主体映射

第三方身份没有email字段时，区分字段缺失、null、空字符串、权限未授予和未经验证地址；每一层规范化结果都应关联可信issuer/subject和本地稳定账号ID。两个合法第三方用户都无邮箱，不应仅因相同空值就被映射到同一既有主体；正常创建独立空账号或拒绝该流程可为反例。

在获准隔离的自有身份中核对账号创建/链接顺序、异常回退、会话绑定与合成资源归属；邮箱是辅助属性，不替代受信唯一身份。来源声称ATO但只给一个测试条件，没有完整绑定和终态，不创建/连接他人社交账号或自动申请邮箱权限补证。

## 评论仓库配置与OAuth应用权限

Gitalk配置图列clientID/clientSecret/repository/owner/admin，密钥被遮盖；评论仓库和可初始化Issue的名单是应用配置，不能独立证明认证提供商将令牌限制在该仓库。“GitHub Application”也不足以区分OAuth app和GitHub App；本次未取得Gitalk维护者README，不能据此声称完整实现已核读或所有版本均有同一权限。

[GitHub应用差异文档](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)区分OAuth token的scopes与installation token选择的仓库/权限；[授权流程文档](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)还要求授权code及相关兑换绑定（2026-10-09核读）。据此核对实际应用类型、公共客户端/后端保密位置、用户同意、scope、组织策略、回调和真实API消费者；clientSecret可见不自动等于已有用户token或全部仓库能力。只分析获准脱敏配置，不重建密钥、搜索真实泄露、发起OAuth同意或调用仓库API。

## 旧授权类型选择图与当前安全要求

旧流程图按machine/user、web/native/browser及first/third party选择Client Credentials、Code、Implicit或Password grant，描述的是历史分类而非当前通用配置建议。先核对token代表的主体、客户端能否保密、实际redirect/code消费者、PKCE及资源权限，不能从“first party”直接赋予输入用户密码的资格。

[RFC9700 §2.4](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.4)禁止使用Resource Owner Password Credentials grant（2026-10-09核读）；历史图不能覆盖该要求。授权类型名只作架构线索，实际漏洞仍需用户/客户端/发起会话/资源之间绑定被破坏的证据；旧图无具体流程缺陷。以当前正式实现与权限文档建立正常对照，不登录提供商、授权应用或索取密码来验证。

## UserInfo声明与ID Token的主体绑定

OIDC简介图把ID Token说成可用access token从UserInfo得到，应纠正消费对象：UserInfo返回用户claims，通常为JSON，协商后也可为签名/加密JWT；JWT外观不使其自动成为ID Token。图右侧/底部裁切未补成完整流程，未保存的讲解不是已核读实现。

[OIDC Core §5.3](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)要求UserInfo的sub与已验证ID Token的sub严格匹配，失配不能使用这些claims（2026-10-09核读）。区分access token的资源能力、ID Token的认证主体与UserInfo的身份字段，再核对当前issuer/audience/签名/事务绑定和真正账号映射消费者。以获准脱敏事务及隔离自有主体对照，不把能取claims算作接管、不从旧图索取令牌或发起提供商登录。

## 未取得邮箱claim时的手工回填与资格判定

旧线程仅保存步骤6至8：社交授权不给email权限，产品随后要求填写company email并接受任意声明，称资格校验绕过。OAuth认证的稳定subject、provider实际返回且已验证的email claim、手工输入地址及组织成员资格是不同保证；scope未取得email不能让手工字段继承provider验证。

追登录/账号绑定、缺claim分支、地址验证终态、组织映射/邀请与真实授予能力，比较有claim、缺claim后待验证和合法试用三种状态。缺失步骤1至5及当前产品策略不能补成ATO，奖金不补邮箱控制权。优先获准源码/合成身份状态，不登录来源产品、伪装员工、输入真人邮箱或触发验证邮件。


## acr_values请求偏好与实际认证保证

OIDC图仅有authorize请求的acr_values=otp+password和state。[OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest)把acr_values定义为可选、空格分隔的认证上下文偏好，并将对应acr作为Voluntary Claim；请求文字不是已完成OTP/密码或强制二因素的认证结果。

分别绑定RP策略、OP执行的认证流程、实际返回且验证过的身份令牌/上下文，以及最终动作所要求的保证；不能由客户端改请求参数或一张请求图认绕过/安全。缺失/不满足的上下文与普通低保证流程须按权威策略处理，本批没有授权登录或发送OAuth请求。来源：[保存帖](https://x.com/i/status/1407184853255155717)。


## OAuth缺email声明后的自填邮箱和保留地址政策

正文描述去Facebook email scope后应用要求自填邮箱，可填原本禁止的admin地址；截图回信称regression并奖励。注册显示邮箱和拥有邮箱/管理员权限不同。

核对授权scope、身份主键、email来源和verified状态、保留地址政策、验证流程及应用实际角色；同名显示、未验证待激活或仍是普通账号是反例。回信证明个案评语，不给管理员权限收据；只以自有身份设计后续验证。

来源：[保存帖1](https://x.com/i/status/1427343103938088967)。


## OAuth清单按发行传输和消费阶段重排

完整清单图列access/refresh token、code、泄漏、scope、redirect、CSRF、replay、credential等；另一正文把请求body含token直接列问题。

绑定具体协议流、client/issuer/resource actor、redirect精确匹配、state/nonce/PKCE、令牌用途/受众和秘密持有者；协议允许body传token、合法回调、一次性code拒复用或无越权终态是反例。每条类别须有独立入口与对照，不能把token出现本身判漏洞。

来源：[保存帖1](https://x.com/i/status/1431964514631577600)、[保存帖2](https://x.com/i/status/1435899874591928321)。


## 社交登录共享信息提示与真实授权范围

邮件图称登录Rell并共享name and profile picture，可Edit Settings；不是数据库或API响应。

区分consent提示、实际scope、访问token主体/受众及第三方实际字段读取，以自有授权数据验证最小权限和撤销后读者；预期共享、提示邮件或名字头像不是泄漏证据。通知日期不替代当前授权状态，未访问第三方账户或使用token。

来源：[保存帖1](https://x.com/i/status/1441917902391816196)。


## JWT 认证 URL 与 returnto 的重定向链证据

保存 JWT 接管文章的图片只显示含认证值及 returnto 的 GET 和返回同一认证地址的 302。

分别识别 JWT 的用途、接收方和认证状态，记录每跳 Location、最终 origin、允许列表与 URL 解析。返回同一地址并未证明外部跳转、令牌泄露或接管；先区分站内相对地址、错误重试和真正跨信任边界的认证值转发，不保存原始 JWT/cookie。

来源：[保存帖1](https://x.com/i/status/1446745869378744329)。


## OAuth 完整导图的 code grant 与撤销不变量

完整图含code复用/跨client、state、redirect URI/mobile scheme/open redirect/Referer、clientsecret/token、grant错配、refresh竞争及evil app revoke。

逐一绑定授权服务/client、redirect URI、发起会话、code挑战/时效/单次使用、grant与token受众/权限及撤销后状态。缺state字段不单独证明CSRF，回调泄漏需真实读者，race需同资源交错，client字段未显示不等服务未校验。合法scope/受众、绑定拒绝、已撤销和无最终能力为反例；不发真实OAuth授权、抢code/token或竞争刷新。

来源：[保存帖1](https://x.com/i/status/1467027116290043906)。


## 同一第三方主体连接两个本地账号

保存步骤是provider先连account1再连account2，邮件题名为authorization token misconfiguration/3000；未保存redirect/state/token交换。

绑定issuer+稳定sub与本地账号、当前登录主体、连接/断开和重新登录，用自有账号比较正常重复连接策略及最终权益。合法多账号连接、确认旧绑定、被拒或只邮件为反例；绑定冲突不自动token窃取/ATO，不链接真实第三方账号。

来源：[保存帖1](https://x.com/i/status/1473649582034804743)。


## authorization_code 字样与可用授权码

正文建议在JS搜authorization_code，没有保存一次真实授权响应或可兑换材料。

区分参数名、示例配置、静态字符串与绑定client/redirect/主体/有效期的一次性材料；自有fixture只验证消费者和错误/过期/错client对照。关键词或格式匹配、公开示例及绑定正确为反例，不把出现字样叫秘密，不兑换他人代码。

来源：[保存帖1](https://x.com/i/status/1480578354352992261)。


## OAUTHScan 十项检查与协议消费者

正文说扩展含10+OAuth/OpenID检查，图只有仓库卡片；具体规则/版本/结果未保存。

离线自有协议记录client/redirect、state/nonce、code/token绑定与实际分支，合法/错绑定/拒绝对照。工具数、OAuth标签、只UI或无服务端结果为反例；不补出10条未存实现、不安装运行扩展。

来源：[保存帖1](https://x.com/i/status/1491139771607191552)。


## OAuth match replace 响应与服务端身份绑定

保存正文称改变OAuth响应即可绕过，没有授权码交换、token或服务端身份状态。客户端看到成功可以与后台仍拒绝并存。

用自有离线身份状态模型比较正常/失败响应与后续权限读取，分别核issuer、audience、回调/事务绑定、账号映射和会话创建。确认需有原始交换和服务端以不同身份授权的证据；UI成功、伪造本地响应或后端拒绝为反例，不操作真实账号/授权流程。

来源：[保存帖1](https://x.com/i/status/1491460711775617034)。


## Cognito 双池流程图不证明 zero click 接管

两张完整图画login→User Pool/第三方登录→JWT→Identity Pool token exchange→临时AWS credentials→S3，共六步。正文多个zero-click ATO标题，图没有异常账号映射或权限比较。

离线自有身份模型将应用会话、JWT验证/账号绑定、身份池映射/role条件、临时凭据与S3动作逐一关联，比较有效自有身份/拒绝/受限角色。正常流程图、临时凭据存在或宣传zero-click不是越权；权限符合预期、未跨主体为反例，不交换真实token或访问云资源。

来源：[保存帖1](https://x.com/i/status/1493103699262316544)、[保存帖2](https://x.com/i/status/1494993982606045184)。


## 正常 signup 与 OAuth signup 需要同一身份状态比较

正文提醒两入口注册不同，图只有WeakRegistration150奖励。

隔离模型对比新旧账号、verifiedemail、provider subject、tenant、邀请/组织加入以及碰撞处理，保持可验证邮箱归属；入口差异只有在服务端赋予错误身份或权限时才构成漏洞。奖励通知和跳转页面无绑定链，不借OAuth名称推接管。

来源：[保存帖74](https://x.com/i/status/1505045199805812738)。


## 参数污染到授权码泄露标题应分三条信任边

正文只有 pollution→redirect→OAuth code 的文章标题，没有参数顺序或消费者。

离线核各层重复参数的选值、跳转允许规则、code 收件端点和 client/state/PKCE 绑定；拿到 code 还需证明可被正确消费者换取身份。标题不提供三个环节的证据，不补写外链利用步骤。

来源：[保存帖1](https://x.com/i/status/1511638703436976131)。


## 社交登录的可解码字段不等于可信身份声明

正文把 signature 可解码与邮箱修改联系到接管；图仅是社交认证 POST，含 provider、邮箱和 social_media_id。

Base64 解码只还原表示。核发行方证明、签名验证、subject 与本地账号绑定，再确认会话发行及受限消费者。请求中可改邮箱和 provider 不证明服务端信任这些值，也不能由单个请求认定 ATO。

来源：[保存帖1](https://x.com/i/status/1516725879526756352)。


## M2M 客户端凭据交换要保留机器主体

图明确由 client ID 和 client secret 换访问令牌，再访问 API。

这属于机器客户端认证，需核发行方、受众、scope 与 API 授权的实际主体。客户端秘密暴露与签名伪造、用户账户接管分别评估；成功取令牌也不代表令牌具有任意资源权限。

来源：[保存帖1](https://x.com/i/status/1524831867580600321)。


## 第三方登录建议先识别真实信任与主体绑定

保存正文建议应用采用另一服务登录时读取其文档，外链案例全文未保存。先列出实际身份提供方、客户端、用户主体映射、回调消费者与登录状态，区分第三方功能说明和应用真正采用的认证约束。

集成存在不证明账号接管；需要受控账号下实际认证及受保护请求的对应关系，未保存的案例步骤不补造。遵守当前服务与资产范围，不使用真实他人会话或凭据验证。

来源：[保存帖1](https://x.com/i/status/1545812907950309377)。


## 回调 URL 外观与实际 OAuth 接收方分开验证

正文给出 userinfo 中看似目标域名以及在恶意主机路径中放目标域名的候选。先由实际 URL 解析器确认协议、主机、端口和路径，再检查客户端、回调允许名单、授权状态、code/token 的接收方及绑定关系。

字符串含目标域或发生重定向不自动泄露 OAuth 凭据或账号接管；省略协议的片段还可能被当相对路径。使用受控账户与回调地址，分别保留登录前后主体和受保护操作结果，不从历史重复票据数量推断漏洞成立。

来源：[保存帖1](https://x.com/i/status/1549823501603065856)。


## 社交注册和账号链接须核对服务端可信身份

ATO清单建议修改socialsignon的email、去掉scope后手填邮箱、电话号码注册再链接既有邮箱。先区分被签名身份、用户自填资料与经过服务端验证的地址，用自有账户比较验证前后链接及最终登录主体。缺失scope或更改客户端字段不能替代服务器接受证据；检查issuer/sub/verified属性、绑定确认与防重复规则，不推定相同email即可接管第三方账户。

来源：[保存帖1](https://x.com/i/status/1569004089207160832)。


## OAuth外部redirect示意要绑定客户端与实际授权响应

图片的 response_type=token 概念箭头没有真实完整会话。以自有客户端和账户记录注册 URI、输入/解析值、client_id、state、用户同意及实际回跳；验证最终响应是否到达未允许目的地，再分析哪些 token 真被传输。概念图不能证明泄漏；字符串包含或域相似不是精确允许列表校验，不使用第三方 token。

来源：[保存帖1](https://x.com/i/status/1569702446447869953)。


## OAuth 授权响应 回调和资源权限分别绑定

保存帖列 redirect/XSS/CSRF 外链，图画授权请求、code、token 和资源服务器。分别记录 client、callback 实际规范化、state/nonce/PKCE 及会话对应关系，再证明 token 用在何 issuer/audience/资源。URL 跳转、脚本消费和 CSRF 不是一个通用绕过；缺失全文不补写利用，用自有账户确认最终 principal 和获准资源。

来源：[保存帖1](https://x.com/i/status/1575337732183932928)。


## 外部账号改名后绑定以稳定身份和实际权限判断

TikTok/Instagram 摘要称 username 改后 profile 链接未更新。审计 provider 的稳定 subject 与可变显示名/用户名、回收/改名、解绑重绑及缓存更新；用自有 A/B 外部账号确认展示链接与真实授权对象。旧链接不等于新用户继承权限，摘要未给的账号接管流程不能补造。

来源：[保存帖1](https://x.com/i/status/1576064299897872384)。


## OAuth 同意、scope、token 受众与资源权限是不同决定

保存 AAD/Graph 图分开 owner→client 同意、授权服务器发 token、client 向资源服务器携带 token 与 API 暴露 scope。审计自建客户端的同意主体/租户、token 类型/受众/有效期与资源侧实际操作权限，在自有对象上比较正确/错误受众及无权限场景。示意拓扑不证明帐号喷洒、外传或后门能力，scope 字符串和收到 token 不能替代资源授权，不使用归档凭证或执行工具。

来源：[保存帖1](https://x.com/i/status/1591056776060968962)。


## Facebook 账号绑定的 userid 与 oauth token 必须属于同一主体

保存请求形状为 oauth={token}&userid=本账号&email=本邮箱，帖文建议替换 userid。应核验服务端如何从 token 取得外部身份并与当前登录主体、目标本地账号和绑定意图交叉验证，不能只相信客户端 userid/email。用两个自有账号比较绑定前后身份与后续登录/解绑状态；一次请求通过不等于目标身份已经被控制。

来源：[保存帖1](https://x.com/i/status/1593855309855870976)。


## API 清单的 redirect、state 与 scope：字段存在不代表绑定

1595046632894111745-02.jpg 列 redirect_uri 服务端校验、code 响应、state 与 scope。提炼为每个值与客户端、浏览器会话、授权请求和目标资源绑定的核验矩阵；白名单字段存在仍需检查精确匹配和规范化，state 需实际校验而非只生成，scope 需授权端及资源端共同限制。历史清单不构成当前标准全文，不从图片推出整个实现安全。

来源：[保存帖1](https://x.com/i/status/1595046632894111745)。


## 历史保存帖0152：OAuth 回调与状态逐个边界核验

图列出开放重定向回调、路径规范化、伪子域、HTML/referrer、state 和 client_secret。逐项建立客户端注册→请求会话→规范化后的回调源→代码/令牌实际交付→兑换约束链；state 缺失/改变需证明会话或身份绑定失效，泄漏需证明数据确实到达自有接收端及密钥用途。不能由参数名称或假域示例推定账户接管，不使用图中的任何凭据。

来源：[保存帖1](https://x.com/i/status/1598398060509683712)。

已实际查看保存图片 `1598398060509683712-02.jpg`：OAuth 图列出回调开放重定向、路径规范化、伪子域、HTML/referrer 泄漏、state 和 client_secret。须分别核对注册客户端、会话绑定、最终回调源、实际令牌交付和兑换约束；图本身没有当前目标复现证据。


## 历史保存帖0152：外部身份解除关系与登录授权状态

身份关系被删除、外部提供商令牌被撤销以及本应用会话失效是三个状态。历史解绑报告可用于画出绑定→登录→解绑→旧会话操作的状态机，核对每一步的账户、provider、client 和重认证时间；界面显示解绑不证明登录凭据吊销，重新绑定必须有独立授权依据。

来源：[保存帖1](https://x.com/i/status/1598417119221276676)。

已实际查看保存图片 `1598417119221276676-02.jpg`：Shopify 外部 Google 身份解除绑定后既有会话仍可操作的历史报告。前提为先取得账户访问并绑定身份；解除绑定、会话吊销、再次绑定的权限与重认证应分别核验，不能将此前提链当作初始接管。


## 重定向 URI 多层编码需逐层标注解析结果

OAuth 幻灯片展示编码路径、点段和 fragment 中 code 的候选。将注册校验、URL 解码、代理路由、应用跳转、浏览器最终 origin/query/fragment 分开记录；各层记录原始字节与解析后的值。在自有客户端和回调地址比较单次/二次解码，核查 client、state、精确目标绑定以及授权结果是否被预期客户端消费。幻灯片中的字符串不证明 code 泄露、可兑换或通用平台缺陷。

来源：[保存帖1](https://x.com/i/status/1604266196312162304)。

已实际查看保存图片 `1604266196312162304-02.jpg`：OAuth slide redirectURI百分号双编码/点路径，最终展示fragment里的Facebook code与开放重定向；未见注册client/session绑定/实际转发。提炼每层解码/路由规范化、query vs fragment、最终源和兑换约束，不能由slide认定真实代码泄漏/接管。。


## user_oidc 的 HTTP provider 配置先审查谁能设置和秘密如何传输

截图显示容器/管理配置中 provider URL 及 client secret，秘密传输结果未完整保存。追踪具有配置权限的主体、允许的协议、实际 token/discovery 请求及传输中使用的秘密，用自有 provider 和合成秘密比较 HTTP 被拒绝或允许的路径。区分管理员明确配置不安全端点、低权限能改配置和系统静默降级；报告中的规范引用不等于已阅读完整规范。不得由配置截图直接推定真实生产秘密已被截获。

来源：[保存帖1](https://x.com/i/status/1604445845449048066)。

已实际查看保存图片 `1604445845449048066-02.jpg`：Nextcloud user_oidc历史报告自有docker安装、管理员添加http provider/client_secret，支持明文传输配置风险线索；图下实际capture裁切。核对真实请求URL/transport/认证secret消费、配置者权限和策略，管理员可配置前提不是任意用户泄漏，不将报告引用规范当已读正式规范。。


## 设备码授权审查绑定发起客户端与用户所见目的

QR/MFA 更新邮件只是设备授权诱导示意。记录请求设备码的客户端、租户、scope、码有效期、待授权身份与用户实际确认的信息；检查用户是否可辨别此次授权的应用和用途，授权结果回到哪个请求者。仅在自有测试客户端/身份做正常与取消授权对照，不扫描保存 QR 或复用现存码。合法登录域名与完成 MFA 都不自动证明用户授权给了预期客户端，工具名也不等于已存在平台认证漏洞。

来源：[保存帖1](https://x.com/i/status/1605582504601296898)、[保存帖2](https://x.com/i/status/1605923805519806464)。

已实际查看保存图片 `1605582504601296898-02.png`：Squarephish邮件示意MFA更新QR及Microsoft deviceauth链接，没有认证票据/真实主体流程；设备码与发起客户端、用户授权、scope/tenant/session必须明确，不发送钓鱼邮件不扫描QR不使用现存码，防误授权审查。。


## open redirect 链需要实测授权结果在哪一跳交付

图把 return_to、redirect_uri 和 CDN 跳转连到盗 OAuth token，未给最终授权响应。在自有客户端记录每跳 origin、query/fragment、浏览器导航、state、client、PKCE/受众及结果消费者；比较固定允许回调与不可信回调被拒绝的路径。跳转可达不等于 code/token 泄露且可兑换，范围排除也不因高影响标题失效；每个桥接条件必须有实际链证据。

来源：[保存帖1](https://x.com/i/status/1606630820671897601)。

已实际查看保存图片 `1606630820671897601-02.jpg`：Openredirect→OAuth token宣传图return_to/callback组合，只有构造URL未展示最终code/token流；记录每跳origin/query/fragment/client/state/PKCE+实际受众，不因跳转自动ATO，不把inscope规则从标题绕开。。


## XSS 后的事件与 OAuth 链需要实际授权回流

保存帖把 HttpOnly、改邮箱需当前密码与 OAuth+event listener 联为“最容易 ATO”，但未保存监听类型和授权流程。分别证明现有同源脚本原语、客户端/租户/scope、用户实际授权、事件来源/接收者、票据用途与最终权限；若为消息事件，还要校验 origin/source/schema，不能将任意监听当已收到有效 token。HttpOnly 与重新认证仍各自有边界，一条 XSS 或 token 可读不自动绕过它们。仅用自有客户端/会话和无敏感回流标记，不获取他人票据或自动发授权请求。

来源：[保存帖1](https://x.com/i/status/1612008867143057409)。


## GHES App scoped token 提权摘要要求已有安装权限

保存摘要要求拥有安装 GitHub App 的管理权限，风险是受限 user-to-server token 被错误授权为管理员/组织Owner，不能提炼为匿名提权。用自有实验组织区分安装者角色、App permissions、token scopes 和目标组织/操作权限，对照受限token、原用户token与撤销后token的同一无害操作。确认越过声明scope才成立；用户本来有权不证明token限制正确。3.3.17/3.4.12/3.5.9/3.6.5及CVE-2022-23741只保留历史信息。

来源：[保存帖1](https://x.com/i/status/1613909344872964096)。

已实际查看保存图片 `1613909344872964096-02.jpg`：GHES scoped user-to-server token提权；先有admin安装App权限，历史修复3.3.17/3.4.12/3.5.9/3.6.5；CVE-2022-23741摘要，非匿名提权。


## 授权请求字段与服务端授予能力分开审计

截图包含 authorize 的 clientId、PKCE S256、scope、nonce 和 cookie，正文强调服务端验证 token；未保存取得管理员能力的响应。先确定令牌类型和服务消费者，再核对签名/有效期、发行者、受众、绑定客户端及实际授权范围；不同令牌类型的校验要求不能混用。请求 scope 字符串或本地改 token 不改变已授予权限，PKCE 也不能代替资源端的对象授权。使用自有应用与账户检查允许和拒绝两侧。

来源：[保存帖1](https://x.com/i/status/1616479259123384332)、[保存帖2](https://x.com/i/status/1618661631189450752)。

已实际查看保存图片 `1616479259123384332-02.jpg`：OAuth authorize含clientId、PKCE S256、scope、nonce及cookie等截图，未见response/admin功能；scope字样非已授予，不重用会话。


## GitHub App 的仓库 scope 与组织 Project V2 权限分离

保存摘要描述 Scoped-User-To-Server token 可操作 GraphQL 组织用户/项目等非仓库资源，同时明确仓库内容、issues/pulls 不受同一问题影响。历史摘要标为 CVE-2022-23739，并列修复版本 3.3.16/3.4.11/3.5.8/3.6.4/3.7.1；这些是保存材料的版本条件，不代表当前状态。用自有组织与应用分别验证资源类别、实际授予 scope、成员角色及允许/拒绝操作，不能从仓库 scope 推断组织项目完整权限，也不把它混同其他 GitHub App CVE。

来源：[保存帖1](https://x.com/i/status/1618657787541602307)。

已实际查看保存图片 `1618657787541602307-02.jpg`：GHES App GraphQL org非repo资源无scope也可改users/projects；repo内容/issues/pulls明确不受影响；历史fix3.3.16/3.4.11/3.5.8/3.6.4/3.7.1 CVE23739。


## OAuth 授权说明与页面身份认证标题分开

正文自身定义 OAuth2 为客户端代表用户访问资源的授权框架，封面却写 Authentication。审计时分别确认资源 token 的受众/scope、当前主体和应用需要的身份认证断言，不由一个 access_token 自动赋予登录或对象权限。用自有应用和账户比较允许/拒绝能力，身份关联要求稳定 subject 及已验证来源；保存内容只是定义，没有完整实现或攻击，不把授权框架名称当安全证明。

来源：[保存帖1](https://x.com/i/status/1621068045191102466)。


## 跨第一方登录流的主体与会话状态逐步绑定

保存 FB/Meta/Oculus 链以 FB 已登录、Oculus 未登录开始，提到 logout/login CSRF 再走第一方 OAuth。记录每个 origin 的会话、发起者、预期账户、subject、state 与实际授予 token，用两个自有隔离账户比较账户混淆与正常关联。退出、登录成功和接管能力是独立终态，截图没有原始请求及完整账号效果，不能从第一方标签或现有会话推出授权，不重放保存 app_id 或登录真实账号。

来源：[保存帖1](https://x.com/i/status/1621153968930934784)。

已实际查看保存图片 `1621153968930934784-02.jpg`：保存Meta/FB/Oculus链：FB已登录Oculus未登录，logoutCSRF与loginCSRF起点，OAuthresponse_type=token nestedredirecturi，称token进forums.oculusvr/openredirect#access_token再漏ysamm；fragment不随HTTP，须真实DOMrelay/navigation/message消费者和subject/tokenaudience绑定，URL显示oculus.com/oculusvr变更/步骤无实际请求，勿重放appid/泄token/登录真实账号。


## 嵌套 redirect_uri 与 fragment token 的转交链单独核验

同图为 response_type=token、内外 redirect_uri，称 fragment token 经论坛 openredirect 外泄。逐跳记录解码、准确 scheme/host/path、预期客户端、URL fragment 的真实读取者与导航/message 转交；fragment 不会仅因普通 HTTP 请求就传给服务器。截图的 oculus.com 与 oculusvr.com 还发生变化，没有 DOM relay/完整交换；用假 token 和自有 origin 验证拒绝条件，不将 URL 展示等同真实泄漏、复制第一方 token 或推断当前可利用。

来源：[保存帖1](https://x.com/i/status/1621153968930934784)。


## Rooms 无权限成员启动 calendar OAuth：init 与授权效果拆开

保存 8x8 历史摘要给出 /meet-external/spot-roomkeeper/v1/calendar/auth/init 和指向 rooms/add 的 successRedirectUrl，嵌入页同时提示没有 Rooms 权限。启动 OAuth、得到跳转或返回页面只代表流程入口；应检查 state/会话/用户/tenant 绑定、callback 接受及最终 calendar/room 授权对象。以有效管理员和无权限成员对照，只有受限成员成功绑定本不允许的凭据或创建受保护对象才能说明权限问题。图未显示完成 grant/callback 或最终状态，不能把 init 可达认定为 OAuth 接管。

来源：[保存帖1](https://x.com/i/status/1625767090815700995)。

现有图片证据 `1625767090815700995-02.jpg`：无 Rooms 权限成员可启动 calendar OAuth 的历史报告：GET /meet-external/spot-roomkeeper/v1/calendar/auth/init，successRedirectUrl 指向 rooms/add；页面同时显示无权限，未展示授权完成或实际房间创建。


## 移动 deeplink 授权码劫持须闭合 PKCE 兑换绑定

Shop/Outlook历史摘要说明恶意app同自定义scheme可截取code，工程师加PKCE缓解。检查callback路由的唯一/验证关联、state与发起会话、code challenge/verifier、client/redirect绑定及一次性消费。只有得到code且能兑换并访问正确主体资源才支持接管；看到URL或注册同scheme不自动足够。历史Low3.7/900与报告总结不证明当前App仍有问题。

来源：[保存帖1](https://x.com/i/status/1631414207223672832)。

现有图片证据 `1631414207223672832-02.jpg`：Shopify Shop/Outlook历史摘要称恶意app可截取自定义deeplink授权code，工程师加PKCE缓解；依赖callback劫持与code兑换，普通URL可见不等于可兑换。


## Google hd 选择提示必须与组织授权解耦

改OAuth URL的hd参数可能更改账号选择提示，hd不是可信授权输入。服务器须核对可信IDtoken签名、issuer/audience/nonce等与组织hd声明及本地成员规则，在自有不同组织账号比较登入后角色/tenant。允许选择任意邮箱或提示后缀变化不等于组织权限绕过；缺后端授权结果不定ATO。

来源：[保存帖1](https://x.com/i/status/1634541690655481857)。

现有图片证据 `1634541690655481857-02.jpg`：GoogleOAuth图建议改hd URL参数绕过公司域提示；hd选择提示不是授权，必须服务器验证可信IDtoken签名、issuer/audience及组织hd声明，不能依email后缀或请求hd授予组织角色。


## MFA、OAuth 配置与账户占位用身份生命周期判别

正文仅记录2FA报告被改为OAuthMisconfiguration/AccountSquatting，缺具体流量。复核注册标识验证、既有账户关联、外部发行者主体、MFA前后会话和最终受保护动作，保留每项实际前提。标签争议不证明绕过或接管，不能补出未保存的流程。

来源：[保存帖1](https://x.com/i/status/1638063949269573632)。


## 授权码泄漏链在 redirect 路径与统计消费者分别闭合

pixiv图通过redirect_uri路径规范化到攻击者商品页，再由其GA配置获取query中的code。审计回调精确匹配与解码/规范化顺序、页面控制权、统计/Referer数据，以及code客户端绑定、一次性/过期/PKCE与交换权限。code出现不自动可兑换或ATO，High奖励是历史个案，不访问历史链。

来源：[保存帖1](https://x.com/i/status/1638480902765379584)。

现有图片证据 `1638480902765379584-02.jpg`：pixiv OAuth redirect_uri路径../到自有booth商品页再GA query泄漏authorizationcode；需redirect规范化与白名单/页面控制/令牌交换PKCE状态完整链，High历史不当通用ATO。


## OIDC state 错配响应泄漏预期值破坏保密边界

Nextcloud历史摘要callback比较会话state，错配JSON却回显expected state/debug leftover，CVE-2023-28848；ID4ME明确未测试仅近似代码假设。审查state绑定会话/发行者/期限/一次性及错误分支输出，用自有会话确认泄漏，再独立证明跨站可读/重用与最终登录主体。不能由源码相似写成ID4ME已复现或直接ATO，不补实际攻击链。

来源：[保存帖1](https://x.com/i/status/1643176933205721089)。

现有图片证据 `1643176933205721089-02.jpg`：Nextcloud OIDC摘要：callback state与会话值比较，错配JSON响应竟包含expected state/debug leftover；引用CVE-2023-28848及LoginController行336–344。ID4ME明确未测试仅代码近似假设；泄漏需浏览器跨站读/会话绑定/复用证明，不补成ID4ME已复现。


## OAuth 登录 CSRF 检查的是发起会话到回调的绑定

缺 state 或 PKCE 的帖子给出候选，应审查 authorization request、issuer/client/redirect、登录发起会话、返回 code/state 及 verifier 的关联。state 缺失不能单独证明 CSRF，PKCE 与 state 的目的也不完全相同；按实际实现找替代绑定与反例。仅在两个自有会话中比较错误发起会话的回调是否拒绝，不补造未保存 Gist 或真实账号接管。

来源：[保存帖1](https://x.com/i/status/1655853354390548480)。


## 共享 Okta 应用标识仍需校验各信任边界

两个域名使用同一 Okta app ID 只能提示相关登录配置。分别绑定 issuer、client、注册 redirect URI、租户、cookie origin、state/nonce 与最终应用会话，比较自控正常/拒绝回调。应用 ID 一致不证明 SSO 绕过，也不能自动把另一域或组织纳入 scope，未有真实流转响应不推账号接管。

来源：[保存帖1](https://x.com/i/status/1661518077710807043)。


## SSO 清单落到协议、身份与会话不变量

20项图涵盖认证发放/校验、token 修改/过期/吊销、CSRF、角色授权、会话固定、单点登出、SAML、协议互通、错误、IdP/SP、MFA、传输、身份映射、超时、头和扫描。按实际 OAuth/OIDC/SAML 流程选择条件，为每项定义合法/拒绝对照与保护结果；单点登出按部署策略核对，并非任意 token 应同时失效。清单不是20个漏洞或已测试证据，不运行泛化扫描。

来源：[保存帖1](https://x.com/i/status/1662072472622223361)。

保存图片 `1662072472622223361-02.png`：20项SSOchecklist auth/token校验到期吊销CSRF授权会话singlelogoutSAML协议错误IdPSPMFAtransportidentitymappingtimeoutheadersscannerpentest，要协议-specificexpectedproof不是20漏洞。本段仅使用实际查看的保存原图，不补未保存内容。


## Expo return URI 状态污染需绑定合法登录交易

两图显示正常移动登录经Expo/Facebook回到应用scheme，以及攻击示意先污染ru/returnUrl再让后续token去外域。审查大小写/URL规范化、allowlist、租户/应用、cookie/state、回调与发起交易绑定，以自有正常/拒绝URI逐跳比较。图是流程示意而非当前真实抓包；Facebook许可与最终token消费者不能省略，不推广所有使用Expo的站点或交换真实token。

来源：[保存帖1](https://x.com/i/status/1663553348119801857)。

保存图片 `1663553348119801857-02.jpg`：Expo exploit图混合大小写returnUrl保存ru外域，后续FBtoken到auth.expo.io再发attacker fragment/query，污染会话callback状态绑定示意未真实抓包。本段仅使用实际查看的保存原图，不补未保存内容。

保存图片 `1663553348119801857-03.png`：正常mobileExpoFB回调图ru codeacademy scheme expoauthsession channelcode token，两图可对比合法returnURI/租户/app/session绑定；URL图不证全部站受影响。本段仅使用实际查看的保存原图，不补未保存内容。


## CASB integration 创建校验委托租户归属

保存公开摘要支持历史 Cloudflare CASB 问题：Microsoft tenant UUID/domain 或 GitHub installation_id 已被另一客户集成时，攻击者可据这些标识建立新 integration 并显露敏感信息。以自有双租户校验调用者、授权委托、目标租户和安装归属，再检查创建后数据消费者。租户标识可公开，不应视为持有即授权；摘要中的阻止同 tenant 重复 integration 是历史修复描述，不能单独替代归属证明。Critical/Resolved 页面不证明当前全部集成都可利用。

来源：[保存帖1](https://x.com/i/status/1666377394976964608)。

保存图片 `1666377394976964608-02.jpg`：Cloudflare CASB公开摘要：若枚举到已经集成的Microsoft tenant UUID/domain或GitHub installation_id，可新建integration露出敏感信息，修复阻止同tenant多integration。结果页面Critical9.7/3300/Resolved；核心租户归属和委托授权，公共tenantID非secret，不能以阻止重复单独代替所有权校验。本段仅使用实际查看的保存原图，不补未保存内容。


## OAuth2控制器不能遗漏失败认证预算（2023保存案例）

Nextcloud OAuth2 API controller缺失暴力保护历史CVE2023-39958，图仅标题/摘要链接/时间线，没有具体参数或重试预算。可提炼同类认证入口保护覆盖检查，不能补造速率、成功token或无认证绕过。

图片证据：`1689547486216765440-02.jpg`（已核对原图；裁切或遮挡范围不补造）。

来源：[保存帖1](https://x.com/i/status/1689547486216765440)。


## 客户端 ID 与 secret 的用途及暴露等级（0187）

发现 `client_id` 或 `client_secret` 后，先识别它是否属于 OAuth、客户端类型、预期公开程度、服务端信任与实际权限。ID 通常是标识符；名为 secret 的示例值或无效值也不证明凭据泄露。以脱敏配置和合法测试客户端的最小对照证明用途，避免使用泄露值登录、兑换令牌或扩大权限。

来源：[保存帖1](https://x.com/i/status/1690854487164887040)。


## 保存图证0188-36-oauth：机制与验证条件

Nextcloud user_oidc CVE-2023-39953说明token issuer须匹配discovery issuer，与aud检查类似；作者明确没有OIDC环境验证且其他问题未核实，MITM影响仅声明。需受控两个issuer配置/签名/aud/iss对照，不能把代码意见视为已实现攻击。 可用原图：`1694379121743376845-02.jpg`。

来源：[保存帖1](https://x.com/i/status/1694379121743376845)。


## 保存图证0188-37-oauth：机制与验证条件

Nextcloud CVE-2023-39954区分公开client ID与私有client secret，明文DB快照读取可导致服务端冒名；secret需要原值不能简单hash替代，需独立密钥加密静态存储及DB/应用权限边界。截图没有实际DB或冒名请求，不推导远程任意读取。 可用原图：`1694379251800346716-02.jpg`。

来源：[保存帖1](https://x.com/i/status/1694379251800346716)。


## OIDC issuer 与客户端 secret 的两条信任边界（0188）

对 ID Token 验证签名、issuer 与 discovery 的精确关系、audience、nonce 及时间条件；使用两套受控 issuer 的正反例，不由代码意见补造 MITM。client ID 可公开，client secret 往往需要原值完成客户端认证，不能用普通哈希简单替代；静态加密还需密钥独立存储与数据库读取权限边界。只读 DB 快照泄露与远程任意账号接管分开证明。

来源：[保存帖1](https://x.com/i/status/1694379121743376845)、[保存帖2](https://x.com/i/status/1694379251800346716)。


## 保存正文0190：ping斜杠变体与OAuth入口的授权边界

正文/ping为OK、/ping/进入登录页及dummy Google账号可访问的声称。路径路由差异与登录后成员授权是两个假设；对照原始路径、代理重写、OAuth回调与实际业务资源。自有外部邮箱、获准域邮箱及未验证邮箱分别检查email_verified、受允许域、组/租户绑定和会话后端授权。登录UI或健康端点可达不构成绕过，图片OAuth2Proxy版本是历史上下文，不能补造回调参数。

来源：[保存帖1](https://x.com/i/status/1701084616663114149)。


## 保存图证0190-14-oauth：机制与验证条件

保存原图文件：1701084616663114149-03.jpg。

/ping/ 登录界面有OAuth2 Proxy versionv7.1.3和SigninwithGoogle；正文/ping=OK与/ping/面板路由差异，以及dummyGoogle能访问声称需分层。尾斜线仅表明不同路由，登录按钮不证明访问已获准；用自有授权账号确认email_verified、允许域/组/角色与真正上游受保护请求，比较原ping/尾斜线及未授权身份，界面版本不自动CVE或ATO。

来源：[保存帖1](https://x.com/i/status/1701084616663114149)。


## 保存图证0190-124-oauth：机制与验证条件

保存原图文件：1703755898131558417-02.jpg。

Cloudflare CASB报告2086301：删除的GitHub/Box installation_id或Microsoft tenant UUID/domain曾被合法连接，攻击者知道标识后可在自己账户重新添加并接触旧集成findings。机制为删除后授权/资源归属绑定未重新验证的confused deputy；跨两个自有租户做连接→删除→异租户重连和重新同意对照，检查服务端授权、旧凭据及数据生命周期。平台限定少量集成，调查未发现研究者账号外的数据影响；不可把公开UUID本身称秘密或推断全部客户受害。

来源：[保存帖1](https://x.com/i/status/1703755898131558417)。


## 保存图片中的机制与证据边界（1705220586329563554-02.jpg）：by-type/oauth-oidc.md

图片 `1705220586329563554-02.jpg`：Nord2049021手动连接服务凭据需邮箱验证的流程；GET /oauth2/auth?redirect_uri=...callback&id_token_hint=...把include_granted_scopes从1改0被声称绕过。参数不是邮箱验证事实本身；需比较原始/修改授权范围、回调身份和后端是否真实给未验证账号服务凭据，防止仅UI变化/旧完整会话。不保存id_token_hint/凭据，图底部截断未显示最终返回；不能泛化所有OIDC服务。

来源：[保存帖1](https://x.com/i/status/1705220586329563554)。


## 保存图片中的机制与证据边界（1707334475741635032-02.jpg）：by-type/oauth-oidc.md

图片 `1707334475741635032-02.jpg`：Mattermost 1502099/CVE-2023-1421 文字列出 OAuth complete 路由，base64 state 的 redirect_to 进入输出的候选；图中本地 GitLab 登录启用与 mobile action 是前提，截断部分没有实际弹窗。分别验证 state 的会话绑定及 redirect_to 的输出上下文编码；无效 code 错误分支、CSP、实际浏览器执行须单独记录，base64 不提供完整性。

来源：[保存帖1](https://x.com/i/status/1707334475741635032)。


## 0194：白名单检查和实际 token 发送目标必须一致

GitSourceEditor 图文描述先用 new URL(a).origin 校验，再对整个 URL 使用正则抽取 host/project/file；合法 googlesource origin 的路径/fragment 可让后续组指向另一 host。追踪规范化 URL、正则组、最终 fetch URL 与 token 附着范围，比较含伪 host 的路径及正确主机。只对自有 client/身份确认最小作用域，不把浏览器白名单字符串当实际 authority；图片提到 Gerrit/Android 相关权限，不能推断全 Google 或内网资源接管。

来源：[保存帖1](https://x.com/i/status/1716824364455280844)。


## 0194：取得用户 token 与目标 client 校验是两个边界

保存流程图区分授权 code 与 access token，并声称给 TimePlanner 签发的 token 被另一登录应用接受。provider /me 返回用户资料并不足以证明受众正确。自有身份和两个受控 client 比较 issuer、app_id/audience、expiry、会话绑定、code 一次性及 subject/email 映射；图中 auth 请求/200 是片段，须额外绑定 token 所属 client 和目标实际自有账号。应用所有者可取得本应用授权 token 不代表可以用于别的应用或他人账户，token 值不转录。

来源：[保存帖1](https://x.com/i/status/1717949393985573318)、[保存帖2](https://x.com/i/status/1717975703923429609)。


## 保存图证0194-4-oauth：1714650037718749438-02.png

OAuth AuthorizationCode图Browser→Server→IdP返code→server兑换accessToken→profile→数据；将OAuth当认证省略state/redirectURI/client/PKCE及IDtoken校验。标清code/token/subject各角色，绑定会话与client，错误code/其他client token对照，图非安全实现证。

实际保存图：1714650037718749438-02.png。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1714650037718749438)。


## 保存图证0194-92-oauth：1716824364455280844-02.png

GitSourceEditor先newURL(a).origin白名单但再regexexec全URL捕host/project/file，合法android.googlesource origin中path/fragment嵌攻击host1337#.googlesource.com，regex组可导请求到其他host携access_token。分别验证浏览器authority与应用regex组/实际fetch目的、令牌传输；合法字符串子串不等最终host，修核canonicalparsedhost及credentials限定。

实际保存图：1716824364455280844-02.png。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1716824364455280844)。


## 保存图证0194-92-oauth：1716824364455280844-03.png

edit.chromium.org/edit file/repo URL操纵路径%2E/编码片段给PoC1337/1338；须已AndroidBuildTeamOAuth授权或用户grant，HTTPSPoC更新ChromiumGerritAboutme显示token权限，图无live结果。被授trust app不等token可发任意host，不推整个GoogleATO；自有账号只最小scope回读且不运行保存server。

实际保存图：1716824364455280844-03.png。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1716824364455280844)。


## 保存图证0194-92-oauth：1716824364455280844-04.png

GitSourceEditor泄scope列email profile openid gerritcodereview androidbuild.internal，正文测试profile/repo读写而内网权仅assume/不清楚，其他editor只是may，pluginMode不OAuth尚未找到利用但enable-gis可强制候选。按真实scope/账号entitlement/过期revocation限制影响；假设内库/供应链不当已证全Google接管。

实际保存图：1716824364455280844-04.png。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1716824364455280844)。


## 保存图证0194-130-oauth：1717949393985573318-02.jpg

正常 Facebook 登录示意图是 relying party 请求 code，用户向 Facebook 取得供 Grammarly 使用的 code，再 POST facebook_login.code 给 auth.grammarly.com。示意图不是抓包，也不展示错误配置；服务端交换 code 应绑定 client、redirect URI 与发起会话、一次性和时效，区别 access token 登录协议，不能从 code 字段推定 token 未校验。

实际保存图：1717949393985573318-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1717949393985573318)。


## 保存图证0194-130-oauth：1717949393985573318-03.jpg

Bukalapak 示意图声称给 YourTimePlanner 客户端签发的 Dan token 被另一应用接受并登录 Dan，体现跨 client/audience 的 token substitution。需要在自有测试身份与两个受控 client 中比较正确、错误 audience/client、issuer、expiry，并检查 provider 可信验证与 subject 映射；图片为概念流程没有实际请求响应，不等于已证明接管现实账户。

实际保存图：1717949393985573318-03.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1717949393985573318)。


## 保存图证0194-131-oauth：1717975703923429609-02.jpg

OAuth 示意图画出 Facebook 把 token 放在回跳 URL fragment，前端读取后由 Randomsite 请求 graph /me 获得 email。fragment 通常不作为 HTTP 请求传给服务端，需区分前端采集、后端转发与 provider 校验。查询 /me 只证明 token 关联用户，不自动证明 token 是给此 client；需绑定 issuer、client/audience、会话及 email 的验证语义。示意非抓包，secret123 是图中占位标记。

实际保存图：1717975703923429609-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1717975703923429609)。


## 保存图证0194-131-oauth：1717975703923429609-03.jpg

Vidio 正常登录示意把 token 明确标为给 Vidio client 92356，再由 provider 返回 Dan email。应验证 token 受众而非只相信客户端传入的 email 或用户 ID；对照正确 client 与另一受控 client，当前图片没有真实校验响应或服务端实现，不能证明实际 Vidio 当时的缺陷。

实际保存图：1717975703923429609-03.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1717975703923429609)。


## 保存图证0194-131-oauth：1717975703923429609-04.jpg

TimePlanner 所有者通过自己应用的正常用户授权取得供该应用使用的 token，图示 token 来源与跨应用误接受是不同边界。用户为某 client 同意授权不代表同意用于另一应用登录或真实账户测试；仅用自有身份和受控 client 建立受众替换对照，不收集他人的 token。

实际保存图：1717975703923429609-04.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1717975703923429609)。


## 保存图证0194-131-oauth：1717975703923429609-05.jpg

拼图显示 POST /api/facebook/auth 提交 fb_access_token，并截取 200 与 X-Auth-Tokens 返回，图注声称来自 TimePlanner 且登录为 Dan。凭据与会话 token 不应转录；200/返回会话是证据片段，仍需脱敏请求、provider app_id/audience 证明、目标登录后自有账户 ID 及错误 client 被拒绝的对照，图片不独立证明全量身份接管。

实际保存图：1717975703923429609-05.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1717975703923429609)。


## 0195：跨应用 token reuse 需证明 issuer 与受众

正常 code 图、TimePlanner token 流程、Grammarly 登录响应/页面是不同证据层。自有身份与两个受控 client 核 token issuer、provider app_id/audience、subject、expiry 和会话绑定，再比较错误 client 被拒绝及目标自有 userID。/me 返回用户资料或 Set-Cookie 不自动证明受众正确；不能从图推广到所有热门 app，真实 token、邮箱和会话值不转录。重复已阅图当前文件 1719723468999057679-03.jpg 与 1717949393985573318-02.jpg 哈希一致，内容是 Grammarly facebook_login.code 的正常流程，并非 access_token 缺校验的抓包。

来源：[保存帖1](https://x.com/i/status/1719723468999057679)。


## 保存图证0195-3-oauth：1718296707270951405-02.jpg

Mozilla oauth/authorize报告截图给redirect_uri的%0d%0a候选，并声称无需授权可改headers，截图响应HTTP/2 302、location部分在下方裁切，未展示新header完整行。要追踪参数解码、框架header序列化与线上协议转换，普通Location反射/编码文本不等CRLF拆分；用自有无害header名对照记录原始HTTP/1或有效HTTP/2头，不能推Set-Cookie生效或ATO。

实际保存图：1718296707270951405-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1718296707270951405)。


## 保存图证0195-29-oauth：1718935705873686869-02.png

Auth0截图是scope字符串，含client_grants/users/keys/connections/rules/roles/actions/tenant_settings等读写。作用域清单不证明token来源、签名、audience、有效性、所属tenant或实际可用权限；建立泄露来源→服务端校验→自有受控资源最小读取→实际entitlement对照，不能据critical题名断言任意管理/接管，不转录token。

实际保存图：1718935705873686869-02.png。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1718935705873686869)。


## 保存图证0195-70-oauth：1719723468999057679-02.jpg

TimePlanner所有者取得为其client签发的正常授权token示意，独立hash不同排版；合法本app授权不代表他人或其他client登录授权。两个自有client用issuer/app_id/audience/subject/expiry做替换对照，不收集他人token或以图说所有app可接管。

实际保存图：1719723468999057679-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1719723468999057679)。


## 保存图证0195-70-oauth：1719723468999057679-04.jpg

Grammarly拼图POST /api/login facebook_login.access_token，响应grauth/csrf-token cookie与user字段，图注明TimePlannertoken，敏感值不转录。SetCookie+user字段是片段，需providerapp_id和目标自有userID及错audience拒绝对照证明跨client误接受；cookieSecure/HttpOnly/SameSite与tokenaudience缺陷无互相替代关系，截图不能推出所有账户/应用受影响。

实际保存图：1719723468999057679-04.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1719723468999057679)。


## 保存图证0195-70-oauth：1719723468999057679-05.jpg

Grammarly登录UI显示邮箱与Secretdocument卡片，图注connectedDan；它是登录后页面片段，无文档正文/编辑结果或token受众。关联自有userID、正常/错client与文档访问权限比较；标题/卡片不能证明读取秘密或全账号接管，遮盖真实邮箱和session信息。

实际保存图：1719723468999057679-05.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1719723468999057679)。


## 保存图证0196-30-oauth：1721913930254262435-02.jpg

Swagger图configUrl外部test.json与外部YAML标题，目标origin弹窗显示rl_anonymous/trait Rudder相关cookie。可见脚本弹窗但没有sink实现、凭据提取或登录结果；核Swagger版本/外部config/schema允许、HTMLsanitizer/CSP、origin与session实际敏感性，analyticscookie不等认证cookie/ATO。自有无敏感标记配默认可信config与转义控制。

实际保存图：1721913930254262435-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1721913930254262435)。


## 保存图证0196-104-oauth：1723191221550743600-03.jpg

第二张示意图把已验证 Instagram 号码通过 Accounts Center 链接到 Facebook，称共享可信联系人后无需新验证码并直接禁用受害 Facebook 2FA。提炼跨产品联系方式证明复用、确认主体及安全设置修改边界，未显示实际安全日志/受害账户状态变化。仅用两组自有账户模型比较正常链接与不匹配主体、号码/账户绑定和再认证，验证确认来源/用途/时效，联系方式共享不必然授权更改另一账户 2FA。

实际保存图：1723191221550743600-03.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1723191221550743600)。


## 保存图证0197-24-oauth：1724034517886013564-02.jpg

CASB Microsoft integration 摘要称 confused deputy：对已有租户 UUID 改大小写可旁路先前修复并建新 integration，随后暴露敏感信息；修复限制相同租户多个集成。无原始请求/返回，不能认定任意枚举 UUID 可接管。自有两租户核 UUID 语义等价规范化、去重/租户所有权与授权绑定，对比原写法/大小写/无权租户，记录实际连接及字段；能建资源不证明所有数据读权。

实际保存图：1724034517886013564-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1724034517886013564)。


## 保存图证0197-56-oauth：1724698887297118371-02.jpg

Nextcloud 摘要描述先取得数据库 dump 才可读明文 OAuth client_secret 并冒充 client，偏好不可恢复散列/至少加密；附 CVE-2023-45151。没有 dump 或令牌交换证据。区别服务器只需验证 secret 与需代 client 调用的可恢复用途，自有模型核存储形式、备份读权、轮换与最终 client 认证；client 身份不是任意用户 consent/授权码或全部账户权限，数据库读权前置不能省略。

实际保存图：1724698887297118371-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1724698887297118371)。


## 保存图证0197-115-oauth：1725927904494633199-02.jpg

OAuth 示意图展示 authorization request/grant、code-like grant换 token、token取资源；不是 Snapchat pre-ATO 证据。核 client、AS、RS、用户会话/consent、code 单次/PKCE/redirect 和 issuer/audience/权限，正常授权资源访问作对照。流程图不涵盖账户合并/邮箱验证，不能还原外链 pre-hijacking 链。

实际保存图：1725927904494633199-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1725927904494633199)。


## 保存正文0198：SSO 认证完成后仍需独立应用授权

保存正文称普通已批准账户在另一个 SSO 子域可访问员工信息。认证、token audience、应用角色、租户及对象权限是不同边界；先核对该应用是否明确授权该类账户。用受控普通/员工身份及同租户/另一租户对象对照，记录实际 API 数据与服务端授权。SSO 共用或用户功能可见不自动是漏洞，必须证明应受限数据或动作。

来源：[保存帖1](https://x.com/i/status/1727318514313183634)。


## 保存图证0198-89-oauth：1728132108609368396-02.png

已核对保存图片 `1728132108609368396-02.png`。/config/production.js图为window CFG，authority/client_id/redirect_uri/code/scopes及API、Firebase、Datadog、captcha公开客户端配置，多值遮盖。客户端ID、captcha site key、client token通常客户端可见，不能统一称秘密；核对具体字段功能、限制和可用权限，端点仅资产线索，图无泄露凭据或OAuth绕过结果。

来源：[保存帖1](https://x.com/i/status/1728132108609368396)。


## 保存图证0199-87-oauth：1730372366306267218-02.jpg

已核对保存图片 `1730372366306267218-02.jpg`。Collaborator图HTTP GET路径Base64解码为poc.local:8000/realms/master/protocol/openid-connect/auth?client_id=test2&response_type=code，UA ApacheHttpClient4.5.14；能关联请求但未展示原request_uri/内部资源。标记映射需相同测试nonce/时间与服务端，排除安全扫描/浏览器来源；外部GET不证明内部读取、云凭据或ATO。

来源：[保存帖1](https://x.com/i/status/1730372366306267218)。


## 保存图证0199-87-oauth：1730372366306267218-03.jpg

已核对保存图片 `1730372366306267218-03.jpg`。Bambda图查URLclient_id→Base64原URL入canary→拼&request_uri→newURL.openStream且returnfalse；这会主动HTTP请求/潜在每次过滤重复，非被动匹配，也不保留原cookie/header/method。需明确授权预算、去重/超时/关流和原语义，Base64不是脱敏会带敏感query给OAST；同请求无害标记/不触发基线逐环核回连，不运行保存代码。

来源：[保存帖1](https://x.com/i/status/1730372366306267218)。


## 保存图片 1739383010045432049-02.jpg 的 oauth 验证边界

OAuth图列code一次性/客户端绑定/限速、state CSRF、redirect_uri主机路径scheme、移动深链、授权撤销/refresh竞态与grant权限。分别绑定client_id、授权主体、state/PKCE、精确回调与token用途生命周期；两自有客户端/账户惰性对照，缺state可有其他绑定，publicclient不一定需secret，code泄露不自动ATO，不诱导别人授权/穷举。

图片证据：1739383010045432049-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1739383010045432049)。


## 保存图片 1740636693060059330-02.jpg 的 oauth 验证边界

Jetpack SSO 报告摘要描述可邀请任意邮箱并自行验证，启用按邮箱匹配账户时跨站映射到同邮箱既有用户。需要区分邀请、邮箱所有权验证、身份发行者与本地账户合并；用自有两账户检查未经邮箱持有人证明的新身份是否映射到原账户及其只读权限。条件是 SSO 与邮箱匹配功能开启，不能据同邮箱或报告标题认定任何 Jetpack 实例有漏洞。

图片证据：1740636693060059330-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1740636693060059330)。


## 0202 正文：SSO 邮箱匹配的身份来源

按邮箱合并本地账户需要可靠发行者、验证状态、邀请和邮箱所有权证明，显示相同邮箱不足以建立同一主体。自有两账户比较可信验证与未经持有人验证的邀请身份，检查 server principal 和受限只读权限；保留 client/issuer/redirect/code/PKCE/session 状态。公共客户端不统一要求可保密的 client secret，不使用真实用户邮箱接管。

来源：[保存帖1](https://x.com/i/status/1739383010045432049)、[保存帖2](https://x.com/i/status/1740636693060059330)。


## 保存图片 1742893271993434344-02.jpg 的 oauth 验证边界

OAuth 报告叙述从 scope 删除 email 保留 openid/profile 后登录到另一账户，显示 GET auth 参数但回调/映射/最终主体未显示。前提为发行者真实 claims 与服务端在 email 缺失时的本地账户查找逻辑；用自有两账户比较 scope、issuer/sub、email_verified、state/nonce 与最终只读 principal，缺字段应 fail closed 或按稳定 subject 映射。不能据叙述宣称任意账户接管或补造映射根因，不使用截图身份。

图片证据：1742893271993434344-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1742893271993434344)。


## 保存图片 1744788289096445998-02.jpg 的 oauth 验证边界

IAP→OAuth→授权/拒绝示意图拒绝页面可见当前 user 与 owner contact 邮箱；不直接证明任意邮箱或跨源读取。需要自有两身份核对被拒响应的信息是否公开预期、CORS ACAO/credentials/Vary、真实浏览器能否携带凭据并读到另一身份的字段。反射 origin、显示 own email 或导航到页面都是反例边界，图无 CORS header/浏览器 trace，不使用真实邮箱或请求云服务。

图片证据：1744788289096445998-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1744788289096445998)。


## 保存图片 1744788289096445998-04.jpg 的 oauth 验证边界

IAP discovery 图从多个组织 wildcard/acquisition→子域→301/302→登录→IAP→Vulnerable domain。301/302 或 IAP 保护本身是指纹，不能直接标漏洞；收购归属和政策要分别核对，实际 CORS/拒绝信息读取需另证。记录路径/redirect/发行者/身份与规则版本，不自动枚举或登录图中组织。

图片证据：1744788289096445998-04.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1744788289096445998)。


## 保存图片0204 1746600672785764754-02.png 的 oauth 验证边界

Office replyUrl 在 data-origin 属性反射：截图依次比较 userinfo、path/query、fragment，fragment 保留并能注入属性；inline onload 被 CSP 阻断，未证明脚本执行。分别记录服务端 URL 解析结果、浏览器解析后的 origin 与 HTML 属性转义；合法 origin 加不影响 origin 的 fragment 也需正确属性编码。最小对照为合法 replyUrl 与自有无害引号标记，确认解析后属性结构及 CSP 的实际拒绝，不能把 substring/样式推测写成已证实校验实现。

图片证据：1746600672785764754-02.png。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1746600672785764754)。


## 保存图片0204 1746600672785764754-03.png 的 oauth 验证边界

Office 图片给出脚本通过 getElementById("sharedauthscript").dataset.origin 获取 postMessage 第二参数，注入可创建同 id 的 script 与受控 data-origin，再加载 CSP 允许的 sharedauthclient 脚本。信任边界是可编辑 DOM 元数据变成 token 消息目的 origin；截图还包含 target origin 与 recipient mismatch 错误，错误本身不是成功泄漏。最小对照为合法 origin 和自有受控 frame，核对选中元素、脚本是否加载、真实 targetOrigin 与接收事件，不需解除 CSP，也不能由 DOM 字符串直接断言令牌可读。

图片证据：1746600672785764754-03.png。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1746600672785764754)。


## 保存图片0204 1746600672785764754-04.png 的 oauth 验证边界

Office 通信截图展示 SharedAuth_Init、ScriptInitialized、TryGetToken、GetTokenResponse/accessToken 协议及 appId/target；声称可嵌入页面并利用前图 data-origin 注入发送到自有主机，附件 POC 未保存不补造。分别验证 frame-ancestors/X-Frame-Options、发送方/接收方 origin 与 source 绑定、消息状态/nonce、token audience/scopes 和自有账户会话。只用无敏感消息或自有最小权限令牌做对照，令牌不落日志、不尝试他人资源；收到任意消息与枚举 appId 不证明全部应用令牌可获取，script-src 限制与允许被嵌入是不同检查。

图片证据：1746600672785764754-04.png。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1746600672785764754)。


## 保存图片0208 1758793682533113943-02.jpg 的 oauth 验证边界

Nextcloud截图称authorization_code存储无timeout，已有代码可将来兑换，引用RFC与CVE；未显示实际等待/兑换响应。own假时钟码存储比较有效期前后/单次/PKCE/client和redirect_uri主体绑定，用真实服务端拒绝确认而非评级。10分钟是截图转述非强制所有实现策略，长寿命不自动证明ATO，不猜码或调用OAuth。

图片证据：1758793682533113943-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1758793682533113943)。


## 正文0209 U3002点规范化与SSO：oauth

percentencoded中文句号进入SSO callback只是候选，截图缺最终Location。raw前缀/后缀比较与URL/IDNA/decode后的主机应一致并精确scheme/host/port，redirect_uri绑定和token发放单独证明。自有惰性URL模型比合法origin、相似suffix、编码与拒绝非白名单负例；跳转成功也不单独ATO，不访问SSO或猜遮挡域。

来源：[保存帖1](https://x.com/i/status/1765031161011568961)。


## 保存图片0209 1762204007161098562-02.png 的 oauth 验证边界

recon后清单包含双账号、目录发现、session/OAuth、SVG上传/扩展、验证OTP、储存字段XSS与reset Host/过期/Referer/takeover。将每项变成主体-对象-动作/生命周期与具体消费者，不将清单覆盖当已确认；自有两主体惰性fixture比正常、拒绝、已过期、文本编码/隔离解析负例。账号创建、OTP爆破、上传和目录扫描并非本任务授权，不执行。

图片证据：1762204007161098562-02.png。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1762204007161098562)。


## 保存图片0209 1764266559021990375-02.jpg 的 oauth 验证边界

API十二建议含HTTPS/OAuth2/WebAuthn、分级key/HMAC、读写授权、IP/user/action限流、版本/allowlist、gateway、error和validation。每个是分层控制：OAuth2不单独认证、HMAC需主体/用途/重放绑定、/v1命名不单独安全、gateway不免下游授权。自有惰性请求矩阵检验角色/对象/字段、旧版本同权限、可信代理来源、最小错误及类型schema，对照合法公共API/允许写权限；不由推荐名单证明漏洞或全覆盖。

图片证据：1764266559021990375-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1764266559021990375)。


## 保存图片0209 1765031161011568961-02.jpg 的 oauth 验证边界

SSO init callback图含google.com加percentencodedU+3002再被遮挡域后缀，无Location/浏览器最终origin。raw字符串前缀allowlist与URL/IDNA点规范化必须一致，U+3002视觉点不是凭看到就成功。自有惰性URL parser用合成域比较规范后精确origin、合法redirect_uri和拒绝相似suffix，区分跳转与OAuthtoken/ATO影响；不补隐去域、发SSO请求或导航。

图片证据：1765031161011568961-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1765031161011568961)。


## 保存正文0210：Moodle redirect_uri 需验证最终导航而非落地截图（oauth）

正文/mod/lti/auth.php?redirect_uri=//example.com候选，//是继承scheme的network-path reference，实际URL消费者可能拒绝/规范化为相对或需登录条件。对照受控允许/拒绝origin与返回Location/DOM导航链、hostport规范化、token是否发送；单独example.com截图不能绑定Moodle来源，不打开目标/发送SSOcode。

来源：[保存帖1](https://x.com/i/status/1767222180402675844)。


## 正文0211 111 oauth：U3002与精确origin一致规范化

保存encoded U3002 redirect候选，视觉点/IDNA映射、percent解码及parser先后需和allowlist消费者一致。惰性canonical scheme/host/port比较suffix/相似域/标准origin，缺Location/SSOcode接收链不推token盗取或ATO；不访问链接。

来源：[保存帖1](https://x.com/i/status/1770020285909241957)。


## 保存图证0211 1768683776966529255-02.jpg oauth

Doppler历史报告图说明docs/github-actions链接GitHubApp可能被接管，install需后续授予；具体appslug/可claim步骤未图中展示。拆陈旧文档链接→命名/归属→安装权限/owner核验，正常保留app/不可复用slug/拒绝scope为反例；自有惰性app注册状态模型，未安装不能声称现有token泄露，不认领真实app或安装。

图片证据：1768683776966529255-02.jpg。已核对完整可见像素；遮挡、裁切及未显示请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1768683776966529255)。


## 既有图证0211 1770020285909241957-02.jpg oauth

当前图片 1770020285909241957-02.jpg 内容SHA256与既有已阅 1765031161011568961-02.jpg 相同，复用已核验像素；当前字节重新核对。

SSO init callback图含google.com加percentencodedU+3002再被遮挡域后缀，无Location/浏览器最终origin。raw字符串前缀allowlist与URL/IDNA点规范化必须一致，U+3002视觉点不是凭看到就成功。自有惰性URL parser用合成域比较规范后精确origin、合法redirect_uri和拒绝相似suffix，区分跳转与OAuthtoken/ATO影响；不补隐去域、发SSO请求或导航。

原始阅图时间保留为 2026-10-11T13:59:29.381Z；未重新登记新阅图或访问外链。

来源：[保存帖1](https://x.com/i/status/1770020285909241957)。


## 第三方登录与本地二次验证策略0213-oauth

正文称启用本地 2FA 后用 Google/Facebook 登录可能绕过保护。先明确产品承诺的是每次所有路径二次验证，还是允许已认证联合身份，核 provider assurance、账户链接、敏感动作的再认证和本地策略。惰性状态矩阵比较密码/OAuth、已用/未用 MFA、低/高风险动作与拒绝策略；另一受信认证方式可以是设计允许，OAuth成功本身不是 bypass。未登录或更改 2FA，不把历史提示作为统一规则。

来源：[保存帖1](https://x.com/i/status/1774179430895653127)。


## 保存图证0213-40-1775531200280498420-02.png-oauth

已核对保存图片 `1775531200280498420-02.png`。OAuth历史截图response_type从code换code id_token后回到AuthorizationError，state/code/id_token位于#fragment而服务器报No_Oauth_State；长真实值不转录。参数位置决定客户端与服务端可见性，fragment不会随普通HTTP请求发送；惰性query/fragment/错误回调矩阵核类型允许表、state绑定、token消费与秘密最小暴露，错误页不等授权成功/ATO，不重放code。

图片证据：1775531200280498420-02.png。采用可见内容，裁切、遮挡和未保存阶段不补造。

来源：[保存帖1](https://x.com/i/status/1775531200280498420)。


## 保存图证0213-41-1775531200280498420-03.jpg-oauth

已核对保存图片 `1775531200280498420-03.jpg`。保存文述winA OAuth错误页与winB XSS页同origin且window.opener关联，可能读A的hash再将state/code交最终callback；下面PHP脚本裁切不补完。同origin、存活opener关系、COOP/noopener、有效且未消费code、state/会话/client/redirect绑定都是独立门槛。惰性窗口权限/回调拒绝矩阵对照无opener或跨origin，不能从URL可见就认ATO，不打开窗口、执行脚本、发送token或登录。

图片证据：1775531200280498420-03.jpg。采用可见内容，裁切、遮挡和未保存阶段不补造。

来源：[保存帖1](https://x.com/i/status/1775531200280498420)。


## 保存图证0213-65-1776288962270904567-02.jpg-oauth

已核对保存图片 `1776288962270904567-02.jpg`。OAuth误配置图第一部分Facebook登录不分享email后出现create-account页/空email，没有终态。外部provider稳定subject与用户填email的已验证身份是独立证据，不可因OAuth成功把任填email视已验证或自动合并既有账户；惰性缺email/拒绝共享/已验证匹配/冲突邮箱状态矩阵，需最终账户链接消费者，不注册/登录或据标题0click确认ATO。

图片证据：1776288962270904567-02.jpg。采用可见内容，裁切、遮挡和未保存阶段不补造。

来源：[保存帖1](https://x.com/i/status/1776288962270904567)。


## 保存图证0213-66-1776288962270904567-03.jpg-oauth

已核对保存图片 `1776288962270904567-03.jpg`。OAuth说明图email空且disabled，名字来自Facebook，username可填；disabled UI不等服务端不可修改，名字也不证明email所有权。惰性DOM序列化与请求允许表对照缺失/空/被拒字段，provider subject与已验证email分别绑定，不注册或改身份。

图片证据：1776288962270904567-03.jpg。采用可见内容，裁切、遮挡和未保存阶段不补造。

来源：[保存帖1](https://x.com/i/status/1776288962270904567)。


## 保存图证0213-67-1776288962270904567-04.jpg-oauth

已核对保存图片 `1776288962270904567-04.jpg`。说明图create-account参数First_name/Second_name/Username/email为空，只有文本不是真实截获回执。服务端不能信任客户端携带email或OAuth显示名为已验证身份；惰性额外字段/空值/冲突地址与稳定外部subject矩阵，核最终账户链接/创建消费者和唯一性，不发送创建请求。

图片证据：1776288962270904567-04.jpg。采用可见内容，裁切、遮挡和未保存阶段不补造。

来源：[保存帖1](https://x.com/i/status/1776288962270904567)。


## 保存图证0213-68-1776288962270904567-05.jpg-oauth

已核对保存图片 `1776288962270904567-05.jpg`。说明图称将email换成victim后登录对方无交互，但没有实际会话/私有对象终态。可提炼错误信任用户填email导致账户合并的假设，需外部subject/verified claim与本地existing-account link授权独立门槛；惰性两主体未验证/已验证/冲突状态对照，不由0click题名确认，不注册、登录或填他人email。

图片证据：1776288962270904567-05.jpg。采用可见内容，裁切、遮挡和未保存阶段不补造。

来源：[保存帖1](https://x.com/i/status/1776288962270904567)。


## 保存图证0213-74-1776605381285826796-02.png-oauth

已核对保存图片 `1776605381285826796-02.png`。OAuth序列图登录先cookie code_verifier，authorize redirect_uri内有next，再用户登录/code回调/校验verifier与code后按next跳转；图仅流程，无DOMXSS代码或ATO终态。区分授权服务、callback、PKCE verifier的会话绑定和next导航消费者，惰性错误verifier/已用code/不允许redirect/next与正常流程对照；图未列state不代表实现无state，正文1click主张另证，不登录或读cookie。

图片证据：1776605381285826796-02.png。采用可见内容，裁切、遮挡和未保存阶段不补造。

来源：[保存帖1](https://x.com/i/status/1776605381285826796)。


## 保存图证0214-66-oauth：1779054272723988712-02.jpg

已实际核对完整保存图片 `1779054272723988712-02.jpg`。保存图代码枚举 iframeKey，通过 parent.postMessage 的星号目标传递 MessagePort，再从消息 uri 解析 cquick_token 与 state 并构造 OAuth 导航。最小分析围绕窗口/端口身份、来源校验、消息结构、授权事务绑定和最终重定向消费者；MessagePort 传递后仍需把能力绑定最初合法窗口。未知接收端代码、授权响应和最终账号状态时不能证明令牌窃取/ATO。用离线合法/错误来源和错事务标记比较，不运行枚举、打开站点或使用令牌。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1779054272723988712)。


## 保存正文0218：token 端点的 Basic 客户端认证不等于用户接管（oauth）

正文展示 /token 与 client:secret 的 Basic 形式。Base64 是编码；确认该字段是公开客户端标识还是受保护的客户端凭据，再核实际 grant、主体、scope、audience 和资源服务器接受条件。用虚拟客户端和令牌样本对照客户端认证失败、用户授权缺失和正确授权；拿到类似 token 的字符串或客户端认证成功不证明可访问其他用户资源，不使用真实凭据。

来源：[保存帖1](https://x.com/i/status/1789752224932905365)。


## 保存正文0219：continue 跳转中的 access token 需要目标和用途绑定（oauth）

正文只保留线程1/n：continue导致转向另一app并把access_token放到查询。核实际URL解析/允许目标、token接收者与audience/scope、日志与Referer等泄露面及消费端授权；离线虚拟重定向映射和惰性token比较受限/允许目标。token字样和私人公司域示例不证明任意跳转或接管，未保存后续不补造，不访问URL或使用token。

来源：[保存帖1](https://x.com/i/status/1792753282680762449)。


## 保存正文0219：反射模板命中不能同时确认多种漏洞（oauth）

正文列反射模板与多类型潜在攻击，当前复用图片显示历史Nuclei反射匹配和og:image头候选。分别核浏览器sink/CORS可读/CSRF动作、缓存键与独立请求、导航与OAuth允许目标，离线惰性正常/拒绝消费者作对照。工具Low与反射不是执行或共享缓存成功，模板deprecated提示和版本应保留，未运行扫描。

来源：[保存帖1](https://x.com/i/status/1793813590870569059)、[保存帖2](https://x.com/i/status/1794598785471140325)。


## 保存正文0219：云集成 region 参数链保留 developer 权限前提（oauth）

保存报告图明确已有AWS OIDC集成、developer账号和部分资源添加权限；region请求和角色授权回执未显示。核参数到SDK/端点的消费者、目标校验、云请求principal与资源/动作授权，离线虚拟集成比较有效region和拒绝样本。题名不是未认证AWS账户全权接管证据，未配置云或获取凭据。

来源：[保存帖1](https://x.com/i/status/1794111319580217410)、[保存帖2](https://x.com/i/status/1794284848061804788)。


## 保存图证0219-62-oauth：1794111319580217410-02.jpg

已实际核对完整保存图片 `1794111319580217410-02.jpg`。Teleport报告截图说明需要已连接AWS OIDC集成，攻击者先有普通developer账号且允许添加部分云资源；只显示资源选择页面，region请求及凭据/权限回执尚未显示。核region到端点构造、每跳主机验证、云调用的服务身份与允许资源/动作，离线虚拟集成对照受限region和正确资源；未认证/任意AWS接管不能从题名推断，不配置云集成或获取角色凭据。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1794111319580217410)。


## 保存正文0220-84-136-oauth：ID4Me关闭必须同时约束后端身份入口

Nextcloud user_oidc保存摘要的插件安装、关闭ID4Me仍可达控制器与新账号注册是限定场景。界面隐藏不能替代后端配置/注册许可；在虚拟配置开关、issuer允许列表、回调state/签名/audience/subject及租户绑定对照中验证注册权限，保留原报告和未显示响应。不因入口路径或无赏金标签泛化到所有版本/身份提供方，不注册真实账号。

来源：[保存帖1](https://x.com/i/status/1796104463834640818)、[保存帖2](https://x.com/i/status/1796821533827936473)。


## 保存正文0220-95-138-oauth：Intent账号接管保留本地恶意应用与已登录前提

厂商摘要限定同设备已安装恶意app并已登录Basecamp，因不安全Intent处理可能取得OAuth2 token。将导出组件、调用者校验、显式接收方、URI/extras和回调绑定作为虚拟惰性token的对照边界；截图未显示组件配置或完整token流，反序列化分类不替代具体机制。不能改写为匿名远程ATO，也不安装app或使用token。

来源：[保存帖1](https://x.com/i/status/1796210170588188823)、[保存帖2](https://x.com/i/status/1796821536520691871)。


## 保存图证0220-38-oauth：1796104463834640818-02.jpg

已实际核对完整保存图片 `1796104463834640818-02.jpg`。Nextcloud user_oidc 的摘要指向已安装插件前提：ID4Me关闭仅隐藏登录按钮，/apps/user_oidc/id4me 控制器仍可达并可能注册。把界面可见性与后端配置、允许的身份提供方、注册权限分开验证；只在虚拟开关/控制器/回调对照中检查 issuer、签名、audience、subject 与组织绑定。图中提及伪身份服务但未给完整代码/响应，不能补为所有部署、全部角色或Talk影响；不注册或调用真实服务。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1796104463834640818)。


## 保存图证0220-44-oauth：1796210170588188823-02.jpg

已实际核对完整保存图片 `1796210170588188823-02.jpg`。Basecamp 已解决报告摘要：同设备安装恶意app且用户已登录时，不安全Intent处理可能取得OAuth2 token并接管账号。这是明确前提和厂商摘要，未展示Intent extras、导出组件或token流；右栏反序列化标签不自动证明反序列化机制。以虚拟token、显式目标组件、调用方身份、URI与回调绑定对照，不安装app、不取用真实token，不能泛化为远程无交互ATO。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1796210170588188823)。


## 保存图证0220-49-oauth：1796387195819004325-02.jpg

已实际核对完整保存图片 `1796387195819004325-02.jpg`。Python示例以 ThreadPoolExecutor 两线程发送两个 updateEmail POST，载荷分别修改 newEmail，头部身份/Cookie为占位；Basic jwt_token 表述不能视为有效JWT授权格式。并发submit未保证服务端真正重叠，打印状态/正文未展示账号最终所有者。以虚拟账号状态机、同步屏障、验证token的邮箱/用户/操作绑定及事务版本对照，检查请求时序和最终状态，不能由示例宣布竞态ATO，不执行真实账号修改。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1796387195819004325)。


## 保存图证0220-49-oauth：1796574762086563927-02.jpg

已实际核对完整保存图片 `1796574762086563927-02.jpg`。Python示例以 ThreadPoolExecutor 两线程发送两个 updateEmail POST，载荷分别修改 newEmail，头部身份/Cookie为占位；Basic jwt_token 表述不能视为有效JWT授权格式。并发submit未保证服务端真正重叠，打印状态/正文未展示账号最终所有者。以虚拟账号状态机、同步屏障、验证token的邮箱/用户/操作绑定及事务版本对照，检查请求时序和最终状态，不能由示例宣布竞态ATO，不执行真实账号修改。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1796574762086563927)。


## 保存图证0220-65-oauth：1796804380676813196-02.jpg

已实际核对完整保存图片 `1796804380676813196-02.jpg`。Authentication清单覆盖限流/X-Forwarded-For与轮换IP、忘记密码Host/悬挂标记、remember-me/重置、2FA直达内容/社交登录/重置/旧token、双邮箱请求、缓存欺骗、PHP数组与多候选密码、成功登录重置失败计数、自动重新登录。它是候选清单而非已验证通用绕过。以虚拟账号状态机、单值类型、最终受保护资源、重置token用户/邮箱/用途绑定、固定可信代理与Origin/Host来源对照；本地更改响应不改变服务端2FA完成状态，社交登录应评估等价认证等级。分别记录每次尝试、账号/会话/IP预算及缓存键/内容，不执行枚举或真实账号操作。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1796804380676813196)。


## 保存图证0220-70-oauth：1796998335209103479-02.jpg

已实际核对完整保存图片 `1796998335209103479-02.jpg`。示例JSON认证请求把username、password、grant_type分别标为FUZZ，未显示响应。三个字段有不同类型和权限语义；以虚拟认证器单变量惰性类型对照、记录实际序列化字节与最终授权状态，避免笛卡尔组合掩盖因果或真实口令枚举。HTTP/2与Content-Length示例不替代实际请求长度，状态变化不自动证明授权绕过。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1796998335209103479)。


## 保存图证0221-39-oauth：1799532672810614938-02.jpg

已实际核对完整保存图片 `1799532672810614938-02.jpg`。Zoom webinar/register浏览器弹窗仅显示zoom.us，未给原输入、响应、Cookie/OAuth流或会话接管结果。正文多种链/赏金题名与这个弹窗分别记录，以本地惰性sink、origin及两个虚拟会话对照输入来源/浏览器权限/身份状态；自运行脚本或弹窗不证明ATO，不从外链题名补完整链或使用真实会话。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1799532672810614938)。


## 保存图证0222-7-oauth：1803500328853316058-02.jpg

已实际核对完整保存图片 `1803500328853316058-02.jpg`。API12项图含HTTPS/OAuth2/WebAuthn/HMAC分级keys/ACL/rate/version/whiteIP/gateway/errors/validation；图为原则未实测。OAuth2本身不等于身份认证，HMAC需防重放与canonical bytes、WebAuthn校验origin/RPID、ACL逐操作对象/字段，IP限速受代理与共享NAT影响，版本号/gateway不自动授权；不泄漏stack但保留内部审计。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1801166105865781612)、[保存帖2](https://x.com/i/status/1801174444230185299)、[保存帖3](https://x.com/i/status/1801571631258878384)、[保存帖4](https://x.com/i/status/1803492196395450878)、[保存帖5](https://x.com/i/status/1803500328853316058)、[保存帖6](https://x.com/i/status/1804172001453527523)、[保存帖7](https://x.com/i/status/1804235726915277195)、[保存帖8](https://x.com/i/status/1838189261050306841)。


## 保存图证0222-25-oauth：1801558775029186642-02.jpg

已实际核对完整保存图片 `1801558775029186642-02.jpg`。OAuthredirect_uri静态列表混合嵌套跳转、重复参数、%00、fragment、userinfo@、后缀域、反斜杠/CRLF与state。分别解析authority/path/query/decode次数、重复键选择与授权服务器精确注册URI，fragment和点段不自动换host、state不是redirect_uri。必须证明code/token到未注册接收方及PKCE/state限制，列表无结果不称ATO，不访问列表域。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1801558775029186642)。


## 保存图证0222-25-oauth：1803339391596696060-02.jpg

已实际核对完整保存图片 `1803339391596696060-02.jpg`。OAuthredirect_uri静态列表混合嵌套跳转、重复参数、%00、fragment、userinfo@、后缀域、反斜杠/CRLF与state。分别解析authority/path/query/decode次数、重复键选择与授权服务器精确注册URI，fragment和点段不自动换host、state不是redirect_uri。必须证明code/token到未注册接收方及PKCE/state限制，列表无结果不称ATO，不访问列表域。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1803339391596696060)。


## 保存图证0222-113-oauth：1803427727401426969-02.jpg

已实际核对完整保存图片 `1803427727401426969-02.jpg`。WorldID#2515808官方summary state未按HTMLcontext编码插入form_post响应，CSP阻止JSXSS但注入可点击button外发form中的access_token；需极少用户交互非零点击。区分HTMLformaction/submit元素出站与任意JS、state协议绑定与输出编码/允许form-action，token有效权限/ATO需另证；$7000eventaward与sidebarNone口径单列，不读取/发token或补未保存fullblog。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1803427727401426969)。


## 保存图证0223-33-oauth：1804513890803634226-02.jpg

已实际核对完整保存图片 `1804513890803634226-02.jpg`。认证清单覆盖用户枚举、认证/限流、密码规则、记住登录、自动填充、找回与修改、验证码/MFA、退出、缓存、默认登录、认证历史、锁定或改密通知和共享 SSO 一致性。将清单转为状态迁移与服务端边界：主体身份、令牌生命周期、退出失效、跨应用凭据和私有响应缓存；对自有虚拟账户设置正反例并记录实际受保护操作。清单不是漏洞结果，自动填充、缺少历史或通知也不当然构成漏洞，不执行猜测或发信。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1804513890803634226)。


## 保存图证0223-54-oauth：1805173547498651905-02.jpg

已实际核对完整保存图片 `1805173547498651905-02.jpg`。重定向候选清单含 next、url、target、dest、redirect_uri、returnTo、checkout_url、continue 与路径段等。参数名只是查找入口，需识别服务端 Location、客户端导航或普通资源获取的真实消费者，并以允许/拒绝的虚拟 origin 比较最终导航和校验解析；OAuth回调还须绑定客户端注册、state 和完整流程。没有实际重定向响应，不据字段名认定漏洞。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1805173547498651905)。


## 保存图证0223-64-oauth：1805302150680957233-02.jpg

已实际核对完整保存图片 `1805302150680957233-02.jpg`。Lucid 注册/登录流程图显示邀请邮箱匹配、域锁定、SSO偏好、既有账户/新账户、自动配置或邀请入队、许可证及只读状态，并标注 Web/iPad 差异。建立邮箱所有权—可信 IdP身份—邀请接受—团队成员—许可证的独立状态，不能仅因同域或SSO偏好自动授予成员资格；检查既有账户合并及不同客户端是否保持服务端规则。图为设计流程而非实现证据，底部截断不补全，不访问内部链接、创建账户或接受邀请。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1805302150680957233)。


## 0225 REFLECTION跨类型标签 oauth

保存文本的reflection.yaml命令给出XSS/SSRF/缓存投毒/重定向/OAuth标签，没有模板正文。反射只定位输入到表示的候选链；分别证明浏览器执行、服务端实际连接、独立干净请求缓存消费、最终导航和OAuth绑定，不能由一个matcher同时判定多个漏洞。两篇重复正文的图片及当前来源需独立绑定。

来源：[保存帖1](https://x.com/i/status/1808686018599743656)、[保存帖2](https://x.com/i/status/1815204179172053406)。


## 0226 图片 090 oauth

原始图片 `1813255964654772480-02.png` 已实际审阅。JWT图25项结构/篡改/exp/签名/算法/重放/泄露/撤销/密钥轮换/claim权限/iss/aud/存储及工具；解码不等验签、普通bearer重用非漏洞、claim前提与撤销状态分开，弱密钥仅授权离线样本有限检查，实际token不上传第三方解码站。

来源：[保存帖1](https://x.com/i/status/1813255964654772480)。


## 0227 图片 1815438252608024941-02.jpg oauth

现有图片 1815438252608024941-02.jpg 的完整可见内容已按原图审阅。

练习清单指出 CORS 不能仅判断白名单字符串是否出现在 Origin 中；按 scheme、host、port 解析并作精确允许列表匹配，检查 credentials 与可读敏感响应。其余私有工具、信息泄露、SSO token 重定向及 XSS 均为题目提示，需各自验证输入到消费端与受害者边界，不能凭清单确认泄露或令牌窃取。

来源：[保存帖1](https://x.com/i/status/1815438252608024941)。


## 0228 正文 暂停安装时令牌能力取权限交集 oauth

历史 GHES CVE-2024-5816 描述 scoped user access token 在应用安装暂停后保留 public 仓库访问，图明示 private 不受影响。区分用户、应用、安装、令牌签发/使用/撤销时序与资源能力，用自有状态模型比较暂停前后允许动作；公共读取和有影响的写权限不混同，不使用令牌或推断当前版本。

来源：[保存帖1](https://x.com/i/status/1818753853258711376)。


## 0228 图证 85 oauth 1818753853258711376-02.jpg

已核对原始图片 `1818753853258711376-02.jpg`。GHES 历史 CVE-2024-5816 涉及暂停 GitHub App 后 scoped user access token 仍能访问 public 仓库，截图明确 private 仓库不受影响。验证用户、应用、安装状态和资源能力的权限交集，区分令牌签发、使用和撤销时序；公共读权限与敏感写操作影响不能混同。

来源：[保存帖1](https://x.com/i/status/1818753853258711376)。


## 0230 图证 13 oauth 1823090242599162199-02.jpg

已核对原始图片 `1823090242599162199-02.jpg`。ATO清单四类：reset多邮箱/bcc/重复参数与响应token；socialsignon取消email scope并手填；password/emailchange绑定；signup已有邮箱或phone关联。逗号、&bcc字符串不会自动成为邮件头，需真实解析/邮件投递；OAuth身份应绑定可信issuer/subject与verifiedemail而非客户端email，注册存在不等于已有主体会话。仅自有隔离双账号对照purpose/token/再认证/最终状态，未发邮件或注册受害者。

来源：[保存帖1](https://x.com/i/status/1823090242599162199)。


## 0232 正文 ROPC挑战策略与失败响应 oauth

历史GitLab材料讨论/oauth/token ROPC和登录邮件验证，图显示新IP请求invalid_grant而不是成功token。通用错误不确定凭据/挑战/客户端/权限原因，核正确自有身份、失败阈值/时间/IP、token签发及最终受保护资源。ROPC可用不自动绕过MFA，状态Informative0不补足流程，本次未登录。

来源：[保存帖1](https://x.com/i/status/1831044689602232364)、[保存帖2](https://x.com/i/status/1831046893603840092)。


## 保存图证0232-107-oauth：1831044689602232364-02.jpg

已核对保存图片 `1831044689602232364-02.jpg`。GitLab历史/oauth/token ROPC摘要讨论3次失败/24h或新IP触发邮件验证，截图新IPtoken请求invalid_grant，与题名绕过并非成功证据，状态Informative0。核正确凭据、scope/client、挑战条件与最终token资源消费；通用invalid_grant不证明原因或绕过，ROPC支持不自动破坏MFA，未登录/取token。

来源：[保存帖1](https://x.com/i/status/1831044689602232364)。


## 保存正文0234：再次登录不弹 MFA 要排除可信会话与策略差异（oauth）

正文称设置 Google Authenticator 后再登录无需验证，附图仅有 triage 侧栏。先描述新/旧会话、可信设备、SSO 来源、MFA enrollment/激活、恢复及 step-up 策略，用自有账户固定浏览器和身份比较受保护动作及服务端状态；保留已认证会话或受信任 IdP 可能符合策略，没弹窗不单独证明绕过。本次不登录真实账户，历史项目现行政策未查。

来源：[保存帖1](https://x.com/i/status/1836329015180664846)。


## 保存图证0234-111-oauth：1836576661044642216-02.jpg

已核对保存图片 `1836576661044642216-02.jpg`。Keycloak 论坛截图展示 Nuclei v3.3.1、一个 unsigned 模板、1443 目标/1362 httpx URL 和 CVE-2021-20323 标签，文字简介 IAM/OAuth/OIDC/SAML。模板匹配和重复 URL 不是浏览器执行证据，且没有可见完整请求、HTML 上下文或模板规则；需固定受影响版本/realm、反射位置、编码/CSP 与授权目标来证实 XSS。截图当前版本标签为历史资料，本次未扫描、下载或执行。

来源：[保存帖1](https://x.com/i/status/1836576661044642216)。


## 保存正文0235：不可见字符需区分字面转义与身份规范化（oauth）

正文给u200b与例子反斜线200b，字面文本不一定是真实U+200B，也不能称全部系统会自动规范化为同名。精确记录Unicode码点/原字节、输入→存储→展示→查找/SSO映射，并以稳定account ID作身份锚点；视觉相同不等账号同一，邮箱提供方规范化与服务规范化也不同，不创建重复账号或发邮件。

来源：[保存帖1](https://x.com/i/status/1837778313852404201)。


## 保存图证0235-59-oauth：1837517145963384854-02.jpg

已核对保存图片 `1837517145963384854-02.jpg`。认证检查表列 XFF/Host、remember/recovery、直接资源/OAuth/旧token/改响应、多邮箱、cache deception、PHP数组、计数重置、批量口令与宏。全为候选：客户端改响应不改变服务器 MFA，XFF 不是可信 peer，array 需实际类型消费，每个逻辑动作而非每HTTP请求应计预算。按自有角色/令牌用途/状态做负例，禁止把旧token存在或状态200当ATO，不尝试口令、外带或真实重置。

来源：[保存帖1](https://x.com/i/status/1837517145963384854)。


## 保存图证0235-95-oauth：1838248034997555456-02.jpg

已核对保存图片 `1838248034997555456-02.jpg`。19项2FA图混合码生命周期、旧会话、备用码、重置/邮箱、空/缺失/可预测码、Referer、直达API、客户端改success/状态、跨会话/账户、记住我与CSRF。客户端改200/true不能改变服务器验证，Referer不可靠，跨会话码是否允许需按用途账户策略；用自有角色/明确MFA状态测试服务器动作，不穷举、诱导或使用他人OTP。

来源：[保存帖1](https://x.com/i/status/1838248034997555456)。


## 保存正文0236：两个邮箱更新必须证明真实并发及最终状态（oauth）

正文只给两个newEmail，不给时序、身份或token；既有图是两线程示例，submit并不保证server重叠。以自有虚拟状态机明确账户/地址/挑战用途/版本和事务，比较顺序执行、屏障重叠、最终邮箱和token消费；不同邮箱本身不是竞态ATO，不能推Basic占位头有效，未更新账户或发邮件。

来源：[保存帖1](https://x.com/i/status/1838766751338955069)。


## 保存正文0236：反射模板需转为各consumer的独立证据（oauth）

正文把reflection命中列为potential XSS/SSRF/cache/redirect/OAuth。文字/header影响只给起点；脚本sink/执行、server fetch、cachekey/独立HIT、Location和code/state/token绑定是不同链。保存模板版本/警告、逐头唯一标记/请求身份与正常反例，工具Low/无结果不能判全部漏洞存在或安全，不外带或运行。

来源：[保存帖1](https://x.com/i/status/1839365202783134073)、[保存帖2](https://x.com/i/status/1839629091026371003)、[保存帖3](https://x.com/i/status/1839655657307578492)、[保存帖4](https://x.com/i/status/1839773579765752045)。


## 保存图证0236-19-oauth：1838922203972112449-02.jpg

已核对保存图片 `1838922203972112449-02.jpg`。2FA图分setup/secret/旧会话、码泄露/复用/空值/限速/JSON/OAuth和disable/恢复/CSRF。按用途、账户/会话、有效期与验证状态检查server动作，Referer和客户端响应非身份；记住旧会话是否合规需具体策略，不因秘密可见或缺口令一概ATO，不爆破或修改真实MFA。

来源：[保存帖1](https://x.com/i/status/1838922203972112449)。


## 保存图证0236-61-oauth：1840201812860674488-02.jpg

已核对保存图片 `1840201812860674488-02.jpg`。第二字节2FA图同setup/bypass/disable检查索引，按真实主体、secret/备用码用途、生命周期和server动作验证；客户端/Referer/形态变化不是MFA验证结果，不爆破/设置真实MFA。

来源：[保存帖1](https://x.com/i/status/1840201812860674488)。


## 既有图证0236-20-oauth：1838766751338955069-02.jpg

当前文件 `1838766751338955069-02.jpg` 的SHA256与已实际审阅内容相同，当前字节已重新核对，复用原审阅时间不重复新增图审阅。Python示例以 ThreadPoolExecutor 两线程发送两个 updateEmail POST，载荷分别修改 newEmail，头部身份/Cookie为占位；Basic jwt_token 表述不能视为有效JWT授权格式。并发submit未保证服务端真正重叠，打印状态/正文未展示账号最终所有者。以虚拟账号状态机、同步屏障、验证token的邮箱/用户/操作绑定及事务版本对照，检查请求时序和最终状态，不能由示例宣布竞态ATO，不执行真实账号修改。 独立保留本帖来源/文件，候选、前提与确认边界分别核验，未执行请求或使用秘密。

来源：[保存帖1](https://x.com/i/status/1838766751338955069)。


## 保存图证0238-7-oauth：1843644392906863056-02.jpg

当前附件 `1843644392906863056-02.jpg`。已实际审阅保存的原始图片。认证图并列 SSH 密钥、OAuth token、TLS 证书和密码。需区分用户证明、服务器身份、授权服务与 API 资源验证；状态码或 bearer 存在不证明主体、受众、权限和期限正确。图中证书解密描述不能泛化到所有 TLS 套件，公有客户端也不能默认安全保存 secret，不复制或使用凭据。

来源：[保存帖1](https://x.com/i/status/1843644392906863056)。


## 保存图证0238-47-oauth：1844991713154302361-02.jpg

当前附件 `1844991713154302361-02.jpg`。已实际审阅保存的原始图片。认证图覆盖枚举、尝试限制、记住登录、恢复与修改、CAPTCHA/MFA、注销、缓存、历史通知与共享 SSO。按签发、验证、变更、撤销和跨应用消费建立状态约束；自动填充或头配置本身不是认证漏洞，核对实际主体与已完成动作，不尝试密码、恢复或发送通知。

来源：[保存帖1](https://x.com/i/status/1844991713154302361)。


## 保存图证0238-74-oauth：1845668009064407235-02.jpg

当前附件 `1845668009064407235-02.jpg`。已实际审阅保存的原始图片。会话图列 token 承载、Cookie 标志/范围/期限、绝对与空闲超时、注销、多会话、随机性、身份变化及共享会话。按服务器实际签发、消费与撤销状态验证，Cookie 到期不证明后端失效，多会话并存也不必然违规；HttpOnly/Secure 不替代对象授权或 CSRF 保护，不使用 token 或改变账户。

来源：[保存帖1](https://x.com/i/status/1845668009064407235)。


## 保存图证0239-10-oauth：1845896052911833336-03.jpg

当前附件 `1845896052911833336-03.jpg`。已实际审阅保存的原始图片。API 清单本页含身份、RBAC/scope、输入允许集合、限速、传输/存储和 token。OAuth 与 OIDC 用途、token 类型和资源权限分别核查；声明使用算法、协议或过滤不证明正确验证、参数化或最小权限。固定主体、对象、动作与凭据生命周期，不复制密钥或发送尝试。

来源：[保存帖1](https://x.com/i/status/1845896052911833336)。


## 保存图证0239-37-oauth：1846494545531576495-02.jpg

当前附件 `1846494545531576495-02.jpg`。已实际审阅保存的原始图片。OAuth 图分 code 重用/客户端绑定、state、回调 URI 与移动 deep link、grant、secret、访问/刷新 token 和撤销竞态。按授权请求、代码交换、稳定主体、客户端、回调和最终权限核对；开放重定向不自动证明代码泄漏或接管，撤销 access 与 code 是不同状态。图片只给候选，不注册应用或交换 token。

来源：[保存帖1](https://x.com/i/status/1846494545531576495)。


## 保存图证0239-54-oauth：1846924123068682330-02.jpg

当前附件 `1846924123068682330-02.jpg`。已实际审阅保存的原始图片。认证清单覆盖枚举、尝试预算、密码/恢复、记住登录、CAPTCHA/MFA、注销、缓存、通知与共享 SSO。按主体与挑战生命周期及最终权限建模，自动填充或头缺失不是认证失败，多应用一致性需实际验证；不爆破、改账户或发送通知。

来源：[保存帖1](https://x.com/i/status/1846924123068682330)。


## 保存图证0239-79-oauth：1847682317722038334-02.png

当前附件 `1847682317722038334-02.png`。已实际审阅保存的原始图片。接口文档截图列 logout/invalidate、client validate、token info、unlink、migrate 与 auth 等方法，参数遮挡。文档存在和方法名只能给入口候选，token 校验、生命周期、对象变更与角色授权各需实际请求/结果；不据列表声称接管七亿账户，不调用接口。

来源：[保存帖1](https://x.com/i/status/1847682317722038334)。


## 保存正文0240：邮件工单与联合登录的信任链（oauth）

正文与保存图片提出验证信入工单、伪造邮件加入 CC、读验证码、Apple 联合登录至 Slack 的链条。邮件 From/CC、工单成员资格、邮箱控制与联合身份映射各自校验；猜测相近工单 ID 不是 ACL，截图不能证明全部实例。未注册、发送邮件、读取实际验证信或登录。

来源：[保存帖1](https://x.com/i/status/1848709853969322328)。


## 保存图片0240：附件036（oauth）

截图展示邮箱验证信转为支持工单，再利用声称存在的邮件伪造把攻击者加入 CC 的链条；代码被裁切，上游伪造校验未展示。工单 ID 接近不是权限依据，From 与 CC 不代表发送者或成员已验证；把邮件真实性、工单 ACL、敏感信件处理和账号绑定作为独立信任边界，未发送邮件、猜测 ID 或创建账号。

图片证据：`1848709853969322328-02.png`；仅保存图实际可见内容，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1848709853969322328)。


## 保存图片0240：附件038（oauth）

截图显示 CC 工单视图内一封 Apple ID 验证信，随后文字声称通过 Login with Apple 进入 Slack。验证信暴露、邮箱控制验证、OAuth 身份映射、工作区成员资格分别验证；单张图不能证明数百实例或实际 Slack 权限。未复制验证码、创建账号或登录第三方。

图片证据：`1848709853969322328-04.jpg`；仅保存图实际可见内容，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1848709853969322328)。


## 保存图片0240：附件076（oauth）

REST 鉴权图比较 Basic、Token、OAuth 与 API key，需纠正简化：Basic 的编码不是加密，传输保护独立；token 不必加密，签名/受众/期限/撤销与对象授权分开；OAuth 主要是授权，认证需明确身份协议，API key 不因内部或小项目自动安全，未使用任何凭证。

图片证据：`1850118068715815123-02.jpg`；仅保存图实际可见内容，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1850118068715815123)。


## 保存图片0242：附件053·1854397844385349901-02.jpg（oauth）

OAuth时序图把authorization code换token发至resource server，需纠正角色：常见授权码流token endpoint属授权服务器，资源服务器消费access token。授权码绑定client/redirect/PKCE、state与token受众范围期限各有证据，简图省略用户/策略不证明部署安全，未请求或登录。

图片证据：`1854397844385349901-02.jpg`；按原始内容摘要对应实际审阅，同摘要的不同帖附件保留独立来源与文件名。

来源：[保存帖1](https://x.com/i/status/1854397844385349901)。


## 保存图片0243-0：1854904366635118898-02.jpg（oauth）

已审阅保存原图 1854904366635118898-02.jpg。认证清单混合Forwarded/IP限流、密码重置Host/多邮箱、数组类型、2FA/旧token、缓存与宏。代理信任、身份规范化、挑战绑定及服务端protected动作分别核实；响应改写和数组不能自动绕过，IP轮换/1–1000/macro不是默认预算许可，未登录、重置或请求。

来源：[保存帖1](https://x.com/i/status/1854904366635118898)。


## 保存图片0243-24：1855520966320992420-04.jpg（oauth）

已审阅保存原图 1855520966320992420-04.jpg。认证清单包含枚举/猜测保护、密码/remember/reset/change/Captcha/MFA/logout/history/通知/缓存/SSO。autocomplete或通知形式依产品约定不自成漏洞，实际鉴权与会话撤销/身份绑定需protected动作对照，未登录、发信或爆破。

来源：[保存帖1](https://x.com/i/status/1855520966320992420)。


## 复用保存图片0243：1855482818526343271-02.jpg（oauth）

已复用该原图的既有审阅记录，保存附件 1855482818526343271-02.jpg。OAuth左右列完整清单已读，按actor/流程阶段/发行及消费合同分解，传body并非总漏洞。

来源：[保存帖1](https://x.com/i/status/1855482818526343271)。


## 保存图片0244-12：1857016321214386580-02.png（oauth）

已审阅该内容原图，当前保存附件 1857016321214386580-02.png。ATO清单包括未验证邮箱+社交登录链接、限速/异常响应、泄露值、登录和重置的OTP/JWT/IDOR/Host/HPP，XSS章仅标题裁剪。账号合并需验证通道控制及会话沿用，响应长度/散列/OTP出现不证明接管，限速需自有最小预算并考虑锁定，无暴力破解/重置或真实登录。

来源：[保存帖1](https://x.com/i/status/1857016321214386580)。


## 保存图片0246-41：1863875123758944546-02.jpg（oauth）

已审阅保存原图 1863875123758944546-02.jpg。ATO树有重置IDOR/poison、认证后IDOR、CSRF、加密/OAuth/preauth/RL、弱策略/泄露/XSS及response/status/massassignment/token，左缘局部裁剪；所有链需实际签发/消费及受保护动作。响应/status改只可能改UI，名称不自动ATO，未猜码/改密码或填裁剪手法。

来源：[保存帖1](https://x.com/i/status/1863875123758944546)。


## 保存图片0246-71：1864899669899595947-02.jpg（oauth）

已审阅保存原图 1864899669899595947-02.jpg。25项hunt清单子域CNAME/wayback/MassScan/Git到CORS/邮件/Host/iframe/ACL/Arjun/重置/Unicode/RL等，把state/cookieDoS/上传/RCE混列；参数发现、权限终态与执行消费各证，头列表真实受信proxy/格式另验。工具数量/名称不是覆盖，不自动扫描/brute/发邮箱或上传。

来源：[保存帖1](https://x.com/i/status/1864899669899595947)。


## 保存正文0246：redirecturi与跳转链（oauth）

正文提出操控redirect_uri/openredirect链，图不可读流程不补全文；注册匹配、授权请求/码兑换同uri、state/PKCE、AS/client角色及码/token不同consumer绑定分别核验。单openredirect不证token泄露/ATO，未OAuth登录或请求外链。

来源：[保存帖1](https://x.com/i/status/1864761665142899048)。


## 保存图证0247-35-oauth：1865637763636183415-02.jpg

已实际核对保存图片 `1865637763636183415-02.jpg` 的原始像素。账号接管思维图列举密码重置 IDOR/poisoning、认证后 IDOR、CSRF、弱密码学、OAuth 配置、预认证、限流、敏感信息及响应/状态/参数污染/批量赋值/令牌伪造。它是审计路径索引；每条需证明相应身份生产者与后端消费者之间的边界和最终账号能力，客户端响应改写或状态码变化不能生成有效服务端会话。左边裁切且外链正文未读，不能当作全部利用步骤。

来源：[保存帖1](https://x.com/i/status/1865637763636183415)。


## 保存正文0248：外部 IdP 邮箱不应自动合并本地身份（oauth）

正文说自建 Okta 实例可用未验证受害邮箱登录 SaaS。需绑定受信发行者、租户和外部 subject 到本地不可变账号，而非仅以 email 声称归并；邀请、验证状态及组织切换的真实消费者需分别核验。图为假设流程末行裁切，无最终权限回执，不泛化所有 SSO，不创建用户或邀请第三方。

来源：[保存帖1](https://x.com/i/status/1868327605142995200)。


## 保存正文0248：OAuth 键盘聚焦行为需要真实同意终态（oauth）

标题和图说hash按钮ID加按住空格可促成授权；摘要要求访问钓鱼链接与按键、范围通常有限。核 fragment 聚焦、默认按键处理、授权界面显示client/scope与后端授权对象；不能改写为zero-click或完整ATO。两来源保留，未创建第三方应用、发送链接或诱导用户。

来源：[保存帖1](https://x.com/i/status/1868974604750143644)、[保存帖2](https://x.com/i/status/1868977045851545670)。


## 保存图证0248-1-oauth：1868327605142995200-02.png

已实际核对保存图片 `1868327605142995200-02.png` 的原始像素。Okta 多租户示意：攻击者创建 target.com 组织邀请受害邮箱、绑定自己的 Okta、创建同邮箱未验证用户，再登录并切换受害组织。关键是信任的 issuer/tenant、外部 subject 与本地不可变账号的绑定，不能仅按未验证 email 合并身份；邀请待接受成员与真实权限、组织切换消费者也须独立核验。末行裁切、无原始请求，不能泛化所有 Okta SaaS；未邀请、建账号或操作真实租户。

来源：[保存帖1](https://x.com/i/status/1868327605142995200)。


## 保存图证0248-37-oauth：1868974604750143644-02.jpg

已实际核对保存图片 `1868974604750143644-02.jpg` 的原始像素。LinkedIn OAuth 报告称 hash 按钮 ID 与按住空格使用户未明确同意授权第三方，摘要限定需访问钓鱼链接和按键、第三方能力通常有限，严重度6.8改4.2。需核 fragment 聚焦/默认键动作、同意界面、实际授权主体/范围与回调终态；不是零点击或完整接管，未发送钓鱼、注册应用或诱导用户。

来源：[保存帖1](https://x.com/i/status/1868974604750143644)。


## 保存正文0249：第二邮箱不应以邮箱字符串继承别人角色（oauth）

正文问添加CEO邮箱是否额外权限并称bug。需证明别名控制/验证、SSO或邀请合并、本地immutableaccount和组织角色消费者；声明同邮箱不等于所有权，正常验证自有别名是反例。无真实主体/终态，不自动确认CEO提权，不添加真实邮箱或邀请。

来源：[保存帖1](https://x.com/i/status/1873602759494418919)。


## 保存正文0249：双击窗口切换受浏览器与业务终态约束（oauth）

DoubleClickjacking正文称几乎所有大站ATO，图说明顶窗关闭后第二击到opener授权页。需要浏览器popup/opener/COOP、焦点坐标和真实动作的时序证据，授权scope与终态另证；非iframe不表示全部防护失效，不能泛化所有站点。未创建页、发送链接或诱导点击。

来源：[保存帖1](https://x.com/i/status/1874129860508983564)。


## 保存图证0249-160-oauth：1874129860508983564-02.jpg

已实际核对保存图片 `1874129860508983564-02.jpg` 的原始像素。DoubleClickjacking流程图：用户打开子窗口，延时改opener到target/oauth，首击onmousedown关闭顶窗、次击落在下方页面。需核浏览器popup/opener/COOP、窗口/焦点和坐标时序、真实授权按钮及scope/终态；非iframe流程不意味着所有modern mitigations都失效，不能推广几乎所有网站ATO。未创建页面或诱导点击。

来源：[保存帖1](https://x.com/i/status/1874129860508983564)。


## 保存图证0249-192-oauth：1874703237405909099-02.jpg

已实际核对保存图片 `1874703237405909099-02.jpg` 的原始像素。window.environment列REACT_APP_API_ENVIRONMENT prod、FLAGSMITH_ENVIRONMENT_KEY、AUTH0_AUDIENCE空、CLIENT_ID和DOMAIN等遮挡值。客户端ID/域、前端环境标识通常用于公开配置，Flagsmith键需核前端/服务端用途和权限；prod名称或空audience不自动证明秘密泄露/鉴权绕过。需真实引用、环境与允许功能证据，未复原/使用key或请求Auth0。

来源：[保存帖1](https://x.com/i/status/1874703237405909099)。
