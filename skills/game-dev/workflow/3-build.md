# 阶段 3：构建

原则：**先玩具，再游戏，再内容**。每一小步都要能运行。

开始前先通读 `references/engine-api.md`（只有一页）和 `references/art-styles.md`（画风 API）。模板 `game.js` 本身就是一个完整的示例游戏，先读一遍，再按步骤替换。

**从第一步起就用 `Art.*` 画东西**（主角 `Art.hero`、敌人 `Art.enemy/spiky`、道具 `Art.pickup`、方块 `Art.block/tile`、其它 `Art.shape`），不要先用 `D.circle` 占位、打算以后再换——以后往往就不换了。

---

## 小步循环（每一步都这样做）

```
1. 只改 1–2 个文件，只做一件事
2. node <skill>/scripts/check.mjs <项目>        ← 必须 0 错误
3. node <skill>/scripts/smoke-test.mjs <项目>   ← 必须通过
4. 用读图工具打开截图，看画面是否符合预期
5. 不符合 → 修；同一个问题修 2 次还不行 → 撤回改动，换个更简单的做法
```

不要连续写 200 行再测试。

---

## 步骤 3.1：玩具（Toy）

只实现**核心动词**，没有分数、没有失败、没有敌人。

- 删掉模板 `play` 场景里的玩法代码，保留场景结构
- 实现玩家对象和核心操作
- **立刻**给核心操作加上反馈：一个音效 + 一个视觉变化（缩放/粒子）
- 自问：只是摆弄这个操作，有没有一点点乐趣？没有 → 调 `config.js` 的数值（速度、重力、大小），参考 `references/game-feel-numbers.md`

闸门：smoke-test 通过；截图能看到玩家；核心操作有音效和视觉反馈。

## 步骤 3.2：最小游戏（MVP）

加上：目标/得分 → 失败条件 → 结算场景 → 重开。

- 用 `references/patterns.md` 中的现成代码片段（生成器、碰撞、按钮、网格……）
- 失败时：`G.hitstop` + `G.shake` + `G.flash` + `G.burst` + 音效，然后 `G.after(0.8, () => G.go('over', {...}))`
- 结算场景必须显示：本局分数、最高分（`G.save/G.load`）、"点击再来一局"
- 把关键状态写入 `G.debug`：至少 `result`（enter 里设为 `null`，赢/输时写 `'win'`/`'lose'`）和 `score`。见 `references/testing.md` 第 0 节

闸门：用事件等待走完一局，不要用猜的 `wait`：
```bash
node smoke-test.mjs <项目> --seconds 0 --steps "button:开始;waitScene:play;<你的操作>;waitUntil:d.result!=null,30000;waitScene:over,3000;shot:over"
```

## 步骤 3.3：难度与内容

- **无尽模式**：难度参数随 `this.elapsed` 增长，并有上限（`Math.min/Math.max`）
先读 `references/level-design.md`，按 GDD 第 6 节的关卡表/档位表实现。

- **关卡模式**：关卡写成数据数组，放在 `levels.js`；判定输赢的规则放在 `logic.js`（纯函数，不碰 `G`、`ctx`），再写一个求解器，用 `logic-test.mjs` 验证每关有解且难度递增（`references/testing.md` 第 2 节）
  ```js
  const LEVELS = [
    { goal: 3, enemies: [{ x: 100, y: 200, type: 'spike' }] },
    // ...
  ];
  ```
- 每隔一段时间引入一个**新元素或新组合**，而不只是"更快"
- 新增文件时，在 `index.html` 里 `game.js` **之前**加 `<script src="xxx.js"></script>`

闸门：
- 关卡制：`logic-test.mjs` 通过（每关有解、最少步数整体递增、后期关卡乱点能过的比例低）；每关一条标准解法 `--steps` 能到 `d.result=='win'`
- 无尽：按 `references/testing.md` 3.3 的表格逐项达标（看报告末尾的逐局统计 `SUMMARY`）；用 `--init` 压缩测试确认最后一档能运行且截图可见

---

## 代码规则

- 所有可调数值放 `config.js` 的 `CFG` 中，代码里不写魔法数字（0、1、2 和角度等常量除外）
- 状态在 `enter()` 里初始化，`update` 改状态，`draw` 只画画
- 对象用普通对象 + 数组：`this.enemies.push({x, y, r, vx, vy, dead:false})`，删除用 `dead = true` 加 `U.removeDead`
- 所有移动都乘 `dt`
- 单文件超过 600 行就拆分（`entities.js`、`levels.js`、`logic.js`、`hud.js`），用全局函数/常量共享。**不要新建名为 `ui.js` 的文件**，那是 UI 组件库
- **不要修改 engine.js**。缺功能就在游戏代码里自己写
- 不用 `import`/`export`、`fetch`、`setInterval`、`alert`、DOM 元素

## 卡住时

1. 读屏幕顶部的红色错误条或 smoke-test 输出的错误信息，找到文件名和行号
2. 查 `references/anti-patterns.md` 里有没有同样的症状
3. 把功能缩小到最简单的版本先跑通
4. 还不行：`G.debug.xxx = 值` 把中间值暴露出来，再用 `--steps "...;expect:d.xxx==..."` 验证
