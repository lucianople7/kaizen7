from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a Kaizen video iteration receipt.")
    parser.add_argument("--project-id", required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--changed", default="")
    parser.add_argument("--score-before", default="")
    parser.add_argument("--score-after", default="")
    parser.add_argument("--next-pass", default="")
    parser.add_argument("--risks", default="")
    args = parser.parse_args()

    receipt = {
        "project_id": args.project_id,
        "version": args.version,
        "capability": "flowmatik.video_factory",
        "created_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "changed_assets": [item.strip() for item in args.changed.split(";") if item.strip()],
        "quality_score": {
            "before": args.score_before,
            "after": args.score_after,
        },
        "next_pass": args.next_pass,
        "risks": args.risks,
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(output)


if __name__ == "__main__":
    main()
