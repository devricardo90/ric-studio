# RIC Studio Product Requirements

## Product definition

RIC Studio is a local-first product for controlled software work. Its first product surface is not a UI or cloud service. It is a documented local operating model that defines how work is discussed, scoped, validated, and promoted through explicit states.

Local-first means the authoritative workflow runs from the local repository and local evidence. Remote systems may exist later, but they are not the control plane for the MVP.

## MVP definition

The MVP is documentation and operational control only. It establishes:

- Product scope.
- Agent responsibilities.
- Official workflow states.
- Local validation expectations.
- Runtime strategy for local orchestration.
- Explicit blocked areas for implementation work.

The MVP does not include application features, user accounts, deployment, automation, persistent product data, or external integrations.

## Official agents

RIC Studio has two official agents in the MVP:

- RIC Architect.
- RIC Local Orchestrator.

RIC Architect owns discussion, scope, architecture, and task design. RIC Local Orchestrator owns evidence, validation, commit and push gate decisions, and repository state control.

## Official states

RIC Studio uses these official states:

- Discussion Gate.
- READY.
- IN_PROGRESS.
- Local DONE.
- Remote DONE.

## Non-goals for RIC-STUDIO-001

RIC-STUDIO-001 does not create UI, a Next.js app, dependencies, scripts, Git automation, Modelfile changes, model training or tuning, IDE integration, GitHub integration, database, login, or deploy behavior.
