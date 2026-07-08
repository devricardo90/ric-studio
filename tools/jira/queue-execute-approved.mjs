#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { appendAuditRecord, hasSecretLike, resolveAuditPath } from "./audit-log.mjs";
import { approvedCommandHash, validateApprovalManifest } from "./approval-manifest.mjs";

const REQUIRED_ENV = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN"];
const BOOLEAN_FLAGS = ["owner-approved", "duplicate-risk-accepted", "transition-risk-accepted", "real-write"];
const VALUE_FLAGS = ["issue", "task-key", "transition-id", "to", "approval-manifest", "audit-log"];
const ISSUE_KEY_PATTERN = /^([A-Z][A-Z0-9]+)-\d+$/;
const SUPPORTED_PROJECT = "DAY";
const TRANSITION_PLAN = {
  "Backlog / Ready": {
    transitionId: "31",
    targetStatus: "Revisar"
  },
  "Revisar": {
    transitionId: "41",
    targetStatus: "Remote DONE"
  }
};

const BLOCKED_OPTION_RESULTS = new Map([
  ["issues", "BLOCKED_MULTI_ISSUE_EXECUTION"],
  ["jql", "BLOCKED_MULTI_ISSUE_EXECUTION"],
  ["project", "BLOCKED_UNSUPPORTED_PROJECT"],
  ["full-sync", "BLOCKED_FULL_SYNC_ATTEMPT"],
  ["real-sync", "BLOCKED_FULL_SYNC_ATTEMPT"],
  ["sync", "BLOCKED_FULL_SYNC_ATTEMPT"],
  ["create", "BLOCKED_CREATE_ISSUE_ATTEMPT"],
  ["create-issue", "BLOCKED_CREATE_ISSUE_ATTEMPT"],
  ["bulk", "BLOCKED_BULK_OPERATION_ATTEMPT"],
  ["bulk-operation", "BLOCKED_BULK_OPERATION_ATTEMPT"]
]);

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const operatorFlow = path.join(repoRoot, "tools", "jira", "operator-safe-flow.mjs");

function normalizeString(value) {
  return String(value || "").trim();
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      return { error: `Unexpected positional argument: ${token}`, result: "BLOCKED_INVALID_ARGS" };
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (BLOCKED_OPTION_RESULTS.has(key)) {
      return { error: `Blocked queue execution option: --${key}`, result: BLOCKED_OPTION_RESULTS.get(key) };
    }

    if (key === "action") {
      const action = normalizeString(next).toLowerCase().replace(/-/g, "_");
      if (action === "create_issue") return { error: "Issue creation is blocked.", result: "BLOCKED_CREATE_ISSUE_ATTEMPT" };
      if (action === "bulk_operation") return { error: "Bulk operation is blocked.", result: "BLOCKED_BULK_OPERATION_ATTEMPT" };
      if (action === "full_sync" || action === "sync") return { error: "Full sync is blocked.", result: "BLOCKED_FULL_SYNC_ATTEMPT" };
      return { error: "Unsupported --action for queue approved execution.", result: "BLOCKED_INVALID_ARGS" };
    }

    if (BOOLEAN_FLAGS.includes(key)) {
      args[key] = true;
      continue;
    }

    if (!VALUE_FLAGS.includes(key)) {
      return { error: `Unsupported option: --${key}`, result: "BLOCKED_INVALID_ARGS" };
    }

    if (!next || next.startsWith("--")) {
      return { error: `Missing value for --${key}`, result: "BLOCKED_INVALID_ARGS" };
    }

    args[key] = next;
    index += 1;
  }

  return { args };
}

function baseOutput({ args = {}, queueExecuteResult, blockedReason = null, details = {} }) {
  return {
    tool: "ric-studio-jira-queue-execute-approved",
    task_key: normalizeString(args["task-key"]) || null,
    issue_key: normalizeString(args.issue) || null,
    queue_execute_result: queueExecuteResult,
    flow_result: null,
    transition_id: normalizeString(args["transition-id"]) || null,
    target_status_name: normalizeString(args.to) || null,
    approval_manifest_valid: false,
    before_status: null,
    after_status: null,
    post_write_verify_performed: false,
    verify_result: null,
    status_verified: null,
    jira_write_performed: false,
    jira_api_called: false,
    network_call_performed: false,
    full_sync_performed: false,
    create_issue_performed: false,
    bulk_operation_performed: false,
    secrets_printed: false,
    no_write_confirmation: "NO_WRITE",
    blocked_reason: blockedReason || undefined,
    ...details
  };
}

