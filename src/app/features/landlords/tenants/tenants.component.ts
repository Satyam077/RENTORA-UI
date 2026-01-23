import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../../core/services/tenant.service';
import { PropertyService } from '../../../core/services/property.service';
import { UnitService } from '../../../core/services/unit.service';
import {
  TenantModel,
  TenantCreateRequest,
  TenantUpdateRequest,
  PropertyOption,
  UnitOption,
} from '../../../core/models/tenant.model';
import { PropertyModel } from '../../../core/models/property.model';
import { UnitModel } from '../../../core/models/unit.model';

// Form model for Add/Edit - uses firstName/lastName for form inputs
interface TenantFormModel {
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
  isAgreementExpired?: boolean;
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

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.css',
})
export class TenantsComponent implements OnInit {
  tenants: TenantModel[] = [];
  filteredTenants: TenantModel[] = [];
  selectedTenant: TenantFormModel | null = null;
  viewTenant: TenantModel | null = null;
  isEditingTenant = false;
  isAddingTenant = false;
  isViewingTenant = false;
  isLoadingTenants = false;
  success = '';
  error = '';
  searchTerm: string = '';
  sortColumn: string = 'firstName';
  sortDirection: 'asc' | 'desc' = 'asc';
  properties: PropertyOption[] = [];
  units: UnitOption[] = [];
  allUnits: UnitOption[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Current user (owner) ID
  currentOwnerId: string = '';

  constructor(
    private tenantService: TenantService,
    private propertyService: PropertyService,
    private unitService: UnitService
  ) { }

  ngOnInit(): void {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentOwnerId = user.user?.id || '';
    }
    this.loadProperties();
    this.loadUnits();
    this.loadTenants();
  }

