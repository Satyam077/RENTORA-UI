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
import { MatTableModule } from '@angular/material/table';
import { UnitModel, PropertyOption } from '../../core/models/unit.model';

export interface UnitViewDialogData {
    unit: UnitModel;
    propertyName: string;
}

@Component({
    selector: 'app-unit-view-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatChipsModule,
        MatTableModule,
    ],
    template: `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2 mat-dialog-title class="header-title" style="margin: 0;">Unit Details</h2>
      <button mat-icon-button mat-dialog-close style="margin-right: -8px;">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <h3 class="header-title">Unit Information</h3>
      <mat-divider></mat-divider>
      <table
        mat-table
        [dataSource]="infoRows"
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
              >{{ row.value }}</mat-chip>
            </mat-chip-set>
            <ng-template #plainValue>{{ row.value }}</ng-template>
          </td>
        </ng-container>
        <tr mat-row *matRowDef="let row; columns: ['label', 'value']"></tr>
      </table>

      <ng-container *ngIf="unit.notes">
        <h3 class="header-title">Notes</h3>
        <mat-divider></mat-divider>
        <p>{{ unit.notes }}</p>
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
export class UnitViewDialogComponent {
    unit: UnitModel;
    infoRows: { label: string; value: string; chip?: boolean; chipColor?: string }[] = [];

    constructor(
        public dialogRef: MatDialogRef<UnitViewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UnitViewDialogData,
    ) {
        this.unit = data.unit;
        this.buildInfoRows();
    }

    private buildInfoRows(): void {
        const u = this.unit;
        this.infoRows = [
            { label: 'Unit Name', value: u.unitName },
            { label: 'Property', value: this.data.propertyName },
            {
                label: 'Status',
                value: u.isOccupied ? 'Occupied' : 'Vacant',
                chip: true,
                chipColor: u.isOccupied ? 'primary' : 'accent',
            },
            { label: 'Rent Amount', value: `₹${u.rentAmount?.toLocaleString() || 0}` },
            { label: 'Security Deposit', value: `₹${u.securityDeposit?.toLocaleString() || 0}` },
            { label: 'Due Day', value: `${u.dueDay} of every month` },
            {
                label: 'Active',
                value: u.isActive !== false ? 'Yes' : 'No',
                chip: true,
                chipColor: u.isActive !== false ? 'accent' : 'warn',
            },
        ];
    }
}
