#!/usr/bin/env node

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

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      return { error: `Unexpected positional argument: ${token}` };
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (key === "dry-run" || key === "real-write") {
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

function baseOutput({ action, issue, operation, realWriteRequested = false }) {
  return {
    tool: "ric-studio-jira-guarded-write",
    task_id: "RIC-STUDIO-077A",
    contract: "docs/architecture/guarded-jira-write-integration-contract.md",
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
      ...baseOutput({ action, issue, operation: "add_comment", realWriteRequested: true }),
      mode: "real_write_result",
      result: result.ok ? "REAL_WRITE_COMPLETED" : "BLOCKED",
      jira_write_performed: result.ok,
      jira_api_called: true,
      network_call_performed: true,
      http_status: result.http_status,
      comment_created: result.ok,
      comment_id: result.comment_id,
      comment_self: result.self
    }, null, 2));
    process.exitCode = result.ok ? 0 : 2;
  } catch (error) {
    console.log(JSON.stringify({
      ...baseOutput({ action, issue, operation: "add_comment", realWriteRequested: true }),
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
