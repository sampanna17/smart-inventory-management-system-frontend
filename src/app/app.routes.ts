import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/features/home/pages/landing/landing.component').then(
        (m) => m.LandingComponent,
      ),
  },
  // Authentication
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./shared/features/auth/pages/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },
      {
        path: 'create-admin',
        loadComponent: () =>
          import('./shared/features/auth/pages/create-admin/create-admin.component').then(
            (m) => m.CreateAdminComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import("./shared/features/not-found/ page-not-found/page-not-found.component").then(
        (m) => m.PageNotFoundComponent,
      ),
  },
];
