# UI 设计规范

UI 丑的根源：每个元素都临场决定字号、颜色、位置。本规范把这些决定**全部固定**：用 `ui.js` 的组件，按本文的分区和线框摆放，按游戏类型套用配方。

UI 的**外观**（按钮形状、字体、描边、发光、面板样式）由画风决定，见 `references/art-styles.md`；本文规定的是**用哪些组件、摆在哪里**。参照图：`references/img/art-<画风>.jpg`（每张依次是标题、游戏中、结算）。

---

## 一、十条硬约束

1. **按钮、面板、HUD 一律用 `UI.*` 组件**。禁止用 `D.rect` / `D.roundRect` + `D.text` 手拼按钮或面板。
2. **字号只用 6 级**：`display 120 / h1 76 / h2 52 / body 36 / caption 28 / hud 76`。用 `UI.text(ctx, s, x, y, { role: 'h2' })`，不写 `size`。
3. **颜色只来自 `CFG.color`**。UI 组件会自动计算描边、阴影和按下态的颜色，不要自己调色。
4. **一个界面只有 1 个主按钮**（`kind: 'primary'`），其它都是 `secondary` 或 `icon`。
5. **所有 UI 不得进入屏幕边距 `UI.M`（40px）以内。**
6. **顶部 HUD 区（y < `UI.HUD_BOTTOM` = 160）只放 HUD**，并且最多 3 个元素：左上胶囊、中间分数、右上暂停按钮。
7. **主按钮放在拇指区**（`UI.ACTION_Y` = 屏高 − 220），不要放在屏幕顶部。
8. **元素居中对齐到 `G.W/2`**，或者左右对齐到边距线。不允许"随手"摆一个 x=137。
9. **竖向间距用 `UI.stack(中心y, 数量, 间距)` 计算**：按钮间距 150，文字行距 ≥ 字号 × 1.4。
10. **文字不叠在游戏对象上**；需要叠加时，先 `UI.overlay(ctx)` 压暗背景，再放 `UI.panel`。

## 二、外观由画风决定

在 `config.js` 里设置 `art: { style: '...' }`（6 种画风及适用游戏见 `references/art-styles.md` 第一节）。`art.js` 会接管 `UI.*` 组件的绘制，所以：

- 不要给组件传自定义颜色或字体来"美化"，画风已经处理好了
- 同一个组件在不同画风里形状不同（胶囊 / 像素框 / 切角框 / 印章 / 卷轴……），**按本文坐标摆放即可，不需要因画风调整布局**
- 没有引入 `art.js` 时，组件退回 `CFG.ui.style` 的旧样式（casual / neon / minimal / paper），新项目不要用

## 三、组件速查（x,y 都是中心点）

```js
// —— 按钮：enter 里创建，update 里判断，draw 里画 ——
this.btnPlay = UI.button({ x: G.W/2, y: UI.ACTION_Y, label: '开始游戏', icon: 'play', key: 'action' });
this.btnPause = UI.button({ kind: 'icon', icon: 'pause', x: G.W - UI.M - 48, y: UI.HUD_Y, key: 'cancel' });
//   kind: 'primary'(默认) | 'secondary' | 'danger' | 'icon'；w/h 默认 400×112（icon 为 96×96）
//   enabled: false 时变灰且不可点；key: 键盘快捷键
if (UI.clicked(this.btnPlay)) G.go('play');          // 松手时触发，自带音效和弹跳
UI.drawButton(ctx, this.btnPlay);
//   ⚠️ 只有上一帧被 drawButton 画出来的按钮才响应点击和快捷键。
//   所以面板里的按钮只要"面板没显示就不画"，就不会被误触；同一位置放两个按钮（"下一关"/"再试一次"）时只画当前那个即可

// —— 文字 ——
UI.title(ctx, '游戏名', G.W/2, 320, { t: G.time });   // 标题：逐字波浪 + 描边
UI.text(ctx, '一句话玩法', G.W/2, 450, { role: 'body', color: C.dim });

// —— 面板与遮罩 ——
UI.overlay(ctx);                                      // 压暗整个屏幕
UI.panel(ctx, G.W/2, 700, 560, 500, { title: '暂停', titleColor: C.enemy });

// —— HUD ——
UI.score(ctx, this.score, G.W/2, UI.HUD_Y + 10, { scale: this.scorePop.s });
UI.pill(ctx, UI.M, UI.HUD_Y, { icon: 'coin', text: 12, align: 'left' });            // 左上（x 为左边缘）
UI.pill(ctx, G.W - UI.M, UI.HUD_Y, { icon: 'clock', text: '0:30', align: 'right' }); // 右上（x 为右边缘）
UI.bar(ctx, G.W/2, 200, 440, 28, hp / maxHp, { color: C.pickup });
UI.ring(ctx, x, y, 60, cooldown / max, { color: C.pickup, width: 10 });   // 环形进度：冷却、蓄力、倒计时
UI.hearts(ctx, G.W/2, 200, lives, maxLives, 52);
UI.stars(ctx, G.W/2, y, got, 3, 76);
UI.banner(ctx, '第 3 关', G.H/2, { alpha: this.bannerAlpha });

// —— 图标 ——
UI.icon(ctx, 'star', x, y, 48, C.player);
UI.icon(ctx, 'up', x, y, 48, C.enemy, angle + Math.PI / 2);   // 第 7 个参数：旋转（弧度），例如指向危险方向的箭头
// 实心：play pause home heart star coin trophy lock bolt gear fire bomb eye warn arrow
// 描边（线条，小尺寸或远看时不显眼）：restart sound mute check close left right up down clock menu scissors key flag undo
// 危险预警用实心的 warn（三角感叹号）或 arrow（旋转指向来向），不要用描边的 up/left/right/down
// arrow 默认朝上：要指向角度 a（U.angle 算出的，0=向右）时传 a + Math.PI / 2
UI.icons(ctx, 'heart', cx, y, 当前数, 上限, 尺寸56, 颜色?)   // 一排图标（生命、弹药、剩余次数），x 是整排中心；超出当前数的显示为灰色

// —— 布局常量 ——
UI.M (40)  UI.HUD_Y (90)  UI.HUD_BOTTOM (160)  UI.ACTION_Y (G.H-220)
UI.stack(cy, n, gap) → [y...]      UI.row(cx, n, gap) → [x...]
UI.grid(cx, cy, n, cols, gapX, gapY) → [{x, y, i, col, row}...]   // 网格，整体居中，最后一行不满时自动居中
UI.TYPE.h1 ...                      UI.shade(c, ±0.3)  UI.alpha(c, 0.5)
```

