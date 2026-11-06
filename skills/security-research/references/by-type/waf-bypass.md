# WAF 绕过与逐层解析差异

> **同类语料桶（先读经验桶再动手）**：[x-waf-1（116 条）](../research/x-waf-1.md)、[x-exp-waf（98 条）](../research/x-exp-waf.md)、[x-residual-waf_bypass（3 条）](../research/x-residual-waf_bypass.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：已有具体漏洞假设受过滤影响，或正常流量/文档/代码/错误提示了某个可验证的接口解析差异；不作为无依据载荷扫描起点

## 先定位限制发生在哪一层

保存正常请求与被拦请求、身份、时间、响应指纹和唯一变化。先区分业务拒绝、认证失败、429、机器人挑战与内容过滤；403 或产品指纹不证明具体规则。没有漏洞证据时可先做有依据的普通标记解析观察；没有机制线索则返回正常业务/数据流分析。

画出客户端序列化→CDN/WAF→代理→框架解析→应用解码→解释器链；未知层标 unknown。Agent 提假设，工具保留原始字节和解码表示；工具自动规范化可能消灭你想测的差异。

## 按条件选择最小变体

| 机制 | 适用前提与实验设计 | 常见误判 |
|---|---|---|
| URL 规范化/编码 | 对受控普通标记先比较编码、分隔符、路径规范化；证明后端落在同一资源后，再应用原假设的最小变体。 | 假定所有层解码两次；Cloudflare 的 RFC 与额外规范化模式并不相同。 |
| 媒体类型与 body 解析 | 文档、正常流量或框架代码提示替代表示时，可先以小型普通标记测试是否支持，再对相同字段比较语义；WAFFLED 摘要支持研究解析不一致这一方向。 | 切换后返回 200 实际是忽略 body、进入错误处理或未到原功能。 |
| 重复参数/结构差异 | 用不同标记辨明网关和应用取首/末/合并/拒绝的实际行为，记录每层值；再转 API 参数污染假设。 | 默认全部框架取末值，或发送了工具自动去重后的请求。 |
| 解释器语义等价 | 数据库、模板或命令上下文已经确定；先本地证明两种表达式等价，再验证过滤层差异。 | 只绕过关键字，但后端不再执行同一含义；把历史 JVM 方法序号当稳定接口。 |
| 检查范围/大小边界 | 优先读取授权配置，核对 body/header/cookie 检查范围、超限动作和托管规则。只在允许的常规大小/次数内做有界测试。 | AWS 的检查上限随组件/宿主服务而变；Continue、Match、No match 都需结合规则动作及后续规则，不能写成“超限必放行”。 |
| 路由与源站差异 | 已获准且已知属于该项目的路由/源站才可对照；Scope 在每个目的地重新核对。 | 同 IP、历史 DNS 或 Host 变体被当作新授权；无法访问就换身份/IP 规避限制。 |

Cloudflare 和 AWS 的厂商资料用于约束假设；没有该目标配置时不假定默认值。pmnh 的历史 SpEL 案例只支持“理解实际引擎后构造语义等价表达”的方法，不能当现成通用载荷。

## 无害标记示例

下列只用于辨明解析方式，不构成漏洞载荷，也不授权发送；先匹配已授权接口与具体机制线索；格式支持未知时先验证支持情况。

| 对照 | 要回答的问题 |
|---|---|
| `term=probe-A` 与 `{"term":"probe-A"}` | 有依据的替代格式是否被同一接口处理，支持后最终字段值是否相同？ |
| `term=probe-A&term=probe-B` | 各层得到 A、B、数组还是拒绝？请求工具有没有先去重？ |
| `term=probe-A` 与 `term=%70robe-A` | 在已知 URL 编码参数位置，解码前后检查的对象是否一致？不能把它套进任意 JSON 字符串。 |
| 普通标记与 JSON 中的 `"\u0070robe-A"` | JSON 解析后是否得到同一个普通字符串？若根本不解析 JSON，过滤放行无意义。 |

先通过这些对照确定真实语义，再为原漏洞选择一个有依据变体。所有样本共享所属发现/实验及任务总预算，不为“绕过阶段”另起一套请求额度。

## 实验记录与退出

每个变体至少记录 `parent_hypothesis`（纯解析观察可为空并关联 observation_id）、改变的层/字段、原始请求引用、预期后端语义、网关结果、应用结果及剩余预算。通常先做正常基线、被拦样本和一个有依据变体；若没有新增信息，不继续组合 tamper。

“放行”只结束网关分支，漏洞确认仍按 SQLi/XSS/SSRF 等原专题标准。正常标记能到达、无敏感内容反射或网关 403 变 200，均不自动形成漏洞 Finding。保留未复现/条件不足的结果，不保证任何技巧可通用绕过。

不启用无界载荷库、不伪装身份规避限流、不为超限测试堆大请求或提高并发。[请求走私](request-smuggling.md) 属于隔离专项；不能当作普通 WAF 变体在共享生产连接执行。

## 调研来源

- [CF-normalize · How URL normalization works](https://developers.cloudflare.com/rules/normalization/how-it-works/)
- [AWS-waf · Oversize web request components in AWS WAF](https://docs.aws.amazon.com/waf/latest/developerguide/waf-oversize-request-components.html)
- [WAFFLED · WAFFLED: Exploiting Parsing Discrepancies to Bypass Web Application Firewalls](https://arxiv.org/abs/2503.10846)
- [PMNH-waf · RCE via SSTI on Spring Boot Error Page with Akamai WAF Bypass](https://www.pmnh.site/post/writeup_spring_el_waf_bypass/)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 归档案例补充：内容编码和双解析器

对有文档/流量/代码依据的 Content-Encoding，支持未知时先辨明支持情况，用小型普通标记核对压缩前后大小、媒体类型、最终解码值和同一业务路径；415、不解析 body、忽略字段分别记录。不能继承文章的产品成功率，也不构造高膨胀数据。验证器与恢复器的实现/版本/输入类型必须分别记录，CTF 额外依赖不能视为目标已有。见 [K11–K12](../research/crawl-xz-patterns.md)。

## 实战素材（未复现）

同类语料桶：[x-waf-1（116 条）](../research/x-waf-1.md)、[x-exp-waf（98 条）](../research/x-exp-waf.md)、[x-residual-waf_bypass（3 条）](../research/x-residual-waf_bypass.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
