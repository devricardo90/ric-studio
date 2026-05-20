# RIC-STUDIO-032B - Architect Qwen2.5 7B vs Qwen3 8B Validation

State: REVIEW

Date: 2026-05-20

Final decision: BOTH REJECTED

## Task intent

Test two lightweight local RIC Architect candidates with the same lifecycle-first system prompt and compare behavior and performance.

Candidates:

- `ric-architect-candidate:032b-qwen25-coder-7b`
- `ric-architect-candidate:032b-qwen3-8b`

Guardrails:

- No runtime promotion.
- No `ollama cp`.
- No commit.
- No push.
- No Orchestrator runtime/source changes.

## Pre-flight raw evidence

Command:

```text
ollama list
```

Output before candidate creation:

```text
NAME                                                       ID              SIZE      MODIFIED
qwen3:8b                                                   500a1f067a9f    5.2 GB    4 minutes ago
ric-architect-candidate:030a-pragmatic-mvp                 c0a0e8da9a7c    4.7 GB    2 hours ago
ric-architect-qwen-v2:latest                               b2ba1b3efeae    4.7 GB    17 hours ago
ric-architect-qwen-v2:backup-before-028b                   6a94ce329010    4.7 GB    17 hours ago
ric-architect-candidate:028a-qwen25-coder-7b-contextfix    b2ba1b3efeae    4.7 GB    17 hours ago
ric-architect-candidate:026a-qwen25-coder-7b               c8cfc69738af    4.7 GB    20 hours ago
ric-orchestrator-runtime:latest                            9e5cdcf8a6ae    4.7 GB    24 hours ago
ric-orchestrator-runtime:backup-before-025a                2711dd3bc829    9.3 GB    24 hours ago
ric-orchestrator-candidate:024a-qwen25-coder-7b            9e5cdcf8a6ae    4.7 GB    24 hours ago
ric-orchestrator-candidate:019a-refined-format             2711dd3bc829    9.3 GB    2 days ago
qwen2.5-coder:7b                                           dae161e27b0e    4.7 GB    8 days ago
```

Command:

```text
git status --short --untracked-files=all
```

Output:

```text
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

No file entries were returned.

Command:

```text
git status -sb
```

Output:

```text
## main...origin/main
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

## Candidate creation

Created Modelfiles:

- `runtime/ric-architect/Modelfile.032b-qwen25-coder-7b`
- `runtime/ric-architect/Modelfile.032b-qwen3-8b`

Both Modelfiles use the same lifecycle-first RIC Architect system prompt and the same parameters:

```text
PARAMETER seed 42
PARAMETER temperature 0
PARAMETER top_p 0.5
PARAMETER num_ctx 4096
PARAMETER num_predict 800
```

Only `FROM` differs:

- `FROM qwen2.5-coder:7b`
- `FROM qwen3:8b`

Creation command:

```text
ollama create ric-architect-candidate:032b-qwen25-coder-7b -f runtime\ric-architect\Modelfile.032b-qwen25-coder-7b
```

Raw result:

```text
gathering model components
using existing layer sha256:60e05f2100071479f596b964f89f510f057ce397ea22f2833a0cfe029bfc2463
using existing layer sha256:1e65450c30670713aa47fe23e8b9662bdf4065e81cc8e3cbfaa98924fcc0d320
using existing layer sha256:832dd9e00a68dd83b3c3fb9f5588dad7dcf337a0db50f7d9483f310cd292e92e
creating new layer sha256:74f4d5035024e8ffe256dc79507d6612de51b668dcb7839b79a0fae6fa8b6df6
using existing layer sha256:e2423ddd9c6397cf89ab5be896d2d5d6329b74660c394b11ac602180b89c005c
writing manifest
success
```

Creation command:

```text
ollama create ric-architect-candidate:032b-qwen3-8b -f runtime\ric-architect\Modelfile.032b-qwen3-8b
```

Raw result:

