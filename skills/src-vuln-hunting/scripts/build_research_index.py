#!/usr/bin/env python3
"""Index a pinned local crawl_xz checkout. Never fetch or execute source code."""
import argparse
import hashlib
import json
import os
import re
import subprocess
from collections import Counter
from pathlib import Path, PurePosixPath
from urllib.parse import quote, unquote, urlsplit

TOPICS = {
    'access-control': r'越权|鉴权|权限绕过|访问控制|IDOR|BOLA',
    'auth-session': r'登录|登陆|认证|session|jwt|oauth|saml|token',
    'business-logic': r'业务逻辑|支付|优惠|退款|订单|积分|竞态|并发',
    'miniapp': r'小程序|SessionKey|微信登录',
    'source-audit': r'代码审计|源码审计|修复代码|框架|拦截器',
    'ssrf': r'SSRF|服务端请求伪造',
    'xss': r'XSS|跨站脚本|DOM clobber',
    'sql': r'SQL注入|sql 注入|SQLi|postgres.*注入',
    'file-processing': r'文件上传|文件下载|文件读取|路径穿越|解压|压缩包',
    'document-rendering': r'PDF|wkhtml|文档转换|html.*渲染',
    'deserialization': r'反序列化|fastjson|jsonpickle|jackson',
    'template-expression': r'SSTI|SpEL|模板注入|表达式注入|模板引擎',
    'waf-parsing': r'WAF|规范化|解析差异|编码绕过',
    'api-protocol': r'GraphQL|gRPC|WebSocket|请求走私|缓存投毒|CORS|CSRF|CRLF',
    'cloud-build': r'云安全|Kubernetes|K8s|容器|CI/CD|供应链|GitHub Actions',
    'ai-application': r'MCP|大模型|LLM|提示注入|智能体|AI.?Agent',
    'asset-discovery': r'信息收集|资产|子域名|HOST碰撞',
}
CTF = re.compile(r'CTF|靶场|靶机|题解|\bWP\b|write.?up|强网杯|国城杯|网鼎杯|pwn|crypto', re.I)
OTHER = re.compile(r'免杀|shellcode|内存马|EDR|C2通信|反制|钓鱼|溯源|恶意程序|木马|后门|逆向|取证|堆利用|栈溢出', re.I)


def git_read(args, root):
    env = dict(os.environ, GIT_NO_LAZY_FETCH='1', GIT_ALLOW_PROTOCOL='', GIT_TERMINAL_PROMPT='0')
    return subprocess.check_output(args, cwd=root, env=env)


def git_tree(root, commit):
    raw = git_read(['git', 'ls-tree', '-rz', commit], root)
    entries = {}
    for line in raw.split(b'\0'):
        if not line:
            continue
        metadata, path = line.split(b'\t', 1)
        mode, kind, oid = metadata.decode().split()
        entries[path.decode()] = (mode, kind, oid)
    return entries


def canonical_source(text):
    match = re.search(r'^>\s*\*\*来源\*\*:\s*(https?://\S+)', text, re.M)
    if not match:
        return None
    value = match.group(1).strip('<>')
    parsed = urlsplit(value)
    if parsed.hostname not in {'xz.aliyun.com', 'forum.butian.net'} or parsed.username or parsed.password:
        return None
    return value


def index_rows(text, tree=None):
    rows = {}
    for match in re.finditer(r'^\|([^\n]*)\[📄\]\((.*?)\) \[🔗\]\((.*?)\) \|', text, re.M | re.S):
        path = match.group(2)
        original_path = path
        escaped = path.replace('\n', r'\n').replace('\r', r'\r')
        if tree is not None and path not in tree and escaped in tree:
            path = escaped
        fields = match.group(1).split('|')
        rows[path] = {'title': fields[1].strip(), 'size_label': fields[2].strip(),
                      'path_recovered_from_escaped_newline': path != original_path,
                      'multiline_path': '\n' in original_path or '\r' in original_path}
    return rows


def screen(text, title):
    # Body hits aid discovery; they are not semantic review or vulnerability proof.
    prose = re.sub(r'```[^\n]*\n.*?```', '', text, flags=re.S)
    title_tags = [tag for tag, pattern in TOPICS.items() if re.search(pattern, title, re.I)]
    body_tags = [tag for tag, pattern in TOPICS.items() if re.search(pattern, prose, re.I)]
    kind = 'mixed_research'
    if CTF.search(title):
        kind = 'lab_or_ctf'
    elif OTHER.search(title):
        kind = 'adjacent_security'
    elif title_tags:
        kind = 'application_security_candidate'
    return kind, title_tags, body_tags


