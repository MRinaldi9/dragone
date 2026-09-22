# Scripts

Read when: before running any project command.

Commands are defined in `package.json` and `angular.json`; CI runs format, lint, tests, and the
build / package lint / Storybook job in `.github/workflows/pr-checks.yml`.

| Task                      | Command                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| Install                   | `pnpm install`                                                           |
| Test browsers (first run) | `pnpm exec playwright install --with-deps --only-shell`                  |
| Component dev env         | `pnpm storybook` (port 6006)                                             |
| Build Storybook           | `pnpm build-storybook`                                                   |
| Watch tests               | `pnpm test`                                                              |
| One-shot tests            | `CI=true pnpm test`                                                      |
| Focused tests             | `CI=true pnpm exec vitest run <path-substring>`                          |
| Build library             | `pnpm build @dragone/ui` → `dist/dragone/ui`                             |
| Format                    | `pnpm format` (fix) / `pnpm format:check`                                |
| Lint                      | `pnpm lint` (= `pnpm lint:oxlint && pnpm lint:eslint && pnpm lint:docs`) |
| Docs link check           | `pnpm lint:docs`                                                         |
| Package lint              | `pnpm lint:package` (builds, then publint `dist/dragone/ui`)             |
| Commit (interactive)      | `pnpm commit`                                                            |
| Commit (non-interactive)  | `LEFTHOOK=0 git commit -m "type(scope): summary"`                        |

`pnpm commit` (without `-m`) opens the interactive commitizen prompt and will hang an agent;
use the non-interactive form above. Release is driven by release-please, not by a local
command — see [`release.md`](release.md).
