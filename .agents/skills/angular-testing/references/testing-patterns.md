# Angular Testing Patterns

## Table of Contents
- [Vitest Advanced Patterns](#vitest-advanced-patterns)
- [Template Interactions with vitest-browser userEvent](#template-interactions-with-vitest-browser-userevent)
- [Component Harnesses](#component-harnesses)
- [Testing Router](#testing-router)
- [Testing Forms](#testing-forms)
- [Testing Directives](#testing-directives)
- [Testing Pipes](#testing-pipes)
- [E2E Testing Setup](#e2e-testing-setup)

## Vitest Advanced Patterns

### Snapshot Testing

```typescript
import { inputBinding, signal } from '@angular/core';
import { describe, it, expect } from 'vitest';

describe('UserCard', () => {
  it('should match snapshot', async () => {
    const user = signal({ id: '1', name: 'John', email: 'john@example.com' });
    const fixture = TestBed.createComponent(UserCard, {
      bindings: [inputBinding('user', user)],
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.innerHTML).toMatchSnapshot();
  });
});
```

### Parameterized Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Validator', () => {
  it.each([
    { input: '', expected: false },
    { input: 'test', expected: false },
    { input: 'test@example.com', expected: true },
    { input: 'invalid@', expected: false },
  ])('should validate email "$input" as $expected', ({ input, expected }) => {
    expect(isValidEmail(input)).toBe(expected);
  });
});
```

### Testing with Fake Timers

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Debounced Search', () => {

  it('should debounce search input', async () => {
    setUpFastForward();
    const fixture = TestBed.createComponent(Search);
    await fixture.whenStable();

    fixture.componentInstance.query.set('test');

    // Search not called yet
    expect(fixture.componentInstance.results()).toEqual([]);

    await fixture.whenStable();

    expect(fixture.componentInstance.results().length).toBeGreaterThan(0);
  });
});

function setUpFastForward() {
  vi.useFakeTimers().setTimerTickMode('nextTimerAsync');
  onTestFinished(() => {
    vi.useRealTimers();
  });
}
```

### Module Mocking

```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock entire module
vi.mock('./analytics.service', () => ({
  Analytics: class {
    track = vi.fn();
    identify = vi.fn();
  },
}));

describe('with mocked analytics', () => {
  it('should track events', async () => {
    const fixture = TestBed.createComponent(Dashboard);
    const analytics = TestBed.inject(Analytics);

    await fixture.whenStable();

    expect(analytics.track).toHaveBeenCalledWith('dashboard_viewed');
  });
});
```

### Testing Async/Await

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('User', () => {
  it('should load user data', async () => {
    const mockUser = { id: '1', name: 'Test' };
    const httpMock = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(User);

    const userPromise = service.loadUser('1');

    httpMock.expectOne('/api/users/1').flush(mockUser);

    const user = await userPromise;
    expect(user).toEqual(mockUser);
    httpMock.verify();
  });
});
```

### Coverage Configuration

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

### Vitest UI Mode

```bash
# Run with UI
npx vitest --ui

# Open UI at specific port
npx vitest --ui --port 51204
```

### Concurrent Tests

```typescript
import { describe, it, expect } from 'vitest';

// Run tests in this describe block concurrently
describe.concurrent('API calls', () => {
  it('should fetch users', async () => {
    // ...
  });

  it('should fetch products', async () => {
    // ...
  });

  it('should fetch orders', async () => {
    // ...
  });
});
```

### Test Fixtures

```typescript
import { inputBinding, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

// Shared test fixtures
const createTestUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

const createTestProduct = (overrides = {}) => ({
  id: '1',
  name: 'Test Product',
  price: 99.99,
  ...overrides,
});

describe('Order', () => {
  it('should calculate total', async () => {
    const user = signal(createTestUser());
    const products = signal([
      createTestProduct({ price: 10 }),
      createTestProduct({ id: '2', price: 20 }),
    ]);

    const fixture = TestBed.createComponent(Order, {
      bindings: [
        inputBinding('user', user),
        inputBinding('products', products),
      ],
    });
    await fixture.whenStable();

    expect(fixture.componentInstance.total()).toBe(30);
  });
});
```

## Template Interactions with vitest-browser userEvent

Use `userEvent` for realistic DOM interactions in browser-mode tests. Keep assertions focused on user-visible output and always stabilize after interaction.

```typescript
import { page, userEvent } from 'vitest/browser';

it('should type and submit with keyboard', async () => {
  const fixture = TestBed.createComponent(Login);
  await fixture.whenStable();

  const emailInput = page.getByRole('textbox', { name: 'Email' });
  await userEvent.type(emailInput, 'test@example.com');
  await fixture.whenStable();

  await userEvent.keyboard('{Enter}');
  await fixture.whenStable();

  await expect.element(page.getByText('Welcome')).toBeInTheDocument();
});
```

### Common patterns

```typescript
import { page, userEvent } from 'vitest/browser';

// Click a button or link
await userEvent.click(page.getByRole('button', { name: 'Save' }));
await fixture.whenStable();

// Type into an input (fires input-related events in sequence)
await userEvent.type(page.getByLabelText('Search'), 'angular');
await fixture.whenStable();

// Clear and replace value
const query = page.getByLabelText('Search');
await userEvent.clear(query);
await userEvent.type(query, 'signals');
await fixture.whenStable();

// Keyboard navigation and activation
await userEvent.keyboard('{Tab}{Tab}{Enter}');
await fixture.whenStable();
```

### Recommendation

- Prefer semantic queries (`getByRole`, `getByLabelText`, `getByText`) over CSS selectors.
- Keep event triggering close to the assertion it supports.
- Use `page` helpers for element discovery and `userEvent` for interaction.

## Testing Router

### RouterTestingHarness

```typescript
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';

describe('Router Navigation', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: Home },
          { path: 'users/:id', component: UserCmpt },
        ]),
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
  });

  it('should navigate to user page', async () => {
    const component = await harness.navigateByUrl('/users/123', UserCmpt);

    expect(component.id()).toBe('123');
  });

  it('should display user name', async () => {
    await harness.navigateByUrl('/users/123');

    expect(harness.routeNativeElement?.textContent).toContain('User 123');
  });
});
```

### Testing Guards

```typescript
describe('AuthGuard', () => {
  let authService: jasmine.SpyObj<Auth>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('Auth', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: authService },
        provideRouter([
          { path: 'login', component: Login },
          {
            path: 'dashboard',
            component: Dashboard,
            canActivate: [authGuard],
          },
        ]),
      ],
    });
  });

  it('should allow access when authenticated', async () => {
    authService.isAuthenticated.and.returnValue(true);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard');

    expect(harness.routeNativeElement?.textContent).toContain('Dashboard');
  });

  it('should redirect to login when not authenticated', async () => {
    authService.isAuthenticated.and.returnValue(false);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard');

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
```

## Testing Forms

### Testing Signal Forms

```typescript
import { form, FormField, required, email } from '@angular/forms/signals';
import { page } from 'vitest/browser';

@Component({
  imports: [FormField],
  template: `
    <form (submit)="onSubmit($event)">
      <input [formField]="loginForm.email" />
      <input [formField]="loginForm.password" type="password" />
      <button type="submit" [disabled]="loginForm().invalid()">Submit</button>
    </form>
  `,
})
export class Login {
  model = signal({ email: '', password: '' });
  loginForm = form(this.model, (schemaPath) => {
    required(schemaPath.email);
    email(schemaPath.email);
    required(schemaPath.password);
  });

  submitted = signal(false);

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      this.submitted.set(true);
    }
  }
}

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should be invalid when empty', () => {
    expect(component.loginForm().invalid()).toBeTrue();
  });

  it('should be valid with correct data', () => {
    component.model.set({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(component.loginForm().valid()).toBeTrue();
  });

  it('should show email error for invalid email', async () => {
    component.loginForm.email().value.set('invalid');
    await fixture.whenStable();

    expect(component.loginForm.email().invalid()).toBeTrue();
    expect(component.loginForm.email().errors().some(e => e.kind === 'email')).toBeTrue();
  });

  it('should disable submit button when invalid', async () => {
    await expect.element(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });
});
```

### Testing Reactive Forms

```typescript
import { page } from 'vitest/browser';

describe('ReactiveForm', () => {
  it('should validate form', () => {
    const fixture = TestBed.createComponent(ProfileForm);
    const component = fixture.componentInstance;

    expect(component.form.valid).toBeFalse();

    component.form.patchValue({
      name: 'John',
      email: 'john@example.com',
    });

    expect(component.form.valid).toBeTrue();
  });

  it('should show validation errors', async () => {
    const fixture = TestBed.createComponent(ProfileForm);
    await fixture.whenStable();

    const emailControl = fixture.componentInstance.form.controls.email;
    emailControl.setValue('invalid');
    emailControl.markAsTouched();
    await fixture.whenStable();

    await expect.element(page.getByText('Invalid email')).toBeInTheDocument();
  });
});
```

## Testing Directives

### Attribute Directive

```typescript
import { page } from 'vitest/browser';

@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.backgroundColor]': 'color()',
  },
})
export class Highlight {
  color = input('yellow', { alias: 'appHighlight' });
}

