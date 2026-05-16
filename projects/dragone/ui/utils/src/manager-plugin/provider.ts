import type { Provider, Type } from '@angular/core';
import { EVENT_MANAGER_PLUGINS, type EventManagerPlugin } from '@angular/platform-browser';

export const provideEventsPlugin = (...managers: Type<EventManagerPlugin>[]): Provider =>
  managers.map(manager => ({
    provide: EVENT_MANAGER_PLUGINS,
    multi: true,
    useClass: manager,
  }));
