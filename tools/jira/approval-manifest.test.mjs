import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { approvedCommandHash, validateApprovalManifest } from "./approval-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const approvalDir = path.join(repoRoot, "docs", "validation", "jira-operator-approvals");
const approvedCommand = "node tools/jira/operator-safe-flow.mjs --issue DAY-11 --task-key RIC-STUDIO-101A --transition-id 31 --to Revisar --owner-approved --duplicate-risk-accepted --transition-risk-accepted --real-write";
const expected = {
  taskKey: "RIC-STUDIO-101A",
  projectKey: "DAY",
  issueKey: "DAY-11",
  expectedBeforeStatus: "Backlog / Ready",
  transitionId: "31",
  targetStatus: "Revisar",
  ownerApproved: true,
  duplicateRiskAccepted: true,
  transitionRiskAccepted: true,
  approvedCommand,
  approvedCommandHash: approvedCommandHash(approvedCommand)
};

function relativeManifestPath(name) {
  return `docs/validation/jira-operator-approvals/${name}-${process.pid}.json`;
}

function writeManifest(name, overrides = {}) {
  mkdirSync(approvalDir, { recursive: true });
  const relativePath = relativeManifestPath(name);
  const manifest = {
    task_key: "RIC-STUDIO-101A",
    project_key: "DAY",
    issue_key: "DAY-11",
    expected_before_status: "Backlog / Ready",
    transition_id: "31",
    target_status: "Revisar",
    owner_approved: true,
    duplicate_risk_accepted: true,
    transition_risk_accepted: true,
    approved_command_hash: expected.approvedCommandHash,
    created_at: "2026-07-07T00:00:00.000Z",
    ...overrides
  };
  writeFileSync(path.resolve(repoRoot, relativePath), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return relativePath;
}

function cleanup(relativePath) {
  rmSync(path.resolve(repoRoot, relativePath), { force: true });
}

function assertBlocked(relativePath, pattern) {
  try {
    assert.throws(
      () => validateApprovalManifest({ manifestPath: relativePath, expected }),
      pattern
    );
  } finally {
    if (relativePath.startsWith("docs/validation/jira-operator-approvals/")) cleanup(relativePath);
  }
}

test("valid approval manifest passes validation", () => {
  const relativePath = writeManifest("valid");

  try {
    const result = validateApprovalManifest({ manifestPath: relativePath, expected });

    assert.equal(result.approval_manifest_valid, true);
    assert.equal(result.task_key, "RIC-STUDIO-101A");
    assert.equal(result.project_key, "DAY");
    assert.equal(result.issue_key, "DAY-11");
    assert.equal(result.expected_before_status, "Backlog / Ready");
    assert.equal(result.transition_id, "31");
    assert.equal(result.target_status, "Revisar");
    assert.equal(result.owner_approved, true);
    assert.equal(result.duplicate_risk_accepted, true);
    assert.equal(result.transition_risk_accepted, true);
    assert.equal(result.approved_command_hash, expected.approvedCommandHash);
  } finally {
    cleanup(relativePath);
  }
});

test("unsafe path traversal blocks", () => {
  assert.throws(
    () => validateApprovalManifest({
      manifestPath: "docs/validation/jira-operator-approvals/../unsafe.json",
      expected
    }),
    /docs\/validation\/jira-operator-approvals/
  );
});

test("missing owner approval blocks", () => {
  assertBlocked(writeManifest("missing-owner", { owner_approved: false }), /owner_approved must be true/);
});

test("issue mismatch blocks", () => {
  assertBlocked(writeManifest("issue-mismatch", { issue_key: "DAY-12" }), /issue mismatch/);
});

test("project mismatch blocks", () => {
  assertBlocked(writeManifest("project-mismatch", { project_key: "RIC" }), /project mismatch|project_key must match/);
});

test("task key mismatch blocks", () => {
  assertBlocked(writeManifest("task-key-mismatch", { task_key: "RIC-STUDIO-OTHER" }), /task key mismatch/);
});

test("transition id mismatch blocks", () => {
  assertBlocked(writeManifest("transition-id-mismatch", { transition_id: "41" }), /transition id mismatch/);
});

test("target status mismatch blocks", () => {
  assertBlocked(writeManifest("target-status-mismatch", { target_status: "Remote DONE" }), /target status mismatch/);
});

test("secret-like manifest blocks", () => {
  assertBlocked(writeManifest("secret-like", { approved_command: "Authorization: Basic abc123" }), /secret-like/);
});

test("missing risk acceptance blocks", () => {
  const relativePath = writeManifest("missing-risk");
  const absolutePath = path.resolve(repoRoot, relativePath);
  const manifest = {
    task_key: "RIC-STUDIO-101A",
    project_key: "DAY",
    issue_key: "DAY-11",
    expected_before_status: "Backlog / Ready",
    transition_id: "31",
    target_status: "Revisar",
    owner_approved: true,
    approved_command_hash: expected.approvedCommandHash,
    created_at: "2026-07-07T00:00:00.000Z"
  };
  writeFileSync(absolutePath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  assertBlocked(relativePath, /duplicate_risk_accepted/);
});
