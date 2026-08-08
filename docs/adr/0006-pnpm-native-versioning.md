# Native pnpm Versioning

Dragone uses pnpm's native workspace release management for versioning (SemVer). Contributors record a change intent with `pnpm change` in each PR that modifies the published API — naming the affected packages, the bump type (`major`, `minor`, `patch`, or `none`), and a summary that becomes the changelog entry. At release time, `pnpm version -r` consumes the pending intents: it bumps versions, propagates changes to dependents via `workspace:` ranges, writes changelogs, and records what it consumed in `.changeset/ledger.yaml`. No separate release tool is installed.

## Considered Options

- **Native pnpm versioning (chosen)**: Built into pnpm since v11.13.0, driven by `pnpm change` and `pnpm version -r`. No extra dependency; intent files use the changesets format but are written and consumed by pnpm itself. Configurable via the `versioning` key in `pnpm-workspace.yaml`.
- **Changesets CLI (`@changesets/cli`)**: A separate dev dependency that manages the same intent-file workflow. Extra tooling with no benefit over pnpm's native support.
- **semantic-release**: Fully automated releases based on Conventional Commit messages. Removes human judgment from the release process and requires strict commit discipline across all contributors.
- **release-please**: Google-style release PRs generated from Conventional Commits. Less flexible for a multi-entry-point library.
- **Manual version bumping**: Developer manually updates `package.json` version and writes a changelog entry. Simple but error-prone and inconsistent.

## Consequences

- Every PR that changes the published API must record a change intent with `pnpm change` (enforced by CI or lefthook).
- Pre-1.0 (`0.x`): breaking changes may occur in minor versions per SemVer convention. Once `1.0` is reached, breaking changes require a major version bump.
- Release flow: run `pnpm change status` to review the plan, `pnpm version -r --dry-run` to preview, then `pnpm version -r` to apply, and `pnpm publish -r` to publish.
- Contributors need to learn the `pnpm change` workflow, which is a small learning curve compared to commit-message-only approaches.
