import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./shared/features/home/home.routes').then((m) => m.HOME_ROUTES),
  },

  {
    path: 'auth',
    loadChildren: () => import('./shared/features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: '**',
    loadChildren: () =>
      import('./shared/features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES),
  },
];