function blocked(args, queueExecuteResult, blockedReason, details = {}) {
  const output = baseOutput({ args, queueExecuteResult, blockedReason, details });
  if (queueExecuteResult !== "BLOCKED_SECRET_LIKE_OUTPUT" && hasSecretLike(output)) {
    return baseOutput({
      args: {},
      queueExecuteResult: "BLOCKED_SECRET_LIKE_OUTPUT",
      blockedReason: "Queue execute-approved output contained secret-like text and was blocked."
    });
  }
  return output;
}

function projectKey(issue) {
  const match = normalizeString(issue).match(ISSUE_KEY_PATTERN);
  return match ? match[1] : "";
}

function validateCli(args) {
  const issue = normalizeString(args.issue);
  const taskKey = normalizeString(args["task-key"]);
  const transitionId = normalizeString(args["transition-id"]);
  const targetStatus = normalizeString(args.to);

  if (!args["real-write"]) return { result: "BLOCKED_INVALID_ARGS", reason: "Queue execute-approved requires --real-write." };
  if (!issue) return { result: "BLOCKED_INVALID_ARGS", reason: "Queue execute-approved requires exact --issue." };
  if (issue.includes(",") || issue.includes(" ")) return { result: "BLOCKED_MULTI_ISSUE_EXECUTION", reason: "Queue execution requires exactly one issue." };
  if (!ISSUE_KEY_PATTERN.test(issue)) return { result: "BLOCKED_INVALID_ARGS", reason: "Issue key must match Jira key format PROJECT-123." };
  if (projectKey(issue) !== SUPPORTED_PROJECT) return { result: "BLOCKED_UNSUPPORTED_PROJECT", reason: "Queue execution currently supports exact DAY issues only." };
  if (!taskKey) return { result: "BLOCKED_INVALID_ARGS", reason: "Queue execute-approved requires exact --task-key." };
  if (!transitionId) return { result: "BLOCKED_INVALID_ARGS", reason: "Queue execute-approved requires exact --transition-id." };
  if (!targetStatus) return { result: "BLOCKED_INVALID_ARGS", reason: "Queue execute-approved requires exact --to target status." };
  if (!normalizeString(args["approval-manifest"])) {
    return { result: "BLOCKED_APPROVAL_MANIFEST_REQUIRED", reason: "Queue execute-approved requires --approval-manifest." };
  }
  if (args["owner-approved"] !== true) return { result: "BLOCKED_OWNER_APPROVAL_MISSING", reason: "Missing required --owner-approved." };
  if (args["duplicate-risk-accepted"] !== true) return { result: "BLOCKED_RISK_ACCEPTANCE_MISSING", reason: "Missing required --duplicate-risk-accepted." };
  if (args["transition-risk-accepted"] !== true) return { result: "BLOCKED_RISK_ACCEPTANCE_MISSING", reason: "Missing required --transition-risk-accepted." };

  return null;
}

function operatorApprovedCommand(args) {
  return [
    "node",
    "tools/jira/operator-safe-flow.mjs",
    "--issue", normalizeString(args.issue),
    "--task-key", normalizeString(args["task-key"]),
    "--transition-id", normalizeString(args["transition-id"]),
    "--to", normalizeString(args.to),
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--transition-risk-accepted",
    "--real-write"
  ].join(" ");
}

function validateManifest(args) {
  const command = operatorApprovedCommand(args);
  return validateApprovalManifest({
    manifestPath: args["approval-manifest"],
    expected: {
      taskKey: normalizeString(args["task-key"]),
      issueKey: normalizeString(args.issue),
      transitionId: normalizeString(args["transition-id"]),
      targetStatus: normalizeString(args.to),
      ownerApproved: args["owner-approved"] === true,
      duplicateRiskAccepted: args["duplicate-risk-accepted"] === true,
      transitionRiskAccepted: args["transition-risk-accepted"] === true,
      approvedCommand: command,
      approvedCommandHash: approvedCommandHash(command)
    }
  });
}

function missingEnvironment(env) {
  return REQUIRED_ENV.filter((name) => !env[name] || normalizeString(env[name]) === "");
}

function buildAuthHeader(email, token) {
  return `Basic ${Buffer.from(`${email}:${token}`, "utf8").toString("base64")}`;
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  if (url.username || url.password) {
    throw new Error("JIRA_BASE_URL must not contain username or password.");
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/+$/, "");
}

