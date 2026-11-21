# No Barrel Export — Secondary Entry Points Only

Dragone ships exclusively via secondary entry points (`@dragone/ui/button`, `@dragone/ui/select`, `@dragone/ui/utils`, etc.). The root entry point (`@dragone/ui`) exports nothing useful to consumers — it contains a `TEST` placeholder constant required by `@angular/build:library` for the primary `"."` export in `projects/dragone/ui/package.json` (`./public-api.ts`) to be valid. Consumers must always import from subpaths.

## Considered Options

- **Secondary entry points only (chosen)**: Each component is its own entry point registered under `exports` in `projects/dragone/ui/package.json` (`"./<name>": "./<name>/public-api.ts"`). Tree-shakeable, explicit dependencies, no accidental full-library imports.
- **Barrel export from root**: `@dragone/ui` re-exports all components. Convenient imports but defeats tree-shaking and creates a single point of failure for build analysis.
- **Hybrid**: Root exports utils + a few core components, rest via subpaths. Inconsistent and confusing.

## Consequences

- Consumer imports are verbose: `import { Button } from '@dragone/ui/button'` instead of `import { Button } from '@dragone/ui'`.
- Tree-shaking is maximized — consumers only bundle what they import.
- Adding a new component requires scaffolding a secondary entry point (`ng generate entry-point <name> --skip-ts-config`) with its own `<name>/public-api.ts` registered in `projects/dragone/ui/package.json#exports`.
- The root `public-api.ts` placeholder (`export const TEST = 'test'`) is intentional and must not be removed — `@angular/build:library` requires a valid primary entry file for `"."`.
