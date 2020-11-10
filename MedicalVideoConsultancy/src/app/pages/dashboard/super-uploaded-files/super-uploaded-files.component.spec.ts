import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperUploadedFilesComponent } from './super-uploaded-files.component';

describe('SuperUploadedFilesComponent', () => {
  let component: SuperUploadedFilesComponent;
  let fixture: ComponentFixture<SuperUploadedFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperUploadedFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperUploadedFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
