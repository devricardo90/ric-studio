#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_ENV = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN"];
const BLOCKED_ACTIONS = [
  "create_issue",
  "transition_issue",
  "done_transition",
  "delete",
  "edit_project_config",
  "edit_workflow",
  "attach_file",
  "bulk_operation"
];
const ISSUE_KEY_PATTERN = /^[A-Z][A-Z0-9]+-\d+$/;
const EVIDENCE_MARKER_FORMAT = "RIC-STUDIO-JIRA-EVIDENCE::{localProject}::{taskKey}::{operation}";
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      return { error: `Unexpected positional argument: ${token}` };
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (["dry-run", "real-write", "owner-approved", "duplicate-risk-accepted", "transition-risk-accepted"].includes(key)) {
      args[key] = true;
      continue;
    }

    if (!next || next.startsWith("--")) {
      return { error: `Missing value for --${key}` };
    }

    args[key] = next;
    index += 1;
  }

  return { args };
}

function normalizeAction(value) {
  return String(value || "").trim().toLowerCase().replace(/-/g, "_");
}

function normalizeStatus(value) {
  return String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function normalizeString(value) {
  return String(value || "").trim();
}

function resolveRepoPath(value) {
  const requestedPath = normalizeString(value);
  return path.isAbsolute(requestedPath) ? requestedPath : path.join(repoRoot, requestedPath);
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolveRepoPath(relativePath), "utf8"));
}

function projectKeyFromIssue(issue) {
  return normalizeString(issue).split("-")[0] || "";
}

function isEvidenceCommentAction(action) {
  return action === "add_evidence_comment" || action === "evidence_comment";
}

function isGuardedConfigAction(action) {
  return isEvidenceCommentAction(action) || action === "transition_issue";
}

function defaultTaskId(action) {
  return isEvidenceCommentAction(action) ? "RIC-STUDIO-083D" : "RIC-STUDIO-077A";
}

function baseOutput({ action, issue, operation, realWriteRequested = false, taskId = null }) {
  return {
    tool: "ric-studio-jira-guarded-write",
    task_id: taskId || defaultTaskId(action),
    contract: isGuardedConfigAction(action)
      ? "docs/architecture/jira-sync-config-contract.md"
      : "docs/architecture/guarded-jira-write-integration-contract.md",
    action,
    operation,
    issue_key: issue || null,
    real_write_requested: realWriteRequested,
    jira_write_performed: false,
    jira_api_called: false,
    jira_cli_called: false,
    network_call_performed: false,
    credentials_required: realWriteRequested,
    token_created: false,
    token_stored: false,
    environment_values_read: false,
    secrets_printed: false,
    no_write_confirmation: "NO_WRITE",
    blocked_actions: BLOCKED_ACTIONS
  };
}

function blocked({ action, issue, operation, reason, details = {}, realWriteRequested = false }) {
  return {
    ...baseOutput({ action, issue, operation, realWriteRequested }),
    result: "BLOCKED",
    blocked_reason: reason,
    ...details
  };
}

function dryRunPlan({ action, issue, comment }) {
  return {
    ...baseOutput({ action, issue, operation: "add_comment", realWriteRequested: false }),
    mode: "dry_run",
    result: "DRY_RUN_ONLY",
    planned_jira_operation: {
      type: "add_comment",
      issue_key: issue,
      comment
    }
  };
}

function realWritePlan({ action, issue, comment }) {
  return {
    ...baseOutput({ action, issue, operation: "add_comment", realWriteRequested: true }),
    mode: "real_write_plan",
    result: "REAL_WRITE_PLANNED",
    target: {
      issue_key: issue
    },
    planned_jira_operation: {
      type: "add_comment",
      issue_key: issue,
      comment
    }
  };
}

