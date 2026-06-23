# Jira Dry-Run Validation - RIC-STUDIO-075A

## Scope

RIC-STUDIO-075A adds the first safe local dry-run interface for planned Jira actions.

Validation must prove the tool prints intended Jira actions, blocks DONE, requires explicit inputs, and performs no real Jira API or Jira CLI calls.

## Commands

Required validation commands:

```powershell
node tools/jira/dry-run.mjs --action create_issue --summary "Draft safe Jira dry-run issue"
node tools/jira/dry-run.mjs --action transition_issue --issue RIC-1 --to READY
node tools/jira/dry-run.mjs --action transition_issue --issue RIC-1 --to IN_PROGRESS
node tools/jira/dry-run.mjs --action transition_issue --issue RIC-1 --to REVIEW
node tools/jira/dry-run.mjs --action transition_issue --issue RIC-1 --to DONE
node tools/jira/dry-run.mjs --action add_comment --issue RIC-1 --comment "Dry-run comment only"
node tools/jira/dry-run.mjs --action attach_evidence_summary --issue RIC-1 --evidence-summary "Dry-run evidence summary only"
git diff --check
```

## Expected Result

- Create issue prints `would_create_issue`.
- READY transition prints `would_transition_issue`.
- IN_PROGRESS transition prints `would_transition_issue`.
- REVIEW transition prints `would_transition_issue`.
- DONE transition prints `BLOCKED`.
- Add comment prints `would_add_comment`.
- Attach evidence summary prints `would_attach_evidence_summary`.
- Every dry-run output reports `jira_write_performed: false`.
- Every dry-run output reports `jira_api_called: false`.
- Every dry-run output reports `jira_cli_called: false`.
- Every dry-run output reports `credentials_required: false`.
- No token or credential is created.
- No package or lockfile is changed.
- No runtime/model/app/UI file is changed.

## Validation Result

Result: PASS.

Observed behavior:

- Create issue dry-run printed `would_create_issue`.
- READY transition dry-run printed `would_transition_issue`.
- IN_PROGRESS transition dry-run printed `would_transition_issue`.
- REVIEW transition dry-run printed `would_transition_issue`.
- DONE transition returned `BLOCKED` with `blocked_reason` explaining that DONE requires Ricardo final validation.
- Add comment dry-run printed `would_add_comment`.
- Attach evidence summary dry-run printed `would_attach_evidence_summary`.
- Every output reported `jira_write_performed: false`.
- Every output reported `jira_api_called: false`.
- Every output reported `jira_cli_called: false`.
- Every output reported `network_call_performed: false`.
- Every output reported `credentials_required: false`.
- Every output reported `token_created: false`.
- Every output reported `token_stored: false`.

No Jira API call, Jira CLI call, network call, token creation, credential storage, package or lockfile change, runtime/model change, app/UI change, GitHub integration, commit, or push occurred during validation.
