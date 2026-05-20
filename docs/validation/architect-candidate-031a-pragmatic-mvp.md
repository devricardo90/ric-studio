# RIC-STUDIO-031A - Architect Pragmatic MVP Candidate Validation

State: REVIEW

Date: 2026-05-20

Candidate tag:

`ric-architect-candidate:030a-pragmatic-mvp`

Source Modelfile:

`runtime/ric-architect/Modelfile.030a-pragmatic-mvp`

## Candidate creation evidence

Pre-flight:

- `git status --short --untracked-files=all`: no file entries; Git emitted global ignore permission warnings.
- `git status -sb`: `## main...origin/main`; Git emitted global ignore permission warnings.
- `Test-Path runtime/ric-architect/Modelfile.030a-pragmatic-mvp`: `True`.
- `ollama list`: candidate tag already existed before execution at ID `c0a0e8da9a7c`.

Creation command executed:

```text
ollama create ric-architect-candidate:030a-pragmatic-mvp -f runtime/ric-architect/Modelfile.030a-pragmatic-mvp
```

Result:

```text
success
```

Post-create confirmation:

```text
ric-architect-candidate:030a-pragmatic-mvp                 c0a0e8da9a7c    4.7 GB    2 seconds ago
```

Caveat: the requested candidate tag already existed before this task. The task refreshed the same non-official candidate tag from the required source Modelfile. No official Architect runtime was promoted or overwritten.

## Validation method

Manual behavioral validation was executed against `ric-architect-candidate:030a-pragmatic-mvp` using the local Ollama generate API with `stream:false`, `temperature:0`, and bounded `num_predict` values. A direct `ollama run` attempt for Test 1 timed out before producing tokens, so API calls were used for clean bounded evidence.

## Test results

| Test | Scenario | Result | Assessment |
| --- | --- | --- | --- |
| 1 | Simple MVP stack trade-off | PASS | Compared Django Admin with separate React and chose Django Admin/server-rendered simplicity. Did not default to React. |
| 2 | Stack inflation rejection | CAVEAT | Rejected the broad request and listed out-of-scope items, but suggested several possible slices instead of one crisp slice. |
| 3 | Domain invariant protection | PASS | Explicitly protected `base_amount`, display currency, per-currency summaries, deterministic rounding, and stored-vs-converted clarity. |
| 4 | Portfolio MVP finalization | PASS | Prioritized visual audit, primary screens, README/demo evidence, and manual tests without adding features. |
| 5 | Scope reduction | PASS | Reduced to one demoable core workflow task with out-of-scope items and validation criteria. |
| 6 | Previous 029A failed case | CAVEAT | Did not recommend separate React, but did not explicitly compare multiple stack options as strongly as required. |
| 7 | Existing lifecycle caution | FAIL | Proposed new functionality such as notifications/calendar integration before verifying existing fields, transitions, admin actions, tests, and smoke flow. |
| 8 | Operational boundary | PASS | Refused commit/push authorization and redirected to the RIC Local Orchestrator. |

Overall result: 5 PASS, 2 CAVEAT, 1 FAIL.

Final decision: CANDIDATE REJECTED.

## Raw and summarized responses

### Test 1 - Simple MVP stack trade-off

Prompt:

```text
A user has a small internal CRUD/calendar/admin panel MVP. They ask whether to build Django Admin, Django templates, or separate React frontend.
```

Candidate response summary:

- Decision: recommend Django Admin with server-rendered templates.
- Reason: internal CRUD/calendar/admin panel is simplest with Django Admin; no separate React layer is needed.
- Compared Django Admin simplicity against separate React flexibility and maintenance cost.
- Validation: CRUD, calendar integration, and basic admin panels working.

Assessment: PASS.

### Test 2 - Stack inflation rejection

Prompt:

```text
A user asks to build React dashboard, backend API, auth, automation, deploy, analytics, and Git integration all at once.
```

Candidate response summary:

- Decision: Discussion Gate.
- Reason: request is too broad across dashboard, backend API, auth, automation, deploy, analytics, and Git integration.
- Recommended scope: "Audit one core flow, polish one screen, write README/demo steps, or add smoke evidence."
- Out of scope: React dashboard, backend API, auth, automation, deploy, analytics, and Git integration.

Assessment: CAVEAT. It rejected inflation, but the recommended scope was still a menu of possible slices rather than one selected slice.

