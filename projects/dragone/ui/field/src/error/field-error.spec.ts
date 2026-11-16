import { FieldError } from './field-error';

describe(FieldError, () => {
  it('should create an instance', () => {
    const directive = new FieldError();
    expect(directive).toBeTruthy();
  });
});
