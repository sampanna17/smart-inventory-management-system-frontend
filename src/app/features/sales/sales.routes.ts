import { Routes } from '@angular/router';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sale-list/sale-list.component').then(
        (m) => m.SaleListComponent
      ),
  },
];
