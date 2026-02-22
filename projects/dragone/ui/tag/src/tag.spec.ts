import { ComponentFixture, TestBed } from '@angular/core/testing';

import { inputBinding, signal } from '@angular/core';
import { page } from 'vitest/browser';
import { StatusTag, Tag } from './tag';

describe('Tag', () => {
  let component: Tag;
  let fixture: ComponentFixture<Tag>;
  let componentLocator: ReturnType<typeof page.elementLocator>;
  const status = signal<StatusTag>('neutral');
  const ariaLabel = signal<string | undefined>(undefined);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Tag],
    });

    fixture = TestBed.createComponent(Tag, {
      bindings: [inputBinding('statusTag', status), inputBinding('ariaLabel', ariaLabel)],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
    componentLocator = page.elementLocator(fixture.nativeElement);
  });

  afterEach(() => {
    status.set('neutral');
    ariaLabel.set(undefined);
  });

  it('should have role status', async () => {
    await expect.element(componentLocator.element()).toHaveAttribute('role', 'status');
  });

  it('should have default aria-label as undefined', async () => {
    await expect.element(componentLocator.element()).not.toHaveAttribute('aria-label');
  });

  it('should have neutral status by default', async () => {
    expect(component.statusTag()).toBe(status());
    await expect.element(componentLocator.element()).toHaveAttribute('data-status', 'neutral');
  });
  it('should update status attribute when statusTag input changes', async () => {
    status.set('success');
    await fixture.whenStable();
    expect(component.statusTag()).toBe(status());
    await expect.element(componentLocator.element()).toHaveAttribute('data-status', 'success');
  });
  it('should update aria-label attribute when ariaLabel input changes', async () => {
    ariaLabel.set('New Aria Label');
    await fixture.whenStable();
    expect(component.ariaLabel()).toBe(ariaLabel());
    await expect
      .element(componentLocator.element())
      .toHaveAttribute('aria-label', 'New Aria Label');
  });
});
