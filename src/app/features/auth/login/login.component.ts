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
  role: string = 'tenant';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get role from query params
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
          // Navigate based on role
          if (
            response.user.role === 'landlord' ||
            response.user.role === 'owner'
          ) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/tenant-dashboard']);
          }
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
