# Release Please

Dragone manages releases with [release-please](https://github.com/googleapis/release-please)
instead of pnpm's native workspace versioning. Contributors write
[Conventional Commit](https://www.conventionalcommits.org/) messages; release-please reads
them from `main` and maintains a Release PR that bumps `projects/dragone/ui/package.json`,
writes `projects/dragone/ui/CHANGELOG.md`, and records the release in
`.release-please-manifest.json`. Merging the Release PR tags the commit and creates the GitHub
Release; publication is a separate, explicitly gated step that packs `dist/dragone/ui`.

This decision also takes `@dragone/ui` out of the pnpm workspace
(`pnpm-workspace.yaml` no longer declares `packages`), so pnpm stops creating a
`projects/dragone/ui/node_modules` and no longer owns the release lifecycle. Supersedes
[ADR-0006](0006-pnpm-native-versioning.md).

## Considered Options

- **release-please (chosen)**: Release PRs generated from Conventional Commits. Works for a
  single package without workspace membership, keeps a human review step (merge the PR), and
  scales to a monorepo if more entry points are published later. Adds one GitHub Action, no
  runtime dependency.
- **Native pnpm versioning ([ADR-0006](0006-pnpm-native-versioning.md))**: Built into pnpm and
  already in place, but it requires `@dragone/ui` to be a workspace package, which is what
  produced the unwanted `projects/dragone/ui/node_modules`. Rejected as the cost of workspace
  membership outweighs the benefit for a single publishable package.
- **Changesets CLI (`@changesets/cli`)**: Also workspace-oriented; for one package it
  re-introduces the same coupling plus an extra dependency. Rejected.
- **semantic-release**: Fully automated from Conventional Commits and removes the human
  release step. Rejected: Dragone wants to review the version and changelog before tagging.
- **Manual version bumping**: Simple but error-prone and inconsistent. Rejected.

## Consequences

- No `pnpm change` / `pnpm version -r` / `pnpm publish -r`: the workspace release chain is gone.
  Release is driven entirely by commits and the release-please workflow.
- Every commit that should appear in the changelog must be a Conventional Commit (already
  enforced by commitlint). `feat` bumps the minor, `fix` the patch, `!`/`BREAKING CHANGE` the
  major — except pre-1.0, where `bump-minor-pre-major` makes a breaking change bump the minor.
- The release workflow is manual until publication is agreed: it is triggered with
  `workflow_dispatch` only, and never runs on `push`. See
  [`docs/references/release.md`](../references/release.md) for the flow and the open decisions.
- Publication packs the build output in `dist/dragone/ui`, never the source. `publishConfig.directory`
  remains on the source manifest as a safety net for a stray `pnpm publish`.
- Losing workspace membership also loses `pnpm -r` and `workspace:` range propagation. Acceptable
  with one published package; revisit if a second package is added.
