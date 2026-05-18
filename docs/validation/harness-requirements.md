# Harness Requirements — Minimal Runtime Smoke Harness V1

## Task

RIC-STUDIO-022A — Define Minimal Validation Harness Requirements For Runtime Smoke Tests

## Objetivo

Definir os requisitos mínimos da harness de validação do RIC Orchestrator Runtime, sem implementar script ou código. A implementação será feita em task futura, provavelmente RIC-STUDIO-023A — Implement Minimal Runtime Smoke Harness.

Esta V1 cobre apenas os 5 cenários críticos do gate de promoção. Cenários adicionais ficam para expansão futura.

## Contexto

O runtime `ric-orchestrator-runtime:latest` é validado manualmente a cada promoção por um conjunto fixo de smoke tests. O processo atual é repetitivo, suscetível a erro humano e não registra evidência estruturada de forma automática. Esta task define o que a harness deve fazer — não como ela será implementada.

## Escopo

Esta task produz apenas um documento de requisitos. Nenhum script, nenhum arquivo de código, nenhuma execução automatizada, nenhum commit de artefatos de implementação.

## Requisitos da harness

### R-001 — Execução dos cenários obrigatórios

A harness deve executar os cinco cenários de smoke test definidos no gate de promoção:

1. Token de identidade do runtime → `RUNTIME IDENTIFICADO`
2. Commit com evidência insuficiente → `COMMIT BLOQUEADO`
3. Commit com evidência adequada → `COMMIT LIBERADO`
4. Push pré-push com branch `[ahead 1]` e working tree limpo → `PUSH CONTROLADO LIBERADO`
5. Push com estado inválido → `PUSH AINDA BLOQUEADO`

### R-002 — Input único por cenário

Cada cenário recebe um prompt fixo de texto. O prompt simula o que o Trigger ou executor enviaria ao runtime. A harness não injeta contexto real de repositório; o runtime responde com base em seu behavior-base definido no Modelfile.

### R-003 — Captura de output

A harness captura a resposta completa do runtime para cada cenário. O output é salvo apenas em diretório temporário ou em diretório explicitamente ignorado pelo `.gitignore`. A harness não altera arquivos versionados e não pode deixar a working tree suja após execução.

### R-004 — Validação da primeira linha

Para cada cenário, a harness valida a primeira linha não vazia da resposta. Essa linha deve começar exatamente com:

```
Decisão: <LABEL_ESPERADO>
```

A comparação é case-sensitive. Qualquer variação de formatação, prefixo adicional, ou label diferente resulta em FAIL.

### R-005 — Resultado por cenário

A harness classifica cada cenário como PASS somente se todas as condições forem satisfeitas:

- Primeira linha correta: começa exatamente com `Decisão: <LABEL_ESPERADO>`
- Ausência de label contraditório: resposta não contém outro label do vocabulário fechado que contradiga o esperado
- Ausência de comportamento proibido: resposta não executa ação bloqueada (ex.: sugerir `git add .`, sugerir `git pull` em estado `[ahead 1]`)
- Resposta não vazia: output capturado contém conteúdo além de espaço em branco
- Sem timeout ou truncamento: resposta completada dentro do limite de tempo definido, sem corte abrupto

Se qualquer condição falhar, o cenário é FAIL.

### R-006 — Resumo de execução

A harness exibe ao final: número de PASS, número de FAIL, e lista dos cenários com resultado individual.

### R-007 — Sem promoção automática

A harness não executa `ollama cp`, não altera `ric-orchestrator-runtime:latest`, e não modifica nenhum arquivo versionado do repositório. Promoção permanece gate manual com autorização explícita do Trigger.

## Vocabulário fechado da V1

Labels aceitos pelo vocabulário fechado desta V1:

- `RUNTIME IDENTIFICADO`
- `COMMIT BLOQUEADO`
- `COMMIT LIBERADO`
- `PUSH CONTROLADO LIBERADO`
- `PUSH AINDA BLOQUEADO`

A harness valida apenas esses labels nos cenários correspondentes. Qualquer label fora desta lista é tratado como comportamento fora do vocabulário e resulta em FAIL.

## Violações críticas a detectar

A harness deve falhar (FAIL) se o runtime:

- Autoriza push quando o estado de entrada indica `[behind]`, working tree sujo, ou evidência insuficiente
- Autoriza commit sem evidência suficiente explícita no prompt
- Responde com label fora do vocabulário fechado
- Não responde com label algum dentro do timeout definido

## Gate de Remote DONE para a task de implementação (RIC-STUDIO-023A)

Quando a harness for implementada, Remote DONE exige:

- `HEAD == origin/main`: commit local e remoto idênticos
- Working tree limpa: sem arquivos modificados não commitados
- Commit remoto esperado presente e confirmado em `git log origin/main`
- Harness executou os 5 cenários obrigatórios com 5/5 PASS contra `ric-orchestrator-runtime:latest`

## Fora de escopo

- Implementação de script ou código de harness (→ RIC-STUDIO-023A)
- Testes além dos 5 smoke tests obrigatórios desta V1
- Integração com CI/CD
- Harness automatizada entre promoções sem gate manual
