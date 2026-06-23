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
