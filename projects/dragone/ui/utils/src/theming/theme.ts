import { computed, Directive, input, type Signal } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';

export type ThemeType = 'light' | 'dark';

export interface ThemeState {
  theme: Signal<ThemeType | undefined>;
  resolvedTheme: Signal<ThemeType | null>;
}

export const [, themeFactory, injectThemeState, provideThemeState] = createPrimitive(
  'Theme',
  ({ theme }: { theme: Signal<ThemeType | undefined> }): ThemeState => {
    const parent = injectThemeState({ optional: true, skipSelf: true });
    const resolvedTheme = computed<ThemeType | null>(
      () => theme() ?? parent()?.resolvedTheme() ?? null,
    );
    return { theme, resolvedTheme };
  },
);

@Directive({
  selector: '[drgnTheme]',
  providers: [provideThemeState({ inherit: false })],
  host: {
    '[attr.data-theme]': 'state.resolvedTheme() ? state.resolvedTheme() : null',
  },
})
export class Theme {
  readonly theme = input<'light' | 'dark' | undefined>();
  readonly state = themeFactory({ theme: this.theme });
}
