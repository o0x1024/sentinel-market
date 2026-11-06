# Web、前端与 API 采集

## 建立采集计划

从当前目标的正常入口、已有流量/文档和 [业务模型](../business-modeling.md) 建立 `角色 × 功能 × 状态` 表，字段包括入口、会话引用、前置资源、允许动作、已观察接口和缺口。优先覆盖登录前/后、不同测试角色以及列表/详情/搜索/导出/上传/异步任务等实际存在的功能；不凭通用清单编造该产品能力。

同一角色先走一条代表性正常路径，记录页面到请求及业务对象的对应关系，再补未覆盖分支。没有第二角色、管理员或测试资源时标 blocked；页面未显示功能不等于它不存在。普通账号的抓包不能代表全部角色。创建资源、导出、发送通知、购买和删除按语义核对许可，表单提取不等于获准提交。

## 页面、元文件与爬行

1. 从初始 HTML 与渲染 DOM 提取站内链接、表单 action/method、隐藏字段、iframe、注释、脚本/样式引用和显式文档入口，记录提取位置。相对路径按实际文档基址解析，含 `<base>`、协议相对 URL 和跨源重定向时先核对目标。
2. 在已允许正常读取的站点查看 robots.txt、sitemap 及引用的 sitemap index、Web manifest；把路径作为候选。robots 指令不构成测试授权，security.txt 中的政策链接需与宿主规则核对，不能改写已有 Scope。
3. 爬行器采用有限深度、时长、请求总量、页数和响应大小，显式配置目标/路径与动作边界。排除重复日历、排序/筛选组合、随机参数和无限翻页；是否继续取下一页依据新接口/结构，而非为了抓全业务数据。
4. 对 JS 渲染、点击后加载和登录后页面，用受控浏览器补采。只执行已确认语义的导航；禁用未经授权的自动表单提交。浏览器加载产生的子请求、预取和外链也需计数及出站控制，URL 输出过滤不等于阻断出站。
5. 遇到统一跳转、相同模板或软 404，在已允许的只读路由上下文使用少量不存在路径作基线；结合最终 URL、页面结构、业务字段和身份判断。不要全局按状态码/长度丢弃结果；403、空数据、挑战页保留观察及限制。

爬虫输出只含看见或排队的链接时，不能标记它们已实际请求。默认主域范围可能宽于项目指定主机；开始前核对当前工具配置。停止后确认后台请求已结束。

## JS、source map 与运行时配置

- 先分析正常页面实际引用的脚本、路由表、动态 import/chunk manifest、配置对象、Service Worker 引用及 API 请求封装。按内容哈希复用已解析文件，再沿与未覆盖业务有关的懒加载模块补采，不盲目下载所有构建产物。
- 提取 base URL、相对 path、方法、Content-Type、参数构造、认证头名称、功能开关和调用位置。动态拼接只记录可证实片段与未知变量；找到 `/api/` 字符串不代表知道完整 URL 或方法。
- 从明确的 sourceMappingURL 或已有发布资料定位 source map；先核对范围与文件体积。解析映射中的源码/位置供静态观察；嵌入的 sourcesContent 与需要另外请求的 sources 区别处理，后者不自动抓取。缺图、缺模块或混淆无法解析均记录限制。
- 前端哈希路由保留为导航状态。API 地址仍以实际请求为准；测试/生产配置、未启用分支、第三方 SDK 和示例代码分别标记，不能自动执行静态提取的请求。
- 签名/加密封装先通过已获准正常样本恢复请求结构与动态字段依赖，方法见 [小程序请求封装](../by-type/miniapp-security.md)。不猜密钥或把签名失败当业务接口安全。

## API 与参数结构

用三类来源互相补充：正常流量（浏览器/受控代理/HAR）、静态客户端或获准源码、接口文档（OpenAPI/Swagger、Postman 集合等）。取并集并保留来源差异，不把交集当完整覆盖。文档版本、servers/basePath、环境变量、认证方式和外部引用都要核对；导入文档不能触发全量请求，集合中的脚本/测试代码不自动执行。

