import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { Status, type StatusType } from './status';
@Component({
  imports: [Status],
  template: `
    <section data-testid="section" drgnStatus>
      <div data-testid="child" [drgnStatus]="childStatus()"></div>
    </section>
  `,
})
class TestHostComponent {
  childStatus = input<StatusType>('neutral');
}

describe(Status, () => {
  const status = signal<StatusType>('neutral');

  afterEach(() => {
    status.set('neutral');
  });

  it('should have a neutral status by default', async () => {
    const { locator } = await render(TestHostComponent);
    await expect.element(locator.getByTestId('section')).not.toHaveAttribute('data-status');
  });

  it('should have a status defined', async () => {
    const { locator } = await render(TestHostComponent, { inputs: { childStatus: status } });
    await expect.element(locator.getByTestId('child')).not.toHaveAttribute('data-status');
    status.set('info');
    await expect.element(locator.getByTestId('child')).toHaveAttribute('data-status', 'info');
  });
});
