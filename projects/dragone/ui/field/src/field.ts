import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, computed, contentChild, input } from '@angular/core';
import { FORM_FIELD } from '@angular/forms/signals';
import { NgpFormField } from 'ng-primitives/form-field';

import { FieldDescription } from './description/field-description';
import { FieldError } from './error/field-error';
import { FieldErrorTemplate } from './error/field-error-template';
import { FieldLabel } from './label/field-label';

@Component({
  selector: 'drgn-field',
  imports: [FieldLabel, FieldDescription, FieldError, NgTemplateOutlet],
  template: `
    <div class="field-container">
      @if (label(); as l) {
        <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -- for is added dinamically by NgpFormField -->
        <label class="drgn-label-md-600 label" drgnFieldLabel>
          {{ l }}
          @if (isRequired()) {
            <span aria-label="required">*</span>
          }
        </label>
      }
      <div class="control">
        <!-- The formField is required; otherwise this will not render and throw error at runtime -->
        <ng-content select="[formField]" />
      </div>
      @if (description()) {
        <small class="drgn-helper-text-xs-400 description" drgnFieldDescription>
          {{ description() }}
        </small>
      }
    </div>
    @if (errors().length > 0) {
      <div role="alert">
        @for (error of errors(); track error.kind) {
          <span
            class="error-message drgn-helper-text-xs-400"
            drgnFieldError
            animate.enter="error-enter"
            animate.leave="error-leave"
            [validator]="error.kind"
          >
            <ng-container
              *ngTemplateOutlet="
                errorTemplate()?.templateRef ?? defaultError;
                context: { $implicit: error }
              "
            />
          </span>
        }
      </div>
    }
    <!-- Default error rendering, used when no drgnFieldErrorTemplate is projected -->
    <ng-template #defaultError let-error>{{ error.message }}</ng-template>
  `,
  styleUrl: './field.css',
  host: {
    '[attr.data-control-layout]': 'inline() ? "horizontal" : "vertical"',
  },
  hostDirectives: [NgpFormField],
})
export class Field {
  readonly label = input<string>();
  readonly description = input<string>();
  readonly inline = input(false, { transform: booleanAttribute });
  private readonly formField = contentChild.required(FORM_FIELD);
  readonly errorTemplate = contentChild(FieldErrorTemplate);
  readonly #fieldState = computed(() => this.formField().state());

  protected errors = computed(
    (errors = this.formField().errors(), isTouched = this.#fieldState().touched()) =>
      isTouched ? errors : [],
  );
  protected isRequired = computed(() => this.#fieldState().required());
}
