import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");

export const REGISTERED_JIRA_PROJECTS = [
  { key: "RT", name: "Rick Travel" },
  { key: "DAY", name: "DayBudget" },
  { key: "RIC", name: "RIC Studio" },
];

export const JIRA_READ_FIELDS = [
  "project",
  "summary",
  "status",
  "issuetype",
  "parent",
  "assignee",
  "labels",
  "created",
  "updated",
  "customfield_10014",
  "customfield_10020",
];

const REQUIRED_ENV = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN"];
const DEFAULT_CACHE_PATH = "var/jira-live-state.json";
const DEFAULT_INTERVAL_MS = 30_000;
const DEFAULT_STALE_AFTER_MS = 90_000;
const DEFAULT_MAX_RESULTS = 100;
const SECRET_VALUE_PATTERN = /(JIRA_API_TOKEN|JIRA_BASE_URL|JIRA_EMAIL|Authorization:|Basic\s+[A-Za-z0-9+/=]+|password\s*=|token\s*=|secret\s*=|https?:\/\/[^/\s]+@)/i;

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizeStatusToken(value) {
  return normalizeString(value).toUpperCase().replace(/[\s/-]+/g, "_").replace(/^_+|_+$/g, "");
}

function projectOrder(key) {
  const index = REGISTERED_JIRA_PROJECTS.findIndex((project) => project.key === key);
  return index === -1 ? REGISTERED_JIRA_PROJECTS.length : index;
}

function issueNumber(key) {
  const match = normalizeString(key).match(/-(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function projectConfig(projectKey) {
  return REGISTERED_JIRA_PROJECTS.find((project) => project.key === projectKey) || null;
}

export function registeredJiraProjectKeys() {
  return REGISTERED_JIRA_PROJECTS.map((project) => project.key);
}

export function isRegisteredJiraProjectKey(projectKey) {
  return Boolean(projectConfig(normalizeString(projectKey)));
}

export function registeredJiraProject(projectKey) {
  return projectConfig(normalizeString(projectKey));
}

export function jiraProjectKeyFromIssueKey(issueKey) {
  const match = normalizeString(issueKey).match(/^([A-Z][A-Z0-9]+)-\d+$/);
  return match ? match[1] : "";
}

function resolveRepoPath(relativePath) {
  return path.isAbsolute(relativePath) ? relativePath : path.join(repoRoot, relativePath);
}

function relativeRepoPath(absolutePath) {
  return path.relative(repoRoot, absolutePath).replace(/\\/g, "/");
}

function missingEnvironment(env) {
  return REQUIRED_ENV.filter((name) => !normalizeString(env[name]));
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  if (url.username || url.password) {
    throw new Error("Jira base URL must not contain username or password.");
  }
  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/+$/, "");
}

function buildAuthHeader(email, token) {
  return `Basic ${Buffer.from(`${email}:${token}`, "utf8").toString("base64")}`;
}

export function normalizeJiraStatus(statusName) {
  const normalized = normalizeStatusToken(statusName);
  if (normalized === "BACKLOG_READY" || normalized === "READY") return "READY";
  if (normalized === "IN_PROGRESS") return "IN_PROGRESS";
  if (normalized === "REVIEW") return "REVIEW";
  if (normalized === "DONE" || normalized === "REMOTE_DONE") return "DONE";
  return "UNKNOWN";
}

export function buildJiraSearchRequest({ env, maxResults = DEFAULT_MAX_RESULTS, startAt = 0 } = {}) {
  const baseUrl = normalizeBaseUrl(env.JIRA_BASE_URL);
  const jql = `project in (${REGISTERED_JIRA_PROJECTS.map((project) => project.key).join(", ")}) ORDER BY project ASC, key ASC`;
  const params = new URLSearchParams({
    jql,
    startAt: String(startAt),
    maxResults: String(maxResults),
    fields: JIRA_READ_FIELDS.join(","),
  });

  return {
    method: "GET",
    endpoint_path: "/rest/api/3/search/jql",
    url: `${baseUrl}/rest/api/3/search/jql?${params.toString()}`,
    jql,
    fields: [...JIRA_READ_FIELDS],
  };
}

function parseSprintValue(value) {
  if (!value) return [];
  const entries = Array.isArray(value) ? value : [value];
  return entries.map((entry) => {
    if (entry && typeof entry === "object") {
      return {
        id: entry.id ?? null,
        name: entry.name || null,
        state: entry.state || null,
      };
    }

    const text = normalizeString(entry);
    const name = text.match(/name=([^,\]]+)/)?.[1] || text || null;
    const id = text.match(/id=([^,\]]+)/)?.[1] || null;
    const state = text.match(/state=([^,\]]+)/)?.[1] || null;
    return { id, name, state };
  }).filter((entry) => entry.name || entry.id || entry.state);
}

