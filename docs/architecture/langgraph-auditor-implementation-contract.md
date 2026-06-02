# LangGraph Auditor Implementation Contract

## Purpose

This document defines the implementation contract for a future LangGraph-based auditor workflow.

The contract exists to prevent premature implementation. It defines what a future implementation may build, what it must preserve, what it must not decide, and what must be validated before any LangGraph or LangChain dependency is installed.

RIC-STUDIO-046B is documentation-only. It does not install LangGraph, install LangChain, change dependencies, edit `package.json`, implement workflow code, modify current auditor tools, automate Git, change runtime files, alter any `Modelfile`, add UI, add server code, add database code, call GitHub APIs, or modify `.github`.

## Runtime Boundaries

The future LangGraph runtime must be local-first and evidence-first.

Allowed runtime responsibilities:

- Load explicitly provided graph input.
- Call approved local read-only evidence collection when authorized by the workflow input.
- Parse supplied JSON evidence.
- Route workflow state through documented nodes.
- Preserve raw evidence and node findings.
- Call the deterministic auditor as the decision authority for supported gates.
- Produce structured final reports.
- Require human review before consequential actions.

Blocked runtime responsibilities:

- Stage files.
- Commit files.
- Push commits.
- Reset, checkout, clean, or delete files.
- Modify evidence to make it pass.
- Invent missing evidence.
- Treat model text as final authority.
- Bypass `tools/auditor/audit.mjs`.
- Bypass the human gate.
- Call remote APIs unless a later task explicitly authorizes that scope.

## What LangGraph May Orchestrate

LangGraph may orchestrate the order and state movement of local audit steps.

Permitted orchestration:

- Collect Evidence.
- Parse Evidence.
- Scope Audit.
- Validation Audit.
- Risk Classification.
- Deterministic Decision.
- Human Gate.
- Final Report.

The graph may carry a shared state object between these steps. It may route invalid evidence to a blocked decision path. It may attach advisory findings such as missing evidence, out-of-scope files, validation failures, and risk reasons.

LangGraph may coordinate tools, but only tools that are explicitly included in a later implementation task scope.

## What LangGraph Must Not Decide

LangGraph must not independently decide:

- `COMMIT_ALLOWED`.
- `PUSH_ALLOWED`.
- `LOCAL_DONE_CONFIRMED`.
- `REMOTE_DONE_CONFIRMED`.
- Release approval.
- That blocked evidence is acceptable.
- That missing validation can be ignored.
- That an out-of-scope file is acceptable.
- That a human gate can be skipped.

When a deterministic auditor decision and a graph finding disagree, the safer result wins:

- A block remains blocked.
- Human review is required.
- The final report must describe the disagreement.

LangGraph may recommend the next safe review step, but it must not convert a recommendation into an automated Git or release action.

## Deterministic Auditor Authority

`tools/auditor/audit.mjs` remains the deterministic decision authority for existing supported decisions.

Implementation requirements:

- The graph must preserve the auditor input exactly enough for independent review.
- The graph must call or emulate only documented auditor behavior.
- The graph must not weaken `COMMIT_BLOCKED`.
- The graph must not synthesize `COMMIT_ALLOWED` when `audit.mjs` would block.
- The graph must preserve `human_review_required`.
- The graph must preserve `allowed_actions` and `blocked_actions`.

The future implementation may wrap `audit.mjs`, but it must not replace its authority without a separate architecture and implementation task.

## Evidence Source Authority

`tools/auditor/collect-evidence.mjs` remains the current evidence source.

Implementation requirements:

- Evidence collection must remain read-only.
- The graph may call the collector only when the workflow input explicitly requests collection.
- The graph must preserve collector output, including command results and errors.
- The graph must not stage untracked files to make diffs visible.
- The graph must not perform Git writes to improve evidence quality.

Generated evidence is still evidence, not authority.

## Future Graph Input Contract

A future implementation should accept a single JSON input object.

```json
{
  "task_id": "RIC-STUDIO-046B",
  "requested_gate": "commit",
  "repository": {
    "path": ".",
    "branch": "main"
  },
  "evidence": {
    "mode": "collect",
    "file_path": null
  },
  "scope": {
    "allowed_files": [],
    "blocked_files": [],
    "blocked_actions": []
  },
  "validation": {
    "required_commands": [],
    "required_outputs": [],
    "interpretation": null
  },
  "human_gate": {
    "required": true,
    "status": "pending",
    "reviewer": null,
    "notes": ""
  },
  "options": {
    "dry_run": true,
    "write_files": false,
    "allow_network": false
  }
}
```

Rules:

- `task_id` is required.
- `requested_gate` is required.
- `human_gate.required` must default to `true`.
- `options.dry_run` must default to `true`.
- `options.write_files` must default to `false`.
- `options.allow_network` must default to `false`.
- Missing scope or validation evidence must be treated conservatively.

