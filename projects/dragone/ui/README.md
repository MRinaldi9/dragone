# Ui

The `@dragone/ui` library — an independent Angular design system built on [ng-primitives](https://angularprimitives.com), inspired by the [Sirio](https://www.inps.design/3e7e2b0f5/p/37c451-ciao-italia) design system.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name --project=@dragone/ui
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the library, run from the repository root:

```bash
pnpm build @dragone/ui
```

The build artifacts are written to `dist/projects/dragone/ui`.

### Publishing the Library

Once the project is built, you can publish the library from the output directory:

```bash
cd dist/projects/dragone/ui
pnpm publish
```

## Testing

Component tests run with [Vitest](https://vitest.dev) in **browser mode** (Playwright, Chromium):

```bash
pnpm test
```

Component tests use the `render()` API from [`@wismaz/vitest-browser-angular`](https://www.npmjs.com/package/@wismaz/vitest-browser-angular) — a community fork of `vitest-browser-angular`. The `render()` API keeps signal inputs reactive: updating a bound signal propagates to the Component once change detection runs.

Choose how to render a Component per Component, per test intent:

- **Render directly** with `render(Component, ...)` when the Component has its own element selector (e.g. `Alert` on `drgn-alert`).
- **Compose a Test Host** when the Component targets a native element selector and cannot be rendered on its own (e.g. `Button` on `button[drgnButton]`), or when the test needs to drive the Component from a parent context such as Angular form APIs.

```ts
import { Component, input, viewChild } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `<button drgnButton [variant]="variant()" (click)="clickSpy()">Dragone</button>`,
})
class TestHostComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly clickSpy = vi.fn<() => void>();
  readonly btnComp = viewChild.required(Button);
}

it('should emit native click event', async () => {
  const { componentClassInstance: component, getByRole } = await render(TestHostComponent, {
    inputs: { variant: signal<ButtonVariant>('primary') },
  });
  await getByRole('button').click();
  expect(component.clickSpy).toHaveBeenCalledWith();
});
```

There is no dedicated end-to-end runner — interaction coverage lives in Storybook `play` functions (`*.stories.ts`).

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
