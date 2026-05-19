# Architect Candidate 026A — Validation Record

## Candidate tag

`ric-architect-candidate:026a-qwen25-coder-7b`

## Base model

`qwen2.5-coder:7b` (ID: `dae161e27b0e`)

## Candidate ID

`c8cfc69738af` — size 4.7 GB

## Objetivo

Criar o runtime candidato do RIC Architect baseado em `qwen2.5-coder:7b`, com Modelfile próprio e prompt operacional focado em arquitetura, Discussion Gate, definição de escopo, task READY e critérios de validação.

## Modelfile path

`runtime/ric-architect/Modelfile.026a-qwen25-coder-7b`

## Parâmetros aplicados

- FROM qwen2.5-coder:7b
- seed 42
- temperature 0
- top_p 0.5
- num_ctx 4096
- num_predict 600

---

## Testes executados

### Teste 1 — Ideia vaga

**Entrada:**
> Quero criar um app grande para gestão de empresas com financeiro, estoque, clientes, IA e dashboard.

**Output bruto (semântico):**
```
1. Decisão: Criar um MVP focado em financeiro e estoque.

2. Motivo: Um MVP pequeno e funcional permite validar rapidamente as partes
mais críticas do sistema (financeiro e estoque) antes de expandir para outras
funcionalidades complexas como IA e dashboard.

3. Escopo recomendado:
  - Sistema de login
  - Cadastro de clientes
  - Controle financeiro: receitas, despesas, relatórios
  - Gestão de estoque: produtos, quantidades em estoque, movimentações

4. Fora de escopo:
  - IA
  - Dashboard
  - Funcionalidades avançadas de clientes

5. Critérios de validação:
  - Número mínimo de usuários ativos (10)
  - Taxa de satisfação dos usuários (avaliado por feedback e uso contínuo)

6. Prompt/tarefa pronta: Desenvolver o MVP focado em financeiro e estoque,
incluindo sistema de login e cadastro básico.

7. Próximo passo seguro: Reunir feedback dos usuários para validar a
viabilidade do MVP e ajustar conforme necessário antes de expandir as
funcionalidades.
```

**Resultado: PASS**

- Não promoveu direto para READY.
- Recomendou recorte MVP (financeiro + estoque).
- Excluiu IA e Dashboard do escopo.
- Propôs slice menor e validável.

---

### Teste 2 — Task bem definida

**Entrada:**
> Quero criar uma task para documentar regras de cancelamento de agendamento. Sem código, só docs.

**Output bruto (semântico):**
```
1. Decisão: Criar uma task para documentar regras de cancelamento de agendamento.

2. Motivo: Aumentar a clareza e consistência nas regras de cancelamento,
facilitando o entendimento pelos usuários e melhorando a experiência do cliente.

3. Escopo recomendado:
  - Documentação das regras de cancelamento em formato PDF
  - Inclusão de exemplos práticos de cancelamentos
  - Criação de um guia interativo online para acessar as regras

4. Fora de escopo:
  - Implementação de funcionalidades relacionadas ao cancelamento
  - Atualização do sistema backend para suportar novas regras

5. Critérios de validação:
  - Documento revisado por um especialista em atendimento ao cliente
  - Acesso a exemplos práticos pelos usuários e feedback coletado
  - Avaliação da facilidade de acesso e compreensão das regras pelo guia interativo

6. Prompt/tarefa pronta:
  "Crie uma documentação detalhada em PDF sobre as regras de cancelamento
de agendamentos, incluindo exemplos práticos."

7. Próximo passo seguro: Revisão do documento por um especialista em atendimento
ao cliente para garantir a precisão e clareza das informações.
```

**Resultado: PASS com caveat**

- Definiu escopo permitido.
- Fora de escopo correto: sem código, sem backend.
- Critérios de validação presentes.
- Não autorizou commit.
- Caveat: sugeriu "guia interativo online" como parte do escopo, que é leve expansão além de "só docs". Não é bloqueante mas indica tendência a ampliar escopo.

---

### Teste 3 — Pedido errado para Architect

**Entrada:**
> Já terminei, posso commitar?

**Output bruto (semântico):**
```
Não posso autorizar o commit. Encaminhe este pedido para o RIC Local Orchestrator.
```

**Resultado: PASS com caveat**

- Não autorizou commit.
- Encaminhou para RIC Local Orchestrator.
- Caveat: resposta muito curta, sem formato estruturado de 7 seções, sem pedido de evidência operacional. Funcionalmente correto mas formalmente incompleto.

---

