/* =====================================================================
 * 示例游戏《绕圈》：玩家绕中心旋转，点击/空格反转方向，躲红色、吃绿色。
 * 这是模板：结构（title → play → over 三个场景）和 UI 写法保留，玩法替换成你的。
 * 游戏世界一律用 art.js 的画风接口（Art.hero / Art.spiky / Art.pickup ...），见 references/art-styles.md
 * UI 一律用 ui.js 的组件（UI.button / UI.panel / UI.score ...），外观自动跟随画风，见 references/ui-design.md
 * ===================================================================== */
const G = Engine.create({ width: CFG.width, height: CFG.height, background: CFG.color.bg, id: 'orbit' });
const C = CFG.color;
const CX = G.W / 2, CY = G.H / 2;
G.audio.muted = G.load('muted', false);

// 背景：由画风绘制（自带动画），所有场景共用
function updateBackground(dt) {}
function drawBackground(ctx) { Art.bg(ctx); }

// 声音开关按钮（标题和暂停界面共用）
function makeSoundButton() { return UI.button({ kind: 'icon', icon: G.audio.muted ? 'mute' : 'sound', x: G.W - UI.M - 48, y: UI.HUD_Y }); }
function toggleSound(btn) { G.audio.muted = !G.audio.muted; G.save('muted', G.audio.muted); btn.icon = G.audio.muted ? 'mute' : 'sound'; }

// ---------------- 标题 ----------------
G.scene('title', {
  enter() {
    this.t = 0;
    this.best = G.load('best', 0);
    this.btnPlay = UI.button({ x: CX, y: UI.ACTION_Y, label: '开始游戏', icon: 'play', key: 'action' });
    this.btnSound = makeSoundButton();
  },
  update(dt) {
    this.t += dt;
    updateBackground(dt);
    if (UI.clicked(this.btnSound)) toggleSound(this.btnSound);
    if (UI.clicked(this.btnPlay)) G.go('play');
  },
  draw(ctx) {
    drawBackground(ctx);
    // 中部：玩法演示动画（标题页展示玩法，比文字说明更直观）
    const a = this.t * CFG.orbitSpeed, demoY = G.H * 0.5;
    Art.ring(ctx, CX, demoY, CFG.orbitRadius, 'pickup', 0.6);
    Art.hero(ctx, CX + Math.cos(a) * CFG.orbitRadius, demoY + Math.sin(a) * CFG.orbitRadius, CFG.playerRadius, { angle: a + Math.PI / 2, speed: 1 });
    // 上部：标题 + 一句话说明
    UI.title(ctx, '绕圈', CX, 320, { t: this.t });
    UI.text(ctx, '点击反转方向 · 躲红收绿', CX, 450, { role: 'body', color: C.dim });
    // 顶部 HUD：最高分胶囊 + 声音
    if (this.best > 0) UI.pill(ctx, UI.M, UI.HUD_Y, { icon: 'trophy', text: this.best, align: 'left' });
    UI.drawButton(ctx, this.btnSound);
    // 底部：主按钮
    UI.drawButton(ctx, this.btnPlay);
    Art.post(ctx);   // 画风后期效果（扫描线、暗角等），每帧最后画
  },
});

