# Jira Guarded Evidence Comment Validation - RIC-STUDIO-083D

## Scope

RIC-STUDIO-083D adds a guarded Jira evidence comment flow for existing Jira issues.

The flow prepares and validates an evidence comment for `add_comment` only. It does not create Jira issues, transition Jira issues, overwrite descriptions, edit metadata, perform bulk updates, or implement full real Jira sync.

Default mode remains `MANUAL_DRY_RUN` / `NO_WRITE`.

## Files

Changed:

- `tools/jira/guarded-write.mjs`
- `tools/jira/README.md`
- `docs/validation/jira-guarded-comment-083d.md`

Not changed:

- DayBudget files
- package files
- lockfiles
- Docker files
- auth files
- database files
- migration files
- environment files

## Initial Git Status

Command:

```powershell
git status -sb
```

Observed:

```text
## main...origin/main
```

Git also printed local permission warnings for `C:\Users\ricardodev/.config/git/ignore`.

## Existing Dry-Run Compatibility

Command:

```powershell
node tools/jira/dry-run.mjs --action registry_task_plan --registry docs/ops/sprint-task-registry.json --project DayBudget --task-key WEB-027A
```

Observed:

- `mode: MANUAL_DRY_RUN`
- `result: MANUAL_DRY_RUN`
- `no_write_confirmation` includes `NO_WRITE`
- `jira_write_performed: false`
- `jira_api_called: false`
- `jira_cli_called: false`
- `network_call_performed: false`
- missing Jira config is reported, not guessed
- DONE transition remains blocked by default

## Config Validator Compatibility

Command:

```powershell
node tools/jira/validate-config.mjs --config docs/config/jira-sync-config.sample.json
```

Observed:

- `result: VALID_MANUAL_DRY_RUN_CONTRACT`
- `real_sync_allowed: false`
- `real_sync_blocked: true`
- placeholder project key, issue type, status mapping, and transition mapping blockers are reported
- `jira_api_called: false`
- `jira_cli_called: false`
- `network_call_performed: false`
- `secrets_printed: false`
- `no_write_confirmation: NO_WRITE`

## Guarded Evidence Comment Dry-Run

Command:

```powershell
node tools/jira/guarded-write.mjs --action add_evidence_comment --issue RIC-1 --project "RIC Studio" --sprint RIC-STUDIO --task-key RIC-STUDIO-083D --local-status REVIEW --protocol-level LEAN_LEVEL_2 --validation-summary "Validation pending" --dry-run
```

Observed:

- `mode: MANUAL_DRY_RUN`
- `result: BLOCKED_MISSING_CONFIG`
- `jira_write_performed: false`
- `jira_api_called: false`
- `jira_cli_called: false`
- `network_call_performed: false`
- config blocker reports issue project `RIC` is not in the approved Jira project allowlist for this local task
- generated comment includes `Idempotency marker: RIC-STUDIO-JIRA-EVIDENCE::RIC Studio::RIC-STUDIO-083D::add_evidence_comment`

The blocked result is expected with the placeholder sample config.

## Invalid Issue Key

Command:

```powershell
node tools/jira/guarded-write.mjs --action add_evidence_comment --issue not-a-key --project "RIC Studio" --sprint RIC-STUDIO --task-key RIC-STUDIO-083D --local-status REVIEW --protocol-level LEAN_LEVEL_2 --validation-summary "Validation pending" --dry-run
```

Observed:

- `result: BLOCKED_INVALID_ISSUE`
- blocked reason states the issue key must match Jira key format `PROJECT-123`
- `jira_api_called: false`
- `network_call_performed: false`

## Missing Owner Approval

Command used a temporary non-secret config outside the repository with project `RIC` allowlisted and config mode `GUARDED_COMMENT_ONLY`.

```powershell
node tools/jira/guarded-write.mjs --action add_evidence_comment --config <temp-config> --issue RIC-1 --project "RIC Studio" --sprint RIC-STUDIO --task-key RIC-STUDIO-083D --local-status REVIEW --protocol-level LEAN_LEVEL_2 --validation-summary "Validation pending" --real-write
```

Observed:

- `result: BLOCKED_MISSING_OWNER_APPROVAL`
- `mode: GUARDED_COMMENT_ONLY`
- `jira_write_performed: false`
- `jira_api_called: false`
- `network_call_performed: false`
- `secrets_printed: false`

## Duplicate Risk

Command used the same temporary non-secret config with owner approval present but no duplicate-risk acceptance.

```powershell
node tools/jira/guarded-write.mjs --action add_evidence_comment --config <temp-config> --issue RIC-1 --project "RIC Studio" --sprint RIC-STUDIO --task-key RIC-STUDIO-083D --local-status REVIEW --protocol-level LEAN_LEVEL_2 --validation-summary "Validation pending" --owner-approved --real-write
```

Observed:

- `result: BLOCKED_DUPLICATE_RISK`
- duplicate detection reports `executed: false`
- reason states no read-comments Jira API access is performed by this guarded MVP
- `jira_api_called: false`
- `network_call_performed: false`

## Missing Environment Variables

Command used the same temporary non-secret config with owner approval and duplicate-risk acceptance present, while clearing process-local Jira env variables.

```powershell
$env:JIRA_BASE_URL=$null; $env:JIRA_EMAIL=$null; $env:JIRA_API_TOKEN=$null; node tools/jira/guarded-write.mjs --action add_evidence_comment --config <temp-config> --issue RIC-1 --project "RIC Studio" --sprint RIC-STUDIO --task-key RIC-STUDIO-083D --local-status REVIEW --protocol-level LEAN_LEVEL_2 --validation-summary "Validation pending" --owner-approved --duplicate-risk-accepted --real-write
```

Observed:

- `result: BLOCKED_MISSING_CONFIG`
- blocked reason is missing required environment variables
- missing variables listed by name only: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`
- no env values or secrets printed
- `jira_write_performed: false`
- `jira_api_called: false`
- `network_call_performed: false`

## Syntax And Diff Checks

Command:

```powershell
node --check tools/jira/guarded-write.mjs
```

Observed: PASS.

Command:

```powershell
git diff --check
```

Observed: PASS. Git printed line-ending normalization warnings for touched Jira files; no whitespace errors were reported.

## Result

Result: REVIEW.

Recommendation: APPROVE COMMIT.

No Jira issue was created. No Jira transition was performed. No Jira description or issue metadata was modified. No real Jira write, Jira API call, Jira CLI call, dependency change, package or lockfile change, Docker change, auth change, database change, migration change, environment file change, DayBudget file change, stash action, commit, or push occurred.
