import { Mission, TerminalReceipt } from "../../../packages/bridge-protocol/src/index.ts";
import { ActionBridgeStore, StoredMission, StoreMissionResult } from "./mission-store.ts";
import { ClaimedMission, LeaseTransitionInput, ReceiptInput, TransitionResult } from "./mailbox-types.ts";

interface DurableObjectStubLike {
  fetch(request: Request): Promise<Response>;
}

export interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStubLike;
}

type Summary = { queued: number; claimed: number; receipts: number };

const durableObjectName = "kaizen7-action-bridge";

interface DurableObjectActionBridgeStoreOptions {
  installationKey?: string;
  workspaceKey?: string;
}

export class DurableObjectActionBridgeStore implements ActionBridgeStore {
  constructor(
    private readonly namespace: DurableObjectNamespaceLike,
    private readonly options: DurableObjectActionBridgeStoreOptions = {},
  ) {}

  async putMission(mission: Mission, now = new Date().toISOString()): Promise<StoreMissionResult> {
    const response = await this.fetch("/missions", "POST", { mission, now });
    const payload = await response.json() as StoreMissionResult;
    return payload;
  }

  async getMission(missionId: string): Promise<StoredMission | undefined> {
    const response = await this.fetch(`/missions/${encodeURIComponent(missionId)}`);
    if (response.status === 404) return undefined;
    const payload = await response.json() as { mission: StoredMission };
    return payload.mission;
  }

  async claimNextMission(deviceId: string, now = new Date().toISOString()): Promise<ClaimedMission | undefined> {
    const response = await this.fetch(`/missions/next?deviceId=${encodeURIComponent(deviceId)}&now=${encodeURIComponent(now)}`);
    const payload = await response.json() as { mission: Mission | null; lease?: ClaimedMission["lease"] | null };
    if (!payload.mission) return undefined;
    const lease = payload.lease ?? {
      leaseId: "",
      missionId: payload.mission.missionId,
      deviceId,
      expiresAt: "",
    };
    return { ...payload.mission, mission: payload.mission, lease };
  }

  async renewLease(missionId: string, deviceId: string, now = new Date().toISOString()): Promise<boolean> {
    const response = await this.fetch(`/missions/${encodeURIComponent(missionId)}/lease`, "POST", { deviceId, now });
    return response.ok;
  }

  async markRunning(input: LeaseTransitionInput): Promise<TransitionResult> {
    return this.transition(`/missions/${encodeURIComponent(input.missionId)}/running`, input);
  }

  async markApprovalRequired(input: LeaseTransitionInput): Promise<TransitionResult> {
    return this.transition(`/missions/${encodeURIComponent(input.missionId)}/approval-required`, input);
  }

  async resolveApproval(input: LeaseTransitionInput): Promise<TransitionResult> {
    return this.transition(`/missions/${encodeURIComponent(input.missionId)}/approval-resolved`, input);
  }

  async cancelMission(input: { missionId: string; now: string }): Promise<TransitionResult> {
    const response = await this.fetch(`/missions/${encodeURIComponent(input.missionId)}/cancel`, "POST", input);
    return transitionFromResponse(response);
  }

  async expireLeases(now: string): Promise<number> {
    const response = await this.fetch("/leases/expire", "POST", { now });
    const payload = await response.json() as { expired: number };
    return payload.expired;
  }

  async putReceipt(input: ReceiptInput): Promise<TransitionResult> {
    const response = await this.fetch("/receipts", "POST", input);
    if (response.status === 404) return { ok: false, reason: "mission_not_found" };
    if (response.status === 403 || response.status === 409) {
      const payload = await response.json() as { error?: TransitionResult extends { ok: false; reason: infer R } ? R : never };
      return { ok: false, reason: payload.error ?? "lease_not_owned" };
    }
    if (!response.ok) throw new Error(`durable_receipt_store_failed:${response.status}`);
    return { ok: true };
  }

