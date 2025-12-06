import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RegistrationRequest,
  OtpRequest,
} from '../models/user.model';
import { JwtHelper } from '../helpers/jwt.helper';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7197/api/Auth';

  private currentUserSubject: BehaviorSubject<LoginResponse | null>;
  public currentUser: Observable<LoginResponse | null>;

  constructor(private http: HttpClient) {
    const storedUser = sessionStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.checkTokenOnStartup();
  }

  public get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  register(registration: RegistrationRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/register`, registration)
      .pipe(
        tap((response) => {
          if (response.success && response.token) {
            sessionStorage.setItem('currentUser', JSON.stringify(response));
            sessionStorage.setItem('token', response.token);
            this.currentUserSubject.next(response);
          }
        })
      );
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('Login response:', response);
          if (response.success && response.token) {
            sessionStorage.setItem('currentUser', JSON.stringify(response));
            sessionStorage.setItem('token', response.token);
            this.currentUserSubject.next(response);
          }
        })
      );
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  sendOtp(emailOrMobile: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/send-otp`,
      JSON.stringify(emailOrMobile),
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  verifyOtp(request: OtpRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, request);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue && !!this.currentUserValue.token;
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }
  // 🔥 Check token at app startup
  private checkTokenOnStartup() {
    const token = sessionStorage.getItem('token');
    const json = sessionStorage.getItem('currentUser');

    if (!token || !json) {
      this.logout();
      return;
    }

    if (JwtHelper.isTokenExpired(token)) {
      this.logout();
      return;
    }

    // Auto-renew user state
    this.currentUserSubject.next(JSON.parse(json));
    this.startExpirationWatcher();
  }

  // 🔥 Auto logout when token expires
  private startExpirationWatcher() {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;

    const timeout = expiry - Date.now();

    if (timeout <= 0) {
      this.logout();
      return;
    }
    setTimeout(() => {
      alert('Session expired. Please log in again.');
      this.logout();
      window.location.href = '/login';
    }, timeout);
  }

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    return token !== null && !JwtHelper.isTokenExpired(token);
  }
}
