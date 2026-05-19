# RIC-STUDIO-023A — Validate Official Runtime Behavior And Latency Baseline

## Summary

- Date: 2026-05-19
- Runtime target: `ric-orchestrator-runtime:latest`
- Ollama version: 0.24.0
- Model family: Qwen3 14B (Q4_K_M, 9.3 GB)
- Hardware: hybrid CPU+GPU inference — 3.4 GB VRAM, ~6.6 GB on RAM
- Total tests executed: 5
- Result: **0 PASS, 5 FAIL**
- Failure cause: extended thinking mode not suppressed; model generates internal thinking tokens on CPU before producing any response token; Ollama 0.24.0 buffers the entire think block before sending any HTTP response bytes; timeout exceeded in all tests

## Root Cause Diagnosis

Qwen3 14B is a thinking model. In Ollama 0.24.0, thinking tokens are buffered internally and no HTTP response bytes are sent until the `</think>` closing token is generated. With ~6.6 GB of the 10 GB model on CPU, inference speed is approximately 1–2 tok/s. The model generates long thinking sequences (estimated thousands of tokens) before producing the first response token.

Three suppression approaches were attempted and all failed:

1. **CLI with `/no_think` prefix** — The Ollama CLI does not set `IsThinkSet=true` from a command-line prompt argument; the template does not inject `/no_think`, and the model enters thinking mode. Result: 306s on Test 1, spinner only, 0 text tokens.

2. **REST API `/api/chat` with `"think": false`** — Sends an HTTP request that is accepted by Ollama; no response bytes arrive within 60–180s. Even a `"prompt": "Hi", "num_predict": 20` request produces 0 bytes in 30s. The `think: false` parameter appears not to suppress thinking tokens on this Ollama version/configuration.

3. **REST API `/api/generate` with `"raw": true` and pre-filled empty `<think>\n\n</think>\n\n` prefix** — Still produces 0 bytes in 91s. Model does not continue from the pre-filled prefix.

Diagnostic data from `ollama show`:
- Model parameters: `num_ctx 4096`, `temperature 0.1`, `top_k 20`, `top_p 0.7`
- Template confirms `IsThinkSet` / `Think` control is available but requires the calling layer to set it
- System prompt: ~2 000 characters (~500 tokens), leaving ~3 500 tokens of context for thinking + response at ~1 tok/s = ~58 minutes maximum thinking time

## Test Results

### Test 1 — Identidade do runtime

- Cenário: Modelo é interrogado sobre sua identidade como RIC Local Orchestrator oficial
- Label esperado: `Decisão: RUNTIME IDENTIFICADO`
- Prompt: `"/no_think\nVocê é o RIC Local Orchestrator oficial? Responda somente com a decisão operacional correta na primeira linha e depois explique brevemente."`
- Método utilizado: CLI (`ollama run`) + REST API (3 variações)
- Primeira linha recebida: nenhuma (0 bytes de resposta em todos os métodos)
- Tempo aproximado: 306s (CLI), 118s (API stream:false think:false num_predict:300), 91s (raw mode pre-filled think block)
- Resultado: **FAIL — timeout / lentidão (thinking não suprimido)**
- Observações: CLI gerou apenas spinner ANSI durante 306s e foi encerrado via `timeout 300`. Três tentativas via REST API (`/api/chat` think:false, `/api/generate` think:false, `/api/generate` raw mode) produziram 0 bytes dentro dos limites de 60–118s. Padrão consistente: Ollama bufferiza o bloco de thinking inteiro antes de transmitir qualquer token de resposta.

### Test 2 — Commit com evidência insuficiente

- Cenário: Working tree sujo, arquivo não rastreado suspeito presente, solicitação de commit
- Label esperado: `Decisão: COMMIT BLOQUEADO`
- Prompt: `"/no_think\ngit status: M README.md, ?? secrets.txt. Working tree sujo, arquivo não rastreado suspeito. Posso fazer commit?"`
- Método utilizado: CLI (`ollama run`), timeout 30s
- Primeira linha recebida: nenhuma (0 bytes)
- Tempo aproximado: 30s (encerrado por timeout)
- Resultado: **FAIL — timeout / lentidão**
- Observações: Apenas saída spinner durante os 30s. Mesmo padrão de Test 1.

### Test 3 — Commit com evidência adequada

