import assert from "node:assert/strict";
import { request } from "node:http";
import test from "node:test";
import { createDashboardServer } from "./server.mjs";

function fetchServer(server, pathname) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port, path: pathname, method: "GET" }, (res) => {
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

test("dashboard /api/state exposes mocked Jira read sync without secrets or writes", async () => {
  const jiraReadSync = {
    getSnapshot: () => ({
      source: "jira_read_only_api",
      mode: "read_only_visibility_sync",
      registered_projects: [
        { key: "RT", name: "Rick Travel" },
        { key: "DAY", name: "DayBudget" },
        { key: "RIC", name: "RIC Studio" },
      ],
      requested_fields: ["issue_key", "project", "summary", "status"],
      endpoint_path: "/rest/api/3/search/jql",
      http_methods_used: ["GET"],
      cache_path: "var/jira-live-state.json",
      last_attempt_at: "2026-07-13T12:00:00.000Z",
      last_successful_synchronization_at: "2026-07-13T12:00:00.000Z",
      last_synchronization_error: null,
      stale_state_warning: false,
      cached_data_shown: false,
      cache_available: true,
      issue_count: 3,
      duplicate_issue_keys_prevented: [],
      issues: [
        { issue_key: "RT-1", project_key: "RT", project_name: "Rick Travel", summary: "Plan route", jira_status: "Backlog / Ready", lifecycle_status: "READY", status_mapping_known: true },
        { issue_key: "DAY-12", project_key: "DAY", project_name: "DayBudget", summary: "Budget task", jira_status: "Remote DONE", lifecycle_status: "DONE", status_mapping_known: true },
        { issue_key: "RIC-4", project_key: "RIC", project_name: "RIC Studio", summary: "Read sync", jira_status: "Review", lifecycle_status: "REVIEW", status_mapping_known: true },
      ],
      grouped_by_project: [
        { project_key: "RT", project_name: "Rick Travel", issues: [{ issue_key: "RT-1", project_key: "RT", project_name: "Rick Travel", summary: "Plan route", jira_status: "Backlog / Ready", lifecycle_status: "READY", status_mapping_known: true }] },
        { project_key: "DAY", project_name: "DayBudget", issues: [{ issue_key: "DAY-12", project_key: "DAY", project_name: "DayBudget", summary: "Budget task", jira_status: "Remote DONE", lifecycle_status: "DONE", status_mapping_known: true }] },
        { project_key: "RIC", project_name: "RIC Studio", issues: [{ issue_key: "RIC-4", project_key: "RIC", project_name: "RIC Studio", summary: "Read sync", jira_status: "Review", lifecycle_status: "REVIEW", status_mapping_known: true }] },
      ],
      jira_write_performed: false,
      full_sync_performed: false,
      create_issue_performed: false,
      bulk_operation_performed: false,
      secrets_printed: false,
    }),
  };
  const server = createDashboardServer({ jiraReadSync });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const api = await fetchServer(server, "/api/state");
    const home = await fetchServer(server, "/");
    const state = JSON.parse(api.body);

    assert.equal(api.statusCode, 200);
    assert.equal(home.statusCode, 200);
    assert.equal(state.jira_read_sync.issue_count, 3);
    assert.deepEqual(state.jira_read_sync.grouped_by_project.map((group) => group.project_key), ["RT", "DAY", "RIC"]);
    assert.match(home.body, /Jira Read Synchronization/);
    assert.match(home.body, /RT-1/);
    assert.match(home.body, /DAY-12/);
    assert.match(home.body, /RIC-4/);
    assert.equal(state.jira_read_sync.jira_write_performed, false);
    assert.equal(state.jira_read_sync.full_sync_performed, false);
    assert.equal(state.jira_read_sync.create_issue_performed, false);
    assert.equal(state.jira_read_sync.bulk_operation_performed, false);
    assert.doesNotMatch(api.body, /Authorization|Basic|JIRA_API_TOKEN|synthetic-token/i);
    assert.doesNotMatch(home.body, /Authorization|Basic|JIRA_API_TOKEN|synthetic-token/i);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
