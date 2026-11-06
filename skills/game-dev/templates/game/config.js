/* 所有可调数值都放这里。调手感 = 只改这个文件。 */
const CFG = {
  // 画面：竖屏 720x1280（手机优先）。横屏游戏改成 1280x720。
  width: 720,
  height: 1280,

  // 调色板：全游戏只用这些颜色（见 references/art-direction.md）
  color: {
    bg: '#1b1b3a',
    bg2: '#2a2a5a',
    player: '#ffd166',
    enemy: '#ef476f',
    pickup: '#06d6a0',
    text: '#ffffff',
    dim: '#8888aa',
  },

  // ---- 玩法数值 ----
  orbitRadius: 180,       // 玩家绕中心转的半径
  orbitSpeed: 2.6,        // 弧度/秒
  playerRadius: 22,
  enemySpeedStart: 260,   // 敌人初速度 px/s
  enemySpeedGain: 6,      // 每秒加速
  spawnEveryStart: 1.1,   // 生成间隔（秒）
  spawnEveryMin: 0.35,
  starChance: 0.35,       // 生成星星而非敌人的概率
};
