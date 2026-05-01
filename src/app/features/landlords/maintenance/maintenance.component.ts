import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import {
  Maintenance,
  StatusEnum,
  PriorityEnum,
} from '../../../core/models/maintenance.model';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

interface MaintenanceWithDetails extends Maintenance {
  propertyName?: string;
  unitName?: string;
}

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SpinnerComponent,
  ],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.css',
})
export class MaintenanceComponent implements OnInit {
  maintenanceRequests: MaintenanceWithDetails[] = [];
  filteredRequests: MaintenanceWithDetails[] = [];
  isLoading = false;
  searchQuery = '';
  landlordId = '';

  StatusEnum = StatusEnum;
  PriorityEnum = PriorityEnum;

  statusCounts = { open: 0, assigned: 0, inProgress: 0, resolved: 0 };

  // Inline edit state (NOT a separate dialog component)
  selectedMaintenance: MaintenanceWithDetails | null = null;
  isEditModalOpen = false;

  constructor(
    private maintenanceService: MaintenanceService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    const json = sessionStorage.getItem('currentUser');
    if (json) {
      const currentUser = JSON.parse(json);
      this.landlordId = currentUser.user?.id || '';
    }
    this.loadMaintenanceRequests();
  }

  loadMaintenanceRequests(): void {
    if (!this.landlordId) {
      this.showSnackBar('Landlord ID not found. Please log in again.', 'error');
      return;
    }
    this.isLoading = true;
    this.maintenanceService.getMaintenanceByLandlordId(this.landlordId).subscribe({
      next: (data) => {
        this.maintenanceRequests = data.map((req: any) => ({
          ...req,
          propertyName: req.property?.propertyName || 'Unknown Property',
          unitName: req.unit?.unitName || req.unitId || 'N/A',
        }));
        this.filteredRequests = [...this.maintenanceRequests];
        this.calculateStatusCounts();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showSnackBar('Error loading maintenance requests.', 'error');
      },
    });
  }

  calculateStatusCounts(): void {
    this.statusCounts = {
      open: this.maintenanceRequests.filter((m) => m.status === StatusEnum.Open).length,
      assigned: this.maintenanceRequests.filter((m) => m.status === StatusEnum.Scheduled).length,
      inProgress: this.maintenanceRequests.filter((m) => m.status === StatusEnum.InProgress).length,
      resolved: this.maintenanceRequests.filter((m) => m.status === StatusEnum.Closed).length,
    };
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredRequests = [...this.maintenanceRequests];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredRequests = this.maintenanceRequests.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.propertyName?.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q),
      );
    }
  }

  getRequestsByStatus(status: number): MaintenanceWithDetails[] {
    return this.filteredRequests.filter((m) => m.status === status);
  }

  getStatusText(status: number): string {
    switch (status) {
      case StatusEnum.Open: return 'Open';
      case StatusEnum.Scheduled: return 'Assigned';
      case StatusEnum.InProgress: return 'In Progress';
      case StatusEnum.Closed: return 'Resolved';
      default: return 'Unknown';
    }
  }

  getPriorityText(priority: number): string {
    switch (priority) {
      case PriorityEnum.Low: return 'Low';
      case PriorityEnum.Medium: return 'Medium';
      case PriorityEnum.High: return 'High';
      default: return 'Medium';
    }
  }

  getPriorityColor(priority: number): string {
    switch (priority) {
      case PriorityEnum.Low: return '#4caf50';
      case PriorityEnum.Medium: return '#ff9800';
      case PriorityEnum.High: return '#f44336';
      default: return '#ff9800';
    }
  }

  getStatusDotColor(status: number): string {
    switch (status) {
      case StatusEnum.Open: return '#ff9800';
      case StatusEnum.Scheduled: return '#f44336';
      case StatusEnum.InProgress: return '#9c27b0';
      case StatusEnum.Closed: return '#4caf50';
      default: return '#888';
    }
  }

  getStatusColumnBg(status: number): string {
    switch (status) {
      case StatusEnum.Open: return '#fff8e1';
      case StatusEnum.Scheduled: return '#fce4ec';
      case StatusEnum.InProgress: return '#f3e5f5';
      case StatusEnum.Closed: return '#e8f5e9';
      default: return '#fafafa';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  // --- Inline Edit Modal ---

  openEditModal(maintenance: MaintenanceWithDetails): void {
    this.selectedMaintenance = JSON.parse(JSON.stringify(maintenance));
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.selectedMaintenance = null;
    this.isEditModalOpen = false;
  }

  saveMaintenance(): void {
    if (!this.selectedMaintenance) return;

    const toSave: Maintenance = {
      ...this.selectedMaintenance,
      status: Number(this.selectedMaintenance.status),
      priority: Number(this.selectedMaintenance.priority),
    };
    delete (toSave as any).propertyName;
    delete (toSave as any).unitName;
    delete (toSave as any).property;
    delete (toSave as any).unit;

    this.maintenanceService.updateMaintenance(toSave).subscribe({
      next: () => {
        this.showSnackBar('Maintenance updated successfully!');
        this.closeEditModal();
        this.loadMaintenanceRequests();
      },
      error: () => {
        this.showSnackBar('Failed to update maintenance.', 'error');
      },
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['snack-bar-error'] : ['snack-bar-success'],
    });
  }
}
