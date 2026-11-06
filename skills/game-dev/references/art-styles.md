# 画风（art.js）

画面好不好看，八成取决于**画风统一**：背景、角色、敌人、道具、按钮、面板、文字都用同一套画法。本 skill 把 6 种画风写成了代码（`art.js`），你只需要：

1. 在 `config.js` 里选一个画风：`art: { style: 'anime' }`
2. 游戏世界里的东西一律用 `Art.*` 画（主角、敌人、道具、方块……）
3. UI 照常用 `UI.*`，外观会自动变成这种画风

**不需要、也不允许自己设计画法**。不要用 `D.circle` 画主角、不要手写渐变和描边——那样画出来的东西会和画风格格不入。

先看效果图：`references/img/art-all.jpg`（6 种画风并排），单个画风的标题/游戏/结算：`references/img/art-<画风>.jpg`。

---

## 一、选画风

| 画风 | `style` | 观感 | 适合的游戏 | 适合的题材/情绪 |
|---|---|---|---|---|
| 二次元 | `anime` | 赛璐璐上色、彩色粗描边、大眼睛、天空云朵、闪光 | 休闲动作、收集、养成、跑酷 | 可爱、治愈、少女、冒险 |
| 扁平卡通 | `flat` | 纯色块 + 底部厚度（2.5D）、无描边、豆豆眼、彩纸 | 三消、合成、解谜、益智、物理堆叠（**最大众、最安全**） | 轻松、明快、全年龄 |
| 街机 | `arcade` | 像素精灵、像素字、滚动星空、CRT 扫描线、"INSERT COIN" | 射击、躲避、反应、无尽冲分 | 复古、怀旧、刺激 |
| 电子 | `cyber` | 合成波落日、透视网格、发光线框、色差故障、扫描线 | 节奏、躲避、竞速、科幻 | 酷、速度、未来感 |
| 国风 | `guofeng` | 宣纸、水墨远山、朱砂红日、毛笔笔触、铜钱、印章、卷轴 | 解谜、养成、策略、文字、休闲 | 古风、志怪、禅意、节日 |
| 沙雕 | `shadiao` | 粗黑马克笔抖动线、错位上色、大眼珠、青筋、鸡腿 | 搞笑物理、整蛊、反应、魔性小游戏 | 搞笑、魔性、适合传播 |

不确定选什么：**休闲益智选 `flat`，动作收集选 `anime`，冲分躲避选 `arcade`**。题材是中国风/传统文化 → `guofeng`；想做好笑的 → `shadiao`。

全游戏只用一种画风。选定后写进 GDD 第 8 节。

## 二、颜色

`CFG.color` **由画风自动填充**，不要在 config.js 里写调色板。代码里用颜色角色：`C.player / C.enemy / C.pickup / C.accent / C.wall / C.dim / C.text / C.bg / C.bg2 / C.ink`。粒子、闪屏用这些颜色就会和画风一致：

```js
G.burst(x, y, { color: [C.pickup, '#fff'] });
G.flash(C.enemy, 0.2);
```

`Art.*` 里凡是有 `role` 参数的地方，都接受这些角色名（`'player'`、`'accent'`……），也接受直接给颜色（`'#ff0000'`，不推荐）。`Art.color('accent')` 返回当前画风里这个角色的颜色。

各画风里颜色角色的实际颜色：

| 画风 | player 主角 | enemy 危险 | pickup 奖励 | accent 点缀 | wall 墙 | dim 弱化 | text 文字 | bg 背景 |
|---|---|---|---|---|---|---|---|---|
| 二次元 | `#ffb3c7` 粉 | `#8f6bff` 紫 | `#ffd93d` 黄 | `#ff5c9a` 玫红 | `#a99bd6` | `#7d6a9e` | `#3b2a5c` 深 | `#bfe3ff` 浅 |
| 街机 | `#2de2ff` 青 | `#ff3355` 红 | `#ffd800` 黄 | `#ff3df5` 品红 | `#3a3f8f` | `#7f86c9` | `#ffffff` 白 | `#07071a` 深 |
| 电子 | `#00f0ff` 青 | `#ff3b5c` 红 | `#ffe14d` 黄 | `#ff2bd6` 品红 | `#5b3fa8` | `#8a7ab8` | `#e8fbff` 白 | `#05010f` 深 |
| 扁平 | `#3a86ff` 蓝 | `#ff595e` 红 | `#ffca3a` 黄 | `#8ac926` 绿 | `#6a4c93` | `#9a8c7a` | `#2b2d42` 深 | `#fff4e0` 浅 |
| 国风 | `#c8402f` 朱红 | `#262321` 墨 | `#c49a2c` 金 | `#b5302a` 印红 | `#5a5248` | `#8a7c63` | `#2b2620` 深 | `#efe4cc` 宣纸 |
| 沙雕 | `#ffd60a` 黄 | `#ff4d6d` 红 | `#ff9f1c` 橙 | `#4cc9f0` 蓝 | `#e2ded0` | `#777777` | `#111111` 黑 | `#fffef7` 白 |

