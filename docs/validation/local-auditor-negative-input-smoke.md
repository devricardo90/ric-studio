# Local Auditor Negative Input Smoke

## Task

RIC-STUDIO-041A - Add Local Auditor CLI Negative Input Smoke Coverage.

## Objective

Validate that the local zero-dependency auditor CLI returns structured JSON with `COMMIT_BLOCKED` for invalid or incomplete evidence inputs.

## Scope

This validation covers negative input behavior only. It does not add support for `COMMIT_ALLOWED`, `PUSH_ALLOWED`, or `LOCAL_DONE_CONFIRMED`.

## Scenarios

### 1. No File Argument

Command:

```powershell
node tools/auditor/audit.mjs
```

Expected decision: `COMMIT_BLOCKED`

Actual output:

```json
{
  "decision": "COMMIT_BLOCKED",
  "task_id": null,
  "requested_gate": null,
  "result": "blocked",
  "evidence_quality": "incomplete",
  "missing_evidence": [
    "evidence_file_path"
  ],
  "allowed_actions": [],
  "blocked_actions": [
    "commit",
    "push",
    "remote_done"
  ],
  "human_review_required": true
}
```

### 2. Missing File Path

Command:

```powershell
node tools/auditor/audit.mjs tools/auditor/fixtures/missing-file.json
```

Expected decision: `COMMIT_BLOCKED`

Actual output:

```json
{
  "decision": "COMMIT_BLOCKED",
  "task_id": null,
  "requested_gate": null,
  "result": "blocked",
  "evidence_quality": "incomplete",
  "missing_evidence": [
    "readable_evidence_file"
  ],
  "allowed_actions": [],
  "blocked_actions": [
    "commit",
    "push",
    "remote_done"
  ],
  "human_review_required": true
}
```

### 3. Invalid JSON

Command:

```powershell
node tools/auditor/audit.mjs tools/auditor/fixtures/invalid-json.json
```

Expected decision: `COMMIT_BLOCKED`

Actual output:

```json
{
  "decision": "COMMIT_BLOCKED",
  "task_id": null,
  "requested_gate": null,
  "result": "blocked",
  "evidence_quality": "incomplete",
  "missing_evidence": [
    "valid_json"
  ],
  "allowed_actions": [],
  "blocked_actions": [
    "commit",
    "push",
    "remote_done"
  ],
  "human_review_required": true
}
```

### 4. JSON Array Instead Of Object

Command:

```powershell
node tools/auditor/audit.mjs tools/auditor/fixtures/array-evidence.json
```

Expected decision: `COMMIT_BLOCKED`

Actual output:

```json
{
  "decision": "COMMIT_BLOCKED",
  "task_id": null,
  "requested_gate": null,
  "result": "blocked",
  "evidence_quality": "incomplete",
  "missing_evidence": [
    "valid_evidence_object"
  ],
  "allowed_actions": [],
  "blocked_actions": [
    "commit",
    "push",
    "remote_done"
  ],
  "human_review_required": true
}
```

### 5. Incomplete Sample Evidence

Command:

```powershell
node tools/auditor/audit.mjs tools/auditor/sample-evidence.json
```

Expected decision: `COMMIT_BLOCKED`

Actual output:

```json
{
  "decision": "COMMIT_BLOCKED",
  "task_id": "RIC-STUDIO-040B",
  "requested_gate": "commit",
  "result": "blocked",
  "evidence_quality": "incomplete",
  "missing_evidence": [
    "git_status_short",
    "git_diff_stat",
    "git_diff_check",
    "file_diffs",
    "validation_output"
  ],
  "allowed_actions": [],
  "blocked_actions": [
    "commit",
    "push",
    "remote_done"
  ],
  "human_review_required": true
}
```

## Result

All five negative input scenarios returned structured JSON with `decision` set to `COMMIT_BLOCKED`.

## Negative Confirmations

- No `COMMIT_ALLOWED` support was implemented.
- No `PUSH_ALLOWED` support was implemented.
- No `LOCAL_DONE_CONFIRMED` support was implemented.
- No dependencies were added.
- No `package.json` was created or edited.
- No test runner was added.
- No runtime files or `Modelfile` files were changed.
- No UI, Next.js, LangChain, LangGraph, GitHub API integration, or automation was added.
- No commit or push was performed.
