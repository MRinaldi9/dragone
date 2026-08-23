import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, type Provider } from '@angular/core';
import { render } from '@wismaz/vitest-browser-angular';

import { setUpFastForward, setUpManualForward } from '@dragone/ui/tests/setup-timer-mode';

import { Announcer, injectAnnouncerState, provideAnnouncementDelay } from './announcer';

@Component({
  selector: 'drgn-announcer-host',
  template: '',
  hostDirectives: [Announcer],
})
class AnnouncerHost {
  readonly announcer = injectAnnouncerState();
}

describe(Announcer, () => {
  const liveAnnouncer = {
    announce: vi.fn<(message: string) => Promise<void>>(),
    clear: vi.fn<() => void>(),
  };

  const renderHost = (providers: Provider[] = []) =>
    render(AnnouncerHost, {
      providers: [{ provide: LiveAnnouncer, useValue: liveAnnouncer }, ...providers],
    });

  afterEach(() => {
    vi.restoreAllMocks();
    liveAnnouncer.announce.mockReset();
    liveAnnouncer.clear.mockReset();
  });

  it('should announce a single message', async () => {
    const { componentClassInstance } = await renderHost();

    componentClassInstance.announcer().announce('Hello');

    expect(liveAnnouncer.announce).toHaveBeenCalledWith('Hello');
  });

  it('should announce each message in a sequence, spaced by a delay', async () => {
    setUpFastForward();
    const { componentClassInstance } = await renderHost();

    componentClassInstance.announcer().announceSequence(['first', 'second']);

    // The first message is announced synchronously; the rest follow after the delay.
    expect(liveAnnouncer.announce).toHaveBeenCalledOnce();
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('first');

    // Fast-forward through the delay between messages.
    await vi.runAllTimersAsync();

    expect(liveAnnouncer.announce).toHaveBeenCalledTimes(2);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('second');
  });

  it('should cancel an in-flight sequence when a new announcement is made', async () => {
    setUpFastForward();
    const { componentClassInstance } = await renderHost();
    const announcer = componentClassInstance.announcer();

    announcer.announceSequence(['first', 'second']);
    announcer.announce('interrupt');

    await vi.runAllTimersAsync();

    expect(liveAnnouncer.announce).toHaveBeenCalledTimes(2);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('first');
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('interrupt');
    expect(liveAnnouncer.announce).not.toHaveBeenCalledWith('second');
  });

  it('should cancel an in-flight sequence when a newer sequence starts', async () => {
    setUpFastForward();
    const { componentClassInstance } = await renderHost();
    const announcer = componentClassInstance.announcer();

    announcer.announceSequence(['first', 'second']);
    announcer.announceSequence(['third']);

    await vi.runAllTimersAsync();

    expect(liveAnnouncer.announce).toHaveBeenCalledTimes(2);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('first');
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('third');
    expect(liveAnnouncer.announce).not.toHaveBeenCalledWith('second');
  });

  it('should use a custom delay provided via the token', async () => {
    // Manual mode: the precise delay is the behavior under test.
    setUpManualForward();
    const { componentClassInstance } = await renderHost([provideAnnouncementDelay(100)]);

    componentClassInstance.announcer().announceSequence(['first', 'second']);

    await vi.advanceTimersByTimeAsync(99);
    expect(liveAnnouncer.announce).not.toHaveBeenCalledWith('second');

    await vi.advanceTimersByTimeAsync(1);
    expect(liveAnnouncer.announce).toHaveBeenCalledTimes(2);
    expect(liveAnnouncer.announce).toHaveBeenCalledWith('second');
  });

  it('should clear the live region', async () => {
    const { componentClassInstance } = await renderHost();

    componentClassInstance.announcer().clear();

    expect(liveAnnouncer.clear).toHaveBeenCalledOnce();
  });
});
