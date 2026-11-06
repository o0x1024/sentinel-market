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
];
for (const f of jsFiles) {
  if (f.endsWith('engine.js')) continue;
  const lines = readFileSync(f, 'utf8').split('\n');
  const rel = relative(dir, f);
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*)/.test(line)) return;
    for (const [re, level, msg] of rules) if (re.test(line)) (level === 'error' ? errors : warns).push(`[写法] ${rel}:${i + 1} ${msg}\n    ${line.trim().slice(0, 100)}`);
  });
  if (lines.length > 600) warns.push(`[体积] ${rel} 有 ${lines.length} 行，超过 600 行请拆分（如 entities.js / levels.js）`);
}

// 4. engine.js 被改动（与模板比对）
const tplEngine = new URL('../templates/game/engine.js', import.meta.url);
if (existsSync(join(dir, 'engine.js')) && existsSync(tplEngine)) {
  if (readFileSync(join(dir, 'engine.js'), 'utf8') !== readFileSync(tplEngine, 'utf8')) warns.push('[引擎] engine.js 与模板不同。不要修改引擎；需要新功能写在游戏代码里');
}

// 5. 必要元素
const all = jsFiles.filter((f) => !f.endsWith('engine.js')).map((f) => readFileSync(f, 'utf8')).join('\n');
if (!/G\.start\(/.test(all)) errors.push('[启动] 没找到 G.start(...)，游戏不会运行');
if (!/G\.sfx\(/.test(all)) warns.push('[手感] 没有任何音效 G.sfx()');
if (!/G\.(burst|shake|tween|flash)\(/.test(all)) warns.push('[手感] 没有粒子/震屏/补间，游戏会很"干"。见 references/juice.md');
if (!/G\.(save|load)\(/.test(all)) warns.push('[留存] 没有保存最高分/进度 G.save()');

for (const e of errors) console.log('❌ ' + e);
for (const w of warns) console.log('⚠️  ' + w);
console.log(errors.length ? `\n检查失败：${errors.length} 个错误，${warns.length} 个警告` : `\n检查通过（${warns.length} 个警告）`);
process.exit(errors.length ? 1 : 0);
