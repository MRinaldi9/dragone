import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck } from '@ng-icons/font-awesome/solid';
import { NgpButton } from 'ng-primitives/button';
import { NgpFocusVisible } from 'ng-primitives/interactions';
import { injectToggleState, NgpToggle } from 'ng-primitives/toggle';
import { ChangeFn, provideValueAccessor } from 'ng-primitives/utils';
@Component({
  selector: 'button[drgn-chip-selected]',
  imports: [NgIcon],
  template: `
    <ng-icon class="chip-icon" size="1rem" name="faSolidCheck" />
    <ng-content />
  `,
  styleUrl: './chip-selected.css',
  providers: [provideValueAccessor(ChipSelected), provideIcons({ faSolidCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'drgn-label-md-700',
    '(blur)': 'onTouched?.()',
  },
  hostDirectives: [
    {
      directive: NgpToggle,
      inputs: ['ngpToggleSelected: selected', 'ngpToggleDisabled: disabled'],
      outputs: ['ngpToggleSelectedChange: selectedChange'],
    },
    {
      directive: NgpButton,
      inputs: ['disabled'],
    },
    NgpFocusVisible,
  ],
})
export class ChipSelected implements ControlValueAccessor {
  protected readonly state = injectToggleState();
  private onChange?: ChangeFn<boolean>;
  protected onTouched?: ChangeFn<void>;

  constructor() {
    this.state()
      .selectedChange.pipe(takeUntilDestroyed())
      .subscribe(selected => this.onChange?.(selected));
  }

  writeValue(value: boolean): void {
    this.state().setSelected(value);
  }
  registerOnChange(fn: ChangeFn<boolean>): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: ChangeFn<void>): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }
}
