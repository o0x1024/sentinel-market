/* =====================================================================
 * mini-engine — 给 H5 小游戏用的微型引擎（单文件、零依赖、可 file:// 直接打开）
 * 完整 API 见 references/engine-api.md。不要修改本文件，游戏代码写在 game.js。
 * 全局：Engine, U(工具), D(绘制)
 * ===================================================================== */
(function () {
  'use strict';

  // ---------------- U: 数学/工具 ----------------
  const U = {
    rand: (a = 0, b = 1) => a + Math.random() * (b - a),
    randInt: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    chance: (p) => Math.random() < p,
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    // 帧率无关的平滑跟随：U.damp(cur, target, 10, dt)
    damp: (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)),
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
    // 圆与圆相交：a,b 都需要 x,y,r
    circleHit: (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2 < (a.r + b.r) ** 2,
    // 矩形相交：a,b 都需要 x,y,w,h（x,y 为左上角）
    rectHit: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
    // 点是否在矩形内（按钮点击判断）
    pointInRect: (px, py, r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h,
    // 原地删除 dead=true 的元素
    removeDead: (arr) => {
      let j = 0;
      for (let i = 0; i < arr.length; i++) if (!arr[i].dead) arr[j++] = arr[i];
      arr.length = j;
      return arr;
    },
    shuffle: (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  };

  // 缓动函数，t ∈ [0,1]
  const Ease = {
    linear: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    outBack: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    outElastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
    outBounce: (t) => {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
      return n * (t -= 2.625 / d) * t + 0.984375;
    },
  };
  U.ease = Ease;

  // ---------------- D: 绘制工具（ctx 已是逻辑坐标） ----------------
  const FONT = 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
  const D = {
    clear(ctx, color, w, h) { ctx.fillStyle = color; ctx.fillRect(0, 0, w, h); },
    circle(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); ctx.fill(); },
    ring(ctx, x, y, r, color, width = 2) { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); ctx.stroke(); },
    rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); },
    roundRect(ctx, x, y, w, h, r, color) {
      ctx.fillStyle = color; ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
    },
    line(ctx, x1, y1, x2, y2, color, width = 2) { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); },
    // 正多边形：sides=3 三角形, 6 六边形；rot 弧度
    poly(ctx, x, y, r, sides, rot, color) {
      ctx.fillStyle = color; ctx.beginPath();
      for (let i = 0; i < sides; i++) { const a = rot + (i / sides) * Math.PI * 2; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      ctx.closePath(); ctx.fill();
    },
    // opts: {size, color, align:'center'|'left'|'right', baseline:'middle', weight:'bold', alpha, shadow}
    text(ctx, str, x, y, opts = {}) {
      ctx.save();
      ctx.globalAlpha *= opts.alpha ?? 1;
      ctx.font = `${opts.weight || 'bold'} ${opts.size || 32}px ${FONT}`;
      ctx.textAlign = opts.align || 'center';
      ctx.textBaseline = opts.baseline || 'middle';
      if (opts.shadow) { ctx.fillStyle = opts.shadow; ctx.fillText(str, x + 3, y + 3); }
      ctx.fillStyle = opts.color || '#fff';
      ctx.fillText(str, x, y);
      ctx.restore();
    },
    // 带缩放/旋转/透明度绘制：D.withTransform(ctx, x, y, {scale, rot, alpha}, () => {...在(0,0)画})
    withTransform(ctx, x, y, t, fn) {
      ctx.save(); ctx.translate(x, y);
      if (t.rot) ctx.rotate(t.rot);
      if (t.scale !== undefined) ctx.scale(t.scaleX ?? t.scale, t.scaleY ?? t.scale);
      if (t.alpha !== undefined) ctx.globalAlpha *= t.alpha;
      fn(); ctx.restore();
    },
  };

  // ---------------- 音效（WebAudio 合成，无需素材） ----------------
  function createAudio() {
    let ac = null, master = null, muted = false, volume = 0.5;
    function ensure() {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ac = new AC(); master = ac.createGain(); master.gain.value = volume; master.connect(ac.destination);
      }
      if (ac.state === 'suspended') ac.resume();
      return ac;
    }
    // tone({freq, to, dur, type:'sine'|'square'|'triangle'|'sawtooth', vol, delay})
    function tone(o) {
      if (muted || !ensure()) return;
      const t0 = ac.currentTime + (o.delay || 0), dur = o.dur || 0.1;
      const osc = ac.createOscillator(), g = ac.createGain();
      osc.type = o.type || 'square';
      osc.frequency.setValueAtTime(o.freq || 440, t0);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.to), t0 + dur);
      g.gain.setValueAtTime(o.vol ?? 0.3, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(master); osc.start(t0); osc.stop(t0 + dur + 0.02);
    }
    function noise(o = {}) {
      if (muted || !ensure()) return;
      const dur = o.dur || 0.3, t0 = ac.currentTime + (o.delay || 0);
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = o.cutoff || 1800;
      g.gain.value = o.vol ?? 0.4;
      src.buffer = buf; src.connect(f); f.connect(g); g.connect(master); src.start(t0);
    }
    // 预设音效。pitch 可做随机变化：sfx('hit', {pitch: U.rand(0.9,1.1)})
    const presets = {
      click: (p) => tone({ freq: 660 * p, dur: 0.05, type: 'square', vol: 0.15 }),
      jump: (p) => tone({ freq: 300 * p, to: 700 * p, dur: 0.15, type: 'square', vol: 0.2 }),
      coin: (p) => { tone({ freq: 988 * p, dur: 0.07, type: 'square', vol: 0.2 }); tone({ freq: 1319 * p, dur: 0.15, type: 'square', vol: 0.2, delay: 0.07 }); },
      hit: (p) => { tone({ freq: 200 * p, to: 60, dur: 0.15, type: 'sawtooth', vol: 0.3 }); noise({ dur: 0.1, vol: 0.2 }); },
      explode: () => noise({ dur: 0.5, vol: 0.5, cutoff: 1000 }),
      shoot: (p) => tone({ freq: 900 * p, to: 200 * p, dur: 0.1, type: 'square', vol: 0.15 }),
      powerup: (p) => [0, 1, 2, 3].forEach((i) => tone({ freq: (440 + i * 220) * p, dur: 0.08, type: 'triangle', vol: 0.25, delay: i * 0.06 })),
      lose: (p) => [0, 1, 2].forEach((i) => tone({ freq: (400 - i * 100) * p, dur: 0.2, type: 'triangle', vol: 0.3, delay: i * 0.15 })),
      win: (p) => [0, 1, 2, 3, 4].forEach((i) => tone({ freq: [523, 659, 784, 1047, 1319][i] * p, dur: 0.12, type: 'square', vol: 0.2, delay: i * 0.08 })),
      blip: (p) => tone({ freq: 520 * p, dur: 0.04, type: 'sine', vol: 0.2 }),
    };
    return {
      unlock: ensure,
      tone, noise,
      sfx(name, opts = {}) { const f = presets[name]; if (f) f(opts.pitch || 1); else console.warn('未知音效: ' + name); },
      get muted() { return muted; },
      set muted(v) { muted = !!v; },
      setVolume(v) { volume = v; if (master) master.gain.value = v; },
      presets,
    };
  }

  // ---------------- 输入（键盘 + 鼠标 + 触屏统一） ----------------
  function createInput(canvas, toLogical) {
    const down = new Set(), pressed = new Set(), released = new Set();
    let actions = {
      left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
      up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
      action: ['Space', 'Enter', 'KeyZ', 'KeyJ'], cancel: ['Escape', 'KeyX', 'KeyP'],
    };
    const pointer = { x: 0, y: 0, down: false, pressed: false, released: false, startX: 0, startY: 0, swipe: null };
    let anyFlag = false;

    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (!down.has(e.code)) { pressed.add(e.code); anyFlag = true; }
      down.add(e.code);
    });
    window.addEventListener('keyup', (e) => { down.delete(e.code); released.add(e.code); });
    window.addEventListener('blur', () => down.clear());

    function setPos(e) { const p = toLogical(e.clientX, e.clientY); pointer.x = p.x; pointer.y = p.y; }
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault(); setPos(e);
      pointer.down = true; pointer.pressed = true; anyFlag = true;
      pointer.startX = pointer.x; pointer.startY = pointer.y;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    });
    canvas.addEventListener('pointermove', (e) => { setPos(e); });
    const up = (e) => {
      setPos(e);
      if (!pointer.down) return;
      pointer.down = false; pointer.released = true;
      const dx = pointer.x - pointer.startX, dy = pointer.y - pointer.startY;
      if (Math.hypot(dx, dy) > 40) pointer.swipe = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    const codesOf = (name) => actions[name] || [name];
    return {
      pointer,
      // 绑定/覆盖动作：G.input.bind({ jump: ['Space','KeyW'] })
      bind(map) { actions = Object.assign({}, actions, map); },
      down: (name) => codesOf(name).some((c) => down.has(c)),
      pressed: (name) => codesOf(name).some((c) => pressed.has(c)),
      released: (name) => codesOf(name).some((c) => released.has(c)),
      // 本帧是否有任意按键或点击（"点击任意处开始"）
      anyPressed: () => anyFlag,
      // 本帧是否点击/触摸
      get tapped() { return pointer.pressed; },
      // 水平轴 -1/0/1（键盘）
      axisX() { return (this.down('right') ? 1 : 0) - (this.down('left') ? 1 : 0); },
      axisY() { return (this.down('down') ? 1 : 0) - (this.down('up') ? 1 : 0); },
      _endFrame() { pressed.clear(); released.clear(); pointer.pressed = false; pointer.released = false; pointer.swipe = null; anyFlag = false; },
    };
  }

  // ---------------- Engine ----------------
  function create(opts = {}) {
    const W = opts.width || 720, H = opts.height || 1280;
    const bg = opts.background || '#111';
    const parent = opts.parent || document.body;

    document.documentElement.style.cssText += ';height:100%;background:' + (opts.pageBackground || '#000');
    document.body.style.cssText += ';margin:0;height:100%;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;position:fixed;inset:0;width:100%;height:100%;touch-action:none';
    parent.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let scale = 1, offX = 0, offY = 0, dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = window.innerWidth, ch = window.innerHeight;
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      scale = Math.min(cw / W, ch / H);
      offX = (cw - W * scale) / 2; offY = (ch - H * scale) / 2;
    }
    window.addEventListener('resize', resize);
    resize();
    const toLogical = (cx, cy) => { const r = canvas.getBoundingClientRect(); return { x: (cx - r.left - offX) / scale, y: (cy - r.top - offY) / scale }; };

    const scenes = {};
    let current = null, currentName = null, pendingGo = null;
    let tweens = [], timers = [], particles = [];
    let shakeT = 0, shakeDur = 0, shakeMag = 0, hitstopT = 0, flashT = 0, flashDur = 0, flashColor = '#fff';
    let fadeT = 0; const FADE = 0.25;
    let paused = false, last = 0, frame = 0, time = 0;
    const errors = [];

    const G = {
      W, H, canvas, ctx,
      input: null,
      audio: createAudio(),
      get time() { return time; },
      get frame() { return frame; },
      get scene() { return currentName; },
      // 游戏自定义的调试状态（smoke-test 会读取），例如 G.debug.score = 10
      debug: {},

      // 注册场景：{ enter(data), update(dt), draw(ctx), exit() }，都可选
      scene(name, def) { scenes[name] = def; return G; },
      // 切换场景（下一帧生效，会清空 tween/timer/粒子）
      go(name, data) { if (!scenes[name]) throw new Error('场景不存在: ' + name); pendingGo = { name, data }; },
      start(name, data) { G.go(name, data); requestAnimationFrame(loop); },

      // 补间：G.tween(obj, {x:100, alpha:0}, 0.3, 'outBack').then(fn)
      tween(obj, props, dur, ease = 'outQuad', delay = 0) {
        const from = {}; for (const k in props) from[k] = obj[k];
        const tw = { obj, from, to: props, dur: Math.max(0.0001, dur), t: -delay, ease: typeof ease === 'function' ? ease : Ease[ease] || Ease.linear, cb: null, dead: false };
        tw.then = (fn) => { tw.cb = fn; return tw; };
        tw.cancel = () => { tw.dead = true; };
        tweens.push(tw); return tw;
      },
      // 延时 / 循环计时器（游戏时间，受暂停与 hitstop 影响）
      after(sec, fn) { const t = { t: sec, fn, repeat: 0, dead: false, cancel() { this.dead = true; } }; timers.push(t); return t; },
      every(sec, fn) { const t = { t: sec, fn, repeat: sec, dead: false, cancel() { this.dead = true; } }; timers.push(t); return t; },

      // 粒子爆发：G.burst(x, y, {count:12, color:'#ff0'|[...], speed:300, life:0.6, size:6, gravity:0, spread:Math.PI*2, angle:0, shrink:true})
      burst(x, y, o = {}) {
        const n = o.count ?? 12;
        for (let i = 0; i < n; i++) {
          const a = (o.angle ?? 0) + (Math.random() - 0.5) * (o.spread ?? Math.PI * 2);
          const sp = (o.speed ?? 300) * U.rand(0.3, 1);
          const life = (o.life ?? 0.6) * U.rand(0.6, 1);
          particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, size: (o.size ?? 6) * U.rand(0.6, 1.2),
            color: Array.isArray(o.color) ? U.pick(o.color) : o.color || '#fff', g: o.gravity ?? 0, drag: o.drag ?? 2, shrink: o.shrink ?? true, shape: o.shape || 'circle' });
        }
      },
      shake(mag = 10, dur = 0.2) { if (mag >= shakeMag * (shakeT / (shakeDur || 1))) { shakeMag = mag; shakeDur = dur; shakeT = dur; } },
      hitstop(sec = 0.06) { hitstopT = Math.max(hitstopT, sec); },
      flash(color = '#fff', dur = 0.12) { flashColor = color; flashDur = dur; flashT = dur; },
      sfx(name, opts) { G.audio.sfx(name, opts); },

      // 本地存档（自动 JSON）。key 会加前缀避免冲突
      save(key, val) { try { localStorage.setItem((opts.id || 'game') + ':' + key, JSON.stringify(val)); } catch (_) {} },
      load(key, def) { try { const v = localStorage.getItem((opts.id || 'game') + ':' + key); return v === null ? def : JSON.parse(v); } catch (_) { return def; } },

      get paused() { return paused; },
      set paused(v) { paused = !!v; },
    };
    G.input = createInput(canvas, toLogical);
    canvas.addEventListener('pointerdown', () => G.audio.unlock(), { once: false });
    window.addEventListener('keydown', () => G.audio.unlock());
    document.addEventListener('visibilitychange', () => { if (document.hidden) paused = true; });

    // 错误直接画在屏幕上，方便发现问题
    function reportError(msg) { errors.push(String(msg)); console.error(msg); }
    window.addEventListener('error', (e) => reportError(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
    window.addEventListener('unhandledrejection', (e) => reportError('Promise: ' + (e.reason && e.reason.message || e.reason)));

    function safe(fn, label) { try { fn(); } catch (e) { reportError(label + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e)); } }

    function step(dt) {
      if (pendingGo) {
        const { name, data } = pendingGo; pendingGo = null;
        if (current && current.exit) safe(() => current.exit(), currentName + '.exit');
        tweens = []; timers = []; particles = []; shakeT = 0; hitstopT = 0;
        current = scenes[name]; currentName = name; fadeT = FADE;
        if (current.enter) safe(() => current.enter(data || {}), name + '.enter');
      }
      if (paused) {
        if (G.input.anyPressed()) paused = false;
        return;
      }
      if (hitstopT > 0) { hitstopT -= dt; return; }
      time += dt;
      if (current && current.update) safe(() => current.update(dt), currentName + '.update');
      for (const tw of tweens) {
        if (tw.dead) continue;
        tw.t += dt; if (tw.t < 0) continue;
        const k = Math.min(1, tw.t / tw.dur), e = tw.ease(k);
        for (const p in tw.to) tw.obj[p] = tw.from[p] + (tw.to[p] - tw.from[p]) * e;
        if (k >= 1) { tw.dead = true; if (tw.cb) safe(tw.cb, 'tween.then'); }
      }
      U.removeDead(tweens);
      for (const t of timers.slice()) {
        if (t.dead) continue;
        t.t -= dt;
        if (t.t <= 0) { safe(t.fn, 'timer'); if (t.repeat > 0) t.t += t.repeat; else t.dead = true; }
      }
      U.removeDead(timers);
      for (const p of particles) {
        p.vy += p.g * dt; p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0) p.dead = true;
      }
      U.removeDead(particles);
      if (shakeT > 0) shakeT -= dt;
      if (flashT > 0) flashT -= dt;
      if (fadeT > 0) fadeT -= dt;
    }

    function render() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = opts.pageBackground || '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      let sx = 0, sy = 0;
      if (shakeT > 0) { const m = shakeMag * (shakeT / shakeDur); sx = U.rand(-m, m); sy = U.rand(-m, m); }
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * (offX + sx * scale), dpr * (offY + sy * scale));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      if (current && current.draw) safe(() => { ctx.save(); current.draw(ctx); ctx.restore(); }, currentName + '.draw');
      for (const p of particles) {
        const k = p.life / p.max, s = p.shrink ? p.size * k : p.size;
        ctx.globalAlpha = Math.min(1, k * 1.5); ctx.fillStyle = p.color;
        if (p.shape === 'square') ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        else { ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, s / 2), 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      if (flashT > 0) { ctx.globalAlpha = (flashT / flashDur) * 0.6; ctx.fillStyle = flashColor; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (fadeT > 0) { ctx.globalAlpha = fadeT / FADE; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
        D.text(ctx, '已暂停 · 点击继续', W / 2, H / 2, { size: 40 });
      }
      if (errors.length) {
        ctx.fillStyle = 'rgba(160,0,0,0.85)'; ctx.fillRect(0, 0, W, 40);
        D.text(ctx, '错误: ' + errors[errors.length - 1].slice(0, 80), 10, 20, { size: 16, align: 'left', weight: 'normal' });
      }
      ctx.restore();
    }

    function loop(ts) {
      const dt = last ? Math.min((ts - last) / 1000, 1 / 30) : 1 / 60;
      last = ts; frame++;
      step(dt);
      render();
      G.input._endFrame();
      window.__GAME__ = { W, H, scene: currentName, frame, time, paused, errors, debug: G.debug, particles: particles.length };
      requestAnimationFrame(loop);
    }

    return G;
  }

  window.Engine = { create, Ease };
  window.U = U;
  window.D = D;
})();
