# Session Handoff

## Current handoff state

RIC-STUDIO-029A is in REVIEW as `Validate Official Architect And Orchestrator With Real Workflow Scenarios`.

Manual validation was executed against official runtimes:

- Architect: `ric-architect-qwen-v2:latest`.
- Orchestrator: `ric-orchestrator-runtime:latest`.

Result across model calls: 2 PASS, 3 CAVEAT, 1 FAIL.

- PASS: Orchestrator blocked incomplete commit evidence in both commit-gate scenarios.
- CAVEAT: Architect was safe but generic/conservative on DayBudget and BioLoop, and proposed possible schema work for Clinic Booking Mini without first verifying existing lifecycle fields.
- FAIL: Architect repeated the known stack trade-off weakness by recommending Django Admin plus separate React for a simple administrative MVP.

Evidence: `docs/validation/two-model-production-workflow-029a.md`.

No Modelfile change, candidate creation, runtime promotion, `ollama cp`, harness, external app change, commit, or push occurred.

RIC-STUDIO-028B is Remote DONE per current task context as `Promote Architect Contextfix Candidate To Official Runtime`.

`ric-architect-qwen-v2:latest` promoted to ID `b2ba1b3efeae` (from `ric-architect-candidate:028a-qwen25-coder-7b-contextfix`). Backup `ric-architect-qwen-v2:backup-before-028b` preserves ID `6a94ce329010`.

Smoke test result: 4 PASS, 1 FAIL.
- PASS: harness ambíguo, ideia vaga, task harness interno documental, commit bloqueado.
- FAIL: Smoke test 5 — model recommended React over Django Admin for simple admin app (logical contradiction: cited "MVP first" but chose more complex stack).

Evidence: `docs/validation/runtime-promotion-028b.md`.

The 028B FAIL is retained as a known caveat and did not block RIC-STUDIO-029A validation.

No commit. No push.

RIC-STUDIO-028A is Remote DONE as `Fix Architect Domain Context And Retest Candidate`.

New candidate: `ric-architect-candidate:028a-qwen25-coder-7b-contextfix` (ID `b2ba1b3efeae`, size 4.7 GB). Modelfile: `runtime/ric-architect/Modelfile.028a-qwen25-coder-7b-contextfix`.

Key fix: RIC Studio domain glossary added. "harness" = internal validation runner, NOT Harness.io. harness+Git+UI+automation = scope too broad, recommend Discussion Gate.

Test result: 4 PASS, 0 FAIL. 027A Harness.io regression corrected.

Evidence: `docs/validation/architect-candidate-028a-contextfix.md`.

No model promoted, copied, or removed. No commit. No push. Awaiting Trigger review.

RIC-STUDIO-027A is Remote DONE as `Validate Architect And Orchestrator Two-Model Workflow`.

Architect test (candidate `ric-architect-candidate:026a-qwen25-coder-7b`): FAIL. Model misinterpreted "harness" as Harness.io and recommended building a UI for external CI/CD pipelines. Root cause: no domain context in prompt. Not a systemic logic failure.

Orchestrator test (`ric-orchestrator-runtime:latest`): PASS. Returned `COMMIT BLOQUEADO` correctly for incomplete evidence (missing git status --short, missing git diff --check, unauditable new file). No commit authorized.

Combined: 1 PASS, 1 FAIL.

Evidence: `docs/validation/two-model-workflow-027a.md`.

No model altered, promoted, copied, or removed. No commit. No push. Awaiting Trigger review.

RIC-STUDIO-026A is Remote DONE as `Create Qwen 7B RIC Architect Candidate Runtime`.

Candidate `ric-architect-candidate:026a-qwen25-coder-7b` was created from `runtime/ric-architect/Modelfile.026a-qwen25-coder-7b`, using base `qwen2.5-coder:7b`. Candidate ID is `c8cfc69738af`, size 4.7 GB.

Test result: 4 PASS, 0 FAIL across ideia vaga (MVP recorte), task bem definida (escopo/validação/sem commit), pedido errado (bloqueou commit, redirecionou ao Orchestrator), e stack/arquitetura (trade-off Django Admin vs React).

