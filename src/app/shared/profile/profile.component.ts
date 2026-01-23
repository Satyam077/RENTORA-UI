import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { User, Address } from '../../core/models/user.model';
import { Role } from '../../core/models/role.enum';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isEditing = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  private apiBaseUrl = `${environment.apiUrl}`;
  currentUser: User | null = null;
  profileImagePreview: string | null = null;
  selectedFile: File | null = null;
  showPasswordSection = false;
  passwordForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    let storedUser = this.authService.currentUserValue;

    if (!storedUser) {
      const sessionData = sessionStorage.getItem('currentUser');
      if (sessionData) {
        try {
          storedUser = JSON.parse(sessionData);
        } catch (e) {
        }
      }
    }

    if (!storedUser?.user?.id) {
      console.warn(
        'No valid user ID found. Attempting to load from session user info...',
      );

      if (storedUser?.user) {
        this.currentUser = {
          id: storedUser.user.id || '',
          fullName: storedUser.user.fullName || '',
          email: storedUser.user.email || '',
          mobile: storedUser.user.mobile || '',
          role: storedUser.user.role,
          isEmailVerified: storedUser.user.isEmailVerified || false,
          isMobileVerified: storedUser.user.isMobileVerified || false,
          gender: storedUser.user.gender || '',
          dateOfBirth: storedUser.user.dateOfBirth || '',
          profileImageUrl: storedUser.user.profileImageUrl || '',
          address: {
            addressLine1: storedUser.user.address?.addressLine1 || '',
            addressLine2: storedUser.user.address?.addressLine2 || '',
            city: storedUser.user.address?.city || '',
            state: storedUser.user.address?.state || '',
            country: storedUser.user.address?.country || '',
            zipCode: storedUser.user.address?.zipCode || '',
          },
        };

        this.profileImagePreview = this.currentUser.profileImageUrl
          ? `${this.apiBaseUrl}${this.currentUser.profileImageUrl}`
          : null;

        this.populateForm();
      }
      return;
    }

    this.usersService.getUserById(storedUser.user.id).subscribe({
      next: (response: any) => {
        const u = response.user || response;

        this.currentUser = {
          id: u.id || storedUser.user.id,
          fullName: u.fullName ?? storedUser.user.fullName ?? '',
          email: u.email ?? storedUser.user.email ?? '',
          mobile: u.mobile ?? storedUser.user.mobile ?? '',
          role: u.role ?? storedUser.user.role,
          isEmailVerified:
            u.isEmailVerified ?? storedUser.user.isEmailVerified ?? false,
          isMobileVerified:
            u.isMobileVerified ?? storedUser.user.isMobileVerified ?? false,
          gender: u.gender ?? storedUser.user.gender ?? '',
          dateOfBirth: u.dateOfBirth ?? storedUser.user.dateOfBirth ?? '',
          profileImageUrl:
            u.profileImageUrl ?? storedUser.user.profileImageUrl ?? '',

          address: {
            addressLine1:
              u.address?.addressLine1 ??
              storedUser.user.address?.addressLine1 ??
              '',
            addressLine2:
              u.address?.addressLine2 ??
              storedUser.user.address?.addressLine2 ??
              '',
            city: u.address?.city ?? storedUser.user.address?.city ?? '',
            state: u.address?.state ?? storedUser.user.address?.state ?? '',
            country:
              u.address?.country ?? storedUser.user.address?.country ?? '',
            zipCode:
              u.address?.zipCode ?? storedUser.user.address?.zipCode ?? '',
          },
        };

        this.profileImagePreview = this.currentUser.profileImageUrl
          ? `${this.apiBaseUrl}${this.currentUser.profileImageUrl}`
          : null;

        this.populateForm();
      },
      error: (err) => {
        if (storedUser?.user) {
          this.currentUser = {
            id: storedUser.user.id || '',
            fullName: storedUser.user.fullName || '',
            email: storedUser.user.email || '',
            mobile: storedUser.user.mobile || '',
            role: storedUser.user.role,
            isEmailVerified: storedUser.user.isEmailVerified || false,
            isMobileVerified: storedUser.user.isMobileVerified || false,
            gender: storedUser.user.gender || '',
            dateOfBirth: storedUser.user.dateOfBirth || '',
            profileImageUrl: storedUser.user.profileImageUrl || '',
            address: {
              addressLine1: storedUser.user.address?.addressLine1 || '',
              addressLine2: storedUser.user.address?.addressLine2 || '',
              city: storedUser.user.address?.city || '',
              state: storedUser.user.address?.state || '',
              country: storedUser.user.address?.country || '',
              zipCode: storedUser.user.address?.zipCode || '',
            },
          };

          this.profileImagePreview = this.currentUser.profileImageUrl
            ? `${this.apiBaseUrl}${this.currentUser.profileImageUrl}`
            : null;

          this.populateForm();
          this.errorMessage =
            'Could not load latest profile data. Showing cached data.';
        }
      },
    });
  }

  initializeForms(): void {
    this.profileForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: [
        '',
        [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)],
      ],
      gender: [''],
      dateOfBirth: [''],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: [''],
    });

    this.passwordForm = this.formBuilder.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );

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
        dateOfBirth: this.formatDateForInput(this.currentUser.dateOfBirth),
        addressLine1: this.currentUser.address?.addressLine1 || '',
        addressLine2: this.currentUser.address?.addressLine2 || '',
        city: this.currentUser.address?.city || '',
        state: this.currentUser.address?.state || '',
        country: this.currentUser.address?.country || '',
        zipCode: this.currentUser.address?.zipCode || '',
      });
    }
  }

  private formatDateForInput(dateValue: Date | string | undefined): string {
    if (!dateValue) return '';

    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';

      // Format as yyyy-MM-dd for HTML date input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
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
        console.log(
          'Selected file for profile picture:',
          this.profileImagePreview,
        );
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

    // Build update request with all required fields
    const updateRequest = {
      id: this.currentUser?.id,
      fullName: formValue.fullName,
      email: this.currentUser?.email, // Email is disabled but needed for API
      mobile: formValue.mobile,
      gender: formValue.gender || null,
      dateOfBirth: formValue.dateOfBirth || null,
      profileImageUrl: this.currentUser?.profileImageUrl,
      role: this.currentUser?.role,
      address: {
        addressLine1: formValue.addressLine1 || null,
        addressLine2: formValue.addressLine2 || null,
        city: formValue.city || null,
        state: formValue.state || null,
        country: formValue.country || null,
        zipCode: formValue.zipCode || null,
      },
    };

    console.log('Sending update request:', updateRequest);

    // Call API to update user
    this.usersService.updateUser(updateRequest as any).subscribe({
      next: (response: any) => {
        console.log('Profile update response:', response);
        // Update current user with the form values
        this.currentUser = {
          ...this.currentUser!,
          fullName: updateRequest.fullName,
          mobile: updateRequest.mobile,
          gender: updateRequest.gender || '',
          dateOfBirth: updateRequest.dateOfBirth || '',
          address: updateRequest.address as any,
        };
        this.loading = false;
        this.successMessage =
          response.message || 'Profile updated successfully!';
        this.isEditing = false;
        this.profileForm.disable();

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.loading = false;
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Failed to update profile. Please try again.';
        }
      },
    });
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
      confirmPassword: this.passwordForm.value.confirmPassword,
    };

    this.usersService.resetPassword(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage =
            response.message || 'Password changed successfully!';
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
      },
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
