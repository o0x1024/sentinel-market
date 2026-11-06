#!/usr/bin/env node
/* 冒烟测试：无头浏览器打开游戏 → 检查报错/白屏/卡死 → 脚本步骤 → 随机乱玩或 bot → 截图。
 * 用法:
 *   node smoke-test.mjs <游戏目录> [--landscape] [--seconds 8] [--steps "..."] [--bot bot.mjs] [--strict]
 *
 * --steps 用分号分隔，坐标一律是逻辑坐标（720×1280）。执行完后才开始随机乱玩（或 bot）。
 *   button:文字           点击画面上文字包含该内容的按钮（或图标名，如 button:pause），会等它变成可点（最多 3 秒）
 *                        按钮位置随手机高度变化，点按钮一律用 button:，不要写死坐标
 *   tap:x,y              点击                 drag:x1,y1,x2,y2[,ms]  拖动（按下→移动→松手）
 *   press:x,y,ms         在某点按住 ms 再松手   down:x,y / move:x,y / up   分步控制指针
 *   key:Code             按一下键（Space/ArrowLeft/KeyR…）
 *   hold:Code,ms         按住键 ms
 *   wait:ms              固定等待
 *   waitScene:名字[,ms]   等到进入该场景且淡入结束，超时（默认 10000）记为失败
 *   waitUntil:表达式[,ms] 等到表达式为真。可用变量 d=G.debug、scene=场景名
 *                         例：waitUntil:d.result=='win',8000   waitUntil:d.score>=3
 *   expect:表达式         断言当前为真，否则记为失败。例：expect:scene=='over'
 *   shot:名字             截图
 * 某一步写错或失败：记入报告、截图 FAIL-xx，并跳过后面的步骤（后面的失败通常只是连锁反应）。
 * 想让后续步骤继续执行，加 --keep-going。
 *
 * --bot bot.mjs  用自定义 bot 代替随机乱玩（玩 --seconds 秒）。bot 文件写法见 references/testing.md：
 *   export default async function (s, act) { ... }   // s = { scene, debug, W, H, time, buttons }，每 ~100ms 调用一次
 *   act.button('开始') act.tap(x,y) act.drag(x1,y1,x2,y2,ms) act.press(x,y,ms) act.down(x,y) act.move(x,y) act.up() act.key(Code) act.hold(Code,ms)
 * --strict 随机乱玩/bot 结束后若 G.debug 里没有任何字段，也算失败（提醒你给测试暴露状态）。
 * --style 画风名   用指定画风运行（等同网址 ?style=），例如 --style cyber。检查画风效果时每种都跑一次
 * --init "JS代码"  页面加载后、执行步骤之前在游戏全局作用域里运行，用来改配置做"压缩测试"：
 *   --init "CFG.tiers.forEach(t => t.at /= 4)"   让后期档位提前出现（只影响之后才读取的值，play 场景 enter 时读的会生效）
 *
 * 逐局统计：每次进入 play 场景算一局开始，G.debug.result 变成非空算一局结束。报告末尾输出每局的
 * 结果、死因(G.debug.cause)、得分、最高档位(G.debug.tier)、存活秒数，以及汇总（bot/随机乱玩会自动重开很多局，看这里而不是"最终状态"）。
 *
 * 输出: <游戏目录>/.smoke/*.png 截图 + 报告。退出码 0=通过 1=失败 2=用法/环境错误。
 * 截图要用读图工具亲自看一遍！脚本只能发现"坏了"，发现不了"丑"和"不好玩"。
 */
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const VALUED = ['--seconds', '--steps', '--bot', '--init', '--style'];
const dir = args.find((a, i) => !a.startsWith('--') && !VALUED.includes(args[i - 1]));
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const landscape = args.includes('--landscape');
const seconds = Number(opt('seconds', 8));
const steps = opt('steps', '');
const botFile = opt('bot', '');
const strict = args.includes('--strict');
const keepGoing = args.includes('--keep-going');
const initCode = opt('init', '');
const styleArg = opt('style', '');

