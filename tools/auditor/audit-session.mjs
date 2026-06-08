import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateEvidence } from "./audit.mjs";

/**
 * Dependency-Free Local Audit Session Runner
 *
 * Usage: node tools/auditor/audit-session.mjs --evidence <path/to/evidence.json>
 */

function exitWithError(message, details = null) {
  const errorReport = {
    status: "error",
    message,
    details,
  };
  process.stdout.write(`${JSON.stringify(errorReport, null, 2)}\n`);
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const evidenceIdx = args.indexOf("--evidence");

  if (evidenceIdx === -1 || !args[evidenceIdx + 1]) {
    exitWithError("Missing required argument: --evidence <path>");
  }

  return {
    evidencePath: resolve(args[evidenceIdx + 1]),
  };
}

function readEvidenceFile(filePath) {
  try {
    const buffer = readFileSync(filePath);
    // Handle UTF-8 and UTF-16LE (BOM) like audit.mjs does
    const content =
      buffer[0] === 0xff && buffer[1] === 0xfe
        ? buffer.toString("utf16le").replace(/^\uFEFF/, "")
        : buffer.toString("utf8").replace(/^\uFEFF/, "");

    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      exitWithError(`Evidence file not found: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      exitWithError(`Invalid JSON in evidence file: ${error.message}`);
    }
    exitWithError(`Failed to read evidence file: ${error.message}`);
  }
}

function runSession() {
  const { evidencePath } = parseArgs();
  const evidence = readEvidenceFile(evidencePath);

  // Deterministic Evaluation
  const decision = evaluateEvidence(evidence);

  // Structured Session Report (Privacy-first: no raw evidence)
  const sessionReport = {
    session_status: "completed",
    timestamp: new Date().toISOString(),
    audit_metadata: {
      task_id: decision.task_id || "N/A",
      requested_gate: decision.requested_gate || "N/A",
      evidence_quality: decision.evidence_quality,
    },
    decision: decision.decision,
    result: decision.result,
    summary: decision.summary || (decision.decision === "COMMIT_BLOCKED" ? "Commit blocked by audit rules." : "N/A"),
    missing_evidence: decision.missing_evidence || [],
    protocol_findings: decision.protocol_findings || [],
    allowed_actions: decision.allowed_actions,
    blocked_actions: decision.blocked_actions,
    human_review_required: decision.human_review_required,
    next_step: decision.next_step || (decision.decision === "COMMIT_BLOCKED" ? "Fix missing evidence before re-auditing." : "N/A"),
  };

  process.stdout.write(`${JSON.stringify(sessionReport, null, 2)}\n`);
  process.exit(0);
}

runSession();
