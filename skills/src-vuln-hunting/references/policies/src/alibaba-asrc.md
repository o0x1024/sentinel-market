# 阿里 ASRC 报告处理规则摘要
- 状态: secondary；置信度: 中
- 来源: https://security.alibaba.com/announcement/announcement?id=80（官方公告页，SPA 无法直读正文，要点经搜索引擎摘要获得，查阅于 2026-10-12）；规则版本/更新: 未标注
> 公开规则检索摘要，供选题与定级预判；非授权，不保证当前有效，提交前必须核对官方原文。

## 收录范围
- 官方公告（id=80《情报价值计算方法/评分标准》）原文开头：评分标准仅适用于可威胁到阿里巴巴集团产品和业务相关的情报；与阿里巴巴集团完全无关的情报不计贡献值。
- 平台收录阿里集团产品/业务漏洞与情报；完整收录范围在登录后的站内规则页，公开渠道未取得。

## 等级与奖励
- 平台现行等级/贡献值/奖励矩阵未公开取得（SPA+登录墙）。
- 二手历史资料（2015，已过时仅作参考）：ASRC 单个漏洞最高奖励曾为 10 万元。
- 专项参考——fastjson VRP（阿里官方 GitHub，仅适用于 fastjson 项目）：仅接受技术漏洞并评级；可直接导致严重问题的每个漏洞奖励 7000 元；存在限制或需特殊环境利用的给 700-5600 元；仅特定环境可利用的可能收纳但不给奖励或直接忽略。

## 忽略/不收项
- fastjson VRP 明确不收（专项）：影响过时浏览器/平台的漏洞、Self-XSS、会话固定、内容欺骗、缺少 cookie 标记、混合内容警告、SSL/TLS 问题、Clickjacking、基于 Flash 的漏洞、RFD、物理或社工攻击、未验证的自动化工具/扫描器结果、登录/注销/未认证/低影响 CSRF、需 MITM 或物理访问的攻击、与网络协议或行业标准相关的问题、不能用于直接攻击的错误信息泄露、缺少安全相关 HTTP 头等。
- 平台级忽略清单未公开取得。

## 测试红线
- fastjson VRP 条款（专项）：上报者同意与 ASRC 独家合作完成所提交漏洞，不向任何第三方披露漏洞信息；修复前不得直接提交 GitHub issue 或在社区讨论。
- 平台级测试红线未公开取得。

## 报告要求
- 同一漏洞多人报告时，奖励给第一个完成合格报告（Qualified Reporting）的人；奖励与声誉积分仅提供给只向 ASRC 提交的上报者。

## 处理流程与时限
- 未公开取得（站内公告 id=80 为《情报价值计算方法》，完整流程需登录查看）。

## 易错点
- security.alibaba.com 为 React SPA，公告/规则页直接 GET 只返回空壳，公开检索只能拿到片段；定级与奖励务必登录站内核对。
- 不要把 fastjson 专项 VRP 当作 ASRC 全平台规则使用。
- 与阿里业务完全无关的"情报"不计贡献值，选题前先确认资产归属。

## 来源
- [ASRC 官方公告：情报价值计算方法（id=80，SPA 页）](https://security.alibaba.com/announcement/announcement?id=80)
- [alibaba/fastjson Vulnerability Reward Program（阿里官方 GitHub）](https://github.com/alibaba/fastjson/security)
- [国内漏洞奖励计划大盘点（TSRC 博客，2015 历史资料）](https://security.tencent.com/index.php/blog/msg/80)
