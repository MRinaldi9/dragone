import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { page } from 'vitest/browser';

import { PaginationComplex } from './pagination-complex';

@Component({
  imports: [PaginationComplex],
  template: `
    <drgn-pagination-complex
      [totalItems]="totalItems()"
      [disabled]="disabled()"
      [showPageSize]="showPageSize()"
      [showRange]="showRange()"
      [showPageJumper]="showPageJumper()"
      [showPages]="showPages()"
      [showNav]="showNav()"
      [(page)]="currentPage"
      [(pageSize)]="currentPageSize"
    />
  `
})
class TestHost {
  readonly totalItems = input(100);
  readonly currentPage = signal(1);
  readonly currentPageSize = signal(10);
  readonly disabled = signal(false);
  readonly showPageSize = signal(true);
  readonly showRange = signal(true);
  readonly showPageJumper = signal(true);
  readonly showPages = signal(true);
  readonly showNav = signal(true);
}

describe(PaginationComplex, () => {
  const totalItems = signal(100);

  afterEach(() => {
    totalItems.set(100);
  });

  it('should render the range, the page count and the page strip', async () => {
    const { locator } = await render(TestHost, { inputs: { totalItems } });

    await expect
      .element(locator.getByTestId('pagination-range'))
      .toHaveTextContent('1 - 10 di 100 Elementi');
    await expect
      .element(locator.getByTestId('pagination-page-count'))
      .toHaveTextContent('di 10 Pagine');
    await expect
      .element(locator.getByRole('navigation', { name: 'Paginazione' }))
      .toBeInTheDocument();
  });

  it('should name the page-size select after its visible label', async () => {
    const { locator } = await render(TestHost, { inputs: { totalItems } });

    await expect
      .element(locator.getByRole('combobox', { name: 'Elementi per pagina:' }))
      .toBeInTheDocument();
    await expect
      .element(locator.getByRole('combobox', { name: 'Vai a pagina' }))
      .toBeInTheDocument();
  });

  it('should derive the page count from the total items and the page size', async () => {
    const { locator } = await render(TestHost, { inputs: { totalItems } });
    totalItems.set(37);

    await expect
      .element(locator.getByTestId('pagination-page-count'))
      .toHaveTextContent('di 4 Pagine');
    await expect
      .element(locator.getByTestId('pagination-range'))
      .toHaveTextContent('1 - 10 di 37 Elementi');
  });

  it('should move the range with the current page', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.currentPage.set(3);

    await expect
      .element(locator.getByTestId('pagination-range'))
      .toHaveTextContent('21 - 30 di 100 Elementi');
  });

  it('should reset to the first page when the page size changes', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.currentPage.set(5);

    await locator.getByRole('combobox', { name: 'Elementi per pagina:' }).click();
    await page.getByRole('option', { name: '20' }).click();

    expect(componentClassInstance.currentPageSize()).toBe(20);
    expect(componentClassInstance.currentPage()).toBe(1);
  });

  it('should change the page from the page jumper', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });

    await locator.getByRole('combobox', { name: 'Vai a pagina' }).click();
    await page.getByRole('option', { name: '4' }).click();

    expect(componentClassInstance.currentPage()).toBe(4);
  });

  it('should pull the page back when the page count shrinks under it', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.currentPage.set(10);

    componentClassInstance.currentPageSize.set(50);

    await expect
      .element(locator.getByTestId('pagination-range'))
      .toHaveTextContent('51 - 100 di 100 Elementi');
    expect(componentClassInstance.currentPage()).toBe(2);
    await expect
      .element(locator.getByRole('button', { name: 'Pagina 10' }))
      .not.toBeInTheDocument();
  });

  it('should drop the pieces whose boolean is off', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.showPageSize.set(false);
    componentClassInstance.showRange.set(false);
    componentClassInstance.showPageJumper.set(false);
    componentClassInstance.showPages.set(false);

    await expect.element(locator.getByTestId('pagination-range')).not.toBeInTheDocument();
    await expect.element(locator.getByTestId('pagination-page-count')).not.toBeInTheDocument();
    await expect.element(locator.getByRole('combobox')).not.toBeInTheDocument();
    await expect.element(locator.getByRole('button', { name: 'Pagina 1' })).not.toBeInTheDocument();
    await expect.element(locator.getByRole('button', { name: 'Pagina successiva' })).toBeEnabled();
  });

  it('should disable the selects and the strip together', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.disabled.set(true);

    await expect.element(locator.getByRole('button', { name: 'Pagina 3' })).toBeDisabled();
    await expect.element(locator.getByRole('button', { name: 'Pagina successiva' })).toBeDisabled();
  });
});