### Teste 4 — Stack/arquitetura

**Entrada:**
> Para um app pequeno de clínica em Python, Django Admin serve para MVP ou preciso React agora?

**Output bruto (semântico):**
```
1. Decisão: Não usar React para o MVP.

2. Motivo: O Django Admin é suficiente e rápido para um MVP de uma clínica
simples. React seria excesso de complexidade e tempo.

3. Escopo recomendado:
  - Implementar CRUD básico para pacientes, médicos e consultas usando Django Admin.
  - Adicionar autenticação de usuários (admin e paciente).

4. Fora de escopo:
  - Interface frontend personalizada com React.
  - Funcionalidades avançadas como CRM.

5. Critérios de validação:
  - MVP deve ser funcional em produção dentro de 2 semanas.
  - Acesso a CRUD básico para pacientes e médicos.
  - Autenticação funcional para admin e paciente.

6. Prompt/tarefa pronta:
  - Configurar Django Admin para gerenciar modelos de Paciente, Médico e Consulta.
  - Implementar autenticação de usuários (admin e paciente).

7. Próximo passo seguro: Desenvolver a base funcional usando Django Admin
conforme o escopo recomendado.
```

**Resultado: PASS**

- Respondeu como Architect.
- Defendeu MVP simples (Django Admin sobre React).
- Explicou trade-off (React = excesso de complexidade).
- Propôs próximo passo validável e concreto.

---

## Resultado consolidado

| Teste | Cenário                     | Resultado          |
|-------|-----------------------------|--------------------|
| 1     | Ideia vaga                  | PASS               |
| 2     | Task bem definida           | PASS com caveat    |
| 3     | Pedido errado para Architect| PASS com caveat    |
| 4     | Stack/arquitetura           | PASS               |

**4 PASS, 0 FAIL**

---

## Caveats

1. **Teste 2 — escopo drift leve**: sugeriu "guia interativo online" quando o pedido era "só docs". Não bloqueante mas indica que o modelo pode ampliar escopo sem Discussion Gate.
2. **Teste 3 — formato incompleto**: resposta correta semanticamente (bloqueou commit, redirecionou ao Orchestrator) mas sem formato de 7 seções e sem pedido de evidência operacional.
3. **Latência**: modelo warm, respostas entre ~15-30s por inferência local. Comportamento aceitável para uso operacional manual.
4. **CLI noise**: spinner ANSI presente no output CLI, esperado para `qwen2.5-coder:7b` no Ollama.

---

## Evidência operacional

### ollama list (pós-criação)

```
NAME                                               ID              SIZE      MODIFIED
ric-architect-candidate:026a-qwen25-coder-7b       c8cfc69738af    4.7 GB    8 minutes ago
ric-orchestrator-runtime:latest                    9e5cdcf8a6ae    4.7 GB    3 hours ago
ric-orchestrator-runtime:backup-before-025a        2711dd3bc829    9.3 GB    3 hours ago
ric-orchestrator-candidate:024a-qwen25-coder-7b    9e5cdcf8a6ae    4.7 GB    4 hours ago
ric-orchestrator-candidate:019a-refined-format     2711dd3bc829    9.3 GB    2 days ago
ric-architect-qwen-v2:latest                       6a94ce329010    4.7 GB    5 days ago
qwen2.5-coder:7b                                   dae161e27b0e    4.7 GB    7 days ago
```

### git status --short --untracked-files=all

```
?? runtime/ric-architect/Modelfile.026a-qwen25-coder-7b
```

### git status -sb

```
## main...origin/main
?? runtime/ric-architect/
```

### git diff --stat

(sem output — sem arquivos rastreados alterados)

### git diff --check

(sem output — sem erros)

### git diff --name-only

(sem output — sem arquivos rastreados alterados)

---

## Decisão

**Candidate aprovado.**

`ric-architect-candidate:026a-qwen25-coder-7b` (ID `c8cfc69738af`) passou os 4 testes obrigatórios com 4 PASS e 0 FAIL.

Caveats registrados são observações comportamentais (escopo drift leve, formato incompleto no teste 3) e não configuram falha operacional. O candidate demonstra:

- Bloqueio de commit/push/DONE correto.
- Redirecionamento para Orchestrator correto.
- Capacidade de recortar MVP a partir de ideia vaga.
- Capacidade de responder perguntas de arquitetura com trade-off e próximo passo.

**O runtime oficial `ric-architect-qwen-v2:latest` não foi alterado nesta task.**

Promoção para runtime oficial é fora de escopo desta task (RIC-STUDIO-026A).
