# 引擎 API（engine.js 全部能力，只用这里列出的）

> UI（按钮、面板、HUD、图标、标题文字）用 `ui.js` 的组件，API 见 `references/ui-design.md`。下面的 `D.*` 只用于绘制游戏世界里的对象。

> 坐标系：逻辑分辨率，左上角 (0,0)，y 向下。竖屏游戏宽度固定 720，**高度 `G.H` 随手机长宽比在 1280–1600 之间变化**（长屏手机没有黑边）；横屏游戏反过来，高度固定、宽度变化。**你永远只用逻辑坐标**，底部元素用 `G.H - 距离` 定位。不想自适应时 `Engine.create({ ..., fit: 'fixed' })`。
> 角度一律用弧度。时间一律用秒。速度一律用 像素/秒，移动必须 `x += vx * dt`。

## 创建与场景

```js
const G = Engine.create({ width: 720, height: 1280, background: '#1b1b3a', id: 'mygame' });
// id 用于存档前缀，每个游戏不同

G.scene('play', {
  enter(data) { /* 进入场景时初始化所有状态，data 来自 G.go 的第二个参数 */ },
  update(dt)  { /* 每帧逻辑：输入、移动、碰撞。dt 是秒（约 0.016） */ },
  draw(ctx)   { /* 每帧绘制。只画，不改状态 */ },
  exit()      { /* 可选 */ },
});
G.start('title');          // 启动（整个游戏只调用一次，放在 game.js 最后）
G.go('over', { score });   // 切场景：下一帧生效，自动清空 tween/计时器/粒子
G.sceneName                // 当前场景名（注意：G.scene 是注册场景的方法，不是场景名）
G.W, G.H                   // 逻辑宽高
G.time, G.frame            // 游戏总时间(秒)、帧数
G.paused = true            // 暂停（任意输入恢复；切到后台会自动暂停）
G.debug.score = 10         // 写给测试脚本看的状态（强烈推荐，见 references/testing.md）
```

场景方法里 `this` 就是场景对象本身，状态存在 `this.xxx` 上，并且**必须在 enter 里重置**（否则重开游戏会残留旧状态）。

切场景的顺序：旧场景 `exit()` → 清空 tween/计时器/粒子 → 新场景 `enter(data)`。所以在 `enter` 里新建的 tween/计时器不会被清掉，在 `exit` 里建的会被清掉。

## 输入（键盘/鼠标/触屏统一）

```js
const I = G.input;
I.tapped                 // 本帧是否点击/触摸（= I.pointer.pressed）
I.pointer.x, I.pointer.y // 指针逻辑坐标
I.pointer.down           // 是否按住（拖拽用）
I.pointer.pressed / released
I.pointer.startX/startY  // 本次按下的起点
I.pointer.swipe          // 松手那一帧：'left'|'right'|'up'|'down'|null（滑动>40px）
I.anyPressed()           // 本帧任意键或点击（"点击任意处开始"）

I.down('left')           // 动作是否按住
I.pressed('action')      // 本帧刚按下
I.released('action')
I.axisX(), I.axisY()     // -1 / 0 / 1
I.bind({ jump: ['Space', 'ArrowUp', 'KeyW'] })   // 自定义动作
// 默认动作：left right up down action(空格/回车/Z/J) cancel(Esc/X/P)
// 也可以直接用按键码：I.pressed('KeyR')
```

**手机优先**：每个操作都必须能用点击/拖拽/滑动完成。键盘只是电脑上的补充。

## 动画与反馈

```js
G.tween(obj, { x: 100, scale: 1 }, 0.3, 'outBack', delay?).then(() => {...})
// 缓动: linear inQuad outQuad inOutQuad outCubic outBack outElastic outBounce
const tw = G.tween(...); tw.cancel();

G.after(1.5, () => {...})       // 延时（返回值可 .cancel()）
G.every(0.5, () => {...})       // 循环

G.burst(x, y, { count: 12, color: '#ff0' 或 ['#f00','#fff'], speed: 300, life: 0.6,
                size: 6, gravity: 0, spread: Math.PI*2, angle: 0, drag: 2, shape: 'circle'|'square' })
G.shake(10, 0.2)       // 震屏：强度(px)、时长
G.hitstop(0.06)        // 顿帧：冻结逻辑若干秒（打击感）
G.flash('#fff', 0.12)  // 全屏闪色
```

