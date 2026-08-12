import { Routes } from '@angular/router';

export const STOCK_MOVEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/stock-movement-list/stock-movement-list.component').then(
        (m) => m.StockMovementListComponent
      ),
  },
];