## 四、版面分区（竖屏 720 × G.H）

`G.H` 随手机长宽比在 1280–1600 之间变化（长屏手机更高，没有黑边）。所以：**顶部的东西用固定 y，底部的东西用 `G.H - 距离` 或 `UI.ACTION_Y`，中间的游戏区用 `G.H / 2` 居中**。不要假设屏幕底部是 1280。

```
y=0    ┌──────────────────────────────┐
       │ [胶囊]      分数     [暂停]   │  ← HUD 区 (y < 160)：只放 HUD
y=160  ├──────────────────────────────┤
       │                              │
       │                              │
       │         游戏区                │  ← 游戏对象活动区域
       │   （玩家的视线焦点在中部）     │
       │                              │
       │                              │
y=G.H-320 ├───────────────────────────┤
       │      操作提示 / 道具栏        │  ← 拇指区：主按钮、道具、教学提示
y=G.H-220 │    [ 主 按 钮 ]            │     UI.ACTION_Y = G.H - 220
       │                              │
y=G.H  └──────────────────────────────┘     G.H = 1280~1600
       ←40→                      ←40→   边距 UI.M
```

横屏（1280×720）时：HUD 仍在顶部；主按钮放右下角；游戏区居中。

## 五、标准界面线框（直接照搬坐标）

### 标题界面
```
[🏆 最高分胶囊]                 [🔊]      y=90    pill(align:left) + icon 按钮
                                          
            游 戏 名                       y=320   UI.title
         一句话玩法说明                     y=450   UI.text body, color: dim
                                          
       【玩法演示动画 / 角色展示】          y=560~900  让主角在这里动起来
                                          
         [ ▶ 开始游戏 ]                   y=UI.ACTION_Y  primary, key:'action'
       （可选）[关卡] [设置]               y=G.H-90  secondary/icon，横排 UI.row
```
- 标题界面**必须有动的东西**（演示动画或角色待机），不能只有静态文字
- 不写大段规则说明，用演示动画 + 一句话代替

### 游戏中 HUD
```
[💰 12]           128            [⏸]       y=90
```
- 分数用 `UI.score`，得分时弹跳（`scorePop.s = 1.5` → tween 回 1）
- **HUD 区内的点击不算游戏操作**：`const tapGame = G.input.tapped && G.input.pointer.y > UI.HUD_BOTTOM;`
- 教学提示放在拇指区（y ≈ 1100），用 caption 或 body，呼吸闪烁，玩家完成一次操作后淡出

### 暂停菜单（在 play 场景内实现，用 `this.paused` 状态）
```
UI.overlay → UI.panel(CX, 760, 560, 560, {title:'暂停'})
   [ ▶ 继续 ]       y=640   primary
   [ ↻ 重新开始 ]   y=790   secondary
   [ ⌂ 主页 ]       y=940   secondary
```

