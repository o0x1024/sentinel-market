# LDAP / XPath 注入

适用信号：目录检索、企业身份查询、XML 数据查询或对应错误栈

## 检查与最小实验

先确认查询语言与参数位置：LDAP 的搜索过滤器和 DN 转义不同，XPath 查询 XML 与 XXE 实体解析不同。用测试目录/测试 XML 的已知记录建立正常结果与无匹配对照。

只按已知语法选择一个影响查询结构的受控条件，与等价正常检索和不成立条件比较；错误字符只用于识别候选，不能作为最终依据。优先在匹配本地实现检查字符串拼接路径。

## 证据与反例

合法通配符搜索、目录错误和空结果不等于注入；需证明非预期查询或受控身份/数据边界改变。LDAP 返回的第一条身份可能是非测试用户，禁止用“登录到任意首条用户”的方式验证。

## Agent 行为

不做全目录/整棵 XML 树枚举，缺少安全测试数据则记录待补证。不要复制 SQL 方言或旧版语法到不同查询引擎。

## 调研来源

- [OWASP-ldap · Testing for LDAP Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Injection_Testing/06-Testing_for_LDAP_Injection)
- [OWASP-xpath · Testing for XPath Injection](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/09-Testing_for_XPath_Injection)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。


## phpLDAPadmin anonymous 选项与目录可读范围

正文称anonymous checkbox可读并分级high，图片只有triaged邮件。

认证方式、目录授权、字段受众和实际读者需逐层独立证据；anonymous登录本身可能是配置允许行为。只公开属性、正确拒绝私有条目、没有查询回执或误认邮件等级是反例。本次不连接LDAP或提取目录数据。