if (!dir || !existsSync(join(dir, 'index.html'))) { console.error('用法: node smoke-test.mjs <游戏目录> [--landscape] [--seconds 8] [--steps "..."] [--bot bot.mjs]'); process.exit(2); }
if (botFile && !existsSync(botFile)) { console.error('找不到 bot 文件: ' + botFile); process.exit(2); }

let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  const here = new URL('.', import.meta.url).pathname;
  console.error(`未安装 playwright。请先执行一次:\n  cd "${here}" && npm install && npx playwright install chromium`);
  process.exit(2);
}

const out = join(resolve(dir), '.smoke');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
const viewport = landscape ? { width: 844, height: 390 } : { width: 390, height: 844 };
let browser;
try { browser = await chromium.launch(); }
catch {
  // 没下载 playwright 浏览器时，回退到系统 Chrome / Edge
  for (const channel of ['chrome', 'msedge']) { try { browser = await chromium.launch({ channel }); break; } catch {} }
  if (!browser) { console.error('找不到浏览器。执行: npx playwright install chromium（在 scripts 目录下）'); process.exit(2); }
}
const page = await browser.newPage({ viewport, deviceScaleFactor: 2, hasTouch: true });

const problems = [], consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('console.error: ' + m.text()); });

const shots = [];
const shot = async (name) => { const p = join(out, `${String(shots.length + 1).padStart(2, '0')}-${name}.png`); await page.screenshot({ path: p }); shots.push(p); };
const state = () => page.evaluate(() => window.__GAME__ ? JSON.parse(JSON.stringify(window.__GAME__)) : null);
const toScreen = (s, x, y) => { const sc = Math.min(viewport.width / s.W, viewport.height / s.H); return { x: (viewport.width - s.W * sc) / 2 + x * sc, y: (viewport.height - s.H * sc) / 2 + y * sc }; };
// 画面是否"空白"：采样像素，统计不同颜色数
const colorCount = () => page.evaluate(() => {
  const c = document.querySelector('canvas'); if (!c) return 0;
  const ctx = c.getContext('2d'); const seen = new Set();
  for (let i = 0; i < 24; i++) for (let j = 0; j < 24; j++) {
    const d = ctx.getImageData(Math.floor((c.width * (i + 0.5)) / 24), Math.floor((c.height * (j + 0.5)) / 24), 1, 1).data;
    seen.add(`${d[0] >> 3},${d[1] >> 3},${d[2] >> 3}`);
  }
  return seen.size;
});

await page.goto(pathToFileURL(join(resolve(dir), 'index.html')).href + (styleArg ? '?style=' + encodeURIComponent(styleArg) : ''));
await page.waitForTimeout(1000);

let s = await state();
if (!s) { problems.push('window.__GAME__ 不存在：引擎没启动（看 consoleErrors，或 index.html 脚本顺序错误）'); }
else {
  const f1 = s.frame; await page.waitForTimeout(300); const s2 = await state();
  if (s2.frame <= f1) problems.push('帧数不增长：游戏循环卡死或没调用 G.start()');
  if (!s.scene) problems.push('没有进入任何场景：检查 G.start("场景名")');
}
await shot('start');
const firstScene = s?.scene;
const visited = new Set(s?.scene ? [s.scene] : []);
if (s && initCode) {
  const r = await page.evaluate((c) => { try { (0, eval)(c); return null; } catch (e) { return e.message; } }, initCode);
  if (r) problems.push(`--init 代码出错: ${r}`);
}
// 逐局统计
const runs = []; let run = null, lastScene = s?.scene;
const track = (ns) => {
  if (!ns) return;
  if (ns.scene) visited.add(ns.scene);
  const d = ns.debug || {};
  if (ns.scene === 'play' && lastScene !== 'play') { if (run && !run.result) runs.push(run); run = { start: ns.time, result: null, score: d.score, tier: d.tier, dur: 0, cause: null }; }
  if (run && !run.result) {
    run.dur = ns.time - run.start; if (d.score !== undefined) run.score = d.score;
    if (typeof d.tier === 'number') run.tier = Math.max(run.tier ?? 0, d.tier);
    if (d.result) { run.result = d.result; run.cause = d.cause ?? d.reason ?? null; runs.push(run); }
  }
  lastScene = ns.scene;
};
if (s && (await colorCount()) <= 2) problems.push('开始画面几乎是纯色（白屏/黑屏？）。看截图 01-start.png');