function findRegistryTask(registry, args) {
  const taskKey = normalizeString(args["task-key"]);
  const localProject = normalizeString(args.project);
  if (!taskKey || !Array.isArray(registry.tasks)) return null;

  const matches = registry.tasks.filter((task) => {
    const taskKeyMatches = normalizeString(task.taskKey).toLowerCase() === taskKey.toLowerCase();
    const projectMatches = !localProject || normalizeString(task.project).toLowerCase() === localProject.toLowerCase();
    return taskKeyMatches && projectMatches;
  });

  return matches.length === 1 ? matches[0] : null;
}

function evidenceContext(args) {
  const task = args.registry ? findRegistryTask(readJson(args.registry), args) : null;
  const evidence = task?.evidence || {};

  return {
    project: normalizeString(args.project || task?.project),
    sprint: normalizeString(args.sprint || task?.sprint),
    taskKey: normalizeString(args["task-key"] || task?.taskKey),
    title: normalizeString(args.title || task?.title),
    localStatus: normalizeString(args["local-status"] || task?.status),
    protocolLevel: normalizeString(args["protocol-level"] || task?.protocolLevel || task?.risk),
    validationSummary: normalizeString(args["validation-summary"] || evidence.smokeResult || "not recorded"),
    commitHash: normalizeString(args["commit-hash"] || evidence.commitHash || "not committed"),
    pushConfirmation: normalizeString(args["push-confirmation"] || evidence.pushConfirmation || "not pushed")
  };
}

function markerValue(format, context, operation) {
  return format
    .replace("{localProject}", context.project || "<LOCAL_PROJECT_REQUIRED>")
    .replace("{taskKey}", context.taskKey || "<TASK_KEY_REQUIRED>")
    .replace("{operation}", operation);
}

function buildEvidenceComment({ args, context, mode, idempotencyMarker }) {
  const generatedAt = normalizeString(args["generated-at"]) || new Date().toISOString();
  return [
    "RIC Studio Jira evidence comment.",
    `Mode: ${mode}`,
    `Task: ${context.taskKey || "<TASK_KEY_REQUIRED>"}${context.title ? ` - ${context.title}` : ""}`,
    `Project: ${context.project || "<LOCAL_PROJECT_REQUIRED>"}`,
    `Sprint: ${context.sprint || "<SPRINT_REQUIRED>"}`,
    `Local status: ${context.localStatus || "<LOCAL_STATUS_REQUIRED>"}`,
    `Protocol level: ${context.protocolLevel || "<PROTOCOL_LEVEL_REQUIRED>"}`,
    `Validation summary: ${context.validationSummary || "not recorded"}`,
    `Commit: ${context.commitHash || "not committed"}`,
    `Push: ${context.pushConfirmation || "not pushed"}`,
    `Idempotency marker: ${idempotencyMarker}`,
    `Generated at: ${generatedAt}`,
    "NO_WRITE unless guarded real-write gates are explicitly satisfied."
  ].join("\n");
}

function commentHasUnsafeSecretShape(comment) {
  return /(JIRA_API_TOKEN|Authorization:|Basic\s+[A-Za-z0-9+/=]+|password\s*=|token\s*=|secret\s*=)/i.test(comment);
}

function validateIssueKey(issue) {
  if (!issue) {
    return "Evidence comment requires explicit --issue.";
  }

  if (!ISSUE_KEY_PATTERN.test(issue)) {
    return "Issue key must match Jira key format PROJECT-123.";
  }

  return null;
}

