"""Original deterministic FOCUX planning gates; these do not claim visual quality."""
import argparse
import json
import math
from pathlib import Path

VERSION = '1.0.0'
SKILLS = tuple('focux-' + n for n in ('director', 'story', 'shotlist', 'world-bible', 'visual-dna', 'brand-placement', 'library', 'rhythm', 'motion', 'critic', 'learning'))
WORLD_KEYS = ('world', 'city', 'environments', 'time', 'weather', 'lighting', 'palette', 'camera_language', 'lenses', 'grain', 'protagonist_anchor', 'wardrobe', 'hair', 'props', 'mood', 'visual_dna', 'manga_rules', 'forbidden_traits')

def number(x):
    return type(x) in (int, float) and math.isfinite(x)

def nonempty(x):
    return isinstance(x, (str, list, dict)) and bool(x)

def check(name, data):
    """Validate a skill's documented planning contract, returning stable gate evidence."""
    if name not in SKILLS:
        raise ValueError('Unknown skill: ' + name)
    errors = []
    def gate(ok, code):
        if not ok:
            errors.append(code)
    if not isinstance(data, dict):
        return {'skill': name, 'version': VERSION, 'passed': False, 'errors': ['input.object']}
    d = data
    try:
        if name == 'focux-director':
            gate(all(nonempty(d.get(k)) for k in ('concept', 'music_direction', 'story', 'world_bible', 'anchors', 'shotlist')), 'director.upstream_missing')
            gate(d.get('production_source') == 'independent_masters', 'director.production_source')
            gate(d.get('asset_gate_passed') is True, 'director.assets_not_validated')
            gate(d.get('external_spend') is False or d.get('approval_id'), 'director.approval_missing')
        elif name == 'focux-story':
            beats = d['beats']
            gate(isinstance(beats, list) and len(beats) >= 3, 'story.beat_count')
            gate([b['role'] for b in beats][::len(beats)-1] == ['arrival', 'release'], 'story.arc')
            gate(all(nonempty(b.get('intent')) for b in beats), 'story.intent')
            times = [b['time'] for b in beats]
            gate(all(number(t) and t >= 0 for t in times) and all(a < b for a, b in zip(times, times[1:])), 'story.chronology')
        elif name == 'focux-shotlist':
            shots = d['shots']
            gate(isinstance(shots, list) and len(shots) >= 2, 'shotlist.count')
            gate(len({s['id'] for s in shots}) == len(shots), 'shotlist.unique_ids')
            gate(len({s['master'] for s in shots}) == len(shots), 'shotlist.independent_masters')
            gate(all(s.get('source_kind') == 'independent' for s in shots), 'shotlist.storyboard_source')
            gate(all(number(s.get('duration')) and s['duration'] > 0 and nonempty(s.get('intent')) and nonempty(s.get('anchor_id')) for s in shots), 'shotlist.shot_metadata')
        elif name == 'focux-world-bible':
            gate(all(nonempty(d.get(k)) for k in WORLD_KEYS), 'world.required_continuity')
        elif name == 'focux-visual-dna':
            gate(nonempty(d.get('palette')) and nonempty(d.get('camera_language')) and nonempty(d.get('forbidden_traits')), 'dna.required')
            gate(isinstance(d.get('manga_hits'), list) and len(d['manga_hits']) <= 2, 'dna.sparse_manga')
            gate(all(number(x.get('duration')) and 0 < x['duration'] <= .5 and x.get('separate_layer') is True for x in d['manga_hits']), 'dna.transient_layer')
        elif name == 'focux-brand-placement':
            gate(isinstance(d.get('placements'), list) and len(d['placements']) <= 2, 'brand.frequency')
            gate(nonempty(d.get('canonical_logo_id')), 'brand.canonical_logo')
            gate(all(p.get('logo_id') == d['canonical_logo_id'] and p.get('method') == 'composite' and nonempty(p.get('provenance')) for p in d['placements']), 'brand.provenance')
            gate(all(number(p.get('area_fraction')) and 0 < p['area_fraction'] <= .08 and p.get('in_world') is True for p in d['placements']), 'brand.prominence')
        elif name == 'focux-library':
            assets = d['assets']
            gate(isinstance(assets, list) and bool(assets), 'library.assets')
            gate(len({a['id'] for a in assets}) == len(assets), 'library.unique_ids')
            gate(all(nonempty(a.get('provenance')) and nonempty(a.get('license')) and nonempty(a.get('tags')) and nonempty(a.get('sha256')) for a in assets), 'library.provenance')
            gate(all(a.get('license') != 'unknown' for a in assets if a.get('selected')), 'library.license_unknown')
        elif name == 'focux-rhythm':
            sections = d['sections']
            gate(isinstance(sections, list) and len(sections) >= 3, 'rhythm.structure')
            gate(len({s['energy'] for s in sections}) >= 3, 'rhythm.repetitive_loop')
            gate(all(number(s['start']) and number(s['end']) and 0 <= s['start'] < s['end'] and number(s['energy']) and 0 <= s['energy'] <= 1 for s in sections), 'rhythm.section_range')
            gate(sections[0]['start'] == 0 and all(a['end'] == b['start'] for a,b in zip(sections, sections[1:])), 'rhythm.coverage')
            gate(all(any(abs(c-b) <= .12 for b in d['beats']) for c in d['important_cuts']), 'rhythm.cut_alignment')
        elif name == 'focux-motion':
            shots = d['shots']
            gate(isinstance(shots, list) and len(shots) >= 2, 'motion.shots')
            gate(all(s.get('mode') in ('push', 'pull', 'pan_left', 'pan_right', 'static') and s.get('clock') == 'frames' and type(s.get('frames')) is int and s['frames'] > 0 for s in shots), 'motion.frame_plan')
            gate(len({s['master'] for s in shots}) == len(shots), 'motion.scene_diversity')
            gate(all(number(s.get('zoom')) and 1 <= s['zoom'] <= 1.15 for s in shots), 'motion.crop_budget')
        elif name == 'focux-critic':
            gates = d['gates']
            gate(isinstance(gates, list) and len(gates) == 18 and {g['id'] for g in gates} == {'G%02d' % i for i in range(1,19)}, 'critic.gate_coverage')
            gate(all(g.get('status') == 'pass' and nonempty(g.get('evidence_id')) for g in gates), 'critic.evidence_or_failure')
            gate(d.get('visual_review') == 'human_approved', 'critic.visual_review_pending')
        elif name == 'focux-learning':
            ids = d['evidence_ids']
            gate(type(d['sample_size']) is int and d['sample_size'] == len(set(ids)) and bool(ids), 'learning.evidence_count')
            gate(nonempty(d.get('context')) and number(d.get('confidence')) and 0 <= d['confidence'] <= 1, 'learning.context_confidence')
            gate(len(d['changed_variables']) == 1 and nonempty(d.get('rollback_policy')), 'learning.experiment_rollback')
            gate(d.get('promote') is False or (d.get('promote') is True and d['sample_size'] >= max(3, d.get('min_samples', 3)) and d['confidence'] >= .8), 'learning.insufficient_evidence')
    except (KeyError, TypeError, ValueError, IndexError, ZeroDivisionError, AttributeError):
        errors.append('input.schema')
    return {'skill': name, 'version': VERSION, 'passed': not errors, 'errors': sorted(set(errors))}

def selftest(folder):
    folder = Path(folder)
    cases = json.loads((folder / 'fixtures' / 'cases.json').read_text(encoding='utf-8'))
    results = []
    for case in cases:
        actual = check(folder.name, case['input'])
        results.append({'case': case['name'], 'passed': actual['passed'] == case['expected_passed'] and set(case.get('expected_errors', [])) <= set(actual['errors']), 'actual': actual})
    return {'skill': folder.name, 'version': VERSION, 'passed': len(results) >= 2 and all(r['passed'] for r in results), 'cases': len(results), 'results': results}

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('skill', choices=SKILLS)
    parser.add_argument('input', type=Path)
    args = parser.parse_args(argv)
    try:
        result = check(args.skill, json.loads(args.input.read_text(encoding='utf-8-sig')))
    except (OSError, ValueError) as exc:
        result = {'skill': args.skill, 'passed': False, 'errors': ['input.read'], 'detail': str(exc)}
    print(json.dumps(result, sort_keys=True))
    return 0 if result['passed'] else 2

if __name__ == '__main__':
    raise SystemExit(main())

