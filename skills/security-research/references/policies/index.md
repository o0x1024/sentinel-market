# 项目规则库（SRC / 众测 / Bug Bounty）

> 用途：本项目所有项目规则的唯一入口。先读本文件定位项目，再读对应规则文件；同一项目既有深度规则又有摘要时，以深度规则为准。
> **非授权文件**：索引与摘要不构成测试授权，也不保证规则当前有效；任何测试前必须按官方原文与项目授权流程核对。

> 状态图例：`official`=官方页面直接取得规则；`secondary`=官方不可达、来自可靠二手；`unreachable`=官方与二手均不可得（存根，规则未取得）。

> 查阅日期：2026-10-12。SRC 规则变动频繁（版本、暂停收录、专项排除常见），提交前必须核对官方原文。

## 目录里有什么

- **深度规则文件**（逐条整理官方条款；命中项目时优先于摘要）：[小米 MiSRC](xiaomi-misrc.md)、[贝壳 BKSRC](beike-bksrc.md)、[京东 JSRC](jd-jsrc.md)。[规则样例对照](src-policy-examples.md) 只是历史文章摘录，仅供比对，不启用。
- **公开规则摘要**：其余 `<平台id>.md`，共 130 份，每份含收录范围 / 等级与奖励 / 忽略不收项 / 测试红线 / 报告要求 / 处理流程与时限 / 易错点 / 来源。
- **补充全文**：[SRC 行业安全测试规范](industry-testing-standard.md)（14 条，多家 SRC 联合签署）、[字节跳动规则全文 V6](bytedance-v6-fulltext.md)。

## 覆盖统计

- 摘要共 **130** 份（129 家平台 + 跨平台规范）：official 72 · secondary 30 · unreachable 28
- 下方表格只列这 130 份摘要；深度规则文件与补充全文见上一节，不重复进表。

## 头部大厂

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [tencent-tsrc](tencent-tsrc.md) | 腾讯TSRC | https://security.tencent.com/ | official | 新版《TSRC漏洞处理和评分标准》2020-05-21实施(TPSA20-18) | 1贡献值=1安全币=5元；核心产品严重漏洞现金12870~14300元；质量奖最高5000元；严重额外奖上不封顶 |
| [alibaba-asrc](alibaba-asrc.md) | 阿里ASRC | https://security.alibaba.com/ | secondary | 未标注 | 官方公告为SPA仅获摘要：评分仅适用于威胁阿里业务的情报；fastjson专项严重7000元/个且要求独家保密 |
| [antgroup](antgroup.md) | 蚂蚁AntSRC | https://security.alipay.com/ | secondary | 未标注 | SPA+登录墙，公开仅2017年AFSRC上线资料（蚂蚁金币/荣誉/特别奖励），现行规则未公开 |
| [baidu-bsrc](baidu-bsrc.md) | 百度BSRC | https://bsrc.baidu.com/ | unreachable | 未标注 | 官网可达但规则在新版SPA/登录后；仅确认收录百度产品线漏洞、Coins积分礼品制 |
| [bytedance](bytedance.md) | 字节跳动SRC | https://security.bytedance.com/ | official | 未标注（页面2025-12更新） | 官方/src/页宣称单个漏洞累计最高20万元+贡献值成长体系；评级与暂不收取范围需站内核对 |
| [meituan](meituan.md) | 美团MTSRC | https://security.meituan.com/ | unreachable | 未标注 | Vue SPA规则不可直读；官方meta确认收录漏洞+威胁情报；邮箱security@meituan.com；有奖励翻倍活动史 |
| [qihoo360](qihoo360.md) | 360SRC | https://security.360.cn/ | official | 官网提及《标准V2.0(试行)》 | 官方FAQ：1个工作日进验证；Web严重12h/高危2d/中危2d/低危5d修复；月结；质量占比最大、高质量上不封顶 |
| [netease](netease.md) | 网易NSRC | https://aq.163.com/ | secondary | 安全报告处理说明V9.0（UU页2026引用） | 中心站为Nuxt壳；UU远程专项严重10万/高危5万/中危3000/低危300元；同漏洞取最早、同源计一个 |
| [kuaishou](kuaishou.md) | 快手KSRC | https://security.kuaishou.com/ | secondary | 《漏洞评分标准V4.0正式版》（官网索引名） | 官网拒非浏览器连接；索引摘要见小红花兑换礼品、K-Star白帽奖励计划、SSRF测试说明、sec@kuaishou |
| [bilibili](bilibili.md) | 哔哩哔哩BILISRC | https://security.bilibili.com/ | secondary | BILISRC漏洞处理和评分标准V1.7（对照V1.2） | 官方PDF直连被拒但内容被索引：严重9~10经验/1000~1200安全币、高危300~600、中危30~100；情报L1~L4按完整度C1~C4打折 |

