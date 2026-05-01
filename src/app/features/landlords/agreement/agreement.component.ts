import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgreementService } from '../../../core/services/agreement.service';
import { PropertyService } from '../../../core/services/property.service';
import { UnitService } from '../../../core/services/unit.service';
import { TenantService } from '../../../core/services/tenant.service';
import {
  AgreementModel,
  AgreementCreateRequest,
  AgreementUpdateRequest,
  AgreementType,
  AgreementStatus,
  PropertyOption,
  UnitOption,
  TenantOption,
} from '../../../core/models/agreement.model';
import { PropertyModel } from '../../../core/models/property.model';
import { UnitModel } from '../../../core/models/unit.model';
import { TenantModel } from '../../../core/models/tenant.model';

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
  AgreementFormDialogComponent,
  AgreementFormDialogData,
} from '../../../popups/agreement-form-dialog/agreement-form-dialog.component';
import {
  AgreementViewDialogComponent,
  AgreementViewDialogData,
} from '../../../popups/agreement-view-dialog/agreement-view-dialog.component';
import { ConfirmationDialogComponent } from '../../../popups/confirmation-dialog/confirmation-dialog.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

const AgreementTypeLabels: Record<number, string> = {
  0: 'Residential', 1: 'Commercial', 2: 'PG', 3: 'Office', 4: 'Short Term', 5: 'Other',
};
const AgreementStatusLabels: Record<number, string> = {
  0: 'Draft', 1: 'Active', 2: 'Expired', 3: 'Terminated',
};

@Component({
  selector: 'app-agreement',
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
  templateUrl: './agreement.component.html',
  styleUrl: './agreement.component.css',
})
export class AgreementComponent implements OnInit, AfterViewInit {
  agreements: AgreementModel[] = [];
  isLoadingAgreements = false;

  displayedColumns: string[] = [
    'agreementNumber',
    'type',
    'property',
    'tenant',
    'startDate',
    'endDate',
    'rentAmount',
    'status',
    'actions',
  ];
  dataSource: MatTableDataSource<AgreementModel>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  properties: PropertyOption[] = [];
  allUnits: UnitOption[] = [];
  allTenants: TenantOption[] = [];
  currentOwnerId = '';

