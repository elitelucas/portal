import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperFeedbacksComponent } from './super-feedbacks.component';

describe('SuperFeedbacksComponent', () => {
  let component: SuperFeedbacksComponent;
  let fixture: ComponentFixture<SuperFeedbacksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperFeedbacksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperFeedbacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
