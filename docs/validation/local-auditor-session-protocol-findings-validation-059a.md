# RIC-STUDIO-059A - Audit Session Protocol Findings Validation

## Scope

Validation/documentation only.

Objective: validate whether `tools/auditor/audit-session.mjs` preserves, surfaces, and reports `protocol_findings` from `evaluateEvidence` when run through the full session runner path.

No code was changed. No auditor source, fixture, package, lockfile, dependency, runtime/model/Ollama, app/UI/backend/API/database/deploy, `.github`, hook, CI, commit, or push change was made.

## Starting Git State

Commands:

```powershell
git status --short --untracked-files=all
git status -sb
git rev-parse HEAD
git rev-parse origin/main
```

Observed:

- `git status --short --untracked-files=all`: no file entries. Git emitted permission warnings for `C:\Users\ricardodev/.config/git/ignore`.
- `git status -sb`: `## main...origin/main`. Git emitted the same global ignore permission warnings.
- `git rev-parse HEAD`: `2f8e8613fe483d1134e252e6b02f1575bd924a82`
- `git rev-parse origin/main`: `2f8e8613fe483d1134e252e6b02f1575bd924a82`

Starting repository state was clean and synchronized with `origin/main`.

## Required Session Runner Commands

### commit-allowed-evidence

Command:

```powershell
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json
```

Raw output:

```json
{
  "session_status": "completed",
  "timestamp": "2026-06-08T13:04:19.171Z",
  "audit_metadata": {
    "task_id": "RIC-STUDIO-043A",
    "requested_gate": "commit",
    "evidence_quality": "sufficient"
  },
  "decision": "COMMIT_ALLOWED",
  "result": "allowed",
  "summary": "Implemented the first positive COMMIT_ALLOWED smoke path from the documented evidence contract while preserving COMMIT_BLOCKED behavior for negative inputs.",
  "missing_evidence": [],
  "allowed_actions": [
    "commit"
  ],
  "blocked_actions": [
    "push",
    "remote_done"
  ],
  "human_review_required": true,
  "next_step": "Commit only the explicitly scoped files after human approval."
}
```

Expected: `COMMIT_ALLOWED` remains clean, with `protocol_findings` empty or absent in an acceptable way.

Actual: `COMMIT_ALLOWED` returned, `missing_evidence` was empty, and no `protocol_findings` field was displayed. This is acceptable for the clean allowed scenario because the evaluator returns an empty array.

### protocol-findings-allowed-file-violation

Command:

```powershell
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-allowed-file-violation.json
```

Raw output:

```json
{
  "session_status": "completed",
  "timestamp": "2026-06-08T13:04:23.925Z",
  "audit_metadata": {
    "task_id": "RIC-STUDIO-058A",
    "requested_gate": "commit",
    "evidence_quality": "incomplete"
  },
  "decision": "COMMIT_BLOCKED",
  "result": "blocked",
  "summary": "Commit blocked by audit rules.",
  "missing_evidence": [],
  "allowed_actions": [],
  "blocked_actions": [
    "commit",
    "push",
    "remote_done"
  ],
  "human_review_required": true,
  "next_step": "Fix missing evidence before re-auditing."
}
```

Expected: `COMMIT_BLOCKED` and visible protocol finding for changed path outside `allowed_files`.

Actual: `COMMIT_BLOCKED` returned, but the session report did not include `protocol_findings`. `missing_evidence` was empty, so the report did not expose why the block occurred.

Direct evaluator comparison:

```json
"protocol_findings": [
  {
    "code": "allowed_file_violation",
    "severity": "blocker",
    "path": "docs/unauthorized-protocol-finding.md",
    "evidence_field": "git_status_short",
    "message": "Changed path is not listed in allowed_files."
  }
]
```

Conclusion: the evaluator produced the finding, but the session report did not surface it.

### protocol-findings-blocked-file-violation

Command:

```powershell
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json
```

Raw output:

