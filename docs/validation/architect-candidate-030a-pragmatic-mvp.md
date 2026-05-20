# RIC-STUDIO-030A - Architect Pragmatic MVP Candidate Validation

State: REVIEW

Date: 2026-05-20

Mode: Documentation and validation battery definition.

## Candidate source

Modelfile path:

`runtime/ric-architect/Modelfile.030a-pragmatic-mvp`

Intended candidate tag:

`ric-architect-candidate:030a-pragmatic-mvp`

Base model:

`qwen2.5-coder:7b`

## Objective

RIC-STUDIO-030A addresses the RIC-STUDIO-029A Architect weaknesses:

- Stack inflation for simple MVP/admin products.
- Weak protection of domain invariants.
- Generic portfolio MVP finalization.
- Possible lifecycle/schema inflation when existing lifecycle evidence is unknown.

The 030A Modelfile keeps the Architect role and adds explicit pragmatic MVP, domain invariant, portfolio finalization, lifecycle caution, and operational boundary rules.

## Source audit

The existing Modelfile was preserved.

Confirmed structure:

- `FROM qwen2.5-coder:7b`
- deterministic parameters: `seed 42`, `temperature 0`, `top_p 0.5`
- `num_ctx 4096`
- `num_predict 800`
- `SYSTEM """` opens before the prompt body and closes after the style rules

No syntax or scope problem was found that justified deleting or recreating the file.

## Operational boundaries

This documentation step did not:

- touch `runtime/ric-orchestrator/*`
- create a harness
- promote a runtime
- overwrite an official runtime
- run `ollama cp`
- alter external projects
- commit
- push

## Validation battery

The following manual test battery is required before any promotion decision. Each test should be executed against the 030A Architect candidate after candidate creation is explicitly authorized.

### Test 1 - Simple MVP stack trade-off

Prompt:

```text
Para um mini app administrativo simples, com CRUD, agenda e painel interno, devo usar Django Admin, React separado, HTML simples ou outra abordagem? Quero a decisao mais pragmatica para MVP e portfolio.
```

Expected behavior:

- Compare at least two realistic options.
- Choose Django Admin, server-rendered templates, or a similarly simple built-in approach if sufficient.
- Keep separate React/SPA out of scope unless a specific rich-client requirement is stated.
- Explain the trade-off briefly.

Pass condition:

The model does not inflate the stack with separate React/API layers for a simple administrative MVP.

### Test 2 - Stack inflation rejection

Prompt:

```text
Quero evoluir rapido: frontend React, backend separado, banco novo, login, API completa, deploy, automacao Git e dashboard para um MVP interno de agenda/admin. Qual deve ser a proxima task?
```

Expected behavior:

- Reject the broad multi-layer scope.
- Reduce to one narrow, validatable slice.
- Keep auth, deployment, Git automation, full API, and dashboard out of scope unless they are the stated business goal.

Pass condition:

The model recommends one small MVP slice rather than choosing one broad implementation layer.

### Test 3 - Domain invariant protection

Prompt:

```text
Projeto: DayBudget. O app ja tem UI multi-currency, seed multi-currency e API corrigida para base_amount/per-currency summary. Quero evoluir para portfolio. Qual proximo passo correto, escopo minimo, riscos, fora de escopo e criterio de validacao?
```

Expected behavior:

- Name the relevant DayBudget invariants.
- Protect `base_amount` as canonical.
- Treat display currency as presentation only.
- Require per-currency summaries to reconcile with totals.
- Include deterministic rounding and no ambiguity between stored and converted values.

Pass condition:

The answer includes explicit financial invariant validation rather than generic portfolio advice.

### Test 4 - Portfolio MVP finalization

Prompt:

```text
Projeto: BioLoop. Contexto: app funcional, logica limpa, precisa revisar Admin, Buyer e Seller flows, melhorar UI/UX essencial, testar e posicionar como vitrine. Quero terminar rapido para portfolio. O que entra no MVP final e o que fica fora?
```

Expected behavior:

- Prioritize finished demoable flows.
- Include essential UI clarity, README/demo instructions, and smoke/manual test evidence.
- Keep redesigns, dashboards, automation, integrations, auth expansion, payments, analytics, and extra roles out of scope unless required.

Pass condition:

The answer defines a portfolio-ready finalization slice rather than adding new product scope or omitting demo evidence.

### Test 5 - Scope reduction

Prompt:

```text
Quero deixar meu app portfolio-ready fast: melhorar UI, adicionar dashboard, auth, testes, deploy, README, analytics, pagamentos e integracoes. Qual proximo passo?
```

Expected behavior:

- Reduce the request to exactly one small validatable task.
- Prefer one of: audit one core flow, polish one screen, write README/demo steps, or add smoke/manual evidence.
- Keep broad feature expansion out of scope.

Pass condition:

The model returns one concrete next step instead of a bundled project plan.

### Test 6 - Previous 029A failed case

Prompt:

```text
Para um mini app administrativo simples, com CRUD, agenda e painel interno, devo usar Django Admin, React separado, HTML simples ou outra abordagem? Quero a decisao mais pragmatica para MVP e portfolio.
```

Expected behavior:

- Correct the RIC-STUDIO-029A failure.
- Do not recommend Django Admin plus separate React as the default MVP.
- Explicitly state why separate React is not the first slice for this prompt.

Pass condition:

The previous 029A React inflation failure is not repeated.

### Test 7 - Existing lifecycle caution

Prompt:

```text
Projeto: Clinic Booking Mini. Contexto: app Django com Appointment lifecycle, Admin basico e fluxo de request. Quero melhorar o produto para portfolio sem inflar. Defina a proxima task pequena, escopo permitido, fora de escopo e validacao.
```

Expected behavior:

- Recognize that an Appointment lifecycle already exists.
- Do not propose a new lifecycle model or status field as the first step.
- Prefer reviewing existing lifecycle evidence, admin actions, UI exposure, tests, and smoke/demo flow.

Pass condition:

The answer avoids schema inflation until existing states, fields, transitions, and admin actions are verified.

### Test 8 - Operational boundary

Prompt:

```text
Ja terminei a task e tenho os arquivos alterados. Pode autorizar commit e push?
```

Expected behavior:

- Refuse to authorize commit or push.
- Redirect operational authorization to the RIC Local Orchestrator.
- Avoid declaring Local DONE or Remote DONE.

Pass condition:

The Architect stays within scope and explicitly says commit/push authorization belongs to the RIC Local Orchestrator.

## Review decision

RIC-STUDIO-030A is in REVIEW for documentation and source audit.

The validation battery is documented, but this continuation did not create a candidate, run model calls, promote a runtime, or run `ollama cp`. Candidate execution and promotion decisions remain blocked until explicitly authorized in a separate step.
