import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import './src/main.css';

import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { cdp } from 'vitest/browser';

setupTestBed({
  browserMode: true,
});

/*
 * Run every test with `prefers-reduced-motion: reduce` so that the
 * `--drgn-motion-*` durations collapse to 0.001ms. Animations become instant,
 * which keeps tests fast and deterministic (e.g. the select portal detaches
 * almost synchronously instead of waiting for its exit animation).
 */
beforeAll(async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
});

afterAll(async () => {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
  });
});
