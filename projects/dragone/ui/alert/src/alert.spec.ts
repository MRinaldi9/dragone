import { ComponentFixture, TestBed } from '@angular/core/testing';

import { inputBinding, outputBinding, signal } from '@angular/core';
import { Locator, page } from 'vitest/browser';

import { By } from '@angular/platform-browser';
import { faSolidCircleCheck, faSolidCircleInfo } from '@ng-icons/font-awesome/solid';
import { Alert } from './alert';

describe('Alert', () => {
  let component: Alert;
  let fixture: ComponentFixture<Alert>;
  let locatorComponent: Locator;
  const alertType = signal<'info' | 'success' | 'warning' | 'error'>('info');
  const ctaText = signal('');
  const ctaMock = vi.fn();
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alert],
    }).compileComponents();

    fixture = TestBed.createComponent(Alert, {
      bindings: [
        inputBinding('title', () => 'Test Alert'),
        inputBinding('alertType', alertType),
        inputBinding('ctaText', ctaText),
        outputBinding('ctaClick', ctaMock),
      ],
    });
    component = fixture.componentInstance;
    locatorComponent = page.elementLocator(fixture.nativeElement);
    await fixture.whenStable();
  });

  it('must show title', async () => {
    expect(component.title()).toBe('Test Alert');
    await expect
      .element(locatorComponent.getByRole('heading', { name: 'Test Alert' }))
      .toBeVisible();
  });

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

    const btnDe = fixture.debugElement.query(By.css('button'));
    btnDe.triggerEventHandler('click');
    expect(ctaMock).toHaveBeenCalled();
  });
});