// ---------------- 游戏 ----------------
G.scene('play', {
  enter() {
    this.angle = -Math.PI / 2;
    this.dir = 1;
    this.player = { x: 0, y: 0, r: CFG.playerRadius, scale: 1 };
    this.things = [];          // 敌人和星星
    this.score = 0;
    G.debug.result = null;
    this.scorePop = { s: 1 };  // 分数弹跳动画
    this.elapsed = 0;
    this.spawnT = 0.8;
    this.dead = false;
    this.paused = false;
    this.trail = [];
    this.btnPause = UI.button({ kind: 'icon', icon: 'pause', x: G.W - UI.M - 48, y: UI.HUD_Y, key: 'cancel' });
    this.btnResume = UI.button({ x: CX, y: 640, label: '继续', icon: 'play' });
    this.btnRetry = UI.button({ x: CX, y: 790, label: '重新开始', icon: 'restart', kind: 'secondary' });
    this.btnHome = UI.button({ x: CX, y: 940, label: '主页', icon: 'home', kind: 'secondary' });
    this.updatePlayerPos();
  },

  updatePlayerPos() {
    this.player.x = CX + Math.cos(this.angle) * CFG.orbitRadius;
    this.player.y = CY + Math.sin(this.angle) * CFG.orbitRadius;
  },

  spawn() {
    // 从屏幕外随机方向飞向中心
    const a = U.rand(0, Math.PI * 2), d = Math.max(G.W, G.H) * 0.7;
    const isStar = U.chance(CFG.starChance);
    const speed = CFG.enemySpeedStart + this.elapsed * CFG.enemySpeedGain;
    this.things.push({
      x: CX + Math.cos(a) * d, y: CY + Math.sin(a) * d,
      vx: -Math.cos(a) * speed, vy: -Math.sin(a) * speed,
      r: isStar ? 24 : 26, star: isStar, rot: 0, seed: U.randInt(1, 999), dead: false,   // seed：让画风里的随机细节对每个物体固定
    });
  },

  update(dt) {
    updateBackground(dt);
    // 暂停菜单：只处理菜单按钮
    if (this.paused) {
      if (UI.clicked(this.btnResume)) this.paused = false;
      if (UI.clicked(this.btnRetry)) G.go('play');
      if (UI.clicked(this.btnHome)) G.go('title');
      return;
    }
    if (UI.clicked(this.btnPause)) { this.paused = true; return; }
    if (this.dead) return;
    this.elapsed += dt;

    // 输入：反转方向。HUD 区（顶部）的点击不算游戏操作，避免和暂停按钮冲突
    const tapGame = G.input.tapped && G.input.pointer.y > UI.HUD_BOTTOM;
    if (tapGame || G.input.pressed('action')) {
      this.dir *= -1;
      G.sfx('blip', { pitch: U.rand(0.9, 1.1) });
      this.player.scale = 1.4;
      G.tween(this.player, { scale: 1 }, 0.2, 'outBack');
    }

    this.angle += this.dir * CFG.orbitSpeed * dt;
    this.updatePlayerPos();
    this.trail.push({ x: this.player.x, y: this.player.y });
    if (this.trail.length > 12) this.trail.shift();

    // 生成，间隔随时间缩短
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawn();
      this.spawnT = Math.max(CFG.spawnEveryMin, CFG.spawnEveryStart - this.elapsed * 0.02);
    }

    for (const t of this.things) {
      t.x += t.vx * dt; t.y += t.vy * dt; t.rot += dt * 3;
      // 穿过中心后飞出屏幕则移除
      if (U.dist(t.x, t.y, CX, CY) < 30) t.passed = true;
      if (t.passed && U.dist(t.x, t.y, CX, CY) > Math.max(G.W, G.H)) t.dead = true;

      if (!t.dead && U.circleHit(t, this.player)) {
        t.dead = true;
        if (t.star) this.collect(t); else this.die();
      }
    }
    U.removeDead(this.things);
    G.debug.score = this.score;
  },

  collect(t) {
    this.score += 1;
    G.sfx('coin', { pitch: 1 + Math.min(this.score, 20) * 0.02 });
    G.burst(t.x, t.y, { count: 14, color: [C.pickup, '#fff'], speed: 350, life: 0.5 });
    Art.shockwave(t.x, t.y, 90, 'pickup');
    this.scorePop.s = 1.5;
    G.tween(this.scorePop, { s: 1 }, 0.25, 'outBack');
  },

  die() {
    this.dead = true;
    G.debug.result = 'lose';   // 给测试看：waitUntil:d.result=='lose'
    G.sfx('hit');
    G.hitstop(0.08);
    G.shake(24, 0.4);
    G.flash(C.enemy, 0.2);
    G.burst(this.player.x, this.player.y, { count: 40, color: [C.player, C.enemy, '#fff'], speed: 600, life: 0.9, size: 10 });
    Art.shockwave(this.player.x, this.player.y, 220, 'enemy');
    G.after(0.9, () => G.go('over', { score: this.score }));
  },

  draw(ctx) {
    drawBackground(ctx);
    // 1. 游戏世界
    Art.ring(ctx, CX, CY, CFG.orbitRadius, 'pickup', 0.6);
    for (const t of this.things) {
      if (t.star) Art.pickup(ctx, t.x, t.y, t.r, t.seed);
      else Art.spiky(ctx, t.x, t.y, t.r, t.rot, t.seed);
    }
    if (!this.dead) {
      Art.trail(ctx, this.trail, CFG.playerRadius * 0.6);
      ctx.save(); ctx.translate(this.player.x, this.player.y); ctx.scale(this.player.scale, this.player.scale);
      Art.hero(ctx, 0, 0, this.player.r, { angle: this.angle + this.dir * Math.PI / 2, speed: 1 });
      ctx.restore();
    }
    // 2. HUD（最后画，永远在最上层）
    UI.score(ctx, this.score, CX, UI.HUD_Y + 10, { scale: this.scorePop.s });
    UI.drawButton(ctx, this.btnPause);
    // 3. 暂停菜单
    if (this.paused) {
      UI.overlay(ctx);
      UI.panel(ctx, CX, 760, 560, 560, { title: '暂停' });
      UI.drawButton(ctx, this.btnResume);
      UI.drawButton(ctx, this.btnRetry);
      UI.drawButton(ctx, this.btnHome);
    }
    Art.post(ctx);
  },
});

