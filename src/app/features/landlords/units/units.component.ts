import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitService } from '../../../core/services/unit.service';
import { PropertyService } from '../../../core/services/property.service';
import {
  UnitModel,
  UnitCreateRequest,
  UnitUpdateRequest,
  PropertyOption
} from '../../../core/models/unit.model';
import { PropertyModel } from '../../../core/models/property.model';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './units.component.html',
  styleUrl: './units.component.css'
})
export class UnitsComponent implements OnInit {
  units: UnitModel[] = [];
  filteredUnits: UnitModel[] = [];
  selectedUnit: UnitModel | null = null;
  isEditingUnit = false;
  isAddingUnit = false;
  isLoadingUnits = false;
  success = '';
  error = '';
  searchTerm: string = '';
  properties: PropertyOption[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;

  // Current user (owner) ID
  currentOwnerId: string = '';

  constructor(
    private unitService: UnitService,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentOwnerId = user.user?.id || '';
    }
    this.loadProperties();
    this.loadUnits();
  }

  loadProperties(): void {
    this.propertyService.getPropertiesByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.properties = response.data.map((prop: PropertyModel) => ({
            id: prop.id || '',
            propertyName: prop.propertyName
          }));
        }
      },
      error: (err) => {
      }
    });
  }

  loadUnits(): void {
    this.isLoadingUnits = true;
    this.unitService.getUnitsByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        this.isLoadingUnits = false;
        if (response.success && response.data) {
          this.units = response.data;
          this.filteredUnits = [...this.units];
          this.updatePagination();
        } else {
          this.error = response.message || 'Failed to load units';
        }
      },
      error: (err) => {
        this.isLoadingUnits = false;
        this.error = 'Error loading units. Please try again.';
      }
    });
  }

  onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUnits = [...this.units];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUnits = this.units.filter(
        (unit) =>
          unit.unitName.toLowerCase().includes(term) ||
          this.getPropertyName(unit.propertyId)?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  getPropertyName(propertyId: string): string {
    const property = this.properties.find((p) => p.id === propertyId);
    return property ? property.propertyName : 'Unknown Property';
  }

  openAddUnitModal(): void {
    this.selectedUnit = {
      ownerId: this.currentOwnerId,
      propertyId: '',
      unitName: '',
      rentAmount: 0,
      securityDeposit: 0,
      isOccupied: false,
      dueDay: 5,
      notes: '',
      createdBy: this.currentOwnerId
    };
    this.isAddingUnit = true;
    this.isEditingUnit = false;
    this.error = '';
    this.success = '';
  }

  editUnit(unit: UnitModel): void {
    this.selectedUnit = { ...unit };
    this.isEditingUnit = true;
    this.isAddingUnit = false;
    this.error = '';
    this.success = '';
  }

  cancelUnitEdit(): void {
    this.selectedUnit = null;
    this.isEditingUnit = false;
    this.isAddingUnit = false;
    this.error = '';
  }

  saveUnit(): void {
    if (!this.selectedUnit) return;

    if (!this.selectedUnit.propertyId) {
      this.error = 'Please select a property';
      return;
    }

    if (!this.selectedUnit.unitName?.trim()) {
      this.error = 'Unit name is required';
      return;
    }

    if (this.selectedUnit.rentAmount <= 0) {
      this.error = 'Rent amount must be greater than 0';
      return;
    }

    if (this.isAddingUnit) {
      const createRequest: UnitCreateRequest = {
        ownerId: this.selectedUnit.ownerId,
        propertyId: this.selectedUnit.propertyId,
        tenantId: this.selectedUnit.tenantId ?? '',
        unitName: this.selectedUnit.unitName,
        rentAmount: this.selectedUnit.rentAmount,
        securityDeposit: this.selectedUnit.securityDeposit || 0,
        isOccupied: this.selectedUnit.isOccupied || false,
        dueDay: this.selectedUnit.dueDay || 5,
        notes: this.selectedUnit.notes || '',
        createdBy: this.currentOwnerId
      };

      this.unitService.createUnit(createRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Unit created successfully';
            this.cancelUnitEdit();
            this.loadUnits();
            setTimeout(() => (this.success = ''), 5000);
          } else {
            this.error = response.message || 'Failed to create unit';
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Error creating unit. Please try again.';
        }
      });
    } else {
      if (!this.selectedUnit.id) return;

      const updateRequest: UnitUpdateRequest = {
        id: this.selectedUnit.id,
        ownerId: this.selectedUnit.ownerId,
        propertyId: this.selectedUnit.propertyId,
        tenantId: this.selectedUnit.tenantId,
        unitName: this.selectedUnit.unitName,
        rentAmount: this.selectedUnit.rentAmount,
        securityDeposit: this.selectedUnit.securityDeposit || 0,
        isOccupied: this.selectedUnit.isOccupied || false,
        dueDay: this.selectedUnit.dueDay || 5,
        notes: this.selectedUnit.notes || '',
        isActive: this.selectedUnit.isActive !== false,
        updatedBy: this.currentOwnerId
      };

      this.unitService.updateUnit(updateRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Unit updated successfully';
            this.cancelUnitEdit();
            this.loadUnits();
            setTimeout(() => (this.success = ''), 5000);
          } else {
            this.error = response.message || 'Failed to update unit';
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Error updating unit. Please try again.';
        }
      });
    }
  }

  deleteUnit(unit: UnitModel): void {
    if (!unit.id) return;

    if (!confirm(`Are you sure you want to delete unit "${unit.unitName}"?`)) {
      return;
    }

    this.unitService.deleteUnit(unit.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Unit deleted successfully';
          this.loadUnits();
          setTimeout(() => (this.success = ''), 5000);
        } else {
          this.error = response.message || 'Failed to delete unit';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error deleting unit. Please try again.';
      }
    });
  }

  // Pagination methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUnits.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  getPaginatedUnits(): UnitModel[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUnits.slice(start, end);
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

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  Math = Math;
}
