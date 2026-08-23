import { Directive, input, type Signal } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';

export type LayoutType = 'desktop' | 'mobile';

export interface LayoutState {
  layout: Signal<LayoutType>;
}

export const [, layoutFactory, injectLayoutState, provideLayoutState] = createPrimitive(
  'Layout',
  ({ layout }: { layout: Signal<LayoutType> }): LayoutState => ({ layout }),
);

@Directive({
  selector: '[drgnLayout]',
  providers: [provideLayoutState({ inherit: false })],
  host: {
    '[attr.data-layout]': 'layout()',
  },
})
export class Layout {
  readonly layout = input<LayoutType>('desktop', { alias: 'drgnLayout' });

  constructor() {
    layoutFactory({ layout: this.layout });
  }
}
