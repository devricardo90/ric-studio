# Local Auditor Real Evidence Input Smoke

## Task

RIC-STUDIO-044A - Implement Real Local Evidence Input for Auditor.

## Objective

Validate that `tools/auditor/audit.mjs` reads a local evidence JSON file path provided on the command line and returns controlled structured decisions without executing Git commands, modifying files, staging, committing, pushing, deleting, or generating code.

## Scope

This smoke covers local read-only evidence input. It keeps the auditor zero-dependency and preserves the existing `COMMIT_BLOCKED` and `COMMIT_ALLOWED` decision behavior.

The real local example path used for repository tracking is:

```text
tools/auditor/fixtures/real-local-evidence.example.json
```

## Commands

### 1. Valid Real Evidence Example

```powershell
node tools/auditor/audit.mjs tools/auditor/fixtures/real-local-evidence.example.json
```

Expected decision: `COMMIT_ALLOWED`

Actual output:

```json
{
  "decision": "COMMIT_ALLOWED",
  "task_id": "RIC-STUDIO-044A",
  "requested_gate": "commit",
  "result": "allowed",
  "evidence_quality": "sufficient",
  "required_evidence": [],
  "provided_evidence": [],
  "missing_evidence": [],
  "protocol_findings": [],
  "allowed_actions": [
    "commit"
  ],
  "blocked_actions": [
    "push",
    "remote_done"
  ],
  "human_review_required": true,
  "next_step": "Commit only the explicitly scoped files after human approval.",
  "summary": "Added a tracked local evidence example and smoke documentation proving the auditor can read a real evidence JSON path from the command line without executing Git or modifying files."
}
```

### 2. Missing Evidence File Path

```powershell
node tools/auditor/audit.mjs tools/auditor/fixtures/missing-real-local-evidence.json
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

## Result

The valid real local evidence example returned structured JSON with `decision` set to `COMMIT_ALLOWED`.

The missing file path and invalid JSON scenarios returned controlled structured JSON with `decision` set to `COMMIT_BLOCKED`.

## Negative Confirmations

- The auditor did not execute Git commands.
- The auditor did not modify files.
- The auditor did not stage, commit, push, delete, or generate code automatically.
- No Git automation was added.
- No commit automation was added.
- No push automation was added.
- No GitHub API integration was added.
- No `.github` workflow was added.
- No UI, server, database, dependency, LangChain, LangGraph, runtime, Modelfile, or Ollama change was added.
- No commit or push was performed.
