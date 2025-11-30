import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../models/role.enum';

export const roleGuard = (allowedRoles: Role[]) => {
  return () => {
    const router = inject(Router);
    const json = localStorage.getItem('currentUser');
    if (!json) {
      router.navigate(['/login']);
      return false;
    }

    const currentUser = JSON.parse(json);

    // FIX: role is inside currentUser.user
    const role = Number(currentUser.user?.role) as Role;

    console.log('Role from localStorage:', role);
    if (!allowedRoles.includes(role)) {
      router.navigate([dashboardRoutes[role] ?? '/login']);
      return false;
    }

    return true;
  };
};

export const dashboardRoutes: Record<Role, string> = {
  [Role.SuperAdmin]: '/super-admin-dashboard',
  [Role.Admin]: '/admin/dashboard',
  [Role.Landlords]: '/dashboard',
  [Role.Tenants]: '/tenant-dashboard',
  [Role.Agents]: '/agent/dashboard',
};