注意：国风里 `enemy` 是墨色（黑），和朱红的主角对比最强；深色背景的画风（街机、电子）`text` 是白色。

## 三、API（全部）

所有坐标是逻辑坐标，r 是半径。`seed` 是每个物体固定的随机数（生成物体时 `seed: U.randInt(1, 999)`），让画风里的抖动、表情等细节对每个物体保持稳定。

### 每帧固定调用

```js
draw(ctx) {
  Art.bg(ctx);          // 第一行：背景（自带动画：云、星空、网格、远山……）
  // ……游戏世界……
  // ……UI……
  Art.post(ctx);        // 最后一行：后期效果（扫描线、暗角）。没有效果的画风会自动跳过
}
```

### 角色与物体

| 调用 | 画什么 | 各画风里的样子 |
|---|---|---|
| `Art.hero(ctx, x, y, r, { angle, speed, stretch })` | 主角。`angle` 运动方向（弧度），`speed` 0–1（眼睛看向运动方向），`stretch` 0–0.3（挤压拉伸） | 带表情的团子 / 像素团子 / 发光六边形 / 小人…… |
| `Art.enemy(ctx, x, y, r, { alpha })` | 团子型敌人（追踪者、幽灵、影子） | 皱眉的紫团 / 红色残影 / 故障线框 / 墨团…… |
| `Art.spiky(ctx, x, y, r, rot, seed)` | 尖刺型敌人（地雷、刺球、猎手） | 带怒眼的刺球 / 像素刺雷 / 红色线框…… |
| `Art.bullet(ctx, x, y, r, rot, seed)` | 小型危险物（子弹、火花、碎片） | 四角星 / 像素弹 / 线框三角 / 毛笔笔锋…… |
| `Art.vortex(ctx, x, y, coreR, pullR, alpha)` | 漩涡/黑洞/吸力区 | 旋转弧线 / 像素光环 / 收缩光圈 / 墨色漩涡…… |
| `Art.pickup(ctx, x, y, r, seed)` | 收集物（加分、奖励） | 星星 / 旋转金币 / 线框钻石 / 铜钱 / 鸡腿 |
| `Art.warn(ctx, x, y, size)` | 预警："!" 标志 | 圆形"!" / 闪烁像素三角 / "危"字印章 / 抖动的"!?" |
| `Art.warn(ctx, x, y, size, angle)` | 预警箭头，指向 `angle`（0 = 向右，用 `U.angle(...)` 算） | |

`Art.enemy`（团子）和 `Art.spiky`（尖刺）在每种画风里形状都不同，有两种敌人时分别用它们，玩家一眼能区分。

### 特效

```js
Art.shockwave(x, y, size, role)          // 冲击波：调用一次即可，自动播放约 0.45 秒（在 Art.post 里画）
                                         // 用于爆炸、击中、落地、技能释放。size 是最大半径，默认 120
Art.glow(ctx, x, y, r, role, alpha)      // 光晕：每帧画在物体下面（能量场、发光物体、选中提示）
```

各画风的冲击波：二次元是白圈加闪光，街机是像素方块环，电子是发光圈，扁平是粗色环，国风是毛笔圈，沙雕是马克笔虚线圈加"砰!"。配合 `G.burst / G.shake / G.hitstop` 一起用。

### 方块与格子（解谜、平台、关卡）

```js
Art.block(ctx, x, y, w, h, kind)     // x,y 左上角（和 U.rectHit 一致）
Art.tile(ctx, cx, cy, size, kind)    // cx,cy 中心点（网格游戏用）
// kind: 'wall' 墙/平台 | 'floor' 地面格（淡） | 'goal' 终点/目标 | 'hazard' 陷阱 | 'switch' 开关/机关
```

