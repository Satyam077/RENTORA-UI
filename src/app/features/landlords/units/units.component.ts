import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitService } from '../../../core/services/unit.service';
import { PropertyService } from '../../../core/services/property.service';
import {
  UnitModel,
  UnitCreateRequest,
  UnitUpdateRequest,
  PropertyOption,
} from '../../../core/models/unit.model';
import { PropertyModel } from '../../../core/models/property.model';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import {
  UnitFormDialogComponent,
  UnitFormDialogData,
} from '../../../popups/unit-form-dialog/unit-form-dialog.component';
import {
  UnitViewDialogComponent,
  UnitViewDialogData,
} from '../../../popups/unit-view-dialog/unit-view-dialog.component';
import { ConfirmationDialogComponent } from '../../../popups/confirmation-dialog/confirmation-dialog.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    SpinnerComponent,
  ],
  templateUrl: './units.component.html',
  styleUrl: './units.component.css',
})
export class UnitsComponent implements OnInit {
  units: UnitModel[] = [];
  filteredUnits: UnitModel[] = [];
  isLoadingUnits = false;
  properties: PropertyOption[] = [];

  // Pagination
  pageSize = 12;
  pageIndex = 0;

  // Current user (owner) ID
  currentOwnerId = '';

  constructor(
    private unitService: UnitService,
    private propertyService: PropertyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentOwnerId = user.user?.id || '';
    }
    this.loadProperties();
    this.loadUnits();
  }

  loadProperties(): void {
    this.propertyService.getPropertiesByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.properties = response.data.map((prop: PropertyModel) => ({
            id: prop.id || '',
            propertyName: prop.propertyName,
          }));
        }
      },
      error: () => { },
    });
  }

  loadUnits(): void {
    this.isLoadingUnits = true;
    this.unitService.getUnitsByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        this.isLoadingUnits = false;
        if (response.success && response.data) {
          this.units = response.data;
          this.filteredUnits = [...this.units];
        } else {
          this.showSnackBar(response.message || 'Failed to load units', 'error');
        }
      },
      error: () => {
        this.isLoadingUnits = false;
        this.showSnackBar('Error loading units. Please try again.', 'error');
      },
    });
  }

  applyFilter(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!term) {
      this.filteredUnits = [...this.units];
    } else {
      this.filteredUnits = this.units.filter(
        (unit) =>
          unit.unitName.toLowerCase().includes(term) ||
          this.getPropertyName(unit.propertyId)?.toLowerCase().includes(term),
      );
    }
    this.pageIndex = 0;
  }

  getPropertyName(propertyId: string): string {
    const property = this.properties.find((p) => p.id === propertyId);
    return property ? property.propertyName : 'Unknown Property';
  }

  getPaginatedUnits(): UnitModel[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredUnits.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  // --- Dialog Operations ---

  openAddUnitDialog(): void {
    const newUnit: UnitModel = {
      ownerId: this.currentOwnerId,
      propertyId: '',
      unitName: '',
      rentAmount: 0,
      securityDeposit: 0,
      isOccupied: false,
      dueDay: 5,
      notes: '',
      createdBy: this.currentOwnerId,
    };

    const dialogRef = this.dialog.open(UnitFormDialogComponent, {
      width: '700px',
      data: {
        mode: 'add',
        unit: newUnit,
        properties: this.properties,
      } as UnitFormDialogData,
    });

    dialogRef.afterClosed().subscribe((result: UnitModel | undefined) => {
      if (!result) return;
      const createRequest: UnitCreateRequest = {
        ownerId: result.ownerId,
        propertyId: result.propertyId,
        tenantId: result.tenantId ?? '',
        unitName: result.unitName,
        rentAmount: result.rentAmount,
        securityDeposit: result.securityDeposit || 0,
        isOccupied: result.isOccupied || false,
        dueDay: result.dueDay || 5,
        notes: result.notes || '',
        createdBy: this.currentOwnerId,
      };

      this.unitService.createUnit(createRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar(response.message || 'Unit created successfully!');
            this.loadUnits();
          } else {
            this.showSnackBar(response.message || 'Failed to create unit', 'error');
          }
        },
        error: (err) => {
          this.showSnackBar(err.error?.message || 'Error creating unit.', 'error');
        },
      });
    });
  }

  editUnit(unit: UnitModel): void {
    const dialogRef = this.dialog.open(UnitFormDialogComponent, {
      width: '700px',
      data: {
        mode: 'edit',
        unit: unit,
        properties: this.properties,
      } as UnitFormDialogData,
    });

    dialogRef.afterClosed().subscribe((result: UnitModel | undefined) => {
      if (!result || !result.id) return;
      const updateRequest: UnitUpdateRequest = {
        id: result.id,
        ownerId: result.ownerId,
        propertyId: result.propertyId,
        tenantId: result.tenantId,
        unitName: result.unitName,
        rentAmount: result.rentAmount,
        securityDeposit: result.securityDeposit || 0,
        isOccupied: result.isOccupied || false,
        dueDay: result.dueDay || 5,
        notes: result.notes || '',
        isActive: result.isActive !== false,
        updatedBy: this.currentOwnerId,
      };

      this.unitService.updateUnit(updateRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar(response.message || 'Unit updated successfully!');
            this.loadUnits();
          } else {
            this.showSnackBar(response.message || 'Failed to update unit', 'error');
          }
        },
        error: (err) => {
          this.showSnackBar(err.error?.message || 'Error updating unit.', 'error');
        },
      });
    });
  }

  viewUnit(unit: UnitModel): void {
    this.dialog.open(UnitViewDialogComponent, {
      width: '550px',
      data: {
        unit: unit,
        propertyName: this.getPropertyName(unit.propertyId),
      } as UnitViewDialogData,
    });
  }

  deleteUnit(unit: UnitModel): void {
    if (!unit.id) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Unit',
        message: `Are you sure you want to delete unit "${unit.unitName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.unitService.deleteUnit(unit.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackBar(response.message || 'Unit deleted successfully!');
            this.loadUnits();
          } else {
            this.showSnackBar(response.message || 'Failed to delete unit', 'error');
          }
        },
        error: (err) => {
          this.showSnackBar(err.error?.message || 'Error deleting unit.', 'error');
        },
      });
    });
  }

  // --- Helpers ---

  showSnackBar(message: string, type: string = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['snack-error'] : ['snack-success'],
    });
  }
}