describe('Highlight', () => {
  @Component({
    imports: [Highlight],
    template: `<p appHighlight="lightblue">Test</p>`,
  })
  class Test {}

  it('should apply background color', async () => {
    const fixture = TestBed.createComponent(Test);
    await fixture.whenStable();

    const p = page.getByText('Test').element() as HTMLParagraphElement;
    expect(p.style.backgroundColor).toBe('lightblue');
  });
});
```

### Structural Directive

```typescript
import { page } from 'vitest/browser';

@Directive({
  selector: '[appIf]',
})
export class If {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  condition = input.required<boolean>({ alias: 'appIf' });

  constructor() {
    effect(() => {
      if (this.condition()) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}

describe('If', () => {
  @Component({
    imports: [If],
    template: `<p *appIf="show()">Visible</p>`,
  })
  class TestCmpt {
    show = signal(false);
  }

  it('should show content when condition is true', async () => {
    const fixture = TestBed.createComponent(TestCmpt);
    await fixture.whenStable();

    await expect.element(page.getByText('Visible')).not.toBeInTheDocument();

    fixture.componentInstance.show.set(true);
    await fixture.whenStable();

    await expect.element(page.getByText('Visible')).toBeInTheDocument();
  });
});
```

## Testing Pipes

```typescript
@Pipe({ name: 'truncate' })
export class Truncate implements PipeTransform {
  transform(value: string, length: number = 50): string {
    if (value.length <= length) return value;
    return value.substring(0, length) + '...';
  }
}

describe('Truncate', () => {
  let pipe: Truncate;

  beforeEach(() => {
    pipe = new Truncate();
  });

  it('should not truncate short strings', () => {
    expect(pipe.transform('Hello', 10)).toBe('Hello');
  });

  it('should truncate long strings', () => {
    expect(pipe.transform('Hello World', 5)).toBe('Hello...');
  });

  it('should use default length', () => {
    const longString = 'a'.repeat(60);
    const result = pipe.transform(longString);
    expect(result.length).toBe(53); // 50 + '...'
  });
});
```

## E2E Testing Setup

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toBeVisible();
    await expect(page.locator('.error')).toContainText('Invalid credentials');
  });
});
```
