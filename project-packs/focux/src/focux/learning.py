"""Controlled, reversible one-variable policy comparisons over saved production evidence."""
from __future__ import annotations
import hashlib
import json
import math
import uuid
import sys
from contextlib import ExitStack
from pathlib import Path
from .core import FocuxError, digest, now, read, project_lock

MIN_PAIRS = 5
MAX_PAIRS = 100

def _error(message, code='insufficient_evidence'):
    raise FocuxError(message, code, 6)

def _setup(factory):
    with factory.connect() as c:
        c.executescript('''
        CREATE TABLE IF NOT EXISTS experiment_pairs(id TEXT PRIMARY KEY, experiment_id TEXT NOT NULL, champion_project TEXT NOT NULL, challenger_project TEXT NOT NULL, payload TEXT NOT NULL);
        CREATE UNIQUE INDEX IF NOT EXISTS pair_champion ON experiment_pairs(experiment_id,champion_project);
        CREATE UNIQUE INDEX IF NOT EXISTS pair_challenger ON experiment_pairs(experiment_id,challenger_project);
        CREATE TABLE IF NOT EXISTS experiment_promotions(experiment_id TEXT PRIMARY KEY, policy_version TEXT NOT NULL, payload TEXT NOT NULL);
        CREATE TRIGGER IF NOT EXISTS experiments_no_update BEFORE UPDATE ON experiments BEGIN SELECT RAISE(ABORT,'immutable experiment'); END;
        CREATE TRIGGER IF NOT EXISTS experiments_no_delete BEFORE DELETE ON experiments BEGIN SELECT RAISE(ABORT,'immutable experiment'); END;
        CREATE TRIGGER IF NOT EXISTS promotions_no_update BEFORE UPDATE ON experiment_promotions BEGIN SELECT RAISE(ABORT,'immutable promotion'); END;
        CREATE TRIGGER IF NOT EXISTS promotions_no_delete BEFORE DELETE ON experiment_promotions BEGIN SELECT RAISE(ABORT,'immutable promotion'); END;
        CREATE TRIGGER IF NOT EXISTS pairs_no_update BEFORE UPDATE ON experiment_pairs BEGIN SELECT RAISE(ABORT,'immutable paired evidence'); END;
        CREATE TRIGGER IF NOT EXISTS pairs_no_delete BEFORE DELETE ON experiment_pairs BEGIN SELECT RAISE(ABORT,'immutable paired evidence'); END;
        ''')

def create_experiment(factory, hypothesis, variable, challenger, context):
    _setup(factory)
    if not isinstance(hypothesis,str) or not hypothesis.strip() or not isinstance(context,str) or not context.strip():
        _error('A hypothesis and comparable production context are required','invalid_input')
    valid = (variable == 'brand_prominence' and type(challenger) in (int,float) and math.isfinite(challenger) and 0 < challenger <= .08) or (variable == 'manga_max' and type(challenger) is int and 0 <= challenger <= 3)
    if not valid:
        _error('Only brand_prominence (0,0.08] or manga_max integer [0,3] can vary','invalid_input')
    champion = factory.policy()
    if champion.get(variable) == challenger:
        _error('Challenger must change the declared variable','invalid_input')
    candidate = dict(champion); candidate[variable] = challenger
    experiment = {'id':'EXP-'+uuid.uuid4().hex[:16], 'schema_version':1, 'created_at':now(), 'hypothesis':hypothesis.strip(), 'variable':variable, 'changed_variables':[variable], 'context':context.strip(), 'champion_policy':champion, 'challenger_policy':candidate, 'minimum_comparable_pairs':max(MIN_PAIRS,champion.get('minimum_comparable_pairs',MIN_PAIRS)), 'maximum_pairs':MAX_PAIRS, 'metric':'paired human score uplift', 'status':'collecting'}
    experiment['definition_hash'] = digest(experiment)
    with factory.connect() as c:
        c.execute('INSERT INTO experiments VALUES (?,?)',(experiment['id'],json.dumps(experiment,sort_keys=True)))
    factory.event(None,'experiment_created',experiment)
    return experiment

def _experiment(factory, eid):
    _setup(factory)
    with factory.connect() as c:
        row=c.execute('SELECT payload FROM experiments WHERE id=?',(eid,)).fetchone()
    if not row:
        _error('Experiment not found','not_found')
    result=json.loads(row[0]); definition=dict(result); saved=definition.pop('definition_hash',None)
    if not saved or digest(definition)!=saved:
        _error('Experiment definition is not immutable controlled evidence','invalid_experiment')
    return result

def _creative_context(p):
    values={}
    for name in ('brief.json','story.json','world-bible.json','shotlist.json','beatmap.json'):
        if not (p/name).is_file():
            if name == 'beatmap.json': continue
            _error('Missing comparison input: '+name)
        value=read(p/name)
        if name=='brief.json':
            value={k:v for k,v in value.items() if k not in ('id','created_at','status')}
        if name=='beatmap.json':
            value={k:v for k,v in value.items() if k not in ('audio_path','analyzed_at')}
        values[name]=value
    return digest(values)

