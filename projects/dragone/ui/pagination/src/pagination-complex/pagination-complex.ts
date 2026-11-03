import { booleanAttribute, Component, computed, effect, input, model } from '@angular/core';

import { Select } from '@dragone/ui/select';

import { Pagination } from '../pagination';

/**
 * The full pagination bar: an optional "items per page" select with its range summary, an optional
 * page jumper with the page count, and the page strip. Each piece is opt-in through its boolean
 * input, so the bar composes down to the strip alone. The strip is the `Pagination` Component,
 * which owns the ng-primitives page state.
 *
 * `totalItems` and `pageSize` are the source of truth: `pageCount`, the range and the page jumper
 * options all derive from them, so consumers never have to keep the page count in sync by hand. The
 * bar itself is not a landmark; the strip inside it is.
 */
@Component({
  selector: 'drgn-pagination-complex',
  imports: [Pagination, Select],
  template: `
    <div class="bar">
      @if (showPageSize()) {
        <div class="group">
          <span class="drgn-label-md-600 label">{{ itemsPerPageLabel() }}</span>
          <drgn-select
            class="select"
            [options]="pageSizeOptions()"
            [value]="pageSize()"
            [disabled]="disabled()"
            [ariaLabel]="itemsPerPageLabel()"
            (valueChange)="pageSizeChanged($event)"
          />
        </div>
      }

      @if (showRange()) {
        <!-- role="status" so the new range is announced when the page changes. The &nbsp; separators
             keep the words apart: Angular drops whitespace-only text nodes between the spans. -->
        <p class="summary" data-testid="pagination-range" role="status">
          <span class="drgn-label-md-number-400">{{ rangeStart() }} - {{ rangeEnd() }}</span>
          &nbsp;
          <span class="drgn-label-md-600">{{ ofLabel() }}</span>
          &nbsp;
          <span class="drgn-label-md-number-400">{{ totalItems() }}</span>
          &nbsp;
          <span class="drgn-label-md-600">{{ itemsUnitLabel() }}</span>
        </p>
      }

      @if ((showPageSize() || showRange()) && showPageJumper()) {
        <span aria-hidden="true" class="divider"></span>
      }

      @if (showPageJumper()) {
        <div class="group">
          <drgn-select
            class="select"
            [options]="pages()"
            [value]="page()"
            [disabled]="disabled()"
            [ariaLabel]="pageJumperLabel()"
            (valueChange)="pageChanged($event)"
          />
          <p class="summary" data-testid="pagination-page-count">
            <span class="drgn-label-md-600">{{ ofLabel() }}</span>
            &nbsp;
            <span class="drgn-label-md-number-400">{{ pageCount() }}</span>
            &nbsp;
            <span class="drgn-label-md-600">{{ pagesUnitLabel() }}</span>
          </p>
        </div>
      }

      <drgn-pagination
        [page]="page()"
        [pageCount]="pageCount()"
        [disabled]="disabled()"
        [siblingCount]="siblingCount()"
        [showPages]="showPages()"
        [showNav]="showNav()"
        [ariaLabel]="ariaLabel()"
        [previousLabel]="previousLabel()"
        [nextLabel]="nextLabel()"
        [pageLabel]="pageLabel()"
        (pageChange)="page.set($event)"
      />
    </div>
  `,
  styleUrl: './pagination-complex.css'
})
export class PaginationComplex {
  /** The total number of items spread across all pages. */
  readonly totalItems = input.required<number>();
  /**
   * The current page, 1-based. Bind it two-way (`[(page)]`): a one-way binding pins the page, so
   * the bar would emit `pageChange` without moving.
   *
   * @default 1
   */
  readonly page = model(1);
  /**
   * How many items a page holds. Bind it two-way (`[(pageSize)]`) for the same reason as `page`.
   *
   * @default 10
   */
  readonly pageSize = model(10);
  /**
   * The page sizes offered by the "items per page" select.
   *
   * @default [10, 20, 30, 50, 100]
   */
  readonly pageSizeOptions = input<number[]>([10, 20, 30, 50, 100]);
  /**
   * Whether the whole bar is disabled.
   *
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Sizes the strip: a constant cell count, so its width never changes as the page moves, with the
   * current page centred in the page numbers. See `Pagination` for the exact layout.
   *
   * @default 2
   */
  readonly siblingCount = input(2);
  /**
   * Whether to render the numbered page buttons in the strip.
   *
   * @default true
   */
  readonly showPages = input(true, { transform: booleanAttribute });
  /**
   * Whether to render the previous/next buttons in the strip.
   *
   * @default true
   */
  readonly showNav = input(true, { transform: booleanAttribute });
  /**
   * Whether to render the "items per page" label and select.
   *
   * @default true
   */
  readonly showPageSize = input(true, { transform: booleanAttribute });
  /**
   * Whether to render the "1 - 10 di 100 Elementi" range summary.
   *
   * @default true
   */
  readonly showRange = input(true, { transform: booleanAttribute });
  /**
   * Whether to render the page jumper select and the page count.
   *
   * @default true
   */
  readonly showPageJumper = input(true, { transform: booleanAttribute });
  /**
   * The accessible name of the navigation landmark.
   *
   * @default 'Paginazione'
   */
  readonly ariaLabel = input('Paginazione');
  /**
   * The visible label of the "items per page" select. It is also its accessible name, so the two
   * never drift apart.
   *
   * @default 'Elementi per pagina:'
   */
  readonly itemsPerPageLabel = input('Elementi per pagina:');
  /**
   * The word between a range and its total, e.g. "di" in "1 - 10 di 100".
   *
   * @default 'di'
   */
  readonly ofLabel = input('di');
  /**
   * The unit after the total item count.
   *
   * @default 'Elementi'
   */
  readonly itemsUnitLabel = input('Elementi');
  /**
   * The unit after the page count.
   *
   * @default 'Pagine'
   */
  readonly pagesUnitLabel = input('Pagine');
  /**
   * The accessible name of the page jumper select, which has no visible label.
   *
   * @default 'Vai a pagina'
   */
  readonly pageJumperLabel = input('Vai a pagina');
  /**
   * The accessible name of the previous button.
   *
   * @default 'Pagina precedente'
   */
  readonly previousLabel = input('Pagina precedente');
  /**
   * The accessible name of the next button.
   *
   * @default 'Pagina successiva'
   */
  readonly nextLabel = input('Pagina successiva');
  /**
   * Prefix of a page button's accessible name, e.g. "Pagina 3".
   *
   * @default 'Pagina'
   */
  readonly pageLabel = input('Pagina');

  protected readonly pageCount = computed(() => {
    const pageSize = Math.max(1, this.pageSize());
    return Math.max(1, Math.ceil(this.totalItems() / pageSize));
  });
  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => index + 1)
  );
  protected readonly rangeStart = computed(() =>
    this.totalItems() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1
  );
  protected readonly rangeEnd = computed(() =>
    Math.min(this.page() * this.pageSize(), this.totalItems())
  );

  constructor() {
    // A smaller `pageSize` or `totalItems` can leave `page` past the last page; pull it back
    // so the strip never points at a page that no longer exists.
    effect(() => {
      const pageCount = this.pageCount();
      if (this.page() > pageCount) {
        this.page.set(pageCount);
      } else if (this.page() < 1) {
        this.page.set(1);
      }
    });
  }

  protected pageSizeChanged(value: unknown): void {
    if (typeof value !== 'number') {
      return;
    }
    this.pageSize.set(value);
    this.page.set(1);
  }

  protected pageChanged(value: unknown): void {
    if (typeof value === 'number') {
      this.page.set(value);
    }
  }
}
