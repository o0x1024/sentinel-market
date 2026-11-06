# 浏览器输入与脚本执行

> **同类语料桶（先读经验桶再动手）**：[x-xss-1（300 条）](../research/x-xss-1.md)、[x-xss-2（300 条）](../research/x-xss-2.md)、[x-xss-3（266 条）](../research/x-xss-3.md)、[x-exp-xss（209 条）](../research/x-exp-xss.md)、[x-residual-xss（111 条）](../research/x-residual-xss.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

## 适用信号与前提

搜索/评论/昵称/上传内容进入 HTML、属性、JS 或 DOM。先记录输入来源、输出上下文、编码和浏览器路径；准备获准测试页面/账号，避免触发真实用户或管理员会话。

## 最小实验

先用唯一无害字符串跟踪输入到输出位置；根据实际上下文设计仅显示测试标记的证明，不读取 Cookie 或业务数据。HTML 文本反射、属性、脚本字符串和 DOM sink 分别分析，不能通用替换。

DOM 场景追踪 source 到实际 sink，保存浏览器运行证据。存储场景需记录写入、存储和后续触发；涉及跨账号影响时使用另一自建测试账号。通过同源测试标记或受控页面状态证明执行即可。

## 确认与反例

需要浏览器在不应执行的目标上下文实际运行测试内容。字符串反射、出现 script 标签、静态 sink 搜索都不是充分证据。区分 HTML 注入、URL 导航、模板表达式与真正脚本执行。

排除已正确转义、不可达代码、sandbox/不同 origin、有效 CSP 阻断、只能本人控制开发者工具的 Self-XSS。CSP 中出现 unsafe-inline/unsafe-eval 不单独证明可利用；结合完整策略和执行路径判断。

## 下一步、停止与报告

规则阻断时记录该条件下未复现；新上下文需新假设。不得为证明影响窃取 Token、诱导真实用户、钓鱼或制造传播。存储测试使用自建隔离资源，按许可清理。

报告记录输入到输出链、浏览器/版本、执行 origin、触发角色、交互条件及证据。类型名称不直接决定等级。遵守 [验证](../verification.md)。

## 调研补充：可执行检查点

- 先用唯一无害标记定位输出上下文，再选择该上下文的最小执行证明；HTML 反射、编码文本和模板表达式不是同一类证据。
- 建立输入面→存储字段→渲染角色链：正常表单、API、导入可能写不同字段；用户视图、管理视图的处理也可能不同。只在受控查看者验证。
- 静态 JS 找 source/sink，浏览器核对实际可达路径；CSP、沙箱、Trusted Types 和交互条件都记入结果。不得从关键词扫描推断执行。
- HackerOne #192210 的平台说明把实际边界定位到管理端渲染；“商店允许 HTML”不能直接推广为后台也允许。这是入口/渲染面差异的历史样本。

客户端消息与命名属性转 [postMessage / DOM clobbering](dom-messaging.md)。

## 调研来源

- [PS-xss · Cross-site scripting](https://portswigger.net/web-security/cross-site-scripting)
- [H1-xss · Report #192210: Stored XSS in blog comments through Shopify API](https://hackerone.com/reports/192210)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 归档案例补充：导出消费者

同一输入可能进入浏览器预览和服务端文档消费者，分别确认执行位置及权限。PDF 排版变化不等于 XSS→SSRF→文件读取链已成立，见 [文档处理](document-rendering.md)。

## 实战素材（未复现）

同类语料桶：[x-xss-1（300 条）](../research/x-xss-1.md)、[x-xss-2（300 条）](../research/x-xss-2.md)、[x-xss-3（266 条）](../research/x-xss-3.md)、[x-exp-xss（209 条）](../research/x-exp-xss.md)、[x-residual-xss（111 条）](../research/x-residual-xss.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。

## 同类项目成交语料补充（匿名归档，未复现）

来源：[corpus-web-xss.md](../research/corpus-web-xss.md)（真实提交→审结记录，未经复现；来源已匿名，归档无忽略原因字段，勿当规则）。

- "名称型元数据"是最高产注入点：文件名/文件夹名、标签名、筛选条件名、角色名、字段名、单据备注名，一处注入多页渲染。
- "管理员写入 → 全员消费"（banner、推荐应用、工作台组件、开放平台群发）比"用户写 → 管理员看"更稳定，无需社工管理员。
- 修复常按字段打补丁，复测须回到同一 sink 的另一个入口，而不是只重放旧载荷。
- 同 sink 多字段拆分提交、上传点跨模块批量铺开，是该项目"已忽略"最集中的形态（原因未知，仅作提交策略风险提示）。
