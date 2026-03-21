import { TestBed } from '@angular/core/testing';
import { EventManager, EventManagerPlugin } from '@angular/platform-browser';
import { noop } from 'rxjs';

import { provideEventsPlugin } from './provider';

class MockPlugin extends EventManagerPlugin {
  override supports(eventName: string): boolean {
    return eventName.includes('mock');
  }
  override addEventListener(): VoidFunction {
    return noop;
  }
}

describe(provideEventsPlugin, () => {
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