Caveats: Teste 2 leve escopo drift; Teste 3 resposta sem formato de 7 seções.

Evidence: `docs/validation/architect-candidate-026a-qwen25-coder-7b.md`.

`ric-architect-qwen-v2:latest` não foi alterado. `ric-orchestrator-runtime:latest` não foi alterado.

Awaiting Trigger review before commit and push.

RIC-STUDIO-019A is Remote DONE and synchronized with `origin/main` at commit `6d50192`.

RIC-STUDIO-021A is Remote DONE and synchronized with `origin/main` at commit `6adf295`.

RIC-STUDIO-022A is Remote DONE and synchronized with `origin/main` at commit `5cad905`.

RIC-STUDIO-023A is in REVIEW as `Validate Official Runtime Behavior And Latency Baseline`.

Result: 0 PASS, 5 FAIL. All 5 mandatory tests against `ric-orchestrator-runtime:latest` (Qwen3 14B) failed by timeout/lentidão. Root cause: thinking mode active, Ollama 0.24.0 buffers thinking tokens, CPU inference too slow (~1–2 tok/s, ~6.6 GB on RAM). `/no_think` via CLI and `think: false` via REST API did not suppress thinking. No response token produced in any test within 5-minute limit.

Evidence: `docs/validation/runtime-behavior-latency-023a.md`.

RIC-STUDIO-024A is in REVIEW as `Create Qwen 7B Orchestrator Candidate Runtime`.

Candidate `ric-orchestrator-candidate:024a-qwen25-coder-7b` was created from separate source `runtime/ric-orchestrator/Modelfile.024a-qwen25-coder-7b`, using base `qwen2.5-coder:7b`. Final candidate ID is `9e5cdcf8a6ae`, size 4.7 GB.

Final gate matrix result: 5 PASS, 0 FAIL across commit blocked, commit released, push released, push blocked, and Remote DONE confirmed. Decision: CANDIDATE APROVADO with latency caveat. Cold-start latency was about 167s; warm API responses were about 21-29s.

Evidence: `docs/validation/runtime-candidate-024a-qwen25-coder-7b.md`.

RIC-STUDIO-024A is Remote DONE per current task context.

RIC-STUDIO-025A is in REVIEW as `Promote Qwen 7B Candidate To Official Orchestrator Runtime`.

Backup `ric-orchestrator-runtime:backup-before-025a` was created and preserves previous official runtime ID `2711dd3bc829`. Candidate `ric-orchestrator-candidate:024a-qwen25-coder-7b` was promoted to `ric-orchestrator-runtime:latest`.

Post-promotion `ollama list` confirms `ric-orchestrator-runtime:latest` now points to ID `9e5cdcf8a6ae`, matching the promoted candidate. Smoke test passed with `Decisão: COMMIT BLOQUEADO` and no commit authorization.

Evidence: `docs/validation/runtime-promotion-025a.md`.

Awaiting Trigger review before commit and push.

## What changed

RIC-STUDIO-001 is Remote DONE and synchronized with `origin/main` at commit `aa8a6d3`.

RIC-STUDIO-002 is Remote DONE and synchronized with `origin/main` at commit `b81ac6b`.

RIC-STUDIO-003A is Remote DONE and synchronized with `origin/main` at commit `07e11f1`.

RIC-STUDIO-003B is Remote DONE and synchronized with `origin/main` at commit `e67a0e5`.

RIC-STUDIO-004B is Remote DONE and synchronized with `origin/main` at commit `bfa6519`.

RIC-STUDIO-003A executed manual local model smoke tests for:

- LO-SMOKE-001 commit block for missing per-file diff evidence.
- LO-SMOKE-003 commit allow for consistent scope, raw diff, and state.
- LO-SMOKE-005 push allow for clean tree and valid remote tracking.
- LO-SMOKE-006 Remote DONE block when HEAD and origin/main differ.

Batch result: 3 PASS, 1 FAIL. PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006. FAIL: LO-SMOKE-003.

Conclusion: `ric-orchestrator-runtime:latest` correctly blocked missing-evidence commit, allowed controlled push, and blocked Remote DONE when HEAD != origin/main, but failed the positive commit-allow scenario by overblocking.

