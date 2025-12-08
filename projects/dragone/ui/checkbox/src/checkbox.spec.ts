import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  let component: Checkbox;
  let fixture: ComponentFixture<Checkbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkbox],
    }).compileComponents();

    fixture = TestBed.createComponent(Checkbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should write to internal state through writeValue', () => {
    component.writeValue(true);
    expect(component['internalState']().checked()).toBeTruthy();
  });

  it('should set disabled state through setDisabledState', () => {
    component.setDisabledState?.(true);
    expect(component['internalState']().disabled()).toBeTruthy();
  });

  it('should have changeFn called on checkedChange', () => {
    const changeFnSpy = vi.fn();
    component.registerOnChange(changeFnSpy);

    (fixture.nativeElement as HTMLElement).dispatchEvent(new Event('click'));
    expect(changeFnSpy).toHaveBeenCalledWith(true);
  });

  it('should have touchedFn called on blur', () => {
    const touchedFnSpy = vi.fn();
    component.registerOnTouched(touchedFnSpy);

    fixture.debugElement.triggerEventHandler('blur', {});
    expect(touchedFnSpy).toHaveBeenCalled();
  });
});
