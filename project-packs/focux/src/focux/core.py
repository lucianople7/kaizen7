"""Shared application service for CLI and MCP; external actions fail closed."""
from __future__ import annotations
import hashlib
import json
import re
import shutil
import sqlite3
import uuid
import os
from contextlib import contextmanager
from functools import wraps
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from . import __version__

def now() -> str:
    return datetime.now(timezone.utc).isoformat()

def digest(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False, allow_nan=False).encode()).hexdigest()

def read(path: Path) -> dict:
    return json.loads(path.read_text(encoding='utf-8'))

def write(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + '.' + uuid.uuid4().hex + '.tmp')
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False), encoding='utf-8')
    temp.replace(path)

class FocuxError(ValueError):
    def __init__(self, message: str, code: str = 'invalid_input', exit_code: int = 2):
        super().__init__(message)
        self.code, self.exit_code = code, exit_code

@contextmanager
def project_lock(path: Path):
    """OS advisory lock, automatically released on process death."""
    handle=(path/'.production.lock').open('a+b')
    try:
        if handle.tell()==0:handle.write(b'0');handle.flush()
        handle.seek(0)
        try:
            if os.name=='nt':
                import msvcrt
                msvcrt.locking(handle.fileno(),msvcrt.LK_NBLCK,1)
            else:
                import fcntl
                fcntl.flock(handle.fileno(),fcntl.LOCK_EX|fcntl.LOCK_NB)
        except OSError:raise FocuxError('Project is busy; retry after its current action completes','busy',4)
        yield
    finally:handle.close()

def exclusive(method):
    @wraps(method)
    def call(self,project_id,*args,**kwargs):
        with project_lock(self.path(project_id)):return method(self,project_id,*args,**kwargs)
    return call

