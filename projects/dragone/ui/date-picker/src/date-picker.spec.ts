import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { DatePicker } from './date-picker';

describe(DatePicker, () => {
  let component: DatePicker<Temporal.PlainDateTime | Date>;
  let fixture: ComponentFixture<DatePicker<Temporal.PlainDateTime | Date>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePicker],
    }).compileComponents();

    fixture = TestBed.createComponent(DatePicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
