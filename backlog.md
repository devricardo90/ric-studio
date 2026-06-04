# RIC Studio Backlog

## REVIEW

- RIC-STUDIO-009B - Record Local Orchestrator Errors From CBM-004
- RIC-STUDIO-014A - Rebuild And Promote Official Runtime From Refined Prompt (BLOCKED / ROLLED BACK)
- RIC-STUDIO-031A - Build And Validate Architect Pragmatic MVP Candidate (Remote DONE - candidate rejected; evidence documented at dfef2c7)
- RIC-STUDIO-032A - Test Two 8B Architect Candidates With Lifecycle-First Prompt (BLOCKED - fewer than two valid local 8B-class base models; prompt body placeholder only; evidence documented; no commit)
- RIC-STUDIO-032B - Test Qwen2.5 7B And Qwen3 8B Architect Candidates (REVIEW - both rejected; evidence documented; no commit)
- RIC-STUDIO-033A - Build Small MVP Architect 7B Candidate (REVIEW - final lean qwen2.5 7B prompt source documented; no runtime creation or promotion; no commit)
- RIC-STUDIO-034A - Validate Small MVP Architect 7B Candidate (REVIEW - candidate rejected; evidence documented; no promotion, commit, or push)
- RIC-STUDIO-035A - Clean Rejected Architect Local Models (REVIEW - rejected local Architect candidates removed; protected models preserved; no promotion, commit, or push)
- RIC-STUDIO-036A - Harden Orchestrator Evidence Source Rules (REVIEW - versioned Orchestrator prompt and validation note updated; no build, promotion, commit, or push)
- RIC-STUDIO-037A - Validate Hardened Orchestrator Evidence Rules Candidate (REVIEW - candidate rejected; 0 PASS, 6 FAIL; no promotion, commit, or push)
- RIC-STUDIO-038A - Define LangChain AI Delivery Auditor Public MVP Scope (REVIEW - documentation-only public MVP scope completed; no code, dependencies, runtime, Modelfile, app, API, commit, or push)
- RIC-STUDIO-039A - Define Evidence Input and Decision Output Contracts (REVIEW - documentation-only contracts completed; no app scaffold, LangChain, dependencies, package files, runtime, Modelfile, GitHub API, UI, automation, commit, or push)
- RIC-STUDIO-053A - Expose Dependency-Free Deterministic Auditor Evaluator (REVIEW - evaluator exported and validated; CLI and smoke behavior preserved; no dependencies, lockfiles, node_modules, commit, or push)

## REJECTED / REVIEW CLOSED

- RIC-STUDIO-010A - Improve Local Orchestrator Prompt From Logged Error Patterns
- RIC-STUDIO-011A - Benchmark Larger Base Model For Local Orchestrator
- RIC-STUDIO-011B - Benchmark Qwen3 14B With Thinking Suppressed And Short Operational Template

## Local DONE

No task is Local DONE.

## Remote DONE

