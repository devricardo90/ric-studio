import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { approvedCommandHash } from "./approval-manifest.mjs";
import { aggregateOutput } from "./operator-safe-flow.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const operatorFlow = path.join(repoRoot, "tools", "jira", "operator-safe-flow.mjs");
const validateConfig = path.join(repoRoot, "tools", "jira", "validate-config.mjs");
const approvalDir = path.join(repoRoot, "docs", "validation", "jira-operator-approvals");

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

function baseArgs(issue = "DAY-11", transitionId = "31", targetStatus = "Revisar") {
  return [
    "--issue", issue,
    "--task-key", "RIC-STUDIO-096B",
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

function approvalManifestPath(name) {
  return `docs/validation/jira-operator-approvals/${name}-${process.pid}.json`;
}

function writeApprovalManifest(name, overrides = {}) {
  mkdirSync(approvalDir, { recursive: true });
  const relativePath = approvalManifestPath(name);
  const issue = overrides.issue_key || "DAY-11";
  const task = overrides.task_key || "RIC-STUDIO-096B";
  const transitionId = overrides.transition_id || "31";
  const targetStatus = overrides.target_status || "Revisar";
  const approvedCommand = `node tools/jira/operator-safe-flow.mjs --issue ${issue} --task-key ${task} --transition-id ${transitionId} --to ${targetStatus} --owner-approved --duplicate-risk-accepted --transition-risk-accepted --real-write`;
  const manifest = {
    task_key: task,
    issue_key: issue,
    expected_before_status: "Backlog / Ready",
    transition_id: transitionId,
    target_status: targetStatus,
    owner_approved: true,
    duplicate_risk_accepted: true,
    transition_risk_accepted: true,
    approved_command_hash: approvedCommandHash(approvedCommand),
    created_at: "2026-07-07T00:00:00.000Z",
    ...overrides
  };
  writeFileSync(path.resolve(repoRoot, relativePath), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return relativePath;
}

function cleanup(relativePath) {
  rmSync(path.resolve(repoRoot, relativePath), { force: true });
}

function writeOperatorMockFetch(issue = "DAY-12", statusName = "Revisar") {
  const tempDir = mkdtempSync(path.join(tmpdir(), "ric-studio-operator-flow-"));
  const mockFetch = path.join(tempDir, "mock-fetch.mjs");
  writeFileSync(mockFetch, [
    "globalThis.fetch = async (url, options = {}) => {",
    "  const method = String(options.method || 'GET').toUpperCase();",
    "  const href = String(url);",
    "  if (method === 'GET' && href.includes('/comment')) {",
    "    return new Response(JSON.stringify({ comments: [] }), { status: 200, headers: { \"Content-Type\": \"application/json\" } });",
    "  }",
    "  if (method === 'POST' && href.includes('/comment')) {",
    "    return new Response(JSON.stringify({ id: \"mock-comment-103B\", self: \"https://example.invalid/rest/api/3/issue/DAY-12/comment/mock-comment-103B\" }), { status: 201, headers: { \"Content-Type\": \"application/json\" } });",
    "  }",
    "  if (method === 'POST' && href.includes('/transitions')) {",
    "    return new Response(null, { status: 204 });",
    "  }",
    "  if (method === 'GET' && href.includes('/issue/') && !href.includes('/comment') && !href.includes('/transitions')) {",
    `    return new Response(JSON.stringify({ key: ${JSON.stringify(issue)}, fields: { status: { id: "10038", name: ${JSON.stringify(statusName)} } } }), { status: 200, headers: { "Content-Type": "application/json" } });`,
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
  const { status, output } = flow(baseArgs("DAY-10", "41", "Remote DONE"));

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

test("DAY-11 Review dry-run flow prepares comment and transition without Jira calls", () => {
  const { status, output } = flow(baseArgs("DAY-11", "31", "Revisar"));

  assert.equal(status, 0);
  assert.equal(output.flow_result, "DRY_RUN_FLOW_READY");
  assert.equal(output.issue_key, "DAY-11");
  assert.equal(output.transition_id, "31");
  assert.equal(output.target_status_name, "Revisar");
  assert.equal(output.comment_step.result, "DRY_RUN_COMMENT_READY");
  assert.equal(output.transition_step.result, "DRY_RUN_TRANSITION_READY");
  assert.equal(output.no_write_confirmation, "NO_WRITE");
  assertNoJiraCall(output);
});

test("DAY-11 Remote DONE dry-run flow prepares comment and transition without Jira calls", () => {
  const { status, output } = flow(baseArgs("DAY-11", "41", "Remote DONE"));

  assert.equal(status, 0);
  assert.equal(output.flow_result, "DRY_RUN_FLOW_READY");
  assert.equal(output.issue_key, "DAY-11");
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
    ...baseArgs("DAY-11"),
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
    ...baseArgs("DAY-11"),
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
    ...baseArgs("DAY-11"),
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
    ...baseArgs("DAY-11"),
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

test("missing approval manifest blocks real flow before Jira calls", () => {
  const { status, output } = flow([
    ...baseArgs("DAY-11"),
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--transition-risk-accepted",
    "--real-write"
  ], {
    env: {
      JIRA_BASE_URL: "https://example.invalid",
      JIRA_EMAIL: "synthetic@example.invalid",
      JIRA_API_TOKEN: "synthetic-token"
    }
  });

  assert.equal(status, 2);
  assert.equal(output.flow_result, "BLOCKED_PREFLIGHT");
  assert.match(output.blocked_reason, /--approval-manifest/);
  assert.equal(output.comment_step.ran, false);
  assert.equal(output.transition_step.ran, false);
  assertNoJiraCall(output);
});

test("operator-safe-flow exposes sanitized preflight block reason", () => {
  const { status, output } = flow([
    "--issue", "RIC-1",
    "--task-key", "RIC-STUDIO-103B",
    "--transition-id", "31",
    "--to", "Revisar",
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--transition-risk-accepted",
    "--real-write"
  ], {
    env: {
      JIRA_BASE_URL: "https://example.invalid",
      JIRA_EMAIL: "synthetic@example.invalid",
      JIRA_API_TOKEN: "synthetic-token"
    }
  });

  assert.equal(status, 2);
  assert.equal(output.flow_result, "BLOCKED_PREFLIGHT");
  assert.match(output.blocked_reason, /exact DAY issue key/);
  assert.match(output.blocked_reason, /--approval-manifest/);
  assert.doesNotMatch(JSON.stringify(output), /synthetic-token|synthetic@example/);
  assertNoJiraCall(output);
});

test("approval manifest mismatch blocks real flow before Jira calls", () => {
  const manifestPath = writeApprovalManifest("cli-issue-mismatch", { issue_key: "DAY-10" });

  try {
    const { status, output } = flow([
      ...baseArgs("DAY-11"),
      "--owner-approved",
      "--duplicate-risk-accepted",
      "--transition-risk-accepted",
      "--approval-manifest", manifestPath,
      "--real-write"
    ]);

    assert.equal(status, 2);
    assert.equal(output.flow_result, "BLOCKED_PREFLIGHT");
    assert.match(output.blocked_reason, /issue mismatch/);
    assert.equal(output.comment_step.ran, false);
    assert.equal(output.transition_step.ran, false);
    assertNoJiraCall(output);
  } finally {
    cleanup(manifestPath);
  }
});

test("DAY-12 approval manifest passes operator preflight into mocked guarded flow", () => {
  const manifestPath = writeApprovalManifest("day-12-approved", {
    task_key: "RIC-STUDIO-103A",
    issue_key: "DAY-12",
    expected_before_status: "Backlog / Ready",
    transition_id: "31",
    target_status: "Revisar"
  });
  const mock = writeOperatorMockFetch("DAY-12", "Revisar");

  try {
    const { status, output } = flow([
      "--issue", "DAY-12",
      "--task-key", "RIC-STUDIO-103A",
      "--transition-id", "31",
      "--to", "Revisar",
      "--owner-approved",
      "--duplicate-risk-accepted",
      "--transition-risk-accepted",
      "--approval-manifest", manifestPath,
      "--real-write"
    ], {
      env: {
        JIRA_BASE_URL: "https://example.invalid",
        JIRA_EMAIL: "synthetic@example.invalid",
        JIRA_API_TOKEN: "synthetic-token",
        NODE_OPTIONS: mock.nodeOptions
      }
    });

    assert.equal(status, 0);
    assert.equal(output.flow_result, "GUARDED_FLOW_WRITE_DONE");
    assert.equal(output.issue_key, "DAY-12");
    assert.equal(output.transition_id, "31");
    assert.equal(output.target_status_name, "Revisar");
    assert.equal(output.comment_step.result, "GUARDED_COMMENT_WRITE_DONE");
    assert.equal(output.transition_step.result, "GUARDED_TRANSITION_WRITE_DONE");
    assert.equal(output.transition_step.verify_result, "VERIFIED_DONE");
    assert.equal(output.transition_step.status_verified, true);
    assert.equal(output.secrets_printed, false);
  } finally {
    cleanup(manifestPath);
    rmSync(mock.tempDir, { recursive: true, force: true });
  }
});

test("partial write failure reports partial state without full-flow completion", () => {
  const output = aggregateOutput({
    args: {
      issue: "DAY-11",
      "task-key": "RIC-STUDIO-096B",
      "transition-id": "31",
      to: "Revisar",
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
