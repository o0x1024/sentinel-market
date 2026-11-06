# 工具契约与 Sentinel 接入

## 先探测能力

只调用当前会话实际提供的工具，读取其 schema、权限及错误说明。工具名和字段以当前会话实际接口为准，下表仅作已核对的参考；未暴露时不得声称调用成功。不要为追求自动化默默安装工具、改用户代理或扩大凭据权限。

浏览器适合正常流程与执行上下文观察；HTTP 工具适合隔离身份重放；扫描/并发/时间测量使用可限制请求的工具。浏览器、重放器和脚本都要经过同等出站与预算控制。GET 也可能有副作用，动作许可按业务语义判断。

## Sentinel 映射

以下按 2026-09-14 本地源码核对，只是接入指引；部署版本以可调用 schema 和真实返回为准。

| 意图 | 工具与 action | 关键要求 |
|---|---|---|
| 读取项目/资产/已有发现 | bounty_context: get_program / list_assets / list_findings | 使用真实项目 ID、过滤器和分页能力；不能把一页当全量 |
| 读取范围快照 | bounty_context: get_scope_snapshot | 保存返回引用，不自己推导授权 |
| 校验单目标 | bounty_context: validate_target | program_id、target、test_categories；检查 data.decision.allowed 和 reason |
| 读取历史 Run | bounty_context: get_run / list_runs | 恢复 coverage、artifacts、conclusion 与未完成工作 |
| 解析目标合同 | bounty_context: plan_goal | goal 必须满足实际 BountyGoalContract schema |
| 创建 Run | bounty_action: create_run | 完整 goal；保存真实返回的 run_id |
| 批量测试准备 | bounty_action: prepare_security_test | goal、program_id、targets；分别处理 authorized_targets 与 rejected_targets |
| 记录覆盖与证据索引 | bounty_action: record_coverage | run_id、coverage、artifacts；读取当前记录后合并，不能用本轮小片段覆盖既有记录 |
| 保存发现 | bounty_action: create_finding / update_finding | finding_create 或 resource_id + finding_update；默认创建前通过影响/收录门槛，更新保留真实处置与原证据，不编造外部提交状态 |
| 更新 Run | bounty_action: update_run | 使用宿主允许的 status；缺项不能填假证据通过完成校验 |
| 推进增量水位 | bounty_action: commit_watermark | 仅完成的匹配项目 Run，且本批次候选已完整处置；不得跳过受阻资产 |

`goal` 的必需顶层字段是 objective、program_selector、asset_selector、operation、test_policy、execution；不要写 asset_constraints 等别名。test_policy 中已有 requests_per_minute、concurrency、per_target_attempt_budget、credential_set_ref；填写真实限制，不等于底层执行器已强制实施。逻辑操作上限应放在实际支持的策略/执行器中；schema 没有字段时不能杜撰字段，须说明如何计数或暂停依赖批量控制的分支。execution 应匹配用户已选运行模式，不能自行切到 team。

`validate_target`/`prepare_security_test` 的整体 success 只表示调用完成；被拒目标不能执行。prepare 只评估目标和测试类别，不发送漏洞测试请求；它不证明具体动作、所有重定向、DNS 实际连接或工具出站均被约束。

管理动作 import_assets 不自动扩大 Scope；不得为让 validate_target 通过而调用 create_scopes/update_scope。删除项目、资产、Finding 等需要真实用户授权及 confirm_destructive，不能由 Agent 自行填 true 充当授权。创建监控/定期任务和向外部 SRC 提交报告只在用户已要求时执行。

源码定位：sentinel-tools/src/buildin_tools/bounty_context.rs、bounty_action.rs，sentinel-bounty/src/domain/goal.rs，应用 src/services/bounty_agent_action_handler.rs。不要把这些开发机路径当成运行时依赖。

## Run 与覆盖格式适配

当前源码接受 Run 状态 planned、running、validating、completed、failed、blocked、cancelled，不接受本地状态 partial/waiting_input。还有分支可推进则保持 running；必要工作受阻并停止时用 blocked，在 conclusion 中说明本地语义是部分完成或等待输入。只有不可恢复的执行失败才用 failed；不能把普通未发现漏洞记为失败。

当前完成校验要求 coverage.targets 为数组，元素有可接受的终态；需要证据时 artifacts 为非空数组，conclusion 非空。工具会替换传入的 coverage/artifacts 字段，所以读取已有值、合并并写回完整集合；并行写入须由宿主串行化或版本校验，避免丢记录。

| 实际结果 | 当前宿主 coverage target status | 说明 |
|---|---|---|
| 已执行且没有匹配发现 | no_match_within_budget | 保留具体角色、方法、条件及证据；不表示目标安全 |
| 已确认技术问题 | confirmed | 关联原始证据；已有 Finding 则保留关联，不因该状态自动创建未达收录门槛的 Finding |
| 其他已完成覆盖 | covered | 必须有实际执行和对应结论 |
| 功能不适用 | not_applicable / not_target_product | 必须有依据，不能用于缺账号 |
| 授权/规则阻止 | blocked_by_scope / blocked_by_rules | 保留拒绝理由 |
| 限流/锁定风险 | rate_limited / lockout_risk_detected | 不能当阴性结果 |
| 网络不可达/验证执行失败 | unreachable / verification_failed | 保留错误，不当成已覆盖 |

