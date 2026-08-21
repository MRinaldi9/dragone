import { Directive, input, type Signal } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';

import { castTo } from '../types/guards';
import type { LiteralUnion } from '../types/utils';

export type StatusType = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export const [, statusFactory, injectStatusState, provideStatusState] = createPrimitive(
  'Status',
  (status: Signal<StatusType>) => ({ status }),
);

const isStatusType = (value: unknown): value is StatusType =>
  value === 'info' ||
  value === 'success' ||
  value === 'warning' ||
  value === 'danger' ||
  value === 'neutral';

@Directive({
  selector: '[drgnStatus]',
  providers: [provideStatusState({ inherit: false })],
  host: {
    '[attr.data-status]': 'status() !== "neutral" ? status() : null',
  },
})
export class Status {
  readonly status = input<StatusType, LiteralUnion<StatusType, string>>('neutral', {
    alias: 'drgnStatus',
    transform: val => (val === '' ? 'neutral' : castTo<StatusType>(val, isStatusType)),
  });

  constructor() {
    statusFactory(this.status);
  }
}
