import { Directive, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Field } from '@dragone/ui/field';

import { Slider } from './slider';

@Directive({
  selector: '[drgnSliderStoryForm]',
  exportAs: 'sliderForm'
})
class SliderStoryForm {
  readonly volume = form(signal({ volume: 0 })).volume;
}

type SliderStory = Slider & {
  darkMode: boolean;
};

const meta: Meta<SliderStory> = {
  title: 'Dragone/UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Current value of the slider.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' } }
    },
    min: {
      control: { type: 'number' },
      description: 'Lower bound of the slider range.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' } }
    },
    max: {
      control: { type: 'number' },
      description: 'Upper bound of the slider range.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '100' } }
    },
    step: {
      control: { type: 'number' },
      description: 'Increment applied by every interaction.',
      table: { type: { summary: 'number' }, defaultValue: { summary: '1' } }
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every interaction and marks the host data-disabled.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } }
    },
    readonly: {
      control: 'boolean',
      description: 'Blocks value changes while keeping the thumb focusable.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } }
    },
    hidden: {
      control: 'boolean',
      description: 'Hides the slider when set to true.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } }
    },
    invalid: {
      control: 'boolean',
      description: 'Marks the slider invalid; combined with touched it sets aria-invalid.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } }
    },
    touched: {
      control: 'boolean',
      description: 'Whether the slider has been touched.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } }
    },
    required: {
      control: 'boolean',
      description: 'Whether the value is required.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } }
    },
    name: {
      control: 'text',
      description: 'Form control name rendered on the host.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "''" } }
    },
    ariaLabel: {
      control: 'text',
      description: 'Fallback accessible name of the thumb when no field label is present.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Valore'" } }
    },
    ariaLabelledBy: {
      control: 'text',
      description: 'Explicit id (or id list) labelling both the thumb and the spinbutton.',
      table: { type: { summary: 'string | undefined' }, defaultValue: { summary: 'undefined' } }
    },
    inputAriaLabel: {
      control: 'text',
      description: 'Fallback accessible name of the lateral spinbutton.',
      table: { type: { summary: 'string | undefined' }, defaultValue: { summary: 'undefined' } }
    },
    valueChange: {
      description: 'Emitted when the value changes through an interaction.',
      action: 'valueChange',
      control: false
    },
    touch: {
      description: 'Emitted when the focus leaves the slider.',
      action: 'touch',
      control: false
    }
  },
  args: {
    value: 0,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    readonly: false,
    hidden: false,
    invalid: false,
    touched: false,
    required: false,
    name: '',
    ariaLabel: 'Valore',
    valueChange: fn(),
    touch: fn()
  },
  decorators: [moduleMetadata({ imports: [Slider, Field, FormField, SliderStoryForm] })],
  render: args => ({
    props: args,
    template: `<drgn-slider ${argsToTemplate(args, { exclude: ['darkMode'] })} />`
  })
};

export default meta;
type Story = StoryObj<SliderStory>;

/** Slider con i valori predefiniti del contratto: track, range, thumb, label e spinbutton laterale. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('slider-track')).toBeInTheDocument();
    await expect(canvas.getByTestId('slider-range')).toBeInTheDocument();

    const thumb = canvas.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-valuemin', '0');
    await expect(thumb).toHaveAttribute('aria-valuemax', '100');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
    await expect(thumb).toHaveAttribute('tabindex', '0');

    await expect(canvas.getByTestId('slider-min-label')).toHaveTextContent(/^\s*0\s*$/);
    await expect(canvas.getByTestId('slider-max-label')).toHaveTextContent(/^\s*100\s*$/);
    await expect(canvas.getByRole('spinbutton')).toHaveValue('0');
    await expect(canvas.getByTestId('slider-step-up')).toBeInTheDocument();
    await expect(canvas.getByTestId('slider-step-down')).toBeInTheDocument();
  }
};

/** Slider posizionato a metà range: thumb, spinbutton e range riflettono il valore 50. */
export const WithValue: Story = {
  args: { value: 50 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
    await expect(canvas.getByRole('spinbutton')).toHaveValue('50');
    await expect(canvas.getByTestId('slider-range')).toBeInTheDocument();
  }
};

