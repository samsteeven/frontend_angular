import { Routes } from '@angular/router';
import { LandingPageComponent } from '@components/landing-page/landing-page.component';
import { LoginComponent } from '@components/auth/login/login.component';
import { RegisterComponent } from '@components/auth/register/register.component';
import { RoleSelectComponent } from '@components/auth/role-select/role-select.component';
import { ForgotPasswordComponent } from '@components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '@components/auth/reset-password/reset-password.component';

// Layouts
import { AdminLayoutComponent } from '@components/shared/layouts/admin-layout.component';
import { ClientLayoutComponent } from '@components/shared/layouts/client.layout.component';
import { CollecteurLayoutComponent } from '@components/shared/layouts/collecteur.component';

// Admin Components
import { AdminDashboardComponent } from '@components/admin/dashboard/admin-dashboard.component';
import { UsersListComponent } from '@components/admin/users-list/users-list';
import { CollecteursListComponent } from '@components/admin/collecteurs/collecteurs-list.component';
import { ClientsListComponent } from '@components/admin/clients/clients-list.component';

// Profile Component
import { ProfileComponent } from '@components/profile/profile';

// Guards
import { authGuard, adminGuard, clientGuard, collecteurGuard } from '@guards';

export const routes: Routes = [
  // Routes publiques
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register/select', component: RoleSelectComponent },
  { path: 'register/:role', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Routes ADMIN
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'users', component: UsersListComponent },
      { path: 'collecteurs', component: CollecteursListComponent },
      { path: 'clients', component: ClientsListComponent }
    ]
  },

  // Routes CLIENT
  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [authGuard, clientGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/client/dashboard/client-dashboard.component')
          .then(m => m.ClientDashboardComponent)
      },
      { path: 'profile', component: ProfileComponent }
    ]
  },

  // Routes COLLECTEUR
  {
    path: 'collecteur',
    component: CollecteurLayoutComponent,
    canActivate: [authGuard, collecteurGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/collecteur/dashboard/collecteur-dashboard.component')
          .then(m => m.CollecteurDashboardComponent)
      },
      { path: 'profile', component: ProfileComponent }
    ]
  },

  // Route profile globale
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },

  // Redirect
  { path: 'register', redirectTo: 'register/select', pathMatch: 'full' },

  // 404
  { path: '**', redirectTo: '', pathMatch: 'full' }
];