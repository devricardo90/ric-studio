# Operations Backlog

## REVIEW

- RIC-STUDIO-009B - Record Local Orchestrator Errors From CBM-004.
- RIC-STUDIO-014A - Rebuild And Promote Official Runtime From Refined Prompt. BLOCKED / ROLLED BACK.
- RIC-STUDIO-031A - Build And Validate Architect Pragmatic MVP Candidate. Remote DONE - candidate rejected; evidence documented at dfef2c7.
- RIC-STUDIO-032A - Test Two 8B Architect Candidates With Lifecycle-First Prompt. BLOCKED - fewer than two valid local 8B-class base models; prompt body placeholder only; evidence documented; no commit.
- RIC-STUDIO-032B - Test Qwen2.5 7B And Qwen3 8B Architect Candidates. REVIEW - both rejected; evidence documented; no commit.
- RIC-STUDIO-033A - Build Small MVP Architect 7B Candidate. REVIEW - final lean qwen2.5 7B prompt source documented; no runtime creation or promotion; no commit.
- RIC-STUDIO-034A - Validate Small MVP Architect 7B Candidate. REVIEW - candidate rejected; evidence documented; no promotion, commit, or push.
- RIC-STUDIO-035A - Clean Rejected Architect Local Models. REVIEW - rejected local Architect candidates removed; protected models preserved; no promotion, commit, or push.
- RIC-STUDIO-036A - Harden Orchestrator Evidence Source Rules. REVIEW - versioned Orchestrator prompt and validation note updated; no build, promotion, commit, or push.
- RIC-STUDIO-037A - Validate Hardened Orchestrator Evidence Rules Candidate. REVIEW - candidate rejected; 0 PASS, 6 FAIL; no promotion, commit, or push.
- RIC-STUDIO-038A - Define LangChain AI Delivery Auditor Public MVP Scope. REVIEW - documentation-only public MVP scope completed; no code, dependencies, runtime, Modelfile, app, API, commit, or push.
- RIC-STUDIO-039A - Define Evidence Input and Decision Output Contracts. REVIEW - documentation-only contracts completed; no app scaffold, LangChain, dependencies, package files, runtime, Modelfile, GitHub API, UI, automation, commit, or push.
- RIC-STUDIO-053A - Expose Dependency-Free Deterministic Auditor Evaluator. Remote DONE at commit `840375a`.
- RIC-STUDIO-062A - Add Minimal Audit Session Contract Validation. REVIEW - dependency-free validator and validation evidence added; no runtime, evaluator, fixture, package, dependency, CI, app, commit, or push.
- RIC-STUDIO-063A - Document Local Auditor Validation Usage (REVIEW - documentation-only implementation in README.md; explained validator purpose, usage, criteria, and boundaries; no validator code, runtime, evaluator, fixture, package, dependency, CI, runtime, or app change)

## READY

No READY task. RIC-STUDIO-081A is Remote DONE after implementation, validation, commit, and push.

RIC-STUDIO-078A READY registration is Remote DONE at commit `de237471b418789859a3c77d7bcf98a56a4c42ec`; implementation has not started and Jira implementation is paused by owner direction.

## Local DONE

- RIC-STUDIO-071A - Correct Operator Dashboard State Resolution (Local DONE - dashboard no longer reports RIC-STUDIO-070A as active REVIEW after Remote DONE; no Git automation, write action, deploy, external API, dependency, package, lockfile, model/runtime change, UI redesign, commit, or push)

## Next safe step

Handoff/local visibility is the current priority. RIC-STUDIO-081A is Remote DONE, and no new feature task is open. Continue owner visual inspection of the RIC Studio dashboard, then move to the DayBudget local stack only by explicit owner direction. The running dashboard remains at `http://localhost:4310`.

