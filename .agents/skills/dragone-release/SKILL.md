---
name: dragone-release
description: Release @dragone/ui with pnpm native versioning (record change intents, apply the release plan, publish the built output) per ADR-0006. Use when preparing a release, recording change intents, or publishing.
---

# Dragone Release

Release uses pnpm's native workspace versioning (ADR-0006); no extra release tool is installed.

## Steps

1. **Confirm the workspace.** `pnpm -r ls --depth -1` must list `dragone` and `@dragone/ui`.
2. **Review pending intents.** `pnpm change status` ("No pending changes." means none).
3. **Record intents.** One per published package, non-interactive:
   `pnpm change --bump <none|patch|minor|major> --summary "<changelog entry>" @dragone/ui`.
   Use `major` for breaking public API changes (with a `!` Conventional Commit); `none` to
   explicitly decline a release when a change needs none.
4. **Preview the plan.** `pnpm version -r --dry-run`, then `pnpm version -r` to apply. It bumps
   versions, propagates `workspace:` ranges, writes changelogs, and records the ledger in
   `.changeset/ledger.yaml`.
5. **Validate the artifact.** `pnpm lint:package` (builds `dist/dragone/ui`, then runs publint).
6. **Publish.** `pnpm publish -r`. `@dragone/ui` declares `publishConfig.directory`, so the dist
   output is packed, never the source. Confirm the dry run before a real publish.

## Guardrails

- Never hand-edit `pnpm-lock.yaml` or `.changeset/ledger.yaml`.
- Never bypass `minimumReleaseAge` / `minimumReleaseAgeStrict` in `pnpm-workspace.yaml`.
- Release from a clean tree; `pnpm publish` performs git checks unless told otherwise.
