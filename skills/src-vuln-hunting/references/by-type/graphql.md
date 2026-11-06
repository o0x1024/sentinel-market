# GraphQL

适用信号：query/mutation/subscription、schema 或 GraphQL 正常流量

## 检查与最小实验

优先读取已有客户端操作与可用 schema，按 Query/Mutation、对象、字段和 resolver 建图。schema discovery 与权限测试分开；关闭 introspection 后仍可能从正常操作得到接口信息。

用两个自建对象检查直接 node 查询、嵌套关系和 mutation 返回字段是否一致授权；顶层接口通过认证不表示每个 resolver 已授权。HTTP 200 仍需检查 `errors`、部分 `data` 和具体字段。

别名或批量会让单个 HTTP 请求包含多次逻辑操作：同时计请求数和 resolver/业务动作数。只在明确预算内用最小样本检查逐操作控制，不进行深度/宽度耗尽或密码猜测。

## 证据与反例

introspection、字段建议、GraphiQL 可见只说明可发现性；公共 schema 不直接泄密。确认需要受限制数据或状态实际暴露/改变。客户端缓存和旧变量必须排除。

## Agent 行为

保存 operationName、查询指纹、变量归属与字段路径；只加载当前 resolver 相关 schema，避免整份模型充斥上下文。

同一注册、邮箱验证或账户恢复流程若同时存在 REST 与 mutation，比较服务端对相同受控身份的前置状态检查。直接调用 mutation 返回成功仍须核对实际账号、验证状态和后续受保护能力；不能只因绕过了 UI 步骤就确认认证缺陷。字段扩展仅使用自有对象，单包批处理不产生额外 OTP 猜测许可。

## 调研来源

