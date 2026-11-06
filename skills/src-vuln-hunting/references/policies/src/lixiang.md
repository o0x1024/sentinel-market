# 理想汽车 理想SRC 报告处理规则摘要
- 状态: unreachable（规则正文未取得）；置信度: 低
- 来源: https://security.lixiang.com/index（查阅于 2026-10-12）；规则版本/更新: 未标注
> 公开规则检索摘要，供选题与定级预判；非授权，不保证当前有效，提交前必须核对官方原文。
## 收录范围
- 未取得规则正文。官方平台在线（Next.js 站点，2026-10-12 当日仍有页面更新），导航含：提交漏洞（/submit，富文本+附件上传）、奖励标准、兑换礼品（/rewards/）、荣誉排行（/rank）。
## 等级与奖励
- 未取得。官方导航"奖励标准"指向 https://security.lixiang.com/announcements/?tab=rule。
## 忽略/不收项
- 未取得。
## 测试红线
- 未取得；按行业通行红线与平台用户协议执行。
## 报告要求
- 平台 /submit 页支持富文本描述，可插入代码块、图片、链接并拖拽上传附件。
## 处理流程与时限
- 未取得；平台含公告（/announcements/）与荣誉排行模块。
## 易错点
- 规则入口已精确定位为 /announcements/?tab=rule，但本次受单站 3 个 URL 上限限制未抓取正文；/rules 与 /reward 均为 404，勿再试这两个路径。
- 提交前必须先人工打开 /announcements/?tab=rule 核对现行奖励标准，再定级预判。
## 来源
- [理想汽车 SRC 首页](https://security.lixiang.com/index)
- [理想汽车 SRC 提交页](https://security.lixiang.com/submit)
