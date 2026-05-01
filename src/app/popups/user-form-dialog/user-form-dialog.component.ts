import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatDialogRef,
    MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import {
    User,
    UserCreateRequest,
    UserUpdateRequest,
    Address,
} from '../../core/models/user.model';
import { Role } from '../../core/models/role.enum';
import { UsersService } from '../../core/services/users.service';
import { environment } from '../../../environments/environment';

export interface UserFormDialogData {
    mode: 'add' | 'edit';
    user?: User;
    role?: Role; // Pre-selected role if any
    roles?: number[]; // Allowed roles to select from
}

@Component({
    selector: 'app-user-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatProgressBarModule,
    ],
    templateUrl: './user-form-dialog.component.html',
    styleUrls: ['./user-form-dialog.component.css'],
})
export class UserFormDialogComponent implements OnInit {
    userForm: FormGroup;
    isEditMode = false;
    imagePreview: string | null = null;
    selectedFile: File | null = null;
    isUploadingImage = false;
    errorMessage = '';
    private apiBaseUrl = `${environment.apiUrl}`;

    genderOptions = ['Male', 'Female', 'Other'];
    Role = Role;

    availableRoles: { value: number; label: string }[] = [];
    roleLabels: { [key: number]: string } = {
        [Role.SuperAdmin]: 'Super Admin',
        [Role.Admin]: 'Admin',
        [Role.Landlords]: 'Landlord',
        [Role.Tenants]: 'Tenant',
        [Role.Agents]: 'Agent',
    };

    constructor(
        private fb: FormBuilder,
        private usersService: UsersService,
        public dialogRef: MatDialogRef<UserFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UserFormDialogData
    ) {
        this.isEditMode = data.mode === 'edit';
        this.userForm = this.createForm();
        this.initializeRoles();
    }

    ngOnInit(): void {
        if (this.isEditMode && this.data.user) {
            this.loadUserForEdit(this.data.user);
        } else if (this.data.role !== undefined) {
            this.userForm.patchValue({ role: this.data.role });
        }
    }

    initializeRoles() {
        let rolesToShow = this.data.roles || Object.values(Role).filter((v) => typeof v === 'number') as number[];
        this.availableRoles = rolesToShow.map(r => ({
            value: r,
            label: this.roleLabels[r] || 'Unknown'
        }));
    }

    createForm(): FormGroup {
        const form = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            gender: [''],
            dateOfBirth: [''],
            email: ['', [Validators.required, Validators.email]],
            mobile: ['', [Validators.required]],
            // Password fields only required for 'add' mode, handled by validator or dynamically
            password: [''],
            confirmPassword: [''],
            profileImageUrl: [''],
            role: [Role.Tenants, [Validators.required]],
            tenantId: [''],
            ownerId: [''],
            // Address
            addressLine1: [''],
            addressLine2: [''],
            city: [''],
            state: [''],
            country: [''],
            zipCode: [''],
            isActive: [true],
        }, { validators: this.passwordMatchValidator });

        if (!this.isEditMode) {
            form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            form.get('confirmPassword')?.setValidators([Validators.required]);
        }

        return form;
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');
        if (!password || !confirmPassword) return null;
        if (password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }
        return null;
    }

    loadUserForEdit(user: User): void {
        this.userForm.patchValue({
            fullName: user.fullName,
            gender: user.gender || '',
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : '',
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
            isActive: user.isActive !== undefined ? user.isActive : true,
        });

        if (user.profileImageUrl) {
            this.imagePreview = this.getFullUrl(user.profileImageUrl);
        }
    }

    onImageFileSelected(event: any): void {
        const file = event.target.files[0];
        if (!file) return;

        // Validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.errorMessage = 'Invalid file type. Only images are allowed.';
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            this.errorMessage = 'File size exceeds 5MB limit.';
            return;
        }

        this.selectedFile = file;
        this.errorMessage = '';

        // Preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async onSave(): Promise<void> {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        this.errorMessage = '';
        const formValue = this.userForm.value;

        // Upload image if selected
        let finalImageUrl = formValue.profileImageUrl;

        if (this.selectedFile) {
            // If editing and user exists, we can upload immediately
            if (this.isEditMode && this.data.user?.id) {
                this.isUploadingImage = true;
                try {
                    const response = await this.usersService.uploadProfilePicture(this.data.user.id, this.selectedFile).toPromise();
                    if (response && response.success) {
                        finalImageUrl = response.imageUrl;
                    } else {
                        this.errorMessage = 'Failed to upload image: ' + (response?.message || 'Unknown error');
                        this.isUploadingImage = false;
                        return;
                    }
                } catch (error: any) {
                    this.errorMessage = 'Failed to upload image: ' + (error.error?.message || error.message);
                    this.isUploadingImage = false;
                    return;
                }
                this.isUploadingImage = false;
            } else {
                // For "Add" mode, we might need to handle image upload after creation or return the file to the parent component
                // But existing logic in AdminsComponent handles file upload after user creation if a file object is passed back.
                // Here, let's return the file in the dialog result so parent handles it?
                // Or better: Parent expects UserCreateRequest. 
                // We can return { userRequest: ..., file: File }
            }
        }

        const address: Address = {
            addressLine1: formValue.addressLine1,
            addressLine2: formValue.addressLine2,
            city: formValue.city,
            state: formValue.state,
            country: formValue.country,
            zipCode: formValue.zipCode,
        };
        // Filter out empty address fields
        const hasAddress = Object.values(address).some(v => !!v);

        let result: any;

        if (this.isEditMode && this.data.user?.id) {
            const updateRequest: UserUpdateRequest = {
                id: this.data.user.id,
                fullName: formValue.fullName,
                gender: formValue.gender || undefined,
                dateOfBirth: formValue.dateOfBirth || undefined,
                email: formValue.email,
                mobile: formValue.mobile,
                profileImageUrl: finalImageUrl || undefined,
                address: hasAddress ? address : undefined,
                role: formValue.role,
                tenantId: formValue.tenantId || undefined,
                ownerId: formValue.ownerId || undefined,
                isActive: formValue.isActive,
            };
            result = { request: updateRequest, file: this.selectedFile };
        } else {
            const createRequest: UserCreateRequest = {
                fullName: formValue.fullName,
                gender: formValue.gender || undefined,
                dateOfBirth: formValue.dateOfBirth || undefined,
                email: formValue.email,
                mobile: formValue.mobile,
                password: formValue.password,
                confirmPassword: formValue.confirmPassword,
                profileImageUrl: finalImageUrl || undefined,
                address: hasAddress ? address : undefined,
                role: Number(formValue.role),
                tenantId: formValue.tenantId || undefined,
                ownerId: formValue.ownerId || undefined,
            };
            result = { request: createRequest, file: this.selectedFile };
        }

        this.dialogRef.close(result);
    }

    getFullUrl(url: string): string {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${this.apiBaseUrl}${url}`;
    }
}
