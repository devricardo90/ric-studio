# RIC-STUDIO-014A - Runtime Rebuild And Promotion Evidence

## Task

RIC-STUDIO-014A - Rebuild And Promote Official Runtime From Refined Prompt.

## Final state

BLOCKED / ROLLED BACK.

## Objective

Apply the RIC-STUDIO-013A versioned prompt corrections to the active runtime by rebuilding a candidate from `runtime/ric-orchestrator/Modelfile`, testing it, creating a backup of the current runtime, and promoting the candidate to `ric-orchestrator-runtime:latest`.

## Audit correction

RIC-STUDIO-014A must not be concluded as a successful promotion.

The rebuild used the versioned `runtime/ric-orchestrator/Modelfile`, and audit confirmed that this file begins with:

```text
FROM qwen2.5-coder:7b
```

That rebuilt candidate `ric-orchestrator-candidate:014a-refined-prompt` with model ID `1e10ad354fb3`, size 4.7 GB.

The active runtime before 014A was the approved Qwen3 14B runtime with model ID `585f4d5c2075`, size 9.3 GB.

Promoting the 014A candidate briefly replaced the approved Qwen3 14B runtime with the smaller 7B base, causing a runtime base regression.

Therefore, the 014A promotion result is invalid.

## Pre-checks

- Initial `git status --short --untracked-files=all` returned no file entries.
- Initial `git status -sb` returned `## main...origin/main`.
- `git rev-parse HEAD` returned `58ad31110d14c370708a5d2ac001c40d2afaae74`.
- `git rev-parse origin/main` returned `58ad31110d14c370708a5d2ac001c40d2afaae74`.
- `runtime/ric-orchestrator/Modelfile` exists.
- `runtime/ric-orchestrator/Modelfile` starts with `FROM qwen2.5-coder:7b`.
- Pre-promotion `ollama list` confirmed `ric-orchestrator-runtime:latest` exists.
- Pre-promotion `ollama list` did not include `ric-orchestrator-runtime:backup-before-014a`.

## Candidate creation

Command:

```powershell
ollama create ric-orchestrator-candidate:014a-refined-prompt -f runtime/ric-orchestrator/Modelfile
```

Result: success.

Candidate ID after creation: `1e10ad354fb3`.

Audit result: candidate was created from the wrong base for this promotion objective because the source Modelfile used `FROM qwen2.5-coder:7b`, not the approved Qwen3 14B base.

## Candidate smoke test

Command:

```powershell
ollama run ric-orchestrator-candidate:014a-refined-prompt --think=false --nowordwrap "Responda apenas: RIC-RUNTIME-014A-CANDIDATE-OK"
```

Observed output began with:

```text
RIC-RUNTIME-014A-CANDIDATE-OK
```

The Ollama CLI emitted terminal control/spinner noise after the expected token.

Result: PASS for candidate smoke only. This did not validate the candidate as safe to promote because the candidate base was wrong.

## Candidate behavioral test

The prompt intentionally omitted raw Git status, raw diffs, a raw dependency list, and raw evidence of absence of blockers.

Observed decision: `DISCUSSION GATE RECOMENDADO`.

Observed behavior:

- Did not claim absence of dependencies, blockers, or pending work.
- Required raw evidence before READY.
- Did not say that the runtime would implement.
- Directed implementation to executor/Codex after Discussion Gate approval and READY.

Result: PASS for the narrow behavior check only. This did not validate the candidate as safe to promote because the candidate base was wrong.

## Backup

Command:

```powershell
ollama cp ric-orchestrator-runtime:latest ric-orchestrator-runtime:backup-before-014a
```

Result:

```text
copied 'ric-orchestrator-runtime:latest' to 'ric-orchestrator-runtime:backup-before-014a'
```

Backup ID after creation: `585f4d5c2075`.

## Invalid promotion

Command:

```powershell
ollama cp ric-orchestrator-candidate:014a-refined-prompt ric-orchestrator-runtime:latest
```

Result:

```text
copied 'ric-orchestrator-candidate:014a-refined-prompt' to 'ric-orchestrator-runtime:latest'
```

Post-promotion evidence shows:

- `ric-orchestrator-runtime:latest` ID: `1e10ad354fb3`.
- `ric-orchestrator-candidate:014a-refined-prompt` ID: `1e10ad354fb3`.
- `ric-orchestrator-runtime:backup-before-014a` ID: `585f4d5c2075`.

Audit result: this was an invalid promotion because it replaced the approved Qwen3 14B runtime ID `585f4d5c2075` with the rebuilt 7B candidate ID `1e10ad354fb3`.

## Latest smoke test

Command:

```powershell
ollama run ric-orchestrator-runtime:latest --think=false --nowordwrap "Responda apenas: RIC-RUNTIME-014A-LATEST-OK"
```

Observed output began with:

```text
RIC-RUNTIME-014A-LATEST-OK
```

The Ollama CLI emitted terminal control/spinner noise after the expected token.

Result: PASS for token smoke only before rollback. This did not make the promotion valid because the promoted runtime used the wrong base.

## Latest behavioral test

The same behavioral prompt used for the candidate was repeated against `ric-orchestrator-runtime:latest`.

Observed decision: `DISCUSSION GATE RECOMENDADO`.

Observed behavior:

- Did not claim absence of dependencies, blockers, or pending work.
- Required raw evidence before READY.
- Did not say that the runtime would implement.
- Directed implementation to executor/Codex after Discussion Gate approval and READY.

Result: PASS for the narrow behavior check only before rollback. This did not make the promotion valid because the promoted runtime used the wrong base.

## Rollback

Rollback command executed after audit:

```powershell
ollama cp ric-orchestrator-runtime:backup-before-014a ric-orchestrator-runtime:latest
```

Rollback result:

- `ric-orchestrator-runtime:latest` returned to ID `585f4d5c2075`, size 9.3 GB.
- `ric-orchestrator-runtime:backup-before-014a` remains the rollback source for the 014A incident.
- `ric-orchestrator-candidate:014a-refined-prompt` remains present as a failed candidate and was not deleted.

Rollback smoke result:

- The rollback smoke did not return the exact token `RIC-RUNTIME-014A-ROLLBACK-OK`.
- It returned an incorrect gate-style response.
- This confirms the active runtime reverted to the pre-013A behavior and the 013A prompt correction is still not applied to the active runtime.

## Safety confirmation

- `runtime/ric-orchestrator/Modelfile` was not altered.
- No model was deleted.
- No backup was deleted.
- No old candidate was deleted.
- No UI, app, scripts, `.github`, package, dependency, workflow, or deploy files were changed.
- No `git add .`, commit, or push was executed.

## Review status

RIC-STUDIO-014A is in REVIEW / BLOCKED as BLOCKED / ROLLED BACK.

The correction from RIC-STUDIO-013A is not applied to the active runtime.

Do not declare RIC-STUDIO-014A DONE.

Do not declare the promotion completed.
