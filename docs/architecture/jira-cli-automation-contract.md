# Jira CLI Automation Contract

## Purpose

This document defines the safe contract for future Jira automation inside RIC Studio.

The purpose of Jira automation is to reduce manual operational friction around task visibility, status updates, and evidence capture while preserving Protocol Rick gates, Git review gates, and Ricardo final authority.

This is a documentation-only contract for RIC-STUDIO-074A. It does not implement a Jira API client, Jira CLI, automation runtime, credential store, GitHub integration, GitHub Actions workflow, package change, runtime change, app change, or UI change.

## Authority Boundary

Jira automation is operational support only. It must not become an autonomous delivery authority.

RIC Studio may eventually use an orchestrator agent and a CLI/API layer to prepare or execute narrow Jira actions, but only within the approval and evidence rules in this document.

The hard boundary is:

- Jira state may support the delivery lifecycle.
- Jira state must not replace Git evidence.
- Jira state must not replace local validation evidence.
- Jira state must not replace Commit Gate or Push Gate.
- Jira state must not declare work DONE without Ricardo final validation.

## Automation Modes

Future Jira automation has four separate modes:

1. Proposal.
2. Dry-run.
3. Execution.
4. Final human validation.

These modes must remain separate in both documentation and any future implementation.

### Proposal

Proposal mode describes a possible Jira action without preparing an executable command.

Allowed proposal examples:

- Propose moving an approved task from Backlog to Ready.
- Propose moving an active task from Ready to In Progress.
- Propose moving a completed local task from In Progress to Review.
- Propose adding evidence links or review notes.
- Propose blocking a task when evidence is missing or contradictory.

Proposal mode must include the reason, required evidence, missing evidence, and required human approval.

### Dry-Run

Dry-run mode prepares the exact intended Jira operation without changing Jira.

Dry-run output must include:

- Task id.
- Jira issue key.
- Current Jira status if known.
- Requested target status.
- Proposed fields or comments to change.
- Evidence references.
- Approval requirement.
- Blocked actions that remain blocked.
- Statement that no Jira write occurred.

Dry-run-first is mandatory for future Jira CLI automation. Any real Jira write must have a prior dry-run for the exact operation being executed.

### Execution

Execution mode is a future capability only. It may perform approved Jira writes after dry-run review and explicit approval.

Execution must be narrow, evidence-bound, and auditable. It must refuse to run when the dry-run evidence is stale, incomplete, contradictory, or outside the approved scope.

### Final Human Validation

Final human validation belongs to Ricardo. It cannot be delegated to the orchestrator, executor, auditor, Jira, Git, or a CLI/API layer.

DONE must never be automated without Ricardo final validation.

## Jira Actions That May Be Automated Later

The following actions may be candidates for future automation after separate implementation approval:

- Read Jira issue metadata.
- Read current issue status.
- Read issue summary, description, labels, and links.
- Produce a dry-run transition plan.
- Add evidence comments after approval.
- Add review notes after approval.
- Move an approved task from Backlog to Ready.
- Move an approved task from Ready to In Progress.
- Move an executed task from In Progress to Review when evidence is complete.
- Mark a task as blocked when required evidence is missing, contradictory, or failing.

These actions remain future scope. RIC-STUDIO-074A only defines the contract.

## Jira Actions Requiring Ricardo Approval

These actions require explicit Ricardo approval before execution:

- Creating a Jira issue.
- Changing issue status.
- Editing issue summary, description, labels, priority, assignee, sprint, or due date.
- Adding comments that represent delivery status.
- Moving a task from Backlog to Ready.
- Moving a task from Ready to In Progress.
- Moving a task from In Progress to Review.
- Moving a task from Review to Done.
- Reopening a Done task.
- Marking a task blocked when it affects planning or priority.

Ricardo approval must be explicit, current, and scoped to the exact issue and target action.

## Status Transition Rules

### Backlog

Backlog means the work is known but not approved for execution.

Automation may propose Backlog updates or read Backlog tasks. It must not silently create Backlog items or silently move Backlog work into Ready.

Backlog to Ready requires:

- A defined task.
- Approved scope.
- Allowed files or affected areas.
- Forbidden scope.
- Validation requirements.
- Ricardo approval.

### Ready

Ready means the task has been approved for execution but implementation has not started.

Automation may propose or dry-run the transition to Ready. A future guarded CLI may execute the transition only after Ricardo approval.

Ready to In Progress requires:

- Current Jira issue identity.
- Current repository baseline.
- Confirmed task scope.
- Confirmation that no unrelated READY task is being opened.
- Ricardo approval or an explicitly approved execution instruction.

### In Progress

In Progress means execution has started.

Automation may eventually move Ready to In Progress after dry-run approval. It must not start implementation itself.

In Progress to Review requires:

- Completed implementation or documentation work.
- Raw Git status evidence.
- Raw diff evidence.
- Required validation output.
- Confirmation that blocked scope was not touched.
- Evidence that the task did not self-authorize Commit Gate, Push Gate, or DONE.

### Review

Review means execution stopped for human evidence review, Commit Gate, Push Gate, and manual validation as applicable.

Automation may add evidence comments or move In Progress to Review after approval when evidence is complete.

Review to Done requires:

- Complete review evidence.
- Commit Gate result when a commit is required.
- Push Gate result when push is required.
- Post-push remote evidence when remote completion is claimed.
- Ricardo final validation.

### Done

Done means Ricardo has finally validated the work or explicitly accepted it with a caveat.

DONE must never be automated without Ricardo final validation.

