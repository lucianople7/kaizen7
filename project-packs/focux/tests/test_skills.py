import unittest
import subprocess
import sys
import json
from focux.skill_checks import check, selftest, SKILLS
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class SkillsTests(unittest.TestCase):
    def test_all_eleven_fixture_baselines_and_regressions(self):
        self.assertEqual(len(SKILLS), 11)
        for name in SKILLS:
            with self.subTest(skill=name):
                result = selftest(ROOT / 'skills' / name)
                self.assertTrue(result['passed'], result)
                self.assertGreaterEqual(result['cases'], 2)

    def test_each_executable_selftest(self):
        for name in SKILLS:
            with self.subTest(skill=name):
                run = subprocess.run([sys.executable, str(ROOT / 'skills' / name / 'scripts' / 'selftest.py')], capture_output=True, text=True)
                self.assertEqual(run.returncode, 0, run.stderr)
                self.assertTrue(json.loads(run.stdout)['passed'])

    def test_unknown_skill_rejected(self):
        with self.assertRaises(ValueError):
            check('focux-unknown', {})

    def test_malformed_input_is_failed_gate(self):
        for name in SKILLS:
            for value in (None, [], {}, {'shots': 'invalid'}):
                with self.subTest(skill=name, value=value):
                    self.assertFalse(check(name, value)['passed'])

    def test_learning_cannot_promote_single_observation(self):
        result = check('focux-learning', {'sample_size': 1, 'min_samples': 1, 'context': 'night', 'confidence': .99, 'evidence_ids': ['e1'], 'changed_variables': ['brand'], 'rollback_policy': 'v1', 'promote': True})
        self.assertFalse(result['passed'])

if __name__ == '__main__':
    unittest.main()
