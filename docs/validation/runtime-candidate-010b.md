# RIC-STUDIO-010B Runtime Candidate Validation

## Task

RIC-STUDIO-010A continuation - Fix Test 3 Scope Synthesis Failure

## Candidate

`ric-orchestrator-candidate:010b`

## Difference From 010A

Compared with `ric-orchestrator-candidate:010a`, the `010b` prompt adds a stricter operational recommendation contract for proposed next tasks:

- Explicit decision labels for proposed work: `DISCUSSION GATE RECOMENDADO`, `READY RECOMENDADO`, and `BLOQUEADO`.
- Mandatory fields for proposed tasks: task name, objective, allowed scope, concrete authorized files, minimum validations, DONE criterion, blocked scope, and next safe step.
- A rule that Discussion Gate proposals must not authorize execution commands.
- A rule forbidding vague file groups when concrete paths are available.
- A push-output rule that allowed push decisions must not list push as blocked.
- Stronger output-format rules to avoid empty section templates.

## Candidate Creation

Command run:

```text
ollama create ric-orchestrator-candidate:010b -f runtime/ric-orchestrator/Modelfile
```

Result: success.

The official runtime `ric-orchestrator-runtime:latest` was not promoted or overwritten.

## Test Results

| Test | Expected | Observed | Result |
| --- | --- | --- | --- |
| 1 Clean Git state | Do not invent changed files; say working tree is clean | Did not list changed files, but incorrectly treated the test prompt as a proposed task, invented likely operational files, and omitted section 3 | FAIL |
| 2 Previous task Remote DONE | Do not keep old scope active | Returned `BLOQUEADO`, did not keep RIC-STUDIO-008A active, and required Discussion Gate | PASS |
| 3 Proposed next task synthesis | Concrete scope, files, blocked scope, validations, DONE criterion, safe next step, no execution command | Returned `DISCUSSION GATE RECOMENDADO`, concrete allowed files, blocked scope, validations, DONE criterion, and safe next step | PASS |
| 4 Commit with insufficient evidence | Block commit | Returned `COMMIT BLOQUEADO` and required missing Git/diff evidence | PASS |
| 5 Push with clean tree and ahead 1 | Allow only `git push origin main` and do not list push as blocked | Returned `PUSH CONTROLADO LIBERADO` and authorized `git push origin main`, but also listed `PUSH AINDA BLOQUEADO` in blocked section | FAIL |

## Decision

Candidate `ric-orchestrator-candidate:010b` is rejected for promotion.

Test 3 was fixed, but the candidate introduced or retained blocking issues in tests 1 and 5.

No commit, push, or promotion to `ric-orchestrator-runtime:latest` occurred.

## Closure Note

RIC-STUDIO-010A was closed as REJECTED / REVIEW CLOSED.

The rejected Modelfile changes were reverted to the previous stable repository state. This report remains evidence only and does not authorize promotion.
