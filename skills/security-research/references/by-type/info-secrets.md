# 信息暴露、调试资源与凭据泄露

> **同类语料桶（先读经验桶再动手）**：[x-infodisc-1（44 条）](../research/x-infodisc-1.md)、[x-exp-infoleak（13 条）](../research/x-exp-infoleak.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：JS/source map、日志、备份、构建产物或代码历史

## 检查与最小实验

从正常资源引用、获准仓库或明确备份线索定位内容，先核对所有者与数据敏感性。记录路径/commit、最小脱敏片段和指纹；源映射公开或字符串名含 secret 本身不是漏洞。

区分公开客户端标识、公钥、测试样本、已撤销凭据与有效服务端秘密。代码历史可能仍留有被删除的值；版本和提交时间与当前有效性分开记录。

数据暴露按 [业务预期判定](../business-intent.md) 核对字段含义、精度、受众与可见规则。字段名称不自动决定敏感性；预期开放的数据不直接构成泄露，实际返回超出允许范围则须独立验证。当前可访问、展示差异或历史可见性不能单独证明应公开或应保密。

## 证据与反例

敏感内容公开可独立证明泄露，不必实际使用凭据；若声称权限影响，需合法来源与明确许可的最小能力验证。GitHub validity check 可能联系签发服务，不能当作纯离线动作。

## Agent 行为

不把凭据贴到报告、第三方检测站或 shell 历史。发现疑似生产秘密时保存不可逆指纹/安全证据引用并交付，不用它接管服务或补测试账号。不要删除原始审计记录。

## 调研来源

- [GH-secrets · About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-infodisc-1（44 条）](../research/x-infodisc-1.md)、[x-exp-infoleak（13 条）](../research/x-exp-infoleak.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。

## 同类项目成交语料补充（匿名归档，未复现）

来源：[corpus-web-infoleak.md](../research/corpus-web-infoleak.md)（真实提交→审结记录，未经复现；来源已匿名，归档无忽略原因字段，勿当规则）。

- 同一形态的结论会随时间反转：内网地址类泄漏在 2022 年成批中危结算，2025 年后同类常不给等级——报前必须核对最近一年口径。
- 定级看三件事：可控范围（可列桶/可遍历 > 单文件）、身份字段齐全度（姓名/手机号/证件/工号）、凭据能否落到控制面。
- 调试端点固定检查表：`debug/pprof`、`metrics`、`nginx_status`、`actuator/*`、`druid`、`swagger|v3/api-docs`、`grafana`、`apollo`；遇 IP 白名单试 `True-Client-IP: 127.0.0.1` 类头。
- 影响量化四件套：条数、容量、字段、新鲜度；只回显路径或裸 base64、凭据外带验证均不足以作为证据。
