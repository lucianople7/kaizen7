import { ActionBridgeConsumerConfig, ActionBridgePollResult, pollActionBridgeOnce } from "./action-consumer.ts";

export interface ActionBridgeConsumerRunnerConfig {
  consumer?: ActionBridgeConsumerConfig;
  pollOnce?: () => Promise<ActionBridgePollResult>;
  idleDelayMs?: number;
  errorDelayMs?: number;
  maxDelayMs?: number;
  signal?: AbortSignal;
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  logger?: (message: string) => void;
  redactions?: string[];
}

export interface BridgeUrlValidation {
  ok: boolean;
  reason?: string;
}

export function validateActionBridgeBaseUrl(raw: string): BridgeUrlValidation {
  try {
    const url = new URL(raw);
    if (url.protocol === "https:") return { ok: true };
    if (url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost")) return { ok: true };
    return { ok: false, reason: "bridge_url_requires_https" };
  } catch {
    return { ok: false, reason: "bridge_url_invalid" };
  }
}

export function redactConsumerMessage(message: string, redactions: string[]): string {
  return redactions
    .filter((value) => value.length > 0)
    .reduce((redacted, value) => redacted.split(value).join("[redacted]"), message);
}

export async function runActionBridgeConsumer(config: ActionBridgeConsumerRunnerConfig): Promise<void> {
  const pollOnce = config.pollOnce ?? (() => {
    if (!config.consumer) throw new Error("consumer_config_required");
    return pollActionBridgeOnce(config.consumer);
  });
  const idleDelayMs = config.idleDelayMs ?? 2_000;
  const errorDelayMs = config.errorDelayMs ?? 10_000;
  const maxDelayMs = config.maxDelayMs ?? 30_000;
  const sleep = config.sleep ?? sleepWithAbort;
  const redactions = [
    ...(config.redactions ?? []),
    config.consumer?.agentToken ?? "",
    config.consumer?.baseUrl ?? "",
  ];
  const logger = (message: string) => config.logger?.(redactConsumerMessage(message, redactions));

  logger("kaizen7 action consumer started");
  while (!config.signal?.aborted) {
    try {
      const result = await pollOnce();
      if (result.status === "completed") {
        logger(`kaizen7 action consumer completed ${result.missionId}`);
        continue;
      }
      if (result.status === "rejected") {
        logger(`kaizen7 action consumer rejected ${result.errors.join(",")}`);
        await sleep(Math.min(errorDelayMs, maxDelayMs), config.signal);
        continue;
      }
      await sleep(Math.min(idleDelayMs, maxDelayMs), config.signal);
    } catch (error) {
      logger(`kaizen7 action consumer error ${error instanceof Error ? error.message : String(error)}`);
      await sleep(Math.min(errorDelayMs, maxDelayMs), config.signal);
    }
  }
  logger("kaizen7 action consumer stopped");
}

function sleepWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      resolve();
    }, { once: true });
  });
}
