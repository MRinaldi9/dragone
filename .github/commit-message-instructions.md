Use conventional commit message format.
Max line length for header, body and footer is 100 characters.

## Types

Use standard Conventional Commits types:
`feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `build` | `chore` | `ci` | `revert`

## Scopes

Use the component name as scope when the change targets a specific component:

    feat(button): add ghost variant
    fix(select): correct placeholder visibility when value is 0
    feat(checkbox): support indeterminate state

Use these scopes for cross-cutting changes:

| Scope   | When to use                                                                 | Common type       |
|---------|-----------------------------------------------------------------------------|-------------------|
| `docs`  | CONTEXT.md, ADRs, README, any documentation file                            | `docs`            |
| `ui`    | tokens.css, typography.css, utils, or any change that spans multiple components | `feat` / `fix` |
| `config`| Any file matching `*.config.*`, angular.json, lefthook.yml, tsconfig*, package.json | `chore` / `build` |

Note: `config` is a **scope**, not a type. Always pair it with a valid type (e.g. `chore(config): ...`).

## Breaking changes

Add `!` after the scope when the change breaks the public API:
- Selector renamed or restructured (e.g. `button[drgnButton]` → `button[drgnBtn]`)
- Input or output name changed or removed
- Secondary entry point path changed

    feat(button)!: rename isIconOnly input to iconOnly

Do NOT use `!` for internal refactors, style changes, or behaviour improvements.

## Examples

    feat(accordion): add controlled open state via model input
    fix(input): prevent aria-invalid from rendering when validationState is null
    feat(ui)!: migrate tokens to tier-2 alias naming
    docs: add CONTEXT.md and ADRs for selector strategy
    config: update eslint to flat config format
