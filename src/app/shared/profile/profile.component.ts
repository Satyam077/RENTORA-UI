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

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SpinnerComponent } from '../spinner/spinner.component';
import { PhoneMaskDirective } from '../../core/helpers/phone-mask.directive';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    SpinnerComponent,
    PhoneMaskDirective
],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isEditing = false;
  loading = false;
  isLoadingProfile = true;
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
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.initializeForms();
    this.loadUserProfile();
  }

  private getFullImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const serverUrl = this.apiBaseUrl.endsWith('/api') ? this.apiBaseUrl.substring(0, this.apiBaseUrl.length - 4) : this.apiBaseUrl;
    return `${serverUrl}${url}`;
  }

  loadUserProfile(): void {
    this.isLoadingProfile = true;
    let storedUser = this.authService.currentUserValue;

    if (!storedUser) {
      const sessionData = sessionStorage.getItem('currentUser');
      if (sessionData) {
        try {
          storedUser = JSON.parse(sessionData);
        } catch (e) { }
      }
    }

    if (!storedUser?.user?.id) {
      if (storedUser?.user) {
        this.currentUser = this.buildUserFromData(storedUser.user);
        this.profileImagePreview = this.currentUser.profileImageUrl
          ? this.getFullImageUrl(this.currentUser.profileImageUrl)
          : null;
        this.populateForm();
      }
      this.isLoadingProfile = false;
      return;
    }

    this.usersService.getUserById(storedUser.user.id).subscribe({
      next: (response: any) => {
        const u = response.user || response;
        this.currentUser = this.buildUserFromData(u, storedUser.user);
        this.profileImagePreview = this.currentUser.profileImageUrl
          ? this.getFullImageUrl(this.currentUser.profileImageUrl)
          : null;
        this.populateForm();
        this.isLoadingProfile = false;
      },
      error: (err) => {
        if (storedUser?.user) {
          this.currentUser = this.buildUserFromData(storedUser.user);
          this.profileImagePreview = this.currentUser.profileImageUrl
            ? this.getFullImageUrl(this.currentUser.profileImageUrl)
            : null;
          this.populateForm();
          this.showSnackBar('Showing cached profile data.', 'error');
        }
        this.isLoadingProfile = false;
      },
    });
  }

  private buildUserFromData(primary: any, fallback?: any): User {
    const fb = fallback || {};
    return {
      id: primary.id || fb.id || '',
      fullName: primary.fullName ?? fb.fullName ?? '',
      email: primary.email ?? fb.email ?? '',
      mobile: primary.mobile ?? fb.mobile ?? '',
      role: primary.role ?? fb.role,
      isEmailVerified: primary.isEmailVerified ?? fb.isEmailVerified ?? false,
      isMobileVerified: primary.isMobileVerified ?? fb.isMobileVerified ?? false,
      gender: primary.gender ?? fb.gender ?? '',
      dateOfBirth: primary.dateOfBirth ?? fb.dateOfBirth ?? '',
      profileImageUrl: primary.profileImageUrl ?? fb.profileImageUrl ?? '',
      address: {
        addressLine1: primary.address?.addressLine1 ?? fb.address?.addressLine1 ?? '',
        addressLine2: primary.address?.addressLine2 ?? fb.address?.addressLine2 ?? '',
        city: primary.address?.city ?? fb.address?.city ?? '',
        state: primary.address?.state ?? fb.address?.state ?? '',
        country: primary.address?.country ?? fb.address?.country ?? '',
        zipCode: primary.address?.zipCode ?? fb.address?.zipCode ?? '',
      },
    };
  }

  initializeForms(): void {
    this.profileForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,10}$')]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
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

    this.profileForm.disable();
  }

  populateForm(): void {
    if (this.currentUser) {
      const dobValue = this.currentUser.dateOfBirth
        ? new Date(this.currentUser.dateOfBirth)
        : null;

      this.profileForm.patchValue({
        fullName: this.currentUser.fullName,
        email: this.currentUser.email,
        mobile: this.currentUser.mobile,
        gender: this.currentUser.gender || '',
        dateOfBirth: dobValue && !isNaN(dobValue.getTime()) ? dobValue : null,
        addressLine1: this.currentUser.address?.addressLine1 || '',
        addressLine2: this.currentUser.address?.addressLine2 || '',
        city: this.currentUser.address?.city || '',
        state: this.currentUser.address?.state || '',
        country: this.currentUser.address?.country || '',
        zipCode: this.currentUser.address?.zipCode || '',
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
      this.profileForm.get('email')?.disable();
    } else {
      this.profileForm.disable();
      this.populateForm();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.profileForm.getRawValue();

    // Format date for API
    let dateOfBirth = formValue.dateOfBirth;
    if (dateOfBirth instanceof Date) {
      const y = dateOfBirth.getFullYear();
      const m = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
      const d = String(dateOfBirth.getDate()).padStart(2, '0');
      dateOfBirth = `${y}-${m}-${d}`;
    }

    const updateRequest = {
      id: this.currentUser?.id,
      fullName: formValue.fullName,
      email: this.currentUser?.email,
      mobile: formValue.mobile,
      gender: formValue.gender || null,
      dateOfBirth: dateOfBirth || null,
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

    if (this.selectedFile && this.currentUser?.id) {
      this.usersService.uploadProfilePicture(this.currentUser.id, this.selectedFile).subscribe({
        next: (uploadRes: any) => {
          if (uploadRes.success) {
            updateRequest.profileImageUrl = uploadRes.imageUrl;
            this.executeUserUpdate(updateRequest);
          } else {
            this.loading = false;
            this.showSnackBar('Failed to upload profile picture.', 'error');
          }
        },
        error: (err) => {
          this.loading = false;
          this.showSnackBar('Failed to upload profile picture.', 'error');
        }
      });
    } else {
      this.executeUserUpdate(updateRequest);
    }
  }

  private executeUserUpdate(updateRequest: any): void {
    this.usersService.updateUser(updateRequest as any).subscribe({
      next: (response: any) => {
        this.currentUser = {
          ...this.currentUser!,
          fullName: updateRequest.fullName,
          mobile: updateRequest.mobile,
          gender: updateRequest.gender || '',
          dateOfBirth: updateRequest.dateOfBirth || '',
          address: updateRequest.address as any,
          profileImageUrl: updateRequest.profileImageUrl,
        };

        this.authService.updateCurrentUser({
          fullName: this.currentUser.fullName,
          profileImageUrl: this.currentUser.profileImageUrl
        });

        this.loading = false;
        this.isEditing = false;
        this.profileForm.disable();
        this.showSnackBar(response.message || 'Profile updated successfully!');
      },
      error: (err) => {
        this.loading = false;
        this.showSnackBar(err.error?.message || 'Failed to update profile.', 'error');
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
    if (this.passwordForm.invalid) return;

    this.loading = true;
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
          this.showSnackBar(response.message || 'Password changed successfully!');
          this.showPasswordSection = false;
          this.passwordForm.reset();
        } else {
          this.showSnackBar(response.message || 'Failed to change password.', 'error');
        }
      },
      error: (err) => {
        this.loading = false;
        this.showSnackBar(err.error?.message || 'An unexpected error occurred.', 'error');
      },
    });
  }

  getRoleName(role: Role): string {
    return Role[role];
  }

  getInitials(): string {
    if (this.currentUser?.fullName) {
      const names = this.currentUser.fullName.split(' ');
      if (names.length >= 2) return names[0][0] + names[1][0];
      return names[0][0];
    }
    return 'U';
  }

  private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['snack-bar-error'] : ['snack-bar-success'],
    });
  }
}
