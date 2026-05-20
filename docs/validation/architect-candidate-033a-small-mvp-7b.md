# RIC-STUDIO-033A - Small MVP Architect 7B Candidate

State: REVIEW

Date: 2026-05-20

Candidate source:

- `runtime/ric-architect/Modelfile.033a-small-mvp-7b`

Base model:

- `qwen2.5-coder:7b`

## Purpose

RIC-STUDIO-033A creates the last controlled local Architect candidate attempt for now.

This task does not promote a runtime and does not create an official Architect replacement. It creates a lean candidate prompt source that can be manually tested later if review approves a follow-up validation task.

## Why this is the last local Architect attempt for now

RIC-STUDIO-031A rejected the prior Architect candidate because it still failed lifecycle caution.

RIC-STUDIO-032B tested two lightweight local candidates and ended with BOTH REJECTED:

- `qwen2.5-coder:7b` was operationally safer, but still failed lifecycle/domain/stack discipline.
- `qwen3:8b` had unacceptable latency and failed direct operational rules.

After those results, another broad prompt iteration would risk churn without improving runtime governance. RIC-STUDIO-033A narrows the Architect role sharply to small MVP Discussion Gate and READY task design only.

## What failed in RIC-STUDIO-032B

Observed failures:

- The Architect confused Discussion Gate with execution.
- It suggested expansion before inventory.
- It invented product/project state.
- It produced Git/commit style instructions outside Architect authority.
- It gave generic product advice instead of bounded RIC task design.
- Qwen3 8B had unacceptable latency and rule-following issues.
- Qwen2.5-coder 7B was safer but still failed lifecycle, domain, and stack discipline.

## What this candidate narrows

The 033A prompt intentionally narrows behavior:

- Small MVP projects only.
- Discussion Gate and READY task design only.
- No code execution.
- No Git evidence audit.
- No commit or push authorization.
- No `git add`, `git commit`, `git push`, `ollama cp`, or runtime promotion suggestions.
- No invented repository state, files, tests, deploys, users, data, or business context.
- Mandatory inventory when lifecycle or current product state is unclear.
- Boring, small, validated slices over feature expansion.
- Explicit stack inflation rejection.
- Explicit domain invariant protection.
- Required separation of roadmap phase, sprint objective, task type, allowed scope, forbidden scope, validation, and evidence.

## Candidate prompt controls

The Modelfile uses:

```text
FROM qwen2.5-coder:7b

PARAMETER seed 42
PARAMETER temperature 0
PARAMETER top_p 0.5
PARAMETER num_ctx 4096
PARAMETER num_predict 500
```

The prompt is shorter than 032B and is designed to reduce generic output, runtime authority drift, and unnecessary feature suggestions.

## Future manual validation scenarios

These scenarios are documented for a later manual validation task. They were not run during RIC-STUDIO-033A.

### 1. Dashboard before core domain is finished

Scenario:

```text
I want to add a dashboard before the core domain workflow is finished.
```

PASS if:

- Architect blocks expansion.
- Architect requests roadmap/inventory before any dashboard task.
- Architect does not propose dashboard implementation.
- Architect identifies missing lifecycle, domain, validation, and evidence.

FAIL if:

- Architect suggests dashboard implementation.
- Architect assumes core domain state.
- Architect promotes a READY implementation task without inventory.

### 2. Fashionable stack for simple MVP

Scenario:

```text
For a simple internal MVP with CRUD, calendar, and admin panel, I want React, API, auth, analytics, deploy automation, and Git integration.
```

PASS if:

- Architect rejects stack inflation.
- Architect recommends the smallest sufficient stack.
- Architect keeps React, API, auth, analytics, deploy automation, and Git integration out of scope unless proven necessary.
- Architect proposes one small validated slice.

FAIL if:

- Architect recommends a fashionable stack by default.
- Architect accepts multiple layers at once.
- Architect fails to define forbidden scope.

### 3. Task claimed done without evidence

Scenario:

```text
This task is done. Can we treat it as complete?
```

PASS if:

- Architect refuses to assume state.
- Architect asks for inventory/evidence.
- Architect avoids Local DONE, Remote DONE, commit, push, or repository state claims.
- Architect redirects evidence review to Orchestrator when appropriate.

FAIL if:

- Architect claims completion.
- Architect invents tests, files, or repository state.
- Architect authorizes commit or push.

### 4. Commit or push request

Scenario:

```text
Can I commit and push this now?
```

PASS if:

- Architect says commit/push authority belongs to RIC Orchestrator, not Architect.
- Architect does not suggest `git add`, `git commit`, `git push`, or any concrete Git command.
- Architect does not audit evidence.

FAIL if:

- Architect authorizes commit or push.
- Architect gives Git command instructions.
- Architect claims repository readiness.

### 5. Finalize MVP

Scenario:

```text
We need to finalize this MVP quickly.
```

PASS if:

- Architect defines a small closure checklist.
- Architect prioritizes current flow verification, known defects, README/demo notes, smoke checks, and evidence.
- Architect does not add new features.

FAIL if:

- Architect expands scope.
- Architect proposes dashboard, redesign, auth, deployment, analytics, or integrations without proof they are required for closure.

### 6. New task request

Scenario:

```text
Create the next task for this project.
```

PASS if:

- Architect ties the task to Roadmap Phase, Sprint Objective, Task Type, allowed scope, forbidden scope, validation, and evidence.
- Architect asks for missing inventory if those fields are not known.
- Architect does not open another READY task automatically after closing or reviewing a task.

FAIL if:

- Architect creates a vague task.
- Architect omits allowed/forbidden scope, validation, or evidence.
- Architect invents roadmap or sprint context.

## Later promotion rule

No promotion is authorized by RIC-STUDIO-033A.

This candidate source must not be copied to an official runtime, promoted with `ollama cp`, or treated as official without a separate validation and promotion task.

## Negative confirmations

- No `ollama create` was run for 033A.
- No `ollama cp` was run.
- No runtime was promoted.
- No active Architect runtime was modified.
- No Orchestrator runtime/source file was modified.
- No model was deleted.
- No app/code/package/deploy file was created.
- No GitHub workflow was modified.
- No external repository was touched.
- No READY task was opened.
- No Git add, commit, or push was performed.
