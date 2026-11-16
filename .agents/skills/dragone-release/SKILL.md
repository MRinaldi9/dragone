---
name: dragone-release
description: Release @dragone/ui with release-please (Conventional Commits, Release PR, gated publish of the built output) per ADR-0007. Use when preparing a release, recording change intent, or publishing.
---

# Dragone Release

Release is driven by [release-please](https://github.com/googleapis/release-please) from
Conventional Commit messages (ADR-0007). There is no change-intent file and no `pnpm change`.
The operational guide, including the open decisions, is
[`docs/references/release.md`](../../../docs/references/release.md) — read it first.

## Steps

1. **Confirm the flow is wanted.** The workflow is manual today: it has no `push` trigger and
   publishing is gated behind the `publish` input (default `false`).
   `docs/references/release.md` lists what must be decided and configured before publishing.
2. **Write releasable commits.** `fix:` → patch, `feat:` → minor, `!` / `BREAKING CHANGE:` →
   major (minor while pre-1.0). Non-releasable types (`chore`, `docs`, `ci`, `test`, `style`)
   do not open a Release PR alone.
3. **Run the bot.** Actions ▸ `release-please` ▸ Run workflow (or wait for it once the `push`
   trigger is added). It opens or updates the Release PR.
4. **Review the Release PR** — version and `CHANGELOG.md`. Force a version with a
   `Release-As: x.y.z` footer, or correct wording with a `BEGIN_COMMIT_OVERRIDE` section in the
   PR body, before the next run.
5. **Merge the Release PR.** release-please tags the commit and creates the GitHub Release.
6. **Publish** (only once enabled): a run with `publish: true` builds `@dragone/ui` and publishes
   `dist/dragone/ui`. Validate first with `pnpm lint:package`.

## Guardrails

- Publish `dist/dragone/ui`, never the source package.
- Never hand-edit `.release-please-manifest.json` or the generated `CHANGELOG.md` entries.
- Do not add a `push` trigger to `release-please.yml` until publication is agreed and
  authenticated.
