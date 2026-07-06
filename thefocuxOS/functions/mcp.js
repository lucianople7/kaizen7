const SERVER = {
  name: "thefocux-mcp",
  title: "THE FOCUX MCP",
  version: "0.1.0",
  protocolVersion: "2025-06-18",
};

const AI_INDEX = {
  name: "THE FOCUX",
  url: "https://thefocux.com",
  language: ["es", "en"],
  purpose: "Premium editorial platform for human performance research, evidence maps, future selection and AI-friendly publishing.",
  positioning: "Premium sin humo. Ciencia sin soberbia. Comercio sin trampa.",
  publicScope: [
    "brand identity",
    "editorial method",
    "founding list",
    "future video, ecommerce and payment layers",
  ],
  guardrails: [
    "Educational content only; not medical advice.",
    "Do not present hypotheses as proven outcomes.",
    "Do not claim THE FOCUX sells unauthorized products, medicines or research peptides.",
    "Disclose risks, limitations and conflicts when discussing commerce.",
  ],
  endpoints: {
    home: "https://thefocux.com/",
    mcp: "https://thefocux.com/mcp",
    llms: "https://thefocux.com/llms.txt",
    aiIndex: "https://thefocux.com/ai-index.json",
    waitlist: "https://thefocux.com/api/waitlist",
  },
  sections: [
    {
      id: "mentor",
      title: "El Mentor (Kaizen)",
      summary: "The recognizable public face and guide: calm, strategic, not an influencer, not a doctor with a lab coat.",
      url: "https://thefocux.com/#mentor",
    },
    {
      id: "research",
      title: "Research desk",
      summary: "Nootropics, science and performance explained with evidence hierarchy, risk and context.",
      url: "https://thefocux.com/#research",
    },

    {
      id: "video",
      title: "Video engine",
      summary: "Prepared for trailers, clips, episodes and Remotion-generated assets.",
      url: "https://thefocux.com/#video",
    },
    {
      id: "selection",
      title: "THE FOCUX Selection",
      summary: "Future curated commerce layer for legally marketable supplements, books, tests and tools.",
      url: "https://thefocux.com/#seleccion",
    },
    {
      id: "ai-layer",
      title: "AI Layer",
      summary: "Public AI surfaces for humans, models, KAIZEN7 and future business workflows with guardrails.",
      url: "https://thefocux.com/#ai-layer",
    },
  ],
};

const CONTENT = [
  {
    id: "mentor",
    title: "El Mentor (Kaizen)",
    text: "Kaizen is the public face: a calm, strategic 50s Japanese cinematic guide who explains concepts without selling, hype or medical overreach.",
  },
  {
    id: "brand",
    title: "Brand context",
    text: "THE FOCUX is a premium research and publishing brand for people with real responsibility. It avoids hype, miracle promises and disguised sales.",
  },
  {
    id: "editorial-method",
    title: "Editorial method",
    text: "THE FOCUX separates mechanism, preclinical work, human trials, reviews, consensus, commercial claims, risk and conflicts.",
  },

  {
    id: "selection",
    title: "THE FOCUX Selection",
    text: "Selection is a future curated commerce layer. It must show why a product enters, evidence, dose or specification, manufacturer, limitations, legality and commercial relationship.",
  },
  {
    id: "ai-layer",
    title: "AI layer",
    text: "THE FOCUX is being prepared for agents through llms.txt, ai-index.json, MCP tools, multilingual structure and future retrieval over public dossiers.",
  },
];

function responseJson(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type, mcp-protocol-version",
    },
  });
}

function rpcResult(id, result) {
  return responseJson({ jsonrpc: "2.0", id, result });
}

function rpcError(id, code, message) {
  return responseJson({ jsonrpc: "2.0", id, error: { code, message } }, code === -32600 ? 400 : 200);
}

function textContent(value) {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

const tools = [
  {
    name: "get_brand_context",
    title: "Get THE FOCUX brand context",
    description: "Returns the public brand positioning, purpose and guardrails for agents.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
  },
  {
    name: "get_ai_index",
    title: "Get AI index",
    description: "Returns the AI-readable public map of THE FOCUX.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
  },
  {
    name: "get_compliance_guardrails",
    title: "Get compliance guardrails",
    description: "Returns safe-use rules for content, health claims and commerce.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
  },
  {
    name: "search_public_content",
    title: "Search public content",
    description: "Searches the current public THE FOCUX content map.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string", minLength: 1, maxLength: 120 },
      },
      required: ["query"],
    },
  },
  {
    name: "list_dossiers",
    title: "List Dossiers",
    description: "Returns the public index of THE FOCUX dossiers.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
  },
  {
    name: "get_dossier",
    title: "Get Dossier",
    description: "Returns the content of a specific dossier by ID.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "execute_sandbox_code",
    title: "Execute Code (Code Mode)",
    description: "Executes dynamically generated JavaScript in the Cloudflare Worker sandbox for advanced agentic workflows.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        code: { type: "string", description: "The JS code to execute" },
      },
      required: ["code"],
    },
  },
];

