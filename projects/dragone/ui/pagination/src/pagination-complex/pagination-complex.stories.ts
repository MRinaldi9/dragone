import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { expect, fn, userEvent, within } from 'storybook/test';

import { PaginationComplex } from './pagination-complex';

type PaginationComplexStory = PaginationComplex & {
  pageChange: (value: number) => void;
  pageSizeChange: (value: number) => void;
};

const meta: Meta<PaginationComplexStory> = {
  title: 'Dragone/UI/Pagination/Complex',
  component: PaginationComplex,
  tags: ['autodocs'],
  args: {
    totalItems: 100,
    page: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 30, 50, 100],
    disabled: false,
    siblingCount: 2,
    showPageSize: true,
    showRange: true,
    showPageJumper: true,
    pageChange: fn(),
    pageSizeChange: fn()
  },
  argTypes: {
    totalItems: {
      type: 'number',
      description:
        'The total number of items spread across all pages. The page count, the range and the page jumper options derive from it.',
      control: { type: 'number' }
    },
    page: {
      type: 'number',
      description:
        'The current page, 1-based. Bind it two-way with [(page)] so the bar can navigate; a one-way [page] binding pins the page.',
      control: { type: 'number' }
    },
    pageSize: {
      type: 'number',
      description:
        'How many items a page holds. Bind it two-way with [(pageSize)] for the same reason as page.',
      control: { type: 'number' }
    },
    pageSizeOptions: {
      description: 'The page sizes offered by the "items per page" select.',
      control: { type: 'object' }
    },
    showPageSize: {
      type: 'boolean',
      description: 'Whether to render the "items per page" label and select.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'true' } }
    },
    showRange: {
      type: 'boolean',
      description: 'Whether to render the "1 - 10 di 100 Elementi" range summary.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'true' } }
    },
    showPageJumper: {
      type: 'boolean',
      description: 'Whether to render the page jumper select and the page count.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'true' } }
    },
    showPages: {
      type: 'boolean',
      description: 'Whether to render the numbered page buttons in the strip.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'true' } }
    },
    showNav: {
      type: 'boolean',
      description: 'Whether to render the previous/next buttons in the strip.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'true' } }
    },
    pageChange: {
      description: 'Emitted with the page the user picks.',
      action: 'pageChange',
      control: false
    },
    pageSizeChange: {
      description: 'Emitted with the page size the user picks.',
      action: 'pageSizeChange',
      control: false
    }
  },
  render: args => ({
    props: args,
    // `page` and `pageSize` are bound two-way on purpose: one-way bindings would pin the
    // component's models and the bar would emit without ever moving.
    template: `
      <drgn-pagination-complex
        [(page)]="page"
        [(pageSize)]="pageSize"
        ${argsToTemplate(args, { exclude: ['page', 'pageSize'] })}
      />
    `
  })
};

export default meta;

type Story = StoryObj<PaginationComplexStory>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('pagination-range')).toHaveTextContent(
      '1 - 10 di 100 Elementi'
    );

    await userEvent.click(canvas.getByRole('combobox', { name: 'Vai a pagina' }));
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole('option', { name: '4' })
    );

    await expect(args.pageChange).toHaveBeenCalledWith(4);
    // The two-way binding moved the bar to the page the user picked.
    await expect(canvas.getByTestId('pagination-range')).toHaveTextContent(
      '31 - 40 di 100 Elementi'
    );
  }
};

export const PageSizeAndRange: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('combobox', { name: 'Elementi per pagina:' }));
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole('option', { name: '50' })
    );

    await expect(canvas.getByTestId('pagination-range')).toHaveTextContent(
      '1 - 50 di 100 Elementi'
    );
    await expect(canvas.getByTestId('pagination-page-count')).toHaveTextContent('di 2 Pagine');
  }
};

export const RangeAndNav: Story = {
  args: { showPageSize: false, showPageJumper: false }
};

export const WithoutPageSize: Story = {
  args: { showPageSize: false }
};

export const WithoutPageJumper: Story = {
  args: { showPageJumper: false }
};

export const EmptyResultSet: Story = {
  args: { totalItems: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('pagination-range')).toHaveTextContent('0 - 0 di 0 Elementi');
  }
};