function configFindings({ config, issue, context }) {
  const findings = [];
  const issueProjectKey = projectKeyFromIssue(issue);
  const approvedProjects = Array.isArray(config.approvedProjects) ? config.approvedProjects : [];
  const matchingProject = approvedProjects.find((project) => {
    const jiraProjectMatches = normalizeString(project.jiraProjectKey) === issueProjectKey;
    const localProjectMatches = !context.project || normalizeString(project.localProject).toLowerCase() === context.project.toLowerCase();
    return jiraProjectMatches && localProjectMatches;
  });

  if (!matchingProject) {
    findings.push(`Issue project ${issueProjectKey || "<missing>"} is not in the approved Jira project allowlist for this local task.`);
  }

  if (matchingProject && matchingProject.realSyncAllowed !== true) {
    findings.push(`Approved project ${issueProjectKey} does not allow real sync.`);
  }

  if (matchingProject && !Array.isArray(matchingProject.allowedRealOperations)) {
    findings.push(`Approved project ${issueProjectKey} does not define allowed real operations.`);
  }

  if (matchingProject && Array.isArray(matchingProject.allowedRealOperations) && !matchingProject.allowedRealOperations.includes("add_comment")) {
    findings.push(`Approved project ${issueProjectKey} does not allow add_comment.`);
  }

  if (matchingProject && !Array.isArray(matchingProject.allowedIssueKeys)) {
    findings.push(`Approved project ${issueProjectKey} does not define exact allowed issue keys.`);
  }

  if (matchingProject && Array.isArray(matchingProject.allowedIssueKeys) && !matchingProject.allowedIssueKeys.includes(issue)) {
    findings.push(`Issue ${issue} is not explicitly allowlisted for guarded add_comment smoke.`);
  }

  if (config.currentMode !== "MANUAL_DRY_RUN" && config.currentMode !== "GUARDED_COMMENT_ONLY") {
    findings.push("Config currentMode must be MANUAL_DRY_RUN or GUARDED_COMMENT_ONLY for guarded comments.");
  }

  if (config.ownerApproval?.requiredBeforeAnyRealWrite !== true) {
    findings.push("Config must require owner approval before any real write.");
  }

  if (config.evidenceComment?.idempotencyMarkerFormat !== EVIDENCE_MARKER_FORMAT) {
    findings.push("Config evidence comment idempotency marker format is missing or unsupported.");
  }

  return {
    matchingProject,
    findings
  };
}

function missingEvidenceFields(context) {
  return [
    ["project", context.project],
    ["sprint", context.sprint],
    ["task_key", context.taskKey],
    ["local_status", context.localStatus],
    ["protocol_level", context.protocolLevel],
    ["validation_summary", context.validationSummary]
  ].filter(([, value]) => !value).map(([field]) => field);
}

