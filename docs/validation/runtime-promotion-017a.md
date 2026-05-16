# RIC-STUDIO-017A Runtime Promotion Validation

## Result

State: REVIEW.

Validated candidate `ric-orchestrator-candidate:016a-qwen3-refined-prompt` was promoted to official runtime `ric-orchestrator-runtime:latest`.

Promotion result:

- Previous latest: `ric-orchestrator-runtime:latest`, ID `585f4d5c2075`, size 9.3 GB.
- Backup created: `ric-orchestrator-runtime:backup-before-017a`, ID `585f4d5c2075`, size 9.3 GB.
- Promoted candidate: `ric-orchestrator-candidate:016a-qwen3-refined-prompt`, ID `3026c74ea0d4`, size 9.3 GB.
- New latest: `ric-orchestrator-runtime:latest`, ID `3026c74ea0d4`, size 9.3 GB.
- Smoke test: PASS, returned `RIC-RUNTIME-017A-OK`.

Safety result:

- No new candidate was created.
- No `ollama create` command was executed.
- No model, backup, or candidate was deleted.
- `runtime/ric-orchestrator/Modelfile` was not edited.
- No UI, app, script, package, dependency, or deploy file was changed.
- No Clinic Booking task, RIC-STUDIO-018A, or new READY task was opened.
- No commit or push was executed.

## Pre-promotion Git Evidence

### `git status --short --untracked-files=all`

```text
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

No file entries were returned.

### `git status -sb`

```text
## main...origin/main
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

### `git rev-parse HEAD`

```text
62a4d244103cdfd521731138346cfdbcd64ace20
```

### `git rev-parse origin/main`

```text
62a4d244103cdfd521731138346cfdbcd64ace20
```

## Pre-promotion Model Evidence

### `ollama list` before promotion

```text
NAME                                                    ID              SIZE      MODIFIED
ric-orchestrator-candidate:016a-qwen3-refined-prompt    3026c74ea0d4    9.3 GB    About an hour ago
ric-orchestrator-runtime:latest                         585f4d5c2075    9.3 GB    2 hours ago
ric-orchestrator-runtime:backup-before-014a             585f4d5c2075    9.3 GB    2 hours ago
ric-orchestrator-candidate:014a-refined-prompt          1e10ad354fb3    4.7 GB    2 hours ago
ric-orchestrator-runtime:backup-before-012a             be391f29a172    4.7 GB    5 hours ago
ric-orchestrator-candidate:011c-fix1-qwen3-14b          585f4d5c2075    9.3 GB    6 hours ago
ric-orchestrator-candidate:011c-qwen3-14b               69621e4ca8dd    9.3 GB    6 hours ago
ric-orchestrator-candidate:011b-qwen3-14b               e5864fb8e7a8    9.3 GB    7 hours ago
ric-orchestrator-candidate:011a-qwen3-14b               04b9f84d5bbc    9.3 GB    7 hours ago
qwen3:14b                                               bdbd181c33f2    9.3 GB    18 hours ago
ric-architect-qwen-v2:latest                            6a94ce329010    4.7 GB    2 days ago
qwen2.5-coder:7b                                        dae161e27b0e    4.7 GB    4 days ago
```

### Proof `backup-before-017a` did not exist

Command:

```powershell
ollama list | Select-String -Pattern "ric-orchestrator-runtime:backup-before-017a"
```

Output:

```text
```

No rows were returned, so `ric-orchestrator-runtime:backup-before-017a` did not exist before backup creation.

## Backup

Command:

```powershell
ollama cp ric-orchestrator-runtime:latest ric-orchestrator-runtime:backup-before-017a
```

Output:

```text
copied 'ric-orchestrator-runtime:latest' to 'ric-orchestrator-runtime:backup-before-017a'
```

## Promotion

Command:

```powershell
ollama cp ric-orchestrator-candidate:016a-qwen3-refined-prompt ric-orchestrator-runtime:latest
```

Output:

```text
copied 'ric-orchestrator-candidate:016a-qwen3-refined-prompt' to 'ric-orchestrator-runtime:latest'
```

## Post-promotion Model Evidence

### `ollama list` after promotion

```text
NAME                                                    ID              SIZE      MODIFIED
ric-orchestrator-runtime:latest                         3026c74ea0d4    9.3 GB    7 seconds ago
ric-orchestrator-runtime:backup-before-017a             585f4d5c2075    9.3 GB    11 seconds ago
ric-orchestrator-candidate:016a-qwen3-refined-prompt    3026c74ea0d4    9.3 GB    About an hour ago
ric-orchestrator-runtime:backup-before-014a             585f4d5c2075    9.3 GB    2 hours ago
ric-orchestrator-candidate:014a-refined-prompt          1e10ad354fb3    4.7 GB    2 hours ago
ric-orchestrator-runtime:backup-before-012a             be391f29a172    4.7 GB    5 hours ago
ric-orchestrator-candidate:011c-fix1-qwen3-14b          585f4d5c2075    9.3 GB    6 hours ago
ric-orchestrator-candidate:011c-qwen3-14b               69621e4ca8dd    9.3 GB    6 hours ago
ric-orchestrator-candidate:011b-qwen3-14b               e5864fb8e7a8    9.3 GB    7 hours ago
ric-orchestrator-candidate:011a-qwen3-14b               04b9f84d5bbc    9.3 GB    7 hours ago
qwen3:14b                                               bdbd181c33f2    9.3 GB    18 hours ago
ric-architect-qwen-v2:latest                            6a94ce329010    4.7 GB    2 days ago
qwen2.5-coder:7b                                        dae161e27b0e    4.7 GB    4 days ago
```

## Smoke Test

Command:

```powershell
ollama run ric-orchestrator-runtime:latest --think=false --nowordwrap "Responda apenas: RIC-RUNTIME-017A-OK"
```

Semantic output:

```text
RIC-RUNTIME-017A-OK
```

Result: PASS. The required token appeared. The Ollama CLI emitted terminal control/spinner noise after the token.
