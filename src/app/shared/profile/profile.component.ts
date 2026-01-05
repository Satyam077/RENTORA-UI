import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { User, Address } from '../../core/models/user.model';
import { Role } from '../../core/models/role.enum';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isEditing = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  apiBaseUrl = 'https://localhost:7197';

  currentUser: User | null = null;
  profileImagePreview: string | null = null;
  selectedFile: File | null = null;

  // Password change
  showPasswordSection = false;
  passwordForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const storedUser = this.authService.currentUserValue;
    if (storedUser && storedUser.user) {
      this.currentUser = {
        id: storedUser.user.id,
        fullName: storedUser.user.fullName,
        email: storedUser.user.email,
        mobile: storedUser.user.mobile,
        role: storedUser.user.role,
        isEmailVerified: storedUser.user.isEmailVerified,
        isMobileVerified: storedUser.user.isMobileVerified,
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        profileImageUrl: storedUser.user.profileImageUrl,

        address: {
          addressLine1: '123 Main Street',
          addressLine2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001'
        }
      };

      this.profileImagePreview = this.currentUser.profileImageUrl ? `${this.apiBaseUrl}/${this.currentUser.profileImageUrl}` : null;
      console.log('Populating form with user data:', this.profileImagePreview);
      this.populateForm();
    }
  }

  initializeForms(): void {
    this.profileForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      gender: [''],
      dateOfBirth: [''],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: ['']
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Disable form initially
    this.profileForm.disable();
  }

  populateForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        fullName: this.currentUser.fullName,
        email: this.currentUser.email,
        mobile: this.currentUser.mobile,
        gender: this.currentUser.gender || '',
        dateOfBirth: this.currentUser.dateOfBirth || '',
        addressLine1: this.currentUser.address?.addressLine1 || '',
        addressLine2: this.currentUser.address?.addressLine2 || '',
        city: this.currentUser.address?.city || '',
        state: this.currentUser.address?.state || '',
        country: this.currentUser.address?.country || '',
        zipCode: this.currentUser.address?.zipCode || ''
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
      // Keep email disabled for security
      this.profileForm.get('email')?.disable();
    } else {
      this.profileForm.disable();
      this.populateForm(); // Reset to original values
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePicture(): void {
    this.selectedFile = null;
    this.profileImagePreview = null;
    if (this.currentUser) {
      this.currentUser.profileImageUrl = '';
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.profileForm.getRawValue();

    const updatedUser: User = {
      ...this.currentUser!,
      fullName: formValue.fullName,
      mobile: formValue.mobile,
      gender: formValue.gender,
      dateOfBirth: formValue.dateOfBirth,
      address: {
        addressLine1: formValue.addressLine1,
        addressLine2: formValue.addressLine2,
        city: formValue.city,
        state: formValue.state,
        country: formValue.country,
        zipCode: formValue.zipCode
      }
    };

    // Simulate API call
    setTimeout(() => {
      this.currentUser = updatedUser;
      this.loading = false;
      this.successMessage = 'Profile updated successfully!';
      this.isEditing = false;
      this.profileForm.disable();

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 1000);
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.passwordForm.reset();
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      email: this.currentUser?.email || '',
      oldPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.usersService.resetPassword(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = response.message || 'Password changed successfully!';
          this.showPasswordSection = false;
          this.passwordForm.reset();

          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to change password.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }

  getRoleName(role: Role): string {
    return Role[role];
  }

  getInitials(): string {
    if (this.currentUser?.fullName) {
      const names = this.currentUser.fullName.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return names[0][0];
    }
    return 'U';
  }
}
