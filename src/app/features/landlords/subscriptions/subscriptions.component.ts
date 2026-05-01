import { Component, OnInit } from '@angular/core';
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

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSnackBarModule,
    SpinnerComponent,
  ],
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

  // Modal states
  showUpgradeModal = false;
  showPaymentMethodModal = false;
  showCancelModal = false;

  // Form data
  selectedPlan: Plan | null = null;
  selectedBillingCycle: 'monthly' | 'yearly' = 'monthly';
  cancellationReason = '';

  newCard = {
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    setAsDefault: true,
  };

  historyColumns = ['date', 'transactionId', 'amount', 'paymentMode', 'status'];

  public SubscriptionStatus = SubscriptionStatus;
  public PaymentMethodType = PaymentMethodType;

  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
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
        this.showSnackBar('Payment successful! Your subscription has been activated.');
        this.loadSubscriptionData();
      } else if (params['status'] === 'failed') {
        this.showSnackBar(params['error'] || 'Payment failed. Please try again.', 'error');
      }
    });
  }

  loadSubscriptionData(): void {
    if (!this.currentUser) return;
    this.isLoading = true;

    this.subscriptionService.getCurrentSubscription(this.currentUser.id).subscribe({
      next: (data) => { this.subscription = data; this.isLoading = false; },
      error: () => { this.subscription = null; this.isLoading = false; },
    });

    this.subscriptionService.getPlans().subscribe({
      next: (data) => this.plans = data,
      error: () => { },
    });

    this.subscriptionService.getPaymentMethods(this.currentUser.id).subscribe({
      next: (data) => this.paymentMethods = data,
      error: () => { },
    });

    this.subscriptionService.getPaymentHistory(this.currentUser.id).subscribe({
      next: (data) => this.paymentHistory = data,
      error: () => { },
    });
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
    return this.selectedBillingCycle === 'yearly' ? monthlyPrice * 12 : monthlyPrice;
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

    this.subscriptionService
      .initiatePayment(
        { planId: this.selectedPlan.id, billingCycle: this.selectedBillingCycle },
        this.currentUser.id, this.currentUser.email,
        this.currentUser.fullName, this.currentUser.mobile,
      )
      .subscribe({
        next: (response: any) => {
          this.isProcessing = false;
          this.showUpgradeModal = false;
          if (response.isFree) {
            this.showSnackBar(response.message);
            this.loadSubscriptionData();
          } else {
            this.subscriptionService.submitPaymentForm(response);
          }
        },
        error: () => {
          this.isProcessing = false;
          this.showSnackBar('Failed to initiate payment.', 'error');
        },
      });
  }

  // Payment method management
  openAddPaymentMethodModal(): void {
    this.resetCardForm();
    this.showPaymentMethodModal = true;
  }

  resetCardForm(): void {
    this.newCard = { cardNumber: '', cardHolderName: '', expiryMonth: '', expiryYear: '', cvv: '', setAsDefault: true };
  }

  savePaymentMethod(): void {
    if (!this.currentUser) return;
    this.isProcessing = true;
    this.subscriptionService.addPaymentMethod(this.currentUser.id, this.newCard).subscribe({
      next: () => {
        this.isProcessing = false;
        this.showPaymentMethodModal = false;
        this.showSnackBar('Payment method added successfully.');
        this.loadSubscriptionData();
      },
      error: () => { this.isProcessing = false; this.showSnackBar('Failed to add payment method.', 'error'); },
    });
  }

  deletePaymentMethod(method: PaymentMethod): void {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    this.subscriptionService.deletePaymentMethod(method.id).subscribe({
      next: () => { this.showSnackBar('Payment method removed.'); this.loadSubscriptionData(); },
      error: () => this.showSnackBar('Failed to remove payment method.', 'error'),
    });
  }

  setDefaultMethod(method: PaymentMethod): void {
    if (!this.currentUser) return;
    this.subscriptionService.setDefaultPaymentMethod(this.currentUser.id, method.id).subscribe({
      next: () => { this.showSnackBar('Default payment method updated.'); this.loadSubscriptionData(); },
      error: () => this.showSnackBar('Failed to update default method.', 'error'),
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
    this.subscriptionService.cancelSubscription(this.subscription.id, this.cancellationReason).subscribe({
      next: () => {
        this.isProcessing = false;
        this.showCancelModal = false;
        this.showSnackBar('Subscription cancelled successfully.');
        this.loadSubscriptionData();
      },
      error: () => { this.isProcessing = false; this.showSnackBar('Failed to cancel subscription.', 'error'); },
    });
  }

  toggleAutoRenew(): void {
    this.showSnackBar('Auto-renew setting updated.');
  }

  closeModal(): void {
    this.showUpgradeModal = false;
    this.showPaymentMethodModal = false;
    this.showCancelModal = false;
  }

  // Utilities
  getStatusChipColor(status: number): string {
    switch (status) {
      case SubscriptionStatus.Active: return 'accent';
      case SubscriptionStatus.Trial: return 'primary';
      case SubscriptionStatus.Cancelled:
      case SubscriptionStatus.Expired:
      case SubscriptionStatus.PastDue: return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(status: number): string {
    return SubscriptionStatus[status] || 'None';
  }

  getPaymentMethodLabel(type: number | string): string {
    if (typeof type === 'string') return type;
    return PaymentMethodType[type] || 'Unknown';
  }

  getCardMatIcon(cardType: string | number): string {
    const label = this.getPaymentMethodLabel(cardType).toLowerCase();
    if (label === 'upi') return 'account_balance';
    if (label === 'netbanking') return 'account_balance';
    if (label === 'wallet') return 'account_balance_wallet';
    return 'credit_card';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  }

  private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['snack-bar-error'] : ['snack-bar-success'],
    });
  }
}

export enum SubscriptionStatus {
  Trial = 1, Active = 2, Paused = 3, Cancelled = 4, Expired = 5, PastDue = 6,
}
export enum PaymentMethodType {
  Card = 1, Upi = 2, NetBanking = 3, Wallet = 4,
}
