# crawl_xz 研究提炼与反例

本页是对归档叙述的综合设计，不是逐篇复现。固定提交为 `6496ea94f1e46d3fdfabdaeefebdf5fa03b24334`。以下 24 篇的相关文字段落已核读，代码块、图片及原目标未完整验证；不继承作者宣称的版本范围、影响规模、成功率或收录等级。来源读取范围与文件哈希见 [复核记录](crawl-xz-curation.json)，完整检索见 [使用协议](crawl-xz-integration.md)。

## K01 支付数据的信任回流

商品服务生成的价格经过客户端回传后，仍需在订单服务重新绑定商品、数量、权益和结算条件。客户端可重算加密包只是可控性证据。

验证与反例：以受控订单核对权威实付/权益；前端价格或已创建订单不是实际少付多得。不要把客户端加密或代码混淆当成服务端授权。

来源：[butian/2778](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/butian/2778-%E6%94%AF%E4%BB%98%E7%B1%BB%E6%BC%8F%E6%B4%9E%E6%8C%96%E6%8E%98%E6%8A%80%E5%B7%A7%E6%80%BB%E7%BB%93.md)；[butian/2949](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/butian/2949-%E6%9F%90%E7%A7%AF%E5%88%86%E5%95%86%E5%9F%8E%E4%BB%BB%E6%84%8F%E9%87%91%E9%A2%9D%E6%94%AF%E4%BB%98%E6%BC%8F%E6%B4%9E%E5%88%86%E6%9E%90%E5%88%A9%E7%94%A8%E5%8F%8A%E6%80%9D%E8%80%83.md)。

## K02 优惠券释放与旧订单

把预占、取消返还、再次预占、旧支付凭据和最终核销放在同一状态机。旧订单继续支付与并发核销是不同假设。

验证与反例：先确认每人/每券约束和测试额度。文章采用多请求并发及订单截图，不能继承其请求数或视为实际重复履约。

来源：[xianzhi/18389](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/18389-%E4%BC%81%E4%B8%9ASRC%E6%94%AF%E4%BB%98%E6%BC%8F%E6%B4%9E%26EDUSRC%26%E4%BC%97%E6%B5%8B%E6%8C%96%E6%8E%98%E6%80%9D%E8%B7%AF%E6%8A%80%E5%B7%A7%E6%93%8D%E4%BD%9C%E5%88%86%E4%BA%AB-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)。

## K03 小程序接口与身份边界

正常流量中的详情、列表、导出和下载可能处于不同授权路径；平台登录身份与客户端可编辑资料也需分开。

验证与反例：用两个受控账号证明边界，不采纳批量真实数据、口令尝试、Webshell 或“字段存在即任意登录”的推断。

来源：[xianzhi/18037](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/18037-%E5%AE%9E%E6%88%98SRC%E6%8C%96%E6%8E%98%EF%BD%9C%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F%E6%B8%97%E9%80%8F%E6%BC%8F%E6%B4%9E%E5%A4%8D%E7%9B%98-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)；[xianzhi/17139](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/17139-%E6%B7%B1%E5%BA%A6%E8%A7%A3%E6%9E%90%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F%E6%BC%8F%E6%B4%9E%E6%8C%96%E6%8E%98-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)。

## K04 请求封装成功与身份突破分开

恢复签名时核对实际参数串、排序、编码、nonce/时间及会话。签名重建后，服务端仍可能独立验证用户与手机号的绑定。

验证与反例：归档 18682 同时提及客户端常量与其失效说明；不将算法名或常量暴露直接升级为有效凭据泄露。签名失败不是授权检查通过。

来源：[xianzhi/18682](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/18682-%E7%AD%BE%E5%90%8D%E4%BB%8E%E5%93%AA%E6%9D%A5%EF%BC%9F%E5%B0%8F%E7%A8%8B%E5%BA%8F%20API%20%E8%AF%B7%E6%B1%82%E7%AD%BE%E5%90%8D%E7%9A%84%E9%80%86%E5%90%91%E4%B8%8E%E9%AA%8C%E8%AF%81-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)；[butian/2940](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/butian/2940-%E6%AD%BB%E7%A3%95%E6%9F%90%E5%B0%8F%E7%A8%8B%E5%BA%8F.md)。

## K05 从实际路由追到具体查询 API

插件路由和自定义分发需要读实际注册/重写逻辑；ORM 条件绑定与原始 select 表达式可能走不同路径。

验证与反例：检查当前重载、变量类型及绑定值，不能因为某个 ORM 方法安全就推及全部查询，也不把生成路由字典等同已覆盖。

来源：[butian/2407](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/butian/2407-%E5%9F%BA%E4%BA%8Eyii%E6%A1%86%E6%9E%B6%E7%9A%84%E7%B3%BB%E7%BB%9F%E5%AE%A1%E8%AE%A1.md)。

## K06 共享令牌失败分支

