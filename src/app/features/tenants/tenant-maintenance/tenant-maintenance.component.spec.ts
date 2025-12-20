import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantMaintenanceComponent } from './tenant-maintenance.component';

describe('TenantMaintenanceComponent', () => {
  let component: TenantMaintenanceComponent;
  let fixture: ComponentFixture<TenantMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantMaintenanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
