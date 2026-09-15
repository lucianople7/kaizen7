import json
import os
import sys
import types
import subprocess
import hashlib
from pathlib import Path
import unittest
import uuid
import wave
from unittest.mock import patch

import numpy as np
from PIL import Image, ImageDraw
from focux.media import analyze_music, create_test_audio, render_video, evaluate_gates


class MediaTests(unittest.TestCase):
    def setUp(self):
        self.root = Path('work/media-tests') / uuid.uuid4().hex
        self.root.mkdir(parents=True)

    def test_loop_is_not_production_music(self):
        path = self.root / 'loop.wav'
        sr = 22050
        t = np.arange(sr) / sr
        pulse = .5 * np.sin(2*np.pi*120*t) * np.exp(-20*(t % .5))
        with wave.open(str(path), 'wb') as f:
            f.setparams((1, 2, sr, 0, 'NONE', 'not compressed'))
            f.writeframes((np.tile(pulse, 24)*32767).astype('<i2').tobytes())
        result = analyze_music(path)
        self.assertFalse(result['production_ready'])
        self.assertIn('repetitive', ' '.join(result['reasons']))

    def test_fixture_is_explicit_and_has_real_beats(self):
        path = self.root / 'fixture.wav'
        create_test_audio(path)
        result = analyze_music(path)
        self.assertTrue(result['fixture'])
        self.assertFalse(result['production_ready'])
        self.assertGreater(len(result['beats']), 10)
        self.assertAlmostEqual(result['duration'], 24, places=1)
        self.assertEqual(len(result['sections']), 6)

    def test_real_render_streams_and_gate(self):
        p = self.root
        create_test_audio(p / 'music.wav')
        beatmap = analyze_music(p / 'music.wav')
        beatmap['audio_path'] = 'music.wav'
        for name, value in [('beatmap', beatmap), ('world-bible', {'title':'TEST'})]:
            (p / (name+'.json')).write_text(json.dumps(value), encoding='utf-8')
        shots = []
        assets = []
        for i in range(4):
            target = p / f'{i}.png'
            Image.new('RGB', (1080,1920), (30+i*30,50,80)).save(target)
            shots.append({'id':str(i),'duration':6,'mode':'STATIC_PLUS','motion':{'kind':['slow_push','horizontal_drift','vertical_reveal','slow_pull'][i]},'transition':'fade' if i==1 else 'cut'})
            assets.append({'shot_id':str(i),'path':target.name})
        foreground=Image.new('RGBA',(1080,1920),(0,0,0,0))
        ImageDraw.Draw(foreground).rectangle((320,450,760,1450),fill=(230,40,20,255))
        foreground.save(p/'foreground.png')
        shots[0]['motion']={'kind':'parallax_depth','background_path':'0.png','foreground_path':'foreground.png'}
        clip=p/'independent.mp4'
        subprocess.run([os.environ['FOCUX_FFMPEG'],'-v','error','-f','lavfi','-i','testsrc2=size=320x568:rate=30','-t','7','-c:v','libx264','-preset','ultrafast',str(clip)],check=True,capture_output=True)
        shots[3]['mode']='MOTION'
        shots[3]['motion']={'kind':'local_clip','video_path':clip.name,'video_provenance':{'source_kind':'independent_clip','root_source_id':'testsrc-generated-once','sha256':hashlib.sha256(clip.read_bytes()).hexdigest(),'fixture':True}}
        (p/'shotlist.json').write_text(json.dumps({'shots':shots}))
        (p/'asset-manifest.json').write_text(json.dumps({'assets':assets}))
        gate = types.ModuleType('focux.assets')
        gate.validate_assets = lambda root: {'pass':False}
        with patch.dict(sys.modules, {'focux.assets':gate}):
            with self.assertRaises(ValueError):
                render_video(p)
            gate.validate_assets = lambda root: {'pass':True}
            valid_motion=shots[3]['motion']
            for invalid_motion,reason in [
                ({**valid_motion,'video_path':'../escape.mp4'},'escapes'),
                ({**valid_motion,'video_provenance':{**valid_motion['video_provenance'],'source_kind':'storyboard'}},'independent clip provenance'),
                ({**valid_motion,'video_provenance':{**valid_motion['video_provenance'],'sha256':'bad'}},'checksum mismatch')]:
                shots[3]['motion']=invalid_motion
                (p/'shotlist.json').write_text(json.dumps({'shots':shots}))
                with self.assertRaisesRegex(ValueError,reason):render_video(p)
            short=p/'short.mp4'
            subprocess.run([os.environ['FOCUX_FFMPEG'],'-v','error','-i',str(clip),'-t','0.5','-c','copy',str(short)],check=True,capture_output=True)
            shots[3]['motion']={**valid_motion,'video_path':short.name,'video_provenance':{**valid_motion['video_provenance'],'sha256':hashlib.sha256(short.read_bytes()).hexdigest()}}
            (p/'shotlist.json').write_text(json.dumps({'shots':shots}))
            with self.assertRaisesRegex(ValueError,'too short'):render_video(p)
            shots[3]['motion']=valid_motion
            valid_shot2=shots[2]
            shots[2]={**valid_shot2,'mode':'MOTION','motion':{**valid_motion,'video_provenance':{**valid_motion['video_provenance'],'root_source_id':'different-claimed-root'}}}
            (p/'shotlist.json').write_text(json.dumps({'shots':shots}))
            with self.assertRaisesRegex(ValueError,'Duplicate MOTION clip bytes'):render_video(p)
            shots[2]=valid_shot2
            (p/'shotlist.json').write_text(json.dumps({'shots':shots}))
            result = render_video(p)
        self.assertTrue(result['technical_pass'])
        self.assertTrue(result['fixture'])
        self.assertTrue(result['commands'])
        self.assertGreater(result['elapsed_seconds'],0)
        self.assertIn('ffmpeg',result['tool_versions'])
        self.assertIn(str((p/'0.png').resolve()),result['source_hashes'])
        streams = result['probe']['streams']
        video = next(s for s in streams if s['codec_type']=='video')
        self.assertEqual((video['width'],video['height']), (1080,1920))
        self.assertTrue(any(s['codec_type']=='audio' for s in streams))
        self.assertIn(str((p/'foreground.png').resolve()),result['source_hashes'])
        self.assertIn(str(clip.resolve()),result['source_hashes'])
        def raw_frame(seconds):
            return subprocess.run([os.environ['FOCUX_FFMPEG'],'-v','error','-ss',str(seconds),'-i',result['video_path'],'-frames:v','1','-vf','scale=108:192','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],check=True,capture_output=True).stdout
        self.assertNotEqual(raw_frame(.2),raw_frame(5.5))
        self.assertNotEqual(raw_frame(18.5),raw_frame(22.5))
        self.assertEqual(evaluate_gates(p)['gates'][16]['status'], 'pass')
        with Path(result['video_path']).open('ab') as f:
            f.write(b'receipt tampering that leaves mp4 streams readable')
        tampered=evaluate_gates(p)['gates'][16]
        self.assertEqual(tampered['status'], 'fail')
        self.assertTrue(tampered['evidence']['probe']['streams'])
        Path(result['video_path']).write_bytes(b'not an mp4')
        self.assertEqual(evaluate_gates(p)['gates'][16]['status'], 'fail')

    def test_zero_manga_policy_and_image_fixture_receipt(self):
        p=self.root
        create_test_audio(p/'music.wav')
        analysis=analyze_music(p/'music.wav')
        analysis.update({'fixture':False,'production_ready':True})
        analysis['audio_path']='music.wav'
        (p/'0.png').write_bytes(b'not decoded because command runner is mocked')
        for name,value in {'beatmap.json':analysis,'world-bible.json':{},'shotlist.json':{'shots':[{'id':'0','duration':24,'mode':'STATIC_PLUS','motion':{'kind':'static'}}]},'asset-manifest.json':{'fixture':False,'assets':[{'shot_id':'0','path':'0.png','provenance':{'fixture':True}}]},'experiment.json':{'policy':{'manga_max':0}}}.items():
            (p/name).write_text(json.dumps(value))
        gate=types.ModuleType('focux.assets')
        gate.validate_assets=lambda root:{'pass':True}
        mutate=False
        def fake_run(args,timeout=180):
            if '-version' in args:return b'test ffmpeg version'
            if '-show_streams' in args:
                return json.dumps({'streams':[{'codec_type':'video','width':1080,'height':1920,'r_frame_rate':'30/1'},{'codec_type':'audio'}],'format':{'duration':'24'}}).encode()
            Path(args[-1]).write_bytes(b'technical render mock')
            if mutate and Path(args[-1]).name==p.name+'.mp4':
                (p/'0.png').write_bytes(b'source modified during render')
            return b''
        with patch.dict(sys.modules,{'focux.assets':gate}), patch('focux.media.analyze_music',return_value=analysis), patch('focux.media._run',side_effect=fake_run):
            result=render_video(p)
        self.assertTrue(result['fixture'])
        self.assertEqual(result['applied_effects']['manga_max'],0)
        self.assertEqual(json.loads((p/'timeline/overlays.json').read_text()),[])
        self.assertTrue(result['experiment_config_hash'])
        Path(result['video_path']).unlink()
        (p/'render-receipt.json').unlink()
        mutate=True
        with patch.dict(sys.modules,{'focux.assets':gate}), patch('focux.media.analyze_music',return_value=analysis), patch('focux.media._run',side_effect=fake_run):
            with self.assertRaisesRegex(ValueError,'Sources changed during render'):
                render_video(p)
        self.assertFalse((p/'render-receipt.json').exists())
        Path(result['video_path']).unlink()
        (p/'experiment.json').unlink()
        (p/'policy.json').write_text(json.dumps({'version':'promoted-v2','manga_max':1}))
        mutate=False
        with patch.dict(sys.modules,{'focux.assets':gate}), patch('focux.media.analyze_music',return_value=analysis), patch('focux.media._run',side_effect=fake_run):
            promoted=render_video(p)
        self.assertEqual(promoted['applied_effects'],{'manga_max':1,'manga_hit_count':1})
        self.assertIsNone(promoted['experiment_config_hash'])
        self.assertIn('policy.json',promoted['input_hashes'])


if __name__ == '__main__':
    unittest.main()