RIC-STUDIO-003B diagnosed the overblocking behavior with five commit-gate prompts. Diagnosis result: 2 PASS, 3 FAIL. The model overblocked COMMIT-ALLOW-001, COMMIT-ALLOW-002, and COMMIT-ALLOW-003; it passed only the rule-explicit positive case and the negative control.

A future system prompt or Modelfile correction is recommended but was not executed in this task.

RIC-STUDIO-004B created a clean versioned runtime source at `runtime/ric-orchestrator/Modelfile`, plus runtime source strategy and baseline validation documentation. During RIC-STUDIO-004B, no candidate model was created, no official runtime tag was promoted, and no behavioral model tests were run.

RIC-STUDIO-005A created and validated local Ollama candidate runtime `ric-orchestrator-candidate:005a`. Official runtime was not promoted or overwritten. RIC-STUDIO-005A is Remote DONE and synchronized with `origin/main` at commit `6610991`.

RIC-STUDIO-006A ran controlled behavioral smoke tests against `ric-orchestrator-candidate:005a`.

RIC-STUDIO-006A result: 6 PASS, 0 FAIL. The candidate fixed the previous positive commit-allow overblocking in the tested scenarios.

RIC-STUDIO-006A is Remote DONE and synchronized with `origin/main` at commit `8e3796a`.

RIC-STUDIO-007A ran a final realistic workflow simulation against `ric-orchestrator-candidate:005a`.

RIC-STUDIO-007A result: 7 PASS, 0 FAIL. The candidate handled REVIEW state, commit block, commit allow, Local DONE block, push allow, Remote DONE block, and Remote DONE confirmation as expected.

RIC-STUDIO-007A is Remote DONE and synchronized with `origin/main` at commit `f4a16cc`.

RIC-STUDIO-008A standardized the versioned runtime vocabulary in `runtime/ric-orchestrator/Modelfile`, built `ric-orchestrator-candidate:008a`, and ran six focused vocabulary smoke tests.

RIC-STUDIO-008A result: 6 PASS, 0 FAIL. Exact labels passed for Remote DONE confirmed, Remote DONE blocked, commit allowed, push allowed, Local DONE confirmed, and push blocked as `PUSH AINDA BLOQUEADO`. The commit test used scoped `git add STATUS.md backlog.md docs/ops/status.md` and did not suggest `git add .`.

RIC-STUDIO-008A is Remote DONE and synchronized with `origin/main` at commit `54c7f78`.

RIC-STUDIO-009A promoted `ric-orchestrator-candidate:008a` locally to `ric-orchestrator-runtime:latest`.

RIC-STUDIO-009A result: 3 PASS, 0 FAIL. Official runtime passed Remote DONE positive, push negative, and commit allowed with scoped `git add STATUS.md backlog.md docs/ops/status.md`.

The Modelfile was not edited, candidates `005a` and `008a` were not deleted, no scripts/UI/app/dependencies were added, no Git automation was created, and no commit or push occurred.

RIC-STUDIO-009A is Remote DONE.

RIC-STUDIO-009B recorded three real observed local orchestrator errors from Clinic Booking Mini CBM-004:

- 1 `scope-confusion` occurrence.
- 2 `state-contradiction` occurrences.

RIC-STUDIO-010A was opened by explicit current request to improve the local orchestrator prompt from the logged error patterns.

RIC-STUDIO-010A updated `runtime/ric-orchestrator/Modelfile`, created candidate `ric-orchestrator-candidate:010a`, and ran five focused tests.

RIC-STUDIO-010A result: 3 PASS, 1 PASS WITH CAVEAT, 1 FAIL. The candidate is rejected for promotion because test 3 did not fully synthesize concrete files and validation requirements for a proposed next task.

RIC-STUDIO-010A continuation created `ric-orchestrator-candidate:010b` from the updated Modelfile and ran the five required tests.

RIC-STUDIO-010B result: 3 PASS, 2 FAIL. Test 3 passed, but test 1 failed by treating a clean Git check as a proposed task and test 5 failed by listing `PUSH AINDA BLOQUEADO` after authorizing push. The candidate is rejected for promotion.

