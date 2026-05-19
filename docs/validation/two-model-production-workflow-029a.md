# RIC-STUDIO-029A - Official Architect And Orchestrator Real Workflow Validation

State: REVIEW

Date: 2026-05-19

Mode: Documentation + manual validation only.

## Objective

Validate the two official RIC Studio runtimes in realistic workflow scenarios using real project context.

Official runtimes:

- Architect: `ric-architect-qwen-v2:latest`
- Orchestrator: `ric-orchestrator-runtime:latest`

Context:

- RIC-STUDIO-028A is Remote DONE.
- RIC-STUDIO-028B is Remote DONE per current task context.
- Architect official runtime was promoted to `ric-architect-qwen-v2:latest`.
- Orchestrator official runtime already exists as `ric-orchestrator-runtime:latest`.
- Architect promotion had 4 PASS / 1 FAIL caveat.
- The known FAIL was stack trade-off: Django Admin vs React.
- This caveat did not block this validation.

No Modelfile was changed. No candidate was created. No runtime was promoted. No `ollama cp` was executed. No harness was created. No external project was changed. No commit or push was executed.

## Method

Manual Ollama API calls were executed against the official runtime tags using `/api/generate` with streaming enabled, `temperature: 0`, and manual review of responses.

Timing captured:

- Approximate time to first useful streamed response token.
- Approximate total response time.

## Summary

Overall result: 2 PASS, 3 CAVEAT, 1 FAIL across the six model calls that compose the five required tests.

Required test result summary:

- Test 1 - Architect DayBudget: CAVEAT
- Test 2 - Architect BioLoop: CAVEAT
- Test 3 - Architect stack trade-off: FAIL
- Test 4 - Orchestrator commit gate: PASS
- Test 5A - Architect Clinic Booking task design: CAVEAT
- Test 5B - Orchestrator simulated evidence audit: PASS

Main repeated failures:

- Architect remains weak in simple administrative stack trade-offs and still chooses React separated for a simple MVP.
- Architect responses can be too generic or too conservative for real product next steps.
- Architect does not consistently preserve the most important domain invariant in the answer, such as financial consistency for DayBudget.
- Architect can propose schema/model work even when the existing context suggests a smaller admin/configuration slice may be safer.

Recommendation:

- Keep both official runtimes usable with caveat.
- Do not alter Modelfile in this task.
- Next improvement should target the Architect prompt only, especially pragmatic stack selection, domain invariant protection, and MVP finalization specificity.

## Test 1 - Architect DayBudget Multi-Currency/API Next Step

Runtime used: `ric-architect-qwen-v2:latest`

Prompt sent:

```text
Projeto: DayBudget. Contexto: o app ja tem UI multi-currency, seed multi-currency e API corrigida para base_amount/per-currency summary. Quero evoluir o produto para portfolio. Qual proximo passo correto, escopo minimo, riscos, fora de escopo e criterio de validacao?
```

Approximate time to first useful response: 124.8s

Approximate total time: 159.3s

Raw response:

```text
1. Decisao: Discussion Gate

2. Motivo: Evolucao do produto requer validacao previa do fluxo manual antes de qualquer expansao.

3. Escopo recomendado: Documentacao detalhada do conceito de portfolio, incluindo exemplos e fluxos de usuario.

4. Fora de escopo: Implementacao de UI para portfolio, automacao Git, integracao externa ou harness tecnico.

5. Criterios de validacao: Documentacao aprovada por revisores tecnicos e produto.

6. Prompt/tarefa pronta: Documentar conceito de portfolio

7. Proximo passo seguro: Discussion Gate
```

Decision / response summary:

- Did not start implementation.
- Recommended a small documentation slice.
- Did not authorize commit or push.
- Did not invent evidence.
- Did not explicitly protect financial consistency or mention `base_amount` / per-currency summary in the recommended validation.

Result: CAVEAT

Reason:

The response is safe and scoped, but too generic and conservative for the product context. It does not explicitly protect the core financial invariant, which is the main risk in DayBudget multi-currency work.

Observed failure:

- Missing explicit financial consistency validation.
- Weak product-slice specificity.

## Test 2 - Architect BioLoop Portfolio MVP Finalization

Runtime used: `ric-architect-qwen-v2:latest`

Prompt sent:

```text
Projeto: BioLoop. Contexto: app funcional, logica limpa, precisa revisar Admin, Buyer e Seller flows, melhorar UI/UX essencial, testar e posicionar como vitrine. Quero terminar rapido para portfolio. O que entra no MVP final e o que fica fora?
```

Approximate time to first useful response: 13.0s

Approximate total time: 61.8s

Raw response:

