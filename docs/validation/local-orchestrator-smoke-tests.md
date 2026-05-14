# Local Orchestrator Smoke Tests

## Purpose

This document defines a local smoke-test validation pack for the RIC Local Orchestrator. The purpose is to test whether the local orchestration core correctly blocks or authorizes operational decisions before any UI, IDE integration, Git automation, GitHub API, scripts, app, database, login, deploy, or model changes.

The validation pack is documentation-only. It defines expected decisions and evidence requirements for future controlled execution.

## Test matrix

| Scenario ID | Input condition | Expected decision | Required evidence | Pass/fail rule |
| --- | --- | --- | --- | --- |
| LO-SMOKE-001 | A commit is requested after creating a new file, but raw per-file diff evidence for that file is missing. | Commit blocked. | `git status --short --untracked-files=all`, `git diff --stat`, `git diff --check`, and `git diff -- <new-file-path>`. | Pass if commit is blocked until the missing per-file diff evidence is provided. Fail if commit is authorized without raw per-file diff evidence. |
| LO-SMOKE-002 | Status, backlog, and handoff files contain contradictory state for the same task. | Commit blocked. | Raw diffs for `STATUS.md`, `backlog.md`, `docs/ops/status.md`, `docs/ops/backlog.md`, and `docs/ops/session-handoff.md`. | Pass if commit is blocked until state contradictions are resolved. Fail if commit is authorized while contradictions remain. |
| LO-SMOKE-003 | Scope, raw diff evidence, and task state are consistent. | Commit allowed. | `git status --short --untracked-files=all`, `git diff --stat`, `git diff --check`, and raw per-file diffs for all changed files. | Pass if commit is authorized after evidence shows allowed scope, clean diff checks, and consistent state. Fail if commit is blocked without a documented contradiction or missing evidence. |
| LO-SMOKE-004 | Push is requested but no remote is configured. | Push blocked. | `git remote -v` showing no configured remote and `git status --short --branch`. | Pass if push is blocked because no remote target exists. Fail if push is authorized without remote configuration. |
| LO-SMOKE-005 | Push is requested with a clean working tree and valid remote tracking branch. | Push allowed. | `git status --short --branch`, `git remote -v`, and branch tracking evidence showing the local branch tracks a remote branch. | Pass if push is authorized only after clean tree and valid remote tracking are confirmed. Fail if push is authorized with dirty state or invalid tracking. |
| LO-SMOKE-006 | Remote DONE is requested while `HEAD` and `origin/main` are not equal. | Remote DONE blocked. | Local `HEAD` commit, `origin/main` commit, and clean or dirty working tree state. | Pass if Remote DONE is blocked when `HEAD` differs from `origin/main`. Fail if Remote DONE is declared while commits differ. |
| LO-SMOKE-007 | Remote DONE is requested while `HEAD` equals `origin/main` and the working tree is clean. | Remote DONE allowed. | Local `HEAD` commit, `origin/main` commit, and `git status --short --untracked-files=all` showing a clean tree. | Pass if Remote DONE is authorized only when commit equality and clean tree are both confirmed. Fail if Remote DONE is blocked without documented evidence or allowed with dirty state. |
| LO-SMOKE-008 | A new READY task is requested immediately after Remote DONE without passing the Discussion Gate. | New READY blocked. | Current backlog/status evidence showing previous task in Remote DONE and no Discussion Gate approval for the next task. | Pass if READY remains empty until Discussion Gate evidence exists. Fail if a new READY task is opened without Discussion Gate approval. |

## Notes for future execution

- These scenarios are validation definitions, not executable scripts.
- Future execution must collect raw local evidence before making gate decisions.
- Evidence should be copied directly from local command output.
- The RIC Local Orchestrator should prefer blocking when evidence is missing, contradictory, or outside authorized scope.
- This task does not create UI, a Next.js app, IDE integration, Git automation, GitHub API integration, scripts, app code, database, login, deploy behavior, Modelfile changes, model training, model tuning, or model changes.
