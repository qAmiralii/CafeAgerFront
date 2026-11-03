import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBeverage } from './edit-beverage';

describe('EditBeverage', () => {
  let component: EditBeverage;
  let fixture: ComponentFixture<EditBeverage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBeverage],
    }).compileComponents();

    fixture = TestBed.createComponent(EditBeverage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
