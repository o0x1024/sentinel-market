#!/usr/bin/env node
// 静态检查：语法 + 禁用写法 + 文件引用。用法: node check.mjs <游戏目录>
// 退出码 0 = 通过；1 = 有错误（必须修）。警告不影响退出码。
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const dir = process.argv[2];
if (!dir || !existsSync(join(dir, 'index.html'))) {
  console.error('用法: node check.mjs <游戏目录>（目录下需有 index.html）');
  process.exit(2);
}

const errors = [], warns = [];
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  if (f.startsWith('.') || f === 'node_modules') return [];
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(dir);
const jsFiles = files.filter((f) => f.endsWith('.js'));

// 1. 语法检查
for (const f of jsFiles) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { errors.push(`[语法] ${relative(dir, f)}\n${String(e.stderr).trim().split('\n').slice(0, 5).join('\n')}`); }
}

// 2. index.html 引用的脚本必须存在；engine.js 第一个、game.js 最后一个
const html = readFileSync(join(dir, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const scripts = [...html.matchAll(/<script[^>]*src=["']([^"']+)["']/g)].map((m) => m[1]);
for (const s of scripts) {
  if (/^https?:/.test(s)) warns.push(`[外链] index.html 引用了网络脚本 ${s}，离线时无法运行`);
  else if (!existsSync(join(dir, s))) errors.push(`[缺文件] index.html 引用了 ${s}，但文件不存在`);
}
if (/type=["']module["']/.test(html)) errors.push('[模块] index.html 用了 type="module"，file:// 双击打开会失败。改成普通 <script src>');
if (scripts.length && !scripts[0].endsWith('engine.js')) errors.push('[顺序] engine.js 必须是第一个 <script>');
if (scripts.length && !scripts[scripts.length - 1].endsWith('game.js')) warns.push('[顺序] game.js 通常应是最后一个 <script>（它调用 G.start）');
const uiIdx = scripts.findIndex((s) => s.endsWith('ui.js'));
if (uiIdx < 0) errors.push('[UI] index.html 没有引入 ui.js。在 engine.js 之后加 <script src="ui.js"></script>');
else if (uiIdx !== 1) warns.push('[顺序] ui.js 应紧跟在 engine.js 之后（第二个 <script>）');
for (const f of jsFiles) {
  const rel = relative(dir, f).split('\\').join('/');
  if (!scripts.includes(rel)) warns.push(`[未引用] ${rel} 没有在 index.html 中用 <script> 引入`);
}

// 3. 禁用写法（逐行扫描，engine.js 跳过）
const rules = [
  [/^\s*(import|export)\s/, 'error', '不要用 import/export（file:// 下失败）。用普通全局变量'],
  [/\bfetch\s*\(/, 'error', '不要 fetch 本地文件（file:// 跨域失败）。数据直接写成 JS 对象'],
  [/\bsetInterval\s*\(/, 'error', '不要用 setInterval 做游戏逻辑，用 update(dt) 或 G.every()'],
  [/\bsetTimeout\s*\(/, 'warn', '建议用 G.after() 代替 setTimeout（切场景时会自动清理）'],
  [/\b(alert|confirm|prompt)\s*\(/, 'error', '不要用 alert/confirm/prompt，用游戏内 UI'],
  [/requestAnimationFrame\s*\(/, 'error', '不要自己写游戏循环，引擎已提供'],
  [/new Image\(|\.png['"]|\.jpg['"]|\.mp3['"]|\.wav['"]/, 'warn', '使用了外部素材文件，确认文件存在；推荐程序化绘制 + G.sfx()'],
  [/https?:\/\//, 'warn', '代码中有网络地址，离线运行可能失败'],
  [/document\.(getElementById|querySelector|createElement)/, 'warn', '直接操作 DOM：UI 应画在 canvas 上（用 D.text/D.roundRect）'],
  [/addEventListener\s*\(\s*['"](click|touchstart|mousedown|keydown|pointerdown)/, 'warn', '自己绑定输入事件：请改用 G.input'],
  [/Math\.random\(\)/, 'warn', '可用 U.rand/U.pick/U.chance 让代码更短'],
  [/\.\s*update\s*\(\s*\)/, 'warn', 'update() 没传 dt？移动都要乘 dt'],
  // ---- UI 规则（见 references/ui-design.md） ----
  [/D\.text\s*\(/, 'warn', 'UI 文字请用 UI.text(ctx, s, x, y, { role }) / UI.title / UI.score，D.text 只用于游戏世界内的小标记'],
  [/UI\.text\s*\([^)]*\bsize\s*:/, 'warn', 'UI.text 请用 role（display/h1/h2/body/caption）而不是自定义 size'],
  [/\bfont\s*=/, 'warn', '不要自己设置 ctx.font，用 UI.text 的 role'],
  [/\by\s*[:=]\s*(9[6-9]\d|1[0-5]\d\d)\b/, 'warn', '底部元素写死了 y（屏幕高度 G.H 在 1280~1600 间变化）。底部用 UI.ACTION_Y 或 G.H - 距离，中部用 G.H / 2'],
];
// 硬编码颜色：只允许纯白/纯黑（可带透明度），其余必须来自 CFG.color
const HEX = /['"]#([0-9a-fA-F]{3,8})['"]/g;
const okHex = (h) => /^(f{3,4}|f{6}|f{8}|0{3}|0{6}|000[0-9a-f]|000000[0-9a-f]{2}|fff[0-9a-f]|ffffff[0-9a-f]{2})$/i.test(h);
for (const f of jsFiles) {
  if (f.endsWith('engine.js') || f.endsWith('ui.js') || f.endsWith('art.js')) continue;
  const lines = readFileSync(f, 'utf8').split('\n');
  const rel = relative(dir, f);
  const isConfig = rel.endsWith('config.js');
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*)/.test(line)) return;
    for (const [re, level, msg] of rules) if (re.test(line)) (level === 'error' ? errors : warns).push(`[写法] ${rel}:${i + 1} ${msg}\n    ${line.trim().slice(0, 100)}`);
    if (!isConfig) for (const m of line.matchAll(HEX)) if (!okHex(m[1])) errors.push(`[颜色] ${rel}:${i + 1} 硬编码颜色 #${m[1]}：颜色只能用 CFG.color（C.xxx），需要深浅变化用 UI.shade/UI.alpha\n    ${line.trim().slice(0, 100)}`);
    if (!isConfig && /\b(rgb|rgba|hsl|hsla)\s*\(/.test(line)) errors.push(`[颜色] ${rel}:${i + 1} 硬编码颜色：请用 C.xxx 或 UI.alpha(C.xxx, a)\n    ${line.trim().slice(0, 100)}`);
  });
  if (lines.length > 600) warns.push(`[体积] ${rel} 有 ${lines.length} 行，超过 600 行请拆分（如 entities.js / levels.js）`);
}

// 4. engine.js 被改动（与模板比对）
const tplEngine = new URL('../templates/game/engine.js', import.meta.url);
if (existsSync(join(dir, 'engine.js')) && existsSync(tplEngine)) {
  if (readFileSync(join(dir, 'engine.js'), 'utf8') !== readFileSync(tplEngine, 'utf8')) warns.push('[引擎] engine.js 与模板不同。不要修改引擎；需要新功能写在游戏代码里');
}
const tplArt = new URL('../templates/game/art.js', import.meta.url);
if (existsSync(join(dir, 'art.js')) && existsSync(tplArt)) {
  if (readFileSync(join(dir, 'art.js'), 'utf8') !== readFileSync(tplArt, 'utf8')) warns.push('[画风] art.js 与模板不同。不要修改画风库；自定义物体用 Art.shape / Art.circle，它们会按画风上色');
}
const tplUi = new URL('../templates/game/ui.js', import.meta.url);
if (existsSync(join(dir, 'ui.js')) && existsSync(tplUi)) {
  if (readFileSync(join(dir, 'ui.js'), 'utf8') !== readFileSync(tplUi, 'utf8')) warns.push('[UI] ui.js 与模板不同。不要修改组件库；外观由 CFG.art.style 画风决定');
}

// 5. 必要元素
const all = jsFiles.filter((f) => !(f.endsWith('engine.js') || f.endsWith('ui.js') || f.endsWith('art.js'))).map((f) => readFileSync(f, 'utf8')).join('\n');
const artIdx = scripts.findIndex((s) => s.endsWith('art.js'));
if (artIdx < 0) warns.push('[画风] index.html 没有引入 art.js：游戏世界和 UI 将没有画风。在 config.js 之后加 <script src="art.js"></script>');
else {
  const cfgIdx = scripts.findIndex((s) => s.endsWith('config.js'));
  if (cfgIdx > artIdx) errors.push('[顺序] art.js 必须在 config.js 之后加载（它读取 CFG.art.style）');
  const m = all.match(/art\s*:\s*\{\s*style\s*:\s*['"](\w+)['"]/);
  const STY = ['anime', 'arcade', 'cyber', 'flat', 'guofeng', 'shadiao'];
  if (!m) warns.push('[画风] config.js 中没有 art: { style: ... }，将使用默认 anime。可选：' + STY.join(' '));
  else if (!STY.includes(m[1])) errors.push(`[画风] 未知画风 '${m[1]}'，可选：${STY.join(' ')}`);
  if (!/Art\.bg\(/.test(all)) warns.push('[画风] 没有调用 Art.bg(ctx)：每个场景的 draw 第一行应画背景');
  if (!/Art\.post\(/.test(all)) warns.push('[画风] 没有调用 Art.post(ctx)：每个场景的 draw 最后一行应调用（扫描线/暗角等后期效果）');
  const worldD = (all.match(/D\.(circle|poly|roundRect|rect|ring)\(/g) || []).length, artCalls = (all.match(/Art\.\w+\(/g) || []).length;
  if (worldD > artCalls) warns.push(`[画风] 游戏代码用 D.* 画了 ${worldD} 处图形，Art.* 只有 ${artCalls} 处。游戏物体请用 Art.hero/enemy/spiky/pickup/block/shape…，否则不会跟随画风（见 references/art-styles.md）`);
}
if (!/UI\.button\(/.test(all)) warns.push('[UI] 没有使用 UI.button：所有按钮必须用组件（见 references/ui-design.md）');
if (/D\.roundRect\(/.test(all) && !/UI\.panel\(/.test(all)) warns.push('[UI] 用了 D.roundRect 但没有 UI.panel：面板/卡片请用 UI.panel');
if (!/UI\.(title)\(/.test(all)) warns.push('[UI] 标题界面没有使用 UI.title');
const primaries = (all.match(/UI\.button\(\{(?![^}]*kind\s*:\s*['"](secondary|icon|danger))[^}]*\}/g) || []).length;
if (primaries > 6) warns.push(`[UI] 有 ${primaries} 个主按钮（primary）。每个界面只能有 1 个主按钮，其它用 kind:'secondary' 或 'icon'`);
if (!/G\.start\(/.test(all)) errors.push('[启动] 没找到 G.start(...)，游戏不会运行');
if (!/G\.sfx\(/.test(all)) warns.push('[手感] 没有任何音效 G.sfx()');
if (!/G\.(burst|shake|tween|flash)\(/.test(all)) warns.push('[手感] 没有粒子/震屏/补间，游戏会很"干"。见 references/juice.md');
if (!/G\.(save|load)\(/.test(all)) warns.push('[留存] 没有保存最高分/进度 G.save()');
if (!/G\.debug\.result\s*=/.test(all)) warns.push('[测试] 没有写 G.debug.result（enter 里设 null，赢/输时设 \'win\'/\'lose\'），测试无法用 waitUntil 等到一局结束。见 references/testing.md');
if (/G\.scene\b(?!\s*\()/.test(all)) errors.push('[引擎] G.scene 是注册场景的方法，不是当前场景名。读当前场景名请用 G.sceneName');
if (jsFiles.some((f) => /(^|\/)ui\.js$/.test(f) && f !== join(dir, 'ui.js'))) warns.push('[UI] 子目录里有名为 ui.js 的文件，容易与组件库混淆，请改名（如 hud.js）');

for (const e of errors) console.log('❌ ' + e);
for (const w of warns) console.log('⚠️  ' + w);
console.log(errors.length ? `\n检查失败：${errors.length} 个错误，${warns.length} 个警告` : `\n检查通过（${warns.length} 个警告）`);
process.exit(errors.length ? 1 : 0);
