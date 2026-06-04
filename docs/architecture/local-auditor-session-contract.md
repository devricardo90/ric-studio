# End-to-End Local Audit Session Contract

## Purpose

RIC-STUDIO-052A defines the contract for the first useful end-to-end local Auditor session.

The future session will connect explicit operator-provided task and validation evidence with current read-only repository evidence, then invoke the existing deterministic auditor and produce a structured report for mandatory human review.

RIC-STUDIO-052A is documentation-only. It does not implement the session, change auditor code, change package metadata, install dependencies, add LangGraph or LangChain, automate Git, or authorize a delivery action.

## Current Validated Foundation

The current dependency-free Auditor foundation already provides:

- `tools/auditor/collect-evidence.mjs` as the read-only local Git evidence source.
- `tools/auditor/audit.mjs` as the deterministic authority for `COMMIT_BLOCKED` and `COMMIT_ALLOWED`.
- `tools/auditor/smoke-workflow.mjs` as a read-only graph-shaped workflow around supplied evidence files.
- `tools/auditor/package.json` with validated `smoke:read-only` and `smoke:invalid-json` scripts.
- Fixtures and validation evidence for positive, invalid, missing, malformed, and generated repository evidence.
- Mandatory human review and explicit blocked Git automation boundaries.

The current gap is evidence assembly. Repository evidence alone is insufficient for a complete commit decision because the deterministic authority also requires explicit task scope, per-file evidence, and validation evidence.

## Session Objective

The future local session must provide one repeatable operator workflow that:

1. Accepts explicit task scope and validation evidence from the operator.
2. Collects current repository evidence through `tools/auditor/collect-evidence.mjs`.
3. Verifies that collected evidence matches the requested repository and task context.
4. Assembles a complete audit evidence object without inventing or silently repairing evidence.
5. Invokes `tools/auditor/audit.mjs` as the deterministic decision authority.
6. Produces a structured read-only session report.
7. Stops at a mandatory human gate without performing the requested Git action.

## Required Operator Inputs

The operator must explicitly provide:

- `task_id`.
- `requested_gate`.
- `expected_state_before_gate`.
- Repository path.
- Allowed files.
- Blocked files.
- Blocked actions.
- Implementation summary.
- Validation commands.
- Raw validation outputs.
- Validation interpretation.
- Human review context or notes, when available.

Rules:

- `task_id` and `requested_gate` are required.
- The first implementation target is the `commit` gate only.
- `expected_state_before_gate` must be `REVIEW` for a commit request.
- Allowed files, blocked files, and blocked actions must be explicit arrays.
- Validation interpretation must not replace raw validation outputs.
- Missing required operator input blocks the session before any permissive decision.
- Operator claims must not override contradictory repository evidence.

## Proposed Session Input Contract

A later implementation should accept one explicit session input object:

```json
{
  "task_id": "RIC-STUDIO-XXXX",
  "requested_gate": "commit",
  "expected_state_before_gate": "REVIEW",
  "repository": {
    "path": ".",
    "expected_branch": "main"
  },
  "scope": {
    "allowed_files": [],
    "blocked_files": [],
    "blocked_actions": ["push", "remote_done"]
  },
  "implementation_summary": "",
  "validation": {
    "commands": [],
    "outputs": {},
    "interpretation": {
      "overall": "pass",
      "notes": []
    }
  },
  "human_review": {
    "required": true,
    "status": "pending",
    "notes": ""
  },
  "options": {
    "collect_repository_evidence": true,
    "include_allowed_file_diffs": true,
    "include_untracked_file_contents": false,
    "write_files": false,
    "allow_network": false
  }
}
```

Safe defaults:

- `human_review.required`: `true`.
- `human_review.status`: `pending`.
- `collect_repository_evidence`: `true`.
- `include_allowed_file_diffs`: `true`.
- `include_untracked_file_contents`: `false`.
- `write_files`: `false`.
- `allow_network`: `false`.

## Evidence Assembly Contract

The future session must assemble evidence in explicit layers.

### Operator Evidence

Operator evidence contains:

- Task identity and expected lifecycle state.
- Allowed and blocked scope.
- Implementation summary.
- Validation commands, raw outputs, and interpretation.
- Human review context.

Operator evidence is required context, not repository truth.

### Repository Evidence

Repository evidence must come from `tools/auditor/collect-evidence.mjs` or a separately approved equivalent that preserves its read-only boundaries.

Repository evidence includes:

- `git status --short --untracked-files=all`.
- `git status -sb`.
- `git rev-parse HEAD`.
- `git rev-parse origin/main`.
- `git diff --stat`.
- `git diff --check`.
- `git diff --name-only`.
- Collector command exit metadata and errors.