export function normalizeJiraIssue(issue) {
  const key = normalizeString(issue?.key);
  const fields = issue?.fields || {};
  const projectKey = normalizeString(fields.project?.key || key.split("-")[0]);
  const registeredProject = projectConfig(projectKey);
  if (!key || !registeredProject) return null;

  const jiraStatus = normalizeString(fields.status?.name);
  const lifecycleStatus = normalizeJiraStatus(jiraStatus);
  const parent = fields.parent
    ? {
        key: normalizeString(fields.parent.key) || null,
        summary: normalizeString(fields.parent.fields?.summary) || null,
      }
    : null;
  const epicKey = normalizeString(fields.customfield_10014) || null;

  return {
    id: key,
    issue_key: key,
    project_key: projectKey,
    project_name: normalizeString(fields.project?.name) || registeredProject.name,
    summary: normalizeString(fields.summary),
    jira_status: jiraStatus || null,
    jira_status_id: normalizeString(fields.status?.id) || null,
    lifecycle_status: lifecycleStatus,
    status_mapping_known: lifecycleStatus !== "UNKNOWN",
    issue_type: normalizeString(fields.issuetype?.name) || null,
    parent,
    epic_key: epicKey,
    parent_or_epic: parent?.key || epicKey || null,
    sprint: parseSprintValue(fields.customfield_10020),
    assignee_display_name: normalizeString(fields.assignee?.displayName) || null,
    labels: Array.isArray(fields.labels) ? fields.labels.map(normalizeString).filter(Boolean) : [],
    created: normalizeString(fields.created) || null,
    updated: normalizeString(fields.updated) || null,
  };
}

export function normalizeJiraIssues(issues) {
  const byKey = new Map();
  const duplicates = [];

  for (const issue of issues || []) {
    const normalized = normalizeJiraIssue(issue);
    if (!normalized) continue;
    if (byKey.has(normalized.issue_key)) {
      duplicates.push(normalized.issue_key);
      continue;
    }
    byKey.set(normalized.issue_key, normalized);
  }

  const normalized = [...byKey.values()].sort((left, right) => {
    const projectDiff = projectOrder(left.project_key) - projectOrder(right.project_key);
    if (projectDiff !== 0) return projectDiff;
    return issueNumber(left.issue_key) - issueNumber(right.issue_key) || left.issue_key.localeCompare(right.issue_key);
  });

  return {
    issues: normalized,
    duplicate_issue_keys_prevented: [...new Set(duplicates)].sort(),
  };
}

export function groupIssuesByProject(issues) {
  return REGISTERED_JIRA_PROJECTS.map((project) => ({
    project_key: project.key,
    project_name: project.name,
    issues: issues.filter((issue) => issue.project_key === project.key),
  }));
}

export function sanitizeJiraError(error, env = {}) {
  let message = normalizeString(error?.message || error || "Unknown Jira synchronization error.");
  for (const name of REQUIRED_ENV) {
    const value = normalizeString(env[name]);
    if (value) message = message.split(value).join("[redacted]");
  }
  message = message
    .replace(/Authorization:\s*Basic\s+[A-Za-z0-9+/=]+/gi, "Authorization: [redacted]")
    .replace(/Basic\s+[A-Za-z0-9+/=]+/gi, "Basic [redacted]")
    .replace(/https?:\/\/[^/\s]+@/gi, "https://[redacted]@");

  if (SECRET_VALUE_PATTERN.test(message)) {
    return "Jira synchronization failed with a sanitized error.";
  }
  return message || "Jira synchronization failed.";
}

function baseSnapshot({ now = new Date(), cachePath = DEFAULT_CACHE_PATH } = {}) {
  return {
    source: "jira_read_only_api",
    mode: "read_only_visibility_sync",
    registered_projects: REGISTERED_JIRA_PROJECTS,
    requested_fields: ["issue_key", ...JIRA_READ_FIELDS],
    endpoint_path: "/rest/api/3/search/jql",
    http_methods_used: ["GET"],
    cache_path: relativeRepoPath(resolveRepoPath(cachePath)),
    last_attempt_at: now.toISOString(),
    last_successful_synchronization_at: null,
    last_synchronization_error: null,
    stale_state_warning: false,
    cached_data_shown: false,
    cache_available: false,
    issue_count: 0,
    duplicate_issue_keys_prevented: [],
    issues: [],
    grouped_by_project: groupIssuesByProject([]),
    jira_write_performed: false,
    full_sync_performed: false,
    create_issue_performed: false,
    bulk_operation_performed: false,
    secrets_printed: false,
  };
}

async function readCache(cachePath) {
  const absolutePath = resolveRepoPath(cachePath);
  const text = await readFile(absolutePath, "utf8");
  return JSON.parse(text);
}

