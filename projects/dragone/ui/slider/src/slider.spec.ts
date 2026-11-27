import { Component, output, signal, viewChild } from '@angular/core';
import { disabled, form, FormField, hidden, readonly } from '@angular/forms/signals';
import { render } from '@wismaz/vitest-browser-angular';
import { cdp, userEvent, type Locator } from 'vitest/browser';

import { Field } from '@dragone/ui/field';

import { Slider } from './slider';

const pointerDownCenter = (element: Element): void => {
  const rect = element.getBoundingClientRect();
  element.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2
    })
  );
};

// Natively disabled steppers cannot be activated by a user at all, so only click
// the ones a real interaction could reach.
const clickStepperIfEnabled = async (stepper: Locator): Promise<void> => {
  const element = stepper.element();
  if (element instanceof HTMLButtonElement && element.disabled) {
    await expect.element(stepper).toBeDisabled();
    return;
  }
  await stepper.click();
};

const contractElement = (root: Element, selector: string): HTMLElement => {
  const element = root.querySelector<HTMLElement>(selector);
  expect(element, `expected the contract element "${selector}" to be rendered`).not.toBeNull();
  return element as HTMLElement;
};

@Component({
  imports: [Slider],
  template: `
    <drgn-slider
      [value]="value()"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [name]="name()"
      [hidden]="hidden()"
      (valueChange)="valueChange.emit($event); value.set($event)"
      (touch)="touch.emit()"
    />
    <button data-testid="outside">Fuori</button>
  `
})
class SliderHost {
  readonly value = signal(0);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(1);
  readonly name = signal('');
  readonly hidden = signal(false);
  readonly valueChange = output<number>();
  readonly touch = output<void>();
  readonly slider = viewChild.required(Slider);
}

@Component({
  imports: [Field, FormField, Slider],
  template: `
    <drgn-field label="Volume" description="Scegli un valore">
      <drgn-slider [formField]="form.volume" [min]="min()" [max]="max()" />
    </drgn-field>
    <button data-testid="outside">Fuori</button>
  `
})
class FieldFormHost {
  readonly isDisabled = signal(false);
  readonly isReadonly = signal(false);
  readonly isHidden = signal(false);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly form = form(signal({ volume: 0 }), path => {
    disabled(path.volume, { when: () => this.isDisabled() });
    readonly(path.volume, { when: () => this.isReadonly() });
    hidden(path.volume, { when: () => this.isHidden() });
  });
  readonly slider = viewChild.required(Slider);
}

