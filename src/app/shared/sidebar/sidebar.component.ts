import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Role } from '../../core/models/role.enum';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
  roles?: Role[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  collapsed: boolean = false;
  logoPath: string = 'assets/Images/appicon.png';
  private subscription?: Subscription;
  private routerSubscription?: Subscription;
  menuItems: MenuItem[] = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/dashboard',
      roles: [Role.Landlords, Role.Manager],
    },

    // SuperAdmin only
    {
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/super-admin-dashboard',
      roles: [Role.SuperAdmin, Role.Admin],
    },

    // SuperAdmin + Admin
    {
      icon: 'admins',
      label: 'Admins',
      route: '/admins',
      roles: [Role.SuperAdmin, Role.Admin],
    },
    {
      icon: 'landlord',
      label: 'Landlord',
      route: '/landlord',
      roles: [Role.SuperAdmin, Role.Admin],
    },
    { icon: 'tenants', label: 'Tenants', route: '/tenants', roles: [Role.Landlords] },
    { icon: 'properties', label: 'Properties', route: '/property', roles: [Role.Landlords] },
    { icon: 'units', label: 'Units', route: '/units', roles: [Role.Landlords] },
    { icon: 'agreements', label: 'Agreements', route: '/agreements', roles: [Role.Landlords] },
    { icon: 'invoices', label: 'Invoices', route: '/invoices', roles: [Role.Landlords] },
    { icon: 'payments', label: 'Payments', route: '/payments', roles: [Role.Landlords] },
    { icon: 'maintenance', label: 'Maintenance', route: '/maintenance', roles: [Role.Landlords] },
    { icon: 'reports', label: 'Reports', route: '/reports' },
    { icon: 'settings', label: 'Settings', route: '/settings' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    const json = sessionStorage.getItem('currentUser');
    if (!json) {
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = JSON.parse(json);
    const role = Number(currentUser.user?.role) as Role;

    this.menuItems = this.menuItems.filter(
      (item) => !item.roles || item.roles.includes(role)
    );

    this.setActiveMenuItem();

    this.subscription = this.sidebarService.collapsed$.subscribe(
      (collapsed) => (this.collapsed = collapsed)
    );

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.setActiveMenuItem());
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  setActiveMenuItem(): void {
    const currentRoute = this.router.url;
    this.menuItems.forEach((item) => {
      item.active = currentRoute.includes(item.route);
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.setActiveMenuItem();
  }


  getIconPath(icon: string): string {
    const icons: { [key: string]: string } = {
      dashboard:
        'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
      properties:
        'M3 21V3h8v4h10v14h-6v-6h-4v6H3zm2-2h4v-4h2v4h2V9h-8v10zm10 0h4V9h-4v10z',
      units:
        'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
      tenants:
        'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      agreements:
        'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
      invoices:
        'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
      payments:
        'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
      maintenance:
        'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
      reports:
        'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
      settings:
        'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
      landlord:
        'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      admins:
        'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    };
    return icons[icon] || '';
  }
}
