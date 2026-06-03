import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const WORKFLOW_NAME = "AUDITOR_READ_ONLY_SMOKE_WORKFLOW";
const AUTHORITY_RELATIVE_PATH = "tools/auditor/audit.mjs";
const WORKFLOW_BLOCKED_ACTIONS = [
  "git_write",
  "git_stage",
  "git_commit",
  "git_push",
  "file_edit",
  "deploy",
  "release",
  "local_done",
  "remote_done",
  "automation",
];
const WORKFLOW_DOES_NOT_DECIDE = [
  "commit",
  "push",
  "release",
  "Local DONE",
  "Remote DONE",
];

function parseArgs(argv) {
  const args = {
    evidencePath: null,
    errors: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--evidence") {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        args.errors.push("missing_evidence_argument_value");
      } else {
        args.evidencePath = value;
        index += 1;
      }
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      args.errors.push(`unknown_argument:${arg}`);
    }
  }

  if (!args.help && !args.evidencePath) {
    args.errors.push("missing_evidence_argument");
  }

  return args;
}

function decodeEvidence(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString("utf16le").replace(/^\uFEFF/, "");
  }

  return buffer.toString("utf8").replace(/^\uFEFF/, "");
}

function loadEvidence(evidencePath) {
  if (!evidencePath) {
    return {
      status: "blocked",
      detail: "No evidence path was provided.",
      rawEvidence: null,
    };
  }

  try {
    const buffer = readFileSync(evidencePath);

    return {
      status: "pass",
      detail: "Evidence file loaded for read-only smoke inspection.",
      rawEvidence: decodeEvidence(buffer),
    };
  } catch (error) {
    return {
      status: "blocked",
      detail: "Evidence file could not be read.",
      error: error.message,
      rawEvidence: null,
    };
  }
}

function parseEvidence(rawEvidence) {
  if (rawEvidence === null) {
    return {
      status: "blocked",
      detail: "Evidence parsing skipped because no raw evidence was loaded.",
      evidence: null,
    };
  }

  try {
    const evidence = JSON.parse(rawEvidence);

    if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
      return {
        status: "blocked",
        detail: "Evidence JSON parsed, but it is not a JSON object.",
        evidence: null,
      };
    }

    return {
      status: "pass",
      detail: "Evidence JSON parsed as an object.",
      evidence,
    };
  } catch (error) {
    return {
      status: "blocked",
      detail: "Evidence JSON parsing failed; deterministic authority remains responsible for the gate decision.",
      error: error.message,
      evidence: null,
    };
  }
}

async function runDeterministicAuthority(evidencePath) {
  const workflowDir = dirname(fileURLToPath(import.meta.url));
  const repositoryRoot = resolve(workflowDir, "..", "..");
  const authorityPath = resolve(repositoryRoot, AUTHORITY_RELATIVE_PATH);
  const authorityArgs = evidencePath
    ? [process.execPath, authorityPath, evidencePath]
    : [process.execPath, authorityPath];
  const originalArgv = process.argv;
  const originalWrite = process.stdout.write;
  let stdout = "";

  try {
    process.argv = authorityArgs;
    process.stdout.write = function captureWrite(chunk, encoding, callback) {
      const textEncoding = typeof encoding === "string" ? encoding : "utf8";

      stdout += Buffer.isBuffer(chunk) ? chunk.toString(textEncoding) : String(chunk);

      if (typeof encoding === "function") {
        encoding();
      } else if (typeof callback === "function") {
        callback();
      }

      return true;
    };

    const authorityUrl = pathToFileURL(authorityPath);
    authorityUrl.searchParams.set("smoke", String(Date.now()));

    await import(authorityUrl.href);

    let decision = null;
    let parseError = null;

    try {
      decision = JSON.parse(stdout);
    } catch (error) {
      parseError = error.message;
    }

    return {
      status: parseError ? "blocked" : "pass",
      detail: parseError
        ? "Deterministic authority ran, but its output was not valid JSON."
        : "Deterministic authority executed successfully.",
      authority: AUTHORITY_RELATIVE_PATH,
      authority_mode: "in_process_cli_module_with_captured_stdout",
      cli_shape_limitation:
        "audit.mjs is CLI-shaped and reads process.argv at module scope, so this workflow uses a temporary argv/stdout capture shim instead of replacing or reimplementing the authority decision logic.",
      stdout: stdout.trim(),
      decision,
      parse_error: parseError,
    };
  } catch (error) {
    return {
      status: "blocked",
      detail: "Deterministic authority could not be executed; audit.mjs remains the required authority and was not replaced.",
      authority: AUTHORITY_RELATIVE_PATH,
      authority_mode: "in_process_cli_module_with_captured_stdout",
      cli_shape_limitation:
        "audit.mjs is CLI-shaped and reads process.argv at module scope. If that direct execution becomes unsafe or incompatible, this workflow must preserve audit.mjs as authority and report the limitation rather than reimplementing decisions.",
      exit_code: error.status ?? null,
      stdout: stdout.trim(),
      stderr: error.message,
      decision: null,
    };
  } finally {
    process.argv = originalArgv;
    process.stdout.write = originalWrite;
  }
}

