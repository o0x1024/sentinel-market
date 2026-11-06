# postMessage 与 DOM clobbering

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
