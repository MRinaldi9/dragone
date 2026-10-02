---
name: adr
description: Draft a new Architecture Decision Record in docs/adr/ following the repository's existing ADR structure.
argument-hint: '[title]'
disable-model-invocation: true
---

# New ADR

Draft an ADR for: `$ARGUMENTS`

## Procedure

1. List `docs/adr/` and take the next free number (`NNNN`), zero-padded to four digits.
2. Name the file `docs/adr/NNNN-kebab-case-title.md`.
3. Read two or three existing ADRs first and match their voice — they are terse and
   decided, not exploratory.

## Structure

Mirror the existing ADRs exactly; there is no `Status:` field in this repo.

```markdown
# <Title>

<One or two paragraphs: the decision, stated in the present tense, and the context that
forces it. Use the CONTEXT.md vocabulary.>

## Considered Options

- **<Option> (chosen)**: <what it buys, what it costs>
- **<Option>**: <why it was not chosen>

## Consequences

- <What now becomes true, including obligations on future work.>
```

If this ADR supersedes an earlier one, add an inline blockquote at the top of the
superseded file, as `docs/adr/0006-pnpm-native-versioning.md` does.

## After writing

- Update [`CONTEXT.md`](../../../CONTEXT.md) if the decision changes domain vocabulary.
- Update [`AGENTS.md`](../../../AGENTS.md) if it adds or changes an architecture invariant.
- Run `pnpm lint:docs` to confirm every relative link resolves.