function evidenceCommentPlan(args) {
  const action = normalizeAction(args.action);
  const issue = normalizeString(args.issue);
  const realWriteRequested = args["real-write"] === true;
  const mode = realWriteRequested ? "GUARDED_COMMENT_ONLY" : "MANUAL_DRY_RUN";
  const context = evidenceContext(args);
  const configPath = normalizeString(args.config || "docs/config/jira-sync-config.sample.json");
  const config = readJson(configPath);
  const issueError = validateIssueKey(issue);
  const { findings: configBlockers } = issueError ? { findings: [] } : configFindings({ config, issue, context });
  if (realWriteRequested && config.currentMode !== "GUARDED_COMMENT_ONLY") {
    configBlockers.push("Real evidence comment write requires config currentMode GUARDED_COMMENT_ONLY.");
  }
  const markerFormat = config.evidenceComment?.idempotencyMarkerFormat || EVIDENCE_MARKER_FORMAT;
  const idempotencyMarker = markerValue(markerFormat, context, "add_evidence_comment");
  const comment = buildEvidenceComment({ args, context, mode, idempotencyMarker });
  const missingFields = missingEvidenceFields(context);
  const duplicateDetectionExecuted = false;
  const duplicateRiskAccepted = args["duplicate-risk-accepted"] === true;
  const ownerApproved = args["owner-approved"] === true || normalizeString(args["owner-approval"]) !== "";
  const missingEnv = realWriteRequested ? missingEnvironment(process.env) : [];
  const unsafeComment = commentHasUnsafeSecretShape(comment);

  const base = {
    ...baseOutput({ action, issue, operation: "add_comment", realWriteRequested, taskId: context.taskKey || null }),
    mode,
    config: configPath,
    result: "DRY_RUN_COMMENT_READY",
    local_task: {
      project: context.project || null,
      sprint: context.sprint || null,
      task_key: context.taskKey || null,
      title: context.title || null,
      local_status: context.localStatus || null,
      protocol_level: context.protocolLevel || null
    },
    validation_evidence: {
      summary: context.validationSummary || null,
      commit_hash: context.commitHash || null,
      push_confirmation: context.pushConfirmation || null
    },
    idempotency_marker: idempotencyMarker,
    duplicate_detection: {
      executed: duplicateDetectionExecuted,
      reason: "No read-comments Jira API access is performed by this guarded MVP.",
      real_write_requires_duplicate_risk_acceptance: true,
      duplicate_risk_accepted: duplicateRiskAccepted
    },
    owner_approval: {
      required: true,
      present: ownerApproved
    },
    comment_safety: {
      passed: !unsafeComment,
      secrets_or_env_values_printed: false
    },
    planned_jira_operation: {
      type: "add_comment",
      issue_key: issue || null,
      comment
    },
    allowed_real_operation: "add_comment",
    no_write_confirmation: realWriteRequested ? "NO_WRITE until all guarded gates pass" : "NO_WRITE"
  };

  if (issueError) {
    return {
      ...base,
      result: "BLOCKED_INVALID_ISSUE",
      blocked_reason: issueError
    };
  }

  if (configBlockers.length > 0 || missingFields.length > 0) {
    return {
      ...base,
      result: "BLOCKED_MISSING_CONFIG",
      blocked_reason: "Required Jira config or local evidence fields are missing.",
      config_blockers: configBlockers,
      missing_evidence_fields: missingFields
    };
  }

  if (unsafeComment) {
    return {
      ...base,
      result: "BLOCKED_INVALID_ISSUE",
      blocked_reason: "Comment body failed safety checks."
    };
  }

  if (!realWriteRequested) {
    return base;
  }

  if (!ownerApproved) {
    return {
      ...base,
      result: "BLOCKED_MISSING_OWNER_APPROVAL",
      blocked_reason: "Real evidence comment write requires explicit owner approval."
    };
  }

  if (!duplicateRiskAccepted) {
    return {
      ...base,
      result: "BLOCKED_DUPLICATE_RISK",
      blocked_reason: "Duplicate comment detection was not executed; real write requires explicit duplicate risk acceptance."
    };
  }

  if (missingEnv.length > 0) {
    return {
      ...base,
      result: "BLOCKED_MISSING_CONFIG",
      blocked_reason: "Missing required environment variables.",
      credentials_required: true,
      missing_environment_variables: missingEnv
    };
  }

  return {
    ...base,
    result: "GUARDED_COMMENT_WRITE_READY",
    credentials_required: true,
    no_write_confirmation: "REAL_WRITE_READY_NOT_EXECUTED_BY_PLAN"
  };
}

function transitionSmokeFindings({ config, issue, transitionId, requestedTo }) {
  const findings = [];
  const smoke = config.guardedTransitionSmoke || {};
  const transitions = Array.isArray(smoke.allowedTransitions)
    ? smoke.allowedTransitions
    : [smoke].filter((entry) => entry.allowedIssueKey || entry.transitionId);
  const transition = transitions.find((entry) => normalizeString(entry.allowedIssueKey) === issue);

  if (smoke.enabled !== true) {
    findings.push("Guarded transition smoke is not enabled.");
  }

  if (smoke.scope !== "exact_issue_transition_smoke_only") {
    findings.push("Guarded transition smoke scope must be exact_issue_transition_smoke_only.");
  }

  if (smoke.allowedOperation !== "transition_issue") {
    findings.push("Guarded transition smoke allowed operation must be transition_issue.");
  }

  if (!transition) {
    findings.push(`Issue ${issue || "<missing>"} is not explicitly allowlisted for guarded transition smoke.`);
  }

  if (!transitionId) {
    findings.push("Guarded transition smoke requires explicit --transition-id.");
  } else if (!transition || transitionId !== normalizeString(transition.transitionId)) {
    findings.push(`Transition id ${transitionId} is not explicitly allowlisted for guarded transition smoke.`);
  }

  if (
    requestedTo &&
    (!transition ||
      (requestedTo !== normalizeStatus(transition.targetStatusName) &&
        requestedTo !== normalizeStatus(transition.targetStatusId)))
  ) {
    findings.push(`Requested target status ${requestedTo} does not match the configured guarded transition target.`);
  }

  if (smoke.requiresOwnerApproval !== true) {
    findings.push("Guarded transition smoke must require owner approval.");
  }

  if (smoke.requiresRiskAcceptance !== true) {
    findings.push("Guarded transition smoke must require explicit risk acceptance.");
  }

  return {
    smoke,
    transition,
    findings
  };
}