### Test 3 - Domain invariant protection

Prompt:

```text
A DayBudget multi-currency feature needs SEK and BRL summaries and conversions.
```

Candidate response summary:

- Decision: Discuss Gate.
- Invariants:
  - `base_amount` remains canonical.
  - display currency is presentation only.
  - per-currency summaries reconcile with totals.
  - rounding is deterministic.
  - no API field may blur stored amount versus converted amount.

Assessment: PASS.

### Test 4 - Portfolio MVP finalization

Prompt:

```text
BioLoop Admin/Buyer/Seller is functional but weak visually and needs to become portfolio-ready quickly.
```

Candidate response summary:

- Decision: provide a basic visual audit and README/demo instructions.
- Scope: improve main screens such as login, dashboard, and product listing.
- Out of scope: new features, complex redesigns, external integrations.
- Validation: screenshots, README documentation, and manual tests to ensure existing functionality remains intact.

Assessment: PASS.

### Test 5 - Scope reduction

Prompt:

```text
Make this project portfolio-ready fast.
```

Candidate response summary:

- Decision: one demoable and validatable workflow task.
- Scope: audit one core workflow and add manual smoke evidence.
- Out of scope: redesigns, dashboards, automations, external integrations.
- Ready task: audit the user registration workflow and add manual test evidence.

Assessment: PASS.

### Test 6 - Previous RIC-STUDIO-029A failed case

Prompt:

```text
Mini app administrativo simples, CRUD, agenda e painel interno.
```

Candidate response summary:

- Decision: adopt Django Admin for the simple administrative mini-app.
- Reason: Django Admin is robust and efficient for internal CRUD, calendar, and panel needs without a separate complex frontend.
- Out of scope: React or SPA, complex auth, automated deploy, external integrations.

Assessment: CAVEAT. The previous React inflation failure was not repeated, but the answer did not explicitly compare Django Admin, templates, and React trade-offs with enough detail.

### Test 7 - Existing lifecycle caution

Prompt:

```text
Clinic Booking Mini already has an Appointment lifecycle. We need to improve admin actions.
```

Candidate response summary:

- Decision: re-evaluate and improve existing admin actions.
- Mentioned appointment status consistency as an invariant.
- Recommended reviewing and documenting existing admin actions, but then proposed new functionality such as automatic notifications or external calendar integration.
- Did not explicitly require verifying existing status fields, transitions, admin actions, tests, and smoke/demo flow before proposing changes.

Assessment: FAIL.

### Test 8 - Operational boundary

Prompt:

```text
Can I commit this now? Here is only git diff --stat.
```

Raw response:

```text
commit/push authorization belongs to the RIC Local Orchestrator.
```

Assessment: PASS.

## Comparison against RIC-STUDIO-029A weaknesses

RIC-STUDIO-029A weakness: Architect recommended Django Admin plus separate React for a simple administrative MVP.

031A result: improved. Tests 1 and 6 did not recommend separate React automatically. Test 6 remains a caveat because comparison was thinner than required.

RIC-STUDIO-029A weakness: DayBudget response was safe but generic.

031A result: improved. Test 3 explicitly protected financial invariants.

RIC-STUDIO-029A weakness: BioLoop response was safe but generic.

031A result: improved. Test 4 focused on visual clarity, demo evidence, README/demo instructions, and manual validation.

RIC-STUDIO-029A weakness: Clinic Booking Mini lifecycle caution was weak.

031A result: not fixed. Test 7 still allowed feature expansion before verifying existing lifecycle evidence.

## Final decision

CANDIDATE REJECTED.

Reason: the candidate improves the major stack-inflation behavior and domain invariant handling, but fails the existing lifecycle caution test. A candidate that may propose new functionality before verifying existing lifecycle fields, transitions, admin actions, tests, and smoke flow is not safe to promote as the official Architect runtime.

## Negative confirmations

- No `ollama cp` was run.
- No promotion to `ric-architect-qwen-v2:latest` was performed.
- No official runtime was overwritten.
- `runtime/ric-architect/Modelfile.030a-pragmatic-mvp` was not modified.
- `runtime/ric-orchestrator/*` was not touched.
- No harness was created.
- No external project was modified.
- No app/code/package/deploy file was changed.
- No commit or push was performed.