RIC-STUDIO-010A was closed as REJECTED / REVIEW CLOSED. The rejected `runtime/ric-orchestrator/Modelfile` changes were reverted to the previous stable repository state.

Candidates `ric-orchestrator-candidate:010a` and `ric-orchestrator-candidate:010b` remain evidence only. Neither candidate was promoted to `ric-orchestrator-runtime:latest`.

RIC-STUDIO-011A benchmarked `qwen3:14b` as a larger base model using separate candidate `ric-orchestrator-candidate:011a-qwen3-14b`.

The candidate was created from a temporary Modelfile outside the repository, copied from the official Modelfile with only the base line changed to `FROM qwen3:14b`.

The official `runtime/ric-orchestrator/Modelfile` was not altered.

RIC-STUDIO-011A result: 0 PASS, 5 FAIL. All required tests exposed internal `Thinking...` output and timed out before complete operational responses. Candidate `ric-orchestrator-candidate:011a-qwen3-14b` is rejected for promotion.

No promotion to `ric-orchestrator-runtime:latest`, commit, or push occurred.

RIC-STUDIO-011B tested the same `qwen3:14b` base with a short operational SYSTEM prompt, explicit no-thinking instructions, and `/no_think`.

The candidate was created from a temporary Modelfile outside the repository at `$env:TEMP\ric-orchestrator-011b-qwen3-14b.Modelfile`.

The official `runtime/ric-orchestrator/Modelfile` was not altered.

`--think=false` suppressed visible `Thinking...` and `<think>` output in the five required scenario tests, but terminal control/spinner noise remained in the CLI output.

`--hidethinking` did not work for this use: a short technical prompt timed out with control/spinner output and no final answer.

RIC-STUDIO-011B result: 0 full PASS, 3 content-pass with technical caveat, 2 FAIL. The candidate is rejected for promotion because it failed the previous Remote DONE isolation test and the concrete next-task synthesis test, and the CLI output remained technically noisy.

No promotion to `ric-orchestrator-runtime:latest`, model deletion, commit, or push occurred.

RIC-STUDIO-011A/011B is now closed as REJECTED / REVIEW CLOSED.

The official `runtime/ric-orchestrator/Modelfile` remains intact.

The validation reports for 011A and 011B remain evidence only.

Recommended next task: RIC-STUDIO-011C - Fix Qwen3 Orchestrator State Routing And Next-Task Synthesis.

RIC-STUDIO-011C created `ric-orchestrator-candidate:011c-qwen3-14b` from a temporary Modelfile outside the repository.

The temporary Modelfile used `FROM qwen3:14b`, explicit no-thinking instructions, state-routing rules, next-task synthesis rules, and commit/push guardrails.

The official `runtime/ric-orchestrator/Modelfile` was not altered.

RIC-STUDIO-011C initial result: 4 PASS, 1 FAIL. The candidate fixed Test 3 next-task synthesis and did not expose `Thinking...` or `<think>`, but Test 2 still failed because it used `REMOTE DONE CONFIRMADO` instead of `DISCUSSION GATE RECOMENDADO` or a READY recommendation for a previous Remote DONE scope.

RIC-STUDIO-011C continuation created `ric-orchestrator-candidate:011c-fix1-qwen3-14b` from a temporary Modelfile outside the repository.

Fix1 added the explicit rule that `REMOTE DONE CONFIRMADO` is only for validating a newly executed push or remote state, not for next-step requests after a previous Remote DONE task.

Fix1 isolated Test 2 result: PASS.

Fix1 full matrix result: 5 PASS, 0 FAIL. Candidate `ric-orchestrator-candidate:011c-fix1-qwen3-14b` is approved by the benchmark, but not promoted.

No promotion to `ric-orchestrator-runtime:latest`, model deletion, commit, or push occurred.

RIC-STUDIO-011C benchmark evidence is closed in REVIEW as approved.

The approved candidate remains a technical candidate only. It must not be treated as the official runtime until a separate controlled promotion task is approved and executed.