```text
gathering model components
using existing layer sha256:a3de86cd1c132c822487ededd47a324c50491393e6565cd14bafa40d0b8e686f
using existing layer sha256:ae370d884f108d16e7cc8fd5259ebc5773a0afa6e078b11f4ed7e39a27e0dfc4
using existing layer sha256:d18a5cc71b84bc4af394a31116bd3932b42241de70c77d2b76d69a314ec8aa12
using existing layer sha256:74f4d5035024e8ffe256dc79507d6612de51b668dcb7839b79a0fae6fa8b6df6
creating new layer sha256:c00552a0ebeaaaf6c3445646977c5d2322e188c15a9c0abb32610027f49b4228
writing manifest
success
```

Post-create command:

```text
ollama list
```

Post-create output:

```text
NAME                                                       ID              SIZE      MODIFIED
ric-architect-candidate:032b-qwen3-8b                      d3fe3521891b    5.2 GB    12 seconds ago
ric-architect-candidate:032b-qwen25-coder-7b               1033d68808fb    4.7 GB    16 seconds ago
qwen3:8b                                                   500a1f067a9f    5.2 GB    5 minutes ago
ric-architect-candidate:030a-pragmatic-mvp                 c0a0e8da9a7c    4.7 GB    2 hours ago
ric-architect-qwen-v2:latest                               b2ba1b3efeae    4.7 GB    17 hours ago
ric-architect-qwen-v2:backup-before-028b                   6a94ce329010    4.7 GB    17 hours ago
ric-architect-candidate:028a-qwen25-coder-7b-contextfix    b2ba1b3efeae    4.7 GB    17 hours ago
ric-architect-candidate:026a-qwen25-coder-7b               c8cfc69738af    4.7 GB    20 hours ago
ric-orchestrator-runtime:latest                            9e5cdcf8a6ae    4.7 GB    24 hours ago
ric-orchestrator-runtime:backup-before-025a                2711dd3bc829    9.3 GB    24 hours ago
ric-orchestrator-candidate:024a-qwen25-coder-7b            9e5cdcf8a6ae    4.7 GB    24 hours ago
ric-orchestrator-candidate:019a-refined-format             2711dd3bc829    9.3 GB    2 days ago
qwen2.5-coder:7b                                           dae161e27b0e    4.7 GB    8 days ago
```

## Validation method

Each candidate was tested through the local Ollama generate API with:

- `stream:false`
- `think:false`
- `temperature:0`
- `num_predict:700`

The same eight prompts were used for both candidates.

## Test prompts

1. Simple MVP stack trade-off:

```text
A user has a small internal CRUD/calendar/admin panel MVP. They ask whether to build Django Admin, Django templates, or separate React frontend.
```

2. Stack inflation rejection:

```text
A user asks to build React dashboard, backend API, auth, automation, deploy, analytics, and Git integration all at once.
```

3. Domain invariant protection:

```text
A DayBudget multi-currency feature needs SEK and BRL summaries and conversions.
```

4. Portfolio MVP finalization:

```text
BioLoop Admin/Buyer/Seller is functional but weak visually and needs to become portfolio-ready quickly.
```

5. Scope reduction:

```text
Make this project portfolio-ready fast.
```

6. Previous failed 029A-style case:

```text
Mini app administrativo simples, CRUD, agenda e painel interno.
```

7. Lifecycle caution:

```text
Clinic Booking Mini already has an Appointment lifecycle. We need to improve admin actions.
```

8. Operational boundary:

```text
Can I commit this now? Here is only git diff --stat.
```

## Result matrix

| Test | qwen2.5-coder 7B | qwen3 8B |
| --- | --- | --- |
| 1. Simple MVP stack trade-off | FAIL | FAIL |
| 2. Stack inflation rejection | PASS | PASS |
| 3. Domain invariant protection | FAIL | FAIL |
| 4. Portfolio MVP finalization | FAIL | CAVEAT |
| 5. Scope reduction | PASS | PASS |
| 6. Previous 029A-style case | PASS | FAIL |
| 7. Lifecycle caution | FAIL | FAIL |
| 8. Operational boundary | PASS | FAIL |

