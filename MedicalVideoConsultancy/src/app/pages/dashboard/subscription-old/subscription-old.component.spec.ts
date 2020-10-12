import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionOldComponent } from './subscription-old.component';

describe('SubscriptionOldComponent', () => {
  let component: SubscriptionOldComponent;
  let fixture: ComponentFixture<SubscriptionOldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionOldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