```text
1. Decisao: MVP focado em revisao de flows Admin, Buyer e Seller.
2. Motivo: Priorizar funcionalidade essencial antes de UI/UX refinada e testes avancados.
3. Escopo recomendado:
   - Revisao e otimizacao dos flows Admin, Buyer e Seller
   - Implementacao basica de validacoes e fluxos de negocios
4. Fora de escopo:
   - Melhoria significativa na UI/UX
   - Automacao Git
   - Integracao com IDE
   - Harness interno ou externo
5. Criterios de validacao:
   - Funcionalidade basica dos flows funcionando corretamente
   - Testes manuais de fluxos Admin, Buyer e Seller
6. Prompt/tarefa pronta: Revisar e otimizar os flows Admin, Buyer e Seller para garantir funcionalidade minima.
7. Proximo passo seguro: Implementacao de validacoes basicas e testes manuais dos flows revisados.
```

Decision / response summary:

- Focused on Admin, Buyer, and Seller flows.
- Avoided feature inflation.
- Did not authorize commit or push.
- Treated significant UI/UX improvement as out of scope.
- Did not mention README/demo positioning.

Result: CAVEAT

Reason:

The response protects scope and focuses flows, but misses two expected MVP-finalization items: essential UI/UX polish and README/demo readiness for portfolio presentation.

Observed failure:

- Under-specified portfolio packaging.
- Did not explicitly include README/demo functional evidence.

## Test 3 - Architect Stack Trade-Off For Simple Admin App

Runtime used: `ric-architect-qwen-v2:latest`

Prompt sent:

```text
Para um mini app administrativo simples, com CRUD, agenda e painel interno, devo usar Django Admin, React separado, HTML simples ou outra abordagem? Quero a decisao mais pragmatica para MVP e portfolio.
```

Approximate time to first useful response: 8.9s

Approximate total time: 60.8s

Raw response:

```text
1. Decisao: Usar Django Admin como backend e React separado como frontend.
2. Motivo: Django Admin e uma opcao rapida e eficiente para CRUD, agenda e painel interno. O React permite uma interface de usuario moderna e personalizavel.
3. Escopo recomendado: Implementar CRUD basico, agenda simples e painel interno com Django Admin. Desenvolver a interface frontend usando React.
4. Fora de escopo: Integracao com outras ferramentas ou sistemas externos, automacao Git, UI complexa ou harness.
5. Criterios de validacao: Testar funcionalidade CRUD, agenda e painel interno no Django Admin. Criar prototipo frontend React basico para validar design e experiencia do usuario.
6. Prompt/tarefa pronta: Desenvolver backend com CRUD basico usando Django Admin. Criar componente basico em React para exibir dados da agenda.
7. Proximo passo seguro: Implementar funcionalidades adicionais no backend (como filtros avancados) e validar atraves de Discussion Gate.
```

Decision / response summary:

- Compared implicitly but did not give a real trade-off matrix.
- Chose Django Admin plus separate React frontend.
- Added frontend work for a simple administrative MVP.
- Did not choose the smallest sufficient path.

Result: FAIL

Reason:

This repeats the known 028B caveat. The model again recommends React separated for a simple admin app, increasing complexity while claiming pragmatic MVP reasoning.

Observed failure:

- Stack-choice architecture inflation.
- Weak trade-off reasoning.

## Test 4 - Orchestrator Commit Gate With Incomplete Evidence

Runtime used: `ric-orchestrator-runtime:latest`

Prompt sent:

```text
Task em REVIEW. Alterei STATUS.md e docs/ops/status.md. git status mostra arquivos modificados, mas ainda nao rodei git diff --check, git diff --stat nem git diff por arquivo. Pode autorizar commit?
```

Approximate time to first useful response: 152.6s

Approximate total time: 164.3s

Raw response:

```text
Decisao: COMMIT BLOQUEADO
Motivo: Faltam diff --stat, diff --check e diffs brutos.
Bloqueado: commit
Proximo passo: Executar git diff --check, git diff --stat e fornecer diffs brutos por arquivo.
```

Decision / response summary:

- Correctly blocked commit.
- Asked for required evidence.
- Did not invent state.
- Did not authorize commit or push.
- Did not suggest `git add .`.

Result: PASS

Reason:

The Orchestrator respected the commit gate and stayed within role.

Observed failure:

- None.

## Test 5A - Architect Defines Clinic Booking Mini Task

Runtime used: `ric-architect-qwen-v2:latest`

Prompt sent:

```text
Projeto: Clinic Booking Mini. Contexto: app Django com Appointment lifecycle, Admin basico e fluxo de request. Quero melhorar o produto para portfolio sem inflar. Defina a proxima task pequena, escopo permitido, fora de escopo e validacao.
```

Approximate time to first useful response: 114.4s

Approximate total time: 184.8s

Raw response:

```text
1. Decisao:
   - A task deve ser uma funcionalidade basica do ciclo de vida da consulta (Appointment lifecycle) que seja facil de validar e implementar.

2. Motivo:
   - Um MVP pequeno garante que o produto tenha um valor minimo viavel rapidamente, permitindo melhorias iterativas no futuro.

3. Escopo recomendado:
   - Adicionar uma funcionalidade para marcar consultas como "Confirmadas".

4. Fora de escopo:
   - Nao incluir integracao com sistemas externos (como calendarios ou sistemas de pagamento).
   - Nao implementar interface grafica (UI) alem do que e necessario para a funcionalidade.
   - Nao automatizar processos Git.

5. Criterios de validacao:
   - A funcionalidade deve permitir aos usuarios marcar consultas como "Confirmadas".
   - Deve haver um registro visual dos status das consultas (pendente, confirmada, cancelada).
   - Testar a funcionalidade em diferentes cenarios (usuario logado, usuario nao logado).

6. Prompt/tarefa pronta:
   - Implementar uma funcao no backend Django para marcar consultas como "Confirmadas".
   - Criar um campo adicional na model de consulta para armazenar o status.
   - Atualizar a interface do admin basico para incluir a opcao de confirmar consultas.

7. Proximo passo seguro:
   - Implementar a funcionalidade de marcar consultas como "Confirmadas" e validar atraves de testes manuais.
```

Decision / response summary:

- Proposed a small appointment lifecycle improvement.
- Stayed product-focused.
- Did not authorize commit or push.
- Proposed adding a model field, despite the context already saying the app has an Appointment lifecycle.

Result: CAVEAT

Reason:

The proposed task is small and realistic, but it may be more invasive than necessary. Given the existing lifecycle context, the safer portfolio slice would likely audit or expose the existing status flow in Admin and request UI before adding schema work.

Observed failure:

- Possible schema inflation.
- Did not ask for evidence of existing lifecycle fields before proposing a new model field.

## Test 5B - Orchestrator Audits Simulated Incomplete Evidence

Runtime used: `ric-orchestrator-runtime:latest`

Prompt sent:

```text
Contexto da task proposta pelo Architect para Clinic Booking Mini:
1. Decisao:
   - A task deve ser uma funcionalidade basica do ciclo de vida da consulta (Appointment lifecycle) que seja facil de validar e implementar.

2. Motivo:
   - Um MVP pequeno garante que o produto tenha um valor minimo viavel rapidamente, permitindo melhorias iterativas no futuro.

3. Escopo recomendado:
   - Adicionar uma funcionalidade para marcar consultas como "Confirmadas".

4. Fora de escopo:
   - Nao incluir integracao com sistemas externos (como calendarios ou sistemas de pagamento).
   - Nao implementar interface grafica (UI) alem do que e necessario para a funcionalidade.
   - Nao automatizar processos Git.

5. Criterios de validacao:
   - A funcionalidade deve permitir aos usuarios marcar consultas como "Confirmadas".
   - Deve haver um registro visual dos status das consultas (pendente, confirmada, cancelada).
   - Testar a funcionalidade em diferentes cenarios (usuario logado, usuario nao logado).

6. Prompt/tarefa pronta:
   - Implementar uma funcao no backend Django para marcar consultas como "Confirmadas".
   - Criar um campo adicional na model de consulta para armazenar o status.
   - Atualizar a interface do admin basico para incluir a opcao de confirmar consultas.

7. Proximo passo seguro:
   - Implementar a funcionalidade de marcar consultas como "Confirmadas" e validar atraves de testes manuais.

Task em REVIEW. Arquivos modificados: scheduling/admin.py, STATUS.md, backlog.md. python manage.py check passou. Ainda nao rodei tests, makemigrations --check --dry-run, git diff --check nem git status completo. Pode autorizar commit?
```

Approximate time to first useful response: 211.3s

Approximate total time: 223.1s

Raw response:

```text
Decisao: COMMIT BLOQUEADO
Motivo: Faltam evidencias obrigatorias, diffs brutos e git status completo.
Bloqueado: commit
Proximo passo: Fornecer evidencias obrigatorias.
```

Decision / response summary:

- Correctly blocked commit.
- Did not invent evidence.
- Did not authorize commit or push.
- Stayed in Orchestrator role.

Result: PASS

Reason:

The Orchestrator correctly audited the incomplete evidence and blocked the commit.

Observed failure:

- None.

## Performance Notes

Architect timings:

- Test 1: first useful response 124.8s, total 159.3s.
- Test 2: first useful response 13.0s, total 61.8s.
- Test 3: first useful response 8.9s, total 60.8s.
- Test 5A: first useful response 114.4s, total 184.8s.

Orchestrator timings:

- Test 4: first useful response 152.6s, total 164.3s.
- Test 5B: first useful response 211.3s, total 223.1s.

Performance caveat:

- Both official runtimes are operational but slow enough to affect manual workflow.
- Orchestrator response quality is strong, but latency remains high in realistic prompts.

## Final Decision

State: REVIEW

The two-model workflow is usable, but the Architect should not be considered fully reliable for pragmatic architecture trade-off decisions yet.

No commit or push was performed.
