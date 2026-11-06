# 常见错误与修复

按症状查找。

## 运行问题

| 症状 | 原因 | 修复 |
|---|---|---|
| 白屏，无报错 | 没调用 `G.start()`，或 game.js 没被 index.html 引入 | 检查 `<script>` 顺序：engine → config → 其它 → game |
| `X is not defined` | 脚本顺序错，或变量在另一个文件里用 `let/const` 定义后在更早的文件里使用 | 被依赖的文件放前面 |
| `Identifier 'X' has already been declared` | 两个文件定义了同名全局 `const` | 改名，或放进一个对象里 |
| `Cannot read properties of undefined` | 状态没在 `enter()` 初始化；或数组越界 | 在 enter 里给所有 `this.xxx` 赋初值 |
| 重开后状态残留（分数没清零、敌人还在） | 状态放在场景外的全局变量里 | 全部移入 `enter()` 初始化 |
| 双击打开报 CORS 错误 | 用了 `type="module"` 或 `fetch` | 改普通 script；数据写成 JS 常量 |
| 游戏越来越卡 | 数组只增不删 | 出界/死亡时 `dead = true` + `U.removeDead` |
| 手机上点了没反应 | 用了 `click`/`keydown` 事件 | 用 `G.input.tapped` / `G.input.pointer` |
| 手机上页面滚动/缩放 | 自己写了 HTML/CSS | 使用模板 index.html，不加别的元素 |
| 没有声音 | 浏览器要求用户先交互 | 引擎已处理：第一次点击后才有声音，这是正常的 |

## 逻辑问题

| 症状 | 原因 | 修复 |
|---|---|---|
| 不同电脑速度不一样 | 移动没乘 `dt` | `x += vx * dt` |
| 快速物体穿墙 | 速度太大 | 降低速度或分步检测：`for (let i=0;i<4;i++) { x += vx*dt/4; check(); }` |
| 一次碰撞触发多次 | 碰撞后没标记 | 碰撞后立刻 `e.dead = true` 或 `e.hit = true` 并跳过 |
| 死亡后还能操作/得分 | 没有 dead 状态 | `update` 开头 `if (this.dead) return;` |
| 结算界面点一下就重开 | 死亡时的点击被带过来 | 结算界面 `G.after(0.5, () => this.canRestart = true)` |
| tween 回调在切场景后报错 | — | 引擎切场景时已清空 tween/timer；不要用 setTimeout |
| 角色在格子间"滑动"时又能输入 | 补间中没锁输入 | `this.moving = true`，tween 完成时解锁 |

## 设计问题（弱模型最常犯）

| 问题 | 修复 |
|---|---|
| 写了很多功能，但核心操作不好玩 | 回到"玩具"阶段，只调核心操作 |
| 每个对象都是不同颜色 | 用 `Art.*` 的 role（player / enemy / pickup / accent / wall）按"好/坏"编码 |
| 画面像调试图：纯色圆和三角在空背景上 | 用 `D.*` 画了物体。换成 `Art.*`，并在 draw 开头调用 `Art.bg(ctx)`（见 art-styles.md） |
| UI 文字太小 / 字号五花八门 | 用 `UI.text` 的 role，只有 6 级字号 |
| 按钮是一个扁平矩形加文字 | 用 `UI.button`，它自带立体感、按下态、图标、音效 |
| 界面元素随手摆放、不对齐 | 照搬 ui-design.md 第五节的线框坐标，用 `UI.stack` / `UI.row` 计算位置 |
| 一个界面有好几个同样醒目的按钮 | 只保留 1 个 primary，其余用 secondary 或 icon |
| 点暂停按钮的同时触发了游戏操作 | 游戏操作忽略 HUD 区的点击：`pointer.y > UI.HUD_BOTTOM` |
| 浅色背景上文字看不清 | 用调色板里的深色 text；不要手动指定文字颜色 |
| 暂停用 `G.paused`，结果菜单按钮点不了 | `G.paused` 会冻结 update；暂停菜单要在 play 场景内用 `this.paused` 实现 |
| 用虚拟摇杆 | 改成拖拽跟随或点击 |
| 一开始就很难 | 前 15 秒几乎不可能死 |
| 死亡瞬间切屏 | 延迟 0.6–1 秒，先播死亡特效 |
| 开始界面需要读一大段规则 | 一句话 + 首次游玩时的操作提示 |
| 把所有代码写进一个 1500 行文件 | 超 600 行就拆分 |
| 修改 engine.js 加功能 | 不要改；在游戏代码里实现 |
