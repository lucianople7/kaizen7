const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  addWaitlistLead,
  answerTheFocuxQuestion,
  buildTheFocuxMission,
  publicTheFocuxState,
  readTheFocuxState,
} = require("../lib/thefocux-backend");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "thefocux-backend-"));

const initial = publicTheFocuxState(root);
assert.equal(initial.schema, "the_focux.frontend_payload.v1");
assert.equal(initial.brand.name, "THE FOCUX");
assert(initial.manifesto.includes("No vendemos cientos de suplementos."));
assert.equal(initial.trust_cards.length, 3);
assert.equal(initial.founder_pass.title, "Founder Pass 001");
assert.equal(initial.founder_pass.includes.length, 4);
assert.equal(initial.live_status.length, 4);
assert.equal(initial.content_pack.first_video.title, "Energia con criterio");
assert.equal(initial.metrics.waitlist_count, 0);
assert(initial.guardrails.includes("No hacer claims medicos."));

const invalid = addWaitlistLead({ email: "mal" }, root);
assert.equal(invalid.ok, false);
assert.equal(invalid.status, "invalid_email");

const noConsent = addWaitlistLead({ email: "luciano@example.com" }, root);
assert.equal(noConsent.ok, false);
assert.equal(noConsent.status, "consent_required");

const joined = addWaitlistLead({
  email: "LUCIANO@example.com",
  name: "Luciano",
  role: "Founder",
  consent: true,
}, root);
assert.equal(joined.ok, true);
assert.equal(joined.status, "joined");
assert.equal(joined.lead.email, "luciano@example.com");
assert.equal(joined.metrics.waitlist_count, 1);

const duplicate = addWaitlistLead({ email: "luciano@example.com", consent: true }, root);
assert.equal(duplicate.status, "already_joined");
assert.equal(duplicate.metrics.waitlist_count, 1);

const saved = readTheFocuxState(root);
assert.equal(saved.waitlist.length, 1);

const mission = buildTheFocuxMission(root);
assert.equal(mission.schema, "the_focux.mission.v1");
assert(mission.backend.includes("/api/thefocux/waitlist"));
assert(mission.next_actions.some((item) => item.includes("Flowmatik")));

const answer = answerTheFocuxQuestion({ question: "Quien es Kaizen y que claims bloquea?" }, root);
assert.equal(answer.schema, "the_focux.answer.v1");
assert.equal(answer.ok, true);
assert(answer.sources.includes("kaizen"));
assert(answer.sources.includes("guardrails"));
assert(answer.answer.includes("Kaizen"));
assert(answer.guardrail.includes("No es consejo medico"));

console.log("THE FOCUX backend tests passed");
