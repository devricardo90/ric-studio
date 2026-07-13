import assert from "node:assert/strict";
import { mkdir, readFile, rm } from "node:fs/promises";
import test from "node:test";
import {
  buildJiraSearchRequest,
  createJiraReadSyncManager,
  normalizeJiraIssues,
  normalizeJiraStatus,
  sanitizeJiraError,
  synchronizeJiraReadState,
} from "./read-sync.mjs";

const env = {
  JIRA_BASE_URL: "https://jira.example.invalid",
  JIRA_EMAIL: "operator@example.invalid",
  JIRA_API_TOKEN: "synthetic-token-value",
};

function cachePath(name) {
  return `var/test-jira-live-state-${process.pid}-${name}.json`;
}

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  };
}

function issue({
  key,
  projectKey,
  projectName,
  summary = "Summary",
  status = "Backlog / Ready",
  issueType = "Task",
  parent = null,
  epic = null,
  sprint = null,
  assignee = "Ricardo",
  labels = ["ops"],
  created = "2026-07-13T10:00:00.000+0200",
  updated = "2026-07-13T11:00:00.000+0200",
}) {
  return {
    key,
    fields: {
      project: { key: projectKey, name: projectName },
      summary,
      status: { id: "10000", name: status },
      issuetype: { name: issueType },
      parent,
      customfield_10014: epic,
      customfield_10020: sprint,
      assignee: assignee ? { displayName: assignee } : null,
      labels,
      created,
      updated,
    },
  };
}

test("builds a GET-only registered-project Jira search request with dashboard fields", () => {
  const request = buildJiraSearchRequest({ env });
  const url = new URL(request.url);

  assert.equal(request.method, "GET");
  assert.equal(request.endpoint_path, "/rest/api/3/search/jql");
  assert.equal(url.pathname, "/rest/api/3/search/jql");
  assert.equal(url.searchParams.get("jql"), "project in (RT, DAY, RIC) ORDER BY project ASC, key ASC");
  assert.equal(url.searchParams.get("fields"), "project,summary,status,issuetype,parent,assignee,labels,created,updated,customfield_10014,customfield_10020");
  assert.doesNotMatch(request.url, /synthetic-token-value|operator@example.invalid|Authorization|Basic/i);
});

test("normalizes lifecycle statuses without mapping unknown statuses to DONE", () => {
  assert.equal(normalizeJiraStatus("Backlog / Ready"), "READY");
  assert.equal(normalizeJiraStatus("Ready"), "READY");
  assert.equal(normalizeJiraStatus("In Progress"), "IN_PROGRESS");
  assert.equal(normalizeJiraStatus("Review"), "REVIEW");
  assert.equal(normalizeJiraStatus("DONE"), "DONE");
  assert.equal(normalizeJiraStatus("Remote DONE"), "DONE");
  assert.equal(normalizeJiraStatus("QA Accepted"), "UNKNOWN");
});

test("normalizes Jira issues, filters unregistered projects, and prevents duplicate issue keys", () => {
  const normalized = normalizeJiraIssues([
    issue({ key: "DAY-2", projectKey: "DAY", projectName: "DayBudget", status: "Remote DONE" }),
    issue({ key: "DAY-2", projectKey: "DAY", projectName: "DayBudget", status: "Review" }),
    issue({ key: "RT-1", projectKey: "RT", projectName: "Rick Travel", status: "In Progress" }),
    issue({ key: "RIC-4", projectKey: "RIC", projectName: "RIC Studio", status: "QA Accepted" }),
    issue({ key: "ABC-1", projectKey: "ABC", projectName: "Other", status: "DONE" }),
  ]);

  assert.deepEqual(normalized.issues.map((entry) => entry.issue_key), ["RT-1", "DAY-2", "RIC-4"]);
  assert.deepEqual(normalized.duplicate_issue_keys_prevented, ["DAY-2"]);
  assert.equal(normalized.issues.find((entry) => entry.issue_key === "DAY-2").lifecycle_status, "DONE");
  assert.equal(normalized.issues.find((entry) => entry.issue_key === "RIC-4").lifecycle_status, "UNKNOWN");
  assert.equal(normalized.issues.find((entry) => entry.issue_key === "RIC-4").status_mapping_known, false);
});

