import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/guards/role.guard';
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'STAFF'] },
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'STAFF'] },
    loadComponent: () =>
      import('../users/pages/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent
      ),
  },
  {
    path: 'categories',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'STAFF'] },
    loadChildren: () =>
      import('../categories/categories.routes').then(
        (m) => m.CATEGORIES_ROUTES
      ),
  },
  {
    path: 'units',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'STAFF'] },
    loadChildren: () =>
      import('../units/units.routes').then(
        (m) => m.UNITS_ROUTES
      ),
  },
];