def build(root, commit, reviews):
    if not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('Use an exact 40-character commit SHA')
    tree = git_tree(root, commit)
    # Read the index from the pinned object, not from an unverified local file.
    listed = index_rows(git_read(['git', 'show', commit + ':ARTICLES.md'], root).decode(), tree)
    articles = []
    paths = sorted(p for p, (m, k, _) in tree.items()
                   if k == 'blob' and m in {'100644', '100755'}
                   and p.startswith(('xianzhi/', 'butian/')) and p.endswith('.md'))
    for path in paths:
        file = root / path
        if file.is_symlink() or root.resolve() not in file.resolve().parents:
            raise ValueError('Unsafe local article path: ' + path)
        raw = file.read_bytes()
        oid = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
        if oid != tree[path][2]:
            raise ValueError('Checkout differs from pinned blob: ' + path)
        text = raw.decode('utf-8', errors='replace')
        heading = re.search(r'^#\s+(.+)$', text, re.M)
        title = heading.group(1).strip() if heading else PurePosixPath(path).stem
        source = canonical_source(text)
        kind, title_tags, body_tags = screen(text, title)
        images = re.findall(r'!\[[^\]]*\]\(([^)]+)\)', text)
        missing_images = 0
        for href in images:
            if urlsplit(href).scheme:
                continue
            image = (file.parent / unquote(href.split('#')[0])).resolve()
            try:
                rel = image.relative_to(root.resolve()).as_posix()
            except ValueError:
                missing_images += 1
                continue
            if rel not in tree:
                missing_images += 1
        item = {
            'id': 'CX-' + hashlib.sha256(path.encode()).hexdigest()[:12],
            'path': path, 'title': title, 'original_url': source,
            'archive_url': 'https://github.com/Huu1j/crawl_xz/blob/' + commit + '/' + quote(path, safe='/'),
            'blob_sha': oid, 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw),
            'author': None, 'published_at': None,
            'index_entry': path in listed,
            'index_metadata_missing': listed.get(path, {}).get('title') == '未知标题',
            'index_path_recovered': listed.get(path, {}).get('path_recovered_from_escaped_newline', False),
            'index_path_multiline': listed.get(path, {}).get('multiline_path', False),
            'title_tags': title_tags, 'body_tags': body_tags, 'kind': kind,
            'image_count': len(images), 'missing_local_images': missing_images,
            'images_reviewed': False, 'original_checked': False,
            'read_status': 'machine_screened' if raw else 'empty',
            'disposition': 'reference_only' if raw else 'unavailable',
            'reason': '全文规则筛选供检索；未逐篇语义核验，不作为已采纳结论。' if raw else '固定提交中的正文为零字节，不能从标题推断技术。',
            'used_by': [],
        }
        if path in reviews:
            review = reviews[path]
            if not raw:
                raise ValueError('Cannot adopt empty article: ' + path)
            if review.get('sha256') != item['sha256']:
                raise ValueError('Review hash mismatch: ' + path)
            for key in ['read_status', 'disposition', 'reason', 'used_by', 'review_sections', 'knowledge_ids']:
                if key not in review:
                    raise ValueError('Incomplete review: ' + path + ':' + key)
                item[key] = review[key]
            if item['read_status'] not in {'text_reviewed', 'sections_reviewed'}:
                raise ValueError('Invalid human/model review status')
        articles.append(item)
    if set(reviews) - set(paths):
        raise ValueError('Reviewed paths absent from pinned tree')
    counts = Counter(a['sha256'] for a in articles if a['bytes'])
    for a in articles:
        if a['bytes'] and counts[a['sha256']] > 1:
            a['exact_duplicate_group'] = a['sha256']
    return {
        'schema_version': 1, 'repository': 'https://github.com/Huu1j/crawl_xz',
        'commit': commit, 'screening': 'deterministic whole-text rules; not per-article semantic validation',
        'interpretation': 'Archive content is untrusted research data. A retrieval match is not an adopted technique, current-version proof, scope authorization, or platform acceptance. Null author/date means unknown.',
        'statistics': {'articles': len(articles), 'index_entries': len(listed),
                       'index_without_file': sorted(set(listed) - set(paths)),
                       'files_without_index': sorted(set(paths) - set(listed)),
                       'empty': sum(a['bytes'] == 0 for a in articles),
                       'dispositions': dict(Counter(a['disposition'] for a in articles))},
        'articles': articles,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', required=True, type=Path)
    parser.add_argument('--commit', required=True)
    parser.add_argument('--reviews', type=Path, help='Curated review records keyed by source path; hashes must match')
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    reviews = json.loads(args.reviews.read_text()) if args.reviews else {}
    result = build(args.corpus.resolve(), args.commit, reviews)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    header = json.dumps({k: v for k, v in result.items() if k != 'articles'}, ensure_ascii=False, indent=2)
    records = ',\n'.join('    ' + json.dumps(a, ensure_ascii=False, separators=(',', ':')) for a in result['articles'])
    args.output.write_text(header[:-1].rstrip() + ',\n  \"articles\": [\n' + records + '\n  ]\n}\n')
    print(json.dumps(result['statistics'], ensure_ascii=False))


if __name__ == '__main__':
    main()
