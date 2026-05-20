# RIC-STUDIO-032A - Architect 8B Candidate Comparison

State: BLOCKED

Date: 2026-05-20

## Task intent

Test two 8B-class RIC Architect candidates using the refined lifecycle-first Architect prompt, compare behavior and performance, and document the result.

Required guardrails:

- Do not promote any runtime.
- Do not run `ollama cp`.
- Do not use 14B models.
- Do not download or pull models without explicit authorization.
- Stop and report BLOCKED if fewer than two valid 8B-class local base models are available.

## Raw local model evidence

Command executed:

```text
ollama list
```

Raw output:

```text
NAME                                                       ID              SIZE      MODIFIED
ric-architect-candidate:030a-pragmatic-mvp                 c0a0e8da9a7c    4.7 GB    2 hours ago
ric-architect-qwen-v2:latest                               b2ba1b3efeae    4.7 GB    16 hours ago
ric-architect-qwen-v2:backup-before-028b                   6a94ce329010    4.7 GB    16 hours ago
ric-architect-candidate:028a-qwen25-coder-7b-contextfix    b2ba1b3efeae    4.7 GB    17 hours ago
ric-architect-candidate:026a-qwen25-coder-7b               c8cfc69738af    4.7 GB    20 hours ago
ric-orchestrator-runtime:latest                            9e5cdcf8a6ae    4.7 GB    23 hours ago
ric-orchestrator-runtime:backup-before-025a                2711dd3bc829    9.3 GB    23 hours ago
ric-orchestrator-candidate:024a-qwen25-coder-7b            9e5cdcf8a6ae    4.7 GB    23 hours ago
ric-orchestrator-candidate:019a-refined-format             2711dd3bc829    9.3 GB    2 days ago
qwen2.5-coder:7b                                           dae161e27b0e    4.7 GB    8 days ago
```

## Candidate selection result

BLOCKED.

Only one distinct local 8B-class base model tag was available:

- `qwen2.5-coder:7b` at ID `dae161e27b0e`, size 4.7 GB.

The other 4.7 GB entries are existing RIC runtime/candidate tags derived from local prompts. They are not separate base models for a fair two-model 8B-class comparison. The 9.3 GB entries are 14B-class and explicitly out of scope for this task.

The task also provided the Architect prompt body as a placeholder:

```text
[PASTE THE REFINED RIC ARCHITECT PROMPT HERE]
```

No concrete refined lifecycle-first prompt body was supplied in the request or found as a dedicated 032A prompt source. This is a secondary blocker; the primary blocker is the missing second valid local 8B-class base model.

## Validation battery

Not run.

Reason: the task explicitly requires stopping if fewer than two valid 8B-class models are available. Running the battery against one model, reused prompt-wrapped derivatives, or 14B models would invalidate the comparison.

Required tests not executed:

1. Simple MVP stack trade-off.
2. Stack inflation rejection.
3. Domain invariant protection.
4. Portfolio MVP finalization.
5. Scope reduction.
6. Previous failed 029A-style case.
7. Lifecycle caution.
8. Operational boundary.

## Performance evidence

No per-test response time was recorded because no candidate validation calls were executed after the selection gate failed.

Observed evidence available:

- Local 14B-class entries remain out of scope for RIC-STUDIO-032A.
- Existing 4.7 GB Architect candidate tags cannot supply a fair two-base comparison because they are prompt/runtime derivatives rather than distinct base models.
- No output concision, format adherence, reasoning noise, or daily usability comparison can be claimed for this task.

## Decision

No candidate is promoted or recommended for promotion.

Future comparison can proceed only after:

- a second valid local 8B-class base model is available, or the task explicitly authorizes downloading one;
- the actual refined lifecycle-first Architect prompt body is provided or checked into a versioned prompt source.

## Negative confirmations

- No `ollama cp` was run.
- No runtime was promoted.
- No official Architect runtime was overwritten.
- No candidate tag was created.
- No 14B model was tested.
- No model was downloaded or pulled.
- No validation battery was run.
- No commit or push was performed.
