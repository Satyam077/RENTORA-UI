import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnitModel, UnitCreateRequest, UnitUpdateRequest } from '../models/unit.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UnitService {
    private apiUrl = `${environment.apiUrl}/Units`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    /**
     * Get all units
     */
    getAllUnits(): Observable<any> {
        return this.http.get<any>(this.apiUrl, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get unit by ID
     */
    getUnitById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get units by property ID
     */
    getUnitsByPropertyId(propertyId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/property/${propertyId}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get units by owner ID
     */
    getUnitsByOwnerId(ownerId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/owner/${ownerId}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Create new unit
     */
    createUnit(unit: UnitCreateRequest): Observable<any> {
        return this.http.post<any>(this.apiUrl, unit, {
            headers: this.getHeaders()
        });
    }

    /**
     * Update existing unit
     */
    updateUnit(unit: UnitUpdateRequest): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${unit.id}`, unit, {
            headers: this.getHeaders()
        });
    }

    /**
     * Delete unit
     */
    deleteUnit(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }
}

