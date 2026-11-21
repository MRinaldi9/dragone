import { Logger } from './logger';

describe(Logger, () => {
  const noop = () => undefined;
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(noop);
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);

  afterEach(() => {
    warnSpy.mockClear();
    errorSpy.mockClear();
  });

  it('should prefix warn messages with the component name', () => {
    new Logger('Button').warn('message', { detail: 1 });
    expect(warnSpy).toHaveBeenCalledWith('[Dragone UI] Button: message', { detail: 1 });
  });

  it('should prefix error messages with the component name', () => {
    new Logger('Button').error('message');
    expect(errorSpy).toHaveBeenCalledWith('[Dragone UI] Button: message');
  });
});
