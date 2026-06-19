import { createServer, request } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const DEFAULT_PORT = 4310;
const args = new Set(process.argv.slice(2));
const isSmoke = args.has("smoke") || args.has("--smoke");
const port = Number.parseInt(process.env.OPERATOR_UI_PORT || `${DEFAULT_PORT}`, 10);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const externalExecutionContextPath = "docs/ops/external-execution-context.md";

const allowedFilePrefixes = [
  "README.md",
  "STATUS.md",
  "backlog.md",
  "docs/ops/",
  "docs/validation/",
  "docs/architecture/",
  "tools/auditor/",
  "tools/operator-ui/README.md",
];

const auditorCommands = [
  {
    label: "Start operator dashboard",
    command: "node tools/operator-ui/server.mjs",
    purpose: "Open the local read-only browser dashboard at http://localhost:4310.",
  },
  {
    label: "Dashboard smoke check",
    command: "node tools/operator-ui/server.mjs smoke",
    purpose: "Start the server, fetch the dashboard and API locally, then exit.",
  },
  {
    label: "Auditor read-only smoke",
    command: "cmd /c npm --prefix tools/auditor run smoke:read-only",
    purpose: "Show the report-only smoke workflow with a structured JSON result.",
  },
  {
    label: "Auditor invalid JSON smoke",
    command: "cmd /c npm --prefix tools/auditor run smoke:invalid-json",
    purpose: "Show a blocked invalid JSON path with a structured JSON result.",
  },
  {
    label: "Allowed audit-session path",
    command:
      "node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json",
    purpose: "Show COMMIT_ALLOWED evidence through the local session runner.",
  },
  {
    label: "Blocked audit-session path",
    command:
      "node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json",
    purpose: "Show a blocked protocol-finding path through the local session runner.",
  },
];

const expectedAuditorFiles = [
  {
    path: "tools/auditor/package.json",
    purpose: "Auditor package metadata and local smoke scripts.",
  },
  {
    path: "tools/auditor/README.md",
    purpose: "Local auditor usage and boundary documentation.",
  },
  {
    path: "tools/auditor/audit.mjs",
    purpose: "Dependency-free deterministic auditor evaluator and CLI.",
  },
  {
    path: "tools/auditor/audit-session.mjs",
    purpose: "Local audit session report runner.",
  },
  {
    path: "tools/auditor/smoke-workflow.mjs",
    purpose: "Read-only smoke workflow.",
  },
  {
    path: "tools/auditor/validate-session-contract.mjs",
    purpose: "Dependency-free session contract validator.",
  },
  {
    path: "tools/auditor/fixtures/commit-allowed-evidence.json",
    purpose: "Allowed path evidence fixture.",
  },
  {
    path: "tools/auditor/fixtures/protocol-findings-blocked-file-violation.json",
    purpose: "Blocked path evidence fixture.",
  },
];

const auditorReferenceCandidates = [
  "tools/auditor/README.md",
  "docs/architecture/local-auditor-session-contract.md",
  "docs/architecture/local-auditor-protocol-findings.md",
  "docs/validation/local-operator-visibility-baseline-068a.md",
  "docs/validation/local-auditor-workflow-usage-validation-064a.md",
  "docs/validation/local-auditor-session-contract-validation-062a.md",
  "docs/validation/local-auditor-session-protocol-findings-validation-059a.md",
  "docs/validation/local-auditor-protocol-findings-validation-058a.md",
  "docs/validation/operator-dashboard-auditor-integration-070a.md",
];

