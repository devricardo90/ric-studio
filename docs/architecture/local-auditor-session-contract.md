# Local Auditor Session Report Contract

## Purpose

This document defines the required structured output contract for `tools/auditor/audit-session.mjs`.

The session report is the human-facing output of the dependency-free local audit session runner. It wraps the deterministic evaluator result from `tools/auditor/audit.mjs` in a stable, privacy-first JSON report for manual gate review.

The purpose of this contract is to prevent evaluator fields that matter to human review from disappearing when `audit-session.mjs` manually assembles the final report. RIC-STUDIO-060A proved this risk with `protocol_findings`: the evaluator preserved the field, but the session report omitted it until the report assembly was corrected.

This is a documentation-only contract. It does not change runtime code, evaluator logic, fixtures, dependencies, CI, Git automation, commit behavior, or push behavior.

## Completed Session Report Shape

A successful invocation of `tools/auditor/audit-session.mjs` must emit one completed session report as formatted JSON to stdout.

The completed session report shape is:

```json
{
  "session_status": "completed",
  "timestamp": "2026-06-08T00:00:00.000Z",
  "audit_metadata": {
    "task_id": "RIC-STUDIO-XXXX",
    "requested_gate": "commit",
    "evidence_quality": "sufficient"
  },
  "decision": "COMMIT_ALLOWED",
  "result": "allowed",
  "summary": "Human-readable summary.",
  "missing_evidence": [],
  "protocol_findings": [],
  "allowed_actions": ["commit"],
  "blocked_actions": ["push", "remote_done"],
  "human_review_required": true,
  "next_step": "Human-readable next step."
}
```

The concrete values may differ by fixture or evidence package, but the required fields must remain present in every completed session report.

## Required Fields

Every completed session report must include these top-level fields:

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

The `audit_metadata` object must include:

- `audit_metadata.task_id`
- `audit_metadata.requested_gate`
- `audit_metadata.evidence_quality`

## Field Semantics

`session_status` must be `"completed"` for a successful session-runner invocation that reaches deterministic evaluation.

`timestamp` must be an ISO timestamp generated when the report is emitted. Because it is dynamic, validation should compare stable semantic fields instead of exact full-output snapshots.

`audit_metadata` contains task and gate metadata copied or derived from the evaluator decision.

`audit_metadata.task_id` identifies the task being audited. If the evaluator has no task id, the session report may use the existing fallback value `"N/A"`.

`audit_metadata.requested_gate` identifies the requested gate. If the evaluator has no requested gate, the session report may use the existing fallback value `"N/A"`.

`audit_metadata.evidence_quality` reports the evaluator's evidence-quality classification.

`decision` is the evaluator's decision, such as `COMMIT_ALLOWED` or `COMMIT_BLOCKED`.

`result` is the evaluator's result classification, such as `allowed` or `blocked`.

`summary` is a concise human-readable explanation. For blocked decisions with no evaluator summary, the session runner may use the existing fallback summary.

`missing_evidence` lists required evidence names or details that are absent, malformed, empty, or unusable. It must default to `[]` when there is no missing evidence.

`protocol_findings` lists structured rule, scope, or safety findings when evidence is present and proves a violation. It must default to [] when there are no protocol findings.

`allowed_actions` lists actions the evaluator allows for the current gate. For commit-gate allow scenarios this may include `commit`.

`blocked_actions` lists actions that remain blocked. Push and Remote DONE must remain blocked unless a separately approved future gate changes that behavior.

`human_review_required` must remain present and must preserve the evaluator's human-review requirement.

`next_step` is a concise human-readable next step. For blocked decisions with no evaluator next step, the session runner may use the existing fallback next step.

## Protocol Findings Requirement

`protocol_findings` is mandatory in every completed session report.

When the evaluator returns protocol findings, the session report must copy them from `decision.protocol_findings` without replacing them with generic text.

When the evaluator does not return protocol findings, or returns no findings, the session report must default to [].

This requirement applies to both `COMMIT_ALLOWED` and `COMMIT_BLOCKED` reports.

Allowed reports with no protocol findings must include:

```json
{
  "protocol_findings": []
}
```

Blocked reports may have empty `missing_evidence` but populated `protocol_findings`. This is expected when evidence is present and proves a rule violation instead of showing absent evidence.

Example:

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
  ]
}
```

The session report must keep missing evidence and protocol findings separate so human reviewers can distinguish absent proof from proven rule violations.

## Privacy-First Boundary

The completed session report must not include raw evidence payloads.

Raw evidence includes full input evidence objects, raw file diffs, raw validation outputs, complete Git command outputs, environment values, untracked file contents, generated artifacts, credentials, or other local data that was supplied to the evaluator.

The report may include derived findings, missing evidence names, action lists, status fields, metadata, decision fields, summary text, and next step text.

This boundary keeps `tools/auditor/audit-session.mjs` useful for human review without turning the report into a raw evidence dump. Raw evidence should remain in explicit validation documentation or in operator-provided evidence files when review requires it.

## Error Report Shape

If `audit-session.mjs` exits through `exitWithError()`, it emits a controlled error report instead of a completed session report.

The error report shape is:

```json
{
  "status": "error",
  "message": "Human-readable error message.",
  "details": null
}
```

Required error report fields:

- `status`
- `message`
- `details`

The completed report requirements do not apply to this error shape because deterministic evaluation did not complete.

## Compatibility Rule

Any future evaluator output field required by human review must either be surfaced in the session report or explicitly rejected with documented rationale.

Examples of evaluator fields that may require surfacing include new finding arrays, warning fields, confidence fields, gate-specific action fields, reviewer notes, or future structured decision details.

Rejection must be explicit. A field must not be omitted only because `audit-session.mjs` manually assembles the report.

## Maintenance Rule

Changes to `tools/auditor/audit-session.mjs` that affect completed report shape or error report shape must update this contract in the same task.

Changes to `tools/auditor/audit.mjs` that add evaluator output needed for human review must either update the session report and this contract, or document why the field is intentionally excluded.

Report-shape validation should prefer semantic checks for required fields over exact JSON snapshots because `timestamp` is dynamic.

## Current Boundary

This contract documents the current dependency-free session runner behavior after RIC-STUDIO-060A.

It does not authorize:

- Runtime code changes.
- Evaluator logic changes.
- Fixture changes.
- Package or dependency changes.
- Git automation.
- CI/CD changes.
- App, API, database, deploy, runtime, model, or Ollama changes.
- Commit or push.
