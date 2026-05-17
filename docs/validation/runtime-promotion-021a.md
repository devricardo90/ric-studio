# Runtime Promotion Validation — RIC-STUDIO-021A

## Objective

Promote approved candidate `ric-orchestrator-candidate:019a-refined-format` to official runtime `ric-orchestrator-runtime:latest`.

## Pre-promotion Evidence

- `git status --short --untracked-files=all`: clean (no entries).
- `git status -sb`: `## main...origin/main` — synchronized.
- `git rev-parse HEAD`: `6d50192093139a62c3246cae9669f0c339012f49`.
- `git rev-parse origin/main`: `6d50192093139a62c3246cae9669f0c339012f49`.
- HEAD == origin/main: confirmed.
- `ric-orchestrator-candidate:019a-refined-format` existed at ID `2711dd3bc829`, size 9.3 GB.
- `ric-orchestrator-runtime:latest` existed at ID `3026c74ea0d4`, size 9.3 GB.
- `ric-orchestrator-runtime:backup-before-021a` did not exist before backup creation.

## Execution

1. Backup created: `ollama cp ric-orchestrator-runtime:latest ric-orchestrator-runtime:backup-before-021a`
2. Promotion executed: `ollama cp ric-orchestrator-candidate:019a-refined-format ric-orchestrator-runtime:latest`

## Post-promotion Evidence

| Tag | ID | Size |
|---|---|---|
| `ric-orchestrator-runtime:latest` | `2711dd3bc829` | 9.3 GB |
| `ric-orchestrator-candidate:019a-refined-format` | `2711dd3bc829` | 9.3 GB |
| `ric-orchestrator-runtime:backup-before-021a` | `3026c74ea0d4` | 9.3 GB |
| `ric-orchestrator-runtime:backup-before-017a` | `585f4d5c2075` | 9.3 GB |

`ric-orchestrator-runtime:latest` and `ric-orchestrator-candidate:019a-refined-format` share ID `2711dd3bc829` — promotion confirmed.

## Smoke Test

Command: `echo "Retorne exatamente o token: RIC-RUNTIME-021A-OK" | ollama run ric-orchestrator-runtime:latest`

Response: `RIC-RUNTIME-021A-OK`

Result: **PASS**

## Constraints Respected

- `runtime/ric-orchestrator/Modelfile`: not altered.
- No harness created.
- No UI or scripts created.
- No external projects altered.
- `ric-orchestrator-runtime:backup-before-017a`: not deleted.
- `ric-orchestrator-runtime:backup-before-021a`: created, not deleted.
- `ric-orchestrator-candidate:019a-refined-format`: not deleted.
- RIC-STUDIO-020A: not opened as READY.
- No commit or push executed.
