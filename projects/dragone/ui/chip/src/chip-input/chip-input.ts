import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';
import { NgpFocusVisible } from 'ng-primitives/interactions';

import { convertToSvgIcon, SvgIcon } from '@dragone/ui/utils';

@Component({
  selector: 'drgn-chip-input',
  imports: [NgIcon],
  template: `
    @if (icon()) {
      <ng-icon aria-hidden="true" size="1rem" [svg]="icon()" />
    }
    <span class="drgn-chip__label">{{ label() }}</span>
    <button
      type="button"
      class="close-button"
      [aria-label]="ariaLabelBtn()"
      [disabled]="disabled()"
      (click)="remove.emit()"
    >
      <ng-icon name="faSolidXmark" size="1.4rem" aria-hidden="true" />
    </button>
  `,
  styleUrl: './chip-input.css',
  providers: [provideIcons({ faSolidXmark })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'drgn-label-md-700',
    tabindex: '0',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  hostDirectives: [NgpFocusVisible],
})
export class ChipInput {
  readonly disabled = input<boolean>(false);
  readonly label = input.required<string>();
  readonly icon = input<SvgIcon, string>(undefined, { transform: icon => convertToSvgIcon(icon) });
  readonly remove = output<void>();

  protected readonly ariaLabelBtn = computed(() => `Remove ${this.label()}`);
}
