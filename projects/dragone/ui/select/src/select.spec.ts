import { Component, inputBinding, signal, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { NgpSelect } from 'ng-primitives/select';
import { type Locator, page } from 'vitest/browser';

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
    readonly field = form(signal(null));
    readonly stateDir = viewChild.required(NgpSelect);
    readonly options = signal(options);
    readonly optionLabel = signal(optionLabel);
    readonly optionValue = signal(optionValue);
    readonly multiple = signal(multiple);
    readonly compare = signal(compare);
  }

  const fixture = TestBed.createComponent(FormCmp);
  const component = fixture.componentInstance;
  const locator = page.elementLocator(fixture.nativeElement);

  return { component, locator, whenStable: (): Promise<void> => fixture.whenStable() };
};

describe(Select, () => {
  let component: Select<TestOption>;
  let fixture: ComponentFixture<Select<TestOption>>;
  let componentLocator: Locator;
  const placeholder = signal<string>('');
  const optionLabel = signal<string>('');
  const options = signal<TestOption[]>([
    { label: 'Opzione A', value: 'a' },
    { label: 'Opzione B', value: 'b' },
    { label: 'Opzione C', value: 'c' },
  ]);
  const ariaLabel = signal<string>('');
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select],
    }).compileComponents();

    fixture = TestBed.createComponent(Select<TestOption>, {
      bindings: [
        inputBinding('placeholder', placeholder),
        inputBinding('optionLabel', optionLabel),
        inputBinding('options', options),
        inputBinding('ariaLabel', ariaLabel),
      ],
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
    componentLocator = page.elementLocator(fixture.nativeElement);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render placeholder when no value is set', async () => {
    placeholder.set('Scegli un valore');
    await fixture.whenStable();
    const placeholderEl = componentLocator.getByTestId('placeholder');
    await expect.element(placeholderEl).toBeInTheDocument();
  });

  it.each(options())('should render mapped label when a value is set', async ({ label }) => {
    optionLabel.set('label');
    await fixture.whenStable();
    await componentLocator.click();
    const optionEl = page.getByText(label);
    await expect.element(optionEl).toBeInTheDocument();
  });

  it('should set aria-label when provided', async () => {
    expect(componentLocator.element().ariaLabel).toBe('Scegli un valore');
    ariaLabel.set('Custom aria label');
    await fixture.whenStable();
    expect(componentLocator.element().ariaLabel).toBe('Custom aria label');
  });

  it('should emit valueChange once per option selection', async () => {
    const valueChangeSpy = vi.fn<(value: unknown) => void>();
    component.valueChange.subscribe(valueChangeSpy);

    await componentLocator.click();
    const optionEl = await vi.waitUntil(() => page.getByRole('option', { name: 'Opzione A' }));
    await optionEl.click();
    await fixture.whenStable();

    expect(valueChangeSpy).toHaveBeenNthCalledWith(1, options()[0]);
    expect(valueChangeSpy.mock.calls[1]).toBeUndefined();
  });

  describe('form integration', () => {
    it('should update form field value on simple option select', async () => {
      const { component, locator, whenStable } = setupForm(['foo', 'bar']);
      await whenStable();
      expect(component.field().value()).toBeNull();

      const select = locator.getByRole('combobox');
      await select.click();
      const option = await vi.waitUntil(() => page.getByRole('option', { name: 'foo' }));

      await option.click();
      await whenStable();

      expect(component.field().value()).toBe('foo');
      expect(component.stateDir().value()).toBe('foo');
    });
    it('should update form field value on object option select', async () => {
      const { component, locator, whenStable } = setupForm(options(), 'label', 'value');
      await whenStable();
      expect(component.field().value()).toBeNull();

      const select = locator.getByRole('combobox');
      await select.click();
      const option = await vi.waitUntil(() => page.getByRole('option', { name: 'Opzione A' }));

      await option.click();
      await whenStable();

      expect(component.field().value()).toBe('a');
      expect(component.stateDir().value()).toBe('a');
    });

    it('should map output values for multiple object selection', async () => {
      const { component, locator, whenStable } = setupForm(options(), 'label', 'value', true);
      await whenStable();
      expect(component.field().value()).toBeNull();

      const select = locator.getByRole('combobox');
      await select.click();

      const optionA = await vi.waitUntil(() => page.getByRole('option', { name: 'Opzione A' }));
      await optionA.click();

      const optionB = await vi.waitUntil(() => page.getByRole('option', { name: 'Opzione B' }));
      await optionB.click();
      await whenStable();

      expect(component.field().value()).toEqual(['a', 'b']);
      expect(component.stateDir().value()).toEqual(['a', 'b']);
    });

    it('should select option using custom compare function', async () => {
      const compareByValue = (first: TestOption | null, second: TestOption | null): boolean => {
        if (!first || !second) {
          return first === second;
        }
        return first.value === second.value;
      };

      const { component, locator, whenStable } = setupForm(
        options(),
        'label',
        'value',
        false,
        compareByValue,
      );

      const select = locator.getByRole('combobox');
      await select.click();
      const option = await vi.waitUntil(() => page.getByRole('option', { name: 'Opzione A' }));
      await option.click();
      await whenStable();

      expect(component.field().value()).toBe('a');
      expect(component.stateDir().value()).toBe('a');
    });
  });
});
