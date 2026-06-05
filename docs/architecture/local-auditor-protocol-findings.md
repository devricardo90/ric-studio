# Local Auditor Protocol Findings

## Purpose

This document defines protocol finding semantics for the dependency-free local auditor.

Protocol findings describe evidence that is present but proves a task, gate, or safety rule was violated. They are separate from missing evidence, which describes evidence that is absent, empty, malformed, or not usable.

This is a documentation-only contract. It does not change `tools/auditor/audit.mjs`, `tools/auditor/audit-session.mjs`, fixtures, package metadata, dependencies, runtime behavior, Git operations, UI, backend, CI, hooks, commit, or push.

## Relationship To The Evidence Contract

`docs/architecture/local-auditor-evidence-contract.md` defines the evidence required before the auditor can recommend `COMMIT_ALLOWED`.

This document refines one limitation from that contract: some violations are currently reported through `missing_evidence`, such as `allowed_file:<path>` and `blocked_file:<path>`.

Future implementation may move those cases into a dedicated `protocol_findings` field while preserving the same conservative decision behavior.

## Missing Evidence Vs Protocol Findings

Missing evidence means the auditor does not have enough usable proof to evaluate the requested gate.

Examples:

- Required field is absent.
- Required field is empty.
- Required field has the wrong type.
- Required file-diff evidence is missing for a changed path.
- Validation output is absent.
- `git_diff_check` evidence is absent.

Protocol finding means the auditor has evidence and the evidence shows a rule violation.

Examples:

- A changed path is not in `allowed_files`.
- A changed path is listed in `blocked_files`.
- A blocked action is missing from `blocked_actions`.
- Evidence shows a blocked action occurred.
- `git_diff_check` reports whitespace errors or conflict markers.
- Validation evidence exists but shows failure.

Both missing evidence and protocol findings must block `COMMIT_ALLOWED`.

## Conservative Boundary

Protocol findings must stay conservative because they represent explicit rule, scope, or safety failures.

The auditor must not:

- Downgrade protocol findings into warnings.
- Treat partial compliance as enough for `COMMIT_ALLOWED`.
- Allow a commit when changed files are outside scope.
- Allow a commit when validation failed.
- Allow a commit when blocked actions occurred.
- Convert a protocol finding into human-only advisory text while still returning `COMMIT_ALLOWED`.

If a finding is uncertain because evidence is incomplete or ambiguous, the auditor should classify the uncertainty as missing or contradictory evidence and return `COMMIT_BLOCKED`.

## Expected Structure

A future `protocol_findings` field should be an array of structured entries.

Recommended entry shape:

```json
{
  "code": "allowed_file_violation",
  "severity": "blocker",
  "path": "example/path.md",
  "message": "Changed path is not listed in allowed_files."
}
```

Required entry fields:

- `code`: stable machine-readable identifier.
- `severity`: finding severity. For this contract, all protocol findings are `blocker`.
- `message`: concise human-readable explanation.

Optional entry fields:

- `path`: repository-relative path when the finding concerns a file.
- `action`: action name when the finding concerns an action.
- `command`: validation command when the finding concerns validation.
- `evidence_field`: evidence field that produced the finding.

## Naming Rules

Finding codes should be stable, lowercase, and snake_case.

Codes should describe the violated rule, not the current implementation detail.

Preferred examples:

- `allowed_file_violation`
- `blocked_file_violation`
- `blocked_action_violation`
- `validation_failed`
- `diff_check_failed`
- `unexpected_gate`
- `unexpected_task_state`
- `contradictory_evidence`

Avoid codes that imply missing evidence when evidence exists:

- Avoid `missing_allowed_file:<path>` for an out-of-scope changed file.
- Avoid `missing_blocked_file:<path>` for a changed blocked file.
- Avoid `missing_validation` when validation output exists and failed.

## Allowed-File Violations

An allowed-file violation occurs when evidence shows a changed path that is not listed in `allowed_files`.

Expected representation:

```json
{
  "code": "allowed_file_violation",
  "severity": "blocker",
  "path": "unauthorized/path.md",
  "evidence_field": "git_status_short",
  "message": "Changed path is not listed in allowed_files."
}
```

Decision impact:

- `decision` must be `COMMIT_BLOCKED`.
- `allowed_actions` must be empty.
- `blocked_actions` must include `commit`, `push`, and `remote_done`.
- `human_review_required` must remain `true`.

Current limitation:

- The current evaluator may report this as `allowed_file:<path>` in `missing_evidence`.
- Future implementation may move it to `protocol_findings` without weakening the block.

## Blocked-File Violations

A blocked-file violation occurs when evidence shows a changed path that appears in `blocked_files`.

Expected representation:

