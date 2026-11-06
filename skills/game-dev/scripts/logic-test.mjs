#!/usr/bin/env node
/* 纯逻辑测试：不开浏览器，在 Node 里加载游戏的逻辑文件，用代码验证规则、关卡可解性、数值。
 * 用法:
 *   node logic-test.mjs <游戏目录> <测试文件.mjs> [--load config.js,levels.js,logic.js]
 * 默认按 index.html 里的顺序加载除 ui.js、game.js 之外的所有脚本（engine.js 也会加载，所以 U.* 可用）。
 * 因此：要测的规则必须写在不依赖画面的文件里（如 logic.js / levels.js），不要埋在 game.js 的场景里。
 *
 * 测试文件写法（详见 references/testing.md）:
 *   export default function (g, assert, log) {
 *     const { CFG, LEVELS, solve } = g;          // g.名字 = 游戏脚本里的全局 const/function
 *     assert(LEVELS.length >= 5, '至少 5 关');
 *     log('第1关最少步数', solve(LEVELS[0]));
 *   }
 * 退出码 0=全部通过 1=有断言失败 2=用法/加载错误。
 */
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const li = args.indexOf('--load');
const loadList = li >= 0 ? args[li + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
const pos = args.filter((a, i) => !a.startsWith("--") && (li < 0 || i !== li + 1));
const [dir, testFile] = pos;
if (!dir || !testFile || !existsSync(join(dir, 'index.html')) || !existsSync(testFile)) {
  console.error('用法: node logic-test.mjs <游戏目录> <测试文件.mjs> [--load a.js,b.js]'); process.exit(2);
}

let files = loadList;
if (!files) {
  const html = readFileSync(join(dir, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  files = [...html.matchAll(/<script[^>]*src=["']([^"']+)["']/g)].map((m) => m[1]).filter((f) => !/(^|\/)(ui|game)\.js$/.test(f));
}

// 最小浏览器桩：让 engine.js 等脚本能在 Node 里被加载（只用到其中的纯函数）
const noop = () => {};
const storage = new Map();
const win = {
  console, Math, JSON, Date, performance: { now: () => Date.now() },
  addEventListener: noop, removeEventListener: noop, requestAnimationFrame: noop,
  localStorage: { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)), removeItem: (k) => storage.delete(k) },
  document: { addEventListener: noop, createElement: () => ({ getContext: () => null, style: {} }), body: { appendChild: noop } },
};
win.window = win; win.globalThis = win;
const ctx = vm.createContext(win);
for (const f of files) {
  const p = join(dir, f);
  if (!existsSync(p)) { console.error('找不到要加载的文件: ' + p); process.exit(2); }
  try { vm.runInContext(readFileSync(p, 'utf8'), ctx, { filename: f }); }
  catch (e) { console.error(`加载 ${f} 出错: ${e.message}\n（这个文件可能依赖画面/DOM。把纯规则拆到单独的 logic.js，或用 --load 指定要加载的文件）`); process.exit(2); }
}
// g.名字 → 取游戏脚本里的全局（包括顶层 const/let，它们不挂在 window 上）
const g = new Proxy({}, { get: (_, name) => { try { return vm.runInContext(String(name), ctx); } catch { return undefined; } } });

let pass = 0; const fails = [];
const assert = (cond, msg = '断言失败') => { if (cond) pass++; else { fails.push(msg); console.log('  ✗ ' + msg); } };
const log = (...a) => console.log('  ·', ...a);

console.log(`==== 逻辑测试 ====\n已加载: ${files.join(', ')}`);
try {
  const mod = await import(pathToFileURL(resolve(testFile)).href);
  if (typeof mod.default !== 'function') { console.error('测试文件必须 export default 一个函数'); process.exit(2); }
  await mod.default(g, assert, log);
} catch (e) { console.error('测试运行出错: ' + (e.stack || e.message)); process.exit(1); }
console.log(`\n通过 ${pass} 条，失败 ${fails.length} 条`);
process.exit(fails.length ? 1 : 0);
