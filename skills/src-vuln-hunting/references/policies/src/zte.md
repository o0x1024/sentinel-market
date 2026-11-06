# 中兴 中兴通讯 PSIRT / ZTE 白帽子奖励计划 报告处理规则摘要
- 状态: official；置信度: 中
- 来源: https://www.zte.com.cn/china/about/trust-center/ztepsirt.html（查阅于 2026-10-12）；规则版本/更新: 未标注
> 公开规则检索摘要，供选题与定级预判；非授权，不保证当前有效，提交前必须核对官方原文。

## 收录范围
- ZTE PSIRT 负责接收、处理与披露中兴通讯产品/解决方案相关安全漏洞。
- 官方设白帽子奖励计划（bug-bounty）并按对象分三类页面：产品（products）、终端产品（terminal_product）、网站（websites），对应不同收录对象。

## 等级与奖励
- 存在白帽子奖励计划（bug-bounty 三个子页面）；具体等级与奖金额度在 JS 渲染页面内，本次公开 GET 未提取到数值，需浏览器访问核对。

## 忽略/不收项
- 漏洞报告过于简单、无任何危害证明的报告：降分处理或直接忽略。

## 测试红线
- 上报的报告不得涉及知识产权问题、不得包含法律法规禁止的内容（官方页面明确要求）。

## 报告要求
- 漏洞报告需包含：详细的漏洞描述、漏洞危害证明、漏洞复现的 POC，以便快速响应。
- POC 或 Exploit 的运行结果应与报告描述一致。
- 官方提供《中兴通讯安全漏洞提交模版.docx》，按模板提交。
- 提交邮箱 psirt@zte.com.cn；提供 PGP 公钥（ZTE_PSIRT_FF095577.asc）用于加密。

## 处理流程与时限
- PSIRT 接收→确认→处理→披露流程；具体时限未在公开页面取得。

## 易错点
- bug-bounty 三个子页面（产品/终端/网站）为 JS 渲染，公开 HTML 无奖励正文，务必用浏览器打开核对各自范围与额度。
- 无 POC、无危害证明的报告会被降分或直接忽略——报告质量门槛是硬性要求。
- 使用官方提交模版与 PGP 加密，避免邮件渠道被漏处理。

## 来源
- [ZTE PSIRT 信任中心（官方）](https://www.zte.com.cn/china/about/trust-center/ztepsirt.html)
- [ZTE 白帽子奖励计划-产品（官方）](https://www.zte.com.cn/china/about/trust-center/ztepsirt/bug-bounty/products.html)
- [ZTE 白帽子奖励计划-终端产品（官方）](https://www.zte.com.cn/china/about/trust-center/ztepsirt/bug-bounty/terminal_product.html)
- [ZTE 白帽子奖励计划-网站（官方）](https://www.zte.com.cn/china/about/trust-center/ztepsirt/bug-bounty/websites.html)