test("successful synchronization writes and verifies runtime cache with read-only flags", async () => {
  const testCache = cachePath("success");
  await rm(testCache, { force: true });
  const methods = [];
  const fetchImpl = async (url, options) => {
    methods.push(options.method);
    assert.match(url, /project\+in\+%28RT%2C\+DAY%2C\+RIC%29|project\+in\+%28RT%2C\+DAY%2C\+RIC%29/i);
    assert.equal(options.method, "GET");
    assert.match(options.headers.Authorization, /^Basic /);
    return response({
      issues: [
        issue({ key: "RT-1", projectKey: "RT", projectName: "Rick Travel", status: "Backlog / Ready" }),
        issue({ key: "DAY-12", projectKey: "DAY", projectName: "DayBudget", status: "Remote DONE" }),
        issue({ key: "RIC-4", projectKey: "RIC", projectName: "RIC Studio", status: "Review" }),
      ],
    });
  };

  const snapshot = await synchronizeJiraReadState({
    env,
    fetchImpl,
    cachePath: testCache,
    now: new Date("2026-07-13T12:00:00.000Z"),
  });
  const cache = JSON.parse(await readFile(testCache, "utf8"));

  assert.deepEqual(methods, ["GET"]);
  assert.equal(snapshot.last_successful_synchronization_at, "2026-07-13T12:00:00.000Z");
  assert.equal(snapshot.issue_count, 3);
  assert.equal(snapshot.cached_data_shown, false);
  assert.equal(snapshot.jira_write_performed, false);
  assert.equal(snapshot.full_sync_performed, false);
  assert.equal(snapshot.create_issue_performed, false);
  assert.equal(snapshot.bulk_operation_performed, false);
  assert.equal(snapshot.secrets_printed, false);
  assert.equal(cache.issues.length, 3);
  assert.deepEqual(snapshot.grouped_by_project.map((group) => group.project_key), ["RT", "DAY", "RIC"]);

  await rm(testCache, { force: true });
});

test("temporary Jira failure preserves last successful cache and redacts secrets", async () => {
  const testCache = cachePath("fallback");
  await mkdir("var", { recursive: true });
  await rm(testCache, { force: true });
  await synchronizeJiraReadState({
    env,
    fetchImpl: async () => response({
      issues: [issue({ key: "DAY-12", projectKey: "DAY", projectName: "DayBudget", status: "Remote DONE" })],
    }),
    cachePath: testCache,
    now: new Date("2026-07-13T12:00:00.000Z"),
  });

  const snapshot = await synchronizeJiraReadState({
    env,
    fetchImpl: async () => {
      throw new Error(`Authorization: Basic abc ${env.JIRA_API_TOKEN}`);
    },
    cachePath: testCache,
    now: new Date("2026-07-13T12:02:00.000Z"),
    staleAfterMs: 30_000,
  });

  assert.equal(snapshot.cached_data_shown, true);
  assert.equal(snapshot.cache_available, true);
  assert.equal(snapshot.stale_state_warning, true);
  assert.equal(snapshot.issue_count, 1);
  assert.doesNotMatch(snapshot.last_synchronization_error, /synthetic-token-value|Authorization|Basic abc/);
  assert.equal(snapshot.jira_write_performed, false);

  await rm(testCache, { force: true });
});

test("missing Jira credentials do not call fetch and can show cached data", async () => {
  const testCache = cachePath("missing-env");
  await rm(testCache, { force: true });
  await synchronizeJiraReadState({
    env,
    fetchImpl: async () => response({
      issues: [issue({ key: "RT-1", projectKey: "RT", projectName: "Rick Travel" })],
    }),
    cachePath: testCache,
  });

  let called = false;
  const snapshot = await synchronizeJiraReadState({
    env: {},
    fetchImpl: async () => {
      called = true;
      return response({ issues: [] });
    },
    cachePath: testCache,
  });

  assert.equal(called, false);
  assert.equal(snapshot.cached_data_shown, true);
  assert.equal(snapshot.issue_count, 1);
  assert.equal(snapshot.last_synchronization_error, "Missing required Jira environment configuration.");

  await rm(testCache, { force: true });
});

test("sanitizes Jira errors without exposing credential values or authorization headers", () => {
  const sanitized = sanitizeJiraError(
    new Error(`Failed for ${env.JIRA_EMAIL} using ${env.JIRA_API_TOKEN} and Authorization: Basic abc123`),
    env,
  );

  assert.doesNotMatch(sanitized, /operator@example.invalid|synthetic-token-value|Authorization: Basic abc123/);
});

test("sync manager runs startup and periodic mocked synchronization", async () => {
  const testCache = cachePath("periodic");
  await rm(testCache, { force: true });
  let callCount = 0;
  const fetchImpl = async (url, options) => {
    assert.equal(options.method, "GET");
    callCount += 1;
    return response({
      issues: [
        issue({
          key: "RIC-4",
          projectKey: "RIC",
          projectName: "RIC Studio",
          status: callCount === 1 ? "Backlog / Ready" : "In Progress",
        }),
      ],
    });
  };

  const manager = createJiraReadSyncManager({
    env,
    fetchImpl,
    cachePath: testCache,
    intervalMs: 20,
  });

  const initial = await manager.start();
  assert.equal(initial.issues[0].lifecycle_status, "READY");
  await new Promise((resolve) => setTimeout(resolve, 70));
  await manager.stop();

  const latest = manager.getSnapshot();
  assert.ok(callCount >= 2);
  assert.equal(latest.issues[0].lifecycle_status, "IN_PROGRESS");
  assert.equal(latest.jira_write_performed, false);

  await rm(testCache, { force: true });
});
