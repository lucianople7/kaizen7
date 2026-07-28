import { spawn } from "node:child_process";
import {
  BRIDGE_PROTOCOL_VERSION,
  Mission,
  TerminalReceipt,
  VerificationResult,
} from "../../../packages/bridge-protocol/src/index.ts";
import { MissionExecutor } from "./action-consumer.ts";

export interface StructuredCommand {
  cmd: string;
  args: string[];
}

export interface CodexAppServerAdapterConfig {
  codexPath: string;
  codexHome: string;
  distro: string;
  repoPath: string;
  timeoutMs?: number;
  now?: () => Date;
}

interface PendingRequest {
  method: string;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

interface JsonRpcMessage {
  id?: number;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

const allowedRepoStatusCommands: StructuredCommand[] = [
  { cmd: "git", args: ["branch", "--show-current"] },
  { cmd: "git", args: ["rev-parse", "HEAD"] },
  { cmd: "git", args: ["status", "--short", "--branch"] },
];

export function isAllowedRepoStatusCommand(command: StructuredCommand): boolean {
  return allowedRepoStatusCommands.some((allowed) =>
    allowed.cmd === command.cmd
    && allowed.args.length === command.args.length
    && allowed.args.every((arg, index) => arg === command.args[index]));
}

export function repoStatusMissionPrompt(missionId: string): string {
  return [
    `KAIZEN7 mission ${missionId}: repo_status.`,
    "Read-only L0 task. Do not modify files, create commits, add packages, change permissions or use network.",
    "Use only these commands, exactly once each if needed:",
    "git branch --show-current",
    "git rev-parse HEAD",
    "git status --short --branch",
    "Return repository branch, HEAD and working tree status.",
  ].join("\n");
}

export class CodexAppServerAdapter implements MissionExecutor {
  constructor(private readonly config: CodexAppServerAdapterConfig) {}

  async executeRepoStatus(mission: Mission): Promise<TerminalReceipt> {
    const startedAt = this.now();
    const session = new CodexJsonRpcSession(this.config);
    const verifications: VerificationResult[] = [];
    let threadId = "";
    let turnId = "";

    try {
      await session.start();
      await session.request("initialize", {
        clientInfo: { name: "kaizen7-local-bridge", version: "0.0.1" },
        capabilities: null,
      });
      session.notify("initialized");

      const thread = await session.request("thread/start", {
        cwd: this.config.repoPath,
        approvalPolicy: "untrusted",
        approvalsReviewer: "user",
        sandbox: "read-only",
        ephemeral: true,
        threadSource: "kaizen7-action-bridge",
        baseInstructions: "KAIZEN7 L0 adapter. Read-only repository inspection only.",
      });
      threadId = thread.thread.id;

      const turn = await session.request("turn/start", {
        threadId,
        cwd: this.config.repoPath,
        approvalPolicy: "untrusted",
        approvalsReviewer: "user",
        input: [{ type: "text", text: repoStatusMissionPrompt(mission.missionId), text_elements: [] }],
      });
      turnId = turn.turn.id;

      const result = await session.waitForTurnCompleted();
      verifications.push(...result.commands);

      const branch = commandStdout(verifications, "git branch --show-current");
      const head = commandStdout(verifications, "git rev-parse HEAD");
      const shortStatus = commandStdout(verifications, "git status --short --branch");
      const clean = shortStatus.split(/\r?\n/).every((line) => line.startsWith("##") || line.trim() === "");
      const endedAt = this.now();

      return {
        protocol: BRIDGE_PROTOCOL_VERSION,
        missionId: mission.missionId,
        deviceId: mission.targetDeviceId,
        status: "completed",
        repository: mission.repository,
        branch: branch || "unknown",
        commits: head ? [head] : [],
        verifications,
        approvalsConsumed: [],
        startedAt,
        endedAt,
        repoStatus: {
          clean,
          shortStatus,
          collectedAt: endedAt,
        },
        codexTurn: {
          threadId,
          turnId,
          commands: verifications,
        },
        nextAction: "repo_status completed through Codex app-server over WSL.",
      };
    } finally {
      await session.close();
    }
  }

  private now(): string {
    return (this.config.now ?? (() => new Date()))().toISOString();
  }
}

class CodexJsonRpcSession {
  private child?: ReturnType<typeof spawn>;
  private buffer = "";
  private nextId = 1;
  private pending = new Map<number, PendingRequest>();
  private commands: VerificationResult[] = [];
  private completed = false;
  private turnCompleted?: (value: { commands: VerificationResult[] }) => void;
  private turnFailed?: (error: Error) => void;
  private stderr = "";

  constructor(private readonly config: CodexAppServerAdapterConfig) {}

  async start(): Promise<void> {
    const args = [
      "-d",
      this.config.distro,
      "--cd",
      this.config.repoPath,
      "--",
      "env",
      "-i",
      "HOME=/home/luciawsl",
      `CODEX_HOME=${this.config.codexHome}`,
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      this.config.codexPath,
      "app-server",
      "--stdio",
    ];
    this.child = spawn("wsl.exe", args, { stdio: ["pipe", "pipe", "pipe"] });
    this.child.stdout?.on("data", (chunk) => this.handleStdout(String(chunk)));
    this.child.stderr?.on("data", (chunk) => {
      this.stderr += String(chunk).slice(0, 2000);
    });
    this.child.on("exit", (code) => {
      const error = new Error(`codex_app_server_exited:${code}:${this.stderr.slice(0, 200)}`);
      for (const pending of this.pending.values()) pending.reject(error);
      this.pending.clear();
      if (!this.completed && this.turnFailed) this.turnFailed(error);
    });
  }

