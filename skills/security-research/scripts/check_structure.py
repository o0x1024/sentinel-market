#!/usr/bin/env python3
"""校验本 skill 的索引完整性。只读本地文件，不联网、不执行被检索内容。

检查四件事：
1. 所有 Markdown 相对链接与反引号内路径都能解析（模板路径含 < > * 的跳过）。
2. by-type 叶子体积不超过 15 KB（超过说明判例被写回叶子）。
3. 每个 by-type 叶子在开头 8 行内带「语料桶/判例」指针（防止经验入口被埋到附录）。
4. SKILL.md 必须出现目录地图与 research 入口，避免 list_files 截断后丢失经验库。

用法：python3 scripts/check_structure.py [-v]
退出码非 0 表示存在需要修复的问题。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LINK = re.compile(r'\[[^\]]*\]\(\s*([^)\s]+?)\s*\)')
INLINE = re.compile(r'`((?:references|scripts)/[A-Za-z0-9._/\-<>*]+)`')
LEAF_MAX = 15 * 1024
POINTER_WINDOW = 8
POINTER_MARKERS = ('语料桶', '判例记录', 'research/')
# 语料目录是原始贴文转写，正文里含 XSS 载荷与伪 markdown，链接校验在那里没有意义。
LINK_EXCLUDE_DIRS = ('references/research',)
SKIP_SCHEMES = ('http://', 'https://', 'mailto:', '#', 'blob:', 'javascript:', 'data:', '//')
SKILL_REQUIRED = ('references/research/x-corpus.md', 'references/research/corpus-index.md', 'scripts/check_structure.py')


def md_files():
    return sorted(p for p in ROOT.rglob('*.md') if p.is_file())


def rel(p):
    return p.relative_to(ROOT).as_posix()


def is_template(t):
    return any(c in t for c in '<>*')


def check_links():
    errs = []
    for p in md_files():
        if any(rel(p).startswith(d) for d in LINK_EXCLUDE_DIRS):
            continue
        text = p.read_text(encoding='utf-8')
        for m in LINK.finditer(text):
            t = m.group(1)
            if t.startswith(SKIP_SCHEMES) or is_template(t):
                continue
            t = t.split('#')[0]
            if not t:
                continue
            if not (p.parent / t).resolve().exists():
                errs.append(f'{rel(p)}: 悬空链接 -> {t}')
        for m in INLINE.finditer(text):
            t = m.group(1)
            if is_template(t):
                continue
            if not (ROOT / t).exists():
                errs.append(f'{rel(p)}: 悬空路径 -> {t}')
    return errs


def check_leaves():
    errs, warns = [], []
    for p in sorted((ROOT / 'references/by-type').glob('*.md')):
        size = p.stat().st_size
        if size > LEAF_MAX:
            errs.append(f'{rel(p)}: 叶子 {size} 字节超过 15 KB 上限（判例应下沉到 research/）')
        head = p.read_text(encoding='utf-8').splitlines()[:POINTER_WINDOW]
        if not any(k in line for line in head for k in POINTER_MARKERS):
            errs.append(f'{rel(p)}: 开头 {POINTER_WINDOW} 行内没有语料桶/判例指针')
        elif '语料桶' not in ''.join(head):
            warns.append(f'{rel(p)}: 指针只到判例记录，缺同类成交语料桶')
    return errs, warns


def check_skill_entry():
    errs = []
    text = (ROOT / 'SKILL.md').read_text(encoding='utf-8')
    for need in SKILL_REQUIRED:
        if need not in text:
            errs.append(f'SKILL.md: 缺少对 {need} 的索引')
    for word in ('目录地图', 'list_files'):
        if word not in text:
            errs.append(f'SKILL.md: 缺少「{word}」相关说明（截断防护）')
    return errs


def main():
    verbose = '-v' in sys.argv
    link_errs = check_links()
    leaf_errs, leaf_warns = check_leaves()
    skill_errs = check_skill_entry()
    errs = link_errs + leaf_errs + skill_errs
    print(f'扫描 {len(md_files())} 个 Markdown；叶子 '
          f'{len(list((ROOT / "references/by-type").glob("*.md")))} 份')
    if verbose:
        for w in leaf_warns:
            print(f'  warn  {w}')
    if errs:
        print(f'\n发现 {len(errs)} 个问题：')
        for e in errs:
            print(f'  FAIL  {e}')
        return 1
    print('索引完整性检查通过：链接全部可解析，叶子体积与指针位置合规，SKILL.md 入口齐备。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
