import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioItem } from './radio-item';

describe('RadioItem', () => {
  let component: RadioItem;
  let fixture: ComponentFixture<RadioItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioItem],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
