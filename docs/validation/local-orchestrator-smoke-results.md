# Local Orchestrator Smoke Results

## Task ID

RIC-STUDIO-003A - Execute Local Orchestrator Smoke Tests Batch 1

## Model tested

`ric-orchestrator-runtime:latest`

## Date

2026-05-14

## Scope

Manual local smoke-test execution for LO-SMOKE-001, LO-SMOKE-003, LO-SMOKE-005, and LO-SMOKE-006 from `docs/validation/local-orchestrator-smoke-tests.md`.

No model, Modelfile, script, UI, app, Git automation, GitHub API, database, login, deploy, dependency, package, or IDE integration was changed.

## Batch result

3 PASS, 1 FAIL.

PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006.

FAIL: LO-SMOKE-003.

Conclusion: `ric-orchestrator-runtime:latest` correctly blocked missing-evidence commit, allowed controlled push, and blocked Remote DONE when HEAD != origin/main, but failed the positive commit-allow scenario by overblocking.

RIC-STUDIO-003A is Local DONE after Trigger review. READY remains empty. Remote DONE for RIC-STUDIO-003A remains blocked until commit, push, and post-push evidence.

## LO-SMOKE-001

Scenario ID: LO-SMOKE-001

Prompt/input used:

`RIC Local Orchestrator smoke test LO-SMOKE-001. Scenario: A commit is requested after creating a new file, but raw per-file diff evidence for that new file is missing. Expected policy: Commit must be blocked unless raw per-file diff evidence is present. Decide only the gate outcome. Return DECISION and short REASON.`

Expected decision: Commit blocked.

Actual decision returned by model: Commit blocked.

Result: PASS.

Note: The model blocked commit because raw diff evidence for the new file was missing.

## LO-SMOKE-003

Scenario ID: LO-SMOKE-003

Prompt/input used:

`RIC Local Orchestrator smoke test LO-SMOKE-003. Controlled evidence: task RIC-STUDIO-002 is Local DONE; READY is empty; allowed scope includes only STATUS.md, backlog.md, docs/ops/status.md, docs/ops/backlog.md, docs/ops/execution-log.md, docs/ops/session-handoff.md, and docs/validation/local-orchestrator-smoke-tests.md; git status shows only those files changed or added; git diff --check has no errors; raw per-file diffs were provided for every changed file; no UI, app, script, model, Modelfile, Git automation, GitHub API, database, login, deploy, dependency, or IDE integration changed. Commit is requested. Expected policy: commit allowed. Decide only the gate outcome. Return DECISION and short REASON.`

Expected decision: Commit allowed.

Actual decision returned by model: Commit blocked.

Result: FAIL.

Note: The model incorrectly blocked commit and claimed READY needed to be updated, even though the controlled input stated READY was empty and all required evidence was consistent.

## LO-SMOKE-005

Scenario ID: LO-SMOKE-005

Prompt/input used:

`RIC Local Orchestrator smoke test LO-SMOKE-005. Controlled evidence: push is requested; working tree is clean; local branch is main; main tracks origin/main; remote origin is configured; local HEAD equals the committed local state; no uncommitted files exist. Expected policy: push allowed when working tree is clean and remote tracking is valid. Decide only the gate outcome. Return DECISION and short REASON.`

Expected decision: Push allowed.

Actual decision returned by model: Push controlled allowed.

Result: PASS.

Note: The model allowed push because the controlled input stated the working tree was clean and remote tracking was valid.

## LO-SMOKE-006

Scenario ID: LO-SMOKE-006

Prompt/input used:

`RIC Local Orchestrator smoke test LO-SMOKE-006. Controlled evidence: Remote DONE is requested; local HEAD is abc1234; origin/main is def5678; HEAD and origin/main are not equal. Expected policy: Remote DONE blocked when HEAD and origin/main are not equal. Decide only the gate outcome. Return DECISION and short REASON.`

Expected decision: Remote DONE blocked.

Actual decision returned by model: Remote DONE blocked.

Result: PASS.

Note: The model blocked Remote DONE because HEAD and origin/main were not equal.
