# Runtime Source Strategy

## Previous problem

`ric-orchestrator-runtime:latest` existed locally, but its source was not versioned in the repository. The repository had no official Modelfile or system prompt source that could be audited, patched, rebuilt, tested, and promoted safely.

RIC-STUDIO-004A was blocked because using generated output from an unversioned local runtime would not create a trustworthy source of truth.

## Decision

RIC-STUDIO-004B creates a clean versioned runtime source from scratch.

This source does not claim to be the original old Modelfile. It is an intentionally authored source for the RIC Local Orchestrator going forward.

## Source of truth

The source of truth is:

`runtime/ric-orchestrator/Modelfile`

Any future runtime patch must edit this versioned source and include raw diff evidence.

## Promotion rule

The official runtime tag must not be replaced directly.

Future runtime work must:

- Build a candidate model from `runtime/ric-orchestrator/Modelfile`.
- Test the candidate against the required gate scenarios.
- Record raw candidate test evidence.
- Promote to `ric-orchestrator-runtime:latest` only after validation passes.
- Re-test the official runtime after promotion.

## RIC-STUDIO-004B boundary

RIC-STUDIO-004B creates source only. It does not create a candidate model, promote the official runtime tag, run behavioral model tests, train a model, tune a model, create scripts, create UI, create an app, add dependencies, add Git automation, add GitHub API integration, add database, login, or deploy behavior.
