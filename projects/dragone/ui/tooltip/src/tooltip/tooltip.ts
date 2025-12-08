import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { Button } from '@dragone/ui/button';
import { NgpTooltip, injectTooltipContext } from 'ng-primitives/tooltip';

export type TooltipContext =
  | string
  | { title?: string; body?: string }
  | { title?: string; body?: string; action: () => void; actionLabel: string };

@Component({
  imports: [Button],
  template: `
    @if (isSimpleTooltip()) {
      <span class="drgn-label-md-700">{{ titleTooltip() }}</span>
    } @else {
      <div class="container">
        @if (titleTooltip()) {
          <strong class="drgn-label-md-700">{{ titleTooltip() }}</strong>
        }
        @if (bodyTooltip()) {
          <p class="drgn-p-md-01">{{ bodyTooltip() }}</p>
        }
        @let actionCtx = actionTooltip();
        @if (actionCtx) {
          <footer class="drgn-dark">
            <button drgn-button variant="tertiary" (click)="actionCtx.action()">
              {{ actionCtx.label }}
            </button>
          </footer>
        }
      </div>
    }
  `,
  styleUrl: './tooltip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpTooltip],
})
export class Tooltip {
  protected content = injectTooltipContext<TooltipContext>();

  protected isSimpleTooltip = computed(() => {
    const context = this.content();
    return typeof context === 'string';
  });

  protected titleTooltip = computed(() => {
    const context = this.content();
    if (typeof context === 'string') {
      return context;
    }
    return context?.title;
  });

  protected bodyTooltip = computed(() => {
    const context = this.content();
    if (typeof context === 'string') {
      return undefined;
    }
    return context?.body;
  });

  protected actionTooltip = computed(() => {
    const context = this.content();
    if (typeof context === 'string' || !('action' in context)) {
      return undefined;
    }
    return { action: context.action, label: context.actionLabel };
  });
}