function normalizeSlashes(value) {
  return value.replaceAll("\\", "/");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function section(text, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`## ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match ? match[1].trim() : "";
}

function listItems(markdownSection) {
  return markdownSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

function keyToSnakeCase(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function readText(relativePath) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await stat(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function listValidationEvidence() {
  const dir = path.join(repoRoot, "docs", "validation");
  const entries = await readdir(dir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => `docs/validation/${entry.name}`)
    .filter((file) =>
      /local-operator|local-auditor|readme-portfolio-positioning|external-reviewer/i.test(file),
    );

  const dashboardEvidence = "docs/validation/local-operator-dashboard-069a.md";
  const ordered = [
    dashboardEvidence,
    "docs/validation/local-operator-visibility-baseline-068a.md",
    ...files.sort().reverse(),
  ];

  return [...new Set(ordered)].filter((file) => files.includes(file) || file === dashboardEvidence);
}

async function fileInfo(relativePath) {
  try {
    const currentStat = await stat(path.join(repoRoot, relativePath));
    return {
      path: relativePath,
      exists: true,
      size_bytes: currentStat.size,
      modified_at: currentStat.mtime.toISOString(),
    };
  } catch {
    return {
      path: relativePath,
      exists: false,
      size_bytes: null,
      modified_at: null,
    };
  }
}

async function collectAuditorVisibility() {
  const packagePath = "tools/auditor/package.json";
  const packageFile = await fileInfo(packagePath);
  let packageMetadata = null;
  let packageReadError = null;

  if (packageFile.exists) {
    try {
      packageMetadata = JSON.parse(await readText(packagePath));
    } catch (error) {
      packageReadError = error.message;
    }
  }

  const expectedFiles = await Promise.all(
    expectedAuditorFiles.map(async (entry) => ({
      ...entry,
      ...(await fileInfo(entry.path)),
    })),
  );

  const references = (
    await Promise.all(
      auditorReferenceCandidates.map(async (relativePath) => {
        const info = await fileInfo(relativePath);
        return info.exists ? info : null;
      }),
    )
  ).filter(Boolean);

  const validationEvidence = references
    .filter((entry) => entry.path.startsWith("docs/validation/"))
    .sort((a, b) => String(b.modified_at).localeCompare(String(a.modified_at)));

  return {
    package_exists: packageFile.exists,
    package_path: packagePath,
    package_read_error: packageReadError,
    package_metadata: packageMetadata
      ? {
          name: packageMetadata.name || null,
          version: packageMetadata.version || null,
          private: packageMetadata.private === true,
          description: packageMetadata.description || null,
          type: packageMetadata.type || null,
        }
      : null,
    scripts: packageMetadata?.scripts || {},
    manual_commands: auditorCommands.filter((command) => command.command.includes("tools/auditor")),
    expected_files: expectedFiles,
    references,
    latest_validation_evidence: validationEvidence[0] || null,
    safety_notice:
      "Manual terminal use only. The dashboard displays command text and local metadata; it does not run shell commands, npm scripts, auditor decisions, or Git actions.",
  };
}

async function collectExternalExecutionContext() {
  const info = await fileInfo(externalExecutionContextPath);

  if (!info.exists) {
    return {
      exists: false,
      path: externalExecutionContextPath,
      values: {},
      items: [],
      source_note: "No manual external execution context file found.",
    };
  }

  const text = await readText(externalExecutionContextPath);
  const items = listItems(text);
  const values = {};

  for (const item of items) {
    const match = item.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    values[keyToSnakeCase(match[1])] = match[2].trim();
  }

  return {
    ...info,
    values,
    items,
    external_project: values.external_project || null,
    jira_cycle: values.jira_cycle || null,
    jira_card: values.jira_card || null,
    jira_status: values.jira_status || null,
    agent_status: values.agent_status || null,
    git_commit_push_validation: values.git_commit_push_validation || null,
    validation_gate: values.validation_gate || null,
    source_note: values.source_note || "Manual operator context, not API-synced.",
  };
}

async function collectState() {
  const [statusText, backlogText, opsBacklogText, sessionHandoffText] =
    await Promise.all([
      readText("STATUS.md"),
      readText("backlog.md"),
      readText("docs/ops/backlog.md"),
      readText("docs/ops/session-handoff.md"),
    ]);

  const operationalState = section(statusText, "Current state").split(/\r?\n/)[0]?.trim() || "UNKNOWN";
  const statusTask =
    section(statusText, "Active task").split(/\r?\n/)[0]?.trim() ||
    section(statusText, "Task").split(/\r?\n/)[0]?.trim() ||
    "No operational task recorded";
  const readyTasks = listItems(section(backlogText, "READY"));
  const reviewTasks = listItems(section(backlogText, "REVIEW"));
  const hasReadyTask = readyTasks.length > 0;
  const currentState = hasReadyTask ? "READY" : "NO_READY_TASK";
  const activeTask = hasReadyTask ? readyTasks[0] : "No active READY task recorded";
  const remoteDoneTasks = listItems(section(opsBacklogText, "Remote DONE")).slice(-12).reverse();
  const validationEvidence = await listValidationEvidence();
  const dashboardValidationExists = await exists("docs/validation/local-operator-dashboard-069a.md");
  const auditorVisibility = await collectAuditorVisibility();
  const externalExecutionContext = await collectExternalExecutionContext();

  return {
    generated_at: new Date().toISOString(),
    project: "RIC Studio",
    mode: "local-only read-only operator dashboard",
    current_state: currentState,
    active_task: activeTask,
    operational_state: operationalState,
    operational_task: statusTask,
    ready_tasks: readyTasks,
    review_task_count: reviewTasks.length,
    review_tasks_sample: reviewTasks.slice(0, 6),
    recent_remote_done: remoteDoneTasks,
    validation_evidence: validationEvidence,
    dashboard_validation_exists: dashboardValidationExists,
    external_execution_context: externalExecutionContext,
    auditor_visibility: auditorVisibility,
    auditor_package: {
      name: auditorVisibility.package_metadata?.name || null,
      private: auditorVisibility.package_metadata?.private === true,
      scripts: auditorVisibility.scripts,
    },
    commands: auditorCommands,
    allowed_actions: [
      "Read local operational docs.",
      "Run local auditor smoke commands.",
      "Run this local dashboard on localhost.",
      "Inspect validation evidence before the next gate.",
    ],
    blocked_actions: [
      "No file writes from the dashboard.",
      "No Git stage, commit, push, or automation.",
      "No deploy, hosting setup, CI, or external network action.",
      "No package.json, dependency, lockfile, UI framework, runtime, Ollama, model, prompt, evaluator, or fixture changes.",
      "No successor task opening from this dashboard.",
    ],
    next_gate:
      hasReadyTask
        ? "Work only on the currently READY task within accepted scope."
        : "Observation cycle: no READY task is active. Use Discussion Gate before opening the next task.",
    source_files: [
      "STATUS.md",
      "backlog.md",
      "docs/ops/backlog.md",
      "docs/ops/session-handoff.md",
      externalExecutionContextPath,
      "tools/auditor/package.json",
    ],
    handoff_summary: section(sessionHandoffText, "Current handoff state").split(/\r?\n/).slice(0, 6),
  };
}

function fileLink(relativePath) {
  return `/file?path=${encodeURIComponent(relativePath)}`;
}

function renderList(items, emptyText = "None recorded.") {
  if (!items.length) return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderLinkedList(items, emptyText = "None recorded.") {
  if (!items.length) return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  return `<ul>${items
    .map((item) => `<li><a href="${fileLink(item)}">${escapeHtml(item)}</a></li>`)
    .join("")}</ul>`;
}

function renderAuditorScripts(scripts) {
  const entries = Object.entries(scripts || {});
  if (!entries.length) return `<p class="muted">No auditor scripts found.</p>`;
  return `<table>
    <thead><tr><th>Script</th><th>Manual terminal command</th></tr></thead>
    <tbody>
      ${entries
        .map(
          ([name, script]) =>
            `<tr><td>${escapeHtml(name)}</td><td class="command">cmd /c npm --prefix tools/auditor run ${escapeHtml(
              name,
            )}<br><span class="muted">${escapeHtml(script)}</span></td></tr>`,
        )
        .join("")}
    </tbody>
  </table>`;
}

function renderExpectedFiles(files) {
  if (!files.length) return `<p class="muted">No expected auditor files configured.</p>`;
  return `<table>
    <thead><tr><th>Status</th><th>File</th><th>Purpose</th></tr></thead>
    <tbody>
      ${files
        .map(
          (file) =>
            `<tr><td>${file.exists ? "Present" : "Missing"}</td><td><a href="${file.exists ? fileLink(file.path) : "#"}">${escapeHtml(
              file.path,
            )}</a></td><td>${escapeHtml(file.purpose)}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>`;
}

function renderAuditorReferences(references) {
  if (!references.length) return `<p class="muted">No auditor references found.</p>`;
  return `<ul>${references
    .map((entry) => `<li><a href="${fileLink(entry.path)}">${escapeHtml(entry.path)}</a></li>`)
    .join("")}</ul>`;
}

function renderExternalExecutionContext(context) {
  if (!context?.exists) {
    return `<p class="muted">No manual external execution context file found.</p>`;
  }

  const rows = [
    ["External project", context.external_project],
    ["Jira cycle", context.jira_cycle],
    ["Jira card", context.jira_card],
    ["Jira status", context.jira_status],
    ["Agent status", context.agent_status],
    ["Git/commit/push validation", context.git_commit_push_validation],
    ["Validation gate", context.validation_gate],
    ["Source note", context.source_note],
  ];

  return `<table>
    <thead><tr><th>Field</th><th>Value</th></tr></thead>
    <tbody>
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value || "Not recorded.")}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <p class="muted">Source: <a href="${fileLink(context.path)}">${escapeHtml(context.path)}</a></p>`;
}

function renderHtml(state) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RIC Studio Operator Dashboard</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f7f4;
      --panel: #ffffff;
      --text: #1f2328;
      --muted: #626a73;
      --border: #d8d8d2;
      --accent: #2457a6;
      --ok: #126b43;
      --warn: #8a4b00;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.45;
    }
    header, main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
    header { padding: 28px 0 14px; }
    h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: 0; }
    h2 { margin: 0 0 12px; font-size: 18px; letter-spacing: 0; }
    p { margin: 0 0 10px; }
    code {
      background: #eeeeea;
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 5px;
      font-size: 13px;
    }
    a { color: var(--accent); }
    .notice {
      border: 1px solid var(--border);
      background: var(--panel);
      border-left: 4px solid var(--accent);
      padding: 12px 14px;
      border-radius: 6px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 14px;
      padding: 14px 0 32px;
    }
    .card {
      grid-column: span 6;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      min-width: 0;
    }
    .wide { grid-column: span 12; }
    .third { grid-column: span 4; }
    .metric {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 5px 10px;
      margin: 4px 6px 4px 0;
      background: #fafafa;
      font-size: 14px;
    }
    .state { color: var(--ok); font-weight: 700; }
    .muted { color: var(--muted); }
    .warn { color: var(--warn); font-weight: 700; }
    ul { margin: 0; padding-left: 19px; }
    li { margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; vertical-align: top; border-top: 1px solid var(--border); padding: 9px 8px; }
    th { color: var(--muted); font-weight: 700; font-size: 13px; }
    .command { overflow-wrap: anywhere; font-family: Consolas, "Courier New", monospace; font-size: 13px; }
    footer { color: var(--muted); font-size: 13px; padding: 0 0 28px; }
    @media (max-width: 760px) {
      header, main { width: min(100% - 20px, 1180px); }
      .card, .third { grid-column: span 12; }
      table, thead, tbody, tr, th, td { display: block; }
      th { padding-bottom: 2px; }
      td { border-top: 0; padding-top: 2px; }
      tr { border-top: 1px solid var(--border); padding: 8px 0; }
    }
  </style>
</head>
<body>
  <header>
    <h1>RIC Studio Operator Dashboard</h1>
    <div class="notice">
      <p><strong>Local-only and read-only.</strong> This dashboard reads repository docs and serves them on localhost. It does not write files, automate Git, deploy, call external services, install dependencies, or alter runtime/model assets.</p>
      <p class="muted">Generated from local files at ${escapeHtml(state.generated_at)}.</p>
    </div>
  </header>
  <main>
    <section class="grid">
      <article class="card wide">
        <h2>Current Project State</h2>
        <span class="metric">State: <span class="state">${escapeHtml(state.current_state)}</span></span>
        <span class="metric">Active task: ${escapeHtml(state.active_task)}</span>
        <span class="metric">Operational doc state: ${escapeHtml(state.operational_state)}</span>
        <span class="metric">Review queue entries: ${escapeHtml(state.review_task_count)}</span>
        <p class="muted">Product surface: RIC Studio is currently local protocol/tooling plus docs. The runnable surface is the local auditor and this local read-only dashboard, not a deployed web app.</p>
      </article>

      <article class="card third">
        <h2>Current READY Task</h2>
        ${renderList(state.ready_tasks, "No READY task recorded.")}
      </article>

      <article class="card third">
        <h2>Next Gate</h2>
        <p>${escapeHtml(state.next_gate)}</p>
        <p class="warn">The dashboard is read-only and does not authorize Git actions.</p>
      </article>

      <article class="card third">
        <h2>Validation Evidence</h2>
        ${renderLinkedList(state.validation_evidence, "No matching validation evidence found.")}
      </article>

      <article class="card wide">
        <h2>External Execution Context</h2>
        <p class="warn">Manual operator context only. This dashboard does not sync with Jira, GitHub, DayBudget, or the running agent.</p>
        ${renderExternalExecutionContext(state.external_execution_context)}
      </article>

      <article class="card wide">
        <h2>Available Local Commands</h2>
        <table>
          <thead><tr><th>Command</th><th>Purpose</th></tr></thead>
          <tbody>
            ${state.commands
              .map(
                (command) =>
                  `<tr><td class="command">${escapeHtml(command.command)}</td><td>${escapeHtml(command.purpose)}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </article>

      <article class="card wide">
        <h2>Auditor Visibility</h2>
        <p class="warn">${escapeHtml(state.auditor_visibility.safety_notice)}</p>
        <span class="metric">Auditor package: <span class="state">${state.auditor_visibility.package_exists ? "Present" : "Missing"}</span></span>
        <span class="metric">Package path: ${escapeHtml(state.auditor_visibility.package_path)}</span>
        ${
          state.auditor_visibility.package_metadata
            ? `<p>${escapeHtml(state.auditor_visibility.package_metadata.name || "Unnamed package")} ${escapeHtml(
                state.auditor_visibility.package_metadata.version || "",
              )} - ${escapeHtml(state.auditor_visibility.package_metadata.description || "No description.")}</p>`
            : `<p class="muted">Package metadata is not available.</p>`
        }
        <h3>Auditor Scripts</h3>
        ${renderAuditorScripts(state.auditor_visibility.scripts)}
        <h3>Manual Auditor Commands</h3>
        <table>
          <thead><tr><th>Command</th><th>Purpose</th></tr></thead>
          <tbody>
            ${state.auditor_visibility.manual_commands
              .map(
                (command) =>
                  `<tr><td class="command">${escapeHtml(command.command)}</td><td>${escapeHtml(command.purpose)}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
        <h3>Expected Auditor Files</h3>
        ${renderExpectedFiles(state.auditor_visibility.expected_files)}
        <h3>Auditor Docs And Evidence</h3>
        ${renderAuditorReferences(state.auditor_visibility.references)}
        ${
          state.auditor_visibility.latest_validation_evidence
            ? `<p class="muted">Latest known auditor validation evidence: <a href="${fileLink(
                state.auditor_visibility.latest_validation_evidence.path,
              )}">${escapeHtml(state.auditor_visibility.latest_validation_evidence.path)}</a></p>`
            : `<p class="muted">No auditor validation evidence found.</p>`
        }
      </article>

      <article class="card">
        <h2>Allowed Actions</h2>
        ${renderList(state.allowed_actions)}
      </article>

      <article class="card">
        <h2>Blocked Actions</h2>
        ${renderList(state.blocked_actions)}
      </article>

      <article class="card">
        <h2>Recent Remote DONE</h2>
        ${renderList(state.recent_remote_done)}
      </article>

      <article class="card">
        <h2>Source Files</h2>
        ${renderLinkedList(state.source_files)}
        <p><a href="/api/state">View raw dashboard JSON</a></p>
      </article>
    </section>
    <footer>
      Stop the dashboard with Ctrl+C in the terminal that started it.
    </footer>
  </main>
</body>
</html>`;
}

function send(response, statusCode, body, contentType) {
  response.writeHead(statusCode, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  response.end(body);
}

function safeRelativePath(requestedPath) {
  const relativePath = normalizeSlashes(requestedPath || "");
  if (relativePath.includes("..")) return null;
  if (!allowedFilePrefixes.some((prefix) => relativePath === prefix || relativePath.startsWith(prefix))) {
    return null;
  }
  const absolutePath = path.resolve(repoRoot, relativePath);
  if (!absolutePath.startsWith(repoRoot)) return null;
  return { relativePath, absolutePath };
}

async function handleRequest(incoming, response) {
  try {
    const currentUrl = new URL(incoming.url || "/", `http://${incoming.headers.host || "localhost"}`);

    if (incoming.method !== "GET") {
      send(response, 405, "Method not allowed", "text/plain; charset=utf-8");
      return;
    }

    if (currentUrl.pathname === "/") {
      const state = await collectState();
      send(response, 200, renderHtml(state), "text/html; charset=utf-8");
      return;
    }

    if (currentUrl.pathname === "/api/state") {
      const state = await collectState();
      send(response, 200, `${JSON.stringify(state, null, 2)}\n`, "application/json; charset=utf-8");
      return;
    }

    if (currentUrl.pathname === "/file") {
      const safePath = safeRelativePath(currentUrl.searchParams.get("path"));
      if (!safePath) {
        send(response, 404, "Not found", "text/plain; charset=utf-8");
        return;
      }
      const text = await readFile(safePath.absolutePath, "utf8");
      send(
        response,
        200,
        `# ${safePath.relativePath}\n\n${text}`,
        "text/plain; charset=utf-8",
      );
      return;
    }

    send(response, 404, "Not found", "text/plain; charset=utf-8");
  } catch (error) {
    send(response, 500, `Operator dashboard error: ${error.message}`, "text/plain; charset=utf-8");
  }
}

function fetchLocal(pathname) {
  return new Promise((resolve, reject) => {
    const req = request({ host: HOST, port, path: pathname, method: "GET" }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on("error", reject);
    req.end();
  });
}

async function runSmoke(server) {
  const [home, api] = await Promise.all([fetchLocal("/"), fetchLocal("/api/state")]);
  const state = JSON.parse(api.body);
  const checks = [
    ["home_status_200", home.statusCode === 200],
    ["api_status_200", api.statusCode === 200],
    ["home_mentions_dashboard", home.body.includes("RIC Studio Operator Dashboard")],
    ["home_mentions_read_only", home.body.includes("Local-only and read-only")],
    ["api_has_active_task", typeof state.active_task === "string" && state.active_task.length > 0],
    ["api_no_active_review_task_when_ready_empty", state.ready_tasks.length > 0 || !state.active_task.includes("REVIEW")],
    [
      "api_does_not_report_070a_active_after_remote_done",
      state.active_task !== "RIC-STUDIO-070A - Integrate Auditor Visibility Into Local Operator Dashboard",
    ],
    ["api_has_commands", Array.isArray(state.commands) && state.commands.length >= 4],
    ["api_blocks_writes", state.blocked_actions.some((action) => action.includes("No file writes"))],
    ["api_has_auditor_visibility", state.auditor_visibility?.package_exists === true],
    ["api_has_auditor_scripts", Object.keys(state.auditor_visibility?.scripts || {}).length > 0],
    ["home_mentions_auditor_visibility", home.body.includes("Auditor Visibility")],
    ["home_mentions_external_execution_context", home.body.includes("External Execution Context")],
    ["home_mentions_day_budget", home.body.includes("day-budget")],
    ["home_mentions_external_jira_cycle", home.body.includes("DAY-3 / WEB-023A")],
    ["api_has_external_execution_context", state.external_execution_context?.exists === true],
    ["api_external_context_mentions_day_budget", state.external_execution_context?.external_project === "day-budget"],
    ["api_external_context_mentions_jira_cycle", state.external_execution_context?.jira_cycle === "DAY-3 / WEB-023A"],
    ["api_external_context_mentions_in_progress", state.external_execution_context?.jira_status === "IN PROGRESS"],
  ];
  const failed = checks.filter(([, passed]) => !passed);
  const result = {
    smoke_result: failed.length === 0 ? "PASS" : "FAIL",
    url: `http://localhost:${port}`,
    checks: Object.fromEntries(checks),
    current_state: state.current_state,
    active_task: state.active_task,
    operational_state: state.operational_state,
    operational_task: state.operational_task,
    ready_tasks: state.ready_tasks,
    next_gate: state.next_gate,
    validation_evidence_count: state.validation_evidence.length,
    commands_count: state.commands.length,
    auditor_package_exists: state.auditor_visibility.package_exists,
    auditor_scripts: Object.keys(state.auditor_visibility.scripts),
    auditor_expected_files_count: state.auditor_visibility.expected_files.length,
    auditor_reference_count: state.auditor_visibility.references.length,
    external_execution_context: state.external_execution_context,
    dashboard_mode: state.mode,
  };
  console.log(JSON.stringify(result, null, 2));
  await new Promise((resolve) => server.close(resolve));
  if (failed.length > 0) process.exitCode = 1;
}

const server = createServer(handleRequest);

server.listen(port, HOST, async () => {
  if (isSmoke) {
    try {
      await runSmoke(server);
    } catch (error) {
      console.error(JSON.stringify({ smoke_result: "FAIL", error: error.message }, null, 2));
      await new Promise((resolve) => server.close(resolve));
      process.exitCode = 1;
    }
    return;
  }

  console.log(`RIC Studio Operator Dashboard: http://localhost:${port}`);
  console.log("Local-only and read-only. Press Ctrl+C to stop.");
});
