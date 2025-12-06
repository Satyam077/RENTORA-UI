import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EmailTemplate,
  EmailTemplateCreateRequest,
  EmailTemplateUpdateRequest,
  ApplicableFor,
} from '../models/email-template.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailTemplateService {
  private apiUrl = `${environment.apiUrl}/EmailTemplate`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Get all email templates
   */
  getAllTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.apiUrl , {
      headers: this.getHeaders()
    });
  }

  /**
   * Get email template by ID
   */
  getTemplateById(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get email templates by ApplicableFor
   */
  getTemplatesByApplicableFor(
    applicableFor: ApplicableFor
  ): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(
      `${this.apiUrl}/applicable/${applicableFor}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  /**
   * Create new email template
   */
  createTemplate(
    template: EmailTemplateCreateRequest
  ): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(this.apiUrl, template, {
      headers: this.getHeaders()
    });
  }

  /**
   * Update existing email template
   */
  updateTemplate(
    template: EmailTemplateUpdateRequest
  ): Observable<EmailTemplate> {
    return this.http.put<EmailTemplate>(
      `${this.apiUrl}/${template.id}`,
      template,
      {
        headers: this.getHeaders()
      }
    );
  }

  /**
   * Delete email template
   */
  deleteTemplate(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Check if template name exists
   */
  checkTemplateExists(templateName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${templateName}`, {
      headers: this.getHeaders()
    });
  }
}
