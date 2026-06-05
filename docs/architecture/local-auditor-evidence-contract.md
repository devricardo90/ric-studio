# Local Auditor Evidence Contract

## Purpose

This document defines the current evidence contract for the dependency-free local auditor after RIC-STUDIO-055A realistic validation.

The contract explains what evidence must be supplied before the local auditor can recommend `COMMIT_ALLOWED`, what evidence conditions require `COMMIT_BLOCKED`, and which boundaries remain human-controlled.

This is a documentation-only refinement. It does not change `tools/auditor/audit.mjs`, `tools/auditor/audit-session.mjs`, fixtures, package metadata, dependencies, runtime behavior, Git operations, UI, backend, CI, hooks, commit, or push.

## Human Decision-Support Boundary

The local auditor is a human decision-support tool.

It may:

- Evaluate supplied evidence against deterministic commit-gate rules.
- Emit structured JSON for human review.
- Recommend `COMMIT_ALLOWED` when supplied evidence is complete and internally consistent.
- Explain why `COMMIT_BLOCKED` was returned.
- Preserve push and Remote DONE as blocked actions.

It must not:

- Stage files.
- Commit.
- Push.
- Mark Local DONE or Remote DONE.
- Treat `COMMIT_ALLOWED` as execution authority.
- Override missing, stale, contradictory, or out-of-scope evidence.
- Replace human review.

Human review remains mandatory for every delivery-state movement.

## Required Evidence Fields

The current commit-gate evaluator requires these top-level evidence fields before it can return `COMMIT_ALLOWED`:

- `task_id`
- `requested_gate`
- `expected_state_before_commit`
- `allowed_files`
- `blocked_files`
- `blocked_actions`
- `implementation_summary`
- `git_status_short`
- `git_status_sb`
- `git_diff_stat`
- `git_diff_check`
- `file_diffs`
- `validation_commands`
- `validation_outputs`
- `validation_interpretation`

Rules:

- `requested_gate` must be `commit`.
- `expected_state_before_commit` must be `REVIEW`.
- `allowed_files`, `blocked_files`, and `blocked_actions` must be arrays.
- `blocked_actions` must include `push` and `remote_done`.
- `validation_interpretation` must indicate an overall pass.
- `git_diff_check` must not report whitespace errors, conflict markers, or blocking errors.
- Every changed path reported by `git_status_short` must appear in `allowed_files`.
- No changed path may appear in `blocked_files`.
- Every changed path must have a corresponding entry in `file_diffs`.

## Optional Evidence Fields

Optional fields may improve human review but cannot replace required evidence:

- `operator_notes`
- `review_notes`
- `known_warnings`
- `environment_notes`
- `line_ending_notes`
- `related_commits`
- `previous_task_state`
- `remote_tracking_context`
- `timestamp`
- `validation_caveats`
- `evidence_source`

Rules:

- Optional fields are advisory.
- Optional fields must not override raw Git status, diff check, file-diff, validation, or blocked-scope evidence.
- Optional fields should be included only when they clarify the decision.

## Missing Evidence

Missing evidence means a required field, required value, or required detail is absent, empty, malformed, or not usable for the requested gate.

Examples:

- Missing `task_id`.
- Missing `git_status_short`.
- Missing `validation_commands`.
- Empty `file_diffs`.
- Changed path lacks a `file_diffs` entry.
- `requested_gate` is not `commit`.
- `expected_state_before_commit` is not `REVIEW`.
- `validation_interpretation` does not pass.

Missing evidence must block `COMMIT_ALLOWED`.

In the current evaluator, missing evidence is reported through `missing_evidence`.

## Protocol Violations

A protocol violation means evidence is present but violates an explicit task, gate, or safety rule.

Examples:

- A changed file is outside `allowed_files`.
- A changed file appears in `blocked_files`.
- `blocked_actions` omits `push` or `remote_done`.
- `git_diff_check` reports a whitespace error or conflict marker.
- Evidence implies Git automation, dependency installation, runtime changes, app/UI/backend changes, or another blocked action.
- Evidence attempts to advance beyond the requested commit gate.

Protocol violations must block `COMMIT_ALLOWED`.

Current limitation:

- The current evaluator reports some protocol violations through `missing_evidence`, such as `allowed_file:<path>` and `blocked_file:<path>`.
- A future refinement may separate these into `protocol_findings` while preserving conservative blocking behavior.

## COMMIT_ALLOWED Semantics

`COMMIT_ALLOWED` means the supplied evidence is sufficient for a human to consider committing only the explicitly scoped files.

It requires:

- The task is in expected pre-commit state.
- The requested gate is `commit`.
- All changed paths are authorized.
- No blocked paths are changed.
- Required raw Git evidence is present.
- Required file-diff evidence is present for every changed path.
- Required validation commands and outputs are present.
- Validation interpretation passes.
- `git_diff_check` has no blocking errors.
- Blocked actions still include `push` and `remote_done`.
- Human review remains required.