// ---------------- 结算 ----------------
G.scene('over', {
  enter(data) {
    this.score = data.score || 0;
    this.best = G.load('best', 0);
    this.isNew = this.score > this.best;
    if (this.isNew) { G.save('best', this.score); this.best = this.score; G.sfx('win'); }
    else G.sfx('lose');
    this.rating = CFG.starScores.filter((s) => this.score >= s).length;   // 0~3 星
    this.panel = { y: G.H + 400 };
    G.tween(this.panel, { y: 520 }, 0.5, 'outBack');
    this.btnRetry = UI.button({ x: CX, y: UI.ACTION_Y - 150, label: '再来一局', icon: 'restart', key: 'action', enabled: false });
    this.btnHome = UI.button({ x: CX, y: UI.ACTION_Y, label: '主页', icon: 'home', kind: 'secondary', enabled: false });
    G.after(0.5, () => { this.btnRetry.enabled = true; this.btnHome.enabled = true; }); // 防误触
    if (this.isNew) G.after(0.6, () => G.burst(CX, 300, { count: 40, color: [C.player, C.pickup, '#fff'], speed: 700, life: 1, gravity: 900, shape: 'square' }));
  },
  update(dt) {
    updateBackground(dt);
    if (UI.clicked(this.btnRetry)) G.go('play');
    if (UI.clicked(this.btnHome)) G.go('title');
  },
  draw(ctx) {
    drawBackground(ctx);
    const y = this.panel.y;
    UI.panel(ctx, CX, y, 560, 500, { title: '游戏结束', titleColor: C.enemy });
    UI.stars(ctx, CX, y - 130, this.rating, 3, 76);
    UI.score(ctx, this.score, CX, y + 10, { scale: 1.4 });
    if (this.isNew) UI.text(ctx, '新纪录！', CX, y + 150, { role: 'h2', color: C.player });
    else UI.pill(ctx, CX, y + 150, { icon: 'trophy', text: '最高 ' + this.best, align: 'center' });
    UI.drawButton(ctx, this.btnRetry);
    UI.drawButton(ctx, this.btnHome);
    Art.post(ctx);
  },
});

G.start('title');
