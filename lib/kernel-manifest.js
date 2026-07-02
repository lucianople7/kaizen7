const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "data", "kernel-manifest.json");

function loadKernelManifest(filePath = MANIFEST_PATH) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function findMinimalCapability(id, manifest = loadKernelManifest()) {
  return manifest.minimal_capabilities.find((capability) => capability.id === id) || null;
}

function buildKernelManifestPacket(target = "all", manifest = loadKernelManifest()) {
  const capability =
    target === "all" ? null : findMinimalCapability(target, manifest);

  return {
    schema: "kaizen7.kernel_manifest_packet.v1",
    doctrine: manifest.doctrine,
    target,
    core_questions: manifest.core_questions.map((item) => item.id),
    selected: capability || manifest.minimal_capabilities,
    first_validation_flow: manifest.first_validation_flow,
    next_action: capability ? "route_to_capability_provider" : "select_minimal_capability",
  };
}

if (require.main === module) {
  const target = process.argv[2] || "all";
  console.log(JSON.stringify(buildKernelManifestPacket(target), null, 2));
}

module.exports = {
  MANIFEST_PATH,
  buildKernelManifestPacket,
  findMinimalCapability,
  loadKernelManifest,
};
