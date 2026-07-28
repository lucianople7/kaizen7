import { stdin, stdout } from "node:process";
import { createBridgeMcpState, handleMcpRequest, McpRequest } from "./mcp-server.ts";

const headerSeparator = Buffer.from("\r\n\r\n");

export function encodeMessage(message: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(message), "utf8");
  return Buffer.concat([Buffer.from(`Content-Length: ${body.byteLength}\r\n\r\n`, "utf8"), body]);
}

export function startStdioServer(): void {
  const state = createBridgeMcpState();
  let buffer: Buffer<ArrayBufferLike> = Buffer.alloc(0);

  stdin.on("data", (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
    buffer = drainMessages(buffer, (request, framing) => {
      const response = handleMcpRequest(request, state);
      if (response) {
        stdout.write(framing === "headers" ? encodeMessage(response) : `${JSON.stringify(response)}\n`);
      }
    });
  });
}

export function drainMessages(
  buffer: Buffer<ArrayBufferLike>,
  onMessage: (request: McpRequest, framing: "headers" | "newline") => void,
): Buffer<ArrayBufferLike> {
  let cursor = buffer;

  while (true) {
    if (!startsWithContentLength(cursor)) {
      const newline = cursor.indexOf("\n");
      if (newline === -1) return cursor;

      const line = cursor.subarray(0, newline).toString("utf8").trim();
      cursor = cursor.subarray(newline + 1);
      if (line !== "") {
        onMessage(JSON.parse(line) as McpRequest, "newline");
      }
      continue;
    }

    const headerEnd = cursor.indexOf(headerSeparator);
    if (headerEnd === -1) return cursor;

    const header = cursor.subarray(0, headerEnd).toString("utf8");
    const lengthMatch = /^Content-Length:\s*(\d+)$/im.exec(header);
    if (!lengthMatch) {
      throw new Error("Missing Content-Length header");
    }

    const length = Number(lengthMatch[1]);
    const bodyStart = headerEnd + headerSeparator.byteLength;
    const bodyEnd = bodyStart + length;
    if (cursor.byteLength < bodyEnd) return cursor;

    const body = cursor.subarray(bodyStart, bodyEnd).toString("utf8");
    onMessage(JSON.parse(body) as McpRequest, "headers");
    cursor = cursor.subarray(bodyEnd);
  }
}

function startsWithContentLength(buffer: Buffer<ArrayBufferLike>): boolean {
  return buffer.subarray(0, "Content-Length".length).toString("utf8").toLowerCase() === "content-length";
}
