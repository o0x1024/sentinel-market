# 任务卡模板（主控 → 构建者）

主控 agent 把工作拆成小任务时，每张卡都用这个格式。**一张卡 = 一次可验证的小改动**（通常 ≤ 80 行代码）。

```markdown
## 任务 #<编号>：<一句话标题>

**项目目录**：<绝对路径>
**背景**：<1–3 句，这个游戏是什么、当前进度>（附 GDD.md 路径）

**目标**：<具体要实现什么，可观察的结果>

**允许修改的文件**：config.js, game.js        ← 只能改这些
**禁止**：修改 engine.js；新增玩法以外的功能；改动与本任务无关的代码

**必读**：
- references/engine-api.md
- references/art-styles.md（任务涉及绘制任何游戏物体时）
- references/ui-design.md（任务涉及界面/HUD 时）
- references/patterns.md 第 <N> 节（如适用）

**可用的现有代码**：<列出已有的函数/对象名，如 this.player、this.spawn()>

**验收**（全部满足才算完成）：
1. node <skill>/scripts/check.mjs <项目> → 0 错误
2. node <skill>/scripts/smoke-test.mjs <项目> [--steps "..."] → 通过
3. 截图中能看到：<具体描述>
4. G.debug.<字段> 符合：<预期>（用 `--steps "...;waitUntil:...;expect:..."` 验证，见 references/testing.md）

**完成后回报**：改了哪些文件的哪些函数；验收结果；截图路径；遇到的问题。
```

## 拆卡示例（一个"拖拽弹射"游戏）

1. 玩具：小球可被拖拽并弹出，带瞄准线、音效、挤压动画
2. 墙壁反弹 + 速度衰减，球停下后可再次发射
3. 目标物：撞到目标得分 + 粒子 + 分数弹跳
4. 失败：发射次数用完 → 结算场景
5. 关卡数据：3 个关卡，levels.js
6. 打磨：背景、待机呼吸、新纪录庆祝
