import { Component, input, output, signal, viewChild } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { render } from '@wismaz/vitest-browser-angular';
import { NgpSelect } from 'ng-primitives/select';
import { page } from 'vitest/browser';

import { Select } from './select';

interface TestOption {
  label: string;
  value: string;
}

const setupForm = (
  options: (TestOption | string)[] = [
    { label: 'Opzione A', value: 'a' },
    { label: 'Opzione B', value: 'b' },
  ],
  optionLabel?: string,
  optionValue?: string,
  multiple = false,
  compare = Object.is,
) => {
  @Component({
    imports: [FormField, Select],
    template: `
      <drgn-select
        [formField]="field"
        [options]="options()"
        [optionLabel]="optionLabel()"
        [optionValue]="optionValue()"
        [multiple]="multiple()"
        [compare]="compare()"
      />
    `,
  })
  class FormCmp {
    readonly field = form(signal(''));
    readonly stateDir = viewChild.required(NgpSelect);
    readonly options = signal(options);
    readonly optionLabel = signal(optionLabel);
    readonly optionValue = signal(optionValue);
    readonly multiple = signal(multiple);
    readonly compare = signal(compare);
  }

  return render(FormCmp);
};

@Component({
  imports: [Select],
  template: `
    <drgn-select
      [options]="options()"
      [placeholder]="placeholder()"
      [optionLabel]="optionLabel()"
      [ariaLabel]="ariaLabel()"
      (valueChange)="valueChange.emit($event)"
    />
  `,
})
class TestHostComponent {
  readonly options = input<TestOption[]>([]);
  readonly placeholder = input('');
  readonly optionLabel = input('');
  readonly ariaLabel = input('');
  readonly valueChange = output<unknown>();
}

describe(Select, () => {
  const placeholder = signal('');
  const optionLabel = signal('');
  const options = signal<TestOption[]>([
    { label: 'Opzione A', value: 'a' },
    { label: 'Opzione B', value: 'b' },
    { label: 'Opzione C', value: 'c' },
  ]);
  const ariaLabel = signal('');

  afterEach(() => {
    placeholder.set('');
    optionLabel.set('');
    options.set([
      { label: 'Opzione A', value: 'a' },
      { label: 'Opzione B', value: 'b' },
      { label: 'Opzione C', value: 'c' },
    ]);
    ariaLabel.set('');
  });

  it('should create', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { options, placeholder, optionLabel, ariaLabel },
    });
    await expect.element(locator).toBeTruthy();
  });

  it('should render placeholder when no value is set', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { options, placeholder, optionLabel, ariaLabel },
    });
    placeholder.set('Scegli un valore');
    const placeholderEl = locator.getByTestId('placeholder');
    await expect.element(placeholderEl).toBeInTheDocument();
  });

  it.each(options())('should render mapped label when a value is set', async ({ label }) => {
    const { locator } = await render(TestHostComponent, {
      inputs: { options, placeholder, optionLabel, ariaLabel },
    });
    optionLabel.set('label');
    await locator.getByRole('combobox').click();
    const optionEl = page.getByText(label);
    await expect.element(optionEl).toBeInTheDocument();
  });

  it('should set aria-label when provided', async () => {
    const { locator } = await render(TestHostComponent, {
      inputs: { options, placeholder, optionLabel, ariaLabel },
    });
    const combobox = locator.getByRole('combobox');
    placeholder.set('Scegli un valore');
    await expect.element(combobox).toHaveAttribute('aria-label', 'Scegli un valore');
    ariaLabel.set('Custom aria label');
    await expect.element(combobox).toHaveAttribute('aria-label', 'Custom aria label');
  });

  it('should emit valueChange once per option selection', async () => {
    const valueChangeSpy = vi.fn<(value: unknown) => void>();
    const { locator } = await render(TestHostComponent, {
      inputs: { options, placeholder, optionLabel, ariaLabel },
      outputs: { valueChange: valueChangeSpy },
    });
    optionLabel.set('label');
    await locator.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Opzione A' }).click();

    expect(valueChangeSpy).toHaveBeenNthCalledWith(1, options()[0]);
    expect(valueChangeSpy.mock.calls[1]).toBeUndefined();
  });

  describe('form integration', () => {
    it('should update form field value on simple option select', async () => {
      const { componentClassInstance: component, locator } = await setupForm(['foo', 'bar']);
      expect(component.field().value()).toBe('');

      const select = locator.getByRole('combobox');
      await select.click();
      await page.getByRole('option', { name: 'foo' }).click();

      expect(component.field().value()).toBe('foo');
      expect(component.stateDir().value()).toBe('foo');
    });

    it('should update form field value on object option select', async () => {
      const { componentClassInstance: component, locator } = await setupForm(
        options(),
        'label',
        'value',
      );
      expect(component.field().value()).toBe('');

      const select = locator.getByRole('combobox');
      await select.click();
      await page.getByRole('option', { name: 'Opzione A' }).click();

      expect(component.field().value()).toBe('a');
      expect(component.stateDir().value()).toBe('a');
    });

    it('should map output values for multiple object selection', async () => {
      const { componentClassInstance: component, locator } = await setupForm(
        options(),
        'label',
        'value',
        true,
      );
      expect(component.field().value()).toBe('');

      const select = locator.getByRole('combobox');
      await select.click();

      await page.getByRole('option', { name: 'Opzione A' }).click();
      await page.getByRole('option', { name: 'Opzione B' }).click();

      expect(component.field().value()).toEqual(['a', 'b']);
      expect(component.stateDir().value()).toEqual(['a', 'b']);
    });

    it('should update select value when form field value is set programmatically', async () => {
      expect.hasAssertions();
      const { componentClassInstance: component } = await setupForm(['foo', 'bar']);

      component.field().value.set('bar');

      await vi.waitFor(() => expect(component.stateDir().value()).toBe('bar'));
      expect(component.field().value()).toBe('bar');
    });

    it('should forward a direct [value] binding to NgpSelect', async () => {
      @Component({
        imports: [Select],
        template: `<drgn-select [value]="value()" [options]="options()" />`,
      })
      class ValueCmp {
        readonly value = signal('bar');
        readonly options = signal(['foo', 'bar']);
        readonly stateDir = viewChild.required(NgpSelect);
      }

      const { componentClassInstance: component } = await render(ValueCmp);
      expect(component.stateDir().value()).toBe('bar');
    });

    it('should select option using custom compare function', async () => {
      const compareByValue = (first: TestOption | null, second: TestOption | null): boolean => {
        if (!first || !second) {
          return first === second;
        }
        return first.value === second.value;
      };

      const { componentClassInstance: component, locator } = await setupForm(
        options(),
        'label',
        'value',
        false,
        compareByValue,
      );

      const select = locator.getByRole('combobox');
      await select.click();
      await page.getByRole('option', { name: 'Opzione A' }).click();

      expect(component.field().value()).toBe('a');
      expect(component.stateDir().value()).toBe('a');
    });
  });
});
