import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../core/services/sidebar.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css'
})
export class TopNavComponent implements OnInit {
  isProfileDropdownOpen = false;
  currentUser: any = null;
 private apiBaseUrl = `${environment.apiUrl}`;
  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.auth.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  getProfileImageUrl(): string {
    if (!this.currentUser?.user?.profileImageUrl) {
      return '';
    }
    const url = this.currentUser.user.profileImageUrl;
    if (url.startsWith('http')) {
      return url;
    }
    const serverUrl = this.apiBaseUrl.endsWith('/api') ? this.apiBaseUrl.substring(0, this.apiBaseUrl.length - 4) : this.apiBaseUrl;
    return `${serverUrl}${url}`;
  }

  getUserInitials(): string {
    if (!this.currentUser?.user?.fullName) {
      return '?';
    }
    const names = this.currentUser.user.fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return this.currentUser.user.fullName.substring(0, 2).toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeProfileDropdown();
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
    this.closeProfileDropdown();
  }

  logout(): void {
    console.log('Logout');
    this.auth.logout();
    this.router.navigate(['/login']);
    this.closeProfileDropdown();
  }
}

