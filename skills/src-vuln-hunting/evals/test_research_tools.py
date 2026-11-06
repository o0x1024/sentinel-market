"""Offline regression fixtures; no upstream source code or target is executed."""
import hashlib
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def module(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / (name + '.py'))
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


builder = module('build_research_index')
finder = module('search_research')


class ResearchTools(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='research-fixture-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.content = {
            'xianzhi/1-优惠券.md': '# 优惠券约束\n\n> **来源**: https://xz.aliyun.com/news/1\n\n支付与订单状态。\n',
            'butian/1-优惠券.md': '# 优惠券测试\n\n> **来源**: https://forum.butian.net/share/1\n\n业务逻辑。\n',
            'xianzhi/2-MCP.md': '',
            'xianzhi/3-跨\n行.md': '# 路由观察\n\n正常配置。\n',
            'xianzhi/4-代码示例.md': '# 工具笔记\n\n```python\nprint("SSRF")\n```\n',
        }
        rows = []
        for path, body in self.content.items():
            file = self.root / path
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(body)
            rows.append('| 1 | 标题 | 1 KB | [📄](' + path + ') [🔗]() |')
        (self.root / 'ARTICLES.md').write_text('\n'.join(rows) + '\n')
        self.git('init', '-q')
        self.git('config', 'core.hooksPath', str(self.root / 'no-hooks'))
        self.git('add', '--', 'ARTICLES.md', 'xianzhi', 'butian')
        self.git('-c', 'user.name=Offline Fixture', '-c', 'user.email=fixture@example.test',
                 'commit', '--no-gpg-sign', '-qm', 'fixture')
        self.sha = self.git('rev-parse', 'HEAD').strip()

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root, text=True, stderr=subprocess.DEVNULL)

    def data(self):
        return builder.build(self.root, self.sha, {})

    def test_cross_platform_ids_and_multiline_path(self):
        data = self.data()
        self.assertEqual(data['statistics']['articles'], 5)
        self.assertEqual(data['statistics']['index_entries'], 5)
        self.assertEqual(data['statistics']['index_without_file'], [])
        self.assertEqual(len({a['id'] for a in data['articles']}), 5)
        self.assertEqual(sum(a['index_path_multiline'] for a in data['articles']), 1)
        item = next(a for a in data['articles'] if '\n' in a['path'])
        self.assertIn('%0A', item['archive_url'])

    def test_escaped_path_only_recovers_against_tree(self):
        text = '| 1 | t | 1 KB | [📄](xianzhi/a\nb.md) [🔗]() |'
        literal = r'xianzhi/a\nb.md'
        rows = builder.index_rows(text, {literal: None})
        self.assertTrue(rows[literal]['path_recovered_from_escaped_newline'])
        unresolved = builder.index_rows(text, {})
        self.assertIn('xianzhi/a\nb.md', unresolved)

    def test_empty_and_unreviewed_results_keep_limits(self):
        data = self.data()
        self.assertEqual(finder.search(data, 'MCP')['matched'], 0)
        self.assertEqual(finder.search(data, 'MCP')['unavailable_matched'], 1)
        empty = finder.search(data, 'MCP', include_unavailable=True)['results'][0]
        self.assertEqual((empty['bytes'], empty['read_status'], empty['disposition']), (0, 'empty', 'unavailable'))
        self.assertEqual(finder.search(data, 'MCP', adopted_only=True, include_unavailable=True)['matched'], 0)
        result = finder.search(data, '优惠券')
        self.assertEqual(result['matched'], 2)
        self.assertTrue(all(a['read_status'] == 'machine_screened' for a in result['results']))
        self.assertTrue(all(not a['original_checked'] for a in result['results']))
        self.assertEqual(finder.search(data, '优惠券', adopted_only=True)['matched'], 0)

    def test_local_source_drift_is_rejected(self):
        (self.root / 'xianzhi/1-优惠券.md').write_text('Changed after snapshot')
        with self.assertRaisesRegex(ValueError, 'differs from pinned blob'):
            self.data()

    def test_stale_review_is_rejected(self):
        review = {'sha256': '0' * 64, 'read_status': 'sections_reviewed'}
        with self.assertRaisesRegex(ValueError, 'Review hash mismatch'):
            builder.build(self.root, self.sha, {'xianzhi/1-优惠券.md': review})

    def test_curated_lookup_and_bounded_output(self):
        path = 'xianzhi/1-优惠券.md'
        review = {'sha256': hashlib.sha256(self.content[path].encode()).hexdigest(),
                  'read_status': 'sections_reviewed', 'disposition': 'integrated',
                  'reason': '核读受控订单的最终状态', 'used_by': ['references/by-type/business-logic.md'],
                  'review_sections': ['支付与订单状态'], 'knowledge_ids': ['K02']}
        data = builder.build(self.root, self.sha, {path: review})
        result = finder.search(data, 'K02', adopted_only=True)
        self.assertEqual(result['matched'], 1)
        self.assertEqual(result['results'][0]['read_status'], 'sections_reviewed')
        self.assertFalse(result['results'][0]['images_reviewed'])
        self.assertEqual(len(finder.search(data, '优惠券', limit=1)['results']), 1)
        with self.assertRaises(ValueError):
            finder.search(data, '', limit=5)
        with self.assertRaises(ValueError):
            finder.search(data, '优惠券', limit=21)

    def test_code_mentions_do_not_become_prose_tags(self):
        data = self.data()
        item = next(a for a in data['articles'] if a['path'].endswith('代码示例.md'))
        self.assertNotIn('ssrf', item['body_tags'])

    def test_symlink_substitution_is_rejected(self):
        file = self.root / 'xianzhi/1-优惠券.md'
        outside = self.root / 'outside.md'
        outside.write_text(self.content['xianzhi/1-优惠券.md'])
        file.unlink()
        file.symlink_to(outside)
        with self.assertRaisesRegex(ValueError, 'Unsafe local article path'):
            self.data()


if __name__ == '__main__':
    unittest.main()
