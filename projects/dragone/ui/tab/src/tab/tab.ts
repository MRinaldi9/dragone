import {
  booleanAttribute,
  Component,
  contentChild,
  input,
  type TemplateRef,
  viewChild
} from '@angular/core';

import { TabLazyContent } from '../tab-lazy-content/tab-lazy-content';

/**
 * A single tab inside `<drgn-tab-container>`. Project content directly for eager rendering, or wrap
 * it in an `<ng-template drgnTabLazyContent>` to render it lazily while the tab is active.
 */
@Component({
  selector: 'drgn-tab',
  template: '<ng-template #eagerContent><ng-content /></ng-template>'
})
export class Tab {
  /** The value reported to the container's `value` model when this tab is selected. */
  readonly value = input.required<string>();
  /** The visible label of the tab button. */
  readonly label = input.required<string>();
  /** Optional icon name registered with `provideIcons`, or a raw `<svg>` string. */
  readonly icon = input<string>();
  /**
   * Whether the tab is disabled and cannot be selected.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Template holding the content projected directly into this tab. */
  readonly eagerContent = viewChild.required<TemplateRef<void>>('eagerContent');
  /** Directive wrapping the `<ng-template drgnTabLazyContent>`, when one is provided. */
  readonly lazyContent = contentChild(TabLazyContent);
}
