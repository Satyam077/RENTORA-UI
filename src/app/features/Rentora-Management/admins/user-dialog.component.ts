import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserCreateRequest, UserUpdateRequest, Address } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.enum';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.css'
})
export class UserDialogComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<UserCreateRequest | UserUpdateRequest>();
  @Output() onFileSelectedEvent = new EventEmitter<{ file: File, userId?: string }>();

  userForm: FormGroup;
  isEditMode = false;
  roles = Object.values(Role).filter(value => typeof value === 'number') as number[];
  roleLabels: { [key: number]: string } = {
    [Role.SuperAdmin]: 'Super Admin',
    [Role.Admin]: 'Admin',
    [Role.Landlords]: 'Landlord',
    [Role.Tenants]: 'Tenant',
    [Role.Agents]: 'Agent'
  };
  genderOptions = ['Male', 'Female', 'Other'];
  Role = Role;

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadingImage = false;
  apiBaseUrl = 'https://localhost:7197';

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.user) {
      this.loadUserForEdit(this.user);
      if (this.user.profileImageUrl) {
        this.imagePreview = this.user.profileImageUrl.startsWith('http')
          ? this.user.profileImageUrl
          : `${this.apiBaseUrl}${this.user.profileImageUrl}`;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.loadUserForEdit(this.user);
      if (this.user.profileImageUrl) {
        this.imagePreview = this.user.profileImageUrl.startsWith('http')
          ? this.user.profileImageUrl
          : `${this.apiBaseUrl}${this.user.profileImageUrl}`;
      } else {
        this.imagePreview = null;
      }
    } else if (changes['user'] && !this.user) {
      this.isEditMode = false;
      this.userForm.reset({
        role: Role.Tenants,
        isActive: true
      });
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.get('confirmPassword')?.updateValueAndValidity();
      this.imagePreview = null;
      this.selectedFile = null;
    }
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

  loadUserForEdit(user: User): void {
    this.isEditMode = true;
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

    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
  }


  close(): void {
    this.onClose.emit();
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
errorMessage: string = '';
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Invalid file type. Only images are allowed.';
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size exceeds 5MB limit.';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImage(userId?: string): Promise<string | null> {
    if (!this.selectedFile) {
      return null;
    }
    const targetUserId = userId || this.user?.id;
    if (!targetUserId) {
      return null;
    }

    this.uploadingImage = true;
    this.errorMessage = '';

    try {
      const response = await this.usersService.uploadProfilePicture(targetUserId, this.selectedFile).toPromise();
      if (response && response.success) {
        this.uploadingImage = false;
        return response.imageUrl;
      } else {
        this.errorMessage = response?.message || 'Failed to upload image';
        this.uploadingImage = false;
        return null;
      }
    } catch (error: any) {
      this.errorMessage = error.error?.message || error.message || 'Failed to upload image';
      this.uploadingImage = false;
      return null;
    }
  }

  onSubmit(): void {
    // Handle async upload in the save handler
    this.handleSubmit();
  }

  async handleSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    // Upload image first if a new file is selected and user exists
    let imageUrl = this.userForm.get('profileImageUrl')?.value;
    if (this.selectedFile) {
      if (this.user?.id) {
        // User exists, upload immediately
        const uploadedUrl = await this.uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          this.userForm.patchValue({ profileImageUrl: imageUrl });
        } else {
          return; // Don't proceed if upload failed
        }
      } else {
        // New user - will upload after creation, emit file for parent to handle
        this.onFileSelectedEvent.emit({ file: this.selectedFile });
      }
    }

    const formValue = this.userForm.value;

    if (this.isEditMode && this.user?.id) {
      const address: Address = {
        addressLine1: formValue.addressLine1,
        addressLine2: formValue.addressLine2,
        city: formValue.city,
        state: formValue.state,
        country: formValue.country,
        zipCode: formValue.zipCode
      };

      const userRequest: UserUpdateRequest = {
        id: this.user.id,
        fullName: formValue.fullName,
        gender: formValue.gender || undefined,
        dateOfBirth: formValue.dateOfBirth || undefined,
        email: formValue.email,
        mobile: formValue.mobile,
        profileImageUrl: imageUrl || undefined,
        address: Object.values(address).some(v => v) ? address : undefined,
        role: formValue.role,
        tenantId: formValue.tenantId || undefined,
        ownerId: formValue.ownerId || undefined,
        isActive: formValue.isActive
      };
      this.onSave.emit(userRequest);
    } else {
      // For new users, save the URL if provided (image will be uploaded after user creation)
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
        profileImageUrl: imageUrl || undefined,
        address: Object.values(address).some(v => v) ? address : undefined,
        role: Number(formValue.role),
        tenantId: formValue.tenantId || undefined,
        ownerId: formValue.ownerId || undefined
      };
      this.onSave.emit(userRequest);
    }
  }
}

  //async handleSubmit(): Promise<void> {

