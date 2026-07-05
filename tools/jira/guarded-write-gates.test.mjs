import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const guardedWrite = path.join(repoRoot, "tools", "jira", "guarded-write.mjs");
const validateConfig = path.join(repoRoot, "tools", "jira", "validate-config.mjs");
const sampleConfig = path.join(repoRoot, "docs", "config", "jira-sync-config.sample.json");

function sanitizedEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (["jira_base_url", "jira_email", "jira_api_token"].includes(key.toLowerCase())) {
      delete env[key];
    }
  }
  return env;
}

function parseJsonObjects(stdout) {
  const objects = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < stdout.length; index += 1) {
    const char = stdout[index];

    if (start === -1) {
      if (char === "{") {
        start = index;
        depth = 1;
      }
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = inString;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        objects.push(JSON.parse(stdout.slice(start, index + 1)));
        start = -1;
      }
    }
  }

  return objects;
}

function runNode(args, options = {}) {
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    env: {
      ...sanitizedEnv(),
      ...(options.env || {})
    },
    encoding: "utf8",
    windowsHide: true
  });

  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.stderr, "", result.stderr);
  assert.notEqual(result.stdout.trim(), "", "expected JSON output");
  const outputs = parseJsonObjects(result.stdout);
  assert.ok(outputs.length > 0, "expected at least one JSON object");

  return {
    status: result.status,
    output: outputs[0],
    outputs,
    stdout: result.stdout
  };
}

function guarded(args) {
  return runNode([guardedWrite, ...args]);
}

