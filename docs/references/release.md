# Release

Read when: preparing a release, changing the release automation, or answering "how does a
release happen?". Decision record: [ADR-0007](../adr/0007-release-please.md).

## How release-please works

[release-please](https://github.com/googleapis/release-please) is a release bot that turns
Conventional Commit messages into releases. It does **not** publish to npm and does not manage
branches; it only generates changelogs, version bumps, tags, and GitHub Releases.

Each time it runs against `main` it:

1. Reads the commits since the last release and classifies them by Conventional Commit type.
2. Opens or updates a **Release PR** that bumps the version, writes `CHANGELOG.md`, and updates
   `.release-please-manifest.json`.
3. Waits. The Release PR keeps accumulating commits until a human merges it.
4. On merge, tags the commit and creates a GitHub Release.

Version bumps follow the commit types:

| Commit                        | Bump                    |
| ----------------------------- | ----------------------- |
| `fix:`                        | patch                   |
| `feat:`                       | minor                   |
| `feat!:` / `BREAKING CHANGE:` | major (minor while 0.x) |
| `chore:`, `docs:`, `ci:` …    | none                    |

`bump-minor-pre-major: true` in [`release-please-config.json`](../../release-please-config.json)
keeps the pre-1.0 rule from ADR-0006: before `1.0`, a breaking change bumps the minor, not the
major. Non-releasable types (`chore`, `docs`, `ci`, `test`, `style`, `refactor` without a
breaking change) do not create a release PR on their own.

A release can be forced to a specific version with a `Release-As: x.y.z` footer in a commit
body. Merged-commit wording can be corrected with a `BEGIN_COMMIT_OVERRIDE` section in the PR
body before the next run.

## The Dragone setup

| File                                                                                 | Role                                                             |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [`release-please-config.json`](../../release-please-config.json)                     | Manifest config: one package, `projects/dragone/ui`, type `node` |
| [`.release-please-manifest.json`](../../.release-please-manifest.json)               | Last released version per package                                |
| [`.github/workflows/release-please.yml`](../../.github/workflows/release-please.yml) | Runs the bot (manual today) and, when enabled, publishes         |
| `projects/dragone/ui/CHANGELOG.md`                                                   | Written by release-please; do not hand-edit entries              |

There is exactly one published package (`@dragone/ui`), so the tag is plain `vX.Y.Z`
(`include-component-in-tag: false`). The version that matters lives in
`projects/dragone/ui/package.json`; ng-packagr copies it to `dist/dragone/ui/package.json`
during the build, so bumping the source is enough.

`@dragone/ui` is deliberately **outside** the pnpm workspace: `pnpm-workspace.yaml` declares no
`packages`. This keeps pnpm from creating `projects/dragone/ui/node_modules` and from owning the
release lifecycle, and it is why `pnpm -r` / `pnpm publish -r` no longer exist here.

## The flow (once publishing is enabled)

```
PR with Conventional Commits ──▶ merge to main
                                     │
                 release-please-action (push on main, later)
                                     │
             opens / updates the Release PR (version + CHANGELOG)
                                     │
                           merge the Release PR
                                     │
              release-please tags the commit + creates the GitHub Release
                                     │
     same workflow: build @dragone/ui, then publish dist/dragone/ui to npm
```

## Current state: manual, publishing disabled

Until the team agrees to publish, the workflow:

- has **no `push` trigger**, so it never runs on its own; it must be started from the Actions tab
  (`workflow_dispatch`);
- gates the build and publish steps behind the `publish` input, which defaults to `false`, so a
  run only drives release-please (Release PR / tag / GitHub Release) and never touches npm.

To enable publishing later, follow the open decisions below, then replace the
`workflow_dispatch`-only trigger with:

```yaml
on:
  push:
    branches: [main]
```

## Open decisions

These are unresolved. Record the outcome here or in an ADR when each is decided.

1. **Publish authentication** — npm
   [trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC, no long-lived secret;
   the workflow already sets `id-token: write` and `--provenance`) vs an `NPM_TOKEN` secret
   (`env: NODE_AUTH_TOKEN`, drop `id-token: write` and `--provenance`). Recommended: OIDC.
2. **`RELEASE_PLEASE_TOKEN`** — a PAT (fine-grained: `contents`, `issues`, `pull-requests`
   write) makes CI (`pr-checks.yml`) run on the Release PR. Without it the workflow falls back to
   `GITHUB_TOKEN`, and no checks run on the Release PR.
3. **Tag format** — currently `vX.Y.Z` via `include-component-in-tag: false`. Switch back to
   `@dragone/ui-vX.Y.Z` if a second package is ever added.
4. **Ship the changelog?** — `projects/dragone/ui/CHANGELOG.md` is copied into the package via
   `assets` in `ng-package.json`. Remove that asset to keep the changelog repo-only.
5. **`publishConfig.directory`** — kept on the source manifest as a safety net so a stray
   `pnpm publish` inside `projects/dragone/ui` packs `dist/dragone/ui`. Remove it only if that
   protection is not wanted.
6. **Bootstrap** — release-please needs a baseline tag. `0.0.1` is the starting version and there
   are no tags yet, so tag the commit that reflects `0.0.1` (`git tag v0.0.1 <sha> &&
git push origin v0.0.1`) before the first run, or set `bootstrap-sha` in the config.
7. **Provenance / access** — scoped public package, so `--access public` is required. Confirm
   provenance attestations are acceptable on the runner.

## Running a release today

Manual, without publishing:

1. Confirm `main` is green and the commits you want are Conventional.
2. Actions ▸ `release-please` ▸ Run workflow, `publish` left `false`.
3. review the Release PR it opens; merge it when the version and changelog are right.
4. the bot tags and creates the GitHub Release.

When publishing is enabled, a second run with `publish: true` (or the `push` trigger) builds and
publishes `dist/dragone/ui`.

## Guardrails

- Never hand-edit `.release-please-manifest.json`, or the release-please block of
  `CHANGELOG.md`.
- Never `npm publish` / `pnpm publish` from `projects/dragone/ui` as a release step: publish
  `dist/dragone/ui` (the same thing `pnpm lint:package` builds and lints).
- Keep `pnpm lint:package` in the loop before enabling publication.
