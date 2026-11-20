import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEllipsisVertical } from '@ng-icons/font-awesome/solid';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

import { Button } from '@dragone/ui/button';
import { injectLayoutState, Layout, TestId, Theme } from '@dragone/ui/utils';

/** Heading level (`1` to `6`) exposed when `titleAsHeading` is enabled. */
export type TitleBarHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Configuration for an action rendered inside a `TitleBar`. */
export interface TitleBarActionItem {
  /**
   * Unique identifier for tracking the action when multiple actions share a label (defaults to
   * label when omitted).
   */
  id?: string;
  /** Text label of the action, also used as accessible name and mobile overflow menu item label. */
  label: string;
  /** Optional icon name (registered via `provideIcons`) or raw `<svg>` string. */
  icon?: string;
  /** Whether the inline button hides its text label and renders only the icon. */
  iconOnly?: boolean;
  /** Whether the action is disabled. */
  disabled?: boolean;
  /** Optional callback invoked when the action is triggered. */
  onClick?: () => void;
}

/**
 * Page header with a title, an optional subtitle, and a list of action buttons. On the mobile
 * layout, two or more actions collapse into an overflow menu.
 */
@Component({
  selector: 'drgn-title-bar',
  imports: [Button, NgIcon, NgpMenu, NgpMenuItem, NgpMenuTrigger, TestId],
  templateUrl: './title-bar.html',
  styleUrl: './title-bar.css',
  providers: [provideIcons({ faSolidEllipsisVertical })],
  host: {
    '[attr.data-collapsed]': 'isCollapsed() ? "" : null'
  },
  hostDirectives: [
    { directive: Theme, inputs: ['theme'] },
    { directive: Layout, inputs: ['drgnLayout:layout'] }
  ]
})
export class TitleBar {
  /** Required title text rendered in the title bar. */
  readonly title = input.required<string>();
  /** Optional subtitle text rendered below the title. */
  readonly subtitle = input<string>();
  /**
   * Whether the title is exposed with heading semantics.
   *
   * @default false
   */
  readonly titleAsHeading = input(false, { transform: booleanAttribute });
  /**
   * Heading level used when `titleAsHeading` is true.
   *
   * @default 5
   */
  readonly headingLevel = input<TitleBarHeadingLevel>(5);
  /**
   * Action buttons rendered on the trailing side of the title bar.
   *
   * @default [ ]
   */
  readonly actions = input<readonly TitleBarActionItem[]>([]);
  /**
   * Whether multiple actions collapse into an overflow menu on mobile layout.
   *
   * @default true
   */
  readonly collapseActions = input(true, { transform: booleanAttribute });
  /**
   * Accessible name for the mobile overflow trigger and menu.
   *
   * @default 'Altre azioni'
   */
  readonly overflowMenuLabel = input('Altre azioni');
  /** Emits the activated action item when an inline or overflow action is clicked. */
  readonly actionClick = output<TitleBarActionItem>();

  readonly #layoutState = injectLayoutState();
  protected readonly isCollapsed = computed(
    () =>
      this.#layoutState().layout() === 'mobile' &&
      this.collapseActions() &&
      this.actions().length > 1
  );

  protected isSvgIcon(icon: string): boolean {
    return icon.trim().startsWith('<svg');
  }

  protected isIconOnlyAction(action: TitleBarActionItem): boolean {
    return Boolean(action.iconOnly && action.icon);
  }

  protected onActionClick(action: TitleBarActionItem): void {
    if (action.disabled) {
      return;
    }

    action.onClick?.();
    this.actionClick.emit(action);
  }
}