Commit, push, CI success, Jira status, auditor output, or orchestrator output is not enough to mark Done.

## Evidence Required Before Jira Transition

Every Jira transition requires an evidence packet.

Minimum evidence:

- Task id.
- Jira issue key.
- Current Jira status.
- Requested target status.
- Reason for transition.
- Current repository branch.
- `git status --short --untracked-files=all` when repository state matters.
- `git status -sb` when repository state matters.
- `git diff --name-status` or equivalent changed-file evidence when worktree changes matter.
- `git diff --stat` when worktree changes matter.
- `git diff --check` when commit review matters.
- Validation commands and raw outputs when validation is required.
- Allowed files or allowed areas.
- Blocked files or blocked areas.
- Confirmation that no package, lockfile, runtime/model, app/UI, script, token, or credential boundary was violated unless the task explicitly allowed it.
- Human approval evidence for approval-gated transitions.

Evidence must be current. Stale evidence blocks transition.

## Audit Log Requirements

Any future Jira automation must produce an audit log entry for every proposal, dry-run, execution, blocked action, or failure.

Audit log entries must include:

- Timestamp.
- Actor or initiating agent.
- Mode: proposal, dry-run, execution, validation, blocked, or failure.
- Task id.
- Jira issue key.
- Current status.
- Requested status.
- Evidence references.
- Approval reference.
- Exact command or API operation in dry-run form when applicable.
- Result.
- Error details when failed.
- Statement of whether Jira was changed.

Audit logs must not include tokens, secrets, credentials, cookies, private API responses containing secrets, or raw environment files.

## Credential And Token Safety

Credentials and tokens must not be committed.

Future implementation must follow these rules:

- Do not store Jira tokens in the repository.
- Do not write tokens to documentation.
- Do not print tokens in logs.
- Do not include tokens in audit logs.
- Do not use checked-in `.env` files for secrets.
- Do not add credentials to examples.
- Do not ask the orchestrator agent to invent credentials.
- Do not continue if credential source is missing, ambiguous, or unsafe.

Any detected token, credential, secret, or sensitive environment value must block the Jira automation action.

## Failure And Blocking Behavior

Jira automation must fail closed.

It must block when:

- Required evidence is missing.
- Evidence is contradictory.
- Evidence is stale.
- The current Jira status is unknown.
- The requested transition is not allowed.
- Ricardo approval is required and absent.
- Git state does not match the claimed task state.
- Validation failed or was not run.
- Changed files exceed the approved scope.
- Package, lockfile, runtime/model, app/UI, script, token, or credential boundaries are violated.
- Jira reports an unexpected state.
- The CLI/API operation returns an error.
- The automation cannot prove whether a write occurred.

Failure output must state what was blocked, why it was blocked, what evidence is missing, and whether any external Jira state may have changed.

## Git State And Jira State

Git state and Jira state must remain separate evidence sources.

Jira may show task planning state. Git shows repository state. Neither one overrides the other.

Rules:

- A clean Git tree does not make Jira Done.
- A Jira Done status does not prove Git is clean or pushed.
- A commit does not automatically move Jira to Done.
- A push does not automatically move Jira to Done.
- Review state in Jira must correspond to review evidence in the repository or documented external evidence.
- Done requires Ricardo final validation after Git and validation evidence are reviewed.

## Agent Roles

### Orchestrator

The Orchestrator may propose Jira actions, request evidence, evaluate gates, prepare dry-runs, and block unsafe transitions.

The Orchestrator must not silently execute approval-gated Jira writes or mark DONE without Ricardo validation.

### Executor

The Executor performs approved task work. It must not use Jira automation to bypass scope, Commit Gate, Push Gate, or Ricardo validation.

### Auditor

The Auditor evaluates evidence and gate readiness. It may support transition decisions but does not own final business validation.

### Ricardo

Ricardo approves task movement when approval is required and owns final validation for DONE.

## Future Implementation Phases

### Phase 1: Contract Only

Document the safety contract. No CLI, API, token, credential, runtime, package, or UI work.

RIC-STUDIO-074A is Phase 1 only.

### Phase 2: Dry-Run CLI

Future approved work may create a CLI that reads local evidence and prints intended Jira operations without writing to Jira.

Dry-run output must be reviewable before any real Jira action exists.

### Phase 3: Guarded Real CLI

Future approved work may add narrowly scoped Jira writes after dry-run review, explicit approval, credential safety controls, and audit logging.

The guarded CLI must still fail closed and must not automate DONE without Ricardo validation.

### Phase 4: Optional API Integration Later

Future approved work may integrate directly with Jira APIs if the CLI boundary proves useful and safe.

API integration must preserve the same contract, evidence, approval, audit, and credential rules.

## Forbidden Automation

The following automation is forbidden:

- Automatic DONE.
- Hidden Jira transitions.
- Credential commit.
- Token commit.
- Silent issue creation.
- Automatic next task without Discussion Gate or explicit approval.
- Bypassing Commit Gate.
- Bypassing Push Gate.
- Replacing Ricardo final validation with Jira status.
- Writing Jira state when dry-run evidence is missing.
- Writing Jira state when approval is required but absent.
- Using GitHub API or GitHub Actions as part of this contract task.

## RIC-STUDIO-074A Boundary

RIC-STUDIO-074A defines the contract only.

It creates no Jira API implementation, CLI script, automation runtime, token, credential store, package change, lockfile change, dependency installation, runtime/model change, app/UI change, GitHub API integration, GitHub Actions workflow, commit, push, or automatic Jira transition.
