# Operations Status

## Current state

REVIEW

## Task

RIC-STUDIO-043A - Implement Commit Allowed Decision From Evidence Contract

## Product mode

Local-first.

## MVP mode

Minimal local implementation planning with operational control.

## Official agents

- RIC Architect: discussion, scope, architecture, and task design.
- RIC Local Orchestrator: evidence, validation, commit and push gate, and state control.

## Official states

- Discussion Gate.
- READY.
- IN_PROGRESS.
- Local DONE.
- Remote DONE.

## Runtime authority

`ric-orchestrator-runtime:latest` is the official local orchestration runtime.

## Current task result

RIC-STUDIO-043A is in REVIEW.

RIC-STUDIO-SPRINT-002 - Local MVP Technical Foundation is registered.

Scope: first positive `COMMIT_ALLOWED` decision implementation from the evidence contract.

Result: implemented `COMMIT_ALLOWED` in `tools/auditor/audit.mjs` only when the evidence input satisfies the documented commit allow evidence contract.

Created `tools/auditor/fixtures/commit-allowed-evidence.json` and `docs/validation/local-auditor-commit-allowed-smoke.md`.

Validation preserved five negative `COMMIT_BLOCKED` scenarios and confirmed the complete positive evidence fixture returns `COMMIT_ALLOWED` with `allowed_actions` set to `["commit"]`, `blocked_actions` containing `push` and `remote_done`, and `human_review_required` set to `true`.

Blocked and not performed in this implementation task: `PUSH_ALLOWED`, `LOCAL_DONE_CONFIRMED`, `REMOTE_DONE_CONFIRMED`, dependencies, `package.json`, test runner, runtime changes, `Modelfile` changes, UI, Next.js, LangChain, LangGraph, GitHub API, automation, commit, and push.

## READY note

RIC-STUDIO-001 is Remote DONE and synchronized with `origin/main` at commit `aa8a6d3`.

RIC-STUDIO-002 is Remote DONE and synchronized with `origin/main` at commit `b81ac6b`.

RIC-STUDIO-003A is Remote DONE and synchronized with `origin/main` at commit `07e11f1`.

Batch result: 3 PASS, 1 FAIL. PASS: LO-SMOKE-001, LO-SMOKE-005, LO-SMOKE-006. FAIL: LO-SMOKE-003.

Conclusion: `ric-orchestrator-runtime:latest` correctly blocked missing-evidence commit, allowed controlled push, and blocked Remote DONE when HEAD != origin/main, but failed the positive commit-allow scenario by overblocking.

RIC-STUDIO-003B is Remote DONE and synchronized with `origin/main` at commit `e67a0e5`.

Diagnosis result: 2 PASS, 3 FAIL. The model overblocked COMMIT-ALLOW-001, COMMIT-ALLOW-002, and COMMIT-ALLOW-003; it passed only the rule-explicit positive case and the negative control.

A future system prompt or Modelfile correction is recommended but was not executed in this task.

RIC-STUDIO-004B is Remote DONE and synchronized with `origin/main` at commit `bfa6519`.

During RIC-STUDIO-004B, no candidate model was created, no official runtime tag was promoted, and no model behavior was tested.

The clean versioned runtime source was created at `runtime/ric-orchestrator/Modelfile`.

RIC-STUDIO-005A is Remote DONE and synchronized with `origin/main` at commit `6610991`.

Candidate runtime `ric-orchestrator-candidate:005a` was created from `runtime/ric-orchestrator/Modelfile` and validated locally. The official runtime was not promoted or overwritten.

RIC-STUDIO-006A is Remote DONE and synchronized with `origin/main` at commit `8e3796a`.

Behavioral smoke tests against `ric-orchestrator-candidate:005a` completed with 6 PASS and 0 FAIL for the required gate decisions. The candidate fixed the previous positive commit-allow overblocking in the tested scenarios. The candidate was not promoted.

RIC-STUDIO-007A is Remote DONE and synchronized with `origin/main` at commit `f4a16cc`.

Realistic workflow simulation against `ric-orchestrator-candidate:005a` completed with 7 PASS and 0 FAIL. The candidate was not promoted. Recommendation: promote the candidate in a separate controlled promotion task after Trigger review.