async function writeCache(cachePath, snapshot) {
  const absolutePath = resolveRepoPath(cachePath);
  const cache = {
    schemaVersion: 1,
    generated_at: snapshot.last_successful_synchronization_at,
    source: snapshot.source,
    registered_projects: snapshot.registered_projects,
    issues: snapshot.issues,
    duplicate_issue_keys_prevented: snapshot.duplicate_issue_keys_prevented,
  };
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

function snapshotFromCache({ cache, now, cachePath, errorMessage, staleAfterMs }) {
  const issues = Array.isArray(cache.issues) ? cache.issues : [];
  const lastSuccess = normalizeString(cache.generated_at) || null;
  const stale = lastSuccess ? now.getTime() - Date.parse(lastSuccess) > staleAfterMs : false;

  return {
    ...baseSnapshot({ now, cachePath }),
    last_successful_synchronization_at: lastSuccess,
    last_synchronization_error: errorMessage,
    stale_state_warning: stale,
    cached_data_shown: true,
    cache_available: true,
    issue_count: issues.length,
    duplicate_issue_keys_prevented: Array.isArray(cache.duplicate_issue_keys_prevented)
      ? cache.duplicate_issue_keys_prevented
      : [],
    issues,
    grouped_by_project: groupIssuesByProject(issues),
  };
}

async function fetchJiraIssues({ env, fetchImpl, maxResults, requestTimeoutMs }) {
  const request = buildJiraSearchRequest({ env, maxResults });
  const signal = typeof AbortSignal !== "undefined" && AbortSignal.timeout
    ? AbortSignal.timeout(requestTimeoutMs)
    : undefined;
  const response = await fetchImpl(request.url, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
      Authorization: buildAuthHeader(env.JIRA_EMAIL, env.JIRA_API_TOKEN),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`Read-only Jira synchronization failed with HTTP ${response.status}.`);
  }
  return Array.isArray(body.issues) ? body.issues : [];
}

export async function synchronizeJiraReadState({
  env = process.env,
  fetchImpl = globalThis.fetch,
  cachePath = DEFAULT_CACHE_PATH,
  now = new Date(),
  staleAfterMs = DEFAULT_STALE_AFTER_MS,
  maxResults = DEFAULT_MAX_RESULTS,
  requestTimeoutMs = 8_000,
} = {}) {
  const base = baseSnapshot({ now, cachePath });
  const missing = missingEnvironment(env);

  if (missing.length > 0 || typeof fetchImpl !== "function") {
    const errorMessage = missing.length > 0
      ? "Missing required Jira environment configuration."
      : "Jira fetch implementation is unavailable.";
    try {
      const cache = await readCache(cachePath);
      return snapshotFromCache({ cache, now, cachePath, errorMessage, staleAfterMs });
    } catch {
      return {
        ...base,
        last_synchronization_error: errorMessage,
      };
    }
  }

  try {
    const rawIssues = await fetchJiraIssues({ env, fetchImpl, maxResults, requestTimeoutMs });
    const { issues, duplicate_issue_keys_prevented: duplicateKeys } = normalizeJiraIssues(rawIssues);
    const snapshot = {
      ...base,
      last_successful_synchronization_at: now.toISOString(),
      issue_count: issues.length,
      duplicate_issue_keys_prevented: duplicateKeys,
      issues,
      grouped_by_project: groupIssuesByProject(issues),
    };
    await writeCache(cachePath, snapshot);
    return snapshot;
  } catch (error) {
    const errorMessage = sanitizeJiraError(error, env);
    try {
      const cache = await readCache(cachePath);
      return snapshotFromCache({ cache, now, cachePath, errorMessage, staleAfterMs });
    } catch {
      return {
        ...base,
        last_synchronization_error: errorMessage,
      };
    }
  }
}

export function createJiraReadSyncManager({
  intervalMs = DEFAULT_INTERVAL_MS,
  cachePath = DEFAULT_CACHE_PATH,
  env = process.env,
  fetchImpl = globalThis.fetch,
  staleAfterMs = DEFAULT_STALE_AFTER_MS,
  now = () => new Date(),
} = {}) {
  let snapshot = baseSnapshot({ now: now(), cachePath });
  let timer = null;
  let running = null;

  async function syncOnce() {
    running = synchronizeJiraReadState({ env, fetchImpl, cachePath, now: now(), staleAfterMs });
    snapshot = await running;
    running = null;
    return snapshot;
  }

  async function start() {
    await syncOnce();
    if (!timer) {
      timer = setInterval(() => {
        syncOnce().catch((error) => {
          snapshot = {
            ...snapshot,
            last_attempt_at: now().toISOString(),
            last_synchronization_error: sanitizeJiraError(error, env),
          };
        });
      }, intervalMs);
      timer.unref?.();
    }
    return snapshot;
  }

  async function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    if (running) {
      try {
        await running;
      } catch {
        // Snapshot already records sanitized sync failures.
      }
    }
  }

  return {
    start,
    stop,
    syncOnce,
    getSnapshot: () => snapshot,
  };
}
