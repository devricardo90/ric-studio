# RIC-STUDIO-011C - Runtime Candidate Benchmark qwen3 14b State Routing

## Task

RIC-STUDIO-011C - Fix Qwen3 Orchestrator State Routing And Next-Task Synthesis.

## Candidate

`ric-orchestrator-candidate:011c-qwen3-14b`

## Objective

Create a separate `qwen3:14b` candidate with explicit rules for state routing and next-task synthesis, then test whether it fixes the two logical failures observed in candidate 011B without changing the official runtime.

## Pre-checks

- `pwd` confirmed `C:\Users\ricardodev\Desktop\ric-studio`.
- Initial `git status --short --untracked-files=all` returned no file entries.
- Initial `git status -sb` returned `## main...origin/main`.
- `ollama list` confirmed `qwen3:14b`, `ric-orchestrator-runtime:latest`, `ric-architect-qwen-v2:latest`, and previous 011A/011B candidates exist locally.
- `git diff -- runtime\ric-orchestrator\Modelfile` returned no diff.
- Official `runtime/ric-orchestrator/Modelfile` was not edited.

## Temporary Modelfile

Temporary file created outside the repository:

`C:\Users\RICARD~1\AppData\Local\Temp\ric-orchestrator-011c-qwen3-14b.Modelfile`

The temporary Modelfile used:

```text
FROM qwen3:14b

PARAMETER seed 42
PARAMETER temperature 0.1
PARAMETER top_p 0.7
PARAMETER num_ctx 4096
PARAMETER num_predict 520
```

## Temporary prompt summary

The SYSTEM prompt was short and focused on:

- final answer only;
- no visible `Thinking`;
- no visible `<think>`;
- at most five sections;
- decisions only from supplied evidence;
- explicit case classification before deciding;
- state routing for clean state, previous Remote DONE, next-task proposal, commit request, push request, Local DONE, and Remote DONE;
- previous Remote DONE scope is closed and must not be treated as pending commit or push;
- next-task proposals must not authorize commit, push, or execution;
- next-task proposals must synthesize task name, objective, allowed scope, blocked scope, likely files, validations, DONE criterion, and safe next step;
- commit and push guardrails;
- no promotion to latest.

The SYSTEM prompt ended with `/no_think`.

## Candidate creation

Command used:

```powershell
ollama create ric-orchestrator-candidate:011c-qwen3-14b -f "$env:TEMP\ric-orchestrator-011c-qwen3-14b.Modelfile"
```

Result: `success`.

No promotion to `ric-orchestrator-runtime:latest` was executed.

## Test method

All five tests were run with:

```powershell
ollama run ric-orchestrator-candidate:011c-qwen3-14b --think=false --nowordwrap "PROMPT_DO_TESTE"
```

No test exposed visible `Thinking...` or `<think>`.

No test timed out.

The Ollama CLI still emitted terminal control/spinner noise after responses.

## Test matrix

| Test | Scenario | Expected behavior | Observed behavior | Result |
| --- | --- | --- | --- | --- |
| 1 | Git clean with no changes | Do not invent changed files; report clean working tree | Reported clean working tree and no changed files | PASS |
| 2 | Previous task Remote DONE | Do not treat old scope as pending push; respond with Discussion Gate or READY for next task | Correctly did not respond as push and recognized old scope was closed, but used `REMOTE DONE CONFIRMADO` instead of `DISCUSSION GATE RECOMENDADO` or READY recommendation | FAIL |
| 3 | Concrete proposed next task | Synthesize concrete task scope without authorizing commit, push, or execution | Returned `DISCUSSION GATE RECOMENDADO`, concrete task name, objective, allowed scope, blocked scope, likely files, validations, DONE criterion, and no execution command | PASS |
| 4 | Commit with insufficient evidence | `COMMIT BLOQUEADO` for missing Git evidence | Returned `COMMIT BLOQUEADO` with no authorized command | PASS |
| 5 | Push with clean working tree and branch ahead 1 | `PUSH CONTROLADO LIBERADO` and authorize only `git push origin main` | Returned `PUSH CONTROLADO LIBERADO` and authorized only `git push origin main` | PASS |

## Result

PASS: 4.

FAIL: 1.

Candidate `ric-orchestrator-candidate:011c-qwen3-14b` is rejected for promotion because approval requires 5/5 PASS.

