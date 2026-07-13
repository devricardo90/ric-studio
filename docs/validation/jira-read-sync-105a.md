# RIC-4 / RIC-STUDIO-105A Jira Read Synchronization Validation

## Scope

Implemented automatic read-only Jira synchronization for the Operator Dashboard.

Registered Jira project keys:

- `RT` - Rick Travel
- `DAY` - DayBudget
- `RIC` - RIC Studio

## Implemented Behavior

- Initial synchronization runs when the dashboard starts.
- Periodic synchronization runs every 30 seconds while the dashboard is running.
- Jira search is limited to registered projects `RT`, `DAY`, and `RIC`.
- Requested Jira fields are limited to dashboard visibility data: issue key, project key/name, summary, status, issue type, parent/epic, sprint, assignee display name, labels, created, and updated.
- Jira statuses normalize into RIC Studio lifecycle statuses.
- Unknown Jira statuses remain `UNKNOWN` and are not converted to `DONE`.
- Duplicate issues are prevented by Jira issue key.
- Runtime cache is written only to gitignored `var/jira-live-state.json`.
- If Jira is temporarily unavailable, the last successful cache is preserved and marked as cached data.
- Errors are sanitized before appearing in `/api/state` or the browser dashboard.

## Safety Boundary

- Jira write performed: false
- Full sync performed: false
- Create issue performed: false
- Bulk operation performed: false
- Jira comments performed: false
- Jira transitions performed: false
- Automatic Codex execution performed: false
- Commit performed: false
- Push performed: false
- Secrets printed: false

## Validation Commands

Validation commands are rerun in the final REVIEW pass before report.

- `node --test tools/jira/read-sync.test.mjs`
- `node --test tools/operator-ui/server.test.mjs`
- `node --test tools/jira/guarded-write-gates.test.mjs`
- `node --test tools/jira/operator-safe-flow.test.mjs`
- `node --test tools/jira/queue-execute-approved.test.mjs`
- `node --test tools/jira/queue-plan.test.mjs`
- `node tools/jira/validate-config.mjs --config docs/config/jira-sync-config.sample.json`
- `node tools/operator-ui/server.mjs smoke`
- `git diff --check`

## Review State

RIC-4 / RIC-STUDIO-105A stops in REVIEW. It must not be marked DONE or Remote DONE from this implementation pass.