### 结算界面
```
        ╭─[ 游戏结束 ]─╮             panel(CX, 520, 560, 500, {title, titleColor: enemy})
        │   ★ ★ ☆     │   y=390     UI.stars（评级，阈值放 CFG）
        │     128      │   y=530     UI.score scale 1.4
        │   新纪录！    │   y=670     新纪录用 h2 + player 色；否则显示最高分胶囊
        ╰──────────────╯
        [ ↻ 再来一局 ]      y=UI.ACTION_Y-150  primary, key:'action'
        [ ⌂ 主页 ]         y=UI.ACTION_Y      secondary
```
- 面板从屏幕下方弹入（tween y，`outBack`，0.5 秒）
- 按钮前 0.5 秒设为 `enabled: false`，防止死亡时的点击误触
- 新纪录时：`win` 音效 + 彩色粒子雨

### 关卡选择
```
   [←]          选择关卡          [🔊]    y=90
   ┌───┐ ┌───┐ ┌───┐ ┌───┐                每行 4 个，按钮 128×128，间距 150
   │ 1 │ │ 2 │ │ 3 │ │🔒 │                UI.grid(CX, 中心y, 关数, 4, 150, 190) 求每个按钮的 x,y
   └───┘ └───┘ └───┘ └───┘                已解锁 primary/secondary，未解锁 enabled:false + icon:'lock'
    ★★★   ★★☆                            每个按钮下方 UI.stars(..., size 28)
```
```js
const cells = UI.grid(G.W / 2, 560, LEVELS.length, 4, 150, 190);   // 关卡数不是 4 的倍数时，最后一行自动居中
this.levelBtns = LEVELS.map((L, i) => {
  const locked = i > G.load('unlocked', 0);
  return UI.button({ x: cells[i].x, y: cells[i].y, w: 128, h: 128, label: locked ? '' : String(i + 1),
                     icon: locked ? 'lock' : null, kind: i === G.load('unlocked', 0) ? 'primary' : 'secondary',
                     enabled: !locked, level: i });
});
```

### 过关提示（关卡制）
`UI.banner(ctx, '过关！', G.H/2)`，配合 alpha 的 tween：0 → 1，停留 0.8 秒，→ 0；然后进入下一关。

## 六、按游戏类型的 UI 配方

每种类型给出：推荐风格、HUD 布局、特有 UI、要避免的问题。

### 1. 无尽躲避 / 反应类（点击、绕圈、闪避）
- 画风：`arcade` 或 `cyber`（可爱向用 `anime`）
- HUD：只有中间的分数 + 右上暂停。**越少越好**，注意力要留给游戏区
- 特有 UI：危险从屏幕外接近时，在边缘显示红色预警（`UI.icon(ctx, 'arrow', x, y, 48, C.enemy, 角度 + Math.PI / 2)` 指向危险来向，或 `warn` 三角）；速度升档时用 `UI.banner('加速!')`，持续 0.6 秒
- 避免：在游戏区中央放文字；分数字号过小

### 2. 平台跳跃 / 跑酷
- 画风：`anime` 或 `flat`
- HUD：左上 `pill(coin)`，中间显示距离或分数，右上暂停；有生命值时用 `UI.hearts` 放在分数下方（y = 170）
- 特有 UI：需要左右移动时，把屏幕左右两半作为触控区，在底部画半透明的 `UI.icon('left'/'right')` 提示（alpha 0.25），**不要画实体虚拟按键**；跳跃 = 点击屏幕任意处
- 避免：虚拟摇杆；HUD 挡住上方平台（摄像机要预留 HUD 区）

### 3. 网格解谜 / 推箱子 / 一笔画
- 画风：`flat` 或 `guofeng`
- HUD：左上 `pill('第 3 关')`，中间显示步数（`UI.text` h2）；右上放两个 icon 按钮：`restart` 和撤销（`left`），用 `UI.row` 排开
- 棋盘：居中放在 y 260~1000 之间，格子之间留 6~8px 间隙，格子用 `D.roundRect`（半径 = 格子大小 × 0.15）；棋盘外框用 `UI.panel`
- 特有 UI：关卡选择界面（见上）；结算显示步数和星级（步数阈值放在关卡数据里）
- 避免：网格贴着屏幕边缘；格子之间没有间隙

### 4. 三消 / 合成 / 消除
- 画风：`flat`（越"糖果"越好）或 `anime`
- HUD：顶部是目标栏：一个 `UI.panel`（y = 150，h = 140），里面横排列出目标图标和剩余数量；剩余步数用大号数字放在目标栏右侧
- 棋盘：`UI.panel` 作为底板，元素用不同**形状 + 颜色**区分（至少 5 种形状）
- 特有 UI：连击时弹出 `UI.banner('x3 连击!')`；合成出新物品时，物品放大到 1.4 倍再弹回，同时用 `UI.text` h2 显示物品名
- 避免：元素只靠颜色区分；目标不清楚

