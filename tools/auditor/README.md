# Local Auditor CLI

`audit.mjs` is a smallest-possible local Node.js CLI prototype for the RIC AI Delivery Auditor.

It reads a JSON evidence file from the command line, checks for the minimum evidence fields required for the first commit gate smoke test, and emits a structured JSON decision. The current prototype is intentionally local, deterministic, and dependency-free.

## Run

```powershell
node tools/auditor/audit.mjs tools/auditor/sample-evidence.json
```

## Supported Decision

The only supported decision is:

- `COMMIT_BLOCKED`

The CLI returns `COMMIT_BLOCKED` when the evidence file path is missing, invalid, unreadable, invalid JSON, not a JSON object, or when required evidence fields are missing or empty.

## Not Supported Yet

This smoke prototype intentionally does not support:

- `COMMIT_ALLOWED`
- `LOCAL_DONE_CONFIRMED`
- `PUSH_ALLOWED`
- `REMOTE_DONE_CONFIRMED`
- `DISCUSSION_GATE_RECOMMENDED`
- dependency installation
- TypeScript
- frameworks
- package scripts
- GitHub API integration
- Git automation
