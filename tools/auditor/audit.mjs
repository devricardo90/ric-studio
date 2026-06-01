import { readFileSync } from "node:fs";

const REQUIRED_EVIDENCE_FIELDS = [
  "task_id",
  "requested_gate",
  "git_status_short",
  "git_status_sb",
  "git_diff_stat",
  "git_diff_check",
  "file_diffs",
  "validation_output",
];

function isMissingOrEmpty(value) {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

function blockedDecision(evidence = {}, missingEvidence = []) {
  return {
    decision: "COMMIT_BLOCKED",
    task_id: typeof evidence.task_id === "string" && evidence.task_id.trim()
      ? evidence.task_id
      : null,
    requested_gate:
      typeof evidence.requested_gate === "string" && evidence.requested_gate.trim()
        ? evidence.requested_gate
        : null,
    result: "blocked",
    evidence_quality: "incomplete",
    missing_evidence: missingEvidence,
    allowed_actions: [],
    blocked_actions: ["commit", "push", "remote_done"],
    human_review_required: true,
  };
}

function readEvidence(filePath) {
  if (!filePath || !filePath.trim()) {
    return {
      evidence: {},
      missingEvidence: ["evidence_file_path"],
    };
  }

  try {
    const rawEvidence = readFileSync(filePath, "utf8");
    const evidence = JSON.parse(rawEvidence);

    if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
      return {
        evidence: {},
        missingEvidence: ["valid_evidence_object"],
      };
    }

    return {
      evidence,
      missingEvidence: REQUIRED_EVIDENCE_FIELDS.filter((field) =>
        isMissingOrEmpty(evidence[field])
      ),
    };
  } catch (error) {
    const isSyntaxError = error instanceof SyntaxError;

    return {
      evidence: {},
      missingEvidence: [isSyntaxError ? "valid_json" : "readable_evidence_file"],
    };
  }
}

const filePath = process.argv[2];
const { evidence, missingEvidence } = readEvidence(filePath);
const decision = blockedDecision(evidence, missingEvidence);

process.stdout.write(`${JSON.stringify(decision, null, 2)}\n`);
