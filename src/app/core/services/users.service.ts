import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCreateRequest, UserUpdateRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'https://localhost:7197/api/User';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createUser(user: UserCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, user, {
      headers: this.getHeaders()
    });
  }

  updateUser(user: UserUpdateRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, user, {
      headers: this.getHeaders()
    });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
