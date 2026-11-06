# 华为 华为安全奖励计划（华为SRC） 报告处理规则摘要
- 状态: official；置信度: 中
- 来源: https://www.huawei.com/cn/psirt/report-vulnerabilities（查阅于 2026-10-12）；规则版本/更新: 未标注
> 公开规则检索摘要，供选题与定级预判；非授权，不保证当前有效，提交前必须核对官方原文。

## 收录范围
- 华为 PSIRT 响应范围：所有与华为产品和解决方案、服务相关的漏洞和安全事件线索（华为公司对漏洞信息进行披露的唯一出口）。
- 奖励计划按产品线分设：华为终端安全奖励计划、华为终端云服务安全奖励计划、华为云漏洞奖励计划、华为终端 IoT 产品安全漏洞奖励计划（bugbounty.huawei.com 平台承载）。
- 漏洞定义：产品中可被利用、破坏完整性/可用性/机密性的安全问题；无需攻击者利用即触发的属"质量缺陷"，不算漏洞（华为保留调整定义的权利）。

## 等级与奖励
- 具体等级分档与奖金额度未在公开页面直接取得（bugbounty 平台规则在 SPA/登录态内）。
- 官方明确"为鼓励漏洞上报，华为公司制定了华为安全奖励计划"，PSIRT 渠道与 bugbounty 平台并行。

## 忽略/不收项
- 质量缺陷（非攻击者利用即触发）不属于漏洞范畴。
- 其他不收项未公开获取，需以平台内规则为准。

## 测试红线
- 漏洞与安全事件处理全程严格控制信息范围，仅在处理漏洞的相关人员之间传递。
- 请求上报者在客户获得完整解决方案前对漏洞信息保密。

## 报告要求
- 按官方模板通过 Email 提交至 psirt@huawei.com；建议使用 PGP 加密（key ID 0x0071F1F7，fingerprint 80E2 606E CF00 3E22 83EC D315 13BE 0776 0071 F1F7）。
- 邮件需提供必要支持资料：漏洞复现条件、验证代码、可疑资源 IP、可疑行为日志等。
- POC/Exploit 运行结果应与报告描述一致。

## 处理流程与时限
- 通常 24 小时内收到华为 PSIRT 电子邮件确认，并根据情况知会处理进展。
- 华为云渠道（hwssecurity@huaweicloud.com）承诺初次反馈后 1 个工作日内收到确认邮件。

## 易错点
- bugbounty.huawei.com 为 SPA，公开 HTML 无规则正文，具体奖励表需登录平台核对。
- 产品配置/补丁获取/现网修复支持类问题应走华为 TAC，不算漏洞报告。
- PSIRT（psirt@huawei.com）与 bugbounty 平台是两条并行渠道，别把产品漏洞只投到平台或只发邮件。

## 来源
- [漏洞和安全事件线索上报 - 华为PSIRT（官方）](https://www.huawei.com/cn/psirt/report-vulnerabilities)
- [华为PSIRT - 华为（官方）](https://www.huawei.com/cn/psirt)
- [华为安全奖励计划平台（官方，SPA）](https://bugbounty.huawei.com/)
- [华为云信任中心-安全漏洞奖励计划（官方）](https://www.huaweicloud.com/securecenter/security.html)
