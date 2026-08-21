import type { Provider } from '@angular/core';

export class Logger {
  readonly #prefix: string;

  constructor(componentName: string) {
    this.#prefix = `[Dragone UI] ${componentName}`;
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    console.warn(`${this.#prefix}: ${message}`, ...optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]): void {
    console.error(`${this.#prefix}: ${message}`, ...optionalParams);
  }
}

export const provideLogger = (componentName: string): Provider => ({
  provide: Logger,
  useFactory: () => new Logger(componentName),
});
