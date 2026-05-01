import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  monthlyCollection: number;
  pendingTickets: number;
  propertyChange: number;
  occupancyChange: number;
  collectionChange: number;
  ticketChange: number;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  changePositive: boolean;
  subtitle?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  currentOwnerId: string = '';

  constructor(private http: HttpClient) { }

  // Dashboard stats - will be populated from API
  stats: StatCard[] = [
    {
      title: 'Total Properties',
      value: '0',
      change: '+0%',
      changePositive: true,
      icon: 'apartment',
      iconBg: '#ffebee', // Light Red/Pink for background
      iconColor: '#d32f2f' // Red for icon
    },
    {
      title: 'Occupied Units',
      value: '0%',
      change: '+0%',
      changePositive: true,
      subtitle: '0 of 0 units',
      icon: 'home',
      iconBg: '#e8f5e9', // Light Green
      iconColor: '#2e7d32' // Green
    },
    {
      title: 'Monthly Collection',
      value: '₹0',
      change: '+0%',
      changePositive: true,
      icon: 'currency_rupee',
      iconBg: '#e3f2fd', // Light Blue
      iconColor: '#1565c0' // Blue
    },
    {
      title: 'Pending Tickets',
      value: '0',
      change: '0%',
      changePositive: false,
      icon: 'build',
      iconBg: '#fff3e0', // Light Orange
      iconColor: '#ef6c00' // Orange
    },
  ];

  ngOnInit() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentOwnerId = user.user?.id || '';
    }

    this.fetchDashboardStats();
  }

  fetchDashboardStats() {
    this.http
      .get<DashboardStats>(
        `${environment.apiUrl}/AdminDashboad/landlords-stats?id=${this.currentOwnerId}`,
      )
      .subscribe({
        next: (res) => {
          this.updateStatsCards(res);
          console.log('Dashboard stats fetched successfully:', res);
        },
        error: (err) => console.error('Error fetching dashboard stats:', err),
      });
  }

  updateStatsCards(data: DashboardStats) {
    // Update Total Properties
    this.stats[0].value = data.totalProperties.toString();
    this.stats[0].change = this.formatChange(data.propertyChange);
    this.stats[0].changePositive = data.propertyChange >= 0;

    // Update Occupied Units
    this.stats[1].value = `${data.occupancyRate}%`;
    this.stats[1].change = this.formatChange(data.occupancyChange);
    this.stats[1].changePositive = data.occupancyChange >= 0;
    this.stats[1].subtitle = `${data.occupiedUnits} of ${data.totalUnits} units`;

    // Update Monthly Collection
    this.stats[2].value = this.formatCurrency(data.monthlyCollection);
    this.stats[2].change = this.formatChange(data.collectionChange);
    this.stats[2].changePositive = data.collectionChange >= 0;

    // Update Pending Tickets
    this.stats[3].value = data.pendingTickets.toString();
    this.stats[3].change = this.formatChange(data.ticketChange);
    // For tickets, negative change is positive (fewer tickets is good)
    this.stats[3].changePositive = data.ticketChange <= 0;
  }

  formatChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  // Recent activities
  recentActivities = [
    {
      type: 'PaymentReceived', // Updated to match icon logic if needed, but keeping text for now.
      label: 'Payment',
      description: 'John Doe - Unit 204',
      amount: '₹1,200',
      time: '2 hours ago',
      status: 'Completed',
      icon: 'payments',
      iconBg: '#e8f5e9',
      iconColor: '#2e7d32'
    },
    {
      type: 'TicketCreated',
      label: 'Ticket',
      description: 'AC repair - Unit 305',
      amount: null,
      time: '3 hours ago',
      status: 'Open',
      icon: 'bug_report',
      iconBg: '#ffebee',
      iconColor: '#d32f2f'
    },
    {
      type: 'PaymentReceived',
      label: 'Payment',
      description: 'Sarah Smith - Unit 107',
      amount: '₹950',
      time: '5 hours ago',
      status: 'Completed',
      icon: 'payments',
      iconBg: '#e8f5e9',
      iconColor: '#2e7d32'
    },
    {
      type: 'TicketUpdated',
      label: 'Ticket',
      description: 'Plumbing Issue - Unit 412',
      amount: null,
      time: '1 day ago',
      status: 'In Progress',
      icon: 'handyman',
      iconBg: '#e3f2fd',
      iconColor: '#1976d2'
    },
  ];

  // Quick actions
  quickActions = [
    { label: 'Add New Property', icon: 'add_business', route: '/property' }, // Assuming route
    { label: 'Generate Monthly Invoices', icon: 'receipt_long', route: '/landlords/invoices/generate' },
    { label: 'Send Payment Reminders', icon: 'notifications_active', route: '/landlords/payments/reminders' },
    { label: 'Create Maintenance Ticket', icon: 'build_circle', route: '/landlords/tickets/create' },
  ];
}
