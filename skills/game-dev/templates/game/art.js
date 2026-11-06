/* =====================================================================
 * art.js —— 画风渲染器（不要修改）。API 见 references/art-styles.md
 *
 * 画风 = 一整套画法：背景、角色、敌人、道具、特效、方块，以及 UI 的外观。
 * 在 config.js 里选：art: { style: 'anime' }
 *   anime 二次元 | arcade 街机像素 | cyber 电子合成波 | flat 扁平卡通 | guofeng 国风水墨 | shadiao 沙雕简笔
 * 测试时可用网址参数覆盖：index.html?style=cyber
 *
 * 游戏世界一律用语义化接口绘制，画法由画风决定：
 *   Art.bg(ctx)                                  背景（每帧最先画）
 *   Art.hero(ctx, x, y, r, {angle, speed, stretch})  主角
 *   Art.enemy(ctx, x, y, r, {alpha})             团子型敌人      Art.spiky(ctx, x, y, r, rot, seed)  尖刺型敌人
 *   Art.bullet(ctx, x, y, r, rot, seed)          子弹/碎片/火花  Art.vortex(ctx, x, y, coreR, pullR, alpha)  漩涡/黑洞
 *   Art.pickup(ctx, x, y, r, seed)               收集物（星星/金币/铜钱/鸡腿，随画风变）
 *   Art.warn(ctx, x, y, size, angle?)            预警：不传 angle 是"!"，传 angle 是指向该方向的箭头
 *   Art.block(ctx, x, y, w, h, kind)             方块（x,y 左上角）kind: wall | floor | goal | hazard | switch
 *   Art.tile(ctx, cx, cy, size, kind)            格子（中心点），同上
 *   Art.shape(ctx, pts, role) / Art.circle(ctx, x, y, r, role)   任意形状，按画风上色描边
 *   Art.shockwave(x, y, size, role)             冲击波（调用一次，自动播放）  Art.glow(ctx, x, y, r, role, alpha)  光晕
 *   Art.dot / Art.trail / Art.ring / Art.frame / Art.post(ctx)（每帧最后画）  Art.color(role) → 颜色
 *   role / 颜色：'player' | 'enemy' | 'pickup' | 'accent' | 'wall' | 'dim'，对应 CFG.color（由画风自动填充）
 * 加载后接管 UI.text / title / score / pill / panel / overlay / drawButton / stars / banner 的外观。
 * ===================================================================== */
