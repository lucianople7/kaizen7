"""Bounded local CPU media processing; quality metrics never certify aesthetics."""
from __future__ import annotations

import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import time
import uuid
import wave

import numpy as np
from PIL import Image


def _binary(name):
    result = os.environ.get('FOCUX_' + name.upper()) or shutil.which(name)
    if not result:
        raise RuntimeError(f'{name} missing; set FOCUX_{name.upper()}')
    return str(result)


def _run(args, timeout=180):
    result = subprocess.run(args, capture_output=True, timeout=timeout, shell=False)
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf-8', errors='replace')[-4000:])
    return result.stdout


def _write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')


def _local(root, value):
    candidate = Path(value)
    candidate = (root / candidate).resolve() if not candidate.is_absolute() else candidate.resolve()
    if not candidate.is_relative_to(root.resolve()):
        raise ValueError('Asset path escapes project directory')
    if not candidate.is_file():
        raise ValueError(f'Missing asset: {candidate.name}')
    return candidate


def analyze_music(path: Path, _runner=None) -> dict:
    run=_runner or _run
    path = Path(path).resolve()
    probe = json.loads(run([_binary('ffprobe'), '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)]))
    duration = float(probe['format']['duration'])
    if not math.isfinite(duration) or not 1 <= duration <= 600:
        raise ValueError('Audio must be between 1 and 600 seconds')
    raw = run([_binary('ffmpeg'), '-v', 'error', '-i', str(path), '-vn', '-ac', '1', '-ar', '22050', '-f', 'f32le', 'pipe:1'])
    samples = np.frombuffer(raw, dtype='<f4')
    if not len(samples) or not np.isfinite(samples).all():
        raise ValueError('Invalid decoded audio')
    hop = 220
    usable = len(samples)//hop*hop
    frames = samples[:usable].reshape(-1,hop)
    rms = np.sqrt(np.mean(frames**2,axis=1))
    onset = np.maximum(0, np.diff(rms, prepend=0))
    threshold = max(float(np.percentile(onset,80)),float(onset.max())*.08)
    peaks = []
    for i in range(1,len(onset)-1):
        if onset[i] > threshold and onset[i] >= onset[i-1] and onset[i] >= onset[i+1]:
            if not peaks or i-peaks[-1] > 20:
                peaks.append(i)
            elif onset[i] > onset[peaks[-1]]:
                peaks[-1] = i
    beats = [round(i*hop/22050,4) for i in peaks]
    intervals = np.diff(beats)
    valid = intervals[(intervals>=.25)&(intervals<=1.2)]
    bpm = float(60/np.median(valid)) if len(valid) else 0.0
    # Compare windowed energy at multiple repeat periods. A stable loop lacks
    # arrangement variation even when every transient is successfully detected.
    energy_cv = float(np.std(rms)/(np.mean(rms)+1e-9))
    section_rms = [float(np.sqrt(np.mean(s*s))) for s in np.array_split(samples,6)]
    section_cv = float(np.std(section_rms)/(np.mean(section_rms)+1e-9))
    correlation = 0.0
    for lag in range(25,min(801,len(rms)//2),5):
        a,b = rms[:-lag],rms[lag:]
        if np.std(a)>1e-6 and np.std(b)>1e-6:
            correlation = max(correlation,float(np.corrcoef(a,b)[0,1]))
    silent = float(np.sqrt(np.mean(samples*samples))) < .001
    repetitive = section_cv < .06 and (correlation>.90 or energy_cv<.10)
    sidecar = path.with_suffix(path.suffix+'.fixture.json')
    fixture = False
    if sidecar.is_file():
        data = json.loads(sidecar.read_text(encoding='utf-8'))
        fixture = data.get('sha256') == hashlib.sha256(path.read_bytes()).hexdigest() and data.get('fixture') is True
    reasons = []
    if silent:
        reasons.append('silent audio')
    if repetitive:
        reasons.append('repetitive loop lacks structural variation')
    if len(beats)<4:
        reasons.append('insufficient detectable beats')
    if fixture:
        reasons.append('TEST AUDIO NOT FINAL MUSIC')
    return {'audio_path':str(path),'duration':duration,'beats':beats,'bpm':round(bpm,2),
            'sections':[{'start':round(i*duration/6,3),'end':round((i+1)*duration/6,3),'rms':r,'method':'measured_equal_windows'} for i,r in enumerate(section_rms)],
            'fixture':fixture,'production_ready':not reasons,'technical_usable':not silent,
            'reasons':reasons,'review_required':True,
            'metrics':{'section_rms':section_rms,'section_cv':section_cv,'energy_cv':energy_cv,'repeat_correlation':correlation}}


def create_test_audio(path: Path, duration=24) -> dict:
    path = Path(path)
    if path.exists():
        raise FileExistsError(path)
    if not 20 <= duration <= 30:
        raise ValueError('Fixture duration must be 20–30 seconds')
    path.parent.mkdir(parents=True,exist_ok=True)
    sr = 22050
    t = np.arange(round(duration*sr))/sr
    section = np.minimum((t/(duration/4)).astype(int),3)
    frequency = np.choose(section,[110.,146.83,164.81,130.81])
    phase = np.cumsum(frequency)/sr*2*np.pi
    gain = np.choose(section,[.30,.55,.85,.42])
    pulse = np.exp(-25*(t%.5))
    signal = gain*(.5*np.sin(2*np.pi*65*t)*pulse + .16*np.sin(phase) + .08*np.sin(phase*1.5))
    signal *= np.minimum(t/.15,1)*np.minimum((duration-t)/.5,1)
    with wave.open(str(path),'wb') as f:
        f.setparams((1,2,sr,0,'NONE','not compressed'))
        f.writeframes((signal*32767).astype('<i2').tobytes())
    metadata = {'fixture':True,'label':'TEST AUDIO NOT FINAL MUSIC','license':'Original synthetic test fixture; CC0-1.0',
                'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    _write(path.with_suffix(path.suffix+'.fixture.json'),metadata)
    return metadata


def render_video(project_dir: Path) -> dict:
    from .assets import validate_assets
    root = Path(project_dir).resolve()
    started=time.monotonic()
    commands=[]
    def run(args,timeout=180):
        command_start=time.monotonic()
        output=_run(args,timeout=timeout)
        commands.append({'argv':args,'elapsed_seconds':round(time.monotonic()-command_start,4),'exit_code':0})
        return output
    snapshot={}
    def snapshot_file(path):
        path=Path(path).resolve()
        snapshot[str(path)]=hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
    for name in ('shotlist.json','asset-manifest.json','beatmap.json','world-bible.json','experiment.json','policy.json','brand/logo.png'):
        snapshot_file(root/name)
    gate = validate_assets(root)
    if gate.get('pass') is not True:
        raise ValueError('Asset validation gate failed: '+json.dumps(gate.get('failures',[])))
    def read(name):
        return json.loads((root/name).read_text(encoding='utf-8-sig'))
    shots = read('shotlist.json')['shots']
    manifest=read('asset-manifest.json')
    assets = {str(a['shot_id']):a for a in manifest['assets']}
    beatmap = read('beatmap.json')
    world=read('world-bible.json')
    config=read('experiment.json') if (root/'experiment.json').is_file() else None
    production_policy=read('policy.json') if (root/'policy.json').is_file() else {}
    manga_max=(config.get('policy',{}).get('manga_max',3) if config else production_policy.get('manga_max',world.get('manga_rules',{}).get('max_hits',3)))
    if isinstance(manga_max,bool) or not isinstance(manga_max,int) or not 0<=manga_max<=3:
        raise ValueError('manga_max must be an integer from 0 to 3')
    config_hash=hashlib.sha256(json.dumps(config,sort_keys=True,ensure_ascii=False,allow_nan=False).encode()).hexdigest() if config is not None else None
    audio_path = Path(beatmap['audio_path'])
    audio_path = audio_path.resolve() if audio_path.is_absolute() else _local(root,audio_path)
    snapshot_file(audio_path)
    snapshot_file(audio_path.with_suffix(audio_path.suffix+'.fixture.json'))
    for asset in assets.values():
        snapshot_file(_local(root,asset['path']))
        for anchor in asset.get('anchor_paths',[]):
            snapshot_file(_local(root,anchor))
    versions={name:run([_binary(name),'-version']).decode('utf-8',errors='replace').splitlines()[0] for name in ('ffmpeg','ffprobe')}
    music = analyze_music(audio_path,_runner=run)
    fixture=bool(music.get('fixture') or manifest.get('fixture') or any(a.get('provenance',{}).get('fixture') for a in assets.values()))
    if not music['production_ready'] and not (music['fixture'] and music['technical_usable']):
        raise ValueError('Music quality gate failed: '+', '.join(music['reasons']))
    durations = [float(s['duration']) for s in shots]
    total = sum(durations)
    if not shots or len(shots)>30 or not all(math.isfinite(d) and d>=.5 for d in durations) or not 20<=total<=30:
        raise ValueError('Timeline must contain 20–30 seconds, with shots at least 0.5 seconds')
    if music['duration'] + .05 < total:
        raise ValueError('Audio is shorter than timeline')
    # Frame-quantized nearest beats, bounded to 200 ms from authored cuts.
    cuts = [0.0]
    desired = 0.0
    for duration in durations[:-1]:
        desired += duration
        nearest = min(music['beats'],key=lambda b:abs(b-desired)) if music['beats'] else desired
        cut = nearest if abs(nearest-desired)<=.20 else desired
        cuts.append(round(cut*30)/30)
    cuts.append(round(total*30)/30)
    media_plans=[]
    clip_roots=set()
    clip_hashes=set()
    for i,shot in enumerate(shots):
        media_spec={**assets[str(shot['id'])].get('motion',{}),**shot.get('motion',{})}
        mode=shot.get('mode','STATIC_PLUS')
        plan={'mode':mode,'spec':media_spec}
        if mode=='MOTION':
            video_path=_local(root,media_spec.get('video_path',''))
            provenance=media_spec.get('video_provenance',{})
            source_root=provenance.get('root_source_id')
            provenance_text=json.dumps(provenance).lower()
            if provenance.get('source_kind')!='independent_clip' or not source_root or source_root in clip_roots or any(term in provenance_text for term in ('storyboard','contact sheet','contact_sheet','collage','crop')):
                raise ValueError('MOTION requires independent clip provenance, never a storyboard/contact sheet')
            clip_hash=hashlib.sha256(video_path.read_bytes()).hexdigest()
            if clip_hash!=provenance.get('sha256'):
                raise ValueError('MOTION clip checksum mismatch')
            if clip_hash in clip_hashes:
                raise ValueError('Duplicate MOTION clip bytes across shots')
            clip_hashes.add(clip_hash)
            clip_roots.add(source_root)
            snapshot_file(video_path)
            clip_probe=json.loads(run([_binary('ffprobe'),'-v','error','-show_streams','-show_format','-of','json',str(video_path)]))
            video_streams=[s for s in clip_probe.get('streams',[]) if s.get('codec_type')=='video']
            length=float(clip_probe.get('format',{}).get('duration',0))
            if not video_streams or not math.isfinite(length) or length<cuts[i+1]-cuts[i] or length>600:
                raise ValueError('MOTION clip is missing video, too short, or exceeds 600 seconds')
            plan.update({'video_path':video_path,'probe':clip_probe})
            fixture=fixture or bool(provenance.get('fixture'))
        elif mode=='STATIC_PLUS' and media_spec.get('kind')=='parallax_depth':
            bg=_local(root,media_spec.get('background_path',''))
            fg=_local(root,media_spec.get('foreground_path',''))
            if bg==fg:
                raise ValueError('Parallax requires separate background and foreground files')
            if bg!=_local(root,assets[str(shot['id'])]['path']):
                raise ValueError('Parallax background must be the validated independent master')
            with Image.open(bg) as background, Image.open(fg) as foreground:
                if foreground.mode!='RGBA' or foreground.size!=background.size or min(background.size)<256:
                    raise ValueError('Parallax requires a registered RGBA foreground and same-size background')
                low,high=foreground.getchannel('A').getextrema()
                if low==255 or high==0:
                    raise ValueError('Parallax foreground requires visible content and real transparency')
            snapshot_file(bg)
            snapshot_file(fg)
            plan.update({'background_path':bg,'foreground_path':fg})
        elif mode!='STATIC_PLUS':
            raise ValueError(f'Unsupported shot mode: {mode}')
        media_plans.append(plan)
    timeline = root/'timeline'
    timeline.mkdir(exist_ok=True)
    final = root/(root.name+'.mp4')
    if final.exists():
        raise FileExistsError(f'Render already exists: {final.name}')
    render_work = timeline / ('render-' + uuid.uuid4().hex)
    render_work.mkdir()
    segments=[]
    events=[]
    for i,shot in enumerate(shots):
        frames = round((cuts[i+1]-cuts[i])*30)
        asset = _local(root,assets[str(shot['id'])]['path'])
        plan=media_plans[i]
        mode=plan['mode']
        motion = plan['spec'].get('kind','slow_push') if mode=='STATIC_PLUS' else 'local_clip'
        if motion=='local_clip' and mode!='MOTION':
            raise ValueError('local_clip requires MOTION mode')
        zoom = f'1+0.045*on/{max(frames-1,1)}' if motion=='slow_push' else f'1.045-0.045*on/{max(frames-1,1)}'
        if motion not in ('slow_push','slow_pull','static','horizontal_drift','vertical_reveal','parallax_depth','local_clip'):
            raise ValueError(f'Unsupported camera move: {motion}')
        if motion=='static':
            zoom='1.025'
        x,y='iw/2-iw/zoom/2','ih/2-ih/zoom/2'
        if motion=='horizontal_drift':
            zoom='1.08'
            x=f'(iw-iw/zoom)*on/{max(frames-1,1)}'
        if motion=='vertical_reveal':
            zoom='1.08'
            y=f'(ih-ih/zoom)*(1-on/{max(frames-1,1)})'
        transition=shot.get('transition','cut')
        if isinstance(transition,dict):
            transition=transition.get('kind','cut')
        if transition not in ('cut','fade'):
            raise ValueError(f'Unsupported transition: {transition}')
        inputs=['-i',str(asset)]
        filter_arg='-vf'
        filt=f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='{zoom}':x='{x}':y='{y}':d={frames}:s=1080x1920:fps=30,setsar=1,format=yuv420p"
        sources={'master':str(asset.relative_to(root))}
        if motion=='parallax_depth':
            inputs=['-loop','1','-framerate','30','-i',str(plan['background_path']),'-loop','1','-framerate','30','-i',str(plan['foreground_path'])]
            filter_arg='-filter_complex'
            filt=f"[0:v]scale=1134:2016:force_original_aspect_ratio=increase,crop=1080:1920:x='54*n/{max(frames-1,1)}':y=48,setpts=PTS-STARTPTS[bg];[1:v]scale=1080:1920,format=rgba,setpts=PTS-STARTPTS[fg];[bg][fg]overlay=x='-18+36*n/{max(frames-1,1)}':y=0:shortest=1,setsar=1,format=yuv420p"
            sources.update({k:str(plan[k].relative_to(root)) for k in ('background_path','foreground_path')})
        elif mode=='MOTION':
            inputs=['-i',str(plan['video_path'])]
            filt='scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setpts=PTS-STARTPTS,setsar=1,format=yuv420p'
            sources['video_path']=str(plan['video_path'].relative_to(root))
        if transition=='fade':
            filt+=f',fade=t=in:d=0.1,fade=t=out:st={max(frames/30-.1,0)}:d=0.1'
        segment=render_work/f'shot-{i:03d}.mp4'
        run([_binary('ffmpeg'),'-v','error','-n',*inputs,'-filter_complex_threads','1',filter_arg,filt,'-frames:v',str(frames),'-an','-c:v','libx264','-preset','ultrafast','-crf','20','-threads','2',str(segment)],timeout=300)
        segments.append(segment)
        events.append({'shot_id':str(shot['id']),'start':cuts[i],'end':cuts[i+1],'frames':frames,'mode':mode,'motion':motion,'transition':transition,'asset':str(asset.relative_to(root)),'sources':sources})
    listing=render_work/'concat.txt'
    listing.write_text(''.join(f"file '{p.name}'\n" for p in segments),encoding='utf-8')
    # Sparse graphic accent, stored independently in timeline metadata.
    overlays=[{'kind':'manga','style':'speed_lines','start':round(total*f,2),'end':round(total*f+.2,2),'x':72,'y':1750,'width':180,'height':3} for f in (.33,.66)][:manga_max]
    _write(timeline/'overlays.json',overlays)
    _write(timeline/'timeline.json',{'width':1080,'height':1920,'fps':30,'duration':total,'shots':events,'overlays':overlays,'audio_path':str(audio_path),'fixture':fixture})
    snapshot_file(timeline/'timeline.json')
    snapshot_file(timeline/'overlays.json')
    vf=','.join(f"drawbox=x=72:y={1750-offset}:w={180-offset}:h=3:color=white@0.65:t=fill:enable='between(t,{accent['start']},{accent['end']})'" for accent in overlays for offset in (0,20,40)) or 'null'
    run([_binary('ffmpeg'),'-v','error','-n','-f','concat','-safe','1','-i',str(listing),'-i',str(audio_path),'-map','0:v:0','-map','1:a:0','-vf',vf,'-af',f'afade=t=in:d=0.25,afade=t=out:st={total-.8}:d=0.8,volume=0.85','-t',str(total),'-c:v','libx264','-preset','ultrafast','-crf','20','-threads','2','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',str(final)],timeout=600)
    probe=json.loads(run([_binary('ffprobe'),'-v','error','-show_streams','-show_format','-of','json',str(final)]))
    videos=[s for s in probe['streams'] if s['codec_type']=='video']
    audios=[s for s in probe['streams'] if s['codec_type']=='audio']
    passed=bool(len(videos)==1 and audios and videos[0]['width']==1080 and videos[0]['height']==1920 and videos[0]['r_frame_rate']=='30/1' and abs(float(probe['format']['duration'])-total)<.15)
    changes=[name for name,h in snapshot.items() if (hashlib.sha256(Path(name).read_bytes()).hexdigest() if Path(name).is_file() else None)!=h]
    if changes:
        raise ValueError('Sources changed during render; final is unverified: '+', '.join(changes))
    receipt={'technical_pass':passed,'status':'PASS' if passed else 'FAIL','fixture':fixture,'production_ready':False,'human_review_required':True,'aesthetics_verified':False,'video_path':str(final),'duration':float(probe['format']['duration']),'sha256':hashlib.sha256(final.read_bytes()).hexdigest(),'probe':probe,'music_analysis':music,'source_hashes':snapshot,'commands':commands,'tool_versions':versions,'elapsed_seconds':round(time.monotonic()-started,4),'applied_effects':{'manga_max':manga_max,'manga_hit_count':len(overlays)},'experiment_config_hash':config_hash}
    receipt['input_hashes']={name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in ('shotlist.json','asset-manifest.json','beatmap.json','world-bible.json','timeline/timeline.json','timeline/overlays.json')}
    if (root/'policy.json').is_file():
        receipt['input_hashes']['policy.json']=snapshot[str((root/'policy.json').resolve())]
    receipt['audio_sha256']=hashlib.sha256(audio_path.read_bytes()).hexdigest()
    _write(root/'render-receipt.json',receipt)
    if not passed:
        raise RuntimeError('Rendered file failed ffprobe verification')
    return receipt


def evaluate_gates(project_dir: Path) -> dict:
    """Recompute technical evidence; never turn metadata into aesthetic approval."""
    from .assets import validate_assets, perceptual_hash
    root=Path(project_dir).resolve()
    def read(name):
        try:
            return json.loads((root/name).read_text(encoding='utf-8-sig'))
        except (OSError,ValueError):
            return {}
    shots=read('shotlist.json').get('shots',[])
    manifest=read('asset-manifest.json')
    assets=manifest.get('assets',[])
    world=read('world-bible.json')
    policy={'opening_min':.5,'opening_max':2.,'shot_min':.5,'shot_max':4.,'beat_tolerance':.2,'brand_prominence_max':.08,**world.get('gate_policy',{})}
    timeline=read('timeline/timeline.json')
    beatmap=read('beatmap.json')
    receipt=read('render-receipt.json')
    asset_gate=validate_assets(root)
    gates=[]
    def gate(number,name,passed,evidence):
        gates.append({'id':f'G{number:02d}','name':name,'status':'pending' if passed is None else ('pass' if passed else 'fail'),
                      'evidence_id':'sha256:'+hashlib.sha256(json.dumps(evidence,sort_keys=True).encode()).hexdigest(), 'evidence':evidence})
    final=root/(root.name+'.mp4')
    verified=False
    probe={}
    reason='render missing'
    if final.is_file():
        try:
            probe=json.loads(_run([_binary('ffprobe'),'-v','error','-show_streams','-show_format','-of','json',str(final)]))
            video=next(s for s in probe['streams'] if s['codec_type']=='video')
            audio=next(s for s in probe['streams'] if s['codec_type']=='audio')
            actual_hash=hashlib.sha256(final.read_bytes()).hexdigest()
            inputs_match=bool(receipt.get('input_hashes')) and all((root/n).is_file() and (root/n).resolve().is_relative_to(root) and hashlib.sha256((root/n).read_bytes()).hexdigest()==h for n,h in receipt.get('input_hashes',{}).items())
            sources_match=bool(receipt.get('source_hashes')) and all((hashlib.sha256(Path(n).read_bytes()).hexdigest() if Path(n).is_file() else None)==h for n,h in receipt.get('source_hashes',{}).items())
            verified=(receipt.get('sha256')==actual_hash and inputs_match and sources_match and video['width']==1080 and video['height']==1920 and video['r_frame_rate']=='30/1' and audio['codec_name']=='aac' and 20<=float(probe['format']['duration'])<=30 and abs(float(probe['format']['duration'])-float(timeline.get('duration',0)))<.15)
            reason='ffprobe, final SHA256 and render input hashes verified' if verified else 'stream, duration, SHA256 or input receipt mismatch'
        except (OSError,ValueError,RuntimeError,StopIteration,KeyError,subprocess.TimeoutExpired) as exc:
            reason=str(exc)
    videos=[s for s in probe.get('streams',[]) if s.get('codec_type')=='video']
    measured_duration=float(probe.get('format',{}).get('duration',0))
    gate(1,'duration 20–30 sec',20<=measured_duration<=30,{'seconds':measured_duration,'source':'actual ffprobe'})
    gate(2,'9:16',bool(videos and videos[0]['width']*16==videos[0]['height']*9),{'streams':videos})
    gate(3,'independent production shots',bool(asset_gate['pass']),asset_gate)
    durations=[float(s.get('duration',0)) for s in shots]
    gate(4,'opening shot duration acceptable',bool(durations and policy['opening_min']<=durations[0]<=policy['opening_max']),{'seconds':durations[:1],'bounds':[policy['opening_min'],policy['opening_max']]})
    gate(5,'shot duration limits',bool(durations and all(policy['shot_min']<=d<=policy['shot_max'] for d in durations)),{'seconds':durations,'bounds':[policy['shot_min'],policy['shot_max']]})
    gate(6,'beatmap exists',bool(beatmap.get('beats') and beatmap.get('sections')),{'beats':len(beatmap.get('beats',[])),'sections':beatmap.get('sections',[])})
    music={}
    try:
        audio_path=Path(beatmap['audio_path'])
        audio_path=audio_path.resolve() if audio_path.is_absolute() else _local(root,audio_path)
        music=analyze_music(audio_path)
        audio_hash=hashlib.sha256(audio_path.read_bytes()).hexdigest()
    except (OSError,ValueError,RuntimeError,KeyError,subprocess.TimeoutExpired) as exc:
        music={'production_ready':False,'technical_usable':False,'reasons':[str(exc)]}
        audio_hash=None
    errors=[min((abs(float(e['start'])-float(b)) for b in music.get('beats',[])),default=999) for e in timeline.get('shots',[])[1:]]
    gate(7,'important cuts aligned to music',bool(errors and max(errors)<=policy['beat_tolerance']),{'max_error_seconds':max(errors,default=None),'tolerance':policy['beat_tolerance'],'source':'fresh audio analysis'})
    gate(8,'continuity metadata valid',bool(asset_gate['pass'] and assets and all(a.get('continuity_group') and a.get('anchor_paths') and a.get('anchor_hashes') for a in assets)),{'asset_gate':asset_gate['pass'],'groups':[a.get('continuity_group') for a in assets]})
    phashes=[]
    duplicates_ok=bool(assets)
    try:
        for asset in assets:
            phashes.append(perceptual_hash(_local(root,asset['path'])))
        threshold=int(world.get('perceptual_duplicate_threshold',5))
        duplicates_ok=duplicates_ok and all((int(a,16)^int(b,16)).bit_count()>threshold for i,a in enumerate(phashes) for b in phashes[i+1:])
    except (OSError,ValueError,KeyError):
        duplicates_ok=False
    gate(9,'duplicate detection PASS',duplicates_ok,{'actual_perceptual_hashes':phashes,'threshold':world.get('perceptual_duplicate_threshold',5)})
    branded=[a for a in assets if a.get('logo_provenance',{}).get('applied')]
    gate(10,'FOCUX brand frequency acceptable',1<=len(branded)<=2,{'branded_shots':len(branded),'allowed':[1,2]})
    prominence=[a.get('logo_provenance',{}).get('area_fraction') for a in branded]
    gate(11,'brand prominence acceptable',None,{'source_area_fractions':prominence,'maximum':policy['brand_prominence_max'],'required':'Measure logo area in rendered frames after crop and camera transforms; source area alone cannot pass output prominence','naturalness_review':'pending'})
    overlay_data=read('timeline/overlays.json')
    overlays=overlay_data if isinstance(overlay_data,list) else []
    manga=[o for o in overlays if o.get('kind')=='manga']
    gate(12,'manga count acceptable',len(manga)<=3,{'count':len(manga),'maximum':3})
    lengths=[float(o['end'])-float(o['start']) for o in manga]
    gate(13,'manga hit duration acceptable',all(.1<=d<=.5 for d in lengths),{'seconds':lengths,'bounds':[.1,.5],'zero_hits_allowed':True})
    gate(14,'visual quality threshold',None,{'required':'human visual review of rendered frames','automatic_score':None})
    canonical=root/'brand/logo.png'
    logo_hash=hashlib.sha256(canonical.read_bytes()).hexdigest() if canonical.is_file() else None
    gate(15,'logo/text integrity',bool(branded and logo_hash and asset_gate['pass'] and all(a['logo_provenance'].get('sha256')==logo_hash and a['logo_provenance'].get('original_preserved') is True for a in branded)),{'canonical_png_sha256':logo_hash,'limitation':'Canonical PNG provenance only; human review must inspect other generated text'})
    fixture=bool(manifest.get('fixture',False) or music.get('fixture',False) or any(a.get('provenance',{}).get('fixture') for a in assets))
    music_ok=bool(music.get('production_ready') or music.get('fixture') and music.get('technical_usable'))
    gate(16,'audio technical validation',music_ok and audio_hash==receipt.get('audio_sha256'),{'analysis':music,'source_matches_render':audio_hash==receipt.get('audio_sha256'),'fixture_exception':bool(music.get('fixture'))})
    gate(17,'ffprobe/render validation',verified,{'reason':reason,'probe':probe,'receipt_sha256':receipt.get('sha256')})
    gate(18,'critic threshold',None,{'required':'human editorial review','automatic_score':None})
    result={'gates':gates,'fixture':fixture,'pass':all(g['status']=='pass' for g in gates),'technical_pass':all(g['status']=='pass' for g in gates if g['id'] not in ('G14','G18') and not (g['id']=='G11' and g['status']=='pending')),'production_ready':False,'failures':[g['id'] for g in gates if g['status']=='fail'],'pending':[g['id'] for g in gates if g['status']=='pending']}
    with (root/'.gates.jsonl').open('a',encoding='utf-8') as out:
        out.write(json.dumps(result,ensure_ascii=False)+'\n')
    return result
