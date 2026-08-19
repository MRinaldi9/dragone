import {
  afterRenderEffect,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  linkedSignal,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { NgpBreadcrumbList, NgpBreadcrumbs } from 'ng-primitives/breadcrumbs';
import { injectDimensions } from 'ng-primitives/internal';

import { createNotifier, toElement } from '@dragone/ui/utils';

import { BreadcrumbEllipsis } from './breadcrumb-ellipsis/breadcrumb-ellipsis';
import { BreadcrumbItem, type BreadcrumbItemConfig } from './breadcrumb-item/breadcrumb-item';
import { BreadcrumbSeparator } from './breadcrumb-separator/breadcrumb-separator';
import { validateBreadcrumbTrail } from './utils/validation-breadcrumb';

@Component({
  selector: 'drgn-breadcrumb',
  imports: [BreadcrumbItem, NgpBreadcrumbList, BreadcrumbSeparator, BreadcrumbEllipsis],
  template: `
    <ol ngpBreadcrumbList>
      @if (showEllipsis()) {
        @let firstBread = firstItem();
        @let lastBread = lastItem();
        @if (firstBread && lastBread) {
          <drgn-breadcrumb-item [breadcrumbConfiguration]="firstBread" />
          <drgn-breadcrumb-separator />
          <drgn-breadcrumb-ellipsis
            [ariaLabel]="ariaLabelEllipsis()"
            (openBreadcrumb)="userExpanded.set(true)"
          />
          <drgn-breadcrumb-separator />
          <drgn-breadcrumb-item [breadcrumbConfiguration]="lastBread" [isLastBreadcrumb]="true" />
        }
      } @else {
        @for (item of breadcrumbs(); track $index) {
          <drgn-breadcrumb-item [breadcrumbConfiguration]="item" [isLastBreadcrumb]="$last" />
          @if (!$last) {
            <drgn-breadcrumb-separator />
          }
        }
      }
    </ol>
  `,
  styleUrl: './breadcrumb.css',
  host: {
    role: 'navigation',
    '[ariaLabel]': 'ariaLabel()',
    '[class.expanded]': 'userExpanded()',
  },
  hostDirectives: [NgpBreadcrumbs],
})
export class Breadcrumb {
  readonly breadcrumbs = input.required<BreadcrumbItemConfig[]>();
  readonly ariaLabel = input('Breadcrumb');
  readonly ariaLabelEllipsis = input('Expand breadcrumbs');

  readonly #breadcrumbsNotifier = createNotifier({ deps: [this.breadcrumbs] });
  readonly #overflowing = signal(false);
  readonly #hostDimensions = injectDimensions();

  protected readonly userExpanded = linkedSignal({
    source: this.#breadcrumbsNotifier.listen,
    computation: () => false,
  });
  protected readonly showEllipsis = computed(() => {
    const userExpanded = this.userExpanded();
    const overflowing = this.#overflowing();
    const breadcrumbs = this.breadcrumbs();
    return !userExpanded && (breadcrumbs.length >= 6 || overflowing);
  });

  protected readonly firstItem = computed(() => this.breadcrumbs().at(0));
  protected readonly lastItem = computed(() => this.breadcrumbs().at(-1));
  private readonly breadcrumbListElement = viewChild<
    NgpBreadcrumbList,
    ElementRef<HTMLOListElement>
  >(NgpBreadcrumbList, { read: ElementRef });
  private readonly breadcrumbItems = viewChildren<BreadcrumbItem, ElementRef<HTMLElement>>(
    BreadcrumbItem,
    {
      read: ElementRef,
    },
  );

  constructor() {
    const OVERFLOW_TOLERANCE_PX = 16;
    afterRenderEffect(() => {
      const listElement = toElement.untracked(this.breadcrumbListElement);
      const { width: hostWidth } = this.#hostDimensions();

      if (!listElement || !hostWidth) return;

      this.#overflowing.set(
        Math.floor(listElement.scrollWidth) > Math.floor(hostWidth + OVERFLOW_TOLERANCE_PX),
      );
    });
    effect(() => {
      const userExpanded = this.userExpanded();
      const breadcrumbItems = this.breadcrumbItems();
      if (!userExpanded || !breadcrumbItems.length) return;

      toElement(breadcrumbItems.at(1))?.querySelector('a')?.focus();
    });
    if (ngDevMode) {
      effect(() => {
        for (const warning of validateBreadcrumbTrail(this.breadcrumbs())) {
          console.warn(warning);
        }
      });
    }
  }
}
