# NoSQL 注入

适用信号：结构化查询、JSON 筛选或 NoSQL 错误线索

## 检查与最小实验

区分文本语法拼接与把用户对象直接当查询条件两种入口。记录字段正常类型，选一个受控数据集的标量/对象对照，检查查询结构是否改变。具体操作符只依据实际数据库和驱动文档选择。

在本地匹配实现中验证类型与语法，然后用自建记录的成对条件判断结果；对关系、嵌套字段和过滤器逐一限定，避免扩大查询范围。服务端 JavaScript 功能存在与否随版本/配置变化，不沿用旧教程假设。

## 证据与反例

JSON 能接受对象、错误里出现 MongoDB、结果为空，都不是注入证明。需要受控查询逻辑被非预期改写或测试身份边界被突破；先排除合法高级搜索与类型校验错误。

## Agent 行为

不转为全库枚举或认证爆破。当前输入只证实解析差异时保存线索；与 [API 参数污染](api-property-pollution.md) 区分根因。

## 调研来源

- [PS-nosql · NoSQL injection](https://portswigger.net/web-security/nosql-injection)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 结构化条件与计数观察

CTF图中的flag[$regex]是HTTP键名，是否形成结构化查询条件取决于实际参数解析器和查询构造；不能因名字含regex就认定MongoDB、SQL或当前可注入。图中代码把JSON结果长度作为信号，并把异常统统返回0，因而空结果、连接/JSON解析失败和认证错误会被混在同一观察值，不能据0判断猜测为假。

只用已知合成数据建立匹配/不匹配/解析失败的独立对照，保留HTTP状态、响应类型、异常类别和实际数据绑定；正常可用的正则搜索作反例。展示的脚本上下部不完整，不能视为完整执行链，不运行来源脚本、提取真实flag/凭据或逐字猜生产字段。


## JSON 的 $where 延时样本须定位数据库脚本消费者

图中 configId 数组旁的 $where 使用 Date 忙循环约三十秒，帖文把它称服务器 JavaScript 注入。先核对操作符是否真的进入支持该语义的数据库/查询 API、脚本能力是否开启以及执行身份。延时声明没有响应基线或查询结果，不能判成一般应用 eval、SQL 或 OS 命令执行；只在获授权隔离环境用极小无害对照，不把长循环用于线上验证。

来源：[保存帖1](https://x.com/i/status/1649716292168069122)。

现有图片证据 `1649716292168069122-02.jpg`：JSONconfigId数组+$where含Date忙循环30sec/typeofguard示例，无响应计时/DB版本/脚本能力；SQL/服务器JS归类须按Mongo式消费者实际证明，长循环不可线上执行。


## 嵌套表单操作符与真假差异须核对查询构造

帖子给出 list/List、数组形式 $lt/$in/$nin 的 true/false 差异。记录原始大小写、表单到数组/对象的解析以及查询 API 实际消费的类型/操作符；不同字段名和合法过滤语义可能导致正常结果变化。真假响应不证明认证绕过或任意数据读取，需自有固定对象、相同消费者、正常过滤/无效操作符负例及受保护边界，不把样例跨数据库或接口通用化。

来源：[保存帖1](https://x.com/i/status/1650785939310952451)。


## MongoDB 脚本族结果按信息与权限拆分

保存 Nmap mongo* 与默认端口例子没有实际输出。先检查脚本具体行为、适用协议和授权预算，区分版本/握手元数据、未认证访问与数据库读取/写入权限；脚本通配符并非只读承诺。无需默认端口也可能有服务；开放端口不证明无需认证，不执行全脚本族或数据枚举。

来源：[保存帖1](https://x.com/i/status/1651942843844538373)。


## 自定义 emoji 查询的未认证延时线索

Rocket.Chat 摘要称 listEmojiCustom 存在 unauthenticated NoSQL 注入且至少一个自定义 emoji 才触发。明确入口、消息/schema、数据库消费者及数据前提，以空集合/存在自有 emoji、正常/等成本条件作对照；需重复分布和后端归因排除延迟噪声。摘要没有原始载荷/耗时，侧栏 SQLInjection 文字不能改变数据库类别，不执行压力或数据读取。

来源：[保存帖1](https://x.com/i/status/1656034070235693059)。

保存图片 `1656034070235693059-02.jpg`：RocketChat listEmojiCustomNoSQL unauth需至少1customemoji，延迟有限impact摘要，无payload/测量，不以sideSQLInjection标签当SQLDB。 本段仅使用实际查看的保存原图，不补未保存内容。


## 保存图证0221-48-nosql：1800020622996828608-02.jpg

已实际核对完整保存图片 `1800020622996828608-02.jpg`。JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1800020622996828608)、[保存帖2](https://x.com/i/status/1810146101619740822)、[保存帖3](https://x.com/i/status/1837677848955703449)。


## 保存图证0221-48-nosql：1810146101619740822-02.jpg

已实际核对完整保存图片 `1810146101619740822-02.jpg`。JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1800020622996828608)、[保存帖2](https://x.com/i/status/1810146101619740822)、[保存帖3](https://x.com/i/status/1837677848955703449)。


## 保存图证0221-48-nosql：1800172790617874740-02.jpg

已实际核对完整保存图片 `1800172790617874740-02.jpg`。JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1800172790617874740)。


## 保存图证0221-49-nosql：1837677848955703449-02.jpg

已实际核对完整保存图片 `1837677848955703449-02.jpg`。该独立图完整核对同一JS Recon清单：静态数据/API/注释/混淆、存储/Cookie、GraphQL/MongoDB/JSON、动态求值/DOM sink和策略字段，右缘裁剪不补字。为每命中关联原JS版本、调用可达性、类型与主体权限；函数出现、schema可见或存储加密不单独证明漏洞/安全，字符串与函数回调分别建模，用本地惰性样本/正确拒绝对照，不使用token或运行载荷。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1800020622996828608)、[保存帖2](https://x.com/i/status/1810146101619740822)、[保存帖3](https://x.com/i/status/1837677848955703449)。


## 保存图证0222-37-nosql：1801715062077300807-02.jpg

已实际核对完整保存图片 `1801715062077300807-02.jpg`。右侧裁剪JSrecon清单覆盖静态keys/host/端点/comments/errors/混淆，runtimeCookie/localStorageflags、GraphQLdepth/ACL、MongoDB/JSON、eval/innerHTML/documentwrite/timers/Function/CSP/CORS。静态关键词不证明runtime状态/有效secret、introspection非ACL、functioncallback不等同字符串timer，逐source-sink角色/解析类型核对，不按清单自报全覆盖。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1801715062077300807)。


## 保存图证0223-45-nosql：1805060956734861700-02.jpg

已实际核对完整保存图片 `1805060956734861700-02.jpg`。图片只列 Nmap mongodb-info 与 mongodb-databases 针对 27017 的占位命令，无执行输出。开放端口或产品识别不等于无认证数据库读取，信息与列库权限也应分别验证；记录部署端口、协议、认证角色和最小虚拟元数据的允许/拒绝比较，使用实际响应才能判断泄露。不运行脚本、读取真实数据库或默认猜测。

图片为现有保存字节；裁剪、遮挡和未显示响应不补造。

来源：[保存帖1](https://x.com/i/status/1805060956734861700)。


## 0225 原图090 nosql

GraphQLexcessivequery/permissiveschema/introspection/fieldACL/complexqueries与SQLNoSQLcommand分类图。introspection只给结构，复杂度不自动暴露；resolver具体下游parser/对象字段权限与返回筛选必要，身份认证和授权不能混称，不执行注入。

图像证据文件名：1810349834668589182-03.jpg。

来源：[保存帖1](https://x.com/i/status/1810349834668589182)。


## 0225 复用图007 nosql

JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

当前图像证据文件名：1810580130680438806-02.jpg。原有完整像素审阅及原始时间保留，当前字节校验一致。

来源：[保存帖1](https://x.com/i/status/1810580130680438806)。


## 0226 图片 025 nosql

原始图片 `1811536133182095683-02.jpg` 已实际审阅。Rocket.Chat图明确loginByToken预认证token未校验，可$regex枚举visitor token并与loadHistory第二NoSQLi组合泄露聊天；代码getVisitorByToken(token,{projection:{_id:1}})示查询入口，截断后续。输入应限定字符串/拒绝操作符，登录token枚举oracle与历史权限分别验证，未读取真实消息。

来源：[保存帖1](https://x.com/i/status/1811536133182095683)。


## 0227 重复图片 1815564603658731737-02.jpg nosql

现有图片 1815564603658731737-02.jpg 与此前已审阅原图逐字节哈希一致，本轮复核全部审阅记录，保留原审阅时间，不重新计数。

JS Recon清单涵盖硬编码/隐藏URL/API/注释/错误/调用/混淆、localStorage/Cookie flags与scope、GraphQL introspection/授权/复杂度、MongoDB配置/NoSQL、JSON类型/解析、eval/innerHTML/document.write/定时器/Function及第三方库/CSP/CORS/HTTPS/log。图右缘有裁剪，缺字不补。禁用introspection、加密存储和出现危险函数都不独立决定安全；优先记录真实源到sink、执行上下文、服务端对象权限和公开常量反例，定时器函数回调与字符串求值区分，以惰性解析对照，不执行脚本。

来源：[保存帖1](https://x.com/i/status/1815564603658731737)。


## 0229 图证 88 nosql 1822409356060856385-02.jpg

已核对原始图片 `1822409356060856385-02.jpg`。Rocket.Chat2022 login-token handler只检查result.loginToken真假后把该值直接放Mongo services.loginToken.token条件，返回user后unset令牌。应严格拒绝非字符串/查询结构并核令牌subject/purpose/lifetime、原子消费与服务器身份；可形成NoSQL查询类型混淆假设，但图未给具体绕过输入或实际登录回执，不能补造万能payload或现行漏洞。

来源：[保存帖1](https://x.com/i/status/1822409356060856385)。


## 保存图证0232-76-nosql：1830479795756355692-02.png

已核对保存图片 `1830479795756355692-02.png`。Web清单认证列密码/限速/MFA/恢复/会话固定/退出/默认凭据/锁定/存储/expiry/flags/HTTPS日志/验证码/复杂度/rememberme/timeout/inactive；授权列纵横角色/对象/租户/最小权限/强制浏览/时间动态状态；输入列XSS/SQLNoSQL/命令LDAPXXE/客户端服务端/XSSI/HPP/RCE/遍历/include/模板/长度。把每项落到主体动作消费者与正常/拒绝对照，缺Cookieflags/匿名公开API/客户端校验不是独立接管，CSP和密码复杂度等按实际业务核，不执行清单扫描。

来源：[保存帖1](https://x.com/i/status/1830479795756355692)。


## 保存图证0232-97-nosql：1830946988424069202-03.jpg

已核对保存图片 `1830946988424069202-03.jpg`。数据库蜜罐列表ESDelilah/ESPot旧CVE/ElasticPot/Elastichoney、MongoHoneyProxy/NoSQLpot、Cmysql/MysqlPot、pghoney/stickyelephant、RedisHoneyPot列低/中/高交互分类。协议握手/仿造命令或错误未必真实数据库读写，核自有服务实现/隔离日志/消费者，交互级别不表示权限或漏洞，未连接数据库/部署。

来源：[保存帖1](https://x.com/i/status/1830946988424069202)。


## 保存图证0233-13-nosql：1831529298940809273-02.jpg

已核对保存图片 `1831529298940809273-02.jpg`。Enumeration图按NetBIOSSMB139/445、LDAP389/636、RPC135、SMTP25、SNMP161/162、RDP3389、FTP21、HTTP80/443、MySQL3306/MSSQL1433/Postgres5432/Oracle1521、NFS2049、DNS53列工具/脚本含brute/readfile/xpcmdshell等。端口映射非实际协议/漏洞，rpcinfo与135等工具需核真实服务；身份/枚举/读写/命令动作分开，不把清单默认执行或扩授权，未扫描/登录/读库。

来源：[保存帖1](https://x.com/i/status/1831529298940809273)。


## 保存图证0237-46-nosql：1842141404136431819-03.jpg

当前附件 `1842141404136431819-03.jpg`。已实际审阅保存的原始图片。API 清单第二张覆盖功能授权、批量赋值、配置和注入。检查每个方法与路由的服务端角色约束、允许写入字段及实际解释器；ORM、类型校验或输入过滤均不能单独替代正确参数化和权限控制。仅示意接收对象后保存不证明可修改敏感字段，需核对实际模式与最终持久化状态。

来源：[保存帖1](https://x.com/i/status/1842141404136431819)。


## 保存图片0241：附件033（nosql）

SQL工具目录混合SQL自动化、payload表、NoSQLMap与API包装。实际数据库/驱动/方言、输入类型和权限是不同前提，工具名不保证注入或接管；检测和枚举/写入影响不同，未安装或运行。

图片证据：`1850910403137806422-02.jpg`；按保存原图可见内容提炼，未读取外链全文。

来源：[保存帖1](https://x.com/i/status/1850910403137806422)。


## 保存图片0244-18：1857029471431238131-03.jpg（nosql）

已审阅该内容原图，当前保存附件 1857029471431238131-03.jpg。OWASP目录片段列session puzzling/hijack、输入验证含不同数据库/ORM、LDAP/XML/XPath/SSI/邮件/code/file/cmd/format、HTTP拆分和Host/SSTI/SSRF、错误和弱密码学；名称是测试分类而非通用载荷或漏洞证明。先确定真实消费者及版本，再设计独立对照；不把NoSQL/ORM统称SQL或重放会话当授权，未运行。

来源：[保存帖1](https://x.com/i/status/1857029471431238131)。
