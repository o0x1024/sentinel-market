# X 语料索引（纯文本）

共 **63** 个文件、约 **4,770** 条记录（台账 4,771 条，提纯时删除了少量重复与空条目）。
原贴昵称、日期、转贴次数等元数据已整体移除。

这些条目来自 42,084 条原始贴子，经**逐条判定**后收录。语料分两层：

- **技术桶（3,271 条）**：贴子给出可执行动作（载荷/端点/参数/命令/配置），
  且有触发条件；或虽有载荷但原贴未说明场景。
- **经验桶（1,500 条，`x-exp-*.md`）**：贴子给出做法、判断依据或踩坑经验，
  但缺少可直接复现的完整载荷链。仍具指导价值，与技术桶配合阅读。

其中 `x-recovered-*.md`（206 条）与 `x-residual-*.md`（245 条）是**两轮检索后从 non-technical 回收**的贴子：
首轮针对「多条目可执行清单」，次轮针对「单条命令/载荷/请求头骨架」。
回收判据与产出可在 `diagnostics/residual-strict.json`、`residual-kept.json` 复核。

**图片与外部媒体一律未收录**：正文里的 markdown 图片语法、HTML img 标签、
data URI、media/ 路径引用在提炼时已全部剥离。作者自述内容，未经复现验证。

---

## 一、技术桶（3,271 条）

| 类别 | 文件 | 条目 |
|---|---|---|
| x-methodology-1.md | [x-methodology-1.md](x-methodology-1.md) | 300 |
| x-xss-1.md | [x-xss-1.md](x-xss-1.md) | 300 |
| x-xss-2.md | [x-xss-2.md](x-xss-2.md) | 300 |
| x-methodology-2.md | [x-methodology-2.md](x-methodology-2.md) | 287 |
| x-xss-3.md | [x-xss-3.md](x-xss-3.md) | 266 |
| x-recon-1.md | [x-recon-1.md](x-recon-1.md) | 253 |
| x-tooling-1.md | [x-tooling-1.md](x-tooling-1.md) | 208 |
| x-sqli-1.md | [x-sqli-1.md](x-sqli-1.md) | 193 |
| x-auth-1.md | [x-auth-1.md](x-auth-1.md) | 147 |
| x-waf-1.md | [x-waf-1.md](x-waf-1.md) | 116 |
| x-file-1.md | [x-file-1.md](x-file-1.md) | 79 |
| x-rce-1.md | [x-rce-1.md](x-rce-1.md) | 69 |
| x-idor-1.md | [x-idor-1.md](x-idor-1.md) | 67 |
| x-ssrf-1.md | [x-ssrf-1.md](x-ssrf-1.md) | 54 |
| x-infodisc-1.md | [x-infodisc-1.md](x-infodisc-1.md) | 44 |
| x-cloud-1.md | [x-cloud-1.md](x-cloud-1.md) | 26 |
| x-api-1.md | [x-api-1.md](x-api-1.md) | 23 |
| x-ssti-1.md | [x-ssti-1.md](x-ssti-1.md) | 22 |
| x-csrf_cors-1.md | [x-csrf_cors-1.md](x-csrf_cors-1.md) | 20 |
| x-logic-1.md | [x-logic-1.md](x-logic-1.md) | 16 |
| x-smuggling-1.md | [x-smuggling-1.md](x-smuggling-1.md) | 10 |
| x-xxe-1.md | [x-xxe-1.md](x-xxe-1.md) | 10 |
| x-mobile-1.md | [x-mobile-1.md](x-mobile-1.md) | 8 |
| x-ai-1.md | [x-ai-1.md](x-ai-1.md) | 2 |

主体合计 **2,820** 条。

### 首轮抽检回收（206 条）

| 类别 | 文件 | 条目 |
|---|---|---|
| Recon 流程清单 | [x-recovered-recon.md](x-recovered-recon.md) | 83 |
| 测试用例清单 | [x-recovered-testcase.md](x-recovered-testcase.md) | 68 |
| Dork 语法清单 | [x-recovered-dork.md](x-recovered-dork.md) | 24 |
| 请求头载荷清单 | [x-recovered-header.md](x-recovered-header.md) | 20 |
| 工具链组合 | [x-recovered-toolchain.md](x-recovered-toolchain.md) | 11 |

