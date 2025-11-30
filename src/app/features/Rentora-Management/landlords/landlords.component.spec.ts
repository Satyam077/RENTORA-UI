import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandlordsComponent } from './landlords.component';

describe('LandlordsComponent', () => {
  let component: LandlordsComponent;
  let fixture: ComponentFixture<LandlordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandlordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandlordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
