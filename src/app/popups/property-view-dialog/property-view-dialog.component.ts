import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { PropertyModel } from '../../core/models/property.model';
import {
  PropertyType,
  PropertyTypeLabels,
} from '../../core/models/property-type.enum';
import { environment } from '../../../environments/environment';

export interface PropertyViewDialogData {
  property: PropertyModel;
}

@Component({
  selector: 'app-property-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatListModule,
    MatTableModule,
  ],
  template: `
    <div
      style="display: flex; justify-content: space-between; align-items: center;"
    >
      <h2 mat-dialog-title class="header-title" style="margin: 0;">
        Property Details
      </h2>
      <button mat-icon-button mat-dialog-close style="margin-right: -8px;">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <!-- Basic Information -->
      <h3 class="header-title">Basic Information</h3>
      <mat-divider></mat-divider>
      <table
        mat-table
        [dataSource]="basicInfoRows"
        style="width: 100%; border: 1px solid #ccc;"
      >
        <ng-container matColumnDef="label">
          <td
            mat-cell
            *matCellDef="let row"
            style="font-weight: 500; color: #555; width: 40%;"
          >
            {{ row.label }}
          </td>
        </ng-container>
        <ng-container matColumnDef="value">
          <td mat-cell *matCellDef="let row">
            <mat-chip-set *ngIf="row.chip; else plainValue">
              <mat-chip
                [highlighted]="true"
                [color]="row.chipColor || 'primary'"
                >{{ row.value }}</mat-chip
              >
            </mat-chip-set>
            <ng-template #plainValue>{{ row.value }}</ng-template>
          </td>
        </ng-container>
        <tr mat-row *matRowDef="let row; columns: ['label', 'value']"></tr>
      </table>

      <!-- Address -->
      <ng-container *ngIf="addressRows.length > 0">
        <h3 class="header-title">Address</h3>
        <mat-divider></mat-divider>
        <table
          mat-table
          [dataSource]="addressRows"
          style="width: 100%; border: 1px solid #ccc;"
        >
          <ng-container matColumnDef="label">
            <td
              mat-cell
              *matCellDef="let row"
              style="font-weight: 500; color: #555; width: 40%;"
            >
              {{ row.label }}
            </td>
          </ng-container>
          <ng-container matColumnDef="value">
            <td mat-cell *matCellDef="let row">{{ row.value }}</td>
          </ng-container>
          <tr mat-row *matRowDef="let row; columns: ['label', 'value']"></tr>
        </table>
      </ng-container>

      <!-- Occupancy -->
      <h3 class="header-title">Occupancy Information</h3>
      <mat-divider></mat-divider>
      <table
        mat-table
        [dataSource]="occupancyRows"
        style="width: 100%; border: 1px solid #ccc;"
      >
        <ng-container matColumnDef="label">
          <td
            mat-cell
            *matCellDef="let row"
            style="font-weight: 500; color: #555; width: 40%;"
          >
            {{ row.label }}
          </td>
        </ng-container>
        <ng-container matColumnDef="value">
          <td mat-cell *matCellDef="let row">{{ row.value }}</td>
        </ng-container>
        <tr mat-row *matRowDef="let row; columns: ['label', 'value']"></tr>
      </table>

      <!-- Images -->
      <ng-container *ngIf="property.images && property.images.length > 0">
        <h3 class="header-title">Images</h3>
        <mat-divider></mat-divider>
        <mat-list>
          <mat-list-item *ngFor="let image of property.images">
            <img [src]="getFullUrl(image)" alt="Preview" matListItemIcon style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
            <span matListItemTitle style="margin-left: 16px;">{{ getFileName(image) }}</span>
            <a
              matListItemMeta
              mat-icon-button
              [href]="getFullUrl(image)"
              target="_blank"
              color="primary"
            >
              <mat-icon>open_in_new</mat-icon>
            </a>
          </mat-list-item>
        </mat-list>
      </ng-container>

      <!-- Documents -->
      <ng-container *ngIf="property.documents && property.documents.length > 0">
        <h3 class="header-title">Documents</h3>
        <mat-divider></mat-divider>
        <mat-list>
          <mat-list-item *ngFor="let doc of property.documents">
            <div matListItemIcon style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background-color: #e0e0e0; border-radius: 4px; font-weight: 600; font-size: 11px; color: #333;">
              {{ getDocumentExtension(doc) }}
            </div>
            <span matListItemTitle style="margin-left: 16px;">{{ getFileName(doc) }}</span>
            <a
              matListItemMeta
              mat-icon-button
              [href]="getFullUrl(doc)"
              target="_blank"
              color="primary"
            >
              <mat-icon>open_in_new</mat-icon>
            </a>
          </mat-list-item>
        </mat-list>
      </ng-container>

      <!-- Notes -->
      <ng-container *ngIf="property.notes">
        <h3 class="header-title">Notes</h3>
        <mat-divider></mat-divider>
        <p>{{ property.notes }}</p>
      </ng-container>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-flat-button
        mat-dialog-close
        style="background-color: #9e9e9e; color: #fff;"
      >
        Close
      </button>
    </mat-dialog-actions>
  `,
})
export class PropertyViewDialogComponent {
  property: PropertyModel;
  private apiBaseUrl = `${environment.apiUrl}`;

