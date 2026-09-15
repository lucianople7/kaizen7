# FOCUX skill provenance

Accessed 2026-09-15. These eleven skills, fixtures, validation code and tests are original FOCUX work. No source repository, image, demo report or third-party implementation was vendored. Sources were studied for engineering patterns, not copied. Repository links below target mutable upstream branches; this records an observation date, not an immutable dependency pin. No external skill installation was performed.

| Primary source studied | Useful pattern applied | License verification |
| --- | --- | --- |
| [Official Codex skill guide](https://developers.openai.com/codex/skills/) (redirected to [Build skills](https://learn.chatgpt.com/docs/build-skills)) and the local official skill-creator guide | Short name/description discovery; focused SKILL.md; progressive references; executable scripts | Documentation licensing not established; no text/code copied |
| [Remotion agent skills](https://github.com/remotion-dev/skills) and [Remotion markup skill](https://github.com/remotion-dev/remotion/blob/main/packages/skills/skills/remotion-markup/SKILL.md) | Task-specific routing; frame-derived deterministic motion rather than wall-clock animation | Separate skills repo LICENSE URL was attempted and unavailable through browsing; license unknown, no code copied. This does not assert the Remotion runtime is permissively licensed |
| [CLI-Anything](https://github.com/HKUDS/CLI-Anything) and [quickstart](https://github.com/HKUDS/CLI-Anything/blob/main/cli-anything-plugin/QUICKSTART.md) | Stable JSON and executable verification; use an existing machine interface before a harness | [LICENSE](https://github.com/HKUDS/CLI-Anything/blob/main/LICENSE) read: Apache-2.0 |
| [EternitySpring / shuohao-skills](https://github.com/eternityspring/shuohao-skills) | Separate upstream story/character/art decisions from downstream shot execution; explicit quality gates | [LICENSE](https://github.com/eternityspring/shuohao-skills/blob/main/LICENSE) read: Apache-2.0 |
| [EternitySpring / reelbench-skills](https://github.com/eternityspring/reelbench-skills) | Separate machine timing evidence from model/visual judgments; per-shot gate evidence | [LICENSE](https://github.com/eternityspring/reelbench-skills/blob/main/LICENSE) read: Apache-2.0 |
| [FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html#zoompan) and [license page](https://ffmpeg.org/legal.html) | Explicit frame duration, output dimensions and fps for motion; objective timing as evidence | FFmpeg generally LGPL-2.1-or-later, optional components can make a build GPL; actual runtime build license must be checked separately |

Searches first located the EternitySpring repositories; primary repository pages and license files were then opened. ReelBench is ambiguous: an unrelated research benchmark also appears in results. The video skill repository above is the verified match to the requested EternitySpring skill patterns; no claim is made about the unrelated benchmark. FFmpeg patterns were studied directly from upstream rather than adopting an unverified community wrapper.

## What the selftests prove

Each package contains version 1.0.0 metadata, a small baseline JSON input, a deliberately bad regression case, a contract reference and an executable selftest. The shared `focux.skill_checks` module emits stable sorted errors. Tests reject missing continuity, nonchronological story beats, storyboard source plans, duplicate masters, persistent manga, excessive/generated branding, unknown selected-asset licenses, flat music sections, missing review evidence and unsupported learning promotion.

These are useful planning validators, not image/audio generators or subjective critics. They complement actual file/hash/perceptual/render gates in the core. Passing plan metadata cannot prove file independence, music quality, visual continuity or actual human approval. The critic contract deliberately fails while human visual acceptance is pending. Promotion thresholds are an explicit conservative local baseline, not a statistical significance claim.

## Run from the FOCUX checkout

```powershell
$env:PYTHONPATH = 'src'
python -m unittest discover -s tests -p test_skills.py -v
python skills/focux-story/scripts/selftest.py
python -m focux.skill_checks focux-story skills/focux-story/fixtures/baseline.json
```

Validation and selftests use only the Python standard library. Selftest scripts locate checkout src/ automatically, or use the installed focux package when copied elsewhere. They make no network requests, install nothing and generate no paid media. A validation returns exit 0 on pass and 2 on rejection.

Test development evidence: the initial tests failed with missing `focux.skill_checks`; after implementation the malformed motion input test exposed an AttributeError, which was corrected to a failed schema gate. Final command outcomes are reported in the main validation receipt.

Final skill test run: 5 unittest methods passed, including all 22 positive/negative fixture checks and 11 executable selftest subprocess runs. The separate official skill-creator quick_validate.py initially lacked PyYAML. After installing that development-only dependency in the isolated workspace, all 11 packaging checks passed (exit 0). No global skill installation was performed.
