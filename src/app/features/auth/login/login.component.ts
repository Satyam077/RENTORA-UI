import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  role: string = 'tenants';
  showPassword = false;
  model: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.role = params['role'] || 'tenants';
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
        // console.log('Login response:', response,this.model);
        if (response.success) {
          // Display success message from backend
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
