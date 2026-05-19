import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  input,
  output,
} from '@angular/core';
import { injectRadioGroupState, NgpRadioGroup } from 'ng-primitives/radio';

import { RadioItem } from '../radio-item/radio-item';

@Component({
  selector: 'drgn-radio-group',
  imports: [],
  template: ` <ng-content /> `,
  styleUrl: './radio-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(focusout)': 'touched($event)',
    '[style.--direction]': 'direction()',
    '[attr.readonly]': 'readonly() ? "" : null',
    '[attr.name]': 'name() ? name() : null',
    '[attr.hidden]': 'hidden() ? "" : null',
  },
  hostDirectives: [
    {
      directive: NgpRadioGroup,
      inputs: [
        'ngpRadioGroupValue:value',
        'ngpRadioGroupDisabled:disabled',
        'ngpRadioGroupOrientation:orientation',
        'ngpRadioGroupCompareWith:compare',
      ],
      outputs: ['ngpRadioGroupValueChange:valueChange'],
    },
  ],
})
export class RadioGroup<T> {
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly name = input<string>();
  protected readonly radioItems = contentChildren<RadioItem, ElementRef<HTMLElement>>(RadioItem, {
    read: ElementRef,
  });
  readonly touch = output<void>();
  readonly #radioGroupState = injectRadioGroupState<T>();

  protected direction = computed(() =>
    this.#radioGroupState().orientation() === 'horizontal' ? 'row' : 'column',
  );

  focus(options?: FocusOptions): void {
    this.radioItems().at(0)?.nativeElement.focus(options);
  }

  reset(): void {
    this.#radioGroupState().value.set(null);
  }

  protected touched(event: FocusEvent): void {
    const target = event.relatedTarget as HTMLElement | null;
    if (!this.radioItems().some(item => item.nativeElement === target)) {
      this.touch.emit();
    }
  }
}
