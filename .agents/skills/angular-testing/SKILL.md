---
name: angular-testing
description: Write unit and integration tests for Angular v21+ applications using Vitest with TestBed and modern testing patterns. Use for testing components with signals, OnPush change detection, services with inject(), and HTTP interactions. Triggers on test creation, testing signal-based components, mocking dependencies, or setting up test infrastructure. Don't use for E2E testing with Cypress or Playwright, or for testing non-Angular JavaScript/TypeScript code.
---

# Angular Testing

Test Angular v21+ applications with Vitest, focusing on signal-based components and modern patterns.

## Basic Component Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { Counter } from './counter.component';

describe('Counter', () => {
  let component: Counter;
  let fixture: ComponentFixture<Counter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Counter], // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(Counter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should increment count', () => {
    expect(component.count()).toBe(0);
    component.increment();
    expect(component.count()).toBe(1);
  });

  it('should display count in template', async () => {
    component.count.set(5);
    await fixture.whenStable();

    await expect.element(page.getByText('5')).toBeInTheDocument();
  });
});
```

## Testing Signals

### Direct Signal Testing

```typescript
import { signal, computed } from '@angular/core';

describe('Signal logic', () => {
  it('should update computed when signal changes', () => {
    const count = signal(0);
    const doubled = computed(() => count() * 2);

    expect(doubled()).toBe(0);

    count.set(5);
    expect(doubled()).toBe(10);

    count.update(c => c + 1);
    expect(doubled()).toBe(12);
  });
});
```

### Testing Component Signals

```typescript
@Component({
  selector: 'app-todo-list',
  template: `
    <ul>
      @for (todo of filteredTodos(); track todo.id) {
        <li>{{ todo.text }}</li>
      }
    </ul>
    <p>{{ remaining() }} remaining</p>
  `,
})
export class TodoList {
  todos = signal<Todo[]>([]);
  filter = signal<'all' | 'active' | 'done'>('all');

  filteredTodos = computed(() => {
    const todos = this.todos();
    switch (this.filter()) {
      case 'active': return todos.filter(t => !t.done);
      case 'done': return todos.filter(t => t.done);
      default: return todos;
    }
  });

  remaining = computed(() => this.todos().filter(t => !t.done).length);
}

describe('TodoList', () => {
  let component: TodoList;
  let fixture: ComponentFixture<TodoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoList],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
  });

  it('should filter active todos', () => {
    component.todos.set([
      { id: '1', text: 'Task 1', done: false },
      { id: '2', text: 'Task 2', done: true },
      { id: '3', text: 'Task 3', done: false },
    ]);

    component.filter.set('active');

    expect(component.filteredTodos().length).toBe(2);
    expect(component.remaining()).toBe(2);
  });
});
```

## Testing OnPush Components

OnPush components require explicit stabilization after input updates:

```typescript
import { inputBinding, signal } from '@angular/core';
import { page } from 'vitest/browser';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span>{{ data().name }}</span>`,
})
export class OnPushCmpt {
  data = input.required<{ name: string }>();
}

describe('OnPushCmpt', () => {
  it('should update when input signal changes', async () => {
    const data = signal({ name: 'Initial' });
    const fixture = TestBed.createComponent(OnPushCmpt, {
      bindings: [inputBinding('data', data)],
    });

    await fixture.whenStable();

    await expect.element(page.getByText('Initial')).toBeInTheDocument();

    data.set({ name: 'Updated' });
    await fixture.whenStable();

    await expect.element(page.getByText('Updated')).toBeInTheDocument();
  });
});
```

## Testing Services

### Basic Service Test

```typescript
@Injectable({ providedIn: 'root' })
export class CounterService {
  private _count = signal(0);
  readonly count = this._count.asReadonly();

  increment() { this._count.update(c => c + 1); }
  reset() { this._count.set(0); }
}

describe('CounterService', () => {
  let service: CounterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterService);
  });

  it('should increment count', () => {
    expect(service.count()).toBe(0);
    service.increment();
    expect(service.count()).toBe(1);
  });
});
```

### Service with HTTP

```typescript
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });

  it('should fetch user by id', () => {
    const mockUser = { id: '1', name: 'Test User' };

    service.getUser('1').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });
});
```

## Mocking Dependencies

### Using Vitest Mocks

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('UserProfile', () => {
  const mockUserService = {
    getUser: vi.fn(),
    updateUser: vi.fn(),
    user: signal<User | null>(null),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUserService.getUser.mockReturnValue(of({ id: '1', name: 'Test' }));

    await TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();
  });

  it('should call getUser on init', async () => {
    const fixture = TestBed.createComponent(UserProfile);
    await fixture.whenStable();

    expect(mockUserService.getUser).toHaveBeenCalledWith('1');
  });
});
```

### Mock Signal-Based Service

```typescript
import { inputBinding, signal } from '@angular/core';
import { page } from 'vitest/browser';

const mockAuth = {
  user: signal<User | null>(null),
  isAuthenticated: computed(() => mockAuth.user() !== null),
  login: vi.fn(),
  logout: vi.fn(),
};

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [ProtectedPage],
    providers: [
      { provide: AuthService, useValue: mockAuth },
    ],
  }).compileComponents();
});

