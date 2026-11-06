# 开放重定向与转发

> **同类语料桶（先读经验桶再动手）**：[x-exp-redirect（11 条）](../research/x-exp-redirect.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：return URL、登录后跳转、链接中转、服务端 forward

## 检查与最小实验

先区分服务端 Location、客户端导航、内部 forward。用获准受控落点检查解析后的 scheme/host/port，而非只检查文本前后缀；记录浏览器最终 URL 与全部跳转链。

只在输入验证代码或实际行为支持时，检查相对 URL、编码和多层解析差异；不要把一份历史 URL 变体表无条件跑遍目标。

## 证据与反例

页面里出现链接、被拒绝的 URL、正常允许的链接中转不等于违规重定向。若声称 OAuth 凭据泄露，要证明凭据实际到达受控落点；单纯开放跳转不自动获得该影响。

## Agent 行为

不向真实用户发送链接，不跟随到未授权站点。单项是否收录按具体 SRC 规则；风险链未验证时明确写潜在条件，见 [OAuth/OIDC](oauth-oidc.md)。

## 调研来源

- [OWASP-redirect · Unvalidated Redirects and Forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-exp-redirect（11 条）](../research/x-exp-redirect.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。

## 同类项目成交语料补充（匿名归档，未复现）

来源：[corpus-web-upload-misc.md](../research/corpus-web-upload-misc.md)（真实提交→审结记录，未经复现；来源已匿名，归档无忽略原因字段，勿当规则）。

- 该项目 URL 跳转过审率约 71%，成立的关键是接到真实链路：登录后跳转、OAuth/SSO 回调、分享链接、凭证下发。
- 纯 302 到任意外域、无敏感上下文的跳转，容易被按低价值处理。
