import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'optionMap',
})
export class OptionMapperPipe<T, K extends keyof T = keyof T> implements PipeTransform {
  transform(value: T | T[], key?: K): T | T[K] | (T | T[K])[] {
    if (typeof value !== 'object' || !value) {
      return value;
    }
    const hasKey = Boolean(key);
    if (Array.isArray(value)) {
      return value.map(val => (hasKey ? val[key] : val));
    }
    return hasKey ? value[key] : value;
  }
}
