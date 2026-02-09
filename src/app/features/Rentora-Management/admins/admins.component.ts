import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
} from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.enum';
import { UserDialogComponent } from './user-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDialogComponent],
  templateUrl: './admins.component.html',
  styleUrl: './admins.component.css',
})
export class AdminsComponent implements OnInit {
  Role = Role;
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  showDialog: boolean = false;
  dialogUser: User | null = null;
  pendingImageFile: File | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  roleLabels: { [key: number]: string } = {
    [Role.SuperAdmin]: 'Super Admin',
    [Role.Admin]: 'Admin',
    [Role.Landlords]: 'Landlord',
    [Role.Tenants]: 'Tenant',
    [Role.Agents]: 'Agent',
  };
  private apiBaseUrl = `${environment.apiUrl}`;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getAllUsers().subscribe({
      next: (res) => {
        const payload: any = res;
        this.users = Array.isArray(payload) ? payload : payload?.users.filter((user: User) => user.role === Role.Admin || user.role === Role.SuperAdmin) || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || error.message || 'Failed to load users';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.mobile?.toLowerCase().includes(search) ||
          this.getRoleLabel(user.role)?.toLowerCase().includes(search) ||
          user.address?.city?.toLowerCase().includes(search) ||
          user.address?.state?.toLowerCase().includes(search),
      );
    }

    this.filteredUsers = filtered;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  getRoleLabel(role: number): string {
    return this.roleLabels[role] || 'Unknown';
  }

  getAddressString(user: User): string {
    if (!user.address) return '-';
    const parts = [
      user.address.addressLine1,
      user.address.city,
      user.address.state,
      user.address.country,
    ].filter((p) => p);
    return parts.length > 0 ? parts.join(', ') : '-';
  }

  getProfileImageUrl(user: User): string {
    if (!user.profileImageUrl) {
      return '';
    }
    if (user.profileImageUrl.startsWith('http')) {
      return user.profileImageUrl;
    }
    return `${this.apiBaseUrl}${user.profileImageUrl}`;
  }

  getInitials(user: User): string {
    if (!user.fullName) return '?';
    const names = user.fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  }

  openAddDialog(): void {
    this.dialogUser = null;
    this.showDialog = true;
  }

  openEditDialog(user: User): void {
    this.dialogUser = user;
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.dialogUser = null;
  }

  handleDialogSave(userRequest: UserCreateRequest | UserUpdateRequest): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if ('id' in userRequest) {
      // Update user
      this.usersService.updateUser(userRequest as UserUpdateRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage =
              response.message || 'User updated successfully!';
            this.loadUsers();
            setTimeout(() => this.closeDialog(), 1000);
          } else {
            this.errorMessage = response.message || 'Failed to update user';
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || error.message || 'Failed to update user';
          this.loading = false;
        },
      });
    } else {
      // Create user
      this.usersService.createUser(userRequest as UserCreateRequest).subscribe({
        next: async (response) => {
          if (response.success) {
            // If user was created and there's a pending image file, upload it
            const createdUserId = response.user?.id || (response as any).id;
            if (this.pendingImageFile && createdUserId) {
              try {
                const uploadResponse = await this.usersService
                  .uploadProfilePicture(createdUserId, this.pendingImageFile)
                  .toPromise();
                if (uploadResponse && uploadResponse.success) {
                  this.successMessage =
                    'User created and profile picture uploaded successfully!';
                } else {
                  this.successMessage =
                    response.message ||
                    'User created successfully! (Image upload failed)';
                }
              } catch (error: any) {
                this.successMessage =
                  response.message ||
                  'User created successfully! (Image upload failed)';
              }
              this.pendingImageFile = null;
            } else {
              this.successMessage =
                response.message || 'User created successfully!';
            }
            this.loadUsers();
            setTimeout(() => this.closeDialog(), 1000);
          } else {
            this.errorMessage = response.message || 'Failed to create user';
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || error.message || 'Failed to create user';
          this.loading = false;
        },
      });
    }
  }

  handleFileSelected(event: { file: File; userId?: string }): void {
    this.pendingImageFile = event.file;
  }

  getpaginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  Math = Math;
}
