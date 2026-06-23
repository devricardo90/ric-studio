#!/usr/bin/env node

const ALLOWED_TRANSITIONS = new Set(["BACKLOG", "READY", "IN_PROGRESS", "REVIEW"]);
const DONE_VALUES = new Set(["DONE", "REMOTE_DONE", "LOCAL_DONE"]);

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
    audit: {
      dry_run_only: true,
      hidden_transition: false,
      automatic_done_blocked: true,
      human_review_required_for_execution: true
    }
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

function buildPlan(args) {
  const action = normalizeAction(args.action);

  if (!action) {
    throw new Error("Missing required --action");
  }

  if (action === "create_issue" || action === "create") {
    return createIssuePlan(args);
  }

  if (action === "transition_issue" || action === "transition") {
    return transitionPlan(args);
  }

  if (action === "add_comment" || action === "comment") {
    return commentPlan(args);
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
