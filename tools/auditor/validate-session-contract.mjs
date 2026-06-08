import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..");
const auditSessionPath = resolve(__dirname, "audit-session.mjs");

const requiredTopLevelFields = [
  "session_status",
  "timestamp",
  "audit_metadata",
  "decision",
  "result",
  "summary",
  "missing_evidence",
  "protocol_findings",
  "allowed_actions",
  "blocked_actions",
  "human_review_required",
  "next_step",
];

const requiredAuditMetadataFields = ["task_id", "requested_gate", "evidence_quality"];

const scenarios = [
  {
    name: "allowed",
    evidencePath: resolve(repoRoot, "tools", "auditor", "fixtures", "commit-allowed-evidence.json"),
    validate(report) {
      if (report.protocol_findings.length !== 0) {
        throw new Error("allowed report protocol_findings must be an empty array");
      }
    },
  },
  {
    name: "blocked_protocol_finding",
    evidencePath: resolve(repoRoot, "tools", "auditor", "fixtures", "protocol-findings-blocked-file-violation.json"),
    validate(report) {
      if (report.protocol_findings.length === 0) {
        throw new Error("blocked protocol-finding report protocol_findings must be populated");
      }
    },
  },
];

function hasOwn(object, field) {
  return Object.prototype.hasOwnProperty.call(object, field);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runAuditSession(evidencePath) {
  const result = spawnSync("node", [auditSessionPath, "--evidence", evidencePath], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`audit-session exited ${result.status}: ${result.stderr || result.stdout}`);
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`audit-session did not emit valid JSON: ${error.message}`);
  }
}

function validateCompletedReport(report, scenarioName) {
  assert(report && typeof report === "object" && !Array.isArray(report), `${scenarioName}: report must be an object`);

  for (const field of requiredTopLevelFields) {
    assert(hasOwn(report, field), `${scenarioName}: missing top-level field ${field}`);
  }

  assert(report.session_status === "completed", `${scenarioName}: session_status must be completed`);
  assert(typeof report.timestamp === "string" && report.timestamp.length > 0, `${scenarioName}: timestamp must be a non-empty string`);
  assert(report.audit_metadata && typeof report.audit_metadata === "object" && !Array.isArray(report.audit_metadata), `${scenarioName}: audit_metadata must be an object`);

  for (const field of requiredAuditMetadataFields) {
    assert(hasOwn(report.audit_metadata, field), `${scenarioName}: missing audit_metadata.${field}`);
  }

  assert(typeof report.decision === "string" && report.decision.length > 0, `${scenarioName}: decision must be a non-empty string`);
  assert(typeof report.result === "string" && report.result.length > 0, `${scenarioName}: result must be a non-empty string`);
  assert(typeof report.summary === "string" && report.summary.length > 0, `${scenarioName}: summary must be a non-empty string`);
  assert(Array.isArray(report.missing_evidence), `${scenarioName}: missing_evidence must be an array`);
  assert(Array.isArray(report.protocol_findings), `${scenarioName}: protocol_findings must be an array`);
  assert(Array.isArray(report.allowed_actions), `${scenarioName}: allowed_actions must be an array`);
  assert(Array.isArray(report.blocked_actions), `${scenarioName}: blocked_actions must be an array`);
  assert(typeof report.human_review_required === "boolean", `${scenarioName}: human_review_required must be a boolean`);
  assert(typeof report.next_step === "string" && report.next_step.length > 0, `${scenarioName}: next_step must be a non-empty string`);
}

function main() {
  for (const scenario of scenarios) {
    const report = runAuditSession(scenario.evidencePath);
    validateCompletedReport(report, scenario.name);
    scenario.validate(report);
  }

  process.stdout.write("PASS audit session contract validation\n");
}

try {
  main();
} catch (error) {
  process.stderr.write(`FAIL audit session contract validation: ${error.message}\n`);
  process.exit(1);
}
