import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { aggregateOutput } from "./operator-safe-flow.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const operatorFlow = path.join(repoRoot, "tools", "jira", "operator-safe-flow.mjs");
const validateConfig = path.join(repoRoot, "tools", "jira", "validate-config.mjs");

function sanitizedEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (["jira_base_url", "jira_email", "jira_api_token"].includes(key.toLowerCase())) {
      delete env[key];
    }
  }
  return env;
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

  return {
    status: result.status,
    output: JSON.parse(result.stdout)
  };
}

function flow(args, options = {}) {
  return runNode([operatorFlow, ...args], options);
}

function baseArgs(issue = "DAY-10", transitionId = "41", targetStatus = "Remote DONE") {
  return [
    "--issue", issue,
    "--task-key", "RIC-STUDIO-095A",
    "--transition-id", transitionId,
    "--to", targetStatus
  ];
}

function assertNoJiraCall(output) {
  assert.equal(output.jira_write_performed, false);
  assert.equal(output.jira_api_called, false);
  assert.equal(output.network_call_performed, false);
  assert.equal(output.secrets_printed, false);
}

test("DAY-8 dry-run flow prepares comment and transition without Jira calls", () => {
  const { status, output } = flow(baseArgs("DAY-8", "31", "Revisar"));

  assert.equal(status, 0);
  assert.equal(output.flow_result, "DRY_RUN_FLOW_READY");
  assert.equal(output.issue_key, "DAY-8");
  assert.equal(output.transition_id, "31");
  assert.equal(output.target_status_name, "Revisar");
  assert.equal(output.comment_step.result, "DRY_RUN_COMMENT_READY");
  assert.equal(output.transition_step.result, "DRY_RUN_TRANSITION_READY");
  assert.equal(output.no_write_confirmation, "NO_WRITE");
  assertNoJiraCall(output);
});

test("DAY-10 dry-run flow prepares comment and transition without Jira calls", () => {
  const { status, output } = flow(baseArgs("DAY-10"));

  assert.equal(status, 0);
  assert.equal(output.flow_result, "DRY_RUN_FLOW_READY");
  assert.equal(output.issue_key, "DAY-10");
  assert.equal(output.transition_id, "41");
  assert.equal(output.target_status_name, "Remote DONE");
  assert.equal(output.comment_step.result, "DRY_RUN_COMMENT_READY");
  assert.equal(output.transition_step.result, "DRY_RUN_TRANSITION_READY");
  assert.equal(output.no_write_confirmation, "NO_WRITE");
  assertNoJiraCall(output);
});

test("production CLI rejects test mock flags", () => {
  const { status, output } = flow(["--test-mock-comment-step", "success"]);

  assert.equal(status, 2);
  assert.equal(output.flow_result, "BLOCKED_INVALID_ARGS");
  assert.match(output.blocked_reason, /Unsupported option: --test-mock-comment-step/);
  assertNoJiraCall(output);
});

test("DAY-9 flow is blocked at comment step and transition does not run", () => {
  const { status, output } = flow(baseArgs("DAY-9"));

  assert.equal(status, 2);
  assert.equal(output.flow_result, "BLOCKED_COMMENT_STEP");
  assert.equal(output.comment_step.result, "BLOCKED_MISSING_CONFIG");
  assert.equal(output.transition_step.result, "NOT_RUN_AFTER_COMMENT_BLOCK");
  assert.equal(output.transition_step.ran, false);
  assertNoJiraCall(output);
});

test("missing owner approval blocks real flow before any Jira call", () => {
  const { status, output } = flow([
    ...baseArgs("DAY-10"),
    "--duplicate-risk-accepted",
    "--transition-risk-accepted",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.flow_result, "BLOCKED_PREFLIGHT");
  assert.match(output.blocked_reason, /--owner-approved/);
  assert.equal(output.comment_step.ran, false);
  assert.equal(output.transition_step.ran, false);
  assertNoJiraCall(output);
});

test("missing duplicate-risk acceptance blocks before transition", () => {
  const { status, output } = flow([
    ...baseArgs("DAY-10"),
    "--owner-approved",
    "--transition-risk-accepted",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.flow_result, "BLOCKED_PREFLIGHT");
  assert.match(output.blocked_reason, /--duplicate-risk-accepted/);
  assert.equal(output.comment_step.ran, false);
  assert.equal(output.transition_step.ran, false);
  assertNoJiraCall(output);
});

test("missing transition-risk acceptance blocks before transition", () => {
  const { status, output } = flow([
    ...baseArgs("DAY-10"),
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.flow_result, "BLOCKED_PREFLIGHT");
  assert.match(output.blocked_reason, /--transition-risk-accepted/);
  assert.equal(output.comment_step.ran, false);
  assert.equal(output.transition_step.ran, false);
  assertNoJiraCall(output);
});

test("missing env blocks fully approved real flow before Jira calls", () => {
  const { status, output } = flow([
    ...baseArgs("DAY-10"),
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--transition-risk-accepted",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.flow_result, "BLOCKED_PREFLIGHT");
  assert.match(output.blocked_reason, /JIRA_BASE_URL/);
  assert.match(output.blocked_reason, /JIRA_EMAIL/);
  assert.match(output.blocked_reason, /JIRA_API_TOKEN/);
  assert.equal(output.comment_step.ran, false);
  assert.equal(output.transition_step.ran, false);
  assertNoJiraCall(output);
});

test("partial write failure reports partial state without full-flow completion", () => {
  const output = aggregateOutput({
    args: {
      issue: "DAY-10",
      "task-key": "RIC-STUDIO-095A",
      "transition-id": "41",
      to: "Remote DONE",
      "real-write": true
    },
    flowResult: "BLOCKED_TRANSITION_STEP",
    blockedReason: "Transition step returned BLOCKED_INVALID_ISSUE.",
    commentStep: {
      name: "comment_step",
      result: "GUARDED_COMMENT_WRITE_DONE",
      ran: true,
      jira_write_performed: true,
      jira_api_called: true,
      network_call_performed: true,
      secrets_printed: false,
      write_confirmation: "GUARDED_WRITE_COMPLETED"
    },
    transitionStep: {
      name: "transition_step",
      result: "BLOCKED_INVALID_ISSUE",
      ran: true,
      jira_write_performed: false,
      jira_api_called: true,
      network_call_performed: true,
      secrets_printed: false,
      no_write_confirmation: "NO_WRITE"
    }
  });

  assert.equal(output.flow_result, "BLOCKED_TRANSITION_STEP");
  assert.equal(output.comment_step.result, "GUARDED_COMMENT_WRITE_DONE");
  assert.equal(output.comment_step.jira_write_performed, true);
  assert.equal(output.transition_step.result, "BLOCKED_INVALID_ISSUE");
  assert.equal(output.transition_step.jira_write_performed, false);
  assert.equal(output.partial_write_performed, true);
  assert.equal(output.write_confirmation, "PARTIAL_WRITE_PERFORMED");
  assert.notEqual(output.write_confirmation, "GUARDED_FLOW_WRITE_COMPLETED");
  assert.equal(output.secrets_printed, false);
});

test("full sync remains blocked in existing validator", () => {
  const { status, output } = runNode([validateConfig, "--config", "docs/config/jira-sync-config.sample.json"]);

  assert.equal(status, 0);
  assert.equal(output.real_sync_allowed, false);
  assert.equal(output.real_sync_blocked, true);
  assert.equal(output.jira_api_called, false);
  assert.equal(output.network_call_performed, false);
  assert.equal(output.secrets_printed, false);
});
