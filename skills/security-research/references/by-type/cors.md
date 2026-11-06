# CORS 跨源读取

> **同类语料桶（先读经验桶再动手）**：[x-csrf_cors-1（20 条）](../research/x-csrf_cors-1.md)、[x-exp-csrf（24 条）](../research/x-exp-csrf.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：API 返回 ACAO/ACAC 或允许不可信来源

## 检查与最小实验

先选有明确私密性要求的自建资源。检查完整 origin（协议、主机、端口）的匹配，及动态反射、后缀判断、null origin 的真实可达条件。然后从受控外源页面发起请求，在默认浏览器策略下观察 JS 能否读取私密标记。

保留预检与实际请求、cookie 策略、凭据模式和读取结果。不要关闭浏览器安全策略来制造“跨域成功”。不可信页面没有权限获得 Authorization 时，不能在手工 curl 中添加它替代攻击可行性。

## 证据与反例

`Access-Control-Allow-Origin: *` 配合凭据请求会被浏览器阻止读取，不能仅凭它和 `Access-Control-Allow-Credentials: true` 报窃取。公开 API 的跨源读取可以是设计。Vary 缺失只是缓存线索，跨用户复用需转 [缓存投毒](cache-poisoning.md) 验证。

## Agent 行为

先确认浏览器可达与身份，再解释影响；不以“响应头配置看起来宽松”代替私密数据读取。实验页面仅显示自建无敏感标记，不外传真实响应。

## 调研来源

- [PS-cors · CORS](https://portswigger.net/web-security/cors)
- [MDN-cors · Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 归档经验纠偏

跨源发送、凭据是否附带与脚本读取响应是三件事；同站不等于同源，不能把 SameSite=None 写成所有跨源证明的统一前提。使用当前浏览器实际证据及敏感内容判断，见 [K15](../research/crawl-xz-patterns.md)。

## 实战素材（未复现）

同类语料桶：[x-csrf_cors-1（20 条）](../research/x-csrf_cors-1.md)、[x-exp-csrf（24 条）](../research/x-exp-csrf.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
