# RIC-STUDIO-013A - Runtime Prompt Refinement Evidence

## Task

RIC-STUDIO-013A - Refine Official Runtime Prompt For Evidence Claims And Role Boundaries.

## Objective

Refine the versioned official runtime prompt in `runtime/ric-orchestrator/Modelfile` to correct two observed behaviors after RIC-STUDIO-012A promotion:

- evidence overclaiming about absence of pending dependencies, blockers, or work without raw evidence;
- role confusion between the runtime auditor/orchestrator and the executor agent/Codex.

## Real cases documented

### CBM-009 - Add appointment conflict guard

Context: real Clinic Booking Mini Discussion Gate after promotion of `ric-orchestrator-runtime:latest`.

Observed acceptable behavior:

- Recommended READY correctly.
- Kept commit and push blocked.
- Requested minimum evidence.

Observed defects:

- Used wording equivalent to "there is no evidence of pending dependencies" without receiving raw evidence proving absence of dependencies or blockers.
- Used wording equivalent to "start implementation with the promoted official runtime", which blurred the boundary between runtime audit/orchestration and executor implementation.

### CBM-010 - Add appointment request time guard

Context: real Clinic Booking Mini Discussion Gate after promotion of `ric-orchestrator-runtime:latest`.

Observed acceptable behavior:

- Recommended READY correctly.
- Kept commit and push blocked.
- Requested minimum evidence.

Observed defects:

- Repeated the unsupported absence-of-pending-dependencies claim pattern without raw evidence.
- Repeated implementation-start wording that could make the runtime sound like the implementing agent.

## Prompt changes

Updated `runtime/ric-orchestrator/Modelfile` only inside the SYSTEM prompt.

Added evidence claim boundaries:

- The runtime must not state that there are no pending dependencies, blockers, missing work, missing files, or outstanding changes unless current raw evidence proves that exact claim.
- If evidence is absent, the runtime must say that the claim cannot be confirmed from current evidence.
- A clean Git status is limited to working-tree evidence and must not be expanded into dependency or blocker conclusions.
- State labels and narrative summaries alone do not prove absence of pending work.

Added role boundaries:

- The runtime is an auditor/orchestrator that decides gates, checks evidence, blocks unsafe actions, and recommends the next safe step.
- The runtime is not the executor that edits app code or implements product behavior.
- When a task becomes READY, implementation must be handed to the executor agent/Codex with approved scope and evidence requirements.
- The next safe step must not say that the runtime itself will start or perform implementation.

## Validation performed

- Confirmed the change is limited to the versioned runtime prompt and authorized documentation/status files.
- Did not run `ollama create`.
- Did not run `ollama cp`.
- Did not rebuild, promote, delete, or alter any Ollama model.
- Did not run commit or push.

## Expected behavioral correction

For future Discussion Gates like CBM-009 and CBM-010, the runtime should:

- recommend READY only when the current evidence supports it;
- keep commit and push blocked until the required raw Git/diff evidence exists;
- avoid unsupported claims about absence of pending dependencies or blockers;
- phrase implementation as work assigned to executor agent/Codex after READY, not as work performed by the runtime.

## Review status

RIC-STUDIO-013A is ready for REVIEW with no model rebuild or promotion executed.