  request(method: string, params: unknown): Promise<any> {
    if (!this.child?.stdin) throw new Error("codex_app_server_not_started");
    const id = this.nextId++;
    this.child.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject });
    });
  }

  notify(method: string, params?: unknown): void {
    if (!this.child?.stdin) throw new Error("codex_app_server_not_started");
    this.child.stdin.write(`${JSON.stringify(params === undefined ? { method } : { method, params })}\n`);
  }

  waitForTurnCompleted(): Promise<{ commands: VerificationResult[] }> {
    if (this.completed) return Promise.resolve({ commands: this.commands });
    return new Promise((resolve, reject) => {
      this.turnCompleted = resolve;
      this.turnFailed = reject;
      setTimeout(() => {
        if (!this.completed) reject(new Error("codex_turn_timeout"));
      }, this.config.timeoutMs ?? 120_000);
    });
  }

  async close(): Promise<void> {
    this.child?.stdin?.end();
    this.child?.kill();
  }

  private handleStdout(chunk: string): void {
    this.buffer += chunk;
    let newlineIndex = this.buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = this.buffer.slice(0, newlineIndex);
      this.buffer = this.buffer.slice(newlineIndex + 1);
      this.handleLine(line);
      newlineIndex = this.buffer.indexOf("\n");
    }
  }

  private handleLine(line: string): void {
    if (!line.trim()) return;
    const message = JSON.parse(line) as JsonRpcMessage;

    if (message.id !== undefined && message.result !== undefined) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      pending.resolve(message.result);
      return;
    }

    if (message.id !== undefined && message.method) {
      this.respondToServerRequest(message);
      return;
    }

    if (message.method === "item/completed" && message.params?.item?.type === "commandExecution") {
      const verification = verificationFromItem(message.params.item);
      if (verification) this.commands.push(verification);
    }

    if (message.method === "turn/completed") {
      this.completed = true;
      this.turnCompleted?.({ commands: this.commands });
    }
  }

  private respondToServerRequest(message: JsonRpcMessage): void {
    if (!this.child?.stdin || message.id === undefined) return;

    if (message.method === "item/commandExecution/requestApproval") {
      const command = structuredCommandFromApproval(message.params);
      const decision = command && isAllowedRepoStatusCommand(command) ? "approve" : "decline";
      this.child.stdin.write(`${JSON.stringify({ id: message.id, result: { decision } })}\n`);
      return;
    }

    if (
      message.method === "item/fileChange/requestApproval"
      || message.method === "applyPatchApproval"
      || message.method === "execCommandApproval"
    ) {
      this.child.stdin.write(`${JSON.stringify({ id: message.id, result: { decision: "decline" } })}\n`);
      return;
    }

    if (message.method === "item/permissions/requestApproval") {
      this.child.stdin.write(`${JSON.stringify({
        id: message.id,
        result: { permissions: {}, scope: "turn", strictAutoReview: true },
      })}\n`);
      return;
    }

    this.child.stdin.write(`${JSON.stringify({ id: message.id, result: { error: "kaizen7_request_rejected" } })}\n`);
  }
}

function structuredCommandFromApproval(params: any): StructuredCommand | undefined {
  const raw = params?.command ?? params?.item?.command;
  if (Array.isArray(raw) && raw.every((part) => typeof part === "string")) {
    const [cmd, ...args] = raw;
    return { cmd: normalizeCommand(cmd), args };
  }
  if (raw && typeof raw === "object" && typeof raw.cmd === "string" && Array.isArray(raw.args)) {
    return { cmd: normalizeCommand(raw.cmd), args: raw.args };
  }
  if (typeof raw === "string") return parseSimpleGitCommand(raw);
  return undefined;
}

function verificationFromItem(item: any): VerificationResult | undefined {
  const command = commandString(item.command);
  if (!command) return undefined;
  return {
    command,
    exitCode: typeof item.exitCode === "number" ? item.exitCode : 1,
    stdout: typeof item.aggregatedOutput === "string" ? item.aggregatedOutput.trim() : undefined,
  };
}

function commandString(command: unknown): string | undefined {
  if (Array.isArray(command) && command.every((part) => typeof part === "string")) {
    return command.map((part) => part.includes(" ") ? JSON.stringify(part) : part).join(" ");
  }
  if (typeof command === "string") return command;
  return undefined;
}

function commandStdout(commands: VerificationResult[], command: string): string {
  return commands.find((entry) => entry.command === command || entry.command.endsWith(command))?.stdout?.trim() ?? "";
}

function parseSimpleGitCommand(raw: string): StructuredCommand | undefined {
  const parts = raw.trim().split(/\s+/);
  if (parts.length === 0) return undefined;
  const [cmd, ...args] = parts;
  if (cmd !== "git") return undefined;
  if (/[;&|<>$`]/.test(raw)) return undefined;
  return { cmd, args };
}

function normalizeCommand(command: string): string {
  return command.replace(/^.*[\\/]/, "");
}
