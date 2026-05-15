# Operations Backlog

## REVIEW

- RIC-STUDIO-006A - Run Candidate Runtime Behavioral Smoke Tests.

## READY

No task is READY.

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

## Discussion Gate

Future work must be discussed, scoped, and accepted before it can become READY.

## Next safe step

Trigger review for RIC-STUDIO-006A after raw evidence is reviewed. No new READY task is opened.

RIC-STUDIO-006A completed behavioral smoke tests against `ric-orchestrator-candidate:005a` with 6 PASS and 0 FAIL. The candidate fixed the previous positive commit-allow overblocking in the tested scenarios. Candidate promotion remains blocked.

RIC-STUDIO-005A is Remote DONE and synchronized with `origin/main` at commit `6610991`.

During RIC-STUDIO-004B, the clean versioned runtime source was created. No candidate model was created, no official runtime was promoted, and no behavioral model tests were executed in that task.

Diagnosis result: 2 PASS, 3 FAIL. Future system prompt or Modelfile correction is recommended but was not executed in this task.

Batch result: 3 PASS, 1 FAIL. PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006. FAIL: LO-SMOKE-003.

## Blocked for RIC-STUDIO-006A

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
- Model training.
- Model tuning.
- Model changes.
- Runtime promotion.
- Runtime overwrite or deletion.
