# Host 与代理头信任

> **同类语料桶（非本类专属，先读再动手）**：[x-recovered-header（20 条）](../research/x-recovered-header.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：绝对链接、密码重置链接、虚拟主机、代理转发

## 检查与最小实验

固定获准目标连接，记录 TLS SNI、Host/:authority 与代理头各自角色；从实际流量/配置选择候选头，逐项用受控标记比较 URL 生成和后端路由。

密码重置场景仅给自建邮箱触发一次获准流程，检查生成链接是否带敏感令牌及落点。缓存场景转专门手册；不要在普通测试里制造重复 framing 头或 desync。

## 证据与反例

Host 被反射到无敏感文本不等于账号接管；外部 Location、重置链接污染和缓存跨请求复用是不同影响。虚拟主机正常选择也不证明内部服务越权。

## Agent 行为

不要因共用 IP 就测试未知租户；代理头或 Host 改动不能扩大 Scope。保存原始目标/头值与实际落点，报告只到已验证边界。

## 调研来源

- [PS-host · HTTP Host header attacks](https://portswigger.net/web-security/host-header)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 归档案例补充：范围与服务身份

Host/SNI/连接地址及应用资源可能指向不同边界，先逐一核对授权及服务身份。代理正常路由不是漏洞；不从历史 DNS 或共享 IP 派生无限组合请求。见 [K14](../research/crawl-xz-patterns.md)。

## 实战素材（未复现）

相关语料桶（非本类专属）：[x-recovered-header（20 条）](../research/x-recovered-header.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
