# 阶段 5：验证与交付

## 步骤 5.1：自动检查（必须全部通过）

```bash
node <skill>/scripts/check.mjs <项目>                     # 0 错误；警告逐条确认
node <skill>/scripts/smoke-test.mjs <项目> --seconds 20   # 竖屏
node <skill>/scripts/smoke-test.mjs <项目> --landscape    # 横屏下不能崩、不能有元素出界
```

用 `--steps` 写一个"正常玩家"的脚本，确保能走完 `title → play → over → play`：

```bash
node smoke-test.mjs <项目> --steps "shot:title;tap:360,640;wait:1500;shot:playing;wait:8000;shot:later"
```

## 步骤 5.2：看截图（必须亲自看）

用读图工具逐张打开 `.smoke/` 下的截图，逐项回答：

- [ ] 标题界面：游戏名、玩法说明、开始提示都在且不重叠
- [ ] 游戏中：玩家显眼；分数可读；没有文字压住物体
- [ ] 结算：分数、最高分、再来一局提示都在
- [ ] 横屏截图：内容完整居中（黑边正常）
- [ ] 没有红色错误条

## 步骤 5.3：趣味自评

按 `references/fun-check.md` 打分。任何一项 < 3 分 → 回到对应阶段修改（最多回退 2 轮）。

## 步骤 5.4：交付

1. 删除 `.smoke/` 目录
2. 项目目录中应只有：`index.html`、`engine.js`、`config.js`、`game.js`（及拆分出的 js）、`GDD.md`
3. 写一个简短 `README.md`：
   ```
   # 游戏名
   一句话介绍。
   ## 怎么玩
   双击 index.html，或部署到任意静态托管（GitHub Pages / Netlify / 微信内置浏览器可直接打开）。
   ## 操作
   手机：... 电脑：...
   ```
4. 向用户报告：一句话介绍、操作方式、趣味自评分数、已知问题（如实写）

## 闸门 ✅

- [ ] check 0 错误
- [ ] 竖屏/横屏 smoke-test 都通过
- [ ] 截图逐张看过并通过 5.2 的清单
- [ ] fun-check 每项 ≥ 3
- [ ] README.md 已写
