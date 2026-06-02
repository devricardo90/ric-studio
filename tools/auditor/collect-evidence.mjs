import { spawnSync } from "node:child_process";

const GIT_EXECUTABLE = process.platform === "win32" ? "git.exe" : "git";

const READ_ONLY_GIT_COMMANDS = [
  ["git", ["status", "--short", "--untracked-files=all"]],
  ["git", ["status", "-sb"]],
  ["git", ["rev-parse", "HEAD"]],
  ["git", ["rev-parse", "origin/main"]],
  ["git", ["diff", "--stat"]],
  ["git", ["diff", "--check"]],
  ["git", ["diff", "--name-only"]],
];

const BLOCKED_ACTIONS = [
  "git add",
  "git commit",
  "git push",
  "git reset",
  "git checkout",
  "git clean",
  "file deletion",
  "automatic file modification",
  "github api",
];

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--task") {
      parsed.task = argv[index + 1];
      index += 1;
    } else if (arg === "--gate") {
      parsed.gate = argv[index + 1];
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else {
      parsed.unknown = arg;
    }
  }

  return parsed;
}

function usage() {
  return [
    "Usage:",
    "  node tools/auditor/collect-evidence.mjs --task RIC-STUDIO-045A --gate commit",
  ].join("\n");
}

function runGit(args) {
  const result = spawnSync(GIT_EXECUTABLE, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });

  return {
    command: ["git", ...args].join(" "),
    exit_code: typeof result.status === "number" ? result.status : null,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : null,
  };
}

function outputFor(commandResult) {
  return commandResult.stdout;
}

function cleanLines(value) {
  return String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseStatusPaths(statusShort) {
  return String(statusShort)
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const path = line.length > 3 ? line.slice(3).trim() : line.trim();
      const renameTarget = path.includes(" -> ") ? path.split(" -> ").pop() : path;

      return renameTarget.trim();
    })
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function repositoryState(statusShort, statusSb, head, originMain, diffCheck) {
  const changedFiles = parseStatusPaths(statusShort.stdout);

  return {
    branch_status: statusSb.stdout.trim(),
    has_working_tree_changes: changedFiles.length > 0,
    changed_file_count: changedFiles.length,
    head_available: head.exit_code === 0 && Boolean(head.stdout.trim()),
    origin_main_available: originMain.exit_code === 0 && Boolean(originMain.stdout.trim()),
    head_equals_origin_main:
      head.exit_code === 0 &&
      originMain.exit_code === 0 &&
      head.stdout.trim() === originMain.stdout.trim(),
    diff_check_clean: diffCheck.exit_code === 0,
  };
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  process.stdout.write(`${usage()}\n`);
  process.exit(0);
}

if (!args.task || !args.gate || args.unknown) {
  process.stderr.write(`${usage()}\n`);
  process.exit(1);
}

const commandResults = new Map(
  READ_ONLY_GIT_COMMANDS.map(([command, commandArgs]) => {
    const result = command === "git" ? runGit(commandArgs) : null;

    return [[command, ...commandArgs].join(" "), result];
  })
);

const gitStatusShort = commandResults.get("git status --short --untracked-files=all");
const gitStatusSb = commandResults.get("git status -sb");
const head = commandResults.get("git rev-parse HEAD");
const originMain = commandResults.get("git rev-parse origin/main");
const diffStat = commandResults.get("git diff --stat");
const diffCheck = commandResults.get("git diff --check");
const diffNameOnly = commandResults.get("git diff --name-only");

const evidence = {
  task_id: args.task,
  requested_gate: args.gate,
  collected_at: new Date().toISOString(),
  repository_state: repositoryState(gitStatusShort, gitStatusSb, head, originMain, diffCheck),
  git_status_short: outputFor(gitStatusShort),
  git_status_sb: outputFor(gitStatusSb),
  head: head.stdout.trim(),
  origin_main: originMain.stdout.trim(),
  diff_stat: outputFor(diffStat),
  diff_check: `${diffCheck.stdout}${diffCheck.stderr}`,
  git_diff_stat: outputFor(diffStat),
  git_diff_check: `${diffCheck.stdout}${diffCheck.stderr}`,
  changed_files: unique([
    ...parseStatusPaths(outputFor(gitStatusShort)),
    ...cleanLines(outputFor(diffNameOnly)),
  ]),
  evidence_source: {
    type: "local_read_only_git",
    collector: "tools/auditor/collect-evidence.mjs",
    commands: Object.fromEntries(commandResults),
    writes_files: false,
    uses_shell: false,
  },
  human_review_required: true,
  blocked_actions: BLOCKED_ACTIONS,
  allowed_actions: ["read_only_git_evidence_collection"],
  summary:
    "Read-only local Git evidence package collected for auditor input. This collector is not an authority and does not authorize commit, push, or Remote DONE.",
};

process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
