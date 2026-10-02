---
name: new-component
description: Scaffold a new Component in @dragone/ui by name, following the Dragone component-authoring procedure end to end.
argument-hint: '[name]'
disable-model-invocation: true
---

# New Component

Create the `$ARGUMENTS` Component in `@dragone/ui`.

Follow [`.agents/skills/dragone-component-authoring/SKILL.md`](../../../.agents/skills/dragone-component-authoring/SKILL.md)
in full — it is the authoritative 9-step procedure. Do not improvise around it.

Before starting, read:

- [`projects/dragone/ui/AGENTS.md`](../../../projects/dragone/ui/AGENTS.md) — authoring rules
- [`CONTEXT.md`](../../../CONTEXT.md) — the glossary and its banned terms
- `projects/dragone/ui/button/` — the canonical reference entry point

Query the `ngp-mcp` MCP server first: if ng-primitives already owns the behavior, compose
it via `hostDirectives` rather than reimplementing it (ADR-0001).

Finish with the `validate` skill.
