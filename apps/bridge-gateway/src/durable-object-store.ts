import { Mission, TerminalReceipt } from "../../../packages/bridge-protocol/src/index.ts";
import { ActionBridgeStore, StoredMission, StoreMissionResult } from "./mission-store.ts";

interface DurableObjectStubLike {
  fetch(request: Request): Promise<Response>;
}

export interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStubLike;
}

type Summary = { queued: number; claimed: number; receipts: number };

const durableObjectName = "kaizen7-action-bridge";

export class DurableObjectActionBridgeStore implements ActionBridgeStore {
  constructor(private readonly namespace: DurableObjectNamespaceLike) {}

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

  async claimNextMission(deviceId: string, now = new Date().toISOString()): Promise<Mission | undefined> {
    const response = await this.fetch(`/missions/next?deviceId=${encodeURIComponent(deviceId)}&now=${encodeURIComponent(now)}`);
    const payload = await response.json() as { mission: Mission | null };
    return payload.mission ?? undefined;
  }

  async renewLease(missionId: string, deviceId: string, now = new Date().toISOString()): Promise<boolean> {
    const response = await this.fetch(`/missions/${encodeURIComponent(missionId)}/lease`, "POST", { deviceId, now });
    return response.ok;
  }

  async putReceipt(receipt: TerminalReceipt): Promise<void> {
    const response = await this.fetch("/receipts", "POST", { receipt });
    if (!response.ok) throw new Error(`durable_receipt_store_failed:${response.status}`);
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
    const id = this.namespace.idFromName(durableObjectName);
    const stub = this.namespace.get(id);
    return stub.fetch(new Request(`https://mission-store.local${path}`, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }));
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

    const missionMatch = /^\/missions\/([^/]+)$/.exec(url.pathname);
    if (request.method === "GET" && missionMatch) {
      const mission = this.getMission(decodeURIComponent(missionMatch[1]));
      return mission ? json({ mission }) : json({ mission: null }, 404);
    }

    if (request.method === "GET" && url.pathname === "/missions/next") {
      const deviceId = url.searchParams.get("deviceId") ?? "";
      const now = url.searchParams.get("now") ?? new Date().toISOString();
      return json({ mission: this.claimNextMission(deviceId, now) ?? null });
    }

    const leaseMatch = /^\/missions\/([^/]+)\/lease$/.exec(url.pathname);
    if (request.method === "POST" && leaseMatch) {
      const body = await request.json() as { deviceId?: string; now?: string };
      const renewed = this.renewLease(decodeURIComponent(leaseMatch[1]), body.deviceId ?? "", body.now ?? new Date().toISOString());
      return renewed ? json({ ok: true }) : json({ ok: false, error: "lease_not_owned" }, 409);
    }

    if (request.method === "POST" && url.pathname === "/receipts") {
      const body = await request.json() as { receipt: TerminalReceipt };
      this.putReceipt(body.receipt);
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
      lease_expires_at?: string;
    }>(
      "SELECT mission_json, state, created_at, claimed_at, claimed_by, lease_expires_at FROM missions WHERE mission_id = ?",
      missionId,
    );
    if (!row) return undefined;
    return {
      mission: JSON.parse(row.mission_json) as Mission,
      state: row.state,
      createdAt: row.created_at,
      claimedAt: row.claimed_at,
      claimedBy: row.claimed_by,
      leaseExpiresAt: row.lease_expires_at,
    };
  }

  private claimNextMission(deviceId: string, now: string): Mission | undefined {
    const row = this.first<{ mission_id: string; mission_json: string }>(
      "SELECT mission_id, mission_json FROM missions WHERE state = 'queued' AND target_device_id = ? ORDER BY created_at LIMIT 1",
      deviceId,
    );
    if (!row) return undefined;

    this.sql.exec(
      "UPDATE missions SET state = 'claimed', claimed_by = ?, claimed_at = ?, lease_expires_at = ? WHERE mission_id = ?",
      deviceId,
      now,
      addSeconds(now, 60),
      row.mission_id,
    );
    return JSON.parse(row.mission_json) as Mission;
  }

  private renewLease(missionId: string, deviceId: string, now: string): boolean {
    const row = this.first<{ mission_id: string }>(
      "SELECT mission_id FROM missions WHERE mission_id = ? AND state = 'claimed' AND claimed_by = ?",
      missionId,
      deviceId,
    );
    if (!row) return false;
    this.sql.exec("UPDATE missions SET lease_expires_at = ? WHERE mission_id = ?", addSeconds(now, 60), missionId);
    return true;
  }

  private putReceipt(receipt: TerminalReceipt): void {
    this.sql.exec(
      "INSERT OR REPLACE INTO receipts (mission_id, receipt_json, created_at) VALUES (?, ?, ?)",
      receipt.missionId,
      JSON.stringify(receipt),
      receipt.endedAt,
    );
    this.sql.exec("UPDATE missions SET state = 'completed' WHERE mission_id = ?", receipt.missionId);
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
    this.sql.exec("CREATE TABLE IF NOT EXISTS missions (mission_id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL, target_device_id TEXT NOT NULL, state TEXT NOT NULL, mission_json TEXT NOT NULL, created_at TEXT NOT NULL, claimed_at TEXT, claimed_by TEXT, lease_expires_at TEXT)");
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