Recommended next task after commit and push: RIC-STUDIO-012A - Promote Approved Qwen3 Orchestrator Candidate To Official Runtime.

RIC-STUDIO-012A promoted approved candidate `ric-orchestrator-candidate:011c-fix1-qwen3-14b` to official runtime `ric-orchestrator-runtime:latest`.

Backup was created first: `ric-orchestrator-runtime:backup-before-012a`.

Promotion used `ollama cp`, not rebuild.

Post-promotion `ollama list` shows `ric-orchestrator-runtime:latest` and `ric-orchestrator-candidate:011c-fix1-qwen3-14b` share ID `585f4d5c2075`.

Backup `ric-orchestrator-runtime:backup-before-012a` preserves previous runtime ID `be391f29a172`.

Smoke test returned `RIC-RUNTIME-012A-OK`.

The official `runtime/ric-orchestrator/Modelfile` was not altered.

No commit or push occurred.

RIC-STUDIO-012A is Remote DONE and synchronized with `origin/main` at commit `75005f56f1912aa8b5a178fa0be3184008ad106d`.

RIC-STUDIO-013A refined the versioned official runtime prompt in `runtime/ric-orchestrator/Modelfile` after two real post-promotion Discussion Gate observations in Clinic Booking Mini:

- CBM-009 - Add appointment conflict guard.
- CBM-010 - Add appointment request time guard.

The runtime behavior observed in both cases was functionally safe enough to recommend READY, keep commit and push blocked, and request minimum evidence.

The defects corrected in RIC-STUDIO-013A are:

- unsupported claims equivalent to "no evidence of pending dependencies" without current raw evidence proving absence of dependencies or blockers;
- wording equivalent to "start implementation with the promoted official runtime", which blurred auditor/orchestrator duties with executor/Codex implementation duties.

`runtime/ric-orchestrator/Modelfile` now requires the runtime to avoid absence-of-pending-work claims without raw evidence and to hand implementation to executor agent/Codex after READY.

Validation evidence is recorded in `docs/validation/runtime-prompt-refinement-013a.md`.

No `ollama create`, `ollama cp`, rebuild, promotion, model deletion, backup deletion, commit, or push occurred during RIC-STUDIO-013A.

RIC-STUDIO-013A is Remote DONE and synchronized with `origin/main` at commit `58ad31110d14c370708a5d2ac001c40d2afaae74`.

RIC-STUDIO-014A is BLOCKED / ROLLED BACK.

Pre-run evidence confirmed the repository was clean and synchronized with `origin/main` at `58ad31110d14c370708a5d2ac001c40d2afaae74`, `runtime/ric-orchestrator/Modelfile` existed, `ric-orchestrator-runtime:latest` existed, and `ric-orchestrator-runtime:backup-before-014a` did not exist.

Candidate `ric-orchestrator-candidate:014a-refined-prompt` was created from `runtime/ric-orchestrator/Modelfile`.

Audit confirmed `runtime/ric-orchestrator/Modelfile` begins with `FROM qwen2.5-coder:7b`, so candidate `ric-orchestrator-candidate:014a-refined-prompt` was built from the smaller 7B base.

Candidate `ric-orchestrator-candidate:014a-refined-prompt` has ID `1e10ad354fb3`, size 4.7 GB.

The approved runtime before 014A was Qwen3 14B ID `585f4d5c2075`, size 9.3 GB.

Backup `ric-orchestrator-runtime:backup-before-014a` was created before promotion and preserves previous runtime ID `585f4d5c2075`.

Candidate `ric-orchestrator-candidate:014a-refined-prompt` was briefly promoted to `ric-orchestrator-runtime:latest` using `ollama cp`, causing a base regression from Qwen3 14B to the 7B candidate.

Rollback was executed with `ollama cp ric-orchestrator-runtime:backup-before-014a ric-orchestrator-runtime:latest`.

After rollback, `ric-orchestrator-runtime:latest` returned to ID `585f4d5c2075`, size 9.3 GB.

Rollback smoke did not return the exact token `RIC-RUNTIME-014A-ROLLBACK-OK`; it returned an incorrect gate-style response, confirming the active runtime reverted to pre-013A behavior.

