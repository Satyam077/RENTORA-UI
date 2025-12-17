import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  features = [
    {
      icon: 'property',
      title: 'Property Management',
      description: 'Manage all your properties in one centralized platform with ease'
    },
    {
      icon: 'tenant',
      title: 'Tenant Management',
      description: 'Track tenant information, lease agreements, and communication'
    },
    {
      icon: 'payment',
      title: 'Payment Tracking',
      description: 'Monitor rent payments, generate invoices, and track financial records'
    },
    {
      icon: 'maintenance',
      title: 'Maintenance Requests',
      description: 'Handle maintenance tickets and service requests efficiently'
    },
    {
      icon: 'agreement',
      title: 'Agreement Management',
      description: 'Create, manage, and track rental agreements digitally'
    },
    {
      icon: 'analytics',
      title: 'Reports & Analytics',
      description: 'Get insights with comprehensive reports and analytics dashboard'
    }
  ];

  stats = [
    { label: 'Properties Managed', value: '500+', icon: 'building' },
    { label: 'Active Tenants', value: '2,500+', icon: 'users' },
    { label: 'Landlords Trust Us', value: '150+', icon: 'trust' }
  ];

  constructor(private router: Router) { }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
