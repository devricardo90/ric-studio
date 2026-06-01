# LangChain AI Delivery Auditor MVP Architecture

## Architecture Purpose

This document defines the conceptual MVP architecture for RIC AI Delivery Auditor inside the existing `ric-studio` repository.

The architecture is intentionally documentation-only in RIC-STUDIO-038A. It defines the public technical direction without installing dependencies or implementing runtime integration.

## System Boundary

RIC Studio remains the repository and portfolio project.

RIC AI Delivery Auditor is the public product concept inside that repository.

The planned implementation boundary is:

- LangChain for agent behavior, model calls, tool calling, and structured output.
- LangGraph for workflow state, graph execution, human review pauses, and persisted audit checkpoints.
- Protocolo Rick for delivery-state rules and human authorization boundaries.

## Conceptual Components

### Evidence Sources

Evidence sources are raw inputs supplied by the developer or future tools.

Examples:

- Task scope.
- Status and backlog state.
- Git status.
- Diff summary.
- Test output.
- Build output.
- Validation notes.
- Human review notes.

The auditor must treat missing evidence as missing. It must not fabricate command output.

### LangChain Agent Layer

The LangChain agent layer owns reasoning and structured responses.

Responsibilities:

- Receive normalized evidence.
- Invoke internal tools when available.
- Apply policy instructions.
- Produce a typed audit decision.
- Avoid free-form authorization when schema fields are required.

LangChain structured output is the planned mechanism for returning predictable decision objects.

### LangGraph Workflow Layer

The LangGraph workflow layer owns the audit process.

Conceptual graph nodes:

- `ingest_evidence`
- `normalize_evidence`
- `classify_task_scope`
- `check_protocol_rules`
- `detect_missing_evidence`
- `generate_structured_decision`
- `human_review`
- `persist_audit_result`

LangGraph is the right fit because the audit is a stateful workflow, not a single prompt. The graph can make each step explicit, persist state between steps, and pause for human review before the final decision is accepted.

### Protocolo Rick Rule Layer

The Protocolo Rick layer defines delivery-state rules.

Conceptual rules:

- A task cannot move to READY without scoped intent.
- A commit cannot be approved without raw evidence of changed files and validation state.
- A push cannot be approved without clean post-commit state and remote comparison evidence.
- Remote DONE cannot be confirmed without evidence that local and remote state match.
- Missing or contradictory evidence blocks advancement.
- Human review remains required for delivery-state transitions.

### Persistence Layer

The future persistence layer stores audit results and workflow checkpoints.

Conceptual records:

- Audit ID.
- Task ID.
- Input evidence snapshot.
- Normalized evidence.
- Protocol findings.
- Structured decision.
- Human reviewer decision.
- Final audit result.
- Timestamp and version metadata.

No database is created in RIC-STUDIO-038A.

## Agent Workflow

### 1. Ingest Evidence

Collect raw evidence from the developer or future internal tools.

The auditor records what was provided and what was not provided.

### 2. Normalize Evidence

Convert raw evidence into a consistent internal representation.

Examples:

- File lists.
- Command outputs.
- Task IDs.
- Current state.
- Claimed next action.

### 3. Classify Task Scope

Compare the requested action and changed evidence against the authorized task scope.

Possible scope classifications:

- `in_scope`
- `out_of_scope`
- `unclear`
- `mixed`

### 4. Check Protocol Rules

Evaluate Protocolo Rick rules for the requested transition.

Examples:

- Discussion Gate to READY.
- IN_PROGRESS to REVIEW.
- REVIEW to commit allowed.
- Local DONE to push allowed.
- Remote evidence to Remote DONE.

### 5. Detect Missing Evidence

Identify required evidence that is absent, stale, contradictory, or unauditable.

The auditor should return specific missing evidence, not generic caution.

### 6. Generate Structured Decision

Return a typed decision object with a clear gate result.

The decision must be machine-readable and human-reviewable.

### 7. Human Review

Pause before accepting delivery-state movement.

The human reviewer can approve, reject, correct evidence, or request more evidence.

### 8. Persist Audit Result

Store the reviewed audit result so the project has an auditable delivery trail.

## Conceptual Decision Schema

```text
AuditDecision
- audit_id
- task_id
- requested_transition
- decision
- gate
- scope_status
- evidence_status
- missing_evidence[]
- protocol_findings[]
- allowed_actions[]
- blocked_actions[]
- human_review_required
- recommended_next_step
- audit_summary
```

## Conceptual Protocol Finding Schema

```text
ProtocolFinding
- rule_id
- rule_name
- status
- evidence_refs[]
- explanation
```

## Conceptual Evidence Item Schema

```text
EvidenceItem
- evidence_id
- source_type
- source_label
- captured_at
- content_summary
- raw_reference
- trust_level
```

## Future Internal Agent Tools

The following tools are future concepts only:

- `read_status`
- `read_backlog`
- `read_git_status`
- `read_diff_summary`
- `read_validation_output`
- `classify_scope`
- `check_protocol`
- `write_audit_record`

Each tool should return structured data. Tool results should be referenced by the final audit decision.

## MVP Validation Criteria

The conceptual MVP is valid when:

- The public README clearly positions RIC Studio as an AI-native portfolio project.
- The RIC AI Delivery Auditor product concept is understandable without private context.
- LangChain and LangGraph have clear, distinct architectural roles.
- The agent workflow is explicit from evidence ingestion to persisted audit result.
- Structured decision schemas are defined conceptually.
- Non-goals prevent accidental implementation creep.

## Current Non-Implementation Boundary

RIC-STUDIO-038A does not:

- Install LangChain.
- Install LangGraph.
- Add dependencies.
- Create an app, API, UI, or database.
- Implement tool calling.
- Implement structured output.
- Implement graph execution.
- Alter runtime files.
- Alter any `Modelfile`.
- Automate Git.
- Commit.
- Push.
