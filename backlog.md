# RIC Studio Backlog

## REVIEW

No task is in REVIEW.

## Local DONE

- RIC-STUDIO-004B - Establish Clean Versioned Runtime Source

## Remote DONE

- RIC-STUDIO-001 - Define Local MVP Scope and Agent Roles
- RIC-STUDIO-002 - Validate Local Orchestrator Workflow With Controlled Smoke Tests
- RIC-STUDIO-003A - Execute Local Orchestrator Smoke Tests Batch 1
- RIC-STUDIO-003B - Diagnose Commit-Allow Overblocking

## READY

No task is READY.

## Next safe step

Controlled local commit for RIC-STUDIO-004B.

Remote DONE for RIC-STUDIO-004B remains blocked until commit, push, and post-push evidence.

Clean versioned runtime source was created. No candidate model was created, no official runtime was promoted, and no behavioral model tests were executed.

Diagnosis result: 2 PASS, 3 FAIL. Future system prompt or Modelfile correction is recommended but was not executed in this task.

Batch result: 3 PASS, 1 FAIL. PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006. FAIL: LO-SMOKE-003.

## Blocked

The following categories are blocked for RIC-STUDIO-004B:

- UI
- Next.js app
- IDE integration
- Git automation
- GitHub API integration
- Database
- Login
- Deploy
- Scripts
- Unrelated Modelfile changes
- Model training or tuning
- Model changes
- Candidate model creation
- Runtime promotion

## Future candidates

Future tasks must pass the Discussion Gate before entering READY.
