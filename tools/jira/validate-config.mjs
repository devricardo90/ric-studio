#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_MODES = ["MANUAL_DRY_RUN", "GUARDED_COMMENT_ONLY", "GUARDED_REAL_SYNC_FUTURE"];
const REQUIRED_STATUSES = ["DRAFT", "READY", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED", "FAILED"];
const REQUIRED_BLOCKED_ACTIONS = [
  "delete_issue",
  "overwrite_description_without_owner_approval",
  "transition_unknown_status",
  "create_duplicate_issue",
  "modify_unrelated_jira_projects",
  "bulk_updates",
  "jira_workflow_or_project_config_edits",
  "credential_or_token_creation_or_storage",
  "hidden_retries_that_may_duplicate_writes",
  "automatic_done_without_final_owner_validation"
];
const SECRET_KEY_PATTERN = /(token|secret|password|authorization|cookie|credential|api[_-]?key)/i;
const PLACEHOLDER_PATTERN = /^<[^>]+>$/;
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

function normalizeString(value) {
  return String(value || "").trim();
}

function resolveRepoPath(value) {
  const requestedPath = normalizeString(value);
  if (!requestedPath) {
    throw new Error("Missing required --config");
  }
  return path.isAbsolute(requestedPath) ? requestedPath : path.join(repoRoot, requestedPath);
}

function isPlaceholder(value) {
  return PLACEHOLDER_PATTERN.test(normalizeString(value));
}

function hasValue(value) {
  return normalizeString(value) !== "";
}

function addIfMissing(list, condition, message) {
  if (!condition) list.push(message);
}

function findSecretKeys(value, pathParts = []) {
  if (!value || typeof value !== "object") return [];

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findSecretKeys(item, [...pathParts, String(index)]));
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const currentPath = [...pathParts, key];
    const keyFinding = SECRET_KEY_PATTERN.test(key) ? [currentPath.join(".")] : [];
    return [...keyFinding, ...findSecretKeys(child, currentPath)];
  });
}

function validateProject(project, index, realSyncBlockers, contractErrors) {
  const prefix = `approvedProjects[${index}]`;
  addIfMissing(contractErrors, hasValue(project.localProject), `${prefix}.localProject is required.`);
  const allowedOperations = Array.isArray(project.allowedRealOperations) ? project.allowedRealOperations : [];

  if (!hasValue(project.jiraProjectKey)) {
    realSyncBlockers.push(`${prefix}.jiraProjectKey is missing.`);
  } else if (isPlaceholder(project.jiraProjectKey)) {
    realSyncBlockers.push(`${prefix}.jiraProjectKey is a placeholder.`);
  }

  if (!Array.isArray(project.allowedIssueTypes) || project.allowedIssueTypes.length === 0) {
    realSyncBlockers.push(`${prefix}.allowedIssueTypes is missing.`);
    return;
  }

  project.allowedIssueTypes.forEach((issueType, issueTypeIndex) => {
    if (!hasValue(issueType)) {
      realSyncBlockers.push(`${prefix}.allowedIssueTypes[${issueTypeIndex}] is empty.`);
    } else if (isPlaceholder(issueType)) {
      realSyncBlockers.push(`${prefix}.allowedIssueTypes[${issueTypeIndex}] is a placeholder.`);
    }
  });

  if (project.realSyncAllowed === true) {
    addIfMissing(contractErrors, allowedOperations.length > 0, `${prefix}.allowedRealOperations is required when realSyncAllowed is true.`);
    addIfMissing(contractErrors, allowedOperations.every((operation) => operation === "add_comment"), `${prefix}.allowedRealOperations may only include add_comment.`);
    addIfMissing(contractErrors, project.realSyncScope === "guarded_comment_smoke_only", `${prefix}.realSyncScope must be guarded_comment_smoke_only.`);
  }
}

function validateMapping(config, field, label, realSyncBlockers) {
  const mapping = config[field] || {};
  REQUIRED_STATUSES.forEach((status) => {
    const value = mapping[status];
    if (!hasValue(value)) {
      realSyncBlockers.push(`${label}.${status} is missing.`);
    } else if (isPlaceholder(value)) {
      realSyncBlockers.push(`${label}.${status} is a placeholder.`);
    }
  });
}