function transitionSmokePlan(args) {
  const action = normalizeAction(args.action);
  const issue = normalizeString(args.issue);
  const transitionId = normalizeString(args["transition-id"] || args.transition);
  const requestedTo = normalizeStatus(args.to);
  const realWriteRequested = args["real-write"] === true;
  const ownerApproved = args["owner-approved"] === true || normalizeString(args["owner-approval"]) !== "";
  const riskAccepted = args["duplicate-risk-accepted"] === true || args["transition-risk-accepted"] === true;
  const configPath = normalizeString(args.config || "docs/config/jira-sync-config.sample.json");
  const config = readJson(configPath);
  const issueError = validateIssueKey(issue);
  const { smoke, transition, findings: configBlockers } = issueError
    ? { smoke: config.guardedTransitionSmoke || {}, transition: null, findings: [] }
    : transitionSmokeFindings({ config, issue, transitionId, requestedTo });
  const missingEnv = realWriteRequested ? missingEnvironment(process.env) : [];
  const taskId = normalizeString(args["task-key"]) || defaultTaskId(action);

  const base = {
    ...baseOutput({ action, issue, operation: "transition_issue", realWriteRequested, taskId }),
    mode: realWriteRequested ? "GUARDED_TRANSITION_SMOKE" : "MANUAL_DRY_RUN",
    config: configPath,
    result: "DRY_RUN_TRANSITION_READY",
    guarded_transition_smoke: {
      scope: smoke.scope || null,
      allowed_issue_key: transition?.allowedIssueKey || smoke.allowedIssueKey || null,
      allowed_operation: smoke.allowedOperation || null,
      transition_id: transitionId || null,
      configured_transition_id: transition?.transitionId || smoke.transitionId || null,
      transition_name: transition?.transitionName || smoke.transitionName || null,
      target_status_id: transition?.targetStatusId || smoke.targetStatusId || null,
      target_status_name: transition?.targetStatusName || smoke.targetStatusName || null
    },
    owner_approval: {
      required: true,
      present: ownerApproved
    },
    risk_acceptance: {
      required: true,
      present: riskAccepted
    },
    planned_jira_operation: {
      type: "transition_issue",
      issue_key: issue || null,
      transition_id: transitionId || null,
      target_status_name: transition?.targetStatusName || smoke.targetStatusName || null
    },
    no_write_confirmation: realWriteRequested ? "NO_WRITE until all guarded transition gates pass" : "NO_WRITE"
  };

  if (issueError) {
    return {
      ...base,
      result: "BLOCKED_INVALID_ISSUE",
      blocked_reason: issueError
    };
  }

  if (configBlockers.length > 0) {
    return {
      ...base,
      result: "BLOCKED_MISSING_CONFIG",
      blocked_reason: "Required guarded transition smoke config is missing or mismatched.",
      config_blockers: configBlockers
    };
  }

  if (!realWriteRequested) {
    return base;
  }

  if (!ownerApproved) {
    return {
      ...base,
      result: "BLOCKED_MISSING_OWNER_APPROVAL",
      blocked_reason: "Real transition smoke requires explicit owner approval."
    };
  }

  if (!riskAccepted) {
    return {
      ...base,
      result: "BLOCKED_TRANSITION_RISK",
      blocked_reason: "Real transition smoke requires explicit transition risk acceptance."
    };
  }

  if (missingEnv.length > 0) {
    return {
      ...base,
      result: "BLOCKED_MISSING_CONFIG",
      blocked_reason: "Missing required environment variables.",
      credentials_required: true,
      missing_environment_variables: missingEnv
    };
  }

  return {
    ...base,
    result: "GUARDED_TRANSITION_WRITE_READY",
    credentials_required: true,
    no_write_confirmation: "REAL_TRANSITION_READY_NOT_EXECUTED_BY_PLAN"
  };
}

