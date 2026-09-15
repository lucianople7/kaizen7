import hashlib
import json
from pathlib import Path
import unittest
import uuid
from PIL import Image, ImageEnhance
from focux import assets
from focux.providers import GPTImageProvider


class AssetTests(unittest.TestCase):
    def setUp(self):
        self.root = Path('work/test-assets') / uuid.uuid4().hex
        (self.root / 'brand').mkdir(parents=True)
        Image.new('RGBA', (100, 40), 'white').save(self.root / 'brand/logo.png')
        self.write('shotlist.json', {'shots': [{'id': f'{i:03}', 'brief': f'Independent city scene {i}', 'duration': 2, 'mode': 'STATIC_PLUS', 'motion': {'kind': 'slow_push'}} for i in range(1, 10)]})
        self.write('world-bible.json', {'continuity_group': 'city', 'palette': 'warm'})
        self.write('beatmap.json', {'sections': [{'start': 0, 'end': 18, 'label': 'build'}]})
    def write(self, name, data):
        (self.root / name).write_text(json.dumps(data), encoding='utf8')
    def make(self):
        return assets.generate_assets(self.root)
    def test_nine_independent_masters_have_visual_anchors_and_reuse(self):
        m = self.make()
        result = assets.validate_assets(self.root)
        self.assertTrue(result['pass'], result)
        self.assertEqual(len(m['assets']), 9)
        self.assertEqual(len({a['sha256'] for a in m['assets']}), 9)
        self.assertTrue(m['fixture'])
        self.assertIn('shots/001/master.png', m['assets'][1]['anchor_paths'])
        before = (self.root / m['assets'][0]['path']).stat().st_mtime_ns
        self.make()
        self.assertEqual(before, (self.root / m['assets'][0]['path']).stat().st_mtime_ns)
    def test_contact_sheet_provenance_rejected(self):
        m = self.make()
        m['assets'][0]['provenance']['source_kind'] = 'contact_sheet_crop'
        self.write('asset-manifest.json', m)
        self.assertFalse(assets.validate_assets(self.root)['pass'])
    def test_exact_and_near_duplicates_rejected_even_with_updated_hashes(self):
        for near in (False, True):
            m = self.make()
            image = Image.open(self.root / m['assets'][0]['path'])
            if near:
                image = ImageEnhance.Brightness(image).enhance(0.99)
            dest = self.root / m['assets'][1]['path']
            image.save(dest)
            m['assets'][1]['sha256'] = hashlib.sha256(dest.read_bytes()).hexdigest()
            m['assets'][1]['perceptual_hash'] = assets.perceptual_hash(dest)
            self.write('asset-manifest.json', m)
            self.assertFalse(assets.validate_assets(self.root)['pass'])
    def test_path_escape_and_missing_metadata_fail_closed(self):
        m = self.make()
        m['assets'][0]['path'] = '../outside.png'
        m['assets'][1].pop('logo_provenance')
        self.write('asset-manifest.json', m)
        self.assertFalse(assets.validate_assets(self.root)['pass'])
    def test_logo_original_and_anchor_hash_are_verified(self):
        self.make()
        Image.new('RGBA', (100, 40), 'black').save(self.root / 'brand/logo.png')
        self.assertFalse(assets.validate_assets(self.root)['pass'])
    def test_paid_provider_fails_before_transport_without_budget(self):
        with self.assertRaises(PermissionError):
            GPTImageProvider().generate({'shot': {'id': '001'}}, self.root / 'paid.png')
    def test_shared_root_rejected(self):
        m = self.make()
        m['assets'][1]['provenance']['root_source_id'] = m['assets'][0]['provenance']['root_source_id']
        self.write('asset-manifest.json', m)
        self.assertFalse(assets.validate_assets(self.root)['pass'])
    def test_missing_music_structure_rejected(self):
        self.make()
        self.write('beatmap.json', {'unrelated': True})
        self.assertFalse(assets.validate_assets(self.root)['pass'])
    def test_infinite_budget_cannot_authorize_paid_transport(self):
        provider = GPTImageProvider(approval={'explicit_user_approval': True, 'max_cost_usd': float('inf'), 'cost_per_image_usd': 1})
        with self.assertRaises(PermissionError):
            provider.generate({}, self.root / 'paid.png')
    def test_forged_approval_never_invokes_live_transport(self):
        def prohibited(*args):
            self.fail('An arbitrary dictionary authorized external spending')
        provider = GPTImageProvider(approval={'explicit_user_approval': True, 'max_cost_usd': 10, 'cost_per_image_usd': 1}, transport=prohibited)
        with self.assertRaises(PermissionError):
            provider.generate({}, self.root / 'paid.png')
    def test_explicit_brand_selection_and_shot_metadata(self):
        data = json.loads((self.root / 'shotlist.json').read_text())
        for index, shot in enumerate(data['shots']):
            shot['brand_presence'] = index == 1
        self.write('shotlist.json', data)
        m = self.make()
        self.assertEqual([a['shot_id'] for a in m['assets'] if a['logo_provenance']['applied']], ['002'])
        for name in ('brief.json', 'motion.json', 'qa.json', 'refs.json'):
            self.assertTrue((self.root / 'shots/001' / name).is_file())
    def test_regeneration_archives_original(self):
        first = self.make()['assets'][0]
        previous = (self.root / first['path']).read_bytes()
        data = json.loads((self.root / 'shotlist.json').read_text())
        data['shots'][0]['brief'] = 'Changed independently constructed scene'
        self.write('shotlist.json', data)
        self.make()
        history = list((self.root / 'shots/001/versions').glob('*/master.png'))
        self.assertTrue(any(p.read_bytes() == previous for p in history))
    def test_local_provider_preserves_source_and_rejects_tampering(self):
        from focux.providers import LocalImageProvider
        fixture = self.make()
        source = self.root / 'local-source.png'
        source.write_bytes((self.root / fixture['assets'][0]['path']).read_bytes())
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        self.write('source-manifest.json', {'assets': [{'shot_id': '001', 'path': source.name, 'sha256': digest,
            'provenance': {'source_kind': 'independent_master', 'root_source_id': 'local-001', 'description': 'Provided test image', 'fixture': True}}]})
        provider = LocalImageProvider(self.root / 'source-manifest.json')
        dest = self.root / 'local-copy.png'
        result = provider.generate({'shot': {'id': '001'}, 'anchor_paths': ['brand/logo.png']}, dest)
        self.assertEqual(source.read_bytes(), dest.read_bytes())
        self.assertEqual(result['source_sha256'], digest)
        source.write_bytes(b'changed')
        with self.assertRaises(ValueError):
            provider.generate({'shot': {'id': '001'}}, dest)
    def test_invalid_manifest_types_fail_closed(self):
        self.make()
        self.write('asset-manifest.json', {'assets': ['invalid asset']})
        self.assertFalse(assets.validate_assets(self.root)['pass'])
    def test_imported_source_hash_is_verified_by_gate(self):
        m = self.make()
        m['assets'][0]['provenance'].update({'import_kind': 'local_original', 'source_path': str((self.root / 'nonexistent.png').resolve()), 'source_sha256': 'fake'})
        self.write('asset-manifest.json', m)
        self.assertFalse(assets.validate_assets(self.root)['pass'])
    def test_policy_changes_measured_logo_area_preserving_unbranded_source(self):
        self.write('experiment.json', {'policy': {'brand_prominence': .06}, 'arm': 'champion'})
        first = self.make()
        source = self.root / 'shots/001/source.png'
        original = source.read_bytes()
        self.write('experiment.json', {'policy': {'brand_prominence': .04}, 'arm': 'challenger'})
        second = self.make()
        self.assertEqual(original, source.read_bytes())
        self.assertEqual(first['assets'][0]['source_sha256'], second['assets'][0]['source_sha256'])
        self.assertGreater(first['assets'][0]['logo_provenance']['area_fraction'], second['assets'][0]['logo_provenance']['area_fraction'])
        self.assertNotEqual(first['experiment_config_hash'], second['experiment_config_hash'])
        self.assertTrue(assets.validate_assets(self.root)['pass'])
    def test_tampered_unbranded_source_and_oversize_policy_fail(self):
        self.make()
        (self.root / 'shots/001/source.png').write_bytes(b'tampered')
        self.assertFalse(assets.validate_assets(self.root)['pass'])
        self.write('experiment.json', {'policy': {'brand_prominence': .09}})
        with self.assertRaises(ValueError):
            self.make()
    def test_world_change_changes_fixture_source(self):
        first = self.make()['assets'][0]['sha256']
        self.write('world-bible.json', {'continuity_group': 'city', 'palette': 'cold blue'})
        self.assertNotEqual(first, self.make()['assets'][0]['sha256'])


if __name__ == '__main__':
    unittest.main()
