import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { PropertyService } from '../../../core/services/property.service';
import {
  Maintenance,
  StatusEnum,
  PriorityEnum,
} from '../../../core/models/maintenance.model';

interface MaintenanceWithDetails extends Maintenance {
  propertyName?: string;
  unitName?: string;
}

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.css',
})
export class MaintenanceComponent implements OnInit {
  maintenanceRequests: MaintenanceWithDetails[] = [];
  filteredRequests: MaintenanceWithDetails[] = [];
  properties: any[] = [];

  searchQuery: string = '';
  selectedStatus: number | null = null;
  isLoading: boolean = false;

  // Status enum for template
  StatusEnum = StatusEnum;
  PriorityEnum = PriorityEnum;

  // Status counts
  statusCounts = {
    open: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
  };

  // Selected maintenance for editing
  selectedMaintenance: MaintenanceWithDetails | null = null;
  isEditModalOpen: boolean = false;

  constructor(
    private maintenanceService: MaintenanceService,
    private propertyService: PropertyService
  ) { }

  ngOnInit(): void {
    this.loadMaintenanceRequests();
  }
  landlordId: string = '';

  loadMaintenanceRequests(): void {
    this.isLoading = true;

    const json = sessionStorage.getItem('currentUser');
    if (json) {
      const currentUser = JSON.parse(json);
      this.landlordId = currentUser.user?.id;
    }

    if (!this.landlordId) {
      console.error('Landlord ID not found');
      this.isLoading = false;
      return;
    }

    this.maintenanceService
      .getMaintenanceByLandlordId(this.landlordId)
      .subscribe({
        next: (data) => {
          console.log('Maintenance requests loaded:', data);

          // Map the data with property and unit names from navigation properties
          this.maintenanceRequests = data.map((request: any) => ({
            ...request,
            propertyName: request.property?.propertyName || 'Unknown Property',
            unitName: request.unit?.unitName || request.unitId || 'N/A',
          }));

          this.filteredRequests = [...this.maintenanceRequests];
          this.calculateStatusCounts();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading maintenance requests:', error);
          this.isLoading = false;
        },
      });
  }

  calculateStatusCounts(): void {
    this.statusCounts = {
      open: this.maintenanceRequests.filter((m) => m.status === StatusEnum.Open)
        .length,
      assigned: this.maintenanceRequests.filter(
        (m) => m.status === StatusEnum.Scheduled
      ).length,
      inProgress: this.maintenanceRequests.filter(
        (m) => m.status === StatusEnum.InProgress
      ).length,
      resolved: this.maintenanceRequests.filter(
        (m) => m.status === StatusEnum.Closed
      ).length,
    };
  }

  filterByStatus(status: number | null): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.maintenanceRequests];

    // Filter by status
    if (this.selectedStatus !== null) {
      filtered = filtered.filter((m) => m.status === this.selectedStatus);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.propertyName?.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
      );
    }

    this.filteredRequests = filtered;
  }

  getRequestsByStatus(status: number): MaintenanceWithDetails[] {
    return this.filteredRequests.filter((m) => m.status === status);
  }

  getStatusText(status: number): string {
    switch (status) {
      case StatusEnum.Open:
        return 'Open';
      case StatusEnum.Scheduled:
        return 'Assigned';
      case StatusEnum.InProgress:
        return 'In Progress';
      case StatusEnum.Closed:
        return 'Resolved';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case StatusEnum.Open:
        return 'status-open';
      case StatusEnum.Scheduled:
        return 'status-assigned';
      case StatusEnum.InProgress:
        return 'status-in-progress';
      case StatusEnum.Closed:
        return 'status-resolved';
      default:
        return '';
    }
  }

  getPriorityText(priority: number): string {
    switch (priority) {
      case PriorityEnum.Low:
        return 'Low';
      case PriorityEnum.Medium:
        return 'Medium';
      case PriorityEnum.High:
        return 'High';
      default:
        return 'Medium';
    }
  }

  getPriorityClass(priority: number): string {
    switch (priority) {
      case PriorityEnum.Low:
        return 'priority-low';
      case PriorityEnum.Medium:
        return 'priority-medium';
      case PriorityEnum.High:
        return 'priority-high';
      default:
        return 'priority-medium';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  // openEditModal(maintenance: MaintenanceWithDetails): void {
  //   this.selectedMaintenance = { ...maintenance };
  //   this.isEditModalOpen = true;
  // }
  openEditModal(maintenance?: MaintenanceWithDetails): void {
    this.selectedMaintenance = maintenance ? { ...maintenance } : null;
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.selectedMaintenance = null;
    this.isEditModalOpen = false;
  }

  updateStatus(newStatus: number): void {
    if (!this.selectedMaintenance) return;

    // Ensure status is a number (in case it comes from a select as string)
    const statusValue = Number(newStatus);

    this.maintenanceService
      .updateStatus(this.selectedMaintenance.id!, statusValue)
      .subscribe({
        next: (response) => {
          console.log('Status updated successfully:', response);
          this.closeEditModal();
          this.loadMaintenanceRequests();
        },
        error: (error) => {
          console.error('Error updating status:', error);
          alert('Failed to update status. Please try again.');
        },
      });
  }

  saveMaintenance(): void {
    if (!this.selectedMaintenance) return;

    // Create a copy of the maintenance object with properly typed values
    // HTML select elements return strings, but backend expects numbers for enums
    const maintenanceToSave: Maintenance = {
      ...this.selectedMaintenance,
      status: Number(this.selectedMaintenance.status),
      priority: Number(this.selectedMaintenance.priority),
    };

    // Remove navigation properties that shouldn't be sent to the backend
    delete (maintenanceToSave as any).propertyName;
    delete (maintenanceToSave as any).unitName;
    delete (maintenanceToSave as any).property;
    delete (maintenanceToSave as any).unit;

    console.log('Saving maintenance with status:', maintenanceToSave.status, 'priority:', maintenanceToSave.priority);

    this.maintenanceService
      .updateMaintenance(maintenanceToSave)
      .subscribe({
        next: (response) => {
          console.log('Maintenance updated successfully:', response);
          this.closeEditModal();
          this.loadMaintenanceRequests();
        },
        error: (error) => {
          console.error('Error updating maintenance:', error);
          alert('Failed to update maintenance. Please try again.');
        },
      });
  }
}