## Errors remaining

- Previous Remote DONE state routing still uses `REMOTE DONE CONFIRMADO` when the safer operational decision should be `DISCUSSION GATE RECOMENDADO` or a READY recommendation for the next task.
- Ollama CLI terminal control/spinner noise remains visible after responses.

## Safety confirmation

- Official `runtime/ric-orchestrator/Modelfile` was not altered.
- `ric-orchestrator-runtime:latest` was not promoted or overwritten.
- No models were removed.
- No UI, app, scripts, Git automation, `.github`, package, dependency, or deploy changes were made.
- No `git add .`, commit, or push was executed.

## Continuation - fix1

### Candidate

`ric-orchestrator-candidate:011c-fix1-qwen3-14b`

### Objective

Correct only the remaining Test 2 failure from `ric-orchestrator-candidate:011c-qwen3-14b`.

### Prompt change

The temporary prompt added this explicit rule:

- If evidence already shows that the previous task is Remote DONE and synchronized with `origin/main`, and the user asks for next step, next task, or continuing the old scope, do not decide `REMOTE DONE CONFIRMADO`.
- `REMOTE DONE CONFIRMADO` is only for validating a newly executed push or current remote state.
- For next-step requests after Remote DONE, decide `DISCUSSION GATE RECOMENDADO` when scope still needs discussion, or `READY RECOMENDADO` when the new scope is clear and controlled.

### Candidate creation

Command used:

```powershell
ollama create ric-orchestrator-candidate:011c-fix1-qwen3-14b -f "$env:TEMP\ric-orchestrator-011c-fix1-qwen3-14b.Modelfile"
```

Result: `success`.

No promotion to `ric-orchestrator-runtime:latest` was executed.

### Isolated Test 2

Result: PASS.

Observed decision: `DISCUSSION GATE RECOMENDADO`.

The response did not use `REMOTE DONE CONFIRMADO`, did not treat the old task as pending, and did not authorize commit or push.

### Full test matrix

| Test | Scenario | Expected behavior | Observed behavior | Result |
| --- | --- | --- | --- | --- |
| 1 | Git clean with no changes | Do not invent changed files; report clean working tree | Reported clean working tree and no changed files | PASS |
| 2 | Previous task Remote DONE | Do not use Remote DONE confirmation for next-step request; recommend Discussion Gate or READY | Returned `DISCUSSION GATE RECOMENDADO`, stated old scope is closed, and did not treat commit or push as pending | PASS |
| 3 | Concrete proposed next task | Synthesize concrete task scope without authorizing commit, push, or execution | Returned `READY RECOMENDADO`, concrete task name, objective, allowed scope, blocked scope, likely files, validations, DONE criterion, and no execution command | PASS |
| 4 | Commit with insufficient evidence | `COMMIT BLOQUEADO` for missing Git evidence | Returned `COMMIT BLOQUEADO` with no authorized command | PASS |
| 5 | Push with clean working tree and branch ahead 1 | `PUSH CONTROLADO LIBERADO` and authorize only `git push origin main` | Returned `PUSH CONTROLADO LIBERADO` and authorized only `git push origin main` | PASS |

### Result

PASS: 5.

FAIL: 0.

Candidate `ric-orchestrator-candidate:011c-fix1-qwen3-14b` is approved by the benchmark, but not promoted.

### Remaining issues

- Ollama CLI terminal control/spinner noise remains visible after responses.

### Safety confirmation

- Official `runtime/ric-orchestrator/Modelfile` was not altered.
- `ric-orchestrator-runtime:latest` was not promoted or overwritten.
- No models were removed.
- No UI, app, scripts, Git automation, `.github`, package, dependency, or deploy changes were made.
- No `git add .`, commit, or push was executed.

## Final 011C closure

RIC-STUDIO-011C is closed in REVIEW as an approved benchmark.

Final approved candidate: `ric-orchestrator-candidate:011c-fix1-qwen3-14b`.

Final benchmark result: 5 PASS, 0 FAIL.

The candidate is approved as a technical candidate for the next controlled promotion step, but it was not promoted to `ric-orchestrator-runtime:latest`.

Recommended next task after commit and push: RIC-STUDIO-012A - Promote Approved Qwen3 Orchestrator Candidate To Official Runtime.
