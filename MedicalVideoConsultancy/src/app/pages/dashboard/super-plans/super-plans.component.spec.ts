import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperPlansComponent } from './super-plans.component';

describe('SuperPlansComponent', () => {
  let component: SuperPlansComponent;
  let fixture: ComponentFixture<SuperPlansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperPlansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