class Factory:
    def __init__(self, root: str | Path):
        self.root = Path(root).resolve()
        (self.root / 'data').mkdir(parents=True, exist_ok=True)
        for folder in ['projects', 'library/images', 'library/video', 'library/audio', 'library/brand', 'library/manga', 'library/textures', 'library/worlds']:
            (self.root / folder).mkdir(parents=True, exist_ok=True)
        self.db = self.root / 'data/focux.db'
        with self.connect() as c:
            c.executescript('''
            CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS learning_events(id INTEGER PRIMARY KEY, at TEXT NOT NULL, project_id TEXT, stage TEXT NOT NULL, payload TEXT NOT NULL, previous_hash TEXT NOT NULL, hash TEXT NOT NULL);
            CREATE TRIGGER IF NOT EXISTS events_no_update BEFORE UPDATE ON learning_events BEGIN SELECT RAISE(ABORT,'immutable evidence'); END;
            CREATE TRIGGER IF NOT EXISTS events_no_delete BEFORE DELETE ON learning_events BEGIN SELECT RAISE(ABORT,'immutable evidence'); END;
            CREATE TABLE IF NOT EXISTS assets(asset_id TEXT PRIMARY KEY, sha256 TEXT NOT NULL, metadata TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS lessons(context_hash TEXT PRIMARY KEY, project_id TEXT NOT NULL, evidence TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS experiments(id TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS policy_versions(version TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS prompt_versions(version TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS failure_patterns(class TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS asset_performance(id TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS motion_performance(id TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS brand_placement_performance(id TEXT PRIMARY KEY, payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
            ''')
            c.execute('INSERT OR IGNORE INTO settings VALUES (?,?)', ('factory_id', str(uuid.uuid4())))
            c.execute('INSERT OR IGNORE INTO settings VALUES (?,?)', ('champion', 'v1'))
            c.execute('INSERT OR IGNORE INTO policy_versions VALUES (?,?)', ('v1', json.dumps({'version':'v1','brand_prominence':0.06,'manga_max':3,'minimum_comparable_pairs':5})))
            c.execute('INSERT OR IGNORE INTO prompt_versions VALUES (?,?)', ('v1', json.dumps({'version':'v1','template':'world + anchors + previous/current/next; independent cinematic master, no collage'})))
            for failure, lesson in [('storyboard_as_production_asset','Storyboard is planning only; independent masters are required.'),('duplicate_source_asset','Camera motion does not establish scene diversity.'),('weak_music_structure','Music needs structural evolution; a loop is not finished music.')]:
                c.execute('INSERT OR IGNORE INTO failure_patterns VALUES (?,?)', (failure, json.dumps({'class':failure,'lesson':lesson,'source':'owner supplied failure report','sample_size':None,'verified_locally':False})))

    def connect(self):
        c = sqlite3.connect(self.db, timeout=30)
        c.row_factory = sqlite3.Row
        return c

    def event(self, project: str | None, stage: str, payload: dict) -> dict:
        payload={'application_version':__version__,'policy_version':self.policy()['version'],**payload}
        with self.connect() as c:
            c.execute('BEGIN IMMEDIATE')
            previous = c.execute('SELECT hash FROM learning_events ORDER BY id DESC LIMIT 1').fetchone()
            item = {'at':now(),'project_id':project,'stage':stage,'payload':payload,'previous_hash':previous[0] if previous else '0'*64}
            item['hash'] = digest(item)
            c.execute('INSERT INTO learning_events(at,project_id,stage,payload,previous_hash,hash) VALUES (?,?,?,?,?,?)', (item['at'],project,stage,json.dumps(payload,sort_keys=True),item['previous_hash'],item['hash']))
            item['id'] = c.execute('SELECT last_insert_rowid()').fetchone()[0]
        return item

    def audit(self) -> dict:
        previous = '0'*64
        with self.connect() as c: rows = c.execute('SELECT * FROM learning_events ORDER BY id').fetchall()
        for r in rows:
            entry = {k:r[k] for k in ['at','project_id','stage','previous_hash']}
            entry['payload'] = json.loads(r['payload'])
            if r['previous_hash'] != previous or digest(entry) != r['hash']:
                return {'pass':False,'event_id':r['id']}
            previous = r['hash']
        return {'pass':True,'events':len(rows),'head':previous}

    def status(self) -> dict:
        with self.connect() as c:
            projects = [dict(r) for r in c.execute('SELECT * FROM projects ORDER BY id')]
            fid = c.execute("SELECT value FROM settings WHERE key='factory_id'").fetchone()[0]
        return {'factory_id':fid,'version':__version__,'root':str(self.root),'projects':projects,'external_actions':'disabled','audit':self.audit()}

    def path(self, project_id: str) -> Path:
        if not re.fullmatch(r'SIGNAL-\d{3,9}', project_id): raise FocuxError('Invalid project id')
        path = (self.root / 'projects' / project_id).resolve()
        if not path.is_relative_to(self.root / 'projects'): raise FocuxError('Project escapes factory root')
        if not path.is_dir(): raise FocuxError('Project not found', 'not_found', 3)
        return path

    def context_hash(self, p: Path) -> str:
        names = ['brief.json','story.json','world-bible.json','shotlist.json','beatmap.json','asset-manifest.json','storyboard.json','timeline/timeline.json','timeline/overlays.json','render-receipt.json','experiment.json','policy.json']
        values = {n:read(p/n) for n in names if (p/n).is_file()}
        for f in sorted(p.glob('shots/*/master.*')): values[str(f.relative_to(p))] = hashlib.sha256(f.read_bytes()).hexdigest()
        for f in [p/(p.name+'.mp4'),p/'brand/logo.png']:
            if f.is_file():values[str(f.relative_to(p))]=hashlib.sha256(f.read_bytes()).hexdigest()
        if (p/'beatmap.json').is_file():
            audio=Path(read(p/'beatmap.json').get('audio_path',''))
            if not audio.is_absolute():audio=p/audio
            if audio.is_file():values['audio_bytes']=hashlib.sha256(audio.read_bytes()).hexdigest()
        return digest(values)

    def create(self, title: str, project_id: str | None = None) -> dict:
        if not isinstance(title,str) or not 1 <= len(title.strip()) <= 200: raise FocuxError('Title must contain 1–200 characters')
        with self.connect() as c:
            c.execute('BEGIN IMMEDIATE')
            if project_id is None:
                ids = [int(r[0].split('-')[1]) for r in c.execute('SELECT id FROM projects')]
                project_id = f'SIGNAL-{max(ids,default=0)+1:03}'
            if not re.fullmatch(r'SIGNAL-\d{3,9}',project_id): raise FocuxError('Invalid project id')
            p = self.root/'projects'/project_id
            if p.exists(): raise FocuxError('Project already exists', 'conflict', 4)
            p.mkdir(parents=True)
            c.execute('INSERT INTO projects VALUES (?,?,?)',(project_id,title.strip(),now()))
            beats = ['rain / arrival','approach metro','train arrival','window reflection','exit into city','ramen / fire','crowd / human energy','night movement / taxi','rooftop release']
            durations = [1.0,2.5,2.5,3.0,2.5,3.0,3.0,3.0,3.5]
            world = {'world_id':'tokyo-night-v1','world':'cinematic Tokyo after dark','city':'Tokyo','neighborhoods':['Shinjuku','metro','night food street','rooftop'],'time':'night','weather':'light rain','lighting':'practical city lights','palette':'natural local color; no global black/gold filter','camera_language':'observational cinematic','lens_tendencies':['35mm','50mm'],'film_grain':'subtle','protagonist_anchor':'refs/protagonist.png','wardrobe':'dark navy jacket','hair':'short dark hair','recurring_props':['clear umbrella'],'visual_mood':'arrival, energy, release','focux_visual_dna':'cinematic reality with subtle in-world canonical logo','manga_rules':{'max_hits':3,'duration_ms':[100,500],'separate_layers':True},'forbidden_visual_traits':['contact sheet','collage','baked manga','generated brand text'],'continuity_group':'tokyo-night-v1','anchors':[]}
            shots = [{'id':f'{i+1:03}','brief':beat,'duration':durations[i],'mode':'STATIC_PLUS','motion':{'kind':['slow_push','slow_pull','horizontal_drift'][i%3]},'continuity_group':world['continuity_group'],'brand_presence':i==1} for i,beat in enumerate(beats)]
            write(p/'brief.json',{'id':project_id,'title':title.strip(),'created_at':now(),'version':1,'duration':24,'format':'1080x1920','fps':30,'status':'planned','creative_template':'tokyo-night-v1','template_scope':'Tokyo sequence; edit story/world for other concepts'})
            write(p/'story.json',{'hook':beats[0],'arc':'arrival → immersion → release','beats':beats,'template_version':'v1'})
            write(p/'world-bible.json',world)
            write(p/'shotlist.json',{'shots':shots,'expected_shot_count':9})
            write(p/'policy.json',self.policy())
            if (self.root/'library/brand/logo.png').is_file():
                (p/'brand').mkdir(); shutil.copy2(self.root/'library/brand/logo.png',p/'brand/logo.png')
            write(p/'receipt.json',{'project_id':project_id,'version':__version__,'status':'planned','costs':{'incurred':0,'currency':'USD'},'external_actions':[]})
        self.event(project_id,'story',{'action':'create','context_hash':self.context_hash(p),'policy_version':self.policy()['version'],'prompt_version':'v1','creative_review':'required'})
        self.event(project_id,'world_bible',{'artifact':'world-bible.json','hash':digest(world),'visual_continuity':'requires independent anchors and review'})
        self.event(project_id,'shot_planning',{'artifact':'shotlist.json','hash':digest(shots),'shot_count':len(shots)})
        return self.project_get(project_id)

    def project_get(self, project_id: str) -> dict:
        p = self.path(project_id)
        return {'id':project_id,'path':str(p),'brief':read(p/'brief.json'),'shotlist':read(p/'shotlist.json'),'receipt':read(p/'receipt.json'),'context_hash':self.context_hash(p)}

    @exclusive
    def assets_generate(self, project_id: str, fixture: bool = False) -> dict:
        p = self.path(project_id)
        if not fixture:
            self.event(project_id,'image_generation',{'status':'blocked','failure_class':'external_provider_failure','reason':'Live provider/budget approval not configured'})
            raise FocuxError('Live image generation requires configured provider and separate budget approval. Use --fixture only for technical tests.', 'approval_required', 5)
        from .providers import FixtureImageProvider
        from .assets import generate_assets
        from .media import create_test_audio, analyze_music
        music = p/'music/test.wav'
        music.parent.mkdir(exist_ok=True)
        if not music.exists(): create_test_audio(music,24)
        write(p/'beatmap.json',analyze_music(music))
        self.event(project_id,'music_analysis',{'artifact':'beatmap.json','hash':digest(read(p/'beatmap.json')),'fixture':True})
        self.event(project_id,'library_retrieval',{'query':'tokyo night','candidates':[a['asset_id'] for a in self.library_search('tokyo night')],'selected':[],'reason':'Fixture run only reuses verified project masters; production cross-project selection needs continuity review'})
        manifest = generate_assets(p,FixtureImageProvider())
        for a in manifest.get('assets',[]): self.register_asset(project_id,a)
        self.event(project_id,'brand_placement',{'assets':[{'shot_id':a['shot_id'],'logo_provenance':a['logo_provenance']} for a in manifest['assets']],'visual_review':'required'})
        self.event(project_id,'image_generation',{'fixture':True,'context_hash':self.context_hash(p),'assets':len(manifest.get('assets',[])),'cost':0})
        return manifest

    @exclusive
    def assets_import(self, project_id: str, source_manifest: str, audio: str) -> dict:
        from .providers import LocalImageProvider
        from .assets import generate_assets
        from .media import analyze_music
        p=self.path(project_id)
        source=Path(audio).resolve()
        if not source.is_file():raise FocuxError('Audio file missing','not_found',3)
        target=p/'music'/source.name
        target.parent.mkdir(exist_ok=True)
        if target.exists() and hashlib.sha256(target.read_bytes()).digest()!=hashlib.sha256(source.read_bytes()).digest():
            raise FocuxError('Existing imported audio differs; use a new project','conflict',4)
        if not target.exists():shutil.copy2(source,target)
        sidecar=source.with_suffix(source.suffix+'.fixture.json')
        if sidecar.exists():shutil.copy2(sidecar,target.with_suffix(target.suffix+'.fixture.json'))
        write(p/'beatmap.json',analyze_music(target))
        self.event(project_id,'library_retrieval',{'query':read(p/'brief.json')['title'],'candidates':[a['asset_id'] for a in self.library_search('tokyo')],'selected':'explicit local source manifest'})
        result=generate_assets(p,LocalImageProvider(Path(source_manifest)))
        for asset in result['assets']:self.register_asset(project_id,asset)
        self.event(project_id,'local_asset_import',{'context_hash':self.context_hash(p),'fixture':result['fixture'],'rights':'operator supplied; no licensing claim inferred'})
        return result

    def register_asset(self, project_id: str, asset: dict) -> dict:
        file = (self.path(project_id)/asset['path']).resolve()
        if not file.is_relative_to(self.path(project_id)) or not file.is_file(): raise FocuxError('Asset path invalid')
        sha = hashlib.sha256(file.read_bytes()).hexdigest()
        aid = 'ASSET-'+sha[:20]
        dest = self.root/'library/images'/(sha+file.suffix.lower())
        if not dest.exists(): shutil.copy2(file,dest)
        with self.connect() as c:
            old = c.execute('SELECT metadata FROM assets WHERE asset_id=?',(aid,)).fetchone()
            history = json.loads(old[0]) if old else {}
            meta = {**asset,'asset_id':aid,'file_path':str(dest),'sha256':sha,'created_at':history.get('created_at',now()),'city':'Tokyo','mood':'night','location_type':read(self.path(project_id)/'shotlist.json')['shots'][int(asset['shot_id'])-1]['brief'],'production_ids':sorted(set(history.get('production_ids',[])+[project_id])),'reuse_count':len(set(history.get('production_ids',[])+[project_id]))-1,'quality_score':None,'critic_score':None,'human_score':None,'subjects':[],'lighting':None,'camera':None,'shot_type':None,'brand_presence':asset.get('logo_provenance',{}).get('applied',False),'brand_placement':asset.get('logo_provenance',{}).get('placement'),'brand_prominence':asset.get('logo_provenance',{}).get('area_fraction'),'manga_level':0,'world_id':read(self.path(project_id)/'world-bible.json').get('world_id'),'prompt':read(self.path(project_id)/f"shots/{asset['shot_id']}/brief.json") if (self.path(project_id)/f"shots/{asset['shot_id']}/brief.json").exists() else None}
            c.execute('INSERT OR REPLACE INTO assets VALUES (?,?,?)',(aid,sha,json.dumps(meta)))
        return meta

    def library_search(self, query: str = '') -> list[dict]:
        terms = query.lower().split()
        with self.connect() as c: rows = [json.loads(r[0]) for r in c.execute('SELECT metadata FROM assets ORDER BY asset_id')]
        return [r for r in rows if all(t in json.dumps(r).lower() for t in terms)]

    def library_inspect(self, asset_id: str) -> dict:
        with self.connect() as c: row = c.execute('SELECT metadata FROM assets WHERE asset_id=?',(asset_id,)).fetchone()
        if not row: raise FocuxError('Asset not found','not_found',3)
        meta = json.loads(row[0]); file = Path(meta['file_path']).resolve()
        meta['integrity_pass'] = file.is_relative_to(self.root/'library') and file.is_file() and hashlib.sha256(file.read_bytes()).hexdigest()==meta['sha256']
        return meta

    def assets_validate(self, project_id: str) -> dict:
        from .assets import validate_assets
        result = validate_assets(self.path(project_id))
        self.event(project_id,'asset_validation',result)
        return result

    def storyboard(self, project_id: str) -> dict:
        p=self.path(project_id)
        gate=self.assets_validate(project_id)
        if not gate['pass']: raise FocuxError('Production asset gate failed','asset_gate_failed',6)
        data={'role':'planning_only','production_source':False,'shots':read(p/'shotlist.json')['shots'],'source_manifest_hash':digest(read(p/'asset-manifest.json'))}
        write(p/'storyboard.json',data)
        self.event(project_id,'storyboard',{'artifact':'storyboard.json','hash':digest(data)})
        return data

    @exclusive
    def render(self, project_id: str) -> dict:
        from .media import render_video
        p=self.path(project_id)
        self.storyboard(project_id)
        result=render_video(p)
        self.event(project_id,'motion',{'timeline_hash':digest(read(p/'timeline/timeline.json')),'overlays_hash':digest(read(p/'timeline/overlays.json')),'applied_effects':result.get('applied_effects')})
        self.event(project_id,'render',result)
        receipt=read(p/'receipt.json')
        receipt.update({'render':result,'context_hash':self.context_hash(p),'status':'rendered_requires_review','audit_head':self.audit()['head'],'policy_version':self.policy()['version'],'experiment_config_hash':digest(read(p/'experiment.json')) if (p/'experiment.json').exists() else None})
        write(p/'receipt.json',receipt)
        return result

    def critique(self, project_id: str) -> dict:
        from .media import evaluate_gates
        p=self.path(project_id); gate=self.assets_validate(project_id)
        gates=evaluate_gates(p)
        rendered=(p/(project_id+'.mp4')).is_file()
        feedback=self.feedback_for(project_id)
        approved=any(x['payload'].get('approve') for x in feedback)
        fixture=read(p/'asset-manifest.json').get('fixture',True) if (p/'asset-manifest.json').is_file() else True
        result={'asset_gate':gate,'gates':gates,'render_exists':rendered,'human_review':approved,'fixture':fixture,'production_ready':False,'critic_score':None,'reason':'Technical checks are not an aesthetic critic score. Dimension-specific human review remains required.','context_hash':self.context_hash(p)}
        write(p/'qa.json',result); self.event(project_id,'critic',result)
        return result

    def feedback_for(self, project_id: str) -> list[dict]:
        context=self.context_hash(self.path(project_id))
        with self.connect() as c: rows=c.execute("SELECT * FROM learning_events WHERE project_id=? AND stage='human_feedback'",(project_id,)).fetchall()
        return [{'id':r['id'],'payload':json.loads(r['payload'])} for r in rows if json.loads(r['payload']).get('context_hash')==context]

    @exclusive
    def feedback(self, project_id: str, score: float | None = None, note: str | None = None, approve: bool = False, actor: str = 'human') -> dict:
        p=self.path(project_id)
        if score is not None and (isinstance(score,bool) or not 0<=score<=10): raise FocuxError('Score must be 0–10')
        if score is None and not note and not approve: raise FocuxError('Feedback is empty')
        if note and len(note)>4000: raise FocuxError('Note too long')
        payload={'score':score,'note':note,'approve':approve,'scope':'creative_review_only','context_hash':self.context_hash(p)}
        payload['actor']=actor
        if actor != 'human' and approve: raise FocuxError('Agent cannot grant human approval','forbidden',5)
        self.event(project_id,'human_feedback' if actor=='human' else 'agent_feedback',payload)
        return payload

    def learn(self, project_id: str) -> dict:
        p=self.path(project_id); context=self.context_hash(p); feedback=self.feedback_for(project_id)
        eid='EXP-'+context[:16]
        experiment={'id':eid,'context':'Tokyo/night','hypothesis':'Lower brand prominence may improve naturalness','changed_variables':['brand_prominence'],'champion':self.policy()['brand_prominence'],'challenger':0.04,'rollback':self.policy()['brand_prominence'],'metric':'human_score','status':'proposed','minimum_comparable_pairs':5,'evidence_ids':[x['id'] for x in feedback],'pairs':[]}
        result={'project_id':project_id,'context_hash':context,'sample_size':1 if feedback else 0,'confidence':'insufficient','improvement_proven':False,'evidence_ids':experiment['evidence_ids'],'observations':[x['payload'] for x in feedback],'proposal':experiment,'uncertainty':'No controlled comparison yet; repeated feedback on one production is one sample.'}
        with self.connect() as c:
            c.execute('INSERT OR REPLACE INTO lessons VALUES (?,?,?)',(context,project_id,json.dumps(result)))
            c.execute('INSERT OR IGNORE INTO experiments VALUES (?,?)',(eid,json.dumps(experiment)))
        write(p/'learning.json',result); self.event(project_id,'learning',result)
        return result

    def learning_report(self) -> dict:
        with self.connect() as c:
            lessons=[json.loads(r[0]) for r in c.execute('SELECT evidence FROM lessons ORDER BY context_hash')]
            failures=[json.loads(r[0]) for r in c.execute('SELECT payload FROM failure_patterns ORDER BY class')]
        return {'sample_size':len({x['project_id'] for x in lessons if x['sample_size']}),'lessons':lessons,'failure_patterns':failures,'improvement_proven':False,'policy':self.policy(),'next':'Collect controlled, comparable human reviews before promotion.'}

    def policy(self) -> dict:
        with self.connect() as c:
            v=c.execute("SELECT value FROM settings WHERE key='champion'").fetchone()[0]
            return json.loads(c.execute('SELECT payload FROM policy_versions WHERE version=?',(v,)).fetchone()[0])

    def experiments(self) -> list[dict]:
        with self.connect() as c: return [json.loads(r[0]) for r in c.execute('SELECT payload FROM experiments')]

    def promote(self, experiment_id: str) -> dict:
        from .learning import promote
        with project_lock(self.root):return promote(self,experiment_id)

    @exclusive
    def experiment_assign(self, project_id: str, experiment_id: str, arm: str) -> dict:
        from .learning import _experiment
        p=self.path(project_id)
        if arm not in ['champion','challenger']:raise FocuxError('Arm must be champion or challenger')
        if (p/'asset-manifest.json').exists() or (p/'experiment.json').exists():raise FocuxError('Assign once, before asset production','conflict',4)
        experiment=_experiment(self,experiment_id)
        config={'experiment_id':experiment_id,'arm':arm,'context':experiment['context'],'policy':experiment[arm+'_policy']}
        write(p/'experiment.json',config)
        self.event(project_id,'experiment_assignment',{'config':config,'hash':digest(config)})
        return config

    def policy_rollback(self, version: str) -> dict:
        with self.connect() as c:
            row=c.execute('SELECT payload FROM policy_versions WHERE version=?',(version,)).fetchone()
            if not row: raise FocuxError('Unknown policy version','not_found',3)
            c.execute("UPDATE settings SET value=? WHERE key='champion'",(version,))
        self.event(None,'policy_rollback',{'version':version})
        return json.loads(row[0])
