import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropertyModel, PropertyCreateRequest, PropertyUpdateRequest } from '../models/property.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PropertyService {
    private apiUrl = `${environment.apiUrl}/Property`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    /**
     * Get all properties
     */
    getAllProperties(): Observable<any> {
        return this.http.get<any>(this.apiUrl, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get property by ID
     */
    getPropertyById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Get properties by owner ID
     */
    getPropertiesByOwnerId(ownerId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/owner/${ownerId}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Create new property
     */
    createProperty(property: PropertyCreateRequest): Observable<any> {
        return this.http.post<any>(this.apiUrl, property, {
            headers: this.getHeaders()
        });
    }

    /**
     * Update existing property
     */
    updateProperty(property: PropertyUpdateRequest): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${property.id}`, property, {
            headers: this.getHeaders()
        });
    }

    /**
     * Delete property
     */
    deleteProperty(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }
}