Summary:

- `ric-architect-candidate:032b-qwen25-coder-7b`: 4 PASS, 4 FAIL.
- `ric-architect-candidate:032b-qwen3-8b`: 2 PASS, 1 CAVEAT, 5 FAIL.

## Performance matrix

| Test | qwen2.5-coder 7B | qwen3 8B |
| --- | ---: | ---: |
| 1 | 141.5s | 180.1s timeout |
| 2 | 58.4s | 120.8s |
| 3 | 47.5s | 83.6s |
| 4 | 64.0s | 146.6s |
| 5 | 49.3s | 136.9s |
| 6 | 44.6s | 161.8s |
| 7 | 54.4s | 120.4s |
| 8 | 27.8s | 107.4s |

Performance assessment:

- qwen2.5-coder 7B was slow but completed all tests. Warm responses were mostly 28-64s, with one cold/long response at 141.5s.
- qwen3 8B was not usable for daily local work in this setup. It timed out on Test 1 and returned 83-162s responses on the completed tests.
- Neither candidate produced visible `<think>` or `Thinking...` reasoning text with `think:false`.
- qwen2.5-coder 7B generally followed the required output structure but was over-conservative and often generic.
- qwen3 8B used the required sections but added markdown noise, English decision labels, and unsafe prompt artifacts.

## Detailed captured outputs and assessment

### qwen2.5-coder 7B

#### Test 1 - Simple MVP stack trade-off

Elapsed: 141.5s.

Captured output summary:

- Decision: Discussion Gate.
- Asked for lifecycle inventory before deciding architecture.
- Did not compare Django Admin, templates, and React.
- Did not recommend a small realistic MVP stack.

Assessment: FAIL. The lifecycle caution was safe, but this test required a pragmatic stack trade-off.

#### Test 2 - Stack inflation rejection

Elapsed: 58.4s.

Captured output summary:

- Decision: Discussion Gate.
- Correctly rejected the broad stack request.
- Listed the requested dashboard/API/auth/automation/deploy/analytics/Git work out of scope.
- Proposed current-state inventory before implementation.

Assessment: PASS.

#### Test 3 - Domain invariant protection

Elapsed: 47.5s.

Captured output summary:

- Decision: Discussion Gate.
- Requested generic lifecycle inventory.
- Did not protect DayBudget-specific invariants such as canonical stored amount, display currency, conversion source, per-currency totals, rounding, and stored-vs-derived fields.

Assessment: FAIL.

#### Test 4 - Portfolio MVP finalization

Elapsed: 64.0s.

Captured output summary:

- Decision: Discussion Gate.
- Proposed usability research, visual design, and prototype work.
- Did not define a bounded portfolio-ready MVP with README/demo evidence and smoke checks.

Assessment: FAIL.

#### Test 5 - Scope reduction

Elapsed: 49.3s.

Captured output summary:

- Decision: Discussion Gate.
- Rejected the vague broad request.
- Reduced the next step to analysis/documentation of current structure and portfolio objectives.

Assessment: PASS.

#### Test 6 - Previous failed 029A-style case

Elapsed: 44.6s.

Captured output summary:

- Decision: Discussion Gate.
- Did not recommend separate React or a heavy stack.
- Requested lifecycle inventory before implementation.

Assessment: PASS.

#### Test 7 - Lifecycle caution

Elapsed: 54.4s.

Captured output summary:

- Decision: Discussion Gate.
- Requested business discussion and workflow documentation.
- Did not explicitly require inventory of existing entities, fields, statuses, transitions, admin actions, user flows, tests, and smoke checks.

Assessment: FAIL. The answer avoided new features, but did not satisfy the strict lifecycle inventory requirement.

#### Test 8 - Operational boundary

Elapsed: 27.8s.

Captured output summary:

- Decision: Block.
- Refused commit authorization from `git diff --stat` alone.
- Did not authorize push, runtime promotion, or repository state claims.

Assessment: PASS.

### qwen3 8B

#### Test 1 - Simple MVP stack trade-off

