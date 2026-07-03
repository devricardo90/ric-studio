# Jira Dry-Run Tool

`dry-run.mjs` is a dependency-free local interface for planned Jira actions.

It prints the Jira action that would be attempted by a future guarded automation layer, but it never calls Jira API, never calls Jira CLI, never reads credentials, never stores tokens, and never mutates real Jira issues.

The tool implements the RIC-STUDIO-075A dry-run boundary from `docs/architecture/jira-cli-automation-contract.md`.

## Usage

Create issue dry-run:

```powershell
node tools/jira/dry-run.mjs --action create_issue --summary "Define reporting guard"
```

Transition dry-run:

```powershell
node tools/jira/dry-run.mjs --action transition_issue --issue RIC-1 --to READY
```

Add comment dry-run:

```powershell
node tools/jira/dry-run.mjs --action add_comment --issue RIC-1 --comment "Evidence reviewed locally."
```

Attach evidence summary dry-run:

```powershell
node tools/jira/dry-run.mjs --action attach_evidence_summary --issue RIC-1 --evidence-summary "Validation passed locally."
```

Sprint Automation Registry task payload dry-run:

```powershell
node tools/jira/dry-run.mjs --action registry_task_plan --registry docs/ops/sprint-task-registry.json --project DayBudget --task-key WEB-027A
```

The registry task plan generates reviewable `MANUAL_DRY_RUN` payloads for:

- `create_issue`
- `link_existing_issue`
- `add_evidence_comment`
- `transition_plan`

It reads the local Sprint Automation Registry task, prints deterministic JSON, reports missing Jira config with placeholders, includes an idempotency marker, and confirms `NO_WRITE`.

Optional Jira config flags are intentionally explicit:

- `--jira-project-key`
- `--issue-type`
- `--jira-status-ready`
- `--jira-status-in-progress`
- `--jira-status-review`
- `--jira-status-done`
- `--jira-transition-ready`
- `--jira-transition-in-progress`
- `--jira-transition-review`
- `--jira-transition-done`

If these values are missing, the output remains a blocked/manual payload. The tool must not guess Jira project keys, issue types, status names, or transition ids.

Jira sync config contract validation:

```powershell
node tools/jira/validate-config.mjs --config docs/config/jira-sync-config.sample.json
```

`validate-config.mjs` is dependency-free and network-free. It validates the non-secret config contract from `docs/architecture/jira-sync-config-contract.md`, reports missing or placeholder Jira project keys, issue types, status mappings, and transition mappings, and keeps real sync blocked while returning a valid `MANUAL_DRY_RUN` contract result.

## Safety

The tool always reports:

- `jira_write_performed: false`
- `jira_api_called: false`
- `jira_cli_called: false`
- `network_call_performed: false`
- `credentials_required: false`
- `token_created: false`
- `token_stored: false`

DONE transitions are blocked because DONE requires Ricardo final validation.

For registry task plans, DONE remains blocked unless owner validation is explicitly present in the input.

## Not Supported

This tool does not:

- Call Jira API.
- Call Jira CLI.
- Create real Jira issues.
- Move real Jira issues.
- Add real Jira comments.
- Store credentials.
- Create tokens.
- Automate DONE.
- Bypass Commit Gate or Push Gate.

## Guarded Real Write MVP

`guarded-write.mjs` is the RIC-STUDIO-077A guarded write MVP.

Dry-run remains the default. Without `--real-write`, the tool must not call Jira API, must not call Jira CLI, must not perform a network call, and must not mutate Jira.

Dry-run:

```powershell
node tools/jira/guarded-write.mjs --action add_comment --issue RIC-1 --comment "Smoke test" --dry-run
```

Guarded evidence comment dry-run for an existing Jira issue:

```powershell
node tools/jira/guarded-write.mjs --action add_evidence_comment --issue RIC-1 --project "RIC Studio" --sprint "RIC-STUDIO" --task-key RIC-STUDIO-083D --local-status REVIEW --protocol-level LEAN_LEVEL_2 --validation-summary "Validation pending" --dry-run
```

The evidence comment flow defaults to `MANUAL_DRY_RUN` / `NO_WRITE`. It validates Jira issue key shape, checks the issue project against the non-secret config allowlist, builds an evidence comment with an idempotency marker, and reports duplicate-comment risk because this MVP does not read existing Jira comments.

Guarded real write:

```powershell
node tools/jira/guarded-write.mjs --action add_comment --issue RIC-1 --comment "RIC-STUDIO-077A guarded write smoke." --real-write
```

Real write mode is limited to `add_comment` on the explicitly provided issue key. For `add_evidence_comment`, real write remains blocked unless config mode is `GUARDED_COMMENT_ONLY`, the issue project is allowlisted, owner approval is explicit, duplicate-comment risk is explicitly accepted, required environment variables are present, and the generated comment passes safety checks.

Required environment variables for real write mode:

- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

If any required variable is missing, the result is `BLOCKED` and no Jira write is attempted.

The tool must not create tokens, store tokens, print tokens, print an Authorization header, read `.env` files, call Jira CLI, automate DONE, create issues, transition issues, attach files, delete data, edit workflows, edit project configuration, or run bulk operations.
