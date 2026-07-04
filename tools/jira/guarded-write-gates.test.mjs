import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

function runNode(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    env: sanitizedEnv(),
    encoding: "utf8",
    windowsHide: true
  });

  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.stderr, "", result.stderr);
  assert.notEqual(result.stdout.trim(), "", "expected JSON output");

  return {
    status: result.status,
    output: JSON.parse(result.stdout)
  };
}

function guarded(args) {
  return runNode([guardedWrite, ...args]);
}

function validate(args) {
  return runNode([validateConfig, ...args]);
}

function baseEvidenceArgs(issue, sprint = "DAY-8") {
  return [
    "--action", "add_evidence_comment",
    "--issue", issue,
    "--config", sampleConfig,
    "--project", "DayBudget",
    "--sprint", sprint,
    "--task-key", "RIC-STUDIO-085A",
    "--local-status", "REVIEW",
    "--protocol-level", "LEAN_LEVEL_2",
    "--validation-summary", "guarded gate regression test",
    "--generated-at", "2026-07-04T00:00:00.000Z"
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

test("non-comment Jira operations are blocked before API or network calls", () => {
  for (const args of [
    ["--action", "create_issue", "--issue", "DAY-8", "--comment", "blocked"],
    ["--action", "transition_issue", "--issue", "DAY-8", "--to", "DONE", "--comment", "blocked"]
  ]) {
    const { status, output } = guarded(args);

    assert.equal(status, 2);
    assert.equal(output.result, "BLOCKED");
    assertNoJiraCall(output);
  }
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
