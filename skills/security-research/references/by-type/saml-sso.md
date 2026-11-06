# SAML SSO

> **同类语料桶（先读经验桶再动手）**：[x-auth-1（147 条）](../research/x-auth-1.md)、[x-exp-auth（279 条）](../research/x-exp-auth.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：企业 IdP/SP、SAMLResponse、Assertion 消费

## 检查与最小实验

从正常测试登录记录 IdP、SP、ACS、请求 ID、签名覆盖节点和最终使用的身份字段。先用离线 XML/验签工具追踪“被验证的节点”与“被业务消费的节点”是否同一对象。

分别核对受信 IdP 证书、Audience、Recipient/Destination、时效、重放与流程关联。对签名包装线索只使用测试断言和隔离环境，避免把重复 XML ID 当成已绕过。IdP 发起与 SP 发起模式不同，缺 InResponseTo 需要结合实际 flow。

## 证据与反例

Assertion 未单独签名不一定有问题，合法签名的整个 Response 可覆盖它；自签名 IdP 证书也不等于不可信。应证明未受信身份/属性被用于建立会话，或不应接受的断言被实际消费。

## Agent 行为

敏感断言离线处理，使用自有测试身份。需要新增 IdP、改信任或跨 SP 的动作只按现有许可执行；缺条件则记录协议线索并继续其他分支。

## 调研来源

- [OWASP-saml · SAML Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-auth-1（147 条）](../research/x-auth-1.md)、[x-exp-auth（279 条）](../research/x-exp-auth.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
