import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import './src/main.css';

import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed({
  browserMode: true,
});
