import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { render } from '@wismaz/vitest-browser-angular';
import { userEvent } from 'vitest/browser';

import { InputText } from '../input-text/input-text';
import { InputGroup } from './input-group';

@Component({
  imports: [InputGroup, InputText],
  template: `
    <drgn-input-group>
      <input drgnInputText placeholder="Cerca" />
    </drgn-input-group>
  `
})
class TestHostProjectedInput {}

describe(InputGroup, () => {
  let component: InputGroup;
  let fixture: ComponentFixture<InputGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputGroup]
    }).compileComponents();

    fixture = TestBed.createComponent(InputGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Separate suite: the TestBed above is already instantiated per test, so render() cannot
// reconfigure it.
describe('InputGroup with a projected input', () => {
  it('should stretch the input across the group and drop its native frame', async () => {
    const { fixture } = await render(TestHostProjectedInput);
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLElement;
    const style = getComputedStyle(input);

    expect(style.flexGrow).toBe('1');
    expect(style.borderTopWidth).toBe('0px');
    expect(style.paddingLeft).toBe('0px');
  });

  it('should not show the keyboard focus ring when the input is focused by pointer', async () => {
    const { fixture } = await render(TestHostProjectedInput);
    const group = fixture.nativeElement.querySelector('drgn-input-group') as HTMLElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLElement;

    await userEvent.click(input);

    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(group).boxShadow).toBe('none');
  });

  it('should show the keyboard focus ring when the input is reached with Tab', async () => {
    const { fixture } = await render(TestHostProjectedInput);
    const group = fixture.nativeElement.querySelector('drgn-input-group') as HTMLElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLElement;

    await userEvent.tab();

    expect(document.activeElement).toBe(input);
    await vi.waitFor(() => expect(getComputedStyle(group).boxShadow).not.toBe('none'));
  });
});
