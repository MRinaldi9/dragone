import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipInput } from './chip-input';

describe('ChipInput', () => {
  let component: ChipInput;
  let fixture: ComponentFixture<ChipInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipInput],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
