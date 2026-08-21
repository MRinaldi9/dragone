import { Component, effect, input } from '@angular/core';

@Component({
  host: {
    '[class.drgn-dark]': 'darkMode() === "dark"',
    '[style.align-items]': '"center"',
    '[style.background-color]': 'darkMode() === "dark" ? "#002460" : "#FFFFFF"',
    '[style.display]': '"flex"',
    '[style.justify-content]': '"center"',
    '[style.padding]': '"2rem"',
    '[style.transition]': '"background-color 0.3s"',
  },
  selector: 'theme-wrapper',
  template: `<ng-content />`,
})
export class ThemeWrapper {
  readonly darkMode = input<'light' | 'dark'>('light');
  readonly ngDevMode = input<boolean, 'true' | 'false'>(true, { transform: val => val === 'true' });

  constructor() {
    effect(() => {
      const isDevMode = this.ngDevMode();
      window['ngDevMode'] = isDevMode;
    });
  }
}
