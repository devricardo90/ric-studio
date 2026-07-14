import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hasSecretLike } from "./audit-log.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const allowedApprovalDir = path.resolve(repoRoot, "docs", "validation", "jira-operator-approvals");
const REQUIRED_FIELDS = [
  "task_key",
  "project_key",
  "issue_key",
  "expected_before_status",
  "transition_id",
  "target_status",
  "owner_approved",
  "duplicate_risk_accepted",
  "transition_risk_accepted",
  "created_at"
];

class ApprovalManifestError extends Error {
  constructor(code, message, findings = []) {
    super(message);
    this.name = "ApprovalManifestError";
    this.code = code;
    this.findings = findings;
  }
}

function normalizeString(value) {
  return String(value || "").trim();
}

function projectKeyFromIssue(issueKey) {
  const match = normalizeString(issueKey).match(/^([A-Z][A-Z0-9]+)-\d+$/);
  return match ? match[1] : "";
}

function cleanRelative(resolvedPath) {
  return path.relative(repoRoot, resolvedPath).replace(/\\/g, "/");
}

export function resolveApprovalManifestPath(manifestPath) {
  const requestedPath = normalizeString(manifestPath);
  if (!requestedPath) {
    throw new ApprovalManifestError(
      "BLOCKED_APPROVAL_MANIFEST_PATH",
      "Approval manifest path is required when approval manifest validation is requested."
    );
  }

  const resolvedPath = path.resolve(repoRoot, requestedPath);
  const relative = path.relative(allowedApprovalDir, resolvedPath);
  const isInsideAllowedDir = relative && !relative.startsWith("..") && !path.isAbsolute(relative);

  if (!isInsideAllowedDir || path.extname(resolvedPath) !== ".json") {
    throw new ApprovalManifestError(
      "BLOCKED_APPROVAL_MANIFEST_PATH",
      "Approval manifest path must be a .json file under docs/validation/jira-operator-approvals/."
    );
  }

  return resolvedPath;
}

export function approvedCommandHash(command) {
  return createHash("sha256").update(normalizeString(command), "utf8").digest("hex");
}

function requireStringMatch({ manifest, expected, manifestField, expectedField, label, findings }) {
  const actualValue = normalizeString(manifest[manifestField]);
  const expectedValue = normalizeString(expected[expectedField]);

  if (!actualValue) {
    findings.push(`Missing required ${manifestField}.`);
  } else if (expectedValue && actualValue !== expectedValue) {
    findings.push(`${label} mismatch.`);
  }
}

function requireBooleanMatch({ manifest, expected, manifestField, expectedField, label, findings }) {
  if (typeof manifest[manifestField] !== "boolean") {
    findings.push(`Missing required boolean ${manifestField}.`);
    return;
  }

  if (typeof expected[expectedField] === "boolean" && manifest[manifestField] !== expected[expectedField]) {
    findings.push(`${label} mismatch.`);
  }
}

function validateCommandApproval({ manifest, expected, findings }) {
  const approvedCommand = normalizeString(manifest.approved_command);
  const approvedHash = normalizeString(manifest.approved_command_hash);

  if (!approvedCommand && !approvedHash) {
    findings.push("Missing required approved_command or approved_command_hash.");
    return;
  }

  const expectedCommand = normalizeString(expected.approvedCommand);
  const expectedHash = normalizeString(expected.approvedCommandHash);

  if (approvedCommand && expectedCommand && approvedCommand !== expectedCommand) {
    findings.push("approved command mismatch.");
  }

  if (approvedHash && expectedHash && approvedHash !== expectedHash) {
    findings.push("approved command hash mismatch.");
  }
}

function validateCreatedAt(value, findings) {
  const createdAt = normalizeString(value);
  if (!createdAt) {
    findings.push("Missing required created_at.");
    return;
  }

  if (Number.isNaN(Date.parse(createdAt))) {
    findings.push("created_at must be a parseable timestamp.");
  }
}

export function validateApprovalManifest({ manifestPath, expected = {} }) {
  const resolvedPath = resolveApprovalManifestPath(manifestPath);
  let manifest;

  try {
    manifest = JSON.parse(readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    throw new ApprovalManifestError(
      "BLOCKED_APPROVAL_MANIFEST_JSON",
      `Approval manifest must be valid JSON: ${error.message}`
    );
  }

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new ApprovalManifestError(
      "BLOCKED_APPROVAL_MANIFEST_JSON",
      "Approval manifest must be a JSON object."
    );
  }

  if (hasSecretLike(manifest)) {
    throw new ApprovalManifestError(
      "BLOCKED_SECRET_LIKE_APPROVAL_MANIFEST",
      "Approval manifest contains secret-like text."
    );
  }

  const findings = [];
  for (const field of REQUIRED_FIELDS) {
    if (!Object.hasOwn(manifest, field)) findings.push(`Missing required ${field}.`);
  }

  requireStringMatch({ manifest, expected, manifestField: "task_key", expectedField: "taskKey", label: "task key", findings });
  requireStringMatch({ manifest, expected, manifestField: "project_key", expectedField: "projectKey", label: "project", findings });
  requireStringMatch({ manifest, expected, manifestField: "issue_key", expectedField: "issueKey", label: "issue", findings });
  if (normalizeString(manifest.project_key) && normalizeString(manifest.issue_key) &&
    normalizeString(manifest.project_key) !== projectKeyFromIssue(manifest.issue_key)) {
    findings.push("manifest project_key must match issue_key project.");
  }
  requireStringMatch({
    manifest,
    expected,
    manifestField: "expected_before_status",
    expectedField: "expectedBeforeStatus",
    label: "source status",
    findings
  });
  requireStringMatch({
    manifest,
    expected,
    manifestField: "transition_id",
    expectedField: "transitionId",
    label: "transition id",
    findings
  });
  requireStringMatch({
    manifest,
    expected,
    manifestField: "target_status",
    expectedField: "targetStatus",
    label: "target status",
    findings
  });

  if (manifest.owner_approved !== true) {
    findings.push("owner_approved must be true.");
  }
  requireBooleanMatch({
    manifest,
    expected,
    manifestField: "duplicate_risk_accepted",
    expectedField: "duplicateRiskAccepted",
    label: "duplicate risk acceptance",
    findings
  });
  requireBooleanMatch({
    manifest,
    expected,
    manifestField: "transition_risk_accepted",
    expectedField: "transitionRiskAccepted",
    label: "transition risk acceptance",
    findings
  });
  validateCommandApproval({ manifest, expected, findings });
  validateCreatedAt(manifest.created_at, findings);

  if (findings.length > 0) {
    throw new ApprovalManifestError(
      "BLOCKED_APPROVAL_MANIFEST",
      `Approval manifest rejected: ${findings.join(" ")}`,
      findings
    );
  }

  return {
    approval_manifest_valid: true,
    approval_manifest_path: cleanRelative(resolvedPath),
    task_key: normalizeString(manifest.task_key),
    project_key: normalizeString(manifest.project_key),
    issue_key: normalizeString(manifest.issue_key),
    expected_before_status: normalizeString(manifest.expected_before_status),
    transition_id: normalizeString(manifest.transition_id),
    target_status: normalizeString(manifest.target_status),
    owner_approved: true,
    duplicate_risk_accepted: manifest.duplicate_risk_accepted,
    transition_risk_accepted: manifest.transition_risk_accepted,
    approved_command_hash: normalizeString(manifest.approved_command_hash) || approvedCommandHash(manifest.approved_command),
    created_at: normalizeString(manifest.created_at)
  };
}

export { ApprovalManifestError, allowedApprovalDir };
