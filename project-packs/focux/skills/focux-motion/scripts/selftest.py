"""Run local baselines without network access or media generation."""
import json
import sys
from pathlib import Path
folder = Path(__file__).resolve().parents[1]
checkout = folder.parents[1]
if (checkout / 'src' / 'focux').is_dir():
    sys.path.insert(0, str(checkout / 'src'))
from focux.skill_checks import selftest
result = selftest(folder)
print(json.dumps(result, sort_keys=True))
raise SystemExit(0 if result['passed'] else 2)
