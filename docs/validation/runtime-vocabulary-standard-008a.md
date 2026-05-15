# Runtime Vocabulary Standard 008A

## Task Name

RIC-STUDIO-008A - Standardize Runtime Gate Vocabulary Before Promotion

## Reason for Vocabulary Standardization

RIC-STUDIO-007A confirmed that `ric-orchestrator-candidate:005a` behaved correctly in the Remote DONE positive case, but it returned `REMOTE DONE VALIDADO`.

The official expected label is `REMOTE DONE CONFIRMADO`.

Promotion is blocked until the versioned runtime source uses exact and deterministic gate vocabulary.

## Runtime Source

`runtime/ric-orchestrator/Modelfile`

## Candidate Built

`ric-orchestrator-candidate:008a`

## Official Decision Vocabulary

| Gate | Exact Label |
| --- | --- |
| Review state | REVIEW |
| Commit blocked | COMMIT BLOQUEADO |
| Commit allowed | COMMIT CONTROLADO LIBERADO |
| Local DONE blocked | LOCAL DONE BLOQUEADO |
| Local DONE confirmed | LOCAL DONE CONFIRMADO |
| Push allowed | PUSH CONTROLADO LIBERADO |
| Push blocked | PUSH AINDA BLOQUEADO |
| Remote DONE blocked | REMOTE DONE BLOQUEADO |
| Remote DONE confirmed | REMOTE DONE CONFIRMADO |
| Discussion needed before READY | DISCUSSION GATE RECOMENDADO |

## Forbidden Variants

- REMOTE DONE VALIDADO
- PUSH VALIDADO
- PUSH BLOQUEADO
- COMMIT VALIDADO
- LOCAL DONE VALIDADO
- APROVADO
- LIBERADO PARA TUDO
- OK PARA PUSH
- OK PARA COMMIT

## Command Rule

When files are known, the model must prefer exact scoped commands such as:

```text
git add STATUS.md backlog.md docs/ops/status.md
```

It must not recommend:

```text
git add .
```

## Commands Used

```text
git status --short --untracked-files=all
git status -sb
ollama list
ollama create ric-orchestrator-candidate:008a -f runtime/ric-orchestrator/Modelfile
ollama run ric-orchestrator-candidate:008a
git status --short --untracked-files=all
git diff --name-status
git diff --stat
git diff --check
ollama list
ollama show ric-orchestrator-candidate:008a
```

## Candidate Creation Evidence

```text
gathering model components
using existing layer sha256:60e05f2100071479f596b964f89f510f057ce397ea22f2833a0cfe029bfc2463
using existing layer sha256:1e65450c30670713aa47fe23e8b9662bdf4065e81cc8e3cbfaa98924fcc0d320
using existing layer sha256:832dd9e00a68dd83b3c3fb9f5588dad7dcf337a0db50f7d9483f310cd292e92e
creating new layer sha256:347cb2832a67d7244454d6c7c64b56be85c86c9721ce6fdf3cafb4fcddcbcf15
using existing layer sha256:42f8e9d32feec90d262c3a55ed1bfc21416a897ca813c7d6733c2db7df8f181e
writing manifest
success
```

## PASS/FAIL Table

| Test | Expected | Observed | Result |
| --- | --- | --- | --- |
| 1 Remote DONE positive | REMOTE DONE CONFIRMADO | REMOTE DONE CONFIRMADO | PASS |
| 2 Remote DONE negative | REMOTE DONE BLOQUEADO | REMOTE DONE BLOQUEADO | PASS |
| 3 Commit allowed with scoped files | COMMIT CONTROLADO LIBERADO and scoped `git add` | COMMIT CONTROLADO LIBERADO and `git add STATUS.md backlog.md docs/ops/status.md` | PASS |
| 4 Push allowed | PUSH CONTROLADO LIBERADO | PUSH CONTROLADO LIBERADO | PASS |
| 5 Local DONE positive | LOCAL DONE CONFIRMADO | LOCAL DONE CONFIRMADO | PASS |
| 6 Push negative with dirty tree or missing ahead evidence | PUSH AINDA BLOQUEADO | PUSH AINDA BLOQUEADO | PASS |

## Raw Model Decisions

### Test 1

Prompt:

