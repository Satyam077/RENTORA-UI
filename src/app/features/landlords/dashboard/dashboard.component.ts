import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

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
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  currentOwnerId: string = '';

  constructor(private http: HttpClient) { }

  // Dashboard stats - will be populated from API
  stats: StatCard[] = [
    {
      title: 'Total Properties',
      value: '0',
      change: '+0%',
      changePositive: true,
      icon: 'building',
      iconBg: '#8B2A5C',
    },
    {
      title: 'Occupied Units',
      value: '0%',
      change: '+0%',
      changePositive: true,
      subtitle: '0 of 0 units',
      icon: 'home',
      iconBg: '#8B2A5C',
    },
    {
      title: 'Monthly Collection',
      value: '₹0',
      change: '+0%',
      changePositive: true,
      icon: 'inr',
      iconBg: '#8B2A5C',
    },
    {
      title: 'Pending Tickets',
      value: '0',
      change: '0%',
      changePositive: false,
      icon: 'wrench',
      iconBg: '#8B2A5C',
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
      type: 'Payment',
      description: 'John Doe - Unit 204',
      amount: '₹1,200',
      time: '2 hours ago',
      status: null,
    },
    {
      type: 'Ticket',
      description: 'AC repair - Unit 305',
      amount: null,
      time: '3 hours ago',
      status: 'Open',
    },
    {
      type: 'Payment',
      description: 'Sarah Smith - Unit 107',
      amount: '₹950',
      time: '5 hours ago',
      status: null,
    },
    {
      type: 'Ticket',
      description: 'Plumbing Issue - Unit 412',
      amount: null,
      time: '1 day ago',
      status: 'In Progress',
    },
  ];

  // Quick actions
  quickActions = [
    { label: 'Add New Property', icon: 'plus' },
    { label: 'Generate Monthly Invoices', icon: 'document' },
    { label: 'Send Payment Reminders', icon: 'send' },
    { label: 'Create Maintenance Ticket', icon: 'wrench' },
  ];

  getIconPath(icon: string): string {
    const icons: { [key: string]: string } = {
      building:
        'M3 21h18V9l-9-7-9 7v12zm7-11h4v2h-4v-2zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z',
      home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      inr:
        'M17 4H7v2h3.74c-.47 1.14-1.44 2-2.74 2H7v2.95l5.58 6.03 1.44-1.34L9.4 10.95h.6c2.24 0 4.16-1.38 4.95-3.33.03-.08.06-.16.08-.25.03-.09.04-.18.06-.27.02-.1.04-.2.05-.3.01-.09.01-.19.01-.28V6.5c0-.01 0-.03 0-.05 0-.02 0-.04-.01-.06V6.35c0-.02 0-.04-.01-.06a2.78 2.78 0 0 0-.06-.31c-.02-.07-.04-.14-.06-.21-.01-.04-.03-.09-.04-.13H17V4zm0 4h-2.09c-.06.15-.12.29-.2.43-.04.07-.08.14-.12.21H17V8z',
      wrench:
        'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
      plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
      document:
        'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
      send: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
    };
    return icons[icon] || '';
  }
}
