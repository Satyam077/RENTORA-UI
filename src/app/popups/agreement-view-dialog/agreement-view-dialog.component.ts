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
import {
    AgreementModel,
    AgreementType,
    AgreementStatus,
} from '../../core/models/agreement.model';
import { environment } from '../../../environments/environment';

export interface AgreementViewDialogData {
    agreement: AgreementModel;
}

const AgreementTypeLabels: Record<number, string> = {
    0: 'Residential', 1: 'Commercial', 2: 'PG', 3: 'Office', 4: 'Short Term', 5: 'Other',
};

const AgreementStatusLabels: Record<number, string> = {
    0: 'Draft', 1: 'Active', 2: 'Expired', 3: 'Terminated',
};

@Component({
    selector: 'app-agreement-view-dialog',
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
      <h2 mat-dialog-title class="header-title" style="margin: 0;">Agreement Details</h2>
      <button mat-icon-button mat-dialog-close style="margin-right: -8px;">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <!-- Agreement Info -->
      <h3 class="header-title">Agreement Information</h3>
      <mat-divider></mat-divider>
      <table mat-table [dataSource]="infoRows" style="width: 100%; border: 1px solid #ccc;">
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

      <!-- Financial Info -->
      <h3 class="header-title">Financial Details</h3>
      <mat-divider></mat-divider>
      <table mat-table [dataSource]="financialRows" style="width: 100%; border: 1px solid #ccc;">
        <ng-container matColumnDef="label">
          <td mat-cell *matCellDef="let row" style="font-weight: 500; color: #555; width: 40%;">{{ row.label }}</td>
        </ng-container>
        <ng-container matColumnDef="value">
          <td mat-cell *matCellDef="let row">{{ row.value }}</td>
        </ng-container>
        <tr mat-row *matRowDef="let row; columns: ['label', 'value']"></tr>
      </table>

      <!-- Document -->
      <ng-container *ngIf="agreement.agreementFileUrl">
        <h3 class="header-title">Document</h3>
        <mat-divider></mat-divider>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0;">
          <mat-icon>description</mat-icon>
          <a [href]="getFullUrl(agreement.agreementFileUrl)" target="_blank" style="color: #1565c0;">
            {{ getFileName(agreement.agreementFileUrl) }}
          </a>
        </div>
      </ng-container>

      <!-- Notes -->
      <ng-container *ngIf="agreement.notes">
        <h3 class="header-title">Notes</h3>
        <mat-divider></mat-divider>
        <p>{{ agreement.notes }}</p>
      </ng-container>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button mat-dialog-close style="background-color: #9e9e9e; color: #fff;">Close</button>
    </mat-dialog-actions>
  `,
})
export class AgreementViewDialogComponent {
    agreement: AgreementModel;
    infoRows: { label: string; value: string; chip?: boolean; chipColor?: string }[] = [];
    financialRows: { label: string; value: string }[] = [];
    private apiBaseUrl = `${environment.apiUrl}`;

    constructor(
        public dialogRef: MatDialogRef<AgreementViewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AgreementViewDialogData,
    ) {
        this.agreement = data.agreement;
        this.buildRows();
    }

    private buildRows(): void {
        const a = this.agreement;
        const statusColor = a.status === AgreementStatus.Active ? 'accent'
            : a.status === AgreementStatus.Terminated ? 'warn' : 'primary';

        this.infoRows = [
            { label: 'Agreement Number', value: a.agreementNumber },
            { label: 'Type', value: AgreementTypeLabels[a.agreementType] || 'Unknown', chip: true, chipColor: 'primary' },
            { label: 'Property', value: a.propertyName || '-' },
            { label: 'Unit', value: a.unitName || '-' },
            { label: 'Tenant', value: a.tenantName || '-' },
            { label: 'Start Date', value: this.formatDate(a.startDate) },
            { label: 'End Date', value: this.formatDate(a.endDate) },
            { label: 'Status', value: AgreementStatusLabels[a.status] || 'Unknown', chip: true, chipColor: statusColor },
        ];

        this.financialRows = [
            { label: 'Rent Amount', value: `₹${a.rentAmount?.toLocaleString() || 0}` },
            { label: 'Security Deposit', value: `₹${a.securityDeposit?.toLocaleString() || 0}` },
            { label: 'Rent Due Day', value: `${a.rentDueDay || '-'} of every month` },
        ];
    }

    private formatDate(date: Date | null | undefined): string {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    getFullUrl(url: string): string {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${this.apiBaseUrl}${url}`;
    }

    getFileName(url: string): string {
        if (!url) return '';
        return url.split('/').pop() || url;
    }
}
