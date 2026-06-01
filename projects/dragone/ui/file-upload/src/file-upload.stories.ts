import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { fn } from 'storybook/test';

import { FileUpload } from './file-upload';

type FileUploadStory = FileUpload & { darkMode: boolean };

const meta: Meta<FileUploadStory> = {
  title: 'Dragone/UI/File Upload',
  component: FileUpload,
  tags: ['autodocs'],
  args: {
    name: 'allegati',
    disabled: false,
    multiple: false,
    dragpDrop: true,
    fileTypes: [],
    hidden: false,
    touch: fn(),
  },
  argTypes: {
    name: {
      control: { type: 'text' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    multiple: {
      control: { type: 'boolean' },
    },
    dragpDrop: {
      control: { type: 'boolean' },
    },
    hidden: {
      control: { type: 'boolean' },
      description:
        'Settaggio per nascondere il componente. Se `true`, il componente sarà nascosto ma rimarrà accessibile agli screen reader.',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    fileTypes: {
      control: { type: 'object' },
      description: 'Lista di MIME type o estensioni consentite, ad esempio ["image/*", ".pdf"].',
    },
    touch: {
      action: 'touch',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<FileUploadStory>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="max-width: 520px; width: 100%;">
        <drgn-file-upload ${argsToTemplate(args, { exclude: ['darkMode'] })}/>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: Default.render,
};

export const MultipleFiles: Story = {
  args: {
    multiple: true,
  },
  render: Default.render,
};

export const ImagesOnly: Story = {
  args: {
    fileTypes: ['image/*'],
  },
  render: Default.render,
};

export const PdfOnly: Story = {
  args: {
    fileTypes: ['.pdf'],
  },
  render: Default.render,
};