## 手机硬件厂商

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [huawei](huawei.md) | 华为安全奖励计划（华为SRC） | https://bugbounty.huawei.com/ | official | 未标注 | PSIRT 渠道 24 小时内邮件确认、PGP 加密、客户获得完整方案前保密；bugbounty 平台奖励表需登录核对 |
| [oppo](oppo.md) | OPPO安全应急响应中心（OSRC） | https://security.oppo.com/cn/ | official | 未标注 | 积分商城制（现金/实物兑换需实名）；收录范围与评分标准在 SPA/登录态内，公开页拿不到 |
| [vivo](vivo.md) | vivo安全应急响应中心（vivoSRC） | https://security.vivo.com.cn/ | official | 漏洞处理流程 v1.4（2019-12-24） | 官方 PDF：1 积分=1 元、每月第一周结算（≤20 个工作日）、边缘业务降级、修复前公开不予奖励并追责 |
| [honor](honor.md) | 荣耀安全应急响应中心（荣耀SRC） | https://security.hihonor.com/src/ | official | 奖励计划 2021-10-15 上线 | security@honor.com + PGP（0x1A1850D6），2 个工作日内确认，四步流程（提交→验证→修复→披露），关闭前禁止公开 |
| [meizu](meizu.md) | 魅族安全中心（MZSRC） | https://sec.meizu.com/ | secondary | 评分标准 V1.2.2（2020-11-23） | 本网络 DNS 不可达，规则经搜索快照取得；存在"不再收取（酌情收取）"清单，提交前必核对 |
| [zte](zte.md) | 中兴通讯 PSIRT / 白帽子奖励计划 | https://www.zte.com.cn/china/about/trust-center/ztepsirt.html | official | 未标注 | 报告必须有描述+危害证明+POC，否则降分或忽略；赏金分产品/终端/网站三类页面（JS 渲染需浏览器核对） |
| [lenovo](lenovo.md) | 联想集团安全应急响应中心（LSRC） | http://lsrc.lenovo.com/ | official | 未标注 | 漏洞盒子托管；厂商侧 CVSS3.1 四级+CVD 协调披露，平台层有赛季奖金池；LSRC 专属奖励需登录平台核对 |
| [dji](dji.md) | 大疆安全应急响应中心（DSRC/DBBP） | https://security.dji.com/ | official | 测试行为规范 2026-08-31；DBBP26-08 2026-08 | 红线最明确：最小必要+数据不落地，禁批量拉取/撞库/爆破，违者取消资格并可能追责；活动期奖励 1.5/1.75/2 倍 |
| [hikvision](hikvision.md) | 海康威视安全应急响应中心（HSRC） | https://www.hikvision.com/cn/support/CybersecurityCenter/ | official | 未标注 | HSRC@hikvision.com 邮件渠道，CVSSv3.1 Base+Temporal 评分，按"安全漏洞评价标准"回馈；主入口会被 WAF 403 |
| [ezviz](ezviz.md) | 萤石安全响应中心（YSRC） | https://ysrc.ys7.com/ | official | 未标注（最新公告 2026-05-08） | 时限最量化：1 个工作日确认、3 个工作日结论，修复严重 24h/中危 3 天/低危 7 天；奖励走漏洞盒子 |

## 汽车出行

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [nio](nio.md) | 蔚来 NIO SRC | https://niosrc.bugbank.cn/ | official | 未标注 | 官方政策页：平台提交+核实后奖励；严禁未授权第三方披露与业务影响，分值在平台内 |
| [lixiang](lixiang.md) | 理想汽车 SRC | https://security.lixiang.com/index | unreachable | 未标注 | 平台在线且导航明示规则入口，受3URL上限未取正文；/rules与/reward均404 |
| [xiaopeng](xiaopeng.md) | 小鹏汽车 SRC | https://security.xiaopeng.com/ | secondary | 未标注（2025-12活动公告） | 官方站在线规则需登录；二手仅活动范围（4域名，sip仅收RCE/SSRF）与2倍奖励 |
| [avatr](avatr.md) | 阿维塔 | https://security.avatr.com/ | unreachable | - | 域名不解析且两轮搜索无果，疑似无公开独立SRC |
| [didi](didi.md) | 滴滴 DSRC | https://sec.didichuxing.com/ | secondary | 据百科引述：处理规则V4.0(2019-07-11)/奖励规范V8.0(2025-06-05) | 平台在线规则需登录；激励体系含日常/季度/年度/优质报告奖励，旧V4.0分值勿引用 |
| [t3go](t3go.md) | T3出行 SRC | https://security.t3go.cn/ | secondary | 未标注 | Vue SPA规则未公开；邮箱t3src@t3go.cn，礼品兑换制 |
| [saicmobility](saicmobility.md) | 享道出行 XDSRC | https://src.saicmobility.com/ | secondary | V1.0（2019，二手引述） | .com域名DNS失效，.cn可解析但访问超时；金币制礼品兑换，规则年代久远 |
| [hellobike](hellobike.md) | 哈啰 HSRC | https://src.hellobike.com/ | unreachable | 未标注 | 平台在线（React SPA）但规则经登录接口加载，公开无规则文本 |
| [dida](dida.md) | 嘀嗒出行（补天专属SRC） | https://dida.butian.net/ | secondary | 未标注 | 补天流程适用：初审约1工作日+厂商复审一周（超时自动通过），专属奖金表未公开 |
| [unitree](unitree.md) | 宇树 USRC | https://security.unitree.com/ | official | 未标注 | 官方前端内置完整评级：WEB致命¥7000-35000、产品设备致命¥36000-220000、感谢级0 |

