import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Plans } from '../../../core/models/plans.model';
import { Features } from '../../../core/models/features.model';
import { SharedService } from '../../../core/services/shared.service';

@Component({
  selector: 'app-plans-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './plans-pricing.component.html',
  styleUrl: './plans-pricing.component.css',
})
export class PlansPricingComponent implements OnInit {
  plans: Plans[] = [];
  isLoading = true;
  billingCycle: 'monthly' | 'yearly' = 'monthly';

  // Key features to highlight in the "Everything You Need" section
  keyFeatures = [
    {
      icon: 'bi-cash-stack',
      title: 'Rent Collection',
      description: 'Automated online payments',
    },
    {
      icon: 'bi-person-check',
      title: 'Tenant Screening',
      description: 'Background & credit checks',
    },
    {
      icon: 'bi-tools',
      title: 'Maintenance',
      description: 'Track requests easily',
    },
    {
      icon: 'bi-graph-up',
      title: 'Financial Reports',
      description: 'Insights at a glance',
    },
    {
      icon: 'bi-envelope',
      title: 'Communication',
      description: 'Stay connected with tenants',
    },
    {
      icon: 'bi-calendar-check',
      title: 'Lease Management',
      description: 'Digital lease tracking',
    },
    {
      icon: 'bi-house-door',
      title: 'Property Listings',
      description: 'Market your vacancies',
    },
    {
      icon: 'bi-shield-check',
      title: 'Secure Portal',
      description: 'Safe tenant & owner access',
    },
  ];

  constructor(
    private _sharedService: SharedService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.isLoading = true;
    this._sharedService.getAllPlans().subscribe({
      next: (data) => {
        console.log('Plans loaded', data);
        this.plans = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading plans', err);
        this.isLoading = false;
      },
    });
  }

  toggleBillingCycle(): void {
    this.billingCycle = this.billingCycle === 'monthly' ? 'yearly' : 'monthly';
  }

  getDisplayPrice(plan: Plans): number {
    if (this.billingCycle === 'yearly' && plan.yearlyDiscount > 0) {
      return Math.round(plan.price - (plan.price * plan.yearlyDiscount) / 100);
    }
    return plan.price;
  }

  getOriginalPrice(plan: Plans): number {
    return plan.price;
  }

  hasDiscount(plan: Plans): boolean {
    return this.billingCycle === 'yearly' && plan.yearlyDiscount > 0;
  }

  // Calculate the discounted price based on yearlyDiscount percentage
  getDiscountedPrice(plan: Plans): number {
    if (plan.yearlyDiscount > 0) {
      return Math.round(plan.price - (plan.price * plan.yearlyDiscount) / 100);
    }
    return plan.price;
  }

  getYearlySavings(plan: Plans): number {
    if (plan.yearlyDiscount > 0) {
      return Math.round(((plan.price * plan.yearlyDiscount) / 100) * 12);
    }
    return 0;
  }

  getSortedFeatures(features: Features[]): Features[] {
    if (!features) return [];
    const categoryOrder = [
      'core',
      'management',
      'communication',
      'analytics',
      'integration',
    ];
    return [...features].sort((a, b) => {
      return (
        categoryOrder.indexOf(a.category.toLowerCase()) -
        categoryOrder.indexOf(b.category.toLowerCase())
      );
    });
  }

  getPlanIcon(planName: string): string {
    const name = planName.toLowerCase();
    if (name.includes('basic') || name.includes('starter')) {
      return 'bi-rocket';
    } else if (name.includes('professional') || name.includes('pro')) {
      return 'bi-award';
    } else if (name.includes('enterprise') || name.includes('premium')) {
      return 'bi-gem';
    } else if (name.includes('free')) {
      return 'bi-gift';
    }
    return 'bi-star';
  }

  getPlanIconColor(index: number, isPopular: boolean): string {
    if (isPopular) return '#6366f1';
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    return colors[index % colors.length];
  }

  onSubscribe(plan: Plans): void {
    this.router.navigate(['/register']);
    //this.router.navigate(['/subscribe', plan.id]);
  }

  onStartFreeTrial(): void {
    this.router.navigate(['/register']);
  }
}
