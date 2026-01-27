# Istruzioni per GitHub Copilot

## Contesto del Progetto

Monorepo **Angular 21** con **pnpm** che implementa il design system **Sirio** di INPS. La libreria `@dragone/ui` (`projects/dragone/ui`) esporta componenti UI riutilizzabili come secondary entry points (NX style per distribuzioni separate).

**Punti salienti architetturali:**
- **Secondary Entry Points**: Ogni componente è una distribuzione indipendente (es. `@dragone/ui/button`, `@dragone/ui/checkbox`)
- **ng-primitives**: Componenti wrapper attorno a primitive headless di `ng-primitives` (Button, Checkbox, Radio, Switch)
- **Standalone Components**: No NgModules, solo standalone APIs
- **Vitest + Playwright**: Test con `@analogjs/vitest-angular` + browser automation
- **Storybook**: Component test e Dev environment principale con Analog Angular integration

## Convenzioni Essenziali

### 1. Struttura dei Componenti

Ogni componente è una directory separata con `ng-package.json` (configura come secondary entry point):

```
projects/dragone/ui/<component>/
├── ng-package.json           # Entry point config (vedi button/ per referenza)
├── public-api.ts             # export default from './src/<component>'
├── index.ts                  # export { ... } from './public-api'
└── src/
    ├── <component>.ts        # @Component class con signals
    ├── <component>.css       # Scoped PostCSS con nesting
    ├── <component>.spec.ts   # Vitest + Playwright
    └── <component>.stories.ts # Storybook stories
```

**Comando creazione**:
```bash
ng g c <name> --project=@dragone/ui --flat --path projects/dragone/ui/<name>/src
```

### 2. Pattern di Implementazione

**Component Decorator** (vedi `projects/dragone/ui/button/src/button.ts`):

```typescript
@Component({
  selector: 'button[drgnButton]',        // Attribute selector con prefisso drgn
  template: `<ng-content />`,             // Inline template (<15 righe)
  styleUrl: './button.css',              // PostCSS con :host nesting
  changeDetection: ChangeDetectionStrategy.OnPush,  // SEMPRE OnPush
  host: {
    '[attr.data-size]': 'size()',        // Data attributes per styling
    '[attr.data-variant]': 'variant()',
    class: 'drgn-label-md-700',          // Typography utility dal tokens
  },
  hostDirectives: [                      // Composition con ng-primitives
    { directive: NgpButton, inputs: ['disabled'] },
    { directive: NgpFocusVisible, outputs: ['ngpFocusVisible:focusVisible'] },
  ],
})
export class Button {
  readonly size = input<ButtonSize>('large');      // Signal input (new API)
  readonly variant = input<ButtonVariant>('primary');
  readonly isIconOnly = input(false, { transform: booleanAttribute, alias: 'icon' });
}
```

**Input Design**: Usa `input()` e `output()` per tutte le props (signal-based):
- Default values in `input()`
- `transform:` per conversioni (bool, number, JSON)
- `alias:` per nomi deprecati/alternativi

**ControlValueAccessor Pattern** (vedi `projects/dragone/ui/checkbox/src/checkbox.ts`):

```typescript
export class Checkbox implements ControlValueAccessor {
  protected readonly internalState = injectCheckboxState(); // ng-primitives DI
  private changeFn: ChangeFn<boolean> | undefined;

  constructor() {
    // Subscribe a ng-primitives internal state changes
    this.internalState().checkedChange.subscribe(checked => this.changeFn?.(checked));
  }

  writeValue(checked: boolean): void { this.internalState().setChecked(checked); }
  registerOnChange(fn: ChangeFn<boolean>): void { this.changeFn = fn; }
  registerOnTouched(fn: TouchedFn): void { this.touchedFn = fn; }
  setDisabledState(isDisabled: boolean): void { this.internalState().setDisabled(isDisabled); }
}
```

### 3. Stili e Design Tokens

**REGOLA CRITICA**: Usa SOLO i token CSS da `projects/dragone/ui/src/tokens.css`. Mai valori hardcoded.

**Gerarchia a 3 livelli**:

