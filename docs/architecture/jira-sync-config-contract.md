# Jira Sync Config Contract

## Purpose

RIC-STUDIO-083C defines the non-secret Jira configuration and status mapping contract required before any future real Jira synchronization can be considered.

This contract does not authorize Jira API calls, Jira CLI calls, network calls, credential handling, issue creation, issue linking, comments, transitions, or real writes. Current Jira mode remains `MANUAL_DRY_RUN`.

## Contract File

The sample contract lives at:

- `docs/config/jira-sync-config.sample.json`

The sample is safe to commit because it contains placeholders only. It must not contain Jira credentials, tokens, cookies, authorization headers, `.env` values, account emails, or private API responses.

## Required Fields

Any future Jira sync config must define:

- `schemaVersion`
- `sourceOfTruth`
- `allowedOperationModes`
- `currentMode`
- `approvedProjects`
- `localStatuses`
- `jiraStatusMapping`
- `jiraTransitionMapping`
- `currentStatusVerification`
- `createIssueDuplicateDetection`
- `linkExistingIssueValidation`
- `evidenceComment`
- `ownerApproval`
- `strictBlockedActions`
- `realSyncReadiness`

## Approved Project Allowlist

Real sync may only target explicitly approved Jira projects.

Each allowlist entry must define:

- `localProject`
- `jiraProjectKey`
- `allowedIssueTypes`
- `realSyncAllowed`

`jiraProjectKey` must be provided by the owner. It must never be inferred from a local project name, task key, branch name, sprint name, or issue prefix.

If `jiraProjectKey` is missing or still a placeholder, real sync is blocked.

## Issue Type Requirement

Every create-issue plan must use an owner-approved Jira issue type from `allowedIssueTypes`.

If the issue type is missing, empty, unknown, or still a placeholder, real sync is blocked.

## Allowed Operation Modes

The only allowed operation modes are:

- `MANUAL_DRY_RUN`
- `GUARDED_COMMENT_ONLY`
- `GUARDED_REAL_SYNC_FUTURE`

`MANUAL_DRY_RUN` is the current and default mode.

`GUARDED_COMMENT_ONLY` describes the already narrow guarded comment path. It does not authorize this task to execute comments.

`GUARDED_REAL_SYNC_FUTURE` is a future-only mode. It requires a separate owner-approved implementation task, complete config, current-status verification, dry-run evidence, and exact owner approval before any real write.

## Local Status Mapping

The contract must list these local statuses:

- `DRAFT`
- `READY`
- `IN_PROGRESS`
- `REVIEW`
- `DONE`
- `BLOCKED`
- `FAILED`

## Jira Status Mapping

Each local status must map to an explicit Jira status name.

Placeholders such as `<JIRA_STATUS_READY_REQUIRED>` are allowed in the sample contract, but they block real sync.

The validator must report missing or placeholder status mappings. It must not guess names such as "To Do", "In Progress", or "Done".

## Jira Transition Mapping

Each local status must map to an explicit Jira transition id or transition name.

Placeholders such as `<JIRA_TRANSITION_READY_REQUIRED>` are allowed in the sample contract, but they block real sync.

The validator must report missing or placeholder transition mappings. It must not guess transition ids or workflow names.

## Current Status Verification

Before any future real transition, the adapter must read and verify the current Jira issue status.

Real transition is blocked when:

- current Jira status is unknown
- current Jira status does not match the expected source state
- the requested target state is unmapped
- the Jira transition id/name is missing or still a placeholder
- the transition would move to `DONE` without final owner validation

This task does not implement the read. It only defines the requirement.

## Create Issue Duplicate Detection

Before any future real issue creation, the adapter must check for duplicates using:

- project allowlist
- local project
- sprint
- task key
- title
- evidence comment idempotency marker
- approved linked issue key, when present

If duplicate risk cannot be ruled out, create is blocked.

## Link Existing Issue Validation

Before linking an existing Jira issue, the adapter must verify:

- issue key is explicitly provided
- issue belongs to an approved Jira project
- issue type is approved
- summary/scope are compatible with the local task
- issue is not already linked to another local task
- linking does not modify unrelated Jira projects or issues

If any check cannot be proven, link is blocked.

## Evidence Comment Idempotency Marker

Evidence comments must include a stable marker:

```text
RIC-STUDIO-JIRA-EVIDENCE::{localProject}::{taskKey}::{operation}
```

Future real comment sync must search for the marker before writing a new evidence comment. If the adapter cannot prove whether the marker already exists, comment creation is blocked.

## Owner Approval Requirement

Owner approval is required before any real Jira write, including:

- create issue
- link existing issue
- add evidence comment
- transition status

Approval must be explicit, current, and scoped to the exact project, issue key or create payload, operation, target state, and evidence packet.

`DONE` requires final owner validation. It must remain blocked unless owner validation is explicitly present.

## Strict Blocked Actions

The following actions are blocked:

- delete issue
- overwrite description without owner approval
- transition unknown status
- create duplicate issue
- modify unrelated Jira projects
- bulk updates
- Jira workflow/project config edits
- credential/token creation or storage
- hidden retries that may duplicate writes
- automatic DONE without final owner validation

## Validator Contract

The validator must be dependency-free and network-free.

It must:

- read only the provided non-secret JSON file
- report missing Jira project keys
- report missing issue types
- report missing status mappings
- report missing transition mappings
- block real sync when mappings are missing or placeholders
- block DONE transition unless owner validation is explicitly present
- report whether the contract is safe for `MANUAL_DRY_RUN`
- avoid printing secrets or environment values

## Real Sync Readiness

Real Jira sync remains blocked until:

- all placeholders are replaced by owner-approved non-secret config
- project allowlist is complete
- issue type allowlist is complete
- all status mappings are complete
- all transition mappings are complete
- current-status verification is implemented
- duplicate detection is implemented
- link-existing validation is implemented
- owner approval evidence format is implemented
- separate implementation approval exists

RIC-STUDIO-083C stops at REVIEW and does not implement real sync.
