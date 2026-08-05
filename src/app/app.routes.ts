import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { AuthService } from './core/auth/services/auth.service';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const authService = inject(AuthService);
      return authService.isAuthenticated() ? '/dashboard' : '/home';
    }
  },

  {
    path: 'home',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },

  {
    path: '**',
    loadChildren: () =>
      import('./features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES),
  },
];
