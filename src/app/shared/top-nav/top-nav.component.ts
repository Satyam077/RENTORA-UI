import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css'
})
export class TopNavComponent implements OnInit {
  isProfileDropdownOpen = false;

  constructor(
    private router: Router,
    private sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
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
    this.closeProfileDropdown();
    // Add logout logic here
  }
}

