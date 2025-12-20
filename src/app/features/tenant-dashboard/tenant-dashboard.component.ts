import { Component, OnInit } from '@angular/core';
import { TenantService } from '../../core/services/tenant.service';
import { CommonModule } from '@angular/common';

interface DashboardData {
  tenantId: string;
  fullName: string;
  email: string;
  mobile: string;
  profileImageUrl: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  unitId: string;
  unitName: string;
  agreementStartDate: string;
  agreementEndDate: string;
  isAgreementExpired: boolean;
  daysUntilLeaseEnd: number;
  rentAmount: number;
  securityDeposit: number;
  rentDueDay: number;
  nextRentDueDate: string;
  isRentPending: boolean;
  paymentProgress: number;
  isActiveTenant: boolean;
  moveInDate: string | null;
}

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-dashboard.component.html',
  styleUrl: './tenant-dashboard.component.css'
})
export class TenantDashboardComponent implements OnInit {

  dashboardData: DashboardData | null = null;
  loading: boolean = true;
  error: string = '';
  userId: string = '';

  constructor(private tenantService: TenantService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    try {
      // Get user ID from JWT token
      const token = sessionStorage.getItem('token');
      const json = sessionStorage.getItem('currentUser');
      console.log('Token:', token);
      if (token && json) {
         const currentUser = JSON.parse(json);
        this.userId = currentUser.user?.id;
        console.log('User ID from token:', this.userId);

        this.tenantService.getTenantDashboard(this.userId).subscribe({
          next: (response) => {
            if (response.success) {
              this.dashboardData = response.data;
              this.loading = false;
            } else {
              this.error = response.message || 'Failed to load dashboard data';
              this.loading = false;
            }
          },
          error: (err) => {
            console.error('Error loading dashboard:', err);
            this.error = 'Failed to load dashboard data. Please try again.';
            this.loading = false;
          }
        });
      } else {
        this.error = 'No authentication token found';
        this.loading = false;
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      this.error = 'Authentication error';
      this.loading = false;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getProgressColor(): string {
    if (this.dashboardData && this.dashboardData.paymentProgress >= 75) {
      return '#10b981'; // Green
    } else if (this.dashboardData && this.dashboardData.paymentProgress >= 50) {
      return '#f59e0b'; // Yellow
    } else {
      return '#ef4444'; // Red
    }
  }

  // Quick action methods
  payRent(): void {
    console.log('Pay Rent clicked');
    // Implement payment logic
  }

  openMaintenance(): void {
    console.log('Maintenance clicked');
    // Navigate to maintenance requests
  }

  openDocuments(): void {
    console.log('Documents clicked');
    // Navigate to documents
  }

  openMessages(): void {
    console.log('Messages clicked');
    // Navigate to messages
  }
  getInitials(fullName: string): string {
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2);
  return initials.toUpperCase();
}
}


