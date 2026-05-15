# Operations Backlog

## REVIEW

No task is in REVIEW.

## READY

No task is READY.

## IN_PROGRESS

No task is IN_PROGRESS.

## Local DONE

- RIC-STUDIO-005A - Build Candidate Runtime From Versioned Modelfile.
  - Trigger review approved the candidate creation evidence.
  - Remote DONE remains blocked until commit, push, and post-push evidence.

## Remote DONE

- RIC-STUDIO-001 - Define Local MVP Scope and Agent Roles.
- RIC-STUDIO-002 - Validate Local Orchestrator Workflow With Controlled Smoke Tests.
- RIC-STUDIO-003A - Execute Local Orchestrator Smoke Tests Batch 1.
- RIC-STUDIO-003B - Diagnose Commit-Allow Overblocking.
- RIC-STUDIO-004B - Establish Clean Versioned Runtime Source.

## Discussion Gate

Future work must be discussed, scoped, and accepted before it can become READY.

## Next safe step

Controlled local commit for RIC-STUDIO-005A. No new READY task is opened.

Candidate runtime `ric-orchestrator-candidate:005a` was created and validated locally. Official runtime was not promoted or overwritten. Behavioral model tests were not executed. Remote DONE remains blocked until commit, push, and post-push evidence.

During RIC-STUDIO-004B, the clean versioned runtime source was created. No candidate model was created, no official runtime was promoted, and no behavioral model tests were executed in that task.

Diagnosis result: 2 PASS, 3 FAIL. Future system prompt or Modelfile correction is recommended but was not executed in this task.

Batch result: 3 PASS, 1 FAIL. PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006. FAIL: LO-SMOKE-003.

## Blocked for RIC-STUDIO-005A

- UI.
- Next.js app.
- IDE integration.
- Git automation.
- GitHub API integration.
- Database.
- Login.
- Deploy.
- Scripts.
- Unrelated Modelfile changes.
- Model training.
- Model tuning.
- Model changes.
- Runtime promotion.
- Runtime overwrite or deletion.
- Behavioral model tests.
