# RIC-STUDIO-012A - Runtime Promotion Evidence

## Task

RIC-STUDIO-012A - Promote Approved Qwen3 Orchestrator Candidate To Official Runtime.

## Objective

Promote benchmark-approved candidate `ric-orchestrator-candidate:011c-fix1-qwen3-14b` to official runtime `ric-orchestrator-runtime:latest`, with mandatory backup and smoke test.

## Pre-promotion Git evidence

`git status --short --untracked-files=all` returned no file entries.

`git status -sb`:

```text
## main...origin/main
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

`git rev-parse HEAD`:

```text
9f6f18f3419a09bda7f625c96113b9de25787920
```

`git rev-parse origin/main`:

```text
9f6f18f3419a09bda7f625c96113b9de25787920
```

`git diff -- runtime\ric-orchestrator\Modelfile` returned no diff before promotion.

## Pre-promotion model evidence

`ollama list` before promotion:

```text
NAME                                              ID              SIZE      MODIFIED
ric-orchestrator-candidate:011c-fix1-qwen3-14b    585f4d5c2075    9.3 GB    26 minutes ago
ric-orchestrator-candidate:011c-qwen3-14b         69621e4ca8dd    9.3 GB    42 minutes ago
ric-orchestrator-candidate:011b-qwen3-14b         e5864fb8e7a8    9.3 GB    About an hour ago
ric-orchestrator-candidate:011a-qwen3-14b         04b9f84d5bbc    9.3 GB    2 hours ago
qwen3:14b                                         bdbd181c33f2    9.3 GB    13 hours ago
ric-orchestrator-runtime:latest                   be391f29a172    4.7 GB    20 hours ago
ric-architect-qwen-v2:latest                      6a94ce329010    4.7 GB    2 days ago
qwen2.5-coder:7b                                  dae161e27b0e    4.7 GB    4 days ago
```

`ric-orchestrator-runtime:backup-before-012a` was not present before backup creation.

## Backup

Command:

```powershell
ollama cp ric-orchestrator-runtime:latest ric-orchestrator-runtime:backup-before-012a
```

Result:

```text
copied 'ric-orchestrator-runtime:latest' to 'ric-orchestrator-runtime:backup-before-012a'
```

## Promotion

Command:

```powershell
ollama cp ric-orchestrator-candidate:011c-fix1-qwen3-14b ric-orchestrator-runtime:latest
```

Result:

```text
copied 'ric-orchestrator-candidate:011c-fix1-qwen3-14b' to 'ric-orchestrator-runtime:latest'
```

## Post-promotion model evidence

`ollama list` after promotion:

```text
NAME                                              ID              SIZE      MODIFIED
ric-orchestrator-runtime:latest                   585f4d5c2075    9.3 GB    4 seconds ago
ric-orchestrator-runtime:backup-before-012a       be391f29a172    4.7 GB    8 seconds ago
ric-orchestrator-candidate:011c-fix1-qwen3-14b    585f4d5c2075    9.3 GB    26 minutes ago
ric-orchestrator-candidate:011c-qwen3-14b         69621e4ca8dd    9.3 GB    42 minutes ago
ric-orchestrator-candidate:011b-qwen3-14b         e5864fb8e7a8    9.3 GB    About an hour ago
ric-orchestrator-candidate:011a-qwen3-14b         04b9f84d5bbc    9.3 GB    2 hours ago
qwen3:14b                                         bdbd181c33f2    9.3 GB    13 hours ago
ric-architect-qwen-v2:latest                      6a94ce329010    4.7 GB    2 days ago
qwen2.5-coder:7b                                  dae161e27b0e    4.7 GB    4 days ago
```

## Smoke test

Command:

```powershell
ollama run ric-orchestrator-runtime:latest --think=false --nowordwrap "Responda apenas: RIC-RUNTIME-012A-OK"
```

Result:

```text
RIC-RUNTIME-012A-OK
```

The Ollama CLI emitted terminal control/spinner noise after the expected smoke-test token, as observed in previous qwen3 tests.

## Decision

Promotion completed and is ready for REVIEW.

`ric-orchestrator-runtime:latest` now points to model ID `585f4d5c2075`, matching `ric-orchestrator-candidate:011c-fix1-qwen3-14b`.

Backup `ric-orchestrator-runtime:backup-before-012a` exists and points to previous runtime model ID `be391f29a172`.

## Safety confirmation

- Backup was created before promotion.
- Promotion used `ollama cp`, not rebuild.
- Smoke test returned `RIC-RUNTIME-012A-OK`.
- Official `runtime/ric-orchestrator/Modelfile` was not altered.
- No model was deleted.
- No UI, app, scripts, Git automation, `.github`, package, dependency, workflow, or deploy changes were made.
- No `git add .`, commit, or push was executed.
