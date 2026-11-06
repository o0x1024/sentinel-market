# 测试：三层验证

截图只能说明"看起来怎样"，不能说明"规则对不对""能不能通关""难度合不合适"。按游戏类型选用下面三层：

| 层 | 工具 | 回答什么问题 | 谁必须用 |
|---|---|---|---|
| 1 冒烟 + 脚本步骤 | `smoke-test.mjs --steps` | 没崩、能走完 title→play→over、界面对 | 所有游戏 |
| 2 纯逻辑测试 | `logic-test.mjs` | 关卡可解吗？最少几步？规则算得对吗？ | **关卡制 / 解谜 / 有计算规则的游戏** |
| 3 Bot 试玩 | `smoke-test.mjs --bot` | 一个"会玩但不完美"的玩家能活多久、拿多少分？中后期出现了吗？ | **无尽 / 动作 / 生存类游戏** |

所有命令都在 skill 的 `scripts/` 下，**不要自己另写 playwright 脚本**（playwright 只装在 `scripts/node_modules`，在别的目录 `import 'playwright'` 会找不到）。需要自动玩就写 bot 文件交给 `--bot`。

---

## 0. 前提：把关键状态写进 `G.debug`

测试脚本看不到你的场景变量，只能看到 `G.debug` 和当前场景名。在 `update` 末尾或状态变化时写：

```js
G.debug.score = this.score;
G.debug.level = this.levelIndex;
G.debug.result = null;          // enter 里重置；赢了写 'win'，输了写 'lose'
G.debug.cause = null;           // 输的原因（'spike' / 'shadow' / 'hunter'…），逐局统计会汇总死因分布
G.debug.lives = this.lives;
```

约定：**一定要有 `result`**（`null` / `'win'` / `'lose'`），这样任何游戏都能用 `waitUntil:d.result` 等到一局结束。只放数字、字符串、布尔，不要放对象引用。

当前场景名在页面里是 `window.__GAME__.scene`，游戏代码里是 `G.sceneName`（**不是** `G.scene`，那是注册场景的方法）。

---

## 1. 脚本步骤：用"等事件"代替"猜时间"

```bash
node smoke-test.mjs <项目> --steps "shot:title;button:开始;waitScene:play;shot:play;waitUntil:d.result!=null,30000;waitScene:over,3000;shot:over;expect:d.score>=0"
```

| 指令 | 作用 |
|---|---|
| `button:文字` | 点击画面上文字包含该内容的按钮（或图标名，如 `button:pause`），自动等它变成可点。**点按钮一律用它**，按钮坐标会随手机高度变化 |
| `tap:x,y` | 点击（逻辑坐标，用于点游戏区域） |
| `drag:x1,y1,x2,y2[,ms]` | 拖动：按下 → 匀速移动 → 松手 |
| `press:x,y,ms` | 在某点按住 ms 后松手（"按住蓄力""松手触发"类游戏） |
| `down:x,y` / `move:x,y` / `up` | 分步控制指针，可以中间插 `wait`、`shot` |
| `key:Code` / `hold:Code,ms` | 键盘按一下 / 按住（`hold` 只用于键盘） |
| `wait:ms` | 固定等待（只在等动画时用） |
| `waitScene:名字[,ms]` | 等进入某场景**且淡入结束**（之后截图亮度正常），默认最多 10 秒 |
| `waitUntil:表达式[,ms]` | 等表达式为真。`d` = `G.debug`，`scene` = 场景名，`fading` = 是否在切场景淡入中 |
| `expect:表达式` | 断言，不成立就记为失败 |
| `shot:名字` | 截图 |

- ✅ `button:开始;waitScene:play` ❌ `tap:360,1060;wait:1500`（坐标会随手机高度变，机器慢一点也会错）
- ✅ `waitUntil:d.result=='win',8000` ❌ `wait:8000` 然后看截图猜赢没赢
- 某一步写错或超时：报告写明是**第几步**、原因和当时的 `debug`，截一张 `FAIL-stepN.png`，然后**停止后面的步骤**（后面的失败通常只是连锁反应）。确实要继续执行加 `--keep-going`
- **每个会改变状态的输入后面都跟一个等待**，等游戏真的处理完再发下一个。连续 `drag;drag;drag` 时，前一步的动画还没结束，后一步可能被游戏忽略：
  - ✅ `drag:...;waitUntil:d.steps==1;drag:...;waitUntil:d.steps==2`
  - ❌ `drag:...;drag:...;drag:...`
  - 所以游戏要把"已处理的操作次数"（如 `steps`、`moves`、`shots`）写进 `G.debug`
