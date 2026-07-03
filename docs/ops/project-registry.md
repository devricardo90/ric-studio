# Project Registry

Local read-only project registry for the Operator Dashboard. This file is the manual source of truth for cross-project visibility. It is not synced from GitHub, Jira, Docker, or any running agent.

## RIC Studio

- Description: Local-first operational control system for task gates, evidence, local auditor workflow, and operator visibility.
- Local path: C:\Users\ricardodev\Desktop\ric-studio
- GitHub repository: https://github.com/devricardo90/ric-studio.git
- Current operational state: RIC-STUDIO-082A is in REVIEW with local changes only; controlled sprint/task registry and dashboard visibility are implemented, no commit or push. RIC-STUDIO-081A is Remote DONE at commit 9f820a02fe71c1a8e5bb0e108f94fc902e5bbd5d.
- Local run/view status: Operator Dashboard running at http://localhost:4310.
- Next gate/action: Review RIC-STUDIO-082A evidence, then owner decides whether to authorize commit. Push remains blocked until separate owner approval after commit evidence.
- Source note: Current repository and operational docs.

## DayBudget

- Description: Personal budgeting application; latest controlled sprint automation pilot records DAY-9 / WEB-027A manual transfer filters as READY in RIC Studio.
- Local path: C:\Users\ricardodev\Desktop\day-budget
- GitHub repository: Not confirmed in current RIC Studio docs.
- Current operational state: WEB-027A is represented in the local Sprint Automation Registry only; DayBudget repository files were not modified.
- Local run/view status: Not started in this session; expected local endpoints are API http://localhost:8080, Web http://localhost:3000, Postgres 127.0.0.1:5437.
- Next gate/action: Review RIC-STUDIO-082A evidence; DayBudget implementation remains a separate future task.
- Source note: docs/ops/sprint-task-registry.json and current handoff docs.

## Rick Travel

- Description: Travel project placeholder for future local visibility.
- Local path: Not confirmed in current RIC Studio docs.
- GitHub repository: Not confirmed in current RIC Studio docs.
- Current operational state: Not yet registered in RIC Studio operational docs.
- Local run/view status: Not started; local command unknown.
- Next gate/action: Confirm repository path, purpose, current state, and local run command before implementation or automation.
- Source note: Owner requested dashboard visibility for Rick Travel; details remain to be confirmed locally.
