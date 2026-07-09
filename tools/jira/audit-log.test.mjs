import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { appendAuditRecord, buildAuditRecord, resolveAuditPath, verifyAuditRecordPersistence } from "./audit-log.mjs";
import { planQueue } from "./queue-plan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");

function auditPath(name) {
  return `docs/validation/jira-operator-runs/${name}-${process.pid}.jsonl`;
}

function cleanup(relativePath) {
  rmSync(path.resolve(repoRoot, relativePath), { force: true });
}

function baseRecord(overrides = {}) {
  return {
    task_key: "RIC-STUDIO-100A",
    phase: "dry_run_plan",
    issue_key: "DAY-12",
    before_status: "Backlog / Ready",
    after_status: null,
    transition_id: "31",
    target_status: "Revisar",
    queue_result: "DRY_RUN_QUEUE_PLAN_READY",
    jira_write_performed: false,
    full_sync_performed: false,
    create_issue_performed: false,
    bulk_operation_performed: false,
    secrets_printed: false,
    requires_manual_review: false,
    timestamp: "2026-07-05T00:00:00.000Z",
    ...overrides
  };
}

test("writes sanitized audit JSONL", () => {
  const target = auditPath("sanitized");
  cleanup(target);

  const result = appendAuditRecord({
    auditPath: target,
    record: baseRecord()
  });

  const line = readFileSync(path.resolve(repoRoot, target), "utf8").trim();
  const record = JSON.parse(line);

  assert.equal(result.audit_log_written, true);
  assert.equal(result.audit_log_verified, true);
  assert.equal(result.audit_log_path, target);
  assert.equal(record.task_key, "RIC-STUDIO-100A");
  assert.equal(record.phase, "dry_run_plan");
  assert.equal(record.issue_key, "DAY-12");
  assert.equal(record.jira_write_performed, false);
  assert.equal(record.full_sync_performed, false);
  assert.equal(record.create_issue_performed, false);
  assert.equal(record.bulk_operation_performed, false);
  assert.equal(record.secrets_printed, false);
  assert.equal(Object.hasOwn(record, "token"), false);

  cleanup(target);
});

test("verified audit append reports success", () => {
  const target = auditPath("verified-append");
  cleanup(target);

  try {
    const result = appendAuditRecord({
      auditPath: target,
      record: baseRecord({ phase: "approved_execution", queue_result: "QUEUE_APPROVED_WRITE_DONE" })
    });

    assert.equal(result.audit_log_written, true);
    assert.equal(result.audit_log_verified, true);
    assert.equal(result.audit_log_path, target);
  } finally {
    cleanup(target);
  }
});

test("missing persisted audit record fails closed", () => {
  const target = auditPath("missing-record");
  cleanup(target);

  try {
    appendAuditRecord({
      auditPath: target,
      record: baseRecord({ phase: "blocked", queue_result: "BLOCKED_OPERATOR_SAFE_FLOW" })
    });

    assert.throws(
      () => verifyAuditRecordPersistence({
        auditPath: target,
        record: baseRecord({
          phase: "approved_execution",
          queue_result: "QUEUE_APPROVED_WRITE_DONE",
          jira_write_performed: true,
          status_verified: true
        })
      }),
      (error) => {
        assert.equal(error.code, "BLOCKED_AUDIT_PERSISTENCE_VERIFY_FAILED");
        assert.match(error.message, /expected sanitized record was not found/);
        assert.match(error.message, /DAY-12/);
        return true;
      }
    );
  } finally {
    cleanup(target);
  }
});

test("rejects unsafe path traversal", () => {
  assert.throws(
    () => resolveAuditPath("../unsafe.jsonl"),
    /docs\/validation\/jira-operator-runs/
  );
});

test("blocks secret-like audit fields", () => {
  assert.throws(
    () => buildAuditRecord(baseRecord({ target_status: "Authorization: Basic abc123" })),
    /secret-like/
  );
});

test("records dry-run plan without write", () => {
  const record = buildAuditRecord(baseRecord({
    queue_result: "DRY_RUN_QUEUE_PLAN_READY",
    jira_write_performed: false
  }));

  assert.equal(record.phase, "dry_run_plan");
  assert.equal(record.queue_result, "DRY_RUN_QUEUE_PLAN_READY");
  assert.equal(record.jira_write_performed, false);
  assert.equal(record.status_verified, null);
});

test("records verified done", () => {
  const record = buildAuditRecord(baseRecord({
    phase: "approved_execution",
    flow_result: "GUARDED_FLOW_WRITE_DONE",
    after_status: "Remote DONE",
    transition_id: "41",
    target_status: "Remote DONE",
    comment_id: "10302",
    verify_result: "VERIFIED_DONE",
    status_verified: true,
    jira_write_performed: true
  }));

  assert.equal(record.flow_result, "GUARDED_FLOW_WRITE_DONE");
  assert.equal(record.comment_id, "10302");
  assert.equal(record.verify_result, "VERIFIED_DONE");
  assert.equal(record.status_verified, true);
  assert.equal(record.requires_manual_review, false);
});

test("records verify failed manual review", () => {
  const record = buildAuditRecord(baseRecord({
    phase: "verification",
    flow_result: "BLOCKED_TRANSITION_STEP",
    after_status: "Em andamento",
    verify_result: "VERIFY_FAILED",
    status_verified: false,
    jira_write_performed: true,
    requires_manual_review: true
  }));

  assert.equal(record.verify_result, "VERIFY_FAILED");
  assert.equal(record.status_verified, false);
  assert.equal(record.jira_write_performed, true);
  assert.equal(record.requires_manual_review, true);
});

test("does not affect queue-plan dry-run safety", () => {
  const output = planQueue({
    args: {
      project: "DAY",
      limit: "1",
      "task-key": "RIC-STUDIO-100A",
      "dry-run": true
    },
    issues: [
      {
        key: "DAY-12",
        title: "Queue dry run",
        current_status_name: "Backlog / Ready",
        current_status_id: "10036",
        transitions: [
          {
            id: "31",
            target_status_name: "Revisar",
            target_status_id: "10038"
          }
        ]
      }
    ]
  });

  assert.equal(output.queue_result, "DRY_RUN_QUEUE_PLAN_READY");
  assert.equal(output.jira_write_performed, false);
  assert.equal(output.full_sync_performed, false);
  assert.equal(output.create_issue_performed, false);
  assert.equal(output.bulk_operation_performed, false);
  assert.equal(output.secrets_printed, false);
});
