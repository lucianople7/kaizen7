import hashlib
import os
import shutil
import json
import unittest
from unittest.mock import patch
import uuid
from pathlib import Path
from focux.core import Factory, FocuxError, write, digest, project_lock
from focux.learning import create_experiment, record_pair, promote

class LearningTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parents[1] / 'work' / ('learning-unit-' + uuid.uuid4().hex)
        self.root.mkdir(parents=True)
        self.f = Factory(self.root)
        # Decision tests isolate the real technical gateway explicitly. Media correctness is
        # exercised by the separate unmocked forged-MP4 regression below.
        self.verifier = patch('focux.media.evaluate_gates', return_value={'technical_pass':True,'fixture':False,'gates':[]})
        self.verified_gateway = self.verifier.start()
        self.addCleanup(self.verifier.stop)
        self.ex = create_experiment(self.f, 'Smaller logo feels natural', 'brand_prominence', .04, 'Tokyo/night')

    def pair(self, i, score=9):
        ids=[]
        for arm, offset, value in [('champion', 0, 7), ('challenger', 1, score)]:
            pid=f'SIGNAL-{i*2+offset+101:03}'
            self.f.create('Tokyo experiment', pid)
            p=self.f.path(pid)
            config={'experiment_id':self.ex['id'],'arm':arm,'policy':self.ex[arm+'_policy'],'context':self.ex['context']}
            write(p/'experiment.json',config)
            # Tiny bytes are a UNIT TEST receipt fixture, not proof of rendered media.
            video=p/(pid+'.mp4'); video.write_bytes(('unit-test-render-'+pid).encode())
            source=p/'shots/001/source.png'; source.parent.mkdir(parents=True); source.write_bytes(('original-'+str(i)).encode())
            audio=p/'music/track.wav'; audio.parent.mkdir(); audio.write_bytes(('music-'+str(i)).encode())
            write(p/'beatmap.json',{'audio_path':'music/track.wav'})
            write(p/'asset-manifest.json',{'fixture':False,'experiment_config_hash':digest(config),'schema_version':1,'production_ready':None,'applied_policy':dict(config['policy']),'assets':[{'shot_id':'001','source_path':'shots/001/source.png','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest()}]})
            write(p/'render-receipt.json',{'technical_pass':True,'fixture':False,'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'experiment_config_hash':digest(config),'audio_sha256':hashlib.sha256(audio.read_bytes()).hexdigest(),'applied_effects':{'manga_max':config['policy']['manga_max'],'manga_hit_count':config['policy']['manga_max']}})
            receipt={'context_hash':self.f.context_hash(p),'experiment_config_hash':digest(config)}
            write(p/'receipt.json',receipt)
            self.f.feedback(pid,score=value)
            ids.append(pid)
        return ids

    def test_five_distinct_pairs_promote_and_rollback(self):
        for i in range(5):
            record_pair(self.f,self.ex['id'],*self.pair(i))
        result=self.f.promote(self.ex['id'])
        self.assertEqual(result['policy']['brand_prominence'],.04)
        self.assertEqual(result['sample_size'],5)
        self.assertEqual(self.f.policy()['version'],result['policy']['version'])
        self.assertEqual(self.f.policy_rollback('v1')['brand_prominence'],.06)
        self.assertTrue(self.f.audit()['pass'])

    def test_real_verifier_rejects_forged_mp4_receipt(self):
        if not (os.environ.get('FOCUX_FFPROBE') or shutil.which('ffprobe')):
            self.skipTest('Real ffprobe required for malformed-MP4 regression')
        ids=self.pair(1)
        self.verifier.stop()
        with self.assertRaises(FocuxError):
            record_pair(self.f,self.ex['id'],*ids)
        # Fresh gate output exists: rejection did not merely trust technical_pass.
        gates=self.f.path(ids[0])/'.gates.jsonl'
        self.assertTrue(gates.exists())
        evidence=json.loads(gates.read_text().splitlines()[-1])
        self.assertIn('G17',evidence['failures'])
        reason=next(g for g in evidence['gates'] if g['id']=='G17')['evidence']['reason']
        self.assertNotIn('missing; set',reason)
        self.assertTrue('Invalid data' in reason or 'moov atom not found' in reason,reason)

    def test_unrelated_source_art_rejected(self):
        ids=self.pair(1)
        p=self.f.path(ids[1]); source=p/'shots/001/source.png'; source.write_bytes(b'different original')
        manifest=json.loads((p/'asset-manifest.json').read_text())
        manifest['assets'][0]['source_sha256']=hashlib.sha256(source.read_bytes()).hexdigest()
        write(p/'asset-manifest.json',manifest)
        receipt=json.loads((p/'receipt.json').read_text()); receipt['context_hash']=self.f.context_hash(p); write(p/'receipt.json',receipt)
        self.f.feedback(ids[1],score=9)
        with self.assertRaises(FocuxError): record_pair(self.f,self.ex['id'],*ids)

    def test_repeated_pair_does_not_inflate_sample(self):
        ids=self.pair(1)
        record_pair(self.f,self.ex['id'],*ids)
        with self.assertRaises(FocuxError): record_pair(self.f,self.ex['id'],*ids)
        with self.assertRaises(FocuxError): promote(self.f,self.ex['id'])

    def test_changed_context_invalidates_human_score(self):
        ids=self.pair(1)
        p=self.f.path(ids[1])
        value=json.loads((p/'story.json').read_text()); value['extra']='drift'; write(p/'story.json',value)
        with self.assertRaises(FocuxError): record_pair(self.f,self.ex['id'],*ids)

    def test_locked_production_blocks_pair_and_promotion(self):
        pairs=[self.pair(i) for i in range(5)]
        with project_lock(self.f.path(pairs[0][1])):
            with self.assertRaises(FocuxError): record_pair(self.f,self.ex['id'],*pairs[0])
        for ids in pairs: record_pair(self.f,self.ex['id'],*ids)
        with project_lock(self.f.path(pairs[-1][0])):
            with self.assertRaises(FocuxError): self.f.promote(self.ex['id'])
        self.assertEqual(self.f.policy()['version'],'v1')

    def test_manifest_other_policy_change_rejected(self):
        ids=self.pair(1)
        p=self.f.path(ids[1]); manifest=json.loads((p/'asset-manifest.json').read_text())
        manifest['applied_policy']['manga_max']=0
        write(p/'asset-manifest.json',manifest)
        with self.assertRaises(FocuxError): record_pair(self.f,self.ex['id'],*ids)

    def test_render_manga_effect_mismatch_rejected(self):
        ids=self.pair(1)
        p=self.f.path(ids[1]); receipt=json.loads((p/'render-receipt.json').read_text())
        receipt['applied_effects']['manga_max']=0
        write(p/'render-receipt.json',receipt)
        with self.assertRaises(FocuxError): record_pair(self.f,self.ex['id'],*ids)

    def test_nonpositive_uplift_cannot_promote(self):
        for i in range(5): record_pair(self.f,self.ex['id'],*self.pair(i,6))
        with self.assertRaises(FocuxError): promote(self.f,self.ex['id'])

    def test_fixture_render_cannot_be_production_evidence(self):
        ids=self.pair(1)
        p=self.f.path(ids[0])
        receipt=json.loads((p/'render-receipt.json').read_text()); receipt['fixture']=True
        write(p/'render-receipt.json',receipt)
        with self.assertRaises(FocuxError): record_pair(self.f,self.ex['id'],*ids)

    def test_second_policy_variable_rejected(self):
        ids=self.pair(1)
        p=self.f.path(ids[1]); config=json.loads((p/'experiment.json').read_text())
        config['policy']['manga_max']=1
        write(p/'experiment.json',config)
        with self.assertRaises(FocuxError): record_pair(self.f,self.ex['id'],*ids)

    def test_whitelist_and_unchanged_variable_rejected(self):
        for variable, value in [('unknown',1),('brand_prominence',.06),('manga_max',99)]:
            with self.assertRaises(FocuxError): create_experiment(self.f,'hypothesis',variable,value,'night')

    def test_post_pair_asset_tampering_blocks_promotion(self):
        pairs=[self.pair(i) for i in range(5)]
        for ids in pairs: record_pair(self.f,self.ex['id'],*ids)
        p=self.f.path(pairs[0][0]); (p/(pairs[0][0]+'.mp4')).write_bytes(b'tampered')
        with self.assertRaises(FocuxError): promote(self.f,self.ex['id'])

if __name__ == '__main__': unittest.main()
