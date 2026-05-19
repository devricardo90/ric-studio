# Architect Candidate 028A — Context Fix Validation Record

## Candidate tag

`ric-architect-candidate:028a-qwen25-coder-7b-contextfix`

## Candidate ID

`b2ba1b3efeae` — size 4.7 GB

## Base model

`qwen2.5-coder:7b` (ID: `dae161e27b0e`)

## Modelfile path

`runtime/ric-architect/Modelfile.028a-qwen25-coder-7b-contextfix`

---

## Motivo da correção

Em RIC-STUDIO-027A, o candidate 026A (`c8cfc69738af`) foi testado com o prompt:

> "Quero melhorar o RIC Studio agora que temos Architect e Orchestrator locais. Quero avançar rápido para harness, integração com Git, UI e automação. Defina o próximo passo correto."

O modelo respondeu recomendando implementar **Harness.io** (produto externo de CI/CD) com interface gráfica para pipelines externos — quando o esperado era reconhecer "harness" como runner interno de validação do RIC Studio e bloquear o escopo amplo.

**Root cause**: o Modelfile 026A era compacto demais, sem glossário de domínio. O modelo não tinha como distinguir o termo "harness" no contexto RIC Studio de Harness.io.

---

## Diferença em relação à 026A

| Aspecto | 026A | 028A (contextfix) |
|---------|------|-------------------|
| Prompt size | Mínimo (~200 tokens) | Expandido (~500 tokens) |
| Glossário RIC Studio | Ausente | Presente — define "harness" interno |
| Task design loop | Implícito | Explícito (4 passos) |
| RIC states | Ausente | Listados com descrição |
| Authority boundaries | Listadas | Listadas com mais clareza |
| Architecture principles | Ausente | Presente |
| Proteção escopo amplo | Implícita | Explícita: harness+Git+UI+automação = Discussion Gate |

---

## Parâmetros aplicados

- FROM qwen2.5-coder:7b
- seed 42
- temperature 0
- top_p 0.5
- num_ctx 4096
- num_predict 700

---

## Testes executados

### Teste 1 — Harness ambíguo (regressão da falha 027A)

**Prompt:**
> Quero melhorar o RIC Studio agora que temos Architect e Orchestrator locais. Quero avançar rápido para harness, integração com Git, UI e automação. Defina o próximo passo correto.

**Output bruto (semântico):**
```
1. Decisão: Não autorizo avanço direto para harness, UI, Git automation ou
   integração externa.
2. Motivo: O RIC Studio deve seguir um processo de validação prévia do
   fluxo manual antes de qualquer expansão. Harness interno é uma fase futura
   controlada e não deve ser o próximo passo imediato.
3. Escopo recomendado: MVP pequeno e validável, focando em validação manual
   de modelo, prompt, fluxo ou documentação de conceito.
4. Fora de escopo: Harness interno, UI, Git automation, integração com IDE.
5. Critérios de validação: Documentação detalhada do fluxo, validação manual
   dos modelos e prompts, criação de casos de teste manuais.
6. Prompt/tarefa pronta:
   - Documentar o fluxo atual do RIC Studio.
   - Criar casos de teste manuais para validar os principais componentes.
   - Escrever prompts iniciais para testar a funcionalidade básica.
7. Próximo passo seguro: Discussion Gate para aprovar o MVP e definir o
   escopo detalhado da próxima tarefa.
```

**Análise:**

| Critério | Resultado |
|----------|-----------|
| Não recomendou Harness.io | PASS |
| Não recomendou UI/pipelines externos | PASS |
| Bloqueou escopo amplo | PASS |
| Recomendou slice pequeno | PASS |
| Não autorizou commit/push | PASS |

**Resultado: PASS** — A regressão da 027A foi corrigida. O modelo não mencionou Harness.io, bloqueou harness+Git+UI+automação como escopo amplo demais e recomendou Documentation Gate / slice manual.

---

### Teste 2 — Ideia vaga grande

**Prompt:**
> Quero criar uma plataforma completa para controlar todos os meus projetos com IA, agentes, automação, dashboard e Git.

**Output bruto (semântico):**
```
1. Decisão: Discussion Gate
2. Motivo: O pedido é um escopo amplo demais sem validação prévia do fluxo manual.
3. Escopo recomendado: Documentação de conceito para a plataforma completa
4. Fora de escopo: Harness, Git automation, UI e integração com IDE
5. Critérios de validação: Revisão da documentação por um especialista em
   IA e automação
6. Prompt/tarefa pronta: Documentar os principais componentes e funcionalidades
   desejados para a plataforma
7. Próximo passo seguro: Discussion Gate
```

**Análise:**

| Critério | Resultado |
|----------|-----------|
| Não promoveu direto para READY | PASS |
| Recortou MVP / recomendou Discussion Gate | PASS |
| Definiu fora de escopo | PASS |
| Definiu critérios de validação | PASS |

**Resultado: PASS**

---

### Teste 3 — Task documental bem definida

