---
name: game-dev
description: 创意 H5 小游戏开发流程。从构思创意、设计、编码到打磨验证，产出手机和电脑浏览器都能直接运行（双击 index.html）的完整小游戏。内含微型引擎、6 种代码生成的画风（二次元/街机/电子/扁平/国风/沙雕）、UI 组件库、模板、创意生成器、手感清单、按游戏类型的 UI 配方和自动化测试脚本，弱模型和子 agent 也能按步骤做出高质量作品。当用户想要做游戏、小游戏、H5 游戏、网页游戏、休闲游戏、游戏原型、game jam 作品，或想要游戏创意/点子时使用。
---

# H5 创意小游戏开发

用固定的技术栈、分步流程和自动检查，把"做一个好玩的小游戏"变成照着做就能完成的任务。

**产出**：一个文件夹（`index.html` + 几个 `.js`），双击即可在电脑运行，上传到任意静态托管后手机可玩。无需构建、无需联网、无需素材文件。

## 技术栈（固定，不要更换）

- 原生 Canvas 2D + 本 skill 自带的 `engine.js`（场景、输入、补间、粒子、震屏、合成音效、存档）
- 自带 `art.js` 画风库：6 种画风（二次元 anime / 街机 arcade / 电子 cyber / 扁平 flat / 国风 guofeng / 沙雕 shadiao），负责背景、角色、敌人、道具、方块和 UI 的全部外观
- 自带 `ui.js` 组件库：按钮、面板、HUD、图标、标题（外观跟随画风）
- 普通 `<script>`，不用模块、不用 npm、不用框架
- 所有图形用代码绘制，所有音效用 `G.sfx()` 合成
- 默认竖屏，逻辑宽 720、高 1280–1600（随手机长宽比自动变化，没有黑边）。布局用 `G.H`、`UI.ACTION_Y` 等相对值

## 九条硬规则

1. **按阶段顺序推进，过了闸门才能进入下一阶段。**
2. **每次只改 1–2 个文件，改完立刻运行 check 和 smoke-test。**
3. **截图必须亲自打开查看。** 脚本只能证明"没坏"，不能证明"好看""好玩"。
4. **不要修改 `engine.js`、`ui.js`、`art.js`。** 只用 `references/engine-api.md`、`references/ui-design.md`、`references/art-styles.md` 中列出的 API。
5. **数值放 `config.js`，颜色只用 `C.xxx`（由画风自动填充）。**
6. **手机优先**：所有操作都必须能用一根手指完成。
7. **一个机制做深**，胜过多个机制做浅。想加功能时，先问"核心操作够好玩了吗？"
8. **UI 只用 `UI.*` 组件，按 `references/ui-design.md` 的分区和线框摆放。** 不要用 `D.rect`/`D.text` 手拼按钮、面板、标题。
9. **游戏世界只用 `Art.*` 绘制**（`Art.bg / hero / enemy / spiky / pickup / block / shape …`），不要用 `D.*` 画角色和物体。画风在 `config.js` 的 `art.style` 里选一次，全游戏统一。

## 流程

| 阶段 | 读这个文件 | 产出 | 闸门 |
|---|---|---|---|
| 1 构思 | `workflow/1-ideate.md` | 10 个点子 → 选定 1 个 | 一句话清晰、可做性 ≥ 4 |
| 2 设计 | `workflow/2-design.md` | `GDD.md` + `config.js` 初值 | GDD 无空项 |
| 3 构建 | `workflow/3-build.md` | 玩具 → MVP → 内容 | smoke-test 走通 title→play→over |
| 4 打磨 | `workflow/4-polish.md` | 手感、画面、UI | juice 必做项全部完成 |
| 5 验证 | `workflow/5-verify.md` | 测试报告 + README | 趣味自评每项 ≥ 3 |

**每进入一个阶段，先读对应的 workflow 文件，再开始动手。** 不要凭记忆执行。

