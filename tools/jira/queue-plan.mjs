#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { appendAuditRecord, resolveAuditPath } from "./audit-log.mjs";

const REQUIRED_ENV = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN"];
const BOOLEAN_FLAGS = ["dry-run"];
const VALUE_FLAGS = ["project", "limit", "task-key", "audit-log"];
const SUPPORTED_PROJECT = "DAY";
const DEFAULT_CONFIG = "docs/config/jira-sync-config.sample.json";
const ELIGIBLE_STATUSES = new Set(["Backlog / Ready", "Revisar"]);
const COMPLETED_STATUSES = new Set(["Remote DONE"]);
const TRANSITION_PLAN = {
  "Backlog / Ready": {
    transitionId: "31",
    targetStatus: "Revisar",
    targetStatusId: "10038"
  },
  "Revisar": {
    transitionId: "41",
    targetStatus: "Remote DONE",
    targetStatusId: "10039"
  }
};
const SECRET_KEY_PATTERN = /(token|secret|password|authorization|cookie|credential|api[_-]?key|email)/i;
const SECRET_VALUE_PATTERN = /(JIRA_API_TOKEN|JIRA_BASE_URL|JIRA_EMAIL|Authorization:|Basic\s+[A-Za-z0-9+/=]+|password\s*=|token\s*=|secret\s*=)/i;
const SAFE_SECRET_STATUS_KEYS = new Set(["secrets_printed"]);

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");

function normalizeString(value) {
  return String(value || "").trim();
}

function projectKeyFromIssue(issueKey) {
  const match = normalizeString(issueKey).match(/^([A-Z][A-Z0-9]+)-\d+$/);
  return match ? match[1] : "";
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.resolve(repoRoot, relativePath), "utf8"));
}

export function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      return { error: `Unexpected positional argument: ${token}`, result: "BLOCKED_INVALID_ARGS" };
    }

    const key = token.slice(2);
    if (BOOLEAN_FLAGS.includes(key)) {
      args[key] = true;
      continue;
    }

    if (!VALUE_FLAGS.includes(key)) {
      return { error: `Unsupported option: --${key}`, result: "BLOCKED_INVALID_ARGS" };
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      return { error: `Missing value for --${key}`, result: "BLOCKED_INVALID_ARGS" };
    }

    args[key] = next;
    index += 1;
  }

  return { args };
}

function blockedOutput({ args = {}, queueResult, blockedReason, details = {} }) {
  return {
    tool: "ric-studio-jira-queue-plan",
    task_key: normalizeString(args["task-key"]) || null,
    mode: "QUEUE_DRY_RUN",
    queue_result: queueResult,
    blocked_reason: blockedReason,
    selected_issue: null,
    current_status: null,
    planned_transition_id: null,
    planned_target_status: null,
    jira_write_performed: false,
    jira_api_called: false,
    network_call_performed: false,
    full_sync_performed: false,
    create_issue_performed: false,
    bulk_operation_performed: false,
    comment_added: false,
    transition_performed: false,
    secrets_printed: false,
    ...details
  };
}

function baseDryRunOutput(args) {
  return {
    tool: "ric-studio-jira-queue-plan",
    task_key: normalizeString(args["task-key"]) || null,
    mode: "QUEUE_DRY_RUN",
    queue_result: "DRY_RUN_QUEUE_PLAN_READY",
    jira_write_performed: false,
    jira_api_called: true,
    network_call_performed: true,
    full_sync_performed: false,
    create_issue_performed: false,
    bulk_operation_performed: false,
    comment_added: false,
    transition_performed: false,
    secrets_printed: false
  };
}

export function validateCliArgs(args) {
  if (args["dry-run"] !== true) {
    return { result: "BLOCKED_DRY_RUN_REQUIRED", reason: "Queue planning requires --dry-run." };
  }

  if (normalizeString(args.project) !== SUPPORTED_PROJECT) {
    return { result: "BLOCKED_UNSUPPORTED_PROJECT", reason: "Queue planning currently supports exact --project DAY only." };
  }

  if (normalizeString(args.limit) !== "1") {
    return { result: "BLOCKED_INVALID_ARGS", reason: "Queue planning currently requires exact --limit 1." };
  }

  if (!normalizeString(args["task-key"])) {
    return { result: "BLOCKED_INVALID_ARGS", reason: "Queue planning requires --task-key." };
  }

  if (normalizeString(args["audit-log"])) {
    try {
      resolveAuditPath(args["audit-log"]);
    } catch (error) {
      return { result: error.code || "BLOCKED_AUDIT_LOG_PATH", reason: error.message };
    }
  }

  return null;
}

