import { computed, Directive, inject, InjectionToken, input, type Signal } from '@angular/core';

export const DRGN_THEME_CONTEXT = new InjectionToken<Theme>('DRGN_THEME_CONTEXT');

@Directive({
  selector: '[drgnTheme]',
  providers: [{ provide: DRGN_THEME_CONTEXT, useExisting: Theme }],
  host: {
    '[attr.data-theme]': 'resolvedTheme()',
  },
})
export class Theme {
  readonly theme = input<'light' | 'dark' | undefined>(undefined);
  readonly #parent = inject(DRGN_THEME_CONTEXT, { optional: true, skipSelf: true });

  readonly resolvedTheme: Signal<'light' | 'dark' | null> = computed<'light' | 'dark' | null>(
    () => this.theme() ?? this.#parent?.resolvedTheme() ?? null,
  );
}
