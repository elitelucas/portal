import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperProvidersComponent } from './super-providers.component';

describe('SuperProvidersComponent', () => {
  let component: SuperProvidersComponent;
  let fixture: ComponentFixture<SuperProvidersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperProvidersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperProvidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
