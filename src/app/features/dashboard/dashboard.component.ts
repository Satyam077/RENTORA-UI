import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {



  // Dashboard stats
  stats = [
    {
      title: 'Total Properties',
      value: '24',
      change: '+12%',
      changePositive: true,
      icon: 'building',
      iconBg: '#E3F2FD'
    },
    {
      title: 'Occupied Units',
      value: '89%',
      change: '+5%',
      changePositive: true,
      subtitle: '156 of 175 units',
      icon: 'home',
      iconBg: '#E8F5E9'
    },
    {
      title: 'Monthly Collection',
      value: '$125,450',
      change: '+8%',
      changePositive: true,
      icon: 'dollar',
      iconBg: '#FFF3E0'
    },
    {
      title: 'Pending Tickets',
      value: '12',
      change: '3%',
      changePositive: false,
      icon: 'wrench',
      iconBg: '#FCE4EC'
    }
  ];

  // Recent activities
  recentActivities = [
    {
      type: 'Payment',
      description: 'John Doe - Unit 204',
      amount: '$1,200',
      time: '2 hours ago',
      status: null
    },
    {
      type: 'Ticket',
      description: 'AC repair - Unit 305',
      amount: null,
      time: '3 hours ago',
      status: 'Open'
    },
    {
      type: 'Payment',
      description: 'Sarah Smith - Unit 107',
      amount: '$950',
      time: '5 hours ago',
      status: null
    },
    {
      type: 'Ticket',
      description: 'Plumbing Issue - Unit 412',
      amount: null,
      time: '1 day ago',
      status: 'In Progress'
    }
  ];

  // Quick actions
  quickActions = [
    { label: 'Add New Property', icon: 'plus' },
    { label: 'Generate Monthly Invoices', icon: 'document' },
    { label: 'Send Payment Reminders', icon: 'send' },
    { label: 'Create Maintenance Ticket', icon: 'wrench' }
  ];

  getIconPath(icon: string): string {
    const icons: { [key: string]: string } = {
      'building': 'M3 21h18V9l-9-7-9 7v12zm7-11h4v2h-4v-2zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z',
      'home': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      'dollar': 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
      'wrench': 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
      'plus': 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
      'document': 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
      'send': 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'
    };
    return icons[icon] || '';
  }

}
