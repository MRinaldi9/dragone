import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'ariaLabel',
})
export class AriaLabelPipe implements PipeTransform {
  transform(currFile: File, files: File[]): string {
    const duplicates = files.filter(file => file.name === currFile.name);

    if (duplicates.length < 2) {
      return `Remove file ${currFile.name}`;
    }

    const duplicateIndex = duplicates.findIndex(file => file === currFile) + 1;
    return `Remove file ${currFile.name} (${duplicateIndex} of ${duplicates.length})`;
  }
}