```js
// 网格关卡示例
for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
  const cell = level.map[gy][gx], cx = boardX + gx * S + S / 2, cy = boardY + gy * S + S / 2;
  Art.tile(ctx, cx, cy, S, 'floor');
  if (cell === '#') Art.tile(ctx, cx, cy, S, 'wall');
  if (cell === 'G') Art.tile(ctx, cx, cy, S, 'goal');
}
```

### 自定义形状（上面没有的东西）

```js
Art.shape(ctx, [[x1, y1], [x2, y2], ...], role)   // 任意多边形，点可以是 [x,y] 或 {x,y}
Art.circle(ctx, x, y, r, role)                     // 圆
Art.poly(ctx, x, y, r, sides, rot, role)           // 正多边形
// role: 'player' | 'enemy' | 'pickup' | 'accent' | 'wall' | 'dim'
```

它们会按画风自动加上赛璐璐阴影 / 像素描边 / 发光 / 厚度 / 墨线 / 马克笔描边。**自定义物体用它们画，不要用 `D.*`**。复杂物体可以拼：身体用 `Art.circle`，再叠一个 `Art.poly` 当帽子。

### 辅助

```js
Art.dot(ctx, x, y, r, role, alpha)          // 小点（拖尾、脚印、粒子感的装饰）。role 可以是任意颜色角色
Art.trail(ctx, points, r, role)             // 一串轨迹点，越新越清楚。points: [{x,y}...]
Art.ring(ctx, x, y, r, role, alpha)         // 虚线圆（范围提示、轨道、技能范围）。role 可以是任意颜色角色
Art.frame(ctx, x0, y0, x1, y1)              // 场地边框（左上、右下）
Art.color(role)                             // 颜色角色 → 当前画风里的颜色
Art.name / Art.label                        // 当前画风名，如 'anime' / '二次元'
```

### UI（自动）

`UI.button / UI.panel / UI.score / UI.pill / UI.title / UI.text / UI.stars / UI.banner / UI.overlay` 的外观自动跟随画风，布局规则照旧按 `references/ui-design.md`。

`UI.text(ctx, s, x, y, { role, color, alpha, align })`：`role` 是字号（display / h1 / h2 / body / caption），`color` 只传 `C.dim`（弱化/说明）、`C.enemy`（警告）、`C.player`（强调）或不传（正文），画风会换成适合自己的版本（例如电子画风的弱化文字是青色，国风的强调是印红），`alpha` 0–1 用于淡入淡出的提示文字。

## 四、尺寸规则（画风好不好看的另一半）

| 物体 | 半径（竖屏 720 宽） | 理由 |
|---|---|---|
| 主角 | **28–40** | 小于 28 看不清表情和画风细节 |
| 敌人 | 22–36 | 和主角同一量级，危险感才够 |
| 收集物 | 20–30 | |
| 子弹/碎片 | 12–20 | |
| 网格格子 | 边长 ≥ 80 | 棋盘至少占屏宽 80%，不要缩在屏幕中间一小块 |

碰撞半径可以比画出来的小（`r * 0.8`，对玩家宽容），但**画的时候按上表**。

## 五、各画风的注意事项

- **arcade**：像素精灵在缩放时会自动对齐像素，不要再对它 `ctx.rotate` 小角度（像素会歪）；朝向用 `Art.warn` 的箭头表达
- **cyber**：发光很耗性能，同屏物体建议 ≤ 40 个
- **guofeng**：字体是楷体（系统自带），文字不要太长；按钮文字 2–4 个字最好看
- **shadiao**：线条会持续抖动是设计效果，不是 bug；主按钮文字会自动加"!!"
- **flat / anime**：浅色背景，`C.text` 是深色；需要在画面上写白字时先 `UI.overlay`

## 六、检查

```bash
node <skill>/scripts/smoke-test.mjs <项目> --style anime --steps "..."   # 用指定画风运行
```

- 截图里**看不出画风**（大片纯色、物体是纯色圆/三角）→ 说明还在用 `D.*` 画物体，换成 `Art.*`
- `check.mjs` 的 `[画风]` 警告逐条处理
- 交付前用选定画风截图，并和 `references/img/art-<画风>.jpg` 对比：背景、物体、UI 的"感觉"应该一致
