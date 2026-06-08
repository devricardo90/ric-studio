# Local Auditor Workflow Usage Validation - RIC-STUDIO-064A

## Purpose

Validate that the documented local auditor workflow is usable in a realistic review scenario before future audit-session report changes.

This validation checks that a human or future agent can run the documented validator and session runner commands, read the structured output, and decide whether to continue toward commit review or stop for protocol remediation.

## Repository State Before Validation

Required pre-validation commands were run before implementation.

`git status --short --untracked-files=all`:

```text
[no tracked or untracked changes]
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
292557c210bb0dcfa568dd265073930fc7b939d9
```

`git rev-parse origin/main`:

```text
292557c210bb0dcfa568dd265073930fc7b939d9
```

`git log --oneline -3 --decorate origin/main`:

```text
292557c (HEAD -> main, origin/main) docs: open local auditor workflow validation task
7d548d6 docs: document local auditor validation usage
e0b8f52 docs: open local auditor validation usage task
```

The repository was clean and synchronized at `HEAD == origin/main == 292557c210bb0dcfa568dd265073930fc7b939d9`.

## Commands Executed

```powershell
node tools/auditor/validate-session-contract.mjs
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json
```

Note: the validator command first returned `spawnSync node EPERM` in the sandbox because the validator spawns child Node processes. The same validator command was rerun outside the sandbox and passed. The direct session-runner commands succeeded in the sandbox.

## Validator PASS Excerpt

`node tools/auditor/validate-session-contract.mjs`:

```text
PASS audit session contract validation
```

## Allowed Session Output Excerpt

`node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json`:

```json
{
  "session_status": "completed",
  "audit_metadata": {
    "task_id": "RIC-STUDIO-043A",
    "requested_gate": "commit",
    "evidence_quality": "sufficient"
  },
  "decision": "COMMIT_ALLOWED",
  "result": "allowed",
  "protocol_findings": [],
  "allowed_actions": [
    "commit"
  ],
  "blocked_actions": [
    "push",
    "remote_done"
  ],
  "human_review_required": true,
  "next_step": "Commit only the explicitly scoped files after human approval."
}
```

## Blocked Session Output Excerpt

`node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json`:

```json
{
  "session_status": "completed",
  "audit_metadata": {
    "task_id": "RIC-STUDIO-058A",
    "requested_gate": "commit",
    "evidence_quality": "incomplete"
  },
  "decision": "COMMIT_BLOCKED",
  "result": "blocked",
  "protocol_findings": [
    {
      "code": "blocked_file_violation",
      "severity": "blocker",
      "path": "package.json",
      "evidence_field": "git_status_short",
      "message": "Changed path is listed in blocked_files."
    }
  ],
  "allowed_actions": [],
  "blocked_actions": [
    "commit",
    "push",
    "remote_done"
  ],
  "human_review_required": true,
  "next_step": "Fix missing evidence before re-auditing."
}
```

## Interpretation

`PASS audit session contract validation` means the local validator confirmed the session runner emits the required report fields from the session contract, including `protocol_findings` behavior for allowed and blocked outputs.

`COMMIT_ALLOWED` means the reviewed evidence supports only the commit gate. A human or agent may prepare a scoped commit after human approval, but must not treat this as push or Remote DONE approval. The output keeps `human_review_required: true`, allows `commit`, and blocks `push` and `remote_done`.

`COMMIT_BLOCKED` means the reviewed evidence must stop the commit path. A human or agent must inspect the populated `protocol_findings`, fix the blocker, and rerun validation before any commit attempt. The blocked fixture correctly reports a `blocker` severity finding, allows no actions, and blocks `commit`, `push`, and `remote_done`.

The practical workflow is usable:

- Run the contract validator first to confirm the local report shape is intact.
- Run the session runner on representative allowed and blocked evidence.
- Use `decision`, `protocol_findings`, `allowed_actions`, `blocked_actions`, and `human_review_required` together.
- Continue only when the output explicitly allows the relevant action and human review approves it.
- Stop when the output blocks the action or reports blocker findings.

## Boundaries

No auditor source changes were made.

No validator changes were made.

No evaluator changes were made.

No fixture changes were made.

No README changes were made.

No package, dependency, or lockfile changes were made.

No `node_modules` changes were made.

No runtime, model, or Ollama changes were made.

No CI changes were made.

No app, backend, frontend, database, or deploy changes were made.

No commit or push was performed.

## Conclusion

The documented local auditor validation flow is usable in a realistic review scenario. It provides a clear PASS signal for the report contract, a safe commit-only path for valid evidence, and a clear stop/review path for blocked protocol findings.