```json
{
  "session_status": "completed",
  "timestamp": "2026-06-08T13:04:28.799Z",
  "audit_metadata": {
    "task_id": "RIC-STUDIO-058A",
    "requested_gate": "commit",
    "evidence_quality": "incomplete"
  },
  "decision": "COMMIT_BLOCKED",
  "result": "blocked",
  "summary": "Commit blocked by audit rules.",
  "missing_evidence": [],
  "allowed_actions": [],
  "blocked_actions": [
    "commit",
    "push",
    "remote_done"
  ],
  "human_review_required": true,
  "next_step": "Fix missing evidence before re-auditing."
}
```

Expected: `COMMIT_BLOCKED` and visible protocol finding for changed path inside `blocked_files`.

Actual: `COMMIT_BLOCKED` returned, but the session report did not include `protocol_findings`. `missing_evidence` was empty, so the report did not expose why the block occurred.

Direct evaluator comparison:

```json
"protocol_findings": [
  {
    "code": "blocked_file_violation",
    "severity": "blocker",
    "path": "package.json",
    "evidence_field": "git_status_short",
    "message": "Changed path is listed in blocked_files."
  }
]
```

Conclusion: the evaluator produced the finding, but the session report did not surface it.

### realistic-commit-blocked-evidence

Command:

```powershell
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/realistic-commit-blocked-evidence.json
```

Raw output:

```json
{
  "session_status": "completed",
  "timestamp": "2026-06-08T13:04:32.986Z",
  "audit_metadata": {
    "task_id": "RIC-STUDIO-055A",
    "requested_gate": "commit",
    "evidence_quality": "incomplete"
  },
  "decision": "COMMIT_BLOCKED",
  "result": "blocked",
  "summary": "Commit blocked by audit rules.",
  "missing_evidence": [],
  "allowed_actions": [],
  "blocked_actions": [
    "commit",
    "push",
    "remote_done"
  ],
  "human_review_required": true,
  "next_step": "Fix missing evidence before re-auditing."
}
```

Expected: `COMMIT_BLOCKED` and visible protocol findings for `tools/auditor/audit-session.mjs`, because the direct evaluator reports both allowed-file and blocked-file violations for that path.

Actual: `COMMIT_BLOCKED` returned, but the session report did not include `protocol_findings`. `missing_evidence` was empty, so the report did not expose why the block occurred.

Direct evaluator comparison:

```json
"protocol_findings": [
  {
    "code": "allowed_file_violation",
    "severity": "blocker",
    "path": "tools/auditor/audit-session.mjs",
    "evidence_field": "git_status_short",
    "message": "Changed path is not listed in allowed_files."
  },
  {
    "code": "blocked_file_violation",
    "severity": "blocker",
    "path": "tools/auditor/audit-session.mjs",
    "evidence_field": "git_status_short",
    "message": "Changed path is listed in blocked_files."
  }
]
```

Conclusion: the evaluator produced both findings, but the session report did not surface them.

## Validation Questions

1. Does the session runner preserve `protocol_findings` from `evaluateEvidence`?

No. The evaluator returns `protocol_findings`, but `audit-session.mjs` constructs a `sessionReport` that omits `decision.protocol_findings`.

2. Does the session report display `protocol_findings`?

No. None of the four session-runner outputs displayed a `protocol_findings` field.

3. Does `COMMIT_ALLOWED` remain clean with `protocol_findings` empty or absent in an acceptable way?

Yes. The clean allowed fixture returned `COMMIT_ALLOWED`, empty `missing_evidence`, and no visible protocol findings. The direct evaluator returns `protocol_findings: []`, so the absence in the session report is acceptable for this scenario.

4. Do blocked protocol-finding cases expose enough information for human review?

No. The blocked session reports show `COMMIT_BLOCKED`, empty `missing_evidence`, and generic `summary` / `next_step` text. They do not expose finding code, severity, path, evidence field, or message.

5. Is there a gap requiring a future correction task?

Yes. A future correction task should update the session report to include evaluator `protocol_findings` while preserving the privacy-first no-raw-evidence report boundary.

## Result

RIC-STUDIO-059A found a validation gap:

- `evaluateEvidence` preserves structured `protocol_findings`.
- `tools/auditor/audit-session.mjs` does not surface those findings in the session report.
- Blocked protocol-finding reports therefore lack enough human-review detail.

Recommendation: open a future scoped correction task to add `protocol_findings` to the session report output. RIC-STUDIO-059A did not implement that correction.
