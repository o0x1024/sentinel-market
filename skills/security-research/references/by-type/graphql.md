# GraphQL

> **同类语料桶（先读经验桶再动手）**：[x-api-1（23 条）](../research/x-api-1.md)、[x-exp-api（180 条）](../research/x-exp-api.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：query/mutation/subscription、schema 或 GraphQL 正常流量

## 检查与最小实验

优先读取已有客户端操作与可用 schema，按 Query/Mutation、对象、字段和 resolver 建图。schema discovery 与权限测试分开；关闭 introspection 后仍可能从正常操作得到接口信息。

用两个自建对象检查直接 node 查询、嵌套关系和 mutation 返回字段是否一致授权；顶层接口通过认证不表示每个 resolver 已授权。HTTP 200 仍需检查 `errors`、部分 `data` 和具体字段。

别名或批量会让单个 HTTP 请求包含多次逻辑操作：同时计请求数和 resolver/业务动作数。只在明确预算内用最小样本检查逐操作控制，不进行深度/宽度耗尽或密码猜测。

## 证据与反例

introspection、字段建议、GraphiQL 可见只说明可发现性；公共 schema 不直接泄密。确认需要受限制数据或状态实际暴露/改变。客户端缓存和旧变量必须排除。

## Agent 行为

保存 operationName、查询指纹、变量归属与字段路径；只加载当前 resolver 相关 schema，避免整份模型充斥上下文。

## 调研来源

- [PS-graphql · GraphQL API vulnerabilities](https://portswigger.net/web-security/graphql)
- [OWASP-api3 · API3:2023 Broken Object Property Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-api-1（23 条）](../research/x-api-1.md)、[x-exp-api（180 条）](../research/x-exp-api.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
