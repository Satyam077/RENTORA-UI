import { Routes } from '@angular/router';
import { HomeComponent } from './shared/home/home.component';
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
import { UnitsComponent } from './features/landlords/units/units.component';
import { TenantsComponent } from './features/landlords/tenants/tenants.component';
import { AgreementComponent } from './features/landlords/agreement/agreement.component';
import { MaintenanceComponent } from './features/landlords/maintenance/maintenance.component';
import { TenantMaintenanceComponent } from './features/tenants/tenant-maintenance/tenant-maintenance.component';
import { PrivacyPolicyComponent } from './shared/privacy-policy/privacy-policy.component';
import { LandingComponent } from './shared/landing/landing.component';
import { AboutUsComponent } from './shared/about-us/about-us.component';
import { TermsConditionsComponent } from './shared/terms-conditions/terms-conditions.component';
import { ContactUsComponent } from './shared/contact-us/contact-us.component';
import { FaqsComponent } from './shared/faqs/faqs.component';
import { BlogsComponent } from './shared/blogs/blogs.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'about-us', component: AboutUsComponent },
      { path: 'terms-conditions', component: TermsConditionsComponent },
      { path: 'contact-us', component: ContactUsComponent },
      { path: 'faqs', component: FaqsComponent },
      { path: 'blogs', component: BlogsComponent },
    ],
  },

  // Auth routes (outside landing layout)
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
      { path: 'units', component: UnitsComponent, canActivate: [authGuard] },
      {
        path: 'tenants',
        component: TenantsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'agreements',
        component: AgreementComponent,
        canActivate: [authGuard],
      },
      {
        path: 'maintenance',
        component: MaintenanceComponent,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'tenant-dashboard',
    component: TenantDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'tenant-maintenance',
    component: TenantMaintenanceComponent,
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: '' },
];
