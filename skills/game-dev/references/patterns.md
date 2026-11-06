# 代码片段（直接复制，按需改名）

所有片段都基于 engine.js，写在场景对象中。`this` 指场景。

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

## 2. 按钮（画 + 点击）

```js
// 定义（enter 里）
this.btn = { x: G.W / 2 - 150, y: 900, w: 300, h: 100, label: '开始', scale: 1 };
// update 里
const p = G.input.pointer;
if (G.input.tapped && U.pointInRect(p.x, p.y, this.btn)) {
  G.sfx('click');
  this.btn.scale = 0.9; G.tween(this.btn, { scale: 1 }, 0.2, 'outBack');
  // 执行动作
}
// draw 里
const b = this.btn;
D.withTransform(ctx, b.x + b.w / 2, b.y + b.h / 2, { scale: b.scale }, () => {
  D.roundRect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 24, CFG.color.player);
  D.text(ctx, b.label, 0, 0, { size: 40, color: CFG.color.bg });
});
```

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
for (const f of this.floaters) D.withTransform(ctx, f.x, f.y, { scale: f.scale, alpha: f.alpha }, () => D.text(ctx, f.str, 0, 0, { size: 40, color: f.color }));
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
D.text(ctx, String(this.score), G.W / 2, 100, { size: 64 });   // UI 固定在屏幕上
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
if (this.hint.alpha > 0) D.text(ctx, '按住 蓄力，松开 发射', G.W / 2, G.H - 200, { size: 36, alpha: this.hint.alpha * (0.6 + 0.4 * Math.sin(G.time * 4)) });
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
