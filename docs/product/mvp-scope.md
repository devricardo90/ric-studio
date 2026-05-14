# RIC Studio MVP Scope

## MVP boundary

The RIC Studio MVP is documentation and operational control only. It defines the local product operating model before any implementation work begins.

## Included

- Local-first product definition.
- Agent role definitions.
- Official workflow states.
- Local architecture documentation.
- Model runtime strategy.
- Status, backlog, execution log, and session handoff documentation.
- Human review checkpoint after documentation changes.

## Excluded

- UI.
- Next.js app.
- IDE integration.
- Git automation.
- GitHub API integration.
- Database.
- Login.
- Deploy.
- Scripts.
- Modelfile changes.
- Model training.
- Model tuning.
- Model changes.

## MVP operating rule

No implementation task may be opened as READY from RIC-STUDIO-001. This task stops in REVIEW and waits for a trigger review decision.

## Success criteria

RIC-STUDIO-001 is successful when the repository contains a coherent documentation baseline for RIC Studio's local-first MVP, agent roles, states, architecture, runtime strategy, and operational control files.