RIC-STUDIO-008A is Remote DONE and synchronized with `origin/main` at commit `54c7f78`.

Versioned runtime vocabulary was standardized in `runtime/ric-orchestrator/Modelfile`. Candidate runtime `ric-orchestrator-candidate:008a` was created and passed six focused vocabulary smoke tests with 6 PASS and 0 FAIL, including the push blocked exact label `PUSH AINDA BLOQUEADO`. The official runtime was not promoted or overwritten.

RIC-STUDIO-009A is Remote DONE.

RIC-STUDIO-009B is in REVIEW after recording real observed local orchestrator errors from Clinic Booking Mini CBM-004 in `docs/validation/local-orchestrator-error-log.md`.

Observed pattern count for CBM-004 is 2 `state-contradiction` and 1 `scope-confusion`.

RIC-STUDIO-010A was opened by explicit current request to improve the local orchestrator prompt from the logged error patterns.

RIC-STUDIO-010A is REJECTED / REVIEW CLOSED after versioned runtime prompt experiments, candidate creation, and focused behavior tests.

Candidate `ric-orchestrator-candidate:010a` is rejected for promotion because the proposed next task synthesis test failed.

Candidate `ric-orchestrator-candidate:010b` fixed the proposed next task synthesis test, but is rejected for promotion because the clean Git state test and push-blocked wording test failed.

`runtime/ric-orchestrator/Modelfile` was reverted to the previous stable repository state. The rejected Modelfile changes are not active.

The candidates remain evidence only. No candidate was promoted to `ric-orchestrator-runtime:latest`. No commit or push has occurred.

Recommended next task: RIC-STUDIO-011A - Benchmark Larger Base Model For Local Orchestrator.

UI, Next.js app, IDE integration, Git automation, `.github`, GitHub API integration, database, login, deploy, scripts, runtime promotion, direct promotion to `ric-orchestrator-runtime:latest`, official runtime changes, model training, model tuning, dependency changes, runtime deletion, commit, push, Local DONE, and Remote DONE are blocked.

RIC-STUDIO-011A was opened by explicit current request after Discussion Gate recommendation.

Candidate `ric-orchestrator-candidate:011a-qwen3-14b` was created from a temporary Modelfile outside the repository, using the official Modelfile content with only `FROM qwen3:14b` as the base change.

The official `runtime/ric-orchestrator/Modelfile` remains unchanged.

Benchmark result: 0 PASS, 5 FAIL. Each required scenario exposed internal `Thinking...` output and timed out before a complete operational answer, which is an automatic failure condition.

Decision: candidate `ric-orchestrator-candidate:011a-qwen3-14b` is rejected for promotion. No promotion to `ric-orchestrator-runtime:latest`, commit, or push has occurred.

RIC-STUDIO-011B was opened by explicit current request as a corrective benchmark after RIC-STUDIO-011A.

Candidate `ric-orchestrator-candidate:011b-qwen3-14b` was created from a temporary Modelfile outside the repository, using `FROM qwen3:14b`, a short SYSTEM prompt, and explicit no-thinking instructions.

The official `runtime/ric-orchestrator/Modelfile` remains unchanged.

`--think=false` suppressed visible `Thinking...` and `<think>` output in the five required tests, but the CLI still emitted terminal control/spinner noise after responses.

`--hidethinking` did not work for this use: a short technical prompt timed out and produced only control/spinner output.

Benchmark result: 0 full PASS, 3 content-pass with technical caveat, 2 FAIL. Logical failures remained in the previous Remote DONE isolation test and concrete next-task synthesis test.

Decision: candidate `ric-orchestrator-candidate:011b-qwen3-14b` is rejected for promotion. No promotion to `ric-orchestrator-runtime:latest`, commit, or push has occurred.

RIC-STUDIO-011A/011B is REJECTED / REVIEW CLOSED as a documented benchmark.

Candidate `ric-orchestrator-candidate:011a-qwen3-14b` is rejected because it exposed `Thinking...`, timed out, and produced incomplete operational responses.

Candidate `ric-orchestrator-candidate:011b-qwen3-14b` is rejected because `--think=false` removed visible thinking but the candidate still failed logical routing in Test 2 and concrete next-task synthesis in Test 3.

