import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgreementService } from '../../../core/services/agreement.service';
import { PropertyService } from '../../../core/services/property.service';
import { UnitService } from '../../../core/services/unit.service';
import { TenantService } from '../../../core/services/tenant.service';
import {
  AgreementModel,
  AgreementCreateRequest,
  AgreementUpdateRequest,
  AgreementType,
  AgreementStatus,
  PropertyOption,
  UnitOption,
  TenantOption,
} from '../../../core/models/agreement.model';
import { PropertyModel } from '../../../core/models/property.model';
import { UnitModel } from '../../../core/models/unit.model';
import { TenantModel } from '../../../core/models/tenant.model';
import { environment } from '../../../../environments/environment.prod';

const baseUrl = `${environment.apiUrl}`;

@Component({
  selector: 'app-agreement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agreement.component.html',
  styleUrl: './agreement.component.css',
})
export class AgreementComponent implements OnInit {
  agreements: AgreementModel[] = [];
  filteredAgreements: AgreementModel[] = [];
  selectedAgreement: AgreementModel | null = null;
  viewAgreement: AgreementModel | null = null;
  isEditingAgreement = false;
  isAddingAgreement = false;
  isViewingAgreement = false;
  isLoadingAgreements = false;
  success = '';
  error = '';
  searchTerm: string = '';
  sortColumn: string = 'agreementNumber';
  sortDirection: 'asc' | 'desc' = 'asc';

