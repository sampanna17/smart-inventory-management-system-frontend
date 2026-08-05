import { inject, PLATFORM_ID } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
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

  const currentUser = authService.currentUser();
  const requiredRoles = route.data['roles'] as Array<string>;

  if (!currentUser || !currentUser.role) {
    toastr.error('Unauthorized access. Role information missing.');
    return router.createUrlTree(['/auth/login']);
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(currentUser.role);
    if (!hasRole) {
      toastr.warning('You do not have permission to access this page.');
      // Redirect to a safe page (e.g., dashboard root)
      return router.createUrlTree(['/dashboard']);
    }
  }

  return true;
};
