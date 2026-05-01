import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.enum';
import { dashboardRoutes } from '../../../core/guards/role.guard';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  logoPath: string = 'assets/Images/home.png';
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  role: string = 'tenants';
  showPassword = false;
  model: any;
  googleLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private googleAuth: GoogleAuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.role = params['role'] || 'landlords';
      console.log('Role from query params:', this.role);
    });

    this.loginForm = this.formBuilder.group({
      emailOrMobile: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    const json = sessionStorage.getItem('currentUser');
    const token = sessionStorage.getItem('token');

    if (json && token) {
      const currentUser = JSON.parse(json);
      const role = currentUser.user?.role as Role;
      console.log('Already logged in user role:', Role[role]);
      const redirectPath = dashboardRoutes[role] ?? '/dashboard';
      this.router.navigate([redirectPath]);
    }
  }

  ngAfterViewInit(): void {
    // Initialize Google Sign-In for login
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    this.googleAuth.initializeForLogin((idToken) => {
      this.handleGoogleCallback(idToken);
    });

    // Render the Google button after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.googleAuth.renderButton('googleLoginBtn', {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: 300,
      });
    }, 500);
  }

  private handleGoogleCallback(idToken: string): void {
    this.googleLoading = true;
    this.error = '';
    this.success = '';

    this.googleAuth.loginWithGoogle(idToken).subscribe({
      next: (response) => {
        this.googleLoading = false;

        if (response.success) {
          // Login successful
          this.success = response.message || 'Login successful! Redirecting...';

          // Store session data
          sessionStorage.setItem(
            'currentUser',
            JSON.stringify({
              success: response.success,
              message: response.message,
              token: response.token,
              user: response.user,
            })
          );
          sessionStorage.setItem('token', response.token || '');

          // Navigate based on role
          const roleName = Role[response.user?.role];
          console.log('User role:', roleName);
          let path = '/login';

          switch (roleName) {
            case 'SuperAdmin':
              path = '/super-admin-dashboard';
              break;
            case 'Admin':
              path = '/super-admin-dashboard';
              break;
            case 'Landlords':
              path = '/dashboard';
              break;
            case 'Tenants':
              path = '/tenant-dashboard';
              break;
            case 'Agents':
              path = '/agent/dashboard';
              break;
            default:
              path = '/login';
          }

          setTimeout(() => {
            this.router.navigate([path]);
          }, 1000);
        } else if (response.isNewUser && response.googleUser) {
          // User not registered - redirect to register page
          this.error = 'Account not found. Please register first.';
          setTimeout(() => {
            this.router.navigate(['/register'], {
              queryParams: {
                role: this.role,
                email: response.googleUser?.email,
              },
            });
          }, 2000);
        } else {
          this.error = response.message || 'Login failed. Please try again.';
        }
      },
      error: (err) => {
        this.googleLoading = false;
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.isNewUser) {
          setTimeout(() => {
            this.router.navigate(['/register'], {
              queryParams: { role: this.role },
            });
          }, 2000);
        } else {
          this.error = 'Google login failed. Please try again.';
        }
      },
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.model = response;
        if (response.success) {
          this.success = response.message || 'Login successful! Redirecting...';

          const roleName = Role[response.user.role];
          console.log('User role:', roleName);
          let path = '/login';
          switch (roleName) {
            case 'SuperAdmin':
              path = '/super-admin-dashboard';
              break;

            case 'Admin':
              path = '/super-admin-dashboard';
              break;

            case 'Landlords':
              path = '/dashboard';
              break;

            case 'Tenants':
              path = '/tenant-dashboard';
              break;

            case 'Agents':
              path = '/agent/dashboard';
              break;

            default:
              path = '/login';
          }
          this.loading = false;

          // Navigate after a brief delay to show success message
          setTimeout(() => {
            this.router.navigate([path]);
          }, 1000);
        } else {
          // Display error message from backend
          this.error = response.message || 'Login failed. Please try again.';
          this.loading = false;
        }
      },
      error: (err) => {
        // Handle HTTP errors gracefully
        console.error('Login error:', err);

        // Try to extract message from different error response structures
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.errors) {
          // Handle validation errors
          const errors = err.error.errors;
          this.error = Object.values(errors).flat().join(', ');
        } else if (typeof err.error === 'string') {
          this.error = err.error;
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = 'An unexpected error occurred. Please try again.';
        }

        this.loading = false;
      },
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLanding(): void {
    this.router.navigate(['/']);
  }
}

