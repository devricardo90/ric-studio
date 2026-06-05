import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

const COMMIT_ALLOWED_REQUIRED_FIELDS = [
  "task_id",
  "requested_gate",
  "expected_state_before_commit",
  "allowed_files",
  "blocked_files",
  "blocked_actions",
  "implementation_summary",
  "git_status_short",
  "git_status_sb",
  "git_diff_stat",
  "git_diff_check",
  "file_diffs",
  "validation_commands",
  "validation_outputs",
  "validation_interpretation",
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

function hasWhitespaceError(diffCheck) {
  const normalized = String(diffCheck).toLowerCase();

  return [
    "trailing whitespace",
    "space before tab",
    "conflict marker",
    "error:",
  ].some((pattern) => normalized.includes(pattern));
}

function parseStatusPaths(statusShort) {
  return String(statusShort)
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const path = line.length > 3 ? line.slice(3).trim() : line.trim();
      const renameTarget = path.includes(" -> ") ? path.split(" -> ").pop() : path;

      return renameTarget.trim();
    })
    .filter(Boolean);
}

function validationPassed(interpretation) {
  if (typeof interpretation === "string") {
    return interpretation.trim().toLowerCase() === "pass";
  }

  if (!interpretation || typeof interpretation !== "object" || Array.isArray(interpretation)) {
    return false;
  }

  const overall = interpretation.overall || interpretation.result || interpretation.status;

  return typeof overall === "string" && overall.trim().toLowerCase() === "pass";
}

function makeProtocolFinding({ code, path, evidenceField, message }) {
  return {
    code,
    severity: "blocker",
    path,
    evidence_field: evidenceField,
    message,
  };
}

