# 美术方向（纯程序绘制）

没有美术素材也能好看。关键是**统一**：统一调色板、统一形状语言、统一线条粗细。

## 调色板（选一套，原样复制到 CFG.color）

每套 7 色：bg 背景 / bg2 次背景 / player 玩家 / enemy 危险 / pickup 奖励 / text 文字 / dim 弱化

```js
// 1. 深夜霓虹（动作、躲避）
{ bg: '#1b1b3a', bg2: '#2a2a5a', player: '#ffd166', enemy: '#ef476f', pickup: '#06d6a0', text: '#ffffff', dim: '#8888aa' }
// 2. 糖果（轻松、休闲、消除）
{ bg: '#fff1e6', bg2: '#fde2e4', player: '#7b5cff', enemy: '#ff5c8a', pickup: '#2ec4b6', text: '#3d3355', dim: '#b8a9c9' }
// 3. 森林纸艺（解谜、治愈）
{ bg: '#e9edc9', bg2: '#ccd5ae', player: '#d4a373', enemy: '#bc4749', pickup: '#386641', text: '#283618', dim: '#8a9a5b' }
// 4. 单色极简（硬核、节奏）
{ bg: '#0d0d0d', bg2: '#1f1f1f', player: '#ffffff', enemy: '#ff3b3b', pickup: '#ffffff', text: '#ffffff', dim: '#666666' }
// 5. 海洋（漂浮、物理）
{ bg: '#023047', bg2: '#0a4a6e', player: '#ffb703', enemy: '#fb8500', pickup: '#8ecae6', text: '#ffffff', dim: '#5f8fa8' }
// 6. 复古掌机（像素感）
{ bg: '#0f380f', bg2: '#306230', player: '#9bbc0f', enemy: '#d04848', pickup: '#e0f8d0', text: '#e0f8d0', dim: '#306230' }
// 7. 日落（氛围、叙事感）
{ bg: '#2d1e2f', bg2: '#4a2c40', player: '#ffcf56', enemy: '#e8505b', pickup: '#f9a26c', text: '#fff4e0', dim: '#9a7a8c' }
```

规则：
- 代码中**不写任何其它颜色**，只用 `C.xxx`（纯黑 `#000` 和纯白 `#fff` 用于阴影、高光、眼睛除外）；需要透明就用 `ctx.globalAlpha`
- 玩家颜色 = 画面里最亮/最饱和的
- 危险物 = 暖红色系；奖励 = 绿/青色系（与危险对比最强）

## 形状语言

| 形状 | 传达 | 用于 |
|---|---|---|
| 圆 | 友好、柔软、可收集 | 玩家、奖励 |
| 三角、尖刺 | 危险 | 敌人、陷阱 |
| 方块 | 稳定、静态 | 墙、平台 |
| 菱形、星形 | 珍贵 | 稀有奖励 |
| 六边形 | 科技、结构 | 网格谜题 |

## 让几何图形有"生命"

```js
// 1. 呼吸
const s = 1 + Math.sin(G.time * 4) * 0.05;
// 2. 眼睛（两个白圆 + 两个黑圆，瞳孔看向移动方向）
function drawEyes(ctx, x, y, r, lookX = 0, lookY = 0) {
  for (const side of [-1, 1]) {
    const ex = x + side * r * 0.35, ey = y - r * 0.15;
    D.circle(ctx, ex, ey, r * 0.22, '#fff');
    D.circle(ctx, ex + lookX * r * 0.08, ey + lookY * r * 0.08, r * 0.11, '#000');
  }
}
// 3. 眨眼：每隔 2-4 秒，眼睛 scaleY 0.1 持续 0.1 秒
// 4. 阴影：在物体下方画一个半透明椭圆
ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, y + r, r * 0.9, r * 0.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
// 5. 描边 + 高光：大圆 + 左上角一个小的浅色圆
```

## 背景（选一种）

```js
// 渐变
const g = ctx.createLinearGradient(0, 0, 0, G.H); g.addColorStop(0, C.bg2); g.addColorStop(1, C.bg);
ctx.fillStyle = g; ctx.fillRect(0, 0, G.W, G.H);

// 网格线
ctx.globalAlpha = 0.15;
for (let x = 0; x <= G.W; x += 80) D.line(ctx, x, 0, x, G.H, C.dim, 2);
for (let y = 0; y <= G.H; y += 80) D.line(ctx, 0, y, G.W, y, C.dim, 2);
ctx.globalAlpha = 1;

// 漂浮星点 / 视差：见模板 game.js 的 BG_STARS（在 update 里移动，在 draw 里画）
```

## 文字

- 标题 80–120px，正文 32–40px，提示 28px，分数 64–120px
- 浅色背景用深色文字；重要文字加 `shadow`
- 中文游戏名 2–4 个字最好看，可在字间加空格："绕 圈"

## 截图自检

1. 缩略图测试：缩小看，玩家是否一眼可见？
2. 灰度测试：想象去掉颜色，好坏物体还能靠形状区分吗？
3. 画面是否有大片空白？（加背景元素或调整布局）
4. 有没有文字和物体重叠？
