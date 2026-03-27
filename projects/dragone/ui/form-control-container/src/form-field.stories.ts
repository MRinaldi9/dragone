import { argsToTemplate, type Meta, type StoryObj } from '@analogjs/storybook-angular';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { form, FormField as FormSignal, required } from '@angular/forms/signals';

import { Checkbox } from '@dragone/ui/checkbox';

import { FormContainer } from './form-container/form-container';

@Component({
  selector: 'drgn-form-field-story',
  imports: [FormContainer, Checkbox, FormSignal],
  template: `
    <drgn-form-container [label]="label()" [inline]="inline()">
      <drgn-checkbox [formField]="form.checkBox" />
    </drgn-form-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FormFieldStory {
  readonly label = input<string>('Label');
  readonly required = input<boolean>(true);
  readonly inline = input<boolean>(false);
  protected readonly form = form(signal({ checkBox: false }), schema => {
    required(schema.checkBox, { when: () => this.required(), message: 'This field is required' });
  });
}

const meta: Meta<FormFieldStory & { darkMode: boolean }> = {
  title: 'Dragone/UI/FormField',
  component: FormFieldStory,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'The label for the form field.' },
    required: { control: 'boolean', description: 'Whether the form field is required.' },
    inline: {
      control: 'boolean',
      description: 'Whether the label and input are displayed inline.',
    },
  },
  args: {
    label: 'Label',
    required: true,
    inline: true,
  },
};

export default meta;
type Story = StoryObj<FormFieldStory & { darkMode: boolean }>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-form-field-story  ${argsToTemplate(args, { exclude: ['darkMode'] })} />
    `,
  }),
};

// export const WithError: Story = {
//   render: args => ({
//     template: `
//       <drgn-form-field variant="error" [size]="size">
//         <label>Email</label>
//         <input type="email" placeholder="Enter email" />
//         <span error>Invalid email format</span>
//       </drgn-form-field>
//     `,
//     props: args,
//   }),
// };

// export const Required: Story = {
//   render: args => ({
//     template: `
//       <drgn-form-field [required]="true" [size]="size">
//         <label>Name</label>
//         <input type="text" placeholder="Enter name" required />
//         <span hint>Field is required</span>
//       </drgn-form-field>
//     `,
//     props: args,
//   }),
// };

// export const Disabled: Story = {
//   render: args => ({
//     template: `
//       <drgn-form-field [disabled]="true" [size]="size">
//         <label>Disabled Field</label>
//         <input type="text" placeholder="Disabled" disabled />
//       </drgn-form-field>
//     `,
//     props: args,
//   }),
// };
