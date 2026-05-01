import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UsersService } from '../../../core/services/users.service';
import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
} from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.enum';
import { environment } from '../../../../environments/environment';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { UserFormDialogComponent, UserFormDialogData } from '../../../popups/user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-landlords',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    SpinnerComponent
  ],
  templateUrl: './landlords.component.html',
  styleUrl: './landlords.component.css'
})
export class LandlordsComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  isLoading = false;
  currentUserId: string = '';

  // Table
  displayedColumns: string[] = ['fullName', 'email', 'mobile', 'role', 'status', 'actions'];
  dataSource: MatTableDataSource<User>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  Role = Role;
  roleLabels: { [key: number]: string } = {
    [Role.SuperAdmin]: 'Super Admin',
    [Role.Admin]: 'Admin',
    [Role.Landlords]: 'Landlord',
    [Role.Tenants]: 'Tenant',
    [Role.Agents]: 'Agent',
  };

  private apiBaseUrl = `${environment.apiUrl}`;

  constructor(
    private usersService: UsersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource(this.users);
  }

  ngOnInit(): void {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentUserId = user.user?.id || '';
    }
    this.setUpFilterPredicate();
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setUpFilterPredicate() {
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const search = filter.trim().toLowerCase();
      return (
        data.fullName?.toLowerCase().includes(search) ||
        data.email?.toLowerCase().includes(search) ||
        data.mobile?.toLowerCase().includes(search) ||
        this.getRoleLabel(data.role)?.toLowerCase().includes(search) ||
        false
      );
    };
  }

  loadUsers(): void {
    this.isLoading = true;
    this.usersService.getAllUsers().subscribe({
      next: (res: any) => {
        let allUsers: User[] = [];
        if (Array.isArray(res)) {
          allUsers = res;
        } else if (res.users && Array.isArray(res.users)) {
          allUsers = res.users;
        } else if (res.data && Array.isArray(res.data)) {
          allUsers = res.data;
        }

        // Filter for Landlords
        this.users = allUsers.filter(u => u.role === Role.Landlords);
        this.dataSource.data = this.users;
        this.isLoading = false;

        if (this.paginator) this.dataSource.paginator = this.paginator;
        if (this.sort) this.dataSource.sort = this.sort;
      },
      error: (err) => {
        this.showSnackBar('Failed to load users: ' + (err.error?.message || err.message), 'error');
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddDialog(): void {
    const dialogData: UserFormDialogData = {
      mode: 'add',
      role: Role.Landlords, // Default to Landlord
      roles: [Role.Landlords] // Only Landlords
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleCreateUser(result.request, result.file);
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogData: UserFormDialogData = {
      mode: 'edit',
      user: user,
      roles: [Role.Landlords]
    };

    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleUpdateUser(result.request, result.file);
      }
    });
  }

  // --- API Calls ---

  handleCreateUser(request: UserCreateRequest, file?: File) {
    this.isLoading = true;
    this.usersService.createUser(request).subscribe({
      next: async (res: any) => {
        if (res.success) {
          const newUserId = res.user?.id || res.id;
          let message = 'User created successfully!';

          if (file && newUserId) {
            try {
              await this.usersService.uploadProfilePicture(newUserId, file).toPromise();
            } catch (e) {
              message += ' (Image upload failed)';
            }
          }
          this.showSnackBar(message);
          this.loadUsers();
        } else {
          this.showSnackBar(res.message || 'Failed to create user', 'error');
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.showSnackBar(err.error?.message || 'Error creating user', 'error');
        this.isLoading = false;
      }
    });
  }

  handleUpdateUser(request: UserUpdateRequest, file?: File) {
    this.isLoading = true;
    this.usersService.updateUser(request).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showSnackBar('User updated successfully!');
          this.loadUsers();
        } else {
          this.showSnackBar(res.message || 'Failed to update user', 'error');
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.showSnackBar(err.error?.message || 'Error updating user', 'error');
        this.isLoading = false;
      }
    });
  }

  // --- Helpers ---

  getRoleLabel(role: number): string {
    return this.roleLabels[role] || 'Unknown';
  }

  getInitials(user: User): string {
    if (!user.fullName) return '?';
    const names = user.fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  }

  showSnackBar(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'error' ? 'snack-bar-error' : 'snack-bar-success',
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}

