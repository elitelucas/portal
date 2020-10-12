import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdministratorsComponent } from './super-administrators.component';

describe('SuperAdministratorsComponent', () => {
  let component: SuperAdministratorsComponent;
  let fixture: ComponentFixture<SuperAdministratorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdministratorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdministratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
