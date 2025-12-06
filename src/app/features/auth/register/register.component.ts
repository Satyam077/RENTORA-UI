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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  role: Role = Role.Tenants;
  showPassword = false;
  showConfirmPassword = false;
  roleParam: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.roleParam = params['role'];

      if (this.roleParam) {
        const normalized = this.roleParam.trim().toLowerCase();

        // Convert string to enum KEY
        const enumKey = Object.keys(Role).find(
          (key) => key.toLowerCase() === normalized
        );

        // Convert key → number
        this.role = enumKey ? Role[enumKey as keyof typeof Role] : Role.Tenants;
      } else {
        this.role = Role.Tenants;
      }

      console.log('Converted Role:', this.role);
    });

    this.registerForm = this.formBuilder.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.email]],
        mobile: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        gender: [''],
        dateOfBirth: [''],
        role: [this.role],
        tenantId: [null],
        ownerId: [null],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
    console.log('Role set in form:', this.registerForm.value);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  get f() {
    return this.registerForm.controls;
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      return;
    }

    if (!this.registerForm.value.email && !this.registerForm.value.mobile) {
      this.error = 'Please provide either email or mobile number';
      return;
    }

    this.loading = true;

    const registrationData = {
      ...this.registerForm.value,
      role: this.role,
    };

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Registration successful! Redirecting...';
          setTimeout(() => {
            // Navigate based on role
            if (
              response.user.role === Role.Landlords ||
              response.user.role === Role.SuperAdmin ||
              response.user.role === Role.Admin
            ) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/tenant-dashboard']);
            }
          }, 1500);
        } else {
          this.error = response.message || 'Registration failed';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error =
          err.error?.message || 'An error occurred during registration';
        this.loading = false;
      },
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { role: this.role } });
  }

  navigateToLanding(): void {
    this.router.navigate(['/']);
  }
}
