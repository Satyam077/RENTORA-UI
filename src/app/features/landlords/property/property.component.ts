import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../core/services/property.service';
import {
  PropertyModel,
  PropertyCreateRequest,
  PropertyUpdateRequest,
} from '../../../core/models/property.model';
import {
  PropertyType,
  PropertyTypeLabels,
} from '../../../core/models/property-type.enum';
import { environment } from '../../../../environments/environment';

// Angular Material Imports
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
  PropertyFormDialogComponent,
  PropertyFormDialogData,
} from '../../../popups/property-form-dialog/property-form-dialog.component';
import {
  PropertyViewDialogComponent,
  PropertyViewDialogData,
} from '../../../popups/property-view-dialog/property-view-dialog.component';
import {
  ConfirmationDialogComponent,
} from '../../../popups/confirmation-dialog/confirmation-dialog.component';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-property',
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
  templateUrl: './property.component.html',
  styleUrl: './property.component.css',
})
export class PropertyComponent implements OnInit, AfterViewInit {
  properties: PropertyModel[] = [];
  isLoadingProperties = false;

  // Angular Material Table
  displayedColumns: string[] = [
    'propertyName',
    'type',
    'rentAmount',
    'occupancy',
    'status',
    'actions',
  ];
  dataSource: MatTableDataSource<PropertyModel>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  PropertyType = PropertyType;
  propertyTypeLabels = PropertyTypeLabels;
  propertyTypeOptions = Object.keys(PropertyType)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => ({
      value: Number(key),
      label: PropertyTypeLabels[Number(key) as PropertyType],
    }));

  currentOwnerId: string = '';

  constructor(
    private propertyService: PropertyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.properties);
  }

  ngOnInit(): void {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentOwnerId = user.user?.id || '';
    }

    this.setUpFilterPredicate();
    this.loadProperties();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setUpFilterPredicate() {
    this.dataSource.filterPredicate = (
      data: PropertyModel,
      filter: string
    ) => {
      const search = filter.trim().toLowerCase();
      return (
        data.propertyName?.toLowerCase().includes(search) ||
        data.description?.toLowerCase().includes(search) ||
        this.getPropertyTypeLabel(data.type)?.toLowerCase().includes(search) ||
        data.address?.city?.toLowerCase().includes(search) ||
        data.address?.state?.toLowerCase().includes(search) ||
        false
      );
    };
  }

  loadProperties(): void {
    this.isLoadingProperties = true;

    if (this.currentOwnerId) {
      this.propertyService
        .getPropertiesByOwnerId(this.currentOwnerId)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.properties = response.data;
              this.dataSource.data = this.properties;
              if (this.paginator)
                this.dataSource.paginator = this.paginator;
              if (this.sort) this.dataSource.sort = this.sort;
            } else {
              this.showSnackBar(
                response.message || 'Failed to load properties',
                'error'
              );
            }
            this.isLoadingProperties = false;
          },
          error: (err) => {
            this.showSnackBar(
              err.error?.message ||
              'Failed to load properties. Please try again.',
              'error'
            );
            this.isLoadingProperties = false;
          },
        });
    } else {
      this.isLoadingProperties = false;
      this.showSnackBar('Owner ID not found. Please log in again.', 'error');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // --- Dialog Methods ---

  openAddPropertyModal(): void {
    const newProperty: PropertyModel = {
      ownerId: this.currentOwnerId,
      propertyName: '',
      description: '',
      type: PropertyType.Apartment,
      address: {
        houseNo: '',
        street: '',
        landmark: '',
        city: '',
        district: '',
        state: '',
        pinCode: '',
        country: 'India',
      },
      units: [],
      images: [],
      documents: [],
      isFullyOccupied: false,
      totalUnits: 0,
      occupiedUnits: 0,
      defaultRentAmount: 0,
      defaultDueDay: 5,
      notes: '',
      createdBy: this.currentOwnerId,
    };

    const dialogData: PropertyFormDialogData = {
      mode: 'add',
      property: newProperty,
      propertyTypeOptions: this.propertyTypeOptions,
    };

    const dialogRef = this.dialog.open(PropertyFormDialogComponent, {
      width: '750px',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: PropertyModel | undefined) => {
      if (result) {
        this.createProperty(result);
      }
    });
  }

  editProperty(property: PropertyModel): void {
    const dialogData: PropertyFormDialogData = {
      mode: 'edit',
      property: property,
      propertyTypeOptions: this.propertyTypeOptions,
    };

    const dialogRef = this.dialog.open(PropertyFormDialogComponent, {
      width: '750px',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: PropertyModel | undefined) => {
      if (result) {
        this.updateProperty(result);
      }
    });
  }

  viewProperty(property: PropertyModel): void {
    const dialogData: PropertyViewDialogData = {
      property: property,
    };

    this.dialog.open(PropertyViewDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: dialogData,
    });
  }

  // --- CRUD Operations ---

  private createProperty(property: PropertyModel): void {
    const createRequest: PropertyCreateRequest = {
      ownerId: property.ownerId,
      propertyName: property.propertyName,
      description: property.description,
      type: property.type,
      address: property.address,
      images: property.images,
      documents: property.documents,
      defaultRentAmount: property.defaultRentAmount,
      defaultDueDay: property.defaultDueDay,
      notes: property.notes,
      createdBy: this.currentOwnerId,
    };

    this.propertyService.createProperty(createRequest).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.properties.unshift(response.data);
          this.dataSource.data = [...this.properties];
          this.showSnackBar(
            response.message || 'Property created successfully!'
          );
        } else {
          this.showSnackBar(
            response.message || 'Failed to create property',
            'error'
          );
        }
      },
      error: (err) => {
        this.showSnackBar(
          err.error?.message || 'Failed to create property. Please try again.',
          'error'
        );
      },
    });
  }

  private updateProperty(property: PropertyModel): void {
    if (!property.id) return;

    const updateRequest: PropertyUpdateRequest = {
      id: property.id,
      ownerId: property.ownerId,
      propertyName: property.propertyName,
      description: property.description,
      type: property.type,
      address: property.address,
      images: property.images,
      documents: property.documents,
      defaultRentAmount: property.defaultRentAmount,
      defaultDueDay: property.defaultDueDay,
      notes: property.notes,
      isActive: property.isActive ?? true,
      updatedBy: this.currentOwnerId,
    };

    this.propertyService.updateProperty(updateRequest).subscribe({
      next: (response: any) => {
        if (response.success) {
          const updated = response.data;
          const index = this.properties.findIndex((p) => p.id === updated.id);
          if (index !== -1) {
            this.properties[index] = updated;
            this.dataSource.data = [...this.properties];
          }
          this.showSnackBar(
            response.message || 'Property updated successfully!'
          );
        } else {
          this.showSnackBar(
            response.message || 'Failed to update property',
            'error'
          );
        }
      },
      error: (err) => {
        this.showSnackBar(
          err.error?.message || 'Failed to update property. Please try again.',
          'error'
        );
      },
    });
  }

  deleteProperty(property: PropertyModel): void {
    if (!property.id) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Property',
        message: `Are you sure you want to delete the property "${property.propertyName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.propertyService.deleteProperty(property.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.properties = this.properties.filter(
              (p) => p.id !== property.id
            );
            this.dataSource.data = [...this.properties];
            this.showSnackBar(
              response.message || 'Property deleted successfully!'
            );
          } else {
            this.showSnackBar(
              response.message || 'Failed to delete property',
              'error'
            );
          }
        },
        error: (err) => {
          this.showSnackBar(
            err.error?.message ||
            'Failed to delete property. Please try again.',
            'error'
          );
        },
      });
    });
  }

  // --- Helpers ---

  getPropertyTypeLabel(type: number): string {
    return PropertyTypeLabels[type as PropertyType] || 'Unknown';
  }

  getOccupancyString(property: PropertyModel): string {
    const total = property.totalUnits ?? 0;
    const occupied = property.occupiedUnits ?? 0;
    return `${occupied}/${total}`;
  }

  getOccupancyPercentage(property: PropertyModel): number {
    const total = property.totalUnits ?? 0;
    const occupied = property.occupiedUnits ?? 0;
    if (total === 0) return 0;
    return Math.round((occupied / total) * 100);
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
