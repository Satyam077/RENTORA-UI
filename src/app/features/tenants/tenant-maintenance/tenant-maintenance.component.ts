import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import {
  Maintenance,
  MaintenanceStats,
  StatusEnum,
} from '../../../core/models/maintenance.model';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-tenant-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-maintenance.component.html',
  styleUrl: './tenant-maintenance.component.css',
})
export class TenantMaintenanceComponent implements OnInit {
  maintenanceRequests: Maintenance[] = [];
  filteredRequests: Maintenance[] = [];
  stats: MaintenanceStats = { active: 0, completed: 0, avgRating: 0 };

  // Modal state
  showModal = false;

  // Form data
  newRequest: Maintenance = this.getEmptyRequest();
  selectedCategory = '';

  // Categories matching the UI
  categories = [
    { id: 'Plumbing', name: 'Plumbing', icon: '🔧', color: '#3b82f6' },
    { id: 'Electrical', name: 'Electrical', icon: '⚡', color: '#f59e0b' },
    { id: 'HVAC', name: 'HVAC', icon: '❄️', color: '#06b6d4' },
    { id: 'Locks/Keys', name: 'Locks/Keys', icon: '🔒', color: '#64748b' },
    { id: 'Pest Control', name: 'Pest Control', icon: '🐛', color: '#ef4444' },
    { id: 'General', name: 'General', icon: '✓', color: '#8b5cf6' },
  ];

  // Active tab
  activeTab: 'active' | 'completed' = 'active';

  // Loading and messages
  loading = false;
  successMessage = '';
  errorMessage = '';

  tenantId = '';
  dashboardData: any;
  error: any;

  constructor(
    private maintenanceService: MaintenanceService,
    private tenantService: TenantService
  ) { }

  ngOnInit(): void {
    const json = sessionStorage.getItem('currentUser');
    if (json) {
      const currentUser = JSON.parse(json);
      this.tenantId = currentUser.user?.id;
    }
    if (this.tenantId) {
      this.loadMaintenanceRequests();
      this.loadDashboard();
    } else {
      this.errorMessage =
        'Unable to load maintenance requests. Please log in again.';
    }
  }

  loadMaintenanceRequests(): void {
    this.loading = true;
    this.maintenanceService.getMaintenanceByTenantId(this.tenantId).subscribe({
      next: (response) => {
        console.log('Maintenance requests loaded:', response);
        this.maintenanceRequests = response;
        this.calculateStats();
        this.filterByTab();
        this.loading = false;
      },
    });
  }

  loadDashboard() {
    this.tenantService.getTenantDashboard(this.tenantId).subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardData = response.data;
          this.loading = false;
          console.log('Dashboard data loaded:', this.dashboardData);
        } else {
          this.error = response.message || 'Failed to load dashboard data';
          this.loading = false;
        }
      },
    });
  }

  calculateStats(): void {
    const activeRequests = this.maintenanceRequests.filter(
      (r) =>
        r.status === StatusEnum.Open ||
        r.status === StatusEnum.InProgress ||
        r.status === StatusEnum.Scheduled
    );
    const completedRequests = this.maintenanceRequests.filter(
      (r) => r.status === StatusEnum.Closed
    );

    const ratingsSum = completedRequests
      .filter((r) => r.rating)
      .reduce((sum, r) => sum + (r.rating || 0), 0);
    const ratingsCount = completedRequests.filter((r) => r.rating).length;

    this.stats = {
      active: activeRequests.length,
      completed: completedRequests.length,
      avgRating: ratingsCount > 0 ? ratingsSum / ratingsCount : 0,
    };
  }

  filterByTab(): void {
    if (this.activeTab === 'active') {
      this.filteredRequests = this.maintenanceRequests.filter(
        (r) =>
          r.status === StatusEnum.Open ||
          r.status === StatusEnum.InProgress ||
          r.status === StatusEnum.Scheduled
      );
    } else {
      this.filteredRequests = this.maintenanceRequests.filter(
        (r) => r.status === StatusEnum.Closed
      );
    }
  }

  setActiveTab(tab: 'active' | 'completed'): void {
    this.activeTab = tab;
    this.filterByTab();
  }

  openNewRequestModal(): void {
    this.showModal = true;
    this.newRequest = this.getEmptyRequest();
    this.selectedCategory = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.newRequest = this.getEmptyRequest();
    this.selectedCategory = '';
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.newRequest.category = categoryId;
  }

  handlePhotoUpload(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // In a real app, you would upload these to a server
      // For now, we'll just store placeholder URLs
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newRequest.photoUrls.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removePhoto(index: number): void {
    this.newRequest.photoUrls.splice(index, 1);
  }

  submitRequest(): void {
    if (
      !this.selectedCategory ||
      !this.newRequest.title ||
      !this.newRequest.description
    ) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.newRequest.id = '';
    this.newRequest.ownerId = this.dashboardData.ownerId;
    this.newRequest.tenantId = this.tenantId;
    this.newRequest.propertyId = this.dashboardData.propertyId;
    this.newRequest.unitId = this.dashboardData.unitId;
    this.newRequest.createdBy = this.tenantId;
    this.newRequest.updatedBy = this.tenantId;
    console.log('Submitting maintenance request:', this.newRequest);
    this.maintenanceService.createMaintenance(this.newRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Maintenance request submitted successfully!';
        this.closeModal();
        this.loadMaintenanceRequests();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error) => {
        console.error('Error creating maintenance request:', error);
        this.errorMessage = 'Failed to submit maintenance request';
        this.loading = false;
      },
    });
  }

  getEmptyRequest(): Maintenance {
    return {
      tenantId: '',
      category: '',
      title: '',
      description: '',
      photoUrls: [],
      status: StatusEnum.Open,
      updateCount: 0,
      priority: 3,
      createdBy: '',
      updatedBy: '',
    };
  }

  getStatusBadgeClass(status: number): string {
    switch (status) {
      case StatusEnum.Open:
        return 'status-open';
      case StatusEnum.InProgress:
        return 'status-in-progress';
      case StatusEnum.Scheduled:
        return 'status-scheduled';
      case StatusEnum.Closed:
        return 'status-closed';
      default:
        return '';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case StatusEnum.Open:
        return 'Open';
      case StatusEnum.InProgress:
        return 'In Progress';
      case StatusEnum.Scheduled:
        return 'Scheduled';
      case StatusEnum.Closed:
        return 'Closed';
      default:
        return 'Unknown';
    }
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find((c) => c.id === category);
    return cat ? cat.icon : '🔧';
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
