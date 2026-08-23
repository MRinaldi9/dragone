import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { Accordion } from './accordion';
import { AccordionItem } from './accordion-item/accordion-item';

@Component({
  imports: [Accordion, AccordionItem],

  template: `
    <drgn-accordion [disabled]="disabledAccordion()" [collapse]="collapseAccordion()">
      <drgn-accordion-item
        heading="Item 1"
        [theme]="variantColor()"
        [disabled]="disabledAccordionItem()"
      >
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </drgn-accordion-item>
    </drgn-accordion>
  `,
  styles: `
    :host {
      --drgn-motion-duration-medium: 500ms;
    }
  `,
})
class TestHostAccordion {
  variantColor = input<'light' | 'dark'>('dark');
  disabledAccordion = input(false);
  disabledAccordionItem = input(false);
  collapseAccordion = input(false);
}

describe(Accordion, () => {
  const disabledAccordion = signal(false);
  const disabledAccordionItem = signal(false);
  const variantColor = signal<'light' | 'dark'>('dark');

  afterEach(() => {
    disabledAccordion.set(false);
    disabledAccordionItem.set(false);
    variantColor.set('dark');
  });

  it('should render accordion with one item', async () => {
    const { locator } = await render(TestHostAccordion);
    const accordionItem = locator.getByRole('heading', { name: 'Item 1' });
    await expect.element(accordionItem).toBeInTheDocument();
  });

  it('should set heading for accordion item', async () => {
    const { locator } = await render(TestHostAccordion);

    const headerBtn = locator.getByRole('button');
    await expect.element(headerBtn).toHaveTextContent('Item 1');
  });

  it('should apply variant color based on input', async () => {
    const { locator } = await render(TestHostAccordion, { inputs: { variantColor } });
    const headerBtn = locator.getByRole('button');
    await expect.element(headerBtn).toHaveAttribute('data-theme', 'dark');

    variantColor.set('light');
    await expect.element(headerBtn).toHaveAttribute('data-theme', 'light');
  });

  it('should disable accordion item when disabled input is true', async () => {
    const { locator } = await render(TestHostAccordion, { inputs: { disabledAccordionItem } });
    const headerBtn = locator.getByRole('button');
    await expect.element(headerBtn).not.toBeDisabled();
    disabledAccordionItem.set(true);

    await expect.element(headerBtn).toBeDisabled();
  });

  it('should disable all accordion items when accordion disabled input is true', async () => {
    const { locator } = await render(TestHostAccordion, { inputs: { disabledAccordion } });

    const headerBtn = locator.getByRole('button');
    await expect.element(headerBtn).not.toBeDisabled();

    disabledAccordion.set(true);
    await expect.element(headerBtn).toBeDisabled();
  });

  it('should transition content states on open and close', async () => {
    const collapseAccordion = signal(true);
    const { locator } = await render(TestHostAccordion, { inputs: { collapseAccordion } });
    const trigger = locator.getByRole('button');
    const content = locator.getByRole('region');

    // Initially closed: persistent data-closed state, hidden until found
    await expect.element(content).toHaveAttribute('data-closed');
    await expect.element(content).toHaveAttribute('hidden', 'until-found');

    // Open: transient data-enter drives the slideDown animation
    await trigger.click();
    await expect.element(content).toHaveAttribute('data-open');
    await expect.element(content, { timeout: 5000 }).toHaveAttribute('data-enter');
    await expect.element(content).not.toHaveAttribute('data-closed');

    // Animationend clears the transient state
    content.element().dispatchEvent(new Event('animationend'));
    await expect.element(content).not.toHaveAttribute('data-enter');

    // Close: transient data-exit drives the slideUp animation
    await trigger.click();
    await expect.element(content, { timeout: 5000 }).toHaveAttribute('data-exit');
    await expect.element(content).toHaveAttribute('data-closed');

    // Animationend clears data-exit; data-closed keeps the panel collapsed
    content.element().dispatchEvent(new Event('animationend'));
    await expect.element(content).not.toHaveAttribute('data-exit');
    await expect.element(content).toHaveAttribute('data-closed');
  });
});
