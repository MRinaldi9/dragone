import { Component, input } from '@angular/core';

@Component({
  selector: 'drgn-card-link',
  template: `
    <a
      class="card-link-anchor"
      [href]="href()"
      [target]="target()"
      [attr.rel]="rel() ?? null"
      [attr.aria-label]="ariaLabel() ?? null"
    >
      <ng-content />
    </a>
  `,
  styleUrl: './card-link.css',
})
export class CardLink {
  /** The destination URL of the stretched link. */
  readonly href = input.required<string>();
  /** The link target. @default '_self' */
  readonly target = input('_self');
  /** The rel attribute applied when target is set. */
  readonly rel = input<string>();
  /** Optional accessible label for the stretched link. */
  readonly ariaLabel = input<string>();
}