(function () {
  const TAU = Math.PI * 2;
  const W = () => G.W, H = () => G.H;
  const T = () => G.time;

  // ---------- 通用工具 ----------
  function rng(seed) { let a = (seed * 2654435761) >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hex(c) { let h = c.slice(1); if (h.length === 3) h = [...h].map((x) => x + x).join(''); const n = parseInt(h.slice(0, 6), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function shade(c, k) { let [r, g, b] = hex(c); if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k; } else { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } return `rgb(${r | 0},${g | 0},${b | 0})`; }
  function rgba(c, a) { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; }
  function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function starPts(x, y, r, inner = 0.48, n = 5, rot = -Math.PI / 2) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, k = i % 2 ? r * inner : r; p.push([x + Math.cos(a) * k, y + Math.sin(a) * k]); } return p; }
  function spikePts(x, y, r, n = 9, depth = 0.26, rot = 0) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, k = i % 2 ? r * (1 - depth) : r * 1.06; p.push([x + Math.cos(a) * k, y + Math.sin(a) * k]); } return p; }
  function ngon(x, y, r, n, rot = 0) { return Array.from({ length: n }, (_, k) => [x + Math.cos(rot + (k * TAU) / n) * r, y + Math.sin(rot + (k * TAU) / n) * r]); }
  function heartPts(x, y, r) { const p = []; for (let k = 0; k < 28; k++) { const a = (k / 28) * TAU, hx = 16 * Math.sin(a) ** 3, hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); p.push([x + (hx * r) / 16, y + (hy * r) / 16 + r * 0.1]); } return p; }
  // 颜色角色 → 颜色：'player' | 'enemy' | 'pickup' | 'accent' | 'wall' | 'dim' | 'text' 或直接给 '#rrggbb'
  function rc(S, role) { return (role && S.pal[role]) || role || S.pal.player; }
  function path(ctx, pts, close = true) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (close) ctx.closePath(); }
  function fontOf(S, size, weight) { return `${weight || S.weight} ${size}px ${S.font}`; }
  function measure(ctx, S, s, size, weight) { ctx.save(); ctx.font = fontOf(S, size, weight); const w = ctx.measureText(String(s)).width; ctx.restore(); return w; }
  const SIZE = { display: 120, h1: 76, h2: 52, body: 36, caption: 28, hud: 76 };

  // 按钮内容（图标 + 文字）布局，供各画风复用
  function buttonContent(ctx, S, b, cy, fg, opts = {}) {
    if (b.kind === 'icon') { UI.icon(ctx, b.icon, 0, cy, b.h * 0.46, fg); return; }
    const size = b.size || (b.h >= 100 ? 44 : 36), label = (opts.prefix || '') + b.label;
    const tw = measure(ctx, S, label, size), iw = b.icon && !opts.noIcon ? size * 1.1 + 14 : 0, start = -(tw + iw) / 2;
    if (iw) UI.icon(ctx, b.icon, start + size * 0.55, cy, size, fg);
    opts.draw ? opts.draw(label, start + iw + tw / 2, cy, size) : (ctx.font = fontOf(S, size), ctx.textAlign = 'center', ctx.textBaseline = 'middle', ctx.fillStyle = fg, ctx.fillText(label, start + iw + tw / 2, cy));
  }

  // =====================================================================
  // 二次元：赛璐璐上色、彩色粗描边、大眼睛、天空云朵、闪光
  // =====================================================================
  const anime = {
    label: '二次元', font: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif', weight: 900,
    pal: { bg: '#bfe3ff', bg2: '#ffe6f2', player: '#ffb3c7', enemy: '#8f6bff', pickup: '#ffd93d', text: '#3b2a5c', dim: '#7d6a9e', ink: '#3b2a5c', accent: '#ff5c9a', danger: '#ff4d6d' },
    sparkle(ctx, x, y, s, col = '#fff', a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill(); ctx.restore(); },
    cel(ctx, pts, x, y, r, base, o = {}) {
      ctx.save(); path(ctx, pts); ctx.fillStyle = base; ctx.fill(); ctx.clip();
      ctx.fillStyle = shade(base, -0.2); ctx.beginPath(); ctx.arc(x + r * 0.55, y + r * 0.6, r * 1.05, 0, TAU); ctx.fill();
      ctx.fillStyle = base; ctx.beginPath(); ctx.arc(x - r * 0.12, y - r * 0.15, r * 0.92, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.save(); path(ctx, pts); ctx.lineWidth = Math.max(3, r * 0.11); ctx.strokeStyle = shade(base, -0.55); ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
      if (o.gloss !== false) { ctx.save(); ctx.fillStyle = '#fff'; ctx.globalAlpha *= 0.9; ctx.beginPath(); ctx.ellipse(x - r * 0.4, y - r * 0.45, r * 0.2, r * 0.11, -0.7, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x - r * 0.12, y - r * 0.62, r * 0.06, 0, TAU); ctx.fill(); ctx.restore(); }
    },
    circlePts(x, y, r) { return ngon(x, y, r, 40); },
    shadow(ctx, x, y, r) { ctx.save(); ctx.fillStyle = '#6a4fa0'; ctx.globalAlpha *= 0.16; ctx.beginPath(); ctx.ellipse(x, y + r * 1.1, r * 0.85, r * 0.2, 0, 0, TAU); ctx.fill(); ctx.restore(); },
    eyes(ctx, x, y, r, mood, lx = 0, ly = 0, seed = 0) {
      const P = this.pal, blink = ((T() + seed) % 3.3) < 0.12 ? 0.15 : 1;
      for (const s of [-1, 1]) {
        const ex = x + s * r * 0.33 + lx * r * 0.12, ey = y - r * 0.02 + ly * r * 0.1, ew = r * 0.2, eh = r * 0.3 * blink;
        if (mood === 'angry') { ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = r * 0.1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - s * ew * 1.2, ey - r * 0.36); ctx.lineTo(ex + s * ew * 0.9, ey - r * 0.2); ctx.stroke(); ctx.restore(); }
        ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(ex, ey, ew, eh, 0, 0, TAU); ctx.fill();
        if (blink > 0.5) {
          const g = ctx.createLinearGradient(0, ey - eh, 0, ey + eh);
          g.addColorStop(0, mood === 'angry' ? '#ff3d6e' : '#5b3fd1'); g.addColorStop(1, mood === 'angry' ? '#ffc29a' : '#7fd6ff');
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(ex, ey + eh * 0.12, ew * 0.76, eh * 0.76, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex - ew * 0.25, ey - eh * 0.35, ew * 0.36, eh * 0.25, 0, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(ex + ew * 0.3, ey + eh * 0.35, ew * 0.15, 0, TAU); ctx.fill();
        }
      }
      if (mood !== 'angry') {
        ctx.save(); ctx.fillStyle = '#ff6b9a'; ctx.globalAlpha *= 0.45; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * r * 0.58, y + r * 0.3, r * 0.15, r * 0.08, 0, 0, TAU); ctx.fill(); } ctx.restore();
        ctx.strokeStyle = P.ink; ctx.lineWidth = r * 0.06; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x + lx * r * 0.1, y + r * 0.28, r * 0.1, 0.2, Math.PI - 0.2); ctx.stroke();
      } else { ctx.strokeStyle = P.ink; ctx.lineWidth = r * 0.07; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - r * 0.15, y + r * 0.36); ctx.quadraticCurveTo(x, y + r * 0.26, x + r * 0.15, y + r * 0.36); ctx.stroke(); }
    },
    bg(ctx) {
      const P = this.pal, t = T(), w = W(), h = H();
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7ec8ff'); g.addColorStop(0.65, '#fff0fa'); g.addColorStop(1, '#ffd9ec');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) { const o = ((t * 6) % 220); ctx.beginPath(); ctx.moveTo(-160 + i * 220 + o, 0); ctx.lineTo(-40 + i * 220 + o, 0); ctx.lineTo(200 + i * 220 + o, h); ctx.lineTo(60 + i * 220 + o, h); ctx.fill(); }
      ctx.restore();
      const cloud = (cx, cy, s) => {
        const puffs = [[0, 0, 1], [-0.9, 0.25, 0.7], [0.9, 0.2, 0.75], [-0.4, -0.35, 0.75], [0.45, -0.3, 0.7]];
        ctx.fillStyle = '#d6e9ff'; puffs.forEach(([dx, dy, k]) => { ctx.beginPath(); ctx.arc(cx + dx * s, cy + dy * s + s * 0.14, k * s, 0, TAU); ctx.fill(); });
        ctx.fillStyle = '#fff'; puffs.forEach(([dx, dy, k]) => { ctx.beginPath(); ctx.arc(cx + dx * s, cy + dy * s, k * s, 0, TAU); ctx.fill(); });
      };
      const drift = (sp, x0) => ((x0 + t * sp) % (w + 300)) - 150;
      cloud(drift(8, 140), 230, 70); cloud(drift(5, 600), 150, 50); cloud(drift(10, 520), 1150, 90); cloud(drift(6, 60), 1230, 60); cloud(drift(4, 330), 640, 40);
      const R = rng(7); for (let i = 0; i < 16; i++) { const x = R() * w, y = R() * h, s = 6 + R() * 12, a = 0.5 + 0.5 * Math.sin(t * 3 + i); this.sparkle(ctx, x, y, s * (0.6 + a * 0.4), '#fff', a); }
    },
    hero(ctx, x, y, r, o = {}) {
      const b = 1 + Math.sin(T() * 4) * 0.04, lx = Math.cos(o.angle || 0) * (o.speed || 0), ly = Math.sin(o.angle || 0) * (o.speed || 0);
      this.shadow(ctx, x, y, r);
      ctx.save(); ctx.translate(x, y); if (o.angle !== undefined && o.stretch) { ctx.rotate(o.angle); ctx.scale(1 + o.stretch, 1 - o.stretch * 0.6); ctx.rotate(-o.angle); } ctx.scale(1 / b, b);
      this.cel(ctx, this.circlePts(0, 0, r), 0, 0, r, this.pal.player);
      ctx.strokeStyle = shade(this.pal.player, -0.55); ctx.lineWidth = r * 0.1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * 0.3, -r * 1.5, -r * 0.1, -r * 1.4); ctx.stroke();
      this.eyes(ctx, 0, 0, r, 'happy', lx, ly); ctx.restore();
    },
    ghost(ctx, x, y, r, o = {}) {
      ctx.save(); ctx.globalAlpha *= o.alpha ?? 0.8;
      const wob = ngon(x, y, r, 40).map(([px, py], k) => [px + Math.sin(T() * 8 + k) * 1.5, py + (py > y ? Math.sin(T() * 10 + k * 1.3) * r * 0.12 : 0)]);
      this.cel(ctx, wob, x, y, r, this.pal.enemy); this.eyes(ctx, x, y, r, 'angry', 0, 0, 1.3); ctx.restore();
    },
    dot(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = role === 'enemy' ? shade(this.pal.enemy, 0.35) : (role === 'player' || !role ? '#fff' : rc(this, role)); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); },
    spark(ctx, x, y, r, rot) { this.cel(ctx, starPts(x, y, r * 1.3, 0.42, 4, rot), x, y, r, this.pal.danger, { gloss: false }); },
    hunter(ctx, x, y, r, rot, seed = 0) { this.shadow(ctx, x, y, r); this.cel(ctx, spikePts(x, y, r, 10, 0.22, rot * 0.3), x, y, r, this.pal.enemy); this.eyes(ctx, x, y + r * 0.05, r * 0.85, 'angry', 0, 0, seed); },
    hole(ctx, x, y, core, pull, a) {
      const t = T(); ctx.save(); ctx.globalAlpha *= a;
      ctx.setLineDash([10, 14]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = this.pal.enemy; ctx.globalAlpha *= 0.5; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, pull, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha /= 0.5;
      for (let k = 0; k < 3; k++) { ctx.strokeStyle = k % 2 ? '#c9b6ff' : this.pal.enemy; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, core + 14 + k * 14, t * (2 + k) + k, t * (2 + k) + k + 4); ctx.stroke(); }
      this.cel(ctx, ngon(x, y, core, 30), x, y, core, '#4b2f8f', { gloss: false }); ctx.fillStyle = '#1d1238'; ctx.beginPath(); ctx.arc(x, y, core * 0.6, 0, TAU); ctx.fill();
      this.sparkle(ctx, x + core * 0.5, y - core * 0.5, 8, '#fff', 0.8); ctx.restore();
    },
    pickup(ctx, x, y, r, seed = 0) { this.cel(ctx, starPts(x, y, r * 1.15, 0.5, 5, -Math.PI / 2 + Math.sin(T() * 2 + seed) * 0.2), x, y, r, this.pal.pickup); this.sparkle(ctx, x + r, y - r, 10, '#fff', 0.5 + 0.5 * Math.sin(T() * 5 + seed)); },
    warn(ctx, x, y, s, ang) {
      if (ang !== undefined && ang !== null) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); this.cel(ctx, [[0, -s * 0.6], [s * 0.5, s * 0.1], [s * 0.2, s * 0.1], [s * 0.2, s * 0.55], [-s * 0.2, s * 0.55], [-s * 0.2, s * 0.1], [-s * 0.5, s * 0.1]], 0, 0, s * 0.5, this.pal.danger, { gloss: false }); ctx.restore(); return; }
      this.cel(ctx, ngon(x, y, s * 0.5, 30), x, y, s * 0.5, this.pal.danger); ctx.save(); ctx.font = `900 ${s * 0.7}px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('!', x, y + 2); ctx.restore();
    },
    ring(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a; ctx.setLineDash([12, 12]); ctx.lineDashOffset = -T() * 30; ctx.strokeStyle = role === 'pickup' ? '#f5b400' : rc(this, role || 'enemy'); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore(); },
    frame(ctx, x0, y0, x1, y1) { ctx.save(); rr(ctx, x0, y0, x1 - x0, y1 - y0, 40); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) this.sparkle(ctx, x, y, 14, '#fff', 0.9); },
    post() {},
    // ---- UI ----
    outlined(ctx, s, x, y, size, fill, o = {}) {
      ctx.save(); ctx.font = fontOf(this, size, o.weight); ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      if (size >= 34) { ctx.lineWidth = size * 0.3; ctx.strokeStyle = this.pal.ink; ctx.strokeText(s, x, y + size * 0.06); ctx.lineWidth = size * 0.17; ctx.strokeStyle = '#fff'; ctx.strokeText(s, x, y); }
      else { ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.strokeText(s, x, y); }
      ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.restore();
    },
    text(ctx, s, x, y, o = {}) { const size = o.size || SIZE[o.role || 'body']; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; this.outlined(ctx, String(s), x, y, size, o.color === this.pal.dim ? this.pal.dim : (o.color || this.pal.ink), { align: o.align, weight: size >= 40 ? 900 : 800 }); ctx.restore(); },
    title(ctx, s, x, y, o = {}) {
      const t = o.t ?? T(), chars = [...s].filter((c) => c !== ' '), gap = 130; ctx.save(); ctx.font = `900 118px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      chars.forEach((ch, i) => { const cx = x + (i - (chars.length - 1) / 2) * gap, cy = y + Math.sin(t * 3 + i * 0.8) * 8;
        ctx.lineWidth = 32; ctx.strokeStyle = this.pal.ink; ctx.strokeText(ch, cx, cy + 7); ctx.lineWidth = 19; ctx.strokeStyle = '#fff'; ctx.strokeText(ch, cx, cy);
        const g = ctx.createLinearGradient(0, cy - 50, 0, cy + 50); g.addColorStop(0, '#ff9cc2'); g.addColorStop(0.55, this.pal.accent); g.addColorStop(1, '#a06bff'); ctx.fillStyle = g; ctx.fillText(ch, cx, cy);
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(cx - 26, cy - 32, 16, 6, -0.3, 0, TAU); ctx.fill(); });
      ctx.restore(); this.sparkle(ctx, x + gap * chars.length * 0.62, y - 60, 22); this.sparkle(ctx, x - gap * chars.length * 0.62, y + 40, 16);
    },
    score(ctx, v, x, y, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(o.scale || 1, o.scale || 1); this.outlined(ctx, String(v), 0, 0, 80, this.pal.accent); ctx.restore(); },
    pill(ctx, x, y, o = {}) {
      const h = 68, size = 34, tw = measure(ctx, this, o.text ?? '', size), iw = o.icon ? h - 10 : 0, w = Math.max(h * 1.6, tw + iw + 44);
      const L = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
      ctx.save(); rr(ctx, L, y - h / 2 + 5, w, h, h / 2); ctx.fillStyle = this.pal.ink; ctx.fill(); rr(ctx, L, y - h / 2, w, h, h / 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = this.pal.ink; ctx.stroke();
      if (o.icon) { const ic = o.icon === 'star' ? this.pal.pickup : o.icon === 'trophy' ? '#ffc93d' : this.pal.accent; this.cel(ctx, ngon(L + h / 2, y, h / 2 - 9, 30), L + h / 2, y, h / 2 - 9, ic, { gloss: false }); UI.icon(ctx, o.icon, L + h / 2, y, h * 0.42, '#fff'); }
      ctx.font = fontOf(this, size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = this.pal.ink; ctx.fillText(String(o.text ?? ''), L + iw + (w - iw) / 2, y + 1); ctx.restore(); return w;
    },
    panel(ctx, x, y, w, h, o = {}) {
      const L = x - w / 2, Tp = y - h / 2; ctx.save();
      rr(ctx, L, Tp + 12, w, h, 40); ctx.fillStyle = this.pal.ink; ctx.fill();
      rr(ctx, L, Tp, w, h, 40); ctx.fillStyle = '#fff'; ctx.fill(); ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(255,92,154,0.08)'; ctx.lineWidth = 14; for (let k = -h; k < w + h; k += 40) { ctx.beginPath(); ctx.moveTo(L + k, Tp); ctx.lineTo(L + k - h, Tp + h); ctx.stroke(); }
      ctx.restore(); rr(ctx, L, Tp, w, h, 40); ctx.lineWidth = 7; ctx.strokeStyle = this.pal.ink; ctx.stroke();
      if (o.title) { const tw = measure(ctx, this, o.title, 44) + 80, th = 76, ty = Tp; rr(ctx, x - tw / 2, ty - th / 2 + 6, tw, th, th / 2); ctx.fillStyle = this.pal.ink; ctx.fill(); rr(ctx, x - tw / 2, ty - th / 2, tw, th, th / 2); ctx.fillStyle = o.titleColor === this.pal.enemy ? this.pal.danger : this.pal.accent; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = this.pal.ink; ctx.stroke();
        ctx.font = fontOf(this, 44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.lineJoin = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = this.pal.ink; ctx.strokeText(o.title, x, ty + 2); ctx.fillText(o.title, x, ty + 2); this.sparkle(ctx, x + tw / 2 - 6, ty - 30, 14); }
      ctx.restore();
    },
    overlay(ctx) { ctx.fillStyle = 'rgba(59,42,92,0.45)'; ctx.fillRect(0, 0, W(), H()); },
    button(ctx, b) {
      const P = this.pal, w = b.w, h = b.h, icon = b.kind === 'icon', r = h / 2, push = b._down ? 7 : 0;
      ctx.save(); ctx.translate(b.x, b.y); ctx.scale(b._scale, b._scale); if (!b.enabled) ctx.globalAlpha *= 0.45;
      const fill = b.kind === 'primary' || !b.kind ? null : b.kind === 'danger' ? P.danger : '#fff';
      rr(ctx, -w / 2, -h / 2 + 9, w, h, r); ctx.fillStyle = P.ink; ctx.fill();
      rr(ctx, -w / 2, -h / 2 + push, w, h, r);
      if (!fill) { const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#ff9cc2'); g.addColorStop(1, P.accent); ctx.fillStyle = g; } else ctx.fillStyle = fill;
      ctx.fill(); ctx.lineWidth = icon ? 6 : 7; ctx.strokeStyle = P.ink; ctx.stroke();
      if (!icon) { rr(ctx, -w / 2 + 12, -h / 2 + 8 + push, w - 24, h * 0.3, h * 0.15); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill(); }
      const fg = fill === '#fff' ? P.accent : '#fff';
      buttonContent(ctx, this, b, push + 2, fg, { draw: (s, tx, ty, size) => { ctx.font = fontOf(this, size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; if (fg === '#fff') { ctx.lineWidth = 9; ctx.strokeStyle = P.ink; ctx.strokeText(s, tx, ty); } ctx.fillStyle = fill === '#fff' ? P.ink : '#fff'; ctx.fillText(s, tx, ty); } });
      ctx.restore(); if (!icon && b.enabled && (!b.kind || b.kind === 'primary')) this.sparkle(ctx, b.x + w / 2 - 22, b.y - h / 2 + 4, 14, '#fff', 0.6 + 0.4 * Math.sin(T() * 4));
    },
    stars(ctx, x, y, n, max = 3, size = 72) { for (let i = 0; i < max; i++) { const cx = x + (i - (max - 1) / 2) * size * 1.25, cy = y + (i === 1 ? -size * 0.2 : 0), r = size * 0.5 * (i === 1 ? 1.15 : 1); this.cel(ctx, starPts(cx, cy, r * 1.15, 0.5), cx, cy, r, i < n ? this.pal.pickup : '#d8cfe8'); } },
    banner(ctx, s, y, o = {}) { ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.translate(W() / 2, y); ctx.rotate(-0.05);
      ctx.fillStyle = this.pal.ink; ctx.fillRect(-W(), -56 + 10, W() * 2, 112); ctx.fillStyle = this.pal.accent; ctx.fillRect(-W(), -56, W() * 2, 112); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-W(), -46, W() * 2, 10);
      ctx.strokeStyle = this.pal.ink; ctx.lineWidth = 6; ctx.strokeRect(-W(), -56, W() * 2, 112); this.outlined(ctx, s, 0, 2, 64, '#fff'); this.sparkle(ctx, 220, -40, 18); ctx.restore(); },
  };

  // =====================================================================
  // 素描：纸张纹理、抖动铅笔线（每 0.14 秒"沸腾"一次）、排线阴影、彩铅/荧光笔点缀
  // =====================================================================
  const sketch = {
    label: '素描', font: '"Kaiti SC","STKaiti","KaiTi","Songti SC",serif', weight: 700,
    pal: { bg: '#f3eee3', bg2: '#e8e0cf', player: '#f2c94c', enemy: '#d9483b', pickup: '#5aa469', text: '#34343a', dim: '#7d7d88', ink: '#34343a', accent: '#d9483b', danger: '#d9483b', blue: '#4a7bd0' },
    grain: null,
    boil() { return Math.floor(T() * 7); },
    makeGrain() { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), d = g.createImageData(256, 256), R = rng(3); for (let i = 0; i < d.data.length; i += 4) { const v = 190 + R() * 65; d.data[i] = v; d.data[i + 1] = v * 0.97; d.data[i + 2] = v * 0.9; d.data[i + 3] = 30; } g.putImageData(d, 0, 0); this.grain = c; },
    line(ctx, x1, y1, x2, y2, R, w = 3, col) { const j = () => (R() - 0.5) * 4, mx = (x1 + x2) / 2 + (R() - 0.5) * 6, my = (y1 + y2) / 2 + (R() - 0.5) * 6; ctx.strokeStyle = col || this.pal.ink; ctx.lineWidth = w * (0.7 + R() * 0.5); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1 + j(), y1 + j()); ctx.quadraticCurveTo(mx, my, x2 + j(), y2 + j()); ctx.stroke(); },
    poly(ctx, pts, seed, col, w = 3, passes = 2) { const R = rng(seed * 97 + this.boil()); ctx.save(); ctx.globalAlpha *= 0.88; for (let p = 0; p < passes; p++) for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], ex = (b[0] - a[0]) * 0.06, ey = (b[1] - a[1]) * 0.06; this.line(ctx, a[0] - ex, a[1] - ey, b[0] + ex, b[1] + ey, R, w, col); } ctx.restore(); },
    circle(ctx, x, y, r, seed, col, w = 3) { const R = rng(seed * 31 + this.boil()); ctx.save(); ctx.strokeStyle = col || this.pal.ink; ctx.lineCap = 'round'; ctx.globalAlpha *= 0.88;
      for (let p = 0; p < 2; p++) { const a0 = R() * TAU, turn = TAU * (1.05 + R() * 0.15); ctx.lineWidth = w * (0.7 + R() * 0.5); ctx.beginPath(); for (let k = 0; k <= 36; k++) { const a = a0 + (k / 36) * turn, q = r * (1 + (R() - 0.5) * 0.05 + (p ? 0.03 : 0)); ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } ctx.stroke(); } ctx.restore(); },
    hatch(ctx, clip, x, y, r, seed, angle = 0.8, gap = 9, col, alpha = 0.55) { const R = rng(seed * 13 + this.boil()); ctx.save(); clip(); ctx.clip(); ctx.strokeStyle = col || this.pal.ink; ctx.globalAlpha *= alpha; ctx.lineCap = 'round'; const c = Math.cos(angle), s = Math.sin(angle);
      for (let d = -r * 1.5; d < r * 1.5; d += gap) { const ox = x - s * d, oy = y + c * d; ctx.lineWidth = 1.2 + R() * 1.2; ctx.beginPath(); ctx.moveTo(ox - c * r * 1.6 + (R() - 0.5) * 8, oy - s * r * 1.6); ctx.lineTo(ox + c * r * 1.6 + (R() - 0.5) * 8, oy + s * r * 1.6); ctx.stroke(); } ctx.restore(); },
    marker(ctx, pts, col, a = 0.5, dx = 5, dy = 4) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; path(ctx, pts.map(([x, y]) => [x + dx, y + dy])); ctx.fill(); ctx.restore(); },
    bg(ctx) {
      if (!this.grain) this.makeGrain(); const w = W(), h = H();
      ctx.fillStyle = this.pal.bg; ctx.fillRect(0, 0, w, h); ctx.save(); ctx.fillStyle = ctx.createPattern(this.grain, 'repeat'); ctx.fillRect(0, 0, w, h); ctx.restore();
      ctx.save(); ctx.strokeStyle = '#9fb7d9'; ctx.globalAlpha = 0.35; ctx.lineWidth = 2; for (let y = 180; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = '#e08a8a'; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(64, h); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.5; this.circle(ctx, 650, 1215, 34, 900, this.pal.dim, 2); this.poly(ctx, [[20, 1250], [110, 1232], [70, 1190]], 901, this.pal.dim, 2, 1); ctx.restore();
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75); g.addColorStop(0, 'rgba(120,90,40,0)'); g.addColorStop(1, 'rgba(120,90,40,0.2)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    },
    face(ctx, x, y, r, mood, lx = 0, ly = 0, seed = 0) { const R = rng(seed + 77 + this.boil()), blink = ((T() + seed) % 3) < 0.12;
      for (const s of [-1, 1]) { const ex = x + s * r * 0.3 + lx * r * 0.12, ey = y - r * 0.1 + ly * r * 0.1;
        if (mood === 'angry') this.line(ctx, ex + s * r * 0.22, ey - r * 0.3, ex - s * r * 0.12, ey - r * 0.14, R, 3.5);
        if (blink) this.line(ctx, ex - r * 0.12, ey, ex + r * 0.12, ey, R, 3.5); else { ctx.fillStyle = this.pal.ink; ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.09, r * 0.14, 0, 0, TAU); ctx.fill(); } }
      ctx.strokeStyle = this.pal.ink; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.beginPath(); if (mood === 'angry') { ctx.moveTo(x - r * 0.2, y + r * 0.35); ctx.quadraticCurveTo(x, y + r * 0.2, x + r * 0.2, y + r * 0.37); } else ctx.arc(x + lx * r * 0.1, y + r * 0.15, r * 0.22, 0.35, Math.PI - 0.35); ctx.stroke(); },
    hero(ctx, x, y, r, o = {}) {
      const lx = Math.cos(o.angle || 0) * (o.speed || 0), ly = Math.sin(o.angle || 0) * (o.speed || 0);
      ctx.save(); ctx.translate(x, y); if (o.angle !== undefined && o.stretch) { ctx.rotate(o.angle); ctx.scale(1 + o.stretch, 1 - o.stretch * 0.6); ctx.rotate(-o.angle); }
      this.marker(ctx, ngon(0, 0, r * 0.98, 30), this.pal.player, 0.75, 4, 4);
      this.hatch(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); }, r * 0.55, r * 0.55, r * 0.6, 12, 0.8, 7, null, 0.45);
      this.circle(ctx, 0, 0, r, 1, null, 3.6); this.face(ctx, 0, 0, r, 'happy', lx, ly, 3);
      const R = rng(5 + this.boil()); this.line(ctx, -r * 0.95, -r * 0.1, -r * 1.35, r * 0.25, R, 3); this.line(ctx, r * 0.95, -r * 0.1, r * 1.38, -r * 0.45, R, 3);
      ctx.restore();
    },
    ghost(ctx, x, y, r, o = {}) { ctx.save(); ctx.globalAlpha *= o.alpha ?? 0.85; const R = rng(41 + this.boil());
      ctx.strokeStyle = this.pal.enemy; ctx.lineWidth = 2.2; ctx.globalAlpha *= 0.8; ctx.beginPath(); for (let k = 0; k < 70; k++) { const a = k * 0.55, q = r * (0.35 + R() * 0.7); ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } ctx.stroke();
      this.circle(ctx, x, y, r, 42, this.pal.enemy, 3.2); this.face(ctx, x, y, r * 0.9, 'angry', 0, 0, 9); ctx.restore(); },
    dot(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a * 0.8; ctx.strokeStyle = role === 'player' || !role ? this.pal.dim : rc(this, role); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, TAU); ctx.stroke(); ctx.restore(); },
    spark(ctx, x, y, r, rot, seed = 0) { const pts = ngon(x, y, r * 1.2, 3, rot); this.hatch(ctx, () => path(ctx, pts), x, y, r, seed + 5, -0.7, 5, this.pal.enemy, 0.85); this.poly(ctx, pts, seed + 6, null, 2.6, 2); },
    hunter(ctx, x, y, r, rot, seed = 0) { const pts = spikePts(x, y, r, 9, 0.3, rot * 0.2); this.hatch(ctx, () => path(ctx, pts), x, y, r, seed + 20, -0.7, 6, this.pal.enemy, 0.65); this.poly(ctx, pts, seed + 30, null, 3, 2); this.face(ctx, x, y + r * 0.05, r * 0.8, 'angry', 0, 0, seed); },
    hole(ctx, x, y, core, pull, a) { const R = rng(55 + this.boil()); ctx.save(); ctx.globalAlpha *= a;
      ctx.setLineDash([16, 14]); this.circle(ctx, x, y, pull, 60, this.pal.dim, 2); ctx.setLineDash([]);
      ctx.strokeStyle = this.pal.ink; ctx.lineCap = 'round'; ctx.lineWidth = 2.4; ctx.beginPath(); for (let k = 0; k < 90; k++) { const ang = k * 0.32 - T() * 3, q = core * 1.9 * (1 - k / 90) + R() * 2; ctx.lineTo(x + Math.cos(ang) * q, y + Math.sin(ang) * q); } ctx.stroke();
      ctx.fillStyle = this.pal.ink; ctx.globalAlpha *= 0.85; ctx.beginPath(); ctx.arc(x, y, core * 0.55, 0, TAU); ctx.fill(); ctx.restore(); },
    pickup(ctx, x, y, r, seed = 0) { const pts = starPts(x, y, r * 1.15, 0.5, 5, -Math.PI / 2 + Math.sin(T() * 2 + seed) * 0.15); this.marker(ctx, pts, '#f2c94c', 0.75); this.poly(ctx, pts, 50 + seed, null, 2.6, 2);
      const R = rng(seed + 3 + this.boil()); for (let k = 0; k < 3; k++) { const a = -1.8 + k * 0.6; this.line(ctx, x + Math.cos(a) * r * 1.45, y + Math.sin(a) * r * 1.45, x + Math.cos(a) * r * 1.85, y + Math.sin(a) * r * 1.85, R, 2.5, this.pal.dim); } },
    warn(ctx, x, y, s, ang) { ctx.save(); ctx.translate(x, y); if (ang !== undefined && ang !== null) { ctx.rotate(ang); const R = rng(8 + this.boil()); this.line(ctx, 0, s * 0.5, 0, -s * 0.5, R, 5, this.pal.enemy); this.line(ctx, 0, -s * 0.55, -s * 0.35, -s * 0.15, R, 5, this.pal.enemy); this.line(ctx, 0, -s * 0.55, s * 0.35, -s * 0.15, R, 5, this.pal.enemy); ctx.restore(); return; }
      const pts = ngon(0, 0, s * 0.6, 3, -Math.PI / 2); this.marker(ctx, pts, this.pal.enemy, 0.3, 0, 0); this.poly(ctx, pts, 9, this.pal.enemy, 4, 2); ctx.font = `700 ${s * 0.6}px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = this.pal.enemy; ctx.fillText('!', 0, s * 0.08); ctx.restore(); },
    ring(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a * 2; ctx.setLineDash([14, 12]); this.circle(ctx, x, y, r, 70, rc(this, role || 'enemy'), 2); ctx.restore(); },
    frame(ctx, x0, y0, x1, y1) { ctx.save(); ctx.globalAlpha *= 0.55; this.poly(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 300, null, 2.5, 1); ctx.restore(); },
    post() {},
    // ---- UI ----
    text(ctx, s, x, y, o = {}) { const size = o.size || SIZE[o.role || 'body']; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.font = fontOf(this, size, size >= 40 ? 700 : 500); ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
      const col = o.color === this.pal.enemy ? this.pal.enemy : o.color === this.pal.dim ? this.pal.dim : o.color === this.pal.player ? this.pal.accent : this.pal.ink;
      if (size >= 40) { ctx.fillStyle = col; ctx.globalAlpha *= 0.25; ctx.fillText(String(s), x + 3, y + 3); ctx.globalAlpha /= 0.25; } ctx.fillStyle = col; ctx.fillText(String(s), x, y); ctx.restore(); },
    title(ctx, s, x, y) { const chars = [...s].filter((c) => c !== ' '), gap = 150; ctx.save(); ctx.font = `700 128px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      chars.forEach((ch, i) => { const cx = x + (i - (chars.length - 1) / 2) * gap; ctx.save(); ctx.translate(cx, y); ctx.rotate(i % 2 ? 0.06 : -0.05); ctx.fillStyle = this.pal.ink; ctx.globalAlpha = 0.22; ctx.fillText(ch, 5, 5); ctx.globalAlpha = 0.92; ctx.fillText(ch, 0, 0); ctx.restore(); }); ctx.restore();
      const R = rng(9 + this.boil()), hw = gap * chars.length * 0.55; this.line(ctx, x - hw, y + 70, x + hw, y + 64, R, 5, this.pal.accent); this.line(ctx, x - hw + 30, y + 80, x + hw + 20, y + 76, R, 3, this.pal.accent); },
    score(ctx, v, x, y, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(o.scale || 1, o.scale || 1); ctx.font = `700 84px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = this.pal.ink; ctx.fillText(String(v), 0, 0); const w = Math.max(60, measure(ctx, this, String(v), 84) * 0.6 + 20); ctx.scale(1, 0.62); this.circle(ctx, 0, 0, w, 400, this.pal.accent, 3); ctx.restore(); },
    pill(ctx, x, y, o = {}) { const h = 66, size = 36, tw = measure(ctx, this, o.text ?? '', size), iw = o.icon ? h - 10 : 0, w = Math.max(h * 1.6, tw + iw + 44), L = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
      this.poly(ctx, [[L, y - h / 2], [L + w, y - h / 2], [L + w, y + h / 2], [L, y + h / 2]], 210 + Math.round(L), null, 2.6, 1);
      if (o.icon === 'star') this.pickup(ctx, L + h / 2, y, 18, 4); else if (o.icon) UI.icon(ctx, o.icon, L + h / 2, y, h * 0.5, this.pal.ink);
      ctx.save(); ctx.font = fontOf(this, size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = this.pal.ink; ctx.fillText(String(o.text ?? ''), L + iw + (w - iw) / 2, y + 2); ctx.restore(); return w; },
    panel(ctx, x, y, w, h, o = {}) { const L = x - w / 2, Tp = y - h / 2, box = [[L, Tp], [L + w, Tp], [L + w, Tp + h], [L, Tp + h]];
      this.hatch(ctx, () => { ctx.beginPath(); ctx.rect(L + 16, Tp + 16, w, h); }, x + 16, y + 16, Math.max(w, h) * 0.6, 600, 0.8, 10, null, 0.35);
      ctx.save(); ctx.fillStyle = this.pal.bg; ctx.fillRect(L, Tp, w, h); ctx.fillStyle = ctx.createPattern(this.grain || (this.makeGrain(), this.grain), 'repeat'); ctx.fillRect(L, Tp, w, h); ctx.restore();
      this.poly(ctx, box, 601, null, 3.2, 2);
      for (const [tx, rot] of [[L + 30, -0.5], [L + w - 30, 0.5]]) { ctx.save(); ctx.translate(tx, Tp); ctx.rotate(rot); ctx.fillStyle = 'rgba(242,201,76,0.55)'; ctx.fillRect(-46, -16, 92, 32); ctx.restore(); }
      if (o.title) { const tw = measure(ctx, this, o.title, 52) / 2 + 36, lab = [[x - tw, Tp - 40], [x + tw, Tp - 40], [x + tw, Tp + 36], [x - tw, Tp + 36]]; ctx.save(); ctx.fillStyle = this.pal.bg; path(ctx, lab); ctx.fill(); ctx.restore(); this.poly(ctx, lab, 606, null, 3, 2);
        ctx.save(); ctx.font = `700 52px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.titleColor === this.pal.enemy ? this.pal.enemy : this.pal.ink; ctx.fillText(o.title, x, Tp); ctx.restore(); } },
    overlay(ctx) { ctx.fillStyle = 'rgba(243,238,227,0.72)'; ctx.fillRect(0, 0, W(), H()); },
    button(ctx, b) { const w = b.w, h = b.h, L = -w / 2, Tp = -h / 2, icon = b.kind === 'icon', push = b._down ? 6 : 0; ctx.save(); ctx.translate(b.x, b.y); ctx.scale(b._scale, b._scale); if (!b.enabled) ctx.globalAlpha *= 0.4; const seed = Math.round(b.x * 3 + b.y);
      if (icon) { this.hatch(ctx, () => { ctx.beginPath(); ctx.arc(6, 6, h / 2, 0, TAU); }, 6, 6, h / 2, seed, 0.8, 7, null, 0.35); ctx.fillStyle = this.pal.bg; ctx.beginPath(); ctx.arc(0, push, h / 2, 0, TAU); ctx.fill(); this.circle(ctx, 0, push, h / 2, seed, null, 3); UI.icon(ctx, b.icon, 0, push, h * 0.42, this.pal.ink); ctx.restore(); return; }
      this.hatch(ctx, () => { ctx.beginPath(); ctx.rect(L + 12, Tp + 12, w, h); }, 12, 12, w * 0.6, seed, 0.8, 9, null, b.kind === 'secondary' ? 0.25 : 0.45);
      ctx.fillStyle = this.pal.bg; ctx.fillRect(L + push, Tp + push, w, h);
      if (!b.kind || b.kind === 'primary') { ctx.save(); ctx.globalAlpha *= 0.6; ctx.fillStyle = this.pal.player; ctx.fillRect(L + 18 + push, -6 + push, w - 36, 34); ctx.restore(); }
      this.poly(ctx, [[L + push, Tp + push], [L + w + push, Tp + push], [L + w + push, Tp + h + push], [L + push, Tp + h + push]], seed + 1, null, b.kind === 'secondary' ? 2.6 : 3.4, 2);
      buttonContent(ctx, this, b, push + 2, this.pal.ink, { draw: (s, tx, ty, size) => { ctx.font = fontOf(this, size + 6); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = this.pal.ink; ctx.fillText(s, tx + push, ty); } });
      ctx.restore(); },
    stars(ctx, x, y, n, max = 3, size = 72) { for (let i = 0; i < max; i++) { const cx = x + (i - (max - 1) / 2) * size * 1.25, pts = starPts(cx, y, size * 0.6, 0.5); if (i < n) this.marker(ctx, pts, '#f2c94c', 0.8); this.poly(ctx, pts, 700 + i, i < n ? null : this.pal.dim, 3, 2); } },
    banner(ctx, s, y, o = {}) { ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.translate(W() / 2, y); ctx.rotate(-0.03); const w = 560, h = 120;
      ctx.fillStyle = this.pal.bg; ctx.fillRect(-w / 2, -h / 2, w, h); this.poly(ctx, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], 800, null, 3, 2);
      ctx.fillStyle = 'rgba(242,201,76,0.55)'; ctx.save(); ctx.rotate(-0.4); ctx.fillRect(-w / 2 - 10, -h / 2 - 60, 90, 30); ctx.restore();
      ctx.font = `700 64px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = this.pal.enemy; ctx.fillText(s, 0, 4); ctx.restore(); },
  };

  // =====================================================================
  // 电子（合成波）：透视网格、条纹落日、发光线框、扫描线、色差
  // =====================================================================
  const cyber = {
    label: '电子', font: '"SF Mono","Menlo","Consolas","PingFang SC","Microsoft YaHei",monospace', weight: 800,
    pal: { bg: '#05010f', bg2: '#2a0845', player: '#00f0ff', enemy: '#ff3b5c', pickup: '#ffe14d', text: '#e8fbff', dim: '#8a7ab8', ink: '#05010f', accent: '#ff2bd6', danger: '#ff3b5c' },
    glow(ctx, col, blur) { ctx.shadowColor = col; ctx.shadowBlur = blur; },
    bg(ctx) { const P = this.pal, t = T(), w = W(), h = H(), hz = 760;
      const g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, P.bg); g.addColorStop(1, P.bg2); ctx.fillStyle = g; ctx.fillRect(0, 0, w, hz); ctx.fillStyle = '#07010f'; ctx.fillRect(0, hz, w, h - hz);
      const R = rng(4); ctx.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { ctx.globalAlpha = 0.15 + R() * 0.5 * (0.6 + 0.4 * Math.sin(t * 2 + i)); ctx.fillRect(R() * w, R() * hz * 0.85, 2, 2); } ctx.globalAlpha = 1;
      ctx.save(); const sy = hz - 40, sr = 200; ctx.beginPath(); ctx.arc(w / 2, sy, sr, Math.PI, 0); ctx.closePath(); ctx.clip(); const sg = ctx.createLinearGradient(0, sy - sr, 0, sy); sg.addColorStop(0, '#ffe14d'); sg.addColorStop(0.5, '#ff7a3d'); sg.addColorStop(1, '#ff2bd6');
      ctx.fillStyle = sg; ctx.fillRect(w / 2 - sr, sy - sr, sr * 2, sr); ctx.fillStyle = P.bg2; for (let k = 0; k < 7; k++) { const yy = sy - 12 - k * 22 + ((t * 10) % 22), hh = 10 - k * 1.2; if (hh > 0) ctx.fillRect(w / 2 - sr, yy, sr * 2, hh); } ctx.restore();
      ctx.save(); ctx.strokeStyle = P.player; ctx.globalAlpha = 0.45; ctx.lineWidth = 2; path(ctx, [[0, hz], [90, 660], [170, 720], [250, 640], [330, hz], [470, hz], [540, 670], [610, 720], [680, 650], [w, hz]], false); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.strokeStyle = P.accent; ctx.lineWidth = 2; const vx = w / 2; ctx.globalAlpha = 0.6; ctx.beginPath(); for (let i = -12; i <= 12; i++) { ctx.moveTo(vx + i * 22, hz); ctx.lineTo(vx + i * 160, h); } ctx.stroke();
      const off = (t * 0.6) % 1; for (let k = 0; k < 14; k++) { const z = (k + off) / 14, y = hz + (h - hz) * z * z; ctx.globalAlpha = 0.15 + z * 0.6; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.strokeStyle = P.accent; ctx.lineWidth = 3; this.glow(ctx, P.accent, 20); ctx.beginPath(); ctx.moveTo(0, hz); ctx.lineTo(w, hz); ctx.stroke(); ctx.restore(); },
    wire(ctx, pts, col, w = 4, fillA = 0.12) { ctx.save(); path(ctx, pts); if (fillA > 0) { ctx.save(); ctx.fillStyle = col; ctx.globalAlpha *= fillA; ctx.fill(); ctx.restore(); } ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; this.glow(ctx, col, 22); ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = w * 0.35; ctx.stroke(); ctx.restore(); },
    glitch(seed) { return Math.sin(T() * 13 + seed * 5) > 0.93 ? (Math.random() - 0.5) * 14 : 0; },
    hero(ctx, x, y, r, o = {}) { const t = T(); ctx.save(); ctx.translate(x, y); if (o.angle !== undefined && o.stretch) { ctx.rotate(o.angle); ctx.scale(1 + o.stretch, 1 - o.stretch * 0.6); ctx.rotate(-o.angle); }
      this.wire(ctx, ngon(0, 0, r, 6, t * 0.8), this.pal.player, 4.5, 0.16); this.wire(ctx, ngon(0, 0, r * 0.52, 3, -t * 1.6 - Math.PI / 2), this.pal.player, 3, 0.3);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.55); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(0,240,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.strokeStyle = this.pal.player; ctx.globalAlpha *= 0.4; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y + r * 1.4, r * 0.9, r * 0.2, 0, 0, TAU); ctx.stroke(); ctx.restore(); },
    ghost(ctx, x, y, r, o = {}) { const gl = this.glitch(2), t = T(), c = this.pal.accent;
      const pts = ngon(x + gl, y, r, 22, t * 0.6).map(([px, py], k) => [px + (k % 2 ? Math.sin(t * 9 + k) * 2.5 : 0), py + (k % 3 ? 0 : Math.cos(t * 7 + k) * 2.5)]);
      ctx.save(); ctx.globalAlpha *= o.alpha ?? 0.85; ctx.globalCompositeOperation = 'lighter';
      this.wire(ctx, pts.map(([a, b]) => [a - 4, b]), '#ff004c', 2, 0); this.wire(ctx, pts.map(([a, b]) => [a + 4, b]), '#00b3ff', 2, 0); ctx.globalCompositeOperation = 'source-over';
      this.wire(ctx, pts, c, 4, 0.22); ctx.fillStyle = '#fff'; this.glow(ctx, c, 12); for (const sd of [-1, 1]) ctx.fillRect(x + gl + sd * r * 0.32 - r * 0.13, y - r * 0.12, r * 0.26, r * 0.11); ctx.restore(); },
    dot(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a; const c = rc(this, role || 'player'); ctx.fillStyle = c; this.glow(ctx, c, 10); ctx.fillRect(x - r * 0.4, y - r * 0.4, r * 0.8, r * 0.8); ctx.restore(); },
    spark(ctx, x, y, r, rot) { this.wire(ctx, ngon(x, y, r * 1.2, 3, rot), this.pal.enemy, 3.5, 0.25); },
    hunter(ctx, x, y, r, rot, seed = 0) { const gl = this.glitch(seed); this.wire(ctx, ngon(x + gl, y, r * 1.1, 6, rot), this.pal.enemy, 4.5, 0.18); this.wire(ctx, ngon(x - gl, y, r * 0.5, 3, -rot * 2), this.pal.enemy, 3, 0.5);
      if (gl) { ctx.save(); ctx.globalAlpha *= 0.7; ctx.fillStyle = this.pal.player; ctx.fillRect(x - r * 1.3, y - 3, r * 2.6, 3); ctx.restore(); } },
    hole(ctx, x, y, core, pull, a) { const t = T(), P = this.pal; ctx.save(); ctx.globalAlpha *= a;
      ctx.strokeStyle = P.accent; ctx.lineWidth = 2; ctx.setLineDash([4, 10]); ctx.globalAlpha *= 0.6; ctx.beginPath(); ctx.arc(x, y, pull, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha /= 0.6;
      for (let k = 0; k < 4; k++) { const ph = ((t * 0.8 + k / 4) % 1), rr2 = core + (pull - core) * (1 - ph); ctx.globalAlpha = a * ph * 0.7; ctx.strokeStyle = P.accent; this.glow(ctx, P.accent, 14); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, rr2, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = a; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, core, 0, TAU); ctx.fill(); ctx.strokeStyle = P.accent; ctx.lineWidth = 4; this.glow(ctx, P.accent, 26); ctx.stroke(); ctx.restore(); },
    pickup(ctx, x, y, r, seed = 0) { this.wire(ctx, ngon(x, y, r, 4, T() * 2 + seed), this.pal.pickup, 4, 0.28); this.wire(ctx, ngon(x, y, r * 0.4, 4, -T() * 3), this.pal.pickup, 2, 0.6); },
    warn(ctx, x, y, s, ang) { const P = this.pal; ctx.save(); ctx.translate(x, y); if (ang !== undefined && ang !== null) { ctx.rotate(ang); for (let k = 0; k < 2; k++) this.wire(ctx, [[-s * 0.45, s * 0.15 + k * 18], [0, -s * 0.3 + k * 18], [s * 0.45, s * 0.15 + k * 18]].concat([[s * 0.45, s * 0.15 + k * 18 + 2]]), P.enemy, 5, 0); ctx.restore(); return; }
      const c = s * 0.5; this.wire(ctx, [[-c + 10, -c], [c, -c], [c, c - 10], [c - 10, c], [-c, c], [-c, -c + 10]], P.enemy, 4, 0.25); ctx.font = `900 ${s * 0.6}px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; this.glow(ctx, P.enemy, 16); ctx.fillText('!', 0, 2); ctx.restore(); },
    ring(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a * 1.5; const c = rc(this, role || 'enemy'); ctx.strokeStyle = c; this.glow(ctx, c, 12); ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineDashOffset = T() * 20; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore(); },
    chamfer(ctx, L, Tp, w, h, c = 18) { ctx.beginPath(); ctx.moveTo(L + c, Tp); ctx.lineTo(L + w, Tp); ctx.lineTo(L + w, Tp + h - c); ctx.lineTo(L + w - c, Tp + h); ctx.lineTo(L, Tp + h); ctx.lineTo(L, Tp + c); ctx.closePath(); },
    brackets(ctx, L, Tp, R, B, col, len = 26) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4; this.glow(ctx, col, 14); ctx.beginPath(); ctx.moveTo(L, Tp + len); ctx.lineTo(L, Tp); ctx.lineTo(L + len, Tp); ctx.moveTo(R, B - len); ctx.lineTo(R, B); ctx.lineTo(R - len, B); ctx.stroke(); ctx.restore(); },
    frame(ctx, x0, y0, x1, y1) { ctx.save(); this.chamfer(ctx, x0, y0, x1 - x0, y1 - y0, 30); ctx.fillStyle = 'rgba(5,1,15,0.35)'; ctx.fill(); ctx.strokeStyle = 'rgba(0,240,255,0.35)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); this.brackets(ctx, x0 - 8, y0 - 8, x1 + 8, y1 + 8, this.pal.player, 40); },
    post(ctx) { ctx.save(); ctx.fillStyle = '#000'; ctx.globalAlpha = 0.2; for (let y = 0; y < H(); y += 4) ctx.fillRect(0, y, W(), 2); ctx.restore();
      const g = ctx.createRadialGradient(W() / 2, H() / 2, H() * 0.3, W() / 2, H() / 2, H() * 0.72); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H()); },
    // ---- UI ----
    chroma(ctx, s, x, y, size, col, o = {}) { ctx.save(); ctx.font = fontOf(this, size, o.weight); ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; const d = size >= 40 ? 2 + (Math.sin(T() * 9 + x) > 0.88 ? 7 : 0) : 0;
      if (d) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,0,76,0.8)'; ctx.fillText(s, x - d, y); ctx.fillStyle = 'rgba(0,225,255,0.8)'; ctx.fillText(s, x + d, y); ctx.globalCompositeOperation = 'source-over'; }
      this.glow(ctx, col, size >= 40 ? 24 : 8); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); },
    text(ctx, s, x, y, o = {}) { const size = o.size || SIZE[o.role || 'body']; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; const col = o.color === this.pal.dim ? this.pal.player : o.color || this.pal.text;
      this.chroma(ctx, (size < 40 && o.role === 'caption' ? '> ' : '') + s, x, y, size, col, { align: o.align, weight: size >= 40 ? 800 : 600 }); ctx.restore(); },
    title(ctx, s, x, y) { this.chroma(ctx, [...s].filter((c) => c !== ' ').join(' '), x, y, 124, this.pal.text, { weight: 900 }); },
    score(ctx, v, x, y, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(o.scale || 1, o.scale || 1); this.chroma(ctx, String(v).padStart(4, '0'), 0, 0, 72, this.pal.text); ctx.restore(); },
    pill(ctx, x, y, o = {}) { const h = 64, size = 32, tw = measure(ctx, this, o.text ?? '', size), iw = o.icon ? h - 8 : 0, w = Math.max(h * 1.6, tw + iw + 44), L = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
      const c = o.icon === 'star' ? this.pal.pickup : this.pal.player; ctx.save(); this.chamfer(ctx, L, y - h / 2, w, h, 14); ctx.fillStyle = 'rgba(5,1,15,0.7)'; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 3; this.glow(ctx, c, 12); ctx.stroke(); ctx.restore();
      if (o.icon === 'star') this.pickup(ctx, L + h / 2, y, 16, 1); else if (o.icon) { ctx.save(); this.glow(ctx, c, 10); UI.icon(ctx, o.icon, L + h / 2, y, h * 0.5, c); ctx.restore(); }
      this.chroma(ctx, String(o.text ?? ''), L + iw + (w - iw) / 2, y + 1, size, this.pal.text); return w; },
    panel(ctx, x, y, w, h, o = {}) { const L = x - w / 2, Tp = y - h / 2, P = this.pal; ctx.save(); this.chamfer(ctx, L, Tp, w, h, 34); ctx.fillStyle = 'rgba(8,2,24,0.88)'; ctx.fill(); ctx.strokeStyle = P.player; ctx.lineWidth = 3; this.glow(ctx, P.player, 18); ctx.stroke(); ctx.restore();
      ctx.save(); this.chamfer(ctx, L, Tp, w, h, 34); ctx.clip(); ctx.fillStyle = 'rgba(0,240,255,0.04)'; for (let yy = Tp; yy < Tp + h; yy += 6) ctx.fillRect(L, yy, w, 2); ctx.restore();
      this.brackets(ctx, L - 12, Tp - 12, L + w + 12, Tp + h + 12, P.accent, 36);
      if (o.title) { const c = o.titleColor === P.enemy ? P.enemy : P.accent; ctx.save(); ctx.fillStyle = c; this.glow(ctx, c, 20); const tw = measure(ctx, this, o.title, 44) + 80; ctx.fillRect(x - tw / 2, Tp - 36, tw, 72); ctx.restore(); this.chroma(ctx, o.title, x, Tp, 44, '#fff'); ctx.save(); ctx.font = `600 18px ${this.font}`; ctx.fillStyle = P.player; ctx.textAlign = 'right'; ctx.fillText('SYS://0x3F', L + w - 40, Tp + h - 26); ctx.restore(); } },
    overlay(ctx) { ctx.fillStyle = 'rgba(5,1,15,0.75)'; ctx.fillRect(0, 0, W(), H()); },
    button(ctx, b) { const P = this.pal, w = b.w, h = b.h, icon = b.kind === 'icon', prim = !b.kind || b.kind === 'primary', c = b.kind === 'danger' ? P.enemy : prim ? P.player : P.dim; ctx.save(); ctx.translate(b.x, b.y); ctx.scale(b._scale * (b._down ? 0.95 : 1), b._scale * (b._down ? 0.95 : 1)); if (!b.enabled) ctx.globalAlpha *= 0.4;
      this.chamfer(ctx, -w / 2, -h / 2, w, h, icon ? 14 : 22);
      if (prim) { const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, 'rgba(255,43,214,0.35)'); g.addColorStop(1, 'rgba(0,240,255,0.35)'); ctx.fillStyle = g; } else ctx.fillStyle = 'rgba(5,1,15,0.6)';
      ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = prim ? 4 : 3; this.glow(ctx, c, prim ? 22 : 10); ctx.stroke(); ctx.shadowBlur = 0;
      if (prim && !icon) this.brackets(ctx, -w / 2 - 14, -h / 2 - 14, w / 2 + 14, h / 2 + 14, P.accent, 24);
      ctx.save(); this.glow(ctx, c, 10); buttonContent(ctx, this, b, 2, prim ? '#fff' : P.text, { draw: (s, tx, ty, size) => this.chroma(ctx, s, tx, ty, size, '#fff') }); ctx.restore(); ctx.restore(); },
    stars(ctx, x, y, n, max = 3, size = 72) { for (let i = 0; i < max; i++) { const cx = x + (i - (max - 1) / 2) * size * 1.25; this.wire(ctx, starPts(cx, y, size * 0.55, 0.45), i < n ? this.pal.pickup : 'rgba(138,122,184,0.6)', 3.5, i < n ? 0.35 : 0); } },
    banner(ctx, s, y, o = {}) { const P = this.pal; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.fillStyle = 'rgba(5,1,15,0.85)'; ctx.fillRect(0, y - 62, W(), 124); ctx.fillStyle = P.accent; this.glow(ctx, P.accent, 18); ctx.fillRect(0, y - 62, W(), 3); ctx.fillRect(0, y + 59, W(), 3); ctx.restore();
      ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; this.chroma(ctx, s, W() / 2, y, 64, '#fff'); ctx.font = `600 18px ${this.font}`; ctx.fillStyle = P.player; ctx.textAlign = 'left'; ctx.fillText('// WARNING', 30, y - 40); ctx.restore(); },
  };

  // =====================================================================
  // 街机：像素精灵（字符地图逐块绘制）、像素字（低分辨率渲染 + 二值化 + 最近邻放大）、
  //       滚动星空、闪烁提示、CRT 扫描线
  // =====================================================================
  const SPR = {
    hero: [
      '...XXXXX...',
      '..XHHXXXX..',
      '.XHXXXXXXX.',
      'XXXXXXXXXXX',
      'XXXXXXXXXXX',
      'XXXXXXXXXXX',
      'XXXXXXXXXXX',
      'SXXXXXXXXXS',
      '.SXXXXXXXS.',
      '..SSXXXSS..',
      '...SSSSS...'],
    mineA: [
      '....R....',
      '.R..R..R.',
      '..RRRRR..',
      '.RRRRRRR.',
      'RRRRRRRRR',
      '.RRRRRRR.',
      '..RRRRR..',
      '.R..R..R.',
      '....R....'],
    mineB: [
      'R.......R',
      '.R..R..R.',
      '..RRRRR..',
      '.RRRRRRR.',
      '.RRRRRRRR',
      '.RRRRRRR.',
      '..RRRRR..',
      '.R..R..R.',
      'R.......R'],
    sparkA: ['..Y..', '.YOY.', 'YOWOY', '.YOY.', '..Y..'],
    sparkB: ['Y...Y', '.OYO.', '.YWY.', '.OYO.', 'Y...Y'],
    coin: [
      ['..YYYY..', '.YWYYYY.', 'YWYYYOYY', 'YWYOOYYY', 'YYYOOYYY', 'YYYOYYOY', '.YYYYYO.', '..OOOO..'],
      ['..YYY...', '.YWYYY..', '.WYYOY..', '.WYOYY..', '.YYOYY..', '.YYYOY..', '.YYYYO..', '..OOO...'].map((r) => ' ' + r.slice(0, 7)),
      ['...YY...', '...WY...', '...WY...', '...WY...', '...YY...', '...YO...', '...YO...', '...OO...'],
      ['...YYY..', '..YYYWY.', '..YOYYW.', '..YYOYW.', '..YYOYY.', '..YOYYY.', '..OYYYY.', '...OOO..'],
    ],
    star: ['....Y....', '....Y....', '...YYY...', 'YYYYWYYYY', '.YYYWYYY.', '..YYYYY..', '..YY.YY..', '.YY...YY.', '.Y.....Y.'],
    warn: ['...RR...', '...RR...', '..RRRR..', '..RWWR..', '.RRWWRR.', '.RRRRRR.', 'RRRWWRRR', 'RRRRRRRR'],
    arrow: ['...R...', '..RRR..', '.RRRRR.', 'RRRRRRR', '..RRR..', '..RRR..', '..RRR..'],
    icons: {
      pause: ['XX.XX', 'XX.XX', 'XX.XX', 'XX.XX', 'XX.XX'],
      play: ['X....', 'XXX..', 'XXXXX', 'XXX..', 'X....'],
      sound: ['..X..X', '.XX.X.', 'XXX.X.', 'XXX.X.', '.XX.X.', '..X..X'],
      mute: ['..X...', '.XX...', 'XXX.XX', 'XXX.XX', '.XX...', '..X...'],
      restart: ['.XXXX.', 'X....X', 'X.....', 'X...XX', 'X....X', '.XXXX.'],
      home: ['..XX..', '.XXXX.', 'XXXXXX', '.X..X.', '.X..X.', '.XXXX.'],
      gear: ['.X.X.', 'XXXXX', '.X.X.', 'XXXXX', '.X.X.'],
      menu: ['XXXXX', '.....', 'XXXXX', '.....', 'XXXXX'],
      trophy: ['XXXXXX', 'XXXXXX', '.XXXX.', '..XX..', '..XX..', '.XXXX.'],
      star: ['..X..', '.XXX.', 'XXXXX', '.XXX.', 'X...X'],
    },
  };
  const textCache = new Map();
  const arcade = {
    label: '街机', font: '"PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif', weight: 900,
    pal: { bg: '#07071a', bg2: '#141438', player: '#2de2ff', enemy: '#ff3355', pickup: '#ffd800', text: '#ffffff', dim: '#7f86c9', ink: '#07071a', accent: '#ff3df5', danger: '#ff3355', green: '#3dff6e', orange: '#ff8a00' },
    // 精灵：字符 → 颜色。X 主色 H 高光 S 暗部 W 白 R 危险 Y 黄 O 橙 K 黑
    colorOf(ch, main) { const P = this.pal; return { X: main, H: '#ffffff', S: shade(main, -0.45), W: '#ffffff', R: main || P.enemy, Y: P.pickup, O: P.orange, K: '#000000' }[ch]; },
    sprite(ctx, rows, x, y, px, main, o = {}) {
      const h = rows.length, w = rows[0].length, L = Math.round(x - (w * px) / 2), Tp = Math.round(y - (h * px) / 2);
      ctx.save(); if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
      for (let j = 0; j < h; j++) { if (o.scan && j % 2) continue; for (let i = 0; i < w; i++) { const ch = rows[j][i]; if (ch === '.' || ch === ' ') continue; ctx.fillStyle = o.tint || this.colorOf(ch, main); ctx.fillRect(L + i * px, Tp + j * px, px, px); } }
      ctx.restore(); return { L, Tp, w, h };
    },
    block(ctx, x, y, s, col) { ctx.fillStyle = col; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s); },
    blink(rate = 2) { return Math.floor(T() * rate * 2) % 2 === 0; },
    // ---- 像素字：低分辨率渲染 → 二值化 → 描边/阴影 → 最近邻放大（结果缓存）----
    glyphs(s, fs, color, o) {
      const key = [s, fs, color, o.outline, o.shadow, (o.bands || []).join()].join('|'); let c = textCache.get(key); if (c) return c;
      const m = document.createElement('canvas').getContext('2d'); m.font = `900 ${fs}px ${this.font}`;
      const tw = Math.ceil(m.measureText(s).width), pad = 3, w = tw + pad * 2, h = Math.ceil(fs * 1.3) + pad * 2;
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
      g.font = `900 ${fs}px ${this.font}`; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(s, pad, h / 2);
      const src = g.getImageData(0, 0, w, h), mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) mask[i] = src.data[i * 4 + 3] > 110 ? 1 : 0;
      const out = g.createImageData(w, h), put = (i, col) => { const [r, gg, b] = hex(col); out.data[i * 4] = r; out.data[i * 4 + 1] = gg; out.data[i * 4 + 2] = b; out.data[i * 4 + 3] = 255; };
      const at = (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? mask[y * w + x] : 0);
      let y0 = h, y1 = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x;
        if (mask[i]) { const bands = o.bands; put(i, bands ? bands[Math.min(bands.length - 1, Math.floor(((y - y0) / Math.max(1, y1 - y0 + 1)) * bands.length))] : color); }
        else if (o.outline && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1) || at(x - 1, y - 1) || at(x + 1, y + 1) || at(x + 1, y - 1) || at(x - 1, y + 1))) put(i, o.outline);
        else if (o.shadow && (at(x - 2, y - 2) || at(x - 1, y - 2) || at(x - 2, y - 1))) put(i, o.shadow); }
      g.putImageData(out, 0, 0); c = { cv, w, h }; if (textCache.size > 300) textCache.clear(); textCache.set(key, c); return c;
    },
    ptext(ctx, s, x, y, size, color, o = {}) {
      s = String(s); if (!s) return 0; const k = o.k || (size >= 90 ? 5 : size >= 60 ? 4 : size >= 40 ? 3 : 2), fs = Math.max(8, Math.round(size / k));
      const c = this.glyphs(s, fs, color, o), w = c.w * k, h = c.h * k, L = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(c.cv, Math.round(L), Math.round(y - h / 2), w, h); ctx.restore(); return w;
    },
    bg(ctx) { const P = this.pal, t = T(), w = W(), h = H();
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
      // 远处像素行星（色带）
      const px = 8, cx = 600, cy = 720, r = 12; for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { if (i * i + j * j > r * r) continue; const band = Math.floor((j + r + Math.floor(t * 2) * 0) / 4) % 3; ctx.fillStyle = (i + j > 8) ? '#24245a' : ['#3b2f7a', '#5b3fa8', '#46358f'][band]; ctx.fillRect(cx + i * px, cy + j * px, px, px); }
      ctx.fillStyle = '#8f7bff'; for (let a = 0; a < TAU; a += 0.06) { const rx = Math.cos(a) * 150, ry = Math.sin(a) * 28; if (ry < 0 && Math.abs(rx) < r * px) continue; ctx.fillRect(Math.round((cx + rx) / 6) * 6, Math.round((cy + ry - a * 0) / 6) * 6, 6, 6); }
      // 三层滚动星空
      for (const [n, sp, sz, col, seed] of [[50, 30, 3, '#5a5f9c', 1], [30, 70, 4, '#b8c0ff', 2], [12, 150, 6, '#ffffff', 3]]) { const R = rng(seed); for (let i = 0; i < n; i++) { const x = Math.floor(R() * w / sz) * sz, y = Math.floor(((R() * h + t * sp) % h) / sz) * sz; ctx.fillStyle = col; ctx.fillRect(x, y, sz, sz); if (sz === 6 && (i + Math.floor(t * 4)) % 5 === 0) { ctx.fillRect(x - 6, y, 18, 6); ctx.fillRect(x, y - 6, 6, 18); } } }
    },
    px(r, cols) { return Math.max(3, Math.round((r * 2) / cols)); },
    hero(ctx, x, y, r, o = {}) { const px = this.px(r, 11), bob = Math.round(Math.sin(T() * 6) * 1) * px; const s = this.sprite(ctx, SPR.hero, x, y + bob, px, this.pal.player);
      const lx = Math.round(Math.cos(o.angle || 0) * (o.speed || 0)), ly = Math.round(Math.sin(o.angle || 0) * (o.speed || 0)), blink = ((T() % 3) < 0.12);
      for (const ex of [3, 6]) { ctx.fillStyle = '#fff'; ctx.fillRect(s.L + (ex + lx * 0.5) * px, s.Tp + (4 + ly * 0.5) * px, px * 2, blink ? px * 0.5 : px * 2); if (!blink) { ctx.fillStyle = '#000'; ctx.fillRect(s.L + (ex + 1 + Math.max(0, lx) * 0.5) * px, s.Tp + (5 + Math.max(0, ly) * 0.5) * px, px, px); } }
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(s.L + 2 * px, s.Tp + 12 * px, 7 * px, px); },
    ghost(ctx, x, y, r, o = {}) { const px = this.px(r, 11), j = Math.sin(T() * 30) > 0.6 ? px : 0; this.sprite(ctx, SPR.hero, x + j, y, px, this.pal.enemy, { alpha: (o.alpha ?? 0.85) * (this.blink(8) ? 1 : 0.7), scan: true });
      const s = { L: Math.round(x + j - 5.5 * px), Tp: Math.round(y - 5.5 * px) }; ctx.fillStyle = '#ffffff'; for (const ex of [3, 6]) ctx.fillRect(s.L + ex * px, s.Tp + 4 * px, px * 2, px); },
    dot(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a; const s = Math.max(4, Math.round(r * 0.5 / 4) * 4); this.block(ctx, Math.round(x / 4) * 4, Math.round(y / 4) * 4, s, rc(this, role || 'player')); ctx.restore(); },
    spark(ctx, x, y, r) { this.sprite(ctx, this.blink(6) ? SPR.sparkA : SPR.sparkB, x, y, this.px(r, 5), this.pal.pickup); },
    hunter(ctx, x, y, r, rot, seed = 0) { const px = this.px(r, 9), s = this.sprite(ctx, ((T() * 4 + seed) % 2) < 1 ? SPR.mineA : SPR.mineB, x, y, px, this.pal.enemy);
      ctx.fillStyle = '#fff'; ctx.fillRect(s.L + 2 * px, s.Tp + 3 * px, px * 2, px * 2); ctx.fillRect(s.L + 5 * px, s.Tp + 3 * px, px * 2, px * 2); ctx.fillStyle = '#000'; ctx.fillRect(s.L + 3 * px, s.Tp + 4 * px, px, px); ctx.fillRect(s.L + 5 * px, s.Tp + 4 * px, px, px);
      ctx.fillStyle = shade(this.pal.enemy, -0.5); ctx.fillRect(s.L + 2 * px, s.Tp + 2 * px, px * 2, px); ctx.fillRect(s.L + 5 * px, s.Tp + 2 * px, px * 2, px); },
    hole(ctx, x, y, core, pull, a) { const t = T(), P = this.pal; ctx.save(); ctx.globalAlpha *= a;
      for (let k = 0; k < 40; k++) { const ang = (k / 40) * TAU; if ((k + Math.floor(t * 8)) % 4) continue; this.block(ctx, Math.round((x + Math.cos(ang) * pull) / 4) * 4, Math.round((y + Math.sin(ang) * pull) / 4) * 4, 6, P.dim); }
      for (let ring = 0; ring < 3; ring++) { const rr2 = core + 12 + ring * 16, n = 14 + ring * 4; for (let k = 0; k < n; k++) { const ang = (k / n) * TAU + t * (3 - ring) * (ring % 2 ? -1 : 1); if (k % 3 === 0) continue; this.block(ctx, Math.round((x + Math.cos(ang) * rr2) / 4) * 4, Math.round((y + Math.sin(ang) * rr2) / 4) * 4, 8, ring === 1 ? P.accent : '#8f7bff'); } }
      for (let j = -core; j <= core; j += 6) for (let i = -core; i <= core; i += 6) { const d = i * i + j * j; if (d > core * core) continue; ctx.fillStyle = d > (core - 8) ** 2 ? P.accent : '#000'; ctx.fillRect(Math.round(x + i), Math.round(y + j), 6, 6); }
      ctx.restore(); },
    pickup(ctx, x, y, r, seed = 0) { const f = SPR.coin[Math.floor(T() * 8 + seed) % 4]; this.sprite(ctx, f, x, y, this.px(r, 8), this.pal.pickup); },
    warn(ctx, x, y, s, ang) { if (ang !== undefined && ang !== null) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.round(ang / (Math.PI / 4)) * (Math.PI / 4)); this.sprite(ctx, SPR.arrow, 0, 0, Math.round(s / 8), this.pal.enemy); ctx.restore(); return; }
      if (this.blink(4)) this.sprite(ctx, SPR.warn, x, y, Math.round(s / 8), this.pal.enemy); },
    ring(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= Math.min(1, a * 1.4); const n = Math.round(r / 5); for (let k = 0; k < n; k++) { if (k % 3 === 2) continue; const ang = (k / n) * TAU + T() * 0.5; this.block(ctx, Math.round((x + Math.cos(ang) * r) / 4) * 4, Math.round((y + Math.sin(ang) * r) / 4) * 4, 8, rc(this, role || 'enemy')); } ctx.restore(); },
    frame(ctx, x0, y0, x1, y1) { const P = this.pal, s = 8; ctx.save(); ctx.globalAlpha *= 0.55; ctx.fillStyle = P.dim;
      for (let x = x0; x < x1; x += s * 3) { ctx.fillRect(x, y0, s * 2, s / 2); ctx.fillRect(x, y1, s * 2, s / 2); } for (let y = y0; y < y1; y += s * 3) { ctx.fillRect(x0, y, s / 2, s * 2); ctx.fillRect(x1, y, s / 2, s * 2); }
      ctx.globalAlpha /= 0.55; ctx.fillStyle = P.player; for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { ctx.fillRect(cx - (dx < 0 ? 24 : 0), cy - (dy < 0 ? 6 : 0), 24, 6); ctx.fillRect(cx - (dx < 0 ? 6 : 0), cy - (dy < 0 ? 24 : 0), 6, 24); } ctx.restore(); },
    post(ctx) { ctx.save(); ctx.fillStyle = '#000'; ctx.globalAlpha = 0.22; for (let y = 0; y < H(); y += 3) ctx.fillRect(0, y, W(), 1); ctx.restore();
      const g = ctx.createRadialGradient(W() / 2, H() / 2, H() * 0.35, W() / 2, H() / 2, H() * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W(), H()); },
    // ---- UI ----
    colorFor(c) { const P = this.pal; return c === P.dim ? P.dim : c === P.enemy ? P.enemy : c === P.player ? P.pickup : c || P.text; },
    text(ctx, s, x, y, o = {}) { const size = o.size || SIZE[o.role || 'body']; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; this.ptext(ctx, s, x, y, size, this.colorFor(o.color), { align: o.align, outline: size >= 40 ? '#000000' : null }); ctx.restore(); },
    title(ctx, s, x, y) { const str = [...s].filter((c) => c !== ' ').join(''), bob = Math.round(Math.sin(T() * 3) * 2) * 4;
      this.ptext(ctx, str, x, y - 18 + bob, 140, '#fff', { k: 6, bands: ['#fff5a0', '#ffd800', '#ff8a00', '#ff3355'], outline: '#ffffff', shadow: '#5b3fa8' });
      if (this.blink(1.2)) this.ptext(ctx, '★ INSERT COIN ★', x, y - 118, 30, this.pal.player, { k: 2 }); },
    score(ctx, v, x, y, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(o.scale || 1, o.scale || 1); this.ptext(ctx, '1UP', 0, -38, 24, this.pal.enemy, { k: 2 }); this.ptext(ctx, String(v).padStart(6, '0'), 0, 6, 56, '#fff', { k: 4, outline: '#000000' }); ctx.restore(); },
    box(ctx, L, Tp, w, h, edge, fill) { const s = 6; ctx.fillStyle = fill; ctx.fillRect(L + s, Tp + s, w - s * 2, h - s * 2); ctx.fillStyle = edge;
      ctx.fillRect(L + s, Tp, w - s * 2, s); ctx.fillRect(L + s, Tp + h - s, w - s * 2, s); ctx.fillRect(L, Tp + s, s, h - s * 2); ctx.fillRect(L + w - s, Tp + s, s, h - s * 2); },
    pill(ctx, x, y, o = {}) { const h = 64, size = 32, w = 150, L = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
      this.box(ctx, L, y - h / 2, w, h, this.pal.dim, 'rgba(7,7,26,0.8)');
      if (o.icon === 'star') this.pickup(ctx, L + 34, y, 18, 0); else if (o.icon && SPR.icons[o.icon]) this.sprite(ctx, SPR.icons[o.icon], L + 34, y, 5, this.pal.pickup);
      this.ptext(ctx, '×' + (o.text ?? ''), L + 62, y, size, '#fff', { align: 'left', k: 2 }); return w; },
    panel(ctx, x, y, w, h, o = {}) { const L = x - w / 2, Tp = y - h / 2, P = this.pal; this.box(ctx, L - 6, Tp - 6, w + 12, h + 12, '#ffffff', P.bg); this.box(ctx, L + 6, Tp + 6, w - 12, h - 12, o.titleColor === P.enemy ? P.enemy : P.player, P.bg2);
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; for (let yy = Tp + 12; yy < Tp + h - 12; yy += 8) ctx.fillRect(L + 12, yy, w - 24, 4);
      if (o.title) { const tw = measure(ctx, this, o.title, 52) + 70; ctx.fillStyle = '#000'; ctx.fillRect(x - tw / 2, Tp - 40, tw, 80); this.box(ctx, x - tw / 2, Tp - 40, tw, 80, o.titleColor === P.enemy ? P.enemy : P.player, '#000'); this.ptext(ctx, o.title, x, Tp, 52, P.pickup, { k: 4, outline: '#000000' }); } },
    overlay(ctx) { ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, W(), H()); },
    button(ctx, b) { const P = this.pal, w = b.w, h = b.h, icon = b.kind === 'icon', prim = !b.kind || b.kind === 'primary', push = b._down ? 6 : 0; ctx.save(); ctx.translate(b.x, b.y); if (!b.enabled) ctx.globalAlpha *= 0.4;
      const base = b.kind === 'danger' ? P.enemy : prim ? P.enemy : '#3a3f8f', L = -w / 2, Tp = -h / 2;
      ctx.fillStyle = '#000'; ctx.fillRect(L + 8, Tp + 8, w, h); ctx.fillStyle = base; ctx.fillRect(L + push, Tp + push, w, h);
      ctx.fillStyle = shade(base, 0.45); ctx.fillRect(L + push, Tp + push, w, 6); ctx.fillRect(L + push, Tp + push, 6, h);
      ctx.fillStyle = shade(base, -0.45); ctx.fillRect(L + push, Tp + h - 6 + push, w, 6); ctx.fillRect(L + w - 6 + push, Tp + push, 6, h);
      if (icon) { const spr = SPR.icons[b.icon]; if (spr) this.sprite(ctx, spr, push, push, Math.round(h / 12), '#fff'); else UI.icon(ctx, b.icon, push, push, h * 0.46, '#fff'); ctx.restore(); return; }
      const size = b.h >= 100 ? 44 : 34; if (prim && b.enabled && this.blink(2)) this.sprite(ctx, SPR.icons.play, L + 44 + push, push, 5, P.pickup);
      this.ptext(ctx, b.label, push + (prim ? 16 : 0), push, size, prim ? '#fff' : '#d8dcff', { k: size >= 40 ? 3 : 2, outline: '#000000' }); ctx.restore(); },
    stars(ctx, x, y, n, max = 3, size = 72) { for (let i = 0; i < max; i++) { const cx = x + (i - (max - 1) / 2) * size * 1.3; this.sprite(ctx, SPR.star, cx, y, Math.round(size / 9), i < n ? this.pal.pickup : '#33376b', { tint: i < n ? null : '#33376b' }); } },
    banner(ctx, s, y, o = {}) { const P = this.pal; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.fillStyle = '#000'; ctx.fillRect(0, y - 64, W(), 128);
      for (let x = 0; x < W(); x += 24) { ctx.fillStyle = (x / 24 + Math.floor(T() * 10)) % 2 ? P.enemy : P.pickup; ctx.fillRect(x, y - 64, 12, 8); ctx.fillRect(x + 12, y + 56, 12, 8); }
      this.ptext(ctx, s, W() / 2, y, 64, this.blink(5) ? '#ffffff' : P.pickup, { k: 4, outline: P.enemy }); ctx.restore(); },
  };

  // =====================================================================
  // 扁平卡通：纯色块 + 底部厚度（2.5D）、无描边、小高光、豆豆眼、漂浮彩纸
  // =====================================================================
  const flat = {
    label: '扁平', font: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif', weight: 900,
    pal: { bg: '#fff4e0', bg2: '#ffe3b8', player: '#3a86ff', enemy: '#ff595e', pickup: '#ffca3a', text: '#2b2d42', dim: '#9a8c7a', ink: '#2b2d42', accent: '#8ac926', danger: '#ff595e', purple: '#6a4c93' },
    solid(ctx, pts, col, depth = 6) { ctx.save(); ctx.fillStyle = shade(col, -0.28); path(ctx, pts.map(([x, y]) => [x, y + depth])); ctx.fill(); ctx.fillStyle = col; path(ctx, pts); ctx.fill(); ctx.restore(); },
    gloss(ctx, x, y, r) { ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.22, r * 0.13, -0.6, 0, TAU); ctx.fill(); ctx.restore(); },
    face(ctx, x, y, r, mood, lx = 0, ly = 0) { const P = this.pal, blink = (T() % 3.1) < 0.12;
      for (const s of [-1, 1]) { const ex = x + s * r * 0.3 + lx * r * 0.12, ey = y - r * 0.08 + ly * r * 0.1; ctx.fillStyle = P.ink;
        if (blink) ctx.fillRect(ex - r * 0.1, ey - 2, r * 0.2, 4); else { ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.1, r * 0.14, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex - r * 0.03, ey - r * 0.05, r * 0.04, 0, TAU); ctx.fill(); }
        if (mood === 'angry') { ctx.strokeStyle = P.ink; ctx.lineWidth = r * 0.09; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - s * r * 0.16, ey - r * 0.3); ctx.lineTo(ex + s * r * 0.12, ey - r * 0.2); ctx.stroke(); } }
      if (mood === 'angry') { ctx.fillStyle = P.ink; ctx.fillRect(x - r * 0.18, y + r * 0.28, r * 0.36, r * 0.08); }
      else { ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(x + lx * r * 0.1, y + r * 0.2, r * 0.16, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#ff8fab'; ctx.beginPath(); ctx.arc(x + lx * r * 0.1, y + r * 0.29, r * 0.08, 0, Math.PI); ctx.fill();
        ctx.fillStyle = 'rgba(255,143,171,0.6)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * r * 0.55, y + r * 0.15, r * 0.12, r * 0.07, 0, 0, TAU); ctx.fill(); } } },
    bg(ctx) { const P = this.pal, t = T(), w = W(), h = H(); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = P.bg2; for (const [x, y, r, sp] of [[80, 220, 160, 0.2], [650, 520, 220, -0.15], [120, 1050, 200, 0.12], [620, 1220, 120, 0.3]]) { ctx.beginPath(); ctx.arc(x + Math.sin(t * sp) * 20, y + Math.cos(t * sp) * 14, r, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffd9a0'; ctx.translate(w / 2, h / 2); ctx.rotate(-0.5); for (let k = -6; k <= 6; k++) ctx.fillRect(k * 160 - 30, -h, 60, h * 2); ctx.restore();
      const R = rng(11), cols = [P.player, P.enemy, P.pickup, P.accent, P.purple];
      for (let i = 0; i < 26; i++) { const x = R() * w, y = (R() * h + t * (20 + R() * 30)) % h, rot = t * (R() - 0.5) * 3 + R() * 6, c = cols[i % 5]; ctx.save(); ctx.globalAlpha = 0.45; ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = c; if (i % 3) ctx.fillRect(-9, -4, 18, 8); else { ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill(); } ctx.restore(); } },
    hero(ctx, x, y, r, o = {}) { const lx = Math.cos(o.angle || 0) * (o.speed || 0), ly = Math.sin(o.angle || 0) * (o.speed || 0), b = 1 + Math.sin(T() * 5) * 0.04;
      ctx.save(); ctx.fillStyle = 'rgba(43,45,66,0.12)'; ctx.beginPath(); ctx.ellipse(x, y + r * 1.15, r * 0.8, r * 0.18, 0, 0, TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(x, y); if (o.angle !== undefined && o.stretch) { ctx.rotate(o.angle); ctx.scale(1 + o.stretch, 1 - o.stretch * 0.6); ctx.rotate(-o.angle); } ctx.scale(1 / b, b);
      this.solid(ctx, ngon(0, 0, r, 36), this.pal.player, r * 0.18); this.gloss(ctx, 0, 0, r); this.face(ctx, 0, 0, r, 'happy', lx, ly); ctx.restore(); },
    ghost(ctx, x, y, r, o = {}) { const t = T(), pts = []; for (let k = 0; k <= 20; k++) { const a = Math.PI + (k / 20) * Math.PI; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
      for (let k = 0; k <= 8; k++) { const xx = x + r - (k / 8) * 2 * r; pts.push([xx, y + r * 0.9 + (k % 2 ? -r * 0.22 : 0) + Math.sin(t * 8 + k) * 3]); }
      ctx.save(); ctx.globalAlpha *= o.alpha ?? 0.85; this.solid(ctx, pts, this.pal.enemy, 6); this.face(ctx, x, y, r, 'angry'); ctx.restore(); },
    dot(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = rc(this, role || 'player'); ctx.beginPath(); ctx.arc(x, y, r * 0.7, 0, TAU); ctx.fill(); ctx.restore(); },
    spark(ctx, x, y, r, rot) { this.solid(ctx, ngon(x, y, r * 1.2, 3, rot), this.pal.enemy, 5); },
    hunter(ctx, x, y, r, rot) { this.solid(ctx, spikePts(x, y, r, 8, 0.22, rot * 0.3), this.pal.purple, 7); this.gloss(ctx, x, y, r); this.face(ctx, x, y, r * 0.85, 'angry'); },
    hole(ctx, x, y, core, pull, a) { const t = T(), P = this.pal; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(106,76,147,0.12)'; ctx.beginPath(); ctx.arc(x, y, pull, 0, TAU); ctx.fill();
      ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { ctx.strokeStyle = k % 2 ? P.purple : shade(P.purple, 0.35); ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(x, y, core + 16 + k * 18, t * 3 + k * 2, t * 3 + k * 2 + 3.4); ctx.stroke(); }
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(x, y, core, 0, TAU); ctx.fill(); ctx.restore(); },
    pickup(ctx, x, y, r, seed = 0) { const pts = starPts(x, y, r * 1.15, 0.52, 5, -Math.PI / 2 + Math.sin(T() * 2 + seed) * 0.15); this.solid(ctx, pts, this.pal.pickup, 5); this.gloss(ctx, x, y, r * 0.9); },
    warn(ctx, x, y, s, ang) { ctx.save(); ctx.translate(x, y); if (ang !== undefined && ang !== null) { ctx.rotate(ang); this.solid(ctx, [[0, -s * 0.55], [s * 0.45, 0], [s * 0.18, 0], [s * 0.18, s * 0.5], [-s * 0.18, s * 0.5], [-s * 0.18, 0], [-s * 0.45, 0]], this.pal.enemy, 5); ctx.restore(); return; }
      this.solid(ctx, ngon(0, 0, s * 0.5, 30), this.pal.enemy, 6); ctx.font = `900 ${s * 0.62}px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('!', 0, 2); ctx.restore(); },
    ring(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a * 1.5; ctx.strokeStyle = role === 'pickup' ? '#e0a800' : rc(this, role || 'enemy'); ctx.lineWidth = 5; ctx.setLineDash([2, 14]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore(); },
    frame(ctx, x0, y0, x1, y1) { ctx.save(); rr(ctx, x0, y0 + 10, x1 - x0, y1 - y0, 44); ctx.fillStyle = 'rgba(214,170,110,0.35)'; ctx.fill(); rr(ctx, x0, y0, x1 - x0, y1 - y0, 44); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill(); ctx.restore(); },
    post() {},
    // ---- UI ----
    ftext(ctx, s, x, y, size, col, o = {}) { ctx.save(); ctx.font = fontOf(this, size, o.weight); ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; if (size >= 40) { ctx.fillStyle = shade(col === '#ffffff' ? '#2b2d42' : col, col === '#ffffff' ? 0 : -0.35); ctx.globalAlpha *= col === '#ffffff' ? 0.25 : 1; ctx.fillText(s, x, y + size * 0.07); ctx.globalAlpha = 1 * (o.alpha ?? 1); } ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); },
    text(ctx, s, x, y, o = {}) { const size = o.size || SIZE[o.role || 'body']; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; const P = this.pal, col = o.color === P.dim ? P.dim : o.color === P.enemy ? P.enemy : o.color === P.player ? P.player : P.ink; this.ftext(ctx, String(s), x, y, size, col, { align: o.align, weight: size >= 40 ? 900 : 700 }); ctx.restore(); },
    title(ctx, s, x, y, o = {}) { const t = o.t ?? T(), chars = [...s].filter((c) => c !== ' '), cols = [this.pal.player, this.pal.enemy, this.pal.pickup, this.pal.accent];
      chars.forEach((ch, i) => { const cx = x + (i - (chars.length - 1) / 2) * 140, cy = y + Math.abs(Math.sin(t * 3 + i)) * -14; ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(t * 2 + i) * 0.06); this.ftext(ctx, ch, 0, 0, 132, cols[i % 4]); ctx.restore(); }); },
    score(ctx, v, x, y, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(o.scale || 1, o.scale || 1); this.ftext(ctx, String(v), 0, 0, 84, this.pal.ink); ctx.restore(); },
    pill(ctx, x, y, o = {}) { const h = 66, size = 34, tw = measure(ctx, this, o.text ?? '', size), iw = o.icon ? h - 10 : 0, w = Math.max(h * 1.6, tw + iw + 44), L = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
      ctx.save(); rr(ctx, L, y - h / 2 + 6, w, h, h / 2); ctx.fillStyle = shade(this.pal.bg2, -0.15); ctx.fill(); rr(ctx, L, y - h / 2, w, h, h / 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      if (o.icon === 'star') this.pickup(ctx, L + h / 2, y - 2, 18, 0); else if (o.icon) { ctx.fillStyle = this.pal.pickup; ctx.beginPath(); ctx.arc(L + h / 2, y, h / 2 - 9, 0, TAU); ctx.fill(); UI.icon(ctx, o.icon, L + h / 2, y, h * 0.42, '#fff'); }
      this.ftext(ctx, String(o.text ?? ''), L + iw + (w - iw) / 2, y + 1, size, this.pal.ink); return w; },
    panel(ctx, x, y, w, h, o = {}) { const L = x - w / 2, Tp = y - h / 2; ctx.save(); rr(ctx, L, Tp + 14, w, h, 40); ctx.fillStyle = shade(this.pal.bg2, -0.2); ctx.fill(); rr(ctx, L, Tp, w, h, 40); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      if (o.title) { const tw = measure(ctx, this, o.title, 46) + 80, th = 80, c = o.titleColor === this.pal.enemy ? this.pal.enemy : this.pal.player; ctx.save(); rr(ctx, x - tw / 2, Tp - th / 2 + 8, tw, th, 24); ctx.fillStyle = shade(c, -0.28); ctx.fill(); rr(ctx, x - tw / 2, Tp - th / 2, tw, th, 24); ctx.fillStyle = c; ctx.fill(); ctx.restore(); this.ftext(ctx, o.title, x, Tp, 46, '#ffffff'); } },
    overlay(ctx) { ctx.fillStyle = 'rgba(43,45,66,0.5)'; ctx.fillRect(0, 0, W(), H()); },
    button(ctx, b) { const P = this.pal, w = b.w, h = b.h, icon = b.kind === 'icon', prim = !b.kind || b.kind === 'primary', depth = b._down ? 2 : 9, r = icon ? h / 2 : 30;
      const c = b.kind === 'danger' ? P.enemy : prim ? P.accent : '#ffffff'; ctx.save(); ctx.translate(b.x, b.y); ctx.scale(b._scale, b._scale); if (!b.enabled) ctx.globalAlpha *= 0.45;
      rr(ctx, -w / 2, -h / 2 + 9, w, h, r); ctx.fillStyle = c === '#ffffff' ? shade(P.bg2, -0.2) : shade(c, -0.3); ctx.fill(); rr(ctx, -w / 2, -h / 2 + 9 - depth, w, h, r); ctx.fillStyle = c; ctx.fill();
      const fg = c === '#ffffff' ? P.ink : '#ffffff'; buttonContent(ctx, this, b, 9 - depth + 2, fg, { draw: (s, tx, ty, size) => this.ftext(ctx, s, tx, ty, size, fg) }); ctx.restore(); },
    stars(ctx, x, y, n, max = 3, size = 72) { for (let i = 0; i < max; i++) { const cx = x + (i - (max - 1) / 2) * size * 1.25, cy = y + (i === 1 ? -size * 0.15 : 0), r = size * 0.5 * (i === 1 ? 1.15 : 1); this.solid(ctx, starPts(cx, cy, r * 1.15, 0.52), i < n ? this.pal.pickup : '#e6dccb', 6); if (i < n) this.gloss(ctx, cx, cy, r); } },
    banner(ctx, s, y, o = {}) { ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.fillStyle = shade(this.pal.purple, -0.3); ctx.fillRect(0, y - 60 + 10, W(), 120); ctx.fillStyle = this.pal.purple; ctx.fillRect(0, y - 60, W(), 120); this.ftext(ctx, s, W() / 2, y, 64, '#ffffff'); ctx.restore(); },
  };

  // =====================================================================
  // 国风：宣纸、远山水墨晕染、朱砂红日、毛笔笔触、铜钱、印章、卷轴
  // =====================================================================
  const guofeng = {
    label: '国风', font: '"STKaiti","Kaiti SC","KaiTi","Songti SC","STSong",serif', weight: 700,
    pal: { bg: '#efe4cc', bg2: '#ddcfb0', player: '#c8402f', enemy: '#262321', pickup: '#c49a2c', text: '#2b2620', dim: '#8a7c63', ink: '#1f1b16', accent: '#b5302a', danger: '#262321', jade: '#5f8f7a' },
    fiber: null,
    makeFiber() { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), R = rng(21); g.strokeStyle = 'rgba(120,95,55,0.10)'; g.lineWidth = 1;
      for (let i = 0; i < 260; i++) { const x = R() * 256, y = R() * 256, a = R() * TAU, l = 6 + R() * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.5) * l * 0.5, y + Math.sin(a + 0.5) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
      const d = g.getImageData(0, 0, 256, 256); for (let i = 0; i < d.data.length; i += 4) if (R() < 0.3) { d.data[i] = 150; d.data[i + 1] = 125; d.data[i + 2] = 85; d.data[i + 3] = Math.max(d.data[i + 3], 10); } g.putImageData(d, 0, 0); this.fiber = c; },
    paper(ctx, x, y, w, h) { if (!this.fiber) this.makeFiber(); ctx.save(); ctx.fillStyle = this.pal.bg; ctx.fillRect(x, y, w, h); ctx.fillStyle = ctx.createPattern(this.fiber, 'repeat'); ctx.fillRect(x, y, w, h); ctx.restore(); },
    // 毛笔：沿路径画，线宽随位置起伏、两端收锋
    brush(ctx, pts, w, col, a = 0.92) { ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const n = pts.length;
      for (let i = 1; i < n; i++) { const k = i / (n - 1), taper = Math.sin(Math.PI * Math.min(1, k * 1.15)) * 0.85 + 0.15; ctx.globalAlpha = a * (0.75 + 0.25 * taper); ctx.lineWidth = Math.max(1, w * taper); ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
      ctx.restore(); },
    // 墨团：不规则边缘 + 中心浓边缘淡的晕染
    blob(ctx, x, y, r, col, seed = 0, rough = 0.07) { const R = rng(seed + 3), ph = [R() * 6, R() * 6, R() * 6], pts = [];
      for (let k = 0; k < 40; k++) { const a = (k / 40) * TAU, q = r * (1 + rough * (Math.sin(a * 3 + ph[0]) + 0.6 * Math.sin(a * 5 + ph[1] + T() * 0.8) + 0.4 * Math.sin(a * 7 + ph[2]))); pts.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); }
      const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.25, r * 0.1, x, y, r * 1.1); g.addColorStop(0, shade(col, 0.15)); g.addColorStop(0.75, col); g.addColorStop(1, shade(col, -0.25));
      ctx.save(); path(ctx, pts); ctx.fillStyle = g; ctx.fill(); ctx.restore(); return pts; },
    bg(ctx) { const P = this.pal, t = T(), w = W(), h = H(); this.paper(ctx, 0, 0, w, h);
      // 朱砂红日
      ctx.save(); ctx.fillStyle = 'rgba(200,64,47,0.82)'; ctx.beginPath(); ctx.arc(560, 250, 78, 0, TAU); ctx.fill(); ctx.restore();
      // 三层远山：越远越淡，山脊浓、山脚淡（晕染）
      for (const [base, amp, alpha, seed, sp] of [[700, 150, 0.16, 1, 2], [860, 170, 0.26, 2, 4], [1060, 140, 0.42, 3, 7]]) {
        const R = rng(seed), f = [R() * 0.01 + 0.004, R() * 0.02 + 0.01, R() * 0.04 + 0.02], ph = [R() * 9, R() * 9, R() * 9], off = (t * sp) % 2000;
        const ridge = (x) => base - amp * (0.55 * Math.sin((x + off) * f[0] + ph[0]) + 0.3 * Math.sin((x + off) * f[1] + ph[1]) + 0.15 * Math.abs(Math.sin((x + off) * f[2] + ph[2])));
        ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += 12) ctx.lineTo(x, ridge(x)); ctx.lineTo(w, h); ctx.closePath();
        const g = ctx.createLinearGradient(0, base - amp, 0, base + 220); g.addColorStop(0, `rgba(31,27,22,${alpha})`); g.addColorStop(1, 'rgba(31,27,22,0)'); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = `rgba(31,27,22,${alpha * 1.2})`; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= w; x += 12) ctx.lineTo(x, ridge(x)); ctx.stroke(); }
      // 云雾
      for (const [y0, sp, a] of [[780, 10, 0.55], [990, 16, 0.5]]) { const g = ctx.createLinearGradient(0, y0 - 40, 0, y0 + 40); g.addColorStop(0, 'rgba(239,228,204,0)'); g.addColorStop(0.5, `rgba(239,228,204,${a})`); g.addColorStop(1, 'rgba(239,228,204,0)'); ctx.fillStyle = g; ctx.fillRect(0, y0 - 40 + Math.sin(t * 0.3 + y0) * 8, w, 80); }
      // 飞鸟
      for (let i = 0; i < 4; i++) { const bx = ((t * 22 + i * 170) % (w + 200)) - 100, by = 330 + i * 26 + Math.sin(t * 2 + i) * 8, f = Math.sin(t * 8 + i) * 6; this.brush(ctx, [[bx - 14, by - f], [bx - 6, by - 2], [bx, by]], 4, P.ink, 0.7); this.brush(ctx, [[bx, by], [bx + 6, by - 2], [bx + 14, by - f]], 4, P.ink, 0.7); }
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, h * 0.8); g.addColorStop(0, 'rgba(110,80,40,0)'); g.addColorStop(1, 'rgba(110,80,40,0.22)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); },
    eyes(ctx, x, y, r, mood, lx = 0, ly = 0) { const P = this.pal, blink = (T() % 3.4) < 0.12;
      for (const s of [-1, 1]) { const ex = x + s * r * 0.3 + lx * r * 0.1, ey = y - r * 0.05 + ly * r * 0.08;
        if (mood === 'angry') { this.brush(ctx, [[ex - s * r * 0.2, ey - r * 0.1], [ex, ey - r * 0.02], [ex + s * r * 0.16, ey + r * 0.04]], r * 0.12, '#f3ead6', 1); }
        else if (blink) this.brush(ctx, [[ex - r * 0.1, ey], [ex + r * 0.1, ey]], r * 0.07, P.ink); else { ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.07, r * 0.11, 0, 0, TAU); ctx.fill(); } }
      if (mood !== 'angry') this.brush(ctx, [[x - r * 0.12, y + r * 0.22], [x, y + r * 0.27], [x + r * 0.12, y + r * 0.22]], r * 0.05, P.ink); },
    hero(ctx, x, y, r, o = {}) { const P = this.pal, lx = Math.cos(o.angle || 0) * (o.speed || 0), ly = Math.sin(o.angle || 0) * (o.speed || 0);
      ctx.save(); const sg = ctx.createRadialGradient(x, y + r * 1.1, 0, x, y + r * 1.1, r); sg.addColorStop(0, 'rgba(31,27,22,0.25)'); sg.addColorStop(1, 'rgba(31,27,22,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(x, y + r * 1.1, r, r * 0.25, 0, 0, TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(x, y); if (o.angle !== undefined && o.stretch) { ctx.rotate(o.angle); ctx.scale(1 + o.stretch, 1 - o.stretch * 0.6); ctx.rotate(-o.angle); }
      const pts = this.blob(ctx, 0, 0, r, P.player, 1, 0.04); ctx.save(); path(ctx, pts); ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5; ctx.globalAlpha = 0.85; ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#f3ead6'; ctx.beginPath(); ctx.ellipse(0, r * 0.12, r * 0.62, r * 0.5, 0, 0, TAU); ctx.fill(); // 白脸
      this.brush(ctx, [[-r * 0.1, -r * 0.95], [r * 0.15, -r * 1.35], [r * 0.45, -r * 1.25]], r * 0.14, P.ink); // 发髻
      this.eyes(ctx, 0, r * 0.12, r * 0.85, 'happy', lx, ly); ctx.fillStyle = P.accent; ctx.beginPath(); ctx.arc(0, -r * 0.42, r * 0.07, 0, TAU); ctx.fill(); ctx.restore(); },
    ghost(ctx, x, y, r, o = {}) { ctx.save(); ctx.globalAlpha *= (o.alpha ?? 0.85) * 0.9; this.blob(ctx, x, y, r * 1.05, this.pal.enemy, 7, 0.14);
      for (let k = 0; k < 5; k++) { const a = T() * 1.5 + k * 1.3; ctx.fillStyle = this.pal.enemy; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2, r * 0.12, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = o.alpha ?? 0.85; this.eyes(ctx, x, y, r, 'angry'); ctx.restore(); },
    dot(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a * 0.8; ctx.fillStyle = rc(this, role || 'player'); ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, TAU); ctx.fill(); ctx.restore(); },
    spark(ctx, x, y, r, rot) { const c = Math.cos(rot), s = Math.sin(rot), L = r * 1.6; this.brush(ctx, [[x - c * L, y - s * L], [x - c * L * 0.3, y - s * L * 0.3], [x + c * L * 0.5, y + s * L * 0.5], [x + c * L, y + s * L]], r * 0.8, this.pal.enemy); },
    hunter(ctx, x, y, r, rot, seed = 0) { const pts = spikePts(x, y, r * 1.05, 7, 0.32, rot * 0.3); ctx.save(); path(ctx, pts); const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.2); g.addColorStop(0, '#4a443d'); g.addColorStop(1, this.pal.enemy); ctx.fillStyle = g; ctx.fill(); ctx.restore();
      ctx.fillStyle = this.pal.accent; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * r * 0.28, y - r * 0.05, r * 0.13, r * 0.08, s * 0.4, 0, TAU); ctx.fill(); } },
    hole(ctx, x, y, core, pull, a) { const t = T(), P = this.pal; ctx.save(); ctx.globalAlpha *= a; const g = ctx.createRadialGradient(x, y, core, x, y, pull); g.addColorStop(0, 'rgba(31,27,22,0.25)'); g.addColorStop(1, 'rgba(31,27,22,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, pull, 0, TAU); ctx.fill();
      for (let arm = 0; arm < 3; arm++) { const pts = []; for (let k = 0; k <= 24; k++) { const q = core * 0.5 + (pull * 0.75 - core * 0.5) * (k / 24), ang = arm * (TAU / 3) - t * 2 + k * 0.22; pts.push([x + Math.cos(ang) * q, y + Math.sin(ang) * q]); } this.brush(ctx, pts.reverse(), 10, P.ink, 0.75 * a); }
      this.blob(ctx, x, y, core, P.enemy, 9, 0.08); ctx.restore(); },
    pickup(ctx, x, y, r, seed = 0) { const P = this.pal, sq = r * 0.32, wob = Math.sin(T() * 3 + seed) * 0.15; ctx.save(); ctx.translate(x, y); ctx.scale(Math.cos(T() * 2 + seed) * 0.25 + 0.85, 1);
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r); g.addColorStop(0, '#f0cf6a'); g.addColorStop(1, P.pickup); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = shade(P.pickup, -0.4); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, TAU); ctx.stroke();
      ctx.rotate(wob); ctx.fillStyle = this.pal.bg; ctx.fillRect(-sq, -sq, sq * 2, sq * 2); ctx.strokeRect(-sq, -sq, sq * 2, sq * 2); ctx.restore(); },
    seal(ctx, x, y, s, ch, rot = -0.06) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const R = rng(ch.charCodeAt(0)); ctx.fillStyle = this.pal.accent; ctx.beginPath(); ctx.moveTo(-s / 2 + R() * 3, -s / 2 + R() * 3); ctx.lineTo(s / 2 - R() * 3, -s / 2 + R() * 2); ctx.lineTo(s / 2 - R() * 2, s / 2 - R() * 3); ctx.lineTo(-s / 2 + R() * 2, s / 2 - R() * 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#f3ead6'; ctx.lineWidth = Math.max(2, s * 0.05); ctx.strokeRect(-s / 2 + s * 0.1, -s / 2 + s * 0.1, s * 0.8, s * 0.8); ctx.font = `700 ${s * 0.6}px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3ead6'; ctx.fillText(ch, 0, s * 0.03); ctx.restore(); },
    warn(ctx, x, y, s, ang) { if (ang !== undefined && ang !== null) { const c = Math.cos(ang - Math.PI / 2), sn = Math.sin(ang - Math.PI / 2), L = s * 0.5; this.brush(ctx, [[x - c * L, y - sn * L], [x + c * L, y + sn * L]], 7, this.pal.accent); this.brush(ctx, [[x + c * L - Math.cos(ang - Math.PI / 2 - 0.6) * 18, y + sn * L - Math.sin(ang - Math.PI / 2 - 0.6) * 18], [x + c * L, y + sn * L], [x + c * L - Math.cos(ang - Math.PI / 2 + 0.6) * 18, y + sn * L - Math.sin(ang - Math.PI / 2 + 0.6) * 18]], 7, this.pal.accent); return; }
      this.seal(ctx, x, y, s * 0.9, '危'); },
    ring(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a * 1.4; ctx.strokeStyle = role === 'pickup' ? this.pal.pickup : role === 'enemy' || !role ? this.pal.ink : rc(this, role); ctx.lineWidth = 2.5; ctx.setLineDash([3, 10]); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore(); },
    frame(ctx, x0, y0, x1, y1) { const P = this.pal; ctx.save(); ctx.strokeStyle = 'rgba(31,27,22,0.45)'; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0); ctx.strokeRect(x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16);
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(31,27,22,0.6)'; for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { ctx.beginPath(); ctx.moveTo(cx + dx * 30, cy + dy * 2); ctx.lineTo(cx + dx * 30, cy + dy * 18); ctx.lineTo(cx + dx * 18, cy + dy * 18); ctx.lineTo(cx + dx * 18, cy + dy * 30); ctx.lineTo(cx + dx * 2, cy + dy * 30); ctx.stroke(); } ctx.restore(); },
    post() {},
    // ---- UI ----
    gtext(ctx, s, x, y, size, col, o = {}) { ctx.save(); ctx.font = fontOf(this, size, o.weight || 700); ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; if (size >= 40) { ctx.fillStyle = col; ctx.globalAlpha *= 0.18; ctx.fillText(s, x + 2, y + 3); ctx.globalAlpha /= 0.18; } ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); },
    text(ctx, s, x, y, o = {}) { const size = o.size || SIZE[o.role || 'body'], P = this.pal; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; const col = o.color === P.dim ? P.dim : o.color === P.enemy ? P.accent : o.color === P.player ? P.accent : P.ink; this.gtext(ctx, String(s), x, y, size, col); ctx.restore(); },
    title(ctx, s, x, y) { const chars = [...s].filter((c) => c !== ' '), gap = 150; chars.forEach((ch, i) => this.gtext(ctx, ch, x + (i - (chars.length - 1) / 2) * gap, y + (i % 2 ? 10 : -6), 150, this.pal.ink));
      this.seal(ctx, x + gap * chars.length * 0.5 + 34, y + 60, 54, chars[0] || '印', 0.08); },
    score(ctx, v, x, y, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(o.scale || 1, o.scale || 1); this.gtext(ctx, String(v), 0, 0, 88, this.pal.ink); ctx.restore(); },
    pill(ctx, x, y, o = {}) { const h = 64, size = 34, tw = measure(ctx, this, o.text ?? '', size), iw = o.icon ? h - 10 : 0, w = Math.max(h * 1.6, tw + iw + 44), L = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
      ctx.save(); this.paper(ctx, L, y - h / 2, w, h); ctx.strokeStyle = this.pal.ink; ctx.lineWidth = 2; ctx.strokeRect(L, y - h / 2, w, h); ctx.strokeRect(L + 5, y - h / 2 + 5, w - 10, h - 10); ctx.restore();
      if (o.icon === 'star') this.pickup(ctx, L + h / 2, y, 18, 0); else if (o.icon) UI.icon(ctx, o.icon, L + h / 2, y, h * 0.5, this.pal.accent);
      this.gtext(ctx, String(o.text ?? ''), L + iw + (w - iw) / 2, y + 2, size, this.pal.ink); return w; },
    panel(ctx, x, y, w, h, o = {}) { const L = x - w / 2, Tp = y - h / 2, P = this.pal; ctx.save(); ctx.fillStyle = 'rgba(31,27,22,0.25)'; ctx.fillRect(L + 10, Tp + 14, w, h); ctx.restore(); this.paper(ctx, L, Tp, w, h);
      ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.strokeRect(L + 14, Tp + 26, w - 28, h - 52); ctx.restore();
      for (const ry of [Tp - 8, Tp + h - 8]) { ctx.save(); const g = ctx.createLinearGradient(0, ry, 0, ry + 20); g.addColorStop(0, '#8a5a32'); g.addColorStop(0.5, '#5e3a1e'); g.addColorStop(1, '#3d2410'); ctx.fillStyle = g; rr(ctx, L - 22, ry, w + 44, 20, 8); ctx.fill(); ctx.fillStyle = P.accent; ctx.fillRect(L - 34, ry - 3, 14, 26); ctx.fillRect(L + w + 20, ry - 3, 14, 26); ctx.restore(); }
      if (o.title) { const tw = measure(ctx, this, o.title, 46) + 60; ctx.save(); ctx.fillStyle = o.titleColor === P.enemy ? P.ink : P.accent; ctx.fillRect(x - tw / 2, Tp - 30, tw, 66); ctx.strokeStyle = '#f3ead6'; ctx.lineWidth = 2; ctx.strokeRect(x - tw / 2 + 6, Tp - 24, tw - 12, 54); ctx.restore(); this.gtext(ctx, o.title, x, Tp + 3, 46, '#f3ead6'); } },
    overlay(ctx) { ctx.fillStyle = 'rgba(31,27,22,0.45)'; ctx.fillRect(0, 0, W(), H()); },
    button(ctx, b) { const P = this.pal, w = b.w, h = b.h, icon = b.kind === 'icon', prim = !b.kind || b.kind === 'primary', push = b._down ? 3 : 0; ctx.save(); ctx.translate(b.x, b.y + push); ctx.scale(b._scale, b._scale); if (!b.enabled) ctx.globalAlpha *= 0.45;
      if (icon) { ctx.fillStyle = 'rgba(31,27,22,0.2)'; ctx.beginPath(); ctx.arc(3, 5, h / 2, 0, TAU); ctx.fill(); this.paper(ctx, -h / 2, -h / 2, 0, 0); ctx.fillStyle = P.bg; ctx.beginPath(); ctx.arc(0, 0, h / 2, 0, TAU); ctx.fill(); const pts = ngon(0, 0, h / 2 - 2, 30); this.brush(ctx, pts.concat([pts[0], pts[1]]), 4, P.ink, 0.85); UI.icon(ctx, b.icon, 0, 0, h * 0.42, P.ink); ctx.restore(); return; }
      if (prim) { const R = rng(Math.round(b.x + b.y)); ctx.fillStyle = 'rgba(31,27,22,0.2)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h); ctx.fillStyle = P.accent; ctx.beginPath(); ctx.moveTo(-w / 2 + R() * 4, -h / 2 + R() * 4); ctx.lineTo(w / 2 - R() * 4, -h / 2 + R() * 3); ctx.lineTo(w / 2 - R() * 3, h / 2 - R() * 4); ctx.lineTo(-w / 2 + R() * 3, h / 2 - R() * 3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(243,234,214,0.8)'; ctx.lineWidth = 2; ctx.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20); }
      else { ctx.fillStyle = 'rgba(31,27,22,0.15)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h); this.paper(ctx, -w / 2, -h / 2, w, h); this.brush(ctx, [[-w / 2, -h / 2], [w / 2, -h / 2]], 4, P.ink); this.brush(ctx, [[-w / 2, h / 2], [w / 2, h / 2]], 4, P.ink); ctx.fillStyle = P.ink; ctx.fillRect(-w / 2, -h / 2, 3, h); ctx.fillRect(w / 2 - 3, -h / 2, 3, h); }
      const fg = prim ? '#f3ead6' : P.ink; buttonContent(ctx, this, b, 2, fg, { draw: (s, tx, ty, size) => this.gtext(ctx, s, tx, ty, size + 4, fg) }); ctx.restore(); },
    stars(ctx, x, y, n, max = 3, size = 72) { for (let i = 0; i < max; i++) { const cx = x + (i - (max - 1) / 2) * size * 1.25; if (i < n) this.pickup(ctx, cx, y, size * 0.45, i); else { ctx.save(); ctx.strokeStyle = this.pal.dim; ctx.lineWidth = 3; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.arc(cx, y, size * 0.45, 0, TAU); ctx.stroke(); ctx.restore(); } } },
    banner(ctx, s, y, o = {}) { const w = 600, h = 120; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; this.paper(ctx, W() / 2 - w / 2, y - h / 2, w, h); ctx.strokeStyle = this.pal.ink; ctx.lineWidth = 2; ctx.strokeRect(W() / 2 - w / 2 + 10, y - h / 2 + 10, w - 20, h - 20);
      for (const rx of [W() / 2 - w / 2 - 14, W() / 2 + w / 2 - 6]) { ctx.fillStyle = '#5e3a1e'; rr(ctx, rx, y - h / 2 - 16, 20, h + 32, 8); ctx.fill(); }
      this.gtext(ctx, s, W() / 2, y + 2, 60, this.pal.ink); this.seal(ctx, W() / 2 + w / 2 - 60, y + 24, 36, '令'); ctx.restore(); },
  };

  // =====================================================================
  // 沙雕简笔：粗黑马克笔线（抖动）、错位上色、夸张表情（大眼珠、张嘴、青筋、汗滴）、鸡腿
  // =====================================================================
  const shadiao = {
    label: '沙雕', font: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif', weight: 900,
    pal: { bg: '#fffef7', bg2: '#f1efe4', player: '#ffd60a', enemy: '#ff4d6d', pickup: '#ff9f1c', text: '#111111', dim: '#777777', ink: '#111111', accent: '#4cc9f0', danger: '#ff4d6d', blue: '#4cc9f0' },
    L(ctx, pts, seed, w = 6, close = true, col) { sketch.poly(ctx, close ? pts : pts, seed, col || '#111111', w, 1); },
    ln(ctx, x1, y1, x2, y2, seed, w = 6, col) { sketch.line(ctx, x1, y1, x2, y2, rng(seed + sketch.boil()), w, col || '#111111'); },
    fillOff(ctx, pts, col, dx = 7, dy = 6) { ctx.save(); ctx.fillStyle = col; path(ctx, pts.map(([x, y]) => [x + dx, y + dy])); ctx.fill(); ctx.restore(); },
    blob(ctx, x, y, r, col, seed, wob = 0.05) { const R = rng(seed + sketch.boil()), pts = []; for (let k = 0; k < 18; k++) { const a = (k / 18) * TAU; pts.push([x + Math.cos(a) * r * (1 + (R() - 0.5) * wob * 2), y + Math.sin(a) * r * (1 + (R() - 0.5) * wob * 2)]); }
      this.fillOff(ctx, pts, col); this.L(ctx, pts, seed, Math.max(4, r * 0.13)); return pts; },
    googly(ctx, x, y, er, lx, ly, seed) { const j = Math.sin(T() * 17 + seed) * er * 0.08; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, er, 0, TAU); ctx.fill(); sketch.circle(ctx, x, y, er, seed, '#111111', 3.5);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + lx * er * 0.45 + j, y + ly * er * 0.45 + er * 0.15, er * 0.45, 0, TAU); ctx.fill(); },
    bg(ctx) { const w = W(), h = H(), t = T(); ctx.fillStyle = this.pal.bg; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.fillStyle = 'rgba(17,17,17,0.06)'; for (let y = 20; y < h; y += 40) for (let x = 20 + ((y / 40) % 2) * 20; x < w; x += 40) ctx.fillRect(x, y, 4, 4); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.18; ctx.font = `900 64px ${this.font}`; ctx.fillStyle = '#111'; ctx.textAlign = 'center';
      [['哈', 110, 300, -0.2], ['啊?', 600, 470, 0.15], ['草', 90, 860, 0.1], ['...', 620, 1000, 0], ['?!', 380, 1210, -0.1]].forEach(([s, x, y, r], i) => { ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 6); ctx.rotate(r); ctx.fillText(s, 0, 0); ctx.restore(); }); ctx.restore(); },
    hero(ctx, x, y, r, o = {}) { const lx = Math.cos(o.angle || 0) * (o.speed || 0), ly = Math.sin(o.angle || 0) * (o.speed || 0);
      ctx.save(); ctx.translate(x, y); if (o.angle !== undefined && o.stretch) { ctx.rotate(o.angle); ctx.scale(1 + o.stretch * 1.4, 1 - o.stretch); ctx.rotate(-o.angle); }
      this.blob(ctx, 0, 0, r, this.pal.player, 11); this.googly(ctx, -r * 0.33, -r * 0.18, r * 0.3, lx, ly, 1); this.googly(ctx, r * 0.33, -r * 0.18, r * 0.3, lx, ly, 2);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(0, r * 0.42, r * 0.28, r * 0.2 + Math.abs(Math.sin(T() * 6)) * r * 0.08, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff6b8b'; ctx.beginPath(); ctx.ellipse(0, r * 0.52, r * 0.15, r * 0.08, 0, 0, TAU); ctx.fill();
      if ((o.speed || 0) > 0.6) { ctx.fillStyle = this.pal.blue; ctx.beginPath(); ctx.moveTo(r * 0.85, -r * 0.7); ctx.quadraticCurveTo(r * 1.05, -r * 0.4, r * 0.9, -r * 0.3); ctx.quadraticCurveTo(r * 0.72, -r * 0.4, r * 0.85, -r * 0.7); ctx.fill(); }
      this.ln(ctx, -r * 0.95, r * 0.1, -r * 1.4, -r * 0.35, 5, 5); this.ln(ctx, r * 0.95, r * 0.1, r * 1.4, -r * 0.4, 6, 5); ctx.restore(); },
    vein(ctx, x, y, s, seed) { for (const [a, b, c, d] of [[-1, -0.3, -0.3, -1], [0.3, -1, 1, -0.3], [1, 0.3, 0.3, 1], [-0.3, 1, -1, 0.3]]) this.ln(ctx, x + a * s, y + b * s, x + c * s, y + d * s, seed, 4, this.pal.enemy); },
    ghost(ctx, x, y, r, o = {}) { ctx.save(); ctx.globalAlpha *= o.alpha ?? 0.85; this.blob(ctx, x, y, r, this.pal.enemy, 21, 0.12);
      for (const s of [-1, 1]) { this.ln(ctx, x + s * r * 0.55, y - r * 0.5, x + s * r * 0.1, y - r * 0.28, 22 + s, 5); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + s * r * 0.3, y - r * 0.08, r * 0.1, 0, TAU); ctx.fill(); }
      const tw = r * 0.7; ctx.fillStyle = '#fff'; ctx.fillRect(x - tw / 2, y + r * 0.22, tw, r * 0.26); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.strokeRect(x - tw / 2, y + r * 0.22, tw, r * 0.26); for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - tw / 2 + (tw * k) / 4, y + r * 0.22); ctx.lineTo(x - tw / 2 + (tw * k) / 4, y + r * 0.48); ctx.stroke(); }
      this.vein(ctx, x + r * 0.75, y - r * 0.85, r * 0.22, 23); ctx.restore(); },
    dot(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a * 0.7; ctx.strokeStyle = role === 'player' || !role ? '#111' : rc(this, role); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, TAU); ctx.stroke(); ctx.restore(); },
    spark(ctx, x, y, r, rot, seed = 0) { const pts = ngon(x, y, r * 1.25, 3, rot); this.fillOff(ctx, pts, this.pal.enemy, 4, 4); this.L(ctx, pts, seed + 31, 4.5); },
    hunter(ctx, x, y, r, rot, seed = 0) { const pts = spikePts(x, y, r, 8, 0.3, rot * 0.25); this.fillOff(ctx, pts, '#b5179e'); this.L(ctx, pts, seed + 40, 5);
      this.googly(ctx, x - r * 0.3, y - r * 0.08, r * 0.24, 0, 0, seed); this.googly(ctx, x + r * 0.3, y - r * 0.08, r * 0.24, 0, 0, seed + 1);
      for (const s of [-1, 1]) this.ln(ctx, x + s * r * 0.55, y - r * 0.5, x + s * r * 0.1, y - r * 0.32, seed + 2 + s, 5); ctx.save(); ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.beginPath(); for (let k = 0; k <= 6; k++) ctx.lineTo(x - r * 0.35 + (k / 6) * r * 0.7, y + r * 0.35 + (k % 2 ? -8 : 0)); ctx.stroke(); ctx.restore(); },
    hole(ctx, x, y, core, pull, a) { ctx.save(); ctx.globalAlpha *= a; ctx.setLineDash([16, 14]); sketch.circle(ctx, x, y, pull, 77, '#999999', 3); ctx.setLineDash([]);
      const R = rng(55 + sketch.boil()); ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); for (let k = 0; k < 80; k++) { const ang = k * 0.35 - T() * 5, q = core * 2.2 * (1 - k / 80) + R() * 3; ctx.lineTo(x + Math.cos(ang) * q, y + Math.sin(ang) * q); } ctx.stroke();
      ctx.font = `900 30px ${this.font}`; ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.fillText('吸~', x + core * 2.4, y - core * 1.6); ctx.restore(); },
    pickup(ctx, x, y, r, seed = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6 + Math.sin(T() * 4 + seed) * 0.25);
      const meat = []; for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU; meat.push([Math.cos(a) * r * 0.85 - r * 0.25, Math.sin(a) * r * 0.62]); }
      ctx.fillStyle = '#fff'; ctx.fillRect(r * 0.4, -r * 0.13, r * 0.7, r * 0.26); for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(r * 1.12, s * r * 0.16, r * 0.17, 0, TAU); ctx.fill(); }
      this.ln(ctx, r * 0.4, -r * 0.13, r * 1.05, -r * 0.13, seed + 50, 3); this.ln(ctx, r * 0.4, r * 0.13, r * 1.05, r * 0.13, seed + 51, 3); for (const s of [-1, 1]) sketch.circle(ctx, r * 1.12, s * r * 0.16, r * 0.17, seed + 52 + s, '#111111', 3);
      this.fillOff(ctx, meat, this.pal.pickup, 4, 3); this.L(ctx, meat, seed + 53, 4); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-r * 0.45, -r * 0.25, r * 0.2, r * 0.1, -0.4, 0, TAU); ctx.fill(); ctx.restore(); },
    warn(ctx, x, y, s, ang) { ctx.save(); ctx.translate(x, y); if (ang !== undefined && ang !== null) { ctx.rotate(ang); this.ln(ctx, 0, s * 0.5, 0, -s * 0.5, 61, 7, this.pal.enemy); this.ln(ctx, 0, -s * 0.55, -s * 0.35, -s * 0.12, 62, 7, this.pal.enemy); this.ln(ctx, 0, -s * 0.55, s * 0.35, -s * 0.12, 63, 7, this.pal.enemy); ctx.restore(); return; }
      ctx.rotate(Math.sin(T() * 20) * 0.08); ctx.font = `900 ${s}px ${this.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#111'; ctx.strokeText('!?', 0, 0); ctx.fillStyle = this.pal.enemy; ctx.fillText('!?', 0, 0); ctx.restore(); },
    ring(ctx, x, y, r, role, a) { ctx.save(); ctx.globalAlpha *= a * 2; ctx.setLineDash([12, 12]); sketch.circle(ctx, x, y, r, 88, rc(this, role || 'enemy'), 3); ctx.restore(); },
    frame(ctx, x0, y0, x1, y1) { ctx.save(); ctx.globalAlpha *= 0.35; this.L(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 300, 4); ctx.restore(); },
    post() {},
    // ---- UI ----
    stext(ctx, s, x, y, size, col, o = {}) { ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, -0.12, 1, 0, 0); ctx.font = fontOf(this, size, 900); ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      if (size >= 40 && !o.plain) { ctx.fillStyle = '#111'; ctx.fillText(s, 5, 5); ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#111'; ctx.strokeText(s, 0, 0); } ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); },
    text(ctx, s, x, y, o = {}) { const size = o.size || SIZE[o.role || 'body'], P = this.pal; ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; const col = size >= 40 ? (o.color === P.enemy ? P.enemy : o.color === P.player ? P.player : '#ffffff') : (o.color === P.dim ? '#555555' : '#111111'); this.stext(ctx, String(s), x, y, size, col); ctx.restore(); },
    title(ctx, s, x, y, o = {}) { const t = o.t ?? T(), chars = [...s].filter((c) => c !== ' ');
      chars.forEach((ch, i) => { const cx = x + (i - (chars.length - 1) / 2) * 150, sh = Math.sin(t * 9 + i * 2) > 0.7 ? 6 : 0; ctx.save(); ctx.translate(cx + sh, y); ctx.rotate(i % 2 ? 0.1 : -0.12); this.stext(ctx, ch, 0, 0, 140, i % 2 ? this.pal.enemy : this.pal.player); ctx.restore(); });
      for (let k = 0; k < 5; k++) { const a = -2.6 + k * 0.3; this.ln(ctx, x + Math.cos(a) * 190, y + Math.sin(a) * 110, x + Math.cos(a) * 230, y + Math.sin(a) * 135, 70 + k, 5); } },
    score(ctx, v, x, y, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(o.scale || 1, o.scale || 1); this.stext(ctx, String(v), 0, 0, 84, '#ffffff'); ctx.restore(); },
    pill(ctx, x, y, o = {}) { const h = 64, size = 34, tw = measure(ctx, this, o.text ?? '', size), iw = o.icon ? h - 4 : 0, w = Math.max(h * 1.6, tw + iw + 44), L = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x, box = [[L, y - h / 2], [L + w, y - h / 2], [L + w, y + h / 2], [L, y + h / 2]];
      ctx.save(); ctx.fillStyle = '#fff'; path(ctx, box); ctx.fill(); ctx.restore(); this.L(ctx, box, 90 + Math.round(L), 4);
      if (o.icon === 'star') this.pickup(ctx, L + h / 2, y, 18, 0); else if (o.icon) UI.icon(ctx, o.icon, L + h / 2, y, h * 0.5, '#111');
      this.stext(ctx, String(o.text ?? ''), L + iw + (w - iw) / 2, y + 1, size, '#111'); return w; },
    panel(ctx, x, y, w, h, o = {}) { const L = x - w / 2, Tp = y - h / 2, box = [[L, Tp], [L + w, Tp], [L + w, Tp + h], [L, Tp + h]]; this.fillOff(ctx, box, this.pal.player, 14, 14); ctx.save(); ctx.fillStyle = '#fff'; path(ctx, box); ctx.fill(); ctx.restore(); this.L(ctx, box, 600, 6);
      if (o.title) { const tw = measure(ctx, this, o.title, 46) / 2 + 60, burst = spikePts(x, Tp, tw, 14, 0.2, T() * 0.5).map(([px, py]) => [px, Tp + (py - Tp) * 0.42]); this.fillOff(ctx, burst, o.titleColor === this.pal.enemy ? this.pal.enemy : this.pal.blue, 0, 0); this.L(ctx, burst, 601, 4); this.stext(ctx, o.title, x, Tp + 2, 46, '#ffffff'); } },
    overlay(ctx) { ctx.fillStyle = 'rgba(255,254,247,0.7)'; ctx.fillRect(0, 0, W(), H()); },
    button(ctx, b) { const P = this.pal, w = b.w, h = b.h, icon = b.kind === 'icon', prim = !b.kind || b.kind === 'primary', push = b._down ? 5 : 0, seed = Math.round(b.x * 3 + b.y);
      ctx.save(); ctx.translate(b.x + push, b.y + push); ctx.scale(b._scale, b._scale); if (!b.enabled) ctx.globalAlpha *= 0.4;
      if (icon) { const pts = ngon(0, 0, h / 2, 14); this.fillOff(ctx, pts, P.player, 5, 5); ctx.fillStyle = '#fff'; path(ctx, pts); ctx.fill(); this.L(ctx, pts, seed, 4); UI.icon(ctx, b.icon, 0, 0, h * 0.42, '#111'); ctx.restore(); return; }
      const box = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]; this.fillOff(ctx, box, prim ? P.enemy : '#cccccc', 9, 9); ctx.fillStyle = prim ? P.player : '#fff'; path(ctx, box); ctx.fill(); this.L(ctx, box, seed, 5);
      buttonContent(ctx, this, b, 2, '#111', { draw: (s, tx, ty, size) => this.stext(ctx, s + (prim ? '!!' : ''), tx, ty, size, prim ? '#ffffff' : '#111', { plain: !prim }) }); ctx.restore(); },
    stars(ctx, x, y, n, max = 3, size = 72) { for (let i = 0; i < max; i++) { const cx = x + (i - (max - 1) / 2) * size * 1.25, pts = starPts(cx, y + (i % 2 ? -8 : 4), size * 0.6, 0.5, 5, -Math.PI / 2 + (i - 1) * 0.2); if (i < n) this.fillOff(ctx, pts, P_star(this), 6, 5); this.L(ctx, pts, 700 + i, i < n ? 5 : 3, true, i < n ? '#111111' : '#aaaaaa'); } },
    banner(ctx, s, y, o = {}) { ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.translate(W() / 2, y); ctx.rotate(-0.06 + Math.sin(T() * 15) * 0.01); const band = [[-W(), -58], [W(), -58], [W(), 58], [-W(), 58]];
      ctx.fillStyle = this.pal.player; path(ctx, band); ctx.fill(); this.L(ctx, band, 800, 6); this.stext(ctx, s + '！！', 0, 4, 64, this.pal.enemy); ctx.restore(); },
  };
  function P_star(S) { return S.pal.player; }

  // =====================================================================
  // 通用形状：任意多边形按画风上色描边（自定义物体用它，画风就不会走样）
  // =====================================================================
  const WALL = { anime: '#a99bd6', arcade: '#3a3f8f', cyber: '#5b3fa8', flat: '#6a4c93', guofeng: '#5a5248', shadiao: '#e2ded0', sketch: '#8b8b95' };
  for (const k in WALL) ({ anime, arcade, cyber, flat, guofeng, shadiao, sketch })[k].pal.wall = WALL[k];
  const SHAPE = {
    anime: (S, ctx, pts, col, b) => S.cel(ctx, pts, b.cx, b.cy, b.r, col, { gloss: b.r > 18 }),
    arcade: (S, ctx, pts, col) => { ctx.save(); path(ctx, pts); ctx.fillStyle = col; ctx.fill(); ctx.lineJoin = 'miter'; ctx.lineWidth = 6; ctx.strokeStyle = shade(col, -0.5); ctx.stroke(); ctx.restore(); },
    cyber: (S, ctx, pts, col) => S.wire(ctx, pts, col, 4, 0.18),
    flat: (S, ctx, pts, col, b) => S.solid(ctx, pts, col, Math.max(4, Math.min(10, b.r * 0.15))),
    guofeng: (S, ctx, pts, col) => { ctx.save(); path(ctx, pts); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = S.pal.ink; ctx.globalAlpha *= 0.8; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); },
    shadiao: (S, ctx, pts, col, b) => { S.fillOff(ctx, pts, col, 6, 5); sketch.poly(ctx, pts, Math.round(b.cx * 7 + b.cy), '#111111', 5, 1); },
    sketch: (S, ctx, pts, col, b) => { S.marker(ctx, pts, col, 0.6); S.poly(ctx, pts, Math.round(b.cx * 7 + b.cy), null, 3, 2); },
  };
  // 冲击波：每种画风的画法（k 0→1 动画进度，r 当前半径）
  const SHOCK = {
    anime: (S, ctx, x, y, r, c, k) => { ctx.lineWidth = 14 * (1 - k) + 2; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.lineWidth = 6 * (1 - k) + 1; ctx.strokeStyle = c; ctx.stroke(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + k; S.sparkle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 12 * (1 - k) + 2); } },
    arcade: (S, ctx, x, y, r, c) => { const n = Math.max(8, Math.round(r / 6)); for (let i = 0; i < n; i++) { if (i % 2) continue; const a = (i / n) * TAU; S.block(ctx, Math.round((x + Math.cos(a) * r) / 4) * 4, Math.round((y + Math.sin(a) * r) / 4) * 4, 8, c); } },
    cyber: (S, ctx, x, y, r, c, k) => { ctx.strokeStyle = c; ctx.lineWidth = 6 * (1 - k) + 1; S.glow(ctx, c, 24); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * (1 - k) + 0.5; ctx.stroke(); },
    flat: (S, ctx, x, y, r, c, k) => { ctx.lineWidth = 18 * (1 - k) + 2; ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); },
    guofeng: (S, ctx, x, y, r, c, k) => { const pts = ngon(x, y, r, 28, k * 2); S.brush(ctx, pts.concat([pts[0], pts[1]]), 10 * (1 - k) + 2, c, 0.8); },
    shadiao: (S, ctx, x, y, r, c, k) => { ctx.setLineDash([16, 10]); sketch.circle(ctx, x, y, r, 91, c, 5 * (1 - k) + 2); ctx.setLineDash([]); if (k < 0.5) { ctx.font = `900 ${40 + r * 0.2}px ${S.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 8; ctx.strokeStyle = '#111'; ctx.strokeText('砰!', x, y - r * 0.6); ctx.fillStyle = S.pal.player; ctx.fillText('砰!', x, y - r * 0.6); } },
  };
  const FX = [];
  const ROUND = { anime: 0.22, flat: 0.2, guofeng: 0.06, shadiao: 0.04, sketch: 0.04, arcade: 0, cyber: 0 };
  function rrPts(L, Tp, w, h, r) { if (r <= 0) return [[L, Tp], [L + w, Tp], [L + w, Tp + h], [L, Tp + h]]; const p = [];
    for (const [cx, cy, a0] of [[L + w - r, Tp + r, -Math.PI / 2], [L + w - r, Tp + h - r, 0], [L + r, Tp + h - r, Math.PI / 2], [L + r, Tp + r, Math.PI]]) for (let k = 0; k <= 4; k++) { const a = a0 + (k / 4) * (Math.PI / 2); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
  function bounds(pts) { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, r: Math.max(x1 - x0, y1 - y0) / 2 }; }

  // =====================================================================
  const STYLES = { anime, arcade, cyber, flat, guofeng, shadiao };
  const ORDER = ['anime', 'arcade', 'cyber', 'flat', 'guofeng', 'shadiao'];
  const LABELS = { anime: '二次元', arcade: '街机', cyber: '电子', flat: '扁平', guofeng: '国风', shadiao: '沙雕' };
  const colorOf = (role) => (Art.S.pal[role] || role || Art.S.pal.player);
  const toPts = (pts) => pts.map((p) => (Array.isArray(p) ? p : [p.x, p.y]));
  const Art = {
    STYLES, ORDER, LABELS, S: anime, name: 'anime',
    color: (role) => rc(Art.S, role),
    use(name) { if (!STYLES[name]) { if (name) console.warn('art.js: 未知画风 ' + name + '，可选：' + ORDER.join(' ')); name = 'anime'; }
      this.name = name; this.S = STYLES[name]; if (!CFG.color) CFG.color = {}; Object.assign(CFG.color, this.S.pal); },
    next() { this.use(ORDER[(ORDER.indexOf(this.name) + 1) % ORDER.length]); return this.name; },
    get label() { return LABELS[this.name]; },
    get pal() { return this.S.pal; },
    bg: (ctx) => Art.S.bg(ctx),
    post(ctx) {
      // 先画还在播放的冲击波，再画画风的后期效果
      for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i], k = (G.time - f.t0) / f.dur; if (k >= 1 || k < 0) { FX.splice(i, 1); continue; }
        const e = 1 - (1 - k) * (1 - k); ctx.save(); ctx.globalAlpha *= 1 - k * k; (SHOCK[Art.name] || SHOCK.flat)(Art.S, ctx, f.x, f.y, f.size * (0.15 + 0.85 * e), rc(Art.S, f.role), k); ctx.restore(); }
      Art.S.post(ctx);
    },
    // 冲击波：调用一次即可，自动播放约 0.45 秒（在 Art.post 里绘制）。爆炸、击中、落地、技能释放
    shockwave(x, y, size = 120, role = 'accent', dur = 0.45) { FX.push({ x, y, size, role, dur, t0: G.time }); if (FX.length > 40) FX.shift(); },
    // 光晕：每帧画在物体下面（发光物体、能量场、选中提示）
    glow(ctx, x, y, r, role = 'player', alpha = 0.5) { const c = rc(Art.S, role); ctx.save(); ctx.globalAlpha *= alpha; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
      if (Art.name === 'arcade') { for (let k = 3; k >= 1; k--) { ctx.globalAlpha = alpha * (0.25 + (3 - k) * 0.2); ctx.fillStyle = c; const q = Math.round((r * k) / 3 / 4) * 4; ctx.fillRect(Math.round(x - q), Math.round(y - q), q * 2, q * 2); } }
      else { ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.restore(); },
    hero: (ctx, x, y, r, o) => Art.S.hero(ctx, x, y, r, o || {}),
    enemy: (ctx, x, y, r, o) => Art.S.ghost(ctx, x, y, r, o || {}),
    spiky: (ctx, x, y, r, rot = 0, seed = 0) => Art.S.hunter(ctx, x, y, r, rot, seed),
    bullet: (ctx, x, y, r, rot = 0, seed = 0) => Art.S.spark(ctx, x, y, r, rot, seed),
    vortex: (ctx, x, y, core, pull, a = 1) => Art.S.hole(ctx, x, y, core, pull, a),
    pickup: (ctx, x, y, r, seed = 0) => Art.S.pickup(ctx, x, y, r, seed),
    warn: (ctx, x, y, size, ang) => Art.S.warn(ctx, x, y, size, ang),
    dot: (ctx, x, y, r, role = 'player', a = 1) => Art.S.dot(ctx, x, y, r, role, a),
    ring: (ctx, x, y, r, role = 'enemy', a = 1) => Art.S.ring(ctx, x, y, r, role, a),
    frame: (ctx, x0, y0, x1, y1) => Art.S.frame(ctx, x0, y0, x1, y1),
    // 轨迹：pts 为 [{x,y}...] 或 [[x,y]...]，越新越清楚
    trail(ctx, pts, r = 12, role = 'player') { const n = pts.length; toPts(pts).forEach(([x, y], i) => Art.S.dot(ctx, x, y, r * (0.4 + 0.6 * (i / n)), role, 0.5 * (i / n))); },
    shape(ctx, pts, role = 'player') { pts = toPts(pts); if (pts.length < 3) return; (SHAPE[Art.name] || SHAPE.flat)(Art.S, ctx, pts, colorOf(role), bounds(pts)); },
    circle: (ctx, x, y, r, role) => Art.shape(ctx, ngon(x, y, r, Math.max(12, Math.min(40, Math.round(r)))), role),
    poly: (ctx, x, y, r, sides, rot, role) => Art.shape(ctx, ngon(x, y, r, sides, rot), role),
    block(ctx, x, y, w, h, kind = 'wall') {
      const P = Art.S.pal, r = Math.min(w, h) * (ROUND[Art.name] ?? 0.1);
      if (kind === 'floor') { ctx.save(); ctx.globalAlpha *= 0.5; ctx.fillStyle = P.bg2; path(ctx, rrPts(x + 2, y + 2, w - 4, h - 4, r)); ctx.fill(); ctx.restore(); return; }
      const role = { wall: 'wall', goal: 'pickup', hazard: 'enemy', switch: 'accent' }[kind] || kind;
      Art.shape(ctx, rrPts(x + 3, y + 3, w - 6, h - 6 - (Art.name === 'flat' ? 6 : 0), r), role);
    },
    tile: (ctx, cx, cy, size, kind) => Art.block(ctx, cx - size / 2, cy - size / 2, size, size, kind),
  };
  window.Art = Art;

  // ---- 接管 UI：同一套组件 API，按当前画风绘制 ----
  UI.text = (ctx, s, x, y, o) => Art.S.text(ctx, s, x, y, o || {});
  UI.title = (ctx, s, x, y, o) => Art.S.title(ctx, s, x, y, o || {});
  UI.score = (ctx, v, x, y, o) => Art.S.score(ctx, v, x, y, o || {});
  UI.pill = (ctx, x, y, o) => Art.S.pill(ctx, x, y, o || {});
  UI.panel = (ctx, x, y, w, h, o) => Art.S.panel(ctx, x, y, w, h, o || {});
  UI.overlay = (ctx) => Art.S.overlay(ctx);
  UI.stars = (ctx, x, y, n, max, size) => Art.S.stars(ctx, x, y, n, max, size);
  UI.banner = (ctx, s, y, o) => Art.S.banner(ctx, s, y, o || {});
  UI.drawButton = (ctx, b) => {
    b._drawn = G.frame; G._btns && G._btns.push(b);   // UI.clicked 只响应画出来的按钮；登记给测试脚本
    if (b._born) { b._born = false; G.tween(b, { _scale: 1 }, 0.35, 'outBack'); }
    Art.S.button(ctx, b);
  };

  // ---- 选定画风：网址 ?style= 优先，其次 CFG.art.style ----
  let pick = null; try { pick = new URLSearchParams(location.search).get('style'); } catch (e) {}
  Art.use(pick || (typeof CFG !== 'undefined' && CFG.art && CFG.art.style) || 'anime');
})();
