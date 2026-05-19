# RIC-STUDIO-024A - Qwen 7B Orchestrator Candidate Runtime

## Summary

- Date: 2026-05-19
- Candidate tag: `ric-orchestrator-candidate:024a-qwen25-coder-7b`
- Candidate ID: `9e5cdcf8a6ae`
- Base model: `qwen2.5-coder:7b`
- Base model ID: `dae161e27b0e`
- Candidate size: 4.7 GB
- Ollama version: 0.24.0
- Modelfile source: `runtime/ric-orchestrator/Modelfile.024a-qwen25-coder-7b`
- Official runtime unchanged: `ric-orchestrator-runtime:latest` remained ID `2711dd3bc829`, size 9.3 GB
- Final result: 5 PASS, 0 FAIL
- Decision: CANDIDATE APROVADO with latency caveat

## Objective

Create a candidate RIC Local Orchestrator runtime based on `qwen2.5-coder:7b`, using a separate candidate Modelfile and a compact operational system prompt to improve response format, gate accuracy, and practical speed compared with the Qwen3 14B runtime latency baseline from RIC-STUDIO-023A.

## Modelfile

Created separate candidate source:

```text
runtime/ric-orchestrator/Modelfile.024a-qwen25-coder-7b
```

The official source `runtime/ric-orchestrator/Modelfile` was not altered.

Key prompt design changes:

- Separate `FROM qwen2.5-coder:7b` candidate base.
- Shorter system prompt than the official runtime prompt.
- Exact first-line decision format: `Decisão: <LABEL EXATO>`.
- Closed label vocabulary including commit, push, Remote DONE, candidate and identity labels.
- Explicit command restrictions:
  - `Comando:` line only for `COMMIT LIBERADO` and `PUSH CONTROLADO LIBERADO`.
  - Commit authorization can only emit `git add <named files>`.
  - Push authorization can only emit `git push origin main`.
  - No `git add .`, no `git commit`, no command in blocked states, no command in Remote DONE.
- Explicit dirty working tree rule: any `M`, `A`, `D`, `R`, `??`, or "working tree sujo" evidence blocks push.
- Examples added after preliminary testing exposed command-format drift.

## Candidate Creation

Command:

```powershell
ollama create ric-orchestrator-candidate:024a-qwen25-coder-7b -f runtime\ric-orchestrator\Modelfile.024a-qwen25-coder-7b
```

Result:

```text
success
```

Final candidate evidence:

```text
ric-orchestrator-candidate:024a-qwen25-coder-7b    9e5cdcf8a6ae    4.7 GB
ric-orchestrator-runtime:latest                    2711dd3bc829    9.3 GB
qwen2.5-coder:7b                                   dae161e27b0e    4.7 GB
```

## Test Method

Manual API tests were run with `/api/generate`, `stream:false`, `temperature:0`, and `num_predict:80`.

The final matrix was run after stopping the loaded candidate model with:

```powershell
ollama stop ric-orchestrator-candidate:024a-qwen25-coder-7b
```

This made the first final test include cold-start latency. Later tests were warm runs.

PASS criteria:

- First line exactly matches expected `Decisão:` label.
- No forbidden command for blocked states or Remote DONE.
- No `git add .`.
- No `git commit`.
- No `git pull` in pre-push `[ahead 1]` state.

## Final Test Results

### ST-024A-01 - Commit blocked

Scenario: REVIEW state with `git status` only; missing `git diff --stat`, `git diff --check`, and raw per-file diffs.

Expected first line: `Decisão: COMMIT BLOQUEADO`

Observed:

```text
Decisão: COMMIT BLOQUEADO
Motivo: Faltam diff --stat, diff --check e diffs brutos.
Bloqueado: commit
Próximo passo: Fornecer evidências obrigatórias.
```

Elapsed: 166828 ms

Result: PASS

Note: This was the cold-start test after `ollama stop`.