/** Navigazione da tastiera sul thumb: frecce, Shift+frecce, Home e End. */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('slider');
    const spin = canvas.getByRole('spinbutton');

    thumb.focus();
    await expect(thumb).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '1');
    await expect(spin).toHaveValue('1');

    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '11');

    await userEvent.keyboard('{End}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');

    await userEvent.keyboard('{Home}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
    await expect(spin).toHaveValue('0');
  }
};

/** Click al centro del track: valore proporzionale 50 e focus spostato sul thumb. */
export const TrackPointer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const track = canvas.getByTestId('slider-track');
    const thumb = canvas.getByRole('slider');

    await userEvent.click(track);

    await expect(thumb).toHaveAttribute('aria-valuenow', '50');
    await expect(canvas.getByRole('spinbutton')).toHaveValue('50');
    await expect(thumb).toHaveFocus();
  }
};

/**
 * Spinbutton laterale: digitare un valore in range lo applica, un valore fuori range viene
 * clampato.
 */
export const SpinbuttonInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spin = canvas.getByRole('spinbutton');
    const thumb = canvas.getByRole('slider');

    await userEvent.clear(spin);
    await userEvent.type(spin, '42');
    await expect(thumb).toHaveAttribute('aria-valuenow', '42');

    await userEvent.clear(spin);
    await userEvent.type(spin, '500');
    await userEvent.keyboard('{Enter}');
    await expect(spin).toHaveValue('100');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');
  }
};

/** Trigger stepper: incrementano e decrementano il valore di uno step. */
export const Steppers: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('slider');
    const spin = canvas.getByRole('spinbutton');

    await userEvent.click(canvas.getByTestId('slider-step-up'));
    await expect(thumb).toHaveAttribute('aria-valuenow', '1');
    await expect(spin).toHaveValue('1');

    await userEvent.click(canvas.getByTestId('slider-step-down'));
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
    await expect(spin).toHaveValue('0');
  }
};

/** Icona sort divisa: `faSolidSortUp` e `faSolidSortDown` si sovrappongono nel glifo 16x16. */
export const SplitSortIcons: Story = {
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('drgn-slider');
    expect(host).not.toBeNull();
    const steppers = host?.querySelector('.slider-steppers');
    expect(steppers).not.toBeNull();

    const steppersStyle = getComputedStyle(steppers as Element);
    expect(steppersStyle.position).toBe('relative');
    expect(steppersStyle.inlineSize).toBe('16px');
    expect(steppersStyle.blockSize).toBe('16px');
    expect(steppersStyle.flex).toBe('0 0 16px');
    expect((steppers as Element).querySelectorAll('ng-icon')).toHaveLength(2);

    const icons = [
      [(steppers as Element).querySelector('.slider-sort-icon-up'), 'faSolidSortUp'],
      [(steppers as Element).querySelector('.slider-sort-icon-down'), 'faSolidSortDown']
    ] as const;

    for (const [icon, name] of icons) {
      expect(icon).not.toBeNull();
      const element = icon as Element;
      expect(element.classList.contains('slider-sort-icon')).toBe(true);
      expect(element.getAttribute('name')).toBe(name);
      expect(element.getAttribute('size')).toBe('16px');
      expect(element.getAttribute('aria-hidden')).toBe('true');
      expect(element.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 384 512');

      const style = getComputedStyle(element);
      expect(style.position).toBe('absolute');
      expect(style.pointerEvents).toBe('none');
      expect(style.transitionProperty).toBe('transform');
      expect(style.transform).toBe('none');
    }

    const box = (steppers as Element).getBoundingClientRect();
    expect(box.width).toBe(16);
    expect(box.height).toBe(16);
    for (const [icon] of icons) {
      const rect = (icon as Element).getBoundingClientRect();
      expect(rect.left).toBeCloseTo(box.left, 1);
      expect(rect.top).toBeCloseTo(box.top, 1);
      expect(rect.width).toBeCloseTo(box.width, 1);
      expect(rect.height).toBeCloseTo(box.height, 1);
    }

    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('slider-step-up')).toBeInTheDocument();
    await expect(canvas.getByTestId('slider-step-down')).toBeInTheDocument();
  }
};

/**
 * Pressione a tenuta sugli stepper: ogni tasto scosta solo il proprio glifo (-2px / +2px) e al
 * rilascio entrambi tornano a posto.
 */
