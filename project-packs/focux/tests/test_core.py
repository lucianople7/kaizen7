import json
import sqlite3
import unittest
import uuid
from pathlib import Path
from focux.core import Factory, FocuxError


class CoreTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).parent / '.runs' / uuid.uuid4().hex
        self.root.mkdir(parents=True)
        self.f = Factory(self.root)

    def test_create_real_files_and_stable_identity(self):
        p = self.f.create('Tokyo After Dark', project_id='SIGNAL-003')
        self.assertEqual(p['id'], 'SIGNAL-003')
        for name in ['brief.json', 'story.json', 'world-bible.json', 'shotlist.json', 'receipt.json']:
            self.assertTrue((self.root / 'projects/SIGNAL-003' / name).is_file())
        self.assertEqual(len(self.f.project_get('SIGNAL-003')['shotlist']['shots']), 9)
        with self.assertRaises(FocuxError): self.f.create('overwrite', project_id='SIGNAL-003')
        with self.assertRaises(FocuxError): self.f.project_get('../../secret')

    def test_feedback_binds_exact_version_and_no_single_observation_learning(self):
        self.f.create('Tokyo After Dark')
        first = self.f.feedback('SIGNAL-001', score=9, note='logo too obvious')
        lesson = self.f.learn('SIGNAL-001')
        self.assertFalse(lesson['improvement_proven'])
        self.assertEqual(lesson['sample_size'], 1)
        self.assertEqual(first['context_hash'], self.f.project_get('SIGNAL-001')['context_hash'])
        self.f.learn('SIGNAL-001')
        self.assertEqual(self.f.learning_report()['sample_size'], 1)
        with self.assertRaises(FocuxError): self.f.feedback('SIGNAL-001', score=11)

    def test_evidence_immutable_and_hashed(self):
        self.f.create('Tokyo After Dark')
        self.assertTrue(self.f.audit()['pass'])
        with sqlite3.connect(self.root / 'data/focux.db') as db:
            with self.assertRaises(sqlite3.DatabaseError): db.execute('DELETE FROM learning_events')

    def test_approval_does_not_authorize_spend(self):
        self.f.create('Tokyo After Dark')
        self.f.feedback('SIGNAL-001', approve=True)
        with self.assertRaises(FocuxError): self.f.assets_generate('SIGNAL-001', fixture=False)

    def test_learning_challenger_requires_comparison_and_rollback(self):
        self.f.create('Tokyo After Dark')
        self.f.feedback('SIGNAL-001', score=8)
        result = self.f.learn('SIGNAL-001')
        self.assertEqual(result['proposal']['changed_variables'], ['brand_prominence'])
        with self.assertRaises(FocuxError): self.f.promote(result['proposal']['id'])
        self.assertEqual(self.f.policy_rollback('v1')['version'], 'v1')

    def test_feedback_invalidated_by_final_bytes(self):
        self.f.create('Tokyo After Dark')
        p=self.f.path('SIGNAL-001')
        (p/'SIGNAL-001.mp4').write_bytes(b'original test bytes')
        self.f.feedback('SIGNAL-001',score=9,approve=True)
        (p/'SIGNAL-001.mp4').write_bytes(b'changed test bytes')
        self.assertEqual(self.f.feedback_for('SIGNAL-001'),[])

    def test_next_production_snapshots_active_policy(self):
        self.f.create('Tokyo Before')
        candidate={**self.f.policy(),'version':'v-test','brand_prominence':.04}
        with self.f.connect() as c:c.execute('INSERT INTO policy_versions VALUES (?,?)',('v-test',json.dumps(candidate)))
        self.f.policy_rollback('v-test')
        self.f.create('Tokyo After')
        self.assertEqual(json.loads((self.f.path('SIGNAL-002')/'policy.json').read_text())['brand_prominence'],.04)
        self.assertEqual(json.loads((self.f.path('SIGNAL-001')/'policy.json').read_text())['brand_prominence'],.06)

if __name__ == '__main__': unittest.main()
