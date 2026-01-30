import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansPricingComponent } from './plans-pricing.component';

describe('PlansPricingComponent', () => {
  let component: PlansPricingComponent;
  let fixture: ComponentFixture<PlansPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansPricingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