The RIC-STUDIO-013A prompt correction is still not applied to the active runtime.

Validation evidence is recorded in `docs/validation/runtime-rebuild-promotion-014a.md`.

The official `runtime/ric-orchestrator/Modelfile` was not altered during this documentation correction. No `ollama create`, `ollama cp`, model deletion, backup deletion, old candidate deletion, commit, or push occurred in this correction step.

RIC-STUDIO-015A aligned the versioned official runtime source with the approved Qwen3 14B runtime base.

Pre-validation confirmed the repository was clean and synchronized with `origin/main` at `bd6aa579420e443213ca4256e3f0190b54216607`.

Pre-validation confirmed active `ric-orchestrator-runtime:latest` is ID `585f4d5c2075`, size 9.3 GB, and `qwen3:14b` exists locally.

Pre-validation confirmed `runtime/ric-orchestrator/Modelfile` started with `FROM qwen2.5-coder:7b`.

RIC-STUDIO-015A changed only the first line of `runtime/ric-orchestrator/Modelfile` to `FROM qwen3:14b`.

No runtime prompt rules were changed in RIC-STUDIO-015A.

Validation evidence is recorded in `docs/validation/runtime-modelfile-base-015a.md`.

No `ollama create`, `ollama cp`, runtime rebuild, runtime promotion, model deletion, backup deletion, candidate deletion, commit, or push occurred during RIC-STUDIO-015A.

RIC-STUDIO-015A is Remote DONE and synchronized with `origin/main` at commit `0477c8323b49a8bb04fb9d9921c7c8da439444f9`.

RIC-STUDIO-016A created and validated candidate `ric-orchestrator-candidate:016a-qwen3-refined-prompt` from the corrected Qwen3 Modelfile.

Pre-validation confirmed the repository was clean and synchronized with `origin/main` at `0477c8323b49a8bb04fb9d9921c7c8da439444f9`.

Pre-validation confirmed `runtime/ric-orchestrator/Modelfile` starts with `FROM qwen3:14b`.

Pre-validation confirmed active `ric-orchestrator-runtime:latest` was ID `585f4d5c2075`, size 9.3 GB.

Candidate creation completed successfully.

Post-create `ollama list` shows `ric-orchestrator-candidate:016a-qwen3-refined-prompt` at ID `3026c74ea0d4`, size 9.3 GB.

Candidate smoke test returned `RIC-RUNTIME-016A-CANDIDATE-OK`, with Ollama CLI terminal control noise after the token.

Behavioral test 1 passed on retry: the candidate completed the official response, did not claim absence of dependencies, pending work, or blockers without raw evidence, and exited without timeout.

Behavioral test 2 passed: the candidate assigned implementation to executor agent/Codex after READY and did not say the runtime would implement.

`ric-orchestrator-runtime:latest` was not promoted, copied over, or altered, and remains ID `585f4d5c2075`, size 9.3 GB.

Validation evidence is recorded in `docs/validation/runtime-candidate-016a.md`.

No `ollama cp`, promotion, official runtime alteration, model deletion, backup deletion, candidate deletion, Modelfile edit, or push occurred during RIC-STUDIO-016A.

RIC-STUDIO-016A is Remote DONE and synchronized with `origin/main` at commit `0059eacd105be1836d2431a1da9d7c2a7b9bb47d`.

RIC-STUDIO-017A was opened as READY by explicit current request.

RIC-STUDIO-017A must promote the validated candidate `ric-orchestrator-candidate:016a-qwen3-refined-prompt` to `ric-orchestrator-runtime:latest` only through a controlled promotion flow.

Candidate to promote:

- `ric-orchestrator-candidate:016a-qwen3-refined-prompt`.
- ID `3026c74ea0d4`.
- Size 9.3 GB.

Current official runtime before execution:

- `ric-orchestrator-runtime:latest`.
- ID `585f4d5c2075`.
- Size 9.3 GB.

Before execution, the latest runtime did not yet point to the validated 016A candidate. The required action was controlled promotion, not rebuild.

