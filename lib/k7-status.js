const { spawnSync } = require("node:child_process");
const { buildAgentBrowser } = require("./agent-browser");
const { buildNowCard } = require("./k7-now");
const { checkProductionReadiness } = require("./production-readiness");

function runGit(args, root) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.status !== 0) {
    return {
      ok: false,
      output: "",
      error: (result.stderr || result.stdout || "git command failed").trim(),
    };
  }

  return {
    ok: true,
    output: (result.stdout || "").trim(),
    error: "",
  };
}

function summarizeWorkingTree(statusText = "") {
  const lines = statusText.split(/\r?\n/).filter(Boolean);
  const branch = lines.find((line) => line.startsWith("## "))?.replace(/^##\s+/, "") || "unknown";
  const changes = lines.filter((line) => !line.startsWith("## "));

  return {
    branch,
    changed_files: changes.length,
    untracked_files: changes.filter((line) => line.startsWith("?? ")).length,
    modified_files: changes.filter((line) => /^[ MARCUD?!]{2}\s/.test(line) && !line.startsWith("?? ")).length,
    clean: changes.length === 0,
    sample: changes.slice(0, 12),
  };
}

function classifyPathProduct(filePath = "") {
  const normalized = filePath.replace(/^"|"$/g, "").replace(/\\/g, "/");

  if (normalized === ".env.example") {
    return "kaizen7_kernel";
  }

  if (/^(\.env($|\.)|node_modules\/|dist\/|build\/|\.cache\/|data\/mastra\.db|data\/tool-memory\/|.*__pycache__\/|.*\.pyc$)/.test(normalized)) {
    return "generated_local";
  }

  if (/^(thefocuxOS\/|thefocux\.(html|css|js)$|public\/|Obsidian\/TheFocux\/|data\/the[-_]?focux|docs\/THE_FOCUX|THE_FOCUX_SIGNAL_LIBRARY\/)/i.test(normalized)) {
    return "the_focux";
  }

  if (/^(remotion\/|flowmatik_os\/|flowmatik_studio\/|content_library\/|exports\/|omni_workflow\.json|Obsidian\/Flowmatik\/|scripts\/render_kaizen_reel\.py|lib\/flowmatik-|tests\/flowmatik-)/i.test(normalized)) {
    return "flowmatik";
  }

  if (/Mr\.?\s*Kaizen|mr-kaizen|mr_kaizen/i.test(normalized)) {
    return "mr_kaizen";
  }

  if (/^(AGENTS\.md|KAIZEN7_CONTEXT\.md|README\.md|\.github\/|\.agents\/|\.claude\/skills\/|\.codex\/|docs\/|examples\/|lib\/|tests\/|data\/|CAPABILITIES\/|skills\/|skills-lock\.json|package\.json|package-lock\.json|requirements\.txt|\.gitignore|\.env\.example)/.test(normalized)) {
    return "kaizen7_kernel";
  }

  return "unknown";
}

function parseStatusEntry(line = "") {
  if (line.startsWith("?? ")) {
    return {
      code: "??",
      path: line.slice(3).trim(),
      deleted: false,
    };
  }

  const code = line.slice(0, 2);
  return {
    code,
    path: line.slice(3).trim(),
    deleted: code.includes("D"),
  };
}

function summarizeProductSplit(statusText = "") {
  const changes = statusText.split(/\r?\n/).filter((line) => line && !line.startsWith("## "));
  const buckets = {
    kaizen7_kernel: [],
    the_focux: [],
    flowmatik: [],
    mr_kaizen: [],
    generated_local: [],
    unknown: [],
  };
  const deletions = {
    the_focux: [],
    flowmatik: [],
    mr_kaizen: [],
  };
  const remainingExternal = {
    the_focux: [],
    flowmatik: [],
    mr_kaizen: [],
  };

  changes.forEach((line) => {
    const entry = parseStatusEntry(line);
    const product = classifyPathProduct(entry.path);
    buckets[product].push(entry.path);
    if (entry.deleted && Object.prototype.hasOwnProperty.call(deletions, product)) deletions[product].push(entry.path);
    if (!entry.deleted && Object.prototype.hasOwnProperty.call(remainingExternal, product)) remainingExternal[product].push(entry.path);
  });

  const externalProducts = ["the_focux", "flowmatik", "mr_kaizen"];
  const risks = externalProducts
    .filter((product) => remainingExternal[product].length > 0)
    .map((product) => `${product}_implementation_still_inside_kaizen7_repo:${remainingExternal[product].length}`);
  const extractionDeletions = externalProducts
    .filter((product) => deletions[product].length > 0)
    .map((product) => `${product}_extracted_deletions_pending_commit:${deletions[product].length}`);

  return {
    buckets: Object.fromEntries(Object.entries(buckets).map(([key, files]) => [
      key,
      {
        count: files.length,
        sample: files.slice(0, 8),
      },
    ])),
    extraction_deletions: Object.fromEntries(Object.entries(deletions).map(([key, files]) => [
      key,
      {
        count: files.length,
        sample: files.slice(0, 8),
      },
    ])),
    remaining_external: Object.fromEntries(Object.entries(remainingExternal).map(([key, files]) => [
      key,
      {
        count: files.length,
        sample: files.slice(0, 8),
      },
    ])),
    risks,
    extraction_deletion_warnings: extractionDeletions,
    recommendation: risks.length
      ? "Move remaining product implementation into external repos; keep only KAIZEN7 contracts and receipts here."
      : extractionDeletions.length
        ? "External product files are removed from KAIZEN7 and pending commit; verify imports in product repos before committing."
      : "Working tree matches KAIZEN7 kernel boundary.",
  };
}

function buildGitStatus(root) {
  const status = runGit(["status", "--short", "--branch"], root);
  const lastCommit = runGit(["log", "-1", "--oneline"], root);

  if (!status.ok) {
    return {
      available: false,
      error: status.error,
      working_tree: summarizeWorkingTree(""),
      product_split: summarizeProductSplit(""),
      last_commit: "unknown",
    };
  }

  return {
    available: true,
    error: "",
    working_tree: summarizeWorkingTree(status.output),
    product_split: summarizeProductSplit(status.output),
    last_commit: lastCommit.ok ? lastCommit.output : "unknown",
  };
}

function buildK7Status(root = process.cwd()) {
  const agentBrowser = buildAgentBrowser(root);
  const now = buildNowCard();
  const readiness = checkProductionReadiness({ root });
  const git = buildGitStatus(root);

  return {
    schema: "kaizen7.status.v1",
    generated_at: new Date().toISOString(),
    identity: "KAIZEN7 portable status handoff",
    root,
    project_boundary: "KAIZEN7 coordinates; Flowmatik produces; THE FOCUX grows; agents execute.",
    kernel_impact: {
      improves: ["context", "decision_time", "execution_quality"],
      reason: "One command gives agents the branch, risk, repo shape, readiness and next mission before action.",
    },
    git,
    readiness: {
      status: readiness.status,
      checks: readiness.checks.length,
      blockers: readiness.blockers.map((item) => item.id),
      warnings: readiness.warnings.map((item) => item.id),
    },
    agent_browser: {
      entrypoint: agentBrowser.current_entrypoint,
      counts: agentBrowser.counts,
      useful_scripts: agentBrowser.script_groups,
    },
    next_mission: {
      goal: now.mission.goal,
      growth_lane: now.growth_gate.lane,
      growth_output: now.growth_gate.output,
      route: now.route,
      files_to_read: now.files_to_read,
      next_action: now.next_action,
    },
    shared_contract: [
      "Use this status before opening or resuming agent work.",
      "Use Mission Brief for execution.",
      "Use Mission Outcome Receipt to close work.",
      "Do not install external harness layers without an explicit evaluation mission.",
    ],
    risks: [
      ...readiness.blockers.map((item) => item.message),
      ...git.product_split.risks,
      ...git.product_split.extraction_deletion_warnings,
      ...(git.working_tree.clean ? [] : [`Working tree has ${git.working_tree.changed_files} changed files.`]),
    ],
  };
}

function formatK7Status(status) {
  const lines = [
    "# KAIZEN7 STATUS",
    "",
    status.identity,
    "",
    `Generated: ${status.generated_at}`,
    `Root: ${status.root}`,
    "",
    "## Boundary",
    `- ${status.project_boundary}`,
    "",
    "## Git",
    `- branch: ${status.git.working_tree.branch}`,
    `- last commit: ${status.git.last_commit}`,
    `- changed files: ${status.git.working_tree.changed_files}`,
    `- untracked files: ${status.git.working_tree.untracked_files}`,
    "",
    "## Readiness",
    `- status: ${status.readiness.status}`,
    `- checks: ${status.readiness.checks}`,
    `- blockers: ${status.readiness.blockers.length}`,
    `- warnings: ${status.readiness.warnings.length}`,
    "",
    "## Repo Shape",
    `- docs: ${status.agent_browser.counts.docs}`,
    `- tests: ${status.agent_browser.counts.tests}`,
    `- routes: ${status.agent_browser.counts.routes || status.agent_browser.counts.capabilities}`,
    `- scripts: ${status.agent_browser.counts.scripts}`,
    "",
    "## Product Split",
    ...Object.entries(status.git.product_split.buckets)
      .filter(([, bucket]) => bucket.count > 0)
      .map(([product, bucket]) => `- ${product}: ${bucket.count}`),
    ...Object.entries(status.git.product_split.remaining_external)
      .filter(([, bucket]) => bucket.count > 0)
      .map(([product, bucket]) => `- remaining ${product}: ${bucket.count}`),
    ...Object.entries(status.git.product_split.extraction_deletions)
      .filter(([, bucket]) => bucket.count > 0)
      .map(([product, bucket]) => `- extracted ${product} deletions pending commit: ${bucket.count}`),
    `- recommendation: ${status.git.product_split.recommendation}`,
    "",
    "## Next Mission",
    `- goal: ${status.next_mission.goal}`,
    `- lane: ${status.next_mission.growth_lane}`,
    `- route: ${status.next_mission.route}`,
    `- next action: ${status.next_mission.next_action}`,
    "",
    "## Read First",
    ...status.next_mission.files_to_read.map((file) => `- ${file}`),
    "",
    "## Contract",
    ...status.shared_contract.map((item) => `- ${item}`),
    "",
    "## Risks",
    ...(status.risks.length ? status.risks.map((risk) => `- ${risk}`) : ["- none"]),
    "",
  ];

  return lines.join("\n");
}

if (require.main === module) {
  const status = buildK7Status(process.cwd());
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
  else process.stdout.write(`${formatK7Status(status)}\n`);
  process.exitCode = status.readiness.status === "ready" ? 0 : 1;
}

module.exports = {
  buildGitStatus,
  buildK7Status,
  classifyPathProduct,
  formatK7Status,
  runGit,
  summarizeProductSplit,
  summarizeWorkingTree,
};
