# HTTP 请求走私与 desync

> **同类语料桶（先读经验桶再动手）**：[x-smuggling-1（10 条）](../research/x-smuggling-1.md)、[x-exp-smuggling（6 条）](../research/x-exp-smuggling.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：前后端协议转换、请求边界解析差异、连接复用

## 检查与最小实验

先从配置、日志和正常流量确认协议链：客户端 HTTP/2 不代表后端也使用 HTTP/2。请求字节长度、重复 framing 头、协议降级和连接复用交由能够保留原始字节的专用工具记录。

本通用线上流程只收集线索。主动 framing 实验需要明确授权的隔离环境和专用计划，确保后端连接、缓存和请求队列均不与真实用户共享；前端单独 TCP 连接并不能保证这些条件。

在隔离环境用可关联的两个自建请求和服务端逐跳日志确认前后端对边界/归属的分歧，并有规范请求作对照。不要从普通 HTTP 客户端自动修正后的请求推断原始 framing 已发出。

## 证据与反例

超时、400、连接重置和扫描器告警只是线索；必须排除网络重试/排队。HTTP/2、CDN 或某版本存在都不能单独证明有或无 desync。

## Agent 行为

不在共享生产连接注入后续请求，不拦截他人流量或制造响应队列污染。已授权隔离条件齐备时按计划执行，无需重复审批；否则暂停该分支而继续其他类型。

## 调研来源

- [PS-desync · HTTP request smuggling](https://portswigger.net/web-security/request-smuggling)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-smuggling-1（10 条）](../research/x-smuggling-1.md)、[x-exp-smuggling（6 条）](../research/x-exp-smuggling.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
