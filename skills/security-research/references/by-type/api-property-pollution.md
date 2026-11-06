# API 属性授权、批量赋值与服务端参数污染

> **同类语料桶（先读经验桶再动手）**：[x-api-1（23 条）](../research/x-api-1.md)、[x-exp-api（180 条）](../research/x-exp-api.md)、[x-residual-api（4 条）](../research/x-residual-api.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：响应出现隐藏字段、复杂 JSON、BFF 转发或批量接口

## 检查与最小实验

从正常响应、客户端代码、OpenAPI 找候选属性，分清“可读”与“可写”。为自建对象建立允许字段集合；一次加入一个不应可写的属性，读取权威状态确认它被忽略、拒绝还是生效。检查父对象授权之外的敏感字段访问。

服务端参数污染先证明前端接口确实构造了另一条后端请求。对重复参数、嵌套路径或结构类型差异，用两个受控标记观察实际选择顺序；不能默认框架永远取首值或末值。若有链路日志，对比每层结构化值。

## 证据与反例

多返回一个字段可能是正常模型；未知字段被 200 接受也可能被忽略。必须对应违反规则的读/写结果。格式切换只说明不同解析路径，不自动算授权绕过。

## Agent 行为

优先补正常接口已有的字段面，不做无界字典喷洒。每个批量元素计入逻辑操作预算；独立授权判断见 [访问控制](idor-access-control.md)，过滤差异见 [WAF](waf-bypass.md)。

参数名称/位置、值与类型、重复项和有依据的字段交互，按 [定向 Fuzzing](../targeted-fuzzing.md) 生成候选并根据输入是否被消费调整下一步；未知字段返回成功不等于可写。

## 调研来源

- [OWASP-api3 · API3:2023 Broken Object Property Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/)
- [PS-api · API testing](https://portswigger.net/web-security/api-testing)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-api-1（23 条）](../research/x-api-1.md)、[x-exp-api（180 条）](../research/x-exp-api.md)、[x-residual-api（4 条）](../research/x-residual-api.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
