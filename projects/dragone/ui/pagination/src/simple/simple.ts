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

import { buildPageWindow } from '../utils/page-window';

/**
 * Page strip (`PaginationSimple`): renders previous/next buttons around numbered pages and
 * ellipses. Bind `[(page)]` two-way to navigate across `pageCount` pages.
 */
@Component({
  selector: 'drgn-pagination-simple',
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
  styleUrl: './simple.css',
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
export class Simple {
  /**
   * Number of sibling pages around the current page (`siblingCount * 2 + 3` total strip cells;
   * values below 1 are clamped to 1).
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
