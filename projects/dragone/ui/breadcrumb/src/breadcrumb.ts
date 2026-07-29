import {
  afterRenderEffect,
  Component,
  computed,
  input,
  linkedSignal,
  untracked,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { injectDimensions } from 'ng-primitives/internal';

import { BreadcrumbItem, type BreadcrumbType } from './breadcrumb-item/breadcrumb-item';

@Component({
  selector: 'drgn-breadcrumb',
  imports: [BreadcrumbItem],
  template: `
    <ol #breadcrumbList>
      @if (showEllipsis()) {
        @let firstBread = firstItem();
        @let lastBread = lastItem();
        @if (firstBread && lastBread) {
          <drgn-breadcrumb-item [breadcrumbConfiguration]="firstBread" />
          <drgn-breadcrumb-item
            [breadcrumbConfiguration]="{ label: '...' }"
            (openBreadcrumb)="showEllipsis.set(false)"
          />
          <drgn-breadcrumb-item [breadcrumbConfiguration]="lastBread" />
        }
      } @else {
        @for (item of breadcrumbs(); track $index) {
          <drgn-breadcrumb-item [breadcrumbConfiguration]="item" />
        } @empty {
          <drgn-breadcrumb-item [breadcrumbConfiguration]="{ label: 'No breadcrumbs available' }" />
        }
      }
    </ol>
  `,
  styleUrl: './breadcrumb.css',
  host: {
    role: 'navigation',
    'aria-label': 'Breadcrumb',
  },
})
export class Breadcrumb {
  readonly breadcrumbs = input.required<BreadcrumbType[]>();
  protected readonly showEllipsis = linkedSignal(() => this.breadcrumbs().length >= 6);
  protected readonly firstItem = computed(() => this.breadcrumbs().at(0));
  protected readonly lastItem = computed(() => this.breadcrumbs().at(-1));
  private readonly hostDimensions = injectDimensions();
  private readonly breadcrumbListElement =
    viewChild<ElementRef<HTMLOListElement>>('breadcrumbList');

  constructor() {
    afterRenderEffect(() => {
      const { isCollapsed, list } = untracked(() => ({
        isCollapsed: this.showEllipsis(),
        list: this.breadcrumbListElement()?.nativeElement,
      }));
      const { width: hostWidth } = this.hostDimensions();

      if (isCollapsed || !list || !hostWidth) {
        return;
      }
      const listWidth = list.scrollWidth;

      const OVERFLOW_TOLERANCE_PX = 16;
      const isOverflowing = Math.floor(listWidth) > Math.floor(hostWidth + OVERFLOW_TOLERANCE_PX);

      this.showEllipsis.set(isOverflowing);
    });
  }
}
