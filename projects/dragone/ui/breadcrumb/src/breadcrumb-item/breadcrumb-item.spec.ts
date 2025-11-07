import { ComponentFixture, TestBed } from '@angular/core/testing';

import { inputBinding, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { faSolidHouse } from '@ng-icons/font-awesome/solid';
import { page } from 'vitest/browser';
import { BreadcrumbItem, BreadcrumbProps } from './breadcrumb-item';
describe('BreadcrumbItem', () => {
  let component: BreadcrumbItem;
  let fixture: ComponentFixture<BreadcrumbItem>;
  const breadcrumb = signal<BreadcrumbProps>({
    label: 'Home',
    routerLink: '/',
    icon: faSolidHouse,
  });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbItem],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbItem, {
      bindings: [inputBinding('breadcrumbConfiguration', breadcrumb)],
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('show breadcrumb item with icon', async () => {
    const link = await page.getByRole('link');
    const icon = await page.getByTestId('breadcrumb-icon');
    expect(link).toHaveTextContent('Home');
    expect(icon).toBeVisible();
  });

  it('show custom breadcrumb item', async () => {
    let emitted = false;
    component.openBreadcrumb.subscribe(() => (emitted = true));

    breadcrumb.set({ label: '...' });
    await fixture.whenStable();
    const link = fixture.debugElement.query(By.css('[ngpFocusVisible]'));

    expect(link.nativeElement).toHaveTextContent('...');

    link.triggerEventHandler('click', new MouseEvent('click'));
    await expect.poll(() => emitted).toBe(true);
  });
});
