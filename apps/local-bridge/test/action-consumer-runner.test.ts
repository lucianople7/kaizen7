import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runActionBridgeConsumer, redactConsumerMessage, validateActionBridgeBaseUrl } from "../src/action-consumer-runner.ts";

describe("KAIZEN7 Action Bridge manual consumer runner", () => {
  it("polls until aborted with bounded idle and error backoff", async () => {
    const delays: number[] = [];
    let polls = 0;
    const controller = new AbortController();

    await runActionBridgeConsumer({
      pollOnce: async () => {
        polls += 1;
        if (polls === 1) return { status: "idle" };
        if (polls === 2) throw new Error("network down");
        controller.abort();
        return { status: "completed", missionId: "mission-001", receipt: {} as any };
      },
      idleDelayMs: 25,
      errorDelayMs: 100,
      maxDelayMs: 40,
      sleep: async (ms) => {
        delays.push(ms);
      },
      signal: controller.signal,
      logger: () => {},
    });

    assert.equal(polls, 3);
    assert.deepEqual(delays, [25, 40]);
  });

  it("requires HTTPS for deployed bridge URLs while allowing localhost runtime tests", () => {
    assert.equal(validateActionBridgeBaseUrl("https://kaizen7-action-bridge.example.workers.dev").ok, true);
    assert.equal(validateActionBridgeBaseUrl("http://127.0.0.1:8787").ok, true);
    assert.deepEqual(validateActionBridgeBaseUrl("http://kaizen7-action-bridge.example.workers.dev"), {
      ok: false,
      reason: "bridge_url_requires_https",
    });
  });

  it("redacts bearer credentials and local paths from runner logs", () => {
    const message = redactConsumerMessage(
      "token secret-agent-token repo C:\\tmp\\kaizen7-live-bridge",
      ["secret-agent-token", "C:\\tmp\\kaizen7-live-bridge"],
    );

    assert.equal(message.includes("secret-agent-token"), false);
    assert.equal(message.includes("C:\\tmp\\kaizen7-live-bridge"), false);
    assert.match(message, /\[redacted\]/);
  });
});