`COMMIT_ALLOWED` allows only:

- Human-reviewed commit of the explicitly scoped files.

It does not allow:

- Push.
- Remote DONE.
- Local DONE.
- Git automation.
- Commit without human approval.
- Commit of files not represented by the supplied evidence.

## COMMIT_BLOCKED Semantics

`COMMIT_BLOCKED` means the auditor cannot recommend commit from the supplied evidence.

It is required when:

- Evidence is missing, incomplete, malformed, stale, contradictory, or out of scope.
- Validation is missing or failing.
- Changed files are outside `allowed_files`.
- Changed files appear in `blocked_files`.
- Required per-file evidence is missing.
- `git_diff_check` reports a blocking issue.
- Blocked actions are missing from evidence.
- The requested gate is not `commit`.
- The task is not in expected `REVIEW` state.
- Evidence suggests a blocked action occurred or is requested.

`COMMIT_BLOCKED` must preserve:

- `allowed_actions: []`
- `blocked_actions: ["commit", "push", "remote_done"]`
- `human_review_required: true`

## Push And Remote DONE Remain Blocked

Push and Remote DONE remain blocked even after `COMMIT_ALLOWED` because they are separate gates with separate evidence requirements.

Commit evidence proves only that the current working tree appears acceptable for a human-approved commit.

Push requires additional evidence, including:

- A completed local commit.
- Clean working tree after commit.
- Branch tracking state.
- Local commit relationship to remote.
- Explicit push authorization.

Remote DONE requires additional evidence, including:

- Push completed.
- Local `HEAD` equals remote tracking state.
- Clean repository after push.
- Task state reconciliation.
- Explicit Remote DONE confirmation.

The commit gate must not bundle those later lifecycle decisions.

## Warning And Partial-Confidence Behavior

Warning or partial-confidence behavior is future behavior only.

RIC-STUDIO-055A did not create a warning fixture because the current deterministic evaluator supports only `COMMIT_ALLOWED` and `COMMIT_BLOCKED` for the tested commit-gate flow.

Adding warning behavior now would be premature because it requires a separate contract for:

- Warning severity levels.
- Whether warnings can coexist with `COMMIT_ALLOWED`.
- Which warnings must block.
- Output fields for warnings.
- Human-review expectations for warnings.
- Fixture coverage for edge cases.

Until that contract exists, borderline or uncertain evidence must be modeled conservatively as `COMMIT_BLOCKED`.

## Privacy Rule

The session report must not dump raw evidence by default.

The human-facing structured report should include:

- Task and gate metadata.
- Decision.
- Result.
- Evidence quality.
- Missing evidence or findings.
- Allowed actions.
- Blocked actions.
- Human-review requirement.
- Next step.

Raw evidence, raw diffs, and validation output should be supplied only when explicitly required for review or when stored in dedicated validation documentation. This reduces accidental disclosure of sensitive local data, especially untracked file content, environment files, generated artifacts, or large raw diffs.

## Dynamic Timestamp Caveat

`tools/auditor/audit-session.mjs` includes a dynamic `timestamp` in the structured session report.

Implications:

- Exact full-output comparison is not stable across runs.
- Validation should compare stable semantic fields such as `decision`, `result`, `audit_metadata`, `missing_evidence`, `allowed_actions`, `blocked_actions`, `human_review_required`, and `next_step`.
- A future comparator may ignore or normalize `timestamp`.

## Current Limitations From RIC-STUDIO-055A

RIC-STUDIO-055A proved useful decision support for one allowed and one blocked realistic Commit Gate scenario, but it also exposed current limits:

- No warning or partial-confidence decision exists.
- Some protocol violations are reported through `missing_evidence`.
- The session runner trusts supplied evidence; it does not independently collect current Git state.
- The session runner emits a summary report; it is not a fixture-by-fixture validation harness.
- Dynamic timestamps make exact output snapshots unstable.
- `COMMIT_ALLOWED` is only a commit-gate recommendation and does not authorize push or Remote DONE.

## Future Implementation Candidates

Future tasks may propose narrow changes, but none are implemented by this contract.

Candidate refinements:

- Add a `protocol_findings` field to separate rule violations from missing evidence.
- Define warning or partial-confidence semantics as a separate documentation task before implementation.
- Add a semantic output comparator that ignores dynamic timestamps.
- Add structured report readability improvements without changing deterministic decisions.
- Add a read-only evidence assembly layer that collects current Git evidence and merges it with operator-provided task and validation evidence.
- Add fixtures only after the contract defines the behavior they are meant to prove.

Blocked until separately approved:

- Editing `tools/auditor/audit.mjs`.
- Editing `tools/auditor/audit-session.mjs`.
- Adding automation, hooks, CI, push automation, package changes, dependencies, runtime/model/Ollama changes, app/UI/backend changes, `.github` changes, commit, or push.

## Review Boundary

RIC-STUDIO-056A stops in REVIEW after creating this documentation contract and updating operational state.

Commit and push require separate explicit authorization.
