import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Billing {
  id?: string;
  ownerId: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  month: number;
  year: number;
  baseRent: number;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  electricityRate: number;
  electricityBill: number;
  maintenanceCharges: number;
  otherCharges: number;
  totalBill: number;
  billDate: Date;
  dueDate: Date;
  status: string;
  notificationSent: boolean;
  notificationSentDate?: Date;
  tenantName?: string; // Virtual property for UI
  propertyName?: string; // Virtual property for UI
  unitName?: string; // Virtual property for UI
}

export interface BillingConfiguration {
  id?: string;
  propertyId: string;
  ownerId: string;
  electricityRate: number;
  maintenanceCharge: number;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}/Billing`;

  constructor(private http: HttpClient) { }

  getMonthlyBills(ownerId: string, month: number, year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/monthly?ownerId=${ownerId}&month=${month}&year=${year}`);
  }

  upsertBill(bill: Billing): Observable<any> {
    return this.http.post(`${this.apiUrl}/upsert`, bill);
  }

  getConfig(propertyId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/config/${propertyId}`);
  }

  saveConfig(config: BillingConfiguration): Observable<any> {
    return this.http.post(`${this.apiUrl}/config`, config);
  }

  getTenantBills(tenantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tenant/${tenantId}`);
  }

  sendNotification(billId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify/${billId}`, {});
  }

  generateAllBills(ownerId: string, month: number, year: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate?ownerId=${ownerId}&month=${month}&year=${year}`, {});
  }
}