function relativeEvidencePath(evidencePath) {
  if (!evidencePath) {
    return null;
  }

  const relativePath = relative(process.cwd(), resolve(evidencePath));

  return relativePath && !relativePath.startsWith("..") ? relativePath : evidencePath;
}

function formatReport({ args, loadStep, parseStep, authorityStep }) {
  const parsedEvidence = parseStep.evidence;
  const authorityDecision = authorityStep.decision;
  const taskId =
    (parsedEvidence && typeof parsedEvidence.task_id === "string" && parsedEvidence.task_id) ||
    (authorityDecision && typeof authorityDecision.task_id === "string" && authorityDecision.task_id) ||
    null;
  const requestedGate =
    (parsedEvidence &&
      typeof parsedEvidence.requested_gate === "string" &&
      parsedEvidence.requested_gate) ||
    (authorityDecision &&
      typeof authorityDecision.requested_gate === "string" &&
      authorityDecision.requested_gate) ||
    null;

  return {
    workflow: WORKFLOW_NAME,
    workflow_version: 1,
    dependency_free: true,
    node_builtins_only: true,
    langgraph_imported: false,
    evidence_path: relativeEvidencePath(args.evidencePath),
    task_id: taskId,
    requested_gate: requestedGate,
    read_only: true,
    human_gate_required: true,
    human_gate_statement:
      "Human review remains mandatory. This smoke workflow does not authorize commit, push, release, Local DONE, or Remote DONE.",
    deterministic_authority: {
      path: AUTHORITY_RELATIVE_PATH,
      status: "preserved",
      role: "final deterministic auditor decision authority",
      workflow_authority_boundary:
        "The smoke workflow reports the authority output but does not replace it or self-authorize lifecycle actions.",
    },
    steps: [
      {
        name: "load_evidence",
        status: loadStep.status,
        detail: loadStep.detail,
        error: loadStep.error ?? null,
      },
      {
        name: "parse_evidence",
        status: parseStep.status,
        detail: parseStep.detail,
        error: parseStep.error ?? null,
      },
      {
        name: "deterministic_auditor_authority",
        status: authorityStep.status,
        detail: authorityStep.detail,
        authority: authorityStep.authority,
        authority_mode: authorityStep.authority_mode,
        cli_shape_limitation: authorityStep.cli_shape_limitation,
        decision: authorityStep.decision,
        parse_error: authorityStep.parse_error ?? null,
        exit_code: authorityStep.exit_code ?? 0,
      },
      {
        name: "format_smoke_report",
        status: "pass",
        detail:
          "Formatted a read-only smoke report with mandatory human gate and explicit blocked automation boundaries.",
      },
    ],
    workflow_result: "SMOKE_REPORT_ONLY",
    workflow_allowed_actions: ["read_evidence", "parse_evidence", "run_audit_authority", "print_report"],
    workflow_blocked_actions: WORKFLOW_BLOCKED_ACTIONS,
    workflow_does_not_decide: WORKFLOW_DOES_NOT_DECIDE,
    recommendation:
      "Review the deterministic auditor decision and current repository evidence manually before any scoped commit request.",
  };
}

function printHelp() {
  process.stdout.write(
    [
      "Usage: node tools/auditor/smoke-workflow.mjs --evidence <path>",
      "",
      "Runs a dependency-free read-only auditor smoke workflow.",
      "The deterministic authority remains tools/auditor/audit.mjs.",
      "The human gate remains mandatory.",
      "",
    ].join("\n")
  );
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exitCode = 0;
} else {
  const loadStep = loadEvidence(args.evidencePath);
  const parseStep = parseEvidence(loadStep.rawEvidence);
  const authorityStep = await runDeterministicAuthority(args.evidencePath);
  const report = formatReport({ args, loadStep, parseStep, authorityStep });

  if (args.errors.length > 0) {
    report.argument_errors = args.errors;
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = authorityStep.status === "pass" ? 0 : 1;
}