## 电商零售

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [vip](vip.md) | 唯品会安全应急响应中心（VSRC） | https://sec.vip.com/ | unreachable | 未标注 | 官方站直连两次被对端关闭（含UA重试），仅搜索快照确认提交渠道（平台在线提交+邮箱sec@vipshop.com），规则正文未取得 |
| [suning](suning.md) | 苏宁安全应急响应中心（SSRC） | https://security.suning.com/ssrc-web/index.jsp | secondary | 漏洞管理规范V2.0（全文未公开） | 全站302跳统一登录；规则经官方页搜索快照取得：修复前禁止公开传播、按规范V2.0定期反馈、积分制2026年仍活跃 |
| [pinduoduo](pinduoduo.md) | 拼多多安全应急响应中心 | https://security.pinduoduo.com/ | unreachable | 未标注 | 直连被关闭且搜索无规则收录，公开渠道基本为零，需登录或官方渠道确认入口 |
| [xiaohongshu](xiaohongshu.md) | 小红书安全响应中心 | https://security.xiaohongshu.com/ | secondary | 漏洞报告处置规则V2.0（2025-06-11） | 直连被重置；官方公告页经搜索快照取得：每月20日左右发放上月兑换奖励、忽略必给理由、争议走security@邮箱、停服期高危走sec@邮箱 |
| [dewu](dewu.md) | 得物安全应急响应中心 | https://security.dewu.com/ | secondary | 未标注（白皮书无日期） | SRC站直连关闭；官方白皮书确认开放SRC+7×24响应；App七类环境检测（root/hook/模拟器/多开/代理/调试/二次打包）是事实测试红线 |
| [zhuanzhuan](zhuanzhuan.md) | 转转安全应急响应中心（疑似下线） | https://security.zhuanzhuan.com/ | unreachable | 未标注 | 域名DNS已不解析；58SRC官网明示覆盖关联公司含转转，转转业务漏洞可走58SRC提交 |
| [58](58.md) | 58安全应急响应中心（58SRC） | https://security.58.com/ | official | 未标注（细则在登录态） | 官方首页直接取得：收录58集团及关联公司（赶集/安居客/转转/驾考宝典等），礼品页反推1金币≈10元；评分细则与服务协议在登录墙后 |
| [youzan](youzan.md) | 有赞安全应急响应中心（YZSRC） | https://src.youzan.com/ | official | 外部威胁报告处理标准V2.3.1（2026-07-01实施） | 官方全文：1安全币=1元、信息泄露高危需≥3元组且>1万条、isv三方只收高危以上；2026-09-01起暂停收录新漏洞 |
| [mogu](mogu.md) | 蘑菇街安全应急响应中心 | https://security.mogu.com/ | unreachable | 未标注 | 直连被对端关闭，搜索无现行规则；仅历史证据（2019年《SRC行业安全测试规范》参与方），平台活跃度存疑 |
| [dmall](dmall.md) | 多点安全应急响应中心（DMSRC） | https://src.dmall.com/ | official | DMSRC安全测试规范与用户协议（未标注版本）+暂停公告DMSRC-PAUSE-2026（2026-10-08） | 官方全文：数据获取≤10组、违规1次取消当次奖励、累计3次或影响业务追回全部奖励；2026-10-08 15:00起暂停接收新增漏洞 |