function guardedWithMockFetch(args) {
  const tempDir = mkdtempSync(path.join(tmpdir(), "ric-studio-jira-fetch-"));
  const mockFetch = path.join(tempDir, "mock-fetch.mjs");

  try {
    writeFileSync(mockFetch, [
      "globalThis.fetch = async (url, options) => {",
      "  if (String(url).includes('/transitions')) {",
      "    return new Response(null, { status: 204 });",
      "  }",
      "  return new Response(",
      "    JSON.stringify({ id: \"mock-comment-087A\", self: \"https://example.invalid/rest/api/3/issue/DAY-8/comment/mock-comment-087A\" }),",
      "    { status: 201, headers: { \"Content-Type\": \"application/json\" } }",
      "  );",
      "};",
      ""
    ].join("\n"));

    const result = runNode([
      "--import",
      pathToFileURL(mockFetch).href,
      guardedWrite,
      ...args
    ], {
      env: {
        JIRA_BASE_URL: "https://example.invalid",
        JIRA_EMAIL: "synthetic@example.invalid",
        JIRA_API_TOKEN: "synthetic-token"
      }
    });

    return {
      status: result.status,
      outputs: result.outputs
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function guardedWithDuplicateMarker(args) {
  const tempDir = mkdtempSync(path.join(tmpdir(), "ric-studio-jira-duplicate-"));
  const mockFetch = path.join(tempDir, "mock-fetch.mjs");
  const marker = "RIC-STUDIO-JIRA-EVIDENCE::DayBudget::RIC-STUDIO-098A::add_evidence_comment";

  try {
    writeFileSync(mockFetch, [
      "globalThis.fetch = async (url, options = {}) => {",
      "  const method = String(options.method || 'GET').toUpperCase();",
      "  if (method === 'GET' && String(url).includes('/comment')) {",
      "    return new Response(",
      `      JSON.stringify({ comments: [{ id: "existing-comment-098A", body: { content: [{ content: [{ text: ${JSON.stringify(marker)} }] }] } }] }),`,
      "      { status: 200, headers: { \"Content-Type\": \"application/json\" } }",
      "    );",
      "  }",
      "  if (method === 'POST' && String(url).includes('/comment')) {",
      "    return new Response(JSON.stringify({ error: 'duplicate guard failed to block post' }), { status: 500 });",
      "  }",
      "  return new Response(null, { status: 204 });",
      "};",
      ""
    ].join("\n"));

    const result = runNode([
      "--import",
      pathToFileURL(mockFetch).href,
      guardedWrite,
      ...args
    ], {
      env: {
        JIRA_BASE_URL: "https://example.invalid",
        JIRA_EMAIL: "synthetic@example.invalid",
        JIRA_API_TOKEN: "synthetic-token"
      }
    });

    return {
      status: result.status,
      outputs: result.outputs,
      stdout: result.stdout
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function validate(args) {
  return runNode([validateConfig, ...args]);
}

function baseEvidenceArgs(issue, sprint = "DAY-8", taskKey = "RIC-STUDIO-085A") {
  return [
    "--action", "add_evidence_comment",
    "--issue", issue,
    "--config", sampleConfig,
    "--project", "DayBudget",
    "--sprint", sprint,
    "--task-key", taskKey,
    "--local-status", "REVIEW",
    "--protocol-level", "LEAN_LEVEL_2",
    "--validation-summary", "guarded gate regression test",
    "--generated-at", "2026-07-04T00:00:00.000Z"
  ];
}

function baseTransitionArgs(issue, taskKey = "RIC-STUDIO-088A", transitionId = "31", targetStatus = "Revisar") {
  return [
    "--action", "transition_issue",
    "--issue", issue,
    "--config", sampleConfig,
    "--task-key", taskKey,
    "--transition-id", transitionId,
    "--to", targetStatus
  ];
}

function assertNoJiraCall(output) {
  assert.equal(output.jira_write_performed, false);
  assert.equal(output.jira_api_called, false);
  assert.equal(output.network_call_performed, false);
}

test("DAY-8 sample config prepares an evidence add_comment dry-run without API or network calls", () => {
  const { status, output } = guarded([...baseEvidenceArgs("DAY-8"), "--dry-run"]);

  assert.equal(status, 0);
  assert.equal(output.result, "DRY_RUN_COMMENT_READY");
  assert.equal(output.issue_key, "DAY-8");
  assert.equal(output.operation, "add_comment");
  assert.equal(output.planned_jira_operation.type, "add_comment");
  assert.equal(output.planned_jira_operation.issue_key, "DAY-8");
  assertNoJiraCall(output);
});

test("DAY-10 sample config prepares an evidence add_comment dry-run without API or network calls", () => {
  const { status, output } = guarded([...baseEvidenceArgs("DAY-10", "DAY-10", "RIC-STUDIO-094A"), "--dry-run"]);

  assert.equal(status, 0);
  assert.equal(output.result, "DRY_RUN_COMMENT_READY");
  assert.equal(output.issue_key, "DAY-10");
  assert.equal(output.operation, "add_comment");
  assert.equal(output.planned_jira_operation.type, "add_comment");
  assert.equal(output.planned_jira_operation.issue_key, "DAY-10");
  assertNoJiraCall(output);
});

test("DAY-11 sample config prepares an evidence add_comment dry-run without API or network calls", () => {
  const { status, output } = guarded([...baseEvidenceArgs("DAY-11", "DAY-11", "RIC-STUDIO-096B"), "--dry-run"]);

  assert.equal(status, 0);
  assert.equal(output.result, "DRY_RUN_COMMENT_READY");
  assert.equal(output.issue_key, "DAY-11");
  assert.equal(output.operation, "add_comment");
  assert.equal(output.planned_jira_operation.type, "add_comment");
  assert.equal(output.planned_jira_operation.issue_key, "DAY-11");
  assert.equal(output.duplicate_detection.executed, false);
  assertNoJiraCall(output);
});

test("DAY-9 sample config is blocked because it is not explicitly allowlisted", () => {
  const { status, output } = guarded([...baseEvidenceArgs("DAY-9", "DAY-9"), "--dry-run"]);

  assert.equal(status, 2);
  assert.equal(output.result, "BLOCKED_MISSING_CONFIG");
  assert.match(output.config_blockers.join("\n"), /Issue DAY-9 is not explicitly allowlisted/);
  assertNoJiraCall(output);
});

test("project allowlist alone is insufficient when exact allowedIssueKeys are missing", () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "ric-studio-jira-gates-"));
  const tempConfig = path.join(tempDir, "jira-sync-config.project-only.json");

  try {
    const config = JSON.parse(readFileSync(sampleConfig, "utf8"));
    const dayBudget = config.approvedProjects.find(
      (project) => project.localProject === "DayBudget" && project.jiraProjectKey === "DAY"
    );
    assert.ok(dayBudget, "expected DayBudget project in sample config");
    delete dayBudget.allowedIssueKeys;
    writeFileSync(tempConfig, `${JSON.stringify(config, null, 2)}\n`);

    const { status, output } = guarded([
      ...baseEvidenceArgs("DAY-8"),
      "--config", tempConfig,
      "--dry-run"
    ]);

    assert.equal(status, 2);
    assert.equal(output.result, "BLOCKED_MISSING_CONFIG");
    assert.match(output.config_blockers.join("\n"), /does not define exact allowed issue keys/);
    assertNoJiraCall(output);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("create_issue remains blocked before API or network calls", () => {
  const { status, output } = guarded(["--action", "create_issue", "--issue", "DAY-8", "--comment", "blocked"]);

  assert.equal(status, 2);
  assert.equal(output.result, "BLOCKED");
  assertNoJiraCall(output);
});

test("DAY-8 exact transition smoke dry-run is ready without API or network calls", () => {
  const { status, output } = guarded([...baseTransitionArgs("DAY-8"), "--dry-run"]);

  assert.equal(status, 0);
  assert.equal(output.result, "DRY_RUN_TRANSITION_READY");
  assert.equal(output.operation, "transition_issue");
  assert.equal(output.issue_key, "DAY-8");
  assert.equal(output.planned_jira_operation.type, "transition_issue");
  assert.equal(output.planned_jira_operation.transition_id, "31");
  assert.equal(output.guarded_transition_smoke.target_status_name, "Revisar");
  assertNoJiraCall(output);
});

test("DAY-10 exact Remote DONE transition smoke dry-run is ready without API or network calls", () => {
  const { status, output } = guarded([
    ...baseTransitionArgs("DAY-10", "RIC-STUDIO-095A", "41", "Remote DONE"),
    "--dry-run"
  ]);

  assert.equal(status, 0);
  assert.equal(output.result, "DRY_RUN_TRANSITION_READY");
  assert.equal(output.operation, "transition_issue");
  assert.equal(output.issue_key, "DAY-10");
  assert.equal(output.planned_jira_operation.type, "transition_issue");
  assert.equal(output.planned_jira_operation.transition_id, "41");
  assert.equal(output.guarded_transition_smoke.allowed_issue_key, "DAY-10");
  assert.equal(output.guarded_transition_smoke.target_status_id, "10039");
  assert.equal(output.guarded_transition_smoke.target_status_name, "Remote DONE");
  assertNoJiraCall(output);
});

test("DAY-10 previous Review transition is blocked before API or network calls", () => {
  const { status, output } = guarded([
    ...baseTransitionArgs("DAY-10", "RIC-STUDIO-095A", "31", "Revisar"),
    "--dry-run"
  ]);

  assert.equal(status, 2);
  assert.equal(output.result, "BLOCKED_MISSING_CONFIG");
  assert.match(output.config_blockers.join("\n"), /Transition id 31 is not explicitly allowlisted/);
  assertNoJiraCall(output);
});

test("DAY-11 exact Review transition smoke dry-run is ready without API or network calls", () => {
  const { status, output } = guarded([
    ...baseTransitionArgs("DAY-11", "RIC-STUDIO-096B", "31", "Revisar"),
    "--dry-run"
  ]);

  assert.equal(status, 0);
  assert.equal(output.result, "DRY_RUN_TRANSITION_READY");
  assert.equal(output.operation, "transition_issue");
  assert.equal(output.issue_key, "DAY-11");
  assert.equal(output.planned_jira_operation.type, "transition_issue");
  assert.equal(output.planned_jira_operation.transition_id, "31");
  assert.equal(output.guarded_transition_smoke.allowed_issue_key, "DAY-11");
  assert.equal(output.guarded_transition_smoke.target_status_id, "10038");
  assert.equal(output.guarded_transition_smoke.target_status_name, "Revisar");
  assertNoJiraCall(output);
});

test("DAY-11 exact Remote DONE transition smoke dry-run is ready without API or network calls", () => {
  const { status, output } = guarded([
    ...baseTransitionArgs("DAY-11", "RIC-STUDIO-096B", "41", "Remote DONE"),
    "--dry-run"
  ]);

  assert.equal(status, 0);
  assert.equal(output.result, "DRY_RUN_TRANSITION_READY");
  assert.equal(output.operation, "transition_issue");
  assert.equal(output.issue_key, "DAY-11");
  assert.equal(output.planned_jira_operation.type, "transition_issue");
  assert.equal(output.planned_jira_operation.transition_id, "41");
  assert.equal(output.guarded_transition_smoke.allowed_issue_key, "DAY-11");
  assert.equal(output.guarded_transition_smoke.target_status_id, "10039");
  assert.equal(output.guarded_transition_smoke.target_status_name, "Remote DONE");
  assertNoJiraCall(output);
});

test("DAY-9 transition attempt is blocked before API or network calls", () => {
  const { status, output } = guarded([...baseTransitionArgs("DAY-9"), "--dry-run"]);

  assert.equal(status, 2);
  assert.equal(output.result, "BLOCKED_MISSING_CONFIG");
  assert.match(output.config_blockers.join("\n"), /Issue DAY-9 is not explicitly allowlisted/);
  assertNoJiraCall(output);
});

test("real evidence comment without owner approval blocks before API or network calls", () => {
  const { status, output } = guarded([...baseEvidenceArgs("DAY-8"), "--real-write"]);

  assert.equal(status, 2);
  assert.equal(output.result, "BLOCKED_MISSING_OWNER_APPROVAL");
  assert.equal(output.owner_approval.present, false);
  assertNoJiraCall(output);
});

test("real evidence comment with approvals but missing env blocks before API or network calls", () => {
  const { status, output } = guarded([
    ...baseEvidenceArgs("DAY-8"),
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.result, "BLOCKED_MISSING_CONFIG");
  assert.equal(output.blocked_reason, "Missing required environment variables.");
  assert.deepEqual(output.missing_environment_variables.sort(), [
    "JIRA_API_TOKEN",
    "JIRA_BASE_URL",
    "JIRA_EMAIL"
  ].sort());
  assertNoJiraCall(output);
});

test("duplicate evidence marker blocks real comment before creating another comment", () => {
  const { status, outputs } = guardedWithDuplicateMarker([
    ...baseEvidenceArgs("DAY-11", "DAY-11", "RIC-STUDIO-098A"),
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--real-write"
  ]);
  const [plan, result] = outputs;

  assert.equal(status, 2);
  assert.equal(outputs.length, 2);
  assert.equal(plan.result, "GUARDED_COMMENT_WRITE_READY");
  assert.equal(result.result, "BLOCKED_DUPLICATE_EVIDENCE_COMMENT");
  assert.equal(result.issue_key, "DAY-11");
  assert.equal(result.operation, "add_comment");
  assert.equal(result.jira_write_performed, false);
  assert.equal(result.jira_api_called, true);
  assert.equal(result.network_call_performed, true);
  assert.equal(result.duplicate_check_performed, true);
  assert.equal(result.duplicate_marker_found, true);
  assert.equal(result.existing_comment_id, "existing-comment-098A");
  assert.equal(result.comment_created, false);
  assert.equal(Object.hasOwn(result, "planned_jira_operation"), false);
  assert.equal(result.secrets_printed, false);
  assert.equal(result.no_write_confirmation, "NO_WRITE");
});

test("real transition without owner approval blocks before API or network calls", () => {
  const { status, output } = guarded([...baseTransitionArgs("DAY-8"), "--real-write"]);

  assert.equal(status, 2);
  assert.equal(output.result, "BLOCKED_MISSING_OWNER_APPROVAL");
  assert.equal(output.owner_approval.present, false);
  assertNoJiraCall(output);
});

test("real transition with approvals but missing env blocks before API or network calls", () => {
  const { status, output } = guarded([
    ...baseTransitionArgs("DAY-8"),
    "--owner-approved",
    "--transition-risk-accepted",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.result, "BLOCKED_MISSING_CONFIG");
  assert.equal(output.blocked_reason, "Missing required environment variables.");
  assert.deepEqual(output.missing_environment_variables.sort(), [
    "JIRA_API_TOKEN",
    "JIRA_BASE_URL",
    "JIRA_EMAIL"
  ].sort());
  assertNoJiraCall(output);
});

test("real transition without risk acceptance blocks before API or network calls", () => {
  const { status, output } = guarded([
    ...baseTransitionArgs("DAY-8"),
    "--owner-approved",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.result, "BLOCKED_TRANSITION_RISK");
  assert.equal(output.risk_acceptance.present, false);
  assertNoJiraCall(output);
});

test("mocked real evidence comment result uses task key and does not claim NO_WRITE", () => {
  const { status, outputs } = guardedWithMockFetch([
    ...baseEvidenceArgs("DAY-8", "DAY-8", "RIC-STUDIO-087A"),
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--real-write"
  ]);
  const [plan, result] = outputs;

  assert.equal(status, 0);
  assert.equal(outputs.length, 2);
  assert.equal(plan.result, "GUARDED_COMMENT_WRITE_READY");
  assert.equal(plan.task_id, "RIC-STUDIO-087A");
  assert.equal(plan.no_write_confirmation, "REAL_WRITE_READY_NOT_EXECUTED_BY_PLAN");
  assert.equal(result.result, "GUARDED_COMMENT_WRITE_DONE");
  assert.equal(result.task_id, "RIC-STUDIO-087A");
  assert.equal(result.issue_key, "DAY-8");
  assert.equal(result.operation, "add_comment");
  assert.equal(result.jira_write_performed, true);
  assert.equal(result.jira_api_called, true);
  assert.equal(result.network_call_performed, true);
  assert.equal(result.duplicate_check_performed, true);
  assert.equal(result.duplicate_marker_found, false);
  assert.equal(result.existing_comment_id, null);
  assert.equal(result.comment_created, true);
  assert.equal(result.comment_id, "mock-comment-087A");
  assert.equal(result.write_confirmation, "GUARDED_WRITE_COMPLETED");
  assert.equal(Object.hasOwn(result, "no_write_confirmation"), false);
  assert.equal(result.secrets_printed, false);
});

test("mocked real transition result uses exact task key and does not claim NO_WRITE", () => {
  const { status, outputs } = guardedWithMockFetch([
    ...baseTransitionArgs("DAY-8", "RIC-STUDIO-088A"),
    "--owner-approved",
    "--transition-risk-accepted",
    "--real-write"
  ]);
  const [plan, result] = outputs;

  assert.equal(status, 0);
  assert.equal(outputs.length, 2);
  assert.equal(plan.result, "GUARDED_TRANSITION_WRITE_READY");
  assert.equal(plan.task_id, "RIC-STUDIO-088A");
  assert.equal(plan.no_write_confirmation, "REAL_TRANSITION_READY_NOT_EXECUTED_BY_PLAN");
  assert.equal(result.result, "GUARDED_TRANSITION_WRITE_DONE");
  assert.equal(result.task_id, "RIC-STUDIO-088A");
  assert.equal(result.operation, "transition_issue");
  assert.equal(result.issue_key, "DAY-8");
  assert.equal(result.jira_write_performed, true);
  assert.equal(result.jira_api_called, true);
  assert.equal(result.network_call_performed, true);
  assert.equal(result.transition_performed, true);
  assert.equal(result.transition_id, "31");
  assert.equal(result.target_status_name, "Revisar");
  assert.equal(result.write_confirmation, "GUARDED_TRANSITION_COMPLETED");
  assert.equal(Object.hasOwn(result, "no_write_confirmation"), false);
  assert.equal(result.secrets_printed, false);
});

test("validate-config keeps full Jira sync blocked", () => {
  const { status, output } = validate(["--config", sampleConfig]);

  assert.equal(status, 0);
  assert.equal(output.real_sync_allowed, false);
  assert.equal(output.real_sync_blocked, true);
  assert.equal(output.jira_api_called, false);
  assert.equal(output.network_call_performed, false);
  assert.equal(output.credentials_required, false);
  assert.equal(output.secrets_printed, false);
});
