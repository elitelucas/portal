import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayPatientComponent } from './pay-patient.component';

describe('PayPatientComponent', () => {
  let component: PayPatientComponent;
  let fixture: ComponentFixture<PayPatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayPatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
