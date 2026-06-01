# Local MVP Technical Scaffold

## Purpose

RIC-STUDIO-040A defines the smallest useful technical scaffold for the local RIC AI Delivery Auditor MVP.

This is a documentation-only planning task. It does not create scripts, app folders, package files, dependencies, UI, automation, LangChain integration, LangGraph integration, runtime changes, or Modelfile changes.

## Current Repository Shape

The repository currently contains:

- Product and architecture documentation under `docs/`.
- Operational state files under `STATUS.md`, `backlog.md`, and `docs/ops/`.
- Runtime prompt and Modelfile assets under `runtime/`.
- No app scaffold.
- No package file.
- No dependency manifest.
- No local auditor implementation directory.

This shape favors a very small local implementation first, before any framework or dependency is introduced.

## Recommended Smallest Scaffold

Recommended future implementation option:

- Zero-dependency local Node.js CLI script.

Rationale:

- It can run with the local Node runtime without package installation.
- It can validate the existing evidence and decision contracts with plain JavaScript.
- It avoids premature UI, API, TypeScript, package, LangChain, LangGraph, or GitHub integration work.
- It gives the project a concrete executable surface while preserving the Protocolo Rick evidence gate.

Rejected for the first implementation slice:

- Minimal Node/TypeScript package.
- Minimal Next.js app.
- LangChain agent implementation.
- LangGraph workflow implementation.
- UI or API scaffold.
- GitHub API integration.
- Git automation.

## Future Implementation Task

Recommended next implementation task:

`RIC-STUDIO-040B - Implement Local Auditor CLI Smoke Prototype`

Future task mode:

- Minimal implementation plus validation documentation.

Future 040B goal:

- Create the smallest local CLI prototype that reads a JSON evidence file and emits a structured `COMMIT_BLOCKED` decision when required evidence is missing or incomplete.

## Future 040B Files

Recommended future implementation files:

- `tools/auditor/audit.mjs`
- `tools/auditor/sample-evidence.json`
- `tools/auditor/README.md`
- `docs/validation/local-auditor-cli-smoke.md`

Expected operational files for the future task:

- `STATUS.md`
- `backlog.md`
- `docs/ops/status.md`
- `docs/ops/backlog.md`
- `docs/ops/execution-log.md`
- `docs/ops/session-handoff.md`

These files are not created by RIC-STUDIO-040A except for this planning document and the operational documentation updates.

## Future CLI Behavior

The future CLI should run as:

```text
node tools/auditor/audit.mjs tools/auditor/sample-evidence.json
```

The future CLI should:

- Read a JSON evidence file.
- Validate required fields with plain JavaScript.
- Produce a structured decision object on stdout.
- Support only the first safe decision path: `COMMIT_BLOCKED`.
- Block commit when evidence is missing or incomplete.
- Avoid claiming support for `COMMIT_ALLOWED`, `LOCAL_DONE_CONFIRMED`, `PUSH_ALLOWED`, `REMOTE_DONE_CONFIRMED`, or `DISCUSSION_GATE_RECOMMENDED`.

## Future 040B Validation Commands

Recommended validation for the future implementation task:

```text
node tools/auditor/audit.mjs tools/auditor/sample-evidence.json
git status --short --untracked-files=all
git status -sb
git diff --stat
git diff --check
```

## RIC-STUDIO-040A Validation Commands

Validation for this documentation-only planning task:

```text
git status --short --untracked-files=all
git status -sb
git diff --stat
git diff --check
git diff --no-color -- STATUS.md backlog.md docs/ops/status.md docs/ops/backlog.md docs/ops/execution-log.md docs/ops/session-handoff.md docs/architecture/local-mvp-technical-scaffold.md
```

## Blocked Scope

RIC-STUDIO-040A does not authorize:

- App scaffold.
- `tools/auditor/` directory creation.
- Script creation.
- LangChain implementation.
- LangGraph implementation.
- Dependencies.
- Package files.
- TypeScript setup.
- Next.js.
- GitHub API integration.
- UI.
- Automation.
- Runtime changes.
- Modelfile changes.
- Commit.
- Push.
