const fs = require("node:fs");
const path = require("node:path");
const { buildKernelManifestPacket } = require("./kernel-manifest");

const ROOT = path.resolve(__dirname, "..");
const PROJECT_ID = "mr_kaizen_bangkok_energy_first_flow";
const PROJECT_DIR = path.join(ROOT, "content_library", "projects", "first_flow");
const EXPORT_DIR = path.join(ROOT, "content_library", "exports");
const MEMORY_NOTE = path.join(
  ROOT,
  "Obsidian",
  "Flowmatik",
  "Arquitectura",
  "First Flow Mr Kaizen THE FOCUX 2026-07-02.md"
);

const SCRIPT = [
  "Estoy en un mercado nocturno de Bangkok, y aqui hay una leccion sobre energia que no cabe en una etiqueta.",
  "Premium no es caro. Premium es saber seleccionar.",
  "Mucha gente busca energia en una etiqueta, pero la base empieza antes.",
  "Dormir mejor. Comer mejor. Moverte. Quitar ruido. Elegir con criterio.",
  "THE FOCUX no va de vender cualquier cosa.",
  "Va de seleccionar herramientas serias para una vida profesional con mas claridad.",
  "Primero entiende. Luego decide.",
  "Guardalo para tu proxima semana de foco.",
].join(" ");

const SHOTS = [
  {
    time: "0-3s",
    scene: "Mercado nocturno de Bangkok, luces, movimiento y energia humana.",
    text: "Energia no es ruido.",
  },
  {
    time: "3-8s",
    scene: "Mr. Kaizen camina entre puestos, sonrie y mira directo a camara.",
    text: "Premium es saber seleccionar.",
  },
  {
    time: "8-16s",
    scene: "Detalles cercanos: comida real, pasos, descanso y silueta limpia de producto.",
    text: "Base primero: sueno, comida, movimiento.",
  },
  {
    time: "16-24s",
    scene: "Pausa cinematografica, detalle negro y dorado de THE FOCUX, sin venta agresiva.",
    text: "Herramientas serias. Criterio real.",
  },
  {
    time: "24-30s",
    scene: "Mr. Kaizen senala suavemente a camara con luces de calle detras.",
    text: "Primero entiende. Luego decide.",
  },
];