## 旅游酒店出行

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [ctrip](ctrip.md) | 携程安全应急响应中心（CSRC） | https://sec.ctrip.com/ | official | 漏洞评分标准和奖励细则V8.1（CSRC-2026-0915，2026-09-15） | 1携程币=1元、命令执行严重核心11000；样本≤5条且严重需姓名+手机号+身份证组合；去哪儿单一因子越权暂停接收 |
| [ly](ly.md) | 同程旅行安全应急响应中心（LYSRC） | https://sec.ly.com/ | official | 同程旅行外部威胁处理规则V2.2；暂停接收公告2026-09-14生效 | 1积分=1安全币=10元（非1元）；2026-09-14起暂停接收新增漏洞，暂停期任何测试均属未授权 |
| [qunar](qunar.md) | 去哪儿安全应急响应中心（QSRC） | https://security.qunar.com/ | official | QSRC-2013-10漏洞评分标准（2013-10-13，正文JS动态未取得） | 官网陈旧仅首页可得提交方式（security@qunar.com）；同集团携程CSRC V8.0曾明确覆盖*.qunar.com |
| [tuniu](tuniu.md) | 途牛安全应急响应中心（TNSRC） | https://sec.tuniu.com/ | official | 漏洞评分标准和处理流程更新公告（2026-09-23，旧版即失效） | 核心/主要/边缘三档分值表（核心严重220-360）；工作日当天或次日审核；争议邮箱sec@tuniu.com |
| [mafengwo](mafengwo.md) | 马蜂窝安全应急响应中心（MFSRC） | https://security.mafengwo.cn/ | official | 马蜂SRC漏洞评分标准及奖励规则v1.0（生效2019-07-15） | 等级为分值段高危11-15/中危6-10/低危1-5；仅收*.mafengwo.cn；多平台刷奖励直接封号 |
| [huazhu](huazhu.md) | 华住安全响应中心（HSRC） | https://sec.huazhu.com/ | official | [20260930]关于规范AI辅助漏洞测试行为的公告（2026-09-30生效）；评分标准V0.2未公开 | 2026年新成文红线：AI/自动化扫描未书面报备即违规；严禁上传源代码密钥到外部AI平台；违规最高永久封禁+追回奖励 |
| [ceair](ceair.md) | 东航网络安全应急响应中心 | https://src.ceair.com/ | unreachable | 未标注 | src.ceair.com与security.ceair.com DNS均不解析，搜索仅有导航站名称收录，规则文本零公开，已建存根 |
| [guazi](guazi.md) | 瓜子安全应急响应中心（GZSRC） | https://security.guazi.com/home | secondary | 外部漏洞奖励规则V1.0（漏洞盒子转载，无日期） | 官方站DNS不解析；仅收*.guazi.com/*.maodou.com、CVSS3.0、1积分=1元；泄密撤回所有奖励 |
| [tuhu](tuhu.md) | 途虎安全应急响应中心（THSRC） | https://security.tuhu.cn/ | secondary | THSRC漏洞处理和评分标准V3.0（TH2023-001，奖励自2023-01-06） | 官方站直连3次被关闭、正文经搜索索引取得；1安全币=1元、严重核心4000-5000；前员工永久禁入；2026年8月曾维护暂停接收 |
| [mcd](mcd.md) | 麦当劳中国安全应急响应中心（MCDSRC） | https://security.mcd.cn/ | official | MCDSRC漏洞处理和评分标准（MCDSRC2022-2，标注2024-10-17）；AI规范MCDSRC2026-2（2026-09-02） | 严重核心2000-5000安全币；3个工作日内给结论最长10个工作日；未人工验证的AI报告累计5个拉黑账号 |

