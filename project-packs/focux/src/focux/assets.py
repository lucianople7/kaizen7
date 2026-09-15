"""Independent master generation and fail-closed asset gate.

Provenance and similarity checks cannot prove that adversarially forged images
are not contact-sheet crops; production requires trustworthy provider records.
"""
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import uuid
from PIL import Image, ImageDraw
from .providers import FixtureImageProvider


def sha256_file(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def perceptual_hash(path):
    with Image.open(path) as image:
        small = image.convert('L').resize((9, 8), Image.Resampling.LANCZOS)
        values = [small.getpixel((x, y)) for y in range(8) for x in range(9)]
    bits = [values[y*9+x] > values[y*9+x+1] for y in range(8) for x in range(8)]
    return f'{sum(int(v) << i for i, v in enumerate(bits)):016x}'


def _read(root, name):
    return json.loads((root / name).read_text(encoding='utf-8'))


def _safe(root, rel):
    path = (root / rel).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError('Path escapes project: ' + str(rel))
    return path


def _logo(master, logo_path, prominence=.06):
    # Deterministic sign surface inside the scene, never a corner watermark.
    with Image.open(master) as original, Image.open(logo_path) as logo:
        image = original.convert('RGB')
        mark = logo.convert('RGBA')
        ratio = mark.width / mark.height
        width = max(1, int(math.sqrt(image.width * image.height * prominence * ratio)))
        height = max(1, int(width / ratio))
        fit = min(1., image.width * .9 / width, image.height * .9 / height)
        mark = mark.resize((max(1, int(width*fit)), max(1, int(height*fit))), Image.Resampling.LANCZOS)
        x, y = image.width // 2 - mark.width // 2, image.height // 2 - mark.height // 2
        ImageDraw.Draw(image).rectangle((x-14, y-14, x+mark.width+14, y+mark.height+14), fill='#dad5c6', outline='#292826', width=5)
        image.paste(mark, (x, y), mark)
        image.save(master)
    return {'applied': True, 'source_path': 'brand/logo.png', 'sha256': sha256_file(logo_path),
            'method': 'deterministic_png_composite', 'placement': 'in_scene_sign_surface', 'original_preserved': True,
            'area_fraction': mark.width * mark.height / (image.width * image.height),
            'area_measurement': 'logo PNG bounding rectangle / frame area', 'requested_area_fraction': prominence,
            'bbox': [x, y, mark.width, mark.height], 'frame_size': [image.width, image.height]}


def _policy(root):
    config = _read(root, 'experiment.json') if (root/'experiment.json').is_file() else None
    baseline = _read(root,'policy.json') if (root/'policy.json').is_file() else {}
    policy = {'brand_prominence': .06, **(config.get('policy', {}) if config else baseline)}
    value = policy['brand_prominence']
    if type(value) not in (int, float) or not math.isfinite(value) or not 0 < value <= .08:
        raise ValueError('brand_prominence must be finite and in (0, 0.08]')
    config_hash = hashlib.sha256(json.dumps(config, sort_keys=True, ensure_ascii=False, allow_nan=False).encode()).hexdigest() if config else None
    return policy, config_hash


def generate_assets(project_dir: Path, provider=None) -> dict:
    root = Path(project_dir)
    provider = provider or FixtureImageProvider()
    shots = _read(root, 'shotlist.json')['shots']
    world = _read(root, 'world-bible.json')
    policy, config_hash = _policy(root)
    logo = _safe(root, 'brand/logo.png')
    if not logo.is_file():
        raise ValueError('Canonical brand/logo.png is required')
    old = {}
    if (root / 'asset-manifest.json').exists():
        old = {a['shot_id']: a for a in _read(root, 'asset-manifest.json').get('assets', [])}
    entries = []
    explicit_brand = any('brand_presence' in s for s in shots)
    for index, shot in enumerate(shots):
        sid = str(shot['id'])
        presence = shot.get('brand_presence', index == 0 if not explicit_brand else False)
        brand_requested = presence is True or (isinstance(presence, str) and presence.lower() not in ('', 'none', 'false', 'no', 'absent'))
        if not re.fullmatch(r'[A-Za-z0-9_-]+', sid):
            raise ValueError('Unsafe shot id')
        anchors = ['brand/logo.png']
        if entries:
            anchors += list(dict.fromkeys([entries[0]['path'], entries[-1]['path']]))
        for ref in world.get('anchor_paths', []):
            if not _safe(root, ref).is_file():
                raise ValueError('Missing world visual anchor: ' + ref)
            anchors.append(ref)
        request = {'shot': shot, 'world_bible': world, 'anchor_paths': anchors,
                   'project_id': root.resolve().name, 'provider_cache_key': getattr(provider, 'cache_key', None),
                   'applied_policy': policy, 'experiment_config_hash': config_hash,
                   'anchor_absolute_paths': [str(_safe(root, p)) for p in anchors],
                   'anchor_hashes': {p: sha256_file(_safe(root, p)) for p in anchors},
                   'previous_shot': shots[index-1] if index else None,
                   'next_shot': shots[index+1] if index+1 < len(shots) else None,
                   'instructions': 'Generate one independent full-frame master for this shot. Use the supplied actual visual anchors and world bible for continuity. No contact sheet, storyboard grid, collage, or crop of a previous scene. Reserve an in-scene physical sign surface for canonical PNG branding where requested.',
                   'brand_surface_requested': brand_requested}
        fingerprint = hashlib.sha256(json.dumps(request, sort_keys=True).encode()).hexdigest()
        request['request_sha256'] = fingerprint
        rel = f'shots/{sid}/master.png'
        master = _safe(root, rel)
        master.parent.mkdir(parents=True, exist_ok=True)
        for filename, content in [('brief.json', request), ('motion.json', shot.get('motion')), ('refs.json', {'anchor_paths': anchors, 'anchor_hashes': request['anchor_hashes']})]:
            (master.parent / filename).write_text(json.dumps(content, indent=2), encoding='utf8')
        cached = old.get(sid)
        source = master.parent / 'source.png'
        source_fingerprint = hashlib.sha256(json.dumps({'shot': shot, 'world': world, 'provider': provider.name, 'provider_cache_key': getattr(provider, 'cache_key', None)}, sort_keys=True).encode()).hexdigest()
        source_valid = cached and source.is_file() and cached.get('source_request_sha256') == source_fingerprint and sha256_file(source) == cached.get('source_sha256')
        if source_valid and cached.get('request_sha256') == fingerprint and cached.get('provider') == provider.name and master.is_file() and sha256_file(master) == cached.get('sha256'):
            entries.append(cached)
            continue
        if master.exists():
            archive = master.parent / 'versions' / (sha256_file(master)[:16] + '-' + uuid.uuid4().hex[:8])
            archive.mkdir(parents=True)
            shutil.copy2(master, archive / 'master.png')
            if source.exists():
                shutil.copy2(source, archive / 'source.png')
            if cached:
                (archive / 'asset.json').write_text(json.dumps(cached, indent=2), encoding='utf8')
        pending = master.parent / ('pending-' + uuid.uuid4().hex + '.png')
        if source_valid:
            shutil.copy2(source, pending)
            provenance = dict(cached['provenance'])
        else:
            provenance = provider.generate(request, pending)
            shutil.copy2(pending, source)
        source_hash = sha256_file(source)
        provenance['root_source_sha256'] = source_hash
        logo_info = _logo(pending, logo, policy['brand_prominence']) if brand_requested else {'applied': False, 'reason': 'Brand limited to selected physical surfaces'}
        pending.replace(master)
        entry = {'shot_id': sid, 'path': rel, 'sha256': sha256_file(master), 'perceptual_hash': perceptual_hash(master),
                 'source_kind': 'independent_master', 'provider': provider.name,
                 'source_path': f'shots/{sid}/source.png', 'source_sha256': source_hash, 'root_source_sha256': source_hash,
                 'source_request_sha256': source_fingerprint,
                 'continuity_group': shot.get('continuity_group', world.get('continuity_group', 'world-main')),
                 'anchor_paths': anchors, 'anchor_hashes': request['anchor_hashes'], 'provenance': provenance,
                 'logo_provenance': logo_info, 'motion': shot.get('motion'), 'request_sha256': fingerprint}
        entries.append(entry)
    manifest = {'schema_version': 1, 'assets': entries, 'fixture': provider.fixture,
                'applied_policy': policy, 'experiment_config_hash': config_hash,
                'production_ready': False if provider.fixture else None,
                'limitations': 'Similarity and provenance checks cannot detect every forged contact-sheet crop; verify provider records and visual continuity.'}
    (root / 'asset-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    qa = validate_assets(root)
    for entry in entries:
        sid = entry['shot_id']
        (root / 'shots' / sid / 'qa.json').write_text(json.dumps({'shot_id': sid, 'technical_gate_pass': qa['pass'],
            'failures': [f for f in qa['failures'] if f.startswith(sid + ':')],
            'human_visual_review': 'required', 'fixture': provider.fixture}, indent=2), encoding='utf8')
    return manifest


def validate_assets(project_dir: Path) -> dict:
    root = Path(project_dir)
    failures, checks = [], []
    try:
        manifest = _read(root, 'asset-manifest.json')
        shots = _read(root, 'shotlist.json')['shots']
        world = _read(root, 'world-bible.json')
        policy, config_hash = _policy(root)
        if manifest.get('applied_policy') != policy or manifest.get('experiment_config_hash') != config_hash:
            failures.append('Asset policy or experiment configuration mismatch')
        beatmap = _read(root, 'beatmap.json')
        if not isinstance(beatmap, dict) or not isinstance(beatmap.get('sections'), list) or not beatmap['sections']:
            failures.append('Missing music structure')
        entries = manifest['assets']
        if len(entries) != len(shots) or {str(s['id']) for s in shots} != {a.get('shot_id') for a in entries}:
            failures.append('Asset count or shot coverage mismatch')
        threshold = int(world.get('perceptual_duplicate_threshold', 5))
        if threshold < 0 or threshold > 64:
            raise ValueError('Invalid perceptual duplicate threshold')
        seen_paths, seen_hashes, roots, phashes = set(), set(), set(), []
        branding = 0
        for asset in entries:
            sid = asset.get('shot_id', '?')
            try:
                for key in ('path','sha256','perceptual_hash','source_kind','provider','continuity_group','anchor_paths','anchor_hashes','provenance','logo_provenance','motion'):
                    if key not in asset or asset[key] is None:
                        raise ValueError('Missing ' + key)
                if not asset['provider'] or not asset['continuity_group'] or not asset['anchor_paths']:
                    raise ValueError('Missing continuity/provider metadata')
                path = _safe(root, asset['path'])
                if path in seen_paths:
                    raise ValueError('Duplicate master path')
                seen_paths.add(path)
                provenance = asset['provenance']
                text = json.dumps(provenance).lower()
                if asset['source_kind'] != 'independent_master' or provenance.get('source_kind') != 'independent_master' or any(t in text for t in ('contact_sheet', 'contact sheet', 'storyboard', 'crop')):
                    raise ValueError('Contact sheet/storyboard/crop provenance rejected')
                source = provenance.get('root_source_id')
                if not source or source in roots:
                    raise ValueError('Missing or shared source root')
                roots.add(source)
                original = _safe(root, asset['source_path'])
                source_hash = sha256_file(original)
                if source_hash != asset.get('source_sha256') or source_hash != asset.get('root_source_sha256') or source_hash != provenance.get('root_source_sha256'):
                    raise ValueError('Unbranded source master hash mismatch')
                if provenance.get('import_kind') == 'local_original':
                    original_source = Path(provenance['source_path'])
                    if not original_source.is_file() or sha256_file(original_source) != provenance.get('source_sha256'):
                        raise ValueError('Imported original source missing or modified')
                with Image.open(path) as image:
                    if image.format not in ('PNG', 'JPEG', 'WEBP') or min(image.size) < 256:
                        raise ValueError('Invalid master dimensions/format')
                    image.verify()
                digest = sha256_file(path)
                if digest != asset['sha256'] or digest in seen_hashes:
                    raise ValueError('Master hash mismatch or exact duplicate')
                seen_hashes.add(digest)
                phash = perceptual_hash(path)
                if phash != asset['perceptual_hash']:
                    raise ValueError('Perceptual hash mismatch')
                if any((int(phash, 16) ^ int(previous, 16)).bit_count() <= threshold for previous in phashes):
                    raise ValueError('Perceptual near duplicate')
                phashes.append(phash)
                for anchor in asset['anchor_paths']:
                    ap = _safe(root, anchor)
                    if not ap.is_file() or sha256_file(ap) != asset['anchor_hashes'].get(anchor):
                        raise ValueError('Missing or modified visual anchor')
                logo = asset['logo_provenance']
                if 'applied' not in logo:
                    raise ValueError('Missing logo provenance')
                if logo['applied']:
                    branding += 1
                    if logo.get('source_path') != 'brand/logo.png' or logo.get('sha256') != sha256_file(_safe(root, 'brand/logo.png')) or logo.get('placement') != 'in_scene_sign_surface' or logo.get('original_preserved') is not True:
                        raise ValueError('Canonical logo provenance mismatch')
                    with Image.open(path) as im:
                        w, h = im.size
                    box = logo.get('bbox', [])
                    if len(box) != 4 or logo.get('frame_size') != [w, h] or not 0 < box[2]*box[3]/(w*h) <= .08 or logo.get('area_fraction') != box[2]*box[3]/(w*h) or logo.get('requested_area_fraction') != policy['brand_prominence']:
                        raise ValueError('Logo measured area or policy mismatch')
                if not isinstance(asset['motion'], dict) or not asset['motion'].get('kind'):
                    raise ValueError('Missing shot motion')
                checks.append({'shot_id': sid, 'pass': True})
            except (ValueError, KeyError, OSError, TypeError, AttributeError) as exc:
                failures.append(f'{sid}: {exc}')
        if not 1 <= branding <= 2:
            failures.append('Canonical logo must appear on 1-2 physical surfaces')
    except (ValueError, KeyError, OSError, TypeError, AttributeError) as exc:
        failures.append(str(exc))
    return {'pass': not failures, 'failures': failures, 'checks': checks,
            'limitation': 'Cannot detect every visually forged contact-sheet crop; trusted generation provenance and human review remain required.'}
