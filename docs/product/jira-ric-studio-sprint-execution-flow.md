# Jira + RIC Studio Sprint Execution Flow

RIC Studio uses Jira as the official start of execution, not as the start of the idea.

The idea starts earlier in strategic conversation with Ricardo and the Architect/Product Strategist. That conversation frames the need, evaluates whether it should become a task, and defines the smallest useful scope before execution starts.

## Agent Responsibilities

The Architect Agent works before Jira. It discusses the idea, checks strategic fit, defines the candidate task, identifies allowed and forbidden scope, and decides whether the work is ready for a Jira card.

The Orchestrator Agent works after Jira. It executes only the approved Jira and RIC Studio scope, gathers evidence, stops at gates, and does not expand the task without a new discussion gate.

After Jira, the process is standardized and semi-automatic with mandatory gates. It is not fully automatic. Human approval remains required for scope, validation, commit, push, and final acceptance.

## Official Flow

1. Idea / Need.
2. Sprint Planning Gate with Architect Agent.
3. Task Candidate approved.
4. Jira card created.
5. Jira READY.
6. Jira IN PROGRESS.
7. RIC Studio shows project context, active agent, gates, commit/push blocks, and validation dependency.
8. Orchestrator executes only the approved scope.
9. Evidence Review.
10. Commit Gate.
11. Push Gate.
12. Manual Validation Gate.
13. Jira REVIEW / DONE.
14. Discussion Gate before the next task.

## Gate Rules

No task reaches DONE only because a commit or push occurred.

DONE requires Ricardo validation or explicit acceptance with caveat. If acceptance includes a caveat, the caveat must be recorded in the task evidence or operational documentation.

The Commit Gate and Push Gate are delivery control points only. They can prove that a scoped change was committed or synchronized, but they do not replace manual validation.

The Manual Validation Gate confirms whether the delivered result satisfies the approved objective. Only after that validation, or Ricardo's explicit acceptance with caveat, can Jira move to REVIEW / DONE.

## Automation Boundary

RIC Studio may standardize prompts, evidence expectations, visibility, and gate checks. It must not automatically open follow-up READY tasks.

Every next task must pass a Discussion Gate before entering READY.

RIC Studio must not use Jira API or GitHub API integration unless a future task explicitly approves that scope.

## RIC-STUDIO-073A Result

RIC-STUDIO-073A documents this official flow as a documentation-only task.

No code, UI, `tools/`, `runtime/`, package, lockfile, dependency, deploy, Jira API, GitHub API, automatic follow-up task, commit, or push action is part of this task execution.
