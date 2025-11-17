import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { page } from 'vitest/browser';
import { Accordion } from './accordion';
import { AccordionItem } from './accordion-item/accordion-item';

@Component({
  imports: [Accordion, AccordionItem],
  template: `
    <drgn-accordion [disabled]="disabledAccordion()">
      <drgn-accordion-item
        heading="Item 1"
        [accordionVariant]="variantColor()"
        [disabled]="disabledAccordionItem()"
      >
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </drgn-accordion-item>
    </drgn-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostAccordion {
  variantColor = signal<'light' | 'dark'>('dark');
  disabledAccordion = signal(false);
  disabledAccordionItem = signal(false);
}

describe('Accordion', () => {
  let component: TestHostAccordion;
  let fixture: ComponentFixture<TestHostAccordion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostAccordion],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostAccordion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render accordion with one item', () => {
    const accordionItems = page.getByRole('heading', { name: 'Item 1' }).all();
    expect(accordionItems).toHaveLength(1);
  });

  it('should set heading for accordion item', () => {
    const accordionItem = page.getByRole('heading', { name: 'Item 1' });
    const headerBtn = accordionItem.getByRole('button').query();
    expect(headerBtn?.textContent).toContain('Item 1');
  });
  it('should apply variant color based on input', async () => {
    const accordionItem = page.getByRole('heading', { name: 'Item 1' });
    const headerBtn = accordionItem.getByRole('button');
    expect(headerBtn).toHaveAttribute('data-variant', 'primary');

    // Change variant color to light
    component.variantColor.set('light');
    await fixture.whenStable();

    expect(headerBtn).toHaveAttribute('data-variant', 'tertiary');
  });

  it('should disable accordion item when disabled input is true', async () => {
    const accordionItem = page.getByRole('heading', { name: 'Item 1' });
    const headerBtn = accordionItem.getByRole('button');
    expect(headerBtn).not.toBeDisabled();

    // Disable the accordion item
    component.disabledAccordionItem.set(true);
    await fixture.whenStable();

    expect(headerBtn).toBeDisabled();
  });

  it('should disable all accordion items when accordion disabled input is true', async () => {
    const accordionItem = page.getByRole('heading', { name: 'Item 1' });
    const headerBtn = accordionItem.getByRole('button');
    expect(headerBtn).not.toBeDisabled();

    // Disable the entire accordion
    component.disabledAccordion.set(true);
    await fixture.whenStable();

    expect(headerBtn).toBeDisabled();
  });
});