export const StepperPressNudge: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector('drgn-slider');
    expect(host).not.toBeNull();
    const steppers = host?.querySelector('.slider-steppers');
    expect(steppers).not.toBeNull();
    const up = steppers?.querySelector('.slider-sort-icon-up');
    const down = steppers?.querySelector('.slider-sort-icon-down');
    expect(up).not.toBeNull();
    expect(down).not.toBeNull();

    const settleTransition = async (): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 250));
    };

    const transforms = (): [string, string] => [
      getComputedStyle(up as Element).transform,
      getComputedStyle(down as Element).transform
    ];

    expect(getComputedStyle(up as Element).transitionProperty).toBe('transform');
    expect(transforms()).toEqual(['none', 'none']);

    const stepUp = canvas.getByTestId('slider-step-up');
    await userEvent.pointer({ keys: '[MouseLeft>]', target: stepUp });
    await settleTransition();
    expect(transforms()).toEqual(['matrix(1, 0, 0, 1, 0, -2)', 'none']);

    await userEvent.pointer({ keys: '[MouseLeft]', target: stepUp });
    await settleTransition();
    expect(transforms()).toEqual(['none', 'none']);

    const stepDown = canvas.getByTestId('slider-step-down');
    await userEvent.pointer({ keys: '[MouseLeft>]', target: stepDown });
    await settleTransition();
    expect(transforms()).toEqual(['none', 'matrix(1, 0, 0, 1, 0, 2)']);

    await userEvent.pointer({ keys: '[MouseLeft]', target: stepDown });
    await settleTransition();
    expect(transforms()).toEqual(['none', 'none']);
  }
};

/**
 * Slider disabilitato: host data-disabled, thumb non tabbabile, spinbutton disabilitato, nessuna
 * modifica.
 */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector('drgn-slider');

    expect(host).not.toBeNull();
    await expect(host).toHaveAttribute('data-disabled');

    const thumb = canvas.getByRole('slider');
    await expect(thumb).toHaveAttribute('data-disabled');
    await expect(thumb).toHaveAttribute('tabindex', '-1');
    await expect(canvas.getByRole('spinbutton')).toBeDisabled();

    thumb.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
  }
};

/** Slider in sola lettura: thumb ancora focusabile ma le interazioni non cambiano il valore. */
export const Readonly: Story = {
  args: { readonly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector('drgn-slider');

    expect(host).not.toBeNull();
    await expect(host).toHaveAttribute('data-readonly');

    const thumb = canvas.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-readonly', 'true');
    await expect(thumb).toHaveAttribute('tabindex', '0');
    await expect(canvas.getByRole('spinbutton')).toHaveAttribute('readonly');

    thumb.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
  }
};

/** Ciclo di focus e touch: il touch viene emesso solo quando il focus esce dallo slider. */
export const FocusAndTouch: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-slider ${argsToTemplate(args, { exclude: ['darkMode'] })}></drgn-slider>
      <button data-testid="outside">Fuori</button>
    `
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector('drgn-slider');
    const thumb = canvas.getByRole('slider');

    expect(host).not.toBeNull();
    host?.focus();
    await expect(thumb).toHaveFocus();

    await userEvent.click(canvas.getByRole('spinbutton'));
    expect(args.touch).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByTestId('outside'));
    expect(args.touch).toHaveBeenCalledTimes(1);
  }
};

/**
 * Slider dentro un drgn-field: label e descrizione guidano i nomi accessibili e il valore
 * sincronizzato col form.
 */
export const WithField: Story = {
  render: args => ({
    props: args,
    template: `
      <drgn-field
        #sliderForm="sliderForm"
        drgnSliderStoryForm
        label="Volume"
        description="Scegli un valore"
      >
        <drgn-slider
          ${argsToTemplate(args, { exclude: ['darkMode', 'value'] })}
          [formField]="sliderForm.volume"
        />
      </drgn-field>
      <span data-testid="form-value">{{ sliderForm.volume().value() }}</span>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('slider', { name: /Volume/ });
    const spin = canvas.getByRole('spinbutton', { name: /Volume/ });

    await expect(thumb).toBeInTheDocument();
    await expect(spin).toBeInTheDocument();

    const description = canvas.getByText('Scegli un valore');
    expect((thumb.getAttribute('aria-describedby') ?? '').split(' ')).toContain(description.id);
    expect((spin.getAttribute('aria-describedby') ?? '').split(' ')).toContain(description.id);

    thumb.focus();
    await userEvent.keyboard('{ArrowRight}');

    await expect(thumb).toHaveAttribute('aria-valuenow', '1');
    await expect(canvas.getByTestId('form-value')).toHaveTextContent('1');
  }
};