回收条件：同类具体条目 ≥3 条（dork ≥3 个语法、请求头 ≥2 个、编号步骤 ≥4 步），
且去掉 URL 后仍有 ≥60 字符实质内容，并排除纯工具对比/推广/文章指针。

### 次轮精确扫描回收（245 条）

| 类别 | 文件 | 条目 |
|---|---|---|
| XSS 载荷与绕过 | [x-residual-xss.md](x-residual-xss.md) | 111 |
| 信息收集命令 | [x-residual-recon.md](x-residual-recon.md) | 43 |
| SQL 注入 | [x-residual-sqli.md](x-residual-sqli.md) | 26 |
| 其他技术片段 | [x-residual-misc.md](x-residual-misc.md) | 17 |
| 路径穿越与文件读取 | [x-residual-lfi_traversal.md](x-residual-lfi_traversal.md) | 13 |
| SSRF / 反连 | [x-residual-ssrf.md](x-residual-ssrf.md) | 10 |
| 命令执行 | [x-residual-rce.md](x-residual-rce.md) | 7 |
| 工具链用法 | [x-residual-tooling.md](x-residual-tooling.md) | 6 |
| API 与端点 | [x-residual-api.md](x-residual-api.md) | 4 |
| 认证与越权 | [x-residual-auth.md](x-residual-auth.md) | 4 |
| WAF 绕过 | [x-residual-waf_bypass.md](x-residual-waf_bypass.md) | 3 |
| 文件上传 | [x-residual-upload.md](x-residual-upload.md) | 1 |

回收条件：正文去掉元信息与图片区后，必须命中「带参数的命令行」或「可直接套用的载荷串」，
并排除仅含报告链接、无可迁移骨架的贴子（本轮排除 46 条）。

---

## 二、经验桶（1,500 条）

贴子讲了「怎么做/怎么判断/踩过什么坑」，但没给完整可复现载荷。
按同一套漏洞分类组织，便于和技术桶对照。

| 类别 | 文件 | 条目 |
|---|---|---|
| 认证、会话与令牌 | [x-exp-auth.md](x-exp-auth.md) | 279 |
| 信息收集与资产发现 | [x-exp-recon.md](x-exp-recon.md) | 214 |
| XSS 跨站脚本 | [x-exp-xss.md](x-exp-xss.md) | 209 |
| API 安全 | [x-exp-api.md](x-exp-api.md) | 180 |
| WAF 与过滤绕过 | [x-exp-waf.md](x-exp-waf.md) | 98 |
| 报告、定级与项目管理 | [x-exp-reporting.md](x-exp-reporting.md) | 93 |
| 越权与对象引用 | [x-exp-idor.md](x-exp-idor.md) | 84 |
| 心态与方法论 | [x-exp-mindset.md](x-exp-mindset.md) | 69 |
| SSRF 服务端请求伪造 | [x-exp-ssrf.md](x-exp-ssrf.md) | 63 |
| SQL 注入 | [x-exp-sqli.md](x-exp-sqli.md) | 42 |
| 命令执行与 RCE | [x-exp-rce.md](x-exp-rce.md) | 40 |
| CSRF 与 CORS | [x-exp-csrf.md](x-exp-csrf.md) | 24 |
| 云与容器 | [x-exp-cloud.md](x-exp-cloud.md) | 17 |
| 工具与脚本 | [x-exp-tooling.md](x-exp-tooling.md) | 16 |
| 文件上传与路径穿越 | [x-exp-file.md](x-exp-file.md) | 14 |
| 信息泄露 | [x-exp-infoleak.md](x-exp-infoleak.md) | 13 |
| 开放重定向 | [x-exp-redirect.md](x-exp-redirect.md) | 11 |
| 缓存投毒与欺骗 | [x-exp-cache.md](x-exp-cache.md) | 9 |
| 业务逻辑 | [x-exp-logic.md](x-exp-logic.md) | 9 |
| XXE 外部实体 | [x-exp-xxe.md](x-exp-xxe.md) | 8 |
| 请求走私 | [x-exp-smuggling.md](x-exp-smuggling.md) | 6 |
| 移动端 | [x-exp-mobile.md](x-exp-mobile.md) | 2 |

