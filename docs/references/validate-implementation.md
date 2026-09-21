# Validate Implementation

Read before reporting completion:

1. `pnpm format:check`
2. `pnpm lint`
3. `CI=true pnpm test` (or a focused vitest run for a narrow change)
4. Anything under `projects/dragone/ui`: see `projects/dragone/ui/AGENTS.md` for the
   library-specific steps.

CI (`.github/workflows/pr-checks.yml`) gates format, lint, tests, and the library build /
package lint / Storybook build job. Release steps are still manual.
