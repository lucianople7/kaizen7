# Programmatic Tool Calling Benchmark

KAIZEN7 uses this benchmark to decide whether OpenAI Agents SDK Programmatic Tool Calling materially improves a discovery mission before it can affect Repo Hunter or Provider Intelligence.

The evidence rule is:

```text
same or better verified result -> at least 20% fewer total tokens or model turns
```

A candidate is held when elapsed time regresses by more than 25%, even if token or turn usage improves. Missing licensing evidence, lower quality, a partial lane, or new tool failures produces `reject`.

## Commands

```bash
npm run k7:benchmark:ptc -- --dry-run
npm run k7:benchmark:ptc -- --fixture
npm run k7:benchmark:ptc -- --live
npm run k7:benchmark:ptc -- --live --write
```

- `--dry-run` inspects only the locally installed stable SDK and prints the benchmark contract. It makes no API call.
- `--fixture` runs deterministic local evidence. It makes no API call, needs no credentials, and can validate the harness but can never authorize production promotion.
- `--live` is blocked unless the installed SDK is a normal stable release exposing the documented `programmaticToolCallingTool` public function and `OPENAI_API_KEY` is present.
- `--write` is accepted only with `--live`. A completed live result is appended to `data/benchmarks/programmatic-tool-calling.jsonl`; duplicate fingerprints are not written twice.
- `--compact` prints the same JSON report on one line.

Default execution is `--dry-run`. Unknown flags are rejected, so no argument can turn on network execution implicitly.

## Report

Completed reports use `kaizen7.programmatic_tool_benchmark.v1` and contain:

- the immutable mission and SDK capability evidence;
- normalized baseline and candidate lanes;
- elapsed time, model turns, input/output/total tokens, tool calls, and tool failures;
- deterministic quality checks and license coverage;
- percentage deltas, one verdict, one next action, and a SHA-256 fingerprint;
- `simulated` and `eligibleForPromotion` safety fields.

Missing usage values are `null`, never estimates. Captured SDK errors redact API-key-like and bearer-token text before reaching output or receipts.

Elapsed time is measured by the benchmark kernel around each lane. A live adapter cannot supply or override this value; deterministic fixture time comes from an isolated test clock.

## Stable activation path

1. Wait for `programmaticToolCallingTool` to appear in a normal stable `@openai/agents` npm release.
2. Verify its exact public signature in official stable OpenAI Agents SDK documentation and release notes.
3. Add the live adapter under TDD; do not install GitHub `main`, a preview, or a prerelease.
4. Run the explicit live A/B mission with the same GitHub, Hugging Face, and licensing contract in both lanes.
5. Persist the completed result with `--live --write`.
6. Keep Repo Hunter unchanged unless the receipt says `verdict: "adopt"` and `eligibleForPromotion: true`.

The current implementation deliberately leaves the live adapter disabled because the required public API was merged after the latest stable release available when this benchmark was created.
