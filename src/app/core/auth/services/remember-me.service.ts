import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RememberMeService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'sims_remembered_email';

  /**
   * Retrieves the stored email if Remember Me was previously enabled.
   * Returns null if running in SSR, if no email is saved, or upon storage error.
   */
  getRememberedEmail(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const email = localStorage.getItem(this.STORAGE_KEY);
      return email ? email.trim() : null;
    } catch {
      return null;
    }
  }

  /**
   * Persists the user's email address in local storage.
   *
   * SECURITY NOTICE:
   * Only the plain email identifier is stored. Passwords, JWTs, access tokens,
   * and authentication credentials MUST NEVER be passed to or stored by this service.
   */
  saveRememberedEmail(email: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const trimmed = email ? email.trim() : '';
      if (trimmed) {
        localStorage.setItem(this.STORAGE_KEY, trimmed);
      } else {
        this.clearRememberedEmail();
      }
    } catch {
      // Gracefully handle storage quota or private browsing exceptions
    }
  }

  /**
   * Removes the remembered email address from local storage.
   */
  clearRememberedEmail(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // Gracefully handle storage exceptions
    }
  }
}