function outputWithOptionalAudit(args, output) {
  if (!normalizeString(args["audit-log"])) return output;

  try {
    const audit = appendAuditRecord({
      auditPath: args["audit-log"],
      record: {
        ...output,
        task_key: output.task_key,
        phase: output.queue_result === "DRY_RUN_QUEUE_PLAN_READY" ? "dry_run_plan" : "blocked"
      }
    });

    return {
      ...output,
      audit_log_written: audit.audit_log_written,
      audit_log_path: audit.audit_log_path
    };
  } catch (error) {
    return blockedOutput({
      args,
      queueResult: error.code || "BLOCKED_AUDIT_LOG_WRITE",
      blockedReason: error.message
    });
  }
}

function blockedIssueKeys(config) {
  const queueBlocked = config.queuePlanner?.blockedIssueKeys;
  const topLevelBlocked = config.blockedIssueKeys;
  return new Set([
    ...(Array.isArray(queueBlocked) ? queueBlocked : []),
    ...(Array.isArray(topLevelBlocked) ? topLevelBlocked : [])
  ].map(normalizeString).filter(Boolean));
}

function candidateIssue(issue, blockedKeys) {
  const key = normalizeString(issue.key);
  const status = normalizeString(issue.current_status_name || issue.status?.name || issue.fields?.status?.name);

  if (projectKeyFromIssue(key) !== SUPPORTED_PROJECT) return null;
  if (blockedKeys.has(key)) return null;
  if (COMPLETED_STATUSES.has(status)) return null;
  if (!ELIGIBLE_STATUSES.has(status)) return null;

  return {
    key,
    title: normalizeString(issue.title || issue.summary || issue.fields?.summary),
    current_status: status,
    current_status_id: normalizeString(issue.current_status_id || issue.status?.id || issue.fields?.status?.id),
    transitions: Array.isArray(issue.transitions) ? issue.transitions : []
  };
}

function matchingTransition(issue) {
  const plan = TRANSITION_PLAN[issue.current_status];
  if (!plan) return null;

  return issue.transitions.find((transition) => {
    const idMatches = normalizeString(transition.id) === plan.transitionId;
    const targetMatches = normalizeString(transition.target_status_name || transition.to?.name) === plan.targetStatus;
    const targetIdMatches = normalizeString(transition.target_status_id || transition.to?.id) === plan.targetStatusId;
    return idMatches && targetMatches && targetIdMatches;
  }) || null;
}

export function containsSecretLike(value) {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") {
    return SECRET_VALUE_PATTERN.test(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsSecretLike(item));
  }

  if (typeof value === "object") {
    return Object.entries(value).some(([key, item]) => {
      const keyLooksSecret = !SAFE_SECRET_STATUS_KEYS.has(key) && SECRET_KEY_PATTERN.test(key);
      return keyLooksSecret || containsSecretLike(item);
    });
  }

  return false;
}

