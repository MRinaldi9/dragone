import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormContainer } from './form-container';

describe(FormContainer, () => {
  let component: FormContainer;
  let fixture: ComponentFixture<FormContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(FormContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
