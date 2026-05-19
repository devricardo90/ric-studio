# Operations Backlog

## REVIEW

- RIC-STUDIO-009B - Record Local Orchestrator Errors From CBM-004.
- RIC-STUDIO-014A - Rebuild And Promote Official Runtime From Refined Prompt. BLOCKED / ROLLED BACK.

## REJECTED / REVIEW CLOSED

- RIC-STUDIO-010A - Improve Local Orchestrator Prompt From Logged Error Patterns.
- RIC-STUDIO-011A - Benchmark Larger Base Model For Local Orchestrator.
- RIC-STUDIO-011B - Benchmark Qwen3 14B With Thinking Suppressed And Short Operational Template.

## REVIEW

- RIC-STUDIO-023A - Validate Official Runtime Behavior And Latency Baseline. 0 PASS, 5 FAIL. Extended thinking not suppressible in current Ollama 0.24.0 / CPU-hybrid configuration.
- RIC-STUDIO-025A - Promote Qwen 7B Candidate To Official Orchestrator Runtime. Remote DONE.
- RIC-STUDIO-026A - Create Qwen 7B RIC Architect Candidate Runtime. Remote DONE.
- RIC-STUDIO-027A - Validate Architect And Orchestrator Two-Model Workflow. Remote DONE — 1 PASS, 1 FAIL.
- RIC-STUDIO-028A - Fix Architect Domain Context And Retest Candidate. Remote DONE.
- RIC-STUDIO-028B - Promote Architect Contextfix Candidate To Official Runtime. REVIEW — `ric-architect-qwen-v2:latest` promovido para ID `b2ba1b3efeae`. Backup `6a94ce329010`. Smoke tests: 4 PASS, 1 FAIL (Teste 5: React vs Django Admin). Sem commit.

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
- RIC-STUDIO-013A - Refine Official Runtime Prompt For Evidence Claims And Role Boundaries.
- RIC-STUDIO-015A - Align Official Runtime Modelfile Base With Approved Qwen3 14B Runtime.
- RIC-STUDIO-016A - Rebuild And Validate Runtime Candidate From Qwen3 Modelfile.
- RIC-STUDIO-017A - Promote Validated Qwen3 Refined Runtime Candidate To Official Runtime.
- RIC-STUDIO-018A - Record Agent Success Patterns From Clinic Booking Robust Tasks.
- RIC-STUDIO-019A - Refine Runtime Behavior and Response Format.
- RIC-STUDIO-021A - Promote RIC-STUDIO-019A Candidate To Official Runtime.
- RIC-STUDIO-022A - Define Minimal Validation Harness Requirements For Runtime Smoke Tests.
- RIC-STUDIO-024A - Create Qwen 7B Orchestrator Candidate Runtime.

## Discussion Gate

Future work must be discussed, scoped, and accepted before it can become READY.

## Next safe step

Review RIC-STUDIO-028B evidence in `docs/validation/runtime-promotion-028b.md`. Evaluate smoke test 5 FAIL before authorizing commit. Do not commit or push without explicit authorization.

RIC-STUDIO-008A is Remote DONE and synchronized with `origin/main` at commit `54c7f78`.

RIC-STUDIO-007A is Remote DONE and synchronized with `origin/main` at commit `f4a16cc`.

RIC-STUDIO-006A is Remote DONE and synchronized with `origin/main` at commit `8e3796a`.

RIC-STUDIO-005A is Remote DONE and synchronized with `origin/main` at commit `6610991`.

During RIC-STUDIO-004B, the clean versioned runtime source was created. No candidate model was created, no official runtime was promoted, and no behavioral model tests were executed in that task.

Diagnosis result: 2 PASS, 3 FAIL. Future system prompt or Modelfile correction is recommended but was not executed in this task.

Batch result: 3 PASS, 1 FAIL. PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006. FAIL: LO-SMOKE-003.

## Blocked

- UI, Next.js app, IDE integration, Git automation, `.github`, GitHub API integration, database, login, deploy.
- `ollama cp` para `ric-orchestrator-runtime:latest`.
- Promoção automática do runtime oficial.
- Remoção de backups.
- Alteração de projetos externos (Clinic Booking Mini).
- Push sem Push Gate explícito.
- Harness automatizada (→ future task, not RIC-STUDIO-024A).

## Future candidates

- RIC-STUDIO-025A - Implement Minimal Runtime Smoke Harness.

Future work must be discussed, scoped, and accepted before it can become READY.
