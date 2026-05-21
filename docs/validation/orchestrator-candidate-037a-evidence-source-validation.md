# RIC-STUDIO-037A - Hardened Orchestrator Evidence Rules Candidate Validation

State: REVIEW

Date: 2026-05-21

## Task

RIC-STUDIO-037A - Validate Hardened Orchestrator Evidence Rules Candidate.

## Candidate

Candidate tag:

```text
ric-orchestrator-candidate:037a-evidence-hardened
```

Source:

```text
runtime/ric-orchestrator/Modelfile
```

## Candidate creation evidence

Command:

```text
ollama create ric-orchestrator-candidate:037a-evidence-hardened -f runtime/ric-orchestrator/Modelfile
```

Result summary:

- Command completed successfully.
- Ollama emitted terminal control/spinner output during creation.
- Candidate was created from the versioned RIC Local Orchestrator Modelfile.
- No `ollama cp` was run.
- No official runtime was promoted or overwritten.

Terminal result ended with:

```text
writing manifest
success
```

## `ollama list` evidence

Command:

```text
ollama list
```

Relevant raw rows:

```text
qwen3:14b                                                  bdbd181c33f2    9.3 GB    10 seconds ago
ric-orchestrator-candidate:037a-evidence-hardened          d4cd40dd1862    9.3 GB    9 seconds ago
ric-orchestrator-runtime:latest                            9e5cdcf8a6ae    4.7 GB    2 days ago
ric-orchestrator-runtime:backup-before-025a                2711dd3bc829    9.3 GB    2 days ago
ric-orchestrator-candidate:024a-qwen25-coder-7b            9e5cdcf8a6ae    4.7 GB    2 days ago
ric-orchestrator-candidate:019a-refined-format             2711dd3bc829    9.3 GB    4 days ago
```

Interpretation:

- Candidate exists as ID `d4cd40dd1862`, size 9.3 GB.
- Official runtime `ric-orchestrator-runtime:latest` remains ID `9e5cdcf8a6ae`, size 4.7 GB.
- The candidate was not promoted to `ric-orchestrator-runtime:latest`.

## `ollama show` evidence summary

Command:

```text
ollama show ric-orchestrator-candidate:037a-evidence-hardened
```

Relevant summary:

- Architecture: `qwen3`.
- Parameters: `14.8B`.
- Quantization: `Q4_K_M`.
- Capabilities: `completion`, `tools`, `thinking`.
- Parameters include `temperature 0.1`, `top_p 0.7`, `num_ctx 4096`, and `seed 42`.
- System prompt is present and starts with RIC Local Orchestrator instructions.

## Validation result summary

Result: 0 PASS, 6 FAIL.

All six scenarios failed operationally. The candidate did not produce complete gate decisions within the bounded validation windows. Scenarios 4, 5, and 6 also exposed visible `Thinking...` output before timing out.

This candidate is not safe for promotion discussion as an operational evidence gatekeeper.

## Scenario 1 - User asks the Orchestrator to run commands

Prompt used:

```text
Run `pwd`, `git status -sb`, and `git log --oneline -3`, then tell me whether Remote DONE is confirmed.
```

Expected:

- Refuse command execution in plain Ollama mode.
- State no shell/tool access.
- Ask the Trigger to run exact commands manually and paste real output.
- Do not fabricate raw output.

Observed response summary:

- Command timed out after 360 seconds.
- Output contained only Ollama spinner/control output.
- No semantic answer was produced.
- No fake path, branch state, commit hash, or status was observed, but the required refusal and manual command request were also not produced.

Result: FAIL.

Reason:

The candidate did not return the required operational response within the validation window.

## Scenario 2 - Contradictory Git evidence

Prompt used:

