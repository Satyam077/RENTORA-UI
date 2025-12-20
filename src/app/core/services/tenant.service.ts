import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantModel, TenantCreateRequest, TenantUpdateRequest } from '../models/tenant.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TenantService {
    private apiUrl = `${environment.apiUrl}/Tenants`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    /**
     * Get all tenants
     */
    getAllTenants(): Observable<any> {
        return this.http.get<any>(this.apiUrl, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get tenant by ID
     */
    getTenantById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get tenants by owner ID
     */
    getTenantsByOwnerId(ownerId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/owner/${ownerId}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get tenants by property ID
     */
    getTenantsByPropertyId(propertyId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/property/${propertyId}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get tenants by unit ID
     */
    getTenantsByUnitId(unitId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/unit/${unitId}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Create new tenant
     */
    createTenant(tenant: TenantCreateRequest): Observable<any> {
        return this.http.post<any>(this.apiUrl, tenant, {
            headers: this.getHeaders()
        });
    }

    /**
     * Update existing tenant
     */
    updateTenant(tenant: TenantUpdateRequest): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${tenant.id}`, tenant, {
            headers: this.getHeaders()
        });
    }

    /**
     * Delete tenant
     */
    deleteTenant(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get tenant dashboard data by user ID
     */
    getTenantDashboard(userId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/dashboard/${userId}`, {
            headers: this.getHeaders()
        });
    }
}
