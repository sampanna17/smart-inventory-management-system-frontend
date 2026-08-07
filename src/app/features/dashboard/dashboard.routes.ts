import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/guards/role.guard';
import { Role } from '../../core/auth/enums/role.enum';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN, Role.STAFF] },
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN, Role.STAFF] },
    loadComponent: () =>
      import('../users/pages/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent
      ),
  },
  {
    path: 'products',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN, Role.STAFF] },
    loadChildren: () =>
      import('../products/products.routes').then(
        (m) => m.PRODUCTS_ROUTES
      ),
  },
  {
    path: 'categories',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN, Role.STAFF] },
    loadChildren: () =>
      import('../categories/categories.routes').then(
        (m) => m.CATEGORIES_ROUTES
      ),
  },
  {
    path: 'units',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN, Role.STAFF] },
    loadChildren: () =>
      import('../units/units.routes').then(
        (m) => m.UNITS_ROUTES
      ),
  },
  {
    path: 'suppliers',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN, Role.STAFF] },
    loadChildren: () =>
      import('../suppliers/suppliers.routes').then(
        (m) => m.SUPPLIERS_ROUTES
      ),
  },
  {
    path: 'customers',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN, Role.STAFF] },
    loadChildren: () =>
      import('../customers/customers.routes').then(
        (m) => m.CUSTOMERS_ROUTES
      ),
  },
  {
    path: 'purchases',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN, Role.STAFF] },
    loadChildren: () =>
      import('../purchases/purchases.routes').then(
        (m) => m.PURCHASES_ROUTES
      ),
  },
  {
    path: 'users',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () =>
      import('../users/users.routes').then(
        (m) => m.USERS_ROUTES
      ),
  },
];