describe(Slider, () => {
  describe('default render', () => {
    it('renders the track, the range and the thumb with the contract defaults', async () => {
      const { locator } = await render(Slider);

      await expect.element(locator.getByTestId('slider-track')).toBeInTheDocument();
      await expect.element(locator.getByTestId('slider-range')).toBeInTheDocument();

      const thumb = locator.getByRole('slider');
      await expect.element(thumb).toHaveAttribute('aria-valuemin', '0');
      await expect.element(thumb).toHaveAttribute('aria-valuemax', '100');
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '0');
      await expect.element(thumb).toHaveAttribute('tabindex', '0');
      await expect.element(thumb).not.toHaveAttribute('aria-disabled');
      await expect.element(thumb).not.toHaveAttribute('aria-required');
    });

    it('renders the min and max labels, the spinbutton and the stepper triggers', async () => {
      const { locator } = await render(Slider);

      await expect.element(locator.getByTestId('slider-min-label')).toHaveTextContent('0');
      await expect.element(locator.getByTestId('slider-max-label')).toHaveTextContent('100');
      const spin = locator.getByRole('spinbutton');
      await expect.element(spin).toHaveValue('0');
      await expect.element(spin).not.toHaveAttribute('aria-required');
      await expect.element(locator.getByTestId('slider-step-up')).toBeInTheDocument();
      await expect.element(locator.getByTestId('slider-step-down')).toBeInTheDocument();
    });
  });

  describe('value / min / max / step synchronization', () => {
    it('applies value, min, max and step to the thumb, the labels, the range and the spinbutton', async () => {
      const { locator, fixture, componentClassInstance: host } = await render(SliderHost);

      host.min.set(10);
      host.max.set(90);
      host.step.set(5);
      host.value.set(30);
      await fixture.whenStable();

      const thumb = locator.getByRole('slider');
      await expect.element(thumb).toHaveAttribute('aria-valuemin', '10');
      await expect.element(thumb).toHaveAttribute('aria-valuemax', '90');
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '30');
      await expect.element(locator.getByTestId('slider-min-label')).toHaveTextContent('10');
      await expect.element(locator.getByTestId('slider-max-label')).toHaveTextContent('90');

      const spin = locator.getByRole('spinbutton');
      await expect.element(spin).toHaveValue('30');
      await expect.element(spin).toHaveAttribute('min', '10');
      await expect.element(spin).toHaveAttribute('max', '90');
      await expect.element(spin).toHaveAttribute('step', '5');
    });

    it('grows the range proportionally to the value within the current bounds', async () => {
      expect.hasAssertions();
      const { locator, fixture, componentClassInstance: host } = await render(SliderHost);

      host.min.set(10);
      host.max.set(90);
      host.value.set(30);
      await fixture.whenStable();

      const track = locator.getByTestId('slider-track');
      const range = locator.getByTestId('slider-range');
      const measure = (): number => {
        const trackRect = track.element().getBoundingClientRect();
        expect(trackRect.width).toBeGreaterThan(0);
        return range.element().getBoundingClientRect().width / trackRect.width;
      };

      const lower = measure();
      expect(lower).toBeGreaterThan(0.15);
      expect(lower).toBeLessThan(0.35);

      host.value.set(70);
      await fixture.whenStable();

      const upper = measure();
      expect(upper).toBeGreaterThan(0.6);
      expect(upper).toBeLessThan(0.9);
      expect(upper).toBeGreaterThan(lower + 0.3);
    });

    it('pushes external value sets into the state without echoing valueChange', async () => {
      const valueChange = vi.fn<(value: number) => void>();
      const {
        locator,
        fixture,
        componentClassInstance: host
      } = await render(SliderHost, {
        outputs: { valueChange }
      });

      host.value.set(50);
      await fixture.whenStable();

      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('propagates slider interactions back into the value model through valueChange', async () => {
      const valueChange = vi.fn<(value: number) => void>();
      const {
        locator,
        fixture,
        componentClassInstance: host
      } = await render(SliderHost, {
        outputs: { valueChange }
      });

      await locator.getByTestId('slider-step-up').click();
      await fixture.whenStable();

      expect(host.value()).toBe(1);
      expect(valueChange).toHaveBeenCalledWith(1);
    });
  });

  describe('thumb keyboard navigation', () => {
    it('moves the value with the arrow keys by one step in each direction', async () => {
      const valueChange = vi.fn<(value: number) => void>();
      const {
        locator,
        fixture,
        componentClassInstance: host
      } = await render(SliderHost, {
        outputs: { valueChange }
      });
      const thumb = locator.getByRole('slider');
      const spin = locator.getByRole('spinbutton');

      host.slider().focus();
      await expect.element(thumb).toHaveFocus();

      await userEvent.keyboard('{ArrowRight}');
      await fixture.whenStable();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '1');
      await expect.element(spin).toHaveValue('1');
      expect(host.value()).toBe(1);

      await userEvent.keyboard('{ArrowUp}');
      await fixture.whenStable();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '2');
      await expect.element(spin).toHaveValue('2');

      await userEvent.keyboard('{ArrowLeft}');
      await fixture.whenStable();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '1');
      await expect.element(spin).toHaveValue('1');

      await userEvent.keyboard('{ArrowDown}');
      await fixture.whenStable();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '0');
      expect(host.value()).toBe(0);

      expect(valueChange).toHaveBeenCalledWith(1);
    });

    it('honours a custom step, moves ten steps with Shift+Arrow and jumps with Home and End', async () => {
      const valueChange = vi.fn<(value: number) => void>();
      const {
        locator,
        fixture,
        componentClassInstance: host
      } = await render(SliderHost, {
        outputs: { valueChange }
      });
      const thumb = locator.getByRole('slider');
      const spin = locator.getByRole('spinbutton');

      host.step.set(5);
      await fixture.whenStable();
      host.slider().focus();

      await userEvent.keyboard('{ArrowRight}');
      await fixture.whenStable();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '5');
      await expect.element(spin).toHaveValue('5');

      await userEvent.keyboard('{ArrowDown}');
      await fixture.whenStable();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '0');

      await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
      await fixture.whenStable();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '50');
      await expect.element(spin).toHaveValue('50');
      expect(host.value()).toBe(50);

      await userEvent.keyboard('{End}');
      await fixture.whenStable();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '100');
      await expect.element(spin).toHaveValue('100');

      await userEvent.keyboard('{Home}');
      await fixture.whenStable();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '0');
      expect(host.value()).toBe(0);

      expect(valueChange).toHaveBeenCalledWith(50);
      expect(valueChange).toHaveBeenLastCalledWith(0);
    });
  });

  describe('track pointerdown', () => {
    it('sets the proportional value, syncs the spinbutton and focuses the thumb', async () => {
      const { locator, componentClassInstance } = await render(Slider);
      const thumb = locator.getByRole('slider');
      const track = locator.getByTestId('slider-track');
      expect(track.element().getBoundingClientRect().width).toBeGreaterThan(0);

      await track.click();

      await expect.element(thumb).toHaveAttribute('aria-valuenow', '50');
      await expect.element(locator.getByRole('spinbutton')).toHaveValue('50');
      await expect.element(thumb).toHaveFocus();
      expect(componentClassInstance.value()).toBe(50);
    });
  });

  describe('lateral spinbutton input', () => {
    it('updates the value while typing an in-range number', async () => {
      const { locator, componentClassInstance } = await render(Slider);
      const spin = locator.getByRole('spinbutton');

      await spin.fill('42');

      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '42');
      expect(componentClassInstance.value()).toBe(42);
    });

    it('clamps an out-of-range value and normalizes the display when committed', async () => {
      const { locator, componentClassInstance } = await render(Slider);
      const spin = locator.getByRole('spinbutton');

      await spin.fill('500');
      await expect.element(locator.getByRole('slider')).not.toHaveAttribute('aria-valuenow', '500');

      await userEvent.keyboard('{Enter}');

      await expect.element(spin).toHaveValue('100');
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '100');
      expect(componentClassInstance.value()).toBe(100);
    });

    it('snaps an unstepped value to the step when committed', async () => {
      const { locator, componentClassInstance } = await render(Slider, { inputs: { step: 5 } });
      const thumb = locator.getByRole('slider');
      const spin = locator.getByRole('spinbutton');

      await spin.fill('7');
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '7');

      await userEvent.keyboard('{Enter}');
      await expect.element(spin).not.toHaveValue('7');

      const display = (spin.element() as HTMLInputElement).value;
      expect(Number(display) % 5).toBe(0);
      await expect.element(thumb).toHaveAttribute('aria-valuenow', display);
      expect(componentClassInstance.value()).toBe(Number(display));
    });

    it('restores the current slider value when the input is emptied and committed', async () => {
      const { locator, componentClassInstance } = await render(Slider, { inputs: { value: 50 } });
      const thumb = locator.getByRole('slider');
      const spin = locator.getByRole('spinbutton');
      await expect.element(spin).toHaveValue('50');

      await spin.fill('');
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '50');

      await userEvent.keyboard('{Tab}');

      await expect.element(spin).toHaveValue('50');
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '50');
      expect(componentClassInstance.value()).toBe(50);
    });
  });

  describe('stepper icon triggers', () => {
    it('exposes both steppers as buttons with accessible names', async () => {
      const { locator } = await render(Slider);

      const stepUp = locator.getByRole('button', { name: 'Aumenta' });
      const stepDown = locator.getByRole('button', { name: 'Riduci' });
      await expect.element(stepUp).toBeInTheDocument();
      await expect.element(stepDown).toBeInTheDocument();

      await stepUp.click();
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '1');
      await stepDown.click();
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
    });

    it('increments and decrements the value by step', async () => {
      const { locator, componentClassInstance } = await render(Slider, { inputs: { step: 5 } });
      const thumb = locator.getByRole('slider');
      const spin = locator.getByRole('spinbutton');

      await locator.getByTestId('slider-step-up').click();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '5');
      await expect.element(spin).toHaveValue('5');
      expect(componentClassInstance.value()).toBe(5);

      await locator.getByTestId('slider-step-down').click();
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '0');
      await expect.element(spin).toHaveValue('0');
      expect(componentClassInstance.value()).toBe(0);
    });

    it('keeps the value at max when incrementing beyond it', async () => {
      const { locator, componentClassInstance } = await render(Slider, { inputs: { value: 100 } });
      const thumb = locator.getByRole('slider');

      await locator.getByTestId('slider-step-up').click();

      await expect.element(thumb).toHaveAttribute('aria-valuenow', '100');
      expect(componentClassInstance.value()).toBe(100);
    });

    it('keeps the value at min when decrementing below it', async () => {
      const { locator, componentClassInstance } = await render(Slider);
      const thumb = locator.getByRole('slider');

      await locator.getByTestId('slider-step-down').click();

      await expect.element(thumb).toHaveAttribute('aria-valuenow', '0');
      expect(componentClassInstance.value()).toBe(0);
    });

    it('keeps the spinbutton focused when a stepper is pressed', async () => {
      const { locator } = await render(Slider);
      const spin = locator.getByRole('spinbutton');

      await spin.click();
      await expect.element(spin).toHaveFocus();

      await locator.getByTestId('slider-step-up').click();

      await expect.element(spin).toHaveFocus();
      await expect.element(spin).toHaveValue('1');
    });
  });

  describe('disabled state', () => {
    it('marks the host and the thumb disabled and disables the spinbutton', async () => {
      const { locator } = await render(Slider, { inputs: { disabled: true } });

      await expect.element(locator).toHaveAttribute('data-disabled');

      const thumb = locator.getByRole('slider');
      await expect.element(thumb).toHaveAttribute('data-disabled');
      await expect.element(thumb).toHaveAttribute('aria-disabled', 'true');
      await expect.element(thumb).toHaveAttribute('tabindex', '-1');
      await expect.element(locator.getByRole('spinbutton')).toBeDisabled();
    });

    it('ignores keyboard, pointer and stepper interactions when disabled', async () => {
      const { locator, componentClassInstance } = await render(Slider, {
        inputs: { disabled: true, value: 20 }
      });
      const thumb = locator.getByRole('slider');
      const spin = locator.getByRole('spinbutton');
      const track = locator.getByTestId('slider-track');

      thumb
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      pointerDownCenter(track.element());
      await clickStepperIfEnabled(locator.getByTestId('slider-step-up'));

      await expect.element(thumb).toHaveAttribute('aria-valuenow', '20');
      await expect.element(spin).toHaveValue('20');
      expect(componentClassInstance.value()).toBe(20);
    });

    it('disables the slider through Signal Forms', async () => {
      const { locator, fixture, componentClassInstance: host } = await render(FieldFormHost);
      const thumb = locator.getByRole('slider');
      const sliderHost = thumb.element().closest('drgn-slider') as HTMLElement | null;
      expect(sliderHost).not.toBeNull();

      host.isDisabled.set(true);
      await fixture.whenStable();

      expect(sliderHost?.hasAttribute('data-disabled')).toBeTruthy();
      await expect.element(thumb).toHaveAttribute('data-disabled');
      await expect.element(thumb).toHaveAttribute('tabindex', '-1');
      await expect.element(locator.getByRole('spinbutton')).toBeDisabled();
    });
  });

  describe('readonly state', () => {
    it('marks the host and the thumb read-only and makes the spinbutton read-only', async () => {
      const { locator } = await render(Slider, { inputs: { readonly: true } });

      await expect.element(locator).toHaveAttribute('data-readonly');

      const thumb = locator.getByRole('slider');
      await expect.element(thumb).toHaveAttribute('aria-readonly', 'true');
      await expect.element(thumb).toHaveAttribute('tabindex', '0');
      await expect.element(locator.getByRole('spinbutton')).toHaveAttribute('readonly');
    });

    it('ignores keyboard, pointer and stepper interactions when readonly', async () => {
      const { locator, componentClassInstance } = await render(Slider, {
        inputs: { readonly: true, value: 20 }
      });
      const thumb = locator.getByRole('slider');
      const spin = locator.getByRole('spinbutton');
      const track = locator.getByTestId('slider-track');

      componentClassInstance.focus();
      await expect.element(thumb).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');

      pointerDownCenter(track.element());
      await clickStepperIfEnabled(locator.getByTestId('slider-step-up'));

      await expect.element(thumb).toHaveAttribute('aria-valuenow', '20');
      await expect.element(spin).toHaveValue('20');
      expect(componentClassInstance.value()).toBe(20);
    });

    it('marks the slider read-only through Signal Forms', async () => {
      const { locator, fixture, componentClassInstance: host } = await render(FieldFormHost);
      const thumb = locator.getByRole('slider');
      const sliderHost = thumb.element().closest('drgn-slider') as HTMLElement | null;
      expect(sliderHost).not.toBeNull();

      host.isReadonly.set(true);
      await fixture.whenStable();

      expect(sliderHost?.hasAttribute('data-readonly')).toBeTruthy();
      await expect.element(thumb).toHaveAttribute('aria-readonly', 'true');
      await expect.element(locator.getByRole('spinbutton')).toHaveAttribute('readonly');
    });
  });

  describe('host bindings', () => {
    it('marks the host tabindex="-1" and delegates focus to the thumb', async () => {
      const { locator } = await render(Slider);

      await expect.element(locator).toHaveAttribute('tabindex', '-1');
      await expect.element(locator.getByRole('slider')).toHaveAttribute('tabindex', '0');
    });

    it('reflects the name input on the host and the spinbutton and omits it when empty', async () => {
      const { locator, fixture, componentClassInstance: host } = await render(SliderHost);
      const thumb = locator.getByRole('slider');
      const sliderHost = thumb.element().closest('drgn-slider') as HTMLElement | null;
      expect(sliderHost).not.toBeNull();

      expect(sliderHost?.hasAttribute('name')).toBeFalsy();
      await expect.element(locator.getByRole('spinbutton')).not.toHaveAttribute('name');

      host.name.set('volume');
      await fixture.whenStable();

      expect(sliderHost?.getAttribute('name')).toBe('volume');
      await expect.element(locator.getByRole('spinbutton')).toHaveAttribute('name', 'volume');
    });

    it('hides the host when the hidden input is set', async () => {
      const { locator, fixture, componentClassInstance: host } = await render(SliderHost);
      const thumb = locator.getByRole('slider');
      const sliderHost = thumb.element().closest('drgn-slider') as HTMLElement | null;
      expect(sliderHost).not.toBeNull();

      expect(sliderHost?.hasAttribute('hidden')).toBeFalsy();

      host.hidden.set(true);
      await fixture.whenStable();

      expect(sliderHost?.hasAttribute('hidden')).toBeTruthy();
    });
  });

  describe('focus & touch lifecycle', () => {
    it('focuses the thumb through focus()', async () => {
      const { locator, componentClassInstance } = await render(Slider);

      componentClassInstance.focus();

      await expect.element(locator.getByRole('slider')).toHaveFocus();
    });

    it('delegates the host nativeElement focus to the thumb', async () => {
      const { fixture, locator } = await render(Slider);

      (fixture.nativeElement as HTMLElement).focus();

      await expect.element(locator.getByRole('slider')).toHaveFocus();
    });

    it('emits touch only when the focus leaves the slider', async () => {
      const touch = vi.fn<() => void>();
      const { locator, componentClassInstance: host } = await render(SliderHost, {
        outputs: { touch }
      });

      host.slider().focus();
      await expect.element(locator.getByRole('slider')).toHaveFocus();

      await locator.getByRole('spinbutton').click();
      expect(touch).not.toHaveBeenCalled();

      await locator.getByTestId('outside').click();
      expect(touch).toHaveBeenCalledOnce();
    });
  });

  describe('<drgn-field> & Signal Forms integration', () => {
    it('associates the thumb and the spinbutton with the field label and description', async () => {
      const { locator, fixture } = await render(FieldFormHost);
      await fixture.whenStable();

      const thumb = locator.getByRole('slider', { name: /Volume/ });
      const spin = locator.getByRole('spinbutton', { name: /Volume/ });
      await expect.element(thumb).toBeInTheDocument();
      await expect.element(spin).toBeInTheDocument();

      const thumbLabelledBy =
        (thumb.element() as HTMLElement).getAttribute('aria-labelledby') ?? '';
      const spinLabelledBy = (spin.element() as HTMLElement).getAttribute('aria-labelledby') ?? '';
      expect(thumbLabelledBy).not.toBe('');
      expect(spinLabelledBy).not.toBe('');

      const description = locator.getByText('Scegli un valore');
      const descriptionId = (description.element() as HTMLElement).id;
      const thumbDescribedBy =
        (thumb.element() as HTMLElement).getAttribute('aria-describedby') ?? '';
      expect(thumbDescribedBy.split(' ')).toContain(descriptionId);
      const spinDescribedBy =
        (spin.element() as HTMLElement).getAttribute('aria-describedby') ?? '';
      expect(spinDescribedBy.split(' ')).toContain(descriptionId);
    });

    it('uses the ariaLabelledBy input as aria-labelledby for both controls', async () => {
      const { locator } = await render(Slider, {
        inputs: { ariaLabelledBy: 'custom-slider-label' }
      });

      await expect
        .element(locator.getByRole('slider'))
        .toHaveAttribute('aria-labelledby', 'custom-slider-label');
      await expect
        .element(locator.getByRole('spinbutton'))
        .toHaveAttribute('aria-labelledby', 'custom-slider-label');
    });

    it('falls back to the default ariaLabel on the thumb', async () => {
      const { locator } = await render(Slider);

      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-label', 'Valore');
    });

    it('falls back to ariaLabel and inputAriaLabel as accessible names', async () => {
      const { locator } = await render(Slider, {
        inputs: { ariaLabel: 'Valore custom', inputAriaLabel: 'Importo' }
      });

      await expect
        .element(locator.getByRole('slider'))
        .toHaveAttribute('aria-label', 'Valore custom');
      await expect
        .element(locator.getByRole('spinbutton'))
        .toHaveAttribute('aria-label', 'Importo');
    });

    it('marks both controls aria-invalid only when the slider is invalid and touched', async () => {
      const invalid = signal(false);
      const touched = signal(false);
      const { locator, fixture } = await render(Slider, { inputs: { invalid, touched } });
      const thumb = locator.getByRole('slider');
      const spin = locator.getByRole('spinbutton');

      touched.set(true);
      await fixture.whenStable();
      await expect.element(thumb).not.toHaveAttribute('aria-invalid', 'true');
      await expect.element(spin).not.toHaveAttribute('aria-invalid', 'true');

      invalid.set(true);
      await fixture.whenStable();
      await expect.element(locator).toHaveAttribute('data-invalid');
      await expect.element(thumb).toHaveAttribute('aria-invalid', 'true');
      await expect.element(spin).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-required on the spinbutton when required and never on the thumb', async () => {
      const { locator } = await render(Slider, { inputs: { required: true } });

      await expect
        .element(locator.getByRole('spinbutton'))
        .toHaveAttribute('aria-required', 'true');
      await expect.element(locator.getByRole('slider')).not.toHaveAttribute('aria-required');
    });

    it('syncs the value with Signal Forms both ways', async () => {
      const { locator, fixture, componentClassInstance: host } = await render(FieldFormHost);
      expect(host.form.volume().value()).toBe(0);

      host.form.volume().value.set(30);
      await fixture.whenStable();

      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
      await expect.element(locator.getByRole('spinbutton')).toHaveValue('30');

      await locator.getByTestId('slider-step-up').click();
      await fixture.whenStable();

      expect(host.form.volume().value()).toBe(31);
    });

    it('applies min and max to the field-bound slider', async () => {
      const { locator, fixture, componentClassInstance: host } = await render(FieldFormHost);

      host.min.set(10);
      host.max.set(90);
      await fixture.whenStable();

      const thumb = locator.getByRole('slider');
      await expect.element(thumb).toHaveAttribute('aria-valuemin', '10');
      await expect.element(thumb).toHaveAttribute('aria-valuemax', '90');
      await expect.element(locator.getByTestId('slider-min-label')).toHaveTextContent('10');
      await expect.element(locator.getByTestId('slider-max-label')).toHaveTextContent('90');
    });

    it('hides the slider through Signal Forms', async () => {
      const { locator, fixture, componentClassInstance: host } = await render(FieldFormHost);
      const thumb = locator.getByRole('slider');
      const sliderHost = thumb.element().closest('drgn-slider') as HTMLElement | null;
      expect(sliderHost).not.toBeNull();

      host.isHidden.set(true);
      await fixture.whenStable();

      expect(sliderHost?.hasAttribute('hidden')).toBeTruthy();
    });

    it('marks the field touched when the focus leaves the slider', async () => {
      const { locator, componentClassInstance: host } = await render(FieldFormHost);
      expect(host.form.volume().touched()).toBeFalsy();

      host.slider().focus();
      await locator.getByTestId('outside').click();

      expect(host.form.volume().touched()).toBeTruthy();
    });
  });

  describe('seam 1 — overlaid split sort icons', () => {
    const selectors = ['.slider-sort-icon-up', '.slider-sort-icon-down'] as const;

    const resolvedTokenColor = (scope: Element, token: string): string => {
      const probe = document.createElement('span');
      probe.style.setProperty('color', `var(${token})`);
      scope.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };

    const resolvedTokenTransition = (scope: Element): { duration: string; timing: string } => {
      const probe = document.createElement('span');
      probe.style.setProperty(
        'transition',
        'transform var(--drgn-motion-duration-short) var(--drgn-motion-easing-standard)'
      );
      scope.append(probe);
      const style = getComputedStyle(probe);
      const resolved = {
        duration: style.transitionDuration,
        timing: style.transitionTimingFunction
      };
      probe.remove();
      return resolved;
    };

    it('sizes the .slider-steppers box as a relative 16x16px container with flex 0 0 16px', async () => {
      const { locator } = await render(Slider);
      const style = getComputedStyle(contractElement(locator.element(), '.slider-steppers'));

      expect(style.position).toBe('relative');
      expect(style.inlineSize).toBe('16px');
      expect(style.blockSize).toBe('16px');
      expect(style.flexGrow).toBe('0');
      expect(style.flexShrink).toBe('0');
      expect(style.flexBasis).toBe('16px');
    });

    it('renders exactly the two overlaid sort icons with the contract markup', async () => {
      const { locator } = await render(Slider);
      const steppers = contractElement(locator.element(), '.slider-steppers');

      expect(steppers.querySelectorAll('ng-icon')).toHaveLength(2);

      const expected: ReadonlyArray<[string, string]> = [
        ['.slider-sort-icon-up', 'faSolidSortUp'],
        ['.slider-sort-icon-down', 'faSolidSortDown']
      ];
      for (const [selector, name] of expected) {
        const icon = contractElement(steppers, selector);
        expect(icon.classList.contains('slider-sort-icon')).toBeTruthy();
        expect(icon.getAttribute('name')).toBe(name);
        expect(icon.getAttribute('size')).toBe('16px');
        expect(icon.getAttribute('aria-hidden')).toBe('true');

        const svg = icon.querySelector('svg');
        expect(svg).not.toBeNull();
        expect(svg?.getAttribute('viewBox')).toBe('0 0 384 512');
      }
    });

    it('absolutely insets both icons with the token color, no pointer events and the token transition', async () => {
      const { locator } = await render(Slider);
      const steppers = contractElement(locator.element(), '.slider-steppers');
      const color = resolvedTokenColor(steppers, '--drgn-slider-input-icon-default');
      const transition = resolvedTokenTransition(steppers);

      for (const selector of selectors) {
        const style = getComputedStyle(contractElement(steppers, selector));

        expect(style.position).toBe('absolute');
        expect(style.top).toBe('0px');
        expect(style.right).toBe('0px');
        expect(style.bottom).toBe('0px');
        expect(style.left).toBe('0px');
        expect(style.pointerEvents).toBe('none');
        expect(style.color).toBe(color);
        expect(style.transitionProperty).toBe('transform');
        expect(style.transitionDuration).toBe(transition.duration);
        expect(style.transitionTimingFunction).toBe(transition.timing);
      }
    });

    it('overlays both icons into the exact 16x16px composite glyph at rest', async () => {
      const { locator } = await render(Slider);
      const steppers = contractElement(locator.element(), '.slider-steppers');
      const box = steppers.getBoundingClientRect();

      expect(box.width).toBe(16);
      expect(box.height).toBe(16);

      for (const selector of selectors) {
        const icon = contractElement(steppers, selector);
        expect(getComputedStyle(icon).transform).toBe('none');

        const rect = icon.getBoundingClientRect();
        expect(rect.left).toBeCloseTo(box.left, 1);
        expect(rect.top).toBeCloseTo(box.top, 1);
        expect(rect.width).toBeCloseTo(box.width, 1);
        expect(rect.height).toBeCloseTo(box.height, 1);
      }
    });
  });

  describe('seam 2 — independent per-button press nudge', () => {
    const pressStepper = async (stepper: Locator): Promise<void> => {
      await userEvent.pointer({ keys: '[MouseLeft>]', target: stepper.element() });
    };

    const releaseStepper = async (stepper: Locator): Promise<void> => {
      await userEvent.pointer({ keys: '[MouseLeft]', target: stepper.element() });
    };

    const settleStyleRecalc = async (): Promise<void> => {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 50);
      });
    };

    const expectPressPointOnStepper = (stepper: Locator): void => {
      const element = stepper.element();
      element.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = element.getBoundingClientRect();
      expect(
        document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
      ).toBe(element);
    };

    // A natively disabled stepper never fires pointer events, so the held-pointer release never
    // settles; the suite also runs inside an iframe, which CDP input addresses in top-frame pixels.
    const pressStepperThroughCdp = async (stepper: Locator): Promise<() => Promise<void>> => {
      const element = stepper.element();
      element.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = element.getBoundingClientRect();
      const localX = rect.left + rect.width / 2;
      const localY = rect.top + rect.height / 2;
      expect(document.elementFromPoint(localX, localY)).toBe(element);

      let pageX = localX;
      let pageY = localY;
      let win: Window = globalThis.window;
      while (win !== win.top) {
        const frame = win.frameElement;
        if (!frame) break;
        const frameRect = frame.getBoundingClientRect();
        pageX += frameRect.left;
        pageY += frameRect.top;
        win = win.top as Window;
      }

      // oxlint-disable id-length
      const session = cdp();
      await session.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: pageX,
        y: pageY
      });
      await session.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: pageX,
        y: pageY,
        button: 'left',
        clickCount: 1
      });
      return async () => {
        await session.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased',
          x: pageX,
          y: pageY,
          button: 'left',
          clickCount: 1
        });
      };
      // oxlint-enable id-length
    };

    const nudgeTransforms = (root: Element): [string, string] => {
      const steppers = contractElement(root, '.slider-steppers');
      const up = contractElement(steppers, '.slider-sort-icon-up');
      const down = contractElement(steppers, '.slider-sort-icon-down');
      return [getComputedStyle(up).transform, getComputedStyle(down).transform];
    };

    it('nudges only the up icon -2px while step-up is held and settles both on release', async () => {
      expect.hasAssertions();
      const { locator } = await render(Slider, { inputs: { value: 50 } });
      const host = locator.element();
      const stepUp = locator.getByTestId('slider-step-up');
      expect(nudgeTransforms(host)).toEqual(['none', 'none']);

      await pressStepper(stepUp);
      await vi.waitFor(() => {
        expect(nudgeTransforms(host)).toEqual(['matrix(1, 0, 0, 1, 0, -2)', 'none']);
      });

      await releaseStepper(stepUp);
      await vi.waitFor(() => {
        expect(nudgeTransforms(host)).toEqual(['none', 'none']);
      });
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '51');
    });

    it('nudges only the down icon +2px while step-down is held and settles both on release', async () => {
      expect.hasAssertions();
      const { locator } = await render(Slider, { inputs: { value: 50 } });
      const host = locator.element();
      const stepDown = locator.getByTestId('slider-step-down');
      expect(nudgeTransforms(host)).toEqual(['none', 'none']);

      await pressStepper(stepDown);
      await vi.waitFor(() => {
        expect(nudgeTransforms(host)).toEqual(['none', 'matrix(1, 0, 0, 1, 0, 2)']);
      });

      await releaseStepper(stepDown);
      await vi.waitFor(() => {
        expect(nudgeTransforms(host)).toEqual(['none', 'none']);
      });
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '49');
    });

    it('does not nudge either icon when the slider is disabled', async () => {
      const { locator } = await render(Slider, { inputs: { disabled: true, value: 50 } });
      const host = locator.element();
      const stepUp = locator.getByTestId('slider-step-up');

      const release = await pressStepperThroughCdp(stepUp);
      await settleStyleRecalc();
      expect(stepUp.element().matches(':active')).toBeTruthy();
      expect(nudgeTransforms(host)).toEqual(['none', 'none']);

      await release();
      await settleStyleRecalc();
      expect(nudgeTransforms(host)).toEqual(['none', 'none']);
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
    });

    it('does not nudge either icon when the slider is read-only', async () => {
      const { locator } = await render(Slider, { inputs: { readonly: true, value: 50 } });
      const host = locator.element();
      const stepUp = locator.getByTestId('slider-step-up');
      expectPressPointOnStepper(stepUp);

      await pressStepper(stepUp);
      await settleStyleRecalc();
      expect(nudgeTransforms(host)).toEqual(['none', 'none']);

      await releaseStepper(stepUp);
      expect(nudgeTransforms(host)).toEqual(['none', 'none']);
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('contract seam 1 — spinbutton ARIA bounds', () => {
    it('mirrors the range bounds onto the spinbutton with the contract defaults', async () => {
      const { locator } = await render(Slider);

      const spin = locator.getByRole('spinbutton');
      await expect.element(spin).toHaveAttribute('aria-valuemin', '0');
      await expect.element(spin).toHaveAttribute('aria-valuemax', '100');
      await expect.element(spin).toHaveAttribute('aria-valuenow', '0');
      await expect.element(spin).toHaveAttribute('aria-valuetext', '0');
      await expect.element(spin).toHaveAttribute('min', '0');
      await expect.element(spin).toHaveAttribute('max', '100');
      await expect.element(spin).toHaveAttribute('step', '1');
    });

    it('keeps the spinbutton bounds in sync with custom min, max, step and value', async () => {
      const { locator } = await render(Slider, {
        inputs: { min: 10, max: 90, step: 5, value: 30 }
      });

      const spin = locator.getByRole('spinbutton');
      await expect.element(spin).toHaveAttribute('aria-valuemin', '10');
      await expect.element(spin).toHaveAttribute('aria-valuemax', '90');
      await expect.element(spin).toHaveAttribute('aria-valuenow', '30');
      await expect.element(spin).toHaveAttribute('aria-valuetext', '30');
      await expect.element(spin).toHaveAttribute('min', '10');
      await expect.element(spin).toHaveAttribute('max', '90');
      await expect.element(spin).toHaveAttribute('step', '5');
      await expect.element(spin).toHaveValue('30');
    });
  });

  describe('contract seam 2 — spinbutton keyboard stepping', () => {
    const focusSpin = async (spin: Locator): Promise<void> => {
      spin.element().focus();
      await expect.element(spin).toHaveFocus();
    };

    it('steps one step per ArrowUp and ArrowDown', async () => {
      const { locator, componentClassInstance } = await render(Slider);
      const spin = locator.getByRole('spinbutton');
      const thumb = locator.getByRole('slider');
      await focusSpin(spin);

      await userEvent.keyboard('{ArrowUp}');
      await expect.element(spin).toHaveValue('1');
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '1');
      expect(componentClassInstance.value()).toBe(1);

      await userEvent.keyboard('{ArrowDown}');
      await expect.element(spin).toHaveValue('0');
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '0');
      expect(componentClassInstance.value()).toBe(0);
    });

    it('steps ten steps per Shift+Arrow key', async () => {
      const { locator, componentClassInstance } = await render(Slider);
      const spin = locator.getByRole('spinbutton');
      const thumb = locator.getByRole('slider');
      await focusSpin(spin);

      await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
      await expect.element(spin).toHaveValue('10');
      await expect.element(thumb).toHaveAttribute('aria-valuenow', '10');
      expect(componentClassInstance.value()).toBe(10);

      await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
      await expect.element(spin).toHaveValue('0');
      expect(componentClassInstance.value()).toBe(0);
    });

    it('jumps ten steps per PageUp and PageDown', async () => {
      const { locator, componentClassInstance } = await render(Slider);
      const spin = locator.getByRole('spinbutton');
      await focusSpin(spin);

      await userEvent.keyboard('{PageUp}');
      await expect.element(spin).toHaveValue('10');
      expect(componentClassInstance.value()).toBe(10);

      await userEvent.keyboard('{PageDown}');
      await expect.element(spin).toHaveValue('0');
      expect(componentClassInstance.value()).toBe(0);
    });

    it('multiplies every stepping key by a custom step', async () => {
      const { locator, componentClassInstance } = await render(Slider, { inputs: { step: 5 } });
      const spin = locator.getByRole('spinbutton');
      await focusSpin(spin);

      await userEvent.keyboard('{ArrowUp}');
      await expect.element(spin).toHaveValue('5');

      await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
      await expect.element(spin).toHaveValue('55');

      await userEvent.keyboard('{PageDown}');
      await expect.element(spin).toHaveValue('5');
      expect(componentClassInstance.value()).toBe(5);
    });

    it('snaps an off-step typed value onto the step grid when stepping', async () => {
      const { locator, componentClassInstance } = await render(Slider, { inputs: { step: 5 } });
      const spin = locator.getByRole('spinbutton');

      await spin.fill('7');
      await expect.element(spin).toHaveValue('7');
      expect(componentClassInstance.value()).toBe(7);

      await userEvent.keyboard('{ArrowUp}');
      await expect.element(spin).toHaveValue('10');
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '10');
      expect(componentClassInstance.value()).toBe(10);
    });

    it('clamps ArrowUp and PageUp at the upper bound', async () => {
      const { locator, componentClassInstance } = await render(Slider, {
        inputs: { min: 10, max: 90, value: 90 }
      });
      const spin = locator.getByRole('spinbutton');
      await focusSpin(spin);

      await userEvent.keyboard('{ArrowUp}');
      await expect.element(spin).toHaveValue('90');
      expect(componentClassInstance.value()).toBe(90);

      await userEvent.keyboard('{PageUp}');
      await expect.element(spin).toHaveValue('90');
      expect(componentClassInstance.value()).toBe(90);
    });

    it('clamps ArrowDown and PageDown at the lower bound', async () => {
      const { locator, componentClassInstance } = await render(Slider, {
        inputs: { min: 10, max: 90, value: 10 }
      });
      const spin = locator.getByRole('spinbutton');
      await focusSpin(spin);

      await userEvent.keyboard('{ArrowDown}');
      await expect.element(spin).toHaveValue('10');
      expect(componentClassInstance.value()).toBe(10);

      await userEvent.keyboard('{PageDown}');
      await expect.element(spin).toHaveValue('10');
      expect(componentClassInstance.value()).toBe(10);
    });

    it('prevents the default behavior of every stepping key', async () => {
      const { locator } = await render(Slider);
      const spinElement = locator.getByRole('spinbutton').element();

      for (const key of ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        spinElement.dispatchEvent(event);
        expect(event.defaultPrevented, `expected ${key} default behavior to be prevented`).toBe(
          true
        );
      }
    });

    it('continues to commit the typed value with Enter', async () => {
      const { locator, componentClassInstance } = await render(Slider);
      const spin = locator.getByRole('spinbutton');

      await spin.fill('42');
      await userEvent.keyboard('{Enter}');

      await expect.element(spin).toHaveValue('42');
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '42');
      expect(componentClassInstance.value()).toBe(42);
    });

    it('ignores every stepping key when disabled', async () => {
      const { locator, componentClassInstance } = await render(Slider, {
        inputs: { disabled: true, value: 20 }
      });
      const spin = locator.getByRole('spinbutton');
      const spinElement = spin.element();

      for (const key of ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']) {
        spinElement.dispatchEvent(
          new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
        );
      }

      await expect.element(spin).toHaveValue('20');
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '20');
      expect(componentClassInstance.value()).toBe(20);
    });

    it('ignores every stepping key when readonly', async () => {
      const { locator, componentClassInstance } = await render(Slider, {
        inputs: { readonly: true, value: 20 }
      });
      const spin = locator.getByRole('spinbutton');
      await focusSpin(spin);

      await userEvent.keyboard('{ArrowUp}');
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{PageUp}');
      await userEvent.keyboard('{PageDown}');

      await expect.element(spin).toHaveValue('20');
      await expect.element(locator.getByRole('slider')).toHaveAttribute('aria-valuenow', '20');
      expect(componentClassInstance.value()).toBe(20);
    });
  });
});
