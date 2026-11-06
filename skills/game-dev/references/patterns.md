# 代码片段（直接复制，按需改名）

所有片段都基于 engine.js，写在场景对象中。`this` 指场景。

**片段里用 `D.circle` / `D.poly` 等画的物体只是示意**，放进游戏时换成对应的 `Art.*`（主角 `Art.hero`、敌人 `Art.enemy/spiky`、道具 `Art.pickup`、方块 `Art.block/tile`、其它 `Art.shape/circle/poly`），颜色参数换成 role（`'player'` / `'enemy'` / `'pickup'` …）。见 `references/art-styles.md`。

---

## 1. 定时生成 + 难度递增

```js
// enter 里
this.elapsed = 0; this.spawnT = 1; this.enemies = [];
// update 里
this.elapsed += dt;
this.spawnT -= dt;
if (this.spawnT <= 0) {
  this.spawnT = Math.max(CFG.spawnMin, CFG.spawnStart - this.elapsed * CFG.spawnRamp);
  const speed = Math.min(CFG.speedMax, CFG.speedStart + this.elapsed * CFG.speedRamp);
  this.enemies.push({ x: U.rand(40, G.W - 40), y: -40, r: 24, vy: speed, dead: false });
}
for (const e of this.enemies) { e.y += e.vy * dt; if (e.y > G.H + 50) e.dead = true; }
U.removeDead(this.enemies);
```

## 2. 按钮（必须用 UI 组件）

```js
// enter
this.btn = UI.button({ x: G.W / 2, y: UI.ACTION_Y, label: '开始', icon: 'play', key: 'action' });
// update
if (UI.clicked(this.btn)) G.go('play');
// draw
UI.drawButton(ctx, this.btn);
```
更多组件（面板、HUD、关卡选择、暂停菜单）见 `references/ui-design.md`。

## 3. 拖拽跟随（手机上替代摇杆）

```js
// update 里：手指按住时玩家平滑跟随手指的水平位置
if (G.input.pointer.down) this.targetX = G.input.pointer.x;
this.player.x = U.damp(this.player.x, this.targetX, 15, dt);
this.player.x = U.clamp(this.player.x, this.player.r, G.W - this.player.r);
// 电脑键盘补充
this.targetX += G.input.axisX() * CFG.moveSpeed * dt;
```

## 4. 拖拽物体（拖起、放下）

```js
const p = G.input.pointer;
if (p.pressed) this.dragging = this.items.find((it) => U.dist(p.x, p.y, it.x, it.y) < it.r + 20) || null;
if (this.dragging && p.down) { this.dragging.x = p.x; this.dragging.y = p.y; }
if (this.dragging && p.released) { this.drop(this.dragging); this.dragging = null; }
```

## 5. 弹弓/蓄力发射（拖拽方向和力度）

```js
const p = G.input.pointer;
if (p.pressed) this.aiming = true;
if (this.aiming && p.released) {
  this.aiming = false;
  const dx = p.startX - p.x, dy = p.startY - p.y;              // 往反方向拉
  const power = Math.min(Math.hypot(dx, dy), CFG.maxPull) * CFG.launchScale;
  const a = Math.atan2(dy, dx);
  this.ball.vx = Math.cos(a) * power; this.ball.vy = Math.sin(a) * power;
  G.sfx('jump');
}
// draw：瞄准线
if (this.aiming) D.line(ctx, p.startX, p.startY, p.x, p.y, '#fff8', 4);
```

## 6. 重力 + 跳跃（带土狼时间和跳跃缓冲，手感关键）

```js
// enter
this.pl = { x: 200, y: 600, w: 50, h: 50, vx: 0, vy: 0, onGround: false, coyote: 0, buffer: 0 };
// update
const pl = this.pl;
pl.buffer -= dt; pl.coyote -= dt;
if (G.input.pressed('action') || G.input.tapped) pl.buffer = CFG.jumpBuffer;   // 0.1
if (pl.onGround) pl.coyote = CFG.coyoteTime;                                   // 0.1
if (pl.buffer > 0 && pl.coyote > 0) {
  pl.vy = -CFG.jumpSpeed; pl.buffer = 0; pl.coyote = 0; G.sfx('jump');
}
// 松手提前结束跳跃 = 可变跳跃高度
if (!(G.input.down('action') || G.input.pointer.down) && pl.vy < 0) pl.vy *= 0.5;
pl.vy = Math.min(pl.vy + CFG.gravity * dt, CFG.maxFall);
pl.y += pl.vy * dt;
// 和平台碰撞（平台为 {x,y,w,h}）
pl.onGround = false;
for (const pf of this.platforms) {
  if (U.rectHit(pl, pf) && pl.vy >= 0 && pl.y + pl.h - pl.vy * dt <= pf.y + 1) {
    pl.y = pf.y - pl.h; pl.vy = 0; pl.onGround = true;
  }
}
```

