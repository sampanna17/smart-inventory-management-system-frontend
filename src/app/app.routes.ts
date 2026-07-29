import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/features/home/pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
