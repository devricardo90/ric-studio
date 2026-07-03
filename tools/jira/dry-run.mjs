#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ALLOWED_TRANSITIONS = new Set(["BACKLOG", "READY", "IN_PROGRESS", "REVIEW"]);
const DONE_VALUES = new Set(["DONE", "REMOTE_DONE", "LOCAL_DONE"]);
const REGISTRY_TRANSITIONS = ["READY", "IN_PROGRESS", "REVIEW", "DONE"];
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${token}`);
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    args[key] = next;
    index += 1;
  }

  return args;
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

function requireField(args, field, message) {
  if (!args[field] || String(args[field]).trim() === "") {
    throw new Error(message);
  }
}

function buildBase(args, action) {
  return {
    tool: "ric-studio-jira-dry-run",
    mode: "dry_run",
    action,
    task_id: args.task || "RIC-STUDIO-075A",
    contract: "docs/architecture/jira-cli-automation-contract.md",
    jira_write_performed: false,
    jira_api_called: false,
    jira_cli_called: false,
    network_call_performed: false,
    credentials_required: false,
    credential_status: "absent_not_required",
    token_created: false,
    token_stored: false,
    no_write_confirmation: "NO_WRITE",
    audit: {
      dry_run_only: true,
      hidden_transition: false,
      automatic_done_blocked: true,
      human_review_required_for_execution: true
    }
  };
}

function repoRelativePath(value) {
  const requestedPath = normalizeString(value);
  if (!requestedPath) {
    throw new Error("Missing required --registry");
  }

  return path.isAbsolute(requestedPath) ? requestedPath : path.join(repoRoot, requestedPath);
}

function readRegistry(registryPath) {
  const registry = JSON.parse(readFileSync(repoRelativePath(registryPath), "utf8"));
  if (!Array.isArray(registry.tasks)) {
    throw new Error("Sprint Automation Registry must contain a tasks array.");
  }
  return registry;
}

function findRegistryTask(registry, args) {
  const taskKey = normalizeString(args["task-key"]);
  const project = normalizeString(args.project);

  if (!taskKey) {
    throw new Error("registry_task_plan requires --task-key");
  }

  const matches = registry.tasks.filter((task) => {
    const taskKeyMatches = normalizeString(task.taskKey).toLowerCase() === taskKey.toLowerCase();
    const projectMatches = !project || normalizeString(task.project).toLowerCase() === project.toLowerCase();
    return taskKeyMatches && projectMatches;
  });

  if (matches.length === 0) {
    throw new Error(`No registry task found for task key: ${taskKey}`);
  }

  if (matches.length > 1) {
    throw new Error(`Multiple registry tasks found for task key ${taskKey}; provide --project.`);
  }

  return matches[0];
}

function configValue(args, name, placeholder, missingName, missing) {
  const value = normalizeString(args[name]);
  if (value) return value;
  missing.push(missingName);
  return placeholder;
}

function buildIdempotencyMarker(task) {
  return [
    "RIC-STUDIO-JIRA-DRY-RUN",
    normalizeString(task.project).toLowerCase(),
    normalizeString(task.taskKey).toLowerCase()
  ].join("::");
}

function hasOwnerValidation(task, args) {
  if (normalizeString(args["owner-validation"])) return true;
  if (task.ownerValidation === true) return true;
  if (normalizeString(task.ownerValidation)) return true;
  return false;
}

function buildEvidenceCommentBody(task, idempotencyMarker) {
  const validationCommands = Array.isArray(task.evidence?.validationCommands)
    ? task.evidence.validationCommands.join("; ")
    : "not recorded";

  return [
    "RIC Studio evidence comment dry-run.",
    `Task: ${normalizeString(task.taskKey)} - ${normalizeString(task.title)}`,
    `Project: ${normalizeString(task.project)}`,
    `Sprint: ${normalizeString(task.sprint)}`,
    `Protocol level: ${normalizeString(task.protocolLevel || task.risk)}`,
    `Local status: ${normalizeString(task.status)}`,
    `Validation: ${normalizeString(task.evidence?.smokeResult || "not recorded")}`,
    `Validation commands: ${validationCommands}`,
    `Commit: ${normalizeString(task.evidence?.commitHash || "not committed")}`,
    `Push: ${normalizeString(task.evidence?.pushConfirmation || "not pushed")}`,
    `Idempotency marker: ${idempotencyMarker}`,
    "NO_WRITE: MANUAL_DRY_RUN payload only; no Jira API, CLI, or write action performed."
  ].join("\n");
}

function buildTransitionMapping(args, missing) {
  return REGISTRY_TRANSITIONS.reduce((mapping, status) => {
    const suffix = status.toLowerCase().replace(/_/g, "-");
    mapping[status] = {
      jira_status: configValue(
        args,
        `jira-status-${suffix}`,
        `<JIRA_STATUS_${status}_REQUIRED>`,
        `status_mapping.${status}`,
        missing
      ),
      transition_id: configValue(
        args,
        `jira-transition-${suffix}`,
        `<JIRA_TRANSITION_${status}_REQUIRED>`,
        `transition_id.${status}`,
        missing
      )
    };
    return mapping;
  }, {});
}

function registryTaskPlan(args) {
  const registry = readRegistry(args.registry || "docs/ops/sprint-task-registry.json");
  const task = findRegistryTask(registry, args);
  const missing = [];
  const idempotencyMarker = buildIdempotencyMarker(task);
  const existingIssueKey = normalizeString(task.jiraIssueKey);
  const providedIssueKey = normalizeString(args.issue);
  const effectiveIssueKey = existingIssueKey || providedIssueKey || null;
  const ownerValidationPresent = hasOwnerValidation(task, args);
  const proposedProjectKey = configValue(
    args,
    "jira-project-key",
    "<JIRA_PROJECT_KEY_REQUIRED>",
    "jira_project_key",
    missing
  );
  const proposedIssueType = configValue(
    args,
    "issue-type",
    "<JIRA_ISSUE_TYPE_REQUIRED>",
    "issue_type",
    missing
  );
  const transitionMapping = buildTransitionMapping(args, missing);
  const evidenceCommentBody = buildEvidenceCommentBody(task, idempotencyMarker);
  const missingConfig = [...new Set(missing)].sort();
  const linkedIssueMissingReason = effectiveIssueKey ? null : "No Jira issue key is linked or provided.";
  const configMissingReason = missingConfig.length > 0
    ? `Missing Jira config: ${missingConfig.join(", ")}.`
    : null;

  return {
    ...buildBase(args, "would_generate_registry_task_jira_payloads"),
    mode: "MANUAL_DRY_RUN",
    task_id: args.task || "RIC-STUDIO-083B",
    registry_source: args.registry || "docs/ops/sprint-task-registry.json",
    result: "MANUAL_DRY_RUN",
    no_write_confirmation: "NO_WRITE: generated payload only; no Jira API, Jira CLI, network call, or Jira write was performed.",
    local_task: {
      project: normalizeString(task.project),
      sprint: normalizeString(task.sprint),
      task_key: normalizeString(task.taskKey),
      title: normalizeString(task.title),
      protocol_level: normalizeString(task.protocolLevel || task.risk),
      local_status: normalizeString(task.status),
      jira_sync_status: normalizeString(task.jiraSyncStatus || "MANUAL_DRY_RUN")
    },
    proposed_jira_config: {
      project_key: proposedProjectKey,
      issue_type: proposedIssueType,
      missing_jira_config: missingConfig,
      missing_config_reported_not_guessed: missingConfig.length > 0
    },
    issue_identity: {
      issue_key_already_linked: existingIssueKey || null,
      issue_key_provided_for_link: providedIssueKey || null,
      effective_issue_key: effectiveIssueKey
    },
    idempotency_marker: idempotencyMarker,
    duplicate_prevention_note: "Future real sync must search for this idempotency marker and matching project/task key before creating issues or comments.",
    owner_approval_requirement: "Owner approval is required before any real Jira create, link, comment, or transition action.",
    blocked_real_write_warning: "MANUAL_DRY_RUN only. Real Jira writes, Jira CLI calls, Jira API calls, and network calls are blocked in this generator.",
    safe_evidence_comment_body: evidenceCommentBody,
    operations: [
      {
        operation_type: "create_issue",
        mode: "MANUAL_DRY_RUN",
        result: configMissingReason ? "BLOCKED_MANUAL_CONFIG_REQUIRED" : "DRY_RUN_READY_FOR_OWNER_REVIEW",
        blocked_reason: configMissingReason,
        proposed_fields: {
          project_key: proposedProjectKey,
          issue_type: proposedIssueType,
          summary: `${normalizeString(task.taskKey)} - ${normalizeString(task.title)}`,
          description_preview: [
            `RIC Studio task: ${normalizeString(task.project)} ${normalizeString(task.sprint)} / ${normalizeString(task.taskKey)}`,
            `Protocol level: ${normalizeString(task.protocolLevel || task.risk)}`,
            `Local status: ${normalizeString(task.status)}`,
            `Idempotency marker: ${idempotencyMarker}`
          ].join("\n")
        },
        idempotency_marker: idempotencyMarker,
        duplicate_prevention_note: "Do not create if Jira already contains this marker or an approved linked issue key.",
        owner_approval_required: true,
        no_write_confirmation: "NO_WRITE"
      },
      {
        operation_type: "link_existing_issue",
        mode: "MANUAL_DRY_RUN",
        result: linkedIssueMissingReason ? "BLOCKED_MISSING_ISSUE_KEY" : "DRY_RUN_READY_FOR_OWNER_REVIEW",
        blocked_reason: linkedIssueMissingReason,
        issue_key: effectiveIssueKey,
        required_checks: [
          "Issue must belong to the approved Jira project.",
          "Issue summary and scope must match the local registry task.",
          "Linking must not modify unrelated Jira issues or projects."
        ],
        idempotency_marker: idempotencyMarker,
        owner_approval_required: true,
        no_write_confirmation: "NO_WRITE"
      },
      {
        operation_type: "add_evidence_comment",
        mode: "MANUAL_DRY_RUN",
        result: linkedIssueMissingReason ? "BLOCKED_MISSING_ISSUE_KEY" : "DRY_RUN_READY_FOR_OWNER_REVIEW",
        blocked_reason: linkedIssueMissingReason,
        issue_key: effectiveIssueKey,
        comment_body: evidenceCommentBody,
        idempotency_marker: idempotencyMarker,
        duplicate_prevention_note: "Future real sync must check for this comment idempotency marker before adding another evidence comment.",
        owner_approval_required: true,
        no_write_confirmation: "NO_WRITE"
      },
      {
        operation_type: "transition_plan",
        mode: "MANUAL_DRY_RUN",
        result: "DRY_RUN_REVIEW_REQUIRED",
        issue_key: effectiveIssueKey,
        current_local_status: normalizeString(task.status),
        status_mapping: transitionMapping,
        transitions: REGISTRY_TRANSITIONS.map((status) => ({
          target_local_status: status,
          jira_status: transitionMapping[status].jira_status,
          transition_id: transitionMapping[status].transition_id,
          result: status === "DONE" && !ownerValidationPresent
            ? "BLOCKED_OWNER_VALIDATION_REQUIRED"
            : linkedIssueMissingReason || configMissingReason
              ? "BLOCKED_MANUAL_CONFIG_REQUIRED"
              : "DRY_RUN_READY_FOR_OWNER_REVIEW",
          blocked_reason: status === "DONE" && !ownerValidationPresent
            ? "DONE transition requires explicit owner validation in the input."
            : linkedIssueMissingReason || configMissingReason
        })),
        done_transition_blocked_by_default: !ownerValidationPresent,
        owner_validation_present: ownerValidationPresent,
        owner_approval_required: true,
        no_write_confirmation: "NO_WRITE"
      }
    ],
    blocked_actions: [
      "real_jira_api_call",
      "real_jira_cli_call",
      "network_call",
      "real_create_issue",
      "real_link_issue",
      "real_add_comment",
      "real_transition",
      "automatic_done",
      "token_creation",
      "credential_storage",
      "printing_secrets_or_environment_values"
    ],
    environment_values_read: false,
    secrets_printed: false
  };
}

function createIssuePlan(args) {
  requireField(args, "summary", "create_issue requires --summary");

  return {
    ...buildBase(args, "would_create_issue"),
    target: {
      issue_key: args.issue || null,
      summary: args.summary
    },
    planned_jira_operation: {
      type: "create_issue",
      would_create_issue: true,
      fields: {
        summary: args.summary
      }
    },
    blocked_actions: ["real_jira_api_call", "real_jira_cli_call", "token_creation", "credential_storage", "automatic_done"],
    result: "DRY_RUN_ONLY"
  };
}

function transitionPlan(args) {
  requireField(args, "issue", "transition_issue requires --issue");
  requireField(args, "to", "transition_issue requires --to");

  const targetStatus = normalizeStatus(args.to);

  if (DONE_VALUES.has(targetStatus)) {
    return {
      ...buildBase(args, "blocked_transition"),
      target: {
        issue_key: args.issue,
        requested_status: targetStatus
      },
      blocked_reason: "DONE transitions require Ricardo final validation and cannot be automated by this dry-run tool.",
      blocked_actions: ["automatic_done", "real_jira_api_call", "real_jira_cli_call"],
      result: "BLOCKED"
    };
  }

  if (!ALLOWED_TRANSITIONS.has(targetStatus)) {
    throw new Error(`Unsupported transition target: ${args.to}`);
  }

  return {
    ...buildBase(args, "would_transition_issue"),
    target: {
      issue_key: args.issue,
      requested_status: targetStatus
    },
    planned_jira_operation: {
      type: "transition_issue",
      would_transition_issue: true,
      issue_key: args.issue,
      target_status: targetStatus
    },
    blocked_actions: ["real_jira_api_call", "real_jira_cli_call", "automatic_done"],
    result: "DRY_RUN_ONLY"
  };
}

function commentPlan(args) {
  requireField(args, "issue", "add_comment requires --issue");
  requireField(args, "comment", "add_comment requires --comment");

  return {
    ...buildBase(args, "would_add_comment"),
    target: {
      issue_key: args.issue
    },
    planned_jira_operation: {
      type: "add_comment",
      would_add_comment: true,
      issue_key: args.issue,
      comment: args.comment
    },
    blocked_actions: ["real_jira_api_call", "real_jira_cli_call", "credential_storage"],
    result: "DRY_RUN_ONLY"
  };
}

function evidenceSummaryPlan(args) {
  requireField(args, "issue", "attach_evidence_summary requires --issue");
  requireField(args, "evidence-summary", "attach_evidence_summary requires --evidence-summary");

  return {
    ...buildBase(args, "would_attach_evidence_summary"),
    target: {
      issue_key: args.issue
    },
    planned_jira_operation: {
      type: "attach_evidence_summary",
      would_attach_evidence_summary: true,
      issue_key: args.issue,
      evidence_summary: args["evidence-summary"]
    },
    blocked_actions: ["real_jira_api_call", "real_jira_cli_call", "credential_storage"],
    result: "DRY_RUN_ONLY"
  };
}

function linkExistingIssuePlan(args) {
  requireField(args, "issue", "link_existing_issue requires --issue");

  const idempotencyMarker = normalizeString(args["idempotency-marker"]) || "RIC-STUDIO-JIRA-DRY-RUN::<PROJECT>::<TASK_KEY>";

  return {
    ...buildBase(args, "would_link_existing_issue"),
    target: {
      issue_key: args.issue
    },
    planned_jira_operation: {
      type: "link_existing_issue",
      would_link_existing_issue: true,
      issue_key: args.issue,
      idempotency_marker: idempotencyMarker
    },
    duplicate_prevention_note: "Future real sync must verify the issue belongs to the approved project and is not already linked to another local task.",
    owner_approval_required: true,
    blocked_actions: ["real_jira_api_call", "real_jira_cli_call", "credential_storage"],
    result: "DRY_RUN_ONLY"
  };
}

function evidenceCommentPlan(args) {
  requireField(args, "issue", "add_evidence_comment requires --issue");
  requireField(args, "comment", "add_evidence_comment requires --comment");

  const idempotencyMarker = normalizeString(args["idempotency-marker"]) || "RIC-STUDIO-JIRA-DRY-RUN::<PROJECT>::<TASK_KEY>";

  return {
    ...buildBase(args, "would_add_evidence_comment"),
    target: {
      issue_key: args.issue
    },
    planned_jira_operation: {
      type: "add_evidence_comment",
      would_add_evidence_comment: true,
      issue_key: args.issue,
      comment: `${args.comment}\nIdempotency marker: ${idempotencyMarker}\nNO_WRITE: MANUAL_DRY_RUN only.`
    },
    idempotency_marker: idempotencyMarker,
    duplicate_prevention_note: "Future real sync must check for this idempotency marker before adding another evidence comment.",
    owner_approval_required: true,
    blocked_actions: ["real_jira_api_call", "real_jira_cli_call", "credential_storage"],
    result: "DRY_RUN_ONLY"
  };
}

function buildPlan(args) {
  const action = normalizeAction(args.action);

  if (!action) {
    throw new Error("Missing required --action");
  }

  if (action === "registry_task_plan" || action === "sprint_task_plan" || action === "task_payload") {
    return registryTaskPlan(args);
  }

  if (action === "create_issue" || action === "create") {
    return createIssuePlan(args);
  }

  if (action === "link_existing_issue" || action === "link_issue" || action === "link") {
    return linkExistingIssuePlan(args);
  }

  if (action === "transition_issue" || action === "transition") {
    return transitionPlan(args);
  }

  if (action === "add_comment" || action === "comment") {
    return commentPlan(args);
  }

  if (action === "add_evidence_comment" || action === "evidence_comment") {
    return evidenceCommentPlan(args);
  }

  if (action === "attach_evidence_summary" || action === "evidence_summary") {
    return evidenceSummaryPlan(args);
  }

  throw new Error(`Unsupported action: ${args.action}`);
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const plan = buildPlan(args);
    console.log(JSON.stringify(plan, null, 2));
    process.exitCode = plan.result === "BLOCKED" ? 2 : 0;
  } catch (error) {
    console.error(JSON.stringify({
      tool: "ric-studio-jira-dry-run",
      mode: "dry_run",
      result: "BLOCKED",
      error: error.message,
      jira_write_performed: false,
      jira_api_called: false,
      jira_cli_called: false,
      network_call_performed: false,
      credentials_required: false,
      token_created: false,
      token_stored: false
    }, null, 2));
    process.exitCode = 1;
  }
}

main();
