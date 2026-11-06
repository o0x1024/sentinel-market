# 开放重定向与转发

适用信号：return URL、登录后跳转、链接中转、服务端 forward

## 检查与最小实验

先区分服务端 Location、客户端导航、内部 forward。用获准受控落点检查解析后的 scheme/host/port，而非只检查文本前后缀；记录浏览器最终 URL 与全部跳转链。

只在输入验证代码或实际行为支持时，检查相对 URL、编码和多层解析差异；不要把一份历史 URL 变体表无条件跑遍目标。

URL 中 `@` 前的 userinfo 不能作为主机判定依据。例如 `https://allowed.example@receiver.example/` 的主机应按实际解析结果核对，而不是因字符串含允许域就放行。存在解码、Unicode 规范化或代理再解析时，保存每一层输入和最终消费者结果；测试落点使用获准受控地址，不把某个变体宣称为通用绕过。

输入来自 URL fragment 时，先跟踪客户端是否读取并传给导航 sink。`#` 后出现外域文本不单独产生重定向；保存原始 URL、实际客户端解析与导航结果，和服务端 Location 路径分开归因。

## 证据与反例

页面里出现链接、被拒绝的 URL、正常允许的链接中转不等于违规重定向。若声称 OAuth 凭据泄露，要证明凭据实际到达受控落点；单纯开放跳转不自动获得该影响。

## Agent 行为

不向真实用户发送链接，不跟随到未授权站点。单项是否收录按具体 SRC 规则；风险链未验证时明确写潜在条件，见 [OAuth/OIDC](oauth-oidc.md)。

## 调研来源

