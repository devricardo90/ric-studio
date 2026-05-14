# Local Product Architecture

## Local-first architecture

RIC Studio is local-first. The local repository is the source of truth for product scope, operational state, validation evidence, and handoff records during the MVP.

The MVP control plane is documentation-based. It does not depend on a hosted service, application database, login system, GitHub API, deployment environment, or IDE extension.

## Control surfaces

The initial local control surfaces are:

- `STATUS.md` for top-level state.
- `backlog.md` for top-level backlog state.
- `docs/ops/status.md` for operational state.
- `docs/ops/backlog.md` for operational backlog state.
- `docs/ops/execution-log.md` for evidence and validation history.
- `docs/ops/session-handoff.md` for continuity between sessions.

## Execution boundary

RIC-STUDIO-001 is documentation only. It does not create runtime services, automation scripts, UI, app framework files, database schema, remote integration, or model configuration changes.

## State authority

RIC Local Orchestrator is the state-control authority after execution begins. State movement must be backed by local evidence and recorded in operational documentation.

## Remote boundary

Remote DONE is a documented state but is not automated in the MVP. Any future remote operation must be explicitly scoped in a later task after passing the Discussion Gate.