## 物流·招聘·企业服务

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [sf](sf.md) | 顺丰SFSRC | https://sfsrc.sf-express.com/ | secondary | 《SFSRC安全漏洞评分标准V6.2》2024/11/19；情报标准V3.0 2025/08/16；收录资产实时更新 | 官网SPA；快照显示税后现金奖励、积分:人民币=1:30、谴责恐吓/勒索；资产清单实时更新需站内核对 |
| [cainiao](cainiao.md) | 菜鸟安全应急响应中心 | https://sec.cainiao.com/ | unreachable | 未标注 | 官网域名无法解析；仅2017年"单个漏洞最高10万"历史活动与菜鸟官网合规页（cn-sc@cainiao.com）线索，现行规则不可得 |
| [zto](zto.md) | 中通ZSRC | https://sec.zto.com/home | secondary | 漏洞评分标准V4.1（2024-12-26）；V4.0 2024-10-24；V3.2 2023-01-03 | 官网SPA；严重/高/中/低/无五级+礼品或现金奖励；2026-09-11起暂停接收子公司中低危漏洞 |
| [huolala](huolala.md) | 货拉拉LLSRC | https://llsrc.huolala.cn/ | secondary | 《漏洞处理和评分标准》V5.0（官方活动引用）；历史V2.1 | 官网SPA；V5.0与《LLSRC测试规范》需站内阅读；邮箱llsrc@huolala.cn；等级/金额未公开 |
| [zhipin](zhipin.md) | BOSS直聘BSSRC | https://src.zhipin.com/（DNS失败，实际站点 security.zhipin.com） | secondary | 《BOSS直聘SRC漏洞处理流程和评分标准V2.3》公告2026-09-11（内文混有V2.1 2025-12-12第九版表述） | 实际域名为security.zhipin.com；收录.zhipin.com/.kanzhun.com等5域名；1安全币≈1元现金礼品；Fastjson RCE暂停收录（2026-07-21） |
| [zhaopin](zhaopin.md) | 智联招聘ZPSRC | https://src.zhaopin.com/ | official | 《ZPSRC安全漏洞处理标准V3.0》（2022-08-16发布，2025-04-11重发）；隐私标准V2.0 | 1积分=10元；核心严重150-300积分；子公司暂不收；禁扫描器、弱口令进后台发现漏洞降级 |
| [liepin](liepin.md) | 猎聘LPSRC | https://security.liepin.com/ | official | 《LPSRC漏洞处理和评分标准》V5.0，2024-03-05施行 | 安全币=贡献值×10；评估1个工作日/反馈3个工作日；修复严重1d/高危5d/中危7d/低危10d；SSRF附录ssrf.tongdao.cn |
| [focuschina](focuschina.md) | 焦点科技FSRC | https://security.focuschina.com/ | official | 《FSRC安全情报定级及积分规则》FSRC-2024-05，修订至V7.6（页面2026-10-09） | 白名单制；核心严重3600-4000安全币、贡献值90-100；百卓/中文站/领动仅收批量敏感信息漏洞；边缘低危无安全币 |
| [intsig](intsig.md) | 合合信息ISRC | https://security.intsig.com/ | official | 《漏洞处理流程及评分标准v1.5》2025-09-15 | 1安全币≈10元；核心严重300-500；高危需泄露5000条+、严重百万条+；专项治理期内不收；nday公开3个月内已知忽略 |
| [iflytek](iflytek.md) | 科大讯飞iflytekSRC | https://security.iflytek.com/ | secondary | 未标注（规则正文未公开可得） | SPA空壳；公告索引含《暂停接收安全漏洞通知》《暂停收取部分漏洞(实时更新)》《AI生成漏洞报告处置公告》《现金兑换须知》；邮箱security@iflytek.com |

## 内容社交

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [weibo](weibo.md) | 微博WSRC | https://wsrc.weibo.com/ | official | 未标注（公告最新2017） | 官方站可达但漏洞评分标准未公开；奖励为金币兑换礼品，白帽汇门槛=1高危/严重或3中危 |
| [zhihu](zhihu.md) | 知乎安全响应中心 | https://security.zhihu.com/ | official | 未标注 | 官方规则全文公开：严重核心3000-5000元；数据泄露情报需≥20条含可追溯身份字段样本否则忽略 |
| [iqiyi](iqiyi.md) | 爱奇艺iSRC | https://security.iqiyi.com/ | secondary | 未标注 | 官方站TLS层拒绝直连；二手仅得测试范围（2020）与邮箱71src@qiyi.com，评分奖励未取得 |
| [douyu](douyu.md) | 斗鱼DYSRC | https://security.douyu.com/ | unreachable | 未标注 | 官方站TLS层拒绝，搜索仅见站名与官方微信，规则正文不可得 |
| [huya](huya.md) | 虎牙HSRC | https://sec.huya.com/ | unreachable | 未标注 | DNS解析失败，多轮搜索无规则文本，需国内网络或官方公众号核实 |
| [yy](yy.md) | 欢聚YY（YYSRC） | https://security.yy.com/ | unreachable | 未标注 | 官方站TLS层拒绝；仅2016年汇编提及YYSRC与security@yy.com，现行规则不可得 |
| [kugou](kugou.md) | 酷狗音乐KSRC | https://security.kugou.com/ | official | 公告2026/07/13 | 官方站可达（Tencent xSRC体系）；已取报告五段式格式与测试规范，评分标准未在站内公布 |
| [ximalaya](ximalaya.md) | 喜马拉雅XMSRC | https://security.ximalaya.com/ | secondary | V3.0（v2.1为2020/12/28） | 官方站TLS拒绝但规则页被索引：安全币=分值×k（1币=1元），修复前报告上网即0分 |
| [soul](soul.md) | SoulSRC | https://security.soulapp.cn/ | official | V2.0_试行（2026/07/21发布） | 官方全文：1安全币=10元，核心严重6000-10000元，严重/高危72小时修复，季度奖Top3 |
| [immomo](immomo.md) | 陌陌MSRC | https://security.immomo.com/ | unreachable | 未标注 | 站点200但为Vue壳，规则在登录后渲染（read_rule强制确认），搜索无二手规则文本 |