合计 **1,500** 条。

---

## 三、判定口径与去向

| 桶 | 条数 | 去向 |
|---|---|---|
| 技术 | 3,271 | `posts/` 或 `technical-recovered/` 原件；正文提炼到本目录 |
| 经验 | 1,500 | `experience/` 原件；正文提炼到本目录 `x-exp-*.md` |
| 非技术 | 37,313 | `non-technical/`，25 个理由子目录 |

三者相加 = 42,084，与逐条判定表 `diagnostics/ledger-final.tsv` 一致，无遗漏、无重复归属。

非技术桶按理由细分（全部目录）：
`no_substance` 12,806、`rss_syndication` 8,261、`pointer_link_only` 6,272、`aggregator_repost` 3,079、`duplicate` 2,291、`article_pointer` 1,632、`moved_from_technical` 609、`challenge_diary` 510、`empty_or_emoji` 376、`tool_ad` 330、`brag` 323、`course_promo` 223、`help_request` 124、`platform_rant` 111、`thread_teaser` 85、`event_promo` 79、`joke_meme` 57、`giveaway` 44、`product_promo` 38、`opinion_motivation` 32、`job_offer` 11、`changelog` 10、`unrelated_tool` 5、`question_bait` 3、`prompt_template` 2。

## 四、条目格式

```

- <正文首行>
  <续行>
  <续行>
```

正文即条目内容，两类例外：少数条目保留 CVE 编号或产品名标注（如 `- （CVE-2021-29323，Keycloak）`），用于定位受影响组件；每个文件开头有两行引用（`>` 开头），分别是时效说明与「判定协议 / 索引 / 同类桶」导航，都不是条目。

计数口径以 `diagnostics/ledger-final.tsv` 的逐条判定为准（见上表）。**不要**用 `grep '^- '` 统计——补丁/清单类条目内部被提升的子项也以 `- ` 开头，会重复计数。

## 五、复核方式

```
cd references/research
grep -h '^- @' $(ls x-*.md | grep -v '^x-corpus.md$') | wc -l   # 期望 0：昵称/日期头部已清除
grep -cE '!\[[^]]*\]\(' *.md | grep -v ':0'                      # 期望无输出：markdown 图片已剥离
grep -c '^> 判定协议：' $(ls x-*.md | grep -v '^x-corpus.md$') | grep -vc ':1$'   # 期望 0：每个桶恰有一行导航
```

条数与归属以 `diagnostics/ledger-final.tsv` 对账；`tools/verify_delivery.py` 在当前交付包中不存在，历史引用已作废。

## 六、溯源（蒸馏留痕）

提炼过程的审计留痕不随 skill 分发，已移出至 `~/x-bugbounty/audit/post-distillation-20261020/`（2,618 个文件、173 MB）：`reviews.jsonl` 正文审阅流水、`media-reviews.jsonl` 图片审阅流水、`snapshot-posts.jsonl.gz` 语料快照、`verification.json`、`workbench/`。迁移前后文件清单哈希一致，可校验完整性。

口径以该目录 `status.json` 为准，其中两项必须注意：

- **提炼未完成**：`state` = `in_progress`，剩余 `remaining_body_groups` = 11,559 组未审。本索引覆盖的是已审 41,106 条正文（对应上表 42,084 条判定），**不是全部 52,716 条贴子**；表述覆盖度时按此口径，不要写成"全量"。
- **图片另行审阅**：`media_visually_reviewed_unique_contents` = 16,152 张，且其自述机器 OCR 与人眼查看"均不构成对图像的完整理解"。

该目录只是"当时读过什么"的凭据，**不得作为条目来源**——条目唯一来源是各 `x-*.md` 与原始 `posts.jsonl`；审计目录缺失不影响本 skill 使用。
