import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  
  {
    path: 'dashboard',
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },

  {
    path: '**',
    loadChildren: () =>
      import('./features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES),
  },
];