- [OWASP-redirect · Unvalidated Redirects and Forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

next/return字段可能同时进入HTTP跳转、登录表单、注册按钮href与其他后续页面。第一步回到本站不代表所有消费者都安全，也不证明点击任意外链就是开放跳转；关联原始可控字段、每处输出、实际交互、最终落点和应有的目的地规则。静态已允许外链或只在测试者编辑DOM后导航作反例。用获准受控落点分别证明动态链接污染与自动/点击导航，不借真实用户点击或携带真实凭据补链。

## 条件分支中的客户端导航

客户端导航分析把取参函数、控制参数、分支比较、事件注册与导航赋值连起来。示例只在cid满足某个常量、用户触发decline点击时把redir拼接固定后缀后赋给window.location.href；缺getParameter实现/解码和实际事件绑定时，不知道完整可控输入与可达性。固定后缀不自动限定外源，但真实解析目的地仍须在获准自有导航对照中确认。

URL导航、javascript等脚本上下文和任意代码执行分别判断；源码引用没有实际部署、当前浏览器/CSP和触发证据时只是候选。不因片段含location就认所有页面自动跳转，不触发真实交易取消或诱导其他用户。

## HTML刷新导航与脚本执行的区别

HTML注入可能创建meta refresh导航，不能把“没有JavaScript执行”视为不存在导航能力。[HTML刷新规范](https://html.spec.whatwg.org/multipage/semantics.html#attr-meta-http-equiv-refresh)分别定义计时、URL解析和sandbox自动功能限制（2026-10-09核对）；纯文本回显、被消毒标签或不形成有效文档消费者都不能触发同样行为。

记录谁能创建标签、实际DOM/文档位置、最终解析URL、导航消费者及受控目标页面；若影响只在自有data页面，则不等于目标站漏洞。历史triager截图片段和PoC文字不能证明所有页面都支持，HTML导航、HTTP302与脚本执行分别描述。仅用获准隔离文档/自有导航标记，不诱导真人打开链接或据此外送会话。

## 百分号主机文本到域名解析的顺序

源文用百分号编码的Unicode句号/ASCII域名宣称多个浏览器可打开；需要分开记录原始地址、host提取、百分号到UTF-8字节解码、域名映射、实际目的地及展示文本。[WHATWG host parsing](https://url.spec.whatwg.org/#concept-host-parser)说明非opaque host的百分号解码/UTF-8到domain parser顺序（2026-10-09核读相关段落），不把这一层当完整应用URL规范化。

同一结果可由合法等价域名解析产生，单独不是开放重定向或SSRF。比较校验组件采用的最终host与真正导航/后台消费者，保留失败和各客户端版本；文字像同域不证明目的地同域。只对获准离线字符串/既有日志核对，不打开编码地址或以三浏览器旧声明保证当前所有实现。

## 重定向日志筛选器的条件与观察缺口

旧Logger++图用scope、302、GET及query/body中URL样式正则筛日志，随后建议爬整站与Fuzz；筛选结果只是选中的既有记录。固定布尔括号/AND与OR优先级、实际过滤器版本、匹配的是原始还是已解码字段、工具来源及scope应用位置，避免body分支漏受前面的限制。没有命中可能是状态、方法、编码、位置或观察器不匹配。

302加query里的URL不证明该值控制Location，正常OAuth授权回调也可满足条件；其他3xx、HTML/JS导航、相对地址或非GET不会因此被确认或排除。以获准已有正常/阴性脱敏日志核对选择集合和真正导航消费者，再决定有限单变量候选；不照来源爬全站、启动批量Fuzz或访问登录提供方。


## 双斜线路径、Location与自动跟随的出站

旧httpx命令将双斜线目标文本放在path并启用follow-redirects/location。请求路径里的字符串、原始响应Location、消费者解析后的目的地址和实际下一跳不同；路径包含主机样式文本不自行证明服务端返回外站导航。保存第一跳状态/原始头、解析基址、每跳目标及真正发起者，再判断允许表和范围。

自动跟随可能产生新的真实出站，应在执行前为每跳约束目的地/方法/头及预算，不能从最终页面逆推所有中间边或将第三方页面当目标内容。正常同源导航、无Location、固定服务器允许目标及不执行导航为反例；令牌带出/账号接管还需独立传递与身份能力证据。本批未运行旧命令或访问候选跳转，旧参数名称不保证当前版本相同。来源：[保存帖](https://x.com/i/status/1399732121879552002)。


## DOM URL成员清单与导航及HTML网络消费者

DOM列表把location及其host/path/search等读取成员，与assign/replace/open、srcdoc、AJAX和XHR一起列作open URL参数。它混合输入来源、导航、HTML解析及网络请求，任一名字出现不能统一认开放跳转。

绑定实际赋值/调用及参数来源，再分别判断导航目的地、HTML执行上下文、请求发起origin与返回数据可读性。只读location或请求被浏览器策略拦截是反例。退订重定向帖也缺真实Location/最终目的地，自己的子域不能自动扩大项目范围，本次未跳转或发请求。

来源：[保存帖1](https://x.com/i/status/1412277402177355777)、[保存帖2](https://x.com/i/status/1412662571417489408)、[保存帖3](https://x.com/i/status/1412662574231945225)。


## DOM导航与文档解析及XHR的不同sink

所谓15个DOM重定向参数混location属性、assign/replace/open、srcdoc、Ajax和XHR。属性读取、导航、文档解析和网络请求并不等价。

标记实际读/写方向、输入来源、URL解析/allowlist、真实导航目的地与文档origin；XHR open/send还需区分方法和请求体消费。只读location、正常API请求、非导航srcdoc或输入未控是反例，API名列表不证明开放重定向，更不补XSS或接管。

来源：[保存帖1](https://x.com/i/status/1426137788999553040)。


## 重定向端点与脚本scheme消费的两段保存线程

保存1/2给external-link.jspa url候选，保存2/2自述javascript对话框成功，没有执行origin/浏览器图。

将参数解码、允许scheme、Location或前端导航、读者origin、CSP和最终执行分别记录；仅字符串反射、浏览器阻止、脚本在另一个origin或普通外链是反例。只合并已保存两段，不由dork或success字样补所有同类端点可XSS。

来源：[保存帖1](https://x.com/i/status/1432322673791537153)、[保存帖2](https://x.com/i/status/1432322675435708419)。


## 前缀过滤重定向与斜杠消费者对照

截图称正常绝对URI返回403，前置斜杠后绕过；另两帖列三斜杠、无双斜杠scheme与反斜杠组合，没有Location或最终目的地。

固定获准跳转参数，比较服务端过滤、URL解析、响应Location与浏览器最终origin；相对站内路径、统一错误页、未跟随跳转或不同base是反例。前缀字符串不等于外部origin，不能把这些形态视为通用绕过。

来源：[保存帖1](https://x.com/i/status/1441390877931229189)、[保存帖2](https://x.com/i/status/1444599877082619910)、[保存帖3](https://x.com/i/status/1445026114666123270)。


## 并行 HEAD 检测与登录多斜杠的最终 origin

管道替换所有参数后 grep Location，另有登录多斜杠/P4 标题和信任名称路径图。

每个候选保留原参数、替换位置、方法、返回链、URL 解析及最终浏览器 origin；登录 return URL 独立记录解码次数与敏感值。HEAD/GET差异、相对路径、同域字符串、未走登录分支和安全允许域是反例。grep 命中或 triaged 标题不能证明外域跳转及 token 泄露。

来源：[保存帖1](https://x.com/i/status/1453027904405839875)、[保存帖2](https://x.com/i/status/1453292276055252996)、[保存帖3](https://x.com/i/status/1453419305731706881)、[保存帖4](https://x.com/i/status/1454412777011879941)。


## Unicode 域名显示长度与序列化 host

正文称某Unicode显示能缩短域名，配图只有仓库封面，未保存具体字符映射结果。

对同候选记录代码点、浏览器显示、URL序列化host、应用规范化、DNS归属和证书身份；按实际消费者比较允许域与origin。显示长度/视觉相似不等同一host或稳定映射；不同库拒绝/映射不同/确为独立域为反例。缺具体转换不补写必然绕过，不买域或访问候选。

来源：[保存帖1](https://x.com/i/status/1456855615687495681)、[保存帖2](https://x.com/i/status/1454412777011879941)。


## 编码反斜杠的验证与消费次序

技巧图用%5c混入含白名单后缀的URL，称绕过regex。成功取决于验证器/解码器/真实消费者如何处理该字节，不是所有域名检查通用绕过。

在自有fixture逐阶段保留原值、解码值、解析scheme/host/port、Location与最终目的，以URL规范化结果作比较；把%5c保留、拒绝反斜杠、严格host等值/允许后缀边界为反例。不访问归档外站或投递链接。

来源：[保存帖1](https://x.com/i/status/1479795026066653188)。


## gf redirect 输出和重定向证明分开

完整管线是waybackurls→httpx超时/线程→gf redirect→anew；图实际列多条redirect=no，输出文件却叫vulns。关键词筛选没有展示Location或导航目的。

离线保留原URL和阶段退出/超时、去重库及归属，再核真正跳转消费者，用自有目标/拒绝/相对路径对照。参数名、历史链接、短超时漏检或未有跳转为反例；结果名不改变证据等级。

来源：[保存帖1](https://x.com/i/status/1488455851711029252)、[保存帖2](https://x.com/i/status/1488552263492775937)、[保存帖3](https://x.com/i/status/1488768051453444098)、[保存帖4](https://x.com/i/status/1488847743367929860)、[保存帖5](https://x.com/i/status/1488857275166978048)、[保存帖6](https://x.com/i/status/1489591292279484416)。


## 三斜杠加 query 的 404 到跳转要核 Location

正文称同三斜杠外域路径不带query为404，附query则跳转；奖赏图250通知且要求披露细节需项目许可，没有原始Location/重定向链。

离线自有路由比较query存在与否、服务器规范化、相对/绝对Location和浏览器解释，逐跳核目标。地址栏输入、页面meta/JS导航、无响应头或不同应用为反例，不能称所有多斜杠输入都绕过；保留项目披露条款，不发布来源未授权细节。

来源：[保存帖1](https://x.com/i/status/1493535942359252995)、[保存帖2](https://x.com/i/status/1493833196068569090)。


## 二十五个 redirect 名称不等重定向消费者

完整词表含next/url/target/destination/redirect_uri/returnTo/checkout_url/continue等，另一图是Message参数与hacked弹框，未有Location或外部导航。

离线分别识别HTTP Location、前端导航、服务端抓取和业务返回路径，核URL解析、相对地址与允许origin。参数名称、XSS弹框、状态200或只回显字串为反例；需要真实导航消费者及无害同源/拒绝对照，不把redirect_uri直接判开放重定向。

来源：[保存帖1](https://x.com/i/status/1496919715306156032)、[保存帖2](https://x.com/i/status/1496932065039822856)。


## 回连 token 和自动探测要核真正产生者

正文称redirecturl回连带token/param0，完整图ngrok/Python HTTP日志出现一条含query的GET和.env/git/svn/robots等404；未有身份、token用途/权限或真实用户导航。

离线自有合成导航与服务端扫描分别记录关联标记、发送者、请求时间、参数来源、会话绑定/失效与受保护动作。回连可来自扫描器、分诊者或普通传递；字段名token、200与探测日志不是ATO/加重等级，不开真实server/收token或触发callback。

来源：[保存帖1](https://x.com/i/status/1502898662015643652)。


## 多斜杠 next 要核解析后的实际导航 origin

两个正文给next多斜杠evil字符串，没有实际Location或导航。

离线URL模型保留原输入、服务器Location、相对解析基址、浏览器归一化后schemehostport，比较单斜杠相对路径、协议相对和多斜杠。字符串含evil不一定外跳，拒绝/变成本站路径均反例；不导航未知目标，不称任何URLconsumer都可绕过。

来源：[保存帖173](https://x.com/i/status/1506833579644694534)、[保存帖193](https://x.com/i/status/1507235426490527744)。


## 二级跳转 query 传播需要每跳实际 Location

正文描述 company 把 query 带到第三方，再借第三方 open redirect 到控制域，示例域拼写也不一致。

离线 URL 链固定首跳、参数名/值及每层解码，记录实际 Location 和最终 scheme/host；第三方漏洞不自动归于首站，路径重写/参数丢弃或固定目标是反例。没有每跳响应不称已验证链，也不主动访问第三方。

来源：[保存帖1](https://x.com/i/status/1511544671092289539)。


## 开放重定向需证明超出实际允许目的地

概念图从可信站点指向另一站点；另帖只称可到几个知名域而其他域被拒。

记录 URL 解析后的目的地、允许规则、重定向响应和浏览器导航结果。被允许的外域可能是设计策略，并不直接证明任意目的地可控；接管还需要敏感 token 或身份消费者链，不能用概念箭头替代。

来源：[保存帖1](https://x.com/i/status/1517312061952327681)、[保存帖2](https://x.com/i/status/1518454622951821313)。


## 自制 302 响应按报文完整性和跟随主体核验

正文以监听器拼接 302、Location 和本机地址，没有保存完整请求结果。

核状态行、CRLF、头结束、最终 Location 与客户端是否跟随；HEAD 和 GET 也可能行为不同。回环地址属于连接发起主体的环境，不能由响应字符串推出服务端请求或内网可达。仅在自有离线报文中检查，不启动监听器或真实回调。

来源：[保存帖1](https://x.com/i/status/1522259994858737670)。


## 重定向循环脚本需保留原跳与解析后的目标

正文脚本替换 URL 参数、跟随 HEAD 重定向并匹配 Location 文本，存在变量与引用边界问题。

分别保存初始响应、每跳状态、相对地址解析和最终目标，核 HEAD 与真实业务方法差异。跟随后再 grep 字符串会混淆中间跳，域名子串也不等于精确允许的目标；不运行原脚本或跟随范围外地址。

来源：[保存帖1](https://x.com/i/status/1523365289622372353)。


## 隐藏字段仍需追实际请求与跳转消费者

图列 hidden 输入和多种 URL 写法，正文认为隐藏重定向字段更容易出现问题。

hidden 只限制普通界面展示，需从表单序列化追到服务端 Location 或客户端导航。核最终 URL 解析、允许来源和身份条件；可编辑字段不代表跳转任意来源，不因 UI 可见性推定安全强弱。

来源：[保存帖1](https://x.com/i/status/1525440800678629378)。


## OTP 的 domain 参数受理不等于已发生跳转

两图显示 OTP 生成请求中有 domain，响应仅 JSON success 和空 data，没有 Location 或最终落地页。

追参数到实际发送链接、重定向处理与令牌消费者，并保留接收身份。请求受理不能证明任意跳转或账户接管；正文题名中的完整链未保存，不以成功值补全。

来源：[保存帖1](https://x.com/i/status/1529832076748664832)、[保存帖2](https://x.com/i/status/1530130171142893569)。


## 白名单重定向链中的参数编码层次

第一跳认可受信域时，第二跳仍可能根据另一个参数导航。分别保存两跳原始 URL、解析后的参数和 Location；外层的 & 可能截断内层 token，编码后只有在正确的解码层才会恢复成分隔符。验证最终实际目的地及 token 的签名、用途和绑定，不能把某种编码写法直接当作所有实现的绕过。

来源：[保存帖1](https://x.com/i/status/1532757754577707009)。


## 登录后 return URL 按实际解析结果限制目标

正文列出多种 return URL 形式，图片显示登录后 JavaScript URL 的执行观察。保留登录前后每步 Location 或前端导航、实际 URL 的 scheme/host/port 与最终保护动作，验证规范化后的目标允许列表。普通 HTTP 跳转不自动构成 DOM XSS；只有导航消费者确实执行脚本方案才支持执行影响，不把字符串前缀或一次登录弹窗当成全域绕过。

来源：[保存帖1](https://x.com/i/status/1537873502745001984)。


## 历史重定向参数与生成器结果只是候选

正文串联历史 URL、在线状态筛选及重定向参数工具，另帖提到生成器。保持原 URL 和参数来源，在自有受控目的地核对当前 Location、实际前端导航与最终规范化目标；去重/新候选标记不能代替完整跳转链。失效历史路由、状态变化和生成器输出都不证明开放重定向，不能借旧参数扩大资产范围。

来源：[保存帖1](https://x.com/i/status/1540214485109346304)、[保存帖2](https://x.com/i/status/1540290402019942400)。


## 查询值替换与重定向候选保留原始 URL 结构

保存的 qsreplace 对比说明，替换全部参数会改变与目标字段无关的业务条件；正则、sed 和 awk 重建 URL 还可能丢失重复参数、顺序、编码及片段。先保留原请求，用真实 URL 解析规则只修改选定字段，再比较服务器返回的位置与最终导航。

历史 URL 中出现另一个 http 地址和多种斜杠、用户名部分、Unicode 或编码形式，只产生候选，不能确认浏览器与后端按同一种方式解析。分别记录输入、各跳 Location、最终来源与所需用户操作；客户端跟随跳转引起的外部请求不能当作服务器 SSRF。

来源：[保存帖1](https://x.com/i/status/1540725058817212416)、[保存帖2](https://x.com/i/status/1540893189875564545)、[保存帖3](https://x.com/i/status/1541410937194020865)、[保存帖4](https://x.com/i/status/1542176042441654273)。


## 隐藏字段与特殊路径重定向先证明实际导航

保存正文涉及隐藏 URL 字段、特殊点号路径及重定向参数与 RXSS 组合。逐字段保留原始请求、单变量修改、Location 和最终导航来源，确认哪个层次消费值；不能从“参数每个字段都能用”推出通用规则。

路径字符串本身不必然是外部地址，服务器返回与浏览器解析要分别观察。若声称与脚本执行相连，还需证明实际执行消费者与权限来源，奖励和 High 标签不能补齐缺失步骤。

来源：[保存帖1](https://x.com/i/status/1546827263265501184)、[保存帖2](https://x.com/i/status/1548827746276708352)、[保存帖3](https://x.com/i/status/1549455743497240578)。


## JavaScript跳转列表要追踪具体导航调用和允许协议

保存正文罗列JavaScript样式的跳转字符串。确定输入真正到达的是服务器Location、HTML链接还是客户端导航调用，比较解析后目标、协议限制、用户交互和浏览器策略。字符串看似脚本、过滤器放行或返回200不证明跳转或执行；使用自有无害目标记录导航链，避免把不同消费位置的候选混为通用重定向绕过。

来源：[保存帖1](https://x.com/i/status/1555898799037743104)。


## 重定向工具选项要分别验证URL消费与响应头

Oralyzer 帮助页展示目标列表、CRLF、自定义载荷、代理和历史来源等选项，并提示部分选项不能同时使用。先核对安装版本的真实选项组合，保留输入来源、原始响应头、每个跳转和最终目的地址。开放重定向需要实际消费不可信目的地址；CRLF 需要证明响应头解析差异，两者不凭工具名合并。历史 URL 和工具命中仅作候选，每跳重核范围，限制请求预算，避免跟随到未获许可的资产。

来源：[保存帖1](https://x.com/i/status/1560651543103557634)。


## 重定向转XSS须证明目的地址的实际消费

保存文章开头仅说明用户可控跳转目的地址，正文另列控制字符和 JavaScript 协议候选。核对服务端与浏览器对 scheme、转义和规范化的解析，保持完整跳转链与实际执行 origin；跳到外部网站与在原 origin 执行脚本分开证明。标题、截断线程或候选字串不证明链成立，仅用自有目的地址和无害标记，逐跳核对范围。

来源：[保存帖1](https://x.com/i/status/1563957849335775232)、[保存帖2](https://x.com/i/status/1562170549434040322)。


## 登录跳转参数须核对真正导航和信息携带

正文描述登录期间开放重定向，图仅奖励通知。以自有允许域与受控非敏感目的地址比较URL解析、编码/规范化、服务端Location、客户端导航和会话状态，记录每跳最终地址及是否携带敏感信息。奖励、redirect参数可修改或出现302不能证明任意外域导航，更不能直接宣布ATO或OAuth token泄露；缺少全文按覆盖但保留结论边界。

来源：[保存帖1](https://x.com/i/status/1567787514013929473)。


## 搜索查询与实际回跳目标不能混同

DuckDuckGo 示例是编码查询参数，Google dork 的负 inurl 条件会排除包含指定词的结果。搜索结果只能定位候选，不保证目标存在回跳接口。固定真实业务请求，观察服务端 Location、客户端导航、每跳原点与最终目的地，比较注册/登录/登出等独立入口。标题中 may token/cookie 泄漏需实际传输证据，六条 P4 Unresolved 标题不是六个已确认漏洞。

来源：[保存帖1](https://x.com/i/status/1569629055674384385)、[保存帖2](https://x.com/i/status/1572979246850772999)。


## 登录和注册回跳应各自验证当前修复状态

奖励邮件区分已修复 sign-up 和未知 sign-in 回跳。固定每个入口的业务流程、身份与允许目标，分别检查同一候选的实际解析、导航链和最终原点，避免一个功能已修复就宣称全部已覆盖。邮件没有真实参数，不补造 payload；严重度与 token/cookie 泄漏仍需自己的传输证据。

来源：[保存帖1](https://x.com/i/status/1572498193451216896)。


## Wildcard 路由 重复参数及修复分支分别读最终导航

Flickr 摘要称未匹配路由原本用于 404，另帖提出重复 next、多次编码以及 failed 分支修复后再绕过。保存原始参数顺序/字节、各层解码、服务端 first/last/all 选择、Location 和浏览器最终 URL；字面展示链接或一条历史奖励不是实际导航证据。回归固定端点与不同进入分支，用自有目的地避免真实凭据，未保存新 payload 不补造。

来源：[保存帖1](https://x.com/i/status/1575739832571158528)、[保存帖2](https://x.com/i/status/1575812610393792513)、[保存帖3](https://x.com/i/status/1575875574731522057)。


## 跳转候选按真实解析结果而非字符串特征判定

保存图列redirect/next、userinfo、斜杠、百分号、控制字符等，资源清单不是每个payload实测。记录原始字节、各次解码、Location/页面导航和最终scheme/host/port，校验与使用须一致；javascript消费者另需XSS证据。以自有受控目的地和正负对照验证，未导航或只反射文字不算开放跳转。

来源：[保存帖1](https://x.com/i/status/1579333469825818624)、[保存帖2](https://x.com/i/status/1579986136373424128)、[保存帖3](https://x.com/i/status/1582363667521490944)。


## 重定向候选应比较解析后的最终主机而非 Location 子串

保存资料含外部 redirect 的 url/urlHash 请求、HEAD grep Location 流水线及反斜杠、Unicode 点、userinfo @、%23、%00、%0d%0a 等候选。记录原始输入、每层解码、响应 Location 与浏览器最终 URL，比较允许域/自控非允许域及拒绝样本。@ 可能是 userinfo 或路径字符，%23 为片段编码，%0d%0a 是 CRLF 而非空字节；t.co 改写或截断 URL 不可补造成可用载荷。子串命中、HEAD 行为和单请求图都不足以确认浏览器开放跳转。

来源：[保存帖1](https://x.com/i/status/1586250273210540032)、[保存帖2](https://x.com/i/status/1586454008742674432)、[保存帖3](https://x.com/i/status/1587031316716929024)、[保存帖4](https://x.com/i/status/1587031319854600193)、[保存帖5](https://x.com/i/status/1587031322698330113)、[保存帖6](https://x.com/i/status/1587031817999519744)、[保存帖7](https://x.com/i/status/1587031820717416448)。


## URL 主机中的正则点应按字面或结构化解析

PHP代码在GETlogout中用 /^https:\/\/auth.domain.com\/.*$/ 校验redirect_to后Location301，主机点没有转义。隔离比较允许host、相似字符串与结构化URL规范结果，记录Location及浏览器最终地址，并验证登出时真实session失效。正则匹配不等主机相同，页面打印logout不等注销；缺真实目标/结果不能推整个站点绕过。

来源：[保存帖1](https://x.com/i/status/1592139598544748544)。


## OAuth state 被当跳转地址须验证业务消费者和登录前提

Acronis保存报告的authorize请求保持本地redirect_uri而state为外站，注释要求先登录，缺完整最终交互。隔离自建回调追踪state的生成/绑定、业务跳转、Location与最终浏览器地址，比较允许本地路径/自控非允许域及拒绝结果。state字面URL不自动为code外泄/帐号接管，报告Resolved/None不代替具体影响，不用保存帐号。

来源：[保存帖1](https://x.com/i/status/1592472920361779202)。


## redir.html 的 u 参数：跳转目的地与账号影响分层

1593690282809237505-02.jpg 保存 redir.html 查询中 u 指向其他来源的报告文字。先检查服务端 Location、浏览器最终来源和 URL 规范化，使用自有目的地及合法站内对照，辨别中间提示页和客户端导航。开放重定向与 token 外流、OAuth 接受或账号接管需分别建立消费者证据，重复报告文字不能补足缺少的响应。

来源：[保存帖1](https://x.com/i/status/1593690282809237505)。


## errorUrl 与 MobileToken：奖励邮件仅保留链条假设

1593849100469866496-02.jpg 的奖励邮件称 errorUrl 开放重定向泄漏 MobileToken。提炼为导航数据流核验：标明 token 的来源、传送位置、接收来源、有效期与受众，在自有账号记录实际发送和接收并核验受限消费权限。邮件没有请求、目的地或消费者，不能据此确认为账号接管，也不保留历史 token。

来源：[保存帖1](https://x.com/i/status/1593849100469866496)。


## RedirectUrl 完整替换失败：保留负例并定位规范化规则

正文明确重置请求中的 RedirectUrl 换完整 URL 未成功。记录输入、响应、实际邮件/导航和同来源合法对照；失败可能来自白名单、格式、不可达或字段未被消费，不能据此宣布绕过或整条流程安全。后续实验应先确认字段用途与规范化后值，分别评估导航和重置代码传送；不补造未保存续篇。

来源：[保存帖1](https://x.com/i/status/1596009943471370240)。


## 额外 header 触发导航：攻击者可控条件与 canonical URL

1596217238893334530-02.jpg 的摘要称额外请求头造成导航，且提到 MITM、走私/头注入或反向代理是前置条件；工作人员问是否配置 canonical URL，截图无答案。先定位实际可信代理链、规范来源配置和最终 Location，用自有正常客户端验证输入是否可由攻击者送达。能在代理里改头不证明普通用户可利用，缺具体头和响应不补造；钓鱼或接管影响另需独立链。

来源：[保存帖1](https://x.com/i/status/1596217238893334530)。


## 奖励邮件中的 MobileToken：导航与 token 消费者不省略

1596750626888642560-02.jpg 的邮件称开放重定向泄漏 MobileToken，参数/目标已遮挡。保留为导航数据流假设：自有账号证明 token 如何进入 URL/请求、接收来源、时效/受众和后端受限权限，再验证是否影响身份。奖励数额和“full ATO”正文不提供这些中间证据，不推演未保存链或利用历史 token。

来源：[保存帖1](https://x.com/i/status/1596750626888642560)。


## 历史保存帖0152：Airflow 登录 next 的规范化边界

历史报告提示 next 参数中斜杠/反斜杠的服务器判定与浏览器最终 URL 可能不同。记录原始字节、解码次数、登录前后跳转以及最终 scheme/host/port，使用自有接收页核验。图片中的版本描述仅当时背景，裁切步骤不能证明当前版本受影响；是否能携带代码或令牌另行证明。

来源：[保存帖1](https://x.com/i/status/1598310649343393792)。

已实际查看保存图片 `1598310649343393792-02.jpg`：Airflow historical login next slash/backslash browser normalization report prior2.4.3; raw validation vs final navigation origin/loginboundary, cropped lines no full response.


## 多跳链接与 Unicode 主机名各自规范化

保存 Twitter 内部跳转→analytics 链示例提到类似点号字符和 URL 编码触发白名单分歧。逐跳保存原始 Location、解析后的 scheme/host/port、解码和 IDN 规范化结果、浏览器最终 origin 以及服务器实际比较值。域名外观相似不等于同源，第一跳可信也不保证后续跳可信；反例应覆盖编码后仍在本域、错误格式和显式拒绝。只用自有终点确认导航，不从重定向本身推代码/秘密泄露或历史目标今天仍受影响。

来源：[保存帖1](https://x.com/i/status/1608491815983890436)。

已实际查看保存图片 `1608491815983890436-02.jpg`：Twitter两个redirect链(内twitter→analytics任意URL)与ideographicdot摘要，路径再URLencode/问号原样差异，blackboxlinkchecking vs浏览器IDN各跳canon，历史case不当当前平台通用bypass，最终目标授权和令牌影响额外证据。


## SVG 主动文档导航与服务器重定向不同

保存 SVG 使用 onload 修改 window.location 指向示例域。首先确认上传文件的实际 bytes、MIME、Content-Disposition、存储域、嵌入/顶层上下文、CSP 和 sandbox；img 中加载与独立主动文档不是同一执行环境。自有接收端用无害导航标记比较事件执行与拒绝。脚本导航不是自动的 HTTP 302 开放重定向，也不等于父域 XSS；允许 SVG 上传只提供候选，不推任意脚本权限。

来源：[保存帖1](https://x.com/i/status/1609258454245605378)。

已实际查看保存图片 `1609258454245605378-02.jpg`：SVGonload设置window.location只是主动文档导航；img/object/iframe/顶层各上下文CSP/MIME/ContentDisposition/origin隔离不同，需自有端点记录，非自动HTTP302开放重定向或父域XSS。


## 归档重定向管道需保持完整 URL 并逐参数对照

一帖修改redirectTo由linkedin至自定义外部域，另一管道gau→tee -a archive→gf→cut冒号→qsreplace→httpx Location。历史追加文件易串目标，按冒号截取会损坏scheme/端口，全部参数替换又混淆来源；先解析完整URL并只改候选参数。自有页面比较原允许目的、相对路径、无效目的和自有外部origin，保存未跟随Location及浏览器最终地址；反射文本/参数名不是open redirect，最终仍留本站是反例。逐跳scope检查，不访问帖子给出的目的。

来源：[保存帖1](https://x.com/i/status/1615617458639114240)、[保存帖2](https://x.com/i/status/1616029455440572419)。

已实际查看保存图片 `1616029455440572419-02.jpg`：gau tee追加archive→gf redirect→cut按冒号→qsreplace→httpx location；cut截URL可能破坏scheme/port且全部参数替换混因，历史文件串目标。


## URL 变体按实际消费者的解析结果比较

保存清单混合斜杠、反斜杠、userinfo、注释、控制字符编码和全角斜杠。先区分服务器 Location、浏览器导航与库解析，再记录解码前后 URL、scheme、规范化 host 和最终自有目的地；同一字符串经不同解析器可能不同。以自有允许/拒绝域名做有限对照，不使用后缀或子串匹配代替 host 比较。候选列表没有逐项验证，不能视作通用重定向绕过。

来源：[保存帖1](https://x.com/i/status/1616834485143891969)。

已实际查看保存图片 `1616834485143891969-02.png`：openredirect slash/backslash/comment/userinfo/percent controls/fullwidth斜杠样例，需验证URL parser而非全通用。


## 重定向白名单应约束整条实际跳转链

保存帖建议快速托管“redirection machine”并使用 DNS payload，没有实际服务器或输入输出。先确认输入究竟进入浏览器导航、服务端取 URL 还是 DNS 校验，列出每跳解析、scheme/host/port、DNS 结果和连接目的地；用自有允许/拒绝两个目的地及单次跳转对照，确认校验与最终消费者一致。初始白名单通过并不证明后续服务器请求越界，独立 DNS 请求也不是 HTTP 内容访问证据；任一跨范围跳转必须止步，托管命令与 win 宣传不足以确认漏洞。

来源：[保存帖1](https://x.com/i/status/1621553187428732933)。


## 路径中看似外部 URL 的重定向须核解析后的目的地

JetBlue 历史报告示例 movi 域路径带 `_https@google.com`，声称 Chrome 直接导航而 Firefox 先提示；图没有完整原始 Location。记录原始路径、服务端 Location 或 JS 导航消费者、各步 URL 解析结果、最终来源与实际浏览器操作，用自有允许/拒绝目的地和编码变体比较。`@` 在路径中与 authority userinfo 不同，不能由子串推断浏览器目的地；确认真正外部跳转再评价项目接受政策，浏览器提示、Low/Resolved 不补足当前复测。

来源：[保存帖1](https://x.com/i/status/1622230266155515907)。

现有图片证据 `1622230266155515907-02.jpg`：JetBlue movi /1/_https@google.com redirect历史报告Chrome/Firefox确认差异，嵌图小；缺原始Location/站点inputconsumer。


## 历史 URL 到 redirect 候选：保留参数和消费者

保存帖把 waybackurls 的结果交给 gf redirect，再用 tee -a 汇集。历史匹配命中应保留原始 URL、参数名、采集时间和解析后的主机，去重前不要丢掉参数结构。只在授权目标上检查该参数今天是否仍存在、是否实际控制跳转、是否有同源或路径约束；历史 URL、关键词命中和追加文件本身都不证明开放重定向。命令中的目标写法不能代替资产归属核验，追加模式还需避免把旧结果当成新发现。

来源：[保存帖1](https://x.com/i/status/1623461718830772225)。


## 正常登录跳转：可控目的地和跨源边界分别验证

正文描述开放重定向，图片只显示 dashboard→login 的正常路由。从参数或路径找到真正消费者，区分服务器 Location、客户端 router、表单 action 和 meta refresh；用允许目的地与受控外部目的地对照最终解析后的去向，记录多次解码与相对 URL 处理。正常未登录跳转、反射在页面的 URL 或命名为 next/redirect 的参数不足以确认开放重定向。没有恶意目的地、最终导航或票据传递证据时，不能进一步宣称 XSS/ATO。

来源：[保存帖1](https://x.com/i/status/1624755160760340481)。

现有图片证据 `1624755160760340481-02.jpg`：HacklidoOpenRedirect推广内手机截文解释dashboard→login正常重定向、机制底裁切，无输入/恶意目的地结果，正常redirect反例。


## 重定向转 XSS/ATO 的编码候选：每次转换单独留证

保存文本包含普通 javascript、百分号、HTML 实体及嵌套编码 URL 候选。先确定 URL 经过多少次解码/规范化和在哪里用于导航，再证明浏览器接受的最终 scheme、执行上下文和是否有用户操作；服务器回显或 302 字符串不保证脚本执行。若讨论 ATO，必须另证身份材料或敏感操作被攻击者获取，开放跳转不自动产生接管。文字载荷没有成功响应，具体编码只在对应消费者语义中成立，不当作通用绕过。

来源：[保存帖1](https://x.com/i/status/1625202897591091201)。


## 四类重定向消费者：最终导航和脚本 scheme 分别验证

复用图片归纳 Location、Refresh、meta 与 JavaScript 重定向。审计先定位攻击者影响的是哪个字段、它以字符串/URL/HTML/JS 何种上下文消费，再保存多次解析、相对 URL 和最终浏览器导航；使用允许目标与受控外源作对照。响应中 URL 可控不等于跨源跳转，javascript scheme 是否执行又需要独立浏览器与 CSP 证据。图片是机制地图，没有具体成功 exchange，不将每个 redirect 判为漏洞或自动 RCE。

来源：[保存帖1](https://x.com/i/status/1628070670499475456)。


## 重定向参数转脚本执行的参数名与解码差异

正文先写redirectUrl，截图实际是returnUrl，复现必须以实际请求字段为准；保存的//evil,org含逗号也不能当有效攻击域名。图片显示编码javascript串和弹窗，支持特定环境脚本执行，未展示完整handler、解码次数或当前WAF能力。先区分普通HTTP重定向、客户端location消费与HTML/JS插入，逐层记录原始/解码值和sink；同源无害标记执行与禁用javascript协议作对照，弹窗不是账户接管。

来源：[保存帖1](https://x.com/i/status/1629064458218921984)、[保存帖2](https://x.com/i/status/1629064843117613056)。

现有图片证据 `1629064458218921984-02.jpg`：地址栏returnUrl(正文redirectUrl)编码javascript var/onerror/throwdocument.cookie，图片有被遮cookie弹窗；执行上下文未完整、不能证明cloudflare通用旁路/会话ATO，不复制。


## 登录注销 rurl 与转 XSS 的两个验证层

Expedia历史报告提到rurl，图片默认logout1请求、响应底部仅200，没有改参跳转结果；其他转XSS外链全文未保存。先在授权本地夹具核对目标URL解析、允许scheme/host与最终导航，再定位javascript协议或DOM字符串消费才判断脚本执行。HTTP重定向不自动成XSS/ATO，严重性需依赖真实消费者。

来源：[保存帖1](https://x.com/i/status/1631368935130947589)、[保存帖2](https://x.com/i/status/1631884068215300096)。

现有图片证据 `1631368935130947589-02.jpg`：Expedia logout/login历史报告称rurl，默认请求GET logout1，截图响应裁切仅200；未显示修改参数/Location/实际跳转，不能由200判断开放重定向或会话接管。


## 自建落地页与链接注入需证明上游信任链

自己控制的404页面可演示落地视觉，但不能证明源站开放重定向；DOM链接或PDF超链接注入也须实际渲染/用户动作/最终导航证据。记录输入到href/Location/文档消费者的转换、来源origin及重定向控制对照。Bugcrowd accepted/250截图只支持历史处置，点击外链不自动泄露token或massATO，缺后续凭证/身份变化不能补造。

来源：[保存帖1](https://x.com/i/status/1633699084451082242)、[保存帖2](https://x.com/i/status/1633769722540859392)、[保存帖3](https://x.com/i/status/1634248974444929037)。

现有图片证据 `1634248974444929037-02.jpg`：Bugcrowd标题Hyperlink Injection→Open Redirect、Unresolved accepted/250/VRT1.10.1；无PDF渲染/点击/最终URL或接管证据，不能由接受状态扩大成massATO。


## 参数词表与后缀拼接不代替完整跳转链

next/url/redirect/return等25项是候选路径/参数不是搜索dork；历史JetBlue url报告Critical被调Low，缺Location/视频。另一thread只保存枚举、阻@描述、.evil后缀及最终redacted.com.evil.com截图，需原始请求→Location/DOM→最终注册域的完整链及正常/拒绝对照。URL拼接改变真正主域不自动泄露token/ATO，未保存中间段不补出接管过程。

来源：[保存帖1](https://x.com/i/status/1635385442265694208)、[保存帖2](https://x.com/i/status/1635392978695905287)、[保存帖3](https://x.com/i/status/1635665841013358592)、[保存帖4](https://x.com/i/status/1635834633958076418)、[保存帖5](https://x.com/i/status/1635835802486972416)、[保存帖6](https://x.com/i/status/1635837214285524992)。

现有图片证据 `1635385442265694208-02.jpg`：JetBlue历史url外部地址报告，侧栏Resolved/Low，时间线Critical被调Low；无Location或视频本体，基本外链跳转不自动ATO，不补造成Critical。

现有图片证据 `1635665841013358592-02.jpg`：25项open redirect路径/next/url/target/rurl/dest/return/checkout等候选参数，被称dorks但无搜索运算符或结果；需消费为Location/DOM导航和真实目标，不凭命名判漏洞。

现有图片证据 `1635834633958076418-02.png`：浏览器signin redirectURL=@google.com地址，没有跳转最终URL/Location或ATO链。

现有图片证据 `1635837214285524992-02.png`：浏览器最终redacted.com.evil.com页面，证明截图导航到evil.com子域；缺上游原始Location/实现，拼接后缀须按有效registrable域核对，最终页面不证明token泄露/ATO。


## 重定向升级链应逐个验证新的信任消费者

OAuth token流、SSRF跟跳转、CRLF/JavaScript导航都有不同前提。先保存重定向源/最终URL与允许域，再分别确认OAuth redirect/PKCE/state和实际token接收、服务器跳转后校验或浏览器执行origin。开放跳转不是无限机会/自动ATO，缺后续消费者/身份改变就停留候选，未保存实例不补出链。

来源：[保存帖1](https://x.com/i/status/1637161632077066240)。


## 重置邮件中的 host 拼接需要最终跳转和令牌边界

已审阅复用图以 target.com.evil.com 等主机候选改变重置链接。核对生成端使用的authority、白名单边界、邮件实际URL、最终导航及token收件主体。子串或后缀不等原站，开放重定向本身不自动泄漏可兑换令牌或接管；只比较自有邮箱与受控目的地。

来源：[保存帖1](https://x.com/i/status/1639835817475547138)。


## Rails redirect_to 历史报告仍要核对 URL 消费者

图片提到历史重定向报告及边界。先审查参数到redirect_to、规范化、允许host及响应Location的路径，固定版本与许可自有目的地核对最终导航。历史编号、框架名或URL样式不等当前受影响，重定向与token泄漏另证。

来源：[保存帖1](https://x.com/i/status/1640043700637106177)。

现有图片证据 `1640043700637106177-02.jpg`：RailsActionPack22797 redirect_to不可信params保护introduced7.0仍可craftedURL绕，图历史fixed7.0.4.1，无crafted字节或当前目标，<7非受本CVE不等默认安全。


## 重定向参数 grep 词频只用于候选排序

正文按redirect参数和频率筛选，含非标准引号示例。保留原URL及查询/片段解析，确认实际导航或Location消费者、允许目的地与多步跳转；名称频繁不等漏洞或高风险，不能用词表覆盖推导安全结论，源命令格式错误不静默修复。

来源：[保存帖1](https://x.com/i/status/1641307966505664512)。


## HEAD 跟随跳转再 grep 地址仍需导航证据

图片管线Wayback、grep等号http、bhedak替换、curl -L -I及grep示例域。记录转换前后URL、每跳Location、实际GET/浏览器最终authority与范围；HEAD、文本包含地址和历史页面不等开放重定向。未引用变量、正则点号和跟随外部跳转可改变输入/范围，不静默修复原命令或执行他人目的地。

来源：[保存帖1](https://x.com/i/status/1641877955310923776)。

现有图片证据 `1641877955310923776-02.jpg`：one liner Wayback→grep =http→bhedak恶意示例地址→curl -s -L -I→grep地址，只文本头匹配；跟随跳转扩大目标、HEAD与GET不同、未引用host及正则匹配不证明最终可控开放跳转，未执行。


## 开放重定向 dork 的参数名不等可控目的地

正文url/u/link/redirect/redirectUrl带http候选，部分site带scheme或问号语法未经验证。核对实际搜索分支、结果URL、参数结构与导航消费者，比较许可自有目的地和拒绝基线。关键词命中不证明最终跳转，不把搜索示例目标当授权范围。

来源：[保存帖1](https://x.com/i/status/1641900634764091392)、[保存帖2](https://x.com/i/status/1642125015725539329)。


## Wayback 与 gf 的 redirect=no 列表只是候选

图存档URL含redirect=no、编码问号与重复参数，管线timeout2/thread100。记录原URL、失败/超时、参数结构和最终Location/导航，保持身份及当前版本对照。业务开关no不必接收URL，gf匹配和存档条数不证明漏洞或安全，不自动重放历史目标。

来源：[保存帖1](https://x.com/i/status/1642075616848510980)。

现有图片证据 `1642075616848510980-02.jpg`：Tesla存档列表含redirect=no及编码/重复参数，没有Location/最终URL；gf筛候选不证明开放跳转，redirect=no可能业务开关。


## Unicode 点与多层编码须核对最终 authority

两图报告标题Chinese dot、Referer多层percent和redirect_to多斜线/Unicode点，状态P4Duplicate或历史Low/Open，没有Location。记录每层解码、Unicode/IDNA规范化、校验器和最终浏览器URL，以受控目的地比较。标题/状态不证明当前绕过，不能把特殊点泛化所有URL或静默改变编码。

来源：[保存帖1](https://x.com/i/status/1642693397705023492)。

现有图片证据 `1642693397705023492-02.png`：开放重定向报告状态P4UnresolvedDuplicate，标题Chinese dot编码、Referer多层percent编码与lang/pc；没有Location或导航结果。解码次数/Unicode点规范化需对照，状态不证明绕过。

现有图片证据 `1642693397705023492-04.jpg`：第二历史报告redirect_to含多斜线与Unicode点编码，Low/NewOpen，目标遮挡；同样无响应。URL解析与IDNA映射需逐层核验，不据题名泛化所有中文点有效。


## nexturl 的后缀绕过要保留反斜线和截断边界

正文声称仅公司子域获准，混入evil.com、省略号与多个反斜线后跳出；没有完整请求或Location。保留原始字符和解码层，核对校验器与浏览器如何确定scheme/authority、每跳目的地及最终导航，比较许可自有目标与拒绝基线。不可静默把Unicode省略号补成有效URL，也不能由字符串后缀或作者宣称判断漏洞已成立。

来源：[保存帖1](https://x.com/i/status/1644120074243166208)。


## URL 拼接与可信服务例外应以最终解析主机为准

可见书页讨论硬编码店铺域名与用户部分拼接，以及历史 Zendesk 自定义域/return_to 绕过外站提示的案例。核对原始输入、规范化 URL、最终主机、重定向链与信任决定，用自有终点做单变量负例。点号/@ 等仅是解析假设，不能跨消费者通用；同服务商域名或可定制内容不保证属于产品可信主体。照片左页裁切且案例为历史，未注册外部域或认定当前产品仍有缺口。

来源：[保存帖1](https://x.com/i/status/1650177610846961664)。

现有图片证据 `1650177610846961664-02.jpg`：书页OpenRedirect：硬编码store域URL拼接可由点号/@等改变实际解析目的地；HackerOne历史Zendesk自定义子域/return_to信任例外可绕过外站interstitial，需最终规范化host而非字符串/服务商总域信任。可见页与左页裁切、2016案例不证明当前行为，未注册外部子域。


## slash redirect 模板命中需保留真实 Location

Nuclei 保存输出含 slash URL 和引擎/模板历史版本，只有 matcher 命中。记录原始多斜杠/百分号字节、服务端 Location、每跳和浏览器最终 origin，以自控无害目的地比较相对路径、同源和外部跳转。命中 URL 出现 http 文字不等于浏览器外跳，不能把 low 标签替代重定向链，也不自动跟随扫描工具给出的外域。

来源：[保存帖1](https://x.com/i/status/1654380999126425601)。

保存图片 `1654380999126425601-02.jpg`：Nuclei slashURLredirection1template5targets引擎2.8.3模板9.4.3输出low URL////httpbing/%2F；没有Location或浏览器最终origin，matcher与version历史不可当复现。 本段只使用已保存且实际查看的内容。


## 重定向生成器需保留浏览器最终 origin

反斜杠、全角点、userinfo、协议相对与 tab 字串只提供解析候选。分别记录原参数、每层解码、服务器 Location、每次跳转和浏览器最终 origin，用同源与自控外域作比较；URL 文本中包含外域不证明外跳。截图没有实际 Location/浏览器结果，不自动访问生成器中的第三方目的地。

来源：[保存帖1](https://x.com/i/status/1656402490517245952)。

保存图片 `1656402490517245952-02.jpg`：redirect变体生成结果反斜杠/fullwidthbackslash/userinfo/protocolrelative/tab等；Results列表非Location/最终origin，不点击evil。 本段仅使用实际查看的保存原图，不补未保存内容。


## 重定向 dork 命名只提示输入候选

go/return/redirect/dest/continue 路径或参数名搜索需保存索引日期、实际参数和当前范围。用自控同源/外域目的地比较原请求、真实 Location、各跳和浏览器最终 origin，区分返回路径与外跳。图中字符串名称不是有效参数或重定向结果，本次不自动跟随外部链接。

来源：[保存帖1](https://x.com/i/status/1659260990448623616)。

保存图片 `1659260990448623616-02.png`：Googleinurlgo/return/redirect/dest等dorks候选清单，无实际Location/最终origin；路径名与参数名还不同，索引历史不授scope。 本段仅使用实际查看的保存原图，不补未保存内容。


## 外域锚点点击不等同服务器开放重定向

HTML 中外域链接依赖用户点击，需与服务器 Location、自动客户端导航和协议相对 URL 分开记录。用自控同源/外域目的地比较真实响应和最终导航，确认重定向功能的信任约束。仅插入链接不能证明原端点提供 HTTP 3xx 外跳，也不证明 OAuth token 随之泄露。

来源：[保存帖1](https://x.com/i/status/1661113271057784849)。


## 历史查询参数筛选只是重定向候选

保存管线从 subfinder、httprobe、waybackurls 到去重/query筛选，再指定外链 Nuclei 模板。分别保留域名/URL单位、来源时点、失败和模板版本，最终以自控允许/拒绝目的地比较原始 Location、各跳及浏览器origin。参数存在不证明外跳，外链模板未保存不补其匹配逻辑，不执行自动重定向测试。

来源：[保存帖1](https://x.com/i/status/1662985239793135619)。

保存图片 `1662985239793135619-02.jpg`：subfinder→httprobe→Wayback→sortuniq query筛选→NucleiURLredirectiontemplate外部未存；stageidentity/source/status与Location终跳客户端serverredirect不同，未执行。本段仅使用实际查看的保存原图，不补未保存内容。


## 重定向流水线保留最终 authority 证据

保存的 subfinder、httprobe、Wayback 与 Nuclei 组合先发现候选，正文和截图的输入 scheme 不一致，需核对各工具接受裸域名还是完整 URL。含多斜线的路径可能在不同层被解释成 authority，也可能只是本地路径。记录原始输入、每跳 Location、规范化后的目标与浏览器最终导航，对比固定站内目标；302 或模板命中本身不证明开放重定向。未保存的外部模板不补造。

来源：[保存帖1](https://x.com/i/status/1663769479652990981)、[保存帖2](https://x.com/i/status/1664627999608836097)。

保存图片 `1663769479652990981-02.jpg`：图subfinder裸domain而正文http://scheme差异；httprobeWaybackqueryfilterNucleiexternaltemplate只候选缺Location本段仅使用实际查看的保存原图，不补未保存内容。


## URL 前缀切片校验与消费者解析要一致

保存 isSafeHost 片段按首个 :// 切片再 startsWith allowlist，缺少严格 scheme、hostname 与端口解析；javascript 或注释文本可能使字符串片段看似可信。应对最终消费者接受的 URL 统一解析、限定协议和精确 authority，逐跳重新校验；localhost 的 includes 也不是主机相等。用合成 URL 检查校验/导航差异，截图 sink 裁切，不能补猜真实导航或 JS 执行。

来源：[保存帖1](https://x.com/i/status/1664701319616122885)。

保存图片 `1664701319616122885-02.jpg`：isSafeHost uri.slice indexof ://+3 startsWith allowlist 缺URLprotocol/parser exacthostname，javascript前缀+comment让afterfirst://startswith满足；localhosthostincludes也不严格，bottomsink裁切不能补实际navigation/exec本段仅使用实际查看的保存原图，不补未保存内容。


## QR 扫描后的导航仍须用户确认边界

保存 Brave 摘要描述 QR 扫描器打开链接时缺少用户知情确认，关联历史 Android/浏览器版本。将 QR 解码结果、提示、每跳导航及最终 authority 分别记录，以自有站内/外域目的地对照；QR 本身是输入载体，不自动等同服务器开放重定向。保存附件裁切且未解码，报告的 High/Resolved 状态不能扩展为当前全部 QR 扫描器行为。

来源：[保存帖1](https://x.com/i/status/1666679392527958016)。

保存图片 `1666679392527958016-02.jpg`：BraveQR扫描器摘要未经用户知情确认导航恶意链接，Brave1.50.114 Chromium112 Android11；QR附件截断未解码，High/Resolved历史无完整导航链或通用QR漏洞本段仅使用实际查看的保存原图，不补未保存内容。


## 编码跳转参数要在解码后校验完整 URL

Nextcloud UnsupportedBrowser.vue 历史片段把 `redirect_url` base64 解码后赋给 `window.location`，未显示可信目标验证，归档为 CVE-2023-35171。编码仅改变表示，跳转消费者使用的最终 URL 才是允许列表对象。自有页面对照内部相对路径、外部 origin、协议变化、解析失败和多层编码，记录规范化后的协议、主机与实际导航。可信协议及目标被严格约束时可为合法跳转；仅看 base64 字符或当前地址栏不能替代最终 origin 检查。图没有完整修复或当前部署信息。

保存图证 `1672310002768289798-02.jpg`：可见 base64 解码后的 redirect_url 直接用于 window.location。

来源：[保存帖1](https://x.com/i/status/1672310002768289798)。


## 跳转参数候选要追到 URL 规范化后的导航位置

参数清单混合 returnTo、redirect_to、state、image、file、host 等名称，其中很多并非跳转消费者。另一历史图使用多斜杠和 U+3002 全角句点，报告标签没有完整 Location 或导航日志。先追踪每次百分号解码、主机名规范化、相对 URL 拼接与最终 scheme/host，用自有跳转服务比较本域、明确拒绝外域和编码形式，记录真实目的地及交互前提。只保存字符串、图片获取或正确 allowlist 拒绝不构成开放跳转；候选列表不能称为所有平台通用载荷。

来源：[保存帖1](https://x.com/i/status/1674128771950039054)、[保存帖2](https://x.com/i/status/1674130695923421191)。

保存图证 `1674128771950039054-02.jpg`：48 个混合参数候选中有跳转、状态、文件、图片和域名字段，没有实际消费者或通用命中证明。

保存图证 `1674130695923421191-03.jpg`：U+3002 全角句点与多斜杠 redirect_to 的 2020 年报告标为 New/Low/Private，无完整 Location 或导航结果。


## 跳转到脚本协议的升级需独立确认每一步消费者

正文把 open redirect 延伸到 javascript://、编码换行与 reflected XSS。URL 校验、百分号解码、协议识别、JavaScript 注释和最终导航各自有解析规则，不是所有浏览器或端点都接受。自有样本比较外域跳转、被拒绝协议、纯文本与无害执行标记，保留最终 scheme、origin 与交互。开放跳转本身不证明脚本执行，协议拒绝或输出被编码会截断升级；不为了未知升级长期扣留已经可复核的事实。

来源：[保存帖1](https://x.com/i/status/1675694851671687168)、[保存帖2](https://x.com/i/status/1675904734736322562)。


## Unicode 和绝对 URI 跳转比较最终解析的主机

正文包含 U+3002 句点和破损的全角字符编码，图片说明 Werkzeug 的 scheme/netloc 解析与绝对 URI 请求可改变跳转目的地。核对输入原始字节、各层解码、userinfo/主机/路径分解、允许列表与最终 Location/浏览器导航，以本域、拒绝外域和解析失败的无害固定样例作对照。去活化 hxxp、损坏百分号串不能直接当可运行 URL；308 也不保证所有浏览器永远缓存，需实际缓存策略/重用证据。缺完整链时不推通用跳转或脚本替换。

来源：[保存帖1](https://x.com/i/status/1681310353685385217)、[保存帖2](https://x.com/i/status/1681567047174725634)、[保存帖3](https://x.com/i/status/1681776676424826880)。

保存图证 `1681310353685385217-02.jpg`：Werkzeug 2.1.0–2.1.1 历史图述同连接复用、POST残留与下一script请求错位，再借open redirect改变脚本位置；没文件上传所以另找redirect，图为示意非完整浏览器/服务端日志。需同连接ID、字节解析、浏览器发起下个资源、重定向消费者/CSP条件，不等于任意同版本RCE。

保存图证 `1681310353685385217-03.png`：Werkzeug URL parser图: //形式scheme空netloc非空，WSGIRequestHandler给HTTP_HOST赋netloc；URI分解/开发用途RFC差异，缺完整handler/版本或实际导航。校验器/消费者解析必须对照，URL图不是当前全部绕过。

保存图证 `1681310353685385217-04.jpg`：本地Werkzeug2.1.0/Python3.10截取绝对URI请求→308 Location及POST后第二script请求得到308；所谓修复后常规浏览器无redirect但畸形请求仍在。需证明浏览器能发起同连接错位，308缓存行为还需headers/重用日志，不能说所有308强制缓存永久XSS。


## 多斜杠路径筛选 302 后还要解析 Location

正文 httpx 将 ///evil.com 路径和 302 筛选联用。候选须比较完整响应 Location、浏览器 URL 解析和自控目的地，区分站内绝对/相对跳转、规范化与外部 scheme-relative 解释。302 本身不能证明开放重定向，header 值或字符串包含域也不能代替真实最终导航；不访问源例外部目的地。

来源：[保存帖1](https://x.com/i/status/1685713909377048576)。


## 开放重定向检测须保留多跳最终导航（2023保存案例）

OpenRedireX3URLs44payloads logout redirect/redirect_uri多跳，INFO站内跳FOUND最终google例；必须完整Location链与browserURIparse/userinfo/多斜线，FOUND标签不等所有同类入口vuln，不访问原目的地。

图片证据：`1688167082792484864-02.jpg`（已核对原图；裁切或遮挡范围不补造）。

来源：[保存帖1](https://x.com/i/status/1688167082792484864)。


## Seller重定向命名参数的XSS与导航分别确认：导航边界（2023保存案例）

TikTok Seller 报告摘要说明 hack_redirect_now 参数用户输入未适当 HTML 转义/输出编码导致 XSS，标题并列 DOM XSS/open redirect，截图没有重定向请求链。分别确认 DOM sink 与最终导航，参数名称不能证明开放重定向；历史 Resolved/$1000不外推当前版本。

图片证据：`1688837831626731520-02.jpg`（已核对原图；裁切或遮挡范围不补造）。

来源：[保存帖1](https://x.com/i/status/1688837831626731520)。


## 保存图证0187-75-redirect：条件与证明边界

TikTok Seller hack_redirect_now输入校验不足可能响应拆分，摘要并列反射XSS/cookie与开放重定向；时间线Duplicate#2007093、评级变更/后续reopen，下部截断。分别需要原始响应CRLF边界、浏览器HTML执行和最终Location解析，不能从摘要推三条证据均已完备，历史状态非当前影响。 可用原图：`1691615894437527680-02.jpg`。

来源：[保存帖1](https://x.com/i/status/1691615894437527680)。


## OpenRedireX 的多跳跳转与 URL 解析差异（0187）

复用已读原图 `1691769120289882121-02.jpg`：工具例包含三个 URL、44 个 payload，以及 logout/redirect_uri 跳转链，局部 INFO 与最终 FOUND 对应不同阶段。记录每跳状态码和 Location、URI userinfo、多斜线及最终浏览器目的地，分别判断服务端校验和客户端解析；工具标签不能替代完整链或证明令牌泄露。

来源：[保存帖1](https://x.com/i/status/1691769120289882121)。


## 退出流程的跳转参数与完整链条（0188）

保存续帖只有登录、开启代理和拦截 logout 的起始步骤。将退出前后会话、返回参数及各跳 Location 作为待核对对象；必须证实浏览器最终跳到允许范围外的受控目的地，不能补造未保存续篇的变更和成功响应。退出动作、302 或参数存在本身不说明令牌泄露或接管。

来源：[保存帖1](https://x.com/i/status/1695182123244655096)。


## 保存图证0189-10-redirect：机制与验证条件

OpenRedireX 终端截图：3 个 URL、44 个 payload；logout/redirect_uri 的 userinfo、多个斜线及编码片段，INFO 中停留 example.com，而 FOUND 示例最终落地 google.com。记录每跳状态、Location、浏览器实际规范化落地与白名单比较；工具 FOUND 不证明令牌泄漏、接管或所有 OIDC 退出端点均有漏洞。 可用原图：`1696912487772545519-02.jpg`（保存帖 1696912487772545519）。

来源：[保存帖1](https://x.com/i/status/1696912487772545519)。


## 保存图证0189-23-redirect：机制与验证条件

开放重定向图列直接换域、协议相对 //、反斜线、无双斜线 scheme、%40 userinfo、后缀拼接、%2e、查询/fragment 放白名单域、斜线后小圆符号、中文句号编码与 %0d/%0a。保留解析层候选及最终 scheme/host/origin 比较，不把所有形状都认定跳出；图把 %0d/%0a 称 nullbyte 是错误，它们是 CR/LF，NUL 是 %00；反斜线段示例和标题未一致呈现，须按原始字节/解码次数确认；控制字符候选只在离线/受控环境核对 Location 与浏览器解析，不能把 CR/LF 自动当作重定向成功。 可用原图：`1697099102905942473-02.jpg`（保存帖 1697099102905942473）。

来源：[保存帖1](https://x.com/i/status/1697099102905942473)。


## 已核图0189-42：OpenRedireX 解析与最终落地

此批 `1697468553660960869-02.jpg` 与此前已核原图相同哈希，无需重复观看/记账。图为3URLs、44payloads的logout与redirect_uri多跳，INFO停在站内与FOUND最终Google需分开。保留每跳Location、编码、userinfo/多斜线解析与浏览器最终scheme/host对照；工具标签不证明ATO、令牌泄漏或所有OIDC退出端点都脆弱。

来源：[保存帖1](https://x.com/i/status/1697468553660960869)。


## 保存正文0190：base64 state及journey的重定向白名单检查

保存正文称state内base64编码的URL和journey可指定eviltarget.com。base64不是完整性保护；需追踪解码层、规范化和最终Location/浏览器目的地，对照允许域、相似域与受控外部域。若为OAuth state，CSRF绑定/完整性须独立验证，不由参数名推定OIDC。没有保存原始state/实际响应，不能直接给出接管或线上复现结论。

来源：[保存帖1](https://x.com/i/status/1703335286174826709)。


## 保存图证0192-65-redirect：机制与验证条件

保存图片 `1709660613176373603-02.jpg`：重定向候选列表混用userinfo @、后缀主机、path中@、编码斜杠和无效host；例如 attacker.com.target.com 属 target 子域而 target.com.attacker.com 属 attacker，path/@ 不自动改变host。按原始值、每层解码、标准URL解析与最终Location/浏览器目的地主机比较；多层编码不是通用绕过，使用自有允许/拒绝地址，不据列表认定实际跳转。

来源：[保存帖1](https://x.com/i/status/1709660613176373603)。


## 0194：双斜线输入与浏览器最终 authority

正文 https://www.[target].com//evil.com/ 的双斜线位于已有 authority 后，通常是目标主机的路径。只有应用生成 Location://evil.com 等不同导航结果或另一个有效 sink 才可能跨主机。记录完整请求、原始 Location 与最终浏览器 URL，比较正常相对路径和允许目的地；不能仅凭字符串里含外部域名判 open redirect。

来源：[保存帖1](https://x.com/i/status/1715659028905201785)。


## 保存图证0194-74-redirect：1716436296875258252-02.jpg

浏览器redirecturl=javascript:confirm(document.cookie) activation失败页弹cookie确认框，图无sink代码/网络原始来源。核location赋值或其他导航API及scheme允许、用户控制/实际origin和另一会话。cookie弹窗不证HttpOnlytoken可读/已ATO，DOM与反射来源不能只标题区分。

实际保存图：1716436296875258252-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1716436296875258252)。


## 保存图证0194-92-redirect：1716824364455280844-02.png

GitSourceEditor先newURL(a).origin白名单但再regexexec全URL捕host/project/file，合法android.googlesource origin中path/fragment嵌攻击host1337#.googlesource.com，regex组可导请求到其他host携access_token。分别验证浏览器authority与应用regex组/实际fetch目的、令牌传输；合法字符串子串不等最终host，修核canonicalparsedhost及credentials限定。

实际保存图：1716824364455280844-02.png。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1716824364455280844)。


## 0197：十进制 IP 与反斜杠需要逐层 URL 解析对照

正文给编码 http scheme、十进制主机数及反斜杠候选。不能凭字面不是常规 IP 就信任，也不能假设所有库/浏览器均支持同一表示。离线自有 URL 样本逐层核 percent 解码、host 解析/规范化、反斜杠/斜杠、重定向目的地与 allowlist 比较；实际跨源 Location/导航和许可政策才支持 open redirect，未打开外站或执行跳转。

来源：[保存帖1](https://x.com/i/status/1724052442021499313)。


## 保存图证0197-59-redirect：1724759302353912146-02.jpg

WordPress 报告要求先正常认证，account/user 的 redirect_to 给 javascript scheme，再点 Continue；正文声称 XSS，图未显示浏览器执行。核可控跳转来源、URL 解析/协议白名单、实际导航 sink、CSP 和是否能影响其它受害者，用自有无害协议/拒绝对照。需要点击与已登录前置，不能从登录或潜在 steal-cookie 文字推断 ATO。

实际保存图：1724759302353912146-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1724759302353912146)。


## 保存正文0198：批量替换 token 的开放跳转需要逐项成立

保存正文声称替换 token 找到大量子域跳转，但未给 token 语义、完整请求或导航回执。先用自有受控入口固定身份、参数位置、编码及协议，对照默认目的地、允许站点和无害外部测试目的地。确认实际 Location 或客户端导航解析后的 host，排除仅反射、错误页、允许的用户链接和不同子域 scope；不可把数量或替换技巧当通用绕过。

来源：[保存帖1](https://x.com/i/status/1726982545122922977)。


## 保存正文0198：开放跳转扫描工具结果需要导航与归属确认

RE-FuZZ 的输入与 payload 选项是工具入口。扫描结果保留原始请求、参数位置、解析后 Location 或客户端导航目的地，并用允许目的地与受控外部测试目的地对照；排除仅反射、错误页和业务允许跳转，逐域确认 scope。保存帖没有仓库实现或输出，不称检测率或可用性已验证。

来源：[保存帖1](https://x.com/i/status/1728443431154811280)。


## 保存图证0198-8-redirect：1726903569033638283-02.jpg

已核对保存图片 `1726903569033638283-02.jpg`。Nextcloud2210038显示Circle display name含meta http-equiv=refresh，分享给管理员后Files Shared with Circles出现导航；保存字段→另一主体HTML渲染→refresh链。用受控标记与安全目的地、纯文本基线核验。图中标签Stored XSS不能证明JS执行、会话劫持或全部泛化影响。

来源：[保存帖1](https://x.com/i/status/1726903569033638283)。


## 保存图证0198-107-redirect：1728420776293081450-03.png

已核对保存图片 `1728420776293081450-03.png`。文章保存截图描述smuggling gadget+malformed path的@example.com导致https://redacted.tld@example.com/导航及OAST DNS/HTTP条目。URL @前为userinfo真正host在后；缺请求字节、缓存键/受害请求关联和OAST内容，回连仅证明交互非traffic被窃/critical。受控标记、无@基线、独立客户端及缓存命中轨迹逐环核验。

来源：[保存帖1](https://x.com/i/status/1728420776293081450)。


## 保存图证0200-121-redirect：1734157340910489683-02.jpg

1734157340910489683-02.jpg：waybackurls→httpx→gf redirect 输出 URL 列表多为 redirect=no；这证明名称筛选而非跳转。先保存归档来源/当前可达性及范围，再区分控制开关与目标 URL 消费，需 Location 或实际导航目的地，无跳转为反例。

来源：[保存帖1](https://x.com/i/status/1734157340910489683)。


## 保存图证0200-123-redirect：1734188784315441173-02.png

1734188784315441173-02.png：redirect、url、next、redirect_uri、return_to 等入口候选示意，图仅5项而正文称48项。按消费端定位目标导航与授权规则，不虚构其余条目；OAuth redirect_uri 必须另查注册客户端匹配，参数名无跳转证据。

来源：[保存帖1](https://x.com/i/status/1734188784315441173)。


## 保存图证0200-149-redirect：1734898462830010627-02.jpg

1734898462830010627-02.jpg：gf redirect 图仅对 URL 名称筛选，两条示例没有 Location 或导航。分别保存候选与原参数含义，匹配 next/redirect 不能证明任意目标可控，已知公共目的地例子也非验证。

来源：[保存帖1](https://x.com/i/status/1734898462830010627)。


## 既有图证0200-114-redirect：1734088829081092516-02.jpg

1734088829081092516-02.jpg 与既有 1635665841013358592-02.jpg 的 SHA256 一致，复用已记录原图观察。25项open redirect路径/next/url/target/rurl/dest/return/checkout等候选参数，被称dorks但无搜索运算符或结果；需消费为Location/DOM导航和真实目标，不凭命名判漏洞。。定位Location/DOM消费者与实际目的地，名称筛选不等于导航；内部路径或业务开关为反例。

来源：[保存帖1](https://x.com/i/status/1734088829081092516)。


## 既有图证0200-163-redirect：1735215548580114644-02.jpg

1735215548580114644-02.jpg 与既有 1674130695923421191-03.jpg 的 SHA256 一致，复用已记录原图观察。U+3002 全角句点与多斜杠 redirect_to 的 2020 年报告标为 New/Low/Private，无完整 Location 或导航结果。。离线对比Unicode句点、斜线规范化与最终authority；历史New/Low状态没有Location/导航，合法内部目标为反例。

来源：[保存帖1](https://x.com/i/status/1735215548580114644)。


## 保存图片 1735579351180358025-02.jpg 的 redirect 验证边界

JS清单列WebSQL executeSql、location、srcdoc、XHR/AJAX、cookie等sink。location pathname/search通常同origin，XHR是请求非顶层跳转，srcdoc是HTML渲染，需逐个跟踪source→操作→权限消费者；旧WebSQL/FileSystem可用性不普遍。离线无害标记区分仅DOM改写、真实导航、客户端SQL与脚本执行，不从API存在证明漏洞。

图片证据：1735579351180358025-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1735579351180358025)。


## 保存图片 1737000336542351586-02.jpg 的 redirect 验证边界

scheme 与正反斜杠及百分号编码的 URL 变体列表，没有请求结果。先比较各解析器对协议、authority 和解码次数的结果，再核对最终导航或服务端取址，允许名单按规范化 origin 比较；变体本身不能证明绕过。

图片证据：1737000336542351586-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1737000336542351586)。


## 保存图片 1737902464169288164-02.jpg 的 redirect 验证边界

curl POST/HEAD 自定 Host 后303 Location 指向该域，截图支持 Host 影响重定向而未证明 reset token 可用或 ATO。区分请求 URL/TLS/Host/反代和邮件链接，使用两个自有域惰性标记，核对最终 token 主体/消费；不抄用 session值、不跟随外域。

图片证据：1737902464169288164-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1737902464169288164)。


## 0201 正文：URL 校验和导航应使用同一规范化 origin

保存叙述 https://evil 被拒而 http:/evil 得跳转含authToken。对照RFC/WHATWG解析、scheme/authority、反斜杠/解码、重定向实际目的地及token主体/audience/有效期；两自有域惰性标记即可定位差异，标题不是令牌有效或接管证据，不使用真实token。

来源：[保存帖1](https://x.com/i/status/1737907869431873626)。


## 保存图片 1739126318229233748-02.jpg 的 redirect 验证边界

缩写IPv4 图给1.1/127.1/192.168.1；这依历史数字地址解析规则与位宽，不能普遍理解为任意删零。离线比较URL校验、规范化host和最终取址/导航，严格IPv4解析器可能拒绝；未见请求，不访问内网或回环。

图片证据：1739126318229233748-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1739126318229233748)。


## 保存图片 1741405995203752145-02.png 的 redirect 验证边界

URL 结构图把 scheme、userinfo、host、port、path/query 分开。验证授权域要比较标准解析器所得 hostname、scheme 和规范化 origin，不能用含凭据文本或 registrable-domain 字符串肉眼判定；userinfo 并非目标 host，公网后缀规则、IPv6/IDNA/编码与默认端口需按实际 parser 确认。示例图不证明任何重定向或 SSRF，最小对照仅解析自有 URL 不请求内网。

图片证据：1741405995203752145-02.png。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1741405995203752145)。


## 复用已核对图片 1741407828022358057-02.jpg 的 redirect 边界

开放重定向图列直接换域、协议相对 //、反斜线、无双斜线 scheme、%40 userinfo、后缀拼接、%2e、查询/fragment 放白名单域、斜线后小圆符号、中文句号编码与 %0d/%0a。保留解析层候选及最终 scheme/host/origin 比较，不把所有形状都认定跳出；图把 %0d/%0a 称 nullbyte 是错误，它们是 CR/LF，NUL 是 %00；反斜线段示例和标题未一致呈现，须按原始字节/解码次数确认；控制字符候选只在离线/受控环境核对 Location 与浏览器解析，不能把 CR/LF 自动当作重定向成功。

图片证据：1741407828022358057-02.jpg。本帖图片与已完整核对原图 SHA-256 相同；复用原观察，不补造被遮挡内容。

来源：[保存帖1](https://x.com/i/status/1741407828022358057)。


## 保存图片 1741758302009032752-02.jpg 的 redirect 验证边界

截图外层页面的 iframe/modal 中显示另一站点内容；与保存 meta refresh 正文结合，需核对可控存储 HTML、子框架响应、refresh 生效及实际导航的是子框架还是顶层，sandbox/CSP/用户动作影响边界。显示外站不证明脚本执行、顶层跳转或凭据泄漏；使用自有受控导航标记，不访问图片域名。

图片证据：1741758302009032752-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1741758302009032752)。


## 保存图片 1741859326401101849-02.jpg 的 redirect 验证边界

CRLF 清单分别列 Set-Cookie、Location 和 HTML body 候选，无响应。需跟踪百分号解码到 header API 是否拒绝 CR/LF、原始响应是否形成独立头/体及浏览器最终导航/执行；反射字符串与 200 不证明 splitting。X-XSS-Protection 设置不是现代 CSP 通用绕过，Content-Length 按真实字节与协议处理。使用惰性自有标记，不插会话 cookie 或混淆共享连接。

图片证据：1741859326401101849-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1741859326401101849)。


## 复用已核对图片 1743958155791360164-02.jpg 的 redirect 边界

scheme 与正反斜杠及百分号编码的 URL 变体列表，没有请求结果。先比较各解析器对协议、authority 和解码次数的结果，再核对最终导航或服务端取址，允许名单按规范化 origin 比较；变体本身不能证明绕过。

图片证据：1743958155791360164-02.jpg。本帖图片与已完整核对原图 SHA-256 相同；复用原观察，不补造被遮挡内容。

来源：[保存帖1](https://x.com/i/status/1743958155791360164)。


## 保存正文0204：历史 URL 的有效响应不确认开放跳转

gau 收集归档 URL、curl 检查有效并展示潜在参数，正文未保存精确命令，图只是空终端。需保留参数的实际消费者，比较允许相对地址和受控外部无害目的地，核 Location/客户端导航及每跳规范化URL/范围。200、参数名、正文中URL或curl能访问均不是开放跳转；存档页与当前路由不一致作反例，不自动跟随外域。

来源：[保存帖1](https://x.com/i/status/1745470506826957016)。


## 保存图片0204 1747096589494325335-04.jpg 的 redirect 验证边界

network/input 图建议端口、UDP、服务脚本及多类参数/请求头注入，底部 SOAP 等内容被裁切。明确被动服务记录与获准主动请求、保守预算和范围；Referer 不自动通向 RCE、User-Agent 不自动通向 SQL/XSS。逐次改变一个已知输入，核对原始请求和实际 sink；Host/XFH 需最终生成地址证据，XSS 需 DOM 执行，SQL/命令/文件读取须对应服务端受控证据，路径斜杠跳转需最终导航，纯错误/反射作反例；不执行脚本、爆破或全参数扫描。

图片证据：1747096589494325335-04.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1747096589494325335)。


## 保存图片0205 1748760088352068067-02.jpg 的 redirect 验证边界

undici-fetch报告摘要说明服务端RequestInit.headers能较直接设置Cookie，与浏览器禁止请求头的假设不同，跨origin跳转未总清除此头；历史模块5.24.0。两个自有origin用假Cookie标记比较同origin和跨origin跳转，每跳读取实际发送头，确认凭据不随新origin转送。手工设置Cookie、cookie jar、浏览器SameSite与服务端实现分别看；不能以浏览器fetch规则证明Node行为，回调或跳转成功不是凭据泄漏。

图片证据：1748760088352068067-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1748760088352068067)。


## 保存图片0205 1749395696019784060-02.png 的 redirect 验证边界

图将Wayback/gau带=URL经qsreplace替换为interactsh，再httpx -fr并看回调。httpx主动follow redirect自身就会访问callback，这不能证明服务器SSRF或浏览器开放跳转；多参数一起替换也不能归因。自有环境比较不跟随与明确记录逐跳Location的请求，再按单个参数和唯一nonce核实际调用者；HTTP回调/历史URL只生成候选，不自动跟随外域，不跑全量流水线。

图片证据：1749395696019784060-02.png。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1749395696019784060)。


## 保存图片0205 1750549293831000559-02.jpg 的 redirect 验证边界

Shopify 摘要给出 confirm-account-details 的 returnTo 可接受 javascript: URL，前提是账号未完成、受害者点击链接、登录并点击 Continue。应沿参数保存至登录后跳转的状态链验证 URL 协议白名单及真实导航执行，以自有未完成/已完成账号、正常 HTTPS/非执行标记比较；点击与登录条件不能省略，Cookie 标记不等于读取 HttpOnly 或账号接管。

图片证据：1750549293831000559-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1750549293831000559)。


## 0206 301 中 header 注入到影响的证据（redirect）

用户求助CRLF301且Location尝试无效，保存内容没有成功链。核实际CR/LF字节、响应头/正文边界、HTTP版本/代理以及浏览器最终导航，以隔离自有原始字节fixture与拒绝基线比较；标题/重定向不证明response splitting、XSS或open redirect，不补造成功payload。

来源：[保存帖1](https://x.com/i/status/1755123787463364928)。


## 保存图片0206 1754248465578696951-02.jpg 的 redirect 验证边界

3xx清单把304理解改方法、306称换代理并由307/308推漏洞，需纠正：304是条件请求的未修改，306保留/不使用不能指挥换代理，307/308保留原方法而303通常取另一资源。保存Location、原方法/body、缓存validator及每跳身份，用自有受控跳转/304fixture对照；正常3xx不是open redirect，自动跟随会泄露凭据/扩大范围，禁止由状态直接归类漏洞。

图片证据：1754248465578696951-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1754248465578696951)。


## 保存图片0208 1758642689501986879-02.jpg 的 redirect 验证边界

TikTok官方摘要redirect_url在Seller登录路径遍历导致open redirect，并称could导致接管，无具体payload或凭据流。定位URL规范化/允许列表与最终Location和OAuth/session交接；own固定origin/编码路径负例，跳转不自动证明ATO，不访问Seller或实际跳转登录。

图片证据：1758642689501986879-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1758642689501986879)。


## 正文0209 跳转参数名不是重定向证据：redirect

return/url/callback/forward等只是发现词表，需实际服务端Location或客户端navigation consumer、decode/URL规范化及精确允许origin。自有合成URL比较允许sameorigin、拒绝外部/相似suffix和参数被当纯文本负例；checkout/host/page名称不证明跳转、更不说明OAuthtoken或ATO，不发送或导航URL。

来源：[保存帖1](https://x.com/i/status/1764297426729320894)、[保存帖2](https://x.com/i/status/1764645618163896470)。


## 正文0209 U3002点规范化与SSO：redirect

percentencoded中文句号进入SSO callback只是候选，截图缺最终Location。raw前缀/后缀比较与URL/IDNA/decode后的主机应一致并精确scheme/host/port，redirect_uri绑定和token发放单独证明。自有惰性URL模型比合法origin、相似suffix、编码与拒绝非白名单负例；跳转成功也不单独ATO，不访问SSO或猜遮挡域。

来源：[保存帖1](https://x.com/i/status/1765031161011568961)。


## 保存图片0209 1764147214203683211-02.jpg 的 redirect 验证边界

Google dork图每行-site:target.com是排除而非限制该域，与文案候选目标不一致；inurl go/return_path/redirect/location等只参数启发，“Critical”没有影响证据。自有query/URL fixture核include/exclude和最终redirect consumer，比较合法同origin/拒绝外部/编码规范化，不静默修正归档查询、不执行搜索或外推范围。

图片证据：1764147214203683211-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1764147214203683211)。


## 保存图片0209 1764159849791951254-02.jpg 的 redirect 验证边界

Google dork图每行-site:target.com是排除而非限制该域，与文案候选目标不一致；inurl go/return_path/redirect/location等只参数启发，“Critical”没有影响证据。自有query/URL fixture核include/exclude和最终redirect consumer，比较合法同origin/拒绝外部/编码规范化，不静默修正归档查询、不执行搜索或外推范围。

图片证据：1764159849791951254-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1764159849791951254)。


## 保存图片0209 1765031161011568961-02.jpg 的 redirect 验证边界

SSO init callback图含google.com加percentencodedU+3002再被遮挡域后缀，无Location/浏览器最终origin。raw字符串前缀allowlist与URL/IDNA点规范化必须一致，U+3002视觉点不是凭看到就成功。自有惰性URL parser用合成域比较规范后精确origin、合法redirect_uri和拒绝相似suffix，区分跳转与OAuthtoken/ATO影响；不补隐去域、发SSO请求或导航。

图片证据：1765031161011568961-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1765031161011568961)。


## 保存正文0210：Moodle redirect_uri 需验证最终导航而非落地截图（redirect）

正文/mod/lti/auth.php?redirect_uri=//example.com候选，//是继承scheme的network-path reference，实际URL消费者可能拒绝/规范化为相对或需登录条件。对照受控允许/拒绝origin与返回Location/DOM导航链、hostport规范化、token是否发送；单独example.com截图不能绑定Moodle来源，不打开目标/发送SSOcode。

来源：[保存帖1](https://x.com/i/status/1767222180402675844)。


## 保存图片0210 1767937980826845330-02.png 的 redirect 验证边界

TikTok登录页图redirect=javascript并alert标记，host遮盖且来源字段/邮箱输入不证明另用户身份。需导航scheme消费者、真实响应/DOM/CSP与受控触发；跳转到外站与同源JS执行是不同影响链，弹窗不等ATO，不登录真实账号或执行javascriptURL。

图片证据：1767937980826845330-02.png。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1767937980826845330)。


## 正文0211 111 redirect：U3002与精确origin一致规范化

保存encoded U3002 redirect候选，视觉点/IDNA映射、percent解码及parser先后需和allowlist消费者一致。惰性canonical scheme/host/port比较suffix/相似域/标准origin，缺Location/SSOcode接收链不推token盗取或ATO；不访问链接。

来源：[保存帖1](https://x.com/i/status/1770020285909241957)。


## 保存图证0211 1769378339435720759-02.jpg redirect

GoCD new.loading.page.html代码query正则取redirect_to，decodeURIComponent后赋window.location，缺参数时reload。危险scheme进入浏览器导航消费者；限制规范化scheme及origin，惰性javascript样式/合法相对路径/非法编码比较。保存代码支持候选链但无实际执行/CSP，开放跳转与脚本执行分开，不执行alert。

图片证据：1769378339435720759-02.jpg。已核对完整可见像素；遮挡、裁切及未显示请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1769378339435720759)。


## 既有图证0211 1770020285909241957-02.jpg redirect

当前图片 1770020285909241957-02.jpg 内容SHA256与既有已阅 1765031161011568961-02.jpg 相同，复用已核验像素；当前字节重新核对。

SSO init callback图含google.com加percentencodedU+3002再被遮挡域后缀，无Location/浏览器最终origin。raw字符串前缀allowlist与URL/IDNA点规范化必须一致，U+3002视觉点不是凭看到就成功。自有惰性URL parser用合成域比较规范后精确origin、合法redirect_uri和拒绝相似suffix，区分跳转与OAuthtoken/ATO影响；不补隐去域、发SSO请求或导航。

原始阅图时间保留为 2026-10-11T13:59:29.381Z；未重新登记新阅图或访问外链。

来源：[保存帖1](https://x.com/i/status/1770020285909241957)。


## 跳转 XSS 与账号接管的独立门槛0212-redirect

保存正文从跳转参数替换为 JavaScript，再推断窃 cookie 和账号接管。先查最终 URL 消费者、允许 scheme、执行 origin 和 CSP；导航字符串出现并不代表执行。惰性 URL/字符串正反例应区分允许的 HTTPS、拒绝的 scheme 与未消费参数。即使有脚本执行，也需分别证明敏感会话可读、有效登录态可重放与最终权限变化；HttpOnly、无登录态、无效 token 和二次验证是反例。不开回调、不读 cookie、不重放会话。

来源：[保存帖1](https://x.com/i/status/1771975317454029109)。


## SSO 跳转前路径和文件读取终态0212-redirect

正文描述 domain.tld 跳至 domain.tod 的目录，再跳至 SSO，随后在第一次跳转后变换路径得到 200。保留 domain.tod 字面值，不能悄悄当同主机；逐跳核范围、路由、身份和实际文件消费者。惰性对照为正常私有对象、不存在路径、同内容软 404 和被拒绝标记，确认受保护字节而非仅状态。图片仅奖励题名，未保存具体读取链，不能推断任意文件/P1；不绕过登录或读系统文件。

来源：[保存帖1](https://x.com/i/status/1772897102500143325)。


## 保存图证0213-62-1776052350723231996-02.jpg-redirect

已核对保存图片 `1776052350723231996-02.jpg`。Pangle历史摘要redirect参数反射缺HTML转义/输出编码而形成浏览器XSS，图未给具体上下文或payload且称已修复/no exploitation evidence。URL跳转消费者与HTML渲染消费者分开，惰性标记对照正确编码/普通文本/真实HTML上下文，需CSP与接收者证据；参数叫redirect不等纯开放跳转或普遍可执行，不发送请求。

图片证据：1776052350723231996-02.jpg。采用可见内容，裁切、遮挡和未保存阶段不补造。

来源：[保存帖1](https://x.com/i/status/1776052350723231996)。


## 保存图证0213-74-1776605381285826796-02.png-redirect

已核对保存图片 `1776605381285826796-02.png`。OAuth序列图登录先cookie code_verifier，authorize redirect_uri内有next，再用户登录/code回调/校验verifier与code后按next跳转；图仅流程，无DOMXSS代码或ATO终态。区分授权服务、callback、PKCE verifier的会话绑定和next导航消费者，惰性错误verifier/已用code/不允许redirect/next与正常流程对照；图未列state不代表实现无state，正文1click主张另证，不登录或读cookie。

图片证据：1776605381285826796-02.png。采用可见内容，裁切、遮挡和未保存阶段不补造。

来源：[保存帖1](https://x.com/i/status/1776605381285826796)。


## 保存正文0214-redirect：相对导航与链式影响逐段确认

正文称相对 URI 重定向可链 RXSS/SSRF/ATO；同源相对导航不自动是开放重定向，浏览器导航也不是服务端 fetch。每段需分别核可控目的地、渲染 sink、服务器请求及最终授权事务，离线比较同源路径、拒绝外部目的地和惰性内容。缺少任一消费者时只记录假设，不把标题链当已读利用。

来源：[保存帖1](https://x.com/i/status/1779836676002693478)。


## 保存图证0214-30-redirect：1777812338768482632-02.png

已实际核对完整保存图片 `1777812338768482632-02.png`。XSS列表location/document/cookie多种语法与fetch外送，含未赋值/空参数/可疑doc缩写Unicode示例，不能当全部有效JS。导航、属性访问、cookie可读性、HttpOnly和外部connect-src是独立消费者；惰性语法/作用域/同origin/CSP允许表对照，十进制authority/scheme-relativeURL按实际解析，不读取cookie、fetch外送或执行片段。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1777812338768482632)。


## 保存图证0214-48-redirect：1778362646980403439-02.jpg

已实际核对完整保存图片 `1778362646980403439-02.jpg`。refresh-jwt 路由中的 redirect 查询值被保存报告描述为反射型 XSS，并附浏览器弹窗图。这里的关键是重定向输入进入 HTML sink；不能因参数叫 redirect 就只查导航，也不能由路由名称认定 JWT 认证绕过。以惰性标记核对解码、输出上下文、CSP 与真实浏览器消费者。报告状态和奖金不补足完整响应、跨用户影响或原生桥证据。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1778362646980403439)。


## 保存正文0215-redirect：URI scheme 的 sink 不相同

保存 file/javascript/data 候选需按实际消费者分析：导航、脚本src、HTML属性、iframe与桌面handler的允许scheme、origin和CSP不同。file:///指向本地也不自动让HTTP页读取本地文件，data HTML不保证保留原站身份，javascript也需可执行导航。离线惰性URI与拒绝scheme反例核解码/语法，不读取文件、加载恶意脚本或执行保存载荷。

来源：[保存帖1](https://x.com/i/status/1781639148627275985)。


## 保存图证0215-63-redirect：1782353270423372221-02.jpg

已实际核对完整保存图片 `1782353270423372221-02.jpg`。浏览器 desync 截帧连续显示两段 HTTP/1.1 307、CL0、keep-alive 与 Location，前置请求/连接上下文未显示。两响应可能来自正常两请求/重定向；需离线核精确请求计数、字节边界、连接重用和谁解析剩余数据。CL0/keep-alive 本身非走私证明，不能据 X-Azure/X-Cache 头认定部署或缓存投毒，不复现外部 desync。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1782353270423372221)。


## 正文0216-188-redirect：Unicode句点经解码和IDNA后的host需要重新验证

正文%E3%80%82用于SSOcallback名单图仍只是URL；raw看似可信前缀经过percentdecode/Unicodehost映射最终域不同。离线parse-beforevalidate、准确host/path/scheme及SSOtransaction绑定的允许/拒绝fixture，比较query/fragment/userinfo被当文本的反例，不导航真实SSO或claimgrant，没有最终Location不足以确证重定向。

来源：[保存帖1](https://x.com/i/status/1786440619864318335)、[保存帖2](https://x.com/i/status/1786503024762089695)。


## 保存图证0216-33-redirect：1784531049101582758-02.jpg

已实际核对完整保存图片 `1784531049101582758-02.jpg`。HTML链接/onclick/form/iframe/邮件与cookie外传候选；自加script-src-elem unsafe-inline字符串不自动修改真实CSP、链接不等开放重定向、file://iframe不等远程读文件、HttpOnly cookie不可由document.cookie读取。离线惰性标记按HTML文本/属性/JS/导航/嵌入消费者和origin/CSP/动作授权分别对照，不建钓鱼表单、执行script或外传。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1784531049101582758)。


## 保存图证0216-43-redirect：1784890960263983458-02.jpg

已实际核对完整保存图片 `1784890960263983458-02.jpg`。重定向scheme-relative/反斜杠/userinfo/子串/query/fragment/Unicode点/CRLF候选表；末行把%0d%0a称nullbyte不正确。每阶段URL解码/host规范化和最终Location/浏览器destination对比严格allowlist、同站path/禁无效scheme负例；子串出现可信域不等最终host，不执行重定向/SSO或凭据流。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1784890960263983458)、[保存帖2](https://x.com/i/status/1876932357699096647)。


## 保存图证0216-43-redirect：1785587974069256395-02.jpg

已实际核对完整保存图片 `1785587974069256395-02.jpg`。重定向scheme-relative/反斜杠/userinfo/子串/query/fragment/Unicode点/CRLF候选表；末行把%0d%0a称nullbyte不正确。每阶段URL解码/host规范化和最终Location/浏览器destination对比严格allowlist、同站path/禁无效scheme负例；子串出现可信域不等最终host，不执行重定向/SSO或凭据流。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1785587974069256395)。


## 保存图证0216-44-redirect：1876932357699096647-02.jpg

已实际核对完整保存图片 `1876932357699096647-02.jpg`。同重定向表不同保存字节：%40在userinfo与%23fragment/%3fquery按解码时点决定host，Unicode点与反斜杠各consumer可能不同；%0d/%0a是CR/LF非NUL。离线不导航的解析模型正反例逐层保留raw与normalizedURL，只有最终导航离开allowlist才可确认，不套用所有格式。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1784890960263983458)、[保存帖2](https://x.com/i/status/1876932357699096647)。


## 保存图证0216-95-redirect：1786440619864318335-02.jpg

已实际核对完整保存图片 `1786440619864318335-02.jpg`。SSOinitcallback含google.com%E3%80%82后续域名的URL截图，未显示Location/最终导航或grant。Unicode句点按percentdecode/IDNA/URLparser阶段影响hostname，substringallowlist不足；离线raw→normalizedcallback→严格允许host/path/SSO事务绑定正负模型，不导航/请求SSO/使用token。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1786440619864318335)。


## 保存图证0216-95-redirect：1786503024762089695-02.jpg

已实际核对完整保存图片 `1786503024762089695-02.jpg`。SSOinitcallback含google.com%E3%80%82后续域名的URL截图，未显示Location/最终导航或grant。Unicode句点按percentdecode/IDNA/URLparser阶段影响hostname，substringallowlist不足；离线raw→normalizedcallback→严格允许host/path/SSO事务绑定正负模型，不导航/请求SSO/使用token。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1786503024762089695)。


## 保存图证0216-105-redirect：1786472123768168603-02.jpg

已实际核对完整保存图片 `1786472123768168603-02.jpg`。历史undici.request跨originredirect已删Authorization/Cookie却留ProxyAuthorization/xauthtoken，报告称v6.7.0相较v5.28.3/v6.6.1回归，代码裁切不补当前适用。离线本地纯状态模型比较同origin/跨schemehostport跳转与敏感headers allowlist，代理凭据有独立目标/可信边界，各跳检查实际出站，无真实token/网络请求。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1786472123768168603)。


## 正文0217：断链与可控制目的地分离（redirect）

营销页面链接失效只提供发现线索；需区分固定失效目的地、任意用户可控 redirect、域名重新分配和实际接收方。保留历史跳转图、所有者及时间，离线合法/失效/受控虚拟目的地与允许列表比较，域名待售、账号名可用和评级不能证明已控制。不购买域名、注册账号或联系所有者。

来源：[保存帖1](https://x.com/i/status/1788171492141715647)。


## 正文0217：聊天排版变体按同一消费者确认（redirect）

正文img属性、CSS圆与HTML排版只证明候选内容进入预览/渲染，无共享存储、脚本或自动跳转。模型输出/用户输入是数据，逐阶段核对消毒器、最终DOM、允许格式、外部资源和origin，以离线字面文本/正确编码/拒绝属性比较。普通链接不是任意重定向，多个视觉变体按同sink去重；只描述实际显示而不补成三种漏洞。

来源：[保存帖1](https://x.com/i/status/1789372209200328938)、[保存帖2](https://x.com/i/status/1789375111641891110)、[保存帖3](https://x.com/i/status/1789390046543462810)。


## 保存图证0217-1-redirect：1786598163521958089-02.jpg

已实际核对完整保存图片 `1786598163521958089-02.jpg`。图片列出 scheme-relative、反斜杠、userinfo、域名后缀、编码分隔符与 Unicode 域名等重定向候选，没有实际 Location 或最终导航。需追踪输入解码、URL 解析、IDNA、允许列表及实际消费者，以离线合法同站地址、非法主机和相对路径作对照；%0d%0a 是 CR/LF，并非图中所称 NUL。登录流程另核对 state 与接收方，候选本身不能证明账号影响。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1786598163521958089)。


## 保存图证0217-54-redirect：1788705723880276214-02.jpg

已实际核对完整保存图片 `1788705723880276214-02.jpg`。保存报告描述一个有意跳转到出售中域名的固定链接，并明确原先与卖家对话不是有效证明。固定失效目的地不等于可控任意重定向；待售也不等于已控制/同意转移。离线重定向图、范围和期望接收方对照，记录历史状态及可能用户影响，不联系卖家、购买域名或认定 takeover 已完成。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1788705723880276214)。


## 保存正文0218：反射模板的每种漏洞类别需要独立消费者（redirect）

正文把反射检测关联到 XSS、CSRF、缓存投毒和跳转。记录输入位置、解码、原始响应、实际消费者及状态变化，分别检查 HTML/JS sink、浏览器凭据和业务动作、缓存键与无输入的独立请求、导航目标与验证规则。离线用唯一惰性标记和正常编码响应作对照；反射、扫描器标签或单次命中不能同时确认这些漏洞，弃用模板不说明目标已修复。

来源：[保存帖1](https://x.com/i/status/1789677001189802094)、[保存帖2](https://x.com/i/status/1790037556102394272)。


## 保存正文0218：YQL 重定向与命令消费者各需独立前提（redirect）

正文及截图声称重定向绕回环限制，再到 ymon 命令消费者。分别核每跳的 URL/DNS/地址检查、服务端网络身份、目的服务认证以及字段是否传给命令解释器；离线虚拟取回器比较各跳重新校验。到达内部 URL 不等于可执行命令，目标参数与历史标题不证明当前可达或完整链，未发送请求。

来源：[保存帖1](https://x.com/i/status/1790895772109885878)、[保存帖2](https://x.com/i/status/1791023453182570880)。


## 保存正文0218：短链接失效或重分配不等于任意跳转控制（redirect）

正文及图涉及 Bitly 官方短链接破损及可能重新认领。确认实际短链接归属、服务重分配规则、可控目标、受害者点击与业务信任；用离线映射表比较不存在、正确归属和已回收条目。失效页面不是他人可控，既有跳转功能不是认证绕过；未创建或认领短链接。

来源：[保存帖1](https://x.com/i/status/1790895934878192065)、[保存帖2](https://x.com/i/status/1791023451878101070)。


## 保存图证0218-38-redirect：1790895934878192065-02.jpg

已实际核对完整保存图片 `1790895934878192065-02.jpg`。Bitly摘要为官方账号描述中的失效短链转向非预期目的地，潜在可劫持；未显示短码控制/claim或当前跳转。固定链接重分配与参数任意重定向分开，离线短码所有者/目的地/历史版本对照与批准范围确认，不注册/认领短码、访问真实用户或依据评级推定已控制。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1790895934878192065)。


## 保存正文0219：continue 跳转中的 access token 需要目标和用途绑定（redirect）

正文只保留线程1/n：continue导致转向另一app并把access_token放到查询。核实际URL解析/允许目标、token接收者与audience/scope、日志与Referer等泄露面及消费端授权；离线虚拟重定向映射和惰性token比较受限/允许目标。token字样和私人公司域示例不证明任意跳转或接管，未保存后续不补造，不访问URL或使用token。

来源：[保存帖1](https://x.com/i/status/1792753282680762449)。


## 保存正文0219：Unicode 点和多斜线按最终 URL 消费者比较（redirect）

正文给U+3002/%E3%80%82和多斜线跳转候选，图仅历史报告标题。保留原字节、百分解码、Unicode域名映射、authority与最终主机，并核验证前后和每跳的处理；离线惰性允许/拒绝域比较ASCII点、Unicode点和多斜线。外观相似和黑名单差异不证明实际导航或服务端取回成功，不点击URL。

来源：[保存帖1](https://x.com/i/status/1793233092943196475)。


## 保存正文0219：文档预约链接的 404 不直接证明可认领（redirect）

保存图给文档到Calendly的引用与作者认领声称。分别确认目标命名/回收规则、实际可控内容和用户信任，离线资源映射比较不存在和可回收状态；历史404或同名账号不是接管成功的当前证明，不能从链接点击推定凭据泄露，不认领、冒充或预约。

来源：[保存帖1](https://x.com/i/status/1793295966877213112)。


## 保存正文0219：反射模板命中不能同时确认多种漏洞（redirect）

正文列反射模板与多类型潜在攻击，当前复用图片显示历史Nuclei反射匹配和og:image头候选。分别核浏览器sink/CORS可读/CSRF动作、缓存键与独立请求、导航与OAuth允许目标，离线惰性正常/拒绝消费者作对照。工具Low与反射不是执行或共享缓存成功，模板deprecated提示和版本应保留，未运行扫描。

来源：[保存帖1](https://x.com/i/status/1793813590870569059)、[保存帖2](https://x.com/i/status/1794598785471140325)。


## 保存图证0219-21-redirect：1793233092943196475-02.jpg

已实际核对完整保存图片 `1793233092943196475-02.jpg`。历史报告题名给中文点U+3002、%E3%80%82和redirect_to中的多斜线；只有New/Open/Low题名，无Location或实际导航。记录原字节、百分解码、Unicode域名映射、URL authority及每跳消费者，离线比较同一惰性允许/拒绝域在ASCII点、U+3002和多斜线下的最终主机。过滤器与消费者规范化不一致是候选，题名不能确认当前跳转或SSRF，不访问候选URL。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1793233092943196475)。


## 保存图证0219-26-redirect：1793295966877213112-02.jpg

已实际核对完整保存图片 `1793295966877213112-02.jpg`。Doppler文档截图显示scheduling a call指向Calendly资源且作者称404后可认领同名账号，下方认领PoC裁切。分别核文档链接、服务命名/回收政策、实际可控页面和用户信任，离线映射比较不存在与可回收同名资源；404不单独证明认领，历史叙述不保证当前行为，不注册、冒充或预约。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1793295966877213112)。


## 保存图证0220-31-redirect：1795847776028516575-02.jpg

已实际核对完整保存图片 `1795847776028516575-02.jpg`。Undici历史摘要区分fetch与request/dispatch/stream/pipeline跨origin重定向清头行为，称修复v5.28.4/v6.11.1并在下部提ProxyAuthorization/x-auth-token。核具体API/构建、每跳scheme-host-port及敏感头处理，离线虚拟惰性头在同/跨origin对照。Authorization/Cookie已清不能推所有头已清，origin不同与代理身份需分别判断；保存公告不作最新保证，不发送真实凭据。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1795847776028516575)。


## 保存图证0220-33-redirect：1796019646598094938-03.jpg

已实际核对完整保存图片 `1796019646598094938-03.jpg`。Coffin 方法2显示 httpx/katana/JS、模板、扩展名、bxss、subzy、corsy 等串联，没有实际响应。katana 深度、被动来源、静态格式排除与 .js$ 过滤会丢失候选；模板路径/版本、并发、错误与范围要记录。远程脚本回连片段不作为执行指令，反射须与真实浏览器执行区分。自定义 Origin、Cookie 或 GoogleBot UA 的CORS输出须以两个受控来源、浏览器读响应及凭据状态对照；候选接管、LFI、跳转须各自确认资源归属与语义，工具名称和模板命中不补为成功链。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1796019646598094938)。


## 保存图证0220-33-redirect：1796125702112043158-03.jpg

已实际核对完整保存图片 `1796125702112043158-03.jpg`。Coffin 方法2显示 httpx/katana/JS、模板、扩展名、bxss、subzy、corsy 等串联，没有实际响应。katana 深度、被动来源、静态格式排除与 .js$ 过滤会丢失候选；模板路径/版本、并发、错误与范围要记录。远程脚本回连片段不作为执行指令，反射须与真实浏览器执行区分。自定义 Origin、Cookie 或 GoogleBot UA 的CORS输出须以两个受控来源、浏览器读响应及凭据状态对照；候选接管、LFI、跳转须各自确认资源归属与语义，工具名称和模板命中不补为成功链。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1796125702112043158)。


## 保存图证0222-19-redirect：1801473264696627504-02.jpg

已实际核对完整保存图片 `1801473264696627504-02.jpg`。redirect一行有while read host do;do语法错误；gau||等是首成功不是全部源，qsreplace替换所有参数、curl-s-L-I未引用host并跨跳转。grep恶意地址可匹配任意头/中间跳非最终导航，需结构化Location/每hoporigin/协议/阴性基线；不执行命令、不跟随外站。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1801473264696627504)。


## 保存图证0222-25-redirect：1801558775029186642-02.jpg

已实际核对完整保存图片 `1801558775029186642-02.jpg`。OAuthredirect_uri静态列表混合嵌套跳转、重复参数、%00、fragment、userinfo@、后缀域、反斜杠/CRLF与state。分别解析authority/path/query/decode次数、重复键选择与授权服务器精确注册URI，fragment和点段不自动换host、state不是redirect_uri。必须证明code/token到未注册接收方及PKCE/state限制，列表无结果不称ATO，不访问列表域。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1801558775029186642)。


## 保存图证0222-25-redirect：1803339391596696060-02.jpg

已实际核对完整保存图片 `1803339391596696060-02.jpg`。OAuthredirect_uri静态列表混合嵌套跳转、重复参数、%00、fragment、userinfo@、后缀域、反斜杠/CRLF与state。分别解析authority/path/query/decode次数、重复键选择与授权服务器精确注册URI，fragment和点段不自动换host、state不是redirect_uri。必须证明code/token到未注册接收方及PKCE/state限制，列表无结果不称ATO，不访问列表域。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1803339391596696060)。


## 保存图证0223-54-redirect：1805173547498651905-02.jpg

已实际核对完整保存图片 `1805173547498651905-02.jpg`。重定向候选清单含 next、url、target、dest、redirect_uri、returnTo、checkout_url、continue 与路径段等。参数名只是查找入口，需识别服务端 Location、客户端导航或普通资源获取的真实消费者，并以允许/拒绝的虚拟 origin 比较最终导航和校验解析；OAuth回调还须绑定客户端注册、state 和完整流程。没有实际重定向响应，不据字段名认定漏洞。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1805173547498651905)。


## 保存图证0223-72-redirect：1805586944853950852-02.jpg

已实际核对完整保存图片 `1805586944853950852-02.jpg`。#993978 报告说明旧 CNAME 指向未认领 Zendesk 子域和自定义域，创建同名 Help Center 后 HTTP 访问跳转至含作者标记的托管页，附视频未保存。区分DNS悬挂、供应商资源可认领、自定义域验证和实际受信任内容呈现，记录 HTTP/HTTPS 的差异；历史平台规则不代表当前可认领，标题或404不够。修复为移除指向或改为受控资源；只提炼保存报告，不注册租户、绑定域或接管资源。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1805586944853950852)。


## 保存图证0223-81-redirect：1805677870662271352-02.jpg

已实际核对完整保存图片 `1805677870662271352-02.jpg`。#2341038 摘要称重置邮件URL中的路径参数可改为其他域，用户点击后 token 泄露并被用于重置。应分开验证参数控制、最终导航、秘密实际传递方式、token主体/有效期/一次性与受保护改密；开放重定向不自动等于token外传或接管。使用虚拟URL和本地安全标记描述链条，截图没有完整响应及验证步骤，不发送邮件、访问接收端或使用令牌。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1805677870662271352)。


## 保存既有图证0223-56-redirect：1804143170730504415-02.jpg

当前保存图片 `1804143170730504415-02.jpg` 已按原始SHA重新核对，与既有实际看过的完整图片内容相同。redirect一行有while read host do;do语法错误；gau｜｜等是首成功不是全部源，qsreplace替换所有参数、curl-s-L-I未引用host并跨跳转。grep恶意地址可匹配任意头/中间跳非最终导航，需结构化Location/每hoporigin/协议/阴性基线；不执行命令、不跟随外站。

沿用原视觉核对时间；当前帖子来源和文件名绑定，未重复计入新增视觉内容。

来源：[保存帖1](https://x.com/i/status/1804143170730504415)。


## 保存正文0224-152-redirect：javascript协议中的编码制表符

%09Jav%09ascript片段可能依入口解码和URL解析规范化改变scheme，但只有实际导航消费者才相关，HTML/字符串其他位置不等效。记录字节到最终URL/DOM的顺序、允许协议与CSP，比较允许https和拒绝脚本协议的本地标记；修复绕过与ATO自述未有完整链，不接触真实会话。

来源：[保存帖1](https://x.com/i/status/1807815027006607811)。


## 0225 REFLECTION跨类型标签 redirect

保存文本的reflection.yaml命令给出XSS/SSRF/缓存投毒/重定向/OAuth标签，没有模板正文。反射只定位输入到表示的候选链；分别证明浏览器执行、服务端实际连接、独立干净请求缓存消费、最终导航和OAuth绑定，不能由一个matcher同时判定多个漏洞。两篇重复正文的图片及当前来源需独立绑定。

来源：[保存帖1](https://x.com/i/status/1808686018599743656)、[保存帖2](https://x.com/i/status/1815204179172053406)。


## 0225 混合大小写javascript与CRLF redirect

原帖称三斜杠导航先到evil.com.domain.com，最后混合大小写、百分号编码javascript方案和CRLF成功。该字符串不等于标准HTTP外站重定向：记录逐层解码、URL解析、Location/前端导航消费者、最终origin及CSP，区分同域子路径、脚本URL与外站跳转，不从自述还原未保存完整请求。

来源：[保存帖1](https://x.com/i/status/1808812394480599129)。


## 0225 returnUrl候选 redirect

正文只有奖励与检查returnUrl提醒，没有输入或响应。检查实际解码/规范化、允许origin和最终导航消费者；同源路径/反射不等于外站跳转或ATO，奖励不补证据。

来源：[保存帖1](https://x.com/i/status/1810700244700512717)。


## 0227 正文 社交 handle 到 href redirect

不同站点 profile 字段要按 handle 规则构造允许 host/path，防止社交标志掩盖任意下载目标。报告标签 RFI 不证明服务端 include，最终点击、内容来源和执行各需独立证据。

来源：[保存帖1](https://x.com/i/status/1815732769735029036)、[保存帖2](https://x.com/i/status/1815733786816233507)。


## 0227 图片 1815438252608024941-02.jpg redirect

现有图片 1815438252608024941-02.jpg 的完整可见内容已按原图审阅。

练习清单指出 CORS 不能仅判断白名单字符串是否出现在 Origin 中；按 scheme、host、port 解析并作精确允许列表匹配，检查 credentials 与可读敏感响应。其余私有工具、信息泄露、SSO token 重定向及 XSS 均为题目提示，需各自验证输入到消费端与受害者边界，不能凭清单确认泄露或令牌窃取。

来源：[保存帖1](https://x.com/i/status/1815438252608024941)。


## 0227 图片 1815733786816233507-02.jpg redirect

现有图片 1815733786816233507-02.jpg 的完整可见内容已按原图审阅。

HackerOne 报告截图说明社交 handle 校验不一致，除 Twitter 外部分字段可构造自定义 URL，并通过社交按钮引导下载恶意 zip。验证最终 href 的 scheme、host、路径与标签展示一致性，按各站 handle 语法构造链接并阻止任意目标。截图的 Remote File Inclusion 标签不证明服务端包含或执行远程文件，也不证明自动下载/执行；实际点击和内容来源信任应分开。

来源：[保存帖1](https://x.com/i/status/1815733786816233507)。


## 0230 正文 路径中的域名不能决定重定向目的地 redirect

test.com/redirect.com/test 中 redirect.com 仍是原站路径，需核真实URL解析、Location、客户端跳转代码及最终origin。目录枚举或200不是开放重定向，匹配正常同源路由与自有允许/拒绝目的地再确认跳转能力，不自动推导令牌泄露或ATO。

来源：[保存帖1](https://x.com/i/status/1822727393510904116)。


## 0230 正文 重定向状态和协议能力不能泛化 redirect

30X声称301–308与任意gopher/ftp/file，但304非普通导航重定向，305/306历史语义不同；303常改GET，307/308保持方法，库支持协议/凭据/重定向预算各异。核Location及实际客户端/服务端下一跳，以隔离自有目的地对照；第三方重定向可泄原URL，不上传秘密或内网目标，未访问服务。

来源：[保存帖1](https://x.com/i/status/1824161806840926402)。


## 0230 正文 子域指向恶意站按 DNS 与跳转分开核验 redirect

正文只称测试子域pointing malicioussite，需保留DNSCNAME/地址链或HTTP Location、实际归属、历史资源生命周期和受控内容证据。恶意名声、测试前缀或奖励不证明可认领资源/接管，单域风险不扩到全站，未访问恶意站或注册域。

来源：[保存帖1](https://x.com/i/status/1825688604464881677)。


## 0230 图证 17 redirect 1823293148593819863-04.jpg

已核对原始图片 `1823293148593819863-04.jpg`。Rails UnsafeRedirectError实际拒绝跨host并提示allow_other_host，显示RootRoutes redirect拼query_string与局部变量。错误消息支持拒绝路径而非openredirect成功；核URL最终解析和Location，debug源码/console公开是另一条能力证据，错误UI有prompt不等于可执行。未操作console或跟重定向。

来源：[保存帖1](https://x.com/i/status/1823293148593819863)。


## 0232 正文 javascript导航与分号 redirect

redirect参数的javascript值执行需到实际浏览器导航/链接/DOM消费者，单个分号被拒或允许可能来自应用校验/编码差异，不能推广为协议的一般规则。alert图无原URL，javascript执行与HTTP Location外部重定向是不同证据，核最终DOM/CSP和触发，不执行。

来源：[保存帖1](https://x.com/i/status/1830119604749779402)。


## 保存图证0232-66-redirect：1830119604749779402-02.jpg

已核对保存图片 `1830119604749779402-02.jpg`。页面alert(-1337)图无URL/输入来源，正文javascript:alert();与无分号差异需核URL验证/编码/属性或导航消费者，分号本身不是浏览器通用禁用规则。javascript协议不是跨站Location开放重定向的同一证据，未导航或执行。

来源：[保存帖1](https://x.com/i/status/1830119604749779402)。


## 0233 正文 三类URL解析消费者 redirect

Absolute URL、Host值与浏览器CORS Origin对userinfo、端口、路径、fragment和编码的允许规则不同；把某载荷在所有上下文使用会造假候选。核输入原字节→校验→解码/IDNA→客户端或后端最终host/effectiveorigin，并考虑重定向再次校验、IPv4映射/非标准表示的实际支持。211是生成数量不是成功绕过数量，不访问工具/目标。

来源：[保存帖1](https://x.com/i/status/1833198861663531389)、[保存帖2](https://x.com/i/status/1833249061631344871)。


## 0233 正文 callback反射与跳转能力 redirect

logout/callback字段可能进入HTML/JS而非HTTP Location，截图闭script后弹窗只是该页面某执行线索。核真实响应消费者、解码/CSP、交互/会话需求和独立的重定向目标，原题名“openredirect升级”不补出缺失链；未注销或执行。

来源：[保存帖1](https://x.com/i/status/1833419030461301110)。


## 保存图证0233-31-redirect：1832093353846169956-05.jpg

已核对保存图片 `1832093353846169956-05.jpg`。RailsUnsafeRedirectError提示pass allow_other_host true是实际拒绝重定向，不证明开放跳转。图代码redirect_to route+querystring/变量面板需核目标构造/相对绝对解析，堆栈泄露与重定向安全边界分开；不要把错误提示当修改建议，未跳转。

来源：[保存帖1](https://x.com/i/status/1832093353846169956)。


## 保存图证0233-71-redirect：1833198861663531389-02.png

已核对保存图片 `1833198861663531389-02.png`。URLvalidation工具图AbsoluteURL/HostHeader/CORS三上下文，allowed/attacker示例domains和211候选，仅8行反斜杠/编码@/#/:/;等可见。实际解析器的userinfo/authority/fragment、解码顺序/HostSNI和浏览器合法Origin分别核，candidate数量≠都可用/绕过，未生成实际目标或请求。

来源：[保存帖1](https://x.com/i/status/1833198861663531389)。


## 保存图证0233-73-redirect：1833198861663531389-04.png

已核对保存图片 `1833198861663531389-04.png`。工具说明3上下文与domainallowlist/fakerelative/loopback等wordlist、Intruderpercent/everything/specialchars/UnicodeEscape编码，右/下裁缺尾。转义应匹配HTTP字段/消费者，JS样式Unicodeescape不保证URL解码，重复编码可能改变host/CORS合法性；截图说明不是当前所有版本/工具兼容保证，不运行字典。

来源：[保存帖1](https://x.com/i/status/1833198861663531389)。


## 保存图证0233-74-redirect：1833249061631344871-02.jpg

已核对保存图片 `1833249061631344871-02.jpg`。另工具列表行33–45含%0D%0A/%0D、U2028/U2029、空格/@/&/;/fragment/子域后缀，211为生成数非已测。控制字符可被拒、解析分歧/显示混淆与SSRF/CORS/redirect消费者分开，简单包含example不证明allowed，最终host/effectiveOrigin与范围需核，未访问目标。

来源：[保存帖1](https://x.com/i/status/1833249061631344871)。


## 保存图证0233-76-redirect：1833419030461301110-02.jpg

已核对保存图片 `1833419030461301110-02.jpg`。/facebook/logout.php callback编码引号/闭script/新script/%0aTEST与浏览器空alert图，核callback真实响应HTML/JSsink、解码/CSP/会话。不是看到callback或标题openredirect就证明Location外跳，弹窗与Cookie/ATO分开，未logout/执行。

来源：[保存帖1](https://x.com/i/status/1833419030461301110)。


## 保存正文0236：反射模板需转为各consumer的独立证据（redirect）

正文把reflection命中列为potential XSS/SSRF/cache/redirect/OAuth。文字/header影响只给起点；脚本sink/执行、server fetch、cachekey/独立HIT、Location和code/state/token绑定是不同链。保存模板版本/警告、逐头唯一标记/请求身份与正常反例，工具Low/无结果不能判全部漏洞存在或安全，不外带或运行。

来源：[保存帖1](https://x.com/i/status/1839365202783134073)、[保存帖2](https://x.com/i/status/1839629091026371003)、[保存帖3](https://x.com/i/status/1839655657307578492)、[保存帖4](https://x.com/i/status/1839773579765752045)。


## 保存正文0236：同形字符绕过滤须核规范化host（redirect）

正文Unicode混合名/。与图同形字符，显示相似不等URL解析结果。保留原码点→IDNA/点号/大小写规范化→allowlist→Location/browser最终host，黑名单替换不足权限，不因看似Google称一定外域，未访问注册。

来源：[保存帖1](https://x.com/i/status/1840583239393804336)。


## 保存图证0236-73-redirect：1840583239393804336-02.png

已核对保存图片 `1840583239393804336-02.png`。Homograph图列大小写/相似Unicode，视觉相似不等host相同或一定不同。比较原码点、IDNA/URL解析后规范host、allowlist与真实Location/navigation，大小写一般同DNS，兼容映射依解析器；字符串黑名单/WAF命中不能证明redirect，未访问/注册。

来源：[保存帖1](https://x.com/i/status/1840583239393804336)。


## 保存正文0237：SVG 命名空间与嵌入方式（redirect）

正文的 SVG 示例在 URL 与命名空间周围含尖括号，需保留原始字节并区分排版损坏与实际有效语法。onload 和跳转的表现受内联、外部资源、图片嵌入及 CSP 上下文影响；客户端导航不证明服务端重定向或 SSRF。没有上传或执行结果，不修复后执行源帖载荷。

来源：[保存帖1](https://x.com/i/status/1841676040957055030)。


## 保存图证0238-39-redirect：1844713105646932119-02.jpg

当前附件 `1844713105646932119-02.jpg`。已实际审阅保存的原始图片。重定向图给出相对双斜线、反斜线、空白编码、路径规范化和用户信息分隔的 URL 候选。服务端校验、Location 生成与浏览器 URL 解析须用同一原始字节跟踪；视觉域名、编码字面与最终规范主机可能不同，但每项不保证被接受。没有跳转结果，不打开外部地址或执行候选。

来源：[保存帖1](https://x.com/i/status/1844713105646932119)。


## 保存图证0238-80-redirect：1845737400531898877-02.jpg

当前附件 `1845737400531898877-02.jpg`。已实际审阅保存的原始图片。候选生成 UI 分 Absolute URL、Host header、CORS 并显示允许/攻击域字段与编码开关，保存图仅显示部分列表。不同消费者分别涉及 URL 规范主机、路由头及浏览器 Origin，不能互换输入模型；看似带允许域的字符串不保证解析为允许域或被浏览器接受，CORS 还需凭据及响应读权限证据。不生成请求、访问目标或补齐裁剪项。

来源：[保存帖1](https://x.com/i/status/1845737400531898877)。


## 保存图证0239-21-redirect：1846140813052436958-02.jpg

当前附件 `1846140813052436958-02.jpg`。已实际审阅保存的原始图片。第一张 fuzz 图只展示 20 条中的 1–10：主机、耗时、权限头、CRLF、重定向、多步认证、模板、大小写、响应去重与 XSS。每类需对应真实消费者与正常对照；耗时不证明盲 SSRF，状态 200 不证明越权，命令部分不完整且选项/管道输入需核版本。高线程与 rate 不作为授权，不执行扫描。

来源：[保存帖1](https://x.com/i/status/1846140813052436958)。


## 保存图证0239-37-redirect：1846494545531576495-02.jpg

当前附件 `1846494545531576495-02.jpg`。已实际审阅保存的原始图片。OAuth 图分 code 重用/客户端绑定、state、回调 URI 与移动 deep link、grant、secret、访问/刷新 token 和撤销竞态。按授权请求、代码交换、稳定主体、客户端、回调和最终权限核对；开放重定向不自动证明代码泄漏或接管，撤销 access 与 code 是不同状态。图片只给候选，不注册应用或交换 token。

来源：[保存帖1](https://x.com/i/status/1846494545531576495)。


## 保存图证0239-47-redirect：1846836914458186114-02.jpg

当前附件 `1846836914458186114-02.jpg`。已实际审阅保存的原始图片。SSRF 图把 URL 解析/地址表示、重定向、DNS、协议、渲染/文件/代理入口及内网/元数据消费者分开。每层需核最终目标、实际客户端允许协议与可归因请求，回执、端口耗时、文件内容和代码执行不是同一结论。不按图列举进行内网探测、元数据访问或外带。

来源：[保存帖1](https://x.com/i/status/1846836914458186114)。


## 保存正文0240：传递依赖发现到可达漏洞（redirect）

帖子声称手工 Go 审计发现路径穿越与传递依赖重定向问题，但没有保存调用代码。依赖清单/CVE 只形成候选；核对实际解析版本、传递路径、消费者、可控输入和可达调用，再区分越界路径与重定向。厂商 triaged 不证明最终定级或修复，未读取外部 CVE 全文。

来源：[保存帖1](https://x.com/i/status/1848527277157408784)。


## 保存正文0240：不可见字符与重定向消费者（redirect）

保存 javascript 与冒号之间有 U+200B，URL 还带人为分隔空格，应保存原字节与规范化链，不擅自改成工作载荷。HTTP Location、DOM navigation 与链接点击的 scheme 接受、CSP 和用户动作不同；正文声称仍有效不构成当前复现，未点击或请求。

来源：[保存帖1](https://x.com/i/status/1850073586863833517)。


## 保存图片0240：附件015（redirect）

URL 候选 UI 区分绝对 URL、Host 与 CORS，显示编码开关及 220 计数，但图片只显示前若干行并横向裁剪。不同输入模型涉及解析器、路由或浏览器 Origin，不能互换；用户名分隔、反斜线、fragment 与多层解码需实际消费结果，不声称读完全部候选或执行。

图片证据：`1848280112598544871-02.jpg`；仅保存图实际可见内容，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1848280112598544871)。


## 保存图片0240：附件033（redirect）

HackerOne 邮件显示基于 go.mod 传递依赖的 Open Redirect（CVE-2023-26494）报告被 triaged、创建内部工单且严重性可变。遮挡项目与包路径，不能重建依赖或复现；区分组件版本、可达调用与重定向消费者，triaged 不等于完成修复或最终定级。

图片证据：`1848527277157408784-02.png`；仅保存图实际可见内容，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1848527277157408784)。


## 保存图片0240：附件071（redirect）

HTTP 状态图按1xx–5xx分类，混有444、499、509、598/599等实现或历史扩展。需保留原始响应、代理层、正文、业务状态与重定向，不以200断言授权成功或以404/500认定漏洞；图谱不是当前标准注册表，未请求目标。

图片证据：`1850069357117964810-02.jpg`；仅保存图实际可见内容，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1850069357117964810)。


## 保存正文0242：重定向管道的引用与误判（redirect）

命令含smart quotes、gau/gf/qsreplace与25并发sh-c，插入URL的shell拼接有引号/元字符风险。替换全部query改变正常字段，grep Location字面含主机不保证结构化最终URL或任意外部跳转，curl-I不同GET/客户端跳转；按规范URL、状态链和目标归属对照，未执行。

来源：[保存帖1](https://x.com/i/status/1852578812460257721)。


## 保存图片0242：附件001·1852576505018363910-02.jpg（redirect）

目录分别列CORS扫描与CRLF/redirect工具。CORS要求实际浏览器跨源读取、身份/credential/敏感响应；CRLF需下游解析形成头/边界变化，工具标签不是漏洞证据，未安装或执行。

图片证据：`1852576505018363910-02.jpg`；按原始内容摘要对应实际审阅，同摘要的不同帖附件保留独立来源与文件名。

来源：[保存帖1](https://x.com/i/status/1852576505018363910)。


## 保存图片0243-52：1856023023368753216-02.jpg（redirect）

已审阅保存原图 1856023023368753216-02.jpg。redirect工具目录含HTTP/DOM分析与CRLF/fuzz。地址字符串命中、服务器Location与浏览器导航不同consumer，规范化/允许scheme/最后目标及身份负对照另核，未执行或请求。

来源：[保存帖1](https://x.com/i/status/1856023023368753216)。


## 保存图片0244-6：1856930627393917030-02.jpg（redirect）

已审阅该内容原图，当前保存附件 1856930627393917030-02.jpg。Acronis历史登录callback的redirectUrl含javascript方案，需用户点击并登录后消费；导航接收参数与JS执行上下文、CSP、origin和真实身份分别验证。document.domain提示不能自动证明HttpOnly cookie可读、账号接管或当前存在，截图底部执行图裁剪，未登录或执行。

来源：[保存帖1](https://x.com/i/status/1856930627393917030)。


## 保存图片0244-7：1856930786488062110-02.jpg（redirect）

已审阅该内容原图，当前保存附件 1856930786488062110-02.jpg。另一个Acronis报告为已登录后licensing-check的redirect_url javascript参数，与callback不同入口/认证前提；区分参数拼写、实际导航与执行身份，图片未完整展示弹窗/请求。历史Medium/$100不是通用影响，未使用账号或载荷。

来源：[保存帖1](https://x.com/i/status/1856930786488062110)。


## 保存图片0244-9：1856931307873562624-02.jpg（redirect）

已审阅该内容原图，当前保存附件 1856931307873562624-02.jpg。Tumblr logout redirect_to样例混反斜线百分号与@可信域，属于校验器与浏览器URL解析差异候选；应分别记录解码后字节、host/username解析及最终Location/导航。附视频未保存不补取，不能从示例称真实跳转或接管，未打开网址。

来源：[保存帖1](https://x.com/i/status/1856931307873562624)。


## 保存图片0244-19：1857029471431238131-04.jpg（redirect）

已审阅该内容原图，当前保存附件 1857029471431238131-04.jpg。OWASP目录末段有逻辑时序/次数/工作流/误用/上传、DOM/JS/HTML/CSS/资源/CORS/Flash/clickjacking/WebSocket/postMessage/storage/XSSI及GraphQL、报告附录；历史Flash项不代表现代默认能力，目录不证测试完成。按消费者和业务终态分组，API/schema可见性仍需权限证据，恶意文件/跨站动作另授权。

来源：[保存帖1](https://x.com/i/status/1857029471431238131)。


## 保存图片0244-21：1857048817591292230-02.jpg（redirect）

已审阅该内容原图，当前保存附件 1857048817591292230-02.jpg。双斜线路径图从/dir200到//dir的http://dir302，但//evil.com和带@样例404；候选行为不是任意域跳转已证，核验服务端Location、代理规范化及浏览器最终host，HTTP降级和重定向目标独立影响，未请求。

来源：[保存帖1](https://x.com/i/status/1857048817591292230)。


## 保存图片0244-22：1857091352745447768-02.jpg（redirect）

已审阅该内容原图，当前保存附件 1857091352745447768-02.jpg。Medium关联报告描述自有域指向不存在页404后页面被认领，附图仅部分和先前关闭/重报注记；区分DNS/跳转/嵌入链接、平台slug可认领、域验证和实际访问消费，不把404或平台内容页等同域名控制。重复争议和侧栏分类不证明现状，未认领或联系。

来源：[保存帖1](https://x.com/i/status/1857091352745447768)。


## 保存图片0244-52：1858095472633872387-02.jpg（redirect）

已审阅该内容原图，当前保存附件 1858095472633872387-02.jpg。Omise历史报告描述在请求Host下添X-Forwarded-Host后跳转；需要证明不可信转发头是否经受信代理重写、响应Location、普通跨站浏览器能否设置该header及最终host。代理修改成功不自动可构成受害者点击链/账号接管，未请求或跟随跳转。

来源：[保存帖1](https://x.com/i/status/1858095472633872387)。


## 保存图片0246-30：1863584134897279107-02.jpg（redirect）

已审阅保存原图 1863584134897279107-02.jpg。Localize历史Duplicate报告代理改Host得到跳转，图片无Location/浏览器终态；Host注入与受害者普通访问可控制header不同，trustedproxy/虚拟主机和URL生成需验证，不因代理改动就证点击钓鱼/所有登录绕过，未请求。

来源：[保存帖1](https://x.com/i/status/1863584134897279107)。


## 保存正文0246：redirecturi与跳转链（redirect）

正文提出操控redirect_uri/openredirect链，图不可读流程不补全文；注册匹配、授权请求/码兑换同uri、state/PKCE、AS/client角色及码/token不同consumer绑定分别核验。单openredirect不证token泄露/ATO，未OAuth登录或请求外链。

来源：[保存帖1](https://x.com/i/status/1864761665142899048)。


## 保存图证0247-110-redirect：1866754972483981720-02.jpg

已实际核对保存图片 `1866754972483981720-02.jpg` 的原始像素。curl netrc+redirect 报告 CVE-2024-11053，两个示例 HTTPS host、301 跨主机跳转、machine 与 default 项混合，命令使用 -L --netrc-file -v；摘要称特定条件下原主机凭据传给跳转目标。提炼为每一跳应重新确定凭据作用域和用户名/密码配对，核对具体版本、选项及 netrc 配置；不泛化到所有 curl 或默认请求，日志也需防凭据泄露。下文裁切，未构造服务、创建 netrc 或发请求。

来源：[保存帖1](https://x.com/i/status/1866754972483981720)。


## 保存图证0247-123-redirect：1866951270965317921-02.jpg

已实际核对保存图片 `1866951270965317921-02.jpg` 的原始像素。Point Smart 报告摘要称链接可离开预期应用环境，可能形成钓鱼入口，严重度由 Medium6.6 改为 Low2.1、已修复。需区分嵌入浏览器导航、外部 scheme、来源提示与特权 bridge/令牌携带；外部导航本身不自动构成账号接管或高权限 WebView 执行。截图没有 PoC 链接代码或全部前提，未点击导航。

来源：[保存帖1](https://x.com/i/status/1866951270965317921)。


## 保存正文0248：Location 候选需用实际 URL 解析和最终来源判断（redirect）

正文问 protocol:evilsite 形态哪个open redirect，示例域带逗号，图片缺失按覆盖。不能根据字符串外观选答案；逐层保留原请求、真实Location、相对/绝对/非HTTPscheme、浏览器base与最终origin。只在隔离解析模型核受控来源，跳转是否越权及OAuth消费者另证，未访问目标。

来源：[保存帖1](https://x.com/i/status/1868649032668893321)。


## 保存正文0249：Callback URL 先辨识消费者和拒绝语义（redirect）

正文换host报错，保存图给callBackUrl/OAST及Invalid Callback URL。字段可用于跳转、邮件链接或服务端取回，须分别追踪解析后scheme/authority、规范化和验证至消费的一致性；错误是拒绝证据而非绕过，null字段不透露具体验证实现。无回连/终态，不发送重置或外部请求。

来源：[保存帖1](https://x.com/i/status/1872779097241518215)。


## 保存图证0249-50-redirect：1872560707491017214-02.png

已实际核对保存图片 `1872560707491017214-02.png` 的原始像素。密码重置示意Host替换evil先404，再absolute-form request target保持target而Host为evil，作者称邮件链接换域。需确认代理/源站用于路由与生成链接的authority一致、受信固定origin、重置token收件人/一次性和实际邮件终态；图非真实回执，404本身为拒绝，不能推断ATO。未发重置邮件或接收token。

来源：[保存帖1](https://x.com/i/status/1872560707491017214)。


## 保存图证0249-55-redirect：1872628677923766743-02.jpg

已实际核对保存图片 `1872628677923766743-02.jpg` 的原始像素。curl2912277截图顶部明确DISREGARD、just joined example template，状态N/A；下方方括号通用模板称netrc+HTTPredirect泄密码及版本6.5–8.11.0。模板字段不是已证现行受影响版本，不能从标题Medium生成有效curl漏洞结论；将跨跳凭据作用域作为审计方向，实际版本/配置/请求另证，未运行命令。

来源：[保存帖1](https://x.com/i/status/1872628677923766743)。


## 保存图证0249-67-redirect：1872779097241518215-02.jpg

已实际核对保存图片 `1872779097241518215-02.jpg` 的原始像素。JSON例有username与callBackUrl指向OAST/user/reset。字段名不说明消费者是客户端跳转、邮件链接或服务端抓取；需要真实请求方法/身份、规范origin验证、用途绑定和最终资源/回执。本图没有响应或回连，不推断SSRF或ATO，未发送到OAST。

来源：[保存帖1](https://x.com/i/status/1872779097241518215)。


## 保存图证0249-67-redirect：1872779097241518215-03.png

已实际核对保存图片 `1872779097241518215-03.png` 的原始像素。配套JSON实际status400/code1125/message Invalid Callback URL/validationsnull，是拒绝线索而非绕过。真实HTTP状态与body状态字段也需分开；核验证与最终消费者解析一致、受控允许/拒绝域对照，不能由null或错误文案反推检查方式/可绕过。未探测或触发重置。

来源：[保存帖1](https://x.com/i/status/1872779097241518215)。


## 保存图证0249-86-redirect：1873074118335299794-02.jpg

已实际核对保存图片 `1873074118335299794-02.jpg` 的原始像素。Truecaller/v4/profile头像URL报告称只查https开头及允许CDN字符串出现任意位置，可把可信字符串放#fragment而URL指向另一host，并有反斜杠示例。用解析后的scheme/authority/port及规范host验证，片段不能作为来源证明；浏览器资源、服务端抓取和HTML/SVG脚本是不同消费者/影响。截图请求/响应小图有限，不宣称三种漏洞全被实证；未改头像或触发外部取回。

来源：[保存帖1](https://x.com/i/status/1873074118335299794)。