缺少账号等无精确枚举的情况，在非 completed Run 的覆盖记录中保留明确的本地 blocked 状态与原因，不强行转换为错误的终态。当前宿主校验接受某些受阻终态，并不证明用户要求已全部完成；按本 skill 的完成要求进一步核对，不为通过 API 校验改写事实。

这些格式是宿主适配，不要求其他环境使用相同枚举。参数被拒时先查实际版本和错误，不能反复猜字段或制造 artifacts。

## 精确执行契约

- 发现工具按离线解析、第三方索引查询、DNS、HTTP/浏览器、端口/参数枚举区分能力及动作。读取结果需包含来源/查询、时间窗口、游标、截断、实际请求与候选引用的区别；格式见 [发现记录](discovery/records-and-incremental.md)。
- 爬虫/文档导入器先检查默认主机/路径范围、自动填表/脚本执行、远端引用、跟随重定向及子资源请求；输出过滤不是出站强制控制。登录凭据按精确 origin/目标注入，不向新来源传播自定义 Authorization/Cookie。
- 被动来源查询配额与主动请求预算分开记账，DNS/端口探测也须有数值上限。来源游标可用于恢复采集，不能代替项目完成水位；发现 done 不自动映射成漏洞测试 covered/confirmed。
- 账号/租户用独立会话容器，凭据由工具按引用注入。实验前核对实际身份；变更 user_id 参数不是切换身份。
- 重放保留方法、编码、Content-Type 和原始业务语义，显式处理动态 CSRF/签名/一次性令牌；失败刷新不能变成认证绕过结论。
- 返回实际目标、工具退出/网络错误、HTTP 状态、应用错误码、关键字段、业务状态、证据引用及是否截断。
- 超时、取消、限流需可观察且实际终止子进程/后续请求；会话结束不等于后台扫描已停止。
- 请求/资源总量、重试、重定向和浏览器子请求由工具计数并限制；批量元素、GraphQL alias 和 WebSocket 消息另记逻辑操作额度。并发和毫秒级时序由工具测量，不让模型凭文字估算。
- 写请求结果未知时查询状态/幂等记录后决定；未经证明幂等的动作不自动重试。
- 执行 [定向 Fuzzing](targeted-fuzzing.md) 时关联候选、模板、基线与实际请求，保留重复参数/原始编码和动态依赖；响应分组只帮助选样，原始结果与未执行项不丢弃。认证尝试按测试账号另计额度，凭据变体仅在受控注入环节处理。没有可靠计数、关键观察或所需精确重放能力时暂停依赖该能力的自动批次，不能声称 skill 已补齐执行器。

技术/影响/收录评估采用 [影响与收录](impact-and-acceptance.md) 的本地语义；原生工具没有同名字段时，映射到实际支持的说明/证据记录或受控任务文件，不能修改 schema。内部 Finding、可提交候选与外部已接收报告独立计数。

## 会话与多步实验适配

按 [实验设计](experiment-design.md) 复用正常请求模板、隔离动态值、关联异步结果与管理资源。能力探测说明是否实际支持：按身份引用注入凭据、动态依赖提取/刷新、精确字节重放、语义及业务终态比较、操作幂等查询和资源清理。分别记录已验证、仅声明、缺失；不可用时可用现有受控工具显式编排短流程，不虚构自动化适配器或将文字计划计为执行。

## 能力缺失的降级

AI/设备类能力按实际环境逐项探测：离线包/固件解析、设备连接与 OS 身份、协议帧观察、模型实际可见的截图、原始会话/工具链、模型/费用/子请求计数、模拟器与真机差异、授权资源恢复。工具已安装或返回 success 不证明这些能力成立。ADB/shell/root 属于准备或调用身份，要记录与实际攻击身份的差异；不默认下载 APK、安装驱动/代理证书、root/越狱或连接用户硬件。

模型调用和工具子请求分别计数，token/费用按已知上限或实际使用量记录，不能猜精确成本；BLE/设备动作另记帧、连接、配对、持续时间和副作用上限。没有关键执行日志时，模型文本不代替实际 tool trace；固件模拟不代替硬件能力。对照与恢复不能无预算另起一批。可在现有授权内受控单步推进，所需能力缺失仅暂停依赖分支，不编造新的工具名或默认宿主已实现隔离。

原生 Run 存储不可用时可按 [状态协议](state-and-evidence.md) 在任务目录留痕；这不代替缺失的授权或网络控制。某种工具不可用则优先已有、同等受控工具；工具名猜测、直接改数据库或无边界 shell 不算替代。

具备明确授权、会话和可计数执行条件时，可继续有界的单次实验；缺少范围约束、会话隔离或关键证据时只暂停相应分支，继续离线分析等工作。报告清楚标明未验证的宿主控制，不宣称仅凭 skill 实现了强制安全隔离。
