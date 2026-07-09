import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const allowedAuditDir = path.resolve(repoRoot, "docs", "validation", "jira-operator-runs");
const SECRET_KEY_PATTERN = /(token|secret|password|authorization|cookie|credential|api[_-]?key|email|env)/i;
const SECRET_VALUE_PATTERN = /(JIRA_API_TOKEN|JIRA_BASE_URL|JIRA_EMAIL|Authorization:|Basic\s+[A-Za-z0-9+/=]+|password\s*=|token\s*=|secret\s*=|https?:\/\/[^/\s]+@)/i;
const SAFE_SECRET_STATUS_KEYS = new Set(["secrets_printed"]);

class AuditLogError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AuditLogError";
    this.code = code;
  }
}

function normalizeString(value) {
  return String(value || "").trim();
}

function hasSecretLike(value) {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") {
    return SECRET_VALUE_PATTERN.test(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasSecretLike(item));
  }

  if (typeof value === "object") {
    return Object.entries(value).some(([key, item]) => {
      const keyLooksSecret = !SAFE_SECRET_STATUS_KEYS.has(key) && SECRET_KEY_PATTERN.test(key);
      return keyLooksSecret || hasSecretLike(item);
    });
  }

  return false;
}

function cleanString(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

export function resolveAuditPath(auditPath) {
  const requestedPath = normalizeString(auditPath);
  if (!requestedPath) {
    throw new AuditLogError("BLOCKED_AUDIT_LOG_PATH", "Audit log path is required when audit logging is requested.");
  }

  const resolvedPath = path.resolve(repoRoot, requestedPath);
  const relative = path.relative(allowedAuditDir, resolvedPath);
  const isInsideAllowedDir = relative && !relative.startsWith("..") && !path.isAbsolute(relative);

  if (!isInsideAllowedDir || path.extname(resolvedPath) !== ".jsonl") {
    throw new AuditLogError(
      "BLOCKED_AUDIT_LOG_PATH",
      "Audit log path must be a .jsonl file under docs/validation/jira-operator-runs/."
    );
  }

  return resolvedPath;
}

export function buildAuditRecord(input = {}) {
  const record = {
    timestamp: cleanString(input.timestamp) || new Date().toISOString(),
    task_key: cleanString(input.task_key || input.task_id),
    phase: cleanString(input.phase),
    issue_key: cleanString(input.issue_key || input.selected_issue),
    before_status: cleanString(input.before_status || input.current_status),
    after_status: cleanString(input.after_status || input.actual_status),
    transition_id: cleanString(input.transition_id || input.planned_transition_id),
    target_status: cleanString(input.target_status || input.target_status_name || input.planned_target_status || input.expected_target_status),
    queue_result: cleanString(input.queue_result),
    flow_result: cleanString(input.flow_result),
    comment_id: cleanString(input.comment_id || input.comment_step?.comment_id),
    verify_result: cleanString(input.verify_result || input.transition_step?.verify_result),
    status_verified: input.status_verified ?? input.transition_step?.status_verified ?? null,
    jira_write_performed: input.jira_write_performed === true,
    full_sync_performed: input.full_sync_performed === true,
    create_issue_performed: input.create_issue_performed === true,
    bulk_operation_performed: input.bulk_operation_performed === true,
    secrets_printed: input.secrets_printed === true,
    requires_manual_review: input.requires_manual_review === true || input.transition_step?.requires_manual_review === true
  };

  if (hasSecretLike(record)) {
    throw new AuditLogError("BLOCKED_SECRET_LIKE_AUDIT_RECORD", "Audit record contains secret-like text.");
  }

  return record;
}

function auditRecordLine(record) {
  return JSON.stringify(record);
}

export function verifyAuditRecordPersistence({ auditPath, record }) {
  const resolvedPath = resolveAuditPath(auditPath);
  const auditRecord = buildAuditRecord(record);
  const expectedLine = auditRecordLine(auditRecord);
  let fileText;

  try {
    fileText = readFileSync(resolvedPath, "utf8");
  } catch (error) {
    throw new AuditLogError(
      "BLOCKED_AUDIT_PERSISTENCE_VERIFY_FAILED",
      `Audit persistence verification failed for ${path.relative(repoRoot, resolvedPath).replace(/\\/g, "/")}: ${error.message}`
    );
  }

  const persisted = fileText.split(/\r?\n/).some((line) => line === expectedLine);
  if (!persisted) {
    throw new AuditLogError(
      "BLOCKED_AUDIT_PERSISTENCE_VERIFY_FAILED",
      "Audit persistence verification failed: expected sanitized record was not found in " +
      `${path.relative(repoRoot, resolvedPath).replace(/\\/g, "/")} ` +
      `(task_key=${auditRecord.task_key || "null"}, issue_key=${auditRecord.issue_key || "null"}, ` +
      `transition_id=${auditRecord.transition_id || "null"}, queue_result=${auditRecord.queue_result || "null"}, ` +
      `flow_result=${auditRecord.flow_result || "null"}).`
    );
  }

  return {
    audit_log_verified: true,
    audit_log_path: path.relative(repoRoot, resolvedPath).replace(/\\/g, "/"),
    audit_record: auditRecord
  };
}

export function appendAuditRecord({ auditPath, record }) {
  const resolvedPath = resolveAuditPath(auditPath);
  const auditRecord = buildAuditRecord(record);

  mkdirSync(path.dirname(resolvedPath), { recursive: true });
  appendFileSync(resolvedPath, `${auditRecordLine(auditRecord)}\n`, "utf8");
  const verification = verifyAuditRecordPersistence({ auditPath, record: auditRecord });

  return {
    audit_log_written: true,
    audit_log_verified: verification.audit_log_verified,
    audit_log_path: verification.audit_log_path,
    audit_record: verification.audit_record
  };
}

export { AuditLogError, allowedAuditDir, hasSecretLike };