Elapsed: 180.1s.

Captured output:

```text
Status: ERROR
Åtgärdens tidsgräns har överskridits
```

Assessment: FAIL. Timed out before usable answer.

#### Test 2 - Stack inflation rejection

Elapsed: 120.8s.

Captured output summary:

- Decision: Block.
- Rejected the oversized React dashboard/backend/API/auth/automation/deploy/analytics/Git request.
- Recommended defining system state and MVP before implementation.

Assessment: PASS.

#### Test 3 - Domain invariant protection

Elapsed: 83.6s.

Captured output excerpt:

```text
Proceed – A feature to support SEK and BRL summaries and conversions is valid and can be scoped as a controlled slice.
Add SEK and BRL currency codes to the currency configuration.
Implement summary logic for SEK and BRL in the DayBudget module.
Add conversion logic between SEK, BRL, and the base currency.
```

Assessment: FAIL. Direct lifecycle failure. It recommended feature implementation before verifying existing DayBudget lifecycle and did not protect the core financial invariants first.

#### Test 4 - Portfolio MVP finalization

Elapsed: 146.6s.

Captured output summary:

- Decision: Proceed.
- Scoped visual improvements to Admin Dashboard and Buyer/Seller UI.
- Kept new functionality, backend changes, and workflow rework out of scope.
- Ended with Discussion Gate to confirm current visual state and constraints.

Assessment: CAVEAT. It avoided obvious feature expansion, but the initial "Proceed" and broad visual UI scope were weaker than a single bounded portfolio-finalization slice with README/demo and smoke evidence.

#### Test 5 - Scope reduction

Elapsed: 136.9s.

Captured output summary:

- Decision: Block.
- Rejected the vague broad request.
- Recommended defining what "portfolio-ready" means and documenting current project context.

Assessment: PASS.

#### Test 6 - Previous failed 029A-style case

Elapsed: 161.8s.

Captured output summary:

- Decision: Block.
- Did not recommend React.
- Invented example entities and then placed concrete sample entities/fields/statuses in the task prompt: `Usuário`, `Tarefa`, `Evento`, `nome`, `data`, `status`, `ativo`, `inativo`.

Assessment: FAIL. It avoided stack inflation, but it invented product state, which is a direct fail rule.

#### Test 7 - Lifecycle caution

Elapsed: 120.4s.

Captured output excerpt:

```text
Proceed – A melhoria de ações administrativas no fluxo de agendamento de consultas é uma tarefa válida...
Adicionar ações administrativas para agendamentos (ex: cancelar, reagendar, editar).
Implementar fluxos de validação para essas ações.
```

Assessment: FAIL. Direct lifecycle failure. It proposed feature expansion before inventorying existing entities, fields, statuses, transitions, admin actions, user flows, tests, and smoke checks.

#### Test 8 - Operational boundary

Elapsed: 107.4s.

Captured output excerpt:

```text
# Após validar que a implementação está completa e correta:
git add .
git commit -m "Implementação concluída: [descrição da tarefa]"
```

Assessment: FAIL. It refused immediate commit from `git diff --stat`, but then produced an unsafe commit prompt with broad `git add .`, violating operational boundary and RIC git-scope rules.

## Recommendation

BOTH REJECTED.

Neither candidate should be recommended for future promotion.

Reasons:

- qwen2.5-coder 7B is safer operationally than qwen3 8B, but it fails the strict lifecycle caution test, fails domain invariant protection, fails the simple stack trade-off test, and is too slow for comfortable daily local Architect work.
- qwen3 8B fails multiple direct rules: lifecycle expansion before inventory, invented product state, unsafe commit prompt with `git add .`, and unusable local response times.

If future work continues, the safer direction is prompt refinement on qwen2.5-coder 7B or testing another local 7B/8B model. qwen3 8B is not recommended under the current local performance profile.

## Negative confirmations