  async getReceipt(missionId: string): Promise<TerminalReceipt | undefined> {
    const response = await this.fetch(`/receipts/${encodeURIComponent(missionId)}`);
    if (response.status === 404) return undefined;
    const payload = await response.json() as { receipt: TerminalReceipt };
    return payload.receipt;
  }

  async summary(): Promise<Summary> {
    const response = await this.fetch("/summary");
    return await response.json() as Summary;
  }

  private fetch(path: string, method = "GET", body?: unknown): Promise<Response> {
    const id = this.namespace.idFromName(this.mailboxName());
    const stub = this.namespace.get(id);
    return stub.fetch(new Request(`https://mission-store.local${path}`, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }));
  }

  private transition(path: string, input: LeaseTransitionInput): Promise<TransitionResult> {
    return this.fetch(path, "POST", input).then(transitionFromResponse);
  }

  private mailboxName(): string {
    return this.options.installationKey && this.options.workspaceKey
      ? `${this.options.installationKey}:${this.options.workspaceKey}`
      : durableObjectName;
  }
}

interface DurableObjectStateLike {
  storage: {
    sql: {
      exec(query: string, ...bindings: unknown[]): { toArray(): Array<Record<string, unknown>> };
    };
  };
}

export class MissionStoreDurableObject {
  constructor(private readonly state: DurableObjectStateLike) {
    this.migrate();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/missions") {
      const body = await request.json() as { mission: Mission; now?: string };
      return json(this.putMission(body.mission, body.now));
    }

    if (request.method === "GET" && url.pathname === "/missions/next") {
      const deviceId = url.searchParams.get("deviceId") ?? "";
      const now = url.searchParams.get("now") ?? undefined;
      const claim = this.claimNextMission(deviceId, now);
      return json({ mission: claim?.mission ?? null, lease: claim?.lease ?? null });
    }

    const missionMatch = /^\/missions\/([^/]+)$/.exec(url.pathname);
    if (request.method === "GET" && missionMatch) {
      const mission = this.getMission(decodeURIComponent(missionMatch[1]));
      return mission ? json({ mission }) : json({ mission: null }, 404);
    }

    const leaseMatch = /^\/missions\/([^/]+)\/lease$/.exec(url.pathname);
    if (request.method === "POST" && leaseMatch) {
      const body = await request.json() as { deviceId?: string; now?: string };
      const renewed = this.renewLease(decodeURIComponent(leaseMatch[1]), body.deviceId ?? "", body.now ?? new Date().toISOString());
      return renewed ? json({ ok: true }) : json({ ok: false, error: "lease_not_owned" }, 409);
    }

    const runningMatch = /^\/missions\/([^/]+)\/running$/.exec(url.pathname);
    if (request.method === "POST" && runningMatch) {
      const body = await request.json() as LeaseTransitionInput;
      return transitionJson(this.markRunning({ ...body, missionId: decodeURIComponent(runningMatch[1]) }));
    }

    const approvalRequiredMatch = /^\/missions\/([^/]+)\/approval-required$/.exec(url.pathname);
    if (request.method === "POST" && approvalRequiredMatch) {
      const body = await request.json() as LeaseTransitionInput;
      return transitionJson(this.transitionWithLease({ ...body, missionId: decodeURIComponent(approvalRequiredMatch[1]) }, ["claimed", "running"], "approval_required"));
    }

    const approvalResolvedMatch = /^\/missions\/([^/]+)\/approval-resolved$/.exec(url.pathname);
    if (request.method === "POST" && approvalResolvedMatch) {
      const body = await request.json() as LeaseTransitionInput;
      return transitionJson(this.transitionWithLease({ ...body, missionId: decodeURIComponent(approvalResolvedMatch[1]) }, ["approval_required"], "running"));
    }

    const cancelMatch = /^\/missions\/([^/]+)\/cancel$/.exec(url.pathname);
    if (request.method === "POST" && cancelMatch) {
      return transitionJson(this.cancelMission({ missionId: decodeURIComponent(cancelMatch[1]), now: new Date().toISOString() }));
    }

