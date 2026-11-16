# Git and release

Read when: committing or releasing.

- Hooks: lefthook (`lefthook.yml`). After cloning, run `pnpm exec lefthook install` if
  `.git/hooks` has no shims.
- Use `LEFTHOOK=0` for non-interactive commits: the `prepare-commit-msg` hook opens the
  interactive commitizen prompt and would hang. Prefer
  `LEFTHOOK=0 git commit -m "type(scope): summary"` (see `scripts.md`).
- Conventional Commits, validated by commitlint in the `commit-msg` hook; scopes in
  [`.github/commit-message-instructions.md`](../../.github/commit-message-instructions.md)
  (component name, or `docs` / `ui` / `config`); `!` for breaking public API changes. CI does
  not check commit messages yet.
- lefthook fixes staged files on commit (`stage_fixed: true`): `git add` first and let the hook
  re-stage.
- Release: releases are cut from Conventional Commit messages by release-please, not from a
  local command. Merge releasable commits to `main`, then follow
  [`release.md`](release.md), the [release skill](../../.agents/skills/dragone-release/SKILL.md),
  and [ADR-0007](../adr/0007-release-please.md).