  basicInfoRows: {
    label: string;
    value: string;
    chip?: boolean;
    chipColor?: string;
  }[] = [];
  addressRows: { label: string; value: string }[] = [];
  occupancyRows: { label: string; value: string }[] = [];

  constructor(
    public dialogRef: MatDialogRef<PropertyViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PropertyViewDialogData,
  ) {
    this.property = data.property;
    this.buildBasicInfoRows();
    this.buildAddressRows();
    this.buildOccupancyRows();
  }

  private buildBasicInfoRows(): void {
    const p = this.property;
    this.basicInfoRows = [
      { label: 'Property Name', value: p.propertyName },
      {
        label: 'Property Type',
        value: this.getPropertyTypeLabel(p.type),
        chip: true,
        chipColor: 'primary',
      },
      { label: 'Description', value: p.description },
      {
        label: 'Default Rent Amount',
        value: `₹${p.defaultRentAmount?.toLocaleString() || 0}`,
      },
      { label: 'Rent Due Day', value: `${p.defaultDueDay} of every month` },
      {
        label: 'Status',
        value: p.isActive ? 'Active' : 'Inactive',
        chip: true,
        chipColor: p.isActive ? 'accent' : 'warn',
      },
    ];
  }

  private buildAddressRows(): void {
    const a = this.property.address;
    if (!a) return;
    const fields: { label: string; value: string | undefined }[] = [
      { label: 'House/Flat No', value: a.houseNo },
      { label: 'Street', value: a.street },
      { label: 'Landmark', value: a.landmark },
      { label: 'City', value: a.city },
      { label: 'District', value: a.district },
      { label: 'State', value: a.state },
      { label: 'Pin Code', value: a.pinCode },
      { label: 'Country', value: a.country },
    ];
    this.addressRows = fields
      .filter((f) => f.value)
      .map((f) => ({ label: f.label, value: f.value! }));
  }

  private buildOccupancyRows(): void {
    const p = this.property;
    const total = p.totalUnits ?? 0;
    const occupied = p.occupiedUnits ?? 0;
    const pct = total === 0 ? 0 : Math.round((occupied / total) * 100);
    this.occupancyRows = [
      { label: 'Total Units', value: `${total}` },
      { label: 'Occupied Units', value: `${occupied}` },
      { label: 'Occupancy Rate', value: `${occupied}/${total} (${pct}%)` },
      { label: 'Fully Occupied', value: p.isFullyOccupied ? 'Yes' : 'No' },
    ];
  }

  getPropertyTypeLabel(type: number): string {
    return PropertyTypeLabels[type as PropertyType] || 'Unknown';
  }

  getFullUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (
      relativeUrl.startsWith('http://') ||
      relativeUrl.startsWith('https://')
    ) {
      return relativeUrl;
    }
    const serverUrl = this.apiBaseUrl.endsWith('/api') ? this.apiBaseUrl.substring(0, this.apiBaseUrl.length - 4) : this.apiBaseUrl;
    return `${serverUrl}${relativeUrl}`;
  }

  getFileName(url: string): string {
    if (!url) return '';
    return url.split('/').pop() || '';
  }

  getDocumentExtension(url: string): string {
    if (!url) return 'DOC';
    const filename = this.getFileName(url);
    const parts = filename.split('.');
    if (parts.length > 1) {
      const ext = parts.pop()?.toUpperCase() || 'DOC';
      return ext.length > 4 ? ext.substring(0, 4) : ext;
    }
    return 'DOC';
  }
}