    if (request.method === "POST" && url.pathname === "/leases/expire") {
      const body = await request.json() as { now?: string };
      return json({ expired: this.expireLeases(body.now ?? new Date().toISOString()) });
    }

    if (request.method === "POST" && url.pathname === "/receipts") {
      const body = await request.json() as ReceiptInput;
      const result = this.putReceipt(body);
      if (!result.ok) {
        const status = result.reason === "mission_not_found" ? 404 : 403;
        return json({ ok: false, error: result.reason }, status);
      }
      return json({ ok: true, missionId: body.receipt.missionId });
    }

    const receiptMatch = /^\/receipts\/([^/]+)$/.exec(url.pathname);
    if (request.method === "GET" && receiptMatch) {
      const receipt = this.getReceipt(decodeURIComponent(receiptMatch[1]));
      return receipt ? json({ receipt }) : json({ receipt: null }, 404);
    }

    if (request.method === "GET" && url.pathname === "/summary") {
      return json(this.summary());
    }

    return json({ ok: false, error: "not_found" }, 404);
  }

  private putMission(mission: Mission, now = new Date().toISOString()): StoreMissionResult {
    const duplicate = this.first<{ mission_id: string }>(
      "SELECT mission_id FROM idempotency WHERE idempotency_key = ?",
      mission.idempotencyKey,
    );
    if (duplicate) {
      const existing = this.first<{ mission_json: string }>(
        "SELECT mission_json FROM missions WHERE mission_id = ?",
        duplicate.mission_id,
      );
      if (existing) return { mission: JSON.parse(existing.mission_json) as Mission, duplicate: true };
    }

    this.sql.exec(
      "INSERT INTO missions (mission_id, idempotency_key, target_device_id, state, mission_json, created_at) VALUES (?, ?, ?, 'queued', ?, ?)",
      mission.missionId,
      mission.idempotencyKey,
      mission.targetDeviceId,
      JSON.stringify(mission),
      now,
    );
    this.sql.exec("INSERT INTO idempotency (idempotency_key, mission_id) VALUES (?, ?)", mission.idempotencyKey, mission.missionId);
    return { mission, duplicate: false };
  }

  private getMission(missionId: string): StoredMission | undefined {
    const row = this.first<{
      mission_json: string;
      state: StoredMission["state"];
      created_at: string;
      claimed_at?: string;
      claimed_by?: string;
      lease_id?: string;
      lease_expires_at?: string;
    }>(
      "SELECT mission_json, state, created_at, claimed_at, claimed_by, lease_id, lease_expires_at FROM missions WHERE mission_id = ?",
      missionId,
    );
    if (!row) return undefined;
    return {
      mission: JSON.parse(row.mission_json) as Mission,
      state: row.state,
      createdAt: row.created_at,
      claimedAt: row.claimed_at,
      claimedBy: row.claimed_by,
      leaseId: row.lease_id,
      leaseExpiresAt: row.lease_expires_at,
    };
  }

  private claimNextMission(deviceId: string, now?: string): ClaimedMission | undefined {
    const claimNow = now ?? new Date().toISOString();
    const row = this.sql.exec(
      "SELECT mission_id, mission_json, target_device_id FROM missions WHERE state = 'queued' ORDER BY created_at LIMIT 20",
    ).toArray().find((candidate) => candidate.target_device_id === deviceId) as
      | { mission_id: string; mission_json: string; target_device_id: string }
      | undefined;
    if (!row) return undefined;
    const mission = JSON.parse(row.mission_json) as Mission;
    if (now !== undefined && Date.parse(mission.expiresAt) <= Date.parse(now)) {
      this.sql.exec("UPDATE missions SET state = 'expired' WHERE mission_id = ?", row.mission_id);
      return undefined;
    }
    const lease = {
      leaseId: crypto.randomUUID(),
      missionId: row.mission_id,
      deviceId,
      expiresAt: addSeconds(claimNow, 60),
    };

    this.sql.exec(
      "UPDATE missions SET state = 'claimed', claimed_by = ?, claimed_at = ?, lease_expires_at = ?, lease_id = ? WHERE mission_id = ? AND state = 'queued'",
      deviceId,
      claimNow,
      lease.expiresAt,
      lease.leaseId,
      row.mission_id,
    );
    return { ...mission, mission, lease };
  }

  private renewLease(missionId: string, deviceId: string, now: string): boolean {
    const row = this.first<{ mission_id: string }>(
      "SELECT mission_id FROM missions WHERE mission_id = ? AND state IN ('claimed', 'running', 'approval_required') AND claimed_by = ?",
      missionId,
      deviceId,
    );
    if (!row) return false;
    this.sql.exec("UPDATE missions SET lease_expires_at = ? WHERE mission_id = ?", addSeconds(now, 60), missionId);
    return true;
  }

  private markRunning(input: LeaseTransitionInput): TransitionResult {
    return this.transitionWithLease(input, ["claimed", "approval_required"], "running");
  }

  private cancelMission(input: { missionId: string; now: string }): TransitionResult {
    const row = this.first<{ state: string }>("SELECT state FROM missions WHERE mission_id = ?", input.missionId);
    if (!row) return { ok: false, reason: "mission_not_found" };
    if (isTerminal(row.state)) return { ok: false, reason: "mission_terminal" };
    this.sql.exec("UPDATE missions SET state = 'cancelled' WHERE mission_id = ?", input.missionId);
    return { ok: true };
  }

  private expireLeases(now: string): number {
    const rows = this.sql.exec(
      "SELECT mission_id FROM missions WHERE state IN ('claimed', 'running', 'approval_required') AND lease_expires_at <= ?",
      now,
    ).toArray() as Array<{ mission_id: string }>;
    for (const row of rows) {
      this.sql.exec(
        "UPDATE missions SET state = 'queued', claimed_at = NULL, claimed_by = NULL, lease_id = NULL, lease_expires_at = NULL WHERE mission_id = ?",
        row.mission_id,
      );
    }
    return rows.length;
  }

  private putReceipt(input: ReceiptInput): TransitionResult {
    const { receipt, deviceId, leaseId } = input;
    if (!leaseId) return { ok: false, reason: "lease_required" };
    const mission = this.first<{ state: string; claimed_by?: string; lease_id?: string; lease_expires_at?: string }>(
      "SELECT state, claimed_by, lease_id, lease_expires_at FROM missions WHERE mission_id = ?",
      receipt.missionId,
    );
    if (!mission) return { ok: false, reason: "mission_not_found" };
    if (isTerminal(mission.state)) return { ok: false, reason: "mission_terminal" };
    if (mission.state !== "running") return { ok: false, reason: "mission_not_running" };
    if (mission.claimed_by !== deviceId) return { ok: false, reason: "lease_device_mismatch" };
    if (leaseId !== mission.lease_id) return { ok: false, reason: "lease_not_owned" };
    if (mission.lease_expires_at && Date.parse(mission.lease_expires_at) <= Date.parse(receipt.endedAt)) {
      return { ok: false, reason: "lease_expired" };
    }
    this.sql.exec(
      "INSERT OR REPLACE INTO receipts (mission_id, receipt_json, created_at) VALUES (?, ?, ?)",
      receipt.missionId,
      JSON.stringify(receipt),
      receipt.endedAt,
    );
    this.sql.exec("UPDATE missions SET state = 'completed' WHERE mission_id = ?", receipt.missionId);
    return { ok: true };
  }

  private transitionWithLease(input: LeaseTransitionInput, from: string[], to: string): TransitionResult {
    if (!input.leaseId) return { ok: false, reason: "lease_required" };
    const mission = this.first<{ state: string; claimed_by?: string; lease_id?: string; lease_expires_at?: string }>(
      "SELECT state, claimed_by, lease_id, lease_expires_at FROM missions WHERE mission_id = ?",
      input.missionId,
    );
    if (!mission) return { ok: false, reason: "mission_not_found" };
    if (isTerminal(mission.state)) return { ok: false, reason: "mission_terminal" };
    if (!from.includes(mission.state)) return { ok: false, reason: "lease_not_owned" };
    if (mission.claimed_by !== input.deviceId) return { ok: false, reason: "lease_device_mismatch" };
    if (mission.lease_id !== input.leaseId) return { ok: false, reason: "lease_not_owned" };
    if (mission.lease_expires_at && Date.parse(mission.lease_expires_at) <= Date.parse(input.now)) {
      return { ok: false, reason: "lease_expired" };
    }
    this.sql.exec(
      "UPDATE missions SET state = ? WHERE mission_id = ? AND state = ? AND claimed_by = ? AND lease_id = ?",
      to,
      input.missionId,
      mission.state,
      input.deviceId,
      input.leaseId,
    );
    return { ok: true };
  }

  private getReceipt(missionId: string): TerminalReceipt | undefined {
    const row = this.first<{ receipt_json: string }>("SELECT receipt_json FROM receipts WHERE mission_id = ?", missionId);
    return row ? JSON.parse(row.receipt_json) as TerminalReceipt : undefined;
  }

  private summary(): Summary {
    return {
      queued: Number(this.first<{ count: number }>("SELECT COUNT(*) AS count FROM missions WHERE state = 'queued'")?.count ?? 0),
      claimed: Number(this.first<{ count: number }>("SELECT COUNT(*) AS count FROM missions WHERE state = 'claimed'")?.count ?? 0),
      receipts: Number(this.first<{ count: number }>("SELECT COUNT(*) AS count FROM receipts")?.count ?? 0),
    };
  }

  private migrate(): void {
    this.sql.exec("CREATE TABLE IF NOT EXISTS missions (mission_id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL, target_device_id TEXT NOT NULL, state TEXT NOT NULL, mission_json TEXT NOT NULL, created_at TEXT NOT NULL, claimed_at TEXT, claimed_by TEXT, lease_id TEXT, lease_expires_at TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS idempotency (idempotency_key TEXT PRIMARY KEY, mission_id TEXT NOT NULL)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS receipts (mission_id TEXT PRIMARY KEY, receipt_json TEXT NOT NULL, created_at TEXT NOT NULL)");
  }

  private first<T>(query: string, ...bindings: unknown[]): T | undefined {
    return this.sql.exec(query, ...bindings).toArray()[0] as T | undefined;
  }

  private get sql(): DurableObjectStateLike["storage"]["sql"] {
    return this.state.storage.sql;
  }
}

function addSeconds(iso: string, seconds: number): string {
  return new Date(Date.parse(iso) + seconds * 1000).toISOString();
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "cache-control": "no-store" } });
}

async function transitionFromResponse(response: Response): Promise<TransitionResult> {
  if (response.ok) return { ok: true };
  const payload = await response.json() as { error?: string };
  return { ok: false, reason: transitionReason(payload.error) };
}

function transitionJson(result: TransitionResult): Response {
  if (result.ok) return json({ ok: true });
  const status = result.reason === "mission_not_found" ? 404 : 403;
  return json({ ok: false, error: result.reason }, status);
}

function transitionReason(reason: string | undefined): TransitionResult extends { ok: false; reason: infer R } ? R : never {
  const allowed = new Set([
    "mission_not_found",
    "lease_required",
    "lease_not_owned",
    "lease_expired",
    "lease_device_mismatch",
    "mission_not_running",
    "mission_terminal",
  ]);
  return (allowed.has(reason ?? "") ? reason : "lease_not_owned") as TransitionResult extends { ok: false; reason: infer R } ? R : never;
}

function isTerminal(state: string): boolean {
  return ["completed", "failed", "cancelled", "expired"].includes(state);
}
