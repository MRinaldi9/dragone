import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@analogjs/storybook-angular';
import { RadioGroup } from './radio-group/radio-group';
import { RadioItem } from './radio-item/radio-item';

type RadioProps = {
  darkMode?: boolean;
  value: string;
  disabled: boolean;
  valueChange: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
};

const meta: Meta<RadioProps> = {
  title: 'Dragone/UI/Radio',
  component: RadioGroup,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [RadioItem] })],
  argTypes: {
    value: {
      control: 'inline-radio',
      options: ['option1', 'option2', 'option3'],
      description: 'Valore selezionato del gruppo',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabilita tutti i radio button del gruppo',
    },
    valueChange: {
      type: 'function',
      control: false,
      description: 'Evento emesso quando il valore cambia',
    },
    orientation: {
      type: 'string',
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
  },
};

export default meta;
type Story = StoryObj<RadioProps>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-radio-group ${argsToTemplate(args, { exclude: ['darkMode'] })}>
        <drgn-radio-item value="option1">Opzione 1</drgn-radio-item>
        <drgn-radio-item value="option2">Opzione 2</drgn-radio-item>
        <drgn-radio-item value="option3">Opzione 3</drgn-radio-item>
      </drgn-radio-group>
    `,
  }),
  args: {
    disabled: false,
    orientation: 'vertical',
  },
};

export const Preselected: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-radio-group ${argsToTemplate(args, { exclude: ['darkMode'] })}>
        <drgn-radio-item value="option1">Opzione 1</drgn-radio-item>
        <drgn-radio-item value="option2">Opzione 2</drgn-radio-item>
        <drgn-radio-item value="option3">Opzione 3</drgn-radio-item>
      </drgn-radio-group>
    `,
  }),
  args: {
    value: 'option2',
    disabled: false,
  },
};

export const Disabled: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-radio-group ${argsToTemplate(args, { exclude: ['darkMode'] })}>
        <drgn-radio-item value="option1">Opzione 1</drgn-radio-item>
        <drgn-radio-item value="option2">Opzione 2</drgn-radio-item>
        <drgn-radio-item value="option3">Opzione 3</drgn-radio-item>
      </drgn-radio-group>
    `,
  }),
  args: {
    value: 'option1',
    disabled: true,
  },
};

export const IndividualDisabled: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-radio-group ${argsToTemplate(args, { exclude: ['darkMode'] })}>
        <drgn-radio-item value="option1">Opzione 1</drgn-radio-item>
        <drgn-radio-item value="option2" [disabled]="true">Opzione 2 (disabilitata)</drgn-radio-item>
        <drgn-radio-item value="option3">Opzione 3</drgn-radio-item>
      </drgn-radio-group>
    `,
  }),
  args: {
    value: '',
    disabled: false,
  },
};

export const WithLongLabels: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-radio-group ${argsToTemplate(args, { exclude: ['darkMode'] })}>
        <drgn-radio-item value="option1">
          Questa è un'opzione con un'etichetta molto lunga che potrebbe andare su più righe
        </drgn-radio-item>
        <drgn-radio-item value="option2">
          Un'altra opzione con testo lungo per verificare il comportamento del layout
        </drgn-radio-item>
        <drgn-radio-item value="option3">Opzione breve</drgn-radio-item>
      </drgn-radio-group>
    `,
  }),
  args: {
    value: '',
    disabled: false,
  },
};
