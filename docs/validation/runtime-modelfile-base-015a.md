# RIC-STUDIO-015A - Runtime Modelfile Base Alignment

## Task

RIC-STUDIO-015A - Align Official Runtime Modelfile Base With Approved Qwen3 14B Runtime.

## Objective

Correct the versioned official runtime source at `runtime/ric-orchestrator/Modelfile` so future rebuilds use the approved Qwen3 14B base instead of regressing to `qwen2.5-coder:7b`.

## Context

- RIC-STUDIO-013A refined the versioned runtime prompt.
- RIC-STUDIO-014A attempted rebuild and promotion, but was BLOCKED / ROLLED BACK because the Modelfile still started with `FROM qwen2.5-coder:7b`.
- The active runtime was restored to Qwen3 14B model ID `585f4d5c2075`, size 9.3 GB.
- The RIC-STUDIO-013A prompt correction is still not applied to the active runtime.
- This task corrects only the versioned source to prepare a safer future rebuild.

## Pre-validation evidence

`git status --short --untracked-files=all`:

```text
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

`git status -sb`:

```text
## main...origin/main
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

`git rev-parse HEAD`:

```text
bd6aa579420e443213ca4256e3f0190b54216607
```

`git rev-parse origin/main`:

```text
bd6aa579420e443213ca4256e3f0190b54216607
```

`ollama list`:

```text
NAME                                              ID              SIZE      MODIFIED
ric-orchestrator-runtime:latest                   585f4d5c2075    9.3 GB    18 minutes ago
ric-orchestrator-runtime:backup-before-014a       585f4d5c2075    9.3 GB    32 minutes ago
ric-orchestrator-candidate:014a-refined-prompt    1e10ad354fb3    4.7 GB    33 minutes ago
ric-orchestrator-runtime:backup-before-012a       be391f29a172    4.7 GB    4 hours ago
ric-orchestrator-candidate:011c-fix1-qwen3-14b    585f4d5c2075    9.3 GB    4 hours ago
ric-orchestrator-candidate:011c-qwen3-14b         69621e4ca8dd    9.3 GB    5 hours ago
ric-orchestrator-candidate:011b-qwen3-14b         e5864fb8e7a8    9.3 GB    5 hours ago
ric-orchestrator-candidate:011a-qwen3-14b         04b9f84d5bbc    9.3 GB    6 hours ago
qwen3:14b                                         bdbd181c33f2    9.3 GB    17 hours ago
ric-architect-qwen-v2:latest                      6a94ce329010    4.7 GB    2 days ago
qwen2.5-coder:7b                                  dae161e27b0e    4.7 GB    4 days ago
```

`Get-Content runtime/ric-orchestrator/Modelfile -TotalCount 5` before edit:

```text
FROM qwen2.5-coder:7b

PARAMETER seed 42
PARAMETER temperature 0.1
PARAMETER top_p 0.7
```

## Change

Updated only the first line of `runtime/ric-orchestrator/Modelfile`:

```diff
-FROM qwen2.5-coder:7b
+FROM qwen3:14b
```

No prompt rules were changed in this task.

## Safety confirmation

- Did not run `ollama create`.
- Did not run `ollama cp`.
- Did not rebuild or promote a runtime.
- Did not delete models, backups, or candidates.
- Did not alter UI, app, scripts, `.github`, package, dependency, lockfile, workflow, or deploy files.
- Did not open RIC-STUDIO-016A.
- Did not mark a new task as READY.
- Did not commit or push.

## Review status

RIC-STUDIO-015A is ready for REVIEW.
