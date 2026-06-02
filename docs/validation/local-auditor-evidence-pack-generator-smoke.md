# Local Auditor Evidence Pack Generator Smoke

## Task

RIC-STUDIO-045A - Implement Read-Only Local Evidence Pack Generator.

## Objective

Validate that `tools/auditor/collect-evidence.mjs` emits a structured local evidence package to stdout from read-only Git commands, writes no files by default, and preserves the existing auditor as the decision authority.

## Scope

The generator is a collector only. It does not authorize commit, push, Local DONE, or Remote DONE. It does not stage, commit, push, reset, checkout, clean, delete files, call GitHub APIs, modify `.github`, create UI, start a server, touch a database, add dependencies, alter package files, change runtime files, alter any `Modelfile`, or use LangChain or LangGraph.

## Commands

### 1. Generator Smoke

```powershell
node tools/auditor/collect-evidence.mjs --task RIC-STUDIO-045A --gate commit
```

Expected result: JSON printed to stdout.

Observed summary:

- `task_id`: `RIC-STUDIO-045A`.
- `requested_gate`: `commit`.
- `human_review_required`: `true`.
- `allowed_actions`: `read_only_git_evidence_collection`.
- `blocked_actions` include `git add`, `git commit`, `git push`, `git reset`, `git checkout`, `git clean`, file deletion, automatic file modification, and GitHub API.
- The summary states that the collector is not an authority and does not authorize commit, push, or Remote DONE.

### 2. Generator To Temporary Evidence File

```powershell
node tools/auditor/collect-evidence.mjs --task RIC-STUDIO-045A --gate commit > .tmp-auditor-evidence.json
```

Expected result: temporary JSON evidence file created only by explicit shell redirection.

Observed result after correction:

- The temporary file was created.
- Windows PowerShell 5 writes the redirected file as UTF-16LE with BOM.
- `tools/auditor/audit.mjs` now supports UTF-8 and UTF-16LE with BOM evidence files.

### 3. Auditor Reads Generated Evidence

```powershell
node tools/auditor/audit.mjs .tmp-auditor-evidence.json
```

Expected result: structured auditor JSON decision. The generator itself must not claim `COMMIT_ALLOWED`.

Observed result after the exact Windows PowerShell redirection command:

- `decision`: `COMMIT_BLOCKED`.
- `task_id`: `RIC-STUDIO-045A`.
- `requested_gate`: `commit`.
- `human_review_required`: `true`.
- `missing_evidence`: `file_diffs`, `validation_output`.

The PowerShell redirected evidence file no longer fails as missing `valid_json`. The auditor blocks for real missing evidence, which preserves the generator's collector-only boundary.

UTF-8 control command:

```powershell
cmd /c "node tools\auditor\collect-evidence.mjs --task RIC-STUDIO-045A --gate commit > .tmp-auditor-evidence.json"
```

Observed result:

- `decision`: `COMMIT_BLOCKED`.
- `task_id`: `RIC-STUDIO-045A`.
- `requested_gate`: `commit`.
- `human_review_required`: `true`.
- `blocked_actions`: `commit`, `push`, `remote_done`.

The auditor blocked because the generated package is repository evidence only and does not include implementation validation evidence or per-file diffs. This is the intended authority boundary for RIC-STUDIO-045A.

### 4. Cleanup Temporary File

```powershell
Remove-Item .tmp-auditor-evidence.json
```

Expected result: temporary file removed.

### 5. Confirm No Leftover Temporary Files

```powershell
git status --short --untracked-files=all
```

Observed result: no `.tmp-auditor-evidence.json` entry.

### 6. Scope And Diff Checks

```powershell
git status -sb
git diff --stat
git diff --check
```

Observed result: only authorized task files appear in Git scope evidence. `git diff --check` exited successfully and reported CRLF conversion warnings for modified tracked Markdown files, but no whitespace errors.

## Result

PASS. The generator emits JSON to stdout, writes no files by default, collects read-only local Git evidence, and preserves human review and auditor authority.

The auditor now reads generated evidence files produced by both Windows PowerShell 5 redirection and UTF-8-preserving redirection. In both cases the generated repository-only evidence returns controlled `COMMIT_BLOCKED` for real missing evidence rather than an encoding-related `valid_json` failure.

## Negative Confirmations

- No git add was performed.
- No git commit was performed.
- No git push was performed.
- No git reset, checkout, clean, or file deletion was performed.
- No GitHub API integration was added.
- No `.github` workflow was added.
- No UI, server, database, dependency, package file, LangChain, LangGraph, runtime, Modelfile, Ollama, or automation change was added.
- No new READY task was opened.
