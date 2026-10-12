import { DOCUMENT, isPlatformServer } from '@angular/common';
import {
  DestroyRef,
  inject,
  InjectionToken,
  PLATFORM_ID,
  signal,
  type Signal
} from '@angular/core';

/**
 * Reactive projection of `document.visibilityState`.
 *
 * This is an Angular DI token (not a Dragone Component Token): it is `providedIn: 'root'`, so
 * consumers only `inject()` it — no manual `provide` is needed. The `Signal` is read-only; updates
 * are pushed from the `visibilitychange` DOM event. On the server the initial value is exposed
 * without subscribing to events.
 */
export const DOCUMENT_VISIBILITY = new InjectionToken<Signal<DocumentVisibilityState>>(
  'DOCUMENT_VISIBILITY',
  {
    providedIn: 'root',
    factory: (): Signal<DocumentVisibilityState> => {
      const document = inject(DOCUMENT);
      const visibility = signal(document.visibilityState);

      if (isPlatformServer(inject(PLATFORM_ID))) {
        return visibility.asReadonly();
      }

      const { abort, signal: aSignal } = new AbortController();
      const update = (): void => visibility.set(document.visibilityState);
      document.addEventListener('visibilitychange', update, { signal: aSignal });
      inject(DestroyRef).onDestroy(abort);

      return visibility.asReadonly();
    }
  }
);

/**
 * Reactive projection of `document.activeElement`.
 *
 * Same inject-only contract as {@link DOCUMENT_VISIBILITY}; updates are pushed from the
 * `focusin`/`focusout` DOM events, which cover keyboard, pointer, and programmatic focus changes.
 */
export const DOCUMENT_ACTIVE_ELEMENT = new InjectionToken<Signal<Element | null>>(
  'DOCUMENT_ACTIVE_ELEMENT',
  {
    providedIn: 'root',
    factory: (): Signal<Element | null> => {
      const document = inject(DOCUMENT);
      const activeElement = signal(document.activeElement);

      if (isPlatformServer(inject(PLATFORM_ID))) {
        return activeElement.asReadonly();
      }

      const { abort, signal: aSignal } = new AbortController();
      const update = (): void => activeElement.set(document.activeElement);
      document.addEventListener('focusin', update, { signal: aSignal });
      document.addEventListener('focusout', update, {
        signal: aSignal
      });
      inject(DestroyRef).onDestroy(abort);

      return activeElement.asReadonly();
    }
  }
);

/**
 * Reactive projection of `document.title`.
 *
 * Direct assignments (`document.title = ...`) bypass any wrapper, so the change is observed with a
 * `MutationObserver` on `<head>` instead of an event listener. Same inject-only contract as
 * {@link DOCUMENT_VISIBILITY}.
 */
export const DOCUMENT_TITLE = new InjectionToken<Signal<string>>('DOCUMENT_TITLE', {
  providedIn: 'root',
  factory: (): Signal<string> => {
    const document = inject(DOCUMENT);
    const title = signal(document.title);

    if (isPlatformServer(inject(PLATFORM_ID))) {
      return title.asReadonly();
    }

    const update = (): void => title.set(document.title);
    const observer = new MutationObserver(update);
    observer.observe(document.head ?? document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
    inject(DestroyRef).onDestroy(() => observer.disconnect());

    return title.asReadonly();
  }
});

/**
 * Injects the reactive `document.visibilityState` projection.
 *
 * Primary API over {@link DOCUMENT_VISIBILITY}: consumers call this function instead of injecting
 * the DI token directly.
 */
export function injectDocumentVisibility(): Signal<DocumentVisibilityState> {
  return inject(DOCUMENT_VISIBILITY);
}

/**
 * Injects the reactive `document.activeElement` projection.
 *
 * Primary API over {@link DOCUMENT_ACTIVE_ELEMENT}: consumers call this function instead of
 * injecting the DI token directly.
 */
export function injectDocumentActiveElement(): Signal<Element | null> {
  return inject(DOCUMENT_ACTIVE_ELEMENT);
}

/** Writable reactive projection of `document.title`. */
export interface DocumentTitleState {
  /** Current title; also reflects writes that bypass {@link DocumentTitleState.setTitle}. */
  readonly title: Signal<string>;
  /**
   * Assigns `document.title`. The {@link DocumentTitleState.title} signal updates via the
   * `MutationObserver` behind {@link DOCUMENT_TITLE}, so the setter is safe to call from event
   * handlers — unlike a standalone function, it closes over the already-injected `Document` and
   * needs no injection context per call.
   */
  readonly setTitle: (title: string) => void;
}

/**
 * Injects the writable `document.title` projection.
 *
 * Primary API over {@link DOCUMENT_TITLE}: consumers call this function instead of injecting the DI
 * token directly.
 */
export function injectDocumentTitle(): DocumentTitleState {
  const document = inject(DOCUMENT);
  return {
    title: inject(DOCUMENT_TITLE),
    setTitle: (title: string): void => {
      document.title = title;
    }
  };
}
