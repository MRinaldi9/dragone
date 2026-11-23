import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Marks an `<ng-template>` as the lazily rendered content of a `<drgn-tab>`. The template is
 * instantiated only while its tab is active and destroyed when another tab is selected.
 */
@Directive({
  selector: 'ng-template[drgnTabLazyContent]'
})
export class TabLazyContent {
  /** The template to render when the owning tab becomes active. */
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}