RIC-STUDIO-017A executed the controlled promotion.

Execution evidence:

- Pre-promotion Git evidence confirmed `HEAD == origin/main == 62a4d244103cdfd521731138346cfdbcd64ace20`.
- Candidate `ric-orchestrator-candidate:016a-qwen3-refined-prompt` existed before promotion at ID `3026c74ea0d4`, size 9.3 GB.
- `ric-orchestrator-runtime:latest` existed before promotion at ID `585f4d5c2075`, size 9.3 GB.
- `ric-orchestrator-runtime:backup-before-017a` did not exist before backup creation.
- Backup was created with `ollama cp ric-orchestrator-runtime:latest ric-orchestrator-runtime:backup-before-017a`.
- Promotion was executed with `ollama cp ric-orchestrator-candidate:016a-qwen3-refined-prompt ric-orchestrator-runtime:latest`.
- Post-promotion `ric-orchestrator-runtime:latest` points to ID `3026c74ea0d4`.
- Backup `ric-orchestrator-runtime:backup-before-017a` points to previous runtime ID `585f4d5c2075`.
- Smoke test returned `RIC-RUNTIME-017A-OK`.
- Validation evidence is recorded in `docs/validation/runtime-promotion-017a.md`.

Execution requirements for RIC-STUDIO-017A:

- Verify Git is clean and synchronized before promotion.
- Verify `ric-orchestrator-runtime:backup-before-017a` does not exist.
- Stop immediately if `ric-orchestrator-runtime:backup-before-017a` already exists.
- Create backup with `ollama cp ric-orchestrator-runtime:latest ric-orchestrator-runtime:backup-before-017a`.
- Promote only with `ollama cp ric-orchestrator-candidate:016a-qwen3-refined-prompt ric-orchestrator-runtime:latest`.
- Confirm `ric-orchestrator-runtime:latest` points to ID `3026c74ea0d4`.
- Run post-promotion smoke test.
- Document evidence in `docs/validation/runtime-promotion-017a.md`.
- Commit and push only after complete validation.

Authorized files for RIC-STUDIO-017A:

- `STATUS.md`.
- `backlog.md`.
- `docs/ops/status.md`.
- `docs/ops/backlog.md`.
- `docs/ops/execution-log.md`.
- `docs/ops/session-handoff.md`.
- `docs/validation/runtime-promotion-017a.md`.

RIC-STUDIO-018A opened after CBM-012 and CBM-013 robust task execution in Clinic Booking Mini.

Eight positive patterns and three operational limits were registered in `docs/validation/agent-performance-log.md`.

Test suite growth observed: 6 → 9 (CBM-012) → 12 (CBM-013).

RIC-STUDIO-019A was opened as READY after Discussion Gate approval on 2026-05-17.

RIC-STUDIO-021A executed: backup created, candidate promoted, smoke test passed.

## What remains

Review RIC-STUDIO-025A promotion evidence in `docs/validation/runtime-promotion-025a.md`. Authorize commit and push after Trigger review. Do not commit or push without explicit authorization.

Do not delete `ric-orchestrator-runtime:backup-before-012a`.

Do not delete `ric-orchestrator-runtime:backup-before-014a`.

## Constraints to preserve

- Do not create UI.
- Do not create a Next.js app.
- Do not install dependencies.
- Do not create scripts.
- Do not automate Git.
- Do not alter `.github`.
- Do not delete runtime candidates.
- Do not delete `ric-orchestrator-candidate:014a-refined-prompt`.
- Do not run `ollama cp` para `ric-orchestrator-runtime:latest`.
- Do not promote `ric-orchestrator-runtime:latest` automatically.
- Do not delete backups.
- Do not touch Clinic Booking Mini.
- Do not build harness now.
- Do not train or tune models.
- Do not configure IDE integration.
- Do not create GitHub integration.
- Do not commit without validation.
- Do not push without Push Gate explícito.

Note: Within RIC-STUDIO-019A, versioned edits to `runtime/ric-orchestrator/Modelfile` were performed. Promotion to `ric-orchestrator-runtime:latest` remained prohibited in that task. Harness implementation remains deferred to a future task.
