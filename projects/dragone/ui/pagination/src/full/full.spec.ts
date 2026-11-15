import { Component, input, signal } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';
import { page } from 'vitest/browser';

import { Full } from './full';

@Component({
  imports: [Full],
  template: `
    <drgn-pagination-full
      [totalItems]="totalItems()"
      [disabled]="disabled()"
      [showPageSize]="showPageSize()"
      [showRange]="showRange()"
      [showPageJumper]="showPageJumper()"
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
  readonly showNav = signal(true);
}

@Component({
  imports: [Full],
  template: `
    <div [style.inline-size.px]="width()">
      <drgn-pagination-full [totalItems]="100" />
    </div>
  `
})
class BoardHost {
  readonly width = signal(1016);
}

describe(Full, () => {
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

  it('should leave the numbered pages to the standalone strip', async () => {
    const { locator } = await render(TestHost, { inputs: { totalItems } });

    await expect.element(locator.getByRole('button', { name: 'Pagina 2' })).not.toBeInTheDocument();
    await expect
      .element(locator.getByRole('button', { name: 'Pagina 10' }))
      .not.toBeInTheDocument();
    await expect.element(locator.getByRole('button', { name: 'Pagina precedente' })).toBeDisabled();
    await expect.element(locator.getByRole('button', { name: 'Pagina successiva' })).toBeEnabled();
  });

  it('should separate the range from the page jumper with a single rule', async () => {
    const { locator } = await render(TestHost, { inputs: { totalItems } });

    const dividers = locator.getByTestId('pagination-divider').elements() as HTMLElement[];
    expect(dividers).toHaveLength(1);
    expect(dividers.every(divider => divider.checkVisibility())).toBeTruthy();
  });

  it('should drop the rule when nothing precedes the page jumper', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.showPageSize.set(false);
    componentClassInstance.showRange.set(false);

    await expect.element(locator.getByTestId('pagination-range')).not.toBeInTheDocument();
    const dividers = locator.getByTestId('pagination-divider').elements() as HTMLElement[];
    expect(dividers.filter(divider => divider.checkVisibility())).toHaveLength(0);
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
    await expect
      .element(locator.getByTestId('pagination-page-count'))
      .toHaveTextContent('di 2 Pagine');
    expect(componentClassInstance.currentPage()).toBe(2);
  });

  it('should drop the pieces whose boolean is off', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.showPageSize.set(false);
    componentClassInstance.showRange.set(false);
    componentClassInstance.showPageJumper.set(false);

    await expect.element(locator.getByTestId('pagination-range')).not.toBeInTheDocument();
    await expect.element(locator.getByTestId('pagination-page-count')).not.toBeInTheDocument();
    await expect.element(locator.getByRole('combobox')).not.toBeInTheDocument();
    expect(locator.getByTestId('pagination-divider').elements()).toHaveLength(0);
    await expect.element(locator.getByRole('button', { name: 'Pagina successiva' })).toBeEnabled();
  });

  it('should drop the rule with the page jumper', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.showPageJumper.set(false);

    await expect.element(locator.getByTestId('pagination-page-count')).not.toBeInTheDocument();
    expect(locator.getByTestId('pagination-divider').elements()).toHaveLength(0);
    await expect
      .element(locator.getByTestId('pagination-range'))
      .toHaveTextContent('1 - 10 di 100 Elementi');
  });

  it('should drop the strip and its tile when the nav is off', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.showNav.set(false);

    await expect
      .element(locator.getByRole('navigation', { name: 'Paginazione' }))
      .not.toBeInTheDocument();
  });

  it('should disable the selects and the strip together', async () => {
    const { componentClassInstance, locator } = await render(TestHost, { inputs: { totalItems } });
    componentClassInstance.disabled.set(true);

    await expect.element(locator.getByRole('button', { name: 'Pagina successiva' })).toBeDisabled();
    // The Select exposes its disabled state as `data-disabled` and removes it from the tab order;
    // it does not set `aria-disabled`, so `toBeDisabled()` is not the assertion to make here.
    await expect
      .element(locator.getByRole('combobox', { name: 'Elementi per pagina:' }))
      .toHaveAttribute('data-disabled');
    await expect
      .element(locator.getByRole('combobox', { name: 'Vai a pagina' }))
      .toHaveAttribute('data-disabled');
  });

  it('should lay the bar out on the spec board', async () => {
    const { locator } = await render(BoardHost);

    const bar = locator.getByTestId('pagination-bar').element() as HTMLElement;
    const nav = locator.getByTestId('pagination-nav').element() as HTMLElement;
    const dividers = locator.getByTestId('pagination-divider').elements() as HTMLElement[];
    const previous = locator.getByRole('button', { name: 'Pagina precedente' }).element();
    const next = locator.getByRole('button', { name: 'Pagina successiva' }).element();
    const box = (element: Element) => element.getBoundingClientRect();

    // The spec's 74px board leaves its 8px vertical padding with 58px for the rule.
    expect(Math.round(box(bar).height)).toBe(74);
    expect(dividers).toHaveLength(1);
    expect(Math.round(box(dividers[0]!).height)).toBe(58);

    // The cursor tile is white, two 38px buttons wide, and sits flush with the bar's right edge.
    expect(getComputedStyle(nav).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(Math.round(box(nav).width)).toBe(76);
    expect(Math.round(box(nav).right)).toBe(Math.round(box(bar).right));
    expect([Math.round(box(previous).width), Math.round(box(previous).height)]).toEqual([38, 44]);
    expect(Math.round(box(next).left)).toBe(Math.round(box(previous).right));
  });

  it('should keep the cursor tile on the bar line at any width', async () => {
    const { componentClassInstance, fixture, locator } = await render(BoardHost);

    const bar = locator.getByTestId('pagination-bar').element() as HTMLElement;
    const nav = locator.getByTestId('pagination-nav').element() as HTMLElement;

    // The bar used to wrap, which dropped the tile under the controls as soon as the three regions
    // did not fit — at 850px the bar grew to 118px with the tile on a second line.
    for (const width of [1016, 900, 850, 800, 700]) {
      componentClassInstance.width.set(width);
      await fixture.whenStable();
      expect(Math.round(nav.getBoundingClientRect().top)).toBe(
        Math.round(bar.getBoundingClientRect().top)
      );
    }
  });
});
