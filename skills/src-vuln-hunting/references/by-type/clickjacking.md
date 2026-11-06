# 点击劫持

适用信号：敏感操作页面可被不可信站点嵌入

## 检查与最小实验

先检查实际响应的 frame-ancestors / X-Frame-Options 与浏览器嵌入结果，再确认嵌入后是否仍带有效身份、有敏感可操作控件。用受控页面和自建账号演示一个获准的可逆操作。

保留浏览器版本、视口、点击落点和权威状态变化；存在重新认证/确认步骤时纳入实际交互链。只验证页面可加载不能替代动作可达。

## 证据与反例

缺防嵌入响应头、静态宣传页可 iframe 加载，不足以证明业务影响。CSP 阻止嵌入或第三方 cookie 策略使身份不可用时，应限定结论。

## Agent 行为

仅做自我控制的界面验证，不向用户投递诱导页面；按项目是否接受该类型及实际影响定级，不自动和 CSRF 合并。

## 调研来源

- [PS-click · Clickjacking](https://portswigger.net/web-security/clickjacking)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

CSP与X-Frame-Options的关系按有效指令、交付方式与浏览器版本判断：CSP中的其他指令不自动覆盖X-Frame-Options；[CSP3工作草案frame-ancestors与XFO关系](https://www.w3.org/TR/CSP3/#frame-ancestors-and-frame-options)规定资源交付的enforce策略含frame-ancestors时忽略XFO（2026-10-09核对）。记录实际响应、有效策略与受控嵌入结果，不能用“CSP是XFO敌人”推导可点击劫持；响应不能嵌入也不说明[CSRF](csrf.md)请求必然未发生。

## 嵌入API与响应保密性

Cookie认证的API能在iframe中加载，不代表外站脚本可读取其私密正文；同源策略、嵌入许可、自动身份和可诱导的敏感控件分别核对。纯JSON/资料展示没有可操作控件时不能仅凭iframe代码确认点击劫持；读取主张应另转[CORS](cors.md)或[XSSI](xssi-jsonp.md)，状态侧信道转[XS-Leaks](xs-leaks.md)。只检查自有账号的合成内容与可逆动作，不“收集受害者数据”。


## 缺响应头的 clickjacking 通知不是敏感动作证明

完整奖赏图写lack of sensitive headers leads clickjacking300，正文建议检查每个项目，没有响应/CSP、可嵌入页面或动作结果。

离线自有两个origin比较XFO/CSP frame-ancestors、实际嵌入、会话Cookie策略与敏感合成动作是否被误触。缺header、能框公开页面或奖赏不是影响；浏览器拒绝、无动作或额外确认为反例，先绑定项目资格与行为规则而非批量检查全部站点。

来源：[保存帖1](https://x.com/i/status/1495240347756077057)。


## 多步点击覆盖样例与拖放标题并非同一机制

保存图实际是透明 account iframe 叠在两个提示点击位置，未见拖放数据处理。需核对可嵌入策略、frame-ancestors/X-Frame-Options、页面布局/滚动、各次点击与最终敏感操作；用自有账户比较正常与覆盖操作。CSS opacity/z-index 和两个标签只说明布局候选，不证明成功诱导或权限绕过；不把点击例子改写为已实现的拖放漏洞。

来源：[保存帖1](https://x.com/i/status/1649810040205762563)。

现有图片证据 `1649810040205762563-02.png`：样例为opacity0.1/z-index2的accountiframe覆盖firstClick/secondClick两位置标签；不是dragdata代码，需实际framing policy/UIstate/action，帖子drag标题与click例子不一致。


## 可嵌入页面与诱导提交链需要独立证据

同报告把 clickjacking 当 XSS 触发辅助，必须分别确认 frame-ancestors/X-Frame-Options、受害主体、自控嵌入层、可见交互和 onsubmit 后实际保护操作。允许嵌入不等于可以诱导特定动作，视频封面不能补用户点击序列。仅在自控两页面验证，无外部用户诱导。

来源：[保存帖1](https://x.com/i/status/1654237184184991745)。

保存图片 `1654237184184991745-02.jpg`：Expedia origCity UPPER/WAF title，onsubmit需点击并声称clickjacking，视频封面未播放；eventtrigger/大小写HTML和JS不同、iframe可嵌入不等完整诱导。 本段只使用已保存且实际查看的内容。


## 页内目标在底部时的 iframe 定位与同源限制

正文建议 auto-scroll iframe。先确认目标可被嵌入并在实际浏览器找到可交互元素，再验证用户点击后的业务效果；跨源父页不能任意访问 iframe DOM 或执行滚动脚本。可用位置布局或受控交互的实际效果必须录证，自动滚动建议不等所有跨源页面都可控，更不消除点击和敏感操作前提。

来源：[保存帖1](https://x.com/i/status/1685761181188083712)。


## frame ancestors 子域模式与基域匹配须实际验证

正文策略 `frame-ancestors 'self' https://*.foo.foo:*` 并建议检查 http://foo.foo 是否 claimed。scheme、wildcard 子域、基域和端口各是不同匹配条件，http 基域不能据字面视为该 https wildcard 的允许源。先在实际策略/浏览器版本核对 framing，再判断获准控制的源是否匹配及敏感点击可达；域可注册也不自动绕过 CSP，更不授权注册真实第三方域。

来源：[保存帖1](https://x.com/i/status/1687019472438321153)。


## 保存图证0192-142-click：机制与验证条件

保存图片 `1711668027350233180-02.jpg`：Burp1274695历史2021摘要描述headlessChrome远程调试WebSocket端口、已知Chrome XSS+JS端口探测/clickjacking→取得debugGUID，再经download写user.vmoptions，下一次Burp启动及OOM参数才触发OS命令。多步本地配置/未来启动是前提，非单iframe即时RCE；视频与完整步骤未保存。审计调试通道transport/文件写权限/重启与预算，隔离无害标记验证，不探端口、写启动参数或制造OOM。

来源：[保存帖1](https://x.com/i/status/1711668027350233180)。


## 0194：点击劫持以敏感动作而非登录页为验证单位

正文建议关注每个敏感动作。应在自有页面确认目标可被嵌入、有效 frame-ancestors/X-Frame-Options、实际用户手势、会话、目标按钮与最终状态改变，比较保护开启和顶层访问。iframe 可见本身、诱导截图或奖励通知不等于动作成功；无需在他人会话上试验。

来源：[保存帖1](https://x.com/i/status/1715366514721988867)。


## 保存图证0222-106-click：1803327581753622802-02.jpg

已实际核对完整保存图片 `1803327581753622802-02.jpg`。Clickjacking说明以登录敏感页面如disable2FA/改邮箱密码/删号/删APIkey/开关为候选，建议第三方clickjackerURL测试。frame可嵌不等可诱导完成动作，需实际frameancestors/XFO/会话SameSite/重认证/交互可达性及最终state，使用本地虚拟页面且不把登录敏感URL传第三方，不实施敏感动作。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1803327581753622802)。


## 保存图证0223-67-click：1805466821434523890-02.jpg

已实际核对完整保存图片 `1805466821434523890-02.jpg`。安全头表介绍 HSTS、X-Frame-Options、X-Content-Type-Options、CSP、Cache-Control 和 Referrer-Policy，但省略具体值和部署前提。缺少头不是独立漏洞；HSTS依赖安全来源及缓存/preload状态，XFO/CSP framing要结合可嵌入敏感动作，nosniff不等于自定义MIME，CSP依实际策略而非名称，缓存及Referrer按私有数据和实际跨源流向核实。记录原始头值、浏览器上下文和允许/拒绝对照，不能照表声称所有XSS已防御或会泄密。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1805466821434523890)。


## 0227 图片 1815483062849060921-02.jpg click

现有图片 1815483062849060921-02.jpg 的完整可见内容已按原图审阅。

图片列出子域/CNAME、历史 URL、端口、GitHub、应用功能、CORS、重置密码邮件头/Host、iframe、访问控制、CSRF、SSRF、XSS/SSTI、令牌、限速、请求走私、重定向、社交登录 state、上传等候选检查面，应以资产—身份—对象—动作—证据映射驱动选择。Arjun 找隐藏参数而非保证隐藏端点；X-Forwarded-* 等头仅在受信代理链消费时影响身份或限速。CNAME 悬空不等于可接管，iframe 可嵌入不等于可诱发敏感动作，重置令牌与 OAuth state 应验证单次使用和会话绑定。MassScan、目录爆破和多 cookie 压力提示需独立授权及预算，不把列表当执行计划。

来源：[保存帖1](https://x.com/i/status/1815483062849060921)。


## 保存图证0235-80-click：1837888215371395474-02.jpg

已核对保存图片 `1837888215371395474-02.jpg`。安全头图分 CSP/CORP、HSTS、Referrer/Permissions、nosniff、XFO/COOP/COEP，但策略用途有简化：CORP 不等通用CORS许可，COOP/COEP不能直接代替防iframe，nosniff不消除所有注入。应按浏览器上下文、头值、加载/嵌入行为和实际权限核生效，缺一个头不自动是漏洞，HSTS还有首访/域范围条件。未改配置或请求目标。

来源：[保存帖1](https://x.com/i/status/1837888215371395474)。


## 保存图证0235-95-click：1838248034997555456-02.jpg

已核对保存图片 `1838248034997555456-02.jpg`。19项2FA图混合码生命周期、旧会话、备用码、重置/邮箱、空/缺失/可预测码、Referer、直达API、客户端改success/状态、跨会话/账户、记住我与CSRF。客户端改200/true不能改变服务器验证，Referer不可靠，跨会话码是否允许需按用途账户策略；用自有角色/明确MFA状态测试服务器动作，不穷举、诱导或使用他人OTP。

来源：[保存帖1](https://x.com/i/status/1838248034997555456)。


## 保存图证0236-19-click：1838922203972112449-02.jpg

已核对保存图片 `1838922203972112449-02.jpg`。2FA图分setup/secret/旧会话、码泄露/复用/空值/限速/JSON/OAuth和disable/恢复/CSRF。按用途、账户/会话、有效期与验证状态检查server动作，Referer和客户端响应非身份；记住旧会话是否合规需具体策略，不因秘密可见或缺口令一概ATO，不爆破或修改真实MFA。

来源：[保存帖1](https://x.com/i/status/1838922203972112449)。


## 保存图证0236-61-click：1840201812860674488-02.jpg

已核对保存图片 `1840201812860674488-02.jpg`。第二字节2FA图同setup/bypass/disable检查索引，按真实主体、secret/备用码用途、生命周期和server动作验证；客户端/Referer/形态变化不是MFA验证结果，不爆破/设置真实MFA。

来源：[保存帖1](https://x.com/i/status/1840201812860674488)。


## 保存正文0238：mouseover 不是任意交互或自动触发（click）

正文用绝对定位与整页尺寸扩大事件区域。事件条件仍依真实 DOM、布局、鼠标与浏览器，不能把 onmouseover 称为点击、键盘或任何交互均可触发，更不必然零交互。记录可控属性、事件与 CSP 上下文和具体用户动作，不运行或部署页面。

来源：[保存帖1](https://x.com/i/status/1844653299246694407)。


## 保存图证0238-74-click：1845668009064407235-02.jpg

当前附件 `1845668009064407235-02.jpg`。已实际审阅保存的原始图片。会话图列 token 承载、Cookie 标志/范围/期限、绝对与空闲超时、注销、多会话、随机性、身份变化及共享会话。按服务器实际签发、消费与撤销状态验证，Cookie 到期不证明后端失效，多会话并存也不必然违规；HttpOnly/Secure 不替代对象授权或 CSRF 保护，不使用 token 或改变账户。

来源：[保存帖1](https://x.com/i/status/1845668009064407235)。


## 保存图片0240：附件054（click）

2FA 图列出响应/状态改写、代码泄露、跨账号绑定、直接访问、Referer、重置/禁用、CSRF/点击劫持、备份码、旧会话、次数及重用。客户端 Success 或200改写不证明服务端授权，需访问受保护功能；验证码绑定主体、会话、操作、期限与一次性分别核对。固定100–200次和一天建议不是通用测试预算或风险判断，旧会话是否失效取决于约定，未爆破、重置或诱导用户。

图片证据：`1849491272966561887-02.jpg`；仅保存图实际可见内容，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1849491272966561887)。


## 保存图片0243-9：1855151789647315183-02.jpg（click）

已审阅保存原图 1855151789647315183-02.jpg。会话清单按载体/flags/domain/path/期限/idle/logout/并发/randomness/旋转/共享会话/puzzling及CSRF点击劫持。cookieExpires不同服务端失效，多会话或logout发新token不是统一产品义务；权限升级/降级和撤销后的protected动作独立验证，未使用会话或请求。

来源：[保存帖1](https://x.com/i/status/1855151789647315183)。


## 保存图片0244-19：1857029471431238131-04.jpg（click）

已审阅该内容原图，当前保存附件 1857029471431238131-04.jpg。OWASP目录末段有逻辑时序/次数/工作流/误用/上传、DOM/JS/HTML/CSS/资源/CORS/Flash/clickjacking/WebSocket/postMessage/storage/XSSI及GraphQL、报告附录；历史Flash项不代表现代默认能力，目录不证测试完成。按消费者和业务终态分组，API/schema可见性仍需权限证据，恶意文件/跨站动作另授权。

来源：[保存帖1](https://x.com/i/status/1857029471431238131)。


## 保存正文0244：成功比例标题的界限（click）

保存标题称Clickjacking80%和奖金，无frame策略、登录态、用户动作和敏感终态；数字不是跨计划通用接受率。只有真实页面可嵌入/操作诱导/服务端动作的自有对照才支持影响，外链全文按覆盖未取，不诱导用户。

来源：[保存帖1](https://x.com/i/status/1857062135773168011)。


## 保存图片0245-26：1860232243962347767-03.jpg（click）

已审阅该内容原图，当前保存附件 1860232243962347767-03.jpg。命令执行教育卡说OS调用安全构造字符串，直接参数数组/解释器和用户输入边界需明确，单纯OS调用非漏洞；下方clickjacking仅标题/icon没有手法，不补机制，未运行。

来源：[保存帖1](https://x.com/i/status/1860232243962347767)。


## 保存正文0249：双击窗口切换受浏览器与业务终态约束（click）

DoubleClickjacking正文称几乎所有大站ATO，图说明顶窗关闭后第二击到opener授权页。需要浏览器popup/opener/COOP、焦点坐标和真实动作的时序证据，授权scope与终态另证；非iframe不表示全部防护失效，不能泛化所有站点。未创建页、发送链接或诱导点击。

来源：[保存帖1](https://x.com/i/status/1874129860508983564)。


## 保存图证0249-160-click：1874129860508983564-02.jpg

已实际核对保存图片 `1874129860508983564-02.jpg` 的原始像素。DoubleClickjacking流程图：用户打开子窗口，延时改opener到target/oauth，首击onmousedown关闭顶窗、次击落在下方页面。需核浏览器popup/opener/COOP、窗口/焦点和坐标时序、真实授权按钮及scope/终态；非iframe流程不意味着所有modern mitigations都失效，不能推广几乎所有网站ATO。未创建页面或诱导点击。

来源：[保存帖1](https://x.com/i/status/1874129860508983564)。