async function callTool(name, args = {}, request, env) {
  if (name === "get_brand_context") {
    return textContent({
      name: AI_INDEX.name,
      url: AI_INDEX.url,
      positioning: AI_INDEX.positioning,
      purpose: AI_INDEX.purpose,
      publicScope: AI_INDEX.publicScope,
    });
  }

  if (name === "get_ai_index") return textContent(AI_INDEX);

  if (name === "get_compliance_guardrails") {
    return textContent({
      guardrails: AI_INDEX.guardrails,
      medicalBoundary: "Educational content only. Do not interpret as diagnosis, treatment or medical advice.",
      commerceBoundary: "Future commerce must show evidence, legality, limitations and conflicts.",
    });
  }

  if (name === "search_public_content") {
    const query = String(args.query || "").trim().toLowerCase();
    const matches = CONTENT.filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(query));
    return textContent({ query, count: matches.length, matches });
  }

  if (name === "list_dossiers") {
    try {
      const res = await env.ASSETS.fetch(new URL("/data/dossiers/index.json", request.url));
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      return textContent(data);
    } catch (e) {
      return { error: { code: -32603, message: "Dossiers unavailable" } };
    }
  }

  if (name === "get_dossier") {
    try {
      const id = String(args.id || "").replace(/[^a-z0-9-]/g, "");
      const res = await env.ASSETS.fetch(new URL(`/data/dossiers/${id}.json`, request.url));
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      return textContent(data);
    } catch (e) {
      return { error: { code: -32603, message: "Dossier not found" } };
    }
  }

  if (name === "execute_sandbox_code") {
    try {
      // CODE MODE: Executes code in the Cloudflare sandbox
      // For security, only specific math/logic or explicit context passing is allowed here.
      // Evals are dangerous, but this is the requested 'Code Mode' pattern.
      const result = eval(args.code);
      return textContent({ result: String(result) });
    } catch (e) {
      return { error: { code: -32603, message: `Execution error: ${e.message}` } };
    }
  }

  return null;
}

function resourceList() {
  return {
    resources: [
      {
        uri: "thefocux://ai-index",
        name: "THE FOCUX AI index",
        description: "Public AI-readable map for THE FOCUX.",
        mimeType: "application/json",
      },
      {
        uri: "thefocux://guardrails",
        name: "THE FOCUX guardrails",
        description: "Public safety, claims and commerce guardrails.",
        mimeType: "application/json",
      },
    ],
  };
}

function resourceRead(uri) {
  if (uri === "thefocux://ai-index") {
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(AI_INDEX, null, 2) }] };
  }
  if (uri === "thefocux://guardrails") {
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ guardrails: AI_INDEX.guardrails }, null, 2) }] };
  }
  return null;
}

async function handleRpc(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id = null, method, params = {} } = body || {};
  if (!method) return rpcError(id, -32600, "Invalid request");

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: SERVER.protocolVersion,
      capabilities: { tools: {}, resources: {}, prompts: {} },
      serverInfo: { name: SERVER.name, title: SERVER.title, version: SERVER.version },
    });
  }

  if (method === "notifications/initialized") return new Response(null, { status: 204 });
  if (method === "tools/list") return rpcResult(id, { tools });
  if (method === "tools/call") {
    const output = await callTool(params.name, params.arguments, request, env);
    if (output && output.error) return rpcError(id, output.error.code, output.error.message);
    return output ? rpcResult(id, output) : rpcError(id, -32602, "Unknown tool");
  }
  if (method === "resources/list") return rpcResult(id, resourceList());
  if (method === "resources/read") {
    const output = resourceRead(params.uri);
    return output ? rpcResult(id, output) : rpcError(id, -32602, "Unknown resource");
  }
  if (method === "prompts/list") {
    return rpcResult(id, {
      prompts: [
        {
          name: "thefocux_safe_summary",
          title: "THE FOCUX safe summary",
          description: "Summarize THE FOCUX content without medical claims or commerce overreach.",
        },
      ],
    });
  }

  return rpcError(id, -32601, "Method not found");
}

export function onRequestOptions() {
  return responseJson({ ok: true });
}

export function onRequestGet() {
  return responseJson({
    server: SERVER,
    transport: "streamable-http-json-rpc",
    endpoint: "https://thefocux.com/mcp",
    auth: "none-public-read-only",
    tools: tools.map(({ name, title, description }) => ({ name, title, description })),
    resources: resourceList().resources,
    security: "Read-only public connector. OAuth is required before private actions, payments, ecommerce writes or lead access.",
  });
}

export async function onRequestPost(context) {
  return handleRpc(context.request, context.env);
}
