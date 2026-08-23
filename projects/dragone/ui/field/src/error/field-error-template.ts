import { Directive, inject, TemplateRef } from '@angular/core';
import type { ValidationError } from '@angular/forms/signals';

export interface FieldErrorContext {
  readonly $implicit: ValidationError.WithFieldTree;
}

/**
 * Marks an `ng-template` inside a `drgn-field` as the custom renderer for
 * validation errors. When present, it replaces the default error message for
 * every rendered error; the template is instantiated once per error with a
 * {@link FieldErrorContext}.
 */
@Directive({
  selector: 'ng-template[drgnTemplate="fieldError"]',
})
export class FieldErrorTemplate {
  readonly templateRef = inject<TemplateRef<FieldErrorContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _: FieldErrorTemplate,
    // oxlint-disable-next-line no-unused-vars
    context: unknown,
  ): context is FieldErrorContext {
    return true;
  }
}