// 指针/键盘动作（逻辑坐标）
const sleep = (ms) => page.waitForTimeout(ms);
const P = async (x, y) => toScreen(await state(), x, y);
const act = {
  async tap(x, y) { const p = await P(x, y); await page.mouse.click(p.x, p.y); },
  async down(x, y) { const p = await P(x, y); await page.mouse.move(p.x, p.y); await page.mouse.down(); },
  async move(x, y) { const p = await P(x, y); await page.mouse.move(p.x, p.y, { steps: 4 }); },
  async up() { await page.mouse.up(); },
  async press(x, y, ms = 500) { await act.down(x, y); await sleep(ms); await act.up(); },
  async drag(x1, y1, x2, y2, ms = 300) {
    await act.down(x1, y1); const n = Math.max(2, Math.round(ms / 16));
    for (let i = 1; i <= n; i++) { const p = await P(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n); await page.mouse.move(p.x, p.y); await sleep(ms / n); }
    await act.up();
  },
  async key(k) { await page.keyboard.press(k); },
  async hold(k, ms = 300) { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); },
  // 点击画面上文字包含 text（或图标名为 text）的可点按钮；没有则返回 false
  async button(text) { const b = ((await state())?.buttons || []).find((b) => b.enabled && (b.label.includes(text) || b.icon === text)); if (!b) return false; await act.tap(b.x, b.y); return true; },
};
// 在页面里计算表达式：d = G.debug，scene = 当前场景名
const evalExpr = (expr) => page.evaluate((e) => { const g = window.__GAME__ || {}; try { return !!new Function('d', 'scene', 'fading', 'return (' + e + ')')(g.debug || {}, g.scene, !!g.fading); } catch (err) { return 'ERR:' + err.message; } }, expr);
const splitTimeout = (arg, def) => { const m = arg.match(/^(.*),\s*(\d+)\s*$/s); return m ? [m[1], Number(m[2])] : [arg, def]; };
const nums = (arg, n, name) => { const v = arg.split(',').map(Number); if (v.length < n || v.slice(0, n).some(Number.isNaN)) throw new Error(`${name} 需要 ${n} 个数字参数，收到 "${arg}"`); return v; };

