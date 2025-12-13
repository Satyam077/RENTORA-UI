import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AgreementModel,
  AgreementCreateRequest,
  AgreementUpdateRequest,
} from '../models/agreement.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AgreementService {
  private apiUrl = `${environment.apiUrl}/Agreement`;

  constructor(private http: HttpClient) { }

  getAllAgreements(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getAgreementById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAgreementsByOwnerId(ownerId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/owner/${ownerId}`);
  }

  getAgreementsByPropertyId(propertyId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/property/${propertyId}`);
  }

  getAgreementsByUnitId(unitId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unit/${unitId}`);
  }

  getAgreementsByTenantId(tenantId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tenant/${tenantId}`);
  }

  createAgreement(agreement: AgreementCreateRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, agreement);
  }

  updateAgreement(agreement: AgreementUpdateRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${agreement.id}`, agreement);
  }

  deleteAgreement(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  uploadAgreementDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/upload-document`, formData);
  }
}