- RIC-STUDIO-001 - Define Local MVP Scope and Agent Roles
- RIC-STUDIO-002 - Validate Local Orchestrator Workflow With Controlled Smoke Tests
- RIC-STUDIO-003A - Execute Local Orchestrator Smoke Tests Batch 1
- RIC-STUDIO-003B - Diagnose Commit-Allow Overblocking
- RIC-STUDIO-004B - Establish Clean Versioned Runtime Source
- RIC-STUDIO-005A - Build Candidate Runtime From Versioned Modelfile
- RIC-STUDIO-006A - Run Candidate Runtime Behavioral Smoke Tests
- RIC-STUDIO-007A - Validate Candidate Runtime With Real Workflow Simulation
- RIC-STUDIO-008A - Standardize Runtime Gate Vocabulary Before Promotion
- RIC-STUDIO-009A - Define Local Orchestrator Error Log
- RIC-STUDIO-011C - Fix Qwen3 Orchestrator State Routing And Next-Task Synthesis
- RIC-STUDIO-012A - Promote Approved Qwen3 Orchestrator Candidate To Official Runtime
- RIC-STUDIO-013A - Refine Official Runtime Prompt For Evidence Claims And Role Boundaries
- RIC-STUDIO-015A - Align Official Runtime Modelfile Base With Approved Qwen3 14B Runtime
- RIC-STUDIO-016A - Rebuild And Validate Runtime Candidate From Qwen3 Modelfile
- RIC-STUDIO-017A - Promote Validated Qwen3 Refined Runtime Candidate To Official Runtime
- RIC-STUDIO-018A - Record Agent Success Patterns From Clinic Booking Robust Tasks
- RIC-STUDIO-019A - Refine Runtime Behavior and Response Format
- RIC-STUDIO-021A - Promote RIC-STUDIO-019A Candidate To Official Runtime
- RIC-STUDIO-022A - Define Minimal Validation Harness Requirements For Runtime Smoke Tests
- RIC-STUDIO-024A - Create Qwen 7B Orchestrator Candidate Runtime
- RIC-STUDIO-029A - Validate Official Architect And Orchestrator With Real Workflow Scenarios (Remote DONE at commit `6dcdf17`)
- RIC-STUDIO-030A - Document Architect Pragmatic MVP Candidate Validation (Remote DONE at commit `105c220`)
- RIC-STUDIO-040A - Define Local MVP Technical Scaffold (Remote DONE at commit `c436045`)
- RIC-STUDIO-040B - Implement Local Auditor CLI Smoke Prototype (Remote DONE at commit `d489e91`)
- RIC-STUDIO-041A - Add Local Auditor CLI Negative Input Smoke Coverage (Remote DONE at commit `e440b1f`)
- RIC-STUDIO-042A - Define Commit Allow Evidence Contract (Remote DONE at commit `96dc318`)
- RIC-STUDIO-043A - Implement Commit Allowed Decision From Evidence Contract (Remote DONE at commit `5964b4f`)
- RIC-STUDIO-044A - Implement Real Local Evidence Input for Auditor (Remote DONE)
- RIC-STUDIO-045A - Implement Read-Only Local Evidence Pack Generator (Remote DONE at commit `64fcf58`)
- RIC-STUDIO-046A - Define LangGraph Auditor Workflow MVP (Remote DONE at commit `e16c34c`)
- RIC-STUDIO-046B - Define LangGraph Auditor Implementation Contract (Remote DONE at commit `7d6df8c`)
- RIC-STUDIO-047A - Implement Auditor Read-Only Smoke Workflow (Remote DONE at commit `dbbe63d`)
- RIC-STUDIO-048A - Define Package and Dependency Policy for Auditor Runtime (Remote DONE at commit `8a52eda`)
- RIC-STUDIO-049A - Define Auditor Package Setup Scope (Remote DONE at commit `f4c9876`)
- RIC-STUDIO-050A - Create Auditor Package Metadata (Remote DONE at commit `ada132e`)
- RIC-STUDIO-051A - Validate Auditor Package Metadata Scripts (Remote DONE at commit `1f9731e`)
- RIC-STUDIO-052A - Define End-to-End Local Audit Session Contract (Remote DONE at commit `933e1cd`)

## REVIEW

- RIC-STUDIO-023A - Validate Official Runtime Behavior And Latency Baseline (0 PASS, 5 FAIL â€” timeout, extended thinking not suppressed)
- RIC-STUDIO-025A - Promote Qwen 7B Candidate To Official Orchestrator Runtime (Remote DONE)
- RIC-STUDIO-026A - Create Qwen 7B RIC Architect Candidate Runtime (Remote DONE)
- RIC-STUDIO-027A - Validate Architect And Orchestrator Two-Model Workflow (Remote DONE â€” 1 PASS, 1 FAIL)
- RIC-STUDIO-028A - Fix Architect Domain Context And Retest Candidate (Remote DONE)
- RIC-STUDIO-028B - Promote Architect Contextfix Candidate To Official Runtime (Remote DONE per current task context; 4 PASS, 1 FAIL smoke tests; `ric-architect-qwen-v2:latest` promoted to `b2ba1b3efeae`; backup `6a94ce329010`; sem commit)
- RIC-STUDIO-029A - Validate Official Architect And Orchestrator With Real Workflow Scenarios (Remote DONE at commit `6dcdf17`; evidence in `docs/validation/two-model-production-workflow-029a.md`)
- RIC-STUDIO-031A - Build And Validate Architect Pragmatic MVP Candidate (REVIEW - evidence in `docs/validation/architect-candidate-031a-pragmatic-mvp.md`; candidate rejected; sem commit)

## READY

No task is READY.

## Next safe step

Review RIC-STUDIO-053A evaluator implementation and validation evidence. Commit only after explicit human approval; push remains blocked.

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
- PromoÃ§Ã£o automÃ¡tica do runtime oficial.
- RemoÃ§Ã£o de backups.
- AlteraÃ§Ã£o de projetos externos (Clinic Booking Mini).
- Push sem Push Gate explÃ­cito.
- Harness automatizada (â†’ future task, not RIC-STUDIO-024A).
- Commit de RIC-STUDIO-018A sem aprovaÃ§Ã£o explÃ­cita de Trigger.

## Future candidates

- RIC-STUDIO-025A - Implement Minimal Runtime Smoke Harness.

Future tasks must pass the Discussion Gate before entering READY.
