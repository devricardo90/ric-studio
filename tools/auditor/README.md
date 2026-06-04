# Local Auditor CLI

`audit.mjs` is a smallest-possible local Node.js CLI and importable deterministic evaluator for the RIC AI Delivery Auditor.

The CLI reads a JSON evidence file from the command line, checks for the minimum evidence fields required for the first commit gate smoke test, and emits a structured JSON decision. The exported `evaluateEvidence(evidence)` function evaluates an in-memory evidence object with the same deterministic decision logic and does not execute the CLI when imported normally. The current prototype is intentionally local, deterministic, and dependency-free.

## Run

```powershell
node tools/auditor/audit.mjs tools/auditor/sample-evidence.json
```

Import the deterministic evaluator:

```javascript
import { evaluateEvidence } from "./audit.mjs";

const decision = evaluateEvidence(evidence);
```

Run the read-only smoke workflow:

```powershell
node tools/auditor/smoke-workflow.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json
```

`smoke-workflow.mjs` mirrors the future graph-style workflow shape without importing or installing LangGraph:

1. load evidence
2. parse evidence
3. run the deterministic auditor authority
4. format a smoke report

The deterministic authority remains `tools/auditor/audit.mjs`. The smoke workflow remains compatible with the CLI entry point and does not copy or replace the auditor decision logic. Normal module imports do not execute the CLI or write to stdout.

## Supported Decision

`audit.mjs` supports:

- `COMMIT_BLOCKED`
- `COMMIT_ALLOWED`

The CLI returns `COMMIT_BLOCKED` when the evidence file path is missing, invalid, unreadable, invalid JSON, not a JSON object, or when required evidence fields are missing or empty. It returns `COMMIT_ALLOWED` only for complete commit-gate evidence that satisfies the deterministic contract.

`smoke-workflow.mjs` does not make a commit, push, release, Local DONE, or Remote DONE decision by itself. It reports the authority output and states that the human gate remains mandatory.

## Read-Only Boundaries

The auditor smoke workflow is intentionally limited to Node.js built-in modules and local read-only operations. It does not install dependencies, import LangGraph, import LangChain, create package metadata, stage files, commit, push, deploy, edit runtime files, modify Ollama models, call GitHub APIs, or automate Git.

## Not Supported Yet

This smoke prototype intentionally does not support:

- `LOCAL_DONE_CONFIRMED`
- `PUSH_ALLOWED`
- `REMOTE_DONE_CONFIRMED`
- `DISCUSSION_GATE_RECOMMENDED`
- dependency installation
- TypeScript
- frameworks
- end-to-end local audit session assembly
- automatic task scope or validation evidence collection
- GitHub API integration
- Git automation

The package currently provides the validated `smoke:read-only` and `smoke:invalid-json` scripts. They run existing fixture-based smoke workflows and do not install dependencies, create lockfiles, or automate Git.
