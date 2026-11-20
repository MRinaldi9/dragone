import { Component, input, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidShareNodes } from '@ng-icons/font-awesome/solid';
import { render } from '@wismaz/vitest-browser-angular';
import { page, userEvent } from 'vitest/browser';

import { TestId, Theme, type LayoutType, type ThemeType } from '@dragone/ui/utils';

import { TitleBar, type TitleBarActionItem, type TitleBarHeadingLevel } from './title-bar';

const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 0h16v16H0z"></path></svg>';

@Component({
  imports: [TitleBar, TestId, Theme],
  template: `
    <div drgnTheme [theme]="parentTheme()">
      <drgn-title-bar drgnTestId="title-bar" [title]="title()" [theme]="theme()" />
    </div>
  `
})
class ParentThemeHost {
  readonly title = input('Titolo pagina');
  readonly parentTheme = input<ThemeType | undefined>(undefined);
  readonly theme = input<ThemeType | undefined>(undefined);
}

describe(TitleBar, () => {
  describe('title & subtitle rendering', () => {
    it('should render the required title', async () => {
      const title = signal('Titolo pagina');
      const { locator } = await render(TitleBar, { inputs: { title } });

      await expect
        .element(locator.getByTestId('title-bar-title'))
        .toHaveTextContent('Titolo pagina');
    });

    it('should apply the title typography and class', async () => {
      const title = signal('Titolo pagina');
      const { locator } = await render(TitleBar, { inputs: { title } });
      const titleEl = locator.getByTestId('title-bar-title');

      await expect.element(titleEl).toHaveClass('drgn-h5-md');
      await expect.element(titleEl).toHaveClass('title');
    });

    it('should not render the subtitle when omitted', async () => {
      const title = signal('Titolo pagina');
      const { locator } = await render(TitleBar, { inputs: { title } });

      await expect.element(locator.getByTestId('title-bar-subtitle')).not.toBeInTheDocument();
    });

    it('should not render the subtitle when empty', async () => {
      const title = signal('Titolo pagina');
      const subtitle = signal('');
      const { locator } = await render(TitleBar, { inputs: { title, subtitle } });

      await expect.element(locator.getByTestId('title-bar-subtitle')).not.toBeInTheDocument();
    });

    it('should render the subtitle when provided', async () => {
      const title = signal('Titolo pagina');
      const subtitle = signal('Pagina elenco');
      const { locator } = await render(TitleBar, { inputs: { title, subtitle } });
      const subtitleEl = locator.getByTestId('title-bar-subtitle');

      await expect.element(subtitleEl).toHaveTextContent('Pagina elenco');
      await expect.element(subtitleEl).toHaveClass('drgn-p-md-01');
      await expect.element(subtitleEl).toHaveClass('subtitle');
    });

    it('should render the header and actions containers', async () => {
      const title = signal('Titolo pagina');
      const { locator } = await render(TitleBar, { inputs: { title } });

      await expect.element(locator.getByTestId('title-bar-header')).toBeInTheDocument();
      await expect.element(locator.getByTestId('title-bar-actions')).toBeInTheDocument();
    });
  });

  describe('heading semantics', () => {
    it('should not expose the title as a heading by default', async () => {
      const title = signal('Titolo pagina');
      const { locator } = await render(TitleBar, { inputs: { title } });
      const titleEl = locator.getByTestId('title-bar-title');

      await expect.element(titleEl).not.toHaveRole('heading');
      await expect.element(titleEl).not.toHaveAttribute('role');
      await expect.element(titleEl).not.toHaveAttribute('aria-level');
    });

    it('should expose the title as a level 5 heading when titleAsHeading is true', async () => {
      const title = signal('Titolo pagina');
      const titleAsHeading = signal(true);
      const { locator } = await render(TitleBar, { inputs: { title, titleAsHeading } });

      await expect
        .element(locator.getByRole('heading', { name: 'Titolo pagina', level: 5 }))
        .toBeInTheDocument();
      await expect
        .element(locator.getByTestId('title-bar-title'))
        .toHaveAttribute('aria-level', '5');
    });

    it('should respect the headingLevel input', async () => {
      const title = signal('Titolo pagina');
      const titleAsHeading = signal(true);
      const headingLevel = signal<TitleBarHeadingLevel>(2);
      const { locator } = await render(TitleBar, {
        inputs: { title, titleAsHeading, headingLevel }
      });

      await expect
        .element(locator.getByRole('heading', { name: 'Titolo pagina', level: 2 }))
        .toBeInTheDocument();
      await expect
        .element(locator.getByTestId('title-bar-title'))
        .toHaveAttribute('aria-level', '2');
    });
  });

  describe('theme & layout host state', () => {
    it('should default to the desktop layout', async () => {
      const title = signal('Titolo pagina');
      const { locator } = await render(TitleBar, { inputs: { title } });

      await expect.element(locator).toHaveAttribute('data-layout', 'desktop');
    });

    it('should switch to the mobile layout', async () => {
      const title = signal('Titolo pagina');
      const layout = signal<LayoutType>('mobile');
      const { locator } = await render(TitleBar, { inputs: { title, layout } });

      await expect.element(locator).toHaveAttribute('data-layout', 'mobile');
    });

    it('should set data-theme on the host and inherit it on the action buttons', async () => {
      const title = signal('Titolo pagina');
      const theme = signal<ThemeType>('light');
      const actions = signal<readonly TitleBarActionItem[]>([{ label: 'Modifica' }]);
      const { locator } = await render(TitleBar, { inputs: { title, theme, actions } });

      await expect.element(locator).toHaveAttribute('data-theme', 'light');
      await expect
        .element(locator.getByRole('button', { name: 'Modifica' }))
        .toHaveAttribute('data-theme', 'light');

      theme.set('dark');
      await expect.element(locator).toHaveAttribute('data-theme', 'dark');
      await expect
        .element(locator.getByRole('button', { name: 'Modifica' }))
        .toHaveAttribute('data-theme', 'dark');
    });

    it('should inherit data-theme from a parent Theme', async () => {
      const parentTheme = signal<ThemeType | undefined>('dark');
      const { locator } = await render(ParentThemeHost, { inputs: { parentTheme } });

      await expect.element(locator.getByTestId('title-bar')).toHaveAttribute('data-theme', 'dark');
    });
  });

  describe('inline action buttons', () => {
    it('should render each action as a ghost medium Button with the label typography class', async () => {
      const title = signal('Titolo pagina');
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Modifica' },
        { label: 'Elimina' }
      ]);
      const { locator } = await render(TitleBar, { inputs: { title, actions } });

      const modifica = locator.getByRole('button', { name: 'Modifica' });
      const elimina = locator.getByRole('button', { name: 'Elimina' });
      await expect.element(modifica).toHaveAttribute('data-semantic', 'ghost');
      await expect.element(modifica).toHaveAttribute('data-size', 'medium');
      await expect.element(elimina).toHaveAttribute('data-semantic', 'ghost');
      await expect.element(elimina).toHaveAttribute('data-size', 'medium');
      await expect.element(locator.getByText('Modifica')).toHaveClass('drgn-label-md-700');
      await expect.element(locator.getByText('Elimina')).toHaveClass('drgn-label-md-700');
    });

    it('should render actions sharing a label when their ids are distinct', async () => {
      const title = signal('Titolo pagina');
      const actions = signal<readonly TitleBarActionItem[]>([
        { id: 'edit-primary', label: 'Modifica' },
        { id: 'edit-secondary', label: 'Modifica' }
      ]);
      const { locator } = await render(TitleBar, { inputs: { title, actions } });

      await expect
        .poll(() => locator.getByRole('button', { name: 'Modifica' }).elements().length)
        .toBe(2);
    });

    it('should render the leading icon from an inline SVG string and an icon name', async () => {
      const title = signal('Titolo pagina');
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Modifica', icon: ICON_SVG },
        { label: 'Condividi', icon: 'faSolidShareNodes' }
      ]);
      const { locator } = await render(TitleBar, {
        inputs: { title, actions },
        providers: [provideIcons({ faSolidShareNodes })]
      });

      await expect
        .element(locator.getByRole('button', { name: 'Modifica' }))
        .toContainHTML(ICON_SVG);
      await expect
        .element(locator.getByRole('button', { name: 'Condividi' }))
        .toContainHTML(faSolidShareNodes);
    });

    it('should project the action icon outside the label span without clipping the svg', async () => {
      const title = signal('Titolo pagina');
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Modifica', icon: ICON_SVG }
      ]);
      const { locator } = await render(TitleBar, { inputs: { title, actions } });

      const buttonEl = locator
        .getByRole('button', { name: 'Modifica' })
        .element() as HTMLButtonElement;
      const labelSpan = buttonEl.querySelector('span.drgn-label-md-700') as HTMLElement;
      const iconEl = buttonEl.querySelector('ng-icon') as HTMLElement;
      const svgEl = iconEl.querySelector('svg') as SVGSVGElement;

      expect(labelSpan.contains(iconEl)).toBe(false);
      const iconRect = iconEl.getBoundingClientRect();
      const svgRect = svgEl.getBoundingClientRect();
      expect(svgRect.top).toBeGreaterThanOrEqual(iconRect.top);
      expect(svgRect.bottom).toBeLessThanOrEqual(iconRect.bottom);
    });

    it('should render an icon-only action with an accessible name', async () => {
      const title = signal('Titolo pagina');
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Aggiungi', icon: ICON_SVG, iconOnly: true }
      ]);
      const { locator } = await render(TitleBar, { inputs: { title, actions } });
      const button = locator.getByRole('button', { name: 'Aggiungi' });

      await expect.element(button).toHaveAttribute('data-icon-only');
      await expect.element(button).toHaveAttribute('aria-label', 'Aggiungi');
      await expect.element(button).toContainHTML(ICON_SVG);
    });

    it('should emit actionClick with the item and call onClick when clicked', async () => {
      const title = signal('Titolo pagina');
      const onClick = vi.fn<() => void>();
      const item: TitleBarActionItem = { label: 'Modifica', onClick };
      const actions = signal<readonly TitleBarActionItem[]>([item]);
      const actionClick = vi.fn<(action: TitleBarActionItem) => void>();
      const { locator } = await render(TitleBar, {
        inputs: { title, actions },
        outputs: { actionClick }
      });

      await locator.getByRole('button', { name: 'Modifica' }).click();

      expect(onClick).toHaveBeenCalledOnce();
      expect(actionClick).toHaveBeenCalledWith(item);
    });

    it('should disable the action and block clicks when disabled', async () => {
      const title = signal('Titolo pagina');
      const onClick = vi.fn<() => void>();
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Elimina', disabled: true, onClick }
      ]);
      const actionClick = vi.fn<(action: TitleBarActionItem) => void>();
      const { locator } = await render(TitleBar, {
        inputs: { title, actions },
        outputs: { actionClick }
      });
      const button = locator.getByRole('button', { name: 'Elimina' });

      await expect.element(button).toBeDisabled();
      await expect.element(button).toHaveAttribute('data-disabled');

      const clickOptions = { force: true };
      await userEvent.click(button, clickOptions);

      expect(onClick).not.toHaveBeenCalled();
      expect(actionClick).not.toHaveBeenCalled();
    });

    it('should expose data-focus-visible on keyboard Tab focus', async () => {
      const title = signal('Titolo pagina');
      const actions = signal<readonly TitleBarActionItem[]>([{ label: 'Modifica' }]);
      const { locator } = await render(TitleBar, { inputs: { title, actions } });

      await userEvent.click(locator.getByTestId('title-bar-title'));
      await userEvent.tab();

      await expect
        .element(locator.getByRole('button', { name: 'Modifica' }))
        .toHaveAttribute('data-focus-visible');
    });
  });

  describe('mobile collapse & overflow menu', () => {
    it('should render multiple actions inline and skip the overflow trigger on desktop', async () => {
      const title = signal('Titolo pagina');
      const layout = signal<LayoutType>('desktop');
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Modifica' },
        { label: 'Elimina' }
      ]);
      const { locator } = await render(TitleBar, { inputs: { title, layout, actions } });

      await expect.element(locator.getByRole('button', { name: 'Modifica' })).toBeVisible();
      await expect.element(locator.getByRole('button', { name: 'Elimina' })).toBeVisible();
      await expect.element(locator).not.toHaveAttribute('data-collapsed');
      await expect
        .element(locator.getByTestId('title-bar-overflow-trigger'))
        .not.toBeInTheDocument();
    });

    it('should keep a single action inline on mobile', async () => {
      const title = signal('Titolo pagina');
      const layout = signal<LayoutType>('mobile');
      const actions = signal<readonly TitleBarActionItem[]>([{ label: 'Modifica' }]);
      const { locator } = await render(TitleBar, { inputs: { title, layout, actions } });

      await expect.element(locator.getByRole('button', { name: 'Modifica' })).toBeVisible();
      await expect.element(locator).not.toHaveAttribute('data-collapsed');
      await expect
        .element(locator.getByTestId('title-bar-overflow-trigger'))
        .not.toBeInTheDocument();
    });

    it('should collapse multiple actions and render the overflow trigger on mobile', async () => {
      const title = signal('Titolo pagina');
      const layout = signal<LayoutType>('mobile');
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Modifica' },
        { label: 'Elimina' }
      ]);
      const { locator } = await render(TitleBar, { inputs: { title, layout, actions } });

      await expect.element(locator).toHaveAttribute('data-collapsed');
      await expect
        .element(locator.getByRole('button', { name: 'Modifica' }))
        .not.toBeInTheDocument();
      await expect
        .element(locator.getByRole('button', { name: 'Elimina' }))
        .not.toBeInTheDocument();
      await expect.element(locator.getByRole('button', { name: 'Altre azioni' })).toBeVisible();
    });

    it('should bind overflowMenuLabel to the trigger accessible name', async () => {
      const title = signal('Titolo pagina');
      const layout = signal<LayoutType>('mobile');
      const overflowMenuLabel = signal('Azioni del titolo');
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Modifica' },
        { label: 'Elimina' }
      ]);
      const { locator } = await render(TitleBar, {
        inputs: { title, layout, overflowMenuLabel, actions }
      });

      await expect
        .element(locator.getByRole('button', { name: 'Azioni del titolo' }))
        .toBeVisible();
    });

    it('should open the overflow menu with a menuitem per action', async () => {
      const title = signal('Titolo pagina');
      const layout = signal<LayoutType>('mobile');
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Modifica' },
        { label: 'Elimina', disabled: true }
      ]);
      const { locator } = await render(TitleBar, { inputs: { title, layout, actions } });

      await locator.getByRole('button', { name: 'Altre azioni' }).click();

      await expect.element(page.getByTestId('title-bar-overflow-menu')).toBeInTheDocument();
      await expect.element(page.getByTestId('title-bar-overflow-menu')).toHaveRole('menu');
      await expect.element(page.getByRole('menuitem', { name: 'Modifica' })).toBeInTheDocument();
      await expect.element(page.getByRole('menuitem', { name: 'Elimina' })).toBeDisabled();
      await expect.poll(() => page.getByRole('menuitem').elements().length).toBe(2);
    });

    it('should invoke the action and close the menu when a menuitem is clicked', async () => {
      const title = signal('Titolo pagina');
      const layout = signal<LayoutType>('mobile');
      const onClick = vi.fn<() => void>();
      const item: TitleBarActionItem = { label: 'Modifica', onClick };
      const actions = signal<readonly TitleBarActionItem[]>([item, { label: 'Elimina' }]);
      const actionClick = vi.fn<(action: TitleBarActionItem) => void>();
      const { locator } = await render(TitleBar, {
        inputs: { title, layout, actions },
        outputs: { actionClick }
      });

      await locator.getByRole('button', { name: 'Altre azioni' }).click();
      await page.getByRole('menuitem', { name: 'Modifica' }).click();

      expect(onClick).toHaveBeenCalledOnce();
      expect(actionClick).toHaveBeenCalledWith(item);
      await expect.element(page.getByTestId('title-bar-overflow-menu')).not.toBeInTheDocument();
    });

    it('should open the overflow menu with ArrowDown and restore focus on Escape', async () => {
      const title = signal('Titolo pagina');
      const layout = signal<LayoutType>('mobile');
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Modifica' },
        { label: 'Elimina' }
      ]);
      const { locator } = await render(TitleBar, { inputs: { title, layout, actions } });
      const trigger = locator.getByTestId('title-bar-overflow-trigger');

      await userEvent.click(locator.getByTestId('title-bar-title'));
      await userEvent.tab();
      await expect.element(trigger).toHaveFocus();

      await userEvent.keyboard('{ArrowDown}');

      await expect.element(page.getByRole('menuitem', { name: 'Modifica' })).toBeInTheDocument();
      await expect.element(page.getByRole('menuitem', { name: 'Modifica' })).toHaveFocus();

      await userEvent.keyboard('{Escape}');

      await expect.element(page.getByTestId('title-bar-overflow-menu')).not.toBeInTheDocument();
      await expect.element(trigger).toHaveFocus();
    });

    it('should not collapse when collapseActions is false', async () => {
      const title = signal('Titolo pagina');
      const layout = signal<LayoutType>('mobile');
      const collapseActions = signal(false);
      const actions = signal<readonly TitleBarActionItem[]>([
        { label: 'Modifica' },
        { label: 'Elimina' }
      ]);
      const { locator } = await render(TitleBar, {
        inputs: { title, layout, collapseActions, actions }
      });

      await expect.element(locator.getByRole('button', { name: 'Modifica' })).toBeVisible();
      await expect.element(locator.getByRole('button', { name: 'Elimina' })).toBeVisible();
      await expect.element(locator).not.toHaveAttribute('data-collapsed');
      await expect
        .element(locator.getByTestId('title-bar-overflow-trigger'))
        .not.toBeInTheDocument();
    });
  });
});
