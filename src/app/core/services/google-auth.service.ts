import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var google: any;

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  isNewUser: boolean;
  googleUser?: GoogleUserInfo;
  token?: string;
  user?: any;
}

export interface GoogleUserInfo {
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  isEmailVerified: boolean;
}

export interface GoogleAuthRequest {
  idToken: string;
  role: number;
  isRegistration: boolean;
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private clientId = environment.googleClientId;
  private apiUrl = `${environment.apiUrl}/Auth`;

  // Subjects to emit token for different contexts
  private loginTokenSubject = new Subject<string>();
  private registerTokenSubject = new Subject<string>();

  constructor(
    private http: HttpClient,
    private ngZone: NgZone
  ) { }

  /**
   * Initialize Google Sign-In for Login
   */
  initializeForLogin(callback: (token: string) => void): void {
    this.waitForGoogleAPI(() => {
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => {
          this.ngZone.run(() => {
            callback(response.credential);
          });
        }
      });
    });
  }

  /**
   * Initialize Google Sign-In for Registration
   */
  initializeForRegister(callback: (token: string) => void): void {
    this.waitForGoogleAPI(() => {
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => {
          this.ngZone.run(() => {
            callback(response.credential);
          });
        }
      });
    });
  }

  /**
   * Wait for Google API to be loaded
   */
  private waitForGoogleAPI(callback: () => void): void {
    if (typeof google !== 'undefined' && google.accounts) {
      callback();
    } else {
      setTimeout(() => this.waitForGoogleAPI(callback), 100);
    }
  }

  /**
   * Render Google Sign-In button
   */
  renderButton(elementId: string, options?: any): void {
    this.waitForGoogleAPI(() => {
      const element = document.getElementById(elementId);
      if (element) {
        google.accounts.id.renderButton(element, {
          theme: options?.theme || 'outline',
          size: options?.size || 'large',
          type: options?.type || 'standard',
          text: options?.text || 'signin_with',
          width: options?.width || 300,
          logo_alignment: options?.logoAlignment || 'left'
        });
      }
    });
  }

  /**
   * Trigger Google One-Tap Sign-In
   */
  promptOneTap(): void {
    this.waitForGoogleAPI(() => {
      google.accounts.id.prompt();
    });
  }

  /**
   * Authenticate with backend - for Login
   */
  loginWithGoogle(idToken: string): Observable<GoogleAuthResponse> {
    const request: GoogleAuthRequest = {
      idToken: idToken,
      role: 2, // Default to Tenants
      isRegistration: false
    };
    return this.http.post<GoogleAuthResponse>(`${this.apiUrl}/google`, request);
  }

  /**
   * Authenticate with backend - for Registration
   */
  registerWithGoogle(idToken: string, role: number): Observable<GoogleAuthResponse> {
    const request: GoogleAuthRequest = {
      idToken: idToken,
      role: role,
      isRegistration: true
    };
    return this.http.post<GoogleAuthResponse>(`${this.apiUrl}/google`, request);
  }

  /**
   * Revoke Google Sign-In (sign out)
   */
  revokeGoogle(): void {
    this.waitForGoogleAPI(() => {
      google.accounts.id.disableAutoSelect();
    });
  }
}
