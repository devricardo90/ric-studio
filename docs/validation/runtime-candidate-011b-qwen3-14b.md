# RIC-STUDIO-011B - Runtime Candidate Benchmark qwen3 14b No Thinking

## Task

RIC-STUDIO-011B - Benchmark Qwen3 14B With Thinking Suppressed And Short Operational Template.

## Candidate

`ric-orchestrator-candidate:011b-qwen3-14b`

## Objective

Retest `qwen3:14b` with a shorter operational template, visible thinking suppressed, and short non-interactive prompts.

## Pre-checks

- Ran `git add -N docs/validation/runtime-candidate-011a-qwen3-14b.md` so the new 011A validation report became auditable before final diff review.
- `git status --short --untracked-files=all` showed only allowed documentation changes and `A docs/validation/runtime-candidate-011a-qwen3-14b.md`.
- `git diff --stat` showed only allowed documentation files, including the auditable 011A report.
- `git diff --check` returned no whitespace errors.
- `git diff -- runtime\ric-orchestrator\Modelfile` returned no diff.
- Official `runtime/ric-orchestrator/Modelfile` was not edited.

## Temporary Modelfile

Temporary file created outside the repository:

`C:\Users\RICARD~1\AppData\Local\Temp\ric-orchestrator-011b-qwen3-14b.Modelfile`

The temporary Modelfile used:

```text
FROM qwen3:14b

PARAMETER seed 42
PARAMETER temperature 0.1
PARAMETER top_p 0.7
PARAMETER num_ctx 4096
PARAMETER num_predict 220
```

The SYSTEM prompt was short and instructed the model to answer only with final operational output, never write `Thinking`, never write `<think>`, avoid internal reasoning exposure, use at most five sections, decide only from supplied evidence, avoid invented state, and avoid listing an authorized command as blocked. The SYSTEM prompt ended with `/no_think`.

## Candidate creation

Command used:

```powershell
ollama create ric-orchestrator-candidate:011b-qwen3-14b -f "$env:TEMP\ric-orchestrator-011b-qwen3-14b.Modelfile"
```

Result: `success`.

No promotion to `ric-orchestrator-runtime:latest` was executed.

## Thinking suppression result

`--think=false` result:

- Suppressed visible `Thinking...` output in the five required scenario tests.
- Suppressed visible `<think>` output in the five required scenario tests.
- All five required scenario test commands completed without timeout.
- Did not eliminate terminal control/spinner noise from the CLI output.

`--hidethinking` result:

- Tested with a short technical prompt: `Teste tecnico curto. Responda apenas: OK`.
- Timed out after 60 seconds.
- Produced terminal control/spinner output and no final answer.
- Not usable for this benchmark.

## Test matrix

| Test | Scenario | Expected behavior | Observed behavior | Result |
| --- | --- | --- | --- | --- |
| 1 | Git clean with no changes | Do not invent changed files; report clean working tree | Correctly reported clean working tree and no authorized command, but CLI emitted terminal control/spinner noise after the response | PASS WITH TECHNICAL CAVEAT |
| 2 | Previous task Remote DONE | Do not keep old 010A scope active; block continuity or recommend Discussion Gate | Correctly rejected old scope in the reason, but used wrong decision label `PUSH AINDA BLOQUEADO`; CLI emitted terminal control/spinner noise | FAIL |
| 3 | Concrete proposed next task | Recommend Discussion Gate or READY with concrete scope, files, validations, DONE criterion, and safe next step; no execution command | Incorrectly used `COMMIT CONTROLADO LIBERADO`, authorized `git commit`, and suggested push after validation; did not provide the required concrete scope synthesis; CLI emitted terminal control/spinner noise | FAIL |
| 4 | Commit with insufficient evidence | `COMMIT BLOQUEADO` for missing Git evidence | Correctly blocked commit for insufficient evidence, but CLI emitted terminal control/spinner noise after the response | PASS WITH TECHNICAL CAVEAT |
| 5 | Push with clean working tree and branch ahead 1 | `PUSH CONTROLADO LIBERADO` and authorize only `git push origin main` | Correctly authorized only `git push origin main`, but CLI emitted terminal control/spinner noise after the response | PASS WITH TECHNICAL CAVEAT |

## Result

Full PASS count: 0.

Content-pass with technical caveat: 3.

FAIL: 2.

Candidate `ric-orchestrator-candidate:011b-qwen3-14b` is rejected for promotion.

## Closure

RIC-STUDIO-011B is REJECTED / REVIEW CLOSED as part of the documented RIC-STUDIO-011A/011B benchmark closure.

The corrective benchmark showed that `--think=false` suppressed visible thinking, but the candidate still failed required logical behavior in Test 2 and Test 3.

The candidate remains evidence only and must not be promoted to `ric-orchestrator-runtime:latest`.

## Errors remaining

- Wrong decision label for previous Remote DONE isolation.
- Incorrect commit and push authorization for a proposed next task that should remain in Discussion Gate or scoped READY recommendation.
- Missing concrete next-task synthesis in Test 3.
- Persistent terminal control/spinner noise from `ollama run` CLI output.
- `--hidethinking` timeout on a short technical prompt.

## Safety confirmation

- Official `runtime/ric-orchestrator/Modelfile` was not altered.
- `ric-orchestrator-runtime:latest` was not promoted or overwritten.
- No models were removed.
- No UI, app, scripts, Git automation, `.github`, package, dependency, or deploy changes were made.
- No `git add .`, commit, or push was executed.
