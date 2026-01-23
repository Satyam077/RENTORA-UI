import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Features } from '../models/features.model';

@Injectable({
    providedIn: 'root'
})
export class FeaturesService {
    private apiUrl = `${environment.apiUrl}/features`;

    constructor(private http: HttpClient) { }

    getAllFeatures(): Observable<Features[]> {
        return this.http.get<Features[]>(this.apiUrl);
    }

    getFeatureById(id: string): Observable<Features> {
        return this.http.get<Features>(`${this.apiUrl}/${id}`);
    }

    createFeature(feature: Features): Observable<Features> {
        const formData = new FormData();
        formData.append('name', feature.name);
        formData.append('description', feature.description || '');
        formData.append('category', feature.category);

        if (feature.imageFile) {
            formData.append('imageFile', feature.imageFile);
        }

        return this.http.post<Features>(this.apiUrl, formData);
    }

    updateFeature(id: string, feature: Features): Observable<Features> {
        const formData = new FormData();
        formData.append('name', feature.name);
        formData.append('description', feature.description || '');
        formData.append('category', feature.category);

        if (feature.imageFile) {
            formData.append('imageFile', feature.imageFile);
        }

        return this.http.put<Features>(`${this.apiUrl}/${id}`, formData);
    }

    deleteFeature(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