const STEP_HELP = 'button tap drag press down move up key hold wait waitScene waitUntil expect shot';
async function runStep(raw) {
  const [cmd, arg = ''] = raw.split(/:(.*)/s);
  switch (cmd) {
    case 'button': {
      if (!arg) throw new Error('button 需要按钮文字，如 button:开始游戏 或 button:pause');
      const t0 = Date.now(); let last = [];
      while (Date.now() - t0 < 3000) {
        last = (await state())?.buttons || [];
        const b = last.find((b) => b.enabled && (b.label.includes(arg) || b.icon === arg));
        if (b) return act.tap(b.x, b.y);
        await sleep(100);
      }
      throw new Error(`3 秒内没找到可点的按钮 "${arg}"。当前画面上的按钮：${last.map((b) => (b.label || b.icon) + (b.enabled ? '' : '(不可点)')).join('、') || '无'}`);
    }
    case 'tap': { const [x, y] = nums(arg, 2, 'tap'); return act.tap(x, y); }
    case 'drag': { const [x1, y1, x2, y2, ms] = nums(arg, 4, 'drag'); return act.drag(x1, y1, x2, y2, ms || 300); }
    case 'press': { const [x, y, ms] = nums(arg, 2, 'press'); return act.press(x, y, ms || 500); }
    case 'down': { const [x, y] = nums(arg, 2, 'down'); return act.down(x, y); }
    case 'move': { const [x, y] = nums(arg, 2, 'move'); return act.move(x, y); }
    case 'up': return act.up();
    case 'key': if (!arg) throw new Error('key 需要按键码，如 key:Space'); return act.key(arg);
    case 'hold': {
      const [k, ms] = arg.split(',');
      if (!k || /^\d/.test(k)) throw new Error(`hold 是按住键盘键（hold:Space,500）。要在屏幕某点按住请用 press:x,y,ms`);
      return act.hold(k, Number(ms) || 300);
    }
    case 'wait': return sleep(Number(arg) || 300);
    case 'shot': return shot(arg || 'step');
    case 'waitScene': case 'waitUntil': {
      const [what, timeout] = splitTimeout(arg, 10000);
      const expr = cmd === 'waitScene' ? `scene==${JSON.stringify(what.trim())} && !fading` : what;
      const t0 = Date.now(); let r;
      while (Date.now() - t0 < timeout) {
        r = await evalExpr(expr);
        if (typeof r === 'string') throw new Error(`表达式出错 "${expr}": ${r}`);
        if (r) return;
        await sleep(100);
      }
      const cur = await state();
      throw new Error(`${cmd} 超时 ${timeout}ms：${expr} 一直不成立（当前场景 ${cur?.scene}，debug=${JSON.stringify(cur?.debug)}）`);
    }
    case 'expect': {
      const r = await evalExpr(arg);
      if (typeof r === 'string') throw new Error(`表达式出错 "${arg}": ${r}`);
      if (!r) { const cur = await state(); throw new Error(`断言失败 ${arg}（当前场景 ${cur?.scene}，debug=${JSON.stringify(cur?.debug)}）`); }
      return;
    }
    default: throw new Error(`未知指令 "${cmd}"。可用：${STEP_HELP}`);
  }
}

// 脚本化步骤
let stepsFailed = false;
if (s && steps) {
  const list = steps.split(';').map((x) => x.trim()).filter(Boolean);
  for (let si = 0; si < list.length; si++) {
    const raw = list[si];
    try { await runStep(raw); }
    catch (e) {
      problems.push(`第 ${si + 1} 步 "${raw}" 失败: ${e.message.split('\n')[0]}`);
      await shot(`FAIL-step${si + 1}`);
      if (!keepGoing) {
        if (si + 1 < list.length) problems.push(`已跳过后面 ${list.length - si - 1} 步（先修第一处失败；要继续执行加 --keep-going）`);
        stepsFailed = true; break;
      }
    }
    await sleep(60);
    const ns = await state(); track(ns);
  }
}

// bot 或随机乱玩（步骤失败时跳过，避免把失败现场冲掉）
if (stepsFailed) { /* 跳过 */ }
else if (s && botFile) {
  let bot;
  try { bot = (await import(pathToFileURL(resolve(botFile)).href)).default; }
  catch (e) { problems.push('bot 文件加载失败: ' + e.message); }
  if (typeof bot === 'function') {
    const t0 = Date.now(); let lastShot = Date.now(), n = 0;
    while (Date.now() - t0 < seconds * 1000) {
      const cur = await state();
      try { await bot({ scene: cur.scene, debug: cur.debug || {}, W: cur.W, H: cur.H, time: cur.time, buttons: cur.buttons || [] }, act); }
      catch (e) { problems.push('bot 运行出错: ' + e.message); break; }
      await sleep(100);
      const ns = await state(); track(ns);
      if (Date.now() - lastShot > Math.max(2000, (seconds * 1000) / 4)) { await shot(`bot-${++n}-${ns?.scene}`); lastShot = Date.now(); }
    }
    await shot('end');
  } else if (bot !== undefined) problems.push('bot 文件必须 export default 一个函数');
} else if (s) {
  const keys = ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'KeyZ'];
  const t0 = Date.now(); let lastShot = Date.now(), n = 0;
  while (Date.now() - t0 < seconds * 1000) {
    const cur = await state();
    if (Math.random() < 0.6) {
      const p = toScreen(cur, cur.W * (0.15 + Math.random() * 0.7), cur.H * (0.15 + Math.random() * 0.7));
      if (Math.random() < 0.3) { await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + (Math.random() - 0.5) * 200, p.y + (Math.random() - 0.5) * 200, { steps: 5 }); await page.mouse.up(); }
      else await page.mouse.click(p.x, p.y);
    } else {
      const k = keys[Math.floor(Math.random() * keys.length)];
      await page.keyboard.down(k); await page.waitForTimeout(80 + Math.random() * 200); await page.keyboard.up(k);
    }
    await page.waitForTimeout(100 + Math.random() * 150);
    const ns = await state(); track(ns);
    if (Date.now() - lastShot > Math.max(2000, (seconds * 1000) / 4)) { await shot(`play-${++n}-${ns?.scene}`); lastShot = Date.now(); }
  }
  await shot('end');
}