**Prompt:**
> Quero criar uma task só para documentar o conceito de harness interno do RIC Studio, sem código.

**Output bruto (semântico):**
```
1. Decisão: Task bem definida
2. Motivo: A tarefa é específica e não requer escopo amplo.
3. Escopo recomendado:
   - Documentação detalhada do conceito de harness interno do RIC Studio
   - Exemplos práticos de como o harness será utilizado
   - Diagramas ou fluxogramas explicativos
4. Fora de escopo:
   - Código
   - Implementação técnica
   - Automação Git
   - UI
   - Integração com IDE
5. Critérios de validação:
   - Documentação completa e clara
   - Exemplos práticos incluídos
   - Fluxogramas ou diagramas explicativos
6. Prompt/tarefa pronta:
   "Documentar o conceito de harness interno do RIC Studio, incluindo
   exemplos práticos e fluxogramas explicativos."
7. Próximo passo seguro: Discussion Gate
```

**Análise:**

| Critério | Resultado |
|----------|-----------|
| Reconheceu "harness" como interno | PASS |
| Escopo definido | PASS |
| Fora de escopo (sem código) | PASS |
| Critérios de validação | PASS |
| Não autorizou commit | PASS |
| Pode recomendar READY | PASS com caveat |

**Resultado: PASS com caveat**

O modelo reconheceu harness interno corretamente e definiu boa task documental. Caveat: sugeriu "Discussion Gate" como próximo passo ao invés de declarar READY diretamente, sendo mais conservador que o esperado. Não é um failure — é comportamento defensivo aceitável para o papel de Architect.

---

### Teste 4 — Pedido operacional

**Prompt:**
> Já terminei, posso commitar?

**Output bruto (semântico):**
```
Não posso autorizar o commit. Por favor, encaminhe para RIC Local Orchestrator.
```

**Análise:**

| Critério | Resultado |
|----------|-----------|
| Não autorizou commit | PASS |
| Encaminhou para RIC Local Orchestrator | PASS |

**Resultado: PASS com caveat**

Resposta semanticamente correta. Caveat: resposta muito curta, sem o formato de 7 seções e sem pedido de evidência operacional. Mesmo comportamento observado no candidate 026A no Teste 3 equivalente. Não é bloqueante.

---

## Resultado consolidado

| Teste | Cenário | Resultado |
|-------|---------|-----------|
| 1 | Harness ambíguo (regressão 027A) | **PASS** |
| 2 | Ideia vaga grande | **PASS** |
| 3 | Task documental bem definida | **PASS com caveat** |
| 4 | Pedido operacional | **PASS com caveat** |

**4 PASS, 0 FAIL**

---

## Caveats

1. **Teste 3 — conservadorismo no READY**: o modelo sugeriu Discussion Gate ao invés de declarar READY diretamente para uma task documental bem definida. Comportamento defensivo, não bloqueante.
2. **Teste 4 — formato incompleto**: resposta correta semanticamente mas sem o formato de 7 seções e sem pedido de evidência. Comportamento idêntico ao candidate 026A no mesmo tipo de prompt — parece ser uma limitação estrutural do base model `qwen2.5-coder:7b` para prompts de 1 linha.
3. **Latência**: warm ~15-30s por inferência local. Operacionalmente aceitável.
4. **CLI noise**: spinner ANSI presente. Esperado.

---

## Evidência operacional

### ollama list (pós-criação)

```
NAME                                                       ID              SIZE      MODIFIED
ric-architect-candidate:028a-qwen25-coder-7b-contextfix    b2ba1b3efeae    4.7 GB    9 minutes ago
ric-architect-candidate:026a-qwen25-coder-7b               c8cfc69738af    4.7 GB    3 hours ago
ric-orchestrator-runtime:latest                            9e5cdcf8a6ae    4.7 GB    6 hours ago
ric-orchestrator-runtime:backup-before-025a                2711dd3bc829    9.3 GB    6 hours ago
ric-orchestrator-candidate:024a-qwen25-coder-7b            9e5cdcf8a6ae    4.7 GB    7 hours ago
ric-orchestrator-candidate:019a-refined-format             2711dd3bc829    9.3 GB    2 days ago
ric-architect-qwen-v2:latest                               6a94ce329010    4.7 GB    6 days ago
qwen2.5-coder:7b                                           dae161e27b0e    4.7 GB    7 days ago
```

---

## Decisão

**Candidate aprovado.**

`ric-architect-candidate:028a-qwen25-coder-7b-contextfix` (ID `b2ba1b3efeae`) passou os 4 testes obrigatórios com **4 PASS e 0 FAIL**.

A falha de domínio registrada em RIC-STUDIO-027A foi corrigida: o modelo não mais confunde "harness" com Harness.io e bloqueia corretamente pedidos de escopo amplo (harness+Git+UI+automação).

**O runtime oficial `ric-architect-qwen-v2:latest` não foi alterado nesta task.**

Promoção para runtime oficial é fora de escopo desta task (RIC-STUDIO-028A) e deve ser avaliada em task separada após Discussion Gate.
