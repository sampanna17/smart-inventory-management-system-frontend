import { Routes } from '@angular/router';

export const UNITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/unit-list/unit-list.component').then(
        (m) => m.UnitListComponent
      ),
  },
];
