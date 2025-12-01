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
  role: number = 1; //'tenant';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.role = params['role'] || 'tenant';
    });

    this.loginForm = this.formBuilder.group({
      emailOrMobile: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
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

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
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
          this.router.navigate([path]);
        } else {
          this.error = response.message || 'Login failed';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred during login';
        this.loading = false;
      },
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register'], { queryParams: { role: this.role } });
  }

  navigateToLanding(): void {
    this.router.navigate(['/']);
  }
}
