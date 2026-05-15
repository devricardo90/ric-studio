# Local Orchestrator Error Log

## Task

RIC-STUDIO-009A - Define Local Orchestrator Error Log

## Purpose

This document defines the operational log for real local model behavior errors observed while using the RIC Local Orchestrator.

The purpose is to collect evidence before changing the runtime. Isolated non-critical errors must be logged, grouped, and reviewed as patterns before any future runtime improvement is proposed.

## Operating Rule

No official runtime change is authorized from one isolated error.

A future runtime improvement may be proposed only when one of these conditions is met:

- 3 to 5 logged occurrences show the same error pattern.
- 1 critical operational safety error occurs, such as allowing an unauthorized commit or push.

## What Counts As An Error

An entry may be recorded when the local orchestrator:

- Allows an operation that should remain blocked.
- Blocks an operation that has complete evidence and is inside authorized scope.
- Uses a non-official decision label.
- Recommends an unsafe command, such as broad Git staging when scoped files are known.
- Contradicts the current task state, scope, or evidence.

## Severity

| Severity | Meaning | Runtime improvement allowed immediately? |
| --- | --- | --- |
| Low | Wording issue, minor friction, or unclear explanation with no unsafe action. | No. Log and wait for pattern evidence. |
| Medium | Incorrect block or incorrect allow that does not create operational safety risk. | No. Log and wait for pattern evidence. |
| High | Repeated gate decision failure that affects commit, push, Local DONE, or Remote DONE decisions. | Only after 3 to 5 matching occurrences. |
| Critical | Operational safety failure, including unauthorized commit, unauthorized push, runtime promotion, or destructive action approval. | Yes. One occurrence is enough to propose a runtime improvement task. |

## Pattern Classification

Use one of these pattern labels:

- `commit-overblock`
- `commit-underblock`
- `push-overblock`
- `push-underblock`
- `local-done-error`
- `remote-done-error`
- `unsafe-command`
- `wrong-label`
- `state-contradiction`
- `scope-confusion`
- `other`

## Entry Template

Copy this template for each real occurrence.

```text
### ERROR-YYYYMMDD-001

Date:
Task:
Runtime:
Pattern:
Severity:

Context:

Expected decision:

Observed decision:

Evidence provided:

Why this is an error:

Immediate action:

Pattern count after this entry:

Runtime improvement allowed:
No, unless this is critical or the same pattern has reached 3 to 5 occurrences.
```

## Error Entries

## Current Pattern Summary

Observed pattern counts after CBM-004:

- `state-contradiction`: 2
- `scope-confusion`: 1

Runtime improvement remains blocked because no critical error has occurred and no repeated pattern has reached the 3 to 5 occurrence threshold.

### ERROR-20260515-001

Date: 2026-05-15

Project: clinic-booking-mini

Task: CBM-004

Runtime: `ric-orchestrator-runtime:latest`

Pattern: `scope-confusion`

Severity: Low

Context:

During CBM-004 Discussion Gate, the orchestrator said CBM-004 involved changes in models.

Expected decision:

Recognize CBM-004 as Django Admin registration only.

Observed decision:

It described the task as involving model changes.

Evidence provided:

The CBM-004 task scope was explicitly about registering existing models in Django Admin.

Why this is an error:

CBM-004 was explicitly about registering existing models in Django Admin, not editing `scheduling/models.py`.

Immediate action:

Human corrected the scope and continued.

Pattern count after this entry:

`scope-confusion`: 1

Runtime improvement allowed:

No. This was an isolated non-critical error.

### ERROR-20260515-002

Date: 2026-05-15

Project: clinic-booking-mini

Task: CBM-004

Runtime: `ric-orchestrator-runtime:latest`

Pattern: `state-contradiction`

Severity: Medium

Context:

The orchestrator returned DISCUSSION GATE RECOMENDADO while also listing files as altered.

Expected decision:

If no execution happened, it should not list altered files.

Observed decision:

It claimed altered files existed, but raw Git evidence showed a clean working tree.

Evidence provided:

`git status`, `git diff --stat`, `git diff --name-only`, and `git diff -- scheduling/admin.py` produced no changes.

Why this is an error:

The orchestrator contradicted the task state and raw Git evidence by claiming altered files existed when no execution had happened.

Immediate action:

Human checked raw Git evidence and blocked commit/push.

Pattern count after this entry:

`state-contradiction`: 1

Runtime improvement allowed:

No. This was an isolated non-critical/medium error.

### ERROR-20260515-003

Date: 2026-05-15

Project: clinic-booking-mini

Task: CBM-004

Runtime: `ric-orchestrator-runtime:latest`

Pattern: `state-contradiction`

Severity: Medium

Context:

After CBM-004 was approved as READY, the orchestrator returned REVIEW and listed altered files/evidence commands, but no files were changed and no raw command output was provided.

Expected decision:

Either execute the approved scope and provide real raw evidence, or state that no execution was performed.

Observed decision:

It acted as if CBM-004 had been executed.

Evidence provided:

Manual Git checks showed working tree clean and no diff.

Why this is an error:

The orchestrator contradicted repository state by presenting an execution/review state without real file changes or raw command output.

Immediate action:

Human moved execution to Codex/IDE and kept the orchestrator for gates/review.

Pattern count after this entry:

`state-contradiction`: 2

Runtime improvement allowed:

No. This is a second similar occurrence, but still below the 3 to 5 threshold and no critical error occurred.

## Blocked In This Task

- Editing `runtime/ric-orchestrator/Modelfile`.
- Creating an Ollama model.
- Promoting a runtime.
- Deleting runtime candidates.
- Changing scripts.
- Changing app or UI files.
- Changing packages or dependencies.
- Automating Git.
- Committing without review.
- Pushing.
