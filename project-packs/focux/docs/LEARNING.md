# Controlled learning

`focux learn ID` records current observations without claiming improvement from
one sample. Its proposal is not promotion evidence. To run a controlled comparison:

```sh
focux experiments create --hypothesis "Less prominent branding feels more natural" --variable brand_prominence --challenger 0.04 --context "Tokyo/night" --json
focux experiments assign EXP-ID SIGNAL-010 --arm champion --json
focux experiments assign EXP-ID SIGNAL-011 --arm challenger --json
focux policy diff EXP-ID --json
```

Assign fresh projects before producing assets. The frozen policy actually controls
logo area and the manga cap. Both arms need the same original unbranded sources,
same audio, same creative inputs, and exactly one changed policy variable. Preserve
the same original audio filename and input metadata when constructing a pair.
Each pair needs distinct productions and distinct source sets from other pairs.

Generate/import and render both arms, then collect actual operator review:

```sh
focux feedback SIGNAL-010 --score 8 --note "Review based on watching exact render"
focux feedback SIGNAL-011 --score 9
focux experiments run EXP-ID --champion SIGNAL-010 --challenger SIGNAL-011 --json
```

These scores are examples, not permission for an agent to submit them as human
feedback. `experiments run` verifies and records a completed pair; it does not
manufacture source media or execute paid generation.

After at least five distinct verified pairs, positive mean paired uplift and
passing golden skill checks:

```sh
focux experiments promote EXP-ID --json
focux policy show --json
focux policy rollback v1 --json
```

Promotion rechecks actual media gates, source/audio/config hashes, exact-context
human scores and policy effects. Fixtures and forged render receipts are rejected.
The production defaults remain unchanged until promotion. New projects snapshot
the selected policy; previous projects preserve their policy and original files.
Observed positive paired means are not claims of statistical significance,
audience retention, income, or universal artistic improvement.

The learning unit suite mocks the technical validation boundary only for testing
positive decision arithmetic. Separate regressions invoke real ffprobe to reject
forged MP4s. No live five-pair production experiment has been completed in this delivery.
