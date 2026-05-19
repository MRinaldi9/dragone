import { ChangeDetectionStrategy, Component, input, inputBinding, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { page, userEvent, type Locator } from 'vitest/browser';

import { RadioItem } from '../radio-item/radio-item';
import { RadioGroup } from './radio-group';

@Component({
  imports: [RadioGroup, RadioItem],
  template: `
    <drgn-radio-group orientation="vertical" [disabled]="disabled()">
      <drgn-radio-item value="option1">Opzione 1</drgn-radio-item>
      <drgn-radio-item value="option2">Opzione 2</drgn-radio-item>
      <drgn-radio-item value="option3">Opzione 3</drgn-radio-item>
    </drgn-radio-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RadioGroupTest {
  disabled = input(false);
}

describe(RadioGroup, () => {
  let fixture: ComponentFixture<RadioGroupTest>;
  let locator: Locator;
  const disabled = signal(false);
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [RadioGroupTest],
    });

    fixture = TestBed.createComponent(RadioGroupTest, {
      bindings: [inputBinding('disabled', disabled)],
    });
    await fixture.whenStable();
    locator = page.elementLocator(fixture.nativeElement);
  });

  it('should focus and select the first radio item on keyboard navigation', async () => {
    const radioItems = locator.getByRole('radio').all();
    const firstRadioItem = radioItems.at(0);
    assert(firstRadioItem, 'Expected at least one radio item');
    await userEvent.tab();
    await expect.element(firstRadioItem).toHaveAttribute('aria-checked', 'true');
    await expect.element(firstRadioItem).toHaveFocus();
  });

  it('should focus and select the radio item based on the keyboard navigation', async () => {
    const radioItems = locator.getByRole('radio').all();
    const secondRadioItem = radioItems.at(1);
    assert(secondRadioItem, 'Expected at least two radio items');
    await userEvent.tab();

    await userEvent.keyboard('[ArrowDown]');
    await expect.element(secondRadioItem).toHaveAttribute('aria-checked', 'true');
    await expect.element(secondRadioItem).toHaveFocus();
  });

  it('should not change selection when disabled', async () => {
    disabled.set(true);
    await fixture.whenStable();
    const radioItems = locator.getByRole('radio').all();
    const firstRadioItem = radioItems.at(0);
    assert(firstRadioItem, 'Expected at least one radio item');
    await userEvent.tab();
    await expect.element(firstRadioItem).toHaveAttribute('aria-checked', 'false');
  });
});
