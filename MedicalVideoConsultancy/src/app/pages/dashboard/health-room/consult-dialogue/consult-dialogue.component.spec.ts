import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultDialogueComponent } from './consult-dialogue.component';

describe('ConsultDialogueComponent', () => {
  let component: ConsultDialogueComponent;
  let fixture: ComponentFixture<ConsultDialogueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultDialogueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