## 金融科技

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [unionpay](unionpay.md) | 银联USRC（银联安全应急响应中心） | https://security.unionpay.com/ | official | 《银联安全应急响应中心漏洞处理流程及评级标准》新版（公告id=972）；旧版2017-12-01（id=57） | 五级评级+积分金币（金币≈1元）；审核3+4个工作日；同系统同类型只收前3个；禁高频扫描/公开细节；需绑云闪付兑换 |
| [eastmoney](eastmoney.md) | 东方财富EMSRC | https://security.eastmoney.com/ | official | 《EMSRC漏洞评分与奖励标准V4.0》（页面附件）；2024-01-01起取消季度奖励 | 金币:人民币=1:10；核心业务严重至少加1万；开盘时段禁扫（沪深京/港股/美股/期货具体时段）；奖励经天天基金活期宝发放 |
| [duxiaoman](duxiaoman.md) | 度小满DXMSRC | https://security.duxiaoman.com/index.html | secondary | 未标注（规则正文未公开） | 官网SPA空壳；漏洞盒子项目页（提交入口id=2824）公开区无规则无公告；历史邮箱sec@duxiaoman.com |
| [pingan](pingan.md) | 平安PSRC（集团）/平安银行ISRC | https://security.pingan.com/ | official | 未标注；平台已停止服务（页面2026-07-23更新） | 集团security.pingan.com与银行isrc.pingan.com均显示"本平台已停止服务"，仅留邮箱pub_sec@pingan.com.cn；现行规则不可得 |
| [zhongan](zhongan.md) | 众安ZASRC | https://security.zhongan.com/ | official | 《众安安全应急响应中心漏洞处理及评分标准》16页PDF（元数据约2026-04-17） | 漏洞奖励=系统等级×严重程度：核心5000-8000/一般3000-5000/边缘1500-2000（严重档检索片段）；全文需读官方PDF |
| [webank](webank.md) | 微众银行SRC（WSRC） | https://security.webank.com/ | secondary | 《微众银行SRC漏洞处理和评分标准》未公开；官方流程公告2018-09-29；2020-06悬赏细则 | 1安全币=5元；2020悬赏高危5-7万/严重9-11万且只收高危及以上；禁一稿多投/提前公开 |
| [creditease](creditease.md) | 宜信CESRC | https://security.creditease.cn/ | secondary | 未标注 | 官网502"系统正在升级中"；2018-05-21上线；邮箱cesrc@creditease.cn；规则不可得；勿混廉洁举报渠道CEIA@creditease.cn |
| [rong360](rong360.md) | 融360RSRC | https://security.rong360.com/ | secondary | 未标注 | 官网SPA无规则；安全KER目录邮箱rsrc@rong360.com；检索勿与360SRC（奇虎）混淆 |
| [lexin](lexin.md) | 乐信LXSRC | https://lxsrc.vulbox.com/ | secondary | 未标注 | 漏洞盒子项目页公开区无规则、公告为空、状态timing；需站内确认可交性；勿与乐橙ISRC混淆 |
| [shuidi](shuidi.md) | 水滴SHUIDISRC | https://security.shuidihuzhu.com/ | unreachable | 未标注 | 官方域名失效（水滴互助已关停）；仅历史目录线索security@shuidihuzhu.com；勿向失效渠道提交 |

## 软件·云·安全厂商

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [vendor-a](vendor-a.md) | 厂商 A（匿名化条目） | `<redacted>` | official | V1.0 | 安全币=CVSS奖励分×等级×业务系数,仅兑礼品;数据≤10条不落地 |
| [kanyun](kanyun.md) | 看云控股YSRC(猿辅导系) | https://security.kanyun.com/ | official | V1.7(2026-07-28) | 重要业务严重6000猿币;隐私合规类不收;非厂商 A 云 |
| [ucloud](ucloud.md) | UCloud USRC | https://src.ucloud.cn/ | official | V1.3(2026-09-24) | 生产严重1000-3000安全币;云上客户业务不计贡献 |
| [dbapp](dbapp.md) | 安恒信息DSRC | https://security.dbappsecurity.com.cn/ | official | 快照2021-06 | 严重150-200金币(旧快照);正文需JS渲染 |
| [sangfor](sangfor.md) | 深信服SSRC | https://security.sangfor.com.cn/ | secondary | 未标注 | 规则文档存在但未公开索引;口袋助理越权类暂停收录 |
| [topsec](topsec.md) | 天融信TOPSRC | https://src.topsec.com.cn/ | official | v1.6(2024-12-16) | 评级标准为官方PDF未提取文本;腾讯xSRC托管 |
| [oray](oray.md) | 贝锐Oray SRC | https://security.oray.com/ | official | 未标注 | 白帽规范全文已取;违规3次追回全部奖励;收录范围近3月3次调整 |
| [fadada](fadada.md) | 法大大FSRC | https://sec.fadada.com | unreachable | 未标注 | 仅2019新闻稿确认奖励机制存在 |
| [bestsign](bestsign.md) | 上上签SRC | https://src.bestsign.cn/ | official | V1.0(2020-06-25) | KnowSafe托管标准全文已取;礼品Rank制 |
| [uniontech](uniontech.md) | 统信UOS USRC | https://src.uniontech.com/ | unreachable | 未标注 | 平台在线但规则SPA渲染未索引 |