The official `runtime/ric-orchestrator/Modelfile` remains intact. No candidate was promoted to `ric-orchestrator-runtime:latest`.

Recommended next task: RIC-STUDIO-011C - Fix Qwen3 Orchestrator State Routing And Next-Task Synthesis.

RIC-STUDIO-011C was opened by explicit current request after Discussion Gate returned READY RECOMENDADO.

Candidate `ric-orchestrator-candidate:011c-qwen3-14b` was created from a temporary Modelfile outside the repository, using `FROM qwen3:14b`, explicit no-thinking instructions, state-routing rules, and next-task synthesis rules.

The official `runtime/ric-orchestrator/Modelfile` remains unchanged.

Initial benchmark result: 4 PASS, 1 FAIL. The candidate fixed the concrete next-task synthesis failure from 011B, but still failed previous Remote DONE isolation by returning `REMOTE DONE CONFIRMADO` instead of `DISCUSSION GATE RECOMENDADO` or a READY recommendation.

Corrective variation `ric-orchestrator-candidate:011c-fix1-qwen3-14b` was created from a temporary Modelfile outside the repository with only the remaining Test 2 rule strengthened.

Fix1 isolated Test 2 result: PASS. It returned `DISCUSSION GATE RECOMENDADO` and did not use `REMOTE DONE CONFIRMADO`, `PUSH AINDA BLOQUEADO`, commit, or push.

Fix1 full benchmark result: 5 PASS, 0 FAIL. No test exposed visible `Thinking...` or `<think>`, and no test timed out.

Decision: candidate `ric-orchestrator-candidate:011c-fix1-qwen3-14b` is approved by the 5/5 benchmark, but not promoted. No promotion to `ric-orchestrator-runtime:latest`, commit, or push has occurred.

RIC-STUDIO-011C benchmark evidence is closed in REVIEW as approved.

Candidate `ric-orchestrator-candidate:011c-fix1-qwen3-14b` is approved as a technical candidate for a separate controlled promotion task only.

The official `runtime/ric-orchestrator/Modelfile` remains intact.

Recommended next task after commit and push: RIC-STUDIO-012A - Promote Approved Qwen3 Orchestrator Candidate To Official Runtime.

RIC-STUDIO-012A was opened by explicit current request after Discussion Gate returned READY RECOMENDADO and RIC-STUDIO-011C reached Remote DONE at commit `9f6f18f3419a09bda7f625c96113b9de25787920`.

Pre-promotion Git evidence confirmed a clean working tree and `HEAD == origin/main`.

Pre-promotion model evidence confirmed both `ric-orchestrator-candidate:011c-fix1-qwen3-14b` and `ric-orchestrator-runtime:latest` existed, and no `ric-orchestrator-runtime:backup-before-012a` existed.

Backup was created with `ollama cp ric-orchestrator-runtime:latest ric-orchestrator-runtime:backup-before-012a`.

Candidate promotion was executed with `ollama cp ric-orchestrator-candidate:011c-fix1-qwen3-14b ric-orchestrator-runtime:latest`.

Post-promotion model evidence shows `ric-orchestrator-runtime:latest` and `ric-orchestrator-candidate:011c-fix1-qwen3-14b` share ID `585f4d5c2075`; backup `ric-orchestrator-runtime:backup-before-012a` preserves previous runtime ID `be391f29a172`.

Smoke test returned `RIC-RUNTIME-012A-OK`.

The official `runtime/ric-orchestrator/Modelfile` remains unchanged. No commit or push has occurred.

RIC-STUDIO-012A is Remote DONE and synchronized with `origin/main` at commit `75005f56f1912aa8b5a178fa0be3184008ad106d`.

RIC-STUDIO-013A was opened by explicit current request after real post-promotion Discussion Gate tests in Clinic Booking Mini.

Real cases documented for RIC-STUDIO-013A:

- CBM-009 - Add appointment conflict guard.
- CBM-010 - Add appointment request time guard.

Observed runtime behavior was functionally safe enough to recommend READY, keep commit and push blocked, and request minimum evidence, but it overclaimed absence of pending dependencies without raw evidence and blurred runtime auditor/orchestrator duties with executor/Codex implementation duties.