## 7. 网格谜题（格子坐标 + 补间移动）

```js
const COLS = 6, ROWS = 6, CELL = 100, OX = (G.W - COLS * CELL) / 2, OY = 300;
const cellToPx = (c, r) => ({ x: OX + c * CELL + CELL / 2, y: OY + r * CELL + CELL / 2 });
const pxToCell = (x, y) => ({ c: Math.floor((x - OX) / CELL), r: Math.floor((y - OY) / CELL) });
// 网格数据：this.grid[r][c] = 0 空 / 1 墙 / ...
this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// 滑动移动一格（带补间，移动中不接受输入）
const dir = G.input.pointer.swipe || (G.input.pressed('left') && 'left') || (G.input.pressed('right') && 'right') || (G.input.pressed('up') && 'up') || (G.input.pressed('down') && 'down');
if (dir && !this.moving) {
  const d = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[dir];
  const nc = this.pc + d[0], nr = this.pr + d[1];
  if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && this.grid[nr][nc] !== 1) {
    this.pc = nc; this.pr = nr; this.moving = true;
    const t = cellToPx(nc, nr);
    G.tween(this.player, { x: t.x, y: t.y }, 0.12, 'outQuad').then(() => (this.moving = false));
    G.sfx('blip');
  } else { G.shake(4, 0.1); G.sfx('hit', { pitch: 1.5 }); }   // 撞墙反馈
}
```

## 8. 浮动文字（"+1"、"完美!"）

```js
// enter: this.floaters = [];
popText(x, y, str, color = '#fff') {
  const f = { x, y, str, color, alpha: 1, scale: 0.5 };
  this.floaters.push(f);
  G.tween(f, { scale: 1.2 }, 0.15, 'outBack');
  G.tween(f, { y: y - 80, alpha: 0 }, 0.8, 'outQuad', 0.2).then(() => (f.dead = true));
},
// update: U.removeDead(this.floaters);
// draw:
for (const f of this.floaters) D.withTransform(ctx, f.x, f.y, { scale: f.scale, alpha: f.alpha }, () => UI.text(ctx, f.str, 0, 0, { role: 'h2', color: f.color }));
```

## 9. 连击（Combo）

```js
// enter: this.combo = 0; this.comboT = 0;
// 得分时：
this.combo++; this.comboT = CFG.comboWindow;           // 例如 1.5 秒
this.score += this.combo;
G.sfx('coin', { pitch: 1 + Math.min(this.combo, 12) * 0.06 });   // 音调递增
if (this.combo % 5 === 0) { this.popText(G.W / 2, 400, this.combo + ' 连击!', CFG.color.player); G.shake(6, 0.15); }
// update：
if (this.comboT > 0 && (this.comboT -= dt) <= 0) this.combo = 0;
```

## 10. 关卡制（数据驱动）

```js
// levels.js（在 index.html 中放在 game.js 之前）
const LEVELS = [
  { name: '热身', walls: [[2, 2], [3, 2]], goal: [5, 5], start: [0, 0] },
  { name: '拐角', walls: [[1, 0], [1, 1], [1, 2]], goal: [0, 5], start: [0, 0] },
];
// play.enter(data)
this.levelIndex = data.level || 0;
const L = LEVELS[this.levelIndex];
// 过关
G.sfx('win'); G.save('unlocked', Math.max(G.load('unlocked', 0), this.levelIndex + 1));
G.after(0.8, () => this.levelIndex + 1 < LEVELS.length ? G.go('play', { level: this.levelIndex + 1 }) : G.go('over', { win: true }));
```