function validateConfig(config) {
  const contractErrors = [];
  const realSyncBlockers = [];
  const secretKeyFindings = findSecretKeys(config);

  addIfMissing(contractErrors, config.schemaVersion === 1, "schemaVersion must be 1.");
  addIfMissing(contractErrors, config.sourceOfTruth === "RIC Studio", "sourceOfTruth must be RIC Studio.");
  addIfMissing(contractErrors, config.currentMode === "MANUAL_DRY_RUN", "currentMode must remain MANUAL_DRY_RUN.");
  addIfMissing(contractErrors, Array.isArray(config.allowedOperationModes), "allowedOperationModes must be an array.");
  addIfMissing(contractErrors, Array.isArray(config.approvedProjects), "approvedProjects must be an array.");
  addIfMissing(contractErrors, Array.isArray(config.localStatuses), "localStatuses must be an array.");
  addIfMissing(contractErrors, secretKeyFindings.length === 0, "Contract must not contain secret-like key names.");

  REQUIRED_MODES.forEach((mode) => {
    addIfMissing(contractErrors, config.allowedOperationModes?.includes(mode), `allowedOperationModes must include ${mode}.`);
  });

  REQUIRED_STATUSES.forEach((status) => {
    addIfMissing(contractErrors, config.localStatuses?.includes(status), `localStatuses must include ${status}.`);
  });

  REQUIRED_BLOCKED_ACTIONS.forEach((action) => {
    addIfMissing(contractErrors, config.strictBlockedActions?.includes(action), `strictBlockedActions must include ${action}.`);
  });

  (config.approvedProjects || []).forEach((project, index) => {
    validateProject(project, index, realSyncBlockers, contractErrors);
  });

  validateMapping(config, "jiraStatusMapping", "jiraStatusMapping", realSyncBlockers);
  validateMapping(config, "jiraTransitionMapping", "jiraTransitionMapping", realSyncBlockers);

  addIfMissing(
    contractErrors,
    config.currentStatusVerification?.requiredBeforeRealTransition === true,
    "currentStatusVerification.requiredBeforeRealTransition must be true."
  );
  addIfMissing(
    contractErrors,
    config.createIssueDuplicateDetection?.requiredBeforeRealCreate === true,
    "createIssueDuplicateDetection.requiredBeforeRealCreate must be true."
  );
  addIfMissing(
    contractErrors,
    config.linkExistingIssueValidation?.requiredBeforeRealLink === true,
    "linkExistingIssueValidation.requiredBeforeRealLink must be true."
  );
  addIfMissing(
    contractErrors,
    config.evidenceComment?.idempotencyMarkerFormat === "RIC-STUDIO-JIRA-EVIDENCE::{localProject}::{taskKey}::{operation}",
    "evidenceComment.idempotencyMarkerFormat must match the RIC Studio marker contract."
  );
  addIfMissing(
    contractErrors,
    config.ownerApproval?.requiredBeforeAnyRealWrite === true,
    "ownerApproval.requiredBeforeAnyRealWrite must be true."
  );
  addIfMissing(
    contractErrors,
    config.ownerApproval?.doneRequiresFinalOwnerValidation === true,
    "ownerApproval.doneRequiresFinalOwnerValidation must be true."
  );

  if (config.ownerApproval?.ownerValidationPresent !== true) {
    realSyncBlockers.push("DONE transition blocked because ownerValidationPresent is not true.");
  }

  return {
    contractErrors,
    realSyncBlockers,
    secretKeyFindings
  };
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const configPath = args.config;
    const config = JSON.parse(readFileSync(resolveRepoPath(configPath), "utf8"));
    const { contractErrors, realSyncBlockers, secretKeyFindings } = validateConfig(config);
  const contractValid = contractErrors.length === 0;
    const guardedCommentProjects = (config.approvedProjects || [])
      .filter((project) => project.realSyncAllowed === true && project.allowedRealOperations?.includes("add_comment"))
      .map((project) => ({
        localProject: project.localProject,
        jiraProjectKey: project.jiraProjectKey,
        allowedRealOperations: project.allowedRealOperations,
        realSyncScope: project.realSyncScope
      }));

    console.log(JSON.stringify({
      tool: "ric-studio-jira-config-validator",
      mode: "MANUAL_DRY_RUN",
      config: configPath,
      result: contractValid ? "VALID_MANUAL_DRY_RUN_CONTRACT" : "BLOCKED_INVALID_CONTRACT",
      contract_valid: contractValid,
      real_sync_allowed: false,
      real_sync_blocked: true,
      guarded_comment_projects: guardedCommentProjects,
      real_sync_blockers: [...new Set(realSyncBlockers)].sort(),
      contract_errors: contractErrors,
      secret_like_keys_found: secretKeyFindings,
      jira_api_called: false,
      jira_cli_called: false,
      network_call_performed: false,
      credentials_required: false,
      environment_values_read: false,
      secrets_printed: false,
      no_write_confirmation: "NO_WRITE"
    }, null, 2));

    process.exitCode = contractValid ? 0 : 2;
  } catch (error) {
    console.error(JSON.stringify({
      tool: "ric-studio-jira-config-validator",
      mode: "MANUAL_DRY_RUN",
      result: "BLOCKED_INVALID_CONTRACT",
      error: error.message,
      jira_api_called: false,
      jira_cli_called: false,
      network_call_performed: false,
      credentials_required: false,
      environment_values_read: false,
      secrets_printed: false,
      no_write_confirmation: "NO_WRITE"
    }, null, 2));
    process.exitCode = 1;
  }
}

main();
