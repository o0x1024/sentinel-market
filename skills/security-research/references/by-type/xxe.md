# XXE 与隐式 XML 入口

> **同类语料桶（先读经验桶再动手）**：[x-xxe-1（10 条）](../research/x-xxe-1.md)、[x-exp-xxe（8 条）](../research/x-exp-xxe.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：XML/SOAP、sitemap、SVG、Office 文件或 XML 中间处理

## 检查与最小实验

先证实 XML 实际被解析，以及解析发生在请求线程还是后台任务。除了显式 XML API，还检查正常导入/抓取流程中确实使用的 XML 文件；不要在所有接口强行切 XML。

使用无敏感内容的受控实体标记区分：文件被下载、实体被解析、实体内容被业务消费。外部实体、参数实体、XInclude 是不同机制，只有对应解析路径成立时才进一步核对。唯一回连应关联后台任务，排除普通抓取器。

## 证据与反例

HackerOne #312543 的历史入口是 Site Audit 下载并解析 sitemap，而非直接提交 XML 的 API；因此需要跟踪异步消费者。OAST DNS 单事件、语法报错都不能推断本地文件读取。XML 实体扩展也不自动证明 RCE。

## Agent 行为

不使用实体爆炸、超大文件或真实敏感文件外带。若任务只支持回连归因，按该能力报告；读取文件的验证需要另有获准的非敏感参照。

## 调研来源

- [PS-xxe · XXE](https://portswigger.net/web-security/xxe)
- [H1-xxe · Report #312543: XXE in Site Audit](https://hackerone.com/reports/312543)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-xxe-1（10 条）](../research/x-xxe-1.md)、[x-exp-xxe（8 条）](../research/x-exp-xxe.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