| 要记录什么 | 提取办法与限制 |
|---|---|
| 协议、主机、端口、方法和路由 | 方法来自实际请求或明确声明；只有 URL 时记 unknown，不默认 GET。HTTP/HTTPS、API v1/v2、GET/POST 分开 |
| 参数位置与结构 | 保存 path/query/header/cookie/body 位置，JSON 嵌套字段路径、数组、表单/multipart、类型和来源；可读响应字段不等于可写参数 |
| 参数语义 | 记录资源/租户/角色、分页过滤、文件/URL 输入、状态或额度线索；只有观察时才能判断必填/默认/枚举，否则写 unknown |
| 会话与动态字段 | 用身份引用记录认证前提、CSRF、nonce、时间戳、签名的依赖；敏感值留在受控凭据系统，不进普通接口清单 |
| 响应和数据关系 | 保存响应结构、业务错误、资源归属、列表到详情/导出/异步任务的关联；空返回与接口不存在分别处理 |
| 版本与环境 | 对照当前客户端、历史 URL、旧文档和部署资料；差异只生成待核对项，历史接口不直接标当前可达 |

参数发现优先从正常请求、可用文档、表单及客户端构造取候选；有明确线索且参数探测动作获准时才做小候选单变量对照，使用自建资源/普通标记。不得从正常读取预算推导大字典参数 fuzzing，更不能把字段名线索升级为批量读写真实数据。

需要从已观察的接口/目录规律推导新候选、区分参数名称与值的变异或根据响应调整下一批时，按 [定向 Fuzzing](../targeted-fuzzing.md) 执行。发现阶段无需先证明漏洞；静态推导、实际请求、输入被消费与安全约束被突破分别记录。

## 非 REST 与间接入口

| 信号 | 发现产物 | 边界 |
|---|---|---|
| GraphQL 正常操作或可用 schema | operation 类型/名称、字段路径、变量结构、查询指纹及身份；详见 [GraphQL](../by-type/graphql.md) | 一个 `/graphql` URL 不是一个业务操作；不自动发起全量 introspection 或大批量查询 |
| WebSocket/SSE 流量 | 握手/订阅入口、消息或事件类型、资源引用、会话及连接生命周期 | 不能只统计握手；未观察的消息类型记未知，不长期挂后台采集 |
| SOAP/WSDL、gRPC/protobuf 材料 | service/method、消息结构、调用地址和已有调用点 | 解析外部 import/include 先登记引用并校验；反射/在线描述查询需匹配许可 |
| OAuth/SSO、第三方 SDK、支付或存储跳转 | 参与方、回调地址、信任边界、状态关联及第三方归属 | 记录引用不表示获准测试 IdP、供应商或云账号 |
| Webhook、导入、导出、队列/后台渲染 | 用户输入→接收接口→任务 ID→消费者/回调→结果的已知连接 | 看不到消费者就标 unknown；不为收集全链路而擅自触发通知、账单或远端请求 |

## 交付与工具限制

按 [发现记录](records-and-incremental.md) 保存接口及角色/状态覆盖；把“文档声明、代码引用、实际请求、业务确认”分别记录。提取到越权/输入边界线索后转相应检测专题，不把信息收集结果直接转 Finding。

工具可选择已有浏览器、受控代理/HAR 解析器、静态解析器或 Katana 等爬行器。先确认是否会执行 JS、自动填表、跟外链、加载文档远端引用，及能否保存实际请求证据；只有离线解析器时照实交付静态候选。

2026-09-16 核对：[WSTG 入口识别](https://owasp.github.io/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/06-Identify_Application_Entry_Points)、[执行路径](https://owasp.github.io/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/07-Map_Execution_Paths_Through_Application)、[元文件](https://owasp.github.io/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/03-Review_Webserver_Metafiles_for_Information_Leakage)、[Katana 模式与配置](https://docs.projectdiscovery.io/opensource/katana/running)。这些资料支持方法选择；本地工具版本、可用能力及实际覆盖须另行记录。
