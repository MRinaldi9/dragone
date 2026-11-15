import { booleanAttribute, Component, computed, effect, input, model } from '@angular/core';

import { Select } from '@dragone/ui/select';

import { Simple } from '../simple/simple';

/**
 * Full pagination bar (`PaginationFull`): combines an optional page-size select, item range
 * summary, page jumper, and previous/next navigation strip derived from `totalItems` and
 * `pageSize`.
 */
@Component({
  selector: 'drgn-pagination-full',
  imports: [Select, Simple],
  templateUrl: './full.html',
  styleUrl: './full.css'
})
export class Full {
  /** The total number of items spread across all pages. */
  readonly totalItems = input.required<number>();
  /**
   * The current page (1-based). Bind two-way with `[(page)]`.
   *
   * @default 1
   */
  readonly page = model(1);
  /**
   * Number of items per page. Bind two-way with `[(pageSize)]`.
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
   * Whether to render the previous/next strip, with its white cursor tile.
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

  protected readonly showItemsSection = computed(() => this.showPageSize() || this.showRange());
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
