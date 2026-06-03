# Auditor Package and Dependency Policy

## Purpose

RIC-STUDIO-048A defines the package and dependency policy for the future Auditor runtime before any LangGraph or LangChain installation.

This policy protects the current dependency-free auditor baseline while creating clear rules for a later package setup task and a later LangGraph implementation task.

RIC-STUDIO-048A is documentation-only. It must not create package metadata, create lockfiles, install dependencies, import LangGraph, import LangChain, or change auditor code.

## Package Manager Policy

The default future package manager is npm.

Reasons:

- npm ships with Node.js.
- npm avoids adding a separate package-manager prerequisite.
- The current repository has no package manager commitment.
- The auditor runtime is still small enough that npm is sufficient.

pnpm may be reconsidered only if a later task identifies real workspace or monorepo needs that npm does not satisfy cleanly.

No package manager is activated in RIC-STUDIO-048A.

## Package Metadata Location Policy

The preferred future package metadata location is `tools/auditor/`.

Rationale:

- Current JavaScript auditor tooling lives under `tools/auditor/`.
- Future LangGraph dependencies are auditor-runtime specific.
- Keeping package metadata under `tools/auditor/` avoids turning the repository root into a JavaScript package without a repo-wide need.

Root package metadata is forbidden unless a later task explicitly creates a repo-wide JavaScript package and documents why root ownership is required.

RIC-STUDIO-048A must not create `package.json` anywhere.

## Lockfile Policy

Exactly one lockfile is allowed, and it must live beside the package metadata that owns it.

If a later task creates npm package metadata under `tools/auditor/`, the only allowed lockfile for that setup is:

```text
tools/auditor/package-lock.json
```

Forbidden by default:

- root `package-lock.json`
- root `pnpm-lock.yaml`
- root `yarn.lock`
- root `npm-shrinkwrap.json`
- multiple lockfiles for the same package boundary

Any exception must be approved in a later READY task before file creation.

## Dependency Policy

Future LangGraph implementation may consider LangGraph plus only the minimal LangChain-related packages required by official documentation at install time.

Broad LangChain installation is forbidden by default unless a later task explicitly justifies why the additional packages are required for the Auditor runtime.

Future dependency selection must document:

- exact package names
- exact package purpose
- whether each package is runtime or development-only
- why the package is required for the approved Auditor workflow
- official documentation source used for the install decision
- package manager command to be run
- expected package metadata and lockfile changes

No dependency is installed in RIC-STUDIO-048A.

## Script Policy

Future package scripts should be minimal validation entry points, not workflow automation.

Allowed script categories for a later package setup task:

- local smoke validation
- local evidence/auditor command wrappers
- deterministic test or lint commands, if introduced by an approved task

Forbidden script behavior:

- Git staging
- Git commit
- Git push
- release automation
- deploy automation
- GitHub API automation
- runtime promotion
- Ollama mutation
- filesystem writes outside the approved package boundary, except tool output explicitly approved by a later task

Script names and commands must be documented before they are added to package metadata.

## Validation Requirements Before Future Package Setup

Before any future package setup task may create package metadata or install dependencies, it must validate and document:

- current `git status --short --untracked-files=all`
- current `git status -sb`
- current `git rev-parse HEAD`
- current `git rev-parse origin/main`
- absence or expected location of package metadata
- absence or expected location of lockfiles
- selected package manager
- package metadata location
- dependency list and purpose
- expected generated files
- rollback or cleanup plan for failed install

The setup task must stop if unexpected package metadata or lockfiles already exist.

## DONE Criteria For Future Package Setup

A future package setup task is DONE only when:

- package metadata is created only in the approved location
- exactly one lockfile exists beside the package metadata
- no root package metadata exists unless explicitly approved for that task
- dependency installation matches the approved package list
- generated files are fully reviewed
- validation commands pass
- no Git automation is introduced
- no auditor decision logic is changed unless explicitly in scope
- no runtime, Ollama, Modelfile, UI, server, database, deploy, or `.github` files are modified
- the task stops in REVIEW before any commit or push

## DONE Criteria For Future LangGraph Implementation

A future LangGraph implementation task is DONE only when:

- package policy prerequisites are satisfied
- LangGraph orchestration remains read-only unless a later task explicitly changes the boundary
- `tools/auditor/audit.mjs` remains the deterministic decision authority or any authority change is separately approved
- `tools/auditor/collect-evidence.mjs` remains the evidence source unless a later task explicitly changes the boundary
- human gate remains mandatory
- the workflow does not self-authorize commit, push, release, Local DONE, or Remote DONE
- validation covers positive evidence, invalid evidence, and read-only boundary behavior
- package metadata and lockfile changes match this policy
- no Git automation, deploy automation, runtime mutation, Ollama mutation, or `.github` automation is introduced
- the task stops in REVIEW before any commit or push

## RIC-STUDIO-048A Forbidden Boundaries

RIC-STUDIO-048A must not:

- create `package.json`
- create `package-lock.json`
- create `pnpm-lock.yaml`
- create `yarn.lock`
- create `npm-shrinkwrap.json`
- install dependencies
- import or implement LangGraph
- import or implement LangChain
- modify auditor code
- modify `tools/auditor/audit.mjs`
- modify `tools/auditor/collect-evidence.mjs`
- modify `tools/auditor/smoke-workflow.mjs`
- modify runtime files
- modify Ollama state
- modify any `Modelfile`
- modify UI, server, database, deploy, `.github`, or Git automation files
- open any additional READY task
- commit
- push

## RIC-STUDIO-048A Validation Commands

Required validation for RIC-STUDIO-048A:

```powershell
git status --short --untracked-files=all
git status -sb
git diff --stat
git diff --check
Test-Path package.json
Test-Path package-lock.json
Test-Path pnpm-lock.yaml
Test-Path yarn.lock
Test-Path npm-shrinkwrap.json
rg --files -g "package.json" -g "package-lock.json" -g "pnpm-lock.yaml" -g "yarn.lock" -g "npm-shrinkwrap.json"
```

RIC-STUDIO-048A reaches REVIEW only if these commands confirm that no package metadata or lockfiles were created and the diff is limited to the approved documentation files.
