/* =====================================================================
 * ui.js — UI 组件库（按钮、面板、HUD、图标、标题）
 * 所有 UI 都用这里的组件画，不要用 D.rect/D.text 手拼按钮和面板。
 * 风格由 CFG.ui.style 决定：'casual' | 'neon' | 'minimal' | 'paper'
 * 坐标约定：所有组件的 x,y 都是【中心点】（UI.pill 例外，见注释）。
 * 完整说明见 references/ui-design.md。不要修改本文件。
 * ===================================================================== */
(function () {
  'use strict';
  const FONT = 'system-ui, -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

  // ---------------- 颜色工具 ----------------
  function rgb(hex) {
    let h = String(hex).replace('#', '');
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  // amt > 0 变亮（混白），amt < 0 变暗（混黑），范围 -1..1
  function shade(c, amt) {
    const [r, g, b] = rgb(c), t = amt < 0 ? 0 : 255, k = Math.abs(amt);
    return hex(r + (t - r) * k, g + (t - g) * k, b + (t - b) * k);
  }
  function alpha(c, a) { const [r, g, b] = rgb(c); return `rgba(${r},${g},${b},${a})`; }
  function mix(c1, c2, t) { const a = rgb(c1), b = rgb(c2); return hex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); }
  function luminance(c) { const [r, g, b] = rgb(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
  const isLight = (c) => luminance(c) > 0.6;

  // ---------------- 风格 ----------------
  const STYLES = {
    // 休闲卡通：粗描边、立体按钮（底部厚边）、文字描边。适合大多数休闲/益智/动作小游戏
    casual: { radius: 30, outline: 6, lip: 12, glow: 0, textStroke: true, weight: 900, gloss: true, panelFill: 'bg2' },
    // 霓虹：暗背景、发光描边、空心按钮。适合躲避/射击/节奏/赛博主题
    neon: { radius: 14, outline: 4, lip: 0, glow: 22, textStroke: false, weight: 800, hollow: true, panelFill: 'bg' },
    // 极简：扁平、无描边、大留白。适合解谜/禅意/单色游戏
    minimal: { radius: 22, outline: 0, lip: 0, glow: 0, textStroke: false, weight: 700, panelFill: 'bg2' },
    // 纸艺：卡片 + 柔和投影。适合治愈/文字/卡牌/经营
    paper: { radius: 18, outline: 0, lip: 0, glow: 0, textStroke: false, weight: 800, drop: 10, panelFill: 'bg2' },
  };
  function theme() {
    const c = (typeof CFG !== 'undefined' && CFG.color) || {};
    const cfg = (typeof CFG !== 'undefined' && CFG.ui) || {};
    const s = Object.assign({}, STYLES[cfg.style] || STYLES.casual, cfg.override || {});
    const bg = c.bg || '#1b1b3a';
    s.c = {
      bg, bg2: c.bg2 || shade(bg, 0.12), text: c.text || '#fff', dim: c.dim || '#888',
      primary: c.primary || c.player || '#ffd166', danger: c.enemy || '#ef476f', good: c.pickup || '#06d6a0',
      // ink：描边/阴影色。浅色背景用文字色，深色背景用更深的背景色
      ink: c.ink || (isLight(bg) ? (c.text || '#333') : shade(bg, -0.65)),
    };
    s.c.panel = s.c[s.panelFill] || s.c.bg2;
    return s;
  }

  // ---------------- 字体层级（只用这 6 级） ----------------
  const TYPE = { display: 120, h1: 76, h2: 52, body: 36, caption: 28, hud: 76 };

  // ---------------- 路径工具 ----------------
  function rrPath(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function setFont(ctx, size, weight) { ctx.font = `${weight} ${size}px ${FONT}`; }

  // ---------------- 文字 ----------------
  // UI.text(ctx, '文字', x, y, { role:'body', color, align:'center', alpha, size(覆盖), weight, plain:true(不描边) })
  function text(ctx, str, x, y, o = {}) {
    const T = theme(), size = o.size || TYPE[o.role || 'body'] || 36;
    const color = o.color || T.c.text;
    ctx.save();
    ctx.globalAlpha *= o.alpha ?? 1;
    setFont(ctx, size, o.weight || (o.role === 'caption' || o.role === 'body' ? Math.min(T.weight, 700) : T.weight));
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx && o.spacing) ctx.letterSpacing = o.spacing + 'px';
    str = String(str);
    if (!o.plain && T.textStroke && size >= 40) {
      // 文字色与描边色太接近（浅色主题的深色字）时改用白色描边，否则会糊成一团
      const strokeC = Math.abs(luminance(color) - luminance(T.c.ink)) < 0.3 ? '#ffffff' : T.c.ink;
      ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(4, size * 0.16); ctx.strokeStyle = strokeC;
      ctx.strokeText(str, x, y + size * 0.06);   // 底部厚边
      ctx.strokeText(str, x, y);
    } else if (!o.plain && T.glow && size >= 40) {
      ctx.shadowColor = color; ctx.shadowBlur = T.glow * (size / 80);
    } else if (!o.plain && T.drop && size >= 40) {
      ctx.fillStyle = alpha(T.c.ink, 0.25); ctx.fillText(str, x + 3, y + 4);
    }
    ctx.fillStyle = color; ctx.fillText(str, x, y);
    ctx.restore();
  }
  function measure(ctx, str, o = {}) {
    const T = theme(); ctx.save(); setFont(ctx, o.size || TYPE[o.role || 'body'], o.weight || T.weight);
    const w = ctx.measureText(String(str)).width; ctx.restore(); return w;
  }

  // 游戏标题：逐字波浪 + 描边。t 传 G.time 让字跳动
  // UI.title(ctx, '绕圈', x, y, { size: 120, color, t: G.time, wave: 8 })
  function title(ctx, str, x, y, o = {}) {
    const size = o.size || TYPE.display, chars = [...String(str)], gap = size * 0.08;
    const widths = chars.map((ch) => measure(ctx, ch, { size }));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
    let cx = x - total / 2;
    const T = theme(), colors = o.colors || [o.color || T.c.primary];
    chars.forEach((ch, i) => {
      const dy = o.t !== undefined ? Math.sin(o.t * 3 + i * 0.7) * (o.wave ?? 8) : 0;
      const rot = o.t !== undefined ? Math.sin(o.t * 2 + i) * 0.04 : 0;
      ctx.save(); ctx.translate(cx + widths[i] / 2, y + dy); ctx.rotate(rot);
      text(ctx, ch, 0, 0, { size, color: colors[i % colors.length], weight: 900 });
      ctx.restore();
      cx += widths[i] + gap;
    });
  }

  // ---------------- 面板 ----------------
  // UI.panel(ctx, x, y, w, h, { color, title:'游戏结束', titleColor, alpha })
  function panel(ctx, x, y, w, h, o = {}) {
    const T = theme(), fill = o.color || T.c.panel, r = T.radius * 1.2;
    const L = x - w / 2, Tp = y - h / 2;
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
    if (T.lip) { rrPath(ctx, L, Tp + T.lip, w, h, r); ctx.fillStyle = T.c.ink; ctx.fill(); }
    if (T.drop) { rrPath(ctx, L, Tp + T.drop * 1.5, w, h, r); ctx.fillStyle = alpha(T.c.ink, 0.22); ctx.fill(); }
    rrPath(ctx, L, Tp, w, h, r);
    if (T.hollow) {
      ctx.fillStyle = alpha(fill, 0.85); ctx.fill();
      ctx.shadowColor = T.c.primary; ctx.shadowBlur = T.glow; ctx.strokeStyle = T.c.primary; ctx.lineWidth = T.outline; ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = fill; ctx.fill();
      if (T.outline) { ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.outline; ctx.stroke(); }
      if (T.gloss) { rrPath(ctx, L + 14, Tp + 14, w - 28, h - 28, r * 0.7); ctx.strokeStyle = alpha('#ffffff', 0.08); ctx.lineWidth = 4; ctx.stroke(); }
    }
    if (o.title) {
      // 顶部缎带标题
      const tc = o.titleColor || T.c.primary, tw = Math.max(measure(ctx, o.title, { role: 'h2' }) + 100, w * 0.6), th = 92;
      const ty = Tp;
      if (T.lip) { rrPath(ctx, x - tw / 2, ty - th / 2 + 8, tw, th, th / 2); ctx.fillStyle = T.c.ink; ctx.fill(); }
      rrPath(ctx, x - tw / 2, ty - th / 2, tw, th, th / 2);
      if (T.hollow) { ctx.fillStyle = T.c.bg; ctx.fill(); ctx.strokeStyle = tc; ctx.lineWidth = T.outline; ctx.shadowColor = tc; ctx.shadowBlur = T.glow; ctx.stroke(); ctx.shadowBlur = 0; }
      else { ctx.fillStyle = tc; ctx.fill(); if (T.outline) { ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.outline; ctx.stroke(); } }
      text(ctx, o.title, x, ty, { role: 'h2', color: T.hollow ? tc : (isLight(tc) ? T.c.ink : '#ffffff'), plain: !T.textStroke || isLight(tc) });
    }
    ctx.restore();
  }

  // 半透明遮罩（暂停/弹窗背后）
  function overlay(ctx, a = 0.6) { const T = theme(); ctx.fillStyle = alpha(isLight(T.c.bg) ? T.c.text : '#000000', a); ctx.fillRect(0, 0, G.W, G.H); }

  // ---------------- 按钮 ----------------
  // 创建（enter 里）：this.btnPlay = UI.button({ x, y, label:'开始', icon:'play', kind:'primary', w, h, key:'action' })
  // kind: 'primary' 主按钮 | 'secondary' 次按钮 | 'danger' | 'icon' 圆形图标按钮（只有 icon）
  function button(o) {
    const icon = o.kind === 'icon';
    return Object.assign({ w: icon ? 96 : 400, h: icon ? 96 : 112, kind: 'primary', label: '', icon: null, key: null, enabled: true }, o,
      { _down: false, _scale: 0.6, _born: true });
  }
  // 判断点击（update 里）：if (UI.clicked(this.btnPlay)) {...}。松手时触发，自动播放音效和动画
  // 只有上一帧画出来（drawButton）的按钮才会响应：没画的按钮（隐藏面板里的、同位置的另一个）点击和快捷键都无效
  function clicked(b) {
    if (!b.enabled) { b._down = false; return false; }
    if (b._drawn === undefined || G.frame - b._drawn > 1) { b._down = false; return false; }
    const p = G.input.pointer, inside = p.x >= b.x - b.w / 2 && p.x <= b.x + b.w / 2 && p.y >= b.y - b.h / 2 - 10 && p.y <= b.y + b.h / 2 + 10;
    if (p.pressed && inside) b._down = true;
    let fire = false;
    if (b._down && p.released) { fire = inside; b._down = false; }
    if (b._down && !p.down) b._down = false;
    if (b.key && G.input.pressed(b.key)) fire = true;
    if (fire) { G.sfx('click'); b._scale = 1.12; G.tween(b, { _scale: 1 }, 0.25, 'outBack'); }
    return fire;
  }
  // 绘制（draw 里）：UI.drawButton(ctx, this.btnPlay)
  function drawButton(ctx, b) {
    const T = theme();
    b._drawn = G.frame; G._btns && G._btns.push(b);
    if (b._born) { b._born = false; G.tween(b, { _scale: 1 }, 0.35, 'outBack'); }
    // 次按钮：霓虹用文字色描边；其它风格在 bg2 上略向文字色偏移，保证放在面板上也看得见
    const sec = T.hollow ? T.c.text : mix(T.c.bg2, T.c.text, 0.12);
    const base = { primary: T.c.primary, secondary: sec, danger: T.c.danger, icon: sec }[b.kind] || T.c.primary;
    const fill = b.color || base, pressed = b._down, isIcon = b.kind === 'icon';
    const lip = T.lip ? (isIcon ? T.lip * 0.7 : T.lip) : 0, push = pressed ? lip * 0.8 : 0;
    const w = b.w, h = b.h, r = isIcon ? h / 2 : T.radius;
    ctx.save();
    ctx.translate(b.x, b.y);
    const s = b._scale * (pressed && !lip ? 0.94 : 1); ctx.scale(s, s);
    if (!b.enabled) ctx.globalAlpha *= 0.45;
    const L = -w / 2, Tp = -h / 2 - lip / 2 + push;
    if (T.hollow) {
      rrPath(ctx, L, -h / 2, w, h, r);
      ctx.fillStyle = alpha(fill, pressed ? 0.35 : 0.12); ctx.fill();
      ctx.shadowColor = fill; ctx.shadowBlur = T.glow; ctx.strokeStyle = fill; ctx.lineWidth = T.outline; ctx.stroke(); ctx.shadowBlur = 0;
    } else {
      if (lip) { rrPath(ctx, L, -h / 2 + lip / 2, w, h, r); ctx.fillStyle = shade(fill, -0.35); ctx.fill(); if (T.outline) { ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.outline; ctx.stroke(); } }
      if (T.drop) { rrPath(ctx, L, -h / 2 + (pressed ? 3 : T.drop), w, h, r); ctx.fillStyle = alpha(T.c.ink, 0.25); ctx.fill(); }
      rrPath(ctx, L, lip ? Tp : -h / 2, w, h, r);
      ctx.fillStyle = pressed && !lip ? shade(fill, -0.1) : fill; ctx.fill();
      if (T.outline) { ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.outline; ctx.stroke(); }
      if (T.gloss) { rrPath(ctx, L + 12, (lip ? Tp : -h / 2) + 8, w - 24, h * 0.3, r * 0.6); ctx.fillStyle = alpha('#ffffff', 0.25); ctx.fill(); }
    }
    const cy = (lip ? Tp + h / 2 : 0);
    const fg = T.hollow ? fill : (isLight(fill) ? T.c.ink : '#ffffff');
    if (isIcon) icon(ctx, b.icon, 0, cy, h * 0.46, fg);
    else {
      const size = b.size || (h >= 100 ? 44 : 36);
      const tw = measure(ctx, b.label, { size }), iw = b.icon ? size * 1.1 + 14 : 0, start = -(tw + iw) / 2;
      if (b.icon) icon(ctx, b.icon, start + size * 0.55, cy, size * 1.0, fg);
      text(ctx, b.label, start + iw + tw / 2, cy, { size, color: fg, weight: T.weight, plain: true });
    }
    ctx.restore();
  }

  // ---------------- HUD ----------------
  // 大号分数（顶部居中）。scale 传弹跳动画值
  // UI.score(ctx, 12, G.W/2, UI.HUD_Y, { scale: this.scorePop.s, label: '分数' })
  function score(ctx, value, x, y, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(o.scale || 1, o.scale || 1);
    if (o.label) text(ctx, o.label, 0, -60, { role: 'caption', color: theme().c.dim, plain: true });
    text(ctx, value, 0, 0, { role: 'hud', color: o.color });
    ctx.restore();
  }
  // 信息胶囊（金币、关卡、时间）。注意：x 是【左边缘】(align:'left') 或【右边缘】(align:'right')，y 是中心
  // UI.pill(ctx, UI.M, UI.HUD_Y, { icon:'coin', text:'12', align:'left', color })
  function pill(ctx, x, y, o = {}) {
    const T = theme(), h = o.h || 72, size = 36, iconW = o.icon ? h - 12 : 0;
    const tw = measure(ctx, o.text ?? '', { size, weight: 800 }), w = Math.max(h * 1.6, tw + iconW + 48);
    const L = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
    const ic = o.color || T.c.primary;
    ctx.save();
    rrPath(ctx, L, y - h / 2, w, h, h / 2);
    if (T.hollow) { ctx.fillStyle = alpha(T.c.bg, 0.7); ctx.fill(); ctx.strokeStyle = alpha(ic, 0.8); ctx.lineWidth = 3; ctx.stroke(); }
    else { ctx.fillStyle = alpha(T.c.ink, isLight(T.c.bg) ? 0.12 : 0.45); ctx.fill(); }
    if (o.icon) {
      D.circle(ctx, L + h / 2, y, h / 2 - 6, T.hollow ? alpha(ic, 0.2) : ic);
      icon(ctx, o.icon, L + h / 2, y, h * 0.5, T.hollow ? ic : (isLight(ic) ? T.c.ink : '#ffffff'));
    }
    text(ctx, o.text ?? '', L + iconW + (w - iconW) / 2, y, { size, weight: 800, color: o.textColor || (isLight(T.c.bg) ? T.c.text : '#ffffff'), plain: true });
    ctx.restore();
    return w;
  }
  // 进度条/血条/时间条：x,y 中心
  // UI.bar(ctx, G.W/2, 200, 400, 28, 0.7, { color, label:'HP' })
  function bar(ctx, x, y, w, h, ratio, o = {}) {
    const T = theme(), color = o.color || T.c.good, L = x - w / 2, r = h / 2;
    ratio = Math.max(0, Math.min(1, ratio));
    ctx.save();
    rrPath(ctx, L, y - h / 2, w, h, r); ctx.fillStyle = alpha(T.c.ink, isLight(T.c.bg) ? 0.15 : 0.5); ctx.fill();
    if (ratio > 0) {
      const fw = Math.max(h, w * ratio);
      rrPath(ctx, L, y - h / 2, fw, h, r);
      if (T.hollow) { ctx.shadowColor = color; ctx.shadowBlur = T.glow * 0.6; }
      ctx.fillStyle = color; ctx.fill(); ctx.shadowBlur = 0;
      if (T.gloss) { rrPath(ctx, L + 4, y - h / 2 + 3, fw - 8, h * 0.35, r * 0.5); ctx.fillStyle = alpha('#ffffff', 0.3); ctx.fill(); }
    }
    if (T.outline) { rrPath(ctx, L, y - h / 2, w, h, r); ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.outline * 0.7; ctx.stroke(); }
    if (o.label) text(ctx, o.label, x, y, { size: Math.max(20, h * 0.7), plain: true, weight: 800 });
    ctx.restore();
  }
  // 一排图标：生命（heart）或评级（star）。x,y 为整排中心
  function icons(ctx, name, x, y, n, max, size = 56, color) {
    const T = theme(), gap = size * 0.25, total = max * size + (max - 1) * gap;
    for (let i = 0; i < max; i++) {
      const cx = x - total / 2 + size / 2 + i * (size + gap), on = i < n;
      const col = on ? color || (name === 'heart' ? T.c.danger : T.c.primary) : alpha(T.c.dim, 0.5);
      if (T.textStroke && on) icon(ctx, name, cx, y + 3, size * 1.15, T.c.ink);
      icon(ctx, name, cx, y, size, col);
    }
  }
  const hearts = (ctx, x, y, n, max, size) => icons(ctx, 'heart', x, y, n, max, size);
  const stars = (ctx, x, y, n, max = 3, size = 72) => icons(ctx, 'star', x, y, n, max, size);

  // 横幅（"第 3 关"、"加速!"）：横跨屏幕的色带
  // UI.banner(ctx, '第 3 关', G.H/2, { color, alpha })
  function banner(ctx, str, y, o = {}) {
    const T = theme(), color = o.color || T.c.primary, h = o.h || 130;
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
    if (T.hollow) { ctx.fillStyle = alpha(T.c.bg, 0.85); ctx.fillRect(0, y - h / 2, G.W, h); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = T.glow; ctx.fillRect(0, y - h / 2, G.W, 4); ctx.fillRect(0, y + h / 2 - 4, G.W, 4); ctx.shadowBlur = 0; }
    else { ctx.fillStyle = color; ctx.fillRect(0, y - h / 2, G.W, h); if (T.outline) { ctx.fillStyle = T.c.ink; ctx.fillRect(0, y - h / 2, G.W, T.outline); ctx.fillRect(0, y + h / 2 - T.outline, G.W, T.outline); } }
    text(ctx, str, G.W / 2, y, { role: 'h1', color: T.hollow ? color : (isLight(color) ? T.c.ink : '#ffffff'), plain: !T.textStroke || isLight(color) });
    ctx.restore();
  }

  // ---------------- 图标（矢量绘制） ----------------
  // 可用：play pause restart home sound mute heart star coin trophy lock check close
  //       left right up down clock bolt gear menu
  function icon(ctx, name, x, y, size, color, rot = 0) {
    const s = size / 2;
    ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot);
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, size * 0.12); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const hole = (r, cx = 0, cy = 0) => { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, Math.PI * 2); };
    const P = (pts, fill = true) => { ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px * s, py * s) : ctx.moveTo(px * s, py * s))); if (fill) { ctx.closePath(); ctx.fill(); } else ctx.stroke(); };
    switch (name) {
      case 'play': P([[-0.55, -0.75], [0.8, 0], [-0.55, 0.75]]); break;
      case 'pause': rrPath(ctx, -0.65 * s, -0.75 * s, 0.45 * s, 1.5 * s, 0.12 * s); ctx.fill(); rrPath(ctx, 0.2 * s, -0.75 * s, 0.45 * s, 1.5 * s, 0.12 * s); ctx.fill(); break;
      case 'restart':
        ctx.beginPath(); ctx.arc(0, 0, 0.65 * s, -Math.PI * 0.35, Math.PI * 1.45); ctx.stroke();
        { const a = -Math.PI * 0.35, ex = Math.cos(a) * 0.65 * s, ey = Math.sin(a) * 0.65 * s;
          ctx.beginPath(); ctx.moveTo(ex + 0.38 * s, ey - 0.05 * s); ctx.lineTo(ex - 0.05 * s, ey - 0.42 * s); ctx.lineTo(ex - 0.12 * s, ey + 0.2 * s); ctx.closePath(); ctx.fill(); }
        break;
      case 'home': P([[0, -0.85], [0.85, -0.05], [0.6, -0.05], [0.6, 0.8], [0.15, 0.8], [0.15, 0.3], [-0.15, 0.3], [-0.15, 0.8], [-0.6, 0.8], [-0.6, -0.05], [-0.85, -0.05]]); break;
      case 'sound': case 'mute':
        P([[-0.85, -0.3], [-0.4, -0.3], [0.1, -0.75], [0.1, 0.75], [-0.4, 0.3], [-0.85, 0.3]]);
        if (name === 'sound') { ctx.beginPath(); ctx.arc(0.15 * s, 0, 0.4 * s, -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(0.15 * s, 0, 0.75 * s, -0.9, 0.9); ctx.stroke(); }
        else { P([[0.35, -0.35], [0.85, 0.35]], false); P([[0.85, -0.35], [0.35, 0.35]], false); }
        break;
      case 'heart':
        ctx.beginPath(); ctx.moveTo(0, 0.8 * s);
        ctx.bezierCurveTo(-1.1 * s, 0, -0.9 * s, -0.95 * s, 0, -0.4 * s);
        ctx.bezierCurveTo(0.9 * s, -0.95 * s, 1.1 * s, 0, 0, 0.8 * s); ctx.fill(); break;
      case 'star': {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = (i % 2 ? 0.42 : 0.95) * s; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); break;
      }
      case 'coin': ctx.beginPath(); hole(0.85 * s); hole(0.62 * s); hole(0.48 * s); ctx.fill('evenodd'); break;
      case 'trophy':
        P([[-0.65, -0.8], [0.65, -0.8], [0.55, -0.1], [0.15, 0.2], [0.15, 0.45], [0.45, 0.6], [0.45, 0.85], [-0.45, 0.85], [-0.45, 0.6], [-0.15, 0.45], [-0.15, 0.2], [-0.55, -0.1]]);
        ctx.lineWidth = 0.14 * s; ctx.beginPath(); ctx.arc(-0.65 * s, -0.4 * s, 0.25 * s, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(0.65 * s, -0.4 * s, 0.25 * s, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke(); break;
      case 'lock': rrPath(ctx, -0.65 * s, -0.1 * s, 1.3 * s, 0.95 * s, 0.15 * s); ctx.fill(); ctx.lineWidth = 0.18 * s;
        ctx.beginPath(); ctx.arc(0, -0.15 * s, 0.4 * s, Math.PI, 0); ctx.stroke(); break;
      case 'check': P([[-0.65, 0], [-0.2, 0.5], [0.7, -0.55]], false); break;
      case 'close': P([[-0.6, -0.6], [0.6, 0.6]], false); P([[0.6, -0.6], [-0.6, 0.6]], false); break;
      case 'left': P([[0.35, -0.7], [-0.35, 0], [0.35, 0.7]], false); break;
      case 'right': P([[-0.35, -0.7], [0.35, 0], [-0.35, 0.7]], false); break;
      case 'up': P([[-0.7, 0.35], [0, -0.35], [0.7, 0.35]], false); break;
      case 'down': P([[-0.7, -0.35], [0, 0.35], [0.7, -0.35]], false); break;
      case 'clock': ctx.beginPath(); ctx.arc(0, 0, 0.8 * s, 0, Math.PI * 2); ctx.stroke(); P([[0, -0.5], [0, 0], [0.35, 0.2]], false); break;
      case 'bolt': P([[0.15, -0.9], [-0.55, 0.1], [-0.05, 0.1], [-0.2, 0.9], [0.55, -0.15], [0.05, -0.15]]); break;
      case 'gear': {
        ctx.beginPath();
        for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8, r = (i % 2 ? 0.62 : 0.88) * s; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); hole(0.3 * s); ctx.fill('evenodd'); break;
      }
      case 'fire':
        ctx.beginPath(); ctx.moveTo(0, -0.95 * s);
        ctx.bezierCurveTo(0.35 * s, -0.5 * s, 0.8 * s, -0.2 * s, 0.7 * s, 0.3 * s);
        ctx.bezierCurveTo(0.6 * s, 0.75 * s, 0.3 * s, 0.9 * s, 0, 0.9 * s);
        ctx.bezierCurveTo(-0.3 * s, 0.9 * s, -0.65 * s, 0.7 * s, -0.7 * s, 0.3 * s);
        ctx.bezierCurveTo(-0.75 * s, -0.05 * s, -0.45 * s, -0.25 * s, -0.35 * s, -0.55 * s);
        ctx.bezierCurveTo(-0.15 * s, -0.3 * s, -0.1 * s, -0.6 * s, 0, -0.95 * s); ctx.closePath();
        ctx.moveTo(0, 0.05 * s); ctx.bezierCurveTo(0.35 * s, 0.35 * s, 0.3 * s, 0.75 * s, 0, 0.75 * s); ctx.bezierCurveTo(-0.3 * s, 0.75 * s, -0.35 * s, 0.35 * s, 0, 0.05 * s); ctx.closePath();
        ctx.fill('evenodd'); break;
      case 'bomb':
        ctx.beginPath(); ctx.arc(-0.1 * s, 0.15 * s, 0.68 * s, 0, Math.PI * 2); ctx.fill();
        rrPath(ctx, 0.2 * s, -0.7 * s, 0.4 * s, 0.35 * s, 0.06 * s); ctx.fill();
        ctx.lineWidth = Math.max(2, size * 0.07); ctx.beginPath(); ctx.moveTo(0.45 * s, -0.7 * s); ctx.quadraticCurveTo(0.6 * s, -1.0 * s, 0.85 * s, -0.85 * s); ctx.stroke(); break;
      case 'scissors':
        ctx.lineWidth = Math.max(3, size * 0.1);
        ctx.beginPath(); ctx.arc(-0.45 * s, 0.5 * s, 0.25 * s, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0.45 * s, 0.5 * s, 0.25 * s, 0, Math.PI * 2); ctx.stroke();
        P([[-0.3, 0.3], [0.55, -0.85]], false); P([[0.3, 0.3], [-0.55, -0.85]], false); break;
      case 'key':
        ctx.lineWidth = Math.max(3, size * 0.12);
        ctx.beginPath(); ctx.arc(-0.45 * s, 0, 0.32 * s, 0, Math.PI * 2); ctx.stroke();
        P([[-0.13, 0], [0.85, 0]], false); P([[0.55, 0], [0.55, 0.35]], false); P([[0.8, 0], [0.8, 0.3]], false); break;
      case 'flag':
        P([[-0.55, -0.85], [-0.55, 0.9]], false);
        P([[-0.5, -0.8], [0.75, -0.5], [-0.5, -0.1]]); break;
      case 'undo':
        ctx.beginPath(); ctx.arc(0.05 * s, 0.15 * s, 0.6 * s, Math.PI * 1.15, Math.PI * 2.75); ctx.stroke();
        P([[-0.85, -0.55], [-0.25, -0.55], [-0.55, 0.05]]); break;
      case 'eye':
        ctx.beginPath(); ctx.moveTo(-0.9 * s, 0); ctx.quadraticCurveTo(0, -0.85 * s, 0.9 * s, 0); ctx.quadraticCurveTo(0, 0.85 * s, -0.9 * s, 0); ctx.closePath();
        hole(0.3 * s); ctx.fill('evenodd'); break;
      case 'warn':   // 实心三角 + 镂空感叹号：危险预警
        ctx.beginPath(); ctx.moveTo(0, -0.9 * s); ctx.lineTo(0.95 * s, 0.75 * s); ctx.lineTo(-0.95 * s, 0.75 * s); ctx.closePath();
        ctx.rect(-0.09 * s, -0.4 * s, 0.18 * s, 0.68 * s); hole(0.11 * s, 0, 0.5 * s); ctx.fill('evenodd'); break;
      case 'arrow':  // 实心箭头，默认朝上；配合第 7 个参数旋转指向任意方向
        P([[0, -0.9], [0.75, 0], [0.28, 0], [0.28, 0.85], [-0.28, 0.85], [-0.28, 0], [-0.75, 0]]); break;
      case 'menu': P([[-0.65, -0.5], [0.65, -0.5]], false); P([[-0.65, 0], [0.65, 0]], false); P([[-0.65, 0.5], [0.65, 0.5]], false); break;
      default: ctx.beginPath(); ctx.arc(0, 0, 0.5 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // 环形进度（冷却、计时、蓄力）：UI.ring(ctx, x, y, r, 0..1, { color, width, back:true })
  function ring(ctx, x, y, r, ratio, o = {}) {
    const T = theme(), color = o.color || T.c.primary, w = o.width || Math.max(6, r * 0.18);
    ratio = Math.max(0, Math.min(1, ratio));
    ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = w;
    if (o.back !== false) { ctx.strokeStyle = alpha(T.c.ink, isLight(T.c.bg) ? 0.15 : 0.45); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); }
    if (ratio > 0) {
      if (T.hollow) { ctx.shadowColor = color; ctx.shadowBlur = T.glow * 0.6; }
      ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  // ---------------- 布局 ----------------
  // 竖屏 720×1280 推荐分区（横屏自动按 G.W/G.H 计算）
  const layout = {
    get M() { return 40; },                 // 屏幕边距：任何 UI 不得进入
    get HUD_Y() { return 90; },             // 顶部 HUD 中心线（分数、暂停按钮、胶囊）
    get HUD_BOTTOM() { return 160; },       // HUD 区下边界：游戏对象尽量不进入 HUD 区
    get ACTION_Y() { return G.H - 220; },   // 底部主按钮中心线（拇指区）
    // 竖向等距排列：返回 n 个中心 y。UI.stack(中心y, 数量, 间距)
    stack(cy, n, gap) { return Array.from({ length: n }, (_, i) => cy + (i - (n - 1) / 2) * gap); },
    // 横向等距排列：返回 n 个中心 x
    row(cx, n, gap) { return Array.from({ length: n }, (_, i) => cx + (i - (n - 1) / 2) * gap); },
    // 网格排列（选关页、背包格）：返回 n 个 {x, y, i, col, row}，整体以 (cx, cy) 为中心，最后一行不满时自动居中
    // UI.grid(G.W/2, 560, LEVELS.length, 4, 150, 170)
    grid(cx, cy, n, cols, gapX, gapY = gapX) {
      const rows = Math.ceil(n / cols), out = [];
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols), c = i % cols, inRow = r === rows - 1 ? n - r * cols : cols;
        out.push({ x: cx + (c - (inRow - 1) / 2) * gapX, y: cy + (r - (rows - 1) / 2) * gapY, i, col: c, row: r });
      }
      return out;
    },
  };

  window.UI = Object.assign(layout, {
    STYLES, TYPE, theme,
    shade, alpha, mix, luminance, isLight,
    text, title, measure, panel, overlay,
    button, clicked, drawButton,
    score, pill, bar, ring, hearts, stars, icons, banner, icon,
  });
})();
