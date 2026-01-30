import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../core/services/property.service';
import {
  PropertyModel,
  PropertyAddress,
  UnitModel,
  PropertyCreateRequest,
  PropertyUpdateRequest,
} from '../../../core/models/property.model';
import {
  PropertyType,
  PropertyTypeLabels,
} from '../../../core/models/property-type.enum';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-property',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property.component.html',
  styleUrl: './property.component.css',
})
export class PropertyComponent implements OnInit {
  properties: PropertyModel[] = [];
  filteredProperties: PropertyModel[] = [];
  selectedProperty: PropertyModel | null = null;
  isEditingProperty = false;
  isAddingProperty = false;
  isLoadingProperties = false;
  isViewingProperty = false;
  success = '';
  error = '';
  searchTerm: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  private apiBaseUrl = `${environment.apiUrl}`;
  PropertyType = PropertyType;
  propertyTypeLabels = PropertyTypeLabels;
  propertyTypeOptions = Object.keys(PropertyType)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => ({
      value: Number(key),
      label: PropertyTypeLabels[Number(key) as PropertyType],
    }));

  currentOwnerId: string = '';

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentOwnerId = user.user?.id || '';
    }

    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoadingProperties = true;
    this.error = '';

    if (this.currentOwnerId) {
      this.propertyService
        .getPropertiesByOwnerId(this.currentOwnerId)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.properties = response.data;
              this.applyFilters();
            } else {
              this.error = response.message || 'Failed to load properties';
            }
            this.isLoadingProperties = false;
          },
          error: (err) => {
            this.error =
              err.error?.message ||
              'Failed to load properties. Please try again.';
            this.isLoadingProperties = false;
          },
        });
    } else {
      this.isLoadingProperties = false;
      this.error = 'Owner ID not found. Please log in again.';
    }
  }

  applyFilters(): void {
    let filtered = [...this.properties];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (property) =>
          property.propertyName?.toLowerCase().includes(search) ||
          property.description?.toLowerCase().includes(search) ||
          this.getPropertyTypeLabel(property.type)
            ?.toLowerCase()
            .includes(search) ||
          property.address?.city?.toLowerCase().includes(search) ||
          property.address?.state?.toLowerCase().includes(search),
      );
    }

    this.filteredProperties = filtered;
    this.totalPages = Math.ceil(
      this.filteredProperties.length / this.itemsPerPage,
    );
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  openAddPropertyModal(): void {
    this.selectedProperty = {
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
    this.isAddingProperty = true;
  }

  editProperty(property: PropertyModel): void {
    this.selectedProperty = JSON.parse(JSON.stringify(property));
    this.isEditingProperty = true;
  }
  saveProperty(): void {
    if (!this.selectedProperty) return;

    this.error = '';
    this.success = '';

    if (
      !this.selectedProperty.propertyName ||
      !this.selectedProperty.description
    ) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (this.isAddingProperty) {
      const createRequest: PropertyCreateRequest = {
        ownerId: this.selectedProperty.ownerId,
        propertyName: this.selectedProperty.propertyName,
        description: this.selectedProperty.description,
        type: this.selectedProperty.type,
        address: this.selectedProperty.address,
        // units: this.selectedProperty.units,
        images: this.selectedProperty.images,
        documents: this.selectedProperty.documents,
        defaultRentAmount: this.selectedProperty.defaultRentAmount,
        defaultDueDay: this.selectedProperty.defaultDueDay,
        notes: this.selectedProperty.notes,
        createdBy: this.currentOwnerId,
      };

      this.propertyService.createProperty(createRequest).subscribe({
        next: (response: any) => {
          if (response.success) {
            const property = response.data;
            this.properties.unshift(property);
            this.success = response.message || 'Property created successfully!';
            this.loadProperties();
            this.cancelPropertyEdit();

            // Auto-clear success message after 5 seconds
            setTimeout(() => {
              this.success = '';
            }, 5000);
          } else {
            this.error = response.message || 'Failed to create property';
          }
        },
        error: (err) => {
          if (err.error?.message) {
            this.error = err.error.message;
          } else if (typeof err.error === 'string') {
            this.error = err.error;
          } else if (err.message) {
            this.error = err.message;
          } else {
            this.error = 'Failed to create property. Please try again.';
          }
        },
      });
    } else if (this.isEditingProperty && this.selectedProperty.id) {
      const updateRequest: PropertyUpdateRequest = {
        id: this.selectedProperty.id,
        ownerId: this.selectedProperty.ownerId,
        propertyName: this.selectedProperty.propertyName,
        description: this.selectedProperty.description,
        type: this.selectedProperty.type,
        address: this.selectedProperty.address,
        //units: this.selectedProperty.units,
        images: this.selectedProperty.images,
        documents: this.selectedProperty.documents,
        defaultRentAmount: this.selectedProperty.defaultRentAmount,
        defaultDueDay: this.selectedProperty.defaultDueDay,
        notes: this.selectedProperty.notes,
        isActive: this.selectedProperty.isActive ?? true,
        updatedBy: this.currentOwnerId,
      };

      this.propertyService.updateProperty(updateRequest).subscribe({
        next: (response: any) => {
          if (response.success) {
            const property = response.data;
            const index = this.properties.findIndex(
              (p) => p.id === property.id,
            );
            if (index !== -1) {
              this.properties[index] = property;
            }
            this.success = response.message || 'Property updated successfully!';
            this.loadProperties();
            this.cancelPropertyEdit();

            setTimeout(() => {
              this.success = '';
            }, 5000);
          } else {
            this.error = response.message || 'Failed to update property';
          }
        },
        error: (err) => {
          if (err.error?.message) {
            this.error = err.error.message;
          } else if (typeof err.error === 'string') {
            this.error = err.error;
          } else if (err.message) {
            this.error = err.message;
          } else {
            this.error = 'Failed to update property. Please try again.';
          }
        },
      });
    }
  }

  deleteProperty(property: PropertyModel): void {
    if (!property.id) return;

    if (
      confirm(
        `Are you sure you want to delete the property "${property.propertyName}"?`,
      )
    ) {
      this.propertyService.deleteProperty(property.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.properties = this.properties.filter(
              (p) => p.id !== property.id,
            );
            this.success = response.message || 'Property deleted successfully!';
            this.loadProperties();
            setTimeout(() => {
              this.success = '';
            }, 5000);
          } else {
            this.error = response.message || 'Failed to delete property';
          }
        },
        error: (err) => {
          this.error =
            err.error?.message ||
            'Failed to delete property. Please try again.';
        },
      });
    }
  }

  cancelPropertyEdit(): void {
    this.selectedProperty = null;
    this.isEditingProperty = false;
    this.isAddingProperty = false;
  }

  getPropertyTypeLabel(type: number): string {
    return PropertyTypeLabels[type as PropertyType] || 'Unknown';
  }

  getAddressString(property: PropertyModel): string {
    if (!property.address) return '-';
    const parts = [
      property.address.houseNo,
      property.address.street,
      property.address.city,
      property.address.state,
    ].filter((p) => p);
    return parts.length > 0 ? parts.join(', ') : '-';
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

  viewProperty(property: PropertyModel): void {
    this.selectedProperty = { ...property };
    this.isViewingProperty = true;
  }

  closeViewModal(): void {
    this.selectedProperty = null;
    this.isViewingProperty = false;
  }

  getPaginatedProperties(): PropertyModel[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProperties.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  Math = Math;

  addUnit(): void {
    if (!this.selectedProperty) return;

    const newUnit: UnitModel = {
      unitName: '',
      rentAmount: this.selectedProperty.defaultRentAmount,
      securityDeposit: 0,
      isOccupied: false,
      notes: '',
    };

    this.selectedProperty.units.push(newUnit);
  }

  removeUnit(index: number): void {
    if (!this.selectedProperty) return;
    this.selectedProperty.units.splice(index, 1);
  }

  selectedImageFile: File | null = null;
  selectedDocumentFile: File | null = null;
  isUploadingImage: boolean = false;
  isUploadingDocument: boolean = false;

  onImageFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Invalid file type. Allowed types: JPG, JPEG, PNG, WEBP';
        event.target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.error = 'File size exceeds 5MB limit';
        event.target.value = '';
        return;
      }

      this.selectedImageFile = file;
      this.uploadImage();
    }
  }

  uploadImage(): void {
    if (!this.selectedImageFile || !this.selectedProperty) return;

    this.isUploadingImage = true;
    this.error = '';

    this.propertyService.uploadPropertyImage(this.selectedImageFile).subscribe({
      next: (response) => {
        this.isUploadingImage = false;
        if (response.success && response.data) {
          this.selectedProperty!.images.push(response.data.fileUrl);
          this.success = 'Image uploaded successfully';
          this.selectedImageFile = null;
          setTimeout(() => (this.success = ''), 3000);
        } else {
          this.error = response.message || 'Failed to upload image';
        }
      },
      error: (err) => {
        this.isUploadingImage = false;
        this.selectedImageFile = null;
        this.error =
          err.error?.message || 'Error uploading image. Please try again.';
      },
    });
  }

  removeImage(index: number): void {
    if (!this.selectedProperty) return;
    if (confirm('Are you sure you want to remove this image?')) {
      this.selectedProperty.images.splice(index, 1);
    }
  }

  getFullImageUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (
      relativeUrl.startsWith('http://') ||
      relativeUrl.startsWith('https://')
    ) {
      return relativeUrl;
    }
    return `${this.apiBaseUrl}${relativeUrl}`;
  }

  getImageFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  onDocumentFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.error =
          'Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG';
        event.target.value = '';
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.error = 'File size exceeds 10MB limit';
        event.target.value = '';
        return;
      }

      this.selectedDocumentFile = file;
      this.uploadDocument();
    }
  }

  uploadDocument(): void {
    if (!this.selectedDocumentFile || !this.selectedProperty) return;

    this.isUploadingDocument = true;
    this.error = '';

    this.propertyService
      .uploadPropertyDocument(this.selectedDocumentFile)
      .subscribe({
        next: (response) => {
          this.isUploadingDocument = false;
          if (response.success && response.data) {
            this.selectedProperty!.documents.push(response.data.fileUrl);
            this.success = 'Document uploaded successfully';
            this.selectedDocumentFile = null;
            setTimeout(() => (this.success = ''), 3000);
          } else {
            this.error = response.message || 'Failed to upload document';
          }
        },
        error: (err) => {
          this.isUploadingDocument = false;
          this.selectedDocumentFile = null;
          this.error =
            err.error?.message || 'Error uploading document. Please try again.';
        },
      });
  }

  removeDocument(index: number): void {
    if (!this.selectedProperty) return;
    if (confirm('Are you sure you want to remove this document?')) {
      this.selectedProperty.documents.splice(index, 1);
    }
  }

  getFullDocumentUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (
      relativeUrl.startsWith('http://') ||
      relativeUrl.startsWith('https://')
    ) {
      return relativeUrl;
    }
    return `${this.apiBaseUrl}${relativeUrl}`;
  }

  getDocumentFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}
