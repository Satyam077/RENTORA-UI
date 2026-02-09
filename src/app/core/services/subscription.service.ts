import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LandlordSubscription {
    id: string;
    planId: string;
    planName: string;
    price: number;
    billingCycle: string;
    startDate: Date;
    endDate: Date;
    isTrialActive: boolean;
    trialDaysRemaining: number;
    status: number;
    nextBillingDate?: Date;
    autoRenew: boolean;
    features: string[];
}

export interface PaymentMethod {
    id: string;
    lastFourDigits: string;
    cardType: string;
    cardHolderName: string;
    expiryDate: string;
    methodType: string;
    isDefault: boolean;
    upiId?: string;
}

export interface PaymentFormData {
    action: string;
    key: string;
    txnId: string;
    amount: string;
    productInfo: string;
    firstName: string;
    email: string;
    phone: string;
    surl: string;
    furl: string;
    hash: string;
    udf1: string;
    udf2: string;
    udf3: string;
    udf4: string;
    udf5: string;
}

export interface PaymentTransaction {
    id: string;
    transactionId: string;
    planId: string;
    amount: number;
    status: number;
    paymentMode: string;
    paymentDate?: Date;
    createdAt: Date;
}

export interface Plan {
    id: string;
    planName: string;
    description: string;
    price: number;
    yearlyDiscount: number;
    isMarkedAsPopular: boolean;
    features: PlanFeature[];
}

export interface PlanFeature {
    name: string;
    category: string;
}

export interface InitiatePaymentRequest {
    planId: string;
    billingCycle: string;
}

export interface AddPaymentMethodRequest {
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    setAsDefault: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    private apiUrl = `${environment.apiUrl}/subscription`;

    constructor(private http: HttpClient) { }

    // Get current subscription
    getCurrentSubscription(userId: string): Observable<LandlordSubscription> {
        return this.http.get<LandlordSubscription>(`${this.apiUrl}/current/${userId}`);
    }

    // Get all available plans
    getPlans(): Observable<Plan[]> {
        return this.http.get<Plan[]>(`${this.apiUrl}/plans`);
    }

    // Initiate payment for a plan
    initiatePayment(
        request: InitiatePaymentRequest,
        userId: string,
        email: string,
        name: string,
        phone: string
    ): Observable<PaymentFormData> {
        return this.http.post<PaymentFormData>(
            `${this.apiUrl}/initiate-payment?userId=${userId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`,
            request
        );
    }

    // Cancel subscription
    cancelSubscription(subscriptionId: string, reason: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/cancel/${subscriptionId}`, { reason });
    }

    // Change plan
    changePlan(userId: string, newPlanId: string, billingCycle: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/change-plan/${userId}`, { newPlanId, billingCycle });
    }

    // Get saved payment methods
    getPaymentMethods(userId: string): Observable<PaymentMethod[]> {
        return this.http.get<PaymentMethod[]>(`${this.apiUrl}/payment-methods/${userId}`);
    }

    // Add payment method
    addPaymentMethod(userId: string, request: AddPaymentMethodRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/payment-methods/${userId}`, request);
    }

    // Delete payment method
    deletePaymentMethod(paymentMethodId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/payment-methods/${paymentMethodId}`);
    }

    // Set default payment method
    setDefaultPaymentMethod(userId: string, paymentMethodId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/payment-methods/${userId}/default/${paymentMethodId}`, {});
    }

    // Get payment history
    getPaymentHistory(userId: string, page: number = 1, pageSize: number = 10): Observable<PaymentTransaction[]> {
        return this.http.get<PaymentTransaction[]>(`${this.apiUrl}/payment-history/${userId}?page=${page}&pageSize=${pageSize}`);
    }

    // Create trial subscription (called during registration)
    createTrialSubscription(userId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/create-trial/${userId}`, {});
    }

    // Submit payment form to PayU
    submitPaymentForm(formData: PaymentFormData): void {
        // Create a form and submit it to PayU
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = formData.action;
        form.target = '_self';

        const fields: { [key: string]: string } = {
            key: formData.key,
            txnid: formData.txnId,
            amount: formData.amount,
            productinfo: formData.productInfo,
            firstname: formData.firstName,
            email: formData.email,
            phone: formData.phone,
            surl: formData.surl,
            furl: formData.furl,
            hash: formData.hash,
            udf1: formData.udf1,
            udf2: formData.udf2,
            udf3: formData.udf3,
            udf4: formData.udf4,
            udf5: formData.udf5
        };

        for (const [name, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    }
}
