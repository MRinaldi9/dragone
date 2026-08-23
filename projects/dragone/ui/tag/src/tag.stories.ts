import type { Meta, StoryObj } from '@analogjs/storybook-angular';

import type { StatusType } from '@dragone/ui/utils';

import { Tag } from './tag';

type TagStory = Tag & {
  content: string;
  status: StatusType;
};

const meta: Meta<TagStory> = {
  title: 'Dragone/UI/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: {
    content: 'Label Tag',
    status: 'neutral',
  },
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['danger', 'info', 'success', 'warning', 'neutral'],
      description: 'Variante visiva del tag che indica lo stato',
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'Etichetta accessibile personalizzata per screen reader',
    },
    content: {
      control: { type: 'text' },
      description: 'Contenuto testuale del tag (1-2 parole)',
    },
  },
};

export default meta;
type Story = StoryObj<TagStory>;

export const Neutral: Story = {
  args: {
    content: 'Dragone',
    status: 'neutral',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [status]="status" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const Info: Story = {
  args: {
    content: 'Info',
    status: 'info',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [status]="status" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const Success: Story = {
  args: {
    content: 'Success',
    status: 'success',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [status]="status" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const Warning: Story = {
  args: {
    content: 'Warning',
    status: 'warning',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [status]="status" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const Alert: Story = {
  args: {
    content: 'Danger',
    status: 'danger',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [status]="status" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const WithAriaLabel: Story = {
  args: {
    content: 'Nuovo',
    status: 'info',
    ariaLabel: 'Contenuto nuovo',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [status]="status" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <drgn-tag status="neutral">Neutral</drgn-tag>
        <drgn-tag status="info">Info</drgn-tag>
        <drgn-tag status="success">Success</drgn-tag>
        <drgn-tag status="warning">Warning</drgn-tag>
        <drgn-tag status="danger">Danger</drgn-tag>
      </div>
    `,
  }),
};
