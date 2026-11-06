# 看云控股 YSRC（猿辅导系）报告处理规则摘要

- 状态: official；置信度: 高
- 来源: https://security.kanyun.com/index.php?m=&c=page&a=view&id=23（查阅于 2026-10-12）；规则版本/更新: V1.7（2026-07-28）
> 公开规则检索摘要，供选题与定级预判；非授权，不保证当前有效，提交前必须核对官方原文。
> ⚠️ 主体澄清：security.kanyun.com 是**看云控股（猿辅导系）YSRC**，不是厂商 A 云。按公司名检索时极易混淆。

## 收录范围
收录域名：zhenguanyu / yuanfudao / yuantiku / yuansouti / xiaoyuankousuan / banmaaike / ybccode / skypeople / gridcoffee / moliyuezi。
不收：classup / banmagushi / yfdsyk / banmalexue / xiaoyuansuyang / zjyuanfudao。
业务分重要/一般/边缘三级。

## 等级与奖励（猿币）
| 业务层 | 严重 | 高危 | 中危 | 低危 |
|---|---|---|---|---|
| 重要 | 6000 | 3000 | 1500 | 200 |
| 一般 | 2000 | 1000 | 500 | 50 |
| 边缘 | 600 | 300 | 50 | 20 |

## 忽略/不收项
- 隐私合规类报告不收；存储桶/CDN 域名 XSS 不收。
- 短信轰炸阈值：30 条/分钟以内不计；6 位以上验证码爆破不收。

## 测试红线
- XSS 上限按中危评估；组织内越权上限中危；SSRF 无回显上限中危。
- 同根因漏洞合并计分，上限 3 倍。

## 报告要求
按平台表单；需复现步骤与证明。

## 处理流程与时限
1 个工作日评估、3 个工作日结论；每月 1 号发放猿力币。

## 易错点
- 域名清单是白名单式：清单外资产先确认归属，勿默认可测。
- "kanyun"≠厂商 A 云（厂商 A 云为 security.kanyun.com 之外的主体），定级与奖励不可跨用。

## 来源
- [YSRC 评分标准 V1.7](https://security.kanyun.com/index.php?m=&c=page&a=view&id=23)
