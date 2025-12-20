import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Maintenance } from '../models/maintenance.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {
    private apiUrl = `${environment.apiUrl}/Maintenance`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    getAllMaintenance(): Observable<any> {
        return this.http.get<any>(this.apiUrl, {
            headers: this.getHeaders()
        });
    }

    getMaintenanceById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    getMaintenanceByTenantId(tenantId: string): Observable<any> {
        console.log('Fetching maintenance for tenant ID:', tenantId);
        return this.http.get<any>(`${this.apiUrl}/tenant/${tenantId}`, {
            headers: this.getHeaders()
        });
    }

    getMaintenanceByPropertyId(propertyId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/property/${propertyId}`, {
            headers: this.getHeaders()
        });
    }

    getMaintenanceByUnitId(unitId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/unit/${unitId}`, {
            headers: this.getHeaders()
        });
    }

    getMaintenanceByOwnerId(ownerId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/owner/${ownerId}`, {
            headers: this.getHeaders()
        });
    }

    getMaintenanceByLandlordId(landlordId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/landlord/${landlordId}`, {
            headers: this.getHeaders()
        });
    }

    createMaintenance(maintenance: Maintenance): Observable<any> {
        return this.http.post<any>(this.apiUrl, maintenance, {
            headers: this.getHeaders()
        });
    }

    updateMaintenance(maintenance: Maintenance): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${maintenance.id}`, maintenance, {
            headers: this.getHeaders()
        });
    }

    deleteMaintenance(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    updateStatus(id: string, status: number): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/status`, status, {
            headers: this.getHeaders()
        });
    }

    scheduleMaintenance(id: string, scheduledDate: Date): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/schedule`, scheduledDate, {
            headers: this.getHeaders()
        });
    }

    rateMaintenance(id: string, rating: number): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/rate`, rating, {
            headers: this.getHeaders()
        });
    }
}
