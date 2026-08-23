import { Component, effect, input } from '@angular/core';

import { provideThemeState, themeFactory } from '../projects/dragone/ui/utils';

@Component({
  host: {
    '[attr.data-theme]': 'state.resolvedTheme() ? state.resolvedTheme() : null',
    '[style.align-items]': '"center"',
    '[style.background-color]': 'state.resolvedTheme() === "dark" ? "#002460" : "#FFFFFF"',
    '[style.display]': '"flex"',
    '[style.justify-content]': '"center"',
    '[style.padding]': '"2rem"',
    '[style.transition]': '"background-color 0.3s"',
  },
  providers: [provideThemeState({ inherit: false })],
  selector: 'theme-wrapper',
  template: `<ng-content />`,
})
export class ThemeWrapper {
  readonly darkMode = input<'light' | 'dark' | undefined>();
  readonly ngDevMode = input<boolean, 'true' | 'false'>(true, { transform: val => val === 'true' });
  readonly state = themeFactory({ theme: this.darkMode });
  constructor() {
    effect(() => {
      const isDevMode = this.ngDevMode();
      window['ngDevMode'] = isDevMode;
    });
  }
}
