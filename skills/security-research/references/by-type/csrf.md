# CSRF

> **同类语料桶（先读经验桶再动手）**：[x-csrf_cors-1（20 条）](../research/x-csrf_cors-1.md)、[x-exp-csrf（24 条）](../research/x-exp-csrf.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：依赖浏览器自动附带身份的状态操作

## 检查与最小实验

先确认操作、自动凭据、攻击者可构造的字段三项条件。用受控跨站页面触发一次获准的可逆测试操作，同时记录浏览器实际请求与服务端前后状态。分别看缺失/错误/另一测试会话的 token 是否被拒绝，以及方法或服务端接受的媒体类型变化是否走了不同防护路径。

SameSite 的 site 与 origin 不同；用真实浏览器记录 cookie 是否发送、Origin/Referer 与预检。Bearer 令牌若无法由攻击页获得，也非浏览器自动发送，不能手工在重放工具里补上后宣称 CSRF。

## 证据与反例

确认的是被禁止的跨站状态变化；缺 token、能发请求、读不到响应都不是单独结论。CORS 拒绝读取并不保证动作未执行。排除重新认证、SameSite、Origin 校验和幂等操作；允许的跨站工作流不是缺陷。

## Agent 行为

浏览器完成请求可行性验证，工具读取权威状态；只使用测试账号并及时恢复。登录 CSRF 与账户绑定场景还需核对最终身份，见 [OAuth/OIDC](oauth-oidc.md)。

## 调研来源

- [PS-csrf · CSRF](https://portswigger.net/web-security/csrf)
- [MDN-cors · Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-csrf_cors-1（20 条）](../research/x-csrf_cors-1.md)、[x-exp-csrf（24 条）](../research/x-exp-csrf.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。

## 同类项目成交语料补充（匿名归档，未复现）

来源：[corpus-web-upload-misc.md](../research/corpus-web-upload-misc.md)（真实提交→审结记录，未经复现；来源已匿名，归档无忽略原因字段，勿当规则）。

- 写类型 CSRF（78.8%）明显高于读类型：优先找能改变账号/权限/资金状态的接口。
- 读类型需证明可跨源取得具体数据，仅"请求成功"不足。
