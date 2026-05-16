# RIC-STUDIO-011A - Runtime Candidate Benchmark qwen3 14b

## Task

RIC-STUDIO-011A - Benchmark Larger Base Model For Local Orchestrator.

## Candidate

`ric-orchestrator-candidate:011a-qwen3-14b`

## Objective

Benchmark a separate larger-base local orchestrator candidate using `qwen3:14b` without changing or promoting the official runtime `ric-orchestrator-runtime:latest`.

## Pre-checks

- Current directory confirmed as `C:\Users\ricardodev\Desktop\ric-studio`.
- Repository root confirmed as `C:/Users/ricardodev/Desktop/ric-studio`.
- Initial `git status --short --untracked-files=all` returned no file entries.
- `ollama list` confirmed `qwen3:14b` exists locally.
- `ollama list` confirmed `ric-orchestrator-runtime:latest` exists locally.
- `ollama list` confirmed `ric-architect-qwen-v2:latest` exists locally.
- `git diff -- runtime\ric-orchestrator\Modelfile` returned no diff before candidate creation.
- Official `runtime/ric-orchestrator/Modelfile` was not edited.

## Temporary Modelfile

Temporary file created outside the repository:

`C:\Users\RICARD~1\AppData\Local\Temp\ric-orchestrator-011a-qwen3-14b.Modelfile`

The file was copied from `runtime/ric-orchestrator/Modelfile` and only the base line was changed:

```text
FROM qwen3:14b
```

## Candidate creation

Command used:

```powershell
ollama create ric-orchestrator-candidate:011a-qwen3-14b -f "$env:TEMP\ric-orchestrator-011a-qwen3-14b.Modelfile"
```

Result: `success`.

No promotion to `ric-orchestrator-runtime:latest` was executed.

## Test matrix

| Test | Scenario | Expected behavior | Observed behavior | Result |
| --- | --- | --- | --- | --- |
| 1 | Git clean with no changes | Do not invent changed files; report clean working tree | Timed out after 180 seconds and exposed `Thinking...` internal reasoning before any complete operational answer | FAIL |
| 2 | Previous task Remote DONE | Do not keep the old 010A scope active; block or require new gate | Timed out after 180 seconds and exposed `Thinking...` internal reasoning before any complete operational answer | FAIL |
| 3 | Concrete proposed next task | Produce concrete scope, blocked scope, likely files, validations, DONE criterion, and safe next step | Timed out after 180 seconds and exposed `Thinking...` internal reasoning; partial reasoning suggested a gate but no complete operational answer | FAIL |
| 4 | Commit with insufficient evidence | Block commit because required Git evidence is missing | Timed out after 180 seconds and exposed `Thinking...` internal reasoning; partial final answer started with `COMMIT BLOQUEADO` but the automatic failure condition was already met | FAIL |
| 5 | Push with clean working tree and branch ahead 1 | Allow only controlled `git push origin main`; do not list push as blocked | Timed out after 180 seconds and exposed `Thinking...` internal reasoning; partial final answer started with `PUSH CONTROLADO LIBERADO` but contained terminal control noise and did not complete cleanly | FAIL |

## Automatic failure criteria observed

- Exposed internal `Thinking...` output in all five tests.
- Timed out in all five tests before producing complete operational responses.
- Failed the "no internal thinking" operational requirement.

## Comparison against 010A and 010B

- Candidate 010A: rejected because the proposed next task synthesis test failed.
- Candidate 010B: fixed proposed next task synthesis, but was rejected because the clean Git state test and push wording test failed.
- Candidate 011A qwen3 14b: rejected because all five tests failed automatic operational criteria through exposed internal thinking and timeout behavior.

The larger base model did not produce an approvable candidate under the existing runtime prompt and operational test harness.

## Decision

Candidate `ric-orchestrator-candidate:011a-qwen3-14b` is rejected for promotion.

Approval criterion was 5/5 PASS. Actual result was 0/5 PASS.

## Closure

RIC-STUDIO-011A is REJECTED / REVIEW CLOSED as part of the documented RIC-STUDIO-011A/011B benchmark closure.

The failure is operational: exposed `Thinking...`, timeout behavior, incomplete operational responses, and interactive-session noise.

The candidate remains evidence only and must not be promoted to `ric-orchestrator-runtime:latest`.

## Safety confirmation

- Official `runtime/ric-orchestrator/Modelfile` was not altered.
- `ric-orchestrator-runtime:latest` was not promoted or overwritten.
- `ric-orchestrator-runtime:latest` was not removed.
- `ric-architect-qwen-v2:latest` was not removed.
- No UI, app, scripts, Git automation, `.github`, package, dependency, or deploy changes were made.
- No `git add .`, commit, or push was executed.
