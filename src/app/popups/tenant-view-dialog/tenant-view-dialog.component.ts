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
import { TenantModel } from '../../core/models/tenant.model';

export interface TenantViewDialogData {
    tenant: TenantModel;
    propertyName: string;
    unitName: string;
}

@Component({
    selector: 'app-tenant-view-dialog',
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
      <h2 mat-dialog-title class="header-title" style="margin: 0;">Tenant Details</h2>
      <button mat-icon-button mat-dialog-close style="margin-right: -8px;">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <!-- Personal Information -->
      <h3 class="header-title">Personal Information</h3>
      <mat-divider></mat-divider>
      <table mat-table [dataSource]="personalRows" style="width: 100%; border: 1px solid #ccc;">
        <ng-container matColumnDef="label">
          <td mat-cell *matCellDef="let row" style="font-weight: 500; color: #555; width: 40%;">{{ row.label }}</td>
        </ng-container>
        <ng-container matColumnDef="value">
          <td mat-cell *matCellDef="let row">
            <mat-chip-set *ngIf="row.chip; else plainValue">
              <mat-chip [highlighted]="true" [color]="row.chipColor || 'primary'">{{ row.value }}</mat-chip>
            </mat-chip-set>
            <ng-template #plainValue>{{ row.value }}</ng-template>
          </td>
        </ng-container>
        <tr mat-row *matRowDef="let row; columns: ['label', 'value']"></tr>
      </table>

      <!-- Rent & Agreement -->
      <h3 class="header-title">Rent & Agreement</h3>
      <mat-divider></mat-divider>
      <table mat-table [dataSource]="rentRows" style="width: 100%; border: 1px solid #ccc;">
        <ng-container matColumnDef="label">
          <td mat-cell *matCellDef="let row" style="font-weight: 500; color: #555; width: 40%;">{{ row.label }}</td>
        </ng-container>
        <ng-container matColumnDef="value">
          <td mat-cell *matCellDef="let row">{{ row.value }}</td>
        </ng-container>
        <tr mat-row *matRowDef="let row; columns: ['label', 'value']"></tr>
      </table>

      <!-- ID Proof -->
      <ng-container *ngIf="idRows.length > 0">
        <h3 class="header-title">ID Proof</h3>
        <mat-divider></mat-divider>
        <table mat-table [dataSource]="idRows" style="width: 100%; border: 1px solid #ccc;">
          <ng-container matColumnDef="label">
            <td mat-cell *matCellDef="let row" style="font-weight: 500; color: #555; width: 40%;">{{ row.label }}</td>
          </ng-container>
          <ng-container matColumnDef="value">
            <td mat-cell *matCellDef="let row">{{ row.value }}</td>
          </ng-container>
          <tr mat-row *matRowDef="let row; columns: ['label', 'value']"></tr>
        </table>
      </ng-container>

      <!-- Notes -->
      <ng-container *ngIf="tenant.notes">
        <h3 class="header-title">Notes</h3>
        <mat-divider></mat-divider>
        <p>{{ tenant.notes }}</p>
      </ng-container>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button mat-dialog-close style="background-color: #9e9e9e; color: #fff;">Close</button>
    </mat-dialog-actions>
  `,
})
export class TenantViewDialogComponent {
    tenant: TenantModel;
    personalRows: { label: string; value: string; chip?: boolean; chipColor?: string }[] = [];
    rentRows: { label: string; value: string }[] = [];
    idRows: { label: string; value: string }[] = [];

    constructor(
        public dialogRef: MatDialogRef<TenantViewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TenantViewDialogData,
    ) {
        this.tenant = data.tenant;
        this.buildRows();
    }

    private buildRows(): void {
        const t = this.tenant;
        this.personalRows = [
            { label: 'Full Name', value: t.fullName },
            { label: 'Email', value: t.email },
            { label: 'Mobile', value: t.mobile },
            { label: 'Gender', value: t.gender || '-' },
            { label: 'Property', value: this.data.propertyName },
            { label: 'Unit', value: this.data.unitName },
            {
                label: 'Status',
                value: t.isActiveTenant ? 'Active' : 'Inactive',
                chip: true,
                chipColor: t.isActiveTenant ? 'accent' : 'warn',
            },
        ];

        this.rentRows = [
            { label: 'Rent Amount', value: `₹${t.rentAmount?.toLocaleString() || 0}` },
            { label: 'Security Deposit', value: `₹${t.securityDeposit?.toLocaleString() || 0}` },
            { label: 'Rent Due Day', value: `${t.rentDueDay || '-'} of every month` },
            { label: 'Agreement Start', value: this.formatDate(t.agreementStartDate) },
            { label: 'Agreement End', value: this.formatDate(t.agreementEndDate) },
            { label: 'Move-in Date', value: this.formatDate(t.moveInDate) },
        ];

        const id: { label: string; value: string }[] = [];
        if (t.idProofType) id.push({ label: 'ID Proof Type', value: t.idProofType });
        if (t.idProofNumber) id.push({ label: 'ID Proof Number', value: t.idProofNumber });
        if (t.permanentAddress) id.push({ label: 'Permanent Address', value: t.permanentAddress });
        if (t.currentAddress) id.push({ label: 'Current Address', value: t.currentAddress });
        this.idRows = id;
    }

    private formatDate(date: Date | null | undefined): string {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
}
