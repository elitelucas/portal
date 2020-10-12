import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperUpdateComponent } from './super-update.component';

describe('SuperUpdateComponent', () => {
  let component: SuperUpdateComponent;
  let fixture: ComponentFixture<SuperUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
