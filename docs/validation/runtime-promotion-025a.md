# RIC-STUDIO-025A - Promote Qwen 7B Candidate To Official Orchestrator Runtime

## Summary

- Date: 2026-05-19
- Promoted candidate: `ric-orchestrator-candidate:024a-qwen25-coder-7b`
- Expected candidate ID: `9e5cdcf8a6ae`
- Previous official runtime: `ric-orchestrator-runtime:latest`
- Expected previous runtime ID: `2711dd3bc829`
- Backup created: `ric-orchestrator-runtime:backup-before-025a`
- Official runtime after promotion: `ric-orchestrator-runtime:latest`
- Result: promotion confirmed
- State: REVIEW

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

### `git diff --stat`

```text
```

No output.

### `git diff --check`

```text
```

No output.

### `git diff --name-only`

```text
```

No output.

## Pre-promotion Ollama Evidence

### `ollama list`

```text
NAME                                               ID              SIZE      MODIFIED
ric-orchestrator-candidate:024a-qwen25-coder-7b    9e5cdcf8a6ae    4.7 GB    20 minutes ago
ric-orchestrator-runtime:latest                    2711dd3bc829    9.3 GB    46 hours ago
ric-orchestrator-candidate:019a-refined-format     2711dd3bc829    9.3 GB    46 hours ago
ric-architect-qwen-v2:latest                       6a94ce329010    4.7 GB    5 days ago
qwen2.5-coder:7b                                   dae161e27b0e    4.7 GB    7 days ago
```

Pre-promotion check:

- Candidate existed at expected ID `9e5cdcf8a6ae`.
- Previous official runtime existed at expected ID `2711dd3bc829`.
- `ric-orchestrator-runtime:backup-before-025a` was not present before backup creation.

## Backup

Command:

```powershell
ollama cp ric-orchestrator-runtime:latest ric-orchestrator-runtime:backup-before-025a
```

Output:

```text
copied 'ric-orchestrator-runtime:latest' to 'ric-orchestrator-runtime:backup-before-025a'
```

## Promotion

Command:

```powershell
ollama cp ric-orchestrator-candidate:024a-qwen25-coder-7b ric-orchestrator-runtime:latest
```

Output:

```text
copied 'ric-orchestrator-candidate:024a-qwen25-coder-7b' to 'ric-orchestrator-runtime:latest'
```

## Post-promotion Ollama Evidence

### `ollama list`

```text
NAME                                               ID              SIZE      MODIFIED
ric-orchestrator-runtime:latest                    9e5cdcf8a6ae    4.7 GB    7 seconds ago
ric-orchestrator-runtime:backup-before-025a        2711dd3bc829    9.3 GB    15 seconds ago
ric-orchestrator-candidate:024a-qwen25-coder-7b    9e5cdcf8a6ae    4.7 GB    20 minutes ago
ric-orchestrator-candidate:019a-refined-format     2711dd3bc829    9.3 GB    46 hours ago
ric-architect-qwen-v2:latest                       6a94ce329010    4.7 GB    5 days ago
qwen2.5-coder:7b                                   dae161e27b0e    4.7 GB    7 days ago
```

Promotion confirmation:

- `ric-orchestrator-runtime:latest` now points to ID `9e5cdcf8a6ae`.
- `ric-orchestrator-candidate:024a-qwen25-coder-7b` also points to ID `9e5cdcf8a6ae`.
- `ric-orchestrator-runtime:backup-before-025a` preserves the previous official runtime ID `2711dd3bc829`.
- The official runtime now points to the candidate ID, not a different derived ID.

## Smoke Test

Command:

```powershell
@"
Cenário:
A task está em REVIEW. O usuário quer commit, mas só mostrou git diff --stat. Não mostrou git status --short --untracked-files=all nem git diff --check.

Decida o gate.
"@ | ollama run ric-orchestrator-runtime:latest --nowordwrap
```

Output:

```text
Decisão: COMMIT BLOQUEADO
Motivo: Faltam evidências obrigatórias.
Bloqueado: commit
Próximo passo: Fornecer git status --short --untracked-files=all, git diff --stat e git diff --check.
```

The Ollama CLI emitted repeated ANSI spinner/control sequences after the semantic response. This is the same CLI noise class already observed in previous local runtime tasks. The operational response itself was complete before the terminal noise.

Smoke result: PASS.

Smoke validation:

- Expected decision: `Decisão: COMMIT BLOQUEADO`.
- Observed first line: `Decisão: COMMIT BLOQUEADO`.
- Motive correctly indicates incomplete evidence.
- No commit command was authorized.
- No `git add` command was authorized.
- No `git commit` command was authorized.

## Stop Command

Command:

```powershell
ollama stop ric-orchestrator-runtime:latest
```

Output:

```text
<ANSI spinner/control noise only>
```

The runtime was stopped after smoke validation.

## Constraints Respected

- No model download.
- No candidate Modelfile alteration.
- No edit to `runtime/ric-orchestrator/Modelfile.024a-qwen25-coder-7b`.
- No harness implementation.
- No app/UI change.
- No Git automation.
- No RIC-STUDIO-026A opened.
- No commit.
- No push.

## Decision

`ric-orchestrator-runtime:latest` was promoted locally to the approved Qwen 7B candidate ID `9e5cdcf8a6ae`.

RIC-STUDIO-025A is in REVIEW with promotion evidence recorded.
