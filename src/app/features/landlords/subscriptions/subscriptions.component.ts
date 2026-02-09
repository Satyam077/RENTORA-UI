import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  SubscriptionService,
  LandlordSubscription,
  PaymentMethod,
  PaymentTransaction,
  Plan,
  PaymentFormData,
} from '../../../core/services/subscription.service';

interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css',
})
export class SubscriptionsComponent implements OnInit {
  currentUser: User | null = null;
  subscription: LandlordSubscription | null = null;
  paymentMethods: PaymentMethod[] = [];
  paymentHistory: PaymentTransaction[] = [];
  plans: Plan[] = [];

  isLoading = true;
  isProcessing = false;
  activeTab: 'overview' | 'plans' | 'payment-methods' | 'history' = 'overview';

  // Modal states
  showUpgradeModal = false;
  showPaymentMethodModal = false;
  showCancelModal = false;

  // Form data
  selectedPlan: Plan | null = null;
  selectedBillingCycle: 'monthly' | 'yearly' = 'monthly';
  cancellationReason = '';

  // New payment method form
  newCard = {
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    setAsDefault: true,
  };

  // Status messages
  successMessage = '';
  errorMessage = '';

  // Expose Enum to Template
  public SubscriptionStatus = SubscriptionStatus;
  public PaymentMethodType = PaymentMethodType;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.checkUrlParams();
  }

  loadCurrentUser(): void {
    const userJson = sessionStorage.getItem('currentUser');
    if (userJson) {
      const userData = JSON.parse(userJson);
      this.currentUser = userData.user;
      this.loadSubscriptionData();
    } else {
      this.router.navigate(['/login']);
    }
  }

  checkUrlParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['status'] === 'success') {
        this.successMessage =
          'Payment successful! Your subscription has been activated.';
        this.loadSubscriptionData();
      } else if (params['status'] === 'failed') {
        this.errorMessage =
          params['error'] || 'Payment failed. Please try again.';
      }
    });
  }

  loadSubscriptionData(): void {
    if (!this.currentUser) return;

    this.isLoading = true;

    // Load current subscription
    this.subscriptionService
      .getCurrentSubscription(this.currentUser.id)
      .subscribe({
        next: (data) => {
          this.subscription = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading subscription:', err);
          this.subscription = null;
          this.isLoading = false;
        },
      });

    // Load plans
    this.subscriptionService.getPlans().subscribe({
      next: (data) => {
        this.plans = data;
      },
      error: (err) => console.error('Error loading plans:', err),
    });

    // Load payment methods
    this.subscriptionService.getPaymentMethods(this.currentUser.id).subscribe({
      next: (data) => {
        this.paymentMethods = data;
      },
      error: (err) => console.error('Error loading payment methods:', err),
    });

    // Load payment history
    this.subscriptionService.getPaymentHistory(this.currentUser.id).subscribe({
      next: (data) => {
        this.paymentHistory = data;
        console.log('Payment history loaded:', data);
      },
      error: (err) => console.error('Error loading payment history:', err),
    });
  }

  setActiveTab(
    tab: 'overview' | 'plans' | 'payment-methods' | 'history',
  ): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  // Plan selection and upgrade
  selectPlan(plan: Plan): void {
    this.selectedPlan = plan;
    this.showUpgradeModal = true;
  }

  getDisplayPrice(plan: Plan): number {
    if (this.selectedBillingCycle === 'yearly' && plan.yearlyDiscount > 0) {
      return Math.round(plan.price - (plan.price * plan.yearlyDiscount) / 100);
    }
    return plan.price;
  }

  getTotalPrice(plan: Plan): number {
    const monthlyPrice = this.getDisplayPrice(plan);
    return this.selectedBillingCycle === 'yearly'
      ? monthlyPrice * 12
      : monthlyPrice;
  }

  getYearlySavings(plan: Plan): number {
    if (plan.yearlyDiscount > 0) {
      return Math.round(((plan.price * plan.yearlyDiscount) / 100) * 12);
    }
    return 0;
  }

  proceedToPayment(): void {
    if (!this.selectedPlan || !this.currentUser) return;

    this.isProcessing = true;
    this.clearMessages();

    this.subscriptionService
      .initiatePayment(
        {
          planId: this.selectedPlan.id,
          billingCycle: this.selectedBillingCycle,
        },
        this.currentUser.id,
        this.currentUser.email,
        this.currentUser.fullName,
        this.currentUser.mobile,
      )
      .subscribe({
        next: (response: any) => {
          this.isProcessing = false;
          this.showUpgradeModal = false;

          if (response.isFree) {
            // Free plan activated directly
            this.successMessage = response.message;
            this.loadSubscriptionData();
          } else {
            // Submit to PayU
            this.subscriptionService.submitPaymentForm(response);
          }
        },
        error: (err) => {
          this.isProcessing = false;
          this.errorMessage = 'Failed to initiate payment. Please try again.';
          console.error('Payment initiation error:', err);
        },
      });
  }

  // Payment method management
  openAddPaymentMethodModal(): void {
    this.resetCardForm();
    this.showPaymentMethodModal = true;
  }

  resetCardForm(): void {
    this.newCard = {
      cardNumber: '',
      cardHolderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      setAsDefault: true,
    };
  }

  savePaymentMethod(): void {
    if (!this.currentUser) return;

    this.isProcessing = true;

    this.subscriptionService
      .addPaymentMethod(this.currentUser.id, this.newCard)
      .subscribe({
        next: () => {
          this.isProcessing = false;
          this.showPaymentMethodModal = false;
          this.successMessage = 'Payment method added successfully.';
          this.loadSubscriptionData();
        },
        error: (err) => {
          this.isProcessing = false;
          this.errorMessage = 'Failed to add payment method.';
          console.error('Add payment method error:', err);
        },
      });
  }

  deletePaymentMethod(method: PaymentMethod): void {
    if (!confirm('Are you sure you want to remove this payment method?'))
      return;

    this.subscriptionService.deletePaymentMethod(method.id).subscribe({
      next: () => {
        this.successMessage = 'Payment method removed successfully.';
        this.loadSubscriptionData();
      },
      error: (err) => {
        this.errorMessage = 'Failed to remove payment method.';
        console.error('Delete payment method error:', err);
      },
    });
  }

  setDefaultMethod(method: PaymentMethod): void {
    if (!this.currentUser) return;

    this.subscriptionService
      .setDefaultPaymentMethod(this.currentUser.id, method.id)
      .subscribe({
        next: () => {
          this.successMessage = 'Default payment method updated.';
          this.loadSubscriptionData();
        },
        error: (err) => {
          this.errorMessage = 'Failed to update default payment method.';
          console.error('Set default method error:', err);
        },
      });
  }

  // Subscription management
  openCancelModal(): void {
    this.cancellationReason = '';
    this.showCancelModal = true;
  }

  cancelSubscription(): void {
    if (!this.subscription) return;

    this.isProcessing = true;

    this.subscriptionService
      .cancelSubscription(this.subscription.id, this.cancellationReason)
      .subscribe({
        next: () => {
          this.isProcessing = false;
          this.showCancelModal = false;
          this.successMessage = 'Subscription cancelled successfully.';
          this.loadSubscriptionData();
        },
        error: (err) => {
          this.isProcessing = false;
          this.errorMessage = 'Failed to cancel subscription.';
          console.error('Cancel subscription error:', err);
        },
      });
  }

  toggleAutoRenew(): void {
    // TODO: Implement auto-renew toggle
    this.successMessage = 'Auto-renew setting updated.';
  }

  // Utilities
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getStatusClass(status: number): string {
    switch (status) {
      case SubscriptionStatus.Active:
        return 'status-success';
      case SubscriptionStatus.Trial:
        return 'status-trial';
      case SubscriptionStatus.Cancelled:
      case SubscriptionStatus.Expired:
      case SubscriptionStatus.PastDue:
        return 'status-danger';
      case SubscriptionStatus.Paused:
        return 'status-warning'; // Assuming you have a warning class or reuse pending
      default:
        return 'status-default';
    }
  }

  getStatusLabel(status: number): string {
    return SubscriptionStatus[status] || 'None';
  }

  getPaymentMethodLabel(type: number | string): string {
    if (typeof type === 'string') return type;
    return PaymentMethodType[type] || 'Unknown';
  }

  getCardIcon(cardType: string | number): string {
    const label = this.getPaymentMethodLabel(cardType);
    const type = label.toLowerCase();
    if (type === 'visa') return 'bi-credit-card-2-front';
    if (type === 'mastercard') return 'bi-credit-card';
    if (type === 'rupay') return 'bi-credit-card-fill';
    if (type === 'amex') return 'bi-credit-card-2-back';
    return 'bi-credit-card';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  closeModal(): void {
    this.showUpgradeModal = false;
    this.showPaymentMethodModal = false;
    this.showCancelModal = false;
  }
}

export enum SubscriptionStatus {
  Trial = 1,
  Active = 2,
  Paused = 3,
  Cancelled = 4,
  Expired = 5,
  PastDue = 6
}
export enum PaymentMethodType {
  Card = 1,
  Upi = 2,
  NetBanking = 3,
  Wallet = 4
}
