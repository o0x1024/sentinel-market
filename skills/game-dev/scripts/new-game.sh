#!/usr/bin/env bash
# 用法: bash new-game.sh <目标目录> [游戏标题]
# 从模板复制一个可运行的游戏项目。
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TPL="$DIR/../templates/game"
DEST="${1:?用法: new-game.sh <目标目录> [游戏标题]}"
TITLE="${2:-My Game}"

if [ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then
  echo "错误: $DEST 已存在且非空，拒绝覆盖。" >&2
  exit 1
fi
mkdir -p "$DEST"
cp "$TPL"/*.js "$DEST"/
# 替换标题（兼容 macOS/Linux sed）
sed "s/GAME_TITLE/${TITLE//\//\\/}/" "$TPL/index.html" > "$DEST/index.html"
cp "$DIR/../templates/gdd.md" "$DEST/GDD.md"
echo "已创建: $DEST"
echo "下一步: 双击 $DEST/index.html 运行；验证: node $DIR/smoke-test.mjs $DEST"
