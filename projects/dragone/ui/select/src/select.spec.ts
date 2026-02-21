import { ComponentFixture, TestBed } from '@angular/core/testing';

import { inputBinding, signal } from '@angular/core';
import { Locator, page } from 'vitest/browser';
import { Select } from './select';

type TestOption = {
  label: string;
  value: string;
};

describe('Select', () => {
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
});
