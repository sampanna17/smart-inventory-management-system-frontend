import { inject, PLATFORM_ID } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Role } from '../enums/role.enum';
import { ToastrService } from 'ngx-toastr';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const toastr = inject(ToastrService);

  // Defer to the client during SSR
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Ensure user is authenticated first
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const requiredRoles = route.data['roles'] as Role | Role[] | string | string[];

  if (requiredRoles) {
    const hasRole = authService.hasRole(requiredRoles);
    if (!hasRole) {
      toastr.warning('You do not have permission to access this page.');
      return router.createUrlTree(['/dashboard']);
    }
  }

  return true;
};
