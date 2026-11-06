# Web 缓存欺骗

> **同类语料桶（先读经验桶再动手）**：[x-exp-cache（9 条）](../research/x-exp-cache.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：动态私密页面与静态缓存规则的路径解释不一致

## 检查与最小实验

在隔离测试路径比较普通动态 URL、附加无意义后缀、带已观察分隔/规范化特征的 URL。分别确认源站映射哪个资源、缓存按什么规则存储；仅“加 .css 返回 200”不足。

用 A 的自建私密标记触发缓存，再用不携带 A 凭据的 B/匿名干净客户端请求同一测试键，核对是否读到 A 数据。另一个隔离键作控制，记录 Vary、Cookie、编码和浏览器实际 URL 序列化。

## 证据与反例

源站忽略后缀或缓存显示 HIT 只是链条中的一步。正常公开响应、身份实际串用、CDN 未缓存的源站响应都不能确认泄露。特定框架的分隔符和解码顺序不能推广到所有 CDN。

## Agent 行为

从 X 经验追溯到原研究后才挑适用分支。只使用自建数据和已证明隔离的缓存空间；随机 cache-buster 未必生效。无法隔离则在本地模型验证并保留待补证。

## 调研来源

- [PS-cache-deceive · Web cache deception](https://portswigger.net/web-security/web-cache-deception)
- [PS-cache-research · Gotta cache 'em all: bending the rules of web cache exploitation](https://portswigger.net/research/gotta-cache-em-all)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-exp-cache（9 条）](../research/x-exp-cache.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
