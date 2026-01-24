import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plans } from '../models/plans.model';

@Injectable({
    providedIn: 'root'
})
export class PlansService {
    private apiUrl = `${environment.apiUrl}/plans`;

    constructor(private http: HttpClient) { }

    getAllPlans(): Observable<Plans[]> {
        return this.http.get<Plans[]>(this.apiUrl);
    }

    getPlanById(id: string): Observable<Plans> {
        return this.http.get<Plans>(`${this.apiUrl}/${id}`);
    }

    upsertPlan(plan: Plans): Observable<Plans> {
        return this.http.post<Plans>(this.apiUrl, plan);
    }

    deletePlan(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
