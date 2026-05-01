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
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  PropertyModel,
  PropertyAddress,
} from '../../core/models/property.model';
import {
  PropertyType,
  PropertyTypeLabels,
} from '../../core/models/property-type.enum';
import { PropertyService } from '../../core/services/property.service';
import { environment } from '../../../environments/environment';

export interface PropertyFormDialogData {
  mode: 'add' | 'edit';
  property: PropertyModel;
  propertyTypeOptions: { value: number; label: string }[];
}

@Component({
  selector: 'app-property-form-dialog',
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
    MatListModule,
    MatProgressBarModule,
  ],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2 mat-dialog-title class="header-title" style="margin: 0;">{{ data.mode === 'add' ? 'Add Property' : 'Edit Property' }}</h2>
      <button mat-icon-button mat-dialog-close style="margin-right: -8px;">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content>
      <!-- Basic Information -->
      <h3 class="header-title">Basic Information</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px;">
        <mat-form-field appearance="fill">
          <mat-label>Property Name *</mat-label>
          <input matInput [(ngModel)]="property.propertyName" placeholder="Enter property name">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Property Type *</mat-label>
          <mat-select [(ngModel)]="property.type">
            <mat-option *ngFor="let opt of data.propertyTypeOptions" [value]="opt.value">
              {{ opt.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Default Rent Amount *</mat-label>
          <input matInput type="number" min="1" [(ngModel)]="property.defaultRentAmount" placeholder="Enter default rent">
          <span matTextPrefix>₹&nbsp;</span>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Rent Due Day</mat-label>
          <input matInput type="number" [(ngModel)]="property.defaultDueDay" min="1" max="31" placeholder="Day of month">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Notes</mat-label>
          <input matInput [(ngModel)]="property.notes" placeholder="Additional notes">
        </mat-form-field>
      </div>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Description *</mat-label>
        <textarea matInput [(ngModel)]="property.description" rows="3" placeholder="Enter property description"></textarea>
      </mat-form-field>

      <!-- Address -->
      <h3 class="header-title">Address</h3>
      <mat-divider></mat-divider>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px;">
        <mat-form-field appearance="fill">
          <mat-label>House No</mat-label>
          <input matInput [(ngModel)]="property.address.houseNo" placeholder="House/Flat No">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Street</mat-label>
          <input matInput [(ngModel)]="property.address.street" placeholder="Street name">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Landmark</mat-label>
          <input matInput [(ngModel)]="property.address.landmark" placeholder="Nearby landmark">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>City</mat-label>
          <input matInput [(ngModel)]="property.address.city" placeholder="City">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>District</mat-label>
          <input matInput [(ngModel)]="property.address.district" placeholder="District">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>State</mat-label>
          <input matInput [(ngModel)]="property.address.state" placeholder="State">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Pin Code</mat-label>
          <input matInput [(ngModel)]="property.address.pinCode" placeholder="Pin code">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Country</mat-label>
          <input matInput [(ngModel)]="property.address.country" placeholder="Country">
        </mat-form-field>
      </div>

      <!-- Images -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 class="header-title">Images</h3>
        <input type="file" #imageInput (change)="onImageFileSelected($event)"
          accept="image/jpeg,image/jpg,image/png,image/webp" style="display: none;">
        <button mat-stroked-button color="primary" (click)="imageInput.click()" [disabled]="isUploadingImage">
          <mat-icon>upload</mat-icon>
          {{ isUploadingImage ? 'Uploading...' : 'Upload Image' }}
        </button>
      </div>
      <mat-divider></mat-divider>
      <mat-progress-bar *ngIf="isUploadingImage" mode="indeterminate"></mat-progress-bar>
      <p *ngIf="property.images.length === 0" style="color: #888;">No images uploaded.</p>
      <mat-list *ngIf="property.images.length > 0">
        <mat-list-item *ngFor="let image of property.images; let i = index">
          <img [src]="getFullUrl(image)" alt="Preview" matListItemIcon style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
          <span matListItemTitle style="margin-left: 16px;">{{ getImageFileName(image) }}</span>
          <div matListItemMeta>
            <a mat-icon-button [href]="getFullUrl(image)" target="_blank" color="primary">
              <mat-icon>visibility</mat-icon>
            </a>
            <button mat-icon-button color="warn" (click)="removeImage(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-list-item>
      </mat-list>

      <!-- Documents -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 class="header-title">Documents</h3>
        <input type="file" #documentInput (change)="onDocumentFileSelected($event)"
          accept=".pdf,.doc,.docx,image/jpeg,image/jpg,image/png" style="display: none;">
        <button mat-stroked-button color="primary" (click)="documentInput.click()" [disabled]="isUploadingDocument">
          <mat-icon>upload</mat-icon>
          {{ isUploadingDocument ? 'Uploading...' : 'Upload Document' }}
        </button>
      </div>
      <mat-divider></mat-divider>
      <mat-progress-bar *ngIf="isUploadingDocument" mode="indeterminate"></mat-progress-bar>
      <p *ngIf="property.documents.length === 0" style="color: #888;">No documents uploaded.</p>
      <mat-list *ngIf="property.documents.length > 0">
        <mat-list-item *ngFor="let doc of property.documents; let i = index">
          <div matListItemIcon style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background-color: #e0e0e0; border-radius: 4px; font-weight: 600; font-size: 11px; color: #333;">
            {{ getDocumentExtension(doc) }}
          </div>
          <span matListItemTitle style="margin-left: 16px;">{{ getDocumentFileName(doc) }}</span>
          <div matListItemMeta>
            <a mat-icon-button [href]="getFullUrl(doc)" target="_blank" color="primary">
              <mat-icon>visibility</mat-icon>
            </a>
            <button mat-icon-button color="warn" (click)="removeDocument(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-list-item>
      </mat-list>

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
export class PropertyFormDialogComponent {
  property: PropertyModel;
  error = '';
  isUploadingImage = false;
  isUploadingDocument = false;
  private apiBaseUrl = `${environment.apiUrl}`;

  constructor(
    public dialogRef: MatDialogRef<PropertyFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PropertyFormDialogData,
    private propertyService: PropertyService
  ) {
    this.property = JSON.parse(JSON.stringify(data.property));
  }

  onSave(): void {
    if (!this.property.propertyName || !this.property.description) {
      this.error = 'Please fill in all required fields';
      return;
    }
    this.dialogRef.close(this.property);
  }

  // --- Image Upload ---
  onImageFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'Invalid file type. Allowed: JPG, JPEG, PNG, WEBP';
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'File size exceeds 5MB limit';
      event.target.value = '';
      return;
    }
    this.isUploadingImage = true;
    this.error = '';
    this.propertyService.uploadPropertyImage(file).subscribe({
      next: (response) => {
        this.isUploadingImage = false;
        if (response.success && response.data) {
          this.property.images.push(response.data.fileUrl);
        } else {
          this.error = response.message || 'Failed to upload image';
        }
      },
      error: (err) => {
        this.isUploadingImage = false;
        this.error = err.error?.message || 'Error uploading image.';
      },
    });
    event.target.value = '';
  }

  removeImage(index: number): void {
    this.property.images.splice(index, 1);
  }

  // --- Document Upload ---
  onDocumentFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG';
      event.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.error = 'File size exceeds 10MB limit';
      event.target.value = '';
      return;
    }
    this.isUploadingDocument = true;
    this.error = '';
    this.propertyService.uploadPropertyDocument(file).subscribe({
      next: (response) => {
        this.isUploadingDocument = false;
        if (response.success && response.data) {
          this.property.documents.push(response.data.fileUrl);
        } else {
          this.error = response.message || 'Failed to upload document';
        }
      },
      error: (err) => {
        this.isUploadingDocument = false;
        this.error = err.error?.message || 'Error uploading document.';
      },
    });
    event.target.value = '';
  }

  removeDocument(index: number): void {
    this.property.documents.splice(index, 1);
  }

  // --- Helpers ---
  getFullUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    const serverUrl = this.apiBaseUrl.endsWith('/api') ? this.apiBaseUrl.substring(0, this.apiBaseUrl.length - 4) : this.apiBaseUrl;
    return `${serverUrl}${relativeUrl}`;
  }

  getImageFileName(url: string): string {
    if (!url) return '';
    return url.split('/').pop() || '';
  }

  getDocumentFileName(url: string): string {
    if (!url) return '';
    return url.split('/').pop() || '';
  }

  getDocumentExtension(url: string): string {
    if (!url) return 'DOC';
    const filename = this.getDocumentFileName(url);
    const parts = filename.split('.');
    if (parts.length > 1) {
      const ext = parts.pop()?.toUpperCase() || 'DOC';
      return ext.length > 4 ? ext.substring(0, 4) : ext;
    }
    return 'DOC';
  }
}
