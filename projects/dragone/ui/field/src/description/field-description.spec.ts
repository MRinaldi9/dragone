import { FieldDescription } from './field-description';

describe(FieldDescription, () => {
  it('should create an instance', () => {
    const directive = new FieldDescription();
    expect(directive).toBeTruthy();
  });
});