it('should show content when authenticated', async () => {
  mockAuth.user.set({ id: '1', name: 'Test User' });

  const fixture = TestBed.createComponent(ProtectedPage);
  await fixture.whenStable();

  await expect.element(page.getByText('Test User')).toBeInTheDocument();
});
```

## Testing Inputs and Outputs

```typescript
import { page } from 'vitest/browser';

@Component({
  selector: 'app-item',
  template: `<div (click)="select()">{{ item().name }}</div>`,
})
export class ItemCmpt {
  item = input.required<Item>();
  selected = output<Item>();

  select() {
    this.selected.emit(this.item());
  }
}

describe('ItemCmpt', () => {
  it('should emit selected event on click', async () => {
    const item = signal<Item>({ id: '1', name: 'Test Item' });
    const fixture = TestBed.createComponent(ItemCmpt, {
      bindings: [inputBinding('item', item)],
    });
    await fixture.whenStable();

    let emittedItem: Item | undefined;
    fixture.componentInstance.selected.subscribe(i => emittedItem = i);

    await page.getByText('Test Item').click();

    expect(emittedItem).toEqual(item());
  });
});
```

## Triggering Template Events with vitest-browser

Use `userEvent` when you want interactions that behave closer to real user input sequences.

- Use `userEvent.click()` for pointer activation.
- Use `userEvent.type()` for realistic typing.
- Use `userEvent.keyboard('{Tab}')` or `userEvent.keyboard('{Enter}')` for keyboard flows.
- After each interaction that updates the template, run `await fixture.whenStable()` before assertions.

```typescript
import { page, userEvent } from 'vitest/browser';

it('should trigger input and submit from the template', async () => {
  const fixture = TestBed.createComponent(LoginCmpt);
  await fixture.whenStable();

  const email = page.getByRole('textbox', { name: 'Email' });
  await userEvent.type(email, 'test@example.com');
  await fixture.whenStable();

  await userEvent.keyboard('{Enter}');
  await fixture.whenStable();

  expect(fixture.componentInstance.submittedEmail()).toBe('test@example.com');
});
```

## Testing Async Operations

### Using Vitest Fake Timers

```typescript
import { vi } from 'vitest';

it('should debounce search', async () => {
  vi.useFakeTimers();
  const fixture = TestBed.createComponent(SearchCmpt);
  await fixture.whenStable();

  fixture.componentInstance.query.set('test');

  vi.advanceTimersByTime(300);
  await fixture.whenStable();

  expect(fixture.componentInstance.results().length).toBeGreaterThan(0);

  vi.useRealTimers();
});
```

### Using Vitest Fake Timers with "fast-forward"

Instead of manually advancing time and coupling the test to the debounce delay, you can switch to "fast-forward" mode by calling vi.setTimerTickMode('nextTimerAsync') (available since Vitest 4.1.0).

What I call "fast-forward" mode is a tick mode for fake timers that automatically advances time on its own. Whenever you schedule a macrotask with setTimeout, for example, it will advance time by the amount of the timeout and flush the microtasks queue.

```typescript
import { vi } from 'vitest';

it('should debounce search', async () => {
  vi.useFakeTimers();
  vi.setTimerTickMode('nextTimerAsync');
  const fixture = TestBed.createComponent(SearchCmpt);
  await fixture.whenStable();

  fixture.componentInstance.query.set('test');

  vi.advanceTimersByTime(300);
  await fixture.whenStable();

  expect(fixture.componentInstance.results().length).toBeGreaterThan(0);
});
```
after every test, make sure to restore the default timer behavior by calling vi.useRealTimers(). Even better use a utility function to hook on `onTestFinished` and automatically restore the timers after each test:

```typescript
import { vi } from 'vitest';

it('should debounce search', async () => {
  setUpFastForward();
  const fixture = TestBed.createComponent(SearchCmpt);
  await fixture.whenStable();

  fixture.componentInstance.query.set('test');

  vi.advanceTimersByTime(300);
  await fixture.whenStable();

  expect(fixture.componentInstance.results().length).toBeGreaterThan(0);
});

function setUpFastForward() {
  vi.useFakeTimers().setTimerTickMode('nextTimerAsync');
  onTestFinished(() => {
    vi.useRealTimers();
  });
}
```

### Using async/await

```typescript
it('should load data', async () => {
  const fixture = TestBed.createComponent(DataCmpt);
  await fixture.whenStable();

  expect(fixture.componentInstance.data()).toBeDefined();
});
```

## Testing HTTP Resources

```typescript
import { page } from 'vitest/browser';

@Component({
  template: `
    @if (userResource.isLoading()) {
      <p>Loading...</p>
    } @else if (userResource.hasValue()) {
      <p>{{ userResource.value().name }}</p>
    }
  `,
})
export class UserCmpt {
  userId = signal('1');
  userResource = httpResource<User>(() => `/api/users/${this.userId()}`);
}

describe('UserCmpt', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCmpt],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should display user name after loading', async () => {
    const fixture = TestBed.createComponent(UserCmpt);
    await fixture.whenStable();

    await expect.element(page.getByText('Loading...')).toBeInTheDocument();

    const req = httpMock.expectOne('/api/users/1');
    req.flush({ id: '1', name: 'John Doe' });
    await fixture.whenStable();

    await expect.element(page.getByText('John Doe')).toBeInTheDocument();
  });
});
```

For advanced testing patterns including component harnesses, router testing, form testing, and directive testing, see [references/testing-patterns.md](references/testing-patterns.md).