function dedupeProtocolFindings(protocolFindings) {
  const seen = new Set();

  return protocolFindings.filter((finding) => {
    const key = `${finding.code}:${finding.path || ""}:${finding.evidence_field || ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function findCommitAllowedFindings(evidence) {
  const missingEvidence = COMMIT_ALLOWED_REQUIRED_FIELDS.filter((field) =>
    isMissingOrEmpty(evidence[field])
  );
  const protocolFindings = [];

  if (evidence.requested_gate !== "commit") {
    missingEvidence.push("requested_gate_commit");
  }

  if (evidence.expected_state_before_commit !== "REVIEW") {
    missingEvidence.push("expected_state_before_commit_review");
  }

  if (!Array.isArray(evidence.allowed_files)) {
    missingEvidence.push("allowed_files_array");
  }

  if (!Array.isArray(evidence.blocked_files)) {
    missingEvidence.push("blocked_files_array");
  }

  if (!Array.isArray(evidence.blocked_actions)) {
    missingEvidence.push("blocked_actions_array");
  } else {
    for (const action of ["push", "remote_done"]) {
      if (!evidence.blocked_actions.includes(action)) {
        missingEvidence.push(`blocked_action_${action}`);
      }
    }
  }

  if (typeof evidence.git_diff_check === "string" && hasWhitespaceError(evidence.git_diff_check)) {
    missingEvidence.push("git_diff_check_clean");
  }

  if (!validationPassed(evidence.validation_interpretation)) {
    missingEvidence.push("validation_interpretation_pass");
  }

  if (
    evidence.allowed_files &&
    evidence.blocked_files &&
    Array.isArray(evidence.allowed_files) &&
    Array.isArray(evidence.blocked_files)
  ) {
    const changedPaths = parseStatusPaths(evidence.git_status_short);
    const allowedFiles = new Set(evidence.allowed_files);
    const blockedFiles = new Set(evidence.blocked_files);

    for (const changedPath of changedPaths) {
      if (!allowedFiles.has(changedPath)) {
        protocolFindings.push(
          makeProtocolFinding({
            code: "allowed_file_violation",
            path: changedPath,
            evidenceField: "git_status_short",
            message: "Changed path is not listed in allowed_files.",
          })
        );
      }

      if (blockedFiles.has(changedPath)) {
        protocolFindings.push(
          makeProtocolFinding({
            code: "blocked_file_violation",
            path: changedPath,
            evidenceField: "git_status_short",
            message: "Changed path is listed in blocked_files.",
          })
        );
      }

      if (
        !evidence.file_diffs ||
        typeof evidence.file_diffs !== "object" ||
        isMissingOrEmpty(evidence.file_diffs[changedPath])
      ) {
        missingEvidence.push(`file_diff:${changedPath}`);
      }
    }
  }

  return {
    missingEvidence: [...new Set(missingEvidence)],
    protocolFindings: dedupeProtocolFindings(protocolFindings),
  };
}

function blockedDecision(evidence = {}, missingEvidence = [], protocolFindings = []) {
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
    protocol_findings: protocolFindings,
    allowed_actions: [],
    blocked_actions: ["commit", "push", "remote_done"],
    human_review_required: true,
  };
}

function allowedDecision(evidence) {
  return {
    decision: "COMMIT_ALLOWED",
    task_id: evidence.task_id,
    requested_gate: "commit",
    result: "allowed",
    evidence_quality: "sufficient",
    required_evidence: [],
    provided_evidence: [],
    missing_evidence: [],
    protocol_findings: [],
    allowed_actions: ["commit"],
    blocked_actions: ["push", "remote_done"],
    human_review_required: true,
    next_step: "Commit only the explicitly scoped files after human approval.",
    summary: evidence.implementation_summary,
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
    const evidenceBuffer = readFileSync(filePath);
    const rawEvidence =
      evidenceBuffer[0] === 0xff && evidenceBuffer[1] === 0xfe
        ? evidenceBuffer.toString("utf16le").replace(/^\uFEFF/, "")
        : evidenceBuffer.toString("utf8").replace(/^\uFEFF/, "");
    const evidence = JSON.parse(rawEvidence);

    if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
      return {
        evidence: {},
        missingEvidence: ["valid_evidence_object"],
      };
    }

    return {
      evidence,
      missingEvidence: [],
    };
  } catch (error) {
    const isSyntaxError = error instanceof SyntaxError;

    return {
      evidence: {},
      missingEvidence: [isSyntaxError ? "valid_json" : "readable_evidence_file"],
    };
  }
}

function evaluateLoadedEvidence(evidence, initialMissingEvidence = []) {
  const isCommitAllowedCandidate =
    evidence.expected_state_before_commit !== undefined ||
    evidence.validation_commands !== undefined ||
    evidence.allowed_files !== undefined;
  const evaluatedFindings = (() => {
    if (initialMissingEvidence.length > 0) {
      return {
        missingEvidence: initialMissingEvidence,
        protocolFindings: [],
      };
    }

    if (isCommitAllowedCandidate) {
      return findCommitAllowedFindings(evidence);
    }

    return {
      missingEvidence: REQUIRED_EVIDENCE_FIELDS.filter((field) => isMissingOrEmpty(evidence[field])),
      protocolFindings: [],
    };
  })();

  return isCommitAllowedCandidate &&
    evaluatedFindings.missingEvidence.length === 0 &&
    evaluatedFindings.protocolFindings.length === 0
    ? allowedDecision(evidence)
    : blockedDecision(
        evidence,
        evaluatedFindings.missingEvidence,
        evaluatedFindings.protocolFindings
      );
}

export function evaluateEvidence(evidence) {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return evaluateLoadedEvidence({}, ["valid_evidence_object"]);
  }

  return evaluateLoadedEvidence(evidence);
}

function runCli(filePath) {
  const { evidence, missingEvidence } = readEvidence(filePath);
  const decision = evaluateLoadedEvidence(evidence, missingEvidence);

  process.stdout.write(`${JSON.stringify(decision, null, 2)}\n`);
}

function isCliEntryPoint() {
  return Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isCliEntryPoint()) {
  runCli(process.argv[2]);
}