function buildFirstFlow() {
  return {
    schema: "kaizen7.first_flow.v1",
    id: PROJECT_ID,
    title: "Mr. Kaizen: energia con criterio desde Bangkok",
    objective: "Validate the KAIZEN7 small kernel with one real content package.",
    kernel_packet: buildKernelManifestPacket("render"),
    kernel_sequence: ["research", "create", "compare", "render", "remember", "verify"],
    brand: {
      host: "Mr. Kaizen",
      studio: "Flowmatik",
      product_brand: "THE FOCUX",
      public_positioning:
        "Premium performance lifestyle: content first, product only when it helps.",
    },
    format: {
      channel: "short_video",
      duration_seconds: 30,
      ratio: "9:16",
      language: "es",
      status: "review_packet",
    },
    script: {
      voice: "70% sabio, 20% divertido, 10% gamberro; cercano, nunca medico ni guru.",
      voiceover: SCRIPT,
    },
    storyboard: SHOTS,
    claims_guard: {
      allowed: [
        "Hablar de claridad, criterio, habitos y estilo de vida.",
        "Presentar THE FOCUX como seleccion premium y no como promesa medica.",
        "Invitar a entender antes de comprar.",
      ],
      blocked: [
        "Prometer mejora garantizada de memoria, energia o concentracion.",
        "Tratar ansiedad, TDAH, demencia o cualquier condicion medica.",
        "Atribuir efectos clinicos a un producto sin evidencia y revision regulatoria.",
      ],
    },
    artifact_manifest: {
      json: path.join(PROJECT_DIR, `${PROJECT_ID}.json`),
      script: path.join(PROJECT_DIR, `${PROJECT_ID}.txt`),
      storyboard: path.join(EXPORT_DIR, `${PROJECT_ID}_storyboard.svg`),
      memory_note: MEMORY_NOTE,
    },
    verification: [
      "script_present",
      "storyboard_present",
      "claims_checked",
      "artifact_manifest_present",
      "memory_note_present",
    ],
    next_action:
      "connect_local_render_provider_for_mp4_when_ffmpeg_or_editor_harness_is_available",
  };
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapWords(value, maxChars = 32) {
  const lines = [];
  let current = "";
  for (const word of String(value).split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function storyboardSvg(flow = buildFirstFlow()) {
  const shotBlocks = flow.storyboard
    .map((shot, index) => {
      const y = 470 + index * 235;
      const textLines = wrapWords(shot.text, 28)
        .map((line, lineIndex) => {
          return `<text x="92" y="${y + 92 + lineIndex * 38}" class="shotText">${escapeXml(line)}</text>`;
        })
        .join("\n");
      const sceneLines = wrapWords(shot.scene, 50)
        .slice(0, 3)
        .map((line, lineIndex) => {
          return `<text x="92" y="${y + 156 + lineIndex * 30}" class="sceneText">${escapeXml(line)}</text>`;
        })
        .join("\n");
      return `
  <rect x="60" y="${y}" width="960" height="190" rx="18" class="shotBox"/>
  <text x="92" y="${y + 48}" class="time">${escapeXml(shot.time)}</text>
  ${textLines}
  ${sceneLines}`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#080808"/>
      <stop offset="52%" stop-color="#14110b"/>
      <stop offset="100%" stop-color="#050505"/>
    </linearGradient>
    <style>
      .kicker{font: 500 30px Arial, sans-serif; fill:#d7a940; letter-spacing:6px}
      .title{font: 700 76px Arial, sans-serif; fill:#f3d06b}
      .subtitle{font: 400 34px Arial, sans-serif; fill:#f6f1e6}
      .body{font: 400 30px Arial, sans-serif; fill:#e8e1d2}
      .time{font: 700 28px Arial, sans-serif; fill:#f3d06b}
      .shotText{font: 700 34px Arial, sans-serif; fill:#ffffff}
      .sceneText{font: 400 25px Arial, sans-serif; fill:#cfc7b7}
      .shotBox{fill:#111111; stroke:#b98a24; stroke-width:2}
    </style>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <circle cx="540" cy="210" r="105" fill="none" stroke="#d7a940" stroke-width="16" stroke-dasharray="22 14"/>
  <text x="540" y="120" text-anchor="middle" class="kicker">FLOWMATIK FIRST FLOW</text>
  <text x="540" y="330" text-anchor="middle" class="title">MR. KAIZEN</text>
  <text x="540" y="386" text-anchor="middle" class="subtitle">Bangkok Energy / THE FOCUX</text>
  <text x="70" y="450" class="body">Storyboard vertical 9:16 para revision antes de render MP4.</text>
  ${shotBlocks}
  <text x="70" y="1748" class="kicker">CLAIMS GUARD</text>
  <text x="70" y="1805" class="body">Contenido educativo. Sin promesas medicas. Sin venta agresiva.</text>
  <text x="70" y="1856" class="body">Siguiente paso: conectar proveedor local de render.</text>
</svg>
`;
}

function memoryMarkdown(flow = buildFirstFlow()) {
  return `# First Flow Mr Kaizen THE FOCUX 2026-07-02

## Decision
KAIZEN7 valida el small kernel con un primer paquete de contenido revisable antes de publicar.

## Flow
${flow.kernel_sequence.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## Voiceover
${flow.script.voiceover}

## Guardrail
- THE FOCUX aparece como criterio premium, no como promesa medica.
- Mr. Kaizen ensena primero y vende solo si aporta valor.
- No publicar hasta tener revision de claims y render final.

## Artifacts
- JSON: ${flow.artifact_manifest.json}
- Script: ${flow.artifact_manifest.script}
- Storyboard: ${flow.artifact_manifest.storyboard}

## Next
Conectar proveedor local para MP4 vertical: FFmpeg, Kdenlive, Shotcut, OpenCut o Remotion, segun disponibilidad real.
`;
}

function writeFirstFlow(flow = buildFirstFlow()) {
  fs.mkdirSync(PROJECT_DIR, { recursive: true });
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(MEMORY_NOTE), { recursive: true });

  fs.writeFileSync(flow.artifact_manifest.json, `${JSON.stringify(flow, null, 2)}\n`);
  fs.writeFileSync(flow.artifact_manifest.script, `${flow.script.voiceover}\n`);
  fs.writeFileSync(flow.artifact_manifest.storyboard, storyboardSvg(flow));
  fs.writeFileSync(flow.artifact_manifest.memory_note, memoryMarkdown(flow));

  return flow.artifact_manifest;
}

if (require.main === module) {
  const flow = buildFirstFlow();
  if (process.argv.includes("--write")) {
    console.log(JSON.stringify(writeFirstFlow(flow), null, 2));
  } else {
    console.log(JSON.stringify(flow, null, 2));
  }
}

module.exports = {
  PROJECT_ID,
  buildFirstFlow,
  storyboardSvg,
  writeFirstFlow,
};