`runtime/ric-orchestrator/Modelfile` now explicitly prohibits unsupported claims that no dependencies, blockers, missing work, missing files, or outstanding changes exist without current raw evidence proving that exact claim.

`runtime/ric-orchestrator/Modelfile` also reinforces that the runtime decides, audits, blocks, and recommends, while executor agent/Codex performs implementation after READY.

Validation is documented in `docs/validation/runtime-prompt-refinement-013a.md`.

No `ollama create`, `ollama cp`, rebuild, promotion, model deletion, backup deletion, commit, or push has occurred during RIC-STUDIO-013A.

RIC-STUDIO-013A is Remote DONE and synchronized with `origin/main` at commit `58ad31110d14c370708a5d2ac001c40d2afaae74`.

RIC-STUDIO-014A was opened by explicit current request to apply the refined versioned prompt to the active runtime.

Initial evidence confirmed a clean synchronized repository at `58ad31110d14c370708a5d2ac001c40d2afaae74`, `runtime/ric-orchestrator/Modelfile` exists, `ric-orchestrator-runtime:latest` existed, and `ric-orchestrator-runtime:backup-before-014a` did not exist before backup creation.

Candidate `ric-orchestrator-candidate:014a-refined-prompt` was created from `runtime/ric-orchestrator/Modelfile`, but audit confirmed the Modelfile begins with `FROM qwen2.5-coder:7b`.

The candidate ID is `1e10ad354fb3`, size 4.7 GB, which is a regression from the approved Qwen3 14B runtime ID `585f4d5c2075`, size 9.3 GB.

Backup `ric-orchestrator-runtime:backup-before-014a` was created from the previous runtime before promotion.

Candidate `ric-orchestrator-candidate:014a-refined-prompt` was briefly promoted to `ric-orchestrator-runtime:latest` using `ollama cp`, causing a base regression.

Post-promotion `ollama list` showed `ric-orchestrator-runtime:latest` and `ric-orchestrator-candidate:014a-refined-prompt` shared ID `1e10ad354fb3`, while `ric-orchestrator-runtime:backup-before-014a` preserved previous runtime ID `585f4d5c2075`.

Rollback was executed with `ollama cp ric-orchestrator-runtime:backup-before-014a ric-orchestrator-runtime:latest`.

After rollback, `ric-orchestrator-runtime:latest` returned to ID `585f4d5c2075`, size 9.3 GB.

The rollback smoke did not return the exact token `RIC-RUNTIME-014A-ROLLBACK-OK`; it returned an incorrect gate-style response, confirming the active runtime reverted to pre-013A behavior.

The RIC-STUDIO-013A prompt correction is still not applied to the active runtime.

RIC-STUDIO-014A is BLOCKED / ROLLED BACK and must not be declared DONE or promoted-complete.

Validation is documented in `docs/validation/runtime-rebuild-promotion-014a.md`.

The official `runtime/ric-orchestrator/Modelfile` was not altered during this documentation correction. No `ollama create`, `ollama cp`, model deletion, backup deletion, old candidate deletion, commit, or push has occurred in this correction step.

RIC-STUDIO-015A is Remote DONE and synchronized with `origin/main` at commit `0477c8323b49a8bb04fb9d9921c7c8da439444f9`.

RIC-STUDIO-015A aligned the versioned official runtime Modelfile base with the approved Qwen3 14B runtime.

Pre-validation confirmed:

- `git status --short --untracked-files=all` returned no file entries.
- `git status -sb` returned `## main...origin/main`.
- `git rev-parse HEAD` and `git rev-parse origin/main` both returned `bd6aa579420e443213ca4256e3f0190b54216607`.
- `ollama list` showed active `ric-orchestrator-runtime:latest` at ID `585f4d5c2075`, size 9.3 GB.
- `ollama list` showed `qwen3:14b` exists locally.
- `Get-Content runtime/ric-orchestrator/Modelfile -TotalCount 5` showed the Modelfile started with `FROM qwen2.5-coder:7b`.

RIC-STUDIO-015A changed only the first line of `runtime/ric-orchestrator/Modelfile` to `FROM qwen3:14b`.

No prompt rules were changed in this task.

Validation is documented in `docs/validation/runtime-modelfile-base-015a.md`.

