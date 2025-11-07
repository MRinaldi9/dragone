import { ComponentFixture, TestBed } from '@angular/core/testing';

import { inputBinding, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Breadcrumb } from './breadcrumb';
import { BreadcrumbProps } from './breadcrumb-item/breadcrumb-item';

describe('Breadcrumb', () => {
  let component: Breadcrumb;
  let fixture: ComponentFixture<Breadcrumb>;
  const breadcrumbs = signal<BreadcrumbProps[]>([]);
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [Breadcrumb],
    }).compileComponents();

    fixture = TestBed.createComponent(Breadcrumb, {
      bindings: [inputBinding('breadcrumbs', breadcrumbs)],
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show empty message', () => {
    const breadcrumbItems = fixture.debugElement.queryAll(By.css('[role="listitem"]'));
    expect(breadcrumbItems.length).toBe(1);

    const anchor = breadcrumbItems[0].query(By.css('a'));
    expect(anchor.nativeElement.textContent).toBe('No breadcrumbs available');
  });

  it('should show normal breadcrumb items', async () => {
    breadcrumbs.set([
      { label: 'home', routerLink: '/' },
      { label: 'products', routerLink: '/products' },
      { label: 'item', routerLink: '/products/item' },
    ]);
    await fixture.whenStable();

    const breadcrumbItems = fixture.debugElement.queryAll(By.css('[role="listitem"]'));
    expect(breadcrumbItems.length).toBe(3);

    const labels = breadcrumbItems.map(item =>
      item.query(By.css('a')).nativeElement.textContent.trim(),
    );
    expect(labels).toEqual(['home', 'products', 'item']);
  });

  it('should show ellipsis when more than 6 items', async () => {
    breadcrumbs.set([
      { label: 'home', routerLink: '/' },
      { label: 'category', routerLink: '/category' },
      { label: 'subcategory', routerLink: '/subcategory' },
      { label: 'products', routerLink: '/products' },
      { label: 'items', routerLink: '/items' },
      { label: 'item1', routerLink: '/items/item1' },
      { label: 'details', routerLink: '/items/item1/details' },
    ]);
    await fixture.whenStable();

    const breadcrumbItems = fixture.debugElement.queryAll(By.css('[role="listitem"]'));
    expect(breadcrumbItems.length).toBe(3);
    expect(component['firstItem']()).toEqual({ label: 'home', routerLink: '/' });
    expect(component['lastItem']()).toEqual({
      label: 'details',
      routerLink: '/items/item1/details',
    });
  });
});
