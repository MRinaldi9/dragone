---
name: validate
description: Run the Dragone validation gate before reporting completion — format check, lint, tests, and the library build when projects/dragone/ui changed. Use before declaring any change done.
allowed-tools: Bash(pnpm lint*), Bash(pnpm format*), Bash(CI=true pnpm test*), Bash(CI=true pnpm exec vitest*), Bash(pnpm build*), Bash(git status*), Bash(git diff*)
---

# Validate

The canonical gate is
[`docs/references/validate-implementation.md`](../../../docs/references/validate-implementation.md).
Run it in order and stop at the first failure — fix, then restart from step 1.

1. `pnpm format:check`
2. `pnpm lint` (oxlint → eslint → stylelint → docs links)
3. `CI=true pnpm test`, or `CI=true pnpm exec vitest run <area>` for a narrow change

Then, only if `projects/dragone/ui` changed
(see [`projects/dragone/ui/AGENTS.md`](../../../projects/dragone/ui/AGENTS.md)):

4. `pnpm build @dragone/ui`
5. `pnpm build-storybook` — only if stories or Storybook config changed
6. `pnpm lint:package` — only if the public API changed

`CI=true` is POSIX syntax: run these through the Bash tool, not PowerShell.

Report the exact commands run and their results. Never report completion on an unrun or
failing gate.
