import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { planQueue } from "./queue-plan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const queuePlan = path.join(repoRoot, "tools", "jira", "queue-plan.mjs");

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

function baseArgs(overrides = {}) {
  return {
    project: "DAY",
    limit: "1",
    "task-key": "RIC-STUDIO-097B",
    "dry-run": true,
    ...overrides
  };
}

function issue({ key, title = "Queue candidate", status, statusId, transitions = [] }) {
  return {
    key,
    title,
    current_status_name: status,
    current_status_id: statusId,
    transitions
  };
}

function transition({ id, target, targetId }) {
  return {
    id,
    name: target,
    target_status_name: target,
    target_status_id: targetId
  };
}

function assertNoWrites(output) {
  assert.equal(output.jira_write_performed, false);
  assert.equal(output.full_sync_performed, false);
  assert.equal(output.create_issue_performed, false);
  assert.equal(output.bulk_operation_performed, false);
  assert.equal(output.comment_added, false);
  assert.equal(output.transition_performed, false);
  assert.equal(output.secrets_printed, false);
}

test("dry-run requires --dry-run", () => {
  const { status, output } = runNode([
    queuePlan,
    "--project", "DAY",
    "--limit", "1",
    "--task-key", "RIC-STUDIO-097B"
  ]);

  assert.equal(status, 2);
  assert.equal(output.queue_result, "BLOCKED_DRY_RUN_REQUIRED");
  assertNoWrites(output);
});

test("unsupported option blocks before Jira calls", () => {
  const { status, output } = runNode([
    queuePlan,
    "--project", "DAY",
    "--limit", "1",
    "--task-key", "RIC-STUDIO-097B",
    "--dry-run",
    "--real-write"
  ]);

  assert.equal(status, 2);
  assert.equal(output.queue_result, "BLOCKED_INVALID_ARGS");
  assert.match(output.blocked_reason, /Unsupported option: --real-write/);
  assert.equal(output.jira_api_called, false);
  assert.equal(output.network_call_performed, false);
  assertNoWrites(output);
});

test("unsupported project blocks before Jira calls", () => {
  const { status, output } = runNode([
    queuePlan,
    "--project", "ABC",
    "--limit", "1",
    "--task-key", "RIC-STUDIO-097B",
    "--dry-run"
  ]);

  assert.equal(status, 2);
  assert.equal(output.queue_result, "BLOCKED_UNSUPPORTED_PROJECT");
  assert.equal(output.jira_api_called, false);
  assert.equal(output.network_call_performed, false);
  assertNoWrites(output);
});

test("no eligible issue returns BLOCKED_NO_ELIGIBLE_ISSUE", () => {
  const output = planQueue({
    args: baseArgs(),
    issues: [
      issue({ key: "DAY-20", status: "Remote DONE", statusId: "10039" }),
      issue({ key: "DAY-21", status: "Em andamento", statusId: "10037" })
    ]
  });

  assert.equal(output.queue_result, "BLOCKED_NO_ELIGIBLE_ISSUE");
  assert.equal(output.jira_api_called, true);
  assert.equal(output.network_call_performed, true);
  assertNoWrites(output);
});

test("one Backlog / Ready issue plans transition 31 to Revisar", () => {
  const output = planQueue({
    args: baseArgs(),
    issues: [
      issue({
        key: "DAY-20",
        status: "Backlog / Ready",
        statusId: "10036",
        transitions: [
          transition({ id: "31", target: "Revisar", targetId: "10038" })
        ]
      })
    ]
  });

  assert.equal(output.queue_result, "DRY_RUN_QUEUE_PLAN_READY");
  assert.equal(output.selected_issue, "DAY-20");
  assert.equal(output.current_status, "Backlog / Ready");
  assert.equal(output.planned_transition_id, "31");
  assert.equal(output.planned_target_status, "Revisar");
  assert.equal(output.jira_api_called, true);
  assert.equal(output.network_call_performed, true);
  assertNoWrites(output);
});

test("one Revisar issue plans transition 41 to Remote DONE", () => {
  const output = planQueue({
    args: baseArgs(),
    issues: [
      issue({
        key: "DAY-21",
        status: "Revisar",
        statusId: "10038",
        transitions: [
          transition({ id: "41", target: "Remote DONE", targetId: "10039" })
        ]
      })
    ]
  });

  assert.equal(output.queue_result, "DRY_RUN_QUEUE_PLAN_READY");
  assert.equal(output.selected_issue, "DAY-21");
  assert.equal(output.current_status, "Revisar");
  assert.equal(output.planned_transition_id, "41");
  assert.equal(output.planned_target_status, "Remote DONE");
  assertNoWrites(output);
});

test("Remote DONE issues are ignored", () => {
  const output = planQueue({
    args: baseArgs(),
    issues: [
      issue({ key: "DAY-22", status: "Remote DONE", statusId: "10039" })
    ]
  });

  assert.equal(output.queue_result, "BLOCKED_NO_ELIGIBLE_ISSUE");
  assertNoWrites(output);
});

test("multiple candidates with limit 1 block deterministically", () => {
  const output = planQueue({
    args: baseArgs(),
    issues: [
      issue({
        key: "DAY-30",
        status: "Backlog / Ready",
        statusId: "10036",
        transitions: [transition({ id: "31", target: "Revisar", targetId: "10038" })]
      }),
      issue({
        key: "DAY-29",
        status: "Revisar",
        statusId: "10038",
        transitions: [transition({ id: "41", target: "Remote DONE", targetId: "10039" })]
      })
    ]
  });

  assert.equal(output.queue_result, "BLOCKED_MULTIPLE_CANDIDATES");
  assert.deepEqual(output.candidate_issue_keys, ["DAY-29", "DAY-30"]);
  assertNoWrites(output);
});

test("missing exact transition blocks without Jira writes", () => {
  const output = planQueue({
    args: baseArgs(),
    issues: [
      issue({
        key: "DAY-31",
        status: "Backlog / Ready",
        statusId: "10036",
        transitions: [transition({ id: "21", target: "Em andamento", targetId: "10037" })]
      })
    ]
  });

  assert.equal(output.queue_result, "BLOCKED_NO_VALID_TRANSITION");
  assert.equal(output.selected_issue, "DAY-31");
  assert.equal(output.expected_transition_id, "31");
  assertNoWrites(output);
});

test("blocked issue keys from config are excluded", () => {
  const output = planQueue({
    args: baseArgs(),
    config: {
      queuePlanner: {
        blockedIssueKeys: ["DAY-32"]
      }
    },
    issues: [
      issue({
        key: "DAY-32",
        status: "Backlog / Ready",
        statusId: "10036",
        transitions: [transition({ id: "31", target: "Revisar", targetId: "10038" })]
      })
    ]
  });

  assert.equal(output.queue_result, "BLOCKED_NO_ELIGIBLE_ISSUE");
  assertNoWrites(output);
});

test("secret-like output is blocked", () => {
  const output = planQueue({
    args: baseArgs(),
    issues: [
      issue({
        key: "DAY-33",
        title: "JIRA_API_TOKEN=should-not-print",
        status: "Backlog / Ready",
        statusId: "10036",
        transitions: [transition({ id: "31", target: "Revisar", targetId: "10038" })]
      })
    ]
  });

  assert.equal(output.queue_result, "BLOCKED_SECRET_LIKE_OUTPUT");
  assert.equal(output.secrets_printed, false);
  assertNoWrites(output);
});
