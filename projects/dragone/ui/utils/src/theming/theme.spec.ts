import { Component } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { Theme } from './theme';

@Component({
  imports: [Theme],
  template: `
    <section drgnTheme theme="dark">
      <div drgnTheme data-testid="child"></div>
    </section>
  `,
})
class HostComponent {}

describe(Theme, () => {
  it('should inherit theme from the nearest parent context', async () => {
    const { getByTestId } = await render(HostComponent);

    await expect.element(getByTestId('child')).toHaveAttribute('data-theme', 'dark');
  });
});