async function readIssueStatus({ issue, env }) {
  const baseUrl = normalizeBaseUrl(env.JIRA_BASE_URL);
  const endpoint = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(issue)}?fields=status`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": buildAuthHeader(env.JIRA_EMAIL, env.JIRA_API_TOKEN)
    }
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`Read-only issue status check failed with HTTP ${response.status}.`);
  }

  return {
    issue_key: typeof body?.key === "string" ? body.key : null,
    status_name: typeof body?.fields?.status?.name === "string" ? body.fields.status.name : null,
    status_id: typeof body?.fields?.status?.id === "string" ? body.fields.status.id : null
  };
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

function runOperatorFlow(args, env) {
  const command = [
    operatorFlow,
    "--issue", normalizeString(args.issue),
    "--task-key", normalizeString(args["task-key"]),
    "--transition-id", normalizeString(args["transition-id"]),
    "--to", normalizeString(args.to),
    "--approval-manifest", normalizeString(args["approval-manifest"]),
    "--owner-approved",
    "--duplicate-risk-accepted",
    "--transition-risk-accepted",
    "--real-write"
  ];
  const result = spawnSync(process.execPath, command, {
    cwd: repoRoot,
    env,
    encoding: "utf8",
    windowsHide: true
  });
  const outputs = parseJsonObjects(result.stdout || "");
  const output = outputs[outputs.length - 1] || {};

  return {
    exit_status: result.status,
    output
  };
}

function summarizeOperatorResult({ args, approvalManifest, beforeStatus, operatorOutput }) {
  const transitionStep = operatorOutput.transition_step || {};
  const commentStep = operatorOutput.comment_step || {};
  const duplicateBlocked = operatorOutput.flow_result === "BLOCKED_COMMENT_STEP" &&
    commentStep.result === "BLOCKED_DUPLICATE_EVIDENCE_COMMENT";
  const verifiedDone = operatorOutput.flow_result === "GUARDED_FLOW_WRITE_DONE";
  const verifyFailed = transitionStep.verify_result === "VERIFY_FAILED" || transitionStep.verify_result === "VERIFY_BLOCKED";
  const queueExecuteResult = verifiedDone
    ? "QUEUE_APPROVED_WRITE_DONE"
    : duplicateBlocked
      ? "BLOCKED_DUPLICATE_EVIDENCE_MARKER"
      : verifyFailed
        ? "QUEUE_APPROVED_VERIFY_FAILED"
        : "BLOCKED_OPERATOR_SAFE_FLOW";

  return baseOutput({
    args,
    queueExecuteResult,
    details: {
      flow_result: operatorOutput.flow_result || null,
      approval_manifest_valid: approvalManifest.approval_manifest_valid === true,
      before_status: beforeStatus,
      after_status: transitionStep.actual_status || transitionStep.target_status_name || null,
      post_write_verify_performed: transitionStep.verify_result !== null && transitionStep.verify_result !== undefined,
      verify_result: transitionStep.verify_result || null,
      status_verified: transitionStep.status_verified ?? null,
      jira_write_performed: operatorOutput.jira_write_performed === true,
      partial_write_performed: operatorOutput.partial_write_performed === true,
      jira_api_called: true,
      network_call_performed: true,
      full_sync_performed: false,
      create_issue_performed: false,
      bulk_operation_performed: false,
      secrets_printed: operatorOutput.secrets_printed === true,
      requires_manual_review: operatorOutput.requires_manual_review === true || transitionStep.requires_manual_review === true,
      comment_id: commentStep.comment_id || null,
      operator_blocked_reason: operatorOutput.blocked_reason || null,
      no_write_confirmation: operatorOutput.jira_write_performed === true ? undefined : "NO_WRITE",
      write_confirmation: verifiedDone ? "QUEUE_APPROVED_WRITE_COMPLETED" : undefined,
      blocked_reason: verifiedDone ? undefined : `Operator-safe flow returned ${operatorOutput.flow_result || "NO_JSON_OUTPUT"}.`
    }
  });
}

function outputWithOptionalAudit(args, output) {
  if (!normalizeString(args["audit-log"])) return output;

  try {
    const audit = appendAuditRecord({
      auditPath: args["audit-log"],
      record: {
        ...output,
        task_key: output.task_key,
        phase: output.queue_execute_result === "QUEUE_APPROVED_WRITE_DONE" ? "approved_execution" : "blocked",
        before_status: output.before_status,
        after_status: output.after_status,
        transition_id: output.transition_id,
        target_status: output.target_status_name,
        queue_result: output.queue_execute_result,
        verify_result: output.verify_result,
        status_verified: output.status_verified,
        requires_manual_review: output.requires_manual_review === true
      }
    });

    return {
      ...output,
      audit_log_written: audit.audit_log_written,
      audit_log_path: audit.audit_log_path
    };
  } catch (error) {
    return blocked(args, error.code || "BLOCKED_AUDIT_LOG_WRITE", error.message, {
      audit_log_written: false
    });
  }
}

function safeOutput(args, output) {
  if (hasSecretLike(output)) {
    return blocked({}, "BLOCKED_SECRET_LIKE_OUTPUT", "Queue execute-approved output contained secret-like text and was blocked.");
  }
  return output;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) {
    console.log(JSON.stringify(blocked({}, parsed.result, parsed.error), null, 2));
    process.exitCode = 2;
    return;
  }

  const args = parsed.args;
  const cliBlocker = validateCli(args);
  if (cliBlocker) {
    console.log(JSON.stringify(blocked(args, cliBlocker.result, cliBlocker.reason), null, 2));
    process.exitCode = 2;
    return;
  }

  if (normalizeString(args["audit-log"])) {
    try {
      resolveAuditPath(args["audit-log"]);
    } catch (error) {
      console.log(JSON.stringify(blocked(args, error.code || "BLOCKED_AUDIT_LOG_PATH", error.message), null, 2));
      process.exitCode = 2;
      return;
    }
  }

  let approvalManifest;
  try {
    approvalManifest = validateManifest(args);
  } catch (error) {
    console.log(JSON.stringify(blocked(args, "BLOCKED_APPROVAL_MANIFEST_INVALID", error.message), null, 2));
    process.exitCode = 2;
    return;
  }

  const missingEnv = missingEnvironment(process.env);
  if (missingEnv.length > 0) {
    console.log(JSON.stringify(blocked(args, "BLOCKED_INVALID_ARGS", "Missing required Jira environment configuration."), null, 2));
    process.exitCode = 2;
    return;
  }

  let currentStatus;
  try {
    currentStatus = await readIssueStatus({ issue: normalizeString(args.issue), env: process.env });
  } catch (error) {
    console.log(JSON.stringify(blocked(args, "BLOCKED_INVALID_ARGS", error.message, {
      approval_manifest_valid: true,
      jira_api_called: true,
      network_call_performed: true
    }), null, 2));
    process.exitCode = 2;
    return;
  }

  if (currentStatus.issue_key !== normalizeString(args.issue) ||
    currentStatus.status_name !== approvalManifest.expected_before_status) {
    console.log(JSON.stringify(blocked(args, "BLOCKED_STATUS_CHANGED_SINCE_APPROVAL", "Current Jira status no longer matches approval manifest expected_before_status.", {
      approval_manifest_valid: true,
      before_status: currentStatus.status_name || null,
      expected_before_status: approvalManifest.expected_before_status,
      jira_api_called: true,
      network_call_performed: true
    }), null, 2));
    process.exitCode = 2;
    return;
  }

  const plannedTransition = TRANSITION_PLAN[currentStatus.status_name];
  if (!plannedTransition ||
    plannedTransition.transitionId !== normalizeString(args["transition-id"]) ||
    plannedTransition.targetStatus !== normalizeString(args.to)) {
    console.log(JSON.stringify(blocked(args, "BLOCKED_INVALID_ARGS", "Current Jira status does not match the exact queue transition plan.", {
      approval_manifest_valid: true,
      before_status: currentStatus.status_name || null,
      jira_api_called: true,
      network_call_performed: true
    }), null, 2));
    process.exitCode = 2;
    return;
  }

  const operator = runOperatorFlow(args, process.env);
  const summarized = summarizeOperatorResult({
    args,
    approvalManifest,
    beforeStatus: currentStatus.status_name,
    operatorOutput: operator.output
  });
  const output = safeOutput(args, outputWithOptionalAudit(args, summarized));

  console.log(JSON.stringify(output, null, 2));
  process.exitCode = output.queue_execute_result === "QUEUE_APPROVED_WRITE_DONE" ? 0 : 2;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