## 教育·游戏·工具

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [100tal](100tal.md) | 好未来SRC | https://src.100tal.com/ | official | 收录标准V6.0(SRC-44) | SRC-43曾暂停收录,提交前必须确认是否在收 |
| [17zuoye](17zuoye.md) | 一起教育SRC | https://security.17zuoye.com/ | unreachable | 未标注 | HTTPS/HTTP均403(Tengine WAF),无二手规则,需人工确认 |
| [vipkid](vipkid.md) | VIPKID SRC | https://security.vipkid.com.cn/ | secondary | 未标注 | 官方站502疑似停运,仅2017报道确认曾有评分标准 |
| [wanmei](wanmei.md) | 完美世界PWSRC | https://security.wanmei.com/ | official | 游戏V1.1(2021-07)/通用V2.4(2018-11) | 两套标准分游戏/通用;2024Q1仍有奖金公示 |
| [jj](jj.md) | 竞技世界JJSRC | https://security.jj.cn/ | official | 未标注 | 现金+礼品双轨;GB2312老架构注意编码 |
| [xunlei](xunlei.md) | 迅雷XLSRC | https://security.xunlei.com/ | official | 未标注 | TSRC xsrc托管;规则在页脚协议页未取得 |
| [wifi](wifi.md) | WiFi万能钥匙SRC | https://sec.wifi.com/ | official | 未标注 | 严重漏洞有额外奖励;同源漏洞只计1个 |
| [zhangmen](zhangmen.md) | 掌门1对1ZMSRC | https://security.zhangmen.com/ | official | 未标注 | 纯SPA壳无规则文本;是否在收需核实 |
| [zsxq](zsxq.md) | 知识星球ZSRC | https://security.zsxq.com/ | official | 未标注 | TSRC xsrc托管;邮箱security@zsxq.com |
| [dhgate](dhgate.md) | 敦煌网DHSRC | https://dhsrc.dhgate.com/ | official | 未标注 | 奖励计划+礼品库;细则藏在公告/服务协议id=29 |

## 众测平台与行业规范

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [butian](butian.md) | 补天漏洞响应平台 | https://www.butian.net/ | official | 页面未标注 | 事件漏洞按厂商规模KB/现金双轨;通用漏洞低危200-800/高危3000-10000元 |
| [vulbox](vulbox.md) | 漏洞盒子VULBOX | https://www.vulbox.com/ | official | 页面未标注 | 奖励在厂商项目页;赛季奖金池3万;提现下月10-15日 |
| [tencent-zc](tencent-zc.md) | 腾讯众测 | https://zc.tencent.com/ | unreachable | 未标注 | 登录墙后,规则按项目页 |
| [360-zc](360-zc.md) | 360众测 | https://zhongce.360.net/ | official | 未标注 | 安全币:RMB=1:5;CVE公开前10个工作日不收 |
| [cnvd-zc](cnvd-zc.md) | CNVD网络安全众测平台 | https://zc.cnvd.org.cn/ | official | 页面未标注 | 项目制;积分=有效性×CVSS×难度×危害×企业规模×报告质量 |
| [xianzhi](xianzhi.md) | 阿里云先知漏洞情报计划 | https://xianzhi-next.aliyun.com/ | official | Phase V | 通用软件漏洞情报;严重最高50万;中低危暂不收;需EXP视频/5个互联网案例 |
| [threatbook](threatbook.md) | 微步在线X漏洞奖励计划 | https://x.threatbook.com/v5/vulReward | official | 2022-05-24实施 | 只收未公开漏洞;微步币1:5元可提现 |
| [huoxian](huoxian.md) | 火线安全(众测托管) | https://www.huoxian.cn/ | unreachable | 未标注 | Keep/旷视等SRC规则在各项目子站 |
| [sjtu-edu](sjtu-edu.md) | 教育行业漏洞报告平台EDUSRC | https://src.sjtu.edu.cn/ | official | 未标注 | 仅教育行业资产;金币兑礼品/证书;审核约半月 |
| [industry-testing-standard](industry-testing-standard.md) | SRC行业安全测试规范(通用红线) | https://security.mcd.cn/index.php?m=&c=page&a=view&id=1 | official | MCDSRC2022-1(2024-10-17) | 14条测试规范全文:越权≤5组/扫号≤50/禁弹窗/禁后台扫描/禁社工内网DoS |

