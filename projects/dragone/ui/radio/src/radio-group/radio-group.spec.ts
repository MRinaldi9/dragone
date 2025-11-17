import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioGroup } from './radio-group';

describe('RadioGroup', () => {
  let component: RadioGroup<unknown>;
  let fixture: ComponentFixture<RadioGroup<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
