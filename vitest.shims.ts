import 'vitest';

declare module 'vitest' {
  interface TestTags {
    tags: 'unit' | 'component';
  }
}
