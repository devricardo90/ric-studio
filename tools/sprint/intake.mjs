#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const defaultRegistryPath = "docs/ops/sprint-task-registry.json";

const LIFECYCLE_STATUSES = new Set([
  "DRAFT",
  "READY",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "BLOCKED",
  "FAILED",
]);

const PROTOCOL_LEVELS = new Set(["LEAN_LEVEL_1", "LEAN_LEVEL_2", "FULL_LEVEL_3"]);

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

function normalizeStatus(value) {
  return String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function normalizeProtocolLevel(value) {
  return String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function normalizeString(value) {
  return String(value || "").trim();
}

function idempotencyKey(task) {
  return `${normalizeString(task.project).toLowerCase()}::${normalizeString(task.taskKey).toLowerCase()}`;
}

function requireField(task, field) {
  if (!normalizeString(task[field])) {
    throw new Error(`Task config requires ${field}.`);
  }
}

function normalizeStringArray(value, field) {
  if (!Array.isArray(value)) {
    throw new Error(`Task config ${field} must be an array.`);
  }
  return value.map((item) => normalizeString(item)).filter(Boolean);
}

function normalizeTask(input) {
  for (const field of ["project", "sprint", "taskKey", "title"]) {
    requireField(input, field);
  }

  const status = normalizeStatus(input.status || input.initialStatus);
  if (!LIFECYCLE_STATUSES.has(status)) {
    throw new Error(`Unsupported lifecycle status: ${input.status || input.initialStatus}`);
  }

  const protocolLevel = normalizeProtocolLevel(input.protocolLevel || input.risk);
  if (!PROTOCOL_LEVELS.has(protocolLevel)) {
    throw new Error(`Unsupported protocol level: ${input.protocolLevel || input.risk}`);
  }

  return {
    project: normalizeString(input.project),
    sprint: normalizeString(input.sprint),
    taskKey: normalizeString(input.taskKey),
    title: normalizeString(input.title),
    risk: normalizeString(input.risk || protocolLevel),
    protocolLevel,
    status,
    allowedScope: normalizeStringArray(input.allowedScope || [], "allowedScope"),
    blockedScope: normalizeStringArray(input.blockedScope || [], "blockedScope"),
    jiraIssueKey: input.jiraIssueKey ? normalizeString(input.jiraIssueKey) : null,
    jiraIssueUrl: input.jiraIssueUrl ? normalizeString(input.jiraIssueUrl) : null,
    jiraSyncStatus: normalizeString(input.jiraSyncStatus || "MANUAL_DRY_RUN"),
    jiraLastSyncAt: input.jiraLastSyncAt ? normalizeString(input.jiraLastSyncAt) : null,
    jiraDryRun: input.jiraDryRun || {
      mode: "manual_dry_run",
      reason: "No approved Jira API synchronization path is configured.",
      payload: {},
      comment: "Manual Jira mirror action required.",
    },
    evidence: input.evidence || {
      validationCommands: [],
      smokeResult: "PENDING",
      commitHash: null,
      pushConfirmation: "not pushed",
      notes: "",
    },
  };
}

function newRegistry() {
  return {
    schemaVersion: 1,
    sourceOfTruth: "RIC Studio",
    jiraMode: "manual_dry_run_unless_explicitly_approved",
    lifecycleStatuses: [...LIFECYCLE_STATUSES],
    protocolLevels: [...PROTOCOL_LEVELS],
    idempotencyRule: "same project + taskKey updates or reuses the existing task record",
    tasks: [],
  };
}

async function readJson(relativePath, fallback = null) {
  const absolutePath = path.join(repoRoot, relativePath);
  try {
    return JSON.parse(await readFile(absolutePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback) return fallback;
    throw error;
  }
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function writeJson(relativePath, value) {
  const absolutePath = path.join(repoRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, stableJson(value), "utf8");
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (!args.config) {
      throw new Error("Missing required --config.");
    }

    const registryPath = args.registry || defaultRegistryPath;
    const task = normalizeTask(await readJson(args.config));
    const registry = await readJson(registryPath, newRegistry());
    if (!Array.isArray(registry.tasks)) {
      throw new Error("Registry tasks must be an array.");
    }

    const key = idempotencyKey(task);
    const existingIndex = registry.tasks.findIndex((candidate) => idempotencyKey(candidate) === key);
    const before = stableJson(registry);

    if (existingIndex === -1) {
      registry.tasks.push(task);
    } else {
      registry.tasks[existingIndex] = {
        ...registry.tasks[existingIndex],
        ...task,
      };
    }

    registry.tasks.sort((left, right) => idempotencyKey(left).localeCompare(idempotencyKey(right)));
    const after = stableJson(registry);
    const changed = before !== after;
    if (changed) {
      await writeJson(registryPath, registry);
    }

    console.log(JSON.stringify({
      tool: "ric-studio-sprint-intake",
      result: "OK",
      registry: registryPath,
      project: task.project,
      taskKey: task.taskKey,
      status: task.status,
      protocolLevel: task.protocolLevel,
      created: existingIndex === -1,
      reusedExistingRecord: existingIndex !== -1,
      changed,
      duplicatePrevented: existingIndex !== -1,
      taskCount: registry.tasks.length,
      jiraMode: registry.jiraMode,
      jiraIssueKey: task.jiraIssueKey,
      jiraSyncStatus: task.jiraSyncStatus,
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      tool: "ric-studio-sprint-intake",
      result: "BLOCKED",
      error: error.message,
    }, null, 2));
    process.exitCode = 1;
  }
}

main();