No `ollama create`, `ollama cp`, runtime rebuild, runtime promotion, model deletion, backup deletion, candidate deletion, commit, or push has occurred during RIC-STUDIO-015A.

RIC-STUDIO-016A was opened by explicit current request to rebuild and validate a candidate from the corrected Qwen3 Modelfile, without promotion.

Pre-validation confirmed:

- `git status --short --untracked-files=all` returned no file entries, only global ignore permission warnings.
- `git status -sb` returned `## main...origin/main`, only global ignore permission warnings.
- `git rev-parse HEAD` and `git rev-parse origin/main` both returned `0477c8323b49a8bb04fb9d9921c7c8da439444f9`.
- `Get-Content runtime/ric-orchestrator/Modelfile -TotalCount 5` showed `FROM qwen3:14b`.
- `ollama list` showed active `ric-orchestrator-runtime:latest` at ID `585f4d5c2075`, size 9.3 GB, and no existing `ric-orchestrator-candidate:016a-qwen3-refined-prompt`.

Candidate `ric-orchestrator-candidate:016a-qwen3-refined-prompt` was created successfully from `runtime/ric-orchestrator/Modelfile`.

Post-create `ollama list` shows candidate `ric-orchestrator-candidate:016a-qwen3-refined-prompt` at ID `3026c74ea0d4`, size 9.3 GB.

Candidate smoke test returned `RIC-RUNTIME-016A-CANDIDATE-OK`, with terminal control noise emitted by the Ollama CLI after the token.

Behavioral test 1 passed on retry: the candidate requested raw evidence, did not assert absence of dependencies, pending work, or blockers without evidence, completed the full official response, and exited without timeout.

Behavioral test 2 passed: the candidate did not take implementation ownership and assigned implementation to executor agent/Codex after READY.

`ric-orchestrator-runtime:latest` was not promoted, copied over, or altered, and remains ID `585f4d5c2075`, size 9.3 GB.

Validation is documented in `docs/validation/runtime-candidate-016a.md`.

No `ollama cp`, promotion, official runtime alteration, model deletion, backup deletion, candidate deletion, Modelfile edit, or push has occurred during RIC-STUDIO-016A.

RIC-STUDIO-016A is Remote DONE and synchronized with `origin/main` at commit `0059eacd105be1836d2431a1da9d7c2a7b9bb47d`.

RIC-STUDIO-017A is Remote DONE and synchronized with `origin/main` at commit `6237383`.

RIC-STUDIO-017A promoted `ric-orchestrator-candidate:016a-qwen3-refined-prompt` to `ric-orchestrator-runtime:latest`. Post-promotion runtime ID is `3026c74ea0d4`. Backup `ric-orchestrator-runtime:backup-before-017a` preserves previous ID `585f4d5c2075`. Smoke test returned `RIC-RUNTIME-017A-OK`.

RIC-STUDIO-018A was opened by explicit current request after CBM-012 and CBM-013 robust task execution.

RIC-STUDIO-018A is Remote DONE and synchronized with `origin/main` at commit `19f3784`.

RIC-STUDIO-019A was opened as READY after Discussion Gate approval on 2026-05-17.

RIC-STUDIO-019A is Remote DONE and synchronized with `origin/main` at commit `6d50192`.

RIC-STUDIO-021A is Remote DONE and synchronized with `origin/main` at commit `6adf295`.

RIC-STUDIO-022A is Remote DONE and synchronized with `origin/main` at commit `5cad905`.

Eight positive patterns were observed and registered:

- Discussion Gate correctly blocked premature Executor engagement.
- Executor completed robust task after READY.
- CBM-012 implemented appointment request lifecycle without schema or migration.
- CBM-013 implemented overlap guard without altering models.py.
- Executor stopped at REVIEW without self-authorizing commit.
- Orchestrator released commit and push only with evidence.
- Commits respected authorized file scope.
- Flow generated real product value and LLM calibration evidence.

Three operational limits were registered:

- Discussion Gate requires explicit Trigger initiation.
- Scope enforcement depends on task definition quality.
- Orchestrator CLI noise is a persistent operational caveat.

No runtime change, Modelfile edit, ollama create, ollama cp, model deletion, backup deletion, Clinic Booking Mini change, RIC-STUDIO-019A opening, commit, or push has occurred during RIC-STUDIO-018A.

