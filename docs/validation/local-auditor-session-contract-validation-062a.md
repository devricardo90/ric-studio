# RIC-STUDIO-062A - Audit Session Contract Validation

## Purpose

Validate that `tools/auditor/audit-session.mjs` emits the required completed session report fields defined in `docs/architecture/local-auditor-session-contract.md`.

This validation is intentionally narrow. It checks report shape, not auditor business logic. It uses existing fixtures and a dependency-free Node script.

## Files Changed

- `tools/auditor/validate-session-contract.mjs`
- `docs/validation/local-auditor-session-contract-validation-062a.md`
- `STATUS.md`
- `backlog.md`
- `docs/ops/status.md`
- `docs/ops/backlog.md`
- `docs/ops/execution-log.md`
- `docs/ops/session-handoff.md`

## Validation Commands

```powershell
node tools/auditor/validate-session-contract.mjs
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json
git status --short --untracked-files=all
git status -sb
git diff --name-only
git diff --stat
git diff --check
```

## PASS Criteria

- `node tools/auditor/validate-session-contract.mjs` exits 0.
- The validator checks the required top-level fields:
  - `session_status`
  - `timestamp`
  - `audit_metadata`
  - `decision`
  - `result`
  - `summary`
  - `missing_evidence`
  - `protocol_findings`
  - `allowed_actions`
  - `blocked_actions`
  - `human_review_required`
  - `next_step`
- The validator checks the required nested fields:
  - `audit_metadata.task_id`
  - `audit_metadata.requested_gate`
  - `audit_metadata.evidence_quality`
- The allowed fixture output includes `protocol_findings: []`.
- The blocked protocol-finding fixture output includes populated `protocol_findings`.
- No runtime behavior, evaluator logic, fixtures, dependencies, package files, CI, or app files change.

## Evidence - Allowed Output

Command:

```powershell
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json
```

Relevant excerpt:

```json
{
  "decision": "COMMIT_ALLOWED",
  "missing_evidence": [],
  "protocol_findings": [],
  "allowed_actions": [
    "commit"
  ],
  "human_review_required": true
}
```

Outcome: PASS. The allowed report includes `protocol_findings: []`.

## Evidence - Blocked Output

Command:

```powershell
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json
```

Relevant excerpt:

```json
{
  "decision": "COMMIT_BLOCKED",
  "missing_evidence": [],
  "protocol_findings": [
    {
      "code": "blocked_file_violation",
      "severity": "blocker",
      "path": "package.json",
      "evidence_field": "git_status_short",
      "message": "Changed path is listed in blocked_files."
    }
  ],
  "allowed_actions": [],
  "human_review_required": true
}
```

Outcome: PASS. The blocked report includes populated `protocol_findings`.

## Boundary Confirmation

RIC-STUDIO-062A did not change runtime behavior, evaluator logic, fixtures, dependencies, package files, CI, app files, runtime/model/Ollama files, commit behavior, or push behavior.
