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

### Local Audit Session Runner

Execute the dependency-free session runner with an evidence file:

```powershell
node tools/auditor/audit-session.mjs --evidence <path/to/evidence.json>
```

The runner provides a structured JSON report on `stdout` including the audit decision, session status, and safe metadata.

### Audit Session Contract Validation

To ensure the session runner correctly implements the required report fields, use the dependency-free contract validator:

```powershell
node tools/auditor/validate-session-contract.mjs
```

#### When to Run
- **Before** making any changes to `tools/auditor/audit-session.mjs`.
- **After** any changes that may affect the audit session report shape.
- **During Review** of tasks that modify audit session output or contracts.

#### What is Validated
The validator checks requirements from `docs/architecture/local-auditor-session-contract.md`:
- **Required fields:** `session_status`, `audit_metadata`, `protocol_findings`, `missing_evidence`, `human_review_required`, and `next_step`.
- **Nested metadata:** Correct structure for `audit_decision`, `auditor_authority`, and `evidence_source`.
- **Protocol findings presence:** Verified in both allowed and blocked outputs.
- **Protocol findings behavior:**
    - `protocol_findings: []` for allowed output.
    - Populated `protocol_findings` for blocked outputs involving protocol violations.

#### How to Interpret Results
- **PASS:** The current session report shape satisfies the local contract checks.
- **FAIL:** Review must stop. The implementation or contract alignment must be corrected before proceeding.

#### Boundaries
- **No package scripts:** Run directly with `node`. No `npm` scripts are required.
- **No CI integration:** This is a local-only tool. No CI authorization is granted.
- **Dependency-free:** Uses only Node.js built-ins. No dependency changes are authorized.

#### Related Files
- `tools/auditor/validate-session-contract.mjs`
- `docs/architecture/local-auditor-session-contract.md`
- `docs/validation/local-auditor-session-contract-validation-062a.md`

### Read-only Smoke Workflow

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
