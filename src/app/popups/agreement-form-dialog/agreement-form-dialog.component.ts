import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatDialogRef,
    MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
    AgreementModel,
    AgreementType,
    AgreementStatus,
    PropertyOption,
    UnitOption,
    TenantOption,
} from '../../core/models/agreement.model';
import { AgreementService } from '../../core/services/agreement.service';
import { environment } from '../../../environments/environment';

export interface AgreementFormDialogData {
    mode: 'add' | 'edit';
    agreement: AgreementModel;
    properties: PropertyOption[];
    allUnits: UnitOption[];
    allTenants: TenantOption[];
}

@Component({
    selector: 'app-agreement-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressBarModule,
    ],
    template: `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2 mat-dialog-title class="header-title" style="margin: 0;">
        {{ data.mode === 'add' ? 'Add Agreement' : 'Edit Agreement' }}
      </h2>
      <button mat-icon-button mat-dialog-close style="margin-right: -8px;">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <!-- Agreement Info -->
      <h3 class="header-title">Agreement Information</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 8px;">
        <mat-form-field appearance="fill">
          <mat-label>Agreement Number *</mat-label>
          <input matInput [(ngModel)]="agreement.agreementNumber" placeholder="e.g., AGR-001">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Agreement Type *</mat-label>
          <mat-select [(ngModel)]="agreement.agreementType">
            <mat-option [value]="0">Residential</mat-option>
            <mat-option [value]="1">Commercial</mat-option>
            <mat-option [value]="2">PG</mat-option>
            <mat-option [value]="3">Office</mat-option>
            <mat-option [value]="4">Short Term</mat-option>
            <mat-option [value]="5">Other</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Property, Unit, Tenant -->
      <h3 class="header-title">Property & Tenant</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 8px;">
        <mat-form-field appearance="fill">
          <mat-label>Property *</mat-label>
          <mat-select [(ngModel)]="agreement.propertyId" (selectionChange)="onPropertyChange()">
            <mat-option *ngFor="let prop of data.properties" [value]="prop.id">
              {{ prop.propertyName }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Unit *</mat-label>
          <mat-select [(ngModel)]="agreement.unitId" (selectionChange)="onUnitChange()">
            <mat-option *ngFor="let u of filteredUnits" [value]="u.id">
              {{ u.unitName }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill" style="grid-column: span 2;">
          <mat-label>Tenant *</mat-label>
          <mat-select [(ngModel)]="agreement.tenantId">
            <mat-option *ngFor="let t of filteredTenants" [value]="t.id">
              {{ t.fullName }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Dates & Financials -->
      <h3 class="header-title">Dates & Financials</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 8px;">
        <mat-form-field appearance="fill">
          <mat-label>Start Date *</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="agreement.startDate">
          <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>End Date *</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="agreement.endDate">
          <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Rent Amount *</mat-label>
          <input matInput type="number" min="1" [(ngModel)]="agreement.rentAmount">
          <span matTextPrefix>₹&nbsp;</span>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Security Deposit</mat-label>
          <input matInput type="number" min="0" [(ngModel)]="agreement.securityDeposit">
          <span matTextPrefix>₹&nbsp;</span>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Rent Due Day</mat-label>
          <input matInput type="number" min="1" max="31" [(ngModel)]="agreement.rentDueDay">
        </mat-form-field>
        <mat-form-field appearance="fill" *ngIf="data.mode === 'edit'">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="agreement.status">
            <mat-option [value]="0">Draft</mat-option>
            <mat-option [value]="1">Active</mat-option>
            <mat-option [value]="2">Expired</mat-option>
            <mat-option [value]="3">Terminated</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Document Upload -->
      <h3 class="header-title">Agreement Document</h3>
      <mat-divider></mat-divider>
      <div style="margin-top: 8px;">
        <div *ngIf="agreement.agreementFileUrl" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <mat-icon>description</mat-icon>
          <a [href]="getFullUrl(agreement.agreementFileUrl)" target="_blank" style="color: #1565c0;">
            {{ getFileName(agreement.agreementFileUrl) }}
          </a>
          <button mat-icon-button color="warn" (click)="removeFile()">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
        <input type="file" #fileInput (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,image/*" style="display: none;">
        <button mat-stroked-button color="primary" (click)="fileInput.click()" [disabled]="isUploading">
          <mat-icon>upload_file</mat-icon> Upload Document
        </button>
        <mat-progress-bar *ngIf="isUploading" mode="indeterminate" style="margin-top: 8px;"></mat-progress-bar>
      </div>

      <!-- Notes -->
      <mat-form-field appearance="fill" style="width: 100%; margin-top: 8px;">
        <mat-label>Notes</mat-label>
        <textarea matInput [(ngModel)]="agreement.notes" rows="2"></textarea>
      </mat-form-field>

      <p *ngIf="error" style="color: red;">{{ error }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button mat-dialog-close style="background-color: #9e9e9e; color: #fff;">Cancel</button>
      <button mat-flat-button (click)="onSave()" style="background-color: #e91e63; color: #fff;">
        {{ data.mode === 'add' ? 'Save' : 'Save Changes' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class AgreementFormDialogComponent implements OnInit {
    agreement: AgreementModel;
    filteredUnits: UnitOption[] = [];
    filteredTenants: TenantOption[] = [];
    error = '';
    isUploading = false;
    selectedFile: File | null = null;
    private apiBaseUrl = `${environment.apiUrl}`;

    constructor(
        public dialogRef: MatDialogRef<AgreementFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AgreementFormDialogData,
        private agreementService: AgreementService,
    ) {
        this.agreement = JSON.parse(JSON.stringify(data.agreement));
    }

    ngOnInit(): void {
        this.onPropertyChange();
    }

    onPropertyChange(): void {
        if (this.agreement.propertyId) {
            this.filteredUnits = this.data.allUnits.filter(
                (u) => u.propertyId === this.agreement.propertyId,
            );
            this.filteredTenants = this.data.allTenants.filter(
                (t) => !t.propertyId || t.propertyId === this.agreement.propertyId,
            );
        } else {
            this.filteredUnits = [];
            this.filteredTenants = [...this.data.allTenants];
        }
    }

    onUnitChange(): void {
        if (this.agreement.unitId) {
            this.filteredTenants = this.data.allTenants.filter(
                (t) => !t.unitId || t.unitId === this.agreement.unitId,
            );
        }
    }

    onFileSelected(event: any): void {
        const file = event.target?.files?.[0];
        if (!file) return;
        this.isUploading = true;
        this.agreementService.uploadAgreementDocument(file).subscribe({
            next: (response: any) => {
                this.isUploading = false;
                if (response.success && response.data) {
                    this.agreement.agreementFileUrl = response.data;
                }
            },
            error: () => {
                this.isUploading = false;
                this.error = 'Failed to upload document';
            },
        });
    }

    removeFile(): void {
        this.agreement.agreementFileUrl = '';
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

    onSave(): void {
        if (!this.agreement.agreementNumber?.trim()) { this.error = 'Agreement number is required'; return; }
        if (!this.agreement.propertyId) { this.error = 'Please select a property'; return; }
        if (!this.agreement.unitId) { this.error = 'Please select a unit'; return; }
        if (!this.agreement.tenantId) { this.error = 'Please select a tenant'; return; }
        if (!this.agreement.startDate) { this.error = 'Start date is required'; return; }
        if (!this.agreement.endDate) { this.error = 'End date is required'; return; }
        if (this.agreement.rentAmount <= 0) { this.error = 'Rent amount must be greater than 0'; return; }
        this.dialogRef.close(this.agreement);
    }
}