  constructor(
    private agreementService: AgreementService,
    private propertyService: PropertyService,
    private unitService: UnitService,
    private tenantService: TenantService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.dataSource = new MatTableDataSource(this.agreements);
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
    this.loadAgreements();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setUpFilterPredicate() {
    this.dataSource.filterPredicate = (data: AgreementModel, filter: string) => {
      const s = filter.trim().toLowerCase();
      return (
        data.agreementNumber?.toLowerCase().includes(s) ||
        (data.propertyName?.toLowerCase().includes(s) ?? false) ||
        (data.unitName?.toLowerCase().includes(s) ?? false) ||
        (data.tenantName?.toLowerCase().includes(s) ?? false) ||
        this.getTypeLabel(data.agreementType)?.toLowerCase().includes(s) ||
        this.getStatusLabel(data.status)?.toLowerCase().includes(s) ||
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
    this.tenantService.getTenantsByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allTenants = response.data.map((t: TenantModel) => ({
            id: t.id || '',
            fullName: t.fullName,
            propertyId: t.propertyId,
            unitId: t.unitId,
          }));
        }
      },
      error: () => { },
    });
  }

  loadAgreements(): void {
    this.isLoadingAgreements = true;
    this.agreementService.getAgreementsByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        this.isLoadingAgreements = false;
        if (response.success && response.data) {
          this.agreements = response.data;
          this.dataSource.data = this.agreements;
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
        } else {
          this.showSnackBar(response.message || 'Failed to load agreements', 'error');
        }
      },
      error: (err) => {
        this.isLoadingAgreements = false;
        this.showSnackBar(err.error?.message || 'Failed to load agreements.', 'error');
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  getTypeLabel(type: number): string {
    return AgreementTypeLabels[type] || 'Unknown';
  }

  getStatusLabel(status: number): string {
    return AgreementStatusLabels[status] || 'Unknown';
  }

  getStatusColor(status: number): string {
    if (status === AgreementStatus.Active) return 'accent';
    if (status === AgreementStatus.Terminated) return 'warn';
    return 'primary';
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // --- Dialogs ---

  openAddAgreementDialog(): void {
    const newAgreement: AgreementModel = {
      propertyId: '',
      unitId: '',
      tenantId: '',
      ownerId: this.currentOwnerId,
      agreementNumber: '',
      agreementType: AgreementType.Residential,
      startDate: new Date(),
      endDate: new Date(),
      rentAmount: 0,
      securityDeposit: 0,
      rentDueDay: 5,
      status: AgreementStatus.Draft,
      notes: '',
      createdBy: this.currentOwnerId,
    };

    const dialogRef = this.dialog.open(AgreementFormDialogComponent, {
      width: '800px',
      data: {
        mode: 'add',
        agreement: newAgreement,
        properties: this.properties,
        allUnits: this.allUnits,
        allTenants: this.allTenants,
      } as AgreementFormDialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: AgreementModel | undefined) => {
      if (!result) return;
      const req: AgreementCreateRequest = {
        propertyId: result.propertyId,
        unitId: result.unitId,
        tenantId: result.tenantId,
        ownerId: this.currentOwnerId,
        agreementNumber: result.agreementNumber,
        agreementType: result.agreementType,
        startDate: result.startDate,
        endDate: result.endDate,
        rentAmount: result.rentAmount,
        securityDeposit: result.securityDeposit,
        rentDueDay: result.rentDueDay,
        agreementFileUrl: result.agreementFileUrl,
        status: result.status,
        notes: result.notes,
        createdBy: this.currentOwnerId,
      };
      this.agreementService.createAgreement(req).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar(response.message || 'Agreement created successfully!');
            this.loadAgreements();
          } else {
            this.showSnackBar(response.message || 'Failed to create agreement', 'error');
          }
        },
        error: (err) => this.showSnackBar(err.error?.message || 'Error creating agreement.', 'error'),
      });
    });
  }

  editAgreement(agreement: AgreementModel): void {
    const dialogRef = this.dialog.open(AgreementFormDialogComponent, {
      width: '800px',
      data: {
        mode: 'edit',
        agreement: agreement,
        properties: this.properties,
        allUnits: this.allUnits,
        allTenants: this.allTenants,
      } as AgreementFormDialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: AgreementModel | undefined) => {
      if (!result || !result.id) return;
      const req: AgreementUpdateRequest = {
        id: result.id,
        propertyId: result.propertyId,
        unitId: result.unitId,
        tenantId: result.tenantId,
        ownerId: this.currentOwnerId,
        agreementNumber: result.agreementNumber,
        agreementType: result.agreementType,
        startDate: result.startDate,
        endDate: result.endDate,
        rentAmount: result.rentAmount,
        securityDeposit: result.securityDeposit,
        rentDueDay: result.rentDueDay,
        agreementFileUrl: result.agreementFileUrl,
        status: result.status,
        terminatedOn: result.terminatedOn,
        terminationReason: result.terminationReason,
        isRenewed: result.isRenewed,
        renewedFromAgreementId: result.renewedFromAgreementId,
        notes: result.notes,
        isActive: result.isActive,
        updatedBy: this.currentOwnerId,
      };
      this.agreementService.updateAgreement(req).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar(response.message || 'Agreement updated successfully!');
            this.loadAgreements();
          } else {
            this.showSnackBar(response.message || 'Failed to update agreement', 'error');
          }
        },
        error: (err) => this.showSnackBar(err.error?.message || 'Error updating agreement.', 'error'),
      });
    });
  }

  viewAgreement(agreement: AgreementModel): void {
    this.dialog.open(AgreementViewDialogComponent, {
      width: '700px',
      data: { agreement: agreement } as AgreementViewDialogData,
    });
  }

  deleteAgreement(agreement: AgreementModel): void {
    if (!agreement.id) return;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Agreement',
        message: `Are you sure you want to delete agreement "${agreement.agreementNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.agreementService.deleteAgreement(agreement.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.agreements = this.agreements.filter((a) => a.id !== agreement.id);
            this.dataSource.data = [...this.agreements];
            this.showSnackBar(response.message || 'Agreement deleted successfully!');
          } else {
            this.showSnackBar(response.message || 'Failed to delete agreement', 'error');
          }
        },
        error: (err) => this.showSnackBar(err.error?.message || 'Error deleting agreement.', 'error'),
      });
    });
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