### 5. 物理 / 弹射 / 堆叠
- 画风：`flat` 或 `shadiao`
- HUD：左上 `pill('第 N 关')`；中间用一排小图标表示剩余发射次数（`UI.icons(ctx, 'bolt', ...)`）；右上放 `restart` 按钮
- 特有 UI：瞄准时用一串逐渐变小的圆点画预测轨迹（不要画一条实线）；三星评分的阈值用细的 `UI.bar` 加刻度显示
- 避免：拖拽瞄准时手指挡住发射物（把瞄准线画在反方向）

### 6. 节奏 / 时机
- 画风：`cyber`
- HUD：顶部用细进度条显示歌曲进度（`UI.bar`，h = 12，宽 = G.W − 2·M）；连击数放在右上，`UI.text` h2
- 特有 UI：判定文字（完美 / 好 / 失误）显示在判定线上方，用 h1，0.3 秒内放大后淡出；按下时对应轨道高亮
- 避免：判定文字挡住下落的音符

### 7. 放置 / 点击 / 经营
- 画风：`flat` 或 `guofeng`
- HUD：顶部横排资源胶囊（最多 3 个，用 `UI.row` 均分）
- 主区域：中间放一个大点击目标（≥ 300px），点击时弹出 "+N" 浮字
- 底部：升级列表。每行是一个 `UI.panel`（宽 = G.W − 2·M，h = 120），左边图标，中间名称和等级（body + caption），右边是显示价格的 `UI.button`（w = 200，h = 88），钱不够时 `enabled: false`
- 数字格式化：`n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : n`
- 避免：数字太长挤破胶囊；列表超出屏幕却不能滚动（最多 4 行，再多就分页）

### 8. 塔防 / 策略
- 画风：`flat` 或 `guofeng`
- HUD：左上用 `UI.hearts` 或生命值胶囊，中间显示波次胶囊（`pill('2/10')`），右上放金币胶囊；暂停按钮移到右下角（因为右上被占用）
- 底部托盘：一个 `UI.panel`（y = G.H − 130，h = 200），横排 3~4 个塔的卡片按钮（128×150：图标 + 价格），选中的卡片用 primary，买不起的设为 `enabled: false`
- 特有 UI：放置时显示攻击范围（`D.ring`，alpha 0.3）；波次开始时显示 `UI.banner('第 3 波')`
- 避免：托盘遮挡路径（关卡路径要留出底部 260px）

### 9. 问答 / 文字 / 卡牌
- 画风：`guofeng` 或 `flat`
- 布局：题目或卡牌放在一个大 `UI.panel` 中（y = 480，560×520），文字用 body，每行不超过 14 个汉字（需要自己折行）；选项按钮竖排放在拇指区（`UI.stack(1000, 选项数, 130)`，w = 560，h = 108）
- HUD：顶部放倒计时 `UI.bar`（时间少于 30% 时变成 enemy 色），右上显示分数胶囊
- 特有 UI：答对时按钮变 `C.pickup` 色并显示 `check` 图标，答错时变 `C.enemy` 色、屏幕轻微震动，并标出正确答案
- 避免：一个面板里文字超过 4 行；选项文字太长（不超过 10 个字）

## 七、游戏世界的绘制

游戏世界里的东西用 `Art.*` 画（见 `references/art-styles.md`），**不要用 `D.*` 画角色、敌人、道具、方块**，否则不会跟随画风。上面没有的形状用 `Art.shape / Art.circle / Art.poly`。`D.*` 只用于调试标记或画风确实覆盖不到的极少数特效。

## 八、UI 自检（看截图逐条确认）

- [ ] 每个界面只有 1 个主按钮，且在拇指区
- [ ] 所有文字通过 `UI.text` / `UI.title` / 组件绘制，没有 `D.text` 手写的按钮或标题
- [ ] HUD 不超过 3 个元素，且都在 y < 160 以内
- [ ] 没有元素贴边（距离边缘至少 40px）
- [ ] 元素左右对称，或者对齐到边距线
- [ ] 标题界面有动态元素
- [ ] 结算面板有入场动画，有星级或新纪录反馈
- [ ] 截图能一眼看出画风（和 `references/img/art-<画风>.jpg` 感觉一致），没有纯色圆/三角充当游戏物体
- [ ] 浅色画风下文字清晰（没有深色字配深色描边的情况）
- [ ] 横屏截图中 UI 没有越界
