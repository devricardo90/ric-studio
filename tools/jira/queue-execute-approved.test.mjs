import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { approvedCommandHash } from "./approval-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const queueExecute = path.join(repoRoot, "tools", "jira", "queue-execute-approved.mjs");
const approvalDir = path.join(repoRoot, "docs", "validation", "jira-operator-approvals");
const taskKey = "RIC-STUDIO-102A";
const issueKey = "DAY-11";
const transitionId = "31";
const targetStatus = "Revisar";
const operatorCommand = `node tools/jira/operator-safe-flow.mjs --issue ${issueKey} --task-key ${taskKey} --transition-id ${transitionId} --to ${targetStatus} --owner-approved --duplicate-risk-accepted --transition-risk-accepted --real-write`;
const syntheticEnv = {
  JIRA_BASE_URL: "https://example.invalid",
  JIRA_EMAIL: "synthetic@example.invalid",
  JIRA_API_TOKEN: "synthetic-token-102a"
};

function sanitizedEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (["jira_base_url", "jira_email", "jira_api_token"].includes(key.toLowerCase())) {
      delete env[key];
    }
  }
  return env;
}

function approvalManifestPath(name) {
  return `docs/validation/jira-operator-approvals/${name}-${process.pid}.json`;
}

function writeManifest(name, overrides = {}) {
  mkdirSync(approvalDir, { recursive: true });
  const relativePath = approvalManifestPath(name);
  const manifest = {
    task_key: taskKey,
    issue_key: issueKey,
    expected_before_status: "Backlog / Ready",
    transition_id: transitionId,
    target_status: targetStatus,
    owner_approved: true,
    duplicate_risk_accepted: true,
    transition_risk_accepted: true,
    approved_command_hash: approvedCommandHash(operatorCommand),
    created_at: "2026-07-07T00:00:00.000Z",
    ...overrides
  };
  writeFileSync(path.resolve(repoRoot, relativePath), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return relativePath;
}

function writeInvalidManifest(name, content = "{") {
  mkdirSync(approvalDir, { recursive: true });
  const relativePath = approvalManifestPath(name);
  writeFileSync(path.resolve(repoRoot, relativePath), content, "utf8");
  return relativePath;
}

function cleanup(relativePath) {
  if (relativePath) rmSync(path.resolve(repoRoot, relativePath), { force: true });
}

function baseArgs(manifestPath) {
  return [
    "--issue", issueKey,
    "--task-key", taskKey,
    "--transition-id", transitionId,
    "--to", targetStatus,
    "--approval-manifest", manifestPath,
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--transition-risk-accepted",
    "--real-write"
  ];
}

function writeMockFetch({ beforeStatus = "Backlog / Ready", verifyStatus = "Revisar", duplicate = false } = {}) {
  const tempDir = mkdtempSync(path.join(tmpdir(), "ric-studio-queue-execute-"));
  const mockFetch = path.join(tempDir, "mock-fetch.mjs");
  const marker = `RIC-STUDIO-JIRA-EVIDENCE::DayBudget::${taskKey}::add_evidence_comment`;
  writeFileSync(mockFetch, [
    "globalThis.fetch = async (url, options = {}) => {",
    "  const method = String(options.method || 'GET').toUpperCase();",
    "  const href = String(url);",
    "  if (method === 'GET' && href.includes('/comment')) {",
    duplicate
      ? `    return new Response(JSON.stringify({ comments: [{ id: "existing-comment-102A", body: { content: [{ content: [{ text: ${JSON.stringify(marker)} }] }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } });`
      : "    return new Response(JSON.stringify({ comments: [] }), { status: 200, headers: { \"Content-Type\": \"application/json\" } });",
    "  }",
    "  if (method === 'POST' && href.includes('/comment')) {",
    "    return new Response(JSON.stringify({ id: \"mock-comment-102A\", self: \"https://example.invalid/rest/api/3/issue/DAY-11/comment/mock-comment-102A\" }), { status: 201, headers: { \"Content-Type\": \"application/json\" } });",
    "  }",
    "  if (method === 'POST' && href.includes('/transitions')) {",
    "    return new Response(null, { status: 204 });",
    "  }",
    "  if (method === 'GET' && href.includes('/issue/') && !href.includes('/comment') && !href.includes('/transitions')) {",
    "    const isQueueCommand = process.argv.some((arg) => String(arg).includes('queue-execute-approved.mjs'));",
    `    const statusName = isQueueCommand ? ${JSON.stringify(beforeStatus)} : ${JSON.stringify(verifyStatus)};`,
    "    const statusId = statusName === 'Backlog / Ready' ? '10036' : statusName === 'Revisar' ? '10038' : '10037';",
    "    return new Response(JSON.stringify({ key: \"DAY-11\", fields: { status: { id: statusId, name: statusName } } }), { status: 200, headers: { \"Content-Type\": \"application/json\" } });",
    "  }",
    "  return new Response(JSON.stringify({ error: 'unhandled mock fetch route' }), { status: 500, headers: { \"Content-Type\": \"application/json\" } });",
    "};",
    ""
  ].join("\n"), "utf8");

  return {
    tempDir,
    nodeOptions: `--import ${pathToFileURL(mockFetch).href}`
  };
}

function runQueue(args, { mock = {}, env = {} } = {}) {
  const fetchMock = writeMockFetch(mock);
  try {
    const result = spawnSync(process.execPath, [queueExecute, ...args], {
      cwd: repoRoot,
      env: {
        ...sanitizedEnv(),
        ...syntheticEnv,
        NODE_OPTIONS: fetchMock.nodeOptions,
        ...env
      },
      encoding: "utf8",
      windowsHide: true
    });

    assert.equal(result.error, undefined, result.error?.message);
    assert.equal(result.stderr, "", result.stderr);
    assert.notEqual(result.stdout.trim(), "", "expected JSON output");

    return {
      status: result.status,
      output: JSON.parse(result.stdout),
      stdout: result.stdout
    };
  } finally {
    rmSync(fetchMock.tempDir, { recursive: true, force: true });
  }
}

function assertNoWrite(output) {
  assert.equal(output.jira_write_performed, false);
  assert.equal(output.full_sync_performed, false);
  assert.equal(output.create_issue_performed, false);
  assert.equal(output.bulk_operation_performed, false);
  assert.equal(output.secrets_printed, false);
}

test("valid manifest and exact args reach mocked queue approved write path", () => {
  const manifestPath = writeManifest("valid");
  try {
    const { status, output } = runQueue(baseArgs(manifestPath));

    assert.equal(status, 0);
    assert.equal(output.tool, "ric-studio-jira-queue-execute-approved");
    assert.equal(output.task_key, taskKey);
    assert.equal(output.issue_key, issueKey);
    assert.equal(output.queue_execute_result, "QUEUE_APPROVED_WRITE_DONE");
    assert.equal(output.flow_result, "GUARDED_FLOW_WRITE_DONE");
    assert.equal(output.approval_manifest_valid, true);
    assert.equal(output.before_status, "Backlog / Ready");
    assert.equal(output.after_status, "Revisar");
    assert.equal(output.post_write_verify_performed, true);
    assert.equal(output.verify_result, "VERIFIED_DONE");
    assert.equal(output.status_verified, true);
    assert.equal(output.jira_write_performed, true);
    assert.equal(output.jira_api_called, true);
    assert.equal(output.network_call_performed, true);
    assert.equal(output.full_sync_performed, false);
    assert.equal(output.create_issue_performed, false);
    assert.equal(output.bulk_operation_performed, false);
    assert.equal(output.secrets_printed, false);
  } finally {
    cleanup(manifestPath);
  }
});

test("missing approval manifest blocks", () => {
  const { status, output } = runQueue([
    "--issue", issueKey,
    "--task-key", taskKey,
    "--transition-id", transitionId,
    "--to", targetStatus,
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--transition-risk-accepted",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.queue_execute_result, "BLOCKED_APPROVAL_MANIFEST_REQUIRED");
  assertNoWrite(output);
});

test("invalid manifest blocks", () => {
  const manifestPath = writeInvalidManifest("invalid");
  try {
    const { status, output } = runQueue(baseArgs(manifestPath));

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_APPROVAL_MANIFEST_INVALID");
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("issue mismatch blocks", () => {
  const manifestPath = writeManifest("issue-mismatch", { issue_key: "DAY-10" });
  try {
    const { status, output } = runQueue(baseArgs(manifestPath));

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_APPROVAL_MANIFEST_INVALID");
    assert.match(output.blocked_reason, /issue mismatch/);
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("task key mismatch blocks", () => {
  const manifestPath = writeManifest("task-mismatch", { task_key: "RIC-STUDIO-OTHER" });
  try {
    const { status, output } = runQueue(baseArgs(manifestPath));

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_APPROVAL_MANIFEST_INVALID");
    assert.match(output.blocked_reason, /task key mismatch/);
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("transition id mismatch blocks", () => {
  const manifestPath = writeManifest("transition-mismatch", { transition_id: "41" });
  try {
    const { status, output } = runQueue(baseArgs(manifestPath));

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_APPROVAL_MANIFEST_INVALID");
    assert.match(output.blocked_reason, /transition id mismatch/);
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("target status mismatch blocks", () => {
  const manifestPath = writeManifest("target-mismatch", { target_status: "Remote DONE" });
  try {
    const { status, output } = runQueue(baseArgs(manifestPath));

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_APPROVAL_MANIFEST_INVALID");
    assert.match(output.blocked_reason, /target status mismatch/);
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("expected_before_status mismatch blocks", () => {
  const manifestPath = writeManifest("before-mismatch", { expected_before_status: "Revisar" });
  try {
    const { status, output } = runQueue(baseArgs(manifestPath));

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_STATUS_CHANGED_SINCE_APPROVAL");
    assert.equal(output.before_status, "Backlog / Ready");
    assert.equal(output.approval_manifest_valid, true);
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("missing owner approval blocks", () => {
  const manifestPath = writeManifest("missing-owner");
  try {
    const { status, output } = runQueue(baseArgs(manifestPath).filter((arg) => arg !== "--owner-approved"));

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_OWNER_APPROVAL_MISSING");
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("missing duplicate-risk acceptance blocks", () => {
  const manifestPath = writeManifest("missing-duplicate-risk");
  try {
    const { status, output } = runQueue(baseArgs(manifestPath).filter((arg) => arg !== "--duplicate-risk-accepted"));

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_RISK_ACCEPTANCE_MISSING");
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("missing transition-risk acceptance blocks", () => {
  const manifestPath = writeManifest("missing-transition-risk");
  try {
    const { status, output } = runQueue(baseArgs(manifestPath).filter((arg) => arg !== "--transition-risk-accepted"));

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_RISK_ACCEPTANCE_MISSING");
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("duplicate evidence marker blocks", () => {
  const manifestPath = writeManifest("duplicate-marker");
  try {
    const { status, output } = runQueue(baseArgs(manifestPath), { mock: { duplicate: true } });

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_DUPLICATE_EVIDENCE_MARKER");
    assert.equal(output.flow_result, "BLOCKED_COMMENT_STEP");
    assert.equal(output.jira_write_performed, false);
    assert.equal(output.jira_api_called, true);
    assert.equal(output.network_call_performed, true);
    assert.equal(output.secrets_printed, false);
  } finally {
    cleanup(manifestPath);
  }
});

test("unsupported option blocks", () => {
  const { status, output } = runQueue(["--unsupported"]);

  assert.equal(status, 2);
  assert.equal(output.queue_execute_result, "BLOCKED_INVALID_ARGS");
  assertNoWrite(output);
});

test("multi-issue input blocks", () => {
  const manifestPath = writeManifest("multi-issue");
  try {
    const { status, output } = runQueue([
      "--issue", "DAY-11,DAY-12",
      "--task-key", taskKey,
      "--transition-id", transitionId,
      "--to", targetStatus,
      "--approval-manifest", manifestPath,
      "--owner-approved",
      "--duplicate-risk-accepted",
      "--transition-risk-accepted",
      "--real-write"
    ]);

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_MULTI_ISSUE_EXECUTION");
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("unsupported project blocks", () => {
  const { status, output } = runQueue([
    "--issue", "RIC-1",
    "--task-key", taskKey,
    "--transition-id", transitionId,
    "--to", targetStatus,
    "--approval-manifest", "docs/validation/jira-operator-approvals/not-read.json",
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--transition-risk-accepted",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.queue_execute_result, "BLOCKED_UNSUPPORTED_PROJECT");
  assertNoWrite(output);
});

test("full sync create and bulk attempts remain blocked", () => {
  assert.equal(runQueue(["--full-sync"]).output.queue_execute_result, "BLOCKED_FULL_SYNC_ATTEMPT");
  assert.equal(runQueue(["--create-issue"]).output.queue_execute_result, "BLOCKED_CREATE_ISSUE_ATTEMPT");
  assert.equal(runQueue(["--bulk"]).output.queue_execute_result, "BLOCKED_BULK_OPERATION_ATTEMPT");
});

test("post-write verification mismatch returns manual review verify failed", () => {
  const manifestPath = writeManifest("verify-failed");
  try {
    const { status, output } = runQueue(baseArgs(manifestPath), { mock: { verifyStatus: "Em andamento" } });

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "QUEUE_APPROVED_VERIFY_FAILED");
    assert.equal(output.verify_result, "VERIFY_FAILED");
    assert.equal(output.status_verified, false);
    assert.equal(output.partial_write_performed, true);
    assert.equal(output.requires_manual_review, true);
    assert.equal(output.secrets_printed, false);
  } finally {
    cleanup(manifestPath);
  }
});

test("audit log writes sanitized record when requested", () => {
  const manifestPath = writeManifest("audit");
  const auditPath = `docs/validation/jira-operator-runs/queue-execute-approved-${process.pid}.jsonl`;
  rmSync(path.resolve(repoRoot, auditPath), { force: true });

  try {
    const { status, output } = runQueue([...baseArgs(manifestPath), "--audit-log", auditPath]);
    const auditLine = readFileSync(path.resolve(repoRoot, auditPath), "utf8").trim();
    const auditRecord = JSON.parse(auditLine);

    assert.equal(status, 0);
    assert.equal(output.audit_log_written, true);
    assert.equal(auditRecord.task_key, taskKey);
    assert.equal(auditRecord.issue_key, issueKey);
    assert.equal(auditRecord.before_status, "Backlog / Ready");
    assert.equal(auditRecord.after_status, "Revisar");
    assert.equal(auditRecord.jira_write_performed, true);
    assert.equal(auditRecord.secrets_printed, false);
    assert.equal(Object.hasOwn(auditRecord, "token"), false);
  } finally {
    cleanup(manifestPath);
    rmSync(path.resolve(repoRoot, auditPath), { force: true });
  }
});

test("unsafe audit path blocks", () => {
  const manifestPath = writeManifest("unsafe-audit");
  try {
    const { status, output } = runQueue([...baseArgs(manifestPath), "--audit-log", "../unsafe.jsonl"]);

    assert.equal(status, 2);
    assert.equal(output.queue_execute_result, "BLOCKED_AUDIT_LOG_PATH");
    assertNoWrite(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("secrets are not printed", () => {
  const manifestPath = writeManifest("no-secrets");
  try {
    const { output, stdout } = runQueue(baseArgs(manifestPath));

    assert.equal(output.secrets_printed, false);
    assert.doesNotMatch(stdout, /synthetic-token-102a/);
    assert.doesNotMatch(stdout, /synthetic@example\.invalid/);
    assert.doesNotMatch(stdout, /Authorization/i);
  } finally {
    cleanup(manifestPath);
  }
});

test("secret-like output is blocked without printing the value", () => {
  const { status, output, stdout } = runQueue([
    "--issue", issueKey,
    "--task-key", taskKey,
    "--transition-id", transitionId,
    "--to", "Authorization: Basic abc123",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.queue_execute_result, "BLOCKED_SECRET_LIKE_OUTPUT");
  assert.doesNotMatch(stdout, /Authorization: Basic abc123/);
  assertNoWrite(output);
});
