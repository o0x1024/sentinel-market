# LDAP / XPath 注入

> **同类语料桶（先读经验桶再动手）**：本类在 [X 语料索引](../research/x-corpus.md) 中未单独归桶，可按类名在该表检索
> 需要提升危害、判断值不值得交，或当前思路挖不动时，先读这些语料与 [成交语料索引](../research/corpus-index.md) 的过审率表，再回到下面的实验设计。

适用信号：目录检索、企业身份查询、XML 数据查询或对应错误栈

## 检查与最小实验

先确认查询语言与参数位置：LDAP 的搜索过滤器和 DN 转义不同，XPath 查询 XML 与 XXE 实体解析不同。用测试目录/测试 XML 的已知记录建立正常结果与无匹配对照。

只按已知语法选择一个影响查询结构的受控条件，与等价正常检索和不成立条件比较；错误字符只用于识别候选，不能作为最终依据。优先在匹配本地实现检查字符串拼接路径。

## 证据与反例

合法通配符搜索、目录错误和空结果不等于注入；需证明非预期查询或受控身份/数据边界改变。LDAP 返回的第一条身份可能是非测试用户，禁止用“登录到任意首条用户”的方式验证。

## Agent 行为

不做全目录/整棵 XML 树枚举，缺少安全测试数据则记录待补证。不要复制 SQL 方言或旧版语法到不同查询引擎。

## 调研来源

- [OWASP-ldap · Testing for LDAP Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Injection_Testing/06-Testing_for_LDAP_Injection)
- [OWASP-xpath · Testing for XPath Injection](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/09-Testing_for_XPath_Injection)

资料核对日期：2026-09-14。来源的证据层级与历史日期见 [来源登记](../research/sources.json)；实验安排是本 skill 的综合设计，不表示已在当前目标复现。

## 实战素材（未复现）

同类语料桶：本类在 [X 语料索引](../research/x-corpus.md) 中未单独归桶，可按类名在该表检索

贴子原文为他人自述、未经复现，只作载荷与思路线索；命中条件、影响判定与报告口径一律以本文协议为准。
