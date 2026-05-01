import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../../core/services/tenant.service';
import { PropertyService } from '../../../core/services/property.service';
import { UnitService } from '../../../core/services/unit.service';
import {
  TenantModel,
  TenantCreateRequest,
  TenantUpdateRequest,
  PropertyOption,
  UnitOption,
} from '../../../core/models/tenant.model';
import { PropertyModel } from '../../../core/models/property.model';
import { UnitModel } from '../../../core/models/unit.model';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  TenantFormDialogComponent,
  TenantFormDialogData,
  TenantFormModel,
} from '../../../popups/tenant-form-dialog/tenant-form-dialog.component';
import {
  TenantViewDialogComponent,
  TenantViewDialogData,
} from '../../../popups/tenant-view-dialog/tenant-view-dialog.component';
import { ConfirmationDialogComponent } from '../../../popups/confirmation-dialog/confirmation-dialog.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    SpinnerComponent,
  ],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css',
})
export class TenantsComponent implements OnInit, AfterViewInit {
  tenants: TenantModel[] = [];
  isLoadingTenants = false;

  displayedColumns: string[] = [
    'fullName',
    'email',
    'mobile',
    'property',
    'unit',
    'rentAmount',
    'status',
    'actions',
  ];
  dataSource: MatTableDataSource<TenantModel>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  properties: PropertyOption[] = [];
  allUnits: UnitOption[] = [];
  currentOwnerId = '';

  constructor(
    private tenantService: TenantService,
    private propertyService: PropertyService,
    private unitService: UnitService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.dataSource = new MatTableDataSource(this.tenants);
  }

  ngOnInit(): void {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentOwnerId = user.user?.id || '';
    }
    this.setUpFilterPredicate();
    this.loadProperties();
    this.loadUnits();
    this.loadTenants();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setUpFilterPredicate() {
    this.dataSource.filterPredicate = (data: TenantModel, filter: string) => {
      const s = filter.trim().toLowerCase();
      return (
        data.fullName?.toLowerCase().includes(s) ||
        data.email?.toLowerCase().includes(s) ||
        data.mobile?.toLowerCase().includes(s) ||
        this.getPropertyName(data.propertyId)?.toLowerCase().includes(s) ||
        this.getUnitName(data.unitId)?.toLowerCase().includes(s) ||
        false
      );
    };
  }

