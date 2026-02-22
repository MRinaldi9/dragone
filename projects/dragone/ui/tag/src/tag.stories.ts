import { type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { Tag } from './tag';

type TagStory = Tag & {
  content: string;
};

const meta: Meta<TagStory> = {
  title: 'Dragone/UI/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: {
    content: 'Label Tag',
    statusTag: 'neutral',
  },
  argTypes: {
    statusTag: {
      control: { type: 'select' },
      options: ['alert', 'info', 'success', 'warning', 'neutral'],
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
    statusTag: 'neutral',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [statusTag]="statusTag" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const Info: Story = {
  args: {
    content: 'Info',
    statusTag: 'info',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [statusTag]="statusTag" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const Success: Story = {
  args: {
    content: 'Success',
    statusTag: 'success',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [statusTag]="statusTag" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const Warning: Story = {
  args: {
    content: 'Warning',
    statusTag: 'warning',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [statusTag]="statusTag" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const Alert: Story = {
  args: {
    content: 'Alert',
    statusTag: 'alert',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [statusTag]="statusTag" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const WithAriaLabel: Story = {
  args: {
    content: 'Nuovo',
    statusTag: 'info',
    ariaLabel: 'Contenuto nuovo',
  },
  render: args => ({
    props: args,
    template: `<drgn-tag [statusTag]="statusTag" [ariaLabel]="ariaLabel">{{ content }}</drgn-tag>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <drgn-tag statusTag="neutral">Neutral</drgn-tag>
        <drgn-tag statusTag="info">Info</drgn-tag>
        <drgn-tag statusTag="success">Success</drgn-tag>
        <drgn-tag statusTag="warning">Warning</drgn-tag>
        <drgn-tag statusTag="alert">Alert</drgn-tag>
      </div>
    `,
  }),
};
