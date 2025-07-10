import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BullsEyeDiagram } from './bulls-eye-diagram';

describe('BullsEyeDiagram', () => {
  let component: BullsEyeDiagram;
  let fixture: ComponentFixture<BullsEyeDiagram>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BullsEyeDiagram]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BullsEyeDiagram);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