围绕输入来源覆盖、空字符串、数据库查无记录及默认布尔返回建立对照，确认“未查到”是否意外变成“允许”。

验证与反例：原文涉及历史 JimuReport 代码，具体版本和函数语义需再核对；合法共享不能被当作越权。

来源：[xianzhi/17344](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/17344-Jimureport1.7.8%E8%B6%8A%E6%9D%83%E6%BC%8F%E6%B4%9E%E4%BB%A3%E7%A0%81%E5%88%86%E6%9E%90%E5%8F%8A%E4%BF%AE%E5%A4%8D%E4%BB%A3%E7%A0%81%E5%88%86%E6%9E%90%28CVE-2024-44893%29-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)。

## K07 子任务与父对象权限分离

创建/更新时的引用存在性与执行时的父任务权限不能代替子任务授权；追踪每个对象和实际执行者。

验证与反例：使用获准无害子任务及执行日志证明。只添加了 ID 或触发入口被拒绝都不能单独说明后台结果。

来源：[xianzhi/17435](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/17435-xxl-job%E5%AD%90%E4%BB%BB%E5%8A%A1%E8%B6%8A%E6%9D%83%E6%BC%8F%E6%B4%9E%E4%BB%A3%E7%A0%81%E5%88%86%E6%9E%90%E5%8F%8A%E4%BF%AE%E5%A4%8D%E4%BB%A3%E7%A0%81%E5%88%86%E6%9E%90%28CVE-2024-42681%29-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)。

## K08 中间件与部署条件

补丁研究先定位负责鉴权的层、内部请求信号的来源及边界，然后核对部署防护和补丁是否加载。

验证与反例：Next.js 维护者公告限定中间件鉴权并说明 Vercel 部署保护。版本标签或转载的高危/DoS 描述不代表当前目标已受影响。

来源：[xianzhi/17403](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/17403-Next.js%E4%B8%AD%E9%97%B4%E4%BB%B6%E6%9D%83%E9%99%90%E7%BB%95%E8%BF%87%E6%BC%8F%E6%B4%9E%E5%88%86%E6%9E%90%EF%BC%88CVE-2025-29927%EF%BC%89-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)。

## K09 浏览器与后台渲染分离

在线编辑、后台渲染、外部资源下载与最终文档是不同阶段，分别归因到进程、任务和输出。

验证与反例：格式被保留不等于 SSRF；请求有回包不等于敏感读取。历史引擎默认值必须按实际版本/参数核对。

来源：[butian/2409](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/butian/2409-%E8%AE%B0%E4%B8%80%E6%AC%A1%E4%BB%8Exss%E5%88%B0%E4%BB%BB%E6%84%8F%E6%96%87%E4%BB%B6%E8%AF%BB%E5%8F%96.md)。

## K10 容器解包及失败后的文件状态

按 MIME/文件名解码→条目规范化→写入→内容检查→异常清理追踪副作用，补丁可帮助定位被遗漏的检查阶段。

验证与反例：压缩错误可能发生在部分落盘之后，证据用隔离目录的普通文件；不从落盘能力直接推断执行，更不写持久化目录。

来源：[xianzhi/18482](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/18482-%E5%A5%91%E7%BA%A6%E9%94%81%E7%94%B5%E5%AD%90%E7%AD%BE%E7%AB%A0%E7%B3%BB%E7%BB%9F%20pdfverifier%20%E8%BF%9C%E7%A8%8B%E4%BB%A3%E7%A0%81%E6%89%A7%E8%A1%8C%E6%BC%8F%E6%B4%9E%E5%88%86%E6%9E%90%EF%BC%88%E8%A1%A5%E4%B8%81%E5%8C%85%E9%80%86%E5%90%91%E5%88%86%E6%9E%90%EF%BC%89-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)；[xianzhi/16642](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/16642-%E5%88%A9%E7%94%A8%E8%A7%A3%E5%8E%8B%E7%BC%A9%E6%8A%A5%E9%94%99%E4%B8%AD%E6%96%AD%E7%BB%95%E8%BF%87WAF%E5%88%86%E6%9E%90-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)。

## K11 请求体编码与真实后端语义

Content-Encoding 描述表示数据的编码，可出现在请求中；目标是否解码取决于服务端配置与实现。比较原始与小型编码普通标记在同一功能的最终字段。

验证与反例：RFC 不证明某 WAF 可绕过。归档的成功率和产品列表不继承；415、空 body、忽略字段和认证失败分别处理，禁止压缩炸弹或借编码扩大预算。

来源：[xianzhi/18812](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/18812-Content-Encoding%20%E5%8D%8F%E8%AE%AE%E5%B1%82%E9%9D%A2%20WAF%20%E7%BB%95%E8%BF%87%E6%80%9D%E8%B7%AF-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)。

## K12 验证器、恢复器与依赖组合

同一格式的检查器/反汇编器/恢复器可能使用不同实现；记录库版本、str/bytes、默认后端、额外依赖和真实调用点。语义变体应保留类型与参数含义。

