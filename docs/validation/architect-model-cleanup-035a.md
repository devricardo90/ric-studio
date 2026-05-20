# RIC-STUDIO-035A - Rejected Architect Local Model Cleanup

State: REVIEW

Date: 2026-05-20

## Task objective

Clean rejected local Architect Ollama models after failed Architect candidate validations, while preserving the official Architect runtime, backup runtime, and useful local base model.

## Strategic decision

Local Architect promotion is paused for now.

The recent local Architect candidates failed because they invented state and assumed task or MVP completion without evidence. ChatGPT remains the strategic Architect. RIC Orchestrator remains the local evidence gatekeeper.

No Architect runtime promotion is authorized by RIC-STUDIO-035A.

## Pre-cleanup inventory

Command:

```text
ollama list | findstr /i "ric-architect qwen2.5-coder qwen3"
```

Raw output:

```text
ric-architect-candidate:033a-small-mvp-7b                  eb8e084fd363    4.7 GB    16 minutes ago
ric-architect-candidate:030a-pragmatic-mvp                 c0a0e8da9a7c    4.7 GB    4 hours ago
ric-architect-qwen-v2:latest                               b2ba1b3efeae    4.7 GB    18 hours ago
ric-architect-qwen-v2:backup-before-028b                   6a94ce329010    4.7 GB    18 hours ago
ric-architect-candidate:028a-qwen25-coder-7b-contextfix    b2ba1b3efeae    4.7 GB    19 hours ago
ric-architect-candidate:026a-qwen25-coder-7b               c8cfc69738af    4.7 GB    22 hours ago
qwen2.5-coder:7b                                           dae161e27b0e    4.7 GB    8 days ago
```

## Deletion candidate check

Approved deletion list:

- `ric-architect-candidate:033a-small-mvp-7b`
- `ric-architect-candidate:032b-qwen3-8b`
- `ric-architect-candidate:032b-qwen25-coder-7b`
- `ric-architect-candidate:030a-pragmatic-mvp`
- `qwen3:8b`

Present and deleted:

- `ric-architect-candidate:033a-small-mvp-7b`
- `ric-architect-candidate:030a-pragmatic-mvp`

Not present in filtered inventory:

- `ric-architect-candidate:032b-qwen3-8b`
- `ric-architect-candidate:032b-qwen25-coder-7b`
- `qwen3:8b`

Present but not in the approved deletion list, therefore preserved:

- `ric-architect-candidate:028a-qwen25-coder-7b-contextfix`
- `ric-architect-candidate:026a-qwen25-coder-7b`

## Deletion commands and results

Command:

```text
ollama rm ric-architect-candidate:033a-small-mvp-7b
```

Raw result:

```text
deleted 'ric-architect-candidate:033a-small-mvp-7b'
```

Command:

```text
ollama rm ric-architect-candidate:030a-pragmatic-mvp
```

Raw result:

```text
deleted 'ric-architect-candidate:030a-pragmatic-mvp'
```

## Preserved model tags

Explicitly preserved by task requirement:

- `ric-architect-qwen-v2:latest`
- `ric-architect-qwen-v2:backup-before-028b`
- `qwen2.5-coder:7b`

Also preserved because they were not in the approved deletion list:

- `ric-architect-candidate:028a-qwen25-coder-7b-contextfix`
- `ric-architect-candidate:026a-qwen25-coder-7b`

## Post-cleanup inventory

Command:

```text
ollama list | findstr /i "ric-architect qwen2.5-coder qwen3"
```

Raw output:

```text
ric-architect-qwen-v2:latest                               b2ba1b3efeae    4.7 GB    18 hours ago
ric-architect-qwen-v2:backup-before-028b                   6a94ce329010    4.7 GB    18 hours ago
ric-architect-candidate:028a-qwen25-coder-7b-contextfix    b2ba1b3efeae    4.7 GB    19 hours ago
ric-architect-candidate:026a-qwen25-coder-7b               c8cfc69738af    4.7 GB    22 hours ago
qwen2.5-coder:7b                                           dae161e27b0e    4.7 GB    8 days ago
```

## Negative confirmations

- No `ollama cp` was run.
- No Architect runtime was promoted.
- `ric-architect-qwen-v2:latest` was not overwritten.
- `ric-architect-qwen-v2:latest` was not deleted.
- `ric-architect-qwen-v2:backup-before-028b` was not deleted.
- `qwen2.5-coder:7b` was not deleted.
- No Modelfile was modified.
- No Orchestrator file was modified.
- No app/code/package/deploy file was created.
- No READY task was opened.
- No commit was performed.
- No push was performed.