Do not apply or pop `stash@{0}`. It contains implementation candidates (`tools/jira/guarded-write.mjs`, `tools/jira/README.md`, `docs/validation/jira-real-write-078a.md`) plus stale operational docs (`STATUS.md`, `backlog.md`, `docs/ops/backlog.md`, `docs/ops/execution-log.md`, `docs/ops/session-handoff.md`, `docs/ops/status.md`) that must not be restored.

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
- RIC-STUDIO-064A - Validate Local Auditor Workflow Usage In Real Review Scenario. Remote DONE at commit `8d9f893`.
- RIC-STUDIO-065A - Position RIC Studio README For Portfolio Review. Remote DONE at commit `5b532bd`.
- RIC-STUDIO-066A - Validate README Portfolio Positioning. Remote DONE at commit `ec8137b`.
- RIC-STUDIO-067A - Create External Reviewer Evidence Guide. Remote DONE at commit `b9644e0a188fa015137c690a053d635630b48d06`.
- RIC-STUDIO-067R - Reconcile RIC-STUDIO-067A Remote DONE State. Remote DONE at commit `84b198969c872e561efd4fc1a01ec51a1fb7c1fe`.
- RIC-STUDIO-068A - Define And Validate Local Operator Visibility Baseline. Remote DONE at commit `f498ec52679035ce7f7e0bc5a764b6974df4da6c`.
- RIC-STUDIO-069A - Create Local Operator Dashboard MVP. Remote DONE at commit `07e05bcc78a2d722ab9ecd9b2110130fc4dae86a`.
- RIC-STUDIO-069B - Reconcile Operator Dashboard Remote DONE State. Remote DONE at commit `66f7789051df1fa25705482652ced87c3fb3e810`.
- RIC-STUDIO-070A - Integrate Auditor Visibility Into Local Operator Dashboard. Remote DONE at commit `9de5c13b51c661a700d62a3c2cf872e1dbba0419`.
- RIC-STUDIO-072A - Reconcile External Execution Context. Remote DONE at commit `528fde2645108a23e5d9d1fde481b3aedfee1585`.
- RIC-STUDIO-073A - Document Jira + RIC Studio Sprint Execution Flow. Remote DONE at commit `678410cfa7b1d0f6277b11940858e164e1c5e8de`.
- RIC-STUDIO-074A - Define Safe Jira CLI Automation Contract. Remote DONE at commit `85060795c18c80b41fc52ef8dbd7235f1a2d5027`.
- RIC-STUDIO-075A - Implement Safe Jira CLI Dry-Run. Remote DONE at commit `441ea2076b436f5eacca9bfdb84203c88b470699`.
- RIC-STUDIO-076A - Define Guarded Jira Write Integration Contract. Remote DONE per current task context.
- RIC-STUDIO-077A - Implement Guarded Jira Real Write MVP. Remote DONE at commit `5943b99b8479a286c9399ff85d16312755ccda00`.
- RIC-STUDIO-078A - Fix guarded Jira add_comment API payload READY registration. Remote DONE at commit `de237471b418789859a3c77d7bcf98a56a4c42ec`; latest commit `de23747 docs: open RIC-STUDIO-078A jira add-comment path task`; implementation has not started.
- RIC-STUDIO-079A - Reconcile Operator Dashboard external-context smoke checks with current handoff/local visibility state. Remote DONE at commit `494d16d58387d9f51aa90a30796e1224be32259f`; smoke passed; persistent dashboard server started successfully at `http://localhost:4310`; no READY task is active.
- RIC-STUDIO-080A - Add local project registry visibility to operator dashboard. Remote DONE at commit `7d92f2a23eebc2e9b858731c55ca01b80fb00a49`; registry is functional and exposes RIC Studio, DayBudget, and Rick Travel; owner visual review found readability and stale completed-state text issues for follow-up.
- RIC-STUDIO-081A - Improve project registry readability and completed state accuracy. Remote DONE at commit `9f820a02fe71c1a8e5bb0e108f94fc902e5bbd5d`; owner visual review confirmed readable project sections, clean rendered paths/repository values, and visible RIC Studio, DayBudget, and Rick Travel entries.
- RIC-STUDIO-029A - Validate Official Architect And Orchestrator With Real Workflow Scenarios. Remote DONE at commit `6dcdf17`.
- RIC-STUDIO-030A - Document Architect Pragmatic MVP Candidate Validation. Remote DONE at commit `105c220`.
- RIC-STUDIO-040A - Define Local MVP Technical Scaffold. Remote DONE at commit `c436045`.
- RIC-STUDIO-040B - Implement Local Auditor CLI Smoke Prototype. Remote DONE at commit `d489e91`.
- RIC-STUDIO-041A - Add Local Auditor CLI Negative Input Smoke Coverage. Remote DONE at commit `e440b1f`.
- RIC-STUDIO-042A - Define Commit Allow Evidence Contract. Remote DONE at commit `96dc318`.
- RIC-STUDIO-043A - Implement Commit Allowed Decision From Evidence Contract. Remote DONE at commit `5964b4f`.
- RIC-STUDIO-044A - Implement Real Local Evidence Input for Auditor. Remote DONE.
- RIC-STUDIO-045A - Implement Read-Only Local Evidence Pack Generator. Remote DONE at commit `64fcf58`.
- RIC-STUDIO-046A - Define LangGraph Auditor Workflow MVP. Remote DONE at commit `e16c34c`.
- RIC-STUDIO-046B - Define LangGraph Auditor Implementation Contract. Remote DONE at commit `7d6df8c`.
- RIC-STUDIO-047A - Implement Auditor Read-Only Smoke Workflow. Remote DONE at commit `dbbe63d`.
- RIC-STUDIO-048A - Define Package and Dependency Policy for Auditor Runtime. Remote DONE at commit `8a52eda`.
- RIC-STUDIO-049A - Define Auditor Package Setup Scope. Remote DONE at commit `f4c9876`.
- RIC-STUDIO-050A - Create Auditor Package Metadata. Remote DONE at commit `ada132e`.
- RIC-STUDIO-051A - Validate Auditor Package Metadata Scripts. Remote DONE at commit `1f9731e`.
- RIC-STUDIO-052A - Define End-to-End Local Audit Session Contract. Remote DONE at commit `933e1cd`.
- RIC-STUDIO-054A - Implement Dependency-Free Local Audit Session Runner. Remote DONE at commit `4f84b367be6cd883b0b3946fc822fe9e4ec21ba1`.
- RIC-STUDIO-055A - Validate Local Audit Session Runner Against Real Commit Gate Evidence. Remote DONE at commit `27a39ea2e20e21fdc076e30b331a97059f2189ca`.
- RIC-STUDIO-056A - Refine Local Auditor Evidence Contract After Realistic Validation. Remote DONE at commit `e5fd0c7742c283e17dc84908e75e18a1fea90303`.
- RIC-STUDIO-056R - Reconcile RIC-STUDIO-056A Operational State. Remote DONE at commit `eb1644517460c3aba1cdcf300d5acbac82511e43`.
- RIC-STUDIO-057A - Define Protocol Findings Semantics For Local Auditor. Remote DONE at commit `eab6d38dd7e49edcbc7ba28d210471125ece5562`.
- RIC-STUDIO-057R - Reconcile RIC-STUDIO-057A Operational State. Remote DONE at commit `92e5a37fb3ad64f3112524cab819030a57d2c71e`.
- RIC-STUDIO-058A - Implement Protocol Findings In Local Auditor Evaluator. Remote DONE at commit `0a2d1de37c47a35c8c30e4ef5dd5a66ddb8added`.
- RIC-STUDIO-058R - Reconcile RIC-STUDIO-058A Operational State. Remote DONE at commit `f9a3f80301decc5064556d904f854893c94b818f`.
- RIC-STUDIO-059A - Validate Protocol Findings Through Audit Session Runner. Remote DONE at commit `6516cbf`.
- RIC-STUDIO-060A - Surface Protocol Findings In Audit Session Report. Remote DONE at commit `6102050`.
- RIC-STUDIO-061A - Define Audit Session Report Contract. Remote DONE at commit `a103728`.

## Discussion Gate

Future work must be discussed, scoped, and accepted before it can become READY.

## Next safe step

Review RIC-STUDIO-075A dry-run evidence. Do not open follow-up READY tasks, commit, or push without explicit gates.

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

## Future candidates

- RIC-STUDIO-025A - Implement Minimal Runtime Smoke Harness.

Future work must be discussed, scoped, and accepted before it can become READY.
