# LangGraph Auditor Workflow MVP

## Purpose

This document defines the MVP architecture for a future LangGraph-based auditor workflow.

The purpose is to define workflow shape, state movement, contracts, and authority boundaries before any LangGraph installation or implementation.

RIC-STUDIO-046A is documentation-only. It does not install LangGraph or LangChain, change package files, implement code, alter the current auditor, automate Git, add UI, call GitHub APIs, change runtime files, or modify any `Modelfile`.

## Current Foundation

RIC Studio currently has a local auditor foundation:

- `tools/auditor/collect-evidence.mjs` collects read-only local Git evidence and emits a JSON evidence package to stdout.
- `tools/auditor/audit.mjs` reads local JSON evidence files and emits structured deterministic decisions.
- Evidence files can be read as UTF-8 or UTF-16LE with BOM, which supports Windows PowerShell redirection.
- The current auditor can return `COMMIT_BLOCKED` or `COMMIT_ALLOWED` only under its existing deterministic evidence rules.
- The collector is not an authority. It does not authorize commit, push, Local DONE, or Remote DONE.

Future LangGraph integration must treat these tools as existing deterministic components, not replace them with uncontrolled model reasoning.

## MVP Goal

The MVP workflow should orchestrate audit steps around existing local evidence and deterministic decisions.

The future graph may coordinate node order, normalize intermediate state, and prepare human-readable reports. It must not gain uncontrolled authority to stage, commit, push, delete files, call GitHub APIs, or bypass human review.

## Workflow Nodes

### Collect Evidence

Purpose:

- Acquire the current local evidence package.
- Use `tools/auditor/collect-evidence.mjs` as the current evidence source.

Input:

- `task_id`.
- `requested_gate`.
- Repository path or working directory context.

Output:

- Raw local evidence JSON.
- Collection metadata.
- Command exit metadata for read-only Git commands.

Rules:

- Read-only only.
- No file writes unless a human explicitly redirects output or provides a file path in a future implementation.
- No Git mutating commands.

### Parse Evidence

Purpose:

- Validate evidence shape and normalize fields for later nodes.
- Preserve raw evidence.

Input:

- Raw evidence JSON.

Output:

- Parsed evidence object.
- Normalized changed file list.
- Parse findings.

Rules:

- Parsing must not infer missing evidence as present.
- Encoding support may include UTF-8 and UTF-16LE with BOM, matching `tools/auditor/audit.mjs`.

### Scope Audit

Purpose:

- Compare changed files and requested gate against task scope.
- Identify out-of-scope files or blocked categories.

Input:

- Parsed evidence.
- Task scope contract.
- Allowed files.
- Blocked files.
- Blocked actions.

Output:

- Scope status: `pass`, `fail`, or `unknown`.
- Scope findings.
- Out-of-scope path list.

Rules:

- Unknown scope blocks authority.
- Any blocked file or action blocks commit authorization.
- Untracked files require explicit audit evidence before any future commit allowance.

### Validation Audit

Purpose:

- Evaluate task-required validation evidence.
- Confirm validation commands and outputs are present and interpreted conservatively.

Input:

- Parsed evidence.
- Validation commands.
- Validation outputs.
- Validation interpretation.

Output:

- Validation status: `pass`, `fail`, or `unknown`.
- Missing validation evidence list.
- Validation findings.

Rules:

- Missing validation output is not a pass.
- Failed validation blocks authority.
- Warnings must be preserved for human review.

### Risk Classification

Purpose:

- Classify audit risk before decision.
- Explain why a request is low, medium, high, or blocked.

Input:

- Scope findings.
- Validation findings.
- Git evidence.
- Requested gate.

Output:

- Risk level: `low`, `medium`, `high`, or `blocked`.
- Risk reasons.
- Required human review items.

Rules:

- Dirty or unaudited scope increases risk.
- Missing evidence is at least high risk and normally blocked for commit gates.
- Risk classification is advisory. It is not final authority.

### Decision

Purpose:

- Produce the structured gate decision.
- Use `tools/auditor/audit.mjs` as the current deterministic decision authority.

Input:

- Evidence file or evidence object.
- Parsed findings.
- Scope audit output.
- Validation audit output.
- Risk classification.

Output:

- Decision object.
- Allowed actions.
- Blocked actions.
- Missing evidence.
- Next step.

Rules:

- The deterministic auditor remains the authority for existing local decisions.
- LangGraph orchestration must not invent `COMMIT_ALLOWED`.
- LangGraph must not override `COMMIT_BLOCKED` with a permissive decision.
- If graph findings and deterministic auditor output conflict, the safer blocked decision wins until human review resolves it.

### Human Gate

Purpose:

- Preserve human control before any consequential action.
- Require review of decision output and evidence.

Input:

- Decision object.
- Final findings.
- Risk classification.
- Raw evidence references.

Output:

- Human review status: `pending`, `approved`, `rejected`, or `needs_more_evidence`.
- Human notes.

Rules:

- Human approval is required before commit, push, Local DONE, Remote DONE, or future automation.
- The graph must not perform Git actions after approval. Approval only informs the next human-controlled step unless a separate future task explicitly implements controlled action handling.
- Human Gate remains mandatory even for `COMMIT_ALLOWED`.

### Final Report

Purpose:

- Produce the final human-readable and machine-readable audit summary.

Input:

- Decision object.
- Human Gate status.
- Risk classification.
- Scope findings.
- Validation findings.
- Raw evidence references.

Output:

- Final report JSON.
- Human-readable summary.
- Blockers and next safe step.

Rules:

- The report must distinguish evidence from inference.
- The report must not claim completed actions that were not performed.
- The report must keep blocked actions explicit.

## State Transitions

The MVP graph state moves in this order:

```text
Collect Evidence
  -> Parse Evidence
  -> Scope Audit
  -> Validation Audit
  -> Risk Classification
  -> Decision
  -> Human Gate
  -> Final Report
```

Blocked or invalid evidence may short-circuit to `Decision` and then `Final Report` with `human_review_required: true`.

Possible transition outcomes:

- `Collect Evidence` to `Parse Evidence` when evidence is available.
- `Collect Evidence` to `Final Report` when evidence collection fails and no parseable evidence exists.
- `Parse Evidence` to `Scope Audit` when evidence is valid JSON object.
- `Parse Evidence` to `Decision` when evidence is invalid or not an object.
- `Scope Audit` to `Validation Audit` when scope can be evaluated.
- `Scope Audit` to `Decision` when scope is failed or unknown.
- `Validation Audit` to `Risk Classification` after validation findings are recorded.
- `Risk Classification` to `Decision` after risk level is assigned.
- `Decision` to `Human Gate` for every consequential gate request.
- `Human Gate` to `Final Report` after human status is recorded or remains pending.

## JSON Contracts

### Workflow Input

```json
{
  "task_id": "RIC-STUDIO-046A",
  "requested_gate": "commit",
  "repository_path": ".",
  "task_scope": {
    "allowed_files": [],
    "blocked_files": [],
    "blocked_actions": []
  },
  "validation_requirements": {
    "commands": [],
    "required_outputs": []
  },
  "human_context": {
    "operator": null,
    "notes": ""
  }
}
```

### Evidence Package

The current collector output is the baseline evidence package:

```json
{
  "task_id": "RIC-STUDIO-045A",
  "requested_gate": "commit",
  "collected_at": "2026-06-02T00:00:00.000Z",
  "repository_state": {},
  "git_status_short": "",
  "git_status_sb": "",
  "head": "",
  "origin_main": "",
  "diff_stat": "",
  "diff_check": "",
  "changed_files": [],
  "evidence_source": {},
  "human_review_required": true,
  "blocked_actions": [],
  "allowed_actions": [],
  "summary": ""
}
```

### Node Finding

```json
{
  "node": "Scope Audit",
  "status": "pass",
  "findings": [],
  "missing_evidence": [],
  "blocked_actions": []
}
```

### Workflow State

```json
{
  "task_id": "RIC-STUDIO-046A",
  "requested_gate": "commit",
  "evidence": {},
  "scope_audit": {},
  "validation_audit": {},
  "risk_classification": {
    "level": "blocked",
    "reasons": []
  },
  "decision": {},
  "human_gate": {
    "status": "pending",
    "human_review_required": true,
    "notes": ""
  }
}
```