- 只想跑步骤、不要随机乱玩：加 `--seconds 0`

**解谜游戏**要为每一关写一条"标准解法"脚本，证明每关都能通过：

```bash
--steps "button:开始;waitScene:levels;button:1;waitScene:play;drag:300,500,420,500;waitUntil:d.result=='win',8000;shot:l1-win"
```

---

## 2. 纯逻辑测试（关卡制 / 解谜必做）

**前提**：规则写在不依赖画面的文件里（例如 `logic.js`：`function simulate(level, moves)`、`function solve(level)`），`game.js` 只调用它们。这样同一份规则既能玩、又能在 Node 里被穷举验证。

```bash
node <skill>/scripts/logic-test.mjs <项目> <项目>/tests/levels.test.mjs
```

默认按 `index.html` 顺序加载除 `ui.js`、`game.js` 外的所有脚本（包括 `engine.js`，所以 `U.*` 可用）。

```js
// tests/levels.test.mjs
export default function (g, assert, log) {
  const { LEVELS, solve } = g;               // 游戏里的全局 const / function
  let prev = 0;
  LEVELS.forEach((lv, i) => {
    const r = solve(lv);                      // 你写的求解器：穷举/BFS，返回最少步数或 null
    assert(r !== null, `第 ${i + 1} 关有解`);
    log(`第 ${i + 1} 关 最少 ${r} 步，分支数 ${lv.choices ?? '-'}`);
    assert(r >= prev, `第 ${i + 1} 关不比上一关简单`);
    prev = r;
  });
}
```

求解器怎么写：
- 操作是"从有限选项里选"（剪哪根绳、点哪个格、按什么顺序）→ BFS/穷举所有组合，规模 ≤ 10⁶ 种都很快
- 操作是连续的（拖拽角度、力度）→ 把它离散化（每 5° 一个角度、10 档力度）再穷举
- 同时统计 **"有多少种操作组合能过关"**：太多 = 太简单（乱点都能过），只有 1 种且步数很多 = 可能太难

测试文件放在 `<项目>/tests/`，交付时可以保留。

---

## 3. Bot 试玩（无尽 / 动作类必做）

### 3.1 写 bot：先让游戏把"bot 需要看的东西"写进 G.debug

bot 只看得到 `G.debug`。只给"最近的一个威胁"不够，bot 会撞上第二近的那个。**把所有威胁和目标压成扁平数组**（只放数字，每帧更新）：

```js
// game.js 的 update 末尾
G.debug.px = this.player.x; G.debug.py = this.player.y;
G.debug.threats = this.enemies.flatMap((e) => [Math.round(e.x), Math.round(e.y), e.r, Math.round(e.vx), Math.round(e.vy)]); // 每 5 个一组
G.debug.goals = this.coins.flatMap((c) => [Math.round(c.x), Math.round(c.y)]);                                              // 每 2 个一组
```

然后 bot 用"候选落点打分"：在玩家周围取一圈候选点，给每个点打分（离目标近加分、离威胁的**未来位置**近扣分），走向最高分的点。

```js
// tests/bot.mjs —— 每约 100ms 调用一次。s = { scene, debug, W, H, time, buttons }
const R = 140, LOOK = 0.4;                               // 每次移动的距离、预判威胁未来 0.4 秒的位置
export default async function (s, act) {
  const d = s.debug;
  if (s.scene !== 'play') return (await act.button('开始')) || act.button('再来');   // 标题/结算：按文字点按钮
  if (d.px === undefined) return;
  const T = [], Gs = [];
  for (let i = 0; i < (d.threats || []).length; i += 5) { const [x, y, r, vx, vy] = d.threats.slice(i, i + 5); T.push({ x: x + vx * LOOK, y: y + vy * LOOK, r }); }
  for (let i = 0; i < (d.goals || []).length; i += 2) Gs.push({ x: d.goals[i], y: d.goals[i + 1] });
  let best = null;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, x = Math.min(s.W - 40, Math.max(40, d.px + Math.cos(a) * R)), y = Math.min(s.H - 40, Math.max(200, d.py + Math.sin(a) * R));
    let score = 0;
    for (const t of T) { const dist = Math.hypot(t.x - x, t.y - y) - t.r; if (dist < 60) score -= 1000; else score -= 3000 / dist; }
    for (const g of Gs) score += 400 / (Math.hypot(g.x - x, g.y - y) + 30);
    if (!best || score > best.score) best = { x, y, score };
  }
  await act.drag(d.px, d.py, best.x, best.y, 120);       // 操作方式换成你的游戏（拖动/点击/按键）
}
```

