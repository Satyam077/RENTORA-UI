import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { User, UserCreateRequest, UserUpdateRequest, Address } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.enum';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admins.component.html',
  styleUrl: './admins.component.css'
})
export class AdminsComponent implements OnInit {
  Role = Role;
  userForm: FormGroup;
  isEditMode = false;
  editingUserId: string | null = null;
  roles = Object.values(Role).filter(value => typeof value === 'number') as number[];
  roleLabels: { [key: number]: string } = {
    [Role.SuperAdmin]: 'Super Admin',
    [Role.Admin]: 'Admin',
    [Role.Landlords]: 'Landlord',
    [Role.Tenants]: 'Tenant',
    [Role.Agents]: 'Agent'
  };
  genderOptions = ['Male', 'Female', 'Other'];
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
  }

  createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      gender: [''],
      dateOfBirth: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      profileImageUrl: [''],
      role: [Role.Tenants, [Validators.required]],
      tenantId: [''],
      ownerId: [''],
      // Address fields
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: [''],
      isActive: [true]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  getRoleLabel(role: number): string {
    return this.roleLabels[role] || 'Unknown';
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.userForm.value;

    if (this.isEditMode && this.editingUserId) {
      this.updateUser(formValue);
    } else {
      this.createUser(formValue);
    }
  }

  createUser(formValue: any): void {
    const address: Address = {
      addressLine1: formValue.addressLine1,
      addressLine2: formValue.addressLine2,
      city: formValue.city,
      state: formValue.state,
      country: formValue.country,
      zipCode: formValue.zipCode
    };

    const userRequest: UserCreateRequest = {
      fullName: formValue.fullName,
      gender: formValue.gender || undefined,
      dateOfBirth: formValue.dateOfBirth || undefined,
      email: formValue.email,
      mobile: formValue.mobile,
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
      profileImageUrl: formValue.profileImageUrl || undefined,
      address: Object.values(address).some(v => v) ? address : undefined,
      role: Number(formValue.role),
      tenantId: formValue.tenantId || undefined,
      ownerId: formValue.ownerId || undefined
    };

    this.usersService.createUser(userRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || 'User created successfully!';
          this.resetForm();
        } else {
          this.errorMessage = response.message || 'Failed to create user';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || error.message || 'Failed to create user';
        this.loading = false;
      }
    });
  }

  updateUser(formValue: any): void {
    if (!this.editingUserId) return;

    const address: Address = {
      addressLine1: formValue.addressLine1,
      addressLine2: formValue.addressLine2,
      city: formValue.city,
      state: formValue.state,
      country: formValue.country,
      zipCode: formValue.zipCode
    };

    const userRequest: UserUpdateRequest = {
      id: this.editingUserId,
      fullName: formValue.fullName,
      gender: formValue.gender || undefined,
      dateOfBirth: formValue.dateOfBirth || undefined,
      email: formValue.email,
      mobile: formValue.mobile,
      profileImageUrl: formValue.profileImageUrl || undefined,
      address: Object.values(address).some(v => v) ? address : undefined,
      role: formValue.role,
      tenantId: formValue.tenantId || undefined,
      ownerId: formValue.ownerId || undefined,
      isActive: formValue.isActive
    };

    this.usersService.updateUser(userRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message || 'User updated successfully!';
          this.resetForm();
        } else {
          this.errorMessage = response.message || 'Failed to update user';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || error.message || 'Failed to update user';
        this.loading = false;
      }
    });
  }

  loadUserForEdit(user: User): void {
    this.isEditMode = true;
    this.editingUserId = user.id || null;

    this.userForm.patchValue({
      fullName: user.fullName,
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      email: user.email,
      mobile: user.mobile,
      profileImageUrl: user.profileImageUrl || '',
      role: user.role,
      tenantId: user.tenantId || '',
      ownerId: user.ownerId || '',
      addressLine1: user.address?.addressLine1 || '',
      addressLine2: user.address?.addressLine2 || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      country: user.address?.country || '',
      zipCode: user.address?.zipCode || '',
      isActive: user.isActive !== undefined ? user.isActive : true
    });

    // Remove password validators in edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
  }

  resetForm(): void {
    this.userForm.reset({
      role: Role.Tenants,
      isActive: true
    });
    this.isEditMode = false;
    this.editingUserId = null;

    // Re-add password validators
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email address';
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(controlName)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `${this.getFieldLabel(controlName)} must not exceed ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      fullName: 'Full Name',
      email: 'Email',
      mobile: 'Mobile',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      role: 'Role'
    };
    return labels[controlName] || controlName;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
