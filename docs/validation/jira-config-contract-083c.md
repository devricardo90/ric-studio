# Jira Config Contract Validation - RIC-STUDIO-083C

## Scope

RIC-STUDIO-083C creates a safe non-secret Jira configuration and status mapping contract for future real Jira synchronization.

This task does not implement real Jira sync. Jira mode remains `MANUAL_DRY_RUN`.

## Files

Changed:

- `docs/architecture/jira-sync-config-contract.md`
- `docs/config/jira-sync-config.sample.json`
- `docs/validation/jira-config-contract-083c.md`
- `tools/jira/README.md`
- `tools/jira/validate-config.mjs`

Not changed:

- DayBudget files
- package files
- lockfiles
- Docker files
- auth files
- database files
- migration files
- environment files
- `tools/jira/guarded-write.mjs`

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
- missing Jira config is reported using placeholders
- DONE transition is `BLOCKED_OWNER_VALIDATION_REQUIRED`

## Missing Config And DONE Block

Command:

```powershell
$json = [string]::Join("`n", (node tools\jira\dry-run.mjs --action registry_task_plan --registry docs\ops\sprint-task-registry.json --project DayBudget --task-key WEB-027A)); $plan = $json | ConvertFrom-Json; if (-not $plan.proposed_jira_config.missing_config_reported_not_guessed) { throw 'missing config was not reported' }; $done = $plan.operations | Where-Object { $_.operation_type -eq 'transition_plan' } | Select-Object -ExpandProperty transitions | Where-Object { $_.target_local_status -eq 'DONE' }; if ($done.result -ne 'BLOCKED_OWNER_VALIDATION_REQUIRED') { throw 'DONE was not blocked by default' }; 'DRY_RUN_SAFETY: PASS'
```

Observed:

```text
DRY_RUN_SAFETY: PASS
```

## Config Validator

Command:

```powershell
node tools/jira/validate-config.mjs --config docs/config/jira-sync-config.sample.json
```

Observed:

- `result: VALID_MANUAL_DRY_RUN_CONTRACT`
- `contract_valid: true`
- `real_sync_allowed: false`
- `real_sync_blocked: true`
- `secret_like_keys_found: []`
- `jira_api_called: false`
- `jira_cli_called: false`
- `network_call_performed: false`
- `environment_values_read: false`
- `secrets_printed: false`
- `no_write_confirmation: NO_WRITE`

Expected real-sync blockers were reported:

- Jira project key placeholder
- issue type placeholder
- Jira status mapping placeholders
- Jira transition mapping placeholders
- DONE blocked because owner validation is not present

## Syntax And Diff Checks

Command:

```powershell
$first = [string]::Join("`n", (node tools\jira\dry-run.mjs --action registry_task_plan --registry docs\ops\sprint-task-registry.json --project DayBudget --task-key WEB-027A)); $second = [string]::Join("`n", (node tools\jira\dry-run.mjs --action registry_task_plan --registry docs\ops\sprint-task-registry.json --project DayBudget --task-key WEB-027A)); if ($first -ceq $second) { 'DRY_RUN_DETERMINISTIC: PASS' } else { 'DRY_RUN_DETERMINISTIC: FAIL'; exit 1 }
```

Observed:

```text
DRY_RUN_DETERMINISTIC: PASS
```

Command:

```powershell
$first = [string]::Join("`n", (node tools\jira\validate-config.mjs --config docs\config\jira-sync-config.sample.json)); $second = [string]::Join("`n", (node tools\jira\validate-config.mjs --config docs\config\jira-sync-config.sample.json)); if ($first -ceq $second) { 'VALIDATOR_DETERMINISTIC: PASS' } else { 'VALIDATOR_DETERMINISTIC: FAIL'; exit 1 }
```

Observed:

```text
VALIDATOR_DETERMINISTIC: PASS
```

Command:

```powershell
node --check tools/jira/validate-config.mjs
```

Observed: PASS.

Command:

```powershell
git diff --check
```

Observed: PASS. Git printed a line-ending normalization warning for `tools/jira/README.md`; no whitespace errors were reported.

## Result

Result: REVIEW.

Recommendation: APPROVE COMMIT.

No Jira API call, Jira CLI call, real Jira write, network call, DayBudget file change, stash action, package or lockfile change, Docker change, auth change, database change, migration change, environment file change, commit, or push occurred.
