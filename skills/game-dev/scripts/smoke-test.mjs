#!/usr/bin/env node
/* 冒烟测试：无头浏览器打开游戏 → 检查报错/白屏/卡死 → 随机乱玩 → 截图。
 * 用法:
 *   node smoke-test.mjs <游戏目录> [--landscape] [--seconds 8] [--steps "tap:360,640;key:Space;wait:500;shot:name"]
 * steps 是可选的脚本化操作（逻辑坐标），执行完后才开始随机乱玩。
 *   tap:x,y   点击逻辑坐标      key:Code   按一下键(如 Space/ArrowLeft)
 *   hold:Code,ms  按住键         wait:ms    等待      shot:名字  截图
 * 输出: <游戏目录>/.smoke/*.png 截图 + 报告。退出码 0=通过 1=失败。
 * 截图要用读图工具亲自看一遍！脚本只能发现"坏了"，发现不了"丑"和"不好玩"。
 */
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const VALUED = ['--seconds', '--steps'];
const dir = args.find((a, i) => !a.startsWith('--') && !VALUED.includes(args[i - 1]));
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const landscape = args.includes('--landscape');
const seconds = Number(opt('seconds', 8));
const steps = opt('steps', '');

if (!dir || !existsSync(join(dir, 'index.html'))) { console.error('用法: node smoke-test.mjs <游戏目录> [--landscape] [--seconds 8] [--steps "..."]'); process.exit(2); }

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

await page.goto(pathToFileURL(join(resolve(dir), 'index.html')).href);
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
if (s && (await colorCount()) <= 2) problems.push('开始画面几乎是纯色（白屏/黑屏？）。看截图 01-start.png');

// 脚本化步骤
if (s && steps) {
  for (const raw of steps.split(';').map((x) => x.trim()).filter(Boolean)) {
    const [cmd, arg = ''] = raw.split(/:(.*)/s);
    const cur = await state();
    if (cmd === 'tap') { const [x, y] = arg.split(',').map(Number); const p = toScreen(cur, x, y); await page.mouse.click(p.x, p.y); }
    else if (cmd === 'key') await page.keyboard.press(arg);
    else if (cmd === 'hold') { const [k, ms] = arg.split(','); await page.keyboard.down(k); await page.waitForTimeout(Number(ms) || 300); await page.keyboard.up(k); }
    else if (cmd === 'wait') await page.waitForTimeout(Number(arg) || 300);
    else if (cmd === 'shot') await shot(arg || 'step');
    else problems.push('未知 step: ' + raw);
    await page.waitForTimeout(60);
    const ns = await state(); if (ns?.scene) visited.add(ns.scene);
  }
}

// 随机乱玩
if (s) {
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
    const ns = await state(); if (ns?.scene) visited.add(ns.scene);
    if (Date.now() - lastShot > Math.max(2000, (seconds * 1000) / 4)) { await shot(`play-${++n}-${ns?.scene}`); lastShot = Date.now(); }
  }
  await shot('end');
}

const fin = await state();
if (fin?.errors?.length) problems.push(...fin.errors.map((e) => '游戏内错误: ' + e));
problems.push(...[...new Set(consoleErrors)].slice(0, 10));
if (s && visited.size < 2) problems.push(`操作后始终停留在场景 "${firstScene}"：输入可能无效，或开始界面没有响应点击/按键`);
if (fin && fin.particles > 2000) problems.push(`粒子数 ${fin.particles} 过多，可能有粒子泄漏`);

await browser.close();

console.log('==== 冒烟测试报告 ====');
console.log('视口:', landscape ? '横屏 844x390' : '竖屏 390x844');
console.log('经过的场景:', [...visited].join(' → ') || '(无)');
console.log('最终状态:', JSON.stringify({ scene: fin?.scene, frame: fin?.frame, debug: fin?.debug }));
console.log('截图（请逐张查看）:'); shots.forEach((p) => console.log('  ' + p));
if (problems.length) { console.log('\n❌ 失败:'); problems.forEach((p) => console.log('  - ' + p)); process.exit(1); }
console.log('\n✅ 通过（这只说明"没坏"。还要看截图、按 references/fun-check.md 自评）');
