/**
 * Installs fake timers in "fast-forward" mode: the clock advances on its own
 * whenever a timer is scheduled, so tests don't need to know the delays.
 */
export const setUpFastForward = (): void => {
  vi.useFakeTimers().setTimerTickMode('nextTimerAsync');
  onTestFinished(() => {
    vi.useRealTimers();
  });
};

export const setUpManualForward = (): void => {
  vi.useFakeTimers();
  onTestFinished(() => {
    vi.useRealTimers();
  });
};
