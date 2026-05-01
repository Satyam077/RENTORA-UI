import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService, Billing, BillingConfiguration } from '../../../core/services/billing.service';
import { PropertyService } from '../../../core/services/property.service';
import { TenantService } from '../../../core/services/tenant.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  bills: Billing[] = [];
  properties: any[] = [];
  selectedPropertyId: string = '';
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  config: BillingConfiguration = {
    propertyId: '',
    ownerId: '',
    electricityRate: 10,
    maintenanceCharge: 200
  };

  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  years: number[] = [];
  ownerId: string = '';

  pendingCount = 0;
  sentCount = 0;

  constructor(
    private billingService: BillingService,
    private propertyService: PropertyService,
    private tenantService: TenantService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
  }

  ngOnInit(): void {
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    this.ownerId = user.user?.id || '';

    this.loadProperties();
  }

  loadProperties(): void {
    this.propertyService.getPropertiesByOwnerId(this.ownerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.properties = response.data;
          if (this.properties.length > 0) {
            this.selectedPropertyId = this.properties[0].id;
            this.loadConfig();
            this.loadBills();
          }
        }
      }
    });
  }

  loadConfig(): void {
    if (!this.selectedPropertyId) return;
    this.billingService.getConfig(this.selectedPropertyId).subscribe({
      next: (response) => {
        if (response.success) {
          this.config = response.data;
          this.config.ownerId = this.ownerId;
          this.config.propertyId = this.selectedPropertyId;
        }
      }
    });
  }

  loadBills(): void {
    this.billingService.getMonthlyBills(this.ownerId, this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        if (response.success) {
          this.bills = response.data;
          this.calculateStats();
        }
      }
    });
  }

  calculateStats(): void {
    this.pendingCount = this.bills.filter(b => b.status === 'Pending').length;
    this.sentCount = this.bills.filter(b => b.status === 'Sent').length;
  }

  onPropertyChange(): void {
    this.loadConfig();
    this.loadBills();
  }

  onDateChange(): void {
    this.loadBills();
  }

  saveConfig(): void {
    this.billingService.saveConfig(this.config).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Billing rates updated successfully', 'Close', { duration: 3000 });
        }
      }
    });
  }

  generateBills(): void {
    this.billingService.generateAllBills(this.ownerId, this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
          this.loadBills();
        }
      }
    });
  }

  updateReading(bill: Billing): void {
    // Units consumed calculation is handled on backend, but we can do it here for immediate feedback if needed
    bill.unitsConsumed = bill.currentReading - bill.previousReading;
    bill.electricityBill = bill.unitsConsumed * bill.electricityRate;
    bill.totalBill = bill.baseRent + bill.electricityBill + bill.maintenanceCharges + bill.otherCharges;
  }

  saveBill(bill: Billing): void {
    this.billingService.upsertBill(bill).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Bill updated successfully', 'Close', { duration: 2000 });
          this.calculateStats();
        }
      }
    });
  }

  sendNotification(bill: Billing): void {
    if (!bill.id) return;
    this.billingService.sendNotification(bill.id).subscribe({
      next: (response) => {
        if (response.success) {
          bill.status = 'Sent';
          bill.notificationSent = true;
          this.snackBar.open('Notification sent to tenant', 'Close', { duration: 3000 });
          this.calculateStats();
        }
      }
    });
  }

  getPropertyName(propertyId: string): string {
    return this.properties.find(p => p.id === propertyId)?.propertyName || '';
  }
}
