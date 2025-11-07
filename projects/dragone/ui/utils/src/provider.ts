import { Provider, Type } from '@angular/core';
import { EVENT_MANAGER_PLUGINS, EventManagerPlugin } from '@angular/platform-browser';

export const provideEventsPlugin = (...managers: Type<EventManagerPlugin>[]): Provider => {
  return managers.map(manager => ({
    provide: EVENT_MANAGER_PLUGINS,
    multi: true,
    useClass: manager,
  }));
};
