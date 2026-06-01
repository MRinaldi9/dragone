import { Component, type ElementRef } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FocusManager } from './focus-manager';

@Component({
  imports: [FocusManager],
  template: `<ul drgnFocusManager [fallbackElement]="fallbackElement"></ul>`,
})
class HostManagerComponent {
  readonly fallbackNative = document.createElement('button');
  readonly fallbackElement = { nativeElement: this.fallbackNative } as ElementRef<HTMLElement>;
}

describe(FocusManager, () => {
  let fixture: ComponentFixture<HostManagerComponent>;
  let host: HostManagerComponent;
  let focusManager: FocusManager;

  const createButton = (disabled = false): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.disabled = disabled;
    fixture.nativeElement.append(button);
    return button;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostManagerComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();

    const managerDebugEl = fixture.debugElement.query(By.directive(FocusManager));
    focusManager = managerDebugEl.injector.get(FocusManager);

    fixture.nativeElement.append(host.fallbackNative);
  });

  afterEach(() => {
    host.fallbackNative.remove();
  });

  it('should keep fallback input bound from host', () => {
    expect(focusManager.fallbackElement()).toBe(host.fallbackElement);
  });

  it('should focus next element when current has an enabled next', () => {
    const first = createButton();
    const second = createButton();

    focusManager.register('first', first);
    focusManager.register('second', second);

    focusManager.focusNext('first');

    expect(document.activeElement).toBe(second);
  });

  it('should focus previous element when current is the last item', () => {
    const first = createButton();
    const second = createButton();

    focusManager.register('first', first);
    focusManager.register('second', second);

    focusManager.focusNext('second');

    expect(document.activeElement).toBe(first);
  });

  it('should focus fallback when computed neighbour is disabled', () => {
    const first = createButton();
    const disabledSecond = createButton(true);

    focusManager.register('first', first);
    focusManager.register('second', disabledSecond);

    focusManager.focusNext('first');

    expect(document.activeElement).toBe(host.fallbackNative);
  });

  it('should focus fallback when filename is not tracked', () => {
    focusManager.focusNext('missing');

    expect(document.activeElement).toBe(host.fallbackNative);
  });

  it('should remove an item from navigation when unregister is called', () => {
    const first = createButton();
    const second = createButton();
    const third = createButton();

    focusManager.register('first', first);
    focusManager.register('second', second);
    focusManager.register('third', third);
    focusManager.unregister('second');

    focusManager.focusNext('first');

    expect(document.activeElement).toBe(third);
  });
});
