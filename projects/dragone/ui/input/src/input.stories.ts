import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { InputText } from './input-text/input-text';

type InputProps = HTMLInputElement & {
  invalid: boolean;
};

const meta: Meta<InputProps> = {
  title: 'Dragone/UI/Input',
  component: InputText,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'url', 'number'],
      description: 'Tipo di input HTML',
    },
    placeholder: {
      control: 'text',
      description: 'Testo placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Stato disabilitato',
    },
    readOnly: {
      control: 'boolean',
      description: 'Stato readonly',
    },
    required: {
      control: 'boolean',
      description: 'Campo obbligatorio',
    },
    value: {
      control: 'text',
      description: "Valore dell'input",
    },
  },
};

export default meta;
type Story = StoryObj<InputProps>;

export const Default: Story = {
  args: {
    placeholder: 'Inserisci il testo...',
  },
  render: args => ({
    props: args,
    template: `
      <input drgn-input="text" ${argsToTemplate(args)}/>
    `,
  }),
};
