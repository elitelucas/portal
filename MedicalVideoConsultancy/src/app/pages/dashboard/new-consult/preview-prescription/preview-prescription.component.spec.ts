import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewPrescriptionComponent } from './preview-prescription.component';

describe('PreviewPrescriptionComponent', () => {
  let component: PreviewPrescriptionComponent;
  let fixture: ComponentFixture<PreviewPrescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewPrescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewPrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