## 金融长尾（主体待确认/疑似停运）

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [qianmi](qianmi.md) | 钱米/千米SRC | http://security.qianmi.com/ | unreachable | 未标注 | 主体未确认,检索无规则与运营证据,疑似停运 |
| [credithc](credithc.md) | 恒昌SRC | http://src.credithc.com/ | unreachable | 未标注 | 检索无规则与运营证据;勿与宜信CESRC混淆 |
| [msxf](msxf.md) | 马上消费金融MSXSRC | https://src.msxf.com/ | official | 章节制标准 | 1积分=5元;核心严重≥2070积分;重大安全事件10万起步 |
| [fuiou](fuiou.md) | 富友支付FSRC | https://fsrc.fuiou.com/home/index.html | unreachable | 未标注 | 检索无规则与运营证据;支付机构高敏感 |
| [tcjf](tcjf.md) | 同程金服SRC(主体待确认) | https://securitytcjf.com | official | 未标注 | 探针200;域名形态异常,主体需核实 |
| [jfztkg](jfztkg.md) | jfztkg SRC(主体待确认) | https://security.jfztkg.com/basic/home | official | 未标注 | 探针200;主体未确认,规则在登录后 |
| [hyvpr](hyvpr.md) | 华域视觉SRC(主体待确认) | https://security.hyvpr.cn | official | 未标注 | 探针200;主体未确认 |
| [niwodai](niwodai.md) | 你我贷安全页 | https://www.niwodai.com/sec/index.do | official | 未标注 | 安全联系页而非完整SRC平台 |
| [xiaoying](xiaoying.md) | 小赢科技SRC | https://security.xiaoying.com/ | official | 未标注 | 探针200;规则未提取 |
| [tcl](tcl.md) | TCL SRC | https://src.tcl.com/zh/index | official | 未标注 | 探针200;规则未提取;含IoT/硬件口径待确认 |

## 家电与本地生活长尾

| src_id | 名称 | 主页 | 状态 | 版本/日期 | 备注 |
|---|---|---|---|---|---|
| [ugreen](ugreen.md) | 绿联UGREEN SRC | https://src.ugreengroup.com | official | 未标注 | 探针200;规则未提取;NAS/云存储口径待确认 |
| [kuaikan](kuaikan.md) | 快看漫画SRC | https://security.kuaikanmanhua.com/ | official | 未标注 | 探针异常299,需人工确认 |
| [shumei](shumei.md) | 数美科技SRC | https://www.ishumei.com/about/src.html | official | 未标注 | 官网about子页,规则未提取 |
| [xiaolachuxing](xiaolachuxing.md) | 小拉出行SRC | https://xlsrc.xiaolachuxing.com/ | official | 未标注 | 探针200;规则未提取 |
| [ziroom](ziroom.md) | 自如ZSRC | https://zrsecurity.ziroom.com/ | official | 未标注 | 探针200;规则未提取;智能门锁类敏感 |
| [autohome](autohome.md) | 汽车之家SRC(存续待确认) | https://security.autohome.com.cn/ | unreachable | 未标注 | 探针000连接失败,需国内网络人工确认 |
| [fang](fang.md) | 房天下SRC | https://security.fang.com/ | official | 未标注 | 探针200;规则未提取 |
| [haier](haier.md) | 海尔SRC(存续待确认) | https://security.haier.com/ | unreachable | 未标注 | 探针000连接失败,需人工确认 |
| [midea](midea.md) | 美的SRC(存续待确认) | https://security.midea.com/ | unreachable | 未标注 | 探针000连接失败,需人工确认 |
| [hisense](hisense.md) | 海信SRC(存续待确认) | https://security.hisense.com/ | unreachable | 未标注 | 探针000连接失败,需人工确认 |

## 使用注意

- unreachable 项仅代表公开渠道未取得规则：可能是登录墙、SPA、网络限制或已停运；不得据此判定平台不存在，也不得为获取规则发起绕过探测。
- 主体待确认条目（jfztkg/hyvpr/tcjf/qianmi 等）在确认归属前不应提交报告或测试。
- 金额/币种口径差异大（安全币、积分、KB、猿币、微步币等，兑率 1:1 至 1:10 不等），跨平台不可套用。
- 各平台对同源合并、N-day 锁定期、AI 生成报告、数据采样上限（5/10/50 组）有不同阈值，以目标平台现行文本为准。
