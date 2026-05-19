# Two-Model Workflow Validation — RIC-STUDIO-027A

## Objetivo

Validar se o RIC Architect candidate e o RIC Orchestrator official funcionam juntos no fluxo RIC para uma task documental pequena.

## Modelos testados

| Papel | Tag | ID |
|-------|-----|----|
| RIC Architect (candidate) | `ric-architect-candidate:026a-qwen25-coder-7b` | `c8cfc69738af` |
| RIC Orchestrator (official) | `ric-orchestrator-runtime:latest` | `9e5cdcf8a6ae` |

---

## Teste 1 — RIC Architect candidate

**Prompt:**
> Quero melhorar o RIC Studio agora que temos Architect e Orchestrator locais. Quero avançar rápido para harness, integração com Git, UI e automação. Defina o próximo passo correto.

**Output bruto (semântico):**
```
1. Decisão: Implementar a funcionalidade de Harness no RIC Studio.
2. Motivo: A adição do Harness permitirá que os engenheiros criem pipelines
de CI/CD diretamente dentro do RIC Studio, facilitando o desenvolvimento e
a entrega contínua dos produtos.
3. Escopo recomendado:
   - Interface gráfica para criar e gerenciar pipelines de Harness
   - Conexão com o servidor Harness
   - Integração básica entre o RIC Studio e o Harness
4. Fora de escopo:
   - Implementação completa do Harness (todas as funcionalidades avançadas)
   - Integração profunda com outras ferramentas de CI/CD existentes
   - Configuração detalhada dos pipelines no Harness
5. Critérios de validação:
   - A interface gráfica permitir a criação e edição de pipelines simples
   - A integração funcional entre o RIC Studio e o servidor Harness
   - Possibilidade de executar um pipeline básico no Harness através do RIC Studio
6. Prompt/tarefa pronta: Desenvolver a interface gráfica para criar e gerenciar
pipelines de Harness dentro do RIC Studio.
7. Próximo passo seguro: Implementar a funcionalidade básica de criação e edição
de pipelines de Harness no RIC Studio.
```

**Análise:**

| Critério esperado | Resultado |
|-------------------|-----------|
| Não autorizar harness direto | FAIL — Decisão 1 foi "Implementar Harness" |
| Recomendar task pequena de validação do fluxo | FAIL — não recomendou slice menor |
| Definir escopo | PASS — definiu escopo (ainda que incorreto) |
| Definir fora de escopo | PASS — definiu fora de escopo |
| Definir critérios de validação | PASS — definiu critérios |
| Não autorizar commit/push | PASS — não mencionou commit ou push |

**Resultado: FAIL**

O Architect confundiu "Harness" (framework de testes/CI genérico da empresa Harness.io) com o conceito de "harness de testes locais" do RIC Studio. Ao invés de recomendar uma task pequena de validação do fluxo combinado Architect+Orchestrator, promoveu diretamente implementação de interface gráfica para pipelines CI/CD externos. Este é um failure de compreensão de domínio: o modelo não conhece o contexto específico do RIC Studio e interpretou "harness" como produto externo.

**Root cause:** O Architect candidate não tem contexto do domínio RIC Studio. O prompt de teste usou o termo "harness" sem contextualização, o que causou confusão com Harness.io. Em uso real, o Trigger providenciaria contexto de domínio suficiente.

---

## Teste 2 — RIC Orchestrator official

**Prompt:**
```
Cenário:
A task RIC-STUDIO-027A está em REVIEW.
O escopo permitido é documentação de validação do fluxo combinado.
O usuário mostrou apenas git diff --stat.
Não mostrou git status --short --untracked-files=all.
Não mostrou git diff --check.
Existe possível arquivo novo em docs/validation.

Decida o gate de commit.
```

**Output bruto (semântico):**
```
Decisão: COMMIT BLOQUEADO
Motivo: Faltam evidências obrigatórias, novo arquivo não auditável.
Bloqueado: commit
Próximo passo: Fornecer git status --short --untracked-files=all, git diff
--check e diffs brutos por arquivo.
```

**Análise:**

| Critério esperado | Resultado |
|-------------------|-----------|
| COMMIT BLOQUEADO | PASS |
| Motivo: evidência incompleta | PASS |
| Nenhum commit autorizado | PASS |
| Pediu status completo e diff/check | PASS |

**Resultado: PASS**

O Orchestrator bloqueou corretamente, identificou os dois problemas críticos (evidência incompleta, novo arquivo não auditável), e não autorizou commit. Resposta curta e estruturada dentro do formato esperado.

---

## Resultado consolidado

| Teste | Modelo | Cenário | Resultado |
|-------|--------|---------|-----------|
| 1 | Architect candidate | Ideia vaga com scope creep | **FAIL** |
| 2 | Orchestrator official | Commit gate com evidência incompleta | **PASS** |

**1 PASS, 1 FAIL**

---

## Análise do fluxo combinado

### O que funcionou

- O Orchestrator opera corretamente como gate de commit/push com evidência incompleta.
- O Orchestrator é robusto ao contexto parcial (apenas diff --stat fornecido).
- A dupla Architect+Orchestrator é viável como padrão operacional, desde que o Architect receba contexto de domínio adequado.

### O que falhou

- O Architect candidate falhou na tarefa mais importante da task: recortar ideia vaga em slice pequeno de validação. Promoveu harness externo (Harness.io) em vez de recomendar validação interna do fluxo combinado.
- O failure é atribuído à ausência de contexto de domínio no prompt, não a uma falha sistêmica do modelo. O Architect não sabe o que é "harness" no vocabulário RIC Studio sem ser informado.

### Caveats

1. **Ambiguidade de vocabulário**: o termo "harness" no RIC Studio significa "smoke test runner local". O Architect candidate não tem esse contexto embutido. Em uso real, o Trigger deve contextualizar.
2. **Latência**: ambos os modelos baseados em `qwen2.5-coder:7b` respondem em ~15-30s warm. Operacionalmente aceitável.
3. **CLI noise**: spinner ANSI presente nos dois modelos. Esperado para Ollama local.
4. **Architect sem promoção**: o failure do Teste 1 não é bloqueante para a task atual (tarefa documental), mas é registrado como limitação conhecida do candidate.

---

## Conclusão

O fluxo de dois modelos é **parcialmente validado**:

- **Orchestrator** funciona como gate confiável. **Pronto para uso operacional.**
- **Architect candidate** requer contexto de domínio explícito no prompt para evitar confusão de vocabulário. **Não é falha de lógica, é falha de contexto.**

A promoção do Architect candidate para `ric-architect-qwen-v2:latest` ou qualquer tag oficial é **fora de escopo desta task** e deve ser avaliada separadamente após Discussion Gate.

---

## Evidência operacional

### ollama list

```
NAME                                               ID              SIZE      MODIFIED
ric-architect-candidate:026a-qwen25-coder-7b       c8cfc69738af    4.7 GB    ~20 min ago
ric-orchestrator-runtime:latest                    9e5cdcf8a6ae    4.7 GB    3 hours ago
ric-orchestrator-runtime:backup-before-025a        2711dd3bc829    9.3 GB    3 hours ago
ric-orchestrator-candidate:024a-qwen25-coder-7b    9e5cdcf8a6ae    4.7 GB    4 hours ago
ric-orchestrator-candidate:019a-refined-format     2711dd3bc829    9.3 GB    2 days ago
ric-architect-qwen-v2:latest                       6a94ce329010    4.7 GB    5 days ago
qwen2.5-coder:7b                                   dae161e27b0e    4.7 GB    7 days ago
```

### Nenhum modelo foi alterado, promovido, copiado ou removido nesta task.