```json
{
  "code": "blocked_file_violation",
  "severity": "blocker",
  "path": "blocked/path.md",
  "evidence_field": "git_status_short",
  "message": "Changed path is listed in blocked_files."
}
```

Decision impact:

- `decision` must be `COMMIT_BLOCKED`.
- `allowed_actions` must be empty.
- `blocked_actions` must include `commit`, `push`, and `remote_done`.
- `human_review_required` must remain `true`.

Current limitation:

- The current evaluator may report this as `blocked_file:<path>` in `missing_evidence`.
- Future implementation may move it to `protocol_findings` without weakening the block.

## Blocked-Action Violations

A blocked-action violation occurs when evidence shows a prohibited action was requested, authorized, or performed inside a task scope where it is blocked.

Examples:

- Evidence claims a push occurred during a commit-only gate.
- Evidence omits `push` or `remote_done` from `blocked_actions`.
- Evidence suggests Git automation, hooks, CI, dependency installation, runtime promotion, or app changes occurred when those actions are blocked.

Expected representation:

```json
{
  "code": "blocked_action_violation",
  "severity": "blocker",
  "action": "push",
  "evidence_field": "blocked_actions",
  "message": "Required blocked action is missing or evidence indicates the blocked action occurred."
}
```

Decision impact:

- `decision` must be `COMMIT_BLOCKED`.
- The blocked action must not be converted into an allowed action.
- Human review remains mandatory.

## Validation Failures

Validation failures should be classified as protocol findings when validation evidence is present and shows failure.

Examples:

- A required command exited non-zero.
- `git_diff_check` reports whitespace errors.
- `git_diff_check` reports conflict markers.
- Validation output contradicts `validation_interpretation`.
- `validation_interpretation` says pass but raw validation output shows failure.

Expected representation:

```json
{
  "code": "validation_failed",
  "severity": "blocker",
  "command": "git diff --check",
  "evidence_field": "validation_outputs",
  "message": "Validation evidence is present and indicates failure."
}
```

Use missing evidence instead when the validation command, output, or interpretation is absent or unusable.

Use `contradictory_evidence` when validation interpretation and raw output disagree.

## Relationship To COMMIT_BLOCKED

Any protocol finding must force `COMMIT_BLOCKED`.

When `protocol_findings` is non-empty:

- `decision` must be `COMMIT_BLOCKED`.
- `result` should indicate blocked or failed commit gate.
- `allowed_actions` must be `[]`.
- `blocked_actions` must include `commit`, `push`, and `remote_done`.
- `human_review_required` must be `true`.
- `next_step` should ask the human to resolve or explicitly review the finding before retrying.

Protocol findings do not create a warning path in this contract.

## Human-Readable Reports

Human-readable reports should separate missing evidence from protocol findings.

Recommended report sections:

- Decision.
- Evidence quality.
- Missing evidence.
- Protocol findings.
- Allowed actions.
- Blocked actions.
- Human-review requirement.
- Next step.

Each protocol finding should be understandable without reading raw JSON.

Recommended human-readable format:

```text
Protocol findings:
- allowed_file_violation [blocker]: Changed path is not listed in allowed_files. Path: unauthorized/path.md.
- validation_failed [blocker]: Validation evidence is present and indicates failure. Command: git diff --check.
```

Reports should not dump raw evidence by default. Raw diffs, full command output, or large evidence objects should remain available only when explicitly requested or when captured in validation documentation.

## Future Implementation Boundary

Future implementation in `tools/auditor/audit.mjs` may:

- Add `protocol_findings` to evaluator output.
- Move current `allowed_file:<path>` and `blocked_file:<path>` cases out of `missing_evidence`.
- Preserve `missing_evidence` for absent, malformed, empty, or unusable evidence.
- Preserve existing `COMMIT_ALLOWED` behavior for complete, in-scope evidence.
- Preserve existing `COMMIT_BLOCKED` behavior for incomplete or violating evidence.
- Update report text to show missing evidence and protocol findings separately.

Future implementation must not:

- Treat protocol findings as warnings.
- Add push or Remote DONE authorization.
- Add Git automation.
- Add hooks, CI, or push automation.
- Change package metadata or dependencies without a separate task.
- Edit fixtures without a separate validation task.
- Weaken human review.

## Warning And Partial-Confidence Behavior

Warning and partial-confidence behavior remains future-only.

This contract does not define warning severity levels, warning output fields, or cases where warnings can coexist with `COMMIT_ALLOWED`.

Until a separate warning contract exists, uncertain, borderline, contradictory, or rule-violating evidence must remain conservative and return `COMMIT_BLOCKED`.

## Review Boundary

RIC-STUDIO-057A creates this protocol findings semantics contract and updates operational state only.

No runtime behavior changes are made by this task.

No commit or push is performed by this task.
