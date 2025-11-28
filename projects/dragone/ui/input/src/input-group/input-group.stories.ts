import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@analogjs/storybook-angular';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidMagnifyingGlass,
  faSolidTriangleExclamation,
  faSolidUser,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { InputText } from '../input-text/input-text';
import { InputGroup } from './input-group';

type InputGroupStory = InputText & {
  placeholder: string;
  value: string;
  disabled?: boolean;
  darkMode?: boolean;
};

const meta: Meta<InputGroupStory> = {
  title: 'Dragone/UI/Input Group',
  component: InputGroup,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [InputText, NgIcon, FormsModule],
      providers: [
        provideIcons({
          faSolidMagnifyingGlass,
          faSolidTriangleExclamation,
          faSolidUser,
          faSolidXmark,
        }),
      ],
    }),
  ],
  args: {
    placeholder: 'Enter text...',
    value: '',
  },
  argTypes: {
    placeholder: { control: 'text' },
    value: { control: 'text' },
    validationState: {
      control: { type: 'select' },
      options: ['valid', 'invalid', 'warning', null],
    },
  },
};

export default meta;
type Story = StoryObj<InputGroupStory>;

export const WithLeadingIcon: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-input-group >
        <ng-icon slot="leading" name="faSolidUser" />
        <input drgn-input-text ${argsToTemplate(args, { exclude: ['darkMode'] })} />
      </drgn-input-group>
    `,
  }),
};

export const WithTrailingIcon: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-input-group>
        <input drgn-input-text ${argsToTemplate(args, { exclude: ['darkMode'] })} />
        <ng-icon slot="trailing" name="faSolidMagnifyingGlass" />
      </drgn-input-group>
    `,
  }),
};

export const WithBothIcons: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-input-group>
        <ng-icon slot="leading" name="faSolidUser" />
        <input drgn-input-text ${argsToTemplate(args, { exclude: ['darkMode'] })} />
        <ng-icon slot="trailing" name="faSolidXmark" />
      </drgn-input-group>
    `,
  }),
};

export const ErrorState: Story = {
  args: {
    validationState: 'invalid',
    placeholder: 'Invalid input',
  },
  render: args => ({
    props: args,
    template: `
      <drgn-input-group>
        <input drgn-input-text ${argsToTemplate(args, { exclude: ['darkMode'] })} />
        <ng-icon slot="trailing" name="faSolidTriangleExclamation" />
      </drgn-input-group>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
  render: args => ({
    props: args,
    template: `
      <drgn-input-group>
        <ng-icon slot="leading" name="faSolidUser" />
        <input drgn-input-text ${argsToTemplate(args, { exclude: ['darkMode'] })} />
      </drgn-input-group>
    `,
  }),
};
