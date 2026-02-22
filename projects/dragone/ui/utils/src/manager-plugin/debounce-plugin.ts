/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { EventManagerPlugin } from '@angular/platform-browser';
import { debounceTime, fromEvent } from 'rxjs';

export class DebouncePlugin extends EventManagerPlugin {
  override supports(eventName: string): boolean {
    return eventName.includes('debounce');
  }
  override addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    const [originalEvent, _, duration] = eventName.split('.'); // event.debounce.time
    const sub = fromEvent(element, originalEvent)
      .pipe(debounceTime(this.normalizeToMs(duration)))
      .subscribe(e => handler(e));
    return () => sub.unsubscribe();
  }

  private normalizeToMs(duration: string) {
    const trimmed = duration.trim();
    const matchGroups = trimmed.match(/(?<time>\d+)(?<unit>ms|s|)/)?.groups;
    if (!matchGroups) throw new Error('Wrong time format');
    const { time, unit } = matchGroups;
    switch (unit) {
      case 's':
        return parseInt(time, 10) * 1000;
      case '':
      case 'ms':
        return parseInt(time, 10);
      default:
        throw new Error('Unsupported time unit');
    }
  }
}
