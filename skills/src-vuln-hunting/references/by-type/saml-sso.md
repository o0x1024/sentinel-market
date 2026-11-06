# SAML SSO

适用信号：企业 IdP/SP、SAMLResponse、Assertion 消费

## 检查与最小实验

从正常测试登录记录 IdP、SP、ACS、请求 ID、签名覆盖节点和最终使用的身份字段。先用离线 XML/验签工具追踪“被验证的节点”与“被业务消费的节点”是否同一对象。

分别核对受信 IdP 证书、Audience、Recipient/Destination、时效、重放与流程关联。对签名包装线索只使用测试断言和隔离环境，避免把重复 XML ID 当成已绕过。IdP 发起与 SP 发起模式不同，缺 InResponseTo 需要结合实际 flow。

## 证据与反例

Assertion 未单独签名不一定有问题，合法签名的整个 Response 可覆盖它；自签名 IdP 证书也不等于不可信。应证明未受信身份/属性被用于建立会话，或不应接受的断言被实际消费。

## Agent 行为

敏感断言离线处理，使用自有测试身份。需要新增 IdP、改信任或跨 SP 的动作只按现有许可执行；缺条件则记录协议线索并继续其他分支。

## 调研来源

- [OWASP-saml · SAML Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## SSO登录提示与已验证会话主体

旧图以阻断/删除Cookie、改saml?login邮箱后“登录另一账号”的流程描述风险，未提供SAMLResponse、实际IdP认证与SP会话证据。查询邮箱可仅是登录提示/账号选择，不应代替经过信任验证的断言主体；还需排除IdP残留登录、合法委派、错误页和仅UI变化。

对获准两个合成身份或已有脱敏日志，串起登录提示、AuthnRequest关联、IdP认证主体、被验签Response/Assertion、业务消费身份字段、SP稳定账号ID与新会话能力。浏览器清一个站点的Cookie不保证另一个IdP身份已退出；提示值变化只有在错误主体真正用于会话/资源授权时才支持接管。保留拒绝/合法提示反例，不登录真人身份、安装Cookie编辑扩展或改企业SSO信任。


## SAML浏览器往返的SP与IdP信任边界

图画SP产生请求、浏览器转IdP认证、IdP响应经浏览器送ACS再登录，没有签名检查实现。

绑定SP/IdP/ACS、请求身份及会话、被验签的具体节点、issuer/audience/recipient/时间和重放检查；合法登录序列、只存在SAML响应、缺签名实现或配置不匹配是反例。流程图用于定位校验点，不能补出签名绕过。

来源：[保存帖1](https://x.com/i/status/1441792688769011715)。


## SAML 会话签名产物与服务端身份接受分别取证

图显示会话数据解码、签名生成和 Cookie 页面，但浏览器仍展示登录界面。

定位真正的签名验证者、密钥来源、主体绑定与会话创建条件，再核服务端是否接受及最终角色。生成字符串不代表伪造成功；Cookie 的 HttpOnly/Secure 属性也不能弥补签名或主体校验缺陷。保留字段关系，不复制令牌值。

来源：[保存帖1](https://x.com/i/status/1524443563156963328)。


## SAML 的 XML 解析与签名绑定需分别核对

实体及XML属性是解析候选，签名绕过则取决于验证的节点与最终消费的断言是否同一个对象。记录解析器、实体开关、canonicalization、ID唯一性及签名引用；在受控身份用有效/无效签名、重复节点或实体被禁的对照，确认实际subject/audience/时效/会话变化。单纯XML能解析或异常并不等于签名绕过或SSO接管。

来源：[保存帖1](https://x.com/i/status/1632781442324520960)。


## SAML 端点反射不能推断断言校验绕过

协议入口收到非正常 SAMLResponse 后可能走错误页 HTML sink，应单独记录 XSS 输出验证与 XML/assertion 的签名、issuer/audience、时效和会话绑定。保存片段无有效断言/登录结果；字符串在 SAML 参数中不自动是 SAML auth bypass 或 XXE。

来源：[保存帖1](https://x.com/i/status/1660289196420890624)。


## RelayState 保存后的下一次登录重定向需独立校验

GitLab摘要称SAML登录POST的RelayState外跳被保存在cookie，后续signin又导航。审查协议回调/返回URL规范化、会话与浏览器状态绑定、可保存/可消费时点，以自控允许/拒绝目的地比较每跳。token偷窃断言没有完整保存的第三方交换链，开放重定向、持久导航与各OAuth token consumer分别证明，不推所有第三方ATO。

来源：[保存帖1](https://x.com/i/status/1663485784618311680)。

保存图片 `1663485784618311680-02.jpg`：GitLabSAMLRelayStateURL不充分校验redirect且cookie保存，后续signin再次转，作者token偷窃断言而截图未完整oauth链；persistentnextredirect独立state/callback/tokenconsumer，不推所有第三方ATO。本段仅使用实际查看的保存原图，不补未保存内容。


## 保存图证0195-102-saml：1720369940191178979-02.jpg

Java doFilter截图在authenticateUser false且无SAMLResponse时检查isStarshipRequest，若无USER_IN_SESSION创建ProductAccess loginName admin，rest/user/session/roles值来自X-Starship-* headers，roles equalsadmin设Admin并调用validateAllowedOperations后写session。isStarshipRequest与authenticateUser函数未给，不能推任意header即bypass。核入口可信代理header清理、predicate/凭据校验、session创建与最终权限，在隔离fixture比较可信/伪造header与拒绝控制；标题CVE不替版本或完整漏洞确认。

实际保存图：1720369940191178979-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1720369940191178979)。


## 保存图片0206 1753976855089295841-02.jpg 的 saml 验证边界

HackerOne摘要明确 SAML-enabled组织新注册的email domain约束可被尾随控制字符绕过，普通POST /users按域名应重定向SSO；具体字符及后半请求未显示。核注册、SSO路由、邮箱规范化/验证、成员加入对同一主体的解析，以自有保留控制字符/拒绝输入fixture对照，不能补造字节或声称现有组织仍受影响，弱点标签null termination不等于已证明具体NUL。

图片证据：1753976855089295841-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1753976855089295841)。


## 正文0207 SAMLRequest外层编码与XML参数实体：saml

正文样本为表单base64 SAMLRequest、XML DTD外部参数实体与dana-na/auth/saml-sso.cgi。必须分别确认base64解码、XML解析、DTD参数实体配置和resolver网络行为；自有无害XML及禁DTD/外部解析负例比较消费日志。回环URL只是样本目的地，不能当实际请求授权；200/正常HTML不等出站回调、文件读取或会话接管，不发送归档payload。

来源：[保存帖1](https://x.com/i/status/1755849867149103106)。


## 保存图片0207 1755849867149103106-02.jpg 的 saml 验证边界

Burp中POST/dana-na/auth/saml-sso.cgi和base64 SAMLRequest，响应200、过期cookie、writeCSS HTML；未显示任何带外回调或文件正文。将外层表单解码、SAML XML解析及外部实体解析分层验证；自有禁用DTD/参数实体fixture与无害nonce负例，200/页面/分类不能确认XXE、SSRF或认证绕过。

图片证据：1755849867149103106-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1755849867149103106)。


## 正文0208 SAML表单到外部参数实体：saml

正文提供base64包裹XML及外部参数实体并指向127.0.0.1，但位置不证明产品、版本或可外联。分层核表单decode、SAML XML入口、DTD/参数实体解析与出网；自有禁网络解析fixture和无DTD/实体拒绝负例记录解析行为，响应200或登录页不是XXE确认。归档URL、实体或CVE标题不授权网络请求，不访问回环/OAST、不解析外部资源。

来源：[保存帖1](https://x.com/i/status/1759057650250137624)。


## 同内容图片0208 1759057650250137624-02.jpg 的 saml 验证边界

Burp中POST/dana-na/auth/saml-sso.cgi和base64 SAMLRequest，响应200、过期cookie、writeCSS HTML；未显示任何带外回调或文件正文。将外层表单解码、SAML XML解析及外部实体解析分层验证；自有禁用DTD/参数实体fixture与无害nonce负例，200/页面/分类不能确认XXE、SSRF或认证绕过。

当前保存图片证据：1759057650250137624-02.jpg。当前文件SHA-256与此前完整像素观察相同；复用其原始观察时间与证据限制，不将重复文件记为新的像素审阅。

来源：[保存帖1](https://x.com/i/status/1759057650250137624)。


## 保存图证0211 1768691612220342721-02.jpg saml

Citrix SAMLTest流程图把异常处理串为反射XSS；实际SAML认证、反序列化/RCE或外部实体未展示。分离XML属性解析、异常文本和最终HTML消费者，以惰性错误字符串比较编码与未编码，不能从接口名称推断SSO认证绕过。

图片证据：1768691612220342721-02.jpg。已核对完整可见像素；遮挡、裁切及未显示请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1768691612220342721)。


## 保存图证0211 1768691612220342721-03.jpg saml

文章图说明xml:space非法值进入异常{0}，实体解码后的script样式文本被HTML插值。保存步骤是Base64→JSON→压缩→Base64，POST SAMLResponse到teststoreAuth/SamlTest；请求底部裁切且无响应执行证据。合法default/preserve与最终HTML转义为反例；历史版本/异常模板决定边界，不执行、不泛化XXE或认证绕过。

图片证据：1768691612220342721-03.jpg。已核对完整可见像素；遮挡、裁切及未显示请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1768691612220342721)。


## 保存图证0216-37-saml：1784643927792128229-02.jpg

已实际核对完整保存图片 `1784643927792128229-02.jpg`。历史CVE摘要限定Airflow before2.8.2及FlaskAppBuilder AUTH_TYPE=AUTH_OID 的旧OpenID2.0，与OIDC不同；可控请求让后端使用可访问的任意OpenID服务，身份信任绑定是关键，精确请求未显示。离线IdP allowlist/issuer与状态/主体匹配的可信/不可信模型比较，不部署IdP或联真账号，当前版本适用须另核。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1784643927792128229)。


## 保存图证0223-64-saml：1805302150680957233-02.jpg

已实际核对完整保存图片 `1805302150680957233-02.jpg`。Lucid 注册/登录流程图显示邀请邮箱匹配、域锁定、SSO偏好、既有账户/新账户、自动配置或邀请入队、许可证及只读状态，并标注 Web/iPad 差异。建立邮箱所有权—可信 IdP身份—邀请接受—团队成员—许可证的独立状态，不能仅因同域或SSO偏好自动授予成员资格；检查既有账户合并及不同客户端是否保持服务端规则。图为设计流程而非实现证据，底部截断不补全，不访问内部链接、创建账户或接受邀请。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1805302150680957233)。


## 0231 正文 ASA ACS端点与缺失请求体 saml

历史Cisco ASA/FTD CVE-2021-3580截图出现SAML ACS的POST路径和tgname。路由含SAML并不自动是断言签名绕过；须确认产品/构建、字段消费者、HTML落点、认证和浏览器触发。请求体和执行结果未保存，不能补造payload或依据CVE标题证明当前部署受影响。

来源：[保存帖1](https://x.com/i/status/1826982953471344731)、[保存帖2](https://x.com/i/status/1826985232215547938)。


## 保存图证0231-24-saml：1826982953471344731-02.jpg

已核对保存图片 `1826982953471344731-02.jpg`。CiscoASA/FTD历史CVE2020-3580截图描述POST webservice反射XSS，现有下端只见+CSCOE+/saml/sp/acs?tgname路径及Cookie，body/响应未示。SAML路径不等于签名绕过，核反射输入、HTMLsink、CSP/真实浏览器和配置，旧Medium不推当前全设备，未发POST。

来源：[保存帖1](https://x.com/i/status/1826982953471344731)。


## 0233 正文 签名覆盖与消费对象 saml

SAML签名未验证、签名覆盖的节点与应用使用节点不一致、重复ID与命名空间差异是不同问题，XSW列表不代替实现分析。核信任证书、subject/audience/recipient/InResponseTo、时间和断言单次接受；DTD/实体解析与认证完整性分开，不伪造或重放真实断言。

来源：[保存帖1](https://x.com/i/status/1832834750903705851)。


## 保存图证0233-55-saml：1832834750903705851-02.png

已核对保存图片 `1832834750903705851-02.png`。SAML清单称XSW因签名未验证，实际需区分完全未验与已验节点/应用消费节点不一致，XSW1–8题名不提供实现。核签名覆盖/ID唯一/命名空间/信任证书、SubjectAudienceRecipientInResponseTo/时间及assertion一次接受，DTD/XXE/DoS与断言完整性分开，图右侧裁切不能补内容，未伪造/重放真实assertion。

来源：[保存帖1](https://x.com/i/status/1832834750903705851)。


## 保存图证0234-107-saml：1836459903805985052-03.png

已核对保存图片 `1836459903805985052-03.png`。Burp 第二页列 Param Miner、Backslash/版本扫描、SAML/JWT/Autorize、smuggling、active scan、Retire.js、日志/Turbo Intruder/回调及 REST API。扩展给候选信号而非漏洞保证，role comparison 需身份与对象基线，解码/重签不证明接受，旧 JS 版本不证明可达漏洞。localhost API 可触发扫描，应鉴权并限制监听/目标，高速、主动扫描和清日志均额外授权，未运行。

来源：[保存帖1](https://x.com/i/status/1836459903805985052)。


## 保存图证0234-111-saml：1836576661044642216-02.jpg

已核对保存图片 `1836576661044642216-02.jpg`。Keycloak 论坛截图展示 Nuclei v3.3.1、一个 unsigned 模板、1443 目标/1362 httpx URL 和 CVE-2021-20323 标签，文字简介 IAM/OAuth/OIDC/SAML。模板匹配和重复 URL 不是浏览器执行证据，且没有可见完整请求、HTML 上下文或模板规则；需固定受影响版本/realm、反射位置、编码/CSP 与授权目标来证实 XSS。截图当前版本标签为历史资料，本次未扫描、下载或执行。

来源：[保存帖1](https://x.com/i/status/1836576661044642216)。


## 保存正文0235：不可见字符需区分字面转义与身份规范化（saml）

正文给u200b与例子反斜线200b，字面文本不一定是真实U+200B，也不能称全部系统会自动规范化为同名。精确记录Unicode码点/原字节、输入→存储→展示→查找/SSO映射，并以稳定account ID作身份锚点；视觉相同不等账号同一，邮箱提供方规范化与服务规范化也不同，不创建重复账号或发邮件。

来源：[保存帖1](https://x.com/i/status/1837778313852404201)。


## 保存图证0235-41-saml：1837172996651278581-02.jpg

已核对保存图片 `1837172996651278581-02.jpg`。AWS SAML 图分 API AssumeRoleWithSAML 和 Console/ADFS 登录：IdP 认证→断言→STS 临时凭据或控制台重定向。验证断言签名、受信 IdP、Audience/Recipient/时效/Role 映射与最终 AWS principal/权限；IdP 登录成功不代表任意角色，临时凭据也须用途/有效期，不转录使用凭据或登录云账户。

来源：[保存帖1](https://x.com/i/status/1837172996651278581)。


## 保存正文0236：Keycloak产品检索不等SAML漏洞验证（saml）

保存HUNTER/FOFA产品查询和CVE题名只生成部署候选，登录页是OIDC而非SAML证据。实际SAML消费须核构建/配置、可信IdP、被验签节点与被消费subject/role、唯一ID/时效/用途，不能由产品指纹或登录页确认签名绕过，未搜索、下载断言或登录。

来源：[保存帖1](https://x.com/i/status/1838889981151998462)。


## 保存正文0239：SAML 编辑工具与最终验证结果（saml）

保存图介绍消息绑定和证书/私钥管理，不能证明修改消息被服务端接受。把请求、签名实际覆盖节点、证书信任、标识映射、条件与最终身份分开核对；工具旧版本与安装成功不是漏洞证据，不安装、导入密钥或交换消息。

来源：[保存帖1](https://x.com/i/status/1846219692391731288)。


## 保存图证0239-30-saml：1846219692391731288-02.jpg

当前附件 `1846219692391731288-02.jpg`。已实际审阅保存的原始图片。旧 Burp BApp 图显示 SAML Raider 1.2.3 的安装位置、POST/Redirect/SOAP 等绑定及证书/私钥导入导出、克隆与自签功能。工具能编辑消息不证明 SP 会接受，应追踪被验证的签名节点、证书信任及最终身份消费。版本只是图片当时信息，不安装、导入密钥或登录实验。

来源：[保存帖1](https://x.com/i/status/1846219692391731288)。


## 保存图片0243-74：1856562534767300924-02.jpg（saml）

已审阅保存原图 1856562534767300924-02.jpg。SAML图包含Golden SAML、证书信任/伪造、XSW、XML注入、完整性/签名、重放、CSRF、注释、XSLT及Recipient混淆；分别绑定IdP/SP、签名引用节点与实际消费节点、可信密钥来源、受众/接收端、时效和一次性请求，解析器实体及XSLT配置另验。Golden SAML需密钥权限等前提，目录/实验资源不证明实际漏洞，未取密钥或登录。

来源：[保存帖1](https://x.com/i/status/1856562534767300924)。


## 保存图片0244-68：1858722046043455911-02.jpg（saml）

已审阅该内容原图，当前保存附件 1858722046043455911-02.jpg。HackerOne报告称更换到企业邮箱后安全扫描bot自动打开验证链接，引发无需人操作的邮箱验证，页尾SAML后续链裁剪。邮件扫描器访问不是邮箱所有人同意，须区分验证链接持有、账号/旧新邮箱绑定、一次性/时效、企业成员授权和SSO强制消费；不能推出组织全部接管，未注册/发验证邮件或联系公司。

来源：[保存帖1](https://x.com/i/status/1858722046043455911)。


## 保存正文0248：外部 IdP 邮箱不应自动合并本地身份（saml）

正文说自建 Okta 实例可用未验证受害邮箱登录 SaaS。需绑定受信发行者、租户和外部 subject 到本地不可变账号，而非仅以 email 声称归并；邀请、验证状态及组织切换的真实消费者需分别核验。图为假设流程末行裁切，无最终权限回执，不泛化所有 SSO，不创建用户或邀请第三方。

来源：[保存帖1](https://x.com/i/status/1868327605142995200)。


## 保存图证0248-1-saml：1868327605142995200-02.png

已实际核对保存图片 `1868327605142995200-02.png` 的原始像素。Okta 多租户示意：攻击者创建 target.com 组织邀请受害邮箱、绑定自己的 Okta、创建同邮箱未验证用户，再登录并切换受害组织。关键是信任的 issuer/tenant、外部 subject 与本地不可变账号的绑定，不能仅按未验证 email 合并身份；邀请待接受成员与真实权限、组织切换消费者也须独立核验。末行裁切、无原始请求，不能泛化所有 Okta SaaS；未邀请、建账号或操作真实租户。

来源：[保存帖1](https://x.com/i/status/1868327605142995200)。
