#!/usr/bin/env python3
"""Search local research metadata; never fetch sources or execute their content."""
import argparse
import json
from pathlib import Path


def search(index, query, limit=5, tag=None, adopted_only=False, include_unavailable=False):
    tokens = query.casefold().split()
    if not tokens and not tag:
        raise ValueError('Provide a query or --tag')
    if not 1 <= limit <= 20:
        raise ValueError('limit must be between 1 and 20')
    matches = []
    unavailable_matched = 0
    for a in index['articles']:
        if adopted_only and a['disposition'] not in {'integrated', 'merged'}:
            continue
        if tag and tag not in a['title_tags'] + a['body_tags']:
            continue
        title = a['title'].casefold()
        tags = ' '.join(a['title_tags'] + a['body_tags']).casefold()
        note = (a['reason'] + ' ' + a['id'] + ' ' + ' '.join(a.get('knowledge_ids', []))).casefold()
        if not all(t in title or t in tags or t in note for t in tokens):
            continue
        if not a['bytes']:
            unavailable_matched += 1
            if not include_unavailable:
                continue
        score = sum(6 if t in title else 2 if t in tags else 1 for t in tokens)
        score += 3 if a['disposition'] in {'integrated', 'merged'} else 0
        matches.append((score, a))
    matches.sort(key=lambda x: (-x[0], x[1]['path']))
    fields = ['id', 'bytes', 'title', 'original_url', 'archive_url', 'blob_sha', 'read_status',
              'disposition', 'reason', 'used_by', 'knowledge_ids', 'review_sections',
              'image_count', 'missing_local_images', 'images_reviewed', 'original_checked']
    return {'commit': index['commit'], 'matched': len(matches), 'unavailable_matched': unavailable_matched,
            'included_unavailable': include_unavailable,
            'warning': 'Research metadata only; keep each result read/disposition/evidence limits. Ranking is retrieval relevance, not severity or exploitability.',
            'results': [{k: a[k] for k in fields if k in a} for _, a in matches[:limit]]}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('query', nargs='?', default='')
    p.add_argument('--tag')
    p.add_argument('--limit', type=int, default=5)
    p.add_argument('--adopted-only', action='store_true')
    p.add_argument('--include-unavailable', action='store_true', help='Include known empty sources as unavailable metadata')
    p.add_argument('--index', type=Path, default=Path(__file__).resolve().parents[1] / 'references/research/crawl-xz-index.json')
    a = p.parse_args()
    try:
        result = search(json.loads(a.index.read_text()), a.query, a.limit, a.tag, a.adopted_only, a.include_unavailable)
    except ValueError as e:
        p.error(str(e))
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