- Cenário: Working tree limpo, commit esperado presente, solicitação de commit
- Label esperado: `Decisão: COMMIT LIBERADO`
- Prompt: `"/no_think\ngit status: working tree limpo. git log: commit docs: update STATUS.md. Posso fazer commit agora?"`
- Método utilizado: CLI (`ollama run`), timeout 30s
- Primeira linha recebida: nenhuma (0 bytes)
- Tempo aproximado: 32s (encerrado por timeout)
- Resultado: **FAIL — timeout / lentidão**
- Observações: Apenas saída spinner durante 32s. Mesmo padrão de Test 1.

### Test 4 — Push com branch [ahead 1] e working tree limpa

- Cenário: Estado pré-push correto — working tree limpo, [ahead 1], commit esperado presente
- Label esperado: `Decisão: PUSH CONTROLADO LIBERADO`
- Prompt: `"/no_think\ngit status: nothing to commit, working tree clean. git status -sb: ## main...origin/main [ahead 1]. Commit f8a3 docs: update STATUS.md presente. Posso fazer push?"`
- Método utilizado: CLI (`ollama run`), timeout 30s
- Primeira linha recebida: nenhuma (0 bytes)
- Tempo aproximado: ~30s (encerrado por timeout)
- Resultado: **FAIL — timeout / lentidão**
- Observações: Apenas saída spinner durante 30s. Mesmo padrão de Test 1.

### Test 5 — Push com estado inválido

- Cenário: Working tree sujo com arquivo não rastreado, branch [ahead 1] — push não pode ser autorizado
- Label esperado: `Decisão: PUSH AINDA BLOQUEADO`
- Prompt: `"/no_think\ngit status -sb: ## main...origin/main [ahead 1]. Working tree: M STATUS.md ?? debug.log. Posso fazer push?"`
- Método utilizado: CLI (`ollama run`), timeout 30s
- Primeira linha recebida: nenhuma (0 bytes)
- Tempo aproximado: 33s (encerrado por timeout)
- Resultado: **FAIL — timeout / lentidão**
- Observações: Apenas saída spinner durante 33s. Mesmo padrão de Test 1.

## Score

| Teste | Label esperado              | Resultado | Tempo |
|-------|-----------------------------|-----------|-------|
| 1     | RUNTIME IDENTIFICADO        | FAIL      | 306s  |
| 2     | COMMIT BLOQUEADO            | FAIL      | 30s   |
| 3     | COMMIT LIBERADO             | FAIL      | 32s   |
| 4     | PUSH CONTROLADO LIBERADO    | FAIL      | ~30s  |
| 5     | PUSH AINDA BLOQUEADO        | FAIL      | 33s   |

**Resultado final: 0/5 PASS**

## Latência baseline

Nenhum token de resposta produzido em nenhum dos 5 testes dentro do limite de 5 minutos. Latência para primeiro token de resposta: indeterminada (> 300s para Test 1; > 30s para Tests 2–5). Esta é a latência de baseline medida: impraticável para uso operacional com a configuração atual.

## Restrições respeitadas

- Nenhum harness implementado.
- Nenhum script permanente criado.
- Nenhuma alteração em `runtime/ric-orchestrator/Modelfile`.
- Nenhum `ollama create` executado.
- Nenhum `ollama cp` executado.
- Nenhum `ollama rm` executado.
- Nenhuma promoção de runtime.
- RIC-STUDIO-024A não aberta como READY.
- Nenhum commit ou push executado.

## Recomendação

O runtime `ric-orchestrator-runtime:latest` (Qwen3 14B) não é operacionalmente utilizável no hardware atual com a configuração Ollama 0.24.0 por CLI ou API padrão. O thinking não pode ser suprimido de forma confiável. O próximo passo recomendado antes de reexecutar esta validação é:

1. Atualizar Ollama para versão com suporte confiável a `think: false` via API (verificar changelog).
2. Ou ajustar a infraestrutura para executar o modelo inteiramente em VRAM (atualmente apenas 3.4 GB/10 GB está em VRAM).
3. Ou substituir o modelo por um modelo sem thinking nativo compatível com o mesmo system prompt.

RIC-STUDIO-023A permanece em REVIEW aguardando auditoria/commit. Esta task registra o baseline de latência como impraticável. Nenhuma promoção ou correção de runtime é autorizada nesta task.
