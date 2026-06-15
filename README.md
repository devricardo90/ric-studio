# RIC Studio

RIC Studio is a documentation-first AI-assisted development orchestration workspace.

It is focused on controlled task execution, audit evidence, review gates, and Git discipline. The project explores how a human-led workflow can use AI assistance without allowing uncontrolled code changes, unclear scope, missing validation, or premature commit and push actions.

RIC Studio is a portfolio project, not a finished commercial platform. Its value is in demonstrating AI workflow governance, developer operations discipline, validation-first thinking, and practical risk control around AI-assisted software delivery.

## The Problem

AI coding tools can move quickly, but speed creates risk when the workflow does not force clear evidence and review boundaries.

RIC Studio is designed around these delivery problems:

- uncontrolled AI coding outside the accepted scope;
- unclear task boundaries;
- missing or stale validation evidence;
- premature commit or push decisions;
- automation acting without human approval;
- weak visibility into why a task is allowed, blocked, or still in review.

The project treats delivery as an evidence-based process instead of a free-form chat. A task should not advance just because code was changed. It advances only when scope, changed files, validation results, and approval gates support the next state.

## Core Workflow

RIC Studio uses explicit task states to keep AI-assisted work controlled.

- **Discussion Gate**: scope, objective, allowed files, forbidden files, validation commands, and commit boundaries are discussed before work begins.
- **READY**: a task has accepted scope and boundaries, but implementation has not started.
- **REVIEW**: implementation or documentation work has been completed locally and needs human review.
- **Local DONE**: local review is complete, but remote state has not been confirmed.
- **Remote DONE**: the approved work has been pushed and verified against the remote repository.

This lifecycle makes the project state visible. It also prevents a task from quietly moving from idea to implementation to push without explicit checkpoints.

## Human Approval Gates

Human approval is part of the workflow, not an afterthought.

- No task is promoted to READY without an agreed objective, scope, allowed files, forbidden files, validation commands, and commit boundary.
- No commit should happen without concrete audit evidence and explicit approval.
- No push should happen without post-commit verification and explicit approval.
- No Remote DONE state should be claimed unless the remote repository confirms it.

The goal is not to remove the human reviewer. The goal is to give the reviewer better evidence and clearer decisions.

## Audit Evidence

RIC Studio records the evidence needed to support task decisions.

Examples of audit evidence include:

- raw command outputs such as `git status`, `git diff`, validation commands, and test results;
- exact changed files;
- validation results and relevant excerpts;
- checks that forbidden files or forbidden scopes were not touched;
- commit and remote references when a task reaches Remote DONE.

This evidence is used to decide whether a task can continue, must stop for review, or needs more validation.

## Local Auditor

The repository includes a local auditor path under `tools/auditor/`.

The local auditor is intentionally narrow. It supports structured local review decisions; it does not replace human approval.

Current local auditor capabilities include:

- an audit-session report for local review;
- visible `protocol_findings` in the session report;
- an audit session report contract;
- a dependency-free local contract validator;
- README usage documentation for local validator commands;
- realistic workflow validation evidence showing allowed and blocked review paths.

The local auditor helps show how evidence can be turned into a structured decision:

- `COMMIT_ALLOWED` means the evidence supports only the specific allowed action, usually commit, and still requires human review.
- `COMMIT_BLOCKED` means the workflow must stop until the reported issue is corrected and validation is rerun.
- `protocol_findings` explain protocol-level blockers such as forbidden file changes.

## Run Locally

RIC Studio is currently a local protocol and tooling repository, not a deployed web app. There is no product UI, hosting setup, or deploy target yet.

The current runnable surface is the local auditor under `tools/auditor/`. These commands use existing dependency-free Node.js tooling and do not require installing root dependencies:

```powershell
cmd /c npm --prefix tools/auditor run smoke:read-only
cmd /c npm --prefix tools/auditor run smoke:invalid-json
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/commit-allowed-evidence.json
node tools/auditor/audit-session.mjs --evidence tools/auditor/fixtures/protocol-findings-blocked-file-violation.json
```

The smoke commands print structured JSON reports. The allowed fixture shows a `COMMIT_ALLOWED` path with human review still required, while invalid or blocked evidence shows a `COMMIT_BLOCKED` path. This is the smallest local operator visibility baseline: the owner can run commands locally and see concrete structured output before any larger workflow automation, UI, or deploy work is introduced.

## What Is Not Automated Yet

RIC Studio intentionally does not automate high-risk delivery actions by default. The following delivery actions are not automated:

Not automated yet:

- no blind commits;
- no blind pushes;
- no CI integration unless explicitly approved;
- no package scripts unless explicitly approved;
- no dependency or lockfile changes unless explicitly approved;
- no runtime, model, or Ollama changes unless explicitly approved;
- no autonomous production changes;
- no app, backend, frontend, database, or deploy changes unless a scoped task approves them.

These limits are part of the design. The project demonstrates how automation can be introduced only after scope, evidence, and approval rules are clear.

## Why This Matters Technically

RIC Studio demonstrates a practical operating model for AI-assisted delivery:

- converting vague implementation requests into scoped tasks;
- separating planning, execution, review, commit, push, and remote verification;
- preserving raw evidence for delivery decisions;
- blocking unsafe state transitions;
- making AI assistance accountable to human approval gates;
- documenting what is allowed, forbidden, and still unproven.

For a recruiter, technical reviewer, or collaborator, the project shows disciplined engineering behavior around AI tools: clear scope, validation-first execution, risk control, and honest boundaries. It does not claim full automation or production SaaS readiness.

## Documentation

- [Product concept](docs/product/ric-ai-delivery-auditor.md)
- [LangChain AI Delivery Auditor MVP architecture](docs/architecture/langchain-ai-delivery-auditor-mvp.md)
- [Product requirements](docs/product/prd.md)
- [MVP scope](docs/product/mvp-scope.md)
- [Local product architecture](docs/architecture/local-product-architecture.md)
- [Local auditor workflow validation](docs/validation/local-auditor-workflow-usage-validation-064a.md)

## Current Status

RIC Studio is in a documentation and operating-model phase with a small local auditor workflow already validated. The next work should continue to respect explicit task scope, evidence, human approval, and Git boundaries.

## Technical References

- LangChain agents: https://docs.langchain.com/oss/python/langchain/agents
- LangChain structured output: https://docs.langchain.com/oss/python/langchain/structured-output
- LangGraph persistence: https://docs.langchain.com/oss/javascript/langgraph/persistence
- LangGraph human-in-the-loop: https://docs.langchain.com/oss/python/langgraph/human-in-the-loop
