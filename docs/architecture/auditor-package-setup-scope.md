# Auditor Package Setup Scope

## Purpose

RIC-STUDIO-049A defines the exact future package setup boundary for the Auditor runtime before package metadata, lockfiles, or dependencies are created.

This task is documentation-only. It narrows the later package setup task but does not perform package setup.

RIC-STUDIO-049A must not create package metadata, generate lockfiles, install dependencies, import LangGraph, import LangChain, or change auditor code.

## Future Package Metadata Location

The future package metadata location is:

```text
tools/auditor/
```

The only future allowed `package.json` path for the auditor runtime is:

```text
tools/auditor/package.json
```

Root package metadata remains forbidden unless a future task explicitly creates a repo-wide JavaScript package and documents why the repository root must own package metadata.

RIC-STUDIO-049A does not create `tools/auditor/package.json`.

## Future Npm Lockfile Handling

Lockfile generation remains postponed in RIC-STUDIO-049A.

If a later approved package setup task creates `tools/auditor/package.json` and uses npm, the only allowed npm lockfile path is:

```text
tools/auditor/package-lock.json
```

Root lockfiles remain forbidden for auditor-only package setup:

- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`
- `npm-shrinkwrap.json`

Multiple lockfiles remain forbidden.

## Postponed Work

The following work remains postponed:

- creating `tools/auditor/package.json`
- creating `tools/auditor/package-lock.json`
- creating any root package metadata
- creating any root lockfile
- installing dependencies
- importing LangGraph
- implementing LangGraph
- importing LangChain
- implementing LangChain
- modifying auditor code

## Allowed Future Package.json Fields

A later package setup task may define only fields needed for the auditor runtime package boundary.

Allowed future fields:

- `name`
- `version`
- `private`
- `type`
- `description`
- `scripts`
- `dependencies`
- `devDependencies`
- `engines`

Field rules:

- `private` should be `true`.
- `type` should be explicitly documented if set.
- `dependencies` and `devDependencies` must remain empty unless a later dependency-install task is approved.
- No publishing metadata is allowed unless a later task explicitly approves package publication.

## Allowed Future Npm Scripts

Future npm scripts should be local validation conveniences only.

Allowed script categories:

- run the read-only smoke workflow against approved fixtures
- run the deterministic auditor against approved fixtures
- run package metadata checks
- run future deterministic tests if approved by a later task

Possible future script names may include:

- `smoke`
- `audit:sample`
- `audit:commit-allowed`
- `audit:invalid-json`
- `check:package`

Script commands must be documented before creation. Scripts must use local Node.js commands and must not require network access by default.

## Forbidden Scripts

Future package scripts must not perform:

- `git add`
- `git commit`
- `git push`
- release automation
- deploy automation
- GitHub API automation
- package publishing
- dependency installation
- runtime promotion
- Ollama mutation
- `Modelfile` mutation
- database migration
- server startup as a side effect of validation
- writes outside an explicitly approved output path

No Git automation script is allowed.

## Dependency-Install Prerequisites

Before any dependency installation task, the task must document:

- current clean Git state
- exact package metadata path
- exact lockfile path
- selected package manager
- exact package names
- exact install command
- whether each package is runtime or development-only
- reason each package is required
- official documentation source for LangGraph/LangChain package selection
- expected generated files
- rollback or cleanup plan if installation fails

The task must stop if unexpected package metadata or lockfiles already exist.

## Validation Gates Before Package Setup

Before package setup can proceed in a later task, validation must include:

```powershell
git status --short --untracked-files=all
git status -sb
git rev-parse HEAD
git rev-parse origin/main
Test-Path package.json
Test-Path tools/auditor/package.json
Test-Path package-lock.json
Test-Path tools/auditor/package-lock.json
Test-Path pnpm-lock.yaml
Test-Path yarn.lock
Test-Path npm-shrinkwrap.json
rg --files -g "package.json" -g "package-lock.json" -g "pnpm-lock.yaml" -g "yarn.lock" -g "npm-shrinkwrap.json"
```

The later package setup task must explicitly explain any expected transition from absent files to created package metadata or lockfile files.

## DONE Criteria For Later Package Setup

A later package setup task is DONE only when:

- `tools/auditor/package.json` is the only package metadata created
- no root `package.json` exists
- `tools/auditor/package-lock.json` is the only lockfile created if npm is used
- no root lockfile exists
- no `pnpm-lock.yaml`, `yarn.lock`, or `npm-shrinkwrap.json` exists
- no dependencies are installed unless the task explicitly includes dependency installation
- LangGraph and LangChain remain absent unless the task explicitly includes them
- future scripts match the approved script policy
- no forbidden scripts are added
- no auditor authority file is modified
- no runtime, Ollama, Modelfile, UI, server, database, deploy, `.github`, or Git automation files are modified
- validation commands pass
- the task stops in REVIEW before commit or push

## RIC-STUDIO-049A Forbidden Boundaries

RIC-STUDIO-049A must not:

- create `package.json`
- create `tools/auditor/package.json`
- create `package-lock.json`
- create `tools/auditor/package-lock.json`
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

## RIC-STUDIO-049A Validation Commands

Required validation for RIC-STUDIO-049A:

```powershell
git status --short --untracked-files=all
git status -sb
git diff --stat
git diff --check
Test-Path package.json
Test-Path tools/auditor/package.json
Test-Path package-lock.json
Test-Path tools/auditor/package-lock.json
Test-Path pnpm-lock.yaml
Test-Path yarn.lock
Test-Path npm-shrinkwrap.json
rg --files -g "package.json" -g "package-lock.json" -g "pnpm-lock.yaml" -g "yarn.lock" -g "npm-shrinkwrap.json"
```

RIC-STUDIO-049A reaches REVIEW only if these commands confirm that no package metadata or lockfiles were created and the diff is limited to approved documentation files.