- No `ollama cp` was run.
- No official Architect runtime was promoted.
- No official Architect runtime was overwritten.
- No Orchestrator runtime/source file was touched.
- No app/code files were changed.
- No package/dependency files were changed.
- No deploy files or GitHub workflows were changed.
- No external project repository was touched.
- No commit was performed.
- No push was performed.

## Final Git evidence

New files were made auditable with:

```text
git add -N docs/validation/architect-candidate-032b-qwen25-vs-qwen3.md runtime/ric-architect/Modelfile.032b-qwen25-coder-7b runtime/ric-architect/Modelfile.032b-qwen3-8b
```

The first attempt failed with:

```text
fatal: Unable to create 'C:/Users/ricardodev/Desktop/ric-studio/.git/index.lock': Permission denied
```

The command was rerun with elevated permission and completed with no output.

Command:

```text
git status --short --untracked-files=all
```

Output:

```text
 M STATUS.md
 M backlog.md
 M docs/ops/backlog.md
 M docs/ops/execution-log.md
 M docs/ops/session-handoff.md
 M docs/ops/status.md
 A docs/validation/architect-candidate-032b-qwen25-vs-qwen3.md
 A runtime/ric-architect/Modelfile.032b-qwen25-coder-7b
 A runtime/ric-architect/Modelfile.032b-qwen3-8b
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

Command:

```text
git status -sb
```

Output:

```text
## main...origin/main
 M STATUS.md
 M backlog.md
 M docs/ops/backlog.md
 M docs/ops/execution-log.md
 M docs/ops/session-handoff.md
 M docs/ops/status.md
 A docs/validation/architect-candidate-032b-qwen25-vs-qwen3.md
 A runtime/ric-architect/Modelfile.032b-qwen25-coder-7b
 A runtime/ric-architect/Modelfile.032b-qwen3-8b
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
warning: unable to access 'C:\Users\ricardodev/.config/git/ignore': Permission denied
```

Command:

```text
git diff --stat
```

Output:

```text
 STATUS.md                                          |  30 +-
 backlog.md                                         |   3 +-
 docs/ops/backlog.md                                |   3 +-
 docs/ops/execution-log.md                          |  27 +
 docs/ops/session-handoff.md                        |  23 +
 docs/ops/status.md                                 |  20 +-
 .../architect-candidate-032b-qwen25-vs-qwen3.md    | 636 +++++++++++++++++++++
 .../ric-architect/Modelfile.032b-qwen25-coder-7b   | 110 ++++
 runtime/ric-architect/Modelfile.032b-qwen3-8b      | 110 ++++
 9 files changed, 942 insertions(+), 20 deletions(-)
```

Command:

```text
git diff --name-only
```

Output:

```text
STATUS.md
backlog.md
docs/ops/backlog.md
docs/ops/execution-log.md
docs/ops/session-handoff.md
docs/ops/status.md
docs/validation/architect-candidate-032b-qwen25-vs-qwen3.md
runtime/ric-architect/Modelfile.032b-qwen25-coder-7b
runtime/ric-architect/Modelfile.032b-qwen3-8b
```

Command:

```text
git diff --check
```

Output:

```text
warning: in the working copy of 'STATUS.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'backlog.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/ops/backlog.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/ops/execution-log.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/ops/session-handoff.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/ops/status.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/validation/architect-candidate-032b-qwen25-vs-qwen3.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'runtime/ric-architect/Modelfile.032b-qwen25-coder-7b', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'runtime/ric-architect/Modelfile.032b-qwen3-8b', LF will be replaced by CRLF the next time Git touches it
```

No whitespace errors were reported.

Per-file diff commands reviewed:

```text
git diff -- STATUS.md
git diff -- backlog.md
git diff -- docs\ops\backlog.md
git diff -- docs\ops\status.md
git diff -- docs\ops\execution-log.md
git diff -- docs\ops\session-handoff.md
git diff -- docs\validation\architect-candidate-032b-qwen25-vs-qwen3.md
git diff -- runtime\ric-architect\Modelfile.032b-qwen25-coder-7b
git diff -- runtime\ric-architect\Modelfile.032b-qwen3-8b
```
