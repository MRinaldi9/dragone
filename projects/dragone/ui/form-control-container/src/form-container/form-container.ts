import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  input,
} from '@angular/core';
import { FORM_FIELD } from '@angular/forms/signals';
import { NgpFormField } from 'ng-primitives/form-field';

import { Description } from '../description/description';
import { Label } from '../label/label';
import { ValidationError } from '../validation-error/validation-error';

@Component({
  selector: 'drgn-form-container',
  imports: [Label, Description, ValidationError],
  template: `
    <div class="field-container">
      @if (label()) {
        <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
        <label class="drgn-label-md-600 label" drgnLabel>{{ label() }}</label>
      }
      <div class="control">
        <ng-content select="[formField]"> Errata configurazione </ng-content>
      </div>
      @if (description()) {
        <small class="drgn-helper-text-xs-400 description" drgnDescription>{{ description() }}</small>
      }
    </div>
    @for (error of errors(); track error.kind) {
      <span
        class="error-message drgn-helper-text-xs-400"
        drgnError
        [attr.role]="$first ? 'alert' : null"
        [validator]="error.kind"
        >{{ error.message }}</span
      >
    }
  `,
  styleUrl: './form-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--direction]': 'inline() ? "row" : "column"',
    '[attr.data-control-layout]': 'inline() ? "horizontal" : "vertical"',
  },
  hostDirectives: [NgpFormField],
})
export class FormContainer {
  readonly label = input<string>();
  readonly description = input<string>();
  readonly inline = input(false, { transform: booleanAttribute });
  readonly validations = input<
    | 'required'
    | 'min'
    | 'max'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'email'
    | (string & Record<never, never>[])
  >();
  private readonly formField = contentChild(FORM_FIELD);

  protected errors = computed(() => this.formField()?.errors());

  constructor() {
    effect(() => console.log(this.formField()?.errors()));
  }
}