## Future Graph Output Contract

A future implementation should emit a single JSON output object.

```json
{
  "task_id": "RIC-STUDIO-046B",
  "requested_gate": "commit",
  "result": "blocked",
  "decision": {
    "source": "tools/auditor/audit.mjs",
    "value": "COMMIT_BLOCKED",
    "human_review_required": true,
    "allowed_actions": [],
    "blocked_actions": ["commit", "push", "remote_done"],
    "missing_evidence": []
  },
  "risk": {
    "level": "blocked",
    "reasons": []
  },
  "findings": {
    "scope": [],
    "validation": [],
    "evidence": []
  },
  "human_gate": {
    "required": true,
    "status": "pending",
    "notes": ""
  },
  "final_report": {
    "summary": "",
    "next_safe_step": ""
  }
}
```

Rules:

- The output must identify the decision source.
- The output must preserve `human_review_required`.
- The output must preserve blocked actions.
- The output must separate raw evidence from inference.
- The output must not claim that any Git action was performed unless raw evidence proves it.

## Minimal Future File And Folder Structure

A later implementation task may propose a minimal file structure such as:

```text
tools/auditor/langgraph/
  README.md
  graph.mjs
  state-contract.mjs
  nodes/
    collect-evidence.mjs
    parse-evidence.mjs
    scope-audit.mjs
    validation-audit.mjs
    risk-classification.mjs
    decision.mjs
    human-gate.mjs
    final-report.mjs
  fixtures/
    blocked-missing-evidence.json
    blocked-invalid-json.json
    blocked-out-of-scope.json
```

This structure is not authorized for RIC-STUDIO-046B. It is a future implementation reference only.

Future implementation must prefer minimal files, local deterministic behavior, and zero hidden side effects.

## Dependency-Install Prerequisites

Before any later task installs LangGraph, LangChain, or related dependencies, the project must have:

- Explicit approval for dependency installation.
- An approved package manager plan.
- A named list of packages and versions or version ranges.
- A rollback plan for package and lockfile changes.
- A validation plan that runs without network after installation.
- Confirmation that dependency installation does not alter auditor authority.
- Confirmation that dependency installation does not add Git automation.
- Confirmation that no runtime, Ollama, `Modelfile`, UI, server, database, GitHub API, or `.github` change is bundled into the same task unless explicitly approved.

Dependency installation must be a separate implementation task, not part of this contract.

## Validation Criteria Before Implementation

Before implementation starts, a future task must validate:

- Repository is clean and synchronized, or the exact pending state is documented.
- The approved architecture document exists.
- This implementation contract exists.
- The target implementation files are explicitly allowed.
- Dependency changes are either forbidden or separately approved.
- `tools/auditor/audit.mjs` authority is preserved.
- `tools/auditor/collect-evidence.mjs` evidence-source role is preserved.
- Human gate remains mandatory.
- Git mutating commands remain forbidden.

Minimum pre-implementation commands:

```powershell
git status --short --untracked-files=all
git status -sb
git diff --stat
git diff --check
```

## Human Gate Requirements

Human gate is mandatory for:

- Commit decisions.
- Push decisions.
- Release decisions.
- Local DONE decisions.
- Remote DONE decisions.

Human gate rules:

- A graph may present evidence and recommendations.
- A graph may not execute the consequential action.
- Human approval must be recorded separately from automated output.
- Human approval does not override missing evidence.
- Human approval does not authorize actions outside task scope.
- If evidence changes after review, the gate returns to pending.

## Forbidden Automation Boundaries

Forbidden in the future LangGraph auditor unless a later task explicitly authorizes a narrower controlled action:

- `git add`.
- `git commit`.
- `git push`.
- `git reset`.
- `git checkout`.
- `git clean`.
- File deletion.
- Automatic file modification.
- Remote API calls.
- GitHub API calls.
- `.github` workflow changes.
- Dependency installation.
- Runtime changes.
- Ollama changes.
- `Modelfile` changes.
- UI, server, or database changes.
- Release automation.
- Any action that bypasses `audit.mjs`.
- Any action that bypasses human gate.

## DONE Criteria For This Contract

RIC-STUDIO-046B is complete when:

- This implementation contract exists.
- Runtime boundaries are explicit.
- LangGraph orchestration limits are explicit.
- Deterministic auditor authority is preserved.
- Evidence collector role is preserved.
- Future input and output contracts are defined.
- Minimal future file/folder structure is defined.
- Dependency-install prerequisites are defined.
- Validation criteria before implementation are defined.
- Human gate remains mandatory for commit, push, release, Local DONE, and Remote DONE.
- Forbidden automation boundaries are explicit.
- No forbidden files or actions occurred.
- The task stops in REVIEW.
