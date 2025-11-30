import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegistrationRequest, OtpRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private apiUrl = 'https://localhost:7197/api/Auth';

    private currentUserSubject: BehaviorSubject<LoginResponse | null>;
    public currentUser: Observable<LoginResponse | null>;

    constructor(private http: HttpClient) {
        const storedUser = localStorage.getItem('currentUser');
        this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(
            storedUser ? JSON.parse(storedUser) : null
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): LoginResponse | null {
        return this.currentUserSubject.value;
    }

    register(registration: RegistrationRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/register`, registration)
            .pipe(
                tap(response => {
                    if (response.success && response.token) {
                        localStorage.setItem('currentUser', JSON.stringify(response));
                        localStorage.setItem('token', response.token);
                        this.currentUserSubject.next(response);
                    }
                })
            );
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                  console.log('Login response:', response);
                    if (response.success && response.token) {
                        localStorage.setItem('currentUser', JSON.stringify(response));
                        localStorage.setItem('token', response.token);
                        this.currentUserSubject.next(response);
                    }
                })
            );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
    }

    sendOtp(emailOrMobile: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/send-otp`, JSON.stringify(emailOrMobile), {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
    }

    verifyOtp(request: OtpRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify-otp`, request);
    }

    isAuthenticated(): boolean {
        return !!this.currentUserValue && !!this.currentUserValue.token;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}