  properties: PropertyOption[] = [];
  units: UnitOption[] = [];
  allUnits: UnitOption[] = [];
  tenants: TenantOption[] = [];
  allTenants: TenantOption[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Current user (owner) ID
  currentOwnerId: string = '';

  // File upload
  selectedFile: File | null = null;
  isUploading: boolean = false;
  uploadedFileName: string = '';

  // Enums for template
  AgreementType = AgreementType;
  AgreementStatus = AgreementStatus;

  agreementTypes = [
    { value: AgreementType.Residential, label: 'Residential' },
    { value: AgreementType.Commercial, label: 'Commercial' },
    { value: AgreementType.PG, label: 'PG' },
    { value: AgreementType.Office, label: 'Office' },
    { value: AgreementType.ShortTerm, label: 'Short Term' },
    { value: AgreementType.Other, label: 'Other' },
  ];

  agreementStatuses = [
    { value: AgreementStatus.Draft, label: 'Draft' },
    { value: AgreementStatus.Active, label: 'Active' },
    { value: AgreementStatus.Expired, label: 'Expired' },
    { value: AgreementStatus.Terminated, label: 'Terminated' },
  ];

  constructor(
    private agreementService: AgreementService,
    private propertyService: PropertyService,
    private unitService: UnitService,
    private tenantService: TenantService
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
    this.loadAgreements();
  }

  loadProperties(): void {
    this.propertyService.getPropertyById(this.currentOwnerId).subscribe({
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

  loadTenants(): void {
    this.tenantService.getTenantsByOwnerId(this.currentOwnerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allTenants = response.data.map((tenant: TenantModel) => ({
            id: tenant.id || '',
            fullName: tenant.fullName,
            propertyId: tenant.propertyId,
            unitId: tenant.unitId,
          }));
          this.tenants = [...this.allTenants];
        }
      },
      error: (err) => {
      },
    });
  }

  onPropertyChange(): void {
    if (this.selectedAgreement && this.selectedAgreement.propertyId) {
      this.units = this.allUnits.filter(
        (u) => u.propertyId === this.selectedAgreement!.propertyId
      );
      this.tenants = this.allTenants.filter(
        (t) => t.propertyId === this.selectedAgreement!.propertyId
      );
      this.selectedAgreement.unitId = '';
      this.selectedAgreement.tenantId = '';
    } else {
      this.units = [...this.allUnits];
      this.tenants = [...this.allTenants];
    }
  }

  onUnitChange(): void {
    if (this.selectedAgreement && this.selectedAgreement.unitId) {
      this.tenants = this.allTenants.filter(
        (t) => t.unitId === this.selectedAgreement!.unitId
      );
      this.selectedAgreement.tenantId = '';
    } else if (this.selectedAgreement && this.selectedAgreement.propertyId) {
      this.tenants = this.allTenants.filter(
        (t) => t.propertyId === this.selectedAgreement!.propertyId
      );
    } else {
      this.tenants = [...this.allTenants];
    }
  }

  loadAgreements(): void {
    this.isLoadingAgreements = true;
    this.agreementService
      .getAgreementsByOwnerId(this.currentOwnerId)
      .subscribe({
        next: (response) => {
          this.isLoadingAgreements = false;
          if (response.success && response.data) {
            this.agreements = response.data;
            this.filteredAgreements = [...this.agreements];
            this.sortAgreements();
            this.updatePagination();
          } else {
            this.error = response.message || 'Failed to load agreements';
          }
        },
        error: (err) => {
          this.isLoadingAgreements = false;
          this.error = 'Error loading agreements. Please try again.';
        },
      });
  }

  onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAgreements = [...this.agreements];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredAgreements = this.agreements.filter(
        (agreement) =>
          agreement.agreementNumber.toLowerCase().includes(term) ||
          agreement.tenantName?.toLowerCase().includes(term) ||
          agreement.propertyName?.toLowerCase().includes(term) ||
          agreement.unitName?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.sortAgreements();
    this.updatePagination();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortAgreements();
  }

  sortAgreements(): void {
    this.filteredAgreements.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortColumn) {
        case 'agreementNumber':
          aValue = a.agreementNumber.toLowerCase();
          bValue = b.agreementNumber.toLowerCase();
          break;
        case 'tenant':
          aValue = a.tenantName?.toLowerCase() || '';
          bValue = b.tenantName?.toLowerCase() || '';
          break;
        case 'property':
          aValue = a.propertyName?.toLowerCase() || '';
          bValue = b.propertyName?.toLowerCase() || '';
          break;
        case 'unit':
          aValue = a.unitName?.toLowerCase() || '';
          bValue = b.unitName?.toLowerCase() || '';
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'endDate':
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        case 'rentAmount':
          aValue = a.rentAmount;
          bValue = b.rentAmount;
          break;
        default:
          aValue = a.agreementNumber.toLowerCase();
          bValue = b.agreementNumber.toLowerCase();
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

  openAddAgreementModal(): void {
    this.selectedAgreement = {
      ownerId: this.currentOwnerId,
      propertyId: '',
      unitId: '',
      tenantId: '',
      agreementNumber: '',
      agreementType: AgreementType.Residential,
      startDate: new Date(),
      endDate: new Date(),
      rentAmount: 0,
      securityDeposit: 0,
      rentDueDay: 5,
      agreementFileUrl: '',
      status: AgreementStatus.Active,
      notes: '',
    };
    this.units = [...this.allUnits];
    this.tenants = [...this.allTenants];
    this.isAddingAgreement = true;
    this.isEditingAgreement = false;
    this.error = '';
    this.success = '';
  }

  editAgreement(agreement: AgreementModel): void {
    this.selectedAgreement = {
      ...agreement,
      startDate: this.formatDateForInput(agreement.startDate) as any,
      endDate: this.formatDateForInput(agreement.endDate) as any,
      terminatedOn: this.formatDateForInput(agreement.terminatedOn) as any,
    };

    // Filter units and tenants based on the selected property
    if (this.selectedAgreement.propertyId) {
      this.units = this.allUnits.filter(
        (u) => u.propertyId === this.selectedAgreement!.propertyId
      );

      // Further filter tenants based on unit if available
      if (this.selectedAgreement.unitId) {
        this.tenants = this.allTenants.filter(
          (t) => t.unitId === this.selectedAgreement!.unitId
        );
      } else {
        this.tenants = this.allTenants.filter(
          (t) => t.propertyId === this.selectedAgreement!.propertyId
        );
      }
    } else {
      this.units = [...this.allUnits];
      this.tenants = [...this.allTenants];
    }

    this.isEditingAgreement = true;
    this.isAddingAgreement = false;
    this.error = '';
    this.success = '';
  }

  viewAgreementDetails(agreement: AgreementModel): void {
    this.viewAgreement = { ...agreement };
    this.isViewingAgreement = true;
  }

  closeViewModal(): void {
    this.viewAgreement = null;
    this.isViewingAgreement = false;
  }

  cancelAgreementEdit(): void {
    this.selectedAgreement = null;
    this.isEditingAgreement = false;
    this.isAddingAgreement = false;
    this.error = '';
  }

  saveAgreement(): void {
    if (!this.selectedAgreement) return;

    // Validation
    if (!this.selectedAgreement.propertyId) {
      this.error = 'Please select a property';
      return;
    }

    if (!this.selectedAgreement.unitId) {
      this.error = 'Please select a unit';
      return;
    }

    if (!this.selectedAgreement.tenantId) {
      this.error = 'Please select a tenant';
      return;
    }

    if (!this.selectedAgreement.agreementNumber?.trim()) {
      this.error = 'Agreement number is required';
      return;
    }

    if (this.selectedAgreement.rentAmount <= 0) {
      this.error = 'Rent amount must be greater than 0';
      return;
    }

    if (this.isAddingAgreement) {
      const createRequest: AgreementCreateRequest = {
        ownerId: this.selectedAgreement.ownerId,
        propertyId: this.selectedAgreement.propertyId,
        unitId: this.selectedAgreement.unitId,
        tenantId: this.selectedAgreement.tenantId,
        agreementNumber: this.selectedAgreement.agreementNumber,
        agreementType: Number(this.selectedAgreement.agreementType),
        startDate: this.selectedAgreement.startDate,
        endDate: this.selectedAgreement.endDate,
        rentAmount: this.selectedAgreement.rentAmount,
        securityDeposit: this.selectedAgreement.securityDeposit,
        rentDueDay: this.selectedAgreement.rentDueDay,
        agreementFileUrl: this.selectedAgreement.agreementFileUrl,
        status: Number(this.selectedAgreement.status),
        notes: this.selectedAgreement.notes || '',
        createdBy: this.currentOwnerId,
      };

      this.agreementService.createAgreement(createRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Agreement created successfully';
            this.cancelAgreementEdit();
            this.loadAgreements();
            setTimeout(() => (this.success = ''), 5000);
          } else {
            this.error = response.message || 'Failed to create agreement';
          }
        },
        error: (err) => {
          this.error =
            err.error?.message || 'Error creating agreement. Please try again.';
        },
      });
    } else {
      if (!this.selectedAgreement.id) return;

      const updateRequest: AgreementUpdateRequest = {
        id: this.selectedAgreement.id,
        ownerId: this.selectedAgreement.ownerId,
        propertyId: this.selectedAgreement.propertyId,
        unitId: this.selectedAgreement.unitId,
        tenantId: this.selectedAgreement.tenantId,
        agreementNumber: this.selectedAgreement.agreementNumber,
        agreementType: Number(this.selectedAgreement.agreementType),
        startDate: this.selectedAgreement.startDate,
        endDate: this.selectedAgreement.endDate,
        rentAmount: this.selectedAgreement.rentAmount,
        securityDeposit: this.selectedAgreement.securityDeposit,
        rentDueDay: this.selectedAgreement.rentDueDay,
        agreementFileUrl: this.selectedAgreement.agreementFileUrl,
        status: Number(this.selectedAgreement.status),
        terminatedOn: this.selectedAgreement.terminatedOn,
        terminationReason: this.selectedAgreement.terminationReason,
        isRenewed: this.selectedAgreement.isRenewed,
        renewedFromAgreementId: this.selectedAgreement.renewedFromAgreementId,
        notes: this.selectedAgreement.notes || '',
        isActive: this.selectedAgreement.isActive !== false,
        updatedBy: this.currentOwnerId,
      };

      this.agreementService.updateAgreement(updateRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Agreement updated successfully';
            this.cancelAgreementEdit();
            this.loadAgreements();
            setTimeout(() => (this.success = ''), 5000);
          } else {
            this.error = response.message || 'Failed to update agreement';
          }
        },
        error: (err) => {
          this.error =
            err.error?.message || 'Error updating agreement. Please try again.';
        },
      });
    }
  }

  deleteAgreement(agreement: AgreementModel): void {
    if (!agreement.id) return;

    if (
      !confirm(
        `Are you sure you want to delete agreement "${agreement.agreementNumber}"?`
      )
    ) {
      return;
    }

    this.agreementService.deleteAgreement(agreement.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Agreement deleted successfully';
          this.loadAgreements();
          setTimeout(() => (this.success = ''), 5000);
        } else {
          this.error = response.message || 'Failed to delete agreement';
        }
      },
      error: (err) => {
        this.error =
          err.error?.message || 'Error deleting agreement. Please try again.';
      },
    });
  }

  // Pagination methods
  updatePagination(): void {
    this.totalPages = Math.ceil(
      this.filteredAgreements.length / this.itemsPerPage
    );
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  getPaginatedAgreements(): AgreementModel[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAgreements.slice(start, end);
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

  formatDateForInput(date: Date | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  getAgreementTypeLabel(type: AgreementType): string {
    const found = this.agreementTypes.find((t) => t.value === type);
    return found ? found.label : 'Unknown';
  }

  getAgreementStatusLabel(status: AgreementStatus): string {
    const found = this.agreementStatuses.find((s) => s.value === status);
    return found ? found.label : 'Unknown';
  }

  getStatusClass(status: AgreementStatus): string {
    switch (status) {
      case AgreementStatus.Active:
        return 'badge-active';
      case AgreementStatus.Expired:
      case AgreementStatus.Terminated:
        return 'badge-inactive';
      default:
        return '';
    }
  }

  // File upload methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG';
        event.target.value = '';
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        this.error = 'File size exceeds 10MB limit';
        event.target.value = '';
        return;
      }

      this.selectedFile = file;
      this.uploadedFileName = file.name;
      this.uploadFile();
    }
  }

  uploadFile(): void {
    if (!this.selectedFile || !this.selectedAgreement) return;

    this.isUploading = true;
    this.error = '';

    this.agreementService.uploadAgreementDocument(this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        if (response.success && response.data) {
          this.selectedAgreement!.agreementFileUrl = response.data.fileUrl;
          this.success = 'File uploaded successfully';
          setTimeout(() => (this.success = ''), 3000);
        } else {
          this.error = response.message || 'Failed to upload file';
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.selectedFile = null;
        this.uploadedFileName = '';
        this.error = err.error?.message || 'Error uploading file. Please try again.';
      },
    });
  }

  removeFile(): void {
    if (this.selectedAgreement) {
      this.selectedAgreement.agreementFileUrl = '';
      this.selectedFile = null;
      this.uploadedFileName = '';
    }
  }

  getFullFileUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    // If it's already a full URL, return as is
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    // Prepend the API base URL (remove /api from the end)
    // environment.apiUrl without /api
    return `${baseUrl}${relativeUrl}`;
  }

  getFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  Math = Math;
}
