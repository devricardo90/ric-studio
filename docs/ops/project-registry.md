# Project Registry

Local read-only project registry for the Operator Dashboard. This file is the manual source of truth for cross-project visibility. It is not synced from GitHub, Jira, Docker, or any running agent.

## RIC Studio

- Description: Local-first operational control system for task gates, evidence, local auditor workflow, and operator visibility.
- Local path: `C:\Users\ricardodev\Desktop\ric-studio`
- GitHub repository: `https://github.com/devricardo90/ric-studio.git`
- Current operational state: REVIEW; no active READY task; RIC-STUDIO-080A implementation is awaiting owner review.
- Local run/view status: Operator Dashboard running at `http://localhost:4310`.
- Next gate/action: Complete owner review for RIC-STUDIO-080A before staging, commit, or push.
- Source note: Current repository and operational docs.

## DayBudget

- Description: Personal budgeting application; latest known RIC Studio context records WEB-026A / DAY-7 manual transfer creation flow as Remote DONE.
- Local path: `C:\Users\ricardodev\Desktop\day-budget`
- GitHub repository: Not confirmed in current RIC Studio docs.
- Current operational state: Remote DONE baseline for WEB-026A / DAY-7; browser/manual smoke is not yet recorded as complete.
- Local run/view status: Not started in this session; expected local endpoints are API `http://localhost:8080`, Web `http://localhost:3000`, Postgres `127.0.0.1:5437`.
- Next gate/action: After RIC Studio dashboard inspection, start DayBudget local stack by explicit owner direction.
- Source note: `docs/ops/external-execution-context.md` and current handoff docs.

## Rick Travel

- Description: Travel project placeholder for future local visibility.
- Local path: Not confirmed in current RIC Studio docs.
- GitHub repository: Not confirmed in current RIC Studio docs.
- Current operational state: Not yet registered in RIC Studio operational docs.
- Local run/view status: Not started; local command unknown.
- Next gate/action: Confirm repository path, purpose, current state, and local run command before implementation or automation.
- Source note: Owner requested dashboard visibility for Rick Travel; details remain to be confirmed locally.
