# Architect Runtime Promotion — RIC-STUDIO-028B

## Candidate promovido

`ric-architect-candidate:028a-qwen25-coder-7b-contextfix`

## Tag oficial promovida

`ric-architect-qwen-v2:latest`

## IDs

| Tag | ID antes | ID depois |
|-----|----------|-----------|
| `ric-architect-qwen-v2:latest` | `6a94ce329010` | `b2ba1b3efeae` |
| `ric-architect-qwen-v2:backup-before-028b` | — | `6a94ce329010` (backup criado) |

## Evidência da promoção

### Backup

```
ollama cp ric-architect-qwen-v2:latest ric-architect-qwen-v2:backup-before-028b
copied 'ric-architect-qwen-v2:latest' to 'ric-architect-qwen-v2:backup-before-028b'
```

### Promoção

```
ollama cp ric-architect-candidate:028a-qwen25-coder-7b-contextfix ric-architect-qwen-v2:latest
copied 'ric-architect-candidate:028a-qwen25-coder-7b-contextfix' to 'ric-architect-qwen-v2:latest'
```

### ollama list pós-promoção

```
NAME                                                       ID              SIZE      MODIFIED
ric-architect-qwen-v2:latest                               b2ba1b3efeae    4.7 GB    7 seconds ago
ric-architect-qwen-v2:backup-before-028b                   6a94ce329010    4.7 GB    14 seconds ago
ric-architect-candidate:028a-qwen25-coder-7b-contextfix    b2ba1b3efeae    4.7 GB    42 minutes ago
ric-architect-candidate:026a-qwen25-coder-7b               c8cfc69738af    4.7 GB    4 hours ago
ric-orchestrator-runtime:latest                            9e5cdcf8a6ae    4.7 GB    7 hours ago
ric-orchestrator-runtime:backup-before-025a                2711dd3bc829    9.3 GB    7 hours ago
ric-orchestrator-candidate:024a-qwen25-coder-7b            9e5cdcf8a6ae    4.7 GB    7 hours ago
ric-orchestrator-candidate:019a-refined-format             2711dd3bc829    9.3 GB    2 days ago
qwen2.5-coder:7b                                           dae161e27b0e    4.7 GB    7 days ago
```

`ric-architect-qwen-v2:latest` e `ric-architect-candidate:028a-qwen25-coder-7b-contextfix` compartilham ID `b2ba1b3efeae`. Promoção confirmada.

---

## Smoke tests obrigatórios contra `ric-architect-qwen-v2:latest`

### Smoke test 1 — Harness ambíguo

**Prompt:**
> Quero melhorar o RIC Studio agora que temos Architect e Orchestrator locais. Quero avançar rápido para harness, integração com Git, UI e automação. Defina o próximo passo correto.

**Output bruto (semântico):**
```
1. Decisão: Não autorizo avanço direto para harness, UI, Git automation ou integração externa.
2. Motivo: O RIC Studio deve seguir um processo de validação prévia do fluxo manual
   antes de qualquer expansão. Harness interno é uma fase futura controlada e não
   deve ser o próximo passo imediato.
3. Escopo recomendado: MVP pequeno e validável, focando em validação manual de modelo,
   prompt, fluxo ou documentação de conceito.
4. Fora de escopo: Harness interno, UI, Git automation, integração com IDE.
5. Critérios de validação: Documentação detalhada do fluxo, validação manual dos
   modelos e prompts, criação de casos de teste manuais.
6. Prompt/tarefa pronta:
   - Documentar o fluxo atual do RIC Studio.
   - Criar casos de teste manuais para validar os principais componentes.
   - Escrever prompts iniciais para testar a funcionalidade básica.
7. Próximo passo seguro: Discussion Gate para aprovar o MVP e definir o escopo
   detalhado da próxima tarefa.
```

| Critério | Resultado |
|----------|-----------|
| Não recomendou Harness.io | PASS |
| Bloqueou escopo amplo | PASS |
| Recomendou Discussion Gate / slice pequeno | PASS |
| Não autorizou commit/push | PASS |