Repository evidence is raw evidence, not decision authority.

### Per-File Evidence

Per-file evidence must cover every changed path proposed for the requested gate.

Rules:

- Only explicitly allowed paths may be inspected for full diff or content evidence.
- Tracked changed files require complete raw diffs.
- Untracked files require explicit operator approval before content is read.
- Directory-wide or repository-wide content capture is forbidden by default.
- Binary files must be reported as binary and must not be decoded as text.
- Missing per-file evidence blocks `COMMIT_ALLOWED`.
- A changed path outside `allowed_files` blocks `COMMIT_ALLOWED`.

### Validation Evidence

Validation evidence must preserve:

- Exact command text.
- Raw stdout.
- Raw stderr.
- Exit code.
- Operator interpretation.
- Warnings and caveats.

Rules:

- Missing raw output blocks a pass interpretation.
- A zero exit code does not override failure text or contradictory output.
- The future session must not run arbitrary validation commands unless a later implementation task explicitly authorizes controlled command execution.
- The first implementation should ingest operator-provided validation results rather than execute them.

## Untracked File Safety

Untracked files are a high-risk evidence source because they may contain secrets, generated artifacts, or unrelated local data.

Rules:

- Untracked paths must always appear in the session findings.
- Untracked paths outside `allowed_files` block the commit gate.
- Reading untracked file contents requires explicit opt-in for each exact path.
- The default is path-only evidence for untracked files.
- Secret-like files, environment files, credential files, dependency directories, and generated artifacts must not be read automatically.
- If required untracked content evidence is withheld, the session must report missing evidence and block.
- The session must never stage an untracked file to obtain a Git diff.

## Collector Integration Boundary

`tools/auditor/collect-evidence.mjs` remains the repository evidence source.

The future session may:

- Invoke the collector with explicit `task_id` and `requested_gate`.
- Capture its stdout in memory.
- Parse and preserve the complete collector JSON.
- Report collector command errors without repairing or suppressing them.

The future session must not:

- Modify the collector output.
- Treat collector output as a gate decision.
- Add Git mutating commands to the collector.
- Redirect collector output to a repository file by default.
- Continue to a permissive result when required collector commands fail.

## Deterministic Authority Integration Boundary

`tools/auditor/audit.mjs` remains the deterministic decision authority.

The approved integration interface is an exported deterministic evaluator that preserves the current CLI behavior.

Why this interface is preferred:

- It avoids temporary repository files.
- It avoids mutating global `process.argv` and capturing global stdout.
- It supports in-memory evidence assembly.
- It can preserve one deterministic implementation for both CLI and session usage.

RIC-STUDIO-053A is the separately approved task that exposes and validates this evaluator. The file-path CLI and exported evaluator must remain two interfaces to the same deterministic authority.

The approved evaluator interface is:

```javascript
evaluateEvidence(evidence)
```

Interface rules:

- `evidence` is an in-memory JSON-compatible evidence object.
- The function returns the structured deterministic decision object.
- Importing the module normally must not execute the CLI or write to stdout.
- A missing, null, array, or otherwise non-object evidence value returns controlled `COMMIT_BLOCKED`.
- The evaluator must preserve the same decision logic, blocked actions, and human review requirement as the CLI.

Any later authority-interface refactor must prove:

- Existing CLI outputs remain unchanged for current fixtures.
- `COMMIT_ALLOWED` is not weakened.
- All negative cases remain blocked.
- Human review and blocked actions remain preserved.
- No dependency or Git automation is introduced.

## Read-Only Session Output

The future session should emit one structured JSON report to stdout:

```json
{
  "session": "LOCAL_AUDIT_SESSION",
  "session_version": 1,
  "task_id": "RIC-STUDIO-XXXX",
  "requested_gate": "commit",
  "read_only": true,
  "evidence": {
    "operator": {},
    "repository": {},
    "file_diffs": {},
    "validation": {}
  },
  "findings": {
    "scope": [],
    "repository": [],
    "validation": [],
    "untracked_files": []
  },
  "decision": {
    "source": "tools/auditor/audit.mjs",
    "value": "COMMIT_BLOCKED",
    "human_review_required": true,
    "allowed_actions": [],
    "blocked_actions": ["commit", "push", "remote_done"],
    "missing_evidence": []
  },
  "human_gate": {
    "required": true,
    "status": "pending",
    "notes": ""
  },
  "next_safe_step": ""
}
```

Output rules:

