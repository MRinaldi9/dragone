import { Component, signal, type ElementRef } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { FocusElement } from './focus-element';
import { FocusManager } from './focus-manager';

@Component({
  imports: [FocusManager, FocusElement],
  template: `
    <ul drgnFocusManager [fallbackElement]="fallbackElement">
      @for (item of items(); track item) {
        <li [drgnFocusElement]="item">
          <button type="button">{{ item }}</button>
        </li>
      }
    </ul>
  `,
})
class HostWithButtonComponent {
  readonly items = signal<string[]>(['first', 'second']);
  readonly fallbackNative = document.createElement('button');
  readonly fallbackElement = { nativeElement: this.fallbackNative } as ElementRef<HTMLElement>;
}

@Component({
  imports: [FocusManager, FocusElement],
  template: `
    <ul drgnFocusManager [fallbackElement]="fallbackElement">
      @for (item of items(); track item) {
        <li [drgnFocusElement]="item">
          <span>{{ item }}</span>
        </li>
      }
    </ul>
  `,
})
class HostWithoutButtonComponent {
  readonly items = signal<string[]>(['first']);
  readonly fallbackNative = document.createElement('button');
  readonly fallbackElement = { nativeElement: this.fallbackNative } as ElementRef<HTMLElement>;
}

describe('focus helpers integration', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostWithButtonComponent, HostWithoutButtonComponent],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register one entry for each rendered item with inner button', async () => {
    const registerSpy = vi.spyOn(FocusManager.prototype, 'register');

    const fixture = TestBed.createComponent(HostWithButtonComponent);
    await fixture.whenStable();

    expect(registerSpy).toHaveBeenNthCalledWith(1, 'first', expect.any(HTMLButtonElement));
    expect(registerSpy).toHaveBeenNthCalledWith(2, 'second', expect.any(HTMLButtonElement));
  });

  it('should unregister removed item when host list changes', async () => {
    const unregisterSpy = vi.spyOn(FocusManager.prototype, 'unregister');

    const fixture: ComponentFixture<HostWithButtonComponent> =
      TestBed.createComponent(HostWithButtonComponent);
    const host = fixture.componentInstance;
    await fixture.whenStable();

    host.items.set(['first']);
    await fixture.whenStable();

    expect(unregisterSpy).toHaveBeenCalledWith('second');
  });

  it('should unregister all rendered items when component is destroyed', async () => {
    const unregisterSpy = vi.spyOn(FocusManager.prototype, 'unregister');

    const fixture = TestBed.createComponent(HostWithButtonComponent);
    await fixture.whenStable();

    fixture.destroy();

    expect(unregisterSpy).toHaveBeenCalledWith('first');
    expect(unregisterSpy).toHaveBeenCalledWith('second');
  });

  it('should not register when host has no inner button', async () => {
    const registerSpy = vi.spyOn(FocusManager.prototype, 'register');

    const fixture = TestBed.createComponent(HostWithoutButtonComponent);
    await fixture.whenStable();

    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('should still unregister when host has no inner button and is destroyed', async () => {
    const unregisterSpy = vi.spyOn(FocusManager.prototype, 'unregister');

    const fixture = TestBed.createComponent(HostWithoutButtonComponent);
    await fixture.whenStable();

    fixture.destroy();

    expect(unregisterSpy).toHaveBeenCalledWith('first');
  });
});
