import { booleanAttribute, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronLeft, faSolidChevronRight } from '@ng-icons/font-awesome/solid';
import { NgpFocusVisible } from 'ng-primitives/interactions';
import {
  injectPaginationState,
  NgpPagination,
  NgpPaginationButton,
  NgpPaginationNext,
  NgpPaginationPrevious
} from 'ng-primitives/pagination';

import { buildPageWindow } from './utils/page-window';

/**
 * A page strip: previous/next buttons around the numbered pages, with an ellipsis where a run of
 * pages is skipped. Behavior — page state, boundary disabling, keyboard handling, `aria-current` —
 * comes from the ng-primitives Pagination Primitive; this Component adds the Sirio look.
 * `PaginationComplex` composes it as its strip.
 *
 * `page` is a controlled input: bind it two-way (`[(page)]`) so the strip can navigate — a one-way
 * `[page]` binding pins the page, and the strip would emit `pageChange` without moving. `pageCount`
 * and `disabled` are plain inputs, remapped from the Primitive. The host is the `navigation`
 * landmark.
 */
@Component({
  selector: 'drgn-pagination',
  imports: [NgIcon, NgpPaginationButton, NgpPaginationNext, NgpPaginationPrevious, NgpFocusVisible],
  template: `
    <!-- role="list" restores the list semantics WebKit drops for list-style: none. -->
    <ul role="list">
      @if (showNav()) {
        <li>
          <button
            type="button"
            ngpPaginationPrevious
            ngpFocusVisible
            [attr.aria-label]="previousLabel()"
          >
            <ng-icon name="faSolidChevronLeft" />
          </button>
        </li>
      }

      @if (showPages()) {
        @for (item of pages(); track item.key) {
          @if (item.kind === 'page') {
            <li>
              <button
                type="button"
                class="page-tile"
                ngpPaginationButton
                ngpFocusVisible
                [ngpPaginationButtonPage]="item.page"
                [attr.aria-label]="pageAriaLabel(item.page)"
              >
                {{ item.page }}
              </button>
            </li>
          } @else {
            <li aria-hidden="true" class="ellipsis">…</li>
          }
        }
      }

      @if (showNav()) {
        <li>
          <button type="button" ngpPaginationNext ngpFocusVisible [attr.aria-label]="nextLabel()">
            <ng-icon name="faSolidChevronRight" />
          </button>
        </li>
      }
    </ul>
  `,
  styleUrl: './pagination.css',
  providers: [provideIcons({ faSolidChevronLeft, faSolidChevronRight })],
  host: {
    '[attr.aria-label]': 'ariaLabel()'
  },
  hostDirectives: [
    {
      directive: NgpPagination,
      inputs: [
        'ngpPaginationPage:page',
        'ngpPaginationPageCount:pageCount',
        'ngpPaginationDisabled:disabled'
      ],
      outputs: ['ngpPaginationPageChange:pageChange']
    }
  ]
})
export class Pagination {
  /**
   * Sizes the strip: it always renders `siblingCount * 2 + 3` cells — the first page, the last page
   * and, between them, a window of page numbers centred on the current page, with a leading
   * ellipsis from the third page on. A constant cell count is what keeps the strip's width from
   * jumping as the user navigates, and centring the window is what leaves the page before the
   * current one on screen, so stepping back is a click on a page number rather than a trip to the
   * previous button. Near the ends the window cannot stay centred and spends the spare cell on one
   * more page number. `siblingCount="1"` is the narrowest budget and shows a single page number
   * mid-strip, where the current page has no neighbour to click. Values below 1 are treated as 1.
   *
   * @default 2
   */
  readonly siblingCount = input(2);
  /**
   * Whether to render the numbered page buttons. Turn it off for a nav-only strip.
   *
   * @default true
   */
  readonly showPages = input(true, { transform: booleanAttribute });
  /**
   * Whether to render the previous/next buttons. Turn it off for a pages-only strip.
   *
   * @default true
   */
  readonly showNav = input(true, { transform: booleanAttribute });
  /**
   * The accessible name of the navigation landmark.
   *
   * @default 'Paginazione'
   */
  readonly ariaLabel = input('Paginazione');
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

  readonly #state = injectPaginationState();

  protected readonly pages = computed(() =>
    buildPageWindow(this.#state().page(), this.#state().pageCount(), this.siblingCount())
  );

  protected pageAriaLabel(page: number): string {
    return `${this.pageLabel()} ${page}`;
  }
}