如果用户已经给出了具体创意，阶段 1 只执行"步骤 4 强化扭转"，然后直接进入阶段 2。

## 命令

```bash
SKILL=<本 skill 的绝对路径>
# 首次使用：安装测试依赖（只需一次；若本机已有 Chrome 可不执行 playwright install）
cd $SKILL/scripts && npm install && npx playwright install chromium

bash $SKILL/scripts/new-game.sh <项目目录> "<游戏名>"   # 从模板创建（模板本身就是可玩的示例游戏）
node $SKILL/scripts/check.mjs <项目目录>                # 静态检查：语法、禁用写法、脚本引用、UI 与画风规则（硬编码颜色、用 D.* 画物体等）
node $SKILL/scripts/smoke-test.mjs <项目目录> [--seconds 15] [--landscape] [--steps "button:开始;waitScene:play;shot:name"] [--bot bot.mjs] [--init "CFG..."] [--style anime]
                                                        # 无头浏览器运行 + 脚本步骤 + 随机乱玩/bot + 截图到 <项目>/.smoke/
node $SKILL/scripts/logic-test.mjs <项目目录> <测试.mjs>    # 不开浏览器，在 Node 里验证规则/关卡可解性
```

测试详解（等事件、拖动/按住、断言、求解器、bot）见 `references/testing.md`。skill 目录里唯一允许写入的是 `scripts/node_modules`。

## 参考资料（需要时再读）

| 文件 | 什么时候读 |
|---|---|
| `references/engine-api.md` | **写任何代码之前**（一页，必读） |
| `references/ui-design.md` | **写任何界面之前**（必读）：硬约束、组件、版面分区、标准线框、按游戏类型的 UI 配方 |
| `references/art-styles.md` | **阶段 2 选画风、写任何绘制代码之前**（必读）：6 种画风、适用游戏、`Art.*` 全部 API、尺寸规则 |
| `references/img/art-*.jpg` | 选画风时看效果图（`art-all.jpg` 六种并排） |
| `references/patterns.md` | 需要实现常见机制时：生成器、按钮、拖拽、相对拖动、松手触发、跳跃、网格、连击、关卡、摄像机、回合制移动+撤销+结果面板…… |
| `references/creativity-toolkit.md` | 阶段 1，或玩法缺乏新意时 |
| `references/juice.md` | 阶段 4，或觉得"不爽"的时候 |
| `references/game-feel-numbers.md` | 设置/调整数值时 |
| `references/art-direction.md` | 构图（物体多大、放哪）、形状语言、让画面动起来、截图自检 |
| `references/level-design.md` | **阶段 2 填难度曲线前、阶段 3.3**：关卡表、转折关、档位表、难度指标 |
| `references/testing.md` | **阶段 3 起**：`G.debug` 约定、等事件的步骤脚本、纯逻辑求解验证、bot 试玩 |
| `references/fun-check.md` | 阶段 5，或中途自检 |
| `references/anti-patterns.md` | 出 bug 或卡住时 |
| `templates/task-card.md`、`agents/roles.md` | 需要派发子 agent 时 |

## 项目结构

```
<项目>/
├── index.html    # 不要加 HTML 元素；新增 js 时在 game.js 之前加 <script>
├── engine.js     # 不要修改
├── ui.js         # UI 组件库，不要修改
├── art.js        # 画风库，不要修改
├── config.js     # CFG：分辨率、画风 art.style、所有数值
├── game.js       # 场景：title / play / over，最后调用 G.start('title')
├── (levels.js)   # 可选：关卡数据
├── (logic.js)    # 可选：不依赖画面的规则/求解器（关卡制推荐）
├── (tests/)      # 可选：logic-test 测试、bot 文件
└── GDD.md        # 设计文档
```

## 向用户汇报

完成后简要说明：游戏一句话介绍、操作方式、如何运行、趣味自评结果、已知问题（如实写）。