## 11. 摄像机跟随（世界比屏幕大时）

```js
// update
this.cam = this.cam || { x: 0, y: 0 };
this.cam.y = U.damp(this.cam.y, this.player.y - G.H * 0.6, 8, dt);
// draw：先画世界（偏移），再画 UI（不偏移）
ctx.save(); ctx.translate(-this.cam.x, -this.cam.y);
/* ...画世界... */
ctx.restore();
UI.score(ctx, this.score, G.W / 2, UI.HUD_Y);   // UI 固定在屏幕上
```

## 12. 屏幕环绕

```js
if (o.x < -o.r) o.x = G.W + o.r; else if (o.x > G.W + o.r) o.x = -o.r;
```

## 13. 朝目标移动 / 追踪

```js
const a = U.angle(e.x, e.y, this.player.x, this.player.y);
e.x += Math.cos(a) * e.speed * dt; e.y += Math.sin(a) * e.speed * dt;
```

## 14. 反弹（圆碰墙）

```js
if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); }
if (b.x > G.W - b.r) { b.x = G.W - b.r; b.vx = -Math.abs(b.vx); }
if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy); }
```

## 15. 圆与圆弹开（两个物体不重叠）

```js
const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, overlap = a.r + b.r - d;
if (overlap > 0) { const nx = dx / d, ny = dy / d; a.x -= nx * overlap / 2; a.y -= ny * overlap / 2; b.x += nx * overlap / 2; b.y += ny * overlap / 2; }
```

## 16. 教学提示（首次游玩显示，操作后消失）

```js
// enter
this.hint = { alpha: G.load('played', false) ? 0 : 1 };
// 玩家第一次完成核心操作时
if (this.hint.alpha > 0) { G.tween(this.hint, { alpha: 0 }, 0.4); G.save('played', true); }
// draw
if (this.hint.alpha > 0) UI.text(ctx, '按住 蓄力，松开 发射', G.W / 2, G.H - 160, { role: 'body', alpha: this.hint.alpha * (0.6 + 0.4 * Math.sin(G.time * 4)) });
```

## 17. 简单对象状态机（敌人行为）

```js
// e.state: 'idle' | 'warn' | 'attack'; e.t: 当前状态计时
e.t += dt;
if (e.state === 'idle' && e.t > 2) { e.state = 'warn'; e.t = 0; }               // 预警（闪烁）给玩家反应时间
else if (e.state === 'warn' && e.t > 0.6) { e.state = 'attack'; e.t = 0; G.sfx('shoot'); }
else if (e.state === 'attack' && e.t > 0.3) { e.state = 'idle'; e.t = 0; }
// draw：预警状态闪烁
const visible = e.state !== 'warn' || Math.floor(e.t * 10) % 2 === 0;
```

## 18. 延迟轨迹回放（影子、残影、"过去的自己"）

```js
// enter
this.trail = [];                 // 按时间记录玩家走过的点
// update：每帧记一个点，丢掉太旧的
this.elapsed += dt;
this.trail.push({ x: this.player.x, y: this.player.y, t: this.elapsed });
while (this.trail.length && this.trail[0].t < this.elapsed - CFG.shadowDelay - 1) this.trail.shift();
// 影子 = 玩家 shadowDelay 秒前的位置（在相邻两点之间插值，移动才平滑）
const tt = this.elapsed - CFG.shadowDelay;
if (tt > 0) {
  let i = this.trail.findIndex((p) => p.t >= tt);
  if (i > 0) { const a = this.trail[i - 1], b = this.trail[i], k = (tt - a.t) / (b.t - a.t || 1);
    this.shadow = { x: U.lerp(a.x, b.x, k), y: U.lerp(a.y, b.y, k), r: this.player.r }; }
}
if (this.shadow && U.circleHit(this.shadow, this.player) && this.elapsed > CFG.shadowDelay + 0.5) this.die('shadow');
// draw：已经"变成危险"的那段轨迹用危险色，还没到时间的用淡色预告
// D.polyline(ctx, this.trail.filter((p) => p.t <= tt), C.enemy, 6)
```

## 19. 相对拖动（手指不挡住角色）