  loadProperties(): void {
    this.propertyService.getPropertiesByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.properties = response.data.map((p: PropertyModel) => ({
            id: p.id || '',
            propertyName: p.propertyName,
          }));
        }
      },
      error: () => { },
    });
  }

  loadUnits(): void {
    this.unitService.getUnitsByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allUnits = response.data.map((u: UnitModel) => ({
            id: u.id || '',
            unitName: u.unitName,
            propertyId: u.propertyId,
          }));
        }
      },
      error: () => { },
    });
  }

  loadTenants(): void {
    this.isLoadingTenants = true;
    this.tenantService.getTenantsByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        this.isLoadingTenants = false;
        if (response.success && response.data) {
          this.tenants = response.data;
          this.dataSource.data = this.tenants;
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
        } else {
          this.showSnackBar(response.message || 'Failed to load tenants', 'error');
        }
      },
      error: (err) => {
        this.isLoadingTenants = false;
        this.showSnackBar(err.error?.message || 'Failed to load tenants.', 'error');
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  getPropertyName(propertyId: string): string {
    return this.properties.find((p) => p.id === propertyId)?.propertyName || 'Unknown';
  }

  getUnitName(unitId: string): string {
    return this.allUnits.find((u) => u.id === unitId)?.unitName || 'Unknown';
  }

  // --- Dialog Methods ---

  openAddTenantDialog(): void {
    const newTenant: TenantFormModel = {
      ownerId: this.currentOwnerId,
      propertyId: '',
      unitId: '',
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      gender: '',
      dateOfBirth: null,
      permanentAddress: '',
      currentAddress: '',
      rentAmount: 0,
      securityDeposit: 0,
      rentDueDay: 5,
      agreementStartDate: new Date(),
      agreementEndDate: new Date(),
      moveInDate: null,
      notes: '',
      createdBy: this.currentOwnerId,
    };

    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '800px',
      data: {
        mode: 'add',
        tenant: newTenant,
        properties: this.properties,
        allUnits: this.allUnits,
      } as TenantFormDialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: TenantFormModel | undefined) => {
      if (!result) return;
      const req: TenantCreateRequest = {
        ownerId: result.ownerId,
        propertyId: result.propertyId,
        unitId: result.unitId,
        firstName: result.firstName,
        lastName: result.lastName,
        mobile: result.mobile,
        email: result.email,
        gender: result.gender,
        dateOfBirth: result.dateOfBirth,
        permanentAddress: result.permanentAddress,
        currentAddress: result.currentAddress,
        rentAmount: result.rentAmount,
        securityDeposit: result.securityDeposit,
        rentDueDay: result.rentDueDay,
        agreementStartDate: result.agreementStartDate,
        agreementEndDate: result.agreementEndDate,
        moveInDate: result.moveInDate,
        idProofType: result.idProofType,
        idProofNumber: result.idProofNumber,
        notes: result.notes,
        createdBy: this.currentOwnerId,
      };
      this.tenantService.createTenant(req).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar(response.message || 'Tenant created successfully!');
            this.loadTenants();
          } else {
            this.showSnackBar(response.message || 'Failed to create tenant', 'error');
          }
        },
        error: (err) => this.showSnackBar(err.error?.message || 'Error creating tenant.', 'error'),
      });
    });
  }

  editTenant(tenant: TenantModel): void {
    const nameParts = tenant.fullName?.split(' ') || ['', ''];
    const formModel: TenantFormModel = {
      id: tenant.id,
      userId: tenant.userId,
      ownerId: tenant.ownerId,
      propertyId: tenant.propertyId,
      unitId: tenant.unitId,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      mobile: tenant.mobile,
      email: tenant.email,
      gender: tenant.gender,
      dateOfBirth: tenant.dateOfBirth,
      permanentAddress: tenant.permanentAddress,
      currentAddress: tenant.currentAddress,
      rentAmount: tenant.rentAmount,
      securityDeposit: tenant.securityDeposit,
      rentDueDay: tenant.rentDueDay,
      agreementStartDate: tenant.agreementStartDate,
      agreementEndDate: tenant.agreementEndDate,
      idProofType: tenant.idProofType,
      idProofNumber: tenant.idProofNumber,
      isActiveTenant: tenant.isActiveTenant,
      isMovedOut: tenant.isMovedOut,
      moveInDate: tenant.moveInDate,
      moveOutDate: tenant.moveOutDate,
      notes: tenant.notes,
      isActive: tenant.isActive,
      updatedBy: this.currentOwnerId,
    };

    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '800px',
      data: {
        mode: 'edit',
        tenant: formModel,
        properties: this.properties,
        allUnits: this.allUnits,
      } as TenantFormDialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: TenantFormModel | undefined) => {
      if (!result || !result.id) return;
      const req: TenantUpdateRequest = {
        id: result.id,
        ownerId: result.ownerId,
        propertyId: result.propertyId,
        unitId: result.unitId,
        firstName: result.firstName,
        lastName: result.lastName,
        mobile: result.mobile,
        email: result.email,
        gender: result.gender,
        dateOfBirth: result.dateOfBirth,
        permanentAddress: result.permanentAddress,
        currentAddress: result.currentAddress,
        rentAmount: result.rentAmount,
        securityDeposit: result.securityDeposit,
        rentDueDay: result.rentDueDay,
        agreementStartDate: result.agreementStartDate,
        agreementEndDate: result.agreementEndDate,
        idProofType: result.idProofType,
        idProofNumber: result.idProofNumber,
        isActiveTenant: result.isActiveTenant,
        isMovedOut: result.isMovedOut,
        moveInDate: result.moveInDate,
        moveOutDate: result.moveOutDate,
        notes: result.notes,
        isActive: result.isActive,
        updatedBy: this.currentOwnerId,
      };
      this.tenantService.updateTenant(req).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar(response.message || 'Tenant updated successfully!');
            this.loadTenants();
          } else {
            this.showSnackBar(response.message || 'Failed to update tenant', 'error');
          }
        },
        error: (err) => this.showSnackBar(err.error?.message || 'Error updating tenant.', 'error'),
      });
    });
  }

  viewTenant(tenant: TenantModel): void {
    this.dialog.open(TenantViewDialogComponent, {
      width: '700px',
      data: {
        tenant: tenant,
        propertyName: this.getPropertyName(tenant.propertyId),
        unitName: this.getUnitName(tenant.unitId),
      } as TenantViewDialogData,
    });
  }

  deleteTenant(tenant: TenantModel): void {
    if (!tenant.id) return;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Tenant',
        message: `Are you sure you want to delete tenant "${tenant.fullName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.tenantService.deleteTenant(tenant.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.tenants = this.tenants.filter((t) => t.id !== tenant.id);
            this.dataSource.data = [...this.tenants];
            this.showSnackBar(response.message || 'Tenant deleted successfully!');
          } else {
            this.showSnackBar(response.message || 'Failed to delete tenant', 'error');
          }
        },
        error: (err) => this.showSnackBar(err.error?.message || 'Error deleting tenant.', 'error'),
      });
    });
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['snack-bar-error'] : ['snack-bar-success'],
    });
  }
}
