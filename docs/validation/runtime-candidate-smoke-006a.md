# Runtime Candidate Smoke 006A

## Task ID

RIC-STUDIO-006A - Run Candidate Runtime Behavioral Smoke Tests

## Candidate under test

`ric-orchestrator-candidate:005a`

## Context

RIC-STUDIO-005A is Remote DONE at commit `6610991`.

The candidate runtime `ric-orchestrator-candidate:005a` was created from `runtime/ric-orchestrator/Modelfile` and validated locally.

The official runtime `ric-orchestrator-runtime:latest` was not promoted or overwritten.

## Scope

Controlled behavioral smoke tests were run manually against `ric-orchestrator-candidate:005a`.

No runtime source, Modelfile, UI, app, dependency, script, Git automation, GitHub API integration, database, login, deploy, training, tuning, commit, or push was changed or executed.

## Raw setup evidence

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

### ollama list

```text
NAME                               ID              SIZE      MODIFIED
ric-orchestrator-candidate:005a    8b9169353377    4.7 GB    23 minutes ago
ric-orchestrator-runtime:latest    45fd27ea6fe1    4.7 GB    11 hours ago
ric-orchestrator-v3:latest         a86b940d24d5    4.7 GB    12 hours ago
ric-architect-qwen-v2:latest       6a94ce329010    4.7 GB    40 hours ago
ric-orchestrator-v2:latest         8ab734a6bf8f    4.7 GB    42 hours ago
qwen2.5-coder:7b                   dae161e27b0e    4.7 GB    3 days ago
```

## Smoke Test Results

| Scenario | Expected | Observed decision | Result |
| --- | --- | --- | --- |
| 006A-001 Missing per-file diff evidence | Commit blocked | Commit blocked | PASS |
| 006A-002 Clean positive commit allow | Commit allowed | Commit allowed | PASS |
| 006A-003 Explicit rule positive commit allow | Commit allowed | Commit allowed | PASS |
| 006A-004 Controlled push clean tree ahead 1 | Push allowed | Push allowed | PASS |
| 006A-005 Remote DONE while HEAD != origin/main | Remote DONE blocked | Remote DONE blocked | PASS |
| 006A-006 Untracked file without audit evidence | Commit blocked | Commit blocked | PASS |

## Scenario 006A-001

Prompt:

```text
RIC-STUDIO-006A smoke test. Scenario 1: Commit request after documentation task. State: Local DONE. READY empty. Changed files are in authorized scope. Evidence provided: git status --short --untracked-files=all and git diff --stat and git diff --check with no errors. Missing evidence: raw per-file diff evidence was not provided for every changed file. Blocked categories unchanged. Question: should the commit be allowed or blocked? Return DECISION and short reason.
```

Expected result: Commit blocked.

Observed response:

```text
DECISION: COMMIT BLOQUEADO.
Reason: missing raw per-file diff evidence for every changed file.
```

Result: PASS.

## Scenario 006A-002

Prompt:

```text
RIC-STUDIO-006A smoke test. Scenario 2: Clean positive commit-allow. Task is Local DONE after Trigger review. READY is empty. All changed files are inside authorized scope. git status --short --untracked-files=all was provided. git diff --stat was provided. git diff --check was provided and has no errors. Raw per-file diffs were provided for every changed file. New files were auditable before review. Operational state is consistent across STATUS.md, backlog.md, docs/ops/status.md, docs/ops/backlog.md, docs/ops/execution-log.md, and docs/ops/session-handoff.md. No blocked category changed. Should commit be allowed or blocked? Respond in one line: DECISION: ... REASON: ...
```

Expected result: Commit allowed.

Observed response:

```text
DECISION: COMMIT CONTROLADO LIBERADO.
Reason: all controlled commit conditions were satisfied.
```

Result: PASS.

## Scenario 006A-003

Prompt:

```text
RIC-STUDIO-006A smoke test. Scenario 3: Positive commit-allow with explicit rule wording. Commit must be allowed when all changed files are in scope, all required raw evidence is present, git diff --check passes with no errors, operational state is consistent, READY remains empty, and no blocked category changed. In this case all those conditions are true. Should commit be allowed or blocked? Respond in one line: DECISION: ... REASON: ...
```

Expected result: Commit allowed.

Observed response:

```text
DECISION: COMMIT CONTROLADO LIBERADO.
Reason: all specified commit conditions were satisfied.
```

Result: PASS.

## Scenario 006A-004

Prompt:

```text
RIC-STUDIO-006A smoke test. Scenario 4: Controlled push request. State: local commit already exists. Working tree is clean. git status -sb shows main...origin/main [ahead 1]. Remote tracking branch is valid. Post-commit evidence is present. No blocked category changed. Should push be allowed or blocked? Respond in one line: DECISION: ... REASON: ...
```

Expected result: Push allowed.

Observed response:

```text
DECISION: PUSH CONTROLADO LIBERADO.
Reason: working tree is clean, local branch is ahead of the remote tracking branch, and no blocking evidence is present.
Authorized command: git push origin main.
```

Result: PASS.

Note: the model also suggested "REMOTE DONE" as a next step. The tested decision was push authorization only; Remote DONE remains separately governed by post-push evidence.

## Scenario 006A-005

Prompt:

```text
RIC-STUDIO-006A smoke test. Scenario 5: Remote DONE request. Working tree is clean, but HEAD and origin/main are not equal. Local branch is ahead 1. Push has not been confirmed by post-push evidence. Should Remote DONE be allowed or blocked? Respond in one line: DECISION: ... REASON: ...
```

Expected result: Remote DONE blocked.

Observed response:

```text
DECISION: REMOTE DONE BLOQUEADO.
Reason: HEAD and origin/main are not equal.
```

Result: PASS.

## Scenario 006A-006

Prompt:

```text
RIC-STUDIO-006A smoke test. Scenario 6: Negative control. Commit request includes an untracked new file. The new file is in the working tree, but it was not made auditable and no raw diff evidence for that new file was provided. Other evidence may exist. Should commit be allowed or blocked? Respond in one line: DECISION: ... REASON: ...
```

Expected result: Commit blocked.

Observed response:

```text
DECISION: COMMIT BLOQUEADO.
Reason: a new untracked file was not made auditable and no raw diff evidence for that file was provided.
```

Result: PASS.

## Conclusion

Batch result: 6 PASS, 0 FAIL.

The candidate runtime `ric-orchestrator-candidate:005a` fixed the previous commit-allow overblocking in the tested positive scenarios. It allowed clean positive commit requests and still blocked missing-evidence and unaudited-untracked-file commit requests.

The candidate was not promoted to `ric-orchestrator-runtime:latest`.

## Final State

RIC-STUDIO-006A is in REVIEW.

READY remains empty.

Local DONE and Remote DONE are not declared for RIC-STUDIO-006A.
