import { provideIcons } from '@ng-icons/core';
import { faSolidBell, faSolidGear, faSolidUser } from '@ng-icons/font-awesome/solid';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Tab, TabContainer, TabLazyContent } from '../../public-api';

const meta: Meta<TabContainer> = {
  title: 'Dragone/UI/Tab',
  component: TabContainer,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [Tab, TabLazyContent],
      providers: [provideIcons({ faSolidUser, faSolidGear, faSolidBell })]
    })
  ]
};

export default meta;
type Story = StoryObj<TabContainer>;

export const Default: Story = {
  render: () => ({
    template: `
      <drgn-tab-container>
        <drgn-tab value="first" label="First"></drgn-tab>
        <drgn-tab value="second" label="Second"></drgn-tab>
        <drgn-tab value="third" label="Third"></drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const tablist = canvas.getByRole('tablist');
    await expect(tablist).toHaveAttribute('role', 'tablist');
    await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');

    const firstTab = canvas.getByRole('tab', { name: 'First' });
    const firstPanel = canvas.getByRole('tabpanel', { name: 'First' });
    await expect(firstTab).toHaveAttribute('role', 'tab');
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    await expect(firstPanel).toHaveAttribute('role', 'tabpanel');
    expect(firstTab.getAttribute('aria-controls')).toBe(firstPanel.id);
    expect(firstPanel.getAttribute('aria-labelledby')).toBe(firstTab.id);

    await expect(canvas.getByRole('tab', { name: 'Second' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    await userEvent.click(canvas.getByRole('tab', { name: 'Second' }));
    await expect(canvas.getByRole('tab', { name: 'Second' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(firstTab).toHaveAttribute('aria-selected', 'false');
  }
};

export const TwoWayValue: Story = {
  render: () => ({
    props: { selected: 'second' },
    template: `
      <drgn-tab-container [(value)]="selected">
        <drgn-tab value="first" label="First">
          <p>First tab content</p>
        </drgn-tab>
        <drgn-tab value="second" label="Second">
          <p>Second tab content</p>
        </drgn-tab>
        <drgn-tab value="third" label="Third">
          <p>Third tab content</p>
        </drgn-tab>
      </drgn-tab-container>
      <p data-testid="story-selected">Selected: {{ selected ?? 'none' }}</p>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tab', { name: 'Second' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(canvas.getByTestId('story-selected')).toHaveTextContent('Selected: second');
    await expect(canvas.getByRole('tabpanel', { name: 'Second' })).toBeVisible();

    await userEvent.click(canvas.getByRole('tab', { name: 'Third' }));

    await expect(canvas.getByRole('tab', { name: 'Third' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(canvas.getByRole('tab', { name: 'Second' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    await expect(canvas.getByTestId('story-selected')).toHaveTextContent('Selected: third');
    await expect(canvas.getByRole('tabpanel', { name: 'Third' })).toBeVisible();
    expect(canvas.queryByRole('tabpanel', { name: 'Second' })).toBeNull();
  }
};

export const EagerContent: Story = {
  render: () => ({
    template: `
      <drgn-tab-container>
        <drgn-tab value="first" label="First">
          <p data-testid="eager-story-first">Eager first content</p>
        </drgn-tab>
        <drgn-tab value="second" label="Second">
          <p data-testid="eager-story-second">Eager second content</p>
        </drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('eager-story-first')).toBeInTheDocument();
    await expect(canvas.getByTestId('eager-story-second')).toBeInTheDocument();
    await expect(canvas.getByTestId('eager-story-first')).toBeVisible();
    await expect(canvas.getByTestId('eager-story-second')).not.toBeVisible();

    const secondMount = canvas.getByTestId('eager-story-second');

    await userEvent.click(canvas.getByRole('tab', { name: 'Second' }));
    await expect(canvas.getByTestId('eager-story-second')).toBeVisible();
    await expect(canvas.getByTestId('eager-story-first')).not.toBeVisible();

    await userEvent.click(canvas.getByRole('tab', { name: 'First' }));
    await expect(canvas.getByTestId('eager-story-first')).toBeVisible();
    expect(canvas.getByTestId('eager-story-second')).toBe(secondMount);
  }
};

export const LazyContent: Story = {
  render: () => ({
    template: `
      <drgn-tab-container>
        <drgn-tab value="first" label="First">
          <p>Eager first content</p>
        </drgn-tab>
        <drgn-tab value="second" label="Second">
          <ng-template drgnTabLazyContent>
            <p data-testid="lazy-story-content">Lazy second content</p>
          </ng-template>
        </drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByTestId('lazy-story-content')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('tab', { name: 'Second' }));
    await expect(canvas.getByTestId('lazy-story-content')).toBeInTheDocument();
    const firstMount = canvas.getByTestId('lazy-story-content');

    await userEvent.click(canvas.getByRole('tab', { name: 'First' }));
    await expect(canvas.queryByTestId('lazy-story-content')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('tab', { name: 'Second' }));
    await expect(canvas.getByTestId('lazy-story-content')).toBeInTheDocument();
    const secondMount = canvas.getByTestId('lazy-story-content');

    expect(secondMount).not.toBe(firstMount);
  }
};

export const MixedContent: Story = {
  render: () => ({
    template: `
      <drgn-tab-container>
        <drgn-tab value="first" label="First">
          <p data-testid="mixed-eager">Eager first content</p>
        </drgn-tab>
        <drgn-tab value="second" label="Second">
          <ng-template drgnTabLazyContent>
            <p data-testid="mixed-lazy">Lazy second content</p>
          </ng-template>
        </drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('mixed-eager')).toBeInTheDocument();
    await expect(canvas.queryByTestId('mixed-lazy')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('tab', { name: 'Second' }));
    await expect(canvas.getByTestId('mixed-lazy')).toBeInTheDocument();
    await expect(canvas.getByTestId('mixed-eager')).toBeInTheDocument();
    await expect(canvas.getByTestId('mixed-eager')).not.toBeVisible();

    await userEvent.click(canvas.getByRole('tab', { name: 'First' }));
    await expect(canvas.getByTestId('mixed-eager')).toBeVisible();
    await expect(canvas.queryByTestId('mixed-lazy')).not.toBeInTheDocument();
  }
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <drgn-tab-container>
        <drgn-tab value="account" label="Account" icon="faSolidUser"></drgn-tab>
        <drgn-tab value="settings" label="Settings" icon="faSolidGear"></drgn-tab>
        <drgn-tab value="notifications" label="Notifications" icon="faSolidBell"></drgn-tab>
        <drgn-tab value="plain" label="Plain"></drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tab', { name: 'Account' })).toHaveAttribute('data-has-icon', '');
    await expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
      'data-has-icon',
      ''
    );
    await expect(canvas.getByRole('tab', { name: 'Notifications' })).toHaveAttribute(
      'data-has-icon',
      ''
    );
    await expect(canvas.getByRole('tab', { name: 'Plain' })).not.toHaveAttribute('data-has-icon');

    const iconHosts = canvas.getAllByTestId('tab-icon');
    expect(iconHosts).toHaveLength(3);
    for (const iconHost of iconHosts) {
      const svg = iconHost.querySelector('svg');
      expect(svg).not.toBeNull();
      const hostRect = iconHost.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      expect(Math.abs(svgRect.top - hostRect.top)).toBeLessThanOrEqual(1);
      expect(Math.abs(svgRect.bottom - hostRect.bottom)).toBeLessThanOrEqual(1);
    }
  }
};

const profileSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="5" r="3"></circle><path d="M2 14c0-3 3-5 6-5s6 2 6 5"></path></svg>';

export const WithCustomSvgIcon: Story = {
  render: () => ({
    props: { profileSvg },
    template: `
      <drgn-tab-container>
        <drgn-tab value="profile" label="Profile" [icon]="profileSvg"></drgn-tab>
        <drgn-tab value="plain" label="Plain"></drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tab', { name: 'Profile' })).toHaveAttribute('data-has-icon', '');
    await expect(canvas.getByRole('tab', { name: 'Plain' })).not.toHaveAttribute('data-has-icon');

    const iconHost = canvas.getByTestId('tab-icon');
    const svg = iconHost.querySelector('svg');
    expect(svg).not.toBeNull();
    const hostRect = iconHost.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    expect(Math.abs(svgRect.top - hostRect.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(svgRect.bottom - hostRect.bottom)).toBeLessThanOrEqual(1);
  }
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <drgn-tab-container>
        <drgn-tab value="first" label="First" disabled></drgn-tab>
        <drgn-tab value="second" label="Second"></drgn-tab>
        <drgn-tab value="third" label="Third"></drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstTab = canvas.getByRole('tab', { name: 'First' });
    const secondTab = canvas.getByRole('tab', { name: 'Second' });

    await expect(firstTab).toBeDisabled();
    await expect(firstTab).toHaveAttribute('data-disabled', '');
    await expect(firstTab).toHaveAttribute('aria-selected', 'false');
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(firstTab);
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
    await expect(firstTab).toHaveAttribute('aria-selected', 'false');
  }
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <drgn-tab-container orientation="vertical">
        <drgn-tab value="first" label="First"></drgn-tab>
        <drgn-tab value="second" label="Second"></drgn-tab>
        <drgn-tab value="third" label="Third"></drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstTab = canvas.getByRole('tab', { name: 'First' });

    await expect(canvas.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');

    await userEvent.click(firstTab);
    await expect(firstTab).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('tab', { name: 'Second' })).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect(firstTab).toHaveFocus();

    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Third' })).toHaveFocus();
  }
};

export const HorizontalKeyboard: Story = {
  render: () => ({
    template: `
      <drgn-tab-container>
        <drgn-tab value="alpha" label="Alpha"></drgn-tab>
        <drgn-tab value="bravo" label="Bravo" disabled></drgn-tab>
        <drgn-tab value="charlie" label="Charlie"></drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alpha = canvas.getByRole('tab', { name: 'Alpha' });
    const charlie = canvas.getByRole('tab', { name: 'Charlie' });

    await userEvent.click(alpha);
    await expect(alpha).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(charlie).toHaveFocus();

    await userEvent.keyboard('{ArrowLeft}');
    await expect(alpha).toHaveFocus();

    await userEvent.keyboard('{End}');
    await expect(charlie).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await expect(alpha).toHaveFocus();
  }
};

export const ProgrammaticSelect: Story = {
  render: () => ({
    props: { selected: undefined as string | undefined },
    template: `
      <drgn-tab-container #tabs [(value)]="selected">
        <drgn-tab value="first" label="First"></drgn-tab>
        <drgn-tab value="second" label="Second"></drgn-tab>
        <drgn-tab value="third" label="Third"></drgn-tab>
      </drgn-tab-container>
      <button type="button" (click)="tabs.select('third')">Select third</button>
      <p data-testid="story-selected">Selected: {{ selected ?? 'none' }}</p>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tab', { name: 'First' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Select third' }));

    await expect(canvas.getByRole('tab', { name: 'Third' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(canvas.getByRole('tab', { name: 'First' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    await expect(canvas.getByTestId('story-selected')).toHaveTextContent('Selected: third');
  }
};

export const AriaLabel: Story = {
  render: () => ({
    template: `
      <drgn-tab-container ariaLabel="Settings sections">
        <drgn-tab value="first" label="First"></drgn-tab>
        <drgn-tab value="second" label="Second"></drgn-tab>
      </drgn-tab-container>
    `,
    moduleMetadata: { imports: [TabContainer, Tab, TabLazyContent] }
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tablist')).toHaveAttribute('aria-label', 'Settings sections');
  }
};
