import { Component, signal } from '@angular/core';
import { form, FormField, minLength, pattern, required } from '@angular/forms/signals';
import { render } from '@wismaz/vitest-browser-angular';
import { userEvent, type Locator } from 'vitest/browser';

import { Checkbox } from '@dragone/ui/checkbox';

import { FieldErrorTemplate } from './error/field-error-template';
import { Field } from './field';

@Component({
  imports: [Field, FormField],
  template: `
    <drgn-field label="Name">
      <input data-testid="input" [formField]="form.name" />
    </drgn-field>
  `,
})
class DefaultHost {
  readonly form = form(signal({ name: '' }), schema => {
    required(schema.name, { message: 'This field is required' });
  });
}

@Component({
  imports: [Field, FieldErrorTemplate, FormField],
  template: `
    <drgn-field label="Name">
      <input data-testid="input" [formField]="form.name" />
      <ng-template let-error drgnTemplate="fieldError">
        <span class="custom-icon">!</span>
        <span class="custom-message">{{ error.message }}</span>
        <span class="custom-kind">{{ error.kind }}</span>
      </ng-template>
    </drgn-field>
  `,
})
class CustomTemplateHost {
  readonly form = form(signal({ name: '' }), schema => {
    required(schema.name, { message: 'This field is required' });
  });
}

@Component({
  imports: [Field, FieldErrorTemplate, FormField],
  template: `
    <drgn-field label="Code">
      <input data-testid="input" [formField]="form.code" />
      <ng-template let-error drgnTemplate="fieldError">
        <span class="custom-icon">!</span>
        <span class="custom-kind">{{ error.kind }}</span>
      </ng-template>
    </drgn-field>
  `,
})
class MultiErrorHost {
  readonly form = form(signal({ code: '' }), schema => {
    required(schema.code, { message: 'Required message' });
    minLength(schema.code, 5, { message: 'Too short message' });
    pattern(schema.code, /^[A-Z]+$/, { message: 'Uppercase only message' });
  });
}

@Component({
  imports: [Field, Checkbox, FormField],
  template: `
    <drgn-field label="Accept" description="Please accept">
      <drgn-checkbox [formField]="form.accepted" />
    </drgn-field>
  `,
})
class CheckboxHost {
  readonly form = form(signal({ accepted: false }), schema => {
    required(schema.accepted, { message: 'This field is required' });
  });
}

/** Focus the control, then move focus away so the field is marked as touched. */
async function touch(control: Locator) {
  await control.click();
  await userEvent.keyboard('{Tab}');
}

describe(Field, () => {
  it('does not render errors while the field is pristine', async () => {
    const { locator } = await render(DefaultHost);

    await expect.element(locator.getByTestId('input')).toBeInTheDocument();
    await expect.element(locator.getByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the default error message once touched', async () => {
    const { locator } = await render(DefaultHost);
    await touch(locator.getByTestId('input'));

    const alert = locator.getByRole('alert');
    await expect.element(alert).toBeInTheDocument();
    await expect.element(alert).toHaveTextContent('This field is required');
  });

  it('associates the error with the control via aria-describedby', async () => {
    const { locator } = await render(CheckboxHost);
    const checkbox = locator.getByRole('checkbox');
    // Toggle twice so the value ends up invalid (false) again
    await checkbox.click();
    await checkbox.click();
    await userEvent.keyboard('{Tab}');

    const description = locator.getByText('Please accept');
    const error = locator.getByRole('alert').getByText('This field is required');
    await expect.element(description).toBeInTheDocument();
    await expect.element(error).toBeInTheDocument();

    // Aria-describedby must reference both the description and the error, in that order
    const describedBy = checkbox.element().getAttribute('aria-describedby') ?? '';
    expect(describedBy.split(' ')).toEqual([description.element().id, error.element().id]);
  });

  describe('custom error template', () => {
    it('replaces the default message with the projected template', async () => {
      const { locator } = await render(CustomTemplateHost);
      await touch(locator.getByTestId('input'));

      const alert = locator.getByRole('alert');
      await expect.element(alert).toHaveTextContent('!');
      // The projected template replaces the default message instead of duplicating it
      expect(alert.getByText('This field is required', { exact: true }).elements()).toHaveLength(1);
      expect(alert.getByText('!', { exact: true }).elements()).toHaveLength(1);
    });

    it('exposes kind and message in the template context', async () => {
      const { locator } = await render(CustomTemplateHost);
      await touch(locator.getByTestId('input'));

      await expect
        .element(locator.getByRole('alert').getByText('required', { exact: true }))
        .toBeInTheDocument();
    });

    it('renders one instance per error when multiple validators fail', async () => {
      const { locator } = await render(MultiErrorHost);
      const input = locator.getByTestId('input');
      // "abc" is non-empty (required passes) but too short and lowercase
      await input.fill('abc');
      await userEvent.keyboard('{Tab}');

      const alert = locator.getByRole('alert');
      await expect.element(alert).toBeInTheDocument();
      // One icon per failed validator
      expect(alert.getByText('!', { exact: true }).elements()).toHaveLength(2);
      const kinds = alert
        .getByText(/^(minLength|pattern)$/)
        .elements()
        .map(el => el.textContent?.trim());
      expect(kinds).toEqual(['minLength', 'pattern']);
      // A single live region wraps all errors: one announcement only
      expect(alert.elements()).toHaveLength(1);
    });
  });
});
