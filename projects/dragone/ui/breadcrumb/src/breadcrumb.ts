import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  untracked,
  viewChild,
} from '@angular/core';
import { injectDimensions } from 'ng-primitives/internal';
import { BreadcrumbItem, BreadcrumbProps } from './breadcrumb-item/breadcrumb-item';

@Component({
  selector: 'drgn-breadcrumb',
  imports: [BreadcrumbItem],
  template: `
    <ol #breadcrumbList>
      @if (showEllipsis()) {
        <drgn-breadcrumb-item [breadcrumbConfiguration]="firstItem()" />
        <drgn-breadcrumb-item
          [breadcrumbConfiguration]="{ label: '...' }"
          (openBreadcrumb)="showEllipsis.set(false)"
        />
        <drgn-breadcrumb-item [breadcrumbConfiguration]="lastItem()" />
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'navigation',
    'aria-label': 'Breadcrumb',
  },
})
export class Breadcrumb {
  readonly breadcrumbs = input.required<BreadcrumbProps[]>();
  protected readonly showEllipsis = linkedSignal(() => this.breadcrumbs().length >= 6);
  protected readonly firstItem = computed(() => this.breadcrumbs().at(0)!);
  protected readonly lastItem = computed(() => this.breadcrumbs().at(-1)!);
  private readonly hostDimensions = injectDimensions();
  private readonly breadcrumbListElement =
    viewChild<ElementRef<HTMLOListElement>>('breadcrumbList');

  constructor() {
    afterRenderEffect(() => {
      const { isCollapsed, list } = untracked(() => {
        const isCollapsed = this.showEllipsis();
        const list = this.breadcrumbListElement()?.nativeElement;
        return { isCollapsed, list };
      });
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
