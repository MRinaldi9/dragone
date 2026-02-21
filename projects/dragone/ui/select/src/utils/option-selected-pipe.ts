import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'optionSelected',
})
export class OptionSelectedPipe<T> implements PipeTransform {
  transform(currOption: T, selectedValue: T | T[]): boolean {
    if (Array.isArray(selectedValue)) {
      return selectedValue.some(value => value === currOption);
    }
    return selectedValue === currOption;
  }
}
