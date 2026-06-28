# Local Operator Dashboard

The Operator Dashboard is a minimal local read-only browser view for RIC Studio.

It uses Node.js built-in modules only. It does not require a root `package.json`, does not install dependencies, and does not create a lockfile.

## Run

From the repository root:

```powershell
node tools/operator-ui/server.mjs
```

Open:

```text
http://localhost:4310
```

Stop the dashboard with `Ctrl+C` in the terminal that started it.

## Smoke Check

Run the self-contained smoke check:

```powershell
node tools/operator-ui/server.mjs smoke
```

The smoke check starts the local server, requests `/` and `/api/state` from `localhost`, prints structured JSON evidence, then exits.

## What It Shows

- Current project state from operational docs.
- Current READY task.
- Manual External Execution Context from `docs/ops/external-execution-context.md`.
- Local Project Registry from `docs/ops/project-registry.md`.
- A safe no-active-task state when READY is empty.
- Recent validation/evidence links.
- Local auditor and operator commands.
- Auditor package metadata from `tools/auditor/package.json`.
- Available auditor package scripts as manual terminal commands.
- Expected auditor file presence.
- Auditor docs and validation evidence references.
- Allowed local actions.
- Blocked actions.
- Next gate/status guidance.

## Boundaries

The dashboard is local-only and read-only. It does not write files, stage files, commit, push, deploy, install dependencies, call external services, change runtime/Ollama/model files, change prompts or Modelfiles, change evaluator logic, or change fixtures.

External Execution Context is manual operator context loaded from a local repository file. It is not synced from Jira, GitHub, DayBudget, or any running agent.

Project Registry is manual local project context loaded from `docs/ops/project-registry.md`. It is not synced from GitHub, Jira, Docker, external repositories, or any running agent.

Auditor commands shown in the dashboard are text for manual terminal use. The browser dashboard does not run shell commands, npm scripts, auditor decisions, or Git actions.

The dashboard resolves the displayed active task from the READY backlog. If no READY task is listed, it displays `No active READY task recorded` and points the operator to the observation or Discussion Gate cycle instead of presenting an old REVIEW task as active.
