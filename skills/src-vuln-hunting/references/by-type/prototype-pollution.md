# JavaScript 原型污染

适用信号：递归合并、路径赋值、配置对象或查询解析

## 检查与最小实验

追踪输入源→解析/合并→原型变化→读取该属性的具体代码。先在匹配库版本的隔离环境用唯一无害属性检查，区分对象自身属性与其他新对象继承的属性。

浏览器端检查污染的生命周期及可达 sink；服务端污染可能持续影响进程中的其他请求，因此缺少隔离与恢复能力时只做代码/本地验证。不能把删除测试字段当作完整恢复全部原型状态。

## 证据与反例

JSON 中有 `__proto__`、响应回显该键、对象有同名自身属性都不等于全局原型被污染；污染成立也不自动证明可利用 gadget 或 RCE。具体影响需绑定实际属性读取和受控行为变化。

## Agent 行为

把污染源与 gadget 作为两个假设存证。禁止线上试改认证、全局超时或进程关键配置来找效果；使用隔离进程的清理/重启能力核对恢复。

## 调研来源

- [PS-proto · Prototype pollution](https://portswigger.net/web-security/prototype-pollution)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。


## 原型检测标记、否定匹配与失败分母

旧自动化管线查询中写testparam值exploit/，JS判断却与exploit比较；grep VULNERABLE还会保留NOT VULNERABLE，配图两种输出确实同列。先逐字核对URL生成→实际query解码→属性值→判断→结构化结果，避免正负共享子串。[URL query state](https://url.spec.whatwg.org/#query-state)及编码集合保留查询里的普通斜线语义；图未显示应用额外去尾斜线处理，不能无证据补齐值差异（2026-10-10核读）。

window属性相等仅定位观察，还需排除自身属性/页面预置值，确认原型变化、隔离生命周期及真实gadget读取；污染不自动XSS/RCE。stderr重定向隐藏错误，不能把超时/解析失败计阴性或已完成；grep后的列表也不是有效漏洞数。用自己的有限合成正/负/错误记录核对判定，原来源脚本、无头浏览器/JS和外联请求均未执行。来源：[保存帖](https://x.com/i/status/1402906185301323776)。


## 本地污染fixture与控制台主动原型写的差别

Plution图对本地fixture输出Vulnerable；JSPanda图控制台直接defineProperty Object.prototype后显示CLOSURE_BASE_PATH Polluted。

绑定应用控制入口、实际原型写、属性读/gadget和权限/后果，每次实验隔离并恢复；scanner标签、自有console写入、无应用source、没有gadget或非真实目标是反例。主动写入是实验动作，不证明应用允许攻击者污染或已XSS，本轮未执行图中JS。

来源：[保存帖1](https://x.com/i/status/1438476371408343040)、[保存帖2](https://x.com/i/status/1441149046068940801)。


## 原型污染库定位与gadget分开的数据库复用

图DetectionSelenium/extension/CodeQL→关键词/断点/阻断JS定位库→sourcegadget，再存librarygadget库和被动regex检索。

记录库hash/版本、可控合并输入、实际prototype写入、具体gadget读属性到sink与受害origin，用移除库/禁source/无害marker对照；关键词、网站引入库、断点或主动屏蔽导致页面坏掉是反例。数据库匹配与污染、污染与XSS各单独取证，作者18/80/1000自述不当当前确认数。

来源：[保存帖1](https://x.com/i/status/1445403406571614214)。


## PPScan 到 XSS 的 gadget 缺口

正文说ppmap把prototype pollution升级为XSS，图片为工具封面。

需要可控的原型写入、污染传播、实际gadget、活动DOM消费者及浏览器执行条件；检测器存在不代表目标具备整条链。自身属性覆盖、冻结原型、无消费者、安全文本输出和CSP限制为反例，不自动把PP报告升级XSS，也不运行扩展或payload。

来源：[保存帖1](https://x.com/i/status/1461205450146271238)。


## Plution 十一案例不能等于所有原型污染

完整正文称headless Chrome用硬编码payload检测十一种已列案例，没有具体目标的数据传播或实际sink。案例数是样例覆盖，不是全部对象写入。

离线自有JS模型比较普通属性、原型写入、后续gadget读取、可达sink、隔离world/权限与防护；记录工具版本、触发和误报/遗漏。单payload命中、对象污染而无消费者或只console为反例，不能直接推XSS/账号影响，不执行源扫描器。

来源：[保存帖1](https://x.com/i/status/1494703262724988933)。


## Rocket.Chat 管理员原型污染与托管宿主权限边界

CVE-2023-23917历史摘要明确原型污染到RCE在admin账户下，用户能自建云server当admin，可能影响云基础设施；没有source/gadget代码。应用管理员、应用进程执行和宿主隔离是三层权限，不能把管理员动作自动视为获得宿主root，也不能按“管理员本来全权”忽略托管边界。源码审查需污染入口、继承读取和危险sink；隔离夹具以无害标记证实，云影响须独立权限证据。

来源：[保存帖1](https://x.com/i/status/1632093694017896451)。

现有图片证据 `1632093694017896451-02.jpg`：Rocket.Chat CVE-2023-23917历史摘要称admin账户原型污染到RCE、用户自建云server取得admin可能影响云基础设施；无污染source/gadget，管理员应用权限与宿主隔离应分开。


## EJS gadget 题名不足以证明污染到执行

SSPP→EJS RCE外链仅题名，需分别确认可控对象合并/原型写入、受影响属性实际消费、EJS版本/配置和生成代码权限。固定受控污染/不污染及属性隔离对照，记录实际结果；gadget存在不等入口可达或所有模板可利用，未保存文章不补造代码链。

来源：[保存帖1](https://x.com/i/status/1636684863603449856)。


## 服务端原型污染工具候选需分离写入原语与利用消费者

SSPP 工具卡片及简介用于定位服务端原型污染。保存的品牌/功能说明不能证明目标污染成立；实际验证需核对对象写入路径、合并方式、是否可改变原型、受控状态及清理/隔离，再定位利用该状态的消费者。检测信号、错误或工具宣称支持 RCE 不等于可执行代码；持久化污染与跨请求影响需独立证据，并避免破坏共享进程状态。

来源：[保存帖1](https://x.com/i/status/1647590162908725250)。


## DOM 跳转候选不自动推出原型污染 XSS

保存正文建议从 DOM Open Redirect 入口继续测试原型污染。两者是独立假设：先证明输入影响导航，再定位对象写入、原型/继承与自有属性差异，最后找实际读取污染值的 gadget/sink。仅路由、跳转或参数名称不能确认污染与执行；保存材料无代码、对象状态或浏览器结果，不补成万能递进流程或运行候选。

来源：[保存帖1](https://x.com/i/status/1682065347015311360)。


## 保存图证0189-75-proto：机制与验证条件

运行时日志列 [PP][Prop delimiter/depth/ignoreQueryPrefix/interpretNumericEntities/parameterLimit/parseArrays/plainObjects/strictNullHandling] qs/lib/parse.js，Express locals/_all、body-parser _body/body、type-is transfer-encoding/content-length、etag time、fresh if-modified-since 等属性/元素访问及行号。可复用插桩追踪原型继承键到实际消费者的传播，区分读取与写入/污染源；日志并无污染请求或可利用sink，不能将每次prop读取等同SSPP。受控干净进程比较own-property/原型来源、依赖版本、输入源及无害副作用，防跨测试状态残留。 可用原图：`1698503479239598559-02.jpg`（保存帖 1698503479239598559）。

来源：[保存帖1](https://x.com/i/status/1698503479239598559)。


## 保存图片0207 1758219883106443573-02.jpg 的 proto 验证边界

Node path.resolve结果转Buffer.from，Buffer.prototype.utf8Write可覆写改变消费字节，CVE2024-21896；实验权限Node20/21。验证授权检查的字符串与最终buffer字节一致，捕获可信intrinsic/拒绝可变转换负例；own惰性样本，不执行原型修改真实fs或读系统文件。

图片证据：1758219883106443573-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1758219883106443573)。


## 0225 原图039 proto

prototypeone-liner URL加__proto__[testparam]经page-fetch执行JS检查window，sed剥输出/grepVULNERABLE同时匹配NOTVULNERABLE，是明显假阳性风险；window属性不单独证明原型污染或可利用gadget。离线对象继承/ownproperty/惰性解析对照，不执行页面脚本/批量headless。

图像证据文件名：1809292581773390267-02.jpg。

来源：[保存帖1](https://x.com/i/status/1809292581773390267)。


## 0227 正文 服务器原型污染工具与消费 proto

扫描器入口不证明共享原型污染，更不证明 gadget/RCE。隔离实例，记录属性写入、请求间持久性和实际消费者，并排除正常原型/合法自有属性的响应变化。

来源：[保存帖1](https://x.com/i/status/1815952546885959846)。


## 0227 图片 1815952546885959846-02.jpg proto

现有图片 1815952546885959846-02.jpg 的完整可见内容已按原图审阅。

Burp 右键菜单显示针对本地 JSON 请求的 Server Side Prototype Pollution Gadgets Scanner，只有工具入口，无污染结果。应区分可控属性传播、共享原型改变、可用 gadget 与最终敏感消费；使用隔离实例与请求间基线检查，防止状态污染误判，扫描器名称不证明 RCE。

来源：[保存帖1](https://x.com/i/status/1815952546885959846)。


## 0231 正文 重复JSON字段桥接消息 proto

Jitsi材料显示重复colibriClass等字段可能在JS和Java解析器、不同解析阶段得到不同值。比较原始字节到对象再到桥接消息的全部消费者，核首值/末值与类型分派，不把解析差异自动称原型污染或OS命令注入。真正原型污染还需共享原型属性写入及后续消费，消息身份/动作授权应独立验证；图示safeJsonParse和去类型字段为历史修复线索，未访问桥接服务。

来源：[保存帖1](https://x.com/i/status/1827903985363423710)。


## 保存图证0231-37-proto：1827352665095073997-02.jpg

已核对保存图片 `1827352665095073997-02.jpg`。subfinder/httpx线程100/a new列表加proto查询后page-fetch执行window.testparam判定；window可自有属性或脚本显式赋值，true不证明Object.prototype污染。应区分自有/继承属性、污染scope和真实sink，用清洁隔离页面/无害marker对照，sed/grepVULNERABLE含NOT_VULNERABLE也会误报；保留schema/查询编码/整体预算，未发请求执行页面脚本。

来源：[保存帖1](https://x.com/i/status/1827352665095073997)。


## 保存图证0231-48-proto：1827903985363423710-02.jpg

已核对保存图片 `1827903985363423710-02.jpg`。Jitsi历史摘要说明JSON重复colibriClass键使videobridge与clients对消息类型不同解读，导致会议未授权动作；title称PP而代码区只列safeJsonParse/移除type字段。需逐解析器duplicate-key规则、反序、实际type/权限消费者对照，自有会议模型核动作；未给prototype污染链，CommandInjection分类不证明OSshell，未发消息。

来源：[保存帖1](https://x.com/i/status/1827903985363423710)。


## 保存图证0234-87-proto：1836119189486211289-02.jpg

已核对保存图片 `1836119189486211289-02.jpg`。客户端原型污染表展示不同库对 query/hash 中 __proto__ 点号/方括号及 constructor.prototype 形式的处理候选，Wistia 项标为 Fixed。字符串仅是候选入口；须证明实际解析库/版本和原型属性变化，再证明可达消费端及影响，普通对象自有 test 字段不等于原型污染，污染也不自动为 XSS/RCE，未执行。

来源：[保存帖1](https://x.com/i/status/1836119189486211289)。


## 保存正文0237：AngularJS 表达式候选与真实执行版本（proto）

正文给出特定旧 AngularJS 版本与涉及原型方法及 $eval 的候选，但未保存执行环境。客户端模板解释、服务器模板注入和原型改变后的真实权限影响须分开。固定实际框架、插值位置、浏览器与策略，原型修改有全局副作用，不能以版本字符串断言成功，不执行候选。

来源：[保存帖1](https://x.com/i/status/1842298271747948899)。


## 保存图片0241：附件022（proto）

ppfuzz 宣传终端显示 __proto__ 点和编码括号参数被标VULN。没有实际对象原型观测、代码路径或 gadget；需自有哨兵、跨对象读值、负对照与版本，标签不等于XSS/RCE，未运行扫描器。

图片证据：`1850616801622884498-02.jpg`；按保存原图可见内容提炼，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1850616801622884498)。


## 保存图片0241：附件024（proto）

片段引用 jQuery2.2.4 并直接写 Object.prototype 的 preventDefault/handleObj/delegateTarget，后者为img/onerror字符串。手工写原型只演示gadget候选，必须存在攻击者可达污染源、触发消费者与实际浏览器执行；直接script不是远程污染证据，未加载外部JS或执行。

图片证据：`1850622953593122985-02.png`；按保存原图可见内容提炼，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1850622953593122985)。


## 保存图片0244-0：1856929442247184882-02.jpg（proto）

已审阅该内容原图，当前保存附件 1856929442247184882-02.jpg。Doppler截图描述改共享项目名为含脚本/proto片段后退出，明确XSS/原型污染未成功，但成员无法打开/删除项目；名称写入、渲染/安全处理和成员可用性分别证明，不能称脚本执行或管理员权限。历史Low/$250仅该报告，最小自有共享项目对照，不修改真实项目。

来源：[保存帖1](https://x.com/i/status/1856929442247184882)。
