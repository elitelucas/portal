import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayProviderComponent } from './pay-provider.component';

describe('PayProviderComponent', () => {
  let component: PayProviderComponent;
  let fixture: ComponentFixture<PayProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
