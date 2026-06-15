# RIC-STUDIO-068A - Local Operator Visibility Baseline

## Purpose

Validate the smallest owner-visible local run path for RIC Studio using the existing local auditor commands.

RIC Studio is currently a local protocol and tooling repository, not a deployed web app. The current runnable surface is the dependency-free local auditor workflow under `tools/auditor/`.

## Clean Baseline Before Execution

`git status --short --untracked-files=all`:

```text
[no file entries]
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

`git status -sb`:

```text
## main...origin/main
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

`git rev-parse HEAD`:

```text
91581b9bd9c7b3219d2754f71233aaecbd7f5b27
```

`git rev-parse origin/main`:

```text
91581b9bd9c7b3219d2754f71233aaecbd7f5b27
```

The repository was clean and synchronized at `HEAD == origin/main == 91581b9bd9c7b3219d2754f71233aaecbd7f5b27`.

## Commands Executed

```powershell
cmd /c npm --prefix tools/auditor run smoke:read-only
cmd /c npm --prefix tools/auditor run smoke:invalid-json
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json
```

## Results

| Command | Result | Relevant output summary |
| --- | --- | --- |
| `cmd /c npm --prefix tools/auditor run smoke:read-only` | PASS | Printed `AUDITOR_READ_ONLY_SMOKE_WORKFLOW`, `dependency_free: true`, `workflow_result: "SMOKE_REPORT_ONLY"`, `decision: "COMMIT_ALLOWED"`, `human_gate_required: true`, and blocked `git_commit`, `git_push`, `deploy`, `local_done`, and `remote_done` at the workflow level. |
| `cmd /c npm --prefix tools/auditor run smoke:invalid-json` | PASS | Printed `AUDITOR_READ_ONLY_SMOKE_WORKFLOW`, blocked JSON parsing with the parse error, and returned deterministic authority decision `COMMIT_BLOCKED` with missing evidence `valid_json`. |
| `node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json` | PASS | Printed a completed audit session with `decision: "COMMIT_ALLOWED"`, `result: "allowed"`, empty `protocol_findings`, `allowed_actions: ["commit"]`, blocked `push` and `remote_done`, and `human_review_required: true`. |
| `node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json` | PASS | Printed a completed audit session with `decision: "COMMIT_BLOCKED"`, `result: "blocked"`, a `blocked_file_violation` protocol finding for `package.json`, no allowed actions, and blocked `commit`, `push`, and `remote_done`. |

## Allowed Path

The allowed visibility path is:

```powershell
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json
```

It shows concrete structured output with `COMMIT_ALLOWED`, but still requires human review and blocks push and Remote DONE.

## Blocked Path

The blocked visibility path is:

```powershell
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json
```

It shows concrete structured output with `COMMIT_BLOCKED`, a blocker-level `protocol_findings` entry, no allowed actions, and blocked commit, push, and Remote DONE.

The invalid JSON smoke command also confirms a blocked path for malformed evidence.

## Deploy Review

Deploy is premature. The repository does not currently contain a web app, product UI, server, database, hosting configuration, or deploy target. The owner-visible baseline is therefore the local auditor CLI/tooling workflow, not a hosted app.

## Boundaries Confirmed

- No dependencies were added.
- No root `package.json` was created.
- No lockfiles were created or changed.
- No runtime, Ollama, or model files were changed.
- No prompts or Modelfiles were changed.
- No evaluator logic was changed.
- No fixtures were changed.
- No UI, app scaffold, deploy setup, CI, or `.github` files were added.
- No Git automation was added.
- No commit or push was performed.

## Conclusion

RIC Studio now has a documented local operator visibility baseline. The owner can run existing local auditor commands and see structured report-only, allowed, and blocked JSON output before any deeper workflow automation, UI, or deploy work is considered.