/** Struttura a due colonne: colonna sinistra con track e label, riquadro numerico 100x48 a destra. */
export const TwoColumnLayout: Story = {
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('drgn-slider');
    expect(host).not.toBeNull();

    const progress = host?.querySelector('.slider-progress');
    expect(progress).not.toBeNull();
    const wrapper = host?.querySelector('.slider-input-wrapper');
    expect(wrapper).not.toBeNull();

    const progressRect = (progress as HTMLElement).getBoundingClientRect();
    const wrapperRect = (wrapper as HTMLElement).getBoundingClientRect();
    expect(progressRect.width).toBeGreaterThanOrEqual(200);
    expect(wrapperRect.width).toBe(100);
    expect(wrapperRect.height).toBe(48);
    expect(progressRect.left).toBeLessThan(wrapperRect.left);

    const thumb = within(canvasElement).getByRole('slider');
    expect((progress as HTMLElement).contains(thumb)).toBe(true);
  }
};

/** Slider non valido e toccato: data-invalid sull'host e aria-invalid su thumb e spinbutton. */
export const InvalidAndTouched: Story = {
  args: { invalid: true, touched: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector('drgn-slider');

    expect(host).not.toBeNull();
    await expect(host).toHaveAttribute('data-invalid');

    await expect(canvas.getByRole('slider')).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
  }
};

/**
 * Stati visivi Sirio: hover del riquadro numerico verso la tinta hover e focus-within verso la
 * tinta focus con doppio anello.
 */
export const VisualStates: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector('drgn-slider');
    expect(host).not.toBeNull();

    const wrapper = host?.querySelector('.slider-input-wrapper');
    expect(wrapper).not.toBeNull();

    const spin = canvas.getByRole('spinbutton');
    await userEvent.hover(spin);
    expect(getComputedStyle(wrapper as Element).borderColor).toBe('rgb(0, 54, 143)');

    (spin as HTMLInputElement).focus();
    expect(getComputedStyle(canvas.getByTestId('slider-range')).backgroundColor).toBe(
      'rgb(0, 101, 209)'
    );
    expect(getComputedStyle(wrapper as Element).boxShadow).toContain('0px 0px 0px 3px');
  }
};

/** Vincoli ARIA dello spinbutton laterale: aria-valuemin e aria-valuemax seguono min e max. */
export const SpinbuttonAriaBounds: Story = {
  args: { value: 30, min: 10, max: 90, step: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spin = canvas.getByRole('spinbutton');

    await expect(spin).toHaveAttribute('aria-valuemin', '10');
    await expect(spin).toHaveAttribute('aria-valuemax', '90');
    await expect(spin).toHaveAttribute('min', '10');
    await expect(spin).toHaveAttribute('max', '90');
    await expect(spin).toHaveAttribute('step', '5');
    await expect(spin).toHaveAttribute('aria-valuenow', '30');
    await expect(spin).toHaveAttribute('aria-valuetext', '30');
    await expect(spin).toHaveValue('30');
  }
};

/** Passaggio da tastiera sullo spinbutton: frecce, Shift+frecce, PageUp e PageDown. */
export const SpinbuttonKeyboardStepping: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spin = canvas.getByRole('spinbutton');
    const thumb = canvas.getByRole('slider');

    spin.focus();
    await expect(spin).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect(spin).toHaveValue('1');
    await expect(thumb).toHaveAttribute('aria-valuenow', '1');

    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await expect(spin).toHaveValue('11');

    await userEvent.keyboard('{PageUp}');
    await expect(spin).toHaveValue('21');

    await userEvent.keyboard('{ArrowDown}');
    await expect(spin).toHaveValue('20');

    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await expect(spin).toHaveValue('10');

    await userEvent.keyboard('{PageDown}');
    await expect(spin).toHaveValue('0');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
  }
};
