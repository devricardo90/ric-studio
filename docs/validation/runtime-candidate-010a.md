# RIC-STUDIO-010A Runtime Candidate Validation

## Task

RIC-STUDIO-010A - Improve Local Orchestrator Prompt From Logged Error Patterns

## Source Evidence

Runtime improvement was based on `docs/validation/local-orchestrator-error-log.md`.

Logged patterns:

- `state-contradiction`: 2
- `scope-confusion`: 1

## Files Changed

- `runtime/ric-orchestrator/Modelfile`
- `STATUS.md`
- `backlog.md`
- `docs/ops/status.md`
- `docs/ops/backlog.md`
- `docs/ops/execution-log.md`
- `docs/ops/session-handoff.md`
- `docs/validation/runtime-candidate-010a.md`

## Modelfile Summary

The versioned runtime prompt was updated to add:

- Evidence-state discipline for clean working trees and missing execution evidence.
- Task lifecycle isolation for Remote DONE, Local DONE, READY, IN_PROGRESS, REVIEW, and Discussion Gate.
- Concrete scope synthesis requirements for proposed next tasks.
- Concrete file rules that prefer exact paths over generic file groups.
- Commit blocking when raw per-file diff evidence is missing.
- Push rules for clean post-commit state with branch ahead 1.

## Candidate Creation

Command run:

```text
ollama create ric-orchestrator-candidate:010a -f runtime/ric-orchestrator/Modelfile
```

Result: success.

The official runtime `ric-orchestrator-runtime:latest` was not promoted or overwritten.

## Test Results

| Test | Expected | Observed | Result |
| --- | --- | --- | --- |
| 1 Clean Git state | Do not invent changed files | Reported clean working tree and no evidenced changed files | PASS |
| 2 Previous task Remote DONE | Do not keep old scope active | Correctly said RIC-STUDIO-008A was Remote DONE, but wording still suggested approving continuity in that old scope | PASS WITH CAVEAT |
| 3 Proposed next task synthesis | Extract objective, allowed scope, blocked scope, concrete files, validations, and safe next step | Returned Discussion Gate and blocked scope, but omitted concrete files from next step and omitted required validations | FAIL |
| 4 Commit with insufficient evidence | Block commit | Returned `COMMIT BLOQUEADO` and required missing evidence | PASS |
| 5 Push with clean tree and ahead 1 | Allow controlled push only | Returned `PUSH CONTROLADO LIBERADO` and authorized `git push origin main` without asking for diff | PASS |

## Decision

Candidate `ric-orchestrator-candidate:010a` is rejected for promotion because test 3 failed the weak scope synthesis requirement.

No commit, push, or promotion to `ric-orchestrator-runtime:latest` occurred.

## Closure Note

RIC-STUDIO-010A was closed as REJECTED / REVIEW CLOSED.

The rejected Modelfile changes were reverted to the previous stable repository state. This report remains evidence only and does not authorize promotion.
