/* 所有可调数值都放这里。调手感 = 只改这个文件。 */
const CFG = {
  // 画面：竖屏 720x1280（手机优先）。横屏游戏改成 1280x720。
  width: 720,
  height: 1280,

  // 画风（见 references/art-styles.md）：决定游戏世界和 UI 的全部外观，调色板 CFG.color 由画风自动填充
  //   'anime' 二次元 | 'arcade' 街机像素 | 'cyber' 电子合成波 | 'flat' 扁平卡通 | 'guofeng' 国风水墨 | 'shadiao' 沙雕简笔
  art: { style: 'anime' },

  // ---- 玩法数值 ----
  orbitRadius: 180,       // 玩家绕中心转的半径
  orbitSpeed: 2.6,        // 弧度/秒
  playerRadius: 30,      // 角色至少占屏宽 8%，表情才看得清
  enemySpeedStart: 260,   // 敌人初速度 px/s
  enemySpeedGain: 6,      // 每秒加速
  spawnEveryStart: 1.1,   // 生成间隔（秒）
  spawnEveryMin: 0.35,
  starChance: 0.35,       // 生成星星而非敌人的概率
  starScores: [3, 10, 20], // 结算评级：达到分数获得 1/2/3 星
};
