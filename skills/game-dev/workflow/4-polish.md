# 阶段 4：打磨（手感 + 画面 + 界面）

同样的玩法，打磨与否差别巨大。本阶段**不加新玩法**，只让已有的东西更爽、更好看、更清楚。

## 步骤 4.1：手感（Juice）

打开 `references/juice.md`，逐条对照：

1. 列出游戏里的所有**事件**（操作、得分、受伤、死亡、过关、按钮点击、新纪录）
2. 每个事件至少有 **1 个视觉 + 1 个音效** 反馈
3. 重要事件（死亡、大连击、过关）叠加 3 种以上反馈
4. 至少完成 juice.md 中"必做"的全部项目，"加分"项挑 3 个以上

## 步骤 4.2：画面

打开 `references/art-styles.md` 和 `references/art-direction.md`：

1. 确认所有游戏物体都用 `Art.*` 画（check.mjs 没有 `[画风]` 警告），没有 `D.circle` 之类的纯色图形混在里面
2. 每个场景的 `draw` 以 `Art.bg(ctx)` 开头、`Art.post(ctx)` 结尾
3. 尺寸符合 art-styles.md 第四节（主角半径 28–40，网格占屏宽 80%）
4. 主角每帧传入 `angle / speed / stretch`，出现/消失有缩放动画
5. 截图和 `references/img/art-<画风>.jpg` 放在一起对比：像同一个游戏吗？

## 步骤 4.3：界面（UI）

先读 `references/ui-design.md`（必读），并看 `references/img/` 里所选风格的效果图。

1. 确认 `config.js` 中的 `art.style` 适合游戏类型（见 art-styles.md 第一节）
2. 找到 ui-design.md 第六节中**你的游戏类型**，按配方实现 HUD 和特有 UI
3. 标题、暂停、结算（以及关卡选择）界面**照搬**第五节的标准线框坐标
4. 运行 check.mjs，消除所有 `[UI]` 和 `[颜色]` 类问题
5. 截图后按 ui-design.md 第八节的 UI 自检清单逐条确认

## 步骤 4.4：调数值

对照 `references/game-feel-numbers.md`，并做下面 3 个检查：

- **太难？** 让 smoke-test 随机乱玩 15 秒（`--seconds 15`）：随机操作就能拿高分 → 太简单；1 秒内就死 → 前期太难
- **太慢？** 前 5 秒内有没有发生值得看的事？
- **单调？** 30 秒和 60 秒的截图看起来不一样吗？

## 闸门 ✅

- [ ] juice.md "必做"全部完成
- [ ] check.mjs 没有"手感"类警告
- [ ] check.mjs 没有 `[UI]`、`[颜色]` 类问题
- [ ] ui-design.md 第八节的 UI 自检全部通过（看截图确认）
- [ ] check.mjs 没有 `[画风]` 类警告
- [ ] 截图和所选画风的效果图风格一致，没有纯色几何图形充当物体