1. **Global** (`--color-global-primary-100`): Primitivi - NON usare direttamente
2. **Alias** (`--interactive-primary-default`): Semantici - **USA QUESTI** per colori
3. **Specific** (`--text-on-primary-light`, `--bg-disabled`): Per contesti specifici

**PostCSS con :host nesting** (vedi `projects/dragone/ui/button/src/button.css`):

```css
:host {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-on-primary-light);
  padding: 12px 42px;
  border-radius: 4px;

  &[data-icon-only='true'] {
    padding: 16px;  /* Square padding for icon-only mode */
  }

  &[data-focus-visible] {
    outline: none;  /* No standard outline - use custom shadow */
    box-shadow:
      0 0 0 3px var(--color-global-primary-000),
      0 0 0 5px var(--interactive-primary-default),
      0 0 10px 0 rgba(0, 125, 179, 0.7);
  }

  &[data-variant='primary']:not(:disabled) {
    background-color: var(--interactive-primary-default);
    &:hover { background-color: var(--interactive-primary-hover); }
    &:active { background-color: var(--interactive-primary-active); }
  }

  &:disabled {
    background-color: var(--bg-disabled);
    color: var(--text-disabled);
  }
}
```

**Typography Classes**: Usa utilities da `projects/dragone/ui/src/typography.css` come `drgn-label-md-700` nel `host.class`.

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

### 5. Anatomia di un Nuovo Componente (Template Generico)

Quando implementi un componente nuovo, segui questa sequenza di file:

#### File: `projects/dragone/ui/<component>/ng-package.json`
```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "public-api.ts"
  }
}
```

#### File: `projects/dragone/ui/<component>/public-api.ts`
```typescript
export * from './src/<component>';
```

#### File: `projects/dragone/ui/<component>/index.ts`
```typescript
export { <Component> } from './public-api';
```

#### File: `projects/dragone/ui/<component>/src/<component>.ts`
```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgpComponent } from 'ng-primitives/component'; // Se necessario

@Component({
  selector: 'drgn-<component>',  // o 'element[drgn<Component>]' per attribute selector
  template: `<ng-content />`,
  styleUrl: './<component>.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',  // Data attributes per varianti visive
    class: 'drgn-label-md-700',          // Typography class dal tokens
  },
  hostDirectives: [
    // Composizione con ng-primitives se necessario
    // { directive: NgpComponent, inputs: ['disabled'] },
  ],
})
export class <Component> {
  readonly variant = input<'default' | 'secondary'>('default');
  readonly disabled = input(false);
  // Output per eventi
  // readonly action = output<void>();
}
```

#### File: `projects/dragone/ui/<component>/src/<component>.css`
```postcss
:host {
  display: block;  /* Adatta a seconda della semantica */
  color: var(--text-primary);
  background-color: var(--bg-surface);

  &[data-variant='secondary'] {
    background-color: var(--bg-secondary);
  }

  &[data-focus-visible] {
    outline: none;
    box-shadow:
      0 0 0 3px var(--color-global-primary-000),
      0 0 0 5px var(--interactive-primary-default),
      0 0 10px 0 rgba(0, 125, 179, 0.7);
  }

  &:disabled {
    background-color: var(--bg-disabled);
    color: var(--text-disabled);
    cursor: not-allowed;
  }
}
```

#### File: `projects/dragone/ui/<component>/src/<component>.spec.ts`
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { <Component> } from './<component>';

