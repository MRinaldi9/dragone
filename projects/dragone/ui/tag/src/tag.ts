import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatusTag = 'alert' | 'info' | 'success' | 'warning' | 'neutral';

@Component({
  selector: 'drgn-tag',
  imports: [],
  template: `
    <ng-content />
  `,
  styleUrl: './tag.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'drgn-label-md-700',
    role: 'status',
    '[ariaLabel]': 'ariaLabel()',
    '[attr.data-status]': 'statusTag()',
  },
})
export class Tag {
  ariaLabel = input<string>();
  statusTag = input<StatusTag>('neutral');
}
