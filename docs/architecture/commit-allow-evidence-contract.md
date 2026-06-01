# Commit Allow Evidence Contract

## Purpose

This document defines the minimum evidence contract required before a future local auditor CLI implementation may return `COMMIT_ALLOWED`.

This is a documentation-only contract for RIC-STUDIO-042A. It does not implement `COMMIT_ALLOWED`, change `tools/auditor/audit.mjs`, add dependencies, add a test runner, automate Git, or authorize commit by itself.

## Decision Boundary

`COMMIT_ALLOWED` is a future commit gate decision. It may only be returned when the auditor has complete, current, scoped, and internally consistent evidence that a specific task is in the expected pre-commit state and that the proposed commit contains only authorized changes.

When evidence is missing, incomplete, contradictory, stale, out of scope, or failing validation, the auditor must return `COMMIT_BLOCKED`.

## Required Input Fields

A future `COMMIT_ALLOWED` evaluation requires these top-level input fields:

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

- `task_id` must identify the active task being reviewed.
- `requested_gate` must be `commit`.
- `expected_state_before_commit` must match the required lifecycle state for commit review, normally `REVIEW`.
- `allowed_files` must list every path that may be committed.
- `blocked_files` and `blocked_actions` must preserve explicit scope boundaries.
- `implementation_summary` must describe the completed work without claiming evidence that is not present.

## Optional Input Fields

Optional fields may improve audit quality but cannot replace required evidence:

- `operator_notes`
- `review_notes`
- `known_warnings`
- `line_ending_notes`
- `environment_notes`
- `related_commits`
- `previous_task_state`
- `remote_tracking_context`
- `timestamp`

Optional fields are advisory. They must not override raw Git evidence, raw validation output, or blocked-scope rules.

## Required Git Evidence

The following raw Git evidence is required:

- `git status --short --untracked-files=all`
- `git status -sb`
- `git diff --stat`
- `git diff --check`
- Raw per-file diffs for every changed tracked file.
- Raw new-file diffs or full file contents for every untracked file proposed for commit.
- Validation command outputs for all task-required validation commands.

Rules:

- `git status --short --untracked-files=all` must show all modified and untracked files.
- `git status -sb` must show the branch and tracking relationship.
- `git diff --stat` must be interpreted with awareness that untracked files may not appear until staged or separately diffed.
- `git diff --check` must have no whitespace errors.
- Raw per-file diffs must be complete enough for a reviewer to inspect the actual change.

## Required Task Evidence

The task evidence must include:

- `task_id`
- `requested_gate`
- Expected state before commit.
- Allowed files.
- Blocked files and blocked actions.
- Implementation summary.

Rules:

- The task must be the current active task or explicitly identified as the task under commit review.
- The expected state before commit must be consistent with the operational docs.
- Every changed file must be covered by allowed scope.
- Any changed file outside the allowed list blocks `COMMIT_ALLOWED`.
- Blocked actions must remain blocked after the decision.

## Required Validation Evidence

Validation evidence must include:

- Validation commands executed.
- Raw outputs for each validation command.
- Pass/fail interpretation for each command.
- Explanation of any warnings or caveats.

Rules:

- Required validation commands must be run after the final file changes.
- Raw outputs must be current and must correspond to the final worktree state.
- A passing process exit alone is not enough when the output shows failed assertions, errors, missing evidence, or contradictory state.
- Any required validation that is not run blocks `COMMIT_ALLOWED` unless the task explicitly states it is not applicable and the reviewer accepts that explanation.

## Untracked File Rules

Untracked files are allowed only when all of the following are true:

- They are explicitly listed in the task allowed files or expected created files.
- `git status --short --untracked-files=all` shows them.
- Their full raw content is included through raw new-file diffs, `git diff --no-index`, or equivalent complete evidence.
- They are necessary for the task result.

Untracked files block `COMMIT_ALLOWED` when:

- They are outside the allowed scope.
- Their raw content is missing from evidence.
- They are generated artifacts, temporary files, local secrets, dependency files, build output, or unrelated files.
- Their purpose is unclear.

Untracked file evidence must name each path exactly as Git reports it.

## CRLF And Whitespace Rules

CRLF warnings are acceptable when:

- `git diff --check` exits without whitespace errors.
- The warnings are line-ending normalization warnings only.
- The affected files are within scope.
- No task-specific rule requires preserving exact line endings.

Whitespace errors block `COMMIT_ALLOWED` when:

- `git diff --check` reports trailing whitespace, space-before-tab, conflict markers, or another check failure.
- The output includes an error that requires file correction.
- The warning or error affects an out-of-scope file.

CRLF warnings must be reported in the evidence summary when present.

## Always-Block Conditions

The auditor must return `COMMIT_BLOCKED`, not `COMMIT_ALLOWED`, when any of these conditions exists:

- `requested_gate` is not `commit`.
- `task_id` is missing or does not match the task under review.
- The task is not in the expected pre-commit state.
- Required Git status evidence is missing.
- Required raw diffs are missing or incomplete.
- Required validation output is missing.
- Any required validation fails.
- `git diff --check` reports whitespace errors.
- Changed files are outside allowed scope.
- Untracked files are outside allowed scope or lack raw content evidence.
- Evidence contradicts operational docs.
- Evidence is stale or not tied to the final worktree state.
- The implementation includes blocked actions.
- The task requests or implies push, Remote DONE, or lifecycle advancement beyond commit review.
- Human review is required and has not occurred.

## Future COMMIT_ALLOWED Output Shape

A future `COMMIT_ALLOWED` response should use structured JSON:

```json
{
  "decision": "COMMIT_ALLOWED",
  "task_id": "RIC-STUDIO-XXXX",
  "requested_gate": "commit",
  "result": "allowed",
  "evidence_quality": "sufficient",
  "required_evidence": [],
  "provided_evidence": [],
  "missing_evidence": [],
  "protocol_findings": [],
  "allowed_actions": ["commit"],
  "blocked_actions": ["push", "remote_done"],
  "human_review_required": true,
  "next_step": "Commit only the explicitly scoped files after human approval.",
  "summary": ""
}
```

Rules:

- `allowed_actions` must include only `commit`.
- `push` and `remote_done` must remain blocked.
- `human_review_required` must remain true.
- `summary` must describe the evidence without inventing command output.

## Explicit Non-Goals

This contract does not:

- Implement `COMMIT_ALLOWED`.
- Implement `PUSH_ALLOWED`.
- Implement `LOCAL_DONE_CONFIRMED`.
- Change `tools/auditor/audit.mjs`.
- Add fixtures.
- Run smoke validation for `COMMIT_ALLOWED`.
- Add dependencies.
- Create or edit `package.json`.
- Add a test runner.
- Create app scaffold.
- Add TypeScript setup.
- Create UI.
- Add Next.js.
- Add LangChain.
- Add LangGraph.
- Add GitHub API integration.
- Add automation.
- Change runtime files.
- Alter any `Modelfile`.
- Authorize commit or push.

## Review Boundary

RIC-STUDIO-042A stops in REVIEW after this documentation-only contract update.

Commit and push require separate explicit authorization.