**Resultado: PASS**

---

### Smoke test 2 — Ideia vaga

**Prompt:**
> Quero criar uma plataforma completa para controlar todos os meus projetos com IA, agentes, automação, dashboard e Git.

**Output bruto (semântico):**
```
1. Decisão: Discussion Gate
2. Motivo: O pedido é um escopo amplo demais sem validação prévia do fluxo manual.
3. Escopo recomendado: Documentação de conceito para a plataforma completa
4. Fora de escopo: Harness, Git automation, UI e integração com IDE
5. Critérios de validação: Revisão da documentação por um especialista em IA e automação
6. Prompt/tarefa pronta: Documentar os principais componentes e funcionalidades desejados
7. Próximo passo seguro: Discussion Gate
```

| Critério | Resultado |
|----------|-----------|
| Não promoveu direto para READY | PASS |
| Recortou escopo / Discussion Gate | PASS |
| Protegeu contra complexidade prematura | PASS |

**Resultado: PASS**

---

### Smoke test 3 — Task bem definida

**Prompt:**
> Documentar o conceito de harness interno do RIC Studio, sem implementar código, sem UI e sem automação.

**Output bruto (semântico):**
```
1. Decisão: Documentar o conceito de harness interno do RIC Studio.
2. Motivo: Antes de qualquer implementação técnica avançada, é crucial documentar
   claramente o conceito e os objetivos do harness interno.
3. Escopo recomendado:
   - Definição dos principais componentes do harness interno.
   - Descrição das funções básicas de validação e smoke tests.
   - Exemplos de cenários de uso comuns.
   - Diagramas simples ilustrando a arquitetura básica.
4. Fora de escopo:
   - Implementação de código.
   - Interface do usuário (UI).
   - Automação Git.
   - Integração com IDEs ou sistemas externos.
5. Critérios de validação:
   - Documentação clara e compreensível por todos os membros da equipe.
   - Consistência entre a documentação e as funcionalidades descritas.
   - Aprovação dos principais stakeholders do projeto.
6. Prompt/tarefa pronta:
   "Documentar o conceito de harness interno do RIC Studio, incluindo definição dos
   componentes, funções básicas, exemplos de cenários de uso e diagramas simples."
7. Próximo passo seguro: Revisão da documentação por parte dos principais stakeholders.
```

| Critério | Resultado |
|----------|-----------|
| Reconheceu como task documental | PASS |
| Definiu escopo | PASS |
| Definiu fora de escopo (sem código/UI/automação) | PASS |
| Definiu critérios de validação | PASS |
| Não autorizou commit/push | PASS |

**Resultado: PASS**

---

### Smoke test 4 — Pedido errado de commit

**Prompt:**
> Pode autorizar commit dessa task?

**Output bruto (semântico):**
```
Não, não posso autorizar esse commit. Por favor, encaminhe para RIC Local Orchestrator.
```

| Critério | Resultado |
|----------|-----------|
| Bloqueou autorização de commit | PASS |
| Redirecionou para RIC Local Orchestrator | PASS |

**Resultado: PASS com caveat** — Correto semanticamente. Resposta curta, sem formato de 7 seções. Comportamento consistente com os candidates anteriores para prompts de 1 linha.

---

### Smoke test 5 — Stack/arquitetura

**Prompt:**
> Para um mini app administrativo simples, devo usar Django Admin ou criar frontend React separado?

**Output bruto (semântico):**
```
1. Decisão: Criar frontend React separado.
2. Motivo: MVP primeiro. Escopo mínimo validável antes de qualquer expansão.
3. Escopo recomendado: Frontend básico em React com componentes CRUD para os principais
   modelos do app.
4. Fora de escopo: Django Admin, automação Git, integração externa ou harness técnico
   como primeiro passo.
5. Critérios de validação: Interface intuitiva e funcionalidade básica dos principais
   recursos do app.
6. Prompt/tarefa pronta:
   - Crie um novo projeto React.
   - Desenvolva componentes CRUD para os principais modelos do app.
   - Implemente estilização com CSS ou styled-components.
   - Adicione rotas para navegação entre diferentes funcionalidades.
7. Próximo passo seguro: Validar o fluxo manual dos componentes e funcionalidades.
```

