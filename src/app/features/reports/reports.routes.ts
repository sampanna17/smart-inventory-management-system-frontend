import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/guards/role.guard';
import { Role } from '../../core/auth/enums/role.enum';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN, Role.STAFF] },
    loadComponent: () =>
      import('./pages/reports-dashboard/reports-dashboard.component').then(
        (m) => m.ReportsDashboardComponent
      ),
  },
];
