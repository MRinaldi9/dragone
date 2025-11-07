/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ListenerOptions } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EventManager, EventManagerPlugin } from '@angular/platform-browser';
import { provideEventsPlugin } from './provider';

class MockPlugin extends EventManagerPlugin {
  override supports(eventName: string): boolean {
    return eventName.includes('mock');
  }
  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
    options?: ListenerOptions,
  ): Function {
    return () => {};
  }
}

describe('provideEventsPlugin', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideEventsPlugin(MockPlugin)],
    });
  });

  it('should create an instance of MockPlugin', () => {
    const plugins = TestBed.inject(EventManager)['_plugins'] as EventManagerPlugin[];

    expect(plugins).toEqual(expect.arrayContaining([expect.any(MockPlugin)]));
  });
});
