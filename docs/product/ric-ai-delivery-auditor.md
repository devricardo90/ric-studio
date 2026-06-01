# RIC AI Delivery Auditor

## Product Positioning

RIC AI Delivery Auditor is the public product concept for RIC Studio.

It is an AI-native software delivery tool that audits development evidence, validates task state transitions, and helps developers make safer commit, push, and release decisions using structured agentic reasoning.

RIC Studio remains the repository and portfolio container. No new repository is required.

## Portfolio Message

RIC Studio demonstrates practical AI-native development through:

- Agentic workflow design.
- Structured validation.
- Evidence-based delivery gates.
- Human-in-the-loop review.
- Protocol-driven state transitions.
- Clear separation between recommendation, execution, and approval.

The project is not positioned as a generic chatbot. It is positioned as a delivery audit system that can reason over task state, local evidence, and protocol rules.

## Problem

AI-assisted delivery often fails at the boundary between "the work seems done" and "the work is safe to move forward."

Common failure modes include:

- Missing or incomplete evidence.
- Invented command output.
- Scope drift.
- Premature commit or push recommendations.
- State transitions without validation.
- Human approval hidden behind automation.

RIC AI Delivery Auditor addresses those failures by turning delivery decisions into structured audits.

## Target User

The initial target user is a developer using AI-assisted coding workflows who wants a stricter review layer before commit, push, or release.

The portfolio audience is technical recruiters, engineering leads, and AI tooling reviewers who need to see evidence of agentic workflow design, not only application screens.

## Public MVP

The public MVP is conceptual and documentation-first.

It defines:

- The RIC AI Delivery Auditor product concept.
- The Protocolo Rick delivery model.
- The LangChain and LangGraph architecture direction.
- The evidence audit workflow.
- Structured decision schemas.
- Future internal agent tools.
- Portfolio success criteria.

It does not implement the runtime yet.

## Protocolo Rick

Protocolo Rick is the operating model behind the auditor.

Its core rule is simple: delivery state must not advance without clear scope, concrete evidence, and an explicit reviewed decision.

Conceptual state gates include:

- Discussion Gate.
- READY.
- IN_PROGRESS.
- REVIEW.
- Local DONE.
- Remote DONE.

The auditor's job is not to replace the developer. Its job is to make the decision boundary explicit and auditable.

## LangChain Role

LangChain is the planned agent layer.

In the public MVP design, LangChain will be used for:

- Model invocation.
- Tool calling.
- Structured output generation.
- Typed decision responses.
- Agent-level policy and prompt orchestration.

The design follows LangChain's documented direction for agents, tools, and structured responses. Implementation is out of scope for the current task.

## LangGraph Role

LangGraph is the planned workflow layer.

In the public MVP design, LangGraph will be used for:

- Explicit audit workflow nodes.
- State transitions between audit steps.
- Human-in-the-loop pauses.
- Persistence of graph state and audit checkpoints.
- Durable execution for resumable review flows.

The graph is the key proof that the product is agentic workflow software, not just prompt text.

## Conceptual Agent Workflow

The workflow is:

1. Ingest evidence.
2. Normalize evidence.
3. Classify task scope.
4. Check protocol rules.
5. Detect missing evidence.
6. Generate structured decision.
7. Human review.
8. Persist audit result.

Each step has a narrow responsibility. The workflow should make it clear why a commit, push, release, or READY transition is allowed or blocked.

## Conceptual Structured Decisions

The auditor should return a structured decision object rather than a free-form answer.

Conceptual fields:

- `decision`: allowed, blocked, needs_review, or rejected.
- `gate`: discussion, ready, commit, push, release, local_done, or remote_done.
- `task_id`: current task identifier.
- `scope_status`: in_scope, out_of_scope, unclear, or mixed.
- `evidence_status`: complete, missing, contradictory, stale, or unaudited.
- `missing_evidence`: list of required evidence items.
- `protocol_findings`: list of rule checks and results.
- `recommended_next_step`: specific next human action.
- `human_review_required`: boolean.
- `audit_summary`: short explanation for the reviewer.

The exact schema may evolve during implementation, but the public contract is that delivery decisions are typed, inspectable, and reviewable.

## Future Internal Tools

Future internal agent tools are conceptual only in this task:

- `read_status`: inspect current project state.
- `read_backlog`: inspect task state and queue.
- `read_git_status`: ingest raw Git state.
- `read_diff_summary`: ingest changed file evidence.
- `read_validation_output`: ingest test or check output.
- `classify_scope`: compare evidence against task scope.
- `check_protocol`: evaluate Protocolo Rick rules.
- `write_audit_record`: persist the reviewed audit result.

No tools are implemented in this task.

## Portfolio Success Criteria

RIC Studio succeeds as a portfolio project when a reviewer can understand:

- What product is being built.
- Why the project is AI-native.
- How LangChain and LangGraph fit the design.
- How the workflow handles evidence, state, missing information, and human review.
- Why structured decisions are safer than free-form model responses.
- What remains intentionally unimplemented.

## Explicit Non-Goals

This task does not:

- Create a new repository.
- Create `apps/web`.
- Create `apps/api`.
- Install LangChain.
- Install LangGraph.
- Add dependencies.
- Create a database.
- Create UI.
- Implement AI integration.
- Alter runtime files.
- Alter any `Modelfile`.
- Automate Git.
- Commit.
- Push.
