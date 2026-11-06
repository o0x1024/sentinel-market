# postMessage 与 DOM clobbering

> **同类语料桶（非本类专属，先读再动手）**：[x-exp-xss（209 条）](../research/x-exp-xss.md)、[x-xss-1（300 条）](../research/x-xss-1.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：message 监听器、iframe 通信、HTML id/name 进入全局属性

## 检查与最小实验

postMessage 先画 sender→receiver→origin/source 校验→数据类型→sink。检查来源字符串包含/后缀匹配是否真的限制完整 origin，并在受控外源页面证明消息可到达；发送端的 targetOrigin 与接收端校验是两件事。

DOM clobbering 则追踪可控 HTML 命名属性是否改变代码读取的对象，最终是否到达敏感操作。只允许插入 HTML 但不允许脚本也值得按实际代码判断，不默认 XSS 防护已失效。

## 证据与反例

`postMessage(..., '*')` 如果内容公开、接收端校验充分，可以无敏感影响；仅存在监听器不证明利用。命名元素能覆盖一个属性也不必然到达可执行 sink。

## Agent 行为

静态分析定位路径，浏览器用无敏感标记验证消息/对象变化与最终效果；记录加载顺序、frame 关系和用户交互条件。避免把浏览器控制台手动改状态当成远程可达证明。

## 调研来源

- [PS-message · Controlling the web message source](https://portswigger.net/web-security/dom-based/controlling-the-web-message-source)
- [PS-clobber · DOM clobbering](https://portswigger.net/web-security/dom-based/dom-clobbering)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

相关语料桶（非本类专属）：[x-exp-xss（209 条）](../research/x-exp-xss.md)、[x-xss-1（300 条）](../research/x-xss-1.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
