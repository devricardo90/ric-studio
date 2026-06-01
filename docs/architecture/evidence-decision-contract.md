# Evidence Decision Contract Architecture

## Purpose

This document defines the conceptual architecture for converting raw delivery evidence into structured RIC AI Delivery Auditor decisions.

It is a documentation-only architecture contract for RIC-STUDIO-039A. It does not implement LangChain, LangGraph, tools, automation, UI, runtime behavior, or Git operations.

## Contract Flow

The contract flow is:

1. Receive raw evidence.
2. Classify evidence type.
3. Evaluate evidence quality.
4. Match the requested gate.
5. Check minimum required evidence.
6. Apply Protocolo Rick rules.
7. Emit structured decision.
8. Require human review for state movement.

## Evidence Input Envelope

Conceptual structure:

```text
EvidenceInput
- evidence_id
- task_id
- source_type
- source_label
- captured_at
- raw_content
- declared_scope
- related_files
- supplied_by
```

Rules:

- `raw_content` must preserve the original evidence text.
- `source_type` must identify the kind of evidence supplied.
- `declared_scope` must connect evidence to an authorized task or discussion.
- Evidence without source or task context can inform discussion but cannot authorize delivery movement.

## Evidence Source Types

Supported conceptual source types:

- `task_scope`
- `current_status`
- `backlog_state`
- `git_status_short`
- `git_status_branch`
- `git_diff_stat`
- `git_diff_check`
- `file_diff`
- `validation_output`
- `remote_state`
- `human_instruction`
- `human_review_note`

Future implementation may represent these as typed schemas, but RIC-STUDIO-039A only defines the contract.

## Evidence Quality Evaluation

Each input receives one quality state:

- `missing`: required evidence is absent.
- `incomplete`: evidence does not cover the full requirement.
- `contradictory`: evidence conflicts with another input.
- `stale`: evidence is not current enough for the requested gate.
- `sufficient`: evidence is current, scoped, complete, and consistent.

Quality evaluation must be conservative. Any contradiction or missing required evidence blocks delivery advancement.

## Decision Output Envelope

Conceptual structure:

```text
AuditDecision
- decision
- task_id
- requested_gate
- result
- evidence_quality
- required_evidence
- provided_evidence
- missing_evidence
- protocol_findings
- allowed_actions
- blocked_actions
- human_review_required
- next_step
- summary
```

Rules:

- `decision` must use one allowed decision category.
- `human_review_required` is true for delivery-state movement.
- `allowed_actions` must be narrow and specific.
- `blocked_actions` must preserve all blocked implementation boundaries.
- `summary` must explain the decision without claiming evidence that was not supplied.

## Allowed Decision Categories

The MVP decision categories are:

- `COMMIT_BLOCKED`
- `COMMIT_ALLOWED`
- `LOCAL_DONE_CONFIRMED`
- `PUSH_ALLOWED`
- `REMOTE_DONE_CONFIRMED`
- `DISCUSSION_GATE_RECOMMENDED`

No other decision category is part of the RIC-STUDIO-039A contract.

## Minimum Evidence Matrix

| Decision | Minimum required evidence |
| --- | --- |
| `COMMIT_BLOCKED` | Active task scope plus evidence showing missing, incomplete, contradictory, stale, out-of-scope, or failing validation state. |
| `COMMIT_ALLOWED` | Active REVIEW state, authorized changed files, raw Git status, diff stat, diff check, per-file diffs, validation evidence, and blocked-scope confirmation. |
| `LOCAL_DONE_CONFIRMED` | Task scope, acceptance evidence, required validation output, review note, and local completion evidence. |
| `PUSH_ALLOWED` | Clean working tree, branch tracking state, local commit evidence, ahead-of-remote evidence, task association, and no uncommitted changes. |
| `REMOTE_DONE_CONFIRMED` | Clean working tree, synchronized branch state, local HEAD, remote tracking commit, HEAD equals remote evidence, and task association. |
| `DISCUSSION_GATE_RECOMMENDED` | Current request, current task state if applicable, known constraints, reason READY is not appropriate, and proposed scoping decision. |

## Protocol Findings

Conceptual structure:

```text
ProtocolFinding
- rule_id
- rule_name
- status
- evidence_refs
- explanation
```

Finding statuses:

- `pass`
- `fail`
- `not_applicable`
- `insufficient_evidence`

Protocol findings should be traceable to evidence inputs.

## Gate Behavior

### Commit Gate

The commit gate can return `COMMIT_BLOCKED` or `COMMIT_ALLOWED`.

It must not authorize commit when changed files are outside scope, raw diffs are missing, validation is missing, or `git diff --check` reports blocking errors.

### Local DONE Gate

The Local DONE gate can return `LOCAL_DONE_CONFIRMED`.

It must not imply push or Remote DONE. Local completion is separate from remote synchronization.

### Push Gate

The push gate can return `PUSH_ALLOWED`.

It requires clean local state and clear local commit evidence. It must not approve push when uncommitted files remain.

### Remote DONE Gate

The Remote DONE gate can return `REMOTE_DONE_CONFIRMED`.

It requires evidence that local HEAD and remote tracking state are synchronized.

### Discussion Gate

The Discussion Gate can return `DISCUSSION_GATE_RECOMMENDED`.

It is required when the request is not scoped enough for READY, when the task is strategic, or when implementation boundaries are unclear.

## Blocked Implementation Boundaries

This contract does not authorize:

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

## Review Boundary

RIC-STUDIO-039A stops in REVIEW after documentation updates and validation evidence.

Commit and push require separate explicit authorization.
