import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  resetPasswordForm!: FormGroup;

  loading = false;
  submitted = false;
  resetSubmitted = false;
  error = '';
  success = '';

  showResetForm = false;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private usersService: UsersService
  ) {
    this.initForms();
  }

  private initForms(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  get rf() {
    return this.resetPasswordForm.controls;
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'old':
        this.showOldPassword = !this.showOldPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  onForgotPasswordSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;

    this.usersService.forgotPassword(this.forgotPasswordForm.value.email).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.success = response.message || 'A new password has been sent to your email.';
        } else {
          this.error = response.message || 'Failed to process request.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }

  onResetPasswordSubmit(): void {
    this.resetSubmitted = true;
    this.error = '';
    this.success = '';

    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.loading = true;

    this.usersService.resetPassword(this.resetPasswordForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.success = response.message || 'Password has been reset successfully.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = response.message || 'Failed to reset password.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }

  toggleForm(): void {
    this.showResetForm = !this.showResetForm;
    this.error = '';
    this.success = '';
    this.submitted = false;
    this.resetSubmitted = false;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToLanding(): void {
    this.router.navigate(['/']);
  }
}