describe('<Component>', () => {
  let component: <Component>;
  let fixture: ComponentFixture<<Component>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [<Component>],
    }).compileComponents();

    fixture = TestBed.createComponent(<Component>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply data-variant attribute', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('data-variant')).toBe('secondary');
  });
});
```

#### File: `projects/dragone/ui/<component>/src/<component>.stories.ts`
```typescript
import { type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { <Component> } from './<component>';

type <Component>Story = <Component> & {
  content: string;
};

const meta: Meta<<Component>Story> = {
  title: 'Dragone/UI/<Component>',
  component: <Component>,
  tags: ['autodocs'],
  args: {
    content: 'Default content',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<<Component>Story>;

export const Default: Story = {
  render: (args) => ({
    template: `<drgn-<component> [variant]="variant">{{ content }}</drgn-<component>>`,
    props: args,
  }),
};
```

**Checklist implementazione:**
- [ ] Tutti e 6 i file creati (`ng-package.json`, `public-api.ts`, `index.ts`, `.ts`, `.css`, `.spec.ts`, `.stories.ts`)
- [ ] Selector usa prefisso `drgn`
- [ ] `ChangeDetectionStrategy.OnPush`
- [ ] CSS usa solo token da `tokens.css`
- [ ] Inputs con `input()` API (signal-based)
- [ ] `.spec.ts` copre almeno la creazione e una proprietà
- [ ] Stories con `tags: ['autodocs']` per auto-generazione docs

## Workflow di Sviluppo

### Comandi Essenziali

```bash
pnpm storybook              # Dev environment (port 6006, experimentalZoneless)
pnpm test                   # Vitest in watch mode con browser (Playwright)
pnpm build @dragone/ui      # Build della libreria (@angular/build:ng-packagr)
pnpm lint                   # ESLint (auto-fix con Lefthook in pre-commit)
pnpm format                 # Prettier (auto con Lefthook in pre-commit)
pnpm commit                 # Commitizen per Conventional Commits
```

### Test Execution & Coverage

- **Test runner**: Vitest con `@analogjs/vitest-angular`
- **Browser testing**: Playwright via `@vitest/browser-playwright` (headless in VS Code)
- **Config**: `vite.config.ts` definisce root in `projects/dragone/ui`
- **Coverage**: Report in `coverage/dragone/` (lcov + html)
  - Automaticamente esclude: `index.ts`, `public-api.ts`, `*.stories.ts`, `*.css`, `*.js`

### Git Workflow

- **Lefthook** (`lefthook.yml`): Esegue lint+format sui staged files in `pre-commit` hook
- **Commitizen**: `pnpm commit` o `pnpm cz` per messaggi Conventional Commits
- **commitlint**: Valida messaggio in `commit-msg` hook

**IMPORTANTE**:
- Mai `npm` o `yarn` - enforced via `packageManager: "pnpm@10.28.0"` in `package.json`
- Storybook build: `pnpm build-storybook` → output in `storybook-static/`

## Pattern Specifici del Progetto

### ng-primitives Composition

La libreria usa `ng-primitives` (v0.100.0) per funzionalità headless tramite `hostDirectives`:

```typescript
// Button compone NgpButton per comportamento nativo
hostDirectives: [
  { directive: NgpButton, inputs: ['disabled'] },
  { directive: NgpFocusVisible, outputs: ['ngpFocusVisible:focusVisible'] },
];
```

**Componenti che usano ng-primitives**: Button, Checkbox, Switch, Radio, Accordion.

**State Management Pattern**:
- Usa `injectCheckboxState()` per DI di state interno
- Subscribe a `.checkedChange`, `.disabledChange` per reactive updates
- Implementa ControlValueAccessor per form integration

### Utility Providers & DI

Vedi `projects/dragone/ui/utils/src/provider.ts`:

```typescript
provideValueAccessor(component: Type<any>) // Per ControlValueAccessor
provideIcons({ faSolidCheck })             // Per ng-icons integration
```

### Icon Integration

- **ng-icons** con Font Awesome Solid (v33.0.0)
- Fornisci icons via `provideIcons({ faSolidCheck })` nel `providers` array
- Usa `<ng-icon name="faSolidCheck" />` nei template (con `imports: [NgIcon]`)

### Angular.json Defaults

- **prefix**: `drgn` (attribute selector prefix)
- **ChangeDetectionStrategy**: OnPush di default (in schematics)
- **schematicCollections**: `angular-eslint`
- **Storybook**: `experimentalZoneless: true` (futura zoneless support)

## Troubleshooting

**Build issues**: Verifica `ng-package.json` in ogni secondary entry point
**Test failures**: Assicurati `test-setup.ts` sia incluso in `vite.config.ts`
**Style isolation**: Ogni componente usa ViewEncapsulation.Emulated (default)
**Storybook non parte**: Verifica che `documentation.json` esista (generato da Compodoc)

## Risorse Chiave

- Design tokens: `projects/dragone/ui/src/tokens.css`
- Esempio completo: `projects/dragone/ui/button/`
- Test config: `vite.config.ts`
- Angular config: `angular.json` (prefix `drgn`, OnPush default)