验证与反例：CTF 的自定义过滤器、额外 gadget 库和特殊构造不自动存在于部署。解码失败或解析差异只是一环；不安装额外依赖到目标使漏洞“成立”。

来源：[xianzhi/18669](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/18669-%E6%8E%A2%E7%A9%B6python%E4%B8%ADpickle%EF%BC%8C_pickle%E5%92%8Cpickletools%E7%9A%84%E8%A7%A3%E6%9E%90%E5%B7%AE%E5%BC%82%E9%97%AE%E9%A2%98-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)；[xianzhi/18906](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/18906-%E5%BE%81%E6%9C%8D%20JDBC%20WAF%EF%BC%9A%E4%BB%8E%E9%98%B2%E6%8A%A4%E5%88%B0%E7%BB%95%E8%BF%87%E7%9A%84%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)；[xianzhi/16098](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/16098-JsonPickle%E8%B0%83%E8%AF%95%E5%88%86%E6%9E%90%E5%8E%9F%E7%90%86%E5%8F%8AWAF%E7%BB%95%E8%BF%87-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)；[xianzhi/16133](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/16133-%E4%BB%8E%E6%BA%90%E7%A0%81%E7%9C%8BJsonPickle%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E5%88%A9%E7%94%A8%E4%B8%8E%E7%BB%95WAF-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)；[xianzhi/16117](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/16117-fastjson%E4%B9%8Bparse%E5%92%8Cparseobject%E5%88%A9%E7%94%A8%E5%B7%AE%E5%BC%82-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)。

## K13 条件差异的因果证明

当错误类别作为观察通道时，用已知普通常量的成对条件、正常基线和原始应用响应判断归因，先定位数据库与业务校验层。

验证与反例：不沿用文章的借用账号、轮换代理、封禁后继续请求或真实字段逐字取数；只有单次报错仍是线索。

来源：[butian/2996](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/butian/2996-%E3%80%90%E6%BC%8F%E6%B4%9E%E6%8C%96%E6%8E%98%E3%80%91%E8%AE%B0%E4%B8%80%E6%AC%A1985%E8%AF%81%E4%B9%A6%E7%AB%99Oracle%E6%B3%A8%E5%85%A5%E7%BB%95WAF.md)。

## K14 虚拟主机映射与资产授权

DNS 和代理虚拟主机配置可能独立变化。比较已获准地址、TLS/SNI、Host 与实际服务身份，区分预期路由和不应暴露的资源。

验证与反例：同 IP、多域名或返回默认页面不证明漏洞/资产归属；候选 Host 不扩展 Scope，禁止无依据的域名与 IP 全排列。

来源：[xianzhi/16048](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/xianzhi/16048-%E5%A6%82%E4%BD%95HOST%E7%A2%B0%E6%92%9E%E6%8C%96%E6%8E%98%E9%9A%90%E8%94%BD%E8%B5%84%E4%BA%A7-%E5%85%88%E7%9F%A5%E7%A4%BE%E5%8C%BA.md)。

## K15 CORS 中发送与读取分离

按实际浏览器观察请求是否携带凭据、是否发出、响应是否允许脚本读取，以及其中是否有受保护内容；同站与同源不能混用。

验证与反例：不继承归档中“同源策略使请求不带 Cookie”“必须 SameSite=None”等概括。结合一手文档、同站跨源条件和浏览器凭据策略逐项判断。

来源：[butian/2901](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/butian/2901-CORS%E6%BC%8F%E6%B4%9E%E5%AD%A6%E4%B9%A0.md)。

## K16 静态命中后的调用者复核

将工具给出的 source/sink 位置追到业务调用者，核对模块是否成功提取以及身份/配置约束；复用根因时保留不同入口的证据。

验证与反例：不采纳“建库成功即可忽略错误”，不把扫描器命中视为漏洞，也不直接运行归档中推荐的扫描脚本。

来源：[butian/2763](https://github.com/Huu1j/crawl_xz/blob/6496ea94f1e46d3fdfabdaeefebdf5fa03b24334/butian/2763-%E5%8D%8A%E8%87%AA%E5%8A%A8%E5%8C%96%E4%BB%A3%E7%A0%81%E5%AE%A1%E8%AE%A1%E5%AE%9E%E6%88%98.md)。

## 一手资料核对

- [Next.js 维护者公告](https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw)：中间件鉴权、部署条件与修复分支。
- [RFC 9110 §8.4](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.4)：Content-Encoding 的规范语义，不承诺实现一致。
- [wkhtmltopdf 参数说明](https://wkhtmltopdf.org/usage/wkhtmltopdf.txt)：本地文件访问参数；仍需核对部署参数。
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)：凭据请求、脚本读取与第三方 Cookie 策略。

归档不等于原作者页面已重新核验。空白 MCP/WAF/代理头文章保持 unavailable；一般 AI 内容安全建议只留参考，不因此新增“已验证 AI 漏洞”专题。
