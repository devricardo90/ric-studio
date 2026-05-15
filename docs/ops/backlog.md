# Operations Backlog

## REVIEW

No task is in REVIEW.

## READY

- RIC-STUDIO-009A - Define Local Orchestrator Error Log.

## IN_PROGRESS

No task is IN_PROGRESS.

## Local DONE

No task is Local DONE.

## Remote DONE

- RIC-STUDIO-001 - Define Local MVP Scope and Agent Roles.
- RIC-STUDIO-002 - Validate Local Orchestrator Workflow With Controlled Smoke Tests.
- RIC-STUDIO-003A - Execute Local Orchestrator Smoke Tests Batch 1.
- RIC-STUDIO-003B - Diagnose Commit-Allow Overblocking.
- RIC-STUDIO-004B - Establish Clean Versioned Runtime Source.
- RIC-STUDIO-005A - Build Candidate Runtime From Versioned Modelfile.
- RIC-STUDIO-006A - Run Candidate Runtime Behavioral Smoke Tests.
- RIC-STUDIO-007A - Validate Candidate Runtime With Real Workflow Simulation.
- RIC-STUDIO-008A - Standardize Runtime Gate Vocabulary Before Promotion.

## Discussion Gate

Future work must be discussed, scoped, and accepted before it can become READY.

## Next safe step

Start RIC-STUDIO-009A documentation-only execution. Create `docs/validation/local-orchestrator-error-log.md` and update only the authorized operations files.

RIC-STUDIO-008A is Remote DONE and synchronized with `origin/main` at commit `54c7f78`.

RIC-STUDIO-007A is Remote DONE and synchronized with `origin/main` at commit `f4a16cc`.

RIC-STUDIO-006A is Remote DONE and synchronized with `origin/main` at commit `8e3796a`.

RIC-STUDIO-005A is Remote DONE and synchronized with `origin/main` at commit `6610991`.

During RIC-STUDIO-004B, the clean versioned runtime source was created. No candidate model was created, no official runtime was promoted, and no behavioral model tests were executed in that task.

Diagnosis result: 2 PASS, 3 FAIL. Future system prompt or Modelfile correction is recommended but was not executed in this task.

Batch result: 3 PASS, 1 FAIL. PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006. FAIL: LO-SMOKE-003.

## Blocked for RIC-STUDIO-009A

- UI.
- Next.js app.
- IDE integration.
- Git automation.
- GitHub API integration.
- Database.
- Login.
- Deploy.
- Scripts.
- Runtime source changes.
- Modelfile edits.
- Ollama model creation.
- Runtime promotion.
- Official runtime changes.
- Candidate runtime changes.
- Model training.
- Model tuning.
- Dependency changes.
- Runtime deletion.
- Commit.
- Push.