```js
// 按下时记住"手指和角色的偏移"，之后角色跟着手指平移，而不是瞬移到手指下面
const P = G.input.pointer;
if (P.pressed) { this.offX = this.player.x - P.x; this.offY = this.player.y - P.y; }
if (P.down) {
  this.player.x = U.clamp(P.x + this.offX, this.player.r, G.W - this.player.r);
  this.player.y = U.clamp(P.y + this.offY, UI.HUD_BOTTOM + this.player.r, G.H - this.player.r);
}
```

## 20. 松手触发（按住瞄准/蓄力，松手执行）

```js
const P = G.input.pointer;
if (P.pressed && P.y > UI.HUD_BOTTOM) { this.charging = true; this.charge = 0; }
if (this.charging && P.down) this.charge = Math.min(1, this.charge + dt / CFG.chargeTime);
if (this.charging && P.released) { this.charging = false; this.release(this.charge); }  // 松手那一帧执行
// draw：蓄力时画 UI.ring(ctx, this.player.x, this.player.y, 70, this.charge)
// 测试：--steps "press:360,900,800;waitUntil:d.releases==1"
```

## 21. 回合制逐步移动 + 撤销 + 结果面板（解谜类骨架）

规则放 `logic.js`（纯函数，可被 logic-test 验证），场景只负责输入、动画和面板。

```js
// logic.js —— 不碰 G / ctx
function initState(level) { return { p: level.start, steps: 0, result: null /* 'win' | 'lose' */ }; }
function applyMove(state, level, dir) { /* 返回新的 state 对象，不修改旧的 */ }

// game.js —— play 场景
enter(data) {
  this.levelIndex = data.index || 0;
  this.level = LEVELS[this.levelIndex];
  this.s = initState(this.level);
  this.history = [];                  // 撤销栈：存旧 state
  this.phase = 'play';                // 'play' | 'anim' | 'panel'
  this.btnUndo = UI.button({ x: G.W / 2 - 170, y: UI.ACTION_Y, w: 300, label: '撤销', icon: 'undo', kind: 'secondary' });
  this.btnNext = UI.button({ x: G.W / 2, y: 900, label: '下一关', icon: 'play', key: 'action' });
  this.btnRetry = UI.button({ x: G.W / 2, y: 900, label: '再试一次', icon: 'restart', key: 'action' });
  G.debug.result = null; G.debug.steps = 0;
},
update(dt) {
  if (this.phase === 'play') {
    const dir = G.input.pointer.swipe || (G.input.pressed('left') && 'left') || (G.input.pressed('right') && 'right')
             || (G.input.pressed('up') && 'up') || (G.input.pressed('down') && 'down');
    if (dir) {
      const next = applyMove(this.s, this.level, dir);
      if (next !== this.s) {
        this.history.push(this.s); this.s = next;
        this.phase = 'anim'; G.sfx('blip');
        G.after(CFG.moveTime, () => {           // 动画结束后再接受下一次输入、再判定结果
          G.debug.steps = this.s.steps;
          if (this.s.result) { G.debug.result = this.s.result; this.phase = 'panel'; G.sfx(this.s.result === 'win' ? 'win' : 'hit'); }
          else this.phase = 'play';
        });
      }
    }
    if (UI.clicked(this.btnUndo) && this.history.length) { this.s = this.history.pop(); G.debug.steps = this.s.steps; }
  } else if (this.phase === 'panel') {
    if (this.s.result === 'win' && UI.clicked(this.btnNext)) G.go('play', { index: this.levelIndex + 1 });
    if (this.s.result === 'lose' && UI.clicked(this.btnRetry)) G.go('play', { index: this.levelIndex });
  }
},
draw(ctx) {
  // ...画棋盘
  if (this.phase !== 'panel') UI.drawButton(ctx, this.btnUndo);
  else {
    UI.overlay(ctx); UI.panel(ctx, G.W / 2, 700, 560, 520, { title: this.s.result === 'win' ? '过关!' : '失败' });
    UI.drawButton(ctx, this.s.result === 'win' ? this.btnNext : this.btnRetry);   // 同位置的两个按钮只画一个 → 只有它响应
  }
},
```

要点：`phase` 决定接受哪些输入；同一位置的按钮只画当前那个；撤销栈存整个旧 state（state 小，直接存最简单）。