它不需要很强，只要**明显比乱按好**。

**操作方式要和游戏一致**。上面的 `drag` 每次都是"按下→移动→松手"，适合"拖一下就弹出/滑一格"的游戏。如果你的游戏是"**手指按住不放、角色一直跟着手指**"，每 100ms 松手一次会让角色走走停停，要改成一直按住、只移动：

```js
let holding = false;
export default async function (s, act) {
  if (s.scene !== 'play') { if (holding) { await act.up(); holding = false; } return (await act.button('开始')) || act.button('再来'); }
  const d = s.debug; if (d.px === undefined) return;
  const best = pickBest(s, d);                              // 同上面的候选落点打分
  if (!holding) { await act.down(d.px, d.py); holding = true; }
  await act.move(best.x, best.y);                            // 不松手，只移动
}
```

### 3.2 跑法

```bash
node <skill>/scripts/smoke-test.mjs <项目> --bot <项目>/tests/bot.mjs --seconds 60   # 策略 bot
node <skill>/scripts/smoke-test.mjs <项目> --seconds 60                             # 随机乱按（对照组）
# 压缩测试：后期档位 bot 很难自然打到，用 --init 把档位时间缩短，确认后期内容能运行、好看、不崩
node <skill>/scripts/smoke-test.mjs <项目> --bot <项目>/tests/bot.mjs --seconds 40 --init "CFG.tiers.forEach(t => t.at /= 4)"
```

`act` 有：`button(文字)`（找不到返回 false）、`tap(x,y)` `drag(x1,y1,x2,y2,ms)` `press(x,y,ms)` `down(x,y)` `move(x,y)` `up()` `key(Code)` `hold(Code,ms)`。

bot 和随机乱按死了都会自动重开。报告末尾有**逐局统计**、**死因分布**（来自 `G.debug.cause`）和一行 `SUMMARY {...}`（局数、平均/最高得分、平均/最长存活、最高档位），**以这个为准**，不要看"最终状态"（那只是最后一局的中途）。存活平均包含最后那局未结束的时间。

**样本量**：bot 的成绩波动很大（同一个 bot 一局活 15 秒、一局活 50 秒很正常），只跑一局不能下结论。策略 bot 跑 `--seconds 120`（通常 3–6 局），随机乱按跑 `--seconds 60`（通常 ≥ 5 局），判断都用 SUMMARY 的平均值和最高值。

### 3.3 判断标准

| 检查 | 合格 | 不合格时 |
|---|---|---|
| 判断有用 | 策略 bot 的**得分**和**存活时间**都明显高于随机：得分 ≥ 随机的 2 倍（随机得 0 分时，策略 bot ≥ 10 分也算），存活 ≥ 随机的 1.5 倍 | 只有得分高、存活差不多 → 生存不需要判断，危险太少或太慢；回 level-design.md B 规则 2 |
| 随机乱按会死 | 随机乱按平均存活 < 30 秒 | 危险密度太低 |
| 策略 bot 会死 | 120 秒内至少输过一次 | 难度上升太慢 |
| 档位出现 | 120 秒的策略 bot 测试中 `tierMax` ≥ 2；压缩测试到达最后一档且无报错 | 档位间隔太长（见 level-design.md B 规则 1） |
| 每档都有威胁 | 死因分布里不只一种死因（后期档位的新威胁真的能杀死玩家） | 新威胁太弱，只是装饰；加强或换掉 |
| 后期内容可见 | 压缩测试的截图里能看到每一档的新内容 | 新内容画得太暗/太小 |

---

## 环境注意

- macOS 的 `sed -i` 必须写成 `sed -i '' 's/a/b/' 文件`，Linux 是 `sed -i 's/a/b/' 文件`。改文件优先用编辑工具，不要用 `sed -i`，也不要把多个写文件命令用 `&&` 串起来（一个失败后面全部不执行，检查却仍然通过，因为模板本身能过）
- skill 目录里唯一允许写入的是 `scripts/node_modules`（首次 `npm install`）。其它 skill 文件一律不要改
- 截图目录 `.smoke/` 每次运行都会清空重建；交付前删除
