# 服务端模板与表达式注入

> **同类语料桶（先读经验桶再动手）**：[x-ssti-1（22 条）](../research/x-ssti-1.md)
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：预览、邮件模板、报表、错误页或服务端表达式

## 检查与最小实验

先区分模板源码拼接与模板变量数据。用不触及文件、网络或状态的成对常量表达式确认解释行为，并对比原始 HTTP 响应与浏览器 DOM，排除客户端模板执行。

识别模板引擎、表达式上下文和允许的能力；不同引擎共有算术语法，单一计算结果不足以指纹识别。错误页等非主流程也可能使用不同模板/过滤策略。

## 证据与反例

模板计算成立可记录表达式注入；RCE 需要另外证明执行边界。用户获准编辑模板的产品功能也需要再明确受限能力。历史 pmnh 案例依赖具体 SpEL/JVM 上下文，不是通用 Spring Boot 绕过。

## Agent 行为

只在有依据的引擎分支继续，优先本地隔离验证；不自动遍历反射方法或加载通用执行链。受 WAF 拦截时读 [解析差异](waf-bypass.md)，保留已证明的低阶能力。

## 调研来源

- [PS-ssti · Server-side template injection](https://portswigger.net/web-security/server-side-template-injection)
- [PMNH-waf · RCE via SSTI on Spring Boot Error Page with Akamai WAF Bypass](https://www.pmnh.site/post/writeup_spring_el_waf_bypass/)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：[x-ssti-1（22 条）](../research/x-ssti-1.md)

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