def _production(factory, experiment, pid, arm):
    p=factory.path(pid)
    try:
        config=read(p/'experiment.json')
        expected={'experiment_id':experiment['id'],'arm':arm,'context':experiment['context'],'policy':experiment[arm+'_policy']}
        if config != expected:
            _error('Project experiment config differs from the frozen '+arm+' policy')
        receipt=read(p/'receipt.json'); render=read(p/'render-receipt.json')
        # Receipt text alone is never technical proof: re-probe media and recheck files.
        from .media import evaluate_gates
        verified=evaluate_gates(p)
        if verified.get('technical_pass') is not True or verified.get('fixture') is not False:
            _error('Fresh production gates reject this render: '+str(verified.get('failures',[])))
        manifest=read(p/'asset-manifest.json')
        if manifest.get('fixture') is not False or manifest.get('experiment_config_hash')!=digest(config):
            _error('Production imagery is fixture data or not bound to the experiment')
        if manifest.get('applied_policy')!=expected['policy']:
            _error('Image generation did not apply the full frozen experiment policy')
        effects=render.get('applied_effects',{})
        if effects.get('manga_max')!=expected['policy']['manga_max']:
            _error('Render did not apply the frozen manga policy')
        source_hashes={}
        for asset in manifest.get('assets',[]):
            source=(p/asset['source_path']).resolve()
            if not source.is_relative_to(p) or not source.is_file():
                _error('Unbranded source is missing or outside project')
            actual=hashlib.sha256(source.read_bytes()).hexdigest()
            if actual!=asset.get('source_sha256'):
                _error('Unbranded source hash differs from actual bytes')
            source_hashes[asset['shot_id']]=actual
        if not source_hashes or len(source_hashes)!=len(manifest['assets']):
            _error('Unique per-shot original sources are required')
        beatmap=read(p/'beatmap.json')
        audio=Path(beatmap['audio_path'])
        audio=(audio if audio.is_absolute() else p/audio).resolve()
        if not audio.is_relative_to(p) or not audio.is_file():
            _error('Experiment audio must be a saved local project artifact')
        audio_hash=hashlib.sha256(audio.read_bytes()).hexdigest()
        if audio_hash!=render.get('audio_sha256'):
            _error('Actual audio differs from render evidence')
        source_set_hash=digest({'sources':source_hashes,'audio':audio_hash})
        context=factory.context_hash(p)
        if receipt.get('context_hash')!=context or receipt.get('experiment_config_hash')!=digest(config):
            _error('Render receipt does not bind the current production/config context')
        if render.get('experiment_config_hash')!=digest(config):
            _error('Renderer did not attest the experiment configuration')
        video=p/(pid+'.mp4')
        sha=hashlib.sha256(video.read_bytes()).hexdigest()
        if not video.stat().st_size or render.get('sha256')!=sha or render.get('technical_pass') is not True or render.get('fixture') is not False:
            _error('Pair requires intact, technically verified non-fixture renders')
        reviews=[r for r in factory.feedback_for(pid) if type(r['payload'].get('score')) in (int,float) and math.isfinite(r['payload']['score']) and 0 <= r['payload']['score'] <= 10]
        if not reviews:
            _error('Missing human score for the exact current context')
        review=max(reviews,key=lambda r:r['id'])
        return {'project_id':pid,'context_hash':context,'creative_hash':_creative_context(p),'render_sha256':sha,'config_hash':digest(config),'feedback_id':review['id'],'score':review['payload']['score'],'source_set_hash':source_set_hash,'raw_evidence_hash':digest(verified),'applied_effects_hash':digest(effects)}
    except (OSError,KeyError,TypeError,ValueError,RuntimeError) as exc:
        if isinstance(exc,FocuxError): raise
        _error('Incomplete production evidence: '+str(exc))

def record_pair(factory, experiment_id, champion_project, challenger_project):
    # Match Factory.promote's root -> sorted-project lock order; freeze inputs
    # across fresh verification and the SQLite evidence commit.
    with ExitStack() as locks:
        locks.enter_context(project_lock(factory.root))
        for pid in sorted({champion_project, challenger_project}):
            locks.enter_context(project_lock(factory.path(pid)))
        return _record_pair_locked(factory, experiment_id, champion_project, challenger_project)

