# Model Runtime Strategy

## Official local orchestration runtime

`ric-orchestrator-runtime:latest` is the official local orchestration runtime for RIC Studio.

It is the only runtime registered for local orchestration gate decisions in the MVP.

## Lab and reference runtime

`ric-orchestrator-v3:latest` is lab/reference only.

It may inform future thinking, but it is not the official local orchestration runtime and must not be treated as the authority for final gate decisions.

## Superseded runtime

`ric-orchestrator-v2:latest` is superseded and unsafe for final gate decisions.

It must not be used as the authority for Local DONE, commit readiness, push readiness, or state-control decisions.

## Blocked runtime work

RIC-STUDIO-001 does not change any Modelfile, train models, tune models, create model variants, or alter model runtime behavior.
