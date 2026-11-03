import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Pagination } from './pagination';

type PaginationStory = Pagination & {
  page: number;
  pageCount: number;
  disabled: boolean;
  pageChange: (value: number) => void;
};

const meta: Meta<PaginationStory> = {
  title: 'Dragone/UI/Pagination/Simple',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    page: 1,
    pageCount: 10,
    disabled: false,
    siblingCount: 2,
    showPages: true,
    showNav: true,
    pageChange: fn()
  },
  argTypes: {
    page: {
      type: 'number',
      description:
        'The current page, 1-based. Bind it two-way with [(page)] so the strip can navigate; a one-way [page] binding pins the page.',
      control: { type: 'number' }
    },
    pageCount: {
      type: 'number',
      description: 'How many pages the strip navigates.',
      control: { type: 'number' }
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the whole strip is disabled.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'false' } }
    },
    siblingCount: {
      type: 'number',
      description:
        'Sizes the strip. The cell count stays constant, so the strip never changes width, and the current page sits in the middle of the page numbers.',
      control: { type: 'number' },
      table: { defaultValue: { summary: '2' } }
    },
    showPages: {
      type: 'boolean',
      description: 'Whether to render the numbered page buttons.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'true' } }
    },
    showNav: {
      type: 'boolean',
      description: 'Whether to render the previous/next buttons.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'true' } }
    },
    pageChange: {
      description: 'Emitted with the page the user picks.',
      action: 'pageChange',
      control: false
    }
  },
  render: args => ({
    props: args,
    // `page` is bound two-way on purpose: a one-way `[page]` binding pins the Primitive's
    // controlled state and the strip would emit without ever moving.
    template: `<drgn-pagination [(page)]="page" ${argsToTemplate(args, { exclude: ['page'] })} />`
  })
};

export default meta;

type Story = StoryObj<PaginationStory>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Pagina 3' }));

    await expect(args.pageChange).toHaveBeenCalledWith(3);
    // The two-way binding moved the strip to the page the user picked.
    await expect(canvas.getByRole('button', { name: 'Pagina 3' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  }
};

export const ManyPages: Story = {
  args: { page: 21, pageCount: 42 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Pagina 21' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  }
};

export const NavOnly: Story = {
  args: { page: 2, pageCount: 3, showPages: false }
};

export const PagesOnly: Story = {
  args: { showNav: false }
};

export const Disabled: Story = {
  args: { disabled: true }
};
