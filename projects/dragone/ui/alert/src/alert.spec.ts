import { inputBinding, outputBinding, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { faSolidCircleCheck, faSolidCircleInfo } from '@ng-icons/font-awesome/solid';
import { type Locator, page } from 'vitest/browser';

import { Alert } from './alert';

describe(Alert, () => {
  let component: Alert;
  let fixture: ComponentFixture<Alert>;
  let locatorComponent: Locator;
  const alertType = signal<'info' | 'success' | 'warning' | 'error'>('info');
  const ctaText = signal('');
  const titleAsHeading = signal(false);
  const ctaMock = vi.fn<() => void>();
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alert],
    }).compileComponents();

    fixture = TestBed.createComponent(Alert, {
      bindings: [
        inputBinding('title', () => 'Test Alert'),
        inputBinding('alertType', alertType),
        inputBinding('ctaText', ctaText),
        inputBinding('titleAsHeading', titleAsHeading),
        outputBinding('ctaClick', ctaMock),
      ],
    });
    component = fixture.componentInstance;
    locatorComponent = page.elementLocator(fixture.nativeElement);
    await fixture.whenStable();
  });

  it.each([{ role: 'paragraph' } as const, { role: 'heading' } as const])(
    'must show title',
    async ({ role }) => {
      expect(component.title()).toBe('Test Alert');
      if (role === 'heading') {
        titleAsHeading.set(true);
        await fixture.whenStable();
      }
      const title = locatorComponent.getByText('Test Alert');
      await expect.element(title).toBeVisible();

      await expect.element(title).toHaveRole(role);
    },
  );

  it('show default icon for info type', async () => {
    const icon = locatorComponent.getByTestId('alert-icon');
    await expect.element(icon).toContainHTML(faSolidCircleInfo);
  });

  it('show semantic icon based on alert type', async () => {
    const icon = locatorComponent.getByTestId('alert-icon');
    alertType.set('success');
    await fixture.whenStable();
    await expect.element(icon).toContainHTML(faSolidCircleCheck);
  });

  it('must emit ctaClick event on button click', async () => {
    await expect.element(locatorComponent.getByRole('button').query()).toBeNull();
    ctaText.set('Click me');
    await fixture.whenStable();
    const button = locatorComponent.getByRole('button', { name: 'Click me' });
    await expect.element(button).toBeVisible();

    await button.click();

    expect(ctaMock).toHaveBeenCalledWith(expect.anything());
  });
});