const fin = await state();
if (fin?.errors?.length) problems.push(...fin.errors.map((e) => '游戏内错误: ' + e));
problems.push(...[...new Set(consoleErrors)].slice(0, 10));
if (s && visited.size < 2) problems.push(`操作后始终停留在场景 "${firstScene}"：输入可能无效，或开始界面没有响应点击/按键`);
if (strict && fin && !Object.keys(fin.debug || {}).length) problems.push('--strict：G.debug 是空的。把分数、结果等关键状态写进 G.debug，测试才能用 waitUntil/expect 判断（见 references/testing.md）');
if (fin && fin.particles > 2000) problems.push(`粒子数 ${fin.particles} 过多，可能有粒子泄漏`);

await browser.close();

console.log('==== 冒烟测试报告 ====');
console.log('视口:', landscape ? '横屏 844x390' : '竖屏 390x844');
console.log('经过的场景:', [...visited].join(' → ') || '(无)');
console.log('最终状态:', JSON.stringify({ scene: fin?.scene, frame: fin?.frame, debug: fin?.debug }));
if (run && !run.result) runs.push({ ...run, result: '(未结束)' });
if (runs.length) {
  console.log(`\n逐局统计（共 ${runs.length} 局）:`);
  runs.forEach((r, i) => console.log(`  第 ${i + 1} 局  结果=${r.result}${r.cause ? '(' + r.cause + ')' : ''}  得分=${r.score ?? '-'}  最高档位=${r.tier ?? '-'}  存活=${r.dur.toFixed(1)}s`));
  const causes = {}; runs.forEach((r) => { if (r.cause) causes[r.cause] = (causes[r.cause] || 0) + 1; });
  if (Object.keys(causes).length) console.log('  死因分布: ' + Object.entries(causes).map(([k, v]) => `${k}×${v}`).join('  '));
  const done = runs.filter((r) => r.result !== '(未结束)'), all = runs;
  const num = (a, k) => a.map((r) => r[k]).filter((v) => typeof v === 'number');
  const avg = (a) => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '-');
  const mx = (a) => (a.length ? Math.max(...a) : '-');
  // 存活平均包含未结束的那一局（它至少活了这么久），避免只有一局且未结束时显示 0
  console.log(`  汇总: 得分 平均 ${avg(num(all, 'score'))} / 最高 ${mx(num(all, 'score'))}；存活 平均 ${avg(num(all, 'dur'))}s / 最长 ${mx(num(all, 'dur').map((v) => +v.toFixed(1)))}s；最高档位 ${mx(num(all, 'tier'))}`);
  console.log('SUMMARY ' + JSON.stringify({ runs: runs.length, scoreAvg: +avg(num(all, 'score')) || 0, scoreMax: mx(num(all, 'score')), surviveAvg: +avg(num(all, 'dur')) || 0, finished: done.length, surviveMax: +(+mx(num(all, 'dur')) || 0).toFixed(1), tierMax: mx(num(all, 'tier')) }));
}
console.log('截图（请逐张查看）:'); shots.forEach((p) => console.log('  ' + p));
if (problems.length) { console.log('\n❌ 失败:'); problems.forEach((p) => console.log('  - ' + p)); process.exit(1); }
console.log('\n✅ 通过（这只说明"没坏"。还要看截图、按 references/fun-check.md 自评）');
