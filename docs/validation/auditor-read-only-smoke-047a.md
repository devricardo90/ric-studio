# RIC-STUDIO-047A - Auditor Read-Only Smoke Workflow

## Result

State: REVIEW.

RIC-STUDIO-047A implemented a dependency-free local Node.js smoke workflow at `tools/auditor/smoke-workflow.mjs`.

The workflow mirrors the future graph-style shape:

1. load evidence
2. parse evidence
3. run or preserve deterministic auditor authority
4. format a smoke report

The deterministic authority remains `tools/auditor/audit.mjs`. The smoke workflow executes the existing CLI-shaped authority module with a temporary `process.argv` and stdout capture shim because `audit.mjs` currently reads `process.argv` at module scope. The workflow does not reimplement the auditor decision logic.

## Boundary Confirmation

- No LangGraph install.
- No LangGraph import.
- No LangChain install.
- No dependency install.
- No `package.json` or lockfile created.
- No change to `tools/auditor/audit.mjs`.
- No change to `tools/auditor/collect-evidence.mjs`.
- No `.github` change.
- No runtime, Ollama, or `Modelfile` change.
- No UI, server, database, deploy, or Git automation change.
- No staging, commit, or push.

The workflow output states that human review remains mandatory and that the smoke workflow does not authorize commit, push, release, Local DONE, or Remote DONE.

## Validation Commands

### Positive Evidence Smoke

Command:

```powershell
node tools/auditor/smoke-workflow.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json
```

Observed result:

- Exit code: 0.
- `workflow`: `AUDITOR_READ_ONLY_SMOKE_WORKFLOW`.
- `read_only`: `true`.
- `human_gate_required`: `true`.
- `workflow_result`: `SMOKE_REPORT_ONLY`.
- `deterministic_authority.path`: `tools/auditor/audit.mjs`.
- `deterministic_auditor_authority.status`: `pass`.
- Authority decision: `COMMIT_ALLOWED`.
- Workflow blocked actions include `git_stage`, `git_commit`, `git_push`, `release`, `local_done`, and `remote_done`.
- Workflow does not decide `commit`, `push`, `release`, `Local DONE`, or `Remote DONE`.

### Invalid JSON Smoke

Command:

```powershell
node tools/auditor/smoke-workflow.mjs --evidence tools/auditor/fixtures/invalid-json.json
```

Observed result:

- Exit code: 0.
- `load_evidence.status`: `pass`.
- `parse_evidence.status`: `blocked`.
- `deterministic_auditor_authority.status`: `pass`.
- Authority decision: `COMMIT_BLOCKED`.
- `missing_evidence`: `valid_json`.
- `human_gate_required`: `true`.
- `workflow_result`: `SMOKE_REPORT_ONLY`.

### Repository Scope Validation

Commands required for final validation:

```powershell
git status --short --untracked-files=all
git status -sb
git diff --stat
git diff --check
```

These commands were run after implementation and documentation updates. Final output is retained in the execution transcript and summarized in the task closeout.

## Recommendation

RIC-STUDIO-047A is ready for human REVIEW.

Recommendation: commit only the scoped allowed files after human approval if final `git diff --check` remains clean and no forbidden files appear in `git status`.
