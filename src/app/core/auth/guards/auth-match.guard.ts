import { inject, PLATFORM_ID } from '@angular/core';
import { type CanMatchFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authMatchGuard: CanMatchFn = (route, segments) => {
  const platformId = inject(PLATFORM_ID);
  
  // On the server, we cannot check localStorage, so we don't match the authenticated route.
  // This defers the decision to the browser, or falls back to the unauthenticated route.
  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