def _record_pair_locked(factory, experiment_id, champion_project, challenger_project):
    experiment=_experiment(factory,experiment_id)
    if champion_project==challenger_project:
        _error('Two distinct productions are required')
    champion=_production(factory,experiment,champion_project,'champion')
    challenger=_production(factory,experiment,challenger_project,'challenger')
    if champion['source_set_hash']!=challenger['source_set_hash']:
        _error('Champion and challenger must use the same original shot sources and audio')
    if champion['creative_hash']!=challenger['creative_hash'] or champion['context_hash']==challenger['context_hash'] or champion['render_sha256']==challenger['render_sha256']:
        _error('Pair is not a controlled comparison of distinct rendered contexts')
    result={'id':'PAIR-'+uuid.uuid4().hex[:16],'experiment_id':experiment_id,'at':now(),'champion':champion,'challenger':challenger,'uplift':challenger['score']-champion['score']}
    with factory.connect() as c:
        c.execute('BEGIN IMMEDIATE')
        if c.execute('SELECT 1 FROM experiment_promotions WHERE experiment_id=?',(experiment_id,)).fetchone():
            _error('Experiment already promoted','conflict')
        rows=[json.loads(r[0]) for r in c.execute('SELECT payload FROM experiment_pairs WHERE experiment_id=?',(experiment_id,))]
        if len(rows)>=MAX_PAIRS:
            _error('Experiment pair limit reached','conflict')
        used_ids={r[a]['project_id'] for r in rows for a in ('champion','challenger')}
        used_hashes={r[a]['render_sha256'] for r in rows for a in ('champion','challenger')}
        used_source_sets={r['champion']['source_set_hash'] for r in rows}
        if champion['source_set_hash'] in used_source_sets:
            _error('The same source production cannot supply multiple independent pairs','duplicate_evidence')
        used_contexts={r[a]['context_hash'] for r in rows for a in ('champion','challenger')}
        if used_ids.intersection((champion_project,challenger_project)) or used_hashes.intersection((champion['render_sha256'],challenger['render_sha256'])) or used_contexts.intersection((champion['context_hash'],challenger['context_hash'])):
            _error('A production/version cannot be counted more than once','duplicate_evidence')
        c.execute('INSERT INTO experiment_pairs VALUES (?,?,?,?,?)',(result['id'],experiment_id,champion_project,challenger_project,json.dumps(result,sort_keys=True)))
    factory.event(None,'experiment_pair',result)
    return result

def _regressions():
    from .skill_checks import SKILLS, selftest
    root=Path(__file__).resolve().parents[2]/'skills'
    if not root.is_dir():
        root=Path(sys.prefix)/'share'/'focux'/'skills'
    try:
        results=[selftest(root/name) for name in SKILLS]
    except (OSError,ValueError) as exc:
        _error('Golden skill fixtures unavailable: '+str(exc),'regression_failed')
    if not all(r['passed'] for r in results):
        _error('Golden regression checks failed','regression_failed')
    return {'passed':True,'skills':len(results),'cases':sum(r['cases'] for r in results),'results_hash':digest(results)}

def promote(factory, experiment_id):
    # Factory.promote holds the outer factory lock. Do not reacquire it here.
    _experiment(factory,experiment_id)
    with factory.connect() as c:
        projects={r[k] for r in c.execute('SELECT champion_project,challenger_project FROM experiment_pairs WHERE experiment_id=?',(experiment_id,)) for k in (0,1)}
    with ExitStack() as locks:
        for pid in sorted(projects):
            locks.enter_context(project_lock(factory.path(pid)))
        return _promote_locked(factory, experiment_id)

def _promote_locked(factory, experiment_id):
    experiment=_experiment(factory,experiment_id)
    with factory.connect() as c:
        rows=[json.loads(r[0]) for r in c.execute('SELECT payload FROM experiment_pairs WHERE experiment_id=? ORDER BY id',(experiment_id,))]
    if len(rows)<experiment['minimum_comparable_pairs']:
        _error('At least five distinct comparable pairs are required')
    for pair in rows:
        for arm in ('champion','challenger'):
            current=_production(factory,experiment,pair[arm]['project_id'],arm)
            if current != pair[arm]:
                _error('Paired production or human score changed after collection; create a new experiment')
    uplift=sum(r['uplift'] for r in rows)/len(rows)
    if uplift<=0:
        _error('Average paired uplift must be positive')
    regressions=_regressions()
    policy=dict(experiment['challenger_policy'])
    policy['version']='v-exp-'+experiment_id.removeprefix('EXP-')
    result={'experiment_id':experiment_id,'policy':policy,'previous_version':experiment['champion_policy']['version'],'sample_size':len(rows),'mean_paired_uplift':uplift,'confidence':'observed positive paired mean; statistical significance not asserted','regressions':regressions,'pair_ids':[r['id'] for r in rows],'promoted_at':now()}
    with factory.connect() as c:
        c.execute('BEGIN IMMEDIATE')
        active=c.execute("SELECT value FROM settings WHERE key='champion'").fetchone()[0]
        if active!=experiment['champion_policy']['version']:
            _error('Champion changed during the experiment; rebase evidence','conflict')
        if c.execute('SELECT 1 FROM experiment_promotions WHERE experiment_id=?',(experiment_id,)).fetchone():
            _error('Experiment already promoted','conflict')
        c.execute('INSERT INTO policy_versions VALUES (?,?)',(policy['version'],json.dumps(policy,sort_keys=True)))
        c.execute('INSERT INTO experiment_promotions VALUES (?,?,?)',(experiment_id,policy['version'],json.dumps(result,sort_keys=True)))
        c.execute("UPDATE settings SET value=? WHERE key='champion'",(policy['version'],))
    factory.event(None,'policy_promotion',result)
    return result
