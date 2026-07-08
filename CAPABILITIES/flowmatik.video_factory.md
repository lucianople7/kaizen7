# flowmatik.video_factory

## Purpose

Generate a reusable Mr. Kaizen / THE FOCUX short video package from script, scenes, local audio and Remotion render data.

## Use When

- A mission asks for a reel, short, video, Flowmatik render or Mr. Kaizen content asset.

## Inputs

- `project_id`
- `title`
- `script`
- `storyboard`
- `cta`
- `brand_guardrails`

## Outputs

- project JSON
- generated Remotion data
- audio assets
- render plan
- MP4
- memory writeback

## Current Provider

```text
Remotion + local audio + FFmpeg verification
```

## Verification

- Project JSON present.
- MP4 created.
- 9:16 composition.
- Claims checked.
- Memory writeback present.
