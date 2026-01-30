import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plans } from '../models/plans.model';

@Injectable({
  providedIn: 'root',
})
export class PlansService {
  private apiUrl = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getAllPlans(): Observable<Plans[]> {
    return this.http.get<Plans[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getPlanById(id: string): Observable<Plans> {
    return this.http.get<Plans>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  upsertPlan(plan: Plans): Observable<Plans> {
    return this.http.post<Plans>(this.apiUrl, plan, {
      headers: this.getHeaders(),
    });
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
