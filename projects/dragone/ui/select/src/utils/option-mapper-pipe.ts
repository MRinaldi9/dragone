import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'optionMap',
})
export class OptionMapperPipe<T, K extends keyof T = keyof T> implements PipeTransform {
  transform(value: T | T[], key?: K): T | T[K] | (T | T[K])[] {
    if (typeof value !== 'object' || !value) return value;
    const hasKey = !!key;
    if (this.isArray(value)) {
      return value.map(v => (hasKey ? v[key] : v));
    }
    return hasKey ? value[key] : value;
  }

  private isArray(value: T | T[]): value is T[] {
    return Array.isArray(value);
  }
}