来源：[保存帖1](https://x.com/i/status/1461698833960910850)。


## LDAPShell 的名称不能代替目录 ACL 利用链

正文介绍 AD ACL abuse 工具，三组图片仅同类装饰图，没有目录请求或 ACL 结果。

工具类别可提示审计目录对象、访问主体和授予权限；实际漏洞仍需对象安全描述符、受控主体的有效权限及被跨越的操作。不要根据 shell 名称补写成员修改、提权或命令执行，亦不要把 AD 权限问题误归类为 LDAP 过滤器注入。

来源：[保存帖1](https://x.com/i/status/1513279445532033036)、[保存帖2](https://x.com/i/status/1513308000626573312)、[保存帖3](https://x.com/i/status/1514176113286782979)、[保存帖4](https://x.com/i/status/1514510235213471746)。


## AD CS 模板 ACL 的单条属性写权需限定效果

截图为 cert template ACL，圈出 Domain Users 对 ms-PKI-OID-User-Notice 的 WriteProperty，其他可见项有 Enrollment 等权限。

逐 ACE 确认主体、对象 GUID/属性、继承、有效组和拒绝项；可写某个属性不等于可改所有证书安全设置。还需模板状态、发布/注册条件和实际证书消费者链才能讨论提权。工具 get-acl 输出不能直接补成 ESC 利用成功。

来源：[保存帖1](https://x.com/i/status/1514955341045415937)。


## AD 多模块启动日志要按模块记录完成状态

linWinPwn 图显示域/DC 输入、LDAP bind、用户枚举，以及部分模块需要凭据。

分别记录匿名或认证主体、模块输入、结束状态和产物。绑定成功与启动枚举不等于完整域覆盖；模块需要凭据也不代表全部 LDAP 读取都受同样限制。无实际结果时不扩展为 AD 提权或域控制。

来源：[保存帖1](https://x.com/i/status/1515831014601469960)。


## KrbRelay 的协议操作清单不是成功中继证据

help 图列 LDAP、SMB 与 HTTP 操作，并含 SPN、SSL、会话和 COM 参数。

按协议绑定认证源、目标身份、连接策略、有效权限和操作结果。help 中出现凭据读取、服务或组操作不证明目标接受中继，更不证明域控制；离线审计只保留配置和最小消费者证据，不执行这些高影响操作。

来源：[保存帖1](https://x.com/i/status/1516178558057652224)。


## ADReaper 帮助页的枚举类别不等于权限结果

图列 users、groups、SPN、GPO、trust、计算机及数据库等参数，命令以 help 状态结束。

把工具输入身份、DC、对象类别和完成产物分开；帮助页中 adminpriv 之类名称不证明当前主体拥有该权限。只依据实际返回对象与有效访问控制判断，未保存结果时不补成完整 AD 清单。

来源：[保存帖1](https://x.com/i/status/1516404900091113473)。


## LDAP 过滤表达式必须与 SQL 片段分开解析

保存列表混合星号、括号、NUL 表示及 SQL 风格字符。

先还原完整 LDAP filter、插值位置和转义，再区分筛选、返回 DN、绑定验证与最终会话。过滤语法、DN 语法和 SQL 语法不同；失衡括号或通配符不自动构成认证绕过。仅在自有离线语法样本验证类型与结构。

来源：[保存帖1](https://x.com/i/status/1520961890658136064)、[保存帖2](https://x.com/i/status/1521537089250205696)、[保存帖3](https://x.com/i/status/1523625521409847296)。


## LDAP 通道架构不等于 LDAP 注入或链路已运行

图用两个网络区段和目录服务连接说明跨区通信概念。

分别核目录对象读写权限、网络路由、同步与代理主体，区分设计图、运行日志和实际消息。LDAP 作为传输渠道与 LDAP filter 注入属于不同边界；没有保存运行结果时，不扩展为已建立控制通道或防火墙绕过。

来源：[保存帖1](https://x.com/i/status/1521840713872384006)。


## LDAP 特殊字符根据过滤器与 DN 消费者验证

正文列出通配、括号及空字符相关字符串。先区分搜索过滤器、DN 拼接和库的参数化/转义方式，以自有数据对照匹配范围、鉴权分支及实际返回对象。字符被接收、错误改变或通配查询合法并不自动构成注入；目标语法和实际授权结果必须对应，不能直接拿字符串清单当通用绕过。

来源：[保存帖1](https://x.com/i/status/1539657567445479424)。


## 匿名AD绑定成功不代表枚举模块全部成功

LinWinPwn 图用匿名/空密码模式，DNS 与 BloodHound 模块提示需要凭据，LDAP bind OK 后才尝试目录读取。记录每个模块的实际身份、连接/绑定、查询权限、返回对象及失败，区分匿名可连接与有效读取。脚本启动或 bind 成功不能代表所有模块覆盖或提权；只在授权实验域做低影响元数据对照，不自动运行认证喷洒、账户提取或破坏检查。

来源：[保存帖1](https://x.com/i/status/1572760089055854592)。


## 保存正文0190：phpLDAPadmin登录及cmd路径需分支验证

phpldapadmin/index.php、phpldapadmin/cmd.php和cmd.php是候选，保存续篇未提供XSS具体参数。登录页的Anonymous选项不证明成功匿名bind或敏感目录可读，默认凭据不能未授权尝试；需自有LDAP沙箱、版本、ACL和会话条件对照。登录UI、旧版本或单一路径存在不证明XSS/命令执行。

来源：[保存帖1](https://x.com/i/status/1701392754251563477)、[保存帖2](https://x.com/i/status/2098740132606062900)。


## 保存图证0192-18-ldap：机制与验证条件

保存图片 `1708840641466089472-02.png`：Nmap 图仅显示80/389/443 open和其他地址未扫；不能证明 LDAP 匿名 bind、目录可读或全部地址覆盖。正文 http://test.com 不是纯主机参数，ldap* and not brute 也不保证每个脚本都是只读；先核对 scope、实际协议及认证要求，以低预算匿名 bind/最小非敏感查询比较可见权限，端口标签非鉴权证据。

来源：[保存帖1](https://x.com/i/status/1708840641466089472)。


## 保存图证0232-76-ldap：1830479795756355692-02.png

已核对保存图片 `1830479795756355692-02.png`。Web清单认证列密码/限速/MFA/恢复/会话固定/退出/默认凭据/锁定/存储/expiry/flags/HTTPS日志/验证码/复杂度/rememberme/timeout/inactive；授权列纵横角色/对象/租户/最小权限/强制浏览/时间动态状态；输入列XSS/SQLNoSQL/命令LDAPXXE/客户端服务端/XSSI/HPP/RCE/遍历/include/模板/长度。把每项落到主体动作消费者与正常/拒绝对照，缺Cookieflags/匿名公开API/客户端校验不是独立接管，CSP和密码复杂度等按实际业务核，不执行清单扫描。

来源：[保存帖1](https://x.com/i/status/1830479795756355692)。


## 保存图证0233-13-ldap：1831529298940809273-02.jpg

已核对保存图片 `1831529298940809273-02.jpg`。Enumeration图按NetBIOSSMB139/445、LDAP389/636、RPC135、SMTP25、SNMP161/162、RDP3389、FTP21、HTTP80/443、MySQL3306/MSSQL1433/Postgres5432/Oracle1521、NFS2049、DNS53列工具/脚本含brute/readfile/xpcmdshell等。端口映射非实际协议/漏洞，rpcinfo与135等工具需核真实服务；身份/枚举/读写/命令动作分开，不把清单默认执行或扩授权，未扫描/登录/读库。

来源：[保存帖1](https://x.com/i/status/1831529298940809273)。


## 保存图证0237-46-ldap：1842141404136431819-03.jpg

当前附件 `1842141404136431819-03.jpg`。已实际审阅保存的原始图片。API 清单第二张覆盖功能授权、批量赋值、配置和注入。检查每个方法与路由的服务端角色约束、允许写入字段及实际解释器；ORM、类型校验或输入过滤均不能单独替代正确参数化和权限控制。仅示意接收对象后保存不证明可修改敏感字段，需核对实际模式与最终持久化状态。

来源：[保存帖1](https://x.com/i/status/1842141404136431819)。


## 保存图证0237-70-ldap：1843217509039886619-02.jpg

当前附件 `1843217509039886619-02.jpg`。已实际审阅保存的原始图片。枚举图按 HTTP/HTTPS、SMB、LDAP、RPC、邮件、SNMP、RDP、FTP、数据库和 NFS 分支列工具。应先确定协议、端口、身份与操作类型，再区分版本/元数据读取、目录或用户枚举、密码尝试和漏洞动作；工具名不是授权或结果。涉及账户、共享和密码的行为需单独范围，不执行清单。

来源：[保存帖1](https://x.com/i/status/1843217509039886619)。


## 保存正文0243：LDAP与XPath混合列表（ldap）

列表含LDAP过滤器、通配符/null、XPath路径/属性和name()条件；确定真实解释器与filter/DN/XPath语法，分别用正确转义和参数接口。URL %00、字面\x00及真实空字节可能被不同层拒绝，不能互换；wildcard匹配不等于授权绕过，不执行查询。

来源：[保存帖1](https://x.com/i/status/1855522086288335218)。


## 保存图片0244-18：1857029471431238131-03.jpg（ldap）

已审阅该内容原图，当前保存附件 1857029471431238131-03.jpg。OWASP目录片段列session puzzling/hijack、输入验证含不同数据库/ORM、LDAP/XML/XPath/SSI/邮件/code/file/cmd/format、HTTP拆分和Host/SSTI/SSRF、错误和弱密码学；名称是测试分类而非通用载荷或漏洞证明。先确定真实消费者及版本，再设计独立对照；不把NoSQL/ORM统称SQL或重放会话当授权，未运行。

来源：[保存帖1](https://x.com/i/status/1857029471431238131)。


## 保存图片0245-81：1862034946484834535-02.jpg（ldap）

已审阅该内容原图，当前保存附件 1862034946484834535-02.jpg。枚举图按SMB139445/LDAP389636/RPC135/SMTP25/SNMP161162/RDP3389/FTP21/HTTP80443/MySQL/MSSQL/Postgres/Oracle/NFS2049/DNS53混fingerprint、认证猜测、hashdump、SQL查询/文件读、xpcmdshell、DNStransfer等；端口≠实际协议/版本，登录/数据/执行动作风险不同，预算和自有最小对象分别许可。不执行模块、破解、读文件或域传送。

来源：[保存帖1](https://x.com/i/status/1862034946484834535)。


## 保存正文0246：ADWS与LDAP枚举（ldap）

ShadowHound列ADmodule/ADWS或DirectoryServices/LDAP用于usersgroupscomputerscerts，卡片仅品牌无脚本。真实域身份、目录ACL、分页和字段/证书用途、关系图路径独立核验，可枚举不自动域接管/私钥获取，不运行PowerShell/查询AD。

来源：[保存帖1](https://x.com/i/status/1864309243350004151)。
