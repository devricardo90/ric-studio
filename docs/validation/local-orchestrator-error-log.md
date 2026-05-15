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

No real local orchestrator errors are logged yet for this task.

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
