---
name: game-dev
description: 创意 H5 小游戏开发流程。从构思创意、设计、编码到打磨验证，产出手机和电脑浏览器都能直接运行（双击 index.html）的完整小游戏。内含微型引擎、模板、创意生成器、手感清单和自动化测试脚本，弱模型和子 agent 也能按步骤做出高质量作品。当用户想要做游戏、小游戏、H5 游戏、网页游戏、休闲游戏、游戏原型、game jam 作品，或想要游戏创意/点子时使用。
---

# H5 创意小游戏开发

用固定的技术栈、分步流程和自动检查，把"做一个好玩的小游戏"变成照着做就能完成的任务。

**产出**：一个文件夹（`index.html` + 几个 `.js`），双击即可在电脑运行，上传到任意静态托管后手机可玩。无需构建、无需联网、无需素材文件。

## 技术栈（固定，不要更换）

- 原生 Canvas 2D + 本 skill 自带的 `engine.js`（场景、输入、补间、粒子、震屏、合成音效、存档）
- 普通 `<script>`，不用模块、不用 npm、不用框架
- 所有图形用代码绘制，所有音效用 `G.sfx()` 合成
- 默认竖屏 720×1280 逻辑分辨率，自动适配所有屏幕

## 七条硬规则

1. **按阶段顺序推进，过了闸门才能进入下一阶段。**
2. **每次只改 1–2 个文件，改完立刻运行 check 和 smoke-test。**
3. **截图必须亲自打开查看。** 脚本只能证明"没坏"，不能证明"好看""好玩"。
4. **不要修改 `engine.js`。** 只用 `references/engine-api.md` 中列出的 API。
5. **数值放 `config.js`，颜色只用调色板。**
6. **手机优先**：所有操作都必须能用一根手指完成。
7. **一个机制做深**，胜过多个机制做浅。想加功能时，先问"核心操作够好玩了吗？"

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
node $SKILL/scripts/check.mjs <项目目录>                # 静态检查：语法、禁用写法、脚本引用
node $SKILL/scripts/smoke-test.mjs <项目目录> [--seconds 15] [--landscape] [--steps "tap:360,640;wait:1000;shot:name"]
                                                        # 无头浏览器运行 + 随机乱玩 + 截图到 <项目>/.smoke/
```

## 参考资料（需要时再读）

| 文件 | 什么时候读 |
|---|---|
| `references/engine-api.md` | **写任何代码之前**（一页，必读） |
| `references/patterns.md` | 需要实现常见机制时：生成器、按钮、拖拽、跳跃、网格、连击、关卡、摄像机…… |
| `references/creativity-toolkit.md` | 阶段 1，或玩法缺乏新意时 |
| `references/juice.md` | 阶段 4，或觉得"不爽"的时候 |
| `references/game-feel-numbers.md` | 设置/调整数值时 |
| `references/art-direction.md` | 选调色板、画角色和背景时 |
| `references/fun-check.md` | 阶段 5，或中途自检 |
| `references/anti-patterns.md` | 出 bug 或卡住时 |
| `templates/task-card.md`、`agents/roles.md` | 需要派发子 agent 时 |

## 项目结构

```
<项目>/
├── index.html    # 不要加 HTML 元素；新增 js 时在 game.js 之前加 <script>
├── engine.js     # 不要修改
├── config.js     # CFG：分辨率、调色板、所有数值
├── game.js       # 场景：title / play / over，最后调用 G.start('title')
├── (levels.js)   # 可选：关卡数据
└── GDD.md        # 设计文档
```

## 向用户汇报

完成后简要说明：游戏一句话介绍、操作方式、如何运行、趣味自评结果、已知问题（如实写）。
