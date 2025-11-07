/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { ListenerOptions } from '@angular/core';
import { EventManagerPlugin } from '@angular/platform-browser';

export class PreventDefaultPlugin extends EventManagerPlugin {
  override supports(eventName: string): boolean {
    return eventName.endsWith('.prevent');
  }
  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
    options?: ListenerOptions,
  ): Function {
    const originalEventName = eventName.split('.')[0];
    return this.manager.addEventListener(
      element,
      originalEventName,
      (e: Event) => {
        e.preventDefault();
        handler(e);
      },
      options,
    );
  }
}