## 音效（合成，无需文件）

```js
G.sfx('coin')                          // 预设：click jump coin hit explode shoot powerup lose win blip
G.sfx('coin', { pitch: 1.2 })          // 变调（连击时逐渐升高很爽）
G.audio.tone({ freq: 440, to: 880, dur: 0.1, type: 'square'|'sine'|'triangle'|'sawtooth', vol: 0.3, delay: 0 })
G.audio.noise({ dur: 0.3, vol: 0.4, cutoff: 1800 })
G.audio.muted = true
```

## 存档

```js
G.save('best', 42);            // 自动 JSON
const best = G.load('best', 0); // 第二个参数是默认值
```

## U：工具函数

```js
U.rand(a, b)  U.randInt(a, b)  U.pick(arr)  U.chance(0.3)  U.shuffle(arr)
U.clamp(v, a, b)  U.lerp(a, b, t)  U.damp(cur, target, 10, dt)   // 平滑跟随
U.dist(x1,y1,x2,y2)  U.angle(x1,y1,x2,y2)
U.circleHit(a, b)          // a,b 有 {x,y,r}
U.rectHit(a, b)            // a,b 有 {x,y,w,h}，x,y 为左上角
U.pointInRect(px, py, r)   // 按钮点击
U.removeDead(arr)          // 删除 dead===true 的元素（原地）
// 折线（pts = [{x,y}, ...]）：绳子、路径、轨迹、连线类游戏
U.polyLength(pts)                    // 总长度
U.pointAlong(pts, d)                 // 沿折线走 d 像素处 → {x, y, angle, i}（火沿绳子烧、物体沿路径走）
U.distToPoly(pts, px, py)            // 点到折线的最近距离 → {dist, i}（判断手指是否划到/点到线上）
U.distToSegment(px, py, x1, y1, x2, y2)
U.ease.outBack(t)          // 缓动函数也可直接用
```

## D：底层绘制函数（第一个参数都是 ctx）

> 游戏物体请用 `art.js` 的 `Art.*`（见 `references/art-styles.md`），它们会按画风绘制。`D.*` 只用于调试标记或画风覆盖不到的特效；用 `D.*` 画的东西不会跟随画风。

```js
D.circle(ctx, x, y, r, color)
D.ring(ctx, x, y, r, color, lineWidth)
D.rect(ctx, x, y, w, h, color)                 // x,y 左上角
D.roundRect(ctx, x, y, w, h, radius, color)
D.line(ctx, x1, y1, x2, y2, color, width)
D.poly(ctx, x, y, r, sides, rotation, color)   // 正多边形：3 三角 4 菱形 6 六边形。rotation=0 时第一个顶点朝右（+x）；要尖角朝上传 -Math.PI/2，朝向角度 a 就传 a
D.polyline(ctx, pts, color, width, { close, dash: [12, 8], fill })   // 折线/多边形
D.alpha(ctx, 0.4, () => { D.circle(...); D.line(...); })           // 半透明画一组东西（不用手动恢复 globalAlpha）
D.text(ctx, '文字', x, y, { size: 32, color: '#fff', align: 'center', weight: 'bold', alpha: 1, shadow: '#0006' })
D.withTransform(ctx, x, y, { scale, scaleX, scaleY, rot, alpha }, () => {   // 可只传 scaleX/scaleY 做挤压拉伸
  // 在这里以 (0,0) 为中心绘制，会被缩放/旋转
});
```

需要更复杂的形状时直接用原生 Canvas API（`ctx.beginPath()` / `ctx.arc` / `ctx.fill()` 等），用完记得 `ctx.globalAlpha = 1`。

## 引擎自动处理的事（不要自己再做）

- 游戏循环、dt 计算（上限 1/30 秒防穿透）
- 屏幕缩放与黑边、高清屏 (devicePixelRatio)
- 触屏防滚动/防缩放、iOS 音频解锁
- 切后台暂停、场景切换淡入
- 运行时错误显示在屏幕顶部红条 + 记录到 `window.__GAME__.errors`
