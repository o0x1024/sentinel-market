/* =====================================================================
 * 示例游戏《绕圈》：玩家绕中心旋转，点击/空格反转方向，躲红色、吃绿色。
 * 这是模板：结构（title → play → over 三个场景）保留，玩法替换成你的。
 * ===================================================================== */
const G = Engine.create({ width: CFG.width, height: CFG.height, background: CFG.color.bg, id: 'orbit' });
const C = CFG.color;
const CX = G.W / 2, CY = G.H / 2;

// 背景：缓慢漂移的星点，给画面纵深（所有场景共用）
const BG_STARS = Array.from({ length: 60 }, () => ({ x: U.rand(0, G.W), y: U.rand(0, G.H), r: U.rand(1, 3), sp: U.rand(10, 40) }));
function updateBackground(dt) {
  for (const s of BG_STARS) { s.y += s.sp * dt; if (s.y > G.H) { s.y = 0; s.x = U.rand(0, G.W); } }
}
function drawBackground(ctx) {
  for (const s of BG_STARS) {
    ctx.globalAlpha = 0.25 + s.r * 0.1;
    D.circle(ctx, s.x, s.y, s.r, C.dim);
  }
  ctx.globalAlpha = 1;
}

// ---------------- 标题 ----------------
G.scene('title', {
  enter() {
    this.t = 0;
    this.best = G.load('best', 0);
  },
  update(dt) {
    this.t += dt;
    updateBackground(dt);
    if (G.input.anyPressed()) { G.sfx('click'); G.go('play'); }
  },
  draw(ctx) {
    drawBackground(ctx);
    const a = this.t * CFG.orbitSpeed;
    D.ring(ctx, CX, CY, CFG.orbitRadius, C.bg2, 4);
    D.circle(ctx, CX + Math.cos(a) * CFG.orbitRadius, CY + Math.sin(a) * CFG.orbitRadius, CFG.playerRadius, C.player);
    D.text(ctx, '绕 圈', CX, 220, { size: 96, color: C.player, shadow: '#0006' });
    D.text(ctx, '点击 / 空格 反转方向', CX, 320, { size: 32, color: C.dim });
    D.text(ctx, '躲开红色 · 收集绿色', CX, 370, { size: 32, color: C.dim });
    const pulse = 1 + Math.sin(this.t * 5) * 0.06;
    D.withTransform(ctx, CX, 1000, { scale: pulse }, () => D.text(ctx, '点击开始', 0, 0, { size: 48 }));
    if (this.best > 0) D.text(ctx, '最高分 ' + this.best, CX, 1100, { size: 32, color: C.dim });
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
    this.scorePop = { s: 1 };  // 分数弹跳动画
    this.elapsed = 0;
    this.spawnT = 0.8;
    this.dead = false;
    this.trail = [];
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
      r: isStar ? 18 : 20, star: isStar, rot: 0, dead: false,
    });
  },

  update(dt) {
    updateBackground(dt);
    if (this.dead) return;
    this.elapsed += dt;

    // 输入：反转方向（带一点挤压反馈）
    if (G.input.tapped || G.input.pressed('action')) {
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
    this.scorePop.s = 1.6;
    G.tween(this.scorePop, { s: 1 }, 0.25, 'outBack');
  },

  die() {
    this.dead = true;
    G.sfx('hit');
    G.hitstop(0.08);
    G.shake(24, 0.4);
    G.flash(C.enemy, 0.2);
    G.burst(this.player.x, this.player.y, { count: 40, color: [C.player, C.enemy, '#fff'], speed: 600, life: 0.9, size: 10 });
    G.after(0.9, () => G.go('over', { score: this.score }));
  },

  draw(ctx) {
    drawBackground(ctx);
    D.ring(ctx, CX, CY, CFG.orbitRadius, C.bg2, 4);
    D.circle(ctx, CX, CY, 10, C.bg2);

    for (const t of this.things) {
      if (t.star) D.poly(ctx, t.x, t.y, t.r, 4, t.rot, C.pickup);
      else D.poly(ctx, t.x, t.y, t.r, 3, t.rot, C.enemy);
    }

    if (!this.dead) {
      this.trail.forEach((p, i) => {
        ctx.globalAlpha = (i / this.trail.length) * 0.4;
        D.circle(ctx, p.x, p.y, CFG.playerRadius * (i / this.trail.length), C.player);
      });
      ctx.globalAlpha = 1;
      D.withTransform(ctx, this.player.x, this.player.y, { scale: this.player.scale }, () => D.circle(ctx, 0, 0, this.player.r, C.player));
    }

    D.withTransform(ctx, CX, 140, { scale: this.scorePop.s }, () => D.text(ctx, String(this.score), 0, 0, { size: 96, shadow: '#0006' }));
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
    this.panel = { y: G.H + 200 };
    G.tween(this.panel, { y: G.H / 2 }, 0.5, 'outBack');
    this.canRestart = false;
    G.after(0.5, () => (this.canRestart = true)); // 防止误触立刻重开
  },
  update(dt) {
    updateBackground(dt);
    if (this.canRestart && G.input.anyPressed()) { G.sfx('click'); G.go('play'); }
  },
  draw(ctx) {
    drawBackground(ctx);
    const y = this.panel.y;
    D.roundRect(ctx, 110, y - 260, 500, 520, 32, C.bg2);
    D.text(ctx, '游戏结束', CX, y - 170, { size: 56, color: C.enemy });
    D.text(ctx, String(this.score), CX, y - 40, { size: 120 });
    D.text(ctx, this.isNew ? '新纪录！' : '最高分 ' + this.best, CX, y + 70, { size: 36, color: this.isNew ? C.player : C.dim });
    if (this.canRestart) D.text(ctx, '点击再来一局', CX, y + 180, { size: 36 });
  },
});

G.start('title');