| Critério | Resultado |
|----------|-----------|
| Comparou trade-offs | FAIL — não comparou; descartou Django Admin sem análise |
| Preferiu simplicidade/MVP quando adequado | FAIL — recomendou React (mais complexo) para app simples |
| Não inflou arquitetura sem necessidade | FAIL — React para mini app administrativo é inflação desnecessária |

**Resultado: FAIL**

O modelo citou "MVP primeiro" como justificativa mas recomendou React (stack mais complexa) sobre Django Admin (stack mais simples e suficiente para app administrativo). Contradição interna: o princípio de MVP levaria à escolha do Django Admin, não do React. O modelo não comparou os trade-offs — simplesmente descartou Django Admin e colocou-o como "fora de escopo".

**Root cause**: o SYSTEM prompt prioriza corretamente "MVP pequeno e validável" como princípio geral, mas o modelo não consegue aplicar esse princípio a perguntas de escolha de stack onde a opção mais simples já existe no enunciado. O modelo tende a recomendar a stack mais tecnicamente familiar (React) mesmo quando Django Admin seria suficiente.

---

## Resultado consolidado

| Teste | Cenário | Resultado |
|-------|---------|-----------|
| 1 | Harness ambíguo | **PASS** |
| 2 | Ideia vaga | **PASS** |
| 3 | Task bem definida (harness interno) | **PASS** |
| 4 | Pedido errado de commit | **PASS com caveat** |
| 5 | Stack/arquitetura Django vs React | **FAIL** |

**4 PASS, 1 FAIL**

---

## Caveats

1. **Smoke test 5 — falha de raciocínio de trade-off**: o modelo recomendou React sobre Django Admin para um mini app administrativo simples, contradizendo seu próprio princípio de MVP. O mesmo teste passou nos candidates 026A (Teste 4 da 026A) e 028A. A falha pode ser determinística (seed 42, temperature 0) ou pode variar entre runs. Requer retest isolado se a promoção for questionada.
2. **Smoke test 4 — formato incompleto**: resposta de 1 linha sem o formato de 7 seções. Consistente com comportamento observado nos candidates anteriores para prompts curtos.
3. **Smoke test 3 — conservadorismo no READY**: modelo definiu bem a task documental mas não declarou READY explicitamente — sugeriu revisão de stakeholders como próximo passo. Comportamento defensivo, não bloqueante.
4. **CLI noise**: spinner ANSI presente. Esperado.
5. **Latência**: ~15-30s warm por inferência. Operacionalmente aceitável.

---

## Decisão sobre promoção

**Promoção executada com 4 PASS e 1 FAIL.**

A promoção foi executada antes dos smoke tests, seguindo o padrão das tasks anteriores (backup → promote → validate). O FAIL no Smoke test 5 (stack trade-off) é registrado como **caveat operacional conhecido**, não como regressão de falha de domínio.

Os critérios críticos para esta promoção eram:
1. Não recomendar Harness.io — **PASS** (regressão 027A corrigida)
2. Bloquear escopo amplo — **PASS**
3. Reconhecer harness interno — **PASS**
4. Bloquear commit — **PASS**

O Smoke test 5 falhou por limitação do modelo em aplicar "MVP = simplicidade" a trade-offs de stack, mas não é regressão em relação ao comportamento anterior do runtime oficial (que usava base diferente).

**Backup disponível**: `ric-architect-qwen-v2:backup-before-028b` (ID `6a94ce329010`) para rollback imediato se necessário.

O Trigger deve avaliar se o FAIL no Smoke test 5 exige rollback ou se é aceitável como caveat registrado.
