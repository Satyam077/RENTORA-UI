import { Routes } from '@angular/router';
import { LandingComponent } from './shared/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/landlords/dashboard/dashboard.component';
import { TenantDashboardComponent } from './features/tenant-dashboard/tenant-dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { ProfileComponent } from './shared/profile/profile.component';
import { SettingsComponent } from './features/settings/settings.component';
import { MainLayoutComponent } from './shared/main-layout/main-layout.component';
import { LandlordsComponent } from './features/Rentora-Management/landlords/landlords.component';
import { AdminsComponent } from './features/Rentora-Management/admins/admins.component';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/role.enum';
import { SuperAdminDashboardComponent } from './features/Rentora-Management/super-admin-dashboard/super-admin-dashboard.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { PropertyComponent } from './features/landlords/property/property.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [roleGuard([Role.Landlords, Role.Manager])],
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'landlord',
        component: LandlordsComponent,
        canActivate: [roleGuard([Role.SuperAdmin, Role.Admin])],
      },
      {
        path: 'admins',
        component: AdminsComponent,
        canActivate: [roleGuard([Role.SuperAdmin, Role.Admin])],
      },
      {
        path: 'super-admin-dashboard',
        component: SuperAdminDashboardComponent,
        canActivate: [roleGuard([Role.SuperAdmin, Role.Admin])],
      },
      {
        path: 'property',
        component: PropertyComponent,
        canActivate: [
          roleGuard([
            Role.SuperAdmin,
            Role.Admin,
            Role.Landlords,
            Role.Manager,
          ]),
        ],
      },
    ],
  },
  {
    path: 'tenant-dashboard',
    component: TenantDashboardComponent,
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: '' },
];
