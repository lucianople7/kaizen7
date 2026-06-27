const assert = require("node:assert/strict");
const {
  reviewCronManifest,
  repairCronManifest,
  suggestCronFromSignal,
  runCronDoctor,
} = require("../lib/cron-doctor");

const unsafeManifest = {
  version: 1,
  policy: "execute-by-default",
  crons: [
    { id: "daily", title: "Daily", cadence: "daily", mode: "propose", description: "ok" },
    { id: "daily", title: "Duplicate", cadence: "daily", mode: "propose", description: "duplicate" },
    { id: "publish", title: "Publish", cadence: "daily", mode: "execute", description: "posts externally" },
    { id: "broken", title: "Broken", cadence: "weekly", mode: "propose" },
  ],
};

const review = reviewCronManifest(unsafeManifest);
assert(review.issues.some((issue) => issue.code === "unsafe_policy"), "doctor should flag unsafe manifest policy");
assert(review.issues.some((issue) => issue.code === "duplicate_id"), "doctor should flag duplicate cron IDs");
assert(review.issues.some((issue) => issue.code === "unsafe_mode"), "doctor should flag execute mode");
assert(review.issues.some((issue) => issue.code === "missing_description"), "doctor should flag missing descriptions");
assert(review.repairable.length >= 3, "doctor should identify internal repairable issues");

const repaired = repairCronManifest(unsafeManifest);
assert.equal(repaired.manifest.policy, "propose-by-default");
assert.equal(repaired.manifest.crons.filter((cron) => cron.id === "daily").length, 1);
assert(repaired.manifest.crons.every((cron) => cron.mode === "propose"));
assert(repaired.changes.some((change) => change.includes("Removed duplicate cron")));

const suggested = suggestCronFromSignal("Repeated AI index checks for THE FOCUX public assistant");
assert.equal(suggested.id, "thefocux-ai-index");
assert.equal(suggested.mode, "propose");
assert(suggested.description.includes("AI index"));

const doctorReport = runCronDoctor({ manifest: unsafeManifest, signal: "Repeated skill validation failures" });
assert.equal(doctorReport.id, "cron-doctor");
assert(doctorReport.actions.some((action) => action.type === "repair_manifest"));
assert(doctorReport.actions.some((action) => action.type === "suggest_cron"));
assert(doctorReport.memory.includes("## Cron Doctor"));
assert(doctorReport.memory.includes("unsafe_policy"));

console.log("cron doctor tests passed");