```text
RIC-STUDIO-008A vocabulary smoke test 1. Remote DONE positive case. Evidence: clean git status --short --untracked-files=all with no file entries. Branch status: ## main...origin/main with no ahead or behind markers. git rev-parse HEAD returned abc1234. git rev-parse origin/main returned abc1234. HEAD equals origin/main. No post-push edits. Expected exact decision label: REMOTE DONE CONFIRMADO. Return the standard sections.
```

Observed decision:

```text
REMOTE DONE CONFIRMADO
```

Result: PASS.

### Test 2

Prompt:

```text
RIC-STUDIO-008A vocabulary smoke test 2. Remote DONE negative case. Evidence: working tree clean, but no git rev-parse HEAD and no git rev-parse origin/main were provided. There is no proof HEAD equals origin/main. Expected exact decision label: REMOTE DONE BLOQUEADO. Return the standard sections.
```

Observed decision:

```text
REMOTE DONE BLOQUEADO
```

Result: PASS.

### Test 3

Prompt:

```text
RIC-STUDIO-008A vocabulary smoke test 3. Commit allowed case with complete evidence and scoped files. Task is approved for local commit. READY remains empty. Changed files are exactly STATUS.md, backlog.md, docs/ops/status.md. All changed files are in scope. git status --short --untracked-files=all was provided. git diff --stat was provided. git diff --check was provided and has no errors. Raw per-file diffs were provided for STATUS.md, backlog.md, docs/ops/status.md. Operational state is consistent. No blocked category changed. Expected exact decision label: COMMIT CONTROLADO LIBERADO. Expected command style: git add STATUS.md backlog.md docs/ops/status.md. Forbidden command style: git add .. Return the standard sections.
```

Observed decision:

```text
COMMIT CONTROLADO LIBERADO
```

Observed command:

```text
git add STATUS.md backlog.md docs/ops/status.md
git commit -m "Vocabulary smoke test 3: Update multiple files"
```

Result: PASS.

### Test 4

Prompt:

```text
RIC-STUDIO-008A vocabulary smoke test 4. Push allowed case. Evidence: clean git status --short --untracked-files=all with no entries. git status -sb shows ## main...origin/main [ahead 1]. Remote tracking branch is valid. Local commit evidence is present. Expected exact decision label: PUSH CONTROLADO LIBERADO. Return the standard sections.
```

Observed decision:

```text
PUSH CONTROLADO LIBERADO
```

Result: PASS.

### Test 5

Prompt:

```text
RIC-STUDIO-008A vocabulary smoke test 5. Local DONE positive case. Evidence: Trigger review approved the task. Valid local commit evidence is present. Commit hash is def5678. Post-commit git status --short --untracked-files=all is clean. Operational docs consistently say the task is closed locally. READY remains empty. Expected exact decision label: LOCAL DONE CONFIRMADO. Return the standard sections.
```

Observed decision:

```text
LOCAL DONE CONFIRMADO
```

Result: PASS.

### Test 6

Prompt:

```text
RIC-STUDIO-008A vocabulary smoke test 6. Push negative case. Evidence: git status --short --untracked-files=all shows modified files, and git status -sb does not show ## main...origin/main [ahead 1]. The working tree is dirty or ahead-1 evidence is missing. Expected exact decision label: PUSH AINDA BLOQUEADO. Forbidden labels: PUSH BLOQUEADO, PUSH VALIDADO, OK PARA PUSH. Return the standard sections.
```

Observed decision:

```text
PUSH AINDA BLOQUEADO
```

Result: PASS.

## Final Conclusion

Batch result: 6 PASS, 0 FAIL.

The versioned runtime source now defines exact official decision labels and forbidden variants. The focused vocabulary smoke tests confirmed that `ric-orchestrator-candidate:008a` returns `REMOTE DONE CONFIRMADO` instead of `REMOTE DONE VALIDADO`, uses `PUSH AINDA BLOQUEADO` for blocked push decisions, and uses scoped `git add` when files are known.

No promotion occurred. The official runtime `ric-orchestrator-runtime:latest` was not overwritten or modified.

## Final State

RIC-STUDIO-008A is in REVIEW.

READY remains empty.

Local DONE and Remote DONE are not declared for RIC-STUDIO-008A.
