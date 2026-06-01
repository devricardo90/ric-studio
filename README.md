# RIC Studio

RIC Studio is an AI-native software delivery portfolio project.

It explores how agentic workflows can audit development evidence, validate delivery state transitions, and support safer commit, push, and release decisions before automation is allowed to act.

## Public Concept

The public product concept is **RIC AI Delivery Auditor**.

RIC AI Delivery Auditor is an AI-native software delivery tool that audits development evidence, validates task state transitions, and helps developers make safer commit, push, and release decisions using structured agentic reasoning.

The project is intentionally documentation-first at this stage. The current repository defines the product scope, conceptual MVP, agent workflow, structured decision model, and operating protocol before adding runtime integrations.

## Why This Exists

Modern AI-assisted development can generate code quickly, but delivery still depends on evidence:

- Was the task scope clear?
- Were the right files changed?
- Were tests or checks actually run?
- Is evidence missing, stale, or contradictory?
- Is the task ready for commit, push, release, or human review?

RIC Studio frames those questions as a structured audit workflow instead of a free-form chat response.

## LangChain And LangGraph Direction

The intended public MVP uses LangChain and LangGraph as the technical proof for the AI-native workflow:

- **LangChain** provides the agent layer for model interaction, tool calling, and structured output.
- **LangGraph** provides the workflow layer for explicit audit steps, state transitions, persistence, and human-in-the-loop review.

The MVP does not install or run LangChain or LangGraph yet. This repository currently documents the product and architecture boundary only.

## Conceptual Agent Workflow

The RIC AI Delivery Auditor workflow is:

1. Ingest evidence.
2. Normalize evidence.
3. Classify task scope.
4. Check protocol rules.
5. Detect missing evidence.
6. Generate a structured decision.
7. Request human review.
8. Persist the audit result.

The workflow is based on the Protocolo Rick operating model: no delivery state should advance without explicit scope, concrete evidence, and a reviewed decision.

## Conceptual MVP

The first public MVP is documentation-only:

- Public product positioning.
- Conceptual architecture.
- Agent workflow definition.
- Structured decision schemas.
- Future internal tool definitions.
- Portfolio success criteria.
- Operational records for task state and validation.

The MVP excludes application code, UI, API, database, dependency installation, runtime changes, Git automation, and real AI integration.

## Documentation

- [Product concept](docs/product/ric-ai-delivery-auditor.md)
- [LangChain AI Delivery Auditor MVP architecture](docs/architecture/langchain-ai-delivery-auditor-mvp.md)
- [Product requirements](docs/product/prd.md)
- [MVP scope](docs/product/mvp-scope.md)
- [Local product architecture](docs/architecture/local-product-architecture.md)

## Current Status

RIC Studio is in a documentation and operating-model phase. The repository should demonstrate clear AI-native delivery thinking before implementation begins.

## Technical References

- LangChain agents: https://docs.langchain.com/oss/python/langchain/agents
- LangChain structured output: https://docs.langchain.com/oss/python/langchain/structured-output
- LangGraph persistence: https://docs.langchain.com/oss/javascript/langgraph/persistence
- LangGraph human-in-the-loop: https://docs.langchain.com/oss/python/langgraph/human-in-the-loop
