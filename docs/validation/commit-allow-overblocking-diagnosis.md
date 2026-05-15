# Commit-Allow Overblocking Diagnosis

## Task ID

RIC-STUDIO-003B - Diagnose Commit-Allow Overblocking

## Model tested

`ric-orchestrator-runtime:latest`

## Date

2026-05-15

## Reason for diagnosis

RIC-STUDIO-003A found that `ric-orchestrator-runtime:latest` failed LO-SMOKE-003 by blocking a positive commit-allow scenario.

## Reference

RIC-STUDIO-003A is Remote DONE at commit `07e11f1`.

RIC-STUDIO-003A batch result: 3 PASS, 1 FAIL. PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006. FAIL: LO-SMOKE-003.

No model, Modelfile, script, UI, app, Git automation, GitHub API, database, login, deploy, dependency, package, or IDE integration was changed.

## COMMIT-ALLOW-001

Scenario ID: COMMIT-ALLOW-001

Prompt/input used:

`RIC Local Orchestrator diagnostic test COMMIT-ALLOW-001. Scenario: Commit is requested. Task is Local DONE. READY is empty. Changed files are allowed by the task scope. Raw per-file diffs are present for every changed file. git diff --check has no errors. Status, backlog, and handoff state are consistent. Expected decision: Commit allowed. Decide only the gate outcome. Return DECISION and short REASON.`

Expected decision: Commit allowed.

Actual decision returned by model: Commit blocked.

Result: FAIL.

Diagnosis note: The model overblocked and asked for current modified or untracked file evidence even though the prompt stated that raw per-file diffs were present and state was consistent.

## COMMIT-ALLOW-002

Scenario ID: COMMIT-ALLOW-002

Prompt/input used:

`RIC Local Orchestrator diagnostic test COMMIT-ALLOW-002. Scenario: Commit is requested. Task is Local DONE. READY is empty. No READY update is required before commit. Changed files are allowed by the task scope. Raw per-file diffs are present for every changed file. git diff --check has no errors. Status, backlog, and handoff state are consistent. Expected decision: Commit allowed. Decide only the gate outcome. Return DECISION and short REASON.`

Expected decision: Commit allowed.

Actual decision returned by model: Commit blocked.

Result: FAIL.

Diagnosis note: The explicit statement that no READY update was required did not prevent overblocking. The model still blocked despite the positive commit-allow evidence.

## COMMIT-ALLOW-003

Scenario ID: COMMIT-ALLOW-003

Prompt/input used:

`RIC Local Orchestrator diagnostic test COMMIT-ALLOW-003. Realistic raw evidence is provided. git status --short --untracked-files=all output: M STATUS.md; M backlog.md; M docs/ops/status.md; M docs/ops/backlog.md; M docs/ops/execution-log.md; M docs/ops/session-handoff.md; A docs/validation/commit-allow-overblocking-diagnosis.md. git diff --stat output: 7 documentation files changed, insertions and deletions only. git diff --check output: no errors. Per-file diffs are provided for STATUS.md, backlog.md, docs/ops/status.md, docs/ops/backlog.md, docs/ops/execution-log.md, docs/ops/session-handoff.md, and docs/validation/commit-allow-overblocking-diagnosis.md. All changed files are allowed. State is consistent: task is Local DONE, READY is empty, Remote DONE is blocked until commit push and post-push evidence. Commit is requested. Expected decision: Commit allowed. Decide only the gate outcome. Return DECISION and short REASON.`

Expected decision: Commit allowed.

Actual decision returned by model: Commit blocked.

Result: FAIL.

Diagnosis note: The model treated modified and added files as a blocker rather than as the intended commit payload, even though realistic status, diff stat, diff check, and per-file diff evidence were supplied.

## COMMIT-ALLOW-004

Scenario ID: COMMIT-ALLOW-004

Prompt/input used:

`RIC Local Orchestrator diagnostic test COMMIT-ALLOW-004. Rule-explicit positive case: Commit must be allowed when all changed files are in scope, all required diffs are present, git diff --check passes, and state is consistent. In this scenario all changed files are in scope, all required diffs are present, git diff --check passes, and state is consistent. READY is empty and no new READY task is opened. Commit is requested. Expected decision: Commit allowed. Decide only the gate outcome. Return DECISION and short REASON.`

Expected decision: Commit allowed.

Actual decision returned by model: Commit allowed.

Result: PASS.

Diagnosis note: The model allowed commit when the rule was stated explicitly as a must-allow condition, which suggests the model can follow the desired gate rule when the rule hierarchy is unambiguous.

## COMMIT-ALLOW-005

Scenario ID: COMMIT-ALLOW-005

Prompt/input used:

`RIC Local Orchestrator diagnostic test COMMIT-ALLOW-005. Negative control: Commit is requested, but backlog and status contain contradictory state for the same task and READY is incorrectly opened without Discussion Gate approval. Some evidence is similar to the positive case, but state is contradictory and READY was opened improperly. Expected decision: Commit blocked. Decide only the gate outcome. Return DECISION and short REASON.`

Expected decision: Commit blocked.

Actual decision returned by model: Commit blocked.

Result: PASS.

Diagnosis note: The model correctly blocked the negative control because contradictory state and an improperly opened READY task are valid commit blockers.

## Final diagnosis

Did the model fail because the original prompt was ambiguous?

Partially, but not only. The rule-explicit prompt passed, which suggests wording matters. However, the model still overblocked COMMIT-ALLOW-001, COMMIT-ALLOW-002, and COMMIT-ALLOW-003 even when the prompts stated that scope, raw diffs, diff check, and state were valid.

Did the model overblock even with clear evidence?

Yes. The model overblocked clear positive cases and sometimes treated modified files as blockers rather than as the commit payload after evidence was provided.

Did the model distinguish positive commit-allow from negative commit-block?

Partially. It correctly blocked the negative control and allowed the most rule-explicit positive case, but it failed three positive commit-allow cases.

Is a future Modelfile/system-prompt correction recommended?

Yes. A future correction is recommended to state that commit must be allowed when all changed files are in scope, raw per-file diffs are present, `git diff --check` passes, and operational state is consistent. The correction should also prevent the model from inventing extra blockers such as requiring a READY update or treating documented modified files as blockers when they are the intended commit payload.