RIC-STUDIO-022A created `docs/validation/harness-requirements.md` defining the Minimal Runtime Smoke Harness V1 requirements. No script, harness code, Modelfile alteration, ollama create, ollama cp, or runtime promotion occurred.

RIC-STUDIO-023A was opened as READY by explicit current request after Discussion Gate approval.

RIC-STUDIO-023A scope: validate `ric-orchestrator-runtime:latest` behavior and latency baseline across 5 mandatory scenarios. Result to be documented in `docs/validation/runtime-behavior-latency-023a.md`. No harness implementation, no Modelfile change, no runtime promotion in this task.

RIC-STUDIO-023A is in REVIEW after executing the 5 mandatory manual tests against `ric-orchestrator-runtime:latest`.

Result: 0 PASS, 5 FAIL. All tests failed by timeout/lentidão. Root cause: Qwen3 14B in thinking mode with predominantly CPU inference (~6.6 GB of 10 GB on RAM); Ollama 0.24.0 buffers the entire think block before transmitting any response bytes; thinking suppression via `/no_think` (CLI) and `think: false` (REST API) did not produce any response tokens within the 5-minute timeout. Time to first response token: undetermined (> 300s on Test 1, > 30s on Tests 2–5).

Latency baseline: impractical for operational use with current hardware configuration.

Evidence documented in `docs/validation/runtime-behavior-latency-023a.md`.

RIC-STUDIO-024A was opened by explicit current request to create a Qwen 7B orchestrator candidate runtime.

RIC-STUDIO-024A is in REVIEW after creating candidate tag `ric-orchestrator-candidate:024a-qwen25-coder-7b` from separate Modelfile `runtime/ric-orchestrator/Modelfile.024a-qwen25-coder-7b`.

The final candidate uses base `qwen2.5-coder:7b` and has ID `9e5cdcf8a6ae`, size 4.7 GB. The official runtime `ric-orchestrator-runtime:latest` remained ID `2711dd3bc829`, size 9.3 GB.

Final manual test result: 5 PASS, 0 FAIL across commit blocked, commit released, push released, push blocked, and Remote DONE confirmed.

Latency caveat: cold-start API test took about 167 seconds; warm API tests took about 21-29 seconds.

Validation evidence is documented in `docs/validation/runtime-candidate-024a-qwen25-coder-7b.md`.

No `ollama cp`, promotion, official runtime source alteration, harness implementation, model download, Git automation, app/UI change, commit, or push occurred during RIC-STUDIO-024A.

RIC-STUDIO-024A is Remote DONE per current task context.

RIC-STUDIO-025A was opened by explicit current request to promote the approved Qwen 7B candidate to the official local orchestrator runtime.

RIC-STUDIO-025A is Remote DONE. Backup `ric-orchestrator-runtime:backup-before-025a` preserves ID `2711dd3bc829`. Candidate promoted to `ric-orchestrator-runtime:latest` (ID `9e5cdcf8a6ae`). Smoke passed.

Validation evidence is documented in `docs/validation/runtime-promotion-025a.md`.

RIC-STUDIO-026A was opened by explicit current request to create the RIC Architect candidate runtime based on `qwen2.5-coder:7b`.

RIC-STUDIO-026A is Remote DONE. Architect candidate `ric-architect-candidate:026a-qwen25-coder-7b` (ID `c8cfc69738af`) created and validated with 4 PASS / 0 FAIL. Validation evidence: `docs/validation/architect-candidate-026a-qwen25-coder-7b.md`.

RIC-STUDIO-027A was opened by explicit current request to validate the two-model workflow.

RIC-STUDIO-027A is Remote DONE. Combined result: 1 PASS (Orchestrator), 1 FAIL (Architect — harness domain confusion). Validation evidence: `docs/validation/two-model-workflow-027a.md`.

RIC-STUDIO-028A was opened by explicit current request to fix the Architect domain context failure observed in 027A.

RIC-STUDIO-028A is Remote DONE. 4 PASS, 0 FAIL. Validation evidence: `docs/validation/architect-candidate-028a-contextfix.md`.

RIC-STUDIO-028B was opened by explicit current request to promote the validated context-fixed Architect candidate to the official runtime.