- [PS-graphql · GraphQL API vulnerabilities](https://portswigger.net/web-security/graphql)
- [OWASP-api3 · API3:2023 Broken Object Property Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

`__schema` 属于 GraphQL introspection 系统，不能称为“替代 introspection 的查询”。按当前目的选择有效字段集合，记录实际返回类型/字段、错误、截断和身份；查询 schema 不证明已读取所有类型/私密业务数据，也不自动构成权限缺陷。见 [GraphQL 官方 introspection 说明](https://graphql.org/learn/introspection/)（2026-10-09 核对）；禁用状态与真实 resolver 授权仍分别检查，不为获取整份模型扩大查询成本。

## 操作类型与实际副作用

query用于读取、mutation用于状态改变是协议设计，不能替代对目标resolver实际行为的核对。[GraphQL官方mutation说明](https://graphql.org/learn/mutations/)要求顶层mutation字段之外的解析无副作用且幂等，但实现仍可能违规（2026-10-09核对）。恢复正常测试请求时，将操作类型、各字段/参数、真实身份和权威状态关联；mutation返回字段也要授权。不要因query名字或schema可视化工具就授予纯读取预算，更不自动执行插件生成的全部操作；副作用未知先读获准源码/业务契约。

## POST改GET与只读查询的证据边界

操作类型、传输方法、token检查、自动认证、字段授权和真实状态分别记录。旧图把getUser查询由POST改成GET并去掉头，但没有响应、Cookie或前后状态；不能由name/email字段查询直接认定状态改变型CSRF，也不证明敏感响应可被外站读取。

先恢复目标真实合法query及变量定义，再确认当前处理器是否接受该方法和实际消费者。若真实resolver改变状态，按CSRF条件核对；若只是私密读取，检查对象/字段受众与浏览器响应读取边界，不能把同一个截图同时当成这些结论均已成立。

## OTP字段省略的输入强制转换与认证分支

GraphQL登录去掉错误OTP后“登录成功”的声明，需要区分字段/参数省略、显式null、空字符串、变量缺失与默认值。已有schema/输入校验/实际resolver路径应关联挑战主体、验证码验证分支和会话签发；可选输入被接受不等于通过认证。[GraphQL输入对象强制转换规范](https://spec.graphql.org/September2025/#sec-Input-Objects.Input-Coercion)说明缺失值、默认值、必需字段及null的不同处理（2026-10-09核读相关段落），不要假定所有省略都会抵达同一分支。

在获准隔离合成身份或离线日志中，固定未认证基线、挑战代际及原始操作/变量，对照正常、错误和缺字段后的服务端真实身份及受保护能力。排除先前已认证Cookie、前端成功文案或其他合法密码less凭据；源文未给schema/签发证据，保留为具体候选，不请求真人OTP或把全部GraphQL视为同一认证弱点。

## GraphQL错误分层与私密内容受众

畸形/意外输入的错误可能来自文档语法、schema/变量校验、resolver或下游异常，各自消费与受众不同。关联原始operation/变量、实际拒绝层、当前身份、正常基线、错误的path/扩展字段及是否出现业务私密数据/秘密；公开字段建议或一般类型名不自动等于敏感信息泄漏。

用获准已有错误/源码及普通合成类型差异核对被返回内容，不为触发报错扩大复杂度或改变业务状态。相同HTTP状态可承载不同GraphQL错误，错误消息与真正越权读取分开；来源仅首条首段，未读全系列/外线程，不自动枚举全部schema或数据库异常。

## 内省类型种类与查询字段的匹配

GraphQL手写笔记里的Schema/Type/TypeKind/Field/InputValue/EnumValue/Directive是模型线索，不是完整查询；名称需按实际内省元字段和类型处理。[GraphQL September2025 §4.2.2](https://spec.graphql.org/September2025/#sec-The-__Type-Type)规定__Type.kind与可用字段的对应：对象字段、输入对象inputFields、枚举enumValues、联合/接口possibleTypes及LIST/NON_NULL的ofType（2026-10-09核读相关段）。联合成员是对象类型，不能把Union当任意参数列表。

只沿当前需要的获准字段恢复有效选择与类型包装，记录不适用的null、错误、截断、deprecated筛选和已知操作；不据笔记称已取得完整schema。introspection开关、深度/复杂度限制与resolver授权分别依部署证据，不能概括成所有实现的同一默认。没有返回字段/受众证据不认泄露；不执行完整dump、深层查询或耗尽型操作。

## GraphQL搜索输入到NoSQL操作符的边界

旧GraphQLmap图的doctors search参数内含lastName/$regex并返回Admin记录，随后显示nosqli及未输入的Query提示。GraphQL解析通过、JSON样式字符串被后端解释、NoSQL查询操作符生效及权限突破是不同步骤；返回Admin可以是正常搜索结果，工具命令名不证明注入成功或管理员登录。

核对schema输入类型、resolver解析/字段白名单、数据库驱动实际查询、角色/租户过滤与合成结果集，用普通等值搜索/被拒操作符作有限隔离对照。来源没有完整nosqli操作、密码或终态，不补所有GraphQL都支持该格式，不运行工具、枚举真实医生资料或访问图中挑战站点。

## 表单中间件、GET副作用与XS-Search

旧帖指GraphQL中间件可能接受表单POST、GET mutation和XS-Search。[Doyensec原始研究](https://blog.doyensec.com/2021/05/20/graphql-csrf.html)展示格式转换、query内误放状态改变、csrf_exempt及时序旁路；其2021小样本比例不代表当前全部实现（2026-10-10核读技术正文）。

分开浏览器可发送的格式、凭据实际携带、Origin/CSRF/SameSite、resolver效果和响应读取能力：能够提交读取query不自动是状态改变CSRF，也不代表外站可直接读数据。XS-Search需独立可观察通道/正常对照；时延不能未经样本/缓存/噪声控制就判断私人记录存在。优先获准同版源码/隔离合成操作，不改真人邮箱、上传文件、诱导受害者或枚举私密用户。


## 关闭内省后的候选schema与模型完整性

clairvoyance旧宣传称内省关闭仍可输出供Voyager/InQL使用的JSON。将正常操作、客户端字段、校验错误/建议和工具推断分别标明来源；内省配置、候选字段可发现性和resolver权限是三个问题。JSON格式能被工具接受不证明所有字段/参数/输入类型都恢复，也不说明与当前部署一致。

从已有获准操作及错误构建与当前消费者相关的小模型，记录版本/身份/时点、已见字段和未知部分，再与真实schema契约核对；字段名猜测不当完整模型，公开接口描述不自动泄密。不执行工具枚举、生成全部操作或继承工具的complete宣称，完整仓库与外部工具教程未读。来源：[保存帖](https://x.com/i/status/1397613730016505863)。


## 批处理中的挑战身份与验证次数

旧帖将单包多邮箱/密码及全部2FA值直接称限流绕过。传输层数组batch、单个operation的多个别名和实际验证调用不同，是否支持需目标处理器证据。一个HTTP请求可触发多次业务尝试，但不保证所有实现接收、共用挑战或只扣一次计数。

沿每个元素/字段记录账号规范化身份、挑战ID/代际、验证消费者、失败次数/锁定/消费状态和会话签发，以获准隔离正常/拒绝回执确认请求级与业务级预算；每次逻辑尝试均计数。拒绝batch、逐次限额、已消费挑战拒绝和合法独立批次作反例，不尝试真实密码/2FA空间或制造耗尽，外部Wallarm文章全文未读。来源：[保存帖](https://x.com/i/status/1397628837970784258)。


## mutation输入subValues与返回resolver的字段权限

低权创建Value时加入subValues空数组，据称响应暴露管理员隐藏子值，卡片只写mutation且对象名遮挡。写入字段与返回resolver可能采用不同授权路径。

绑定actor角色、父对象/子对象owner、输入schema、字段选择/服务端扩展及返回子字段的独立ACL；比较合法低权与受控管理身份的同对象结果。空数组被忽略、只返回自有项或允许公开子值是反例，不能以mutation标题补隐藏数据已泄露。

来源：[保存帖1](https://x.com/i/status/1421813960043470852)。


## GraphQL批量能力与逻辑操作预算

正文推荐BatchQL的batch、CSRF和introspection；另帖Graphw00F仅指纹标题。

区分实现识别、schema可见、请求格式、多operation/alias/resolver、认证与状态改变；一次HTTP可承载多个逻辑动作，预算按resolver/动作而非仅请求数。指纹、公开schema、合法只读batch或未消费mutation是反例，不据工具名补批量绕过或CSRF。

来源：[保存帖1](https://x.com/i/status/1432719827609739267)、[保存帖2](https://x.com/i/status/1435939597163376649)。


## creator邮箱字段路径与订阅者列表声称的区别

VoiceCreator图文字称可列subscriber邮箱，query实际指向publications.creator.email_settings.confirmed_email.email_address，没有response。

绑定调用身份、resolver/object owner、可见性意图、具体返回field、分页和敏感字段最小对照；只query、公开creator邮箱、合法订阅资料、无结果或字段归属不同是反例。结构路径不证明全订阅者名单/权限缺失，未执行GraphQL请求。

来源：[保存帖1](https://x.com/i/status/1440934050059882502)。


## 关闭 introspection 后的查询发现与 resolver 授权

保存帖问 introspection 关闭后还能怎样发现接口，没有给实际查询。

从获准客户端已使用的查询、fragment 和操作名还原可见 schema 线索，分别记录查询合法性及 resolver 的主体、对象和字段授权。关闭 introspection 不等于消除越权或注入，已知合法查询也不等于任意字段可读；不凭问题标题补写攻击回执。

来源：[保存帖1](https://x.com/i/status/1449355902625140744)。


## GraphQL 七类标签与具体执行边界

正文列注入、认证授权、业务逻辑和拒绝服务等类别，没有某个resolver的请求回执。

把类别落实到schema可达字段、解析/验证、resolver、下游消费者与对象权限；为一个受保护动作建立允许/拒绝对照。schema暴露、错误信息或复杂查询本身不证明影响，已授权字段和查询限制是反例。不执行复杂度压测或DoS。

来源：[保存帖1](https://x.com/i/status/1457889593353592835)。


## 批量删除 JSON 与逐对象授权

Phineas正文/flag替代文字配图却是多个数字payload均200和data.BulkDeleteAlertDefinitions，结果是website/alertDefinitions/id/typename嵌套。

绑定实际operation、身份、对象归属和持久状态读回；HTTP200/嵌套对象并不证明成功删除、越权或所有对象有漏洞。错误字段、空列表、合法本人对象或仅响应为反例，不执行批量删除，也不按CTF题名解释此图。

来源：[保存帖1](https://x.com/i/status/1474281187862409219)。


## graphql-path-enum 资源名与 resolver 授权

正文推荐path枚举工具并称上周有帮助，未存查询、schema或结果。路径发现和resolver的主体/对象权限是两层。

离线自有schema保留入口、类型、参数、角色和resolver，比较可达/不可达、合法/错对象。工具链接、禁用introspection、路径存在或正常权限拒绝为反例；枚举结果不等全部API已测试，不安装/运行未存仓库。

来源：[保存帖1](https://x.com/i/status/1488197131814928388)。


## GraphQL 空 OTP 成功字段不能直接证明 2FA 绕过

完整图POST /graphql有遮蔽token、空otp_code及六位verification_code；HTTP200 JSON同时有was_successful=true与errors.edges。正文标题延伸到RCE，没有完整mutation、语义和会话状态。

离线合成mutation区分phone验证、登录二因素、字段校验、错误和最终身份，比较正常/空值/失败与后续权限。HTTP200、局部布尔成功、其他验证步骤或错误拒绝为反例；无绑定变化不能判2FA绕过，更不能凭标题推RCE。

来源：[保存帖1](https://x.com/i/status/1497118123387801600)。


## GraphQL 思维图把 schema 和动作候选分开

完整图可辨端点/Playground/Schema、基础/深层introspection、类型/字段/参数、query/mutation、用户/权限及商业逻辑；部分微小叶子字不可辨。没有实际服务交换。

离线合成schema按端点、身份、可查询字段、动作和角色归属记录；schema描述与实际授权分别对照。只出现admin/delete词、能introspection、图中列batch/brute或深查询不证明漏洞；无越权结果、文档公开为反例，不执行真实变更、认证批量尝试或深度耗尽。

来源：[保存帖1](https://x.com/i/status/1497905641104736257)、[保存帖2](https://x.com/i/status/1497930716289527813)。


## GraphQL Cop help 和十项检测说法不是审计完成

完整图GraphQL Cop1.0帮助只有目标URL/path、JSON输出和版本；正文后称约十种DoS/CSRF/info leak检测，repo卡没有具体规则。

离线按schema/字段、请求身份、查询深度/批次、允许方法与证据分别设计有界样例、负例和结果。帮助启动、检测类别或工具名称不能确认漏洞/全覆盖；无结果、无跨主体或正常拒绝为反例，不运行深查询/批量认证或资源耗尽。

来源：[保存帖1](https://x.com/i/status/1501169526708314114)、[保存帖2](https://x.com/i/status/1501169699450617859)、[保存帖3](https://x.com/i/status/1503445859375198213)。


## GraphQL OTP 批处理按业务操作数约束

正文建议将多个 OTP 尝试放在一个 GraphQL 请求内，未给验证结果。

区分请求数量、批内操作数、执行次数和每账户失败计数，核执行上限、错误处理和状态是否一致。自有有限样本只用于观察计数边界；一次 HTTP 请求不等于一次验证，批处理存在也不证明验证码可破解。

来源：[保存帖1](https://x.com/i/status/1524801545799405575)。


## 模式发现和扩展加载分别核查完成状态与权限

保存正文描述 GraphCrawler 收集查询、变更、认证和猜测模式；InQL 图片显示加载进度及空 Output/Errors，并未显示加载完成。先固定工具/运行时版本、加载结果、当前身份、模式来源和实际端点。

模式可见不等于对象或字段越权，加载界面也不说明查询已执行。用自有对象对照真实查询与变更结果，给模式猜测及变更单独设置操作预算和清理，不把未保存的仓库能力当已验证行为。

来源：[保存帖1](https://x.com/i/status/1549801307053203456)、[保存帖2](https://x.com/i/status/1551272080343060481)。


## GraphQL批量请求应核对每个操作的计数与授权

正文提示 GET 与 batch queries，外链标题将批量与密码、MFA 和对象枚举并列。先确定端点支持的传输和批格式，再用有上限的自有操作比较单请求、多操作中的权限、错误及限制计数。一次 HTTP 成功不等于每个操作成功；批量存在也不证明绕过限流、MFA 或对象权限。身份和状态读回分开记录，未保存的外链内容依用户按覆盖，不补造利用细节。

来源：[保存帖1](https://x.com/i/status/1563347818915303424)、[保存帖2](https://x.com/i/status/1565716193515753473)。


## Schema路径和工具评分不能代替字段授权

GraphCrawler图显示mutation读取错误、十二queries、零敏感项、_service授权及三条CoreVideo路径。分别核对schema/查询/字段/对象权限，用两个自有角色与对象固定query和变量比较实际返回，保留introspection关闭、错误及未查变体。schema有路径不等于可读敏感节点，_service成功不等于所有查询开放；自动Criticality数值不是业务严重度。限制深度/宽度/成本并避免默认mutation。

来源：[保存帖1](https://x.com/i/status/1568603816349646848)。


## GraphQL批处理按逻辑操作而非HTTP包数检查限流

CrackQL 宣传涉及批量破解、2FA、IDOR；只有工具能力声明。用自有账户与无害操作比较单操作、alias/批次、费用与身份边界，记录每个 resolver 的实际结果和服务端计数。一次 HTTP 请求可能包含多次逻辑尝试，状态 200 不能证明每项成功；限流和对象越权需要独立负对照，少量预算后停止，不枚举第三方账号。

来源：[保存帖1](https://x.com/i/status/1570789627447087105)。


## GraphQL schema 可见不等于 SQL 注入

正文标题SQLi但图实际为__schema和types/fields返回，未见数据库sink或结果。将schema发现、操作可调用、字段授权与SQL消费者分开记录；用自有操作确认身份/对象，再对可达数据库参数做有限无害对照。200/schema名称不证明敏感数据或SQL执行，不能用标题补全被省略的链。

来源：[保存帖1](https://x.com/i/status/1582712154083315712)。


## GraphQL introspection 的分级须落到可访问数据和操作

正文讨论 introspection 被不同平台评级，图片只有修复及奖励邮件。把 schema 暴露、未授权字段读取、跨用户对象访问和写操作权限分别检验；用自有角色和对象对照错误、返回字段及实际状态。仅能 introspect 不意味着业务操作授权失效，也不能以历史 P 等级或奖金预定当前影响；缺失 schema/query 的奖励图只保留为历史上下文。

来源：[保存帖1](https://x.com/i/status/1586205416978948096)。


## GraphQL 正则提取和遗漏 batching 都需回到实际执行预算

保存 nestle 输出通过 query/mutation 正则与 sed 换行抽取，依赖命名与嵌套格式；另一帖说安全指南遗漏 batching，未保存指南正文。以已授权本地 schema/请求样本比较匿名/命名、多行/fragment/嵌套及批量输入的解析集合，分别评估每请求、每操作、深度和聚合成本及授权。正则提取不等完整 AST 或所有对象覆盖；支持 batching 本身不构成漏洞，未读指南细节不补造，资源对照在隔离样例进行。

来源：[保存帖1](https://x.com/i/status/1588663734389846016)、[保存帖2](https://x.com/i/status/1590781062061658112)。


## Schema 可见与数据对象权限是不同边界

保存 API 图列 introspection、可视化和查询枚举，用于理解 GraphQL 结构，不能推出“数据库每个查询都可访问”。在自有实例记录 schema 版本、operation、变量类型、身份与字段/对象权限，区分公开元数据、查询验证和实际解析器数据消费。用两自有对象的单字段无害查询与拒绝对照；可视工具或 introspection 返回不证明越权，扫描不到结构也不能证明无隐藏方法，不枚举他人数据。

来源：[保存帖1](https://x.com/i/status/1611989144464678915)。

已实际查看保存图片 `1611989144464678915-02.jpg`：API完整脑图read：reco版本v1v2v3/开源定制/RESTSOAPGraphQL/WADLWSDLpublic-local/GETPOSTPATCHPUTDELETE/cookie-headerauth/JWT加密编码序列化hashID/比较doc/fuzzendpointactionobject/bodyheader映射/Swagger；enumRESTresourcesobjects与响应头长度行为/GraphQLintrospection与Voyager/kiterunner-unfurl；工具Postman导入环境collections+proxy/authOTP/JSJSONtest、SoapUIWADLWSDL/endpoint、Burpmonitorrequests/content/header/JS、有限fuzz端点对象methods(FfufIntruderArjun)/SecListsFuzzDB或waybackdocsJSrepo开源造字典。Dweb/fuzz/auth/graphql接口描述与实际部署/身份schema权限/状态写入/范围预算，不能introspection=所有DB权限或tool默认安全。


## GraphQL 风险清单需按 resolver 数据流而非类别名确认

正文列normalization、DoS、SQLi、auth、introspection、CSRF及errors。建立schema字段→resolver→底层服务/数据库/授权/渲染链，分别用自有小查询检查类型规范化、字段/对象权限及最小错误；限制深度、别名和预算，不运行耗尽测试。introspection或详细错误是信息候选，SQLi需要实际非参数化sink，CSRF需要浏览器认证状态改变，auth需要无权结果；清单标题不是多个漏洞已确认。

来源：[保存帖1](https://x.com/i/status/1616130317399764993)。


## GraphQL aggs 必须在聚合前应用相同可见性约束

保存报告search与opportunities_search的aggs参数/返回字段可暴露private program handles。对象hits过滤正确仍可能让未授权行进入buckets/counts；聚合键、计数、nested索引与租户条件均须相同授权。自有公开/私有两组canary比较管理员与无权用户普通搜索和聚合，确认私有标记或可推导信息泄漏；仅有aggs字段、总数或introspection不独立证明私密信息。限制查询规模，禁止列举真实私有计划。

来源：[保存帖1](https://x.com/i/status/1616148972568969253)。

已实际查看保存图片 `1616148972568969253-02.jpg`：GraphQL search/opportunities_search aggs返回私有program handles，聚合必须先受相同可见性过滤，不只过滤hits。


## GraphQL 目录转换为解析器和操作权限检查表

保存目录和正文覆盖查询/变更、参数、变量、内省、错误、数据库注入和鉴权。将每项绑定实际 resolver、主体、对象和字段：查询可见性、变更权限、变量类型与底层查询拼接分别验证。内省、函数名或错误信息本身不等于未授权访问，SQLi 需要真实数据库 sink；只用自有对象构建有权/无权对照，不把一张目录计作多项已复现漏洞。

来源：[保存帖1](https://x.com/i/status/1616465596778176512)、[保存帖2](https://x.com/i/status/1616857430843092994)。

已实际查看保存图片 `1616465596778176512-02.png`：GraphQL目录：enum/introspection/args/functions/query/mutation/lessinputs/wildcards/IDOR/database/DOS/amplification/variables/pagination/tools；目录无规则实测。


## GraphQL 分页与放大量以实际资源预算核验

目录提到 pagination、wildcards、较少输入、DoS 和 amplification，但没有实测阈值。由此形成检查问题：页大小、嵌套深度、别名数量和聚合是否受主体与全局预算约束，返回对象是否在分页前后都经过权限过滤。用小规模自有数据比较成本和结果，超时或大响应只作为候选，不运行耗尽服务的查询，也不把目录中的名称当成确定漏洞。

来源：[保存帖1](https://x.com/i/status/1616465596778176512)。


## introspection 转 Postman 请求：schema 存在与对象权限分开

正文建议把 GraphQL introspection 结果交给 Postman 构造 queries。首先保留 schema 获取身份/时间和实际导入版本，人工确认变量类型、必填参数、operation 与所需 header/会话，检查工具是否只是生成请求模板。introspection 公开和可生成 query 不等于敏感数据可读，每 resolver 的对象/字段/tenant 授权需要两个自有身份及最小查询对照；mutation 应单独约束副作用。存档没有导入操作/返回结果，不宣称当前所有版本自动支持同样步骤。

来源：[保存帖1](https://x.com/i/status/1628279463313043457)。


## GraphQL 范围、模式发现与邮件流程授权分开确认

帖子声称范围外GraphQL发邮件可批量ATO，图只有P1接受/升严重性通知；另有introspection和自动化外链与logo。模式发现、suggestions和查询可达仅暴露结构，不证明数据或mutation授权失效。确认端点明确纳入范围，以两个自有账户对照resolver主体、对象归属、邮件目标/令牌绑定和结果；不要批量发送真实邮件。跨业务链每环分别留证，范围外成功标题不会自动授权后续测试。

来源：[保存帖1](https://x.com/i/status/1629556526229643266)、[保存帖2](https://x.com/i/status/1629679252466458625)、[保存帖3](https://x.com/i/status/1629769654620024833)。


## GraphQL schema 和控制台发现须连接 resolver 权限

graphql/altair/playground、debug及旧版本提示可发现入口，内省有多种查询形态但不能把“两版本”当通用标准。记录schema版本、接口身份及每字段/resolver对象/tenant权限，在受控mutation验证持久更新；注入另需实际下游SQL等消费者。公开控制台/schema、工具Voyager/Altair/Raider和REST包装说法不证明漏洞或所有端点漏授权。

来源：[保存帖1](https://x.com/i/status/1634235166104141827)、[保存帖2](https://x.com/i/status/1634565339202633729)。

现有图片证据 `1634235166104141827-02.jpg`：GraphQL图建议schema/introspection、graphql/altair/playground、debug与旧版本，工具Altair/Voyager/Raider；所谓两版本内省不构成通用标准。控制台/内省公开并非漏洞，需resolver逐字段对象/tenant授权、mutation结果和实际下游SQL消费者验证。


## GraphQL 提取工具与 schema 公开不等于授权缺陷

Graphicator帮助有目标header/file、proxy/Tor、insecure、multi/no-cache等配置，影响请求身份/TLS/缓存须固定记录。内省图有FullType/TypeRef/InputValue而operationName仍GetSiteStats，需完整请求契约与schema响应验证。53KB声明没有完整回包，schema公开只是发现面；resolver逐字段/对象/tenant与mutation持久效果才确认权限问题，不能由提取成功推数据泄露。

来源：[保存帖1](https://x.com/i/status/1635268759794634752)、[保存帖2](https://x.com/i/status/1635644011624140801)。

现有图片证据 `1635268759794634752-02.png`：Graphicator帮助包含use-tor默认9150、insecure禁证书警告、proxy/Burp、header键值、file目标、multi和no-cache；工具名标Extractor，不证明GraphQLschema/对象授权缺陷，代理/TLS/缓存会影响证据需固定配置。

现有图片证据 `1635644011624140801-02.jpg`：GraphQL curl截图片段有FullType/TypeRef/InputValue内省片段、header上下文与GetSiteStats operationName；没有完整53KB响应，operationName和query需契约一致，内省schema不是数据读取/授权漏洞。


## JS 正则抽取 query mutation 要保留语法覆盖缺口

保存nestle嵌套regex加sed替换转义换行，限制操作名字母/数字组合，未示结果。保留源码/hash和原字符串位置，核对匿名操作、下划线、fragment、变量/字符串与转义，以GraphQL解析结果分类。抽取文本不等schema、可达接口或授权，sed改变内容可能误解字符串，不执行抽出的mutation。

来源：[保存帖1](https://x.com/i/status/1643337702790811649)。


## GraphQL 查询层与 NoSQL 数据库要分开审查

正文将GraphQL与MongoDB一起列为NoSQL数据库，这是分类错误；GraphQL是API查询层，resolver可连接不同后端。追踪输入值是否进入NoSQL操作符/查询对象或SQL拼接，固定schema、类型转换与过滤条件，比较自有对象的正常/异常查询结果。查询语言标签或NoSQL封面不证明注入；图背景SSRF拼贴不能补出数据库利用链。

来源：[保存帖1](https://x.com/i/status/1644263681193283584)。


## GraphQL 测试表必须使用真实 schema 与后续消费者

图列__schema types{name}、users(where:name)的SQL字符串、仅引号XSS和file(path)穿越，未给目标schema/响应。先确认类型、字段/变量与角色，追踪resolver到SQL/NoSQL/文件及后续HTML呈现，以有限自有对象比较允许/拒绝对照。introspection可能设计公开，自造字段不通用，引号不是XSS执行；列表“comprehensive”不证明批量/深度/成本和对象授权已测。

来源：[保存帖1](https://x.com/i/status/1646154995543207938)。

现有图片证据 `1646154995543207938-02.jpg`：GraphQL表格含__schema types{name}、where名字SQL注入、XSS仅引号、file(path:../etc/passwd)；自造schema/类型不通用、普通引号不是XSS、introspection公开不是越权，需resolver/存储/呈现consumer具体验证。


## 空过滤器不能代替 GraphQL 对象授权

保存正文称 filter 为空可返回其他用户。为 resolver 定义身份、允许对象集合与字段可见性，以自有 A/B 对比合法筛选、空值、省略值和分页/批量路径。筛选用于缩小结果集，服务端仍须按调用者授权；空结果、报错或含其他对象都需结合对象本应可见的规则。正文没有完整响应，保留假设与最小对照，不推断全量用户泄露。

来源：[保存帖1](https://x.com/i/status/1664489666828029952)。


## 字段建议推断 schema 后仍须逐 resolver 检查权限

正文介绍在关闭 introspection 时利用字段建议恢复 GraphQL schema；卡片只有工具描述。错误建议能提供类型或字段线索，但字典猜测不保证完整 schema，更不证明查询、变更或跨用户 resolver 缺少授权。在自有 GraphQL 中保存候选、建议响应和实际可调用字段，比较正确、错误及受限字段，追踪 resolver 的角色与对象检查。被猜到的公开字段或正确拒绝的 mutation 不是越权；缺少实际 schema 输出时保持为方法线索。

来源：[保存帖1](https://x.com/i/status/1671754140505047040)。


## GraphQL mutation 的状态枚举必须由服务端角色守卫

UpdateVacancyStatus 的名字暴露审批状态操作，但判断取决于调用身份、对象所有者、当前状态与目标状态是否在 resolver 中检查。自有模型比较普通发布者和审批者对同一合成职位，核对 resolver、允许转换与实际公开状态。端点存在或客户端能传枚举不等于绕过；守卫正确拒绝、发布仍待人工审批是反例。截图没有完整变量/响应，不补造 GraphQL 请求。

来源：[保存帖1](https://x.com/i/status/1676644096184664065)。

保存图证 `1676644096184664065-02.jpg`：inDriver Job 招聘/简历创建编辑需管理员审核，最后 POST /api/graphql 调用 UpdateVacancyStatus；报告描述跳过审批并发布内容，操作参数与执行响应裁切，实际可发布状态需要普通用户/管理员权限和外部可见性对照。


## GraphQL operationName 不能替代响应字段的授权检查

SaveCollaboratorsMutation 名称关联邀请流程，但数据泄露要落在具体 resolver、返回字段和 pending 状态。自有合成对象对照同一查询在不同邀请状态/角色下的字段选择，记录服务器真实响应，不能仅凭 mutation 名称、编辑按钮或捕获请求证明邮箱暴露。操作参数被裁切，未保存接受前后完整交换；历史 High 与奖励仅作为报告元数据，不发起邀请。

来源：[保存帖1](https://x.com/i/status/1676645302759989255)。

保存图证 `1676645302759989255-02.jpg`：HackerOne SaveCollaboratorsMutation 邀请后 pending 未接受状态，编辑添加协作者入口捕获的请求能出现目标邮箱；报告描述私人邮箱在接受前披露，HTTP 请求裁切，须对照邀请状态、调用身份和实际响应字段，不批量邀请真实用户。


## schema 模拟和 resolver 请求能力分别建立证据

graphquail 介绍含 schema 构建、introspection emulation 和自定义头，模拟出来的 schema 不证明服务端 introspection 已开启或每字段可访问。allTicks/source 则需具体 resolver、参数处理和 HTTP 消费者，权限、查询成本及受保护状态各自比较。工具能力或高评级不能补齐实际 query/响应，未知字段保持未知；不安装扩展、执行查询或补抓仓库内容。

来源：[保存帖1](https://x.com/i/status/1682405213452533760)、[保存帖2](https://x.com/i/status/1683711376613855233)。

保存图证 `1683711376613855233-02.jpg`：EXNESS报告summary allTicks查询source参数用于GET，可设回调域并观察DNS/HTTP；嵌套请求截图太小原始字节不可读，底部HTTP证据被截，未证明私网/元数据/内网端口或RCE。要绑定resolver参数、服务端来源、redirect/DNS目的地址权限，不发回调。


## GraphQL别名登录必须按认证尝试计数（2023保存案例）

实验室 GraphQL 请求将大量不同密码登录尝试放入别名 bruteForce0–62；响应中多数 success=false，bruteForce49 为 true。HTTP 200、响应大小或令牌字段的存在不能代替成功状态与会话验证。别名批处理可能绕过按 HTTP 请求计数的预算，应比较按解析字段/认证尝试计数与按请求计数；仅为实验室示例，不复用账号密码。

图片证据：`1688194082047422465-02.jpg`（已核对原图；裁切或遮挡范围不补造）。

来源：[保存帖1](https://x.com/i/status/1688194082047422465)。


## 保存图证0187-114-graphql：条件与证明边界

Graphinder说明-d域名/-s脚本/-b目录/-p precision、默认bruteforce和script开启、可-f域列表。默认主动行为和发现范围需确认/限定，loadedbrowser脚本来源不代表全站；发现GraphQL端点≠schema或未授权操作，版本参数需查实际工具，未运行。 可用原图：`1692413066477207675-03.jpg`。

来源：[保存帖1](https://x.com/i/status/1692413066477207675)。


## Graphinder 默认发现行为与明确请求预算（0187）

保存帮助图提供目标域、文件、脚本、字典和代理等参数，并说明默认暴力路径与 JavaScript 扫描。先从正常流量和前端脚本识别 GraphQL 候选，再将目标、字典、方法、认证及代理绑定到授权范围；返回 200 或工具定位 endpoint 不证明 introspection、越权或资源耗尽。使用帮助参数前核对安装版本，记录最小样本与请求量。

来源：[保存帖1](https://x.com/i/status/1692413066477207675)。


## GraphQL 字典规模与真实 schema/授权覆盖（0188）

由生产端点词汇构建的 GraphQL wordlist 可用于猜测字段和类型，但 60k+ 端点声明不保证当前项目 schema 完整或字段可用。将候选与实际查询错误、类型、角色和合法查询基线关联；字段发现与对象授权分开验证，限制查询数量与复杂度。词表适配 Goctopus/Clairvoyance 不代表所有版本的默认行为相同。

来源：[保存帖1](https://x.com/i/status/1695017752149590495)、[保存帖2](https://x.com/i/status/1695118847286845662)。


## 正文提炼0189：schema 推断与 resolver 鉴权是两回事

Clairvoyance保存描述是introspection关闭时推断schema，未含实际schema/实现；可作为错误信息/字段候选与端点建模线索。禁用introspection不保证字段保密，推断结果可能不完整且依赖验证错误；记录身份/角色与每个可见字段，resolver对象/字段访问必须独立受控对照。schema可见并不等于敏感数据可读，工具宣称不补具体枚举结果。

来源：[保存帖1](https://x.com/i/status/1699133349191877119)、[保存帖2](https://x.com/i/status/1699273633410248830)、[保存帖3](https://x.com/i/status/1699779622966292765)。


## 保存图片中的机制与证据边界（1705892274268160247-02.jpg）：by-type/graphql.md

图片 `1705892274268160247-02.jpg`：Apollo Sandbox/api/graphql?endpoint=https://evil.com使UI Endpoint改变，subscription仍ws://localhost:4000，ExampleQuery id可见；开发探索器可能本来允许任意endpoint。需证明受害者操作、敏感查询/手动Authorization头是否实际发往攻击者受控站及产品承诺，跨域凭据和UI改址不等于泄漏。保存图无发出查询/响应/凭据，不测试真实用户。

来源：[保存帖1](https://x.com/i/status/1705892274268160247)。


## 0194：未公开 mutation 与隐藏界面不代替对象授权

Copilot 图描述 JS 中的未公开 GraphQL 与 DestroyLlmConversation，移除 hidden 类只控制显示。先用自有 A/B 会话比较普通读、同 owner mutation 与异 owner 拒绝，读回实际状态；删除类操作只在隔离对象验证。图没有请求/删除结果，接口未公开与前端藏按钮都不自动证明 IDOR。

来源：[保存帖1](https://x.com/i/status/1717330395501584769)。


## 保存图证0194-111-graphql：1717330395501584769-02.jpg

Copilot 报告截图描述从 JS 发现未公开 GraphQL 查询与 DestroyLlmConversation mutation，并用前端移除 hidden 类显示界面。客户端显示控制与服务端对象授权是两个边界；需要授权的 A/B 自有会话比较 mutation 的所有权校验和实际状态变化。截图没有请求或删除结果，显示隐藏界面本身不授予服务端权限。

实际保存图：1717330395501584769-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1717330395501584769)。


## 保存图证0195-94-graphql：1720177877360967736-02.jpg

奖励信描述已知userUUID与recipientID时GraphQL路径授权可读/改recipient数据，没有query/variables/response。与正文id/../id2结合仅路由归一化候选，GraphQLresolver或其REST二次请求需绑定owner/tenant。自有A/B对象单ID比较读与写后状态、UUID知识不授权限；奖励金额/题名不代替PoC，未保存更多细节。

实际保存图：1720177877360967736-02.jpg。本轮原始像素已阅；图片仅支持上述可见内容。

来源：[保存帖1](https://x.com/i/status/1720177877360967736)。


## 保存图片 1736782068468568295-02.jpg 的 graphql 复用边界

完整清单两版本introspection/path/tools/IDOR方向；mostlyRESTwrapper不是普遍实现，不证明当前实际resolver/漏洞

图片证据：1736782068468568295-02.jpg。相同 SHA-256 的既有完整像素审阅与本次来源对应；按当前请求身份、真实消费者及服务端最终结果进行最小对照，不把清单、200/302 或可预测格式当作已确认漏洞。

来源：[保存帖1](https://x.com/i/status/1736782068468568295)。


## 保存图片 1742878725254099277-02.jpg 的 graphql 验证边界

HackerOne GraphQL 摘要区分 createPentestOpportunity 预期允许与 reviewPentestOpportunity/reviewCompletePentestOpportunity 仅 reviewer 才应可做，后两者能把 submitted→in_review/reviewed。schema/introspection 暴露不是漏洞；自有沙箱将 client/reviewer、对象所有权和合法前置状态作矩阵比较服务端 mutation 拒绝与持久化状态。不能由 UI 缺按钮推定禁用 create，通知或奖金额不替代审核权限证据，不真实提交机会或通知团队。

图片证据：1742878725254099277-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1742878725254099277)。


## 保存图片0204 1745898622687019158-02.jpg 的 graphql 验证边界

GitHub 摘要描述 GHES 仓库转移 REST API 与 updateTeamsRepository GraphQL mutation 的竞态，使已有管理员在转移后保留权限；历史截图列出受影响和修复版本。核心不变量是转移提交后旧主体权限与新所有者策略一致，两个协议不能各用过期授权快照。授权隔离测试环境中比较顺序转移与一次有界重叠，记录对象版本和操作顺序，最终以旧身份对自有仓库只读权限检查确认持续权限；两个成功响应或请求重叠本身不证明竞态。版本只作历史线索，不能当当前产品结论。

图片证据：1745898622687019158-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1745898622687019158)。


## 保存图片0204 1747197202542559683-02.jpg 的 graphql 验证边界

HackerOne 图片有完整摘要及 GraphQL report(id: PRIVATE_REPORT_ID){title}：私有报告由 Manage Collaborators 发出的待处理邮箱邀请可让匿名用户读标题，且强调仅匿名情形。用自有私有测试报告无敏感标题，比较无邀请、待处理、已撤销/接受状态以及退出登录、非受邀、受邀身份，查询字段仅 title；确认邀请状态不得把元数据变为匿名可读。可见标题只证明元数据泄漏，不是完整报告内容或可枚举全部对象，不探测他人 ID。

图片证据：1747197202542559683-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1747197202542559683)。


## 保存图片0204 1748329839843737770-02.jpg 的 graphql 验证边界

Enjin 摘要指 GraphQL 使用 session token 时缺恰当 CSRF 保护，HTML form 可驱使浏览器请求撤销 API token；截图没 form 内容或实际抓包。在自有隔离账户/可恢复假 token 比较正常同源请求与受控跨站 form，核对 Content-Type/解析、浏览器实际携带 Cookie、SameSite、Origin/Referer和XSRF绑定，最终只读确认撤销状态；Bearer需手工附加且浏览器不会自动带的情况作反例。CORS报错不证明请求未执行，Critical评级不能推导任意接管。

图片证据：1748329839843737770-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1748329839843737770)。


## 保存图片0205 1750488835937718677-02.jpg 的 graphql 验证边界

Enjin 摘要明确区分部分查询/变更存在非预期跨租户访问，以及其他查询本就允许跨租户访问。应逐操作确认主体、租户、对象和动作的授权规则，以两个自有租户及允许公开共享的基线比较实际响应与对象状态；截图没有具体字段或请求，不补造查询，也不能仅凭评级推断整库读取。

图片证据：1750488835937718677-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1750488835937718677)。


## 正文0207 多种入口和数据库方言不能混用：graphql

正文7个SQL例覆盖PHP/aspx/graphql和6秒sleep，传输技术不确定数据库语言。定位URL/表单/JSON变量到实际SQL拼接或参数化消费者、引号/括号上下文和driver多语句规则；own合成查询真假对照及惰性延迟短预算/网络抖动负例。不能用单次超时、页面后缀或工具label确认，禁止六秒重放、取库或用户数据。

来源：[保存帖1](https://x.com/i/status/1758061505315287363)。


## 保存图片0207 1755622909647765508-02.jpg 的 graphql 验证边界

GraphQL BillingInvoice ID进入BillingDocumentDownload和BillDetails，官方摘要说明staff访问其他店信息，列出email/地址/账单/卡后四位等但复现步骤裁掉。检查两个resolver分别绑定当前shop/staff和对象租户；用两家自有模拟店账单对照允许/拒绝且只显示合成字段，不能由奖金补造完整query或批量读取。

图片证据：1755622909647765508-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1755622909647765508)。


## 保存图片0207 1756072127407497267-02.jpg 的 graphql 验证边界

GraphQL BillingInvoice ID进入BillingDocumentDownload和BillDetails，官方摘要说明staff访问其他店信息，列出email/地址/账单/卡后四位等但复现步骤裁掉。检查两个resolver分别绑定当前shop/staff和对象租户；用两家自有模拟店账单对照允许/拒绝且只显示合成字段，不能由奖金补造完整query或批量读取。

图片证据：1756072127407497267-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1756072127407497267)。


## 保存图片0207 1758061505315287363-02.jpg 的 graphql 验证边界

GraphQL findAllUser String userId变量含OR和PG_SLEEP(6)，响应大部涂抹、耗时7.696秒。String合法传输不代表SQL拼接；resolver→SQL参数绑定、授权scope和真假基线/抖动分别核验。own合成查询及惰性延迟模型，单耗时不能确认Postgres、用户泄露或SQLi，不运行六秒延迟或全用户query。

图片证据：1758061505315287363-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1758061505315287363)。


## 正文0209 三个AI案例的证据分层：graphql

正文将Bard图片IDOR、CloudGraphQL DoS和prompt外发Workspace并列，需各自输入consumer/主体权限/资源成本/下游render证据，不能以总奖金互相证明。自有两主体假图片、有限AST计数和惰性Markdown/邮件nonce模型逐案比较对象拒绝、工作预算、禁止远程加载负例，截图已见步骤/DOM而未见完整后台结果。不得读他人图、邮箱或实施压力。

来源：[保存帖1](https://x.com/i/status/1765165423396573432)。


## 保存图片0209 1763582353887420725-03.jpg 的 graphql 验证边界

截图循环10到1000000 directives，时间约0.9到109秒，作者称已另得Google团队许可；完整query与资源指标未保存，单序列延迟也有噪声。将directive解析/验证工作量与resolver成本/字节限制分开，自有小惰性AST计数模型设置budget比较正常/重复directive/明确拒绝，不生成百万数据或发送压力。历史作者许可不授权本任务DoS，响应耗时不独立证明全服务不可用。

图片证据：1763582353887420725-03.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1763582353887420725)。


## 保存图片0209 1763716107121164393-02.jpg 的 graphql 验证边界

X官方摘要FavoriteTweet GraphQL可对非Circle成员私有帖点赞，界面仍不能查看但account archive导出含私有内容；请求被遮挡、导出内容未展示。写关联与后续导出必须重验对象可见性，动作成功不等立即内容读权限。自有Circle/非成员惰性like与export fixture对比公开帖正常、私有引用拒绝/导出过滤及成员撤销负例，最小nonce验证。不可从知道tweetID推全部内容，不点赞/申请真实导出。

图片证据：1763716107121164393-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1763716107121164393)。


## 保存图片0209 1764954199345840346-02.jpg 的 graphql 验证边界

Watson官方链：第三方mini-program同电商集成，GraphQL introspection列schema→Register建普通账号→CreateAdminUser升级→潜在banner/促销price/picture修改。Introspection不等授权漏洞，核心是敏感mutation逐动作/字段/tenant权限；自有惰性resolver角色矩阵比较普通注册、低角色拒绝创建admin及同tenant/admin合法，最终role确认且下游价格另验证。不要创建真实账号、改商品或把schema读取判Critical。

图片证据：1764954199345840346-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1764954199345840346)。


## 保存图片0210 1765694169786302612-02.jpg 的 graphql 验证边界

Semrush保存摘要描述Content Outline Builder GraphQL请求修改user ID可见额外用户信息；未示具体查询/字段。以自有双主体/tenant对象矩阵比较合法/异主体变量与嵌套resolver授权、字段敏感用途，introspection不是越权证据；Critical/无发现被恶意利用分别是评级/历史调查，不扩大成全部PII或实际入侵。

图片证据：1765694169786302612-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1765694169786302612)。


## 保存图片0210 1767211858648346769-02.jpg 的 graphql 验证边界

Twitterwebpack原图为minified片段，包含queryId/operationName ArticleEntitiesSlice/Delete/DraftCreate/Publish与feature switches。prettify不反编译全部源码/证明接口可达或授权，操作名和开关不是secret；绑定bundlehash/版本与调用点、受控查询/变更角色矩阵，文本重排不改变字节来源、不安装扩展或执行mutations。

图片证据：1767211858648346769-02.jpg。已核对完整可见像素；遮挡、裁切或未显示的请求结果不补造。

来源：[保存帖1](https://x.com/i/status/1767211858648346769)。


## 保存图证0212-46-1772624803934933200-02.jpg-graphql

已核对保存图片 `1772624803934933200-02.jpg`。HackerOne摘要CustomerAPI创建sandbox bounty指定recipient_id，再BountiesHistoryQuery泄privateemail；需要reportmanager token，底部request截断，未见GraphQL最终字段。操作授权与收件人PII字段授权是不同消费者，惰性sandbox假recipient/仅允许public字段/相关owner比较，不创建token/奖励或真实账户，金额文本非实际支付。

图片证据：1772624803934933200-02.jpg。仅采用实际可见内容，裁切、遮挡及未保存的后续步骤不补造。

来源：[保存帖1](https://x.com/i/status/1772624803934933200)。


## 正文0217：导入更新的角色字段权限（graphql）

UserImport 的 willUpdate 与 role:admin 必须受字段允许列表、对象所有者、租户和操作者能力约束。保存响应只见成功消息，不能证明低权限主体或最终角色生效。离线两个虚拟主体/不同租户/合法非法字段和创建更新矩阵对照最终记录及操作权限，不使用图中邮箱或真实导入。

来源：[保存帖1](https://x.com/i/status/1787982332252553472)。


## 正文0217：成员列表查询检查当前归属（graphql）

保存图证厂商摘要明确退出组织人员可获得当前成员数据；缺少完整返回。API查询时检查当前成员/租户和字段权限，缓存也跟随成员版本，operationName/schema可见不是授权。离线在职/退出、跨租户和字段矩阵对照虚拟输出，姓名/邮箱/角色/ID分别按实际数据边界确认。

来源：[保存帖1](https://x.com/i/status/1788660422276530673)、[保存帖2](https://x.com/i/status/1788849133492580457)。


## 正文0217：隐藏隐私状态同步到 API（graphql）

保存厂商图描述已认证主体对隐藏点赞对象的API读取，缺少原始返回；隐藏UI与resolver隐私ACL必须一致。离线公开/隐藏、本人/他人及虚拟订阅身份矩阵比较输出，缓存不可忽略隐私变更；不将旧产品条件泛化到当前规则或读取真实点赞。

来源：[保存帖1](https://x.com/i/status/1789068096847642861)、[保存帖2](https://x.com/i/status/1789211411219894391)。


## 保存图证0217-36-graphql：1787982332252553472-02.jpg

已实际核对完整保存图片 `1787982332252553472-02.jpg`。GraphQL UserImport 的 willUpdate:true 和 records.role:admin，响应包含 User was successfully updated；主体和对象被遮挡。需核对导入解析器、字段允许列表、操作者权限、租户与更新后的有效权限，区分合法管理员导入与低权限提升。离线虚拟主体/角色矩阵对照，不把成功消息等同于已成为管理员或使用画面邮箱。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1787982332252553472)。


## 保存图证0217-36-graphql：1788089664240316517-02.jpg

已实际核对完整保存图片 `1788089664240316517-02.jpg`。GraphQL UserImport 的 willUpdate:true 和 records.role:admin，响应包含 User was successfully updated；主体和对象被遮挡。需核对导入解析器、字段允许列表、操作者权限、租户与更新后的有效权限，区分合法管理员导入与低权限提升。离线虚拟主体/角色矩阵对照，不把成功消息等同于已成为管理员或使用画面邮箱。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1788089664240316517)。


## 保存图证0217-52-graphql：1788660422276530673-02.jpg

已实际核对完整保存图片 `1788660422276530673-02.jpg`。厂商摘要称离开组织的人员仍能通过 FetchMemberships 获取团队姓名、邮箱、角色/ID；缺少完整请求与返回。提炼 GraphQL resolver 在查询时检查当前成员身份、租户和字段权限，operationName 不提供授权。离线在职/退出、正确/异租户及敏感字段对照，返回 schema 或 ID 可见不等于敏感数据授权成功。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1788660422276530673)。


## 保存图证0217-68-graphql：1789068096847642861-02.jpg

已实际核对完整保存图片 `1789068096847642861-02.jpg`。保存厂商摘要描述已认证普通用户通过 Likes 操作和目标 userId 读取 Premium 隐藏点赞，UI 隐藏与 API 输出权限不一致；未显示完整返回或当前行为。离线公开/隐藏对象、本人/他人及不同主体对照 resolver 的隐私状态和字段 ACL，产品订阅条件只是旧案例前提，不访问真实账号或把 GraphQL 可查询等同于已泄露。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1789068096847642861)。


## 保存正文0219：分享报告的脱敏需要覆盖所有输出消费者（graphql）

保存图摘要描述GraphQL ShareReportViaEmail对JIRA引用脱敏不足。分别核报告分享资格、接收者身份、字段级授权和UI/API/导出/邮件的表示一致性；离线虚拟报告和敏感哨兵对照。隐藏UI字段不说明其他出口已去除，mutation名字与输入不证明未授权输出，未发信或重放报告ID。

来源：[保存帖1](https://x.com/i/status/1794005630409474246)。


## 保存图证0219-55-graphql：1794005630409474246-02.jpg

已实际核对完整保存图片 `1794005630409474246-02.jpg`。报告摘要称ShareReportViaEmail对JIRA引用等敏感信息脱敏不足，图有POST/graphql及operationName、reportId/message/emails输入，响应和下方流程未显示。分别核分享资格、接收者权限、字段级脱敏、邮件/GraphQL不同表示，用离线虚拟报告与惰性敏感哨兵对照。前端隐藏不等于所有出口已脱敏，mutation存在不是未授权泄露，不发送邮件或重放reportId。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1794005630409474246)。


## 保存正文0220-117-149-graphql：别名限流与GraphQL CSRF各有实际执行边界

GraphQL Cop正文称支持CSRF与alias限流检查，图只是宣传。别名数、HTTP请求数和实际resolver执行数应分别计量，按虚拟主体/业务操作预算对照重复字段及正确拒绝；CSRF要求跨站浏览器可发送实际Content-Type与认证cookie并触发状态变化。自动化或CI覆盖声称不等于10+已确认漏洞，不运行工具或把速率日志当授权证明。

来源：[保存帖1](https://x.com/i/status/1796574351892132252)、[保存帖2](https://x.com/i/status/1797046651175203186)。


## 保存正文0220-125-159-graphql：指纹和schema映射是候选而非访问授权

graphw00f以良性/畸形查询推测引擎，InQL介绍映射及自动检查，保存正文无实际目标结果。引擎错误和schema可见性只提供来源线索；固定版本、字段/类型和错误指纹，以本地惰性多引擎/隐藏错误反例对照，保持主体与resolver对象权限独立。不得把工具支持或schema可列举当越权/注入确认。

来源：[保存帖1](https://x.com/i/status/1796677360810623423)、[保存帖2](https://x.com/i/status/1797166488631312480)。


## 保存图证0220-42-graphql：1796189710529761676-02.jpg

已实际核对完整保存图片 `1796189710529761676-02.jpg`。GraphiQL 的 testimonialsCount(query:"a'") 返回 data:null，Int序列化错误内含 SQL syntax error at or near 的文本。可提炼 resolver 将下游错误/非整数值暴露给类型层的线索；SQL词语和引号错误不单独证明可控SQL查询、读写数据或注入成功。用本地惰性输入、参数化查询与受控异常返回对照，保留GraphQL字段、变量类型、原始错误和解析阶段，隐藏底层细节不能替代参数化。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1796189710529761676)。


## 保存正文0221-10-graphql：属性重复成本与生产停机分开证明

EXNESS保存图称单query重复属性增延迟，但明确实际仅小载荷，2–3请求停机来自本地相似环境推断。按字段/resolver/HTTP请求数和主体资源预算分别计量，以本地惰性resolver对照合并字段、复杂度、超时/终止；保存真实延迟和基线，不能以Resolved/Low/题名替代生产停机证明，不执行压力测试。

来源：[保存帖1](https://x.com/i/status/1798007034266431659)。


## 保存正文0221-47-66-graphql：Spot Check写作对象按角色和字段授权

保存正文/图称team/staff能编辑作者write-up，GraphQL EditSpotCheckReport输入含对象ID和正文等字段，UI无入口。服务端须绑定作者/项目/工作人员角色及允许改的字段，以两个虚拟作者及团队角色对照最终内容和拒绝结果；UI隐藏、历史修复题名或已解决标签不证明所有角色可编辑。请求截图截断且无响应，不发送真实修改。

来源：[保存帖1](https://x.com/i/status/1798671373633773935)、[保存帖2](https://x.com/i/status/1798996074360869189)。


## 保存正文0221-167-graphql：Spot Check元数据须按角色与字段可见性判断

保存报告说明参与者UI可见一部分项目/预算描述，程序视角SpotCheckSingleQuery可能额外暴露人数/选择criteria等私有字段。对象ID可传不等于用户有程序角色；用虚拟两个角色与对象归属对照最小字段许可/拒绝，保留图中请求截断与无原响应，Medium/Resolved不能补完整字段泄露结果。

来源：[保存帖1](https://x.com/i/status/1800573989921939818)。


## 保存图证0221-2-graphql：1798007034266431659-02.jpg

已实际核对完整保存图片 `1798007034266431659-02.jpg`。EXNESS报告摘要称未认证GraphQL可重复属性、耗时随重复数增加；作者称2–3请求可令服务504，但明确实际仅发很小载荷，强影响由localhost相似环境推断。保存Resolved/Low元数据与实际小延迟/推断停机区别，不能写成生产停机已验证。以本地惰性resolver计数、请求/字段/成本预算与终止阈值对照，记录耗时基线和资源关系，不发送压力请求。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1798007034266431659)。


## 保存图证0221-15-graphql：1798671373633773935-02.jpg

已实际核对完整保存图片 `1798671373633773935-02.jpg`。Spot Check已解决报告指出team/staff可能修改用户write-up，UI无编辑入口，截获EditSpotCheckReport GraphQL输入含spot_check_report_id及summary/scope/methodology/findings等。界面隐藏不等于后端授权，按虚拟作者/团队成员/staff与对象归属、字段权限对照允许拒绝与最终内容；图中请求下部截断且无服务端响应，不补为全部角色已成功改写，过去报告引用不代替当前证据。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1798671373633773935)。


## 保存图证0221-48-graphql：1800020622996828608-02.jpg

已实际核对完整保存图片 `1800020622996828608-02.jpg`。JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1800020622996828608)、[保存帖2](https://x.com/i/status/1810146101619740822)、[保存帖3](https://x.com/i/status/1837677848955703449)。


## 保存图证0221-48-graphql：1810146101619740822-02.jpg

已实际核对完整保存图片 `1810146101619740822-02.jpg`。JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1800020622996828608)、[保存帖2](https://x.com/i/status/1810146101619740822)、[保存帖3](https://x.com/i/status/1837677848955703449)。


## 保存图证0221-48-graphql：1800172790617874740-02.jpg

已实际核对完整保存图片 `1800172790617874740-02.jpg`。JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1800172790617874740)。


## 保存图证0221-49-graphql：1837677848955703449-02.jpg

已实际核对完整保存图片 `1837677848955703449-02.jpg`。该独立图完整核对同一JS Recon清单：静态数据/API/注释/混淆、存储/Cookie、GraphQL/MongoDB/JSON、动态求值/DOM sink和策略字段，右缘裁剪不补字。为每命中关联原JS版本、调用可达性、类型与主体权限；函数出现、schema可见或存储加密不单独证明漏洞/安全，字符串与函数回调分别建模，用本地惰性样本/正确拒绝对照，不使用token或运行载荷。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1800020622996828608)、[保存帖2](https://x.com/i/status/1810146101619740822)、[保存帖3](https://x.com/i/status/1837677848955703449)。


## 保存图证0221-69-graphql：1800573989921939818-02.jpg

已实际核对完整保存图片 `1800573989921939818-02.jpg`。SpotCheckSingleQuery报告摘要区分参与者原本可见项目/预算描述与程序视角的私有人数/选择criteria/total budget，图示按organization/spotcheck ID打开设置，GraphQL请求下部截断。按虚拟参与者/项目角色、对象归属和字段级许可核对允许拒绝及最小响应，不能把已许可预算字段全部称泄露；Resolved/Medium不替代缺失原始响应，不访问真实ID。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1800573989921939818)。


## 保存图证0222-37-graphql：1801715062077300807-02.jpg

已实际核对完整保存图片 `1801715062077300807-02.jpg`。右侧裁剪JSrecon清单覆盖静态keys/host/端点/comments/errors/混淆，runtimeCookie/localStorageflags、GraphQLdepth/ACL、MongoDB/JSON、eval/innerHTML/documentwrite/timers/Function/CSP/CORS。静态关键词不证明runtime状态/有效secret、introspection非ACL、functioncallback不等同字符串timer，逐source-sink角色/解析类型核对，不按清单自报全覆盖。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1801715062077300807)。


## 保存图证0222-107-graphql：1803337131273887752-02.jpg

已实际核对完整保存图片 `1803337131273887752-02.jpg`。#2166697summary namedbasedbatching每请求75+reports、100request~6400/40s超过称500limit；下面仅cookie/csrfplaceholder及header，未见mutation/response。按实际resolver/业务动作计预算与身份/窗口，不只数HTTP请求；数量描述不替代最终记录去重/成本证明，离线虚拟计数对照，不发批量报告或DoS。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1803337131273887752)。


## 保存图证0222-109-graphql：1803397536994173284-02.jpg

已实际核对完整保存图片 `1803397536994173284-02.jpg`。#2431495保存AutoSavePentestOpportunityinput可控package_name而政策称应由internalreviewstaff决定，示例premium名称与mutation裁剪未结果。字段级ACL按角色/操作/状态与真正套餐权益验证，未知字段拒绝/仅展示label为反例，静态成功字段名不等实际赋权，不提交Pentest表。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1803397536994173284)。


## 保存图证0222-110-graphql：1803397698613330092-02.jpg

已实际核对完整保存图片 `1803397698613330092-02.jpg`。#2483666官方summary历史Wayback公开UUID后private/inactiveembeddedformGraphQL可读intro/structuredscope/efficiency，UUID不替代字段/状态授权；publicform与privateprogram字段权限不同，曾公开不表示永远公开。保留时间/撤销状态/角色字段矩阵/来源，Low3.7/$2500/fix是保存报告状态未当前复测，不拉私密数据。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1803397698613330092)。


## 保存正文0223-59-graphql：BurpNotes分类不丢原始请求身份

Bambda以Notes标注GraphQL取决于payload/实现，原路径POST/graphql并非所有query/mutation/GET/批处理。保留原始完整消息ID、operationName/operationType/角色/时间，备注分类为展示元数据而非权限或执行结果，过滤遗漏不能计全覆盖。

来源：[保存帖1](https://x.com/i/status/1804156880375419226)。


## 保存图证0223-18-graphql：1803910890640806382-02.jpg

已实际核对完整保存图片 `1803910890640806382-02.jpg`。报告 #2381253 截图称未授权者可加载 advanced_vetting 页面，但 GraphQL 正确限制了保密字段；另指出 terms_acceptance_data.csv 下载入口可能区分私有与沙箱项目。截断处未展示下载响应。分别比较页面外壳、GraphQL 字段和直接导出路由的服务端 ACL，使用自有不同角色与项目类型控制样例，检查实际 CSV 内容、存在性差异及对象归属；可加载页面本身不是保密数据泄露，标题和已解决状态不补足缺失响应。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1803910890640806382)。


## 保存图证0223-20-graphql：1804156880375419226-02.png

已实际核对完整保存图片 `1804156880375419226-02.png`。Burp Bambda 代码用请求中包含 query 字符串识别请求，再在 body 上寻找 query 与空格加左括号的索引，substring 后覆盖 Notes。字符串出现在其他字段、格式变化、无括号或索引为 -1 均可能误判或异常，持久查询、批量操作和变量也未覆盖。应按 JSON/GraphQL 结构解析并保留原始请求、操作名与已有备注，缺失字段安全返回，先在本地样例校验分类；这里没有权限绕过证据。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1804156880375419226)。


## 保存图证0223-21-graphql：1804156880375419226-03.png

已实际核对完整保存图片 `1804156880375419226-03.png`。HTTP history 可见多条 POST /graphql 返回 200，Notes 被写为 query 或 mutation 名称且部分内容遮挡。列表展示了分类效果，不展示 GraphQL data/errors、字段授权或操作执行成功。保留请求身份、角色、原始响应和操作类型，避免将 HTTP 200 当作 GraphQL 成功或授权；被遮挡操作不补全。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1804156880375419226)。


## 0225 GraphQL四类消费者 graphql

正文列数据过曝/注入/授权/DoS，没有查询示例。把schema可见、字段可选与对象/字段resolver权限分开，注入需要真正下游解释器，复杂度需要解析及执行成本证据；只构造虚拟角色对象及有界离线AST对照，不以200或introspection开放判漏洞。

来源：[保存帖1](https://x.com/i/status/1810349834668589182)。


## 0225 原图089 graphql

GraphQLschema/query/只取指定字段和历史发布时间示意，没有漏洞查询。精确选字段不替代resolver对象权限或复杂度预算，schema可见不自动数据曝露；记录schema/构建版本、principal与虚拟fieldauthorization，不将效率宣传等同安全。

图像证据文件名：1810349834668589182-02.jpg。

来源：[保存帖1](https://x.com/i/status/1810349834668589182)。


## 0225 原图090 graphql

GraphQLexcessivequery/permissiveschema/introspection/fieldACL/complexqueries与SQLNoSQLcommand分类图。introspection只给结构，复杂度不自动暴露；resolver具体下游parser/对象字段权限与返回筛选必要，身份认证和授权不能混称，不执行注入。

图像证据文件名：1810349834668589182-03.jpg。

来源：[保存帖1](https://x.com/i/status/1810349834668589182)。


## 0225 原图091 graphql

GraphQLauthorizationrole图与fielddup/batch/resourceintensive/deeprecursion。GraphQL相同字段可能合并，alias/batch实际resolver成本、解析预算与权限逐项记录；role-based不足对象租户边界，离线有界AST/虚拟AB资源，不构造DoS。

图像证据文件名：1810349834668589182-04.jpg。

来源：[保存帖1](https://x.com/i/status/1810349834668589182)。


## 0225 复用图007 graphql

JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

当前图像证据文件名：1810580130680438806-02.jpg。原有完整像素审阅及原始时间保留，当前字节校验一致。

来源：[保存帖1](https://x.com/i/status/1810580130680438806)。


## 0227 正文 默认组继承与变更 graphql

Program Admin 经组 mutation 自赋管理组可能继承高权限，组织管理员后续修改组权限会进一步改变能力。审查创建/加入/角色赋予/重新加入以及最终敏感操作的服务端校验；摘要没有具体 mutation，不伪造成功请求。

来源：[保存帖1](https://x.com/i/status/1815733946883489833)。


## 0227 图片 1815733946883489833-02.jpg graphql

现有图片 1815733946883489833-02.jpg 的完整可见内容已按原图审阅。

报告摘要描述低权限 Program Admin 经 GraphQL mutation 自行加入默认管理组，继承 Report Manager 乃至管理员权限；默认组后来被提升权限时可再次加入并继承新能力。应对组创建、成员修改、角色赋予及权限变更后的重新加入作服务端组织与角色检查，用自有双角色验证最终敏感动作。图中只有摘要，无具体 mutation 或成功响应，不能伪造复现证据；创建组、加入组与继承能力是不同边界。

来源：[保存帖1](https://x.com/i/status/1815733946883489833)。


## 0227 重复图片 1815564603658731737-02.jpg graphql

现有图片 1815564603658731737-02.jpg 与此前已审阅原图逐字节哈希一致，本轮复核全部审阅记录，保留原审阅时间，不重新计数。

JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

来源：[保存帖1](https://x.com/i/status/1815564603658731737)。


## 0228 正文 Projects 可见性不能继承为 internal issue 权限 graphql

历史 GHES CVE-2024-5817 涉及具有 Projects 看板访问权的主体读取 internal 仓库 issue 标题/正文。分别核看板、仓库、issue 字段权限，用自有组织两角色和同一对象对照；截图明确的 internal 范围不能扩为所有 private 仓库，历史修复版本不作为 GitHub 云或当前部署的断言，未获取原始查询或外链全文。

来源：[保存帖1](https://x.com/i/status/1818753694684660029)、[保存帖2](https://x.com/i/status/1818756338790367319)。


## 0228 图证 84 graphql 1818753694684660029-02.jpg

已核对原始图片 `1818753694684660029-02.jpg`。GHES 历史 CVE-2024-5817 描述具有相应 Projects 看板访问权时可读取 internal 仓库 issue 的标题和正文。应分别检查看板、仓库、issue 字段授权，用自有组织的两种角色和同一对象验证；不能外推为所有 private 仓库或 GitHub 云当前行为。版本修复列表只作历史证据，截图未给原始查询。

来源：[保存帖1](https://x.com/i/status/1818753694684660029)。


## 0229 正文 GraphQL 查询依赖与 mutation 副作用分开 graphql

GraphQLer声称依赖感知，候选应按对象创建、引用ID和角色权限排列正常请求与受限对照，不能从schema可见性推导授权。query也需检查实际消费者，mutation可能写状态；记录依赖、回滚和预算，工具题名不证明自动安全或覆盖，未运行fuzzer。

来源：[保存帖1](https://x.com/i/status/1820875912407347640)。


## 0230 图证 16 graphql 1823293148593819863-03.jpg

已核对原始图片 `1823293148593819863-03.jpg`。GraphQL signin请求中email字符串破坏JSON，响应ActionDispatch Parameters ParseError及devise params_auth_hash、params.dig和Actionpack/Rack/Warden调用栈，提示better_errorsconsole。解析错误/stacktrace不证明认证通过或GraphQL注入；核debug来源/权限、最小敏感字段和console能力另证，未执行交互console或复制秘密。

来源：[保存帖1](https://x.com/i/status/1823293148593819863)。


## 0233 正文 Cookie指纹与调试页面 graphql

Set-Cookie的某名字只为被动指纹，不能凭名字推框架/调试控制台权限。保存图另外展示Rails坏参数堆栈、BetterErrors提示/某上下文eval、UnsafeRedirectError，分别核具体消费者、访问控制和实例环境，错误重定向是拒绝而非成功外跳，命令样貌不证明匿名或宿主root；未访问console/复用token。

来源：[保存帖1](https://x.com/i/status/1832093353846169956)。


## 0233 正文 别名动作与部分错误 graphql

GraphQL别名/多个mutation能在一次HTTP内调用多个实际动作，按请求次数计预算可能漏动作数，但该图没证明限流缺口。另图forgotPassword报错而register返回新user/JWT，GraphQL部分错误并不保证回滚其他动作，注册也可正常功能。核每动作主体、状态、预算和最终权限，不使用token/发重置或注册。

来源：[保存帖1](https://x.com/i/status/1833129580976033966)。


## 保存图证0233-30-graphql：1832093353846169956-04.jpg

已核对保存图片 `1832093353846169956-04.jpg`。POST/graphql坏JSON/参数触发ActionDispatch::Http::Parameters::ParseError，响应源片段DeviseAutologin params.dig variables/input/scope与Rails7.0.8.4/Warden1.2.9堆栈，提示/_better_errors交互console。堆栈/库版本与可调用console权限分开，提示路径不证明匿名可执行；当前请求身份/头遮挡，未用login或console。

来源：[保存帖1](https://x.com/i/status/1832093353846169956)。


## 保存图证0233-61-graphql：1833129580976033966-02.png

已核对保存图片 `1833129580976033966-02.png`。createSession mutation用first/second别名与input/input1/input2变量；图下裁掉更多字段/实际响应。别名数量可绕过按HTTP次数计限而仍受动作预算，但未证明该实例限流；核每mutation主体/对象/速率和最终结果，错误密码与成功token独立，未尝试登录或复制密码。

来源：[保存帖1](https://x.com/i/status/1833129580976033966)。


## 保存图证0233-62-graphql：1833129580976033966-03.jpg

已核对保存图片 `1833129580976033966-03.jpg`。一请求forgotPassword(email)与register(test)两mutation，响应有forgotPasswordnull/400usernotexist错误但register返回userid/JWT部分遮盖。GraphQL允许部分数据/部分错误，不一定事务回滚，注册新用户可为正常功能不是ATO/越权；核动作级限流/授权/状态边界，错误HTTP/字段不保证其他动作未生效，未注册/发重置邮件/用JWT。

来源：[保存帖1](https://x.com/i/status/1833129580976033966)。


## 保存正文0234：viewer 与草稿通知的权限要在投递时检查（graphql）

保存报告与图摘要指向 program viewer 被加入草稿订阅后收到评论/标题/时间。项目角色、报告状态、创建者与每个字段的可见权限必须同时成立，通知投递、GraphQL resolver 与撤权后的残留订阅均是消费端；不能将项目访问资格当所有未提交草稿可见。历史摘要保留来源，不以奖金或 Resolved 声称当前复现。

来源：[保存帖1](https://x.com/i/status/1836072826429899131)、[保存帖2](https://x.com/i/status/1836076129779593506)。


## 保存图证0234-85-graphql：1836072826429899131-02.jpg

已核对保存图片 `1836072826429899131-02.jpg`。HackerOne 摘要显示把用户加入 program viewer 后订阅该项目 draft reports，草稿评论通知暴露评论、标题、创建时间，部分经 GraphQL 可见。通知订阅与字段解析须在投递和读取时按报告状态/所属关系检查权限；项目查看者不自动拥有私有草稿内容。截图是历史摘要而非完整请求或当前漏洞，需角色矩阵、草稿基线及脱敏通知验证。

来源：[保存帖1](https://x.com/i/status/1836072826429899131)。


## 保存图证0234-88-graphql：1836133376312643647-02.jpg

已核对保存图片 `1836133376312643647-02.jpg`。GHES 历史摘要描述现有管理员在 REST 仓库 detach 与 updateTeamsRepository GraphQL 改权限并发时保留已脱离仓库的管理员权限。核心是状态变迁与权限更新的原子不变量，非任意匿名提权。截图写 prior 3.13、修复 3.9.13/3.10.10/3.11.8/3.12.1、CVE-2024-2440；仅保存原始版本线索，不宣称当前状态或所有部署。

来源：[保存帖1](https://x.com/i/status/1836133376312643647)。


## 保存图证0235-11-graphql：1836689358004376053-02.jpg

已核对保存图片 `1836689358004376053-02.jpg`。API 图区分对象、身份、属性、资源消耗、功能、敏感业务流程、SSRF、配置、版本库存及第三方消费。BOLA 不仅是读取，BFLA 也不限修改；认证字段、JWT 或 ID 名只是线索。资源限制应覆盖时间/内存/操作/页数/费用，旧 API 和第三方数据均需实际消费与信任边界；回调不证明敏感 SSRF。以自有角色/对象和受控负例验证，不无界遍历、压测或支付。

来源：[保存帖1](https://x.com/i/status/1836689358004376053)。


## 保存图证0235-29-graphql：1836956015981457697-02.jpg

已核对保存图片 `1836956015981457697-02.jpg`。API Protocols 图混合 REST 架构、GraphQL 查询、SOAP/WebSocket/gRPC/MQTT/AMQP/SSE 与 EDA/EDI 架构/交换方式。按请求、消息、订阅、回调和对象解析记录身份与权限，而非仅 HTTP 路径；GraphQL 字段/RPC method/topic/事件消费者各需授权，SSE 单向与 WS 双向不同，XML 不自动 XXE，图不证明某目标实现或漏洞。

来源：[保存帖1](https://x.com/i/status/1836956015981457697)。


## 保存图证0236-67-graphql：1840341166295810412-02.jpg

已核对保存图片 `1840341166295810412-02.jpg`。GraphQL工具图分introspection、错误推schema、代理展示、批量查询/变异等。schema可见不等resolver权限失效，关闭introspection也不保证字段安全；按字段/对象/身份与每个逻辑动作成本比较，未运行工具/批量请求。

来源：[保存帖1](https://x.com/i/status/1840341166295810412)。


## 保存图证0236-68-graphql：1840344404042870805-02.jpg

已核对保存图片 `1840344404042870805-02.jpg`。GraphQL图从发现/schema到替代推断、CSRF/方法格式、字段越权/alias/DoS/注入。__typename/错误只是指纹，GET变异必须实际执行才谈CSRF，alias是多个操作须独立ACL/限速，schema字段存在不证明可读敏感值；小字不补写，不压测或更改。

来源：[保存帖1](https://x.com/i/status/1840344404042870805)。


## 保存正文0237：GraphQL 按请求方法核对一致策略（graphql）

保存正文称 POST 被禁而 GET 返回 schema。相邻图片只显示被拒查询与 schema 响应开头，GET 的具体查询未呈现；在相同身份、入口、查询及网关条件下分别核查方法路由与 introspection 策略。schema 可见性与业务对象访问是不同边界，不将部分响应称为完整 schema 或数据泄露。

来源：[保存帖1](https://x.com/i/status/1841160258259202323)。


## 保存图证0237-13-graphql：1841160258259202323-02.jpg

当前附件 `1841160258259202323-02.jpg`。已实际审阅保存的原始图片。截图中 POST GraphQL 请求的 schema 查询返回 data 为 null 和禁止 introspection 的错误消息；未显示 HTTP 响应状态码，不能将错误名称当作 HTTP 500。该结果只证明这条请求被拒绝，身份、网关和其他入口的策略仍需同条件核对。

来源：[保存帖1](https://x.com/i/status/1841160258259202323)。


## 保存图证0237-14-graphql：1841160258259202323-03.jpg

当前附件 `1841160258259202323-03.jpg`。已实际审阅保存的原始图片。GET 请求的响应开头显示 __schema、Query 与类型列表，但请求查询参数及完整响应未呈现。结合相邻 POST 截图，可提出按方法或入口执行策略不一致的核查线索，不能声称已读取完整 schema。schema 可见性与业务对象授权应分别验证，固定身份、网关、方法和查询后比较。

来源：[保存帖1](https://x.com/i/status/1841160258259202323)。


## 保存图片0240：附件058（graphql）

API 侦察图按版本、实现、REST/SOAP/GraphQL、WADL/WSDL/公开文档、方法、鉴权、对象、动作及请求响应映射构建清单。接口文档或 introspection 不代表全部可达操作，cookie/header 不可固定归为非标准/标准而忽略语义；导入集合、自动脚本和 fuzz 会实际发请求，需身份与动作边界，未导入或执行。

图片证据：`1849755854628913566-02.jpg`；仅保存图实际可见内容，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1849755854628913566)。


## 保存正文0242：GraphQL 发现候选与主动请求（graphql）

工具题名声称通过子域、脚本分析与bruteforce发现GraphQL。静态/历史候选与实际endpoint探测不同；路径名不证明schema、身份或查询权限，保留来源版本、方法与scope预算，速度宣传未验证，未安装或请求。

来源：[保存帖1](https://x.com/i/status/1852395406627614796)。


## 保存图片0244-19：1857029471431238131-04.jpg（graphql）

已审阅该内容原图，当前保存附件 1857029471431238131-04.jpg。OWASP目录末段有逻辑时序/次数/工作流/误用/上传、DOM/JS/HTML/CSS/资源/CORS/Flash/clickjacking/WebSocket/postMessage/storage/XSSI及GraphQL、报告附录；历史Flash项不代表现代默认能力，目录不证测试完成。按消费者和业务终态分组，API/schema可见性仍需权限证据，恶意文件/跨站动作另授权。

来源：[保存帖1](https://x.com/i/status/1857029471431238131)。


## 保存图片0244-23：1857101278221869156-02.jpg（graphql）

已审阅该内容原图，当前保存附件 1857101278221869156-02.jpg。GraphQL工具图列InQL/GraphQLmap/shapeshifter/beautifier/clairvoyance；格式化、schema推断、请求交互/主动测试不同。禁introspection后可推断schema不自动是注入或访问绕过，须证resolver身份/对象/字段/动作授权与请求预算，未运行。

来源：[保存帖1](https://x.com/i/status/1857101278221869156)。


## 保存正文0246：删除mutation权限（graphql）

仅视频题名建议不能补完整手法；GraphQL解析/对象字段/嵌套mutation/批次每个动作需主体对象ACL和独立终态。API成功/error混合不证明已删，采用自有可恢复对象，未mutation/访问视频。

来源：[保存帖1](https://x.com/i/status/1863913694620488093)。


## 保存正文0247：GraphQL schema 可见与数据授权分别核对（graphql）

正文标题称 introspection 泄露 schema。schema 可能是正常公开合同，应区分设计元数据、私有描述与真实字段 resolver 的身份和对象权限；禁 introspection 不等于后端授权有效，公开 schema 不自动是漏洞。未执行查询，外链视频按覆盖。

来源：[保存帖1](https://x.com/i/status/1867881286276386963)。


## 保存正文0248：撤出项目后的有限元数据权限单独核对（graphql）

报告图区分Reporter/Participant/Staff/撤权状态，/:handle/hacker_demand与GraphQL仍返回有限policy类数据，作者不了解端点文档。需确认不可变主体、成员与报告参与权限、撤权时点、缓存及后端字段ACL；旧合法会话与匿名/非成员分别对照，不将有限数据升级为全部报告读取。两帖来源保留，未访问私有项目。

来源：[保存帖1](https://x.com/i/status/1871481122997272587)、[保存帖2](https://x.com/i/status/1871483907570295081)。


## 保存图证0248-10-graphql：1868524412410143228-02.jpg

已实际核对保存图片 `1868524412410143228-02.jpg` 的原始像素。API fuzz 图列工具、词表、Swagger 转请求/路由、GUID/API-key guesser，概括 SOAP HTTP/XML、REST、GraphQL 单入口及 race/%00。按真实合同记录方法、输入位置、编码、认证和对象归属；GraphQL 入口不代表单 resolver 权限，%00 不自动泄露内存，猜测 ID/key 不证明可行或获准。截图右边横向裁切，仓库/清单全文按覆盖；未下载或扫描。

来源：[保存帖1](https://x.com/i/status/1868524412410143228)。


## 保存图证0248-184-graphql：1871481122997272587-02.jpg

已实际核对保存图片 `1871481122997272587-02.jpg` 的原始像素。HackerOne报告2632876Low3.1称离开私有项目的Reporter/Participant/Staff仍可经 /:handle/hacker_demand 与GraphQL看到有限policy、联系邮箱、highlights、状态、更新时间、top hackers/VPN等；作者明确该端点目的未找到文档。角色、报告参与权与项目成员权、撤权时点和会话缓存应分开，有限元数据不等于全部报告/项目权限或匿名读取。截图无实际GraphQL返回，不访问私有项目或邀请人员。

来源：[保存帖1](https://x.com/i/status/1871481122997272587)。
