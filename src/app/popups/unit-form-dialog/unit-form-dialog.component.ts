import { Component, Inject } from '@angular/core';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UnitModel, PropertyOption } from '../../core/models/unit.model';

export interface UnitFormDialogData {
  mode: 'add' | 'edit';
  unit: UnitModel;
  properties: PropertyOption[];
}

@Component({
  selector: 'app-unit-form-dialog',
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
    MatCheckboxModule,
  ],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2 mat-dialog-title class="header-title" style="margin: 0;">
        {{ data.mode === 'add' ? 'Add Unit' : 'Edit Unit' }}
      </h2>
      <button mat-icon-button mat-dialog-close style="margin-right: -8px;">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <h3 class="header-title">Unit Information</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 8px;">
        <mat-form-field appearance="fill">
          <mat-label>Property *</mat-label>
          <mat-select [(ngModel)]="unit.propertyId">
            <mat-option *ngFor="let prop of data.properties" [value]="prop.id">
              {{ prop.propertyName }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Unit Name *</mat-label>
          <input matInput [(ngModel)]="unit.unitName" placeholder="e.g., 1st Floor - Room No. 101">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Rent Amount *</mat-label>
          <input matInput type="number" min="1" [(ngModel)]="unit.rentAmount" placeholder="Enter rent amount">
          <span matTextPrefix>₹&nbsp;</span>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Security Deposit</mat-label>
          <input matInput type="number" min="0" [(ngModel)]="unit.securityDeposit" placeholder="Enter security deposit">
          <span matTextPrefix>₹&nbsp;</span>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Due Day</mat-label>
          <input matInput type="number" [(ngModel)]="unit.dueDay" min="1" max="31" placeholder="Day of month">
        </mat-form-field>
        <div style="display: flex; align-items: center; padding: 16px 0;">
          <mat-checkbox [(ngModel)]="unit.isOccupied" color="primary">Is Occupied</mat-checkbox>
        </div>
      </div>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Notes</mat-label>
        <textarea matInput [(ngModel)]="unit.notes" rows="3" placeholder="Additional notes about the unit"></textarea>
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
export class UnitFormDialogComponent {
  unit: UnitModel;
  error = '';

  constructor(
    public dialogRef: MatDialogRef<UnitFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnitFormDialogData,
  ) {
    this.unit = JSON.parse(JSON.stringify(data.unit));
  }

  onSave(): void {
    if (!this.unit.propertyId) {
      this.error = 'Please select a property';
      return;
    }
    if (!this.unit.unitName?.trim()) {
      this.error = 'Unit name is required';
      return;
    }
    if (this.unit.rentAmount <= 0) {
      this.error = 'Rent amount must be greater than 0';
      return;
    }
    this.dialogRef.close(this.unit);
  }
}