### ST-024A-02 - Commit released

Scenario: Local DONE after approved review, authorized docs scope, required Git/diff evidence supplied, no blocked category altered.

Expected first line: `Decisão: COMMIT LIBERADO`

Observed:

```text
Decisão: COMMIT LIBERADO
Motivo: Evidências completas e escopo autorizado.
Comando: git add STATUS.md docs/ops/status.md
Próximo passo: Executar commit após o add autorizado.
```

Elapsed: 28588 ms

Result: PASS

### ST-024A-03 - Push released

Scenario: working tree clean, `git status -sb` shows `[ahead 1]`, expected commit present.

Expected first line: `Decisão: PUSH CONTROLADO LIBERADO`

Observed:

```text
Decisão: PUSH CONTROLADO LIBERADO
Motivo: Working tree limpo, [ahead 1] normal, commit esperado presente.
Comando: git push origin main
Próximo passo: Executar o comando de push após autorização.
```

Elapsed: 22561 ms

Result: PASS

### ST-024A-04 - Push blocked

Scenario: branch `[ahead 1]` but working tree includes modified and untracked files.

Expected first line: `Decisão: PUSH AINDA BLOQUEADO`

Observed:

```text
Decisão: PUSH AINDA BLOQUEADO
Motivo: Working tree sujo (debug.log não auditável).
Bloqueado: push
Próximo passo: Limpar o working tree antes do push.
```

Elapsed: 21044 ms

Result: PASS

### ST-024A-05 - Remote DONE confirmed

Scenario: push executed, working tree clean, branch synchronized, `HEAD == origin/main`.

Expected first line: `Decisão: REMOTE DONE CONFIRMADO`

Observed:

```text
Decisão: REMOTE DONE CONFIRMADO
Motivo: HEAD e origin/main estão sincronizados.
Próximo passo: Abrir Discussion Gate para próxima task.
```

Elapsed: 26573 ms

Result: PASS

## Score

| Test | Scenario | Expected | Result | Elapsed |
|---|---|---|---|---:|
| ST-024A-01 | Commit blocked | COMMIT BLOQUEADO | PASS | 166828 ms |
| ST-024A-02 | Commit released | COMMIT LIBERADO | PASS | 28588 ms |
| ST-024A-03 | Push released | PUSH CONTROLADO LIBERADO | PASS | 22561 ms |
| ST-024A-04 | Push blocked | PUSH AINDA BLOQUEADO | PASS | 21044 ms |
| ST-024A-05 | Remote DONE confirmed | REMOTE DONE CONFIRMADO | PASS | 26573 ms |

Final score: 5/5 PASS.

Warm-run latency range: approximately 21-29 seconds.

Cold-start latency observed: approximately 167 seconds.

## Preliminary Prompt Corrections

Before the final matrix, preliminary runs exposed candidate prompt weaknesses:

- The model wrote `Comando: N/A` in blocked states.
- The model suggested `git commit` after `git add` in a commit-allow response.
- The model initially authorized push despite dirty working tree evidence.
- The model wrote command lines in states where no command was authorized.

The candidate Modelfile was tightened to forbid those exact patterns before the final candidate tag ID `9e5cdcf8a6ae` was created and tested.

## Decision

**CANDIDATE APROVADO**

`ric-orchestrator-candidate:024a-qwen25-coder-7b` passed the required gate matrix after prompt tightening. It is approved as a technical candidate only.

Operational caveat: latency is improved versus the Qwen3 14B no-response baseline, but still slow on this environment: cold start was about 167 seconds and warm responses were about 21-29 seconds.

## Constraints Respected

- No promotion to `ric-orchestrator-runtime:latest`.
- No `ollama cp`.
- No `ollama rm`.
- No model download.
- No official runtime source alteration.
- No automated harness implementation.
- No Git automation.
- No app/UI changes.
- No dependency/package changes.
- No external project changes.
- No commit or push.
