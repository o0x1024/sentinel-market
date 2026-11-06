# 多 Agent 分工（可选）

单个 agent 也能按 SKILL.md 走完全流程。如果你能派发子 agent（Claude Code 的 Agent/Task 工具、Codex、或其它能读文件的 agent），按下面分工可以让**能力较弱的模型**只承担小而明确的任务。

每个角色描述都可以直接当作子 agent 的提示词开头。派发时必须告诉子 agent：skill 目录的绝对路径、项目目录的绝对路径。

---

## 主控（Orchestrator）—— 建议用最强的模型

职责：
1. 执行阶段 1（构思）与阶段 2（设计），或交给"设计师"后审核
2. 把阶段 3–4 拆成任务卡（`templates/task-card.md`），**按顺序**派发给构建者（不要并行改同一个文件）
3. 每张卡完成后，**亲自**运行 check + smoke-test 并查看截图，不信任子 agent 的"已完成"
4. 不合格：把失败输出原样附在任务卡后面重新派发；同一张卡失败 2 次 → 拆成更小的卡，或自己完成
5. 阶段 5 交给测试员，根据报告再派修复卡

## 设计师（Designer）

> 你是小游戏设计师。读 `<skill>/workflow/1-ideate.md` 和 `<skill>/references/creativity-toolkit.md`，严格按步骤产出 10 个点子、打分表、最终选择。然后读 `<skill>/workflow/2-design.md`，填写 `<项目>/GDD.md`。不写代码。输出：GDD.md 的完整内容 + 落选点子表。

## 构建者（Builder）—— 可以用较弱/较快的模型

> 你是 H5 小游戏程序员。先读 `<skill>/references/engine-api.md`。只完成下面这张任务卡，只修改卡上允许的文件。每次修改后运行卡上的验收命令，直到全部通过。不要修改 engine.js，不要做卡片以外的事。完成后按卡片要求回报。
>
> <任务卡内容>

## 测试员（Playtester）

> 你是游戏测试员。不修改任何游戏代码。
> 1. 运行 `<skill>/scripts/check.mjs` 和 `smoke-test.mjs`（竖屏 20 秒 + 横屏各一次）
> 2. 用读图工具逐张看 `.smoke/` 截图，按 `<skill>/workflow/5-verify.md` 第 5.2 节清单检查
> 3. 读游戏代码，按 `<skill>/references/fun-check.md` 逐项打分并给出证据
> 4. 输出问题列表，每条格式：`[严重/一般/建议] 现象 — 证据（文件:行号 或 截图名）— 建议修法`

---

## 推荐派发顺序

```
主控/设计师：阶段1+2 → GDD.md
构建者：卡1 玩具 → 卡2..N MVP → 内容卡
主控：中途检查（看截图 + 趣味自评第 2、3 项），不好玩就调整设计再继续
构建者：打磨卡（juice / 画面 / UI）
测试员：完整报告
构建者：修复卡
主控：阶段 5 交付
```
