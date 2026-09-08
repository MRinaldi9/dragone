import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputRef,
} from '@angular/core';
import type {
  DisabledReason,
  ValidationError,
  WithOptionalFieldTree,
} from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { uniqueId } from 'ng-primitives/utils';

import { Button } from '@dragone/ui/button';
import { ChipInput } from '@dragone/ui/chip';

type SearchBarValue = string | string[] | null | undefined;

@Component({
  selector: 'drgn-searchbar',
  imports: [Button, ChipInput, NgIcon],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.css',
  providers: [provideIcons({ faSolidMagnifyingGlass, faSolidXmark })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    class: 'searchbar',
  },
})
export class Searchbar<T extends SearchBarValue = SearchBarValue> {
  value = input<T>();
  errors?:
    | InputSignal<readonly ValidationError.WithOptionalFieldTree[]>
    | InputSignalWithTransform<readonly ValidationError.WithOptionalFieldTree[], unknown>
    | undefined;
  disabledReasons?:
    | InputSignal<readonly WithOptionalFieldTree<DisabledReason>[]>
    | InputSignalWithTransform<readonly WithOptionalFieldTree<DisabledReason>[], unknown>
    | undefined;
  readonly?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  hidden?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  invalid?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  pending?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  touched?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  dirty?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  name?: InputSignal<string> | InputSignalWithTransform<string, unknown> | undefined;
  required?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
  min?:
    | InputSignal<string | undefined>
    | InputSignalWithTransform<string | undefined, unknown>
    | undefined;
  minLength?:
    | InputSignal<number | undefined>
    | InputSignalWithTransform<number | undefined, unknown>
    | undefined;
  max?:
    | InputSignal<string | undefined>
    | InputSignalWithTransform<string | undefined, unknown>
    | undefined;
  maxLength?:
    | InputSignal<number | undefined>
    | InputSignalWithTransform<number | undefined, unknown>
    | undefined;
  pattern?:
    | InputSignal<readonly RegExp[]>
    | InputSignalWithTransform<readonly RegExp[], unknown>
    | undefined;
  touch?: OutputRef<void> | undefined;
  valueChange = output<T>();
  readonly inputId = input(uniqueId('drgn-searchbar-input'));
  readonly size = input<'small' | 'medium' | 'large'>('large');
  readonly label = input('Label');
  readonly placeholder = input('Text');
  readonly helperText = input('Helper text');
  readonly searchLabel = input('Ricerca');
  readonly clearAllLabel = input('Cancella tutto');
  readonly clearInputAriaLabel = input('Cancella testo');
  readonly chipsListAriaLabel = input('Filtri selezionati');
  readonly disabled = input(false);
  readonly suggestions = input([]);
  readonly multiple = input(false);

  readonly searchSubmit = output<string>();
  readonly clearValue = output<void>();
  readonly clearAll = output<void>();
  readonly removeChip = output<number>();

  protected readonly helperId = computed(() => `${this.inputId()}-helper`);
  // Protected readonly hasValue = computed(() => this.value()?.trim().length > 0);

  // Protected onSearch(): void {
  //   This.searchSubmit.emit(this.value());
  // }

  // Protected onClearValue(): void {
  //   This.clearValue.emit();
  //   This.value.set('');
  // }

  // Protected onClearAll(): void {
  //   This.clearAll.emit();
  //   This.value.set('');
  // }

  protected onRemoveChip(index: number): void {
    this.removeChip.emit(index);
  }

  // Focus?(options?: FocusOptions): void {
  //   Throw new Error('Method not implemented.');
  // }
  reset?(): void {
    throw new Error('Method not implemented.');
  }
}