  loadProperties(): void {
    this.propertyService.getPropertiesByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.properties = response.data.map((prop: PropertyModel) => ({
            id: prop.id || '',
            propertyName: prop.propertyName,
          }));
        }
      },
      error: (err) => {
      },
    });
  }

  loadUnits(): void {
    this.unitService.getUnitsByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allUnits = response.data.map((unit: UnitModel) => ({
            id: unit.id || '',
            unitName: unit.unitName,
            propertyId: unit.propertyId,
          }));
          this.units = [...this.allUnits];
        }
      },
      error: (err) => {
      },
    });
  }

  onPropertyChange(): void {
    if (this.selectedTenant && this.selectedTenant.propertyId) {
      this.units = this.allUnits.filter(
        (u) => u.propertyId === this.selectedTenant!.propertyId
      );
      this.selectedTenant.unitId = '';
    } else {
      this.units = [...this.allUnits];
    }
  }

  loadTenants(): void {
    this.isLoadingTenants = true;
    this.tenantService.getTenantsByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        this.isLoadingTenants = false;
        if (response.success && response.data) {
          this.tenants = response.data;
          this.filteredTenants = [...this.tenants];
          this.sortTenants();
          this.updatePagination();
        } else {
          this.error = response.message || 'Failed to load tenants';
        }
      },
      error: (err) => {
        this.isLoadingTenants = false;
        this.error = 'Error loading tenants. Please try again.';
      },
    });
  }

  onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredTenants = [...this.tenants];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredTenants = this.tenants.filter(
        (tenant) =>
          tenant.fullName.toLowerCase().includes(term) ||
          tenant.email.toLowerCase().includes(term) ||
          tenant.mobile.includes(term) ||
          this.getPropertyName(tenant.propertyId)
            ?.toLowerCase()
            .includes(term) ||
          this.getUnitName(tenant.unitId)?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.sortTenants();
    this.updatePagination();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortTenants();
  }

  sortTenants(): void {
    this.filteredTenants.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortColumn) {
        case 'firstName':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'mobile':
          aValue = a.mobile;
          bValue = b.mobile;
          break;
        case 'property':
          aValue = this.getPropertyName(a.propertyId)?.toLowerCase() || '';
          bValue = this.getPropertyName(b.propertyId)?.toLowerCase() || '';
          break;
        case 'unit':
          aValue = this.getUnitName(a.unitId)?.toLowerCase() || '';
          bValue = this.getUnitName(b.unitId)?.toLowerCase() || '';
          break;
        case 'rentAmount':
          aValue = a.rentAmount;
          bValue = b.rentAmount;
          break;
        default:
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getPropertyName(propertyId: string): string {
    const property = this.properties.find((p) => p.id === propertyId);
    return property ? property.propertyName : 'Unknown Property';
  }

  getUnitName(unitId: string): string {
    const unit = this.allUnits.find((u) => u.id === unitId);
    return unit ? unit.unitName : 'Unknown Unit';
  }

  openAddTenantModal(): void {
    this.selectedTenant = {
      ownerId: this.currentOwnerId,
      propertyId: '',
      unitId: '',
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      gender: '',
      dateOfBirth: null,
      permanentAddress: '',
      currentAddress: '',
      rentAmount: 0,
      securityDeposit: 0,
      rentDueDay: 5,
      agreementStartDate: new Date(),
      agreementEndDate: new Date(),
      documents: [],
      idProofType: '',
      idProofNumber: '',
      moveInDate: null,
      notes: '',
      createdBy: this.currentOwnerId,
    };
    this.units = [...this.allUnits];
    this.isAddingTenant = true;
    this.isEditingTenant = false;
    this.error = '';
    this.success = '';
  }

  editTenant(tenant: TenantModel): void {
    // Convert TenantModel (fullName) to TenantFormModel (firstName/lastName)
    const nameParts = tenant.fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    this.selectedTenant = {
      id: tenant.id,
      userId: tenant.userId,
      ownerId: tenant.ownerId,
      propertyId: tenant.propertyId,
      unitId: tenant.unitId,
      firstName: firstName,
      lastName: lastName,
      mobile: tenant.mobile,
      email: tenant.email,
      gender: tenant.gender,
      dateOfBirth: this.formatDateForInput(tenant.dateOfBirth) as any,
      permanentAddress: tenant.permanentAddress,
      currentAddress: tenant.currentAddress,
      rentAmount: tenant.rentAmount,
      securityDeposit: tenant.securityDeposit,
      rentDueDay: tenant.rentDueDay,
      agreementStartDate: this.formatDateForInput(tenant.agreementStartDate) as any,
      agreementEndDate: this.formatDateForInput(tenant.agreementEndDate) as any,
      isAgreementExpired: tenant.isAgreementExpired,
      documents: tenant.documents,
      idProofType: tenant.idProofType,
      idProofNumber: tenant.idProofNumber,
      isActiveTenant: tenant.isActiveTenant,
      isRentPending: tenant.isRentPending,
      isMovedOut: tenant.isMovedOut,
      moveInDate: this.formatDateForInput(tenant.moveInDate) as any,
      moveOutDate: this.formatDateForInput(tenant.moveOutDate) as any,
      notes: tenant.notes,
      isActive: tenant.isActive,
    };
    this.onPropertyChange();
    this.isEditingTenant = true;
    this.isAddingTenant = false;
    this.error = '';
    this.success = '';
  }

  viewTenantDetails(tenant: TenantModel): void {
    this.viewTenant = { ...tenant };
    this.isViewingTenant = true;
  }

  closeViewModal(): void {
    this.viewTenant = null;
    this.isViewingTenant = false;
  }

  cancelTenantEdit(): void {
    this.selectedTenant = null;
    this.isEditingTenant = false;
    this.isAddingTenant = false;
    this.error = '';
  }

  saveTenant(): void {
    if (!this.selectedTenant) return;

    // Validation
    if (!this.selectedTenant.propertyId) {
      this.error = 'Please select a property';
      return;
    }

    if (!this.selectedTenant.unitId) {
      this.error = 'Please select a unit';
      return;
    }

    if (!this.selectedTenant.firstName?.trim()) {
      this.error = 'First name is required';
      return;
    }

    if (!this.selectedTenant.lastName?.trim()) {
      this.error = 'Last name is required';
      return;
    }

    if (!this.selectedTenant.email?.trim()) {
      this.error = 'Email is required';
      return;
    }

    if (!this.selectedTenant.mobile?.trim()) {
      this.error = 'Mobile number is required';
      return;
    }

    if (this.selectedTenant.rentAmount <= 0) {
      this.error = 'Rent amount must be greater than 0';
      return;
    }

    if (this.isAddingTenant) {
      const createRequest: TenantCreateRequest = {
        ownerId: this.selectedTenant.ownerId,
        propertyId: this.selectedTenant.propertyId,
        unitId: this.selectedTenant.unitId,
        firstName: this.selectedTenant.firstName,
        lastName: this.selectedTenant.lastName,
        mobile: this.selectedTenant.mobile,
        email: this.selectedTenant.email,
        gender: this.selectedTenant.gender || '',
        dateOfBirth: this.selectedTenant.dateOfBirth || null,
        permanentAddress: this.selectedTenant.permanentAddress || '',
        currentAddress: this.selectedTenant.currentAddress || '',
        rentAmount: this.selectedTenant.rentAmount,
        securityDeposit: this.selectedTenant.securityDeposit || 0,
        rentDueDay: this.selectedTenant.rentDueDay || 5,
        agreementStartDate: this.selectedTenant.agreementStartDate,
        agreementEndDate: this.selectedTenant.agreementEndDate,
        documents: this.selectedTenant.documents || [],
        idProofType: this.selectedTenant.idProofType || '',
        idProofNumber: this.selectedTenant.idProofNumber || '',
        moveInDate: this.selectedTenant.moveInDate || null,
        notes: this.selectedTenant.notes || '',
        createdBy: this.currentOwnerId,
      };

      this.tenantService.createTenant(createRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Tenant created successfully';
            this.cancelTenantEdit();
            this.loadTenants();
            setTimeout(() => (this.success = ''), 5000);
          } else {
            this.error = response.message || 'Failed to create tenant';
          }
        },
        error: (err) => {
          this.error =
            err.error?.message || 'Error creating tenant. Please try again.';
        },
      });
    } else {
      if (!this.selectedTenant.id) return;

      const updateRequest: TenantUpdateRequest = {
        id: this.selectedTenant.id,
        ownerId: this.selectedTenant.ownerId,
        propertyId: this.selectedTenant.propertyId,
        unitId: this.selectedTenant.unitId,
        firstName: this.selectedTenant.firstName,
        lastName: this.selectedTenant.lastName,
        mobile: this.selectedTenant.mobile,
        email: this.selectedTenant.email,
        gender: this.selectedTenant.gender || '',
        dateOfBirth: this.selectedTenant.dateOfBirth || null,
        permanentAddress: this.selectedTenant.permanentAddress || '',
        currentAddress: this.selectedTenant.currentAddress || '',
        rentAmount: this.selectedTenant.rentAmount,
        securityDeposit: this.selectedTenant.securityDeposit || 0,
        rentDueDay: this.selectedTenant.rentDueDay || 5,
        agreementStartDate: this.selectedTenant.agreementStartDate,
        agreementEndDate: this.selectedTenant.agreementEndDate,
        isAgreementExpired: this.selectedTenant.isAgreementExpired || false,
        documents: this.selectedTenant.documents || [],
        idProofType: this.selectedTenant.idProofType || '',
        idProofNumber: this.selectedTenant.idProofNumber || '',
        isActiveTenant: this.selectedTenant.isActiveTenant !== false,
        isRentPending: this.selectedTenant.isRentPending || false,
        isMovedOut: this.selectedTenant.isMovedOut || false,
        moveInDate: this.selectedTenant.moveInDate || null,
        moveOutDate: this.selectedTenant.moveOutDate || null,
        notes: this.selectedTenant.notes || '',
        isActive: this.selectedTenant.isActive !== false,
        updatedBy: this.currentOwnerId,
      };

      this.tenantService.updateTenant(updateRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Tenant updated successfully';
            this.cancelTenantEdit();
            this.loadTenants();
            setTimeout(() => (this.success = ''), 5000);
          } else {
            this.error = response.message || 'Failed to update tenant';
          }
        },
        error: (err) => {
          this.error =
            err.error?.message || 'Error updating tenant. Please try again.';
        },
      });
    }
  }

  deleteTenant(tenant: TenantModel): void {
    if (!tenant.id) return;

    if (
      !confirm(`Are you sure you want to delete tenant "${tenant.fullName}"?`)
    ) {
      return;
    }

    this.tenantService.deleteTenant(tenant.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Tenant deleted successfully';
          this.loadTenants();
          setTimeout(() => (this.success = ''), 5000);
        } else {
          this.error = response.message || 'Failed to delete tenant';
        }
      },
      error: (err) => {
        this.error =
          err.error?.message || 'Error deleting tenant. Please try again.';
      },
    });
  }

  // Pagination methods
  updatePagination(): void {
    this.totalPages = Math.ceil(
      this.filteredTenants.length / this.itemsPerPage
    );
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  getPaginatedTenants(): TenantModel[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredTenants.slice(start, end);
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

  formatDate(date: Date | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  /**
   * Converts Date object to YYYY-MM-DD format required by HTML date inputs
   */
  formatDateForInput(date: Date | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  Math = Math;
}
