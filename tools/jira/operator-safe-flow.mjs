#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REQUIRED_ENV = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN"];
const BOOLEAN_FLAGS = ["dry-run", "real-write", "owner-approved", "duplicate-risk-accepted", "transition-risk-accepted"];
const VALUE_FLAGS = ["issue", "task-key", "transition-id", "to", "validation-summary"];
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const guardedWrite = path.join(repoRoot, "tools", "jira", "guarded-write.mjs");
const sampleConfig = "docs/config/jira-sync-config.sample.json";
const operatorFlowIssue = "DAY-10";
const operatorFlowTransitionId = "41";
const operatorFlowTargetStatus = "Remote DONE";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      return { error: `Unexpected positional argument: ${token}` };
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (BOOLEAN_FLAGS.includes(key)) {
      args[key] = true;
      continue;
    }

    if (!VALUE_FLAGS.includes(key)) {
      return { error: `Unsupported option: --${key}` };
    }

    if (!next || next.startsWith("--")) {
      return { error: `Missing value for --${key}` };
    }

    args[key] = next;
    index += 1;
  }

  return { args };
}

function normalizeString(value) {
  return String(value || "").trim();
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

export function emptyStep(name, result = "NOT_RUN") {
  return {
    name,
    result,
    ran: false,
    jira_write_performed: false,
    jira_api_called: false,
    network_call_performed: false,
    secrets_printed: false
  };
}

export function aggregateOutput({ args, flowResult, blockedReason = null, commentStep = emptyStep("comment_step"), transitionStep = emptyStep("transition_step") }) {
  const steps = [commentStep, transitionStep];
  const writePerformed = steps.some((step) => step.jira_write_performed === true);
  const flowWriteCompleted = flowResult === "GUARDED_FLOW_WRITE_DONE";
  const partialWritePerformed = writePerformed && !flowWriteCompleted;
  const apiCalled = steps.some((step) => step.jira_api_called === true);
  const networkCalled = steps.some((step) => step.network_call_performed === true);
  const secretsPrinted = steps.some((step) => step.secrets_printed === true);

  return {
    tool: "ric-studio-jira-operator-safe-flow",
    task_id: normalizeString(args["task-key"]) || null,
    issue_key: normalizeString(args.issue) || null,
    transition_id: normalizeString(args["transition-id"]) || null,
    target_status_name: normalizeString(args.to) || null,
    mode: args["real-write"] === true ? "GUARDED_REAL_FLOW" : "MANUAL_DRY_RUN",
    flow_result: flowResult,
    blocked_reason: blockedReason || undefined,
    comment_step: commentStep,
    transition_step: transitionStep,
    jira_write_performed: writePerformed,
    partial_write_performed: partialWritePerformed,
    jira_api_called: apiCalled,
    network_call_performed: networkCalled,
    secrets_printed: secretsPrinted,
    no_write_confirmation: writePerformed ? undefined : "NO_WRITE",
    write_confirmation: flowWriteCompleted
      ? "GUARDED_FLOW_WRITE_COMPLETED"
      : partialWritePerformed
        ? "PARTIAL_WRITE_PERFORMED"
        : undefined,
    full_sync_performed: false,
    create_issue_performed: false,
    bulk_operation_performed: false,
    token_created: false,
    token_stored: false
  };
}

function missingEnvironment(env) {
  return REQUIRED_ENV.filter((name) => !env[name] || String(env[name]).trim() === "");
}

function flowEnv(realWrite, env) {
  if (realWrite) return env;

  const sanitized = { ...env };
  for (const key of Object.keys(sanitized)) {
    if (REQUIRED_ENV.includes(key.toUpperCase())) {
      delete sanitized[key];
    }
  }
  return sanitized;
}

function runGuardedWrite(args, env) {
  const result = spawnSync(process.execPath, [guardedWrite, ...args], {
    cwd: repoRoot,
    env,
    encoding: "utf8",
    windowsHide: true
  });
  const outputs = parseJsonObjects(result.stdout || "");
  const lastOutput = outputs[outputs.length - 1] || {};

  return {
    exit_status: result.status,
    outputs,
    result: lastOutput.result || "NO_JSON_OUTPUT",
    ran: true,
    jira_write_performed: lastOutput.jira_write_performed === true,
    jira_api_called: lastOutput.jira_api_called === true,
    network_call_performed: lastOutput.network_call_performed === true,
    secrets_printed: lastOutput.secrets_printed === true,
    no_write_confirmation: lastOutput.no_write_confirmation,
    write_confirmation: lastOutput.write_confirmation,
    issue_key: lastOutput.issue_key || null,
    operation: lastOutput.operation || null,
    transition_id: lastOutput.transition_id || lastOutput.planned_jira_operation?.transition_id || null,
    target_status_name: lastOutput.target_status_name || lastOutput.planned_jira_operation?.target_status_name || null
  };
}

function commentArgs(args, realWrite) {
  const issue = normalizeString(args.issue);
  const command = [
    "--action", "add_evidence_comment",
    "--issue", issue,
    "--config", sampleConfig,
    "--project", "DayBudget",
    "--sprint", issue,
    "--task-key", normalizeString(args["task-key"]),
    "--local-status", "REVIEW",
    "--protocol-level", "LEAN_LEVEL_2",
    "--validation-summary", normalizeString(args["validation-summary"] || "Operator-safe guarded Jira comment plus transition flow")
  ];

  if (realWrite) {
    command.push("--owner-approved", "--duplicate-risk-accepted", "--real-write");
  } else {
    command.push("--dry-run");
  }

  return command;
}

function transitionArgs(args, realWrite) {
  const command = [
    "--action", "transition_issue",
    "--issue", normalizeString(args.issue),
    "--config", sampleConfig,
    "--task-key", normalizeString(args["task-key"]),
    "--transition-id", normalizeString(args["transition-id"]),
    "--to", normalizeString(args.to)
  ];

  if (realWrite) {
    command.push("--owner-approved", "--transition-risk-accepted", "--real-write");
  } else {
    command.push("--dry-run");
  }

  return command;
}

function validateRealWritePreflight(args, env) {
  const findings = [];

  if (args["owner-approved"] !== true) findings.push("Missing required --owner-approved.");
  if (args["duplicate-risk-accepted"] !== true) findings.push("Missing required --duplicate-risk-accepted.");
  if (args["transition-risk-accepted"] !== true) findings.push("Missing required --transition-risk-accepted.");
  if (normalizeString(args.issue) !== operatorFlowIssue) findings.push(`Real flow requires exact --issue ${operatorFlowIssue}.`);
  if (normalizeString(args["transition-id"]) !== operatorFlowTransitionId) findings.push(`Real flow requires exact --transition-id ${operatorFlowTransitionId}.`);
  if (normalizeString(args.to) !== operatorFlowTargetStatus) findings.push(`Real flow requires exact --to ${operatorFlowTargetStatus}.`);
  if (!normalizeString(args["task-key"])) findings.push("Real flow requires exact --task-key.");

  const missingEnv = missingEnvironment(env);
  if (missingEnv.length > 0) findings.push(`Missing required environment variables: ${missingEnv.join(", ")}.`);

  return {
    findings,
    missingEnv
  };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) {
    console.log(JSON.stringify(aggregateOutput({
      args: {},
      flowResult: "BLOCKED_INVALID_ARGS",
      blockedReason: parsed.error
    }), null, 2));
    process.exitCode = 2;
    return;
  }

  const args = parsed.args;
  const realWrite = args["real-write"] === true;
  const env = flowEnv(realWrite, process.env);

  if (!normalizeString(args.issue)) args.issue = operatorFlowIssue;
  if (!normalizeString(args["transition-id"])) args["transition-id"] = operatorFlowTransitionId;
  if (!normalizeString(args.to)) args.to = operatorFlowTargetStatus;

  if (realWrite) {
    const { findings } = validateRealWritePreflight(args, env);
    if (findings.length > 0) {
      console.log(JSON.stringify(aggregateOutput({
        args,
        flowResult: "BLOCKED_PREFLIGHT",
        blockedReason: findings.join(" ")
      }), null, 2));
      process.exitCode = 2;
      return;
    }
  }

  const commentStep = runGuardedWrite(commentArgs(args, realWrite), env);
  commentStep.name = "comment_step";

  const expectedCommentResult = realWrite ? "GUARDED_COMMENT_WRITE_DONE" : "DRY_RUN_COMMENT_READY";
  if (commentStep.result !== expectedCommentResult) {
    console.log(JSON.stringify(aggregateOutput({
      args,
      flowResult: "BLOCKED_COMMENT_STEP",
      blockedReason: `Comment step returned ${commentStep.result}.`,
      commentStep,
      transitionStep: emptyStep("transition_step", "NOT_RUN_AFTER_COMMENT_BLOCK")
    }), null, 2));
    process.exitCode = 2;
    return;
  }

  const transitionStep = runGuardedWrite(transitionArgs(args, realWrite), env);
  transitionStep.name = "transition_step";

  const expectedTransitionResult = realWrite ? "GUARDED_TRANSITION_WRITE_DONE" : "DRY_RUN_TRANSITION_READY";
  if (transitionStep.result !== expectedTransitionResult) {
    console.log(JSON.stringify(aggregateOutput({
      args,
      flowResult: "BLOCKED_TRANSITION_STEP",
      blockedReason: `Transition step returned ${transitionStep.result}.`,
      commentStep,
      transitionStep
    }), null, 2));
    process.exitCode = 2;
    return;
  }

  console.log(JSON.stringify(aggregateOutput({
    args,
    flowResult: realWrite ? "GUARDED_FLOW_WRITE_DONE" : "DRY_RUN_FLOW_READY",
    commentStep,
    transitionStep
  }), null, 2));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
