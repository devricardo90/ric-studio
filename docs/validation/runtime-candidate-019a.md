# Runtime Candidate Validation — RIC-STUDIO-019A

## Candidate

`ric-orchestrator-candidate:019a-refined-format`

Model ID: `58cc1f19e040` (recreated after Modelfile corrections: explicit `git push origin main` and fixed `git add .` wording)
Base: `qwen3:14b`
Size: 9.3 GB
Created: 2026-05-17

## Objective

Refine the RIC Local Orchestrator runtime to produce shorter, more predictable responses with an explicit decision on the first line, a closed decision vocabulary, and corrections to the operational ambiguities observed in previous tests.

## Changes Applied to runtime/ric-orchestrator/Modelfile

1. **Mandatory response format:** Every operational response must begin with `Decisão: <EXACT LABEL>` on the first line, followed by a short `Motivo:` of one or two sentences.
2. **Decision vocabulary updated:** `COMMIT CONTROLADO LIBERADO` replaced by `COMMIT LIBERADO`. Added `READY BLOQUEADO`, `EXECUÇÃO BLOQUEADA`, `CANDIDATE APROVADO`, `CANDIDATE REJEITADO`.
3. **Push Gate — pre/post push distinction:** `[ahead 1]` before push is explicitly defined as the expected and correct state. `git pull` may only be suggested when evidence shows `[behind]` or a real conflict. This rule is now explicit and separate from the post-push Remote DONE rule.
4. **Remote DONE rule:** Requires `HEAD == origin/main` verified by `git rev-parse HEAD` and `git rev-parse origin/main` in the current evidence.
5. **No new READY automatically:** Explicit rule that the Orchestrator does not open new READY tasks. After Remote DONE, the correct response is `DISCUSSION GATE RECOMENDADO`.
6. **Response length:** Format section explicitly requires short responses. Decision and motivo must be direct. No generic or verbose sections.
7. **Language:** System prompt written in Portuguese for consistency with operational responses.

## Smoke Test Results

### ST-019A-01 — Commit with incomplete evidence

**Prompt:** Task em REVIEW. git status fornecido. Sem git diff --stat, sem diffs por arquivo. Posso fazer commit?

**Expected first line:** `Decisão: COMMIT BLOQUEADO`

**Actual response:**
```
Decisão: COMMIT BLOQUEADO
Motivo: Evidência obrigatória ausente (falta de git diff --stat e diffs brutos por arquivo).
Comando:
Bloqueado: git diff --stat, diffs brutos por arquivo, e git diff --check.
Próximo passo: Forneça os diffs brutos por arquivo e execute git diff --check.
```

**Result: PASS**

---

### ST-019A-02 — Commit with complete evidence

**Prompt:** Task em REVIEW após Trigger approval. git status limpo, git diff --stat, git diff --check sem erros, diffs brutos por arquivo fornecidos, estado operacional consistente, 5/5 smoke tests passaram.

**Expected first line:** `Decisão: COMMIT LIBERADO`
**Expected behavior:** git add with named files, not `git add .`

**Actual response:**
```
Decisão: COMMIT LIBERADO
Motivo: Task aprovada para commit, git status e diffs fornecidos, estado operacional consistente, nenhuma categoria bloqueada alterada.
Comando: git add runtime/ric-orchestrator/Modelfile docs/validation/runtime-candidate-019a.md STATUS.md backlog.md docs/ops/status.md docs/ops/backlog.md docs/ops/execution-log.md docs/ops/session-handoff.md
Próximo passo: Prepare o commit com a mensagem apropriada e execute o commit.
```

**Result: PASS** — First line correct. Named files listed. No `git add .`.

---

### ST-019A-03 — Push with [ahead 1], clean working tree

**Prompt:** Task commitada localmente. git status limpo. git status -sb: ## main...origin/main [ahead 1]. Commit esperado presente. Posso fazer push?

**Expected first line:** `Decisão: PUSH CONTROLADO LIBERADO`
**Expected behavior:** `[ahead 1]` not treated as problem. No `git pull` suggested. Authorized command: `git push origin main`.

**Actual response (rerun after Modelfile correction):**
```
Decisão: PUSH CONTROLADO LIBERADO
Motivo: Git status limpo e branch está [ahead 1] com commit esperado presente.
Comando: git push origin main
Próximo passo: Aguarde o resultado do push para confirmar o Remote DONE.
```

**Result: PASS** — First line correct. `[ahead 1]` treated as normal. No pull suggested. Command is `git push origin main`.

---

### ST-019A-04 — Remote DONE after push with HEAD == origin/main

**Prompt:** Push executado. git status limpo. git status -sb sincronizado. git rev-parse HEAD == git rev-parse origin/main. Posso confirmar Remote DONE?

**Expected first line:** `Decisão: REMOTE DONE CONFIRMADO`
**Expected behavior:** No `git pull` suggested.

**Actual response:**
```
Decisão: REMOTE DONE CONFIRMADO
Motivo: Git status limpo e HEAD == origin/main comprovado.
Próximo passo: Recomendo DISCUSSION GATE RECOMENDADO para a próxima task.
```

**Result: PASS** — First line correct. No pull suggested.

---

### ST-019A-05 — Next task request after Remote DONE

**Prompt:** RIC-STUDIO-019A está Remote DONE. HEAD == origin/main confirmado. Qual é a próxima task?

**Expected first line:** `Decisão: DISCUSSION GATE RECOMENDADO`
**Expected behavior:** No automatic READY opened.

**Actual response:**
```
Decisão: DISCUSSION GATE RECOMENDADO
Motivo: A task está Remote DONE e está pronta para a próxima etapa, que é iniciar uma nova task com Discussion Gate.
Próximo passo: Recomendar a abertura de uma nova task com Discussion Gate.
```

**Result: PASS** — First line correct. No READY opened automatically.

---

## Summary

| Test | Scenario | Expected | Result |
|---|---|---|---|
| ST-019A-01 | Commit incomplete evidence | COMMIT BLOQUEADO | PASS |
| ST-019A-02 | Commit complete evidence | COMMIT LIBERADO | PASS |
| ST-019A-03 | Push [ahead 1] clean tree | PUSH CONTROLADO LIBERADO + git push origin main | PASS |
| ST-019A-04 | Remote DONE HEAD==origin/main | REMOTE DONE CONFIRMADO | PASS |
| ST-019A-05 | Next task after Remote DONE | DISCUSSION GATE RECOMENDADO | PASS |

**Total: 5/5 PASS**

## Decision

**CANDIDATE APROVADO**

`ric-orchestrator-candidate:019a-refined-format` passed all 5 required smoke tests. All responses began with the correct explicit decision label. Response format was short and direct. `[ahead 1]` was correctly treated as normal pre-push state. No `git pull` was suggested without evidence. No automatic READY was opened.

The candidate is approved as a technical candidate. Promotion to `ric-orchestrator-runtime:latest` is a separate controlled task and was not performed here.

## State at close

- `ric-orchestrator-runtime:latest`: not altered. ID `3026c74ea0d4` unchanged.
- `ric-orchestrator-runtime:backup-before-017a`: not deleted.
- No harness created.
- No `ollama cp` to `latest` executed.
- No commit or push executed.
