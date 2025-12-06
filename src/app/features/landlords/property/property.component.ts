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
  success = '';
  error = '';
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Property Type enum and labels
  PropertyType = PropertyType;
  propertyTypeLabels = PropertyTypeLabels;
  propertyTypeOptions = Object.keys(PropertyType)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => ({
      value: Number(key),
      label: PropertyTypeLabels[Number(key) as PropertyType],
    }));

  // Current user (owner) ID - should be fetched from auth service
  currentOwnerId: string = '';

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    // Get current user ID from session storage
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

    // Load properties by owner ID
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
            console.error('Error loading properties:', err);
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
          property.address?.state?.toLowerCase().includes(search)
      );
    }

    this.filteredProperties = filtered;
    this.totalPages = Math.ceil(
      this.filteredProperties.length / this.itemsPerPage
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
    this.selectedProperty = JSON.parse(JSON.stringify(property)); // Deep copy
    this.isEditingProperty = true;
  }

  saveProperty(): void {
    if (!this.selectedProperty) return;

    // Clear previous messages
    this.error = '';
    this.success = '';

    // Validation
    if (
      !this.selectedProperty.propertyName ||
      !this.selectedProperty.description
    ) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (this.isAddingProperty) {
      // Create new property
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
      console.log('Create Request:', createRequest);

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
          console.error('Error creating property:', err);
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
      // Update existing property
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
      console.log('Update Request:', updateRequest);

      this.propertyService.updateProperty(updateRequest).subscribe({
        next: (response: any) => {
          if (response.success) {
            const property = response.data;
            const index = this.properties.findIndex(
              (p) => p.id === property.id
            );
            if (index !== -1) {
              this.properties[index] = property;
            }
            this.success = response.message || 'Property updated successfully!';
            this.loadProperties();
            this.cancelPropertyEdit();

            // Auto-clear success message after 5 seconds
            setTimeout(() => {
              this.success = '';
            }, 5000);
          } else {
            this.error = response.message || 'Failed to update property';
          }
        },
        error: (err) => {
          console.error('Error updating property:', err);
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
        `Are you sure you want to delete the property "${property.propertyName}"?`
      )
    ) {
      this.propertyService.deleteProperty(property.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.properties = this.properties.filter(
              (p) => p.id !== property.id
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
          console.error('Error deleting property:', err);
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

  viewProperty(property: PropertyModel): void {
    // For now, just open edit dialog in view mode
    // You can create a separate view-only modal later
    this.editProperty(property);
  }

  // Pagination Methods
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

  // Unit Management
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

  // Image Management
  addImage(): void {
    if (!this.selectedProperty) return;
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      this.selectedProperty.images.push(imageUrl);
    }
  }

  removeImage(index: number): void {
    if (!this.selectedProperty) return;
    this.selectedProperty.images.splice(index, 1);
  }

  // Document Management
  addDocument(): void {
    if (!this.selectedProperty) return;
    const documentUrl = prompt('Enter document URL:');
    if (documentUrl) {
      this.selectedProperty.documents.push(documentUrl);
    }
  }

  removeDocument(index: number): void {
    if (!this.selectedProperty) return;
    this.selectedProperty.documents.splice(index, 1);
  }
}