export function planQueue({ args, issues, config = {} }) {
  const cliBlocker = validateCliArgs(args);
  if (cliBlocker) {
    return blockedOutput({ args, queueResult: cliBlocker.result, blockedReason: cliBlocker.reason });
  }

  const blockedKeys = blockedIssueKeys(config);
  const candidates = issues
    .map((issue) => candidateIssue(issue, blockedKeys))
    .filter(Boolean)
    .sort((left, right) => left.key.localeCompare(right.key, undefined, { numeric: true }));

  if (candidates.length === 0) {
    return blockedOutput({
      args,
      queueResult: "BLOCKED_NO_ELIGIBLE_ISSUE",
      blockedReason: "No eligible DAY issue was found in Backlog / Ready or Revisar.",
      details: {
        jira_api_called: true,
        network_call_performed: true
      }
    });
  }

  if (candidates.length > 1) {
    return blockedOutput({
      args,
      queueResult: "BLOCKED_MULTIPLE_CANDIDATES",
      blockedReason: "Multiple eligible DAY issues were found; exact single-issue selection is required before execution.",
      details: {
        candidate_count: candidates.length,
        candidate_issue_keys: candidates.map((candidate) => candidate.key),
        jira_api_called: true,
        network_call_performed: true
      }
    });
  }

  const selected = candidates[0];
  const nextPlan = TRANSITION_PLAN[selected.current_status];
  if (!nextPlan) {
    return blockedOutput({
      args,
      queueResult: "BLOCKED_UNKNOWN_STATUS",
      blockedReason: `Unsupported current status for queue planning: ${selected.current_status}.`,
      details: {
        selected_issue: selected.key,
        current_status: selected.current_status,
        jira_api_called: true,
        network_call_performed: true
      }
    });
  }

  const transition = matchingTransition(selected);
  if (!transition) {
    return blockedOutput({
      args,
      queueResult: "BLOCKED_NO_VALID_TRANSITION",
      blockedReason: "Selected issue does not expose the exact configured next transition.",
      details: {
        selected_issue: selected.key,
        current_status: selected.current_status,
        expected_transition_id: nextPlan.transitionId,
        expected_target_status: nextPlan.targetStatus,
        jira_api_called: true,
        network_call_performed: true
      }
    });
  }

  const output = {
    ...baseDryRunOutput(args),
    selected_issue: selected.key,
    selected_issue_title: selected.title || null,
    current_status: selected.current_status,
    current_status_id: selected.current_status_id || null,
    planned_transition_id: nextPlan.transitionId,
    planned_target_status: nextPlan.targetStatus,
    planned_target_status_id: nextPlan.targetStatusId,
    eligible_issue_count: 1,
    approval_required: true
  };

  if (containsSecretLike(output)) {
    return blockedOutput({
      args,
      queueResult: "BLOCKED_SECRET_LIKE_OUTPUT",
      blockedReason: "Queue plan output contained secret-like text and was blocked."
    });
  }

  return output;
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

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

async function fetchJiraJson(url, env) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": buildAuthHeader(env.JIRA_EMAIL, env.JIRA_API_TOKEN)
    }
  });

  const body = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(`Read-only Jira API request failed with HTTP ${response.status}.`);
  }

  return body;
}

async function discoverIssues({ project, env }) {
  const baseUrl = normalizeBaseUrl(env.JIRA_BASE_URL);
  const jql = encodeURIComponent(`project = ${project} AND status in ("Backlog / Ready", "Revisar") ORDER BY key ASC`);
  const searchUrl = `${baseUrl}/rest/api/3/search/jql?jql=${jql}&maxResults=25&fields=summary,status`;
  const search = await fetchJiraJson(searchUrl, env);
  const issues = Array.isArray(search.issues) ? search.issues : [];

  return Promise.all(issues.map(async (issue) => {
    const transitionsUrl = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(issue.key)}/transitions`;
    const transitions = await fetchJiraJson(transitionsUrl, env);

    return {
      key: issue.key,
      title: issue.fields?.summary,
      current_status_name: issue.fields?.status?.name,
      current_status_id: issue.fields?.status?.id,
      transitions: Array.isArray(transitions.transitions)
        ? transitions.transitions.map((transition) => ({
            id: transition.id,
            name: transition.name,
            target_status_name: transition.to?.name,
            target_status_id: transition.to?.id
          }))
        : []
    };
  }));
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) {
    console.log(JSON.stringify(blockedOutput({
      args: {},
      queueResult: parsed.result,
      blockedReason: parsed.error
    }), null, 2));
    process.exitCode = 2;
    return;
  }

  const args = parsed.args;
  const cliBlocker = validateCliArgs(args);
  if (cliBlocker) {
    console.log(JSON.stringify(blockedOutput({ args, queueResult: cliBlocker.result, blockedReason: cliBlocker.reason }), null, 2));
    process.exitCode = 2;
    return;
  }

  const missingEnv = missingEnvironment(process.env);
  if (missingEnv.length > 0) {
    console.log(JSON.stringify(blockedOutput({
      args,
      queueResult: "BLOCKED_MISSING_CONFIG",
      blockedReason: "Missing required environment variables.",
      details: {
        credentials_required: true,
        missing_environment_variables: missingEnv
      }
    }), null, 2));
    process.exitCode = 2;
    return;
  }

  try {
    const config = readJson(DEFAULT_CONFIG);
    const issues = await discoverIssues({ project: normalizeString(args.project), env: process.env });
    const output = outputWithOptionalAudit(args, planQueue({ args, issues, config }));
    console.log(JSON.stringify(output, null, 2));
    if (output.queue_result !== "DRY_RUN_QUEUE_PLAN_READY") {
      process.exitCode = 2;
    }
  } catch (error) {
    console.log(JSON.stringify(blockedOutput({
      args,
      queueResult: "BLOCKED_DISCOVERY_FAILED",
      blockedReason: error.message
    }), null, 2));
    process.exitCode = 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
