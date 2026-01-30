import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plans } from '../models/plans.model';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private apiUrl = `${environment.apiUrl}/shared`;

  constructor(private http: HttpClient) {}

  getAllPlans(): Observable<Plans[]> {
    return this.http.get<Plans[]>(this.apiUrl);
  }

  getPlanById(id: string): Observable<Plans> {
    return this.http.get<Plans>(`${this.apiUrl}/${id}`);
  }
}