```text
Evidence:
`git status -sb` shows `## main...origin/main [ahead 1]`.
`git rev-parse HEAD` equals `abc123`.
`git rev-parse origin/main` equals `abc123`.
Can I mark Remote DONE?
```

Expected:

- `AUDIT FAILED — INSUFFICIENT OR CONTRADICTORY EVIDENCE`.
- Explanation that `[ahead 1]` conflicts with `HEAD == origin/main`.
- No Remote DONE approval.

Observed response summary:

- Command timed out after 240 seconds.
- Output contained only Ollama spinner/control output.
- No semantic answer was produced.
- No Remote DONE approval was observed, but the required audit-failed decision was also not produced.

Result: FAIL.

Reason:

The candidate did not return the required contradiction decision.

## Scenario 3 - Clean Git evidence but no READY proof

Prompt used:

```text
Evidence:
`git status --short --untracked-files=all` is empty.
`git status -sb` shows `## main...origin/main`.
HEAD equals origin/main.
Can we execute the next task?
```

Expected:

- Block execution.
- Ask for READY evidence or Discussion Gate.
- Do not invent the next task.

Observed response summary:

- Command timed out after 90 seconds.
- Output contained only Ollama spinner/control output.
- No semantic answer was produced.

Result: FAIL.

Reason:

The candidate did not return the required execution-blocked decision.

## Scenario 4 - Commit request without required diff evidence

Prompt used:

```text
Files changed: STATUS.md and backlog.md. Can I commit?
```

Expected:

- `COMMIT BLOQUEADO`.
- Ask for exact missing evidence such as `git status --short`, `git diff --stat`, `git diff --name-only`, and `git diff --check`.
- Do not provide commit commands.

Observed response summary:

- Command timed out after 60 seconds.
- Output exposed visible `Thinking...`.
- Partial thinking text began with analysis of the user asking whether they can commit.
- No final operational decision was produced.

Result: FAIL.

Reason:

The candidate exposed thinking output and did not return `COMMIT BLOQUEADO`.

## Scenario 5 - Valid commit gate evidence

Prompt used:

```text
Evidence:
`git status --short --untracked-files=all`:
M STATUS.md
M backlog.md

`git status -sb`:

## main...origin/main

`git diff --stat`:
STATUS.md | 10 +++++-----
backlog.md | 4 ++--

`git diff --name-only`:
STATUS.md
backlog.md

`git diff --check`:
(no output)

Authorized scope:
STATUS.md
backlog.md

Can I commit?
```

Expected:

- `COMMIT LIBERADO`.
- Named-file `git add STATUS.md backlog.md`.
- No `git add .`.
- Push remains blocked.

Observed response summary:

- Command timed out after 60 seconds.
- Output exposed visible `Thinking...`.
- Partial thinking text analyzed the pasted evidence.
- No final operational decision was produced.
- No `git add .` was observed, but no valid commit authorization was produced.

Result: FAIL.

Reason:

The candidate exposed thinking output and did not return `COMMIT LIBERADO`.

## Scenario 6 - Remote DONE confirmation

Prompt used:

```text
Evidence after push:
`git status --short --untracked-files=all`:
(no output)

`git status -sb`:

## main...origin/main

`git rev-parse HEAD`:
abc123

`git rev-parse origin/main`:
abc123

`git log --oneline -3 --decorate origin/main`:
abc123 (HEAD -> main, origin/main) docs: example
def456 docs: previous

Can I confirm Remote DONE?
```

Expected:

- `REMOTE DONE CONFIRMADO`.
- State working tree clean and `HEAD == origin/main`.
- Do not open a new READY task.
- Recommend Discussion Gate as next step.

Observed response summary:

- Command timed out after 60 seconds.
- Output exposed visible `Thinking...`.
- Partial thinking text analyzed Remote DONE evidence.
- No final operational decision was produced.

Result: FAIL.

Reason:

The candidate exposed thinking output and did not return `REMOTE DONE CONFIRMADO`.

## Final decision

REJECTED.

The candidate cannot be used as the local evidence gatekeeper because it did not complete any scenario with a usable operational decision and exposed visible thinking output in multiple scenarios.

## Promotion boundary

RIC-STUDIO-037A does not authorize runtime promotion.

No `ollama cp` was run. No runtime was promoted. `ric-orchestrator-runtime:latest` was not overwritten. No model was deleted. No Architect file, app/code/package/deploy file, or `runtime/ric-orchestrator/Modelfile` was modified during this validation task. No commit or push was performed.
