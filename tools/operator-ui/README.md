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
- Recent validation/evidence links.
- Local auditor and operator commands.
- Allowed local actions.
- Blocked actions.
- Next gate/status guidance.

## Boundaries

The dashboard is local-only and read-only. It does not write files, stage files, commit, push, deploy, install dependencies, call external services, change runtime/Ollama/model files, change prompts or Modelfiles, change evaluator logic, or change fixtures.
