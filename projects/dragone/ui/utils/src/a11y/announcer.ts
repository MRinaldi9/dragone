import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DestroyRef, Directive, inject, InjectionToken, type Provider } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';

import { sleep } from '../predicates/sleep';

/**
 * Default delay between consecutive announcements in a sequence.
 * `LiveAnnouncer` clears the live region on every `announce()` call, so rapid
 * successive calls would override each other and only the last message would
 * be read. This delay gives screen readers time to finish the previous message.
 */
export const ANNOUNCEMENT_DELAY_MS = 500;

/**
 * Injection token to override the default delay between consecutive
 * announcements. Provide it via {@link provideAnnouncementDelay}.
 */
export const ANNOUNCEMENT_DELAY = new InjectionToken<number>('ANNOUNCEMENT_DELAY', {
  providedIn: 'root',
  factory: (): number => ANNOUNCEMENT_DELAY_MS,
});

/** Provides a custom delay between consecutive announcements. */
export const provideAnnouncementDelay = (delayMs: number): Provider => ({
  provide: ANNOUNCEMENT_DELAY,
  useValue: delayMs,
});

export interface AnnouncerState {
  announce: (message: string) => void;
  announceSequence: (messages: string[], delayMs?: number) => void;
  clear: () => void;
}

export const [, announcerFactory, injectAnnouncerState, provideAnnouncerState] = createPrimitive(
  'Announcer',
  ({ announce, announceSequence, clear }: AnnouncerState) => ({
    announce,
    announceSequence,
    clear,
  }),
);

@Directive({
  selector: '[drgnAnnouncer]',
  providers: [provideAnnouncerState({ inherit: false })],
})
export class Announcer {
  readonly #liveAnnouncer = inject(LiveAnnouncer);
  readonly #destroyRef = inject(DestroyRef);
  readonly #announcementDelayMs = inject(ANNOUNCEMENT_DELAY);
  /** Id that invalidates in-flight sequences superseded by a newer announcement. */
  #announcementId = 0;

  constructor() {
    announcerFactory({
      announce: this.announce,
      announceSequence: this.announceSequence,
      clear: this.clear,
    });
  }

  /** Announces a single message, cancelling any in-flight sequence. */
  announce = (message: string): void => {
    this.#announcementId += 1;
    this.#liveAnnouncer.announce(message);
  };

  /**
   * Announces each message in order, waiting `delayMs` between messages so the
   * screen reader can finish reading the previous one. A newer `announce`,
   * `announceSequence` or `clear` call, or component destruction, cancels the
   * sequence.
   */
  announceSequence = (messages: string[], delayMs = this.#announcementDelayMs): void => {
    this.#announcementId += 1;
    const announcementId = this.#announcementId;
    this.#announceNext(messages, 0, delayMs, announcementId);
  };

  clear = (): void => {
    this.#announcementId += 1;
    this.#liveAnnouncer.clear();
  };

  async #announceNext(
    messages: string[],
    index: number,
    delayMs: number,
    announcementId: number,
  ): Promise<void> {
    // A newer announcement or component destruction supersedes this sequence.
    if (announcementId !== this.#announcementId || this.#destroyRef.destroyed) return;

    const message = messages[index];
    if (!message) return;

    this.#liveAnnouncer.announce(message);

    if (index < messages.length - 1) {
      await sleep(delayMs);
      await this.#announceNext(messages, index + 1, delayMs, announcementId);
    }
  }
}
