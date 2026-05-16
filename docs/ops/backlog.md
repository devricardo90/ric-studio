# Operations Backlog

## REVIEW

- RIC-STUDIO-009B - Record Local Orchestrator Errors From CBM-004.
- RIC-STUDIO-013A - Refine Official Runtime Prompt For Evidence Claims And Role Boundaries.

## REJECTED / REVIEW CLOSED

- RIC-STUDIO-010A - Improve Local Orchestrator Prompt From Logged Error Patterns.
- RIC-STUDIO-011A - Benchmark Larger Base Model For Local Orchestrator.
- RIC-STUDIO-011B - Benchmark Qwen3 14B With Thinking Suppressed And Short Operational Template.

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
- RIC-STUDIO-006A - Run Candidate Runtime Behavioral Smoke Tests.
- RIC-STUDIO-007A - Validate Candidate Runtime With Real Workflow Simulation.
- RIC-STUDIO-008A - Standardize Runtime Gate Vocabulary Before Promotion.
- RIC-STUDIO-009A - Define Local Orchestrator Error Log.
- RIC-STUDIO-011C - Fix Qwen3 Orchestrator State Routing And Next-Task Synthesis.
- RIC-STUDIO-012A - Promote Approved Qwen3 Orchestrator Candidate To Official Runtime.

## Discussion Gate

Future work must be discussed, scoped, and accepted before it can become READY.

## Next safe step

Review RIC-STUDIO-013A prompt refinement evidence. Do not execute commit or push without explicit authorization.

RIC-STUDIO-008A is Remote DONE and synchronized with `origin/main` at commit `54c7f78`.

RIC-STUDIO-007A is Remote DONE and synchronized with `origin/main` at commit `f4a16cc`.

RIC-STUDIO-006A is Remote DONE and synchronized with `origin/main` at commit `8e3796a`.

RIC-STUDIO-005A is Remote DONE and synchronized with `origin/main` at commit `6610991`.

During RIC-STUDIO-004B, the clean versioned runtime source was created. No candidate model was created, no official runtime was promoted, and no behavioral model tests were executed in that task.

Diagnosis result: 2 PASS, 3 FAIL. Future system prompt or Modelfile correction is recommended but was not executed in this task.

Batch result: 3 PASS, 1 FAIL. PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006. FAIL: LO-SMOKE-003.

## Blocked during RIC-STUDIO-013A review

- UI.
- Next.js app.
- IDE integration.
- Git automation.
- `.github`.
- GitHub API integration.
- Database.
- Login.
- Deploy.
- Scripts.
- Additional runtime promotion.
- Official runtime model changes.
- Direct promotion to `ric-orchestrator-runtime:latest`.
- `ollama create`.
- `ollama cp`.
- Model training.
- Model tuning.
- Dependency changes.
- Runtime deletion.
- Commit.
- Push.
- Local DONE.
- Remote DONE.
- Runtime candidate promotion.
