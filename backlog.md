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
- RIC-STUDIO-062A - Add Minimal Audit Session Contract Validation (REVIEW - dependency-free validator and validation evidence added; no runtime, evaluator, fixture, package, dependency, CI, app, commit, or push)
- RIC-STUDIO-063A - Document Local Auditor Validation Usage (REVIEW - documentation-only implementation in README.md; explained validator purpose, usage, criteria, and boundaries; no validator code, runtime, evaluator, fixture, package, dependency, CI, runtime, or app change)

## READY

- RIC-STUDIO-079A - Reconcile Operator Dashboard external-context smoke checks with current handoff/local visibility state. READY registration only; implementation has not started.

READY registration facts for RIC-STUDIO-079A:

- RIC Studio Operator Dashboard smoke failed because smoke expectations are stale, not because the server is broken.
- `/` returned HTTP 200.
- `/api/state` returned HTTP 200.
- Stale smoke checks expect `day-budget`, exact Jira cycle `DAY-3 / WEB-023A`, and Jira status `IN PROGRESS`.
- Current docs/context already moved beyond that old state.
- No persistent dashboard server was started.
- No DayBudget server or Docker was started.
- No Jira call, Jira API call, or Jira CLI call was made.
- `stash@{0}` remains intact and unrelated to this task.
- Current owner goal is local visibility: run RIC Studio dashboard first, then DayBudget local stack.
- Allowed READY registration files only: `STATUS.md`, `backlog.md`, `docs/ops/status.md`, `docs/ops/backlog.md`, `docs/ops/execution-log.md`, and `docs/ops/session-handoff.md`.
- Forbidden during READY registration: `tools/operator-ui/server.mjs`, `docs/ops/external-execution-context.md`, `tools/jira/*`, `docs/validation/*`, package files, lockfiles, persistent dashboard server, DayBudget, Docker, Jira, stash apply/pop/restore, commit, and push.

RIC-STUDIO-078A READY registration is Remote DONE at commit `de237471b418789859a3c77d7bcf98a56a4c42ec`; implementation has not started and Jira implementation is paused by owner direction.

## Local DONE

- RIC-STUDIO-071A - Correct Operator Dashboard State Resolution (Local DONE - dashboard no longer reports RIC-STUDIO-070A as active REVIEW after Remote DONE; no Git automation, write action, deploy, external API, dependency, package, lockfile, model/runtime change, UI redesign, commit, or push)

## Next safe step

Handoff/local visibility is the current priority. Next practical goal after RIC-STUDIO-079A implementation and review: run/open RIC Studio locally and inspect the Operator Dashboard, then run the DayBudget local stack. Known historical command: `node tools/operator-ui/server.mjs`; dashboard: `http://localhost:4310`; smoke: `node tools/operator-ui/server.mjs smoke`.

Do not apply or pop `stash@{0}`. It contains implementation candidates (`tools/jira/guarded-write.mjs`, `tools/jira/README.md`, `docs/validation/jira-real-write-078a.md`) plus stale operational docs (`STATUS.md`, `backlog.md`, `docs/ops/backlog.md`, `docs/ops/execution-log.md`, `docs/ops/session-handoff.md`, `docs/ops/status.md`) that must not be restored.

RIC-STUDIO-072A is Remote DONE at commit `528fde2645108a23e5d9d1fde481b3aedfee1585`.

RIC-STUDIO-073A is Remote DONE at commit `678410cfa7b1d0f6277b11940858e164e1c5e8de`.

RIC-STUDIO-074A is Remote DONE at commit `85060795c18c80b41fc52ef8dbd7235f1a2d5027`.

RIC-STUDIO-075A is Remote DONE at commit `441ea2076b436f5eacca9bfdb84203c88b470699`.

RIC-STUDIO-076A is Remote DONE per current task context.

RIC-STUDIO-077A is Remote DONE at commit `5943b99b8479a286c9399ff85d16312755ccda00`.

RIC-STUDIO-078A READY registration is Remote DONE at commit `de237471b418789859a3c77d7bcf98a56a4c42ec`. Latest commit: `de23747 docs: open RIC-STUDIO-078A jira add-comment path task`. Implementation has not started.

RIC-STUDIO-008A is Remote DONE and synchronized with `origin/main` at commit `54c7f78`.

RIC-STUDIO-007A is Remote DONE and synchronized with `origin/main` at commit `f4a16cc`.

RIC-STUDIO-006A is Remote DONE and synchronized with `origin/main` at commit `8e3796a`.

RIC-STUDIO-005A is Remote DONE and synchronized with `origin/main` at commit `6610991`.

RIC-STUDIO-064A is Remote DONE at commit `8d9f893e5fe360abd02a06c1347309f3cb3d0170`.

RIC-STUDIO-065A is Remote DONE at commit `5b532bd988d7524a869d9f395678d9f6549b5824`.

RIC-STUDIO-066A is Remote DONE at commit `ec8137b30ad3079c9940cbb927e8626d2110001c`.

RIC-STUDIO-067A is Remote DONE at commit `b9644e0a188fa015137c690a053d635630b48d06`.

RIC-STUDIO-067R is Remote DONE at commit `84b198969c872e561efd4fc1a01ec51a1fb7c1fe`.

RIC-STUDIO-068A is Remote DONE at commit `f498ec52679035ce7f7e0bc5a764b6974df4da6c`.

RIC-STUDIO-069A is Remote DONE at commit `07e05bcc78a2d722ab9ecd9b2110130fc4dae86a`.

RIC-STUDIO-069B is Remote DONE at commit `66f7789051df1fa25705482652ced87c3fb3e810`.

RIC-STUDIO-070A is Remote DONE at commit `9de5c13b51c661a700d62a3c2cf872e1dbba0419`.

RIC-STUDIO-072A is Remote DONE at commit `528fde2645108a23e5d9d1fde481b3aedfee1585`.

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
