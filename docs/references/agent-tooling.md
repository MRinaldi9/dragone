# Agent tooling

Read when: changing agent configuration, adding a skill, or wiring an MCP server.

This repo is configured for **two coding agents at once** — opencode and Claude Code. They
read different files, so a change in one place usually needs a matching change in the
other.

## Who reads what

| Concern      | opencode                    | Claude Code                            | Shared           |
| ------------ | --------------------------- | -------------------------------------- | ---------------- |
| Instructions | `AGENTS.md`                 | `AGENTS.md`                            | ✅ same files    |
| Agents       | `.opencode/agents/*.md`     | `.claude/agents/*.md`                  | ✗ ported by hand |
| Skills       | `.agents/skills/*/SKILL.md` | `.claude/skills/*/SKILL.md` (pointers) | ✅ one source    |
| MCP          | `opencode.jsonc`            | `.mcp.json`                            | ✗ duplicated     |
| Settings     | `opencode.jsonc`            | `.claude/settings.json`                | ✗                |

VS Code / Copilot also reads `.vscode/mcp.json` and
[`.github/commit-message-instructions.md`](../../.github/commit-message-instructions.md).

## Skills live in `.agents/skills/`

`.agents/skills/` is the single source of truth. Claude Code only auto-discovers skills
under `.claude/skills/`, so each skill has a short **pointer** `SKILL.md` there that
repeats the `name` / `description` frontmatter and delegates to the real file.

Consequences:

- Add a skill → create it in `.agents/skills/`, then add a pointer in `.claude/skills/`.
- Change a skill's `description` → update the pointer too, or the two will trigger
  differently. This is not detected automatically.
- `accessibility` and `angular-developer` are **vendored** from GitHub and tracked in
  `skills-lock.json`. Never edit them by hand: re-syncing overwrites them and the
  `computedHash` would no longer match. `pnpm lint:docs` skips their internal links for
  the same reason.

`.claude/skills/{validate,new-component,adr}` are not pointers — they are user-invocable
slash commands (`/validate`, `/new-component`, `/adr`).

## MCP servers

Three servers, declared in three places that must stay in sync: `.mcp.json` (Claude Code),
`opencode.jsonc` (opencode), `.vscode/mcp.json` (VS Code).

| Server        | Purpose                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `ngp-mcp`     | ng-primitives lookup. Required by the "Primitive first" rule (ADR-0001). |
| `angular-cli` | Angular CLI schematics and migrations.                                   |
| `penpot`      | Design source. Remote HTTP server.                                       |

Launch `ngp-mcp` as `pnpm exec ngp-mcp` everywhere. A remote server **must** declare
`"type": "http"` alongside `url`, or it is parsed as stdio and fails.

If an MCP server does not respond, use the documentation fallbacks:

- `ngp-mcp` → <https://angularprimitives.com/assets/llms/llms-full.txt>
- `angular-cli` → <https://angular.dev/llms.txt>

## Do not create a `CLAUDE.md`

Claude Code loads `AGENTS.md` **only when no `CLAUDE.md` (or `CLAUDE.local.md`) exists** in
the working directory or above it. Creating one would silence all four `AGENTS.md` files in
this repo. Claude-specific configuration belongs in `.claude/`, never in a `CLAUDE.md`.

## Permissions and hooks

[`.claude/settings.json`](../../.claude/settings.json) pre-approves the routine commands in
[`scripts.md`](scripts.md) and denies writes to the generated files listed in `AGENTS.md`.

One hook is configured: `PostToolUse` on `Edit|Write` runs
[`.claude/hooks/format-edited.mjs`](../../.claude/hooks/format-edited.mjs), which formats
the edited file with oxfmt — the same job lefthook does on commit. It never blocks an edit.

`.claude/settings.local.json` is gitignored and holds personal overrides.

## `CI=true` is POSIX syntax

`CI=true pnpm test` sets the variable inline, which works in bash (including the Bash tool
on Windows) but **not** in PowerShell. In PowerShell use `$env:CI='true'; pnpm test`.
`CI=true` makes Vitest run headless and one-shot — see [`scripts.md`](scripts.md).
