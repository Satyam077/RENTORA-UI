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
import {
    PropertyOption,
    UnitOption,
} from '../../core/models/tenant.model';
import { PhoneMaskDirective } from '../../core/helpers/phone-mask.directive';

export interface TenantFormModel {
    id?: string;
    userId?: string;
    ownerId: string;
    propertyId: string;
    unitId: string;
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    gender?: string;
    dateOfBirth?: Date | null;
    permanentAddress?: string;
    currentAddress?: string;
    rentAmount: number;
    securityDeposit?: number;
    rentDueDay?: number;
    agreementStartDate: Date;
    agreementEndDate: Date;
    documents?: string[];
    idProofType?: string;
    idProofNumber?: string;
    isActiveTenant?: boolean;
    isRentPending?: boolean;
    isMovedOut?: boolean;
    moveInDate?: Date | null;
    moveOutDate?: Date | null;
    notes?: string;
    isActive?: boolean;
    createdBy?: string;
    updatedBy?: string;
}

export interface TenantFormDialogData {
    mode: 'add' | 'edit';
    tenant: TenantFormModel;
    properties: PropertyOption[];
    allUnits: UnitOption[];
}

@Component({
    selector: 'app-tenant-form-dialog',
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
        PhoneMaskDirective
    ],
    template: `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2 mat-dialog-title class="header-title" style="margin: 0;">
        {{ data.mode === 'add' ? 'Add Tenant' : 'Edit Tenant' }}
      </h2>
      <button mat-icon-button mat-dialog-close style="margin-right: -8px;">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <!-- Personal Information -->
      <h3 class="header-title">Personal Information</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 8px;">
        <mat-form-field appearance="fill">
          <mat-label>First Name *</mat-label>
          <input matInput [(ngModel)]="tenant.firstName" placeholder="Enter first name">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Last Name *</mat-label>
          <input matInput [(ngModel)]="tenant.lastName" placeholder="Enter last name">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Email *</mat-label>
          <input matInput type="email" [(ngModel)]="tenant.email" placeholder="Enter email">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Mobile *</mat-label>
          <input matInput [(ngModel)]="tenant.mobile" placeholder="Enter mobile number" appPhoneMask>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Gender</mat-label>
          <mat-select [(ngModel)]="tenant.gender">
            <mat-option value="Male">Male</mat-option>
            <mat-option value="Female">Female</mat-option>
            <mat-option value="Other">Other</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Date of Birth</mat-label>
          <input matInput [matDatepicker]="dobPicker" [(ngModel)]="tenant.dateOfBirth">
          <mat-datepicker-toggle matIconSuffix [for]="dobPicker"></mat-datepicker-toggle>
          <mat-datepicker #dobPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <!-- Property & Unit -->
      <h3 class="header-title">Property & Unit</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 8px;">
        <mat-form-field appearance="fill">
          <mat-label>Property *</mat-label>
          <mat-select [(ngModel)]="tenant.propertyId" (selectionChange)="onPropertyChange()">
            <mat-option *ngFor="let prop of data.properties" [value]="prop.id">
              {{ prop.propertyName }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Unit *</mat-label>
          <mat-select [(ngModel)]="tenant.unitId">
            <mat-option *ngFor="let u of filteredUnits" [value]="u.id">
              {{ u.unitName }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Rent & Agreement -->
      <h3 class="header-title">Rent & Agreement</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 8px;">
        <mat-form-field appearance="fill">
          <mat-label>Rent Amount *</mat-label>
          <input matInput type="number" min="1" [(ngModel)]="tenant.rentAmount">
          <span matTextPrefix>₹&nbsp;</span>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Security Deposit</mat-label>
          <input matInput type="number" min="0" [(ngModel)]="tenant.securityDeposit">
          <span matTextPrefix>₹&nbsp;</span>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Rent Due Day</mat-label>
          <input matInput type="number" min="1" max="31" [(ngModel)]="tenant.rentDueDay">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Move-in Date</mat-label>
          <input matInput [matDatepicker]="movePicker" [(ngModel)]="tenant.moveInDate">
          <mat-datepicker-toggle matIconSuffix [for]="movePicker"></mat-datepicker-toggle>
          <mat-datepicker #movePicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Agreement Start Date *</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="tenant.agreementStartDate">
          <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Agreement End Date *</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="tenant.agreementEndDate">
          <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
      </div>

      <!-- ID Proof & Address -->
      <h3 class="header-title">ID Proof & Address</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 8px;">
        <mat-form-field appearance="fill">
          <mat-label>ID Proof Type</mat-label>
          <mat-select [(ngModel)]="tenant.idProofType">
            <mat-option value="Aadhaar">Aadhaar</mat-option>
            <mat-option value="PAN">PAN</mat-option>
            <mat-option value="Passport">Passport</mat-option>
            <mat-option value="Driving License">Driving License</mat-option>
            <mat-option value="Voter ID">Voter ID</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>ID Proof Number</mat-label>
          <input matInput [(ngModel)]="tenant.idProofNumber">
        </mat-form-field>
      </div>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Permanent Address</mat-label>
        <textarea matInput [(ngModel)]="tenant.permanentAddress" rows="2"></textarea>
      </mat-form-field>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Current Address</mat-label>
        <textarea matInput [(ngModel)]="tenant.currentAddress" rows="2"></textarea>
      </mat-form-field>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Notes</mat-label>
        <textarea matInput [(ngModel)]="tenant.notes" rows="2"></textarea>
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
export class TenantFormDialogComponent implements OnInit {
    tenant: TenantFormModel;
    filteredUnits: UnitOption[] = [];
    error = '';

    constructor(
        public dialogRef: MatDialogRef<TenantFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TenantFormDialogData,
    ) {
        this.tenant = JSON.parse(JSON.stringify(data.tenant));
    }

    ngOnInit(): void {
        this.onPropertyChange();
    }

    onPropertyChange(): void {
        if (this.tenant.propertyId) {
            this.filteredUnits = this.data.allUnits.filter(
                (u) => u.propertyId === this.tenant.propertyId,
            );
        } else {
            this.filteredUnits = [];
        }
    }

    onSave(): void {
        if (!this.tenant.firstName?.trim()) { this.error = 'First name is required'; return; }
        if (!this.tenant.lastName?.trim()) { this.error = 'Last name is required'; return; }
        if (!this.tenant.email?.trim()) { this.error = 'Email is required'; return; }
        if (!this.tenant.mobile?.trim()) { this.error = 'Mobile is required'; return; }
        if (!this.tenant.propertyId) { this.error = 'Please select a property'; return; }
        if (!this.tenant.unitId) { this.error = 'Please select a unit'; return; }
        if (this.tenant.rentAmount <= 0) { this.error = 'Rent amount must be greater than 0'; return; }
        this.dialogRef.close(this.tenant);
    }
}