Pre-promotion state: Git clean and synchronized with origin/main. Candidate `ric-architect-candidate:028a-qwen25-coder-7b-contextfix` (ID `b2ba1b3efeae`) present. Previous official `ric-architect-qwen-v2:latest` at ID `6a94ce329010`.

Backup created: `ric-architect-qwen-v2:backup-before-028b` preserves ID `6a94ce329010`.

Promotion executed: `ollama cp ric-architect-candidate:028a-qwen25-coder-7b-contextfix ric-architect-qwen-v2:latest`. Post-promotion `ollama list` confirms `ric-architect-qwen-v2:latest` now points to ID `b2ba1b3efeae`.

Smoke tests against promoted runtime: 4 PASS, 1 FAIL.
- PASS: harness ambíguo, ideia vaga, task documental harness interno, commit bloqueado.
- FAIL: Smoke test 5 (stack trade-off) — model recommended React over Django Admin for simple admin app, citing "MVP first" but choosing more complex stack. Logical contradiction. Not a domain regression; a reasoning limitation.

Backup `ric-architect-qwen-v2:backup-before-028b` available for rollback if Trigger decides FAIL is blocking.

Validation evidence is documented in `docs/validation/runtime-promotion-028b.md`. No commit. No push.

RIC-STUDIO-029A was opened by explicit current request to validate both official runtimes in realistic production workflow scenarios.

Manual validation was executed against `ric-architect-qwen-v2:latest` and `ric-orchestrator-runtime:latest`.

Result across model calls: 2 PASS, 3 CAVEAT, 1 FAIL.

- PASS: Orchestrator blocked incomplete commit evidence in both commit-gate scenarios.
- CAVEAT: Architect gave safe but generic/conservative answers for DayBudget and BioLoop, and proposed possible schema work for Clinic Booking Mini without first verifying existing lifecycle fields.
- FAIL: Architect repeated the known stack trade-off weakness by recommending Django Admin plus separate React for a simple administrative MVP.

Evidence is documented in `docs/validation/two-model-production-workflow-029a.md`.

No Modelfile change, candidate creation, runtime promotion, `ollama cp`, harness, or external app change occurred during RIC-STUDIO-029A.

RIC-STUDIO-029A is Remote DONE and synchronized with `origin/main` at commit `6dcdf17`.

RIC-STUDIO-030A is in REVIEW after preserving the existing Architect pragmatic MVP Modelfile and creating the validation battery documentation.

Modelfile: `runtime/ric-architect/Modelfile.030a-pragmatic-mvp`.

Validation evidence: `docs/validation/architect-candidate-030a-pragmatic-mvp.md`.

Battery documented: simple MVP stack trade-off, stack inflation rejection, domain invariant protection, portfolio MVP finalization, scope reduction, previous 029A failed stack case, existing lifecycle caution, and operational boundary.

No `runtime/ric-orchestrator/*` file was touched. No harness, external project change, runtime promotion, `ollama cp`, commit, or push occurred during this documentation step.

RIC-STUDIO-030A is Remote DONE per current task context at commit `105c220`.

RIC-STUDIO-031A is in REVIEW after refreshing and validating `ric-architect-candidate:030a-pragmatic-mvp` from `runtime/ric-architect/Modelfile.030a-pragmatic-mvp`.

The candidate tag already existed before execution and was refreshed from the required source Modelfile. Post-create `ollama list` confirmed candidate ID `c0a0e8da9a7c`, size 4.7 GB.

Behavioral battery result: 5 PASS, 2 CAVEAT, 1 FAIL.

- PASS: simple MVP stack trade-off, domain invariant protection, portfolio MVP finalization, scope reduction, operational boundary.
- CAVEAT: stack inflation rejection and previous 029A failed case improved but were not perfectly crisp.
- FAIL: existing lifecycle caution still proposed feature expansion before verifying existing status fields, transitions, admin actions, tests, and smoke flow.

Decision: CANDIDATE REJECTED. Evidence: `docs/validation/architect-candidate-031a-pragmatic-mvp.md`.

No `ollama cp`, official Architect runtime promotion, official runtime overwrite, Modelfile edit, `runtime/ric-orchestrator/*` change, harness, external project change, commit, or push occurred during RIC-STUDIO-031A.
