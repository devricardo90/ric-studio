# RIC Local Orchestrator Runtime Source

## Purpose

This directory contains the official versioned runtime source for the RIC Local Orchestrator going forward.

The runtime defines local orchestration behavior for discussion gates, READY state, execution review, Local DONE, commit authorization, push authorization, Remote DONE validation, and prevention of unauthorized READY creation.

## Why this exists

Earlier local runtime work used `ric-orchestrator-runtime:latest`, but the repository did not contain a versioned Modelfile or system prompt source for that runtime. That made future runtime patches hard to audit, rebuild, test, and promote safely.

RIC-STUDIO-004B creates a clean versioned source so runtime behavior can be reviewed in Git before any model tag is rebuilt or promoted.

## Source status

`runtime/ric-orchestrator/Modelfile` is the official versioned source going forward.

It is a clean authored source. It is not recovered from the old local runtime and does not claim to be the original old Modelfile.

## Candidate build example

Do not promote directly to the official runtime tag. A later validation task must build and test a candidate first:

```powershell
ollama create ric-orchestrator-runtime-candidate:latest -f runtime/ric-orchestrator/Modelfile
```

## Promotion rule

Promotion to `ric-orchestrator-runtime:latest` is blocked until a later validation task confirms that the candidate passes the required gate scenarios.

RIC-STUDIO-004B does not create a candidate model, does not overwrite `ric-orchestrator-runtime:latest`, and does not run behavioral model tests.
