# HackerOne 与 X 经验的采纳规则

从 x-bugbounty 材料提炼的知识已分类融入本 skill 的资产发现、业务建模、漏洞专题、源码审计与报告流程；[分类提炼](community-distillation.md) 汇总新增检查点与合并位置。使用这些知识只需读取本 skill 内的对应专题，不需要原始帖子目录、图片、OCR 或检索脚本。来源与读取范围见 [提炼来源](community-distillation-sources.json)。

X 的 #bugbounty / #infosec 是发现线索的入口，不是技术标准。引用规范说明要求、原始报告说明历史案例、研究者文章说明其方法；当前目标是否成立仍由本次实验判断。查阅日期：2026-09-14。

## 本次追溯的经验

| 线索与日期 | 核对到的原始资料 | 写入的经验与边界 |
|---|---|---|
| [X 缓存帖子，2026-08-15](https://x.com/bbr_bug/status/2088719154455126187) | [HackerOne #1096609](https://hackerone.com/reports/1096609)，2021-02-05 提交，2021-04-08 公开；完整可见时间线已读 | 缓存复现要核对编码协商和缓存键。标题写 DoS，平台最终说明为内容完整性影响、Medium 4.6；不能把转帖年份当发现年份，也不能以最初标题替代最终结论。原报告中的无限循环命令不纳入 skill。 |
| [X SpEL/WAF 帖子，2026-06-16](https://x.com/mqst_/status/2066875947077296434) | [pmnh 原文](https://www.pmnh.site/post/writeup_spring_el_waf_bypass/)，2022-12-04 | 从具体引擎和可用表达式出发做语义分析；JVM/版本/上下文决定技巧适用性。转帖不能证明 2026 年产品仍受影响，不复用危险反射调用。 |
| [X 缓存研究推荐，2024-08-22](https://x.com/albinowax/status/1826581787180478699) | [Martin Doyhenard 原研究](https://portswigger.net/research/gotta-cache-em-all)，2024-08-08 发布、2026-01-08 更新 | 分别研究源站资源映射、分隔符与缓存规范化，先证实差异再看私密响应是否跨身份复用。不能假定任意随机 query 都能隔离缓存。 |
| [X Android 工作流，2026-09-08](https://x.com/dirtycoder0124/status/2097280683924467834) | Android 官方 [exported](https://developer.android.com/privacy-and-security/risks/android-exported) 与 [deep links](https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks) | 采纳“离线筛组件→跟数据流→动态验证”思路；帖子宣传的工具未安装、未验证，exported 不等于漏洞，ADB 权限不等于普通应用权限。 |
| HackerOne 官方报告质量指南的 XXE 样本 | [#312543](https://hackerone.com/reports/312543)，2018-02-05 提交、2018-03-13 公开 | XML 入口可能在后台抓取 sitemap 的消费者；分开验证下载、解析和实际影响，保留任务关联。 |
| HackerOne 官方报告质量指南的 XSS 样本 | [#192210](https://hackerone.com/reports/192210)，2016-12-18 提交、2017-03-16 公开 | 检查表单/API 写字段差异与用户/管理视图渲染差异；平台明确说明的信任边界比“能写 HTML”的表象更关键。 |

本次未采纳只有奖金/点赞数、图片但缺少可核对方法、视频宣传而未读到过程或工具推广的帖子为技术依据。[WAFFLED](https://arxiv.org/abs/2503.10846) 仅阅读摘要，登记为 abstract_read，只用于解析差异方向；不复述成功率或宣称已复现实验。未运行来源里的 PoC，也未测试历史报告目标。

## 以后如何把经验转成 Agent 可用知识

1. 保存原帖 URL、作者、发帖时间、原报告日期和最后技术更新；读取完整披露时间线，区分提交者声称、平台确认、修复与复测。
2. 追溯作者原文/公开报告/厂商公告；访问被阻挡或仅有摘要时标明读取范围，不用搜索摘要填补过程。历史 PoC 的目标不进入当前 Scope。
3. 提取机制、前提、最小对照、确认条件、失败解释和版本依赖；把常量/目标/秘密替换为自建测试标记。先在隔离环境核对解析语义，避免照搬载荷。
4. 同一根因与相同边界合并知识，入口不同则追加覆盖维度；不因奖金高就把低证据技巧排到前面。
5. 更新对应专题及 [来源登记](sources.json)；把误判风险转成离线案例。规则/版本变化后按需复核，不预设无限自动抓取 X 或自动执行新 PoC。

机制迁移与项目复盘见 [专家式推理](../expert-reasoning.md)：保存适用前提、失败/反例和关键差异，去重转载来源；不能从公开成功案例推导命中率，也不自动将一次项目经验写入全局 skill。

## 报告迁移

遵循 [HackerOne Quality Reports](https://docs.hackerone.com/en/articles/8475116-quality-reports) 的可复核原则：必要前提、预期与实际、最小复现和影响彼此对应。SRC 的收录与评级以当前项目规则为准；历史奖金、CVSS 和 HackerOne 分类均不覆盖本项目规则。复核当前规则不等于重新请求已经存在的测试授权。

## 国内社区归档

先知/奇安信的 crawl_xz 快照按 [归档研究检索](crawl-xz-integration.md) 使用。先检索少量条目，再核对读取范围、版本与影响链；机器筛选不等于采纳，采纳机制不等于复现历史漏洞。
