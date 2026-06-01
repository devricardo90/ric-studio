# RIC AI Delivery Auditor Contracts

## Purpose

This document defines the product-level evidence input and decision output contracts for the RIC AI Delivery Auditor MVP.

The goal is to make delivery decisions explicit, reviewable, and based on raw evidence before any implementation, LangChain integration, automation, UI, or runtime change exists.

## Contract Boundary

The auditor receives evidence, evaluates it against Protocolo Rick delivery rules, and returns a structured decision.

The auditor must not invent evidence, run commands implicitly, mutate repository state, perform Git operations, or promote work without human review.

## Raw Evidence Input Types

The auditor may receive these raw evidence input types:

- `task_scope`: authorized task ID, title, objective, allowed files, blocked scope, and stop state.
- `current_status`: current operational state from `STATUS.md` and `docs/ops/status.md`.
- `backlog_state`: READY, IN_PROGRESS, REVIEW, Local DONE, Remote DONE, and future-task state from backlog files.
- `git_status_short`: raw `git status --short --untracked-files=all` output.
- `git_status_branch`: raw `git status -sb` output.
- `git_diff_stat`: raw `git diff --stat` output.
- `git_diff_check`: raw `git diff --check` output.
- `file_diff`: raw per-file diff for files in the authorized scope.
- `validation_output`: raw test, build, lint, smoke, or documentation validation output when applicable.
- `remote_state`: raw branch, commit, and remote synchronization evidence when push or Remote DONE decisions are requested.
- `human_instruction`: explicit Trigger or reviewer instruction that changes scope, approves READY, or blocks execution.
- `human_review_note`: explicit reviewer acceptance, rejection, caveat, or requested correction.

## Evidence Quality States

Every evidence item should be classified with one quality state:

- `missing`: required evidence was not supplied.
- `incomplete`: evidence exists but does not cover the required files, commands, or state.
- `contradictory`: evidence conflicts with another supplied evidence item.
- `stale`: evidence is not current enough for the requested decision.
- `sufficient`: evidence is present, current, scoped, and internally consistent.

The auditor must block advancement when required evidence is missing, incomplete, contradictory, or stale.

## Structured Decision Output

The auditor should return a structured decision object with these conceptual fields:

- `decision`: one of the allowed decision categories.
- `task_id`: active task identifier.
- `requested_gate`: commit, Local DONE, push, Remote DONE, or Discussion Gate.
- `result`: allowed, blocked, confirmed, or recommended.
- `evidence_quality`: aggregate evidence quality state.
- `required_evidence`: evidence required for the requested decision.
- `provided_evidence`: evidence actually supplied.
- `missing_evidence`: required evidence not supplied or not sufficient.
- `protocol_findings`: Protocolo Rick rule checks and results.
- `blocked_actions`: actions that remain blocked.
- `allowed_actions`: actions allowed by this decision, if any.
- `human_review_required`: boolean.
- `next_step`: the next concrete human action.
- `summary`: short reviewer-facing explanation.

## Decision Categories

### COMMIT_BLOCKED

The auditor returns `COMMIT_BLOCKED` when commit authorization is requested but evidence is missing, incomplete, contradictory, stale, out of scope, or shows unresolved validation problems.

Minimum required evidence:

- Active task scope and allowed files.
- `git status --short --untracked-files=all`.
- `git diff --stat`.
- `git diff --check`.
- Raw per-file diff for every changed file intended for commit.
- Relevant validation output or explicit statement that validation is not applicable for documentation-only work.
- Confirmation that no blocked files or actions were changed.

### COMMIT_ALLOWED

The auditor returns `COMMIT_ALLOWED` when commit authorization is requested and all required evidence is sufficient.

Minimum required evidence:

- Active task is in REVIEW or equivalent review-ready state.
- Changed files are within the authorized scope.
- `git status --short --untracked-files=all` shows only expected files.
- `git diff --stat` matches the task scope.
- `git diff --check` has no blocking errors.
- Raw per-file diffs are reviewed.
- Required validation output is present and passing, or explicitly not applicable.
- Blocked scope is confirmed not performed.

### LOCAL_DONE_CONFIRMED

The auditor returns `LOCAL_DONE_CONFIRMED` when local task completion is requested and local evidence proves the task is complete but not necessarily pushed.

Minimum required evidence:

- Task scope and acceptance criteria.
- Evidence that all authorized documentation or implementation work is complete.
- Required validation output.
- Current Git state after commit, when commit is part of the task.
- Review note confirming local completion.
- Confirmation that push remains separate unless explicitly requested and authorized.

### PUSH_ALLOWED

The auditor returns `PUSH_ALLOWED` when push authorization is requested and local commit evidence is complete.

Minimum required evidence:

- Clean working tree.
- Branch tracking information from `git status -sb`.
- Local commit evidence, including commit hash or equivalent local commit confirmation.
- Evidence that local branch is ahead of the expected remote by the intended commit count.
- Confirmation that the commit belongs to the approved task.
- Confirmation that no additional uncommitted changes exist.

### REMOTE_DONE_CONFIRMED

The auditor returns `REMOTE_DONE_CONFIRMED` when remote completion is requested and evidence proves the pushed work is synchronized.

Minimum required evidence:

- Clean working tree.
- `git status -sb` showing local branch synchronized with remote.
- Local HEAD commit.
- Remote tracking commit.
- Evidence that local HEAD equals remote tracking branch.
- Task ID associated with the pushed commit.
- Confirmation that no follow-up push is pending.

### DISCUSSION_GATE_RECOMMENDED

The auditor returns `DISCUSSION_GATE_RECOMMENDED` when the next step requires scope definition, task decomposition, product decision, architecture decision, or explicit human approval before READY.

Minimum required evidence:

- Current request or idea.
- Current task state, if any.
- Known constraints or blocked scope.
- Reason READY is not yet appropriate.
- Proposed discussion questions or next scoping decision.

## Blocked Implementation Boundaries

RIC-STUDIO-039A does not authorize:

- App scaffold.
- LangChain implementation.
- Dependencies.
- Package files.
- Runtime changes.
- Modelfile changes.
- GitHub API integration.
- UI.
- Automation.
- Commit.
- Push.

## Validation Contract

Before RIC-STUDIO-039A can be reviewed, evidence must include:

- `git status --short --untracked-files=all`.
- `git status -sb`.
- `git diff --stat`.
- `git diff --check`.
- Raw diff for every changed file.
- Negative confirmations for all blocked scope.