function missingEnvironment(env) {
  return REQUIRED_ENV.filter((name) => !env[name] || String(env[name]).trim() === "");
}

function buildAuthHeader(email, token) {
  return `Basic ${Buffer.from(`${email}:${token}`, "utf8").toString("base64")}`;
}

function buildCommentDocument(comment) {
  return {
    body: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: comment
            }
          ]
        }
      ]
    }
  };
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

async function writeComment({ issue, comment, env }) {
  const baseUrl = normalizeBaseUrl(env.JIRA_BASE_URL);
  const endpoint = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(issue)}/comment`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": buildAuthHeader(env.JIRA_EMAIL, env.JIRA_API_TOKEN),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(buildCommentDocument(comment))
  });

  let responseBody = null;
  const text = await response.text();
  if (text) {
    try {
      responseBody = JSON.parse(text);
    } catch {
      responseBody = { non_json_response: true };
    }
  }

  return {
    http_status: response.status,
    ok: response.ok,
    comment_id: responseBody && typeof responseBody.id === "string" ? responseBody.id : null,
    self: responseBody && typeof responseBody.self === "string" ? responseBody.self : null
  };
}

async function writeTransition({ issue, transitionId, env }) {
  const baseUrl = normalizeBaseUrl(env.JIRA_BASE_URL);
  const endpoint = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(issue)}/transitions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": buildAuthHeader(env.JIRA_EMAIL, env.JIRA_API_TOKEN),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      transition: {
        id: transitionId
      }
    })
  });

  return {
    http_status: response.status,
    ok: response.ok,
    transition_id: transitionId
  };
}

function validateRequest(args) {
  const action = normalizeAction(args.action);
  const requestedStatus = normalizeStatus(args.to);
  const issue = args.issue ? String(args.issue).trim() : "";
  const comment = args.comment ? String(args.comment).trim() : "";
  const realWriteRequested = args["real-write"] === true;

  if (!action) {
    return blocked({ action, issue, operation: null, reason: "Missing required --action.", realWriteRequested });
  }

  if (action === "transition_issue" || requestedStatus === "DONE") {
    return blocked({
      action,
      issue,
      operation: action,
      reason: "Real transitions and DONE transitions are blocked in RIC-STUDIO-077A.",
      realWriteRequested
    });
  }

  if (action === "create_issue") {
    return blocked({
      action,
      issue,
      operation: action,
      reason: "Real issue creation is blocked in RIC-STUDIO-077A.",
      realWriteRequested
    });
  }

  if (action !== "add_comment") {
    return blocked({
      action,
      issue,
      operation: action,
      reason: "Only add_comment is supported by RIC-STUDIO-077A.",
      realWriteRequested
    });
  }

  if (!issue) {
    return blocked({ action, issue, operation: "add_comment", reason: "add_comment requires --issue.", realWriteRequested });
  }

  if (!comment) {
    return blocked({ action, issue, operation: "add_comment", reason: "add_comment requires --comment.", realWriteRequested });
  }

  return null;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.error) {
    console.error(JSON.stringify(blocked({
      action: null,
      issue: null,
      operation: null,
      reason: parsed.error
    }), null, 2));
    process.exitCode = 1;
    return;
  }

  const args = parsed.args;
  const action = normalizeAction(args.action);
  const issue = args.issue ? String(args.issue).trim() : "";
  const comment = args.comment ? String(args.comment).trim() : "";
  const realWriteRequested = args["real-write"] === true;

  if (action === "add_evidence_comment" || action === "evidence_comment") {
    try {
      const plan = evidenceCommentPlan(args);
      if (plan.result !== "GUARDED_COMMENT_WRITE_READY") {
        console.log(JSON.stringify(plan, null, 2));
        process.exitCode = plan.result === "DRY_RUN_COMMENT_READY" ? 0 : 2;
        return;
      }

      console.log(JSON.stringify(plan, null, 2));
      try {
        const result = await writeComment({ issue, comment: plan.planned_jira_operation.comment, env: process.env });
        console.log(JSON.stringify({
          ...baseOutput({
            action,
            issue,
            operation: "add_comment",
            realWriteRequested: true,
            taskId: plan.local_task?.task_key || null
          }),
          mode: "GUARDED_COMMENT_ONLY",
          result: result.ok ? "GUARDED_COMMENT_WRITE_DONE" : "BLOCKED_INVALID_ISSUE",
          jira_write_performed: result.ok,
          jira_api_called: true,
          network_call_performed: true,
          credentials_required: true,
          http_status: result.http_status,
          comment_created: result.ok,
          comment_id: result.comment_id,
          comment_self: result.self,
          write_confirmation: result.ok ? "GUARDED_WRITE_COMPLETED" : "NO_WRITE",
          no_write_confirmation: result.ok ? undefined : "NO_WRITE",
          token_created: false,
          token_stored: false,
          secrets_printed: false
        }, null, 2));
        process.exitCode = result.ok ? 0 : 2;
      } catch (error) {
        console.log(JSON.stringify({
          ...baseOutput({
            action,
            issue,
            operation: "add_comment",
            realWriteRequested: true,
            taskId: normalizeString(args["task-key"]) || null
          }),
          mode: "GUARDED_COMMENT_ONLY",
          result: "BLOCKED_INVALID_ISSUE",
          blocked_reason: error.message,
          jira_write_performed: false,
          jira_api_called: true,
          network_call_performed: true,
          credentials_required: true,
          http_status: null,
          comment_created: false
        }, null, 2));
        process.exitCode = 2;
      }
    } catch (error) {
      console.log(JSON.stringify({
        ...baseOutput({
          action,
          issue,
          operation: "add_comment",
          realWriteRequested,
          taskId: normalizeString(args["task-key"]) || null
        }),
        mode: realWriteRequested ? "GUARDED_COMMENT_ONLY" : "MANUAL_DRY_RUN",
        result: "BLOCKED_MISSING_CONFIG",
        blocked_reason: error.message,
        jira_write_performed: false,
        jira_api_called: false,
        jira_cli_called: false,
        network_call_performed: false,
        credentials_required: realWriteRequested,
        token_created: false,
        token_stored: false,
        secrets_printed: false,
        no_write_confirmation: "NO_WRITE"
      }, null, 2));
      process.exitCode = 2;
    }
    return;
  }

  if (action === "transition_issue") {
    try {
      const plan = transitionSmokePlan(args);
      if (plan.result !== "GUARDED_TRANSITION_WRITE_READY") {
        console.log(JSON.stringify(plan, null, 2));
        process.exitCode = plan.result === "DRY_RUN_TRANSITION_READY" ? 0 : 2;
        return;
      }

      console.log(JSON.stringify(plan, null, 2));
      try {
        const result = await writeTransition({
          issue,
          transitionId: plan.planned_jira_operation.transition_id,
          env: process.env
        });
        console.log(JSON.stringify({
          ...baseOutput({
            action,
            issue,
            operation: "transition_issue",
            realWriteRequested: true,
            taskId: plan.task_id
          }),
          mode: "GUARDED_TRANSITION_SMOKE",
          result: result.ok ? "GUARDED_TRANSITION_WRITE_DONE" : "BLOCKED_INVALID_ISSUE",
          jira_write_performed: result.ok,
          jira_api_called: true,
          network_call_performed: true,
          credentials_required: true,
          http_status: result.http_status,
          transition_performed: result.ok,
          transition_id: result.transition_id,
          target_status_name: plan.guarded_transition_smoke.target_status_name,
          write_confirmation: result.ok ? "GUARDED_TRANSITION_COMPLETED" : "NO_WRITE",
          no_write_confirmation: result.ok ? undefined : "NO_WRITE",
          token_created: false,
          token_stored: false,
          secrets_printed: false
        }, null, 2));
        process.exitCode = result.ok ? 0 : 2;
      } catch (error) {
        console.log(JSON.stringify({
          ...baseOutput({
            action,
            issue,
            operation: "transition_issue",
            realWriteRequested: true,
            taskId: normalizeString(args["task-key"]) || null
          }),
          mode: "GUARDED_TRANSITION_SMOKE",
          result: "BLOCKED_INVALID_ISSUE",
          blocked_reason: error.message,
          jira_write_performed: false,
          jira_api_called: true,
          network_call_performed: true,
          credentials_required: true,
          http_status: null,
          transition_performed: false
        }, null, 2));
        process.exitCode = 2;
      }
    } catch (error) {
      console.log(JSON.stringify({
        ...baseOutput({
          action,
          issue,
          operation: "transition_issue",
          realWriteRequested,
          taskId: normalizeString(args["task-key"]) || null
        }),
        mode: realWriteRequested ? "GUARDED_TRANSITION_SMOKE" : "MANUAL_DRY_RUN",
        result: "BLOCKED_MISSING_CONFIG",
        blocked_reason: error.message,
        jira_write_performed: false,
        jira_api_called: false,
        jira_cli_called: false,
        network_call_performed: false,
        credentials_required: realWriteRequested,
        token_created: false,
        token_stored: false,
        secrets_printed: false,
        no_write_confirmation: "NO_WRITE"
      }, null, 2));
      process.exitCode = 2;
    }
    return;
  }

  const validationFailure = validateRequest(args);

  if (validationFailure) {
    console.log(JSON.stringify(validationFailure, null, 2));
    process.exitCode = 2;
    return;
  }

  if (!realWriteRequested) {
    console.log(JSON.stringify(dryRunPlan({ action, issue, comment }), null, 2));
    return;
  }

  const missing = missingEnvironment(process.env);
  if (missing.length > 0) {
    console.log(JSON.stringify(blocked({
      action,
      issue,
      operation: "add_comment",
      reason: "Missing required environment variables.",
      realWriteRequested: true,
      details: {
        missing_environment_variables: missing
      }
    }), null, 2));
    process.exitCode = 2;
    return;
  }

  console.log(JSON.stringify(realWritePlan({ action, issue, comment }), null, 2));

  try {
    const result = await writeComment({ issue, comment, env: process.env });
    console.log(JSON.stringify({
      ...baseOutput({
        action,
        issue,
        operation: "add_comment",
        realWriteRequested: true,
        taskId: normalizeString(args["task-key"]) || null
      }),
      mode: "real_write_result",
      result: result.ok ? "REAL_WRITE_COMPLETED" : "BLOCKED",
      jira_write_performed: result.ok,
      jira_api_called: true,
      network_call_performed: true,
      http_status: result.http_status,
      comment_created: result.ok,
      comment_id: result.comment_id,
      comment_self: result.self,
      write_confirmation: result.ok ? "GUARDED_WRITE_COMPLETED" : "NO_WRITE",
      no_write_confirmation: result.ok ? undefined : "NO_WRITE"
    }, null, 2));
    process.exitCode = result.ok ? 0 : 2;
  } catch (error) {
    console.log(JSON.stringify({
      ...baseOutput({
        action,
        issue,
        operation: "add_comment",
        realWriteRequested: true,
        taskId: normalizeString(args["task-key"]) || null
      }),
      mode: "real_write_result",
      result: "BLOCKED",
      blocked_reason: error.message,
      jira_write_performed: false,
      jira_api_called: true,
      network_call_performed: true,
      http_status: null,
      comment_created: false
    }, null, 2));
    process.exitCode = 2;
  }
}

main();
