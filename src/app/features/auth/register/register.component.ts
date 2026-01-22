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
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, AfterViewInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  role: Role = Role.Landlords;
  showPassword = false;
  showConfirmPassword = false;
  roleParam: string | null = null;
  googleLoading = false;
  isGoogleUser = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private googleAuth: GoogleAuthService
  ) { }

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
        this.role = enumKey ? Role[enumKey as keyof typeof Role] : Role.Landlords;
      } else {
        this.role = Role.Landlords;
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

  ngAfterViewInit(): void {
    // Initialize Google Sign-In for registration
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    this.googleAuth.initializeForRegister((idToken) => {
      this.handleGoogleCallback(idToken);
    });

    // Render the Google button after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.googleAuth.renderButton('googleBtn', {
        theme: 'outline',
        size: 'large',
        text: 'signup_with',
        width: 300
      });
    }, 500);
  }

  private handleGoogleCallback(idToken: string): void {
    this.googleLoading = true;
    this.error = '';
    this.success = '';

    this.googleAuth.registerWithGoogle(idToken, this.role).subscribe({
      next: (response) => {
        this.googleLoading = false;

        if (response.success) {
          // Registration successful - user is created and logged in
          this.success = 'Registration successful! Redirecting...';

          // Store session data
          sessionStorage.setItem('currentUser', JSON.stringify({
            success: response.success,
            message: response.message,
            token: response.token,
            user: response.user
          }));
          sessionStorage.setItem('token', response.token || '');

          // Redirect based on role
          setTimeout(() => {
            if (
              response.user?.role === Role.Landlords ||
              response.user?.role === Role.SuperAdmin ||
              response.user?.role === Role.Admin
            ) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/tenant-dashboard']);
            }
          }, 1500);
        } else if (response.isNewUser && response.googleUser) {
          // This case shouldn't happen since isRegistration = true,
          // but handle it gracefully
          this.error = response.message || 'Registration failed. Please try again.';
        } else {
          this.error = response.message || 'Google registration failed';
        }
      },
      error: (err) => {
        this.googleLoading = false;
        console.error('Google registration error:', err);

        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.isNewUser === false) {
          // User already exists - redirect to login
          this.success = 'Account already exists! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = 'Google registration failed. Please try again.';
        }
      }
    });
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
    this.router.navigate(['/login']);
  }

  navigateToLanding(): void {
    this.router.navigate(['/']);
  }
}
