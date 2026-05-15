# Runtime Promotion 009A

## Task Name

RIC-STUDIO-009A - Promote Candidate Runtime To Official Runtime

## Candidate Promoted

`ric-orchestrator-candidate:008a`

## Official Runtime Target

`ric-orchestrator-runtime:latest`

## Promotion Command

```text
ollama cp ric-orchestrator-candidate:008a ric-orchestrator-runtime:latest
```

## Preflight Evidence

### git status --short --untracked-files=all

```text
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

No file entries were returned.

### git status -sb

```text
## main...origin/main
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

### git log --oneline -3

```text
54c7f78 docs: standardize runtime gate vocabulary
f4a16cc docs: record candidate runtime real workflow validation
8e3796a docs: record candidate runtime behavioral smoke tests
```

### ollama list

```text
NAME                               ID              SIZE      MODIFIED
ric-orchestrator-candidate:008a    be391f29a172    4.7 GB    2 hours ago
ric-orchestrator-candidate:005a    8b9169353377    4.7 GB    3 hours ago
ric-orchestrator-runtime:latest    45fd27ea6fe1    4.7 GB    14 hours ago
ric-orchestrator-v3:latest         a86b940d24d5    4.7 GB    15 hours ago
ric-architect-qwen-v2:latest       6a94ce329010    4.7 GB    43 hours ago
ric-orchestrator-v2:latest         8ab734a6bf8f    4.7 GB    45 hours ago
qwen2.5-coder:7b                   dae161e27b0e    4.7 GB    3 days ago
```

### ollama show ric-orchestrator-candidate:008a

```text
Model architecture: qwen2
Parameters: 7.6B
Quantization: Q4_K_M
num_ctx: 4096
seed: 42
temperature: 0.1
top_p: 0.7
System prompt: RIC Local Orchestrator with local execution, validation, commit, push, Local DONE, and Remote DONE decisions.
```

### ollama show ric-orchestrator-runtime:latest before promotion

```text
Model architecture: qwen2
Parameters: 7.6B
Quantization: Q4_K_M
num_ctx: 4096
seed: 42
temperature: 0.1
top_p: 0.7
System prompt: previous RIC Local Orchestrator runtime.
```

### ollama help cp

```text
Copy a model

Usage:
  ollama cp SOURCE DESTINATION [flags]

Flags:
  -h, --help   help for cp
```

## Promotion Evidence

```text
copied 'ric-orchestrator-candidate:008a' to 'ric-orchestrator-runtime:latest'
```

## Post-Promotion Evidence

### ollama list

```text
NAME                               ID              SIZE      MODIFIED
ric-orchestrator-runtime:latest    be391f29a172    4.7 GB    11 seconds ago
ric-orchestrator-candidate:008a    be391f29a172    4.7 GB    2 hours ago
ric-orchestrator-candidate:005a    8b9169353377    4.7 GB    3 hours ago
ric-orchestrator-v3:latest         a86b940d24d5    4.7 GB    15 hours ago
ric-architect-qwen-v2:latest       6a94ce329010    4.7 GB    43 hours ago
ric-orchestrator-v2:latest         8ab734a6bf8f    4.7 GB    45 hours ago
qwen2.5-coder:7b                   dae161e27b0e    4.7 GB    3 days ago
```

### ollama show ric-orchestrator-runtime:latest after promotion

```text
Model architecture: qwen2
Parameters: 7.6B
Quantization: Q4_K_M
num_ctx: 4096
seed: 42
temperature: 0.1
top_p: 0.7
System prompt: RIC Local Orchestrator with local execution, validation, commit, push, Local DONE, and Remote DONE decisions.
```

## Official Runtime Smoke Test Table

| Test | Expected | Observed | Result |
| --- | --- | --- | --- |
| 1 Remote DONE positive | REMOTE DONE CONFIRMADO | REMOTE DONE CONFIRMADO | PASS |
| 2 Push negative | PUSH AINDA BLOQUEADO | PUSH AINDA BLOQUEADO | PASS |
| 3 Commit allowed with scoped files | COMMIT CONTROLADO LIBERADO and scoped `git add` | COMMIT CONTROLADO LIBERADO and `git add STATUS.md backlog.md docs/ops/status.md` | PASS |

Batch result: 3 PASS, 0 FAIL.

## Raw Model Decisions

### Test 1 - Remote DONE Positive

Prompt:

```text
RIC-STUDIO-009A official runtime smoke test 1 â€” Remote DONE positive. Evidence: git status --short --untracked-files=all has no file entries. git status -sb shows ## main...origin/main. git rev-parse HEAD equals git rev-parse origin/main, both return 54c7f78. There are no post-push edits. Expected exact decision: REMOTE DONE CONFIRMADO. Return the standard sections.
```

Observed decision:

```text
REMOTE DONE CONFIRMADO
```

Result: PASS.

### Test 2 - Push Negative

Prompt:

```text
RIC-STUDIO-009A official runtime smoke test 2 â€” Push negative. Evidence: git status --short --untracked-files=all shows modified files. git status -sb does not show ## main...origin/main [ahead 1]. User asks if git push origin main is allowed. Expected exact decision: PUSH AINDA BLOQUEADO. Return the standard sections.
```

Observed decision:

```text
PUSH AINDA BLOQUEADO
```

Result: PASS.

### Test 3 - Commit Allowed With Scoped Files

Prompt:

```text
RIC-STUDIO-009A official runtime smoke test 3 â€” Commit allowed with scoped files. Evidence: changed files are exactly STATUS.md, backlog.md, docs/ops/status.md. Files are in scope. git status --short --untracked-files=all was provided. git diff --stat was provided. git diff --check has no errors. Raw per-file diffs were provided. Expected exact decision: COMMIT CONTROLADO LIBERADO. Expected command style: git add STATUS.md backlog.md docs/ops/status.md. Forbidden: git add . Return the standard sections.
```

Observed decision:

```text
COMMIT CONTROLADO LIBERADO
```

Observed command:

```text
git add STATUS.md backlog.md docs/ops/status.md
git commit -m "RIC-STUDIO-009A official runtime smoke test 3 â€” Update status files"
```

Result: PASS.

## Final Conclusion

`ric-orchestrator-candidate:008a` was promoted locally to `ric-orchestrator-runtime:latest` with `ollama cp`.

The promoted official runtime passed the focused smoke tests with 3 PASS and 0 FAIL.

`ric-orchestrator-candidate:005a` and `ric-orchestrator-candidate:008a` were not deleted.

`runtime/ric-orchestrator/Modelfile` was not edited in this task.

No scripts, dependencies, UI/app files, Git automation, commit, or push occurred.

## Final State

RIC-STUDIO-009A is in REVIEW.

READY remains empty.

Local DONE and Remote DONE are not declared for RIC-STUDIO-009A.
