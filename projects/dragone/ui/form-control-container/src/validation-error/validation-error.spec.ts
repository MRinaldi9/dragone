import { ValidationError } from './validation-error';

describe(ValidationError, () => {
  it('should create an instance', () => {
    const directive = new ValidationError();
    expect(directive).toBeTruthy();
  });
});
