import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';

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
    TestBed.configureTestingModule({
      imports: [HostComponent],
    });

    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    const childLoc = page.getByTestId('child');

    await expect.element(childLoc).toHaveAttribute('data-theme', 'dark');
  });
});