- Stdout is the default output target.
- No report file is written by default.
- The report must distinguish raw evidence from findings and decisions.
- The report must identify `tools/auditor/audit.mjs` as decision source.
- The report must preserve the deterministic decision's blocked actions.
- The report must not claim that commit, push, Local DONE, or Remote DONE occurred.
- Errors must produce a controlled blocked report when possible.

## Human Gate Contract

Human review remains mandatory.

Rules:

- The session always returns `human_gate.required: true`.
- Default human gate status is `pending`.
- `COMMIT_ALLOWED` is a recommendation for separate human authorization, not execution authority.
- Human approval does not override missing, contradictory, stale, or out-of-scope evidence.
- Evidence changes after review invalidate the previous gate state.
- The session must not stage, commit, push, or advance lifecycle state after approval.

## Minimum Future Validation Scenarios

A later implementation task must validate at least:

1. Complete allowed fixture preserves `COMMIT_ALLOWED`.
2. Invalid session input returns a controlled blocked report.
3. Missing required operator input returns blocked.
4. Generated repository-only evidence returns blocked for missing task or validation evidence.
5. Changed path outside `allowed_files` returns blocked.
6. Blocked path present in repository evidence returns blocked.
7. Missing tracked-file diff returns blocked.
8. Untracked allowed file without explicit content opt-in returns blocked when content evidence is required.
9. Untracked out-of-scope file returns blocked without reading its content.
10. Failed or missing validation evidence returns blocked.
11. Collector command failure remains visible and blocks a permissive decision.
12. Deterministic authority output and blocked actions are preserved.
13. Human gate remains pending by default.
14. No path writes files by default.
15. No path runs Git mutating commands.
16. Existing auditor and package smoke validations remain passing.

## Proposed Later Implementation Boundary

A later implementation task may propose only narrowly scoped files such as:

```text
tools/auditor/session.mjs
tools/auditor/fixtures/session/
docs/validation/local-auditor-session-smoke.md
```

Any change to these existing files requires separate explicit approval:

- `tools/auditor/audit.mjs`.
- `tools/auditor/collect-evidence.mjs`.
- `tools/auditor/smoke-workflow.mjs`.
- `tools/auditor/package.json`.

The first implementation should remain dependency-free. LangGraph/LangChain installation remains postponed until the dependency-free session contract and implementation are validated.

## Forbidden Future Session Behavior

Unless a later task explicitly approves a narrower action, the future session must not:

- Run `git add`, `git commit`, `git push`, `git reset`, `git checkout`, or `git clean`.
- Delete or modify repository files.
- Write temporary evidence or report files into the repository by default.
- Read untracked file contents without exact-path opt-in.
- Execute arbitrary operator-provided validation commands.
- Invent missing scope, validation, diff, or repository evidence.
- Override `COMMIT_BLOCKED`.
- Bypass `tools/auditor/audit.mjs`.
- Bypass the human gate.
- Call remote or GitHub APIs.
- Install dependencies.
- Modify runtime, Ollama, `Modelfile`, UI, server, database, deploy, or `.github` files.

## Risks And Blockers

- Repository evidence cannot prove task scope or validation success by itself.
- Operator-provided evidence may be stale, incomplete, or contradictory.
- Full untracked-file content collection may expose secrets.
- Per-file diff collection must not broaden beyond explicitly allowed paths.
- The current file-path-based authority interface is awkward for in-memory session assembly.
- Refactoring the authority interface could accidentally change deterministic behavior.
- Fixture success does not prove a real current-worktree positive decision.
- LangGraph would add complexity before the evidence-assembly contract is validated.

## DONE Criteria For Later Implementation

A later dependency-free implementation is DONE only when:

- It follows this input, evidence assembly, output, and human gate contract or documents a safer equivalent.
- It collects repository evidence through the approved read-only source.
- It preserves `tools/auditor/audit.mjs` as deterministic authority.
- It handles allowed, blocked, tracked, and untracked paths conservatively.
- It preserves raw validation evidence.
- It writes no files by default.
- It runs no Git mutating commands.
- It validates all minimum scenarios.
- Existing auditor smoke behavior remains unchanged.
- No dependency, LangGraph, LangChain, runtime, Ollama, `Modelfile`, UI, server, database, deploy, `.github`, or Git automation change is bundled into the task.
- It stops in REVIEW before commit or push.

## RIC-STUDIO-052A Boundaries

RIC-STUDIO-052A only creates this contract, corrects current Auditor documentation, reconciles operational state, and stops in REVIEW.

It does not implement the session, refactor the authority interface, change package metadata, install dependencies, add LangGraph or LangChain, automate Git, commit, or push.
