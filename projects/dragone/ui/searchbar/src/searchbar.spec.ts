import { inputBinding, outputBinding, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { page, type Locator } from 'vitest/browser';

import { Searchbar } from './searchbar';

describe(Searchbar, () => {
  let component: Searchbar;
  let fixture: ComponentFixture<Searchbar>;
  let locator: Locator;

  const size = signal<'small' | 'medium' | 'large'>('large');
  const value = signal('');
  const chips = signal<readonly string[]>([]);
  const valueChangeMock = vi.fn<(value: string) => void>();
  const searchSubmitMock = vi.fn<(value: string) => void>();
  const clearAllMock = vi.fn<() => void>();
  const removeChipMock = vi.fn<(index: number) => void>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Searchbar],
    }).compileComponents();

    fixture = TestBed.createComponent(Searchbar, {
      bindings: [
        inputBinding('size', size),
        inputBinding('value', value),
        inputBinding('chipsItem', chips),
        outputBinding('valueChange', valueChangeMock),
        outputBinding('searchSubmit', searchSubmitMock),
        outputBinding('clearAll', clearAllMock),
        outputBinding('removeChip', removeChipMock),
      ],
    });
    component = fixture.componentInstance;
    locator = page.elementLocator(fixture.nativeElement);
    await fixture.whenStable();
  });

  afterEach(() => {
    size.set('large');
    value.set('');
    chips.set([]);
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply data-size attribute', async () => {
    size.set('medium');
    await fixture.whenStable();
    const host = locator.element();
    await expect.element(host).toHaveAttribute('data-size', 'medium');
  });

  it('should emit valueChange when typing', async () => {
    value.set('Pensione');
    await fixture.whenStable();

    const input = fixture.debugElement.query(By.css('input'))?.nativeElement as HTMLInputElement;
    input.value = 'Nuova ricerca';
    input.dispatchEvent(new Event('input'));

    expect(valueChangeMock).toHaveBeenCalledWith('Nuova ricerca');
  });

  it('should emit search on button click', async () => {
    value.set('Pensione');
    await fixture.whenStable();

    const button = fixture.debugElement.query(By.css('button[drgnButton]'));
    button.triggerEventHandler('click');

    expect(searchSubmitMock).toHaveBeenCalledWith('Pensione');
  });

  it('should render chips and emit clearAll when chips are present', () => {
    chips.set(['Chips', 'Chips']);
    fixture.detectChanges();

    const clearAllButton = fixture.debugElement.query(By.css('.searchbar__clear-all'));
    expect(clearAllButton).toBeTruthy();

    clearAllButton.triggerEventHandler('click');
    expect(clearAllMock.mock.calls[0]).toEqual([undefined]);
    expect(clearAllMock.mock.calls[1]).toBeUndefined();
  });

  it('should show the clear input button only when there is a value', () => {
    expect(fixture.debugElement.query(By.css('.searchbar__clear-input'))).toBeNull();

    value.set('Pensione');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.searchbar__clear-input'))).toBeTruthy();
  });
});
