# Istruzioni per GitHub Copilot

## Contesto del Progetto

Questo è un monorepo Angular 21 gestito con `pnpm` che implementa il design system **Sirio** di INPS. La libreria principale `@dragone/ui` (in `projects/dragone/ui`) fornisce componenti UI riutilizzabili come design system robusto e accessibile.

**Architettura chiave:**

- **Secondary Entry Points**: Ogni componente è un entry point separato (es. `@dragone/ui/button`)
- **ng-primitives Integration**: I componenti wrappano primitive headless da `ng-primitives` per funzionalità core
- **Standalone Components**: Tutti i componenti usano Angular standalone APIs (no NgModules)
- **Vitest + Playwright**: Test suite con coverage tramite `@analogjs/vitest-angular` e browser testing

## Convenzioni Essenziali

### 1. Struttura dei Componenti

Ogni componente segue questa struttura come secondary entry point:

```
projects/dragone/ui/<component>/
├── ng-package.json          # Configura l'entry point
├── public-api.ts            # Esporta il componente
├── index.ts                 # Re-export da public-api
└── src/
    ├── <component>.ts       # Component logic
    ├── <component>.css      # Scoped styles
    ├── <component>.spec.ts  # Vitest tests
    └── <component>.stories.ts # Storybook stories
```

**Creazione comando**:

```bash
ng g c <name> --project=@dragone/ui --flat --path projects/dragone/ui/<name>/src
```

### 2. Pattern di Implementazione

**Component Decorator:**

```typescript
@Component({
  selector: 'button[drgnButton]',  // Usa prefisso drgn (angular.json)
  template: `...`,                   // Inline se <15 righe
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,  // Default OnPush
  host: {
    '[attr.data-variant]': 'variant()',  // Data attributes per styling
  },
  hostDirectives: [                // Composizione con ng-primitives
    { directive: NgpButton, inputs: ['disabled'] },
    NgpFocusVisible
  ],
})
```

**Signals-based APIs**: Usa `input()` e `output()` per tutte le props dei componenti.

**ControlValueAccessor Pattern** (vedi `checkbox.ts`):

```typescript
export class Checkbox implements ControlValueAccessor {
  protected readonly internalState = injectCheckboxState(); // ng-primitives
  private changeFn: ChangeFn<boolean> | undefined;

  constructor() {
    this.internalState().checkedChange.subscribe(checked => this.changeFn?.(checked));
  }
  // Implementa writeValue, registerOnChange, registerOnTouched
}
```

### 3. Stili e Design Tokens

**REGOLA CRITICA**: Usa SOLO i token CSS da `projects/dragone/ui/src/tokens.css`. Mai valori hardcoded.

**Gerarchia a 3 livelli**:

1. **Global** (`--color-global-primary-100`): Primitivi - NON usare direttamente
2. **Alias** (`--interactive-primary-default`): Semantici - USA QUESTI
3. **Specific** (`--data-entry-border-default`): Per componenti specifici

**Focus State Pattern** (vedi `button.css`):

```css
&[data-focus-visible] {
  outline: none; /* Non usare outline standard */
  box-shadow:
    0 0 0 3px var(--color-global-primary-000),
    0 0 0 5px var(--interactive-primary-default),
    0 0 10px 0 rgba(0, 125, 179, 0.7);
}
```

**Icon-Only Detection** (CSS-only pattern):

```css
&[data-icon-only='true'] {
  padding: 16px; /* Padding quadrato per icon-only */
}
```

**Typography Classes**: Usa utility classes come `drgn-label-md-700` (definite in `typography.css`).

### 4. Storybook Development

**Ogni componente DEVE avere stories** con questa struttura:

```typescript
import { moduleMetadata, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { expect, fn } from 'storybook/test';

type ButtonStory = Button & {
  disabled: boolean;
  label: string;
  // Props aggiuntive per controlli
};

const meta: Meta<ButtonStory> = {
  title: 'Dragone/UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    /* defaults */
  },
  argTypes: {
    /* controlli */
  },
};
```

**Interaction Testing** con `play` functions:

```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab(); // Simula focus-visible via keyboard
  await expect(canvas.getByRole('button')).toHaveFocus();
};
```

## Workflow di Sviluppo

### Comandi Essenziali

```bash
pnpm storybook              # Dev environment (primary)
pnpm test                   # Vitest in watch mode
pnpm build @dragone/ui      # Build della libreria
pnpm lint                   # ESLint (auto-fix in pre-commit)
pnpm format                 # Prettier (auto in pre-commit)
```

### Git Workflow

- **Lefthook** (`lefthook.yml`) esegue lint+format sui staged files in `pre-commit`
- **Commitizen** via `pnpm commit` o `pnpm cz` per messaggi Conventional Commits
- **commitlint** valida in `commit-msg` hook

**IMPORTANTE**: Mai eseguire `npm` o `yarn`. Solo `pnpm` (enforced via `packageManager` in `package.json`).

### Testing

- **Test runner**: Vitest con `@analogjs/vitest-angular`
- **Browser testing**: Playwright via `@vitest/browser-playwright`
- **Coverage**: Report in `coverage/dragone/` (lcov + html)
- **Config**: `vite.config.ts` definisce root in `projects/dragone/ui`

## Pattern Specifici del Progetto

### ng-primitives Composition

La libreria usa `ng-primitives` per funzionalità headless:

```typescript
// Button compone NgpButton per comportamento nativo
hostDirectives: [
  { directive: NgpButton, inputs: ['disabled'] },
  { directive: NgpFocusVisible, outputs: ['ngpFocusVisible:focusVisible'] },
];
```

Componenti che usano ng-primitives: `Button`, `Checkbox`, `Switch`, `Radio`, `Accordion`.

### Utility Providers

Vedi `projects/dragone/ui/utils/src/provider.ts` per helper di DI:

```typescript
provideEventsPlugin(...managers: Type<EventManagerPlugin>[])
provideValueAccessor(component: Type<any>) // Per ControlValueAccessor
```

### Icon Integration

- **ng-icons** con Font Awesome Solid
- Fornisci icons via `provideIcons({ faSolidCheck })` in component `providers`
- Usa `<ng-icon name="faSolidCheck" />` nei template

## Troubleshooting

**Build issues**: Verifica `ng-package.json` in ogni secondary entry point
**Test failures**: Assicurati `test-setup.ts` sia incluso in `vite.config.ts`
**Style isolation**: Ogni componente usa `ViewEncapsulation.Emulated` (default) - nessuno stile globale
**Storybook non parte**: Verifica che `documentation.json` esista (generato da Compodoc)

## Risorse Chiave

- Design tokens: `projects/dragone/ui/src/tokens.css`
- Esempio completo: `projects/dragone/ui/button/`
- Test config: `vite.config.ts`
- Angular config: `angular.json` (prefix `drgn`, OnPush default)