### Final Report

```json
{
  "task_id": "RIC-STUDIO-046A",
  "requested_gate": "commit",
  "decision": "COMMIT_BLOCKED",
  "risk_level": "blocked",
  "human_review_required": true,
  "allowed_actions": [],
  "blocked_actions": ["commit", "push", "remote_done"],
  "missing_evidence": [],
  "summary": "",
  "next_safe_step": ""
}
```

## Human-In-The-Loop Boundaries

Human review is required at minimum when:

- A commit, push, Local DONE, Remote DONE, or any consequential state transition is requested.
- Evidence is missing, contradictory, stale, or out of scope.
- Risk classification is `medium`, `high`, or `blocked`.
- The deterministic auditor and graph findings disagree.
- A future implementation proposes any action that writes files, mutates Git state, or talks to external systems.

Human review may approve a recommendation, but approval is not the same as automated execution.

## Read-Only Guarantees

The MVP workflow must remain read-only unless a later task explicitly changes scope.

Read-only guarantees:

- Evidence collection uses read-only local Git commands.
- Audit nodes inspect supplied evidence and do not mutate repository state.
- Decision nodes emit JSON only.
- Final Report emits report content only.
- Human Gate records review state only.

Allowed read-only Git evidence commands may include:

- `git status --short --untracked-files=all`
- `git status -sb`
- `git rev-parse HEAD`
- `git rev-parse origin/main`
- `git diff --stat`
- `git diff --check`
- `git diff --name-only`

## Forbidden Automation

Forbidden in this MVP:

- `git add`
- `git commit`
- `git push`
- `git reset`
- `git checkout`
- `git clean`
- File deletion.
- Automatic file modification.
- Commit automation.
- Push automation.
- GitHub API integration.
- `.github` workflow changes.
- UI.
- Server.
- Database.
- LangGraph install.
- LangChain install.
- Dependency changes.
- `package.json` changes.
- Ollama changes.
- `Modelfile` changes.
- Runtime changes.
- Any action that claims Remote DONE without post-push evidence.
- Any new READY task after task completion.

## LangGraph Fit

LangGraph may fit later as orchestration only.

Appropriate future LangGraph responsibilities:

- Coordinate node order.
- Carry shared workflow state.
- Route blocked cases to the correct report path.
- Keep raw evidence and findings available to later nodes.
- Prepare final structured reports.

Inappropriate responsibilities:

- Inventing missing evidence.
- Overriding deterministic auditor blocks.
- Performing Git actions.
- Calling GitHub APIs.
- Installing dependencies at runtime.
- Treating model output as authority.
- Removing the human gate.

The deterministic auditor remains the current decision authority. LangGraph may become a workflow coordinator around that authority, not an uncontrolled authority itself.

## Future MVP Validation Strategy

A future implementation task should validate the graph with local fixtures and generated evidence only.

Minimum validation scenarios:

- Missing evidence path returns blocked report.
- Invalid JSON returns blocked report.
- Generated repository-only evidence returns blocked report for real missing evidence.
- Complete commit-allow fixture preserves existing `COMMIT_ALLOWED` behavior.
- Out-of-scope changed file returns blocked report.
- Human Gate remains pending unless explicit human review input is supplied.
- No graph path runs Git mutating commands.
- No graph path writes files by default.

Required validation evidence:

- `git status --short --untracked-files=all`.
- `git status -sb`.
- `git diff --stat`.
- `git diff --check`.
- CLI output for graph smoke commands, if implemented later.
- Confirmation that `package.json`, runtime files, `.github`, and `Modelfile` files were not changed unless explicitly authorized by a later task.

## DONE Criteria For Future Implementation

A future LangGraph implementation may only be considered MVP-complete when:

- It follows this node order or documents a safer equivalent.
- It preserves current auditor authority.
- It preserves human review.
- It remains read-only by default.
- It does not add Git automation.
- It validates all minimum scenarios.
- It reports blocked actions clearly.
- It produces machine-readable and human-readable final reports.
