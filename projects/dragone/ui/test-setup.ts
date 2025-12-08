import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { ɵgetCleanupHook as getCleanupHook } from '@angular/core/testing';
import { afterEach, beforeEach } from 'vitest';

beforeEach(getCleanupHook(false));
afterEach(getCleanupHook(true));
setupTestBed();
