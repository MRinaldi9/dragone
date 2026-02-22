import { ListenerOptions } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EventManager, EventManagerPlugin } from '@angular/platform-browser';
import { provideEventsPlugin } from './provider';
import { noop } from 'rxjs';

class MockPlugin extends EventManagerPlugin {
  override supports(eventName: string): boolean {
    return eventName.includes('mock');
  }
  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: VoidFunction,
    options?: ListenerOptions,
  ): VoidFunction {
    return noop;
  }
}

describe('provideEventsPlugin', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideEventsPlugin(MockPlugin)],
    });
  });

  it('should create an instance of MockPlugin', () => {
    const plugins = TestBed.inject(EventManager)['_plugins'] as EventManagerPlugin[];

    expect(plugins).toEqual(expect.arrayContaining([expect.any(MockPlugin)]));
  });
});
