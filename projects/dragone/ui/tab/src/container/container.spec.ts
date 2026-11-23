import { Component, ElementRef, viewChild } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidUser } from '@ng-icons/font-awesome/solid';
import { render } from '@wismaz/vitest-browser-angular';
import { page, userEvent } from 'vitest/browser';

import { Tab, TabContainer, TabLazyContent } from '../../public-api';

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container #tabset>
      <drgn-tab value="first" label="First" />
      <drgn-tab value="second" label="Second" />
      <drgn-tab value="third" label="Third" />
    </drgn-tab-container>
  `
})
class DefaultTabsHost {
  readonly tabset = viewChild<ElementRef<HTMLElement>>('tabset', { read: ElementRef });
}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container [(value)]="selected" (valueChange)="onChange($event)">
      <drgn-tab value="first" label="First">
        <span>First tab content</span>
      </drgn-tab>
      <drgn-tab value="second" label="Second">
        <span>Second tab content</span>
      </drgn-tab>
      <drgn-tab value="third" label="Third">
        <span>Third tab content</span>
      </drgn-tab>
    </drgn-tab-container>
    <span data-testid="selected" [attr.data-selected]="selected ?? 'none'"></span>
    <span data-testid="changes" [attr.data-changes]="changeLog"></span>
  `
})
class ValueBoundHost {
  selected: string | undefined = undefined;
  changeLog = '';
  onChange(value: string | undefined): void {
    this.changeLog = value ?? 'undefined';
  }
}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container>
      <drgn-tab value="first" label="First">
        <p data-testid="eager-first">Eager first content</p>
      </drgn-tab>
      <drgn-tab value="second" label="Second">
        <p data-testid="eager-second">Eager second content</p>
      </drgn-tab>
    </drgn-tab-container>
  `
})
class EagerTabsHost {}

@Component({
  imports: [TabContainer, Tab, TabLazyContent],
  template: `
    <drgn-tab-container>
      <drgn-tab value="first" label="First" />
      <drgn-tab value="second" label="Second">
        <ng-template drgnTabLazyContent>
          <p data-testid="lazy-second">Lazy second content</p>
        </ng-template>
      </drgn-tab>
    </drgn-tab-container>
  `
})
class LazyTabsHost {}

@Component({
  imports: [TabContainer, Tab, TabLazyContent],
  template: `
    <drgn-tab-container>
      <drgn-tab value="first" label="First">
        <p data-testid="eager-first">Eager first content</p>
      </drgn-tab>
      <drgn-tab value="second" label="Second">
        <ng-template drgnTabLazyContent>
          <p data-testid="lazy-second">Lazy second content</p>
        </ng-template>
      </drgn-tab>
    </drgn-tab-container>
  `
})
class MixedTabsHost {}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container>
      <drgn-tab value="profile" label="Profile" [icon]="profileSvg" />
      <drgn-tab value="plain" label="Plain" />
    </drgn-tab-container>
  `
})
class RawSvgIconTabsHost {
  readonly profileSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16"></rect></svg>';
}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container>
      <drgn-tab value="profile" label="Profile" icon="faSolidUser" />
      <drgn-tab value="plain" label="Plain" />
    </drgn-tab-container>
  `,
  providers: [provideIcons({ faSolidUser })]
})
class NamedIconTabsHost {}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container>
      <drgn-tab value="first" label="First" disabled />
      <drgn-tab value="second" label="Second" />
      <drgn-tab value="third" label="Third" />
    </drgn-tab-container>
  `
})
class DisabledFirstHost {}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container [(value)]="selected" (valueChange)="onChange($event)">
      <drgn-tab value="first" label="First" disabled />
      <drgn-tab value="second" label="Second" />
      <drgn-tab value="third" label="Third" />
    </drgn-tab-container>
    <span data-testid="selected" [attr.data-selected]="selected ?? 'none'"></span>
    <span data-testid="changes" [attr.data-changes]="changeLog"></span>
  `
})
class DisabledValueHost {
  selected: string | undefined = undefined;
  changeLog = '';
  onChange(value: string | undefined): void {
    this.changeLog = value ?? 'undefined';
  }
}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container>
      <drgn-tab value="alpha" label="Alpha" />
      <drgn-tab value="bravo" label="Bravo" disabled />
      <drgn-tab value="charlie" label="Charlie" />
    </drgn-tab-container>
  `
})
class HorizontalKeyboardHost {}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container #tabset orientation="vertical">
      <drgn-tab value="first" label="First" />
      <drgn-tab value="second" label="Second" />
      <drgn-tab value="third" label="Third" />
    </drgn-tab-container>
  `
})
class VerticalTabsHost {
  readonly tabset = viewChild<ElementRef<HTMLElement>>('tabset', { read: ElementRef });
}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container #tabs [(value)]="selected" (valueChange)="onChange($event)">
      <drgn-tab value="first" label="First" />
      <drgn-tab value="second" label="Second" />
      <drgn-tab value="third" label="Third" />
    </drgn-tab-container>
    <span data-testid="selected" [attr.data-selected]="selected ?? 'none'"></span>
    <span data-testid="changes" [attr.data-changes]="changeLog"></span>
  `
})
class SelectMethodHost {
  readonly tabs = viewChild.required<TabContainer>('tabs');
  selected: string | undefined = undefined;
  changeLog = '';
  onChange(value: string | undefined): void {
    this.changeLog = value ?? 'undefined';
  }
  selectThird(): void {
    this.tabs().select('third');
  }
}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container ariaLabel="Settings sections">
      <drgn-tab value="first" label="First" />
      <drgn-tab value="second" label="Second" />
    </drgn-tab-container>
  `
})
class AriaLabelHost {}

@Component({
  imports: [TabContainer, Tab],
  template: `
    <drgn-tab-container #tabset theme="dark">
      <drgn-tab value="first" label="First" />
      <drgn-tab value="second" label="Second" />
    </drgn-tab-container>
  `
})
class DarkThemeHost {
  readonly tabset = viewChild<ElementRef<HTMLElement>>('tabset', { read: ElementRef });
}

@Component({
  imports: [TabContainer, Tab, TabLazyContent],
  template: `
    <drgn-tab-container>
      <drgn-tab #eager value="eager" label="Eager">
        <span>eager body</span>
      </drgn-tab>
      <drgn-tab #lazy value="lazy" label="Lazy">
        <ng-template drgnTabLazyContent>
          <span>lazy body</span>
        </ng-template>
      </drgn-tab>
    </drgn-tab-container>
  `
})
class LazyContentQueryHost {
  readonly eagerTab = viewChild.required<Tab>('eager');
  readonly lazyTab = viewChild.required<Tab>('lazy');
}

describe(TabContainer, () => {
  describe('seam 1: default rendering and ARIA wiring', () => {
    it('renders the tablist, tab buttons and linked tabpanels with the first tab active by default', async () => {
      await render(DefaultTabsHost);

      await expect(page.getByTestId('tab-list')).toBeInTheDocument();
      await expect(page.getByTestId('tab-panels')).toBeInTheDocument();

      const tablist = page.getByRole('tablist');
      await expect(tablist).toHaveAttribute('role', 'tablist');
      await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');

      const firstTab = page.getByRole('tab', { name: 'First' });
      const secondTab = page.getByRole('tab', { name: 'Second' });
      await expect(firstTab).toHaveAttribute('role', 'tab');
      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
      await expect(secondTab).toHaveAttribute('role', 'tab');
      await expect(secondTab).toHaveAttribute('aria-selected', 'false');

      const firstPanel = page.getByLabelText('First');
      const secondPanel = page.getByLabelText('Second');
      await expect(firstPanel).toHaveAttribute('role', 'tabpanel');
      await expect(secondPanel).toHaveAttribute('role', 'tabpanel');

      const firstTabEl = firstTab.element();
      const firstPanelEl = firstPanel.element();
      const secondTabEl = secondTab.element();
      const secondPanelEl = secondPanel.element();

      expect(firstTabEl.getAttribute('id')).toBeTruthy();
      expect(firstPanelEl.getAttribute('id')).toBeTruthy();
      expect(firstTabEl.getAttribute('aria-controls')).toBe(firstPanelEl.getAttribute('id'));
      expect(firstPanelEl.getAttribute('aria-labelledby')).toBe(firstTabEl.getAttribute('id'));
      expect(secondTabEl.getAttribute('aria-controls')).toBe(secondPanelEl.getAttribute('id'));
      expect(secondPanelEl.getAttribute('aria-labelledby')).toBe(secondTabEl.getAttribute('id'));
    });
  });

  describe('seam 2: click selection and two-way [(value)] / (valueChange)', () => {
    it('activates a clicked tab, updates [(value)], emits valueChange and swaps the visible tabpanel', async () => {
      await render(ValueBoundHost);

      const firstTab = page.getByRole('tab', { name: 'First' });
      const secondTab = page.getByRole('tab', { name: 'Second' });
      const firstPanel = page.getByLabelText('First');
      const secondPanel = page.getByLabelText('Second');

      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
      await expect(firstPanel).toBeVisible();
      await expect(secondPanel).not.toBeVisible();

      await secondTab.click();

      await expect(secondTab).toHaveAttribute('aria-selected', 'true');
      await expect(firstTab).toHaveAttribute('aria-selected', 'false');
      await expect(page.getByTestId('selected')).toHaveAttribute('data-selected', 'second');
      await expect(page.getByTestId('changes')).toHaveAttribute('data-changes', 'second');
      await expect(secondPanel).toBeVisible();
      await expect(firstPanel).not.toBeVisible();
    });
  });

  describe('seam 3: synchronous (eager) content rendering', () => {
    it('mounts projected content for every synchronous tab immediately and keeps it mounted across switches', async () => {
      await render(EagerTabsHost);

      await expect(page.getByTestId('tab-panels')).toBeVisible();
      await expect(page.getByTestId('eager-first')).toBeInTheDocument();
      await expect(page.getByTestId('eager-second')).toBeInTheDocument();
      await expect(page.getByTestId('eager-first')).toBeVisible();
      await expect(page.getByTestId('eager-second')).not.toBeVisible();

      const firstMount = page.getByTestId('eager-first').element();
      const secondMount = page.getByTestId('eager-second').element();

      await page.getByRole('tab', { name: 'Second' }).click();

      await expect(page.getByTestId('eager-second')).toBeVisible();
      await expect(page.getByTestId('eager-first')).not.toBeVisible();
      expect(page.getByTestId('eager-first').element()).toBe(firstMount);
      expect(page.getByTestId('eager-second').element()).toBe(secondMount);

      await page.getByRole('tab', { name: 'First' }).click();

      await expect(page.getByTestId('eager-first')).toBeVisible();
      await expect(page.getByTestId('eager-second')).not.toBeVisible();
      expect(page.getByTestId('eager-first').element()).toBe(firstMount);
      expect(page.getByTestId('eager-second').element()).toBe(secondMount);
    });
  });

  describe('seam 4: lazy content via TabLazyContent', () => {
    it('resolves Tab.lazyContent() to the projected TabLazyContent and to undefined without the wrapper template', async () => {
      const { componentClassInstance } = await render(LazyContentQueryHost);

      const lazy = componentClassInstance.lazyTab().lazyContent();

      expect(lazy).toBeInstanceOf(TabLazyContent);
      expect(lazy?.templateRef).toBeDefined();
      expect(componentClassInstance.eagerTab().lazyContent()).toBeUndefined();
    });

    it('keeps inactive lazy content out of the DOM, destroys it on switch away and re-creates it on re-selection', async () => {
      await render(LazyTabsHost);

      await expect(page.getByTestId('lazy-second')).not.toBeInTheDocument();

      await page.getByRole('tab', { name: 'Second' }).click();

      await expect(page.getByTestId('lazy-second')).toBeInTheDocument();
      await expect(page.getByTestId('lazy-second')).toBeVisible();
      const firstMount = page.getByTestId('lazy-second').element();

      await page.getByRole('tab', { name: 'First' }).click();

      await expect(page.getByTestId('lazy-second')).not.toBeInTheDocument();
      expect(firstMount.isConnected).toBeFalsy();

      await page.getByRole('tab', { name: 'Second' }).click();

      await expect(page.getByTestId('lazy-second')).toBeInTheDocument();
      const secondMount = page.getByTestId('lazy-second').element();

      expect(secondMount).not.toBe(firstMount);
    });
  });

  describe('seam 5: mixed synchronous and lazy tabs', () => {
    it('runs eager and lazy lifecycles independently inside one container', async () => {
      await render(MixedTabsHost);

      await expect(page.getByTestId('eager-first')).toBeVisible();
      await expect(page.getByTestId('lazy-second')).not.toBeInTheDocument();

      await page.getByRole('tab', { name: 'Second' }).click();

      await expect(page.getByTestId('lazy-second')).toBeVisible();
      await expect(page.getByTestId('eager-first')).toBeInTheDocument();
      await expect(page.getByTestId('eager-first')).not.toBeVisible();

      await page.getByRole('tab', { name: 'First' }).click();

      await expect(page.getByTestId('eager-first')).toBeVisible();
      await expect(page.getByTestId('lazy-second')).not.toBeInTheDocument();
    });
  });

  describe('seam 6: icons and the data-has-icon padding seam', () => {
    it('marks a raw svg icon tab with data-has-icon and renders an aligned svg inside the tab icon test id', async () => {
      await render(RawSvgIconTabsHost);

      await expect(page.getByRole('tab', { name: 'Profile' })).toHaveAttribute('data-has-icon', '');
      await expect(page.getByRole('tab', { name: 'Plain' })).not.toHaveAttribute('data-has-icon');

      await expect(page.getByTestId('tab-icon')).toBeInTheDocument();
      const iconHost = page.getByTestId('tab-icon').element() as HTMLElement;
      const svg = iconHost.querySelector('svg') as SVGSVGElement;
      expect(svg).not.toBeNull();

      const hostRect = iconHost.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      expect(Math.abs(svgRect.top - hostRect.top)).toBeLessThanOrEqual(1);
      expect(Math.abs(svgRect.bottom - hostRect.bottom)).toBeLessThanOrEqual(1);
    });

    it('marks a provideIcons-registered icon tab with data-has-icon and an aligned svg inside the tab icon test id', async () => {
      await render(NamedIconTabsHost);

      await expect(page.getByRole('tab', { name: 'Profile' })).toHaveAttribute('data-has-icon', '');
      await expect(page.getByRole('tab', { name: 'Plain' })).not.toHaveAttribute('data-has-icon');

      await expect(page.getByTestId('tab-icon')).toBeInTheDocument();
      const iconHost = page.getByTestId('tab-icon').element() as HTMLElement;
      const svg = iconHost.querySelector('svg') as SVGSVGElement;
      expect(svg).not.toBeNull();

      const hostRect = iconHost.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      expect(Math.abs(svgRect.top - hostRect.top)).toBeLessThanOrEqual(1);
      expect(Math.abs(svgRect.bottom - hostRect.bottom)).toBeLessThanOrEqual(1);
    });

    it('omits data-has-icon and the icon test id when no icon input is set', async () => {
      await render(DefaultTabsHost);

      await expect(page.getByRole('tab', { name: 'First' })).not.toHaveAttribute('data-has-icon');
      await expect(page.getByTestId('tab-icon')).not.toBeInTheDocument();
    });
  });

  describe('seam 7: disabled tab behavior', () => {
    it('renders the disabled tab with disabled and data-disabled and defaults selection to the first enabled tab', async () => {
      await render(DisabledFirstHost);

      const firstTab = page.getByRole('tab', { name: 'First' });
      const secondTab = page.getByRole('tab', { name: 'Second' });

      await expect(firstTab).toBeDisabled();
      await expect(firstTab).toHaveAttribute('data-disabled', '');
      await expect(firstTab).toHaveAttribute('aria-selected', 'false');
      await expect(secondTab).toHaveAttribute('aria-selected', 'true');
    });

    it('does not activate a disabled tab on click and does not report it through [(value)] or (valueChange)', async () => {
      await render(DisabledValueHost);

      const firstTab = page.getByRole('tab', { name: 'First' });
      const secondTab = page.getByRole('tab', { name: 'Second' });

      await firstTab.click({ force: true });

      await expect(firstTab).toHaveAttribute('aria-selected', 'false');
      await expect(secondTab).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('selected')).not.toHaveAttribute('data-selected', 'first');
      await expect(page.getByTestId('changes')).not.toHaveAttribute('data-changes', 'first');
    });
  });

  describe('seam 8: orientation, keyboard navigation, select() and ariaLabel', () => {
    it('reflects horizontal orientation on the container and the tablist by default', async () => {
      const { componentClassInstance, fixture } = await render(DefaultTabsHost);
      fixture.detectChanges();

      expect(componentClassInstance.tabset()?.nativeElement.getAttribute('data-orientation')).toBe(
        'horizontal'
      );
      await expect(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('reflects vertical orientation on the container and the tablist', async () => {
      const { componentClassInstance, fixture } = await render(VerticalTabsHost);
      fixture.detectChanges();

      expect(componentClassInstance.tabset()?.nativeElement.getAttribute('data-orientation')).toBe(
        'vertical'
      );
      await expect(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('navigates horizontally with ArrowRight and ArrowLeft skipping disabled tabs, plus Home and End', async () => {
      await render(HorizontalKeyboardHost);

      const alpha = page.getByRole('tab', { name: 'Alpha' });
      const bravo = page.getByRole('tab', { name: 'Bravo' });
      const charlie = page.getByRole('tab', { name: 'Charlie' });

      await alpha.click();
      await expect(alpha).toHaveFocus();

      await userEvent.keyboard('{ArrowRight}');
      await expect(charlie).toHaveFocus();

      await userEvent.keyboard('{ArrowLeft}');
      await expect(alpha).toHaveFocus();

      await userEvent.keyboard('{End}');
      await expect(charlie).toHaveFocus();

      await userEvent.keyboard('{Home}');
      await expect(alpha).toHaveFocus();

      await expect(bravo).toBeDisabled();
    });

    it('navigates vertically with ArrowDown and ArrowUp, plus Home and End', async () => {
      await render(VerticalTabsHost);

      await page.getByRole('tab', { name: 'First' }).click();
      await expect(page.getByRole('tab', { name: 'First' })).toHaveFocus();

      await userEvent.keyboard('{ArrowDown}');
      await expect(page.getByRole('tab', { name: 'Second' })).toHaveFocus();

      await userEvent.keyboard('{ArrowDown}');
      await expect(page.getByRole('tab', { name: 'Third' })).toHaveFocus();

      await userEvent.keyboard('{ArrowUp}');
      await expect(page.getByRole('tab', { name: 'Second' })).toHaveFocus();

      await userEvent.keyboard('{Home}');
      await expect(page.getByRole('tab', { name: 'First' })).toHaveFocus();

      await userEvent.keyboard('{End}');
      await expect(page.getByRole('tab', { name: 'Third' })).toHaveFocus();
    });

    it('select(value) activates the given tab and drives [(value)] and valueChange', async () => {
      const { componentClassInstance, fixture } = await render(SelectMethodHost);

      componentClassInstance.selectThird();
      fixture.detectChanges();

      await expect(page.getByRole('tab', { name: 'Third' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      await expect(page.getByRole('tab', { name: 'First' })).toHaveAttribute(
        'aria-selected',
        'false'
      );
      await expect(page.getByTestId('selected')).toHaveAttribute('data-selected', 'third');
      await expect(page.getByTestId('changes')).toHaveAttribute('data-changes', 'third');
    });

    it('applies ariaLabel to the tablist', async () => {
      await render(AriaLabelHost);

      await expect(page.getByRole('tablist')).toHaveAttribute('aria-label', 'Settings sections');
    });

    it('omits aria-label from the tablist when ariaLabel is not set', async () => {
      await render(DefaultTabsHost);

      await expect(page.getByRole('tablist')).not.toHaveAttribute('aria-label');
    });
  });

  describe('seam 9: theme host binding', () => {
    it('reflects theme="dark" as data-theme="dark" on the container host element', async () => {
      const { componentClassInstance, fixture } = await render(DarkThemeHost);
      fixture.detectChanges();

      expect(componentClassInstance.tabset()?.nativeElement.getAttribute('data-theme')).toBe(
        'dark'
      );
    });
  });
});
