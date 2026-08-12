import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { User, CreateAdminRequest } from '../../models/user.model';
import { Role } from '../enums/role.enum';
import { ApiResponse } from '../../models/api-response.model';
import { AUTH_API } from '../constants/auth.api';
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private toastr = inject(ToastrService);
  private expirationTimer: any;

  constructor() {
    const user = this.currentUser();
    if (user && user.token) {
      const decoded = this.decodeToken(user.token);
      if (decoded && decoded.exp) {
        this.autoLogout(decoded.exp * 1000);
      }
    }
  }

  // Use a signal to store the current user state
  currentUser = signal<User | null>(this.loadUserFromStorage());

  // Computed role state
  userRole = computed(() => this.currentUser()?.role || null);
  isAdmin = computed(() => this.currentUser()?.role === Role.ADMIN);

  /**
   * Checks if the currently authenticated user has the specified role(s).
   * Supports single Role/string or array of Roles/strings.
   */
  hasRole(requiredRoles: Role | Role[] | string | string[] | null | undefined): boolean {
    if (!requiredRoles) return false;
    const currentRole = this.currentUser()?.role;
    if (!currentRole) return false;

    if (Array.isArray(requiredRoles)) {
      return (requiredRoles as string[]).includes(currentRole);
    }
    return currentRole === requiredRoles;
  }

  private loadUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        try {
          return JSON.parse(userJson);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  createAdmin(userData: CreateAdminRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(AUTH_API.SIGNUP, userData);
  }


  login(credentials: { email: string; password: string }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(AUTH_API.LOGIN, credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  loginWithGoogle(idToken: string): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(AUTH_API.LOGIN_GOOGLE, { idToken }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  private handleAuthResponse(response: ApiResponse<User>): void {
    if (response.success && response.data) {
      const user: User = {
        userId: response.data.userId,
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token
      };
      this.currentUser.set(user);

      const decoded = this.decodeToken(user.token);
      if (decoded && decoded.exp) {
        this.autoLogout(decoded.exp * 1000);
      }

      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (user.token) {
          localStorage.setItem('token', user.token);
        }
      }
    }
  }

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(AUTH_API.FORGOT_PASSWORD, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(AUTH_API.RESET_PASSWORD, { token, newPassword });
  }

  activateAccount(token: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(AUTH_API.ACTIVATE, { token, newPassword });
  }

  resendActivationLink(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(AUTH_API.RESEND_ACTIVATE, { email });
  }

  private decodeToken(token: string | undefined): any {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      // atob is available in browsers and Node.js >= 16
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const user = this.currentUser();
    if (!user || !user.token) {
      return false;
    }

    const decoded = this.decodeToken(user.token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    const expirationDate = decoded.exp * 1000;
    const now = new Date().getTime();

    if (now > expirationDate) {
      // Token is expired, trigger logout
      this.logout(true);
      return false;
    }

    return true;
  }

  private autoLogout(expirationDate: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.clearAuthTimer();
    const expiresIn = expirationDate - new Date().getTime();
    
    if (expiresIn > 0) {
      this.expirationTimer = setTimeout(() => {
        this.logout(true);
      }, expiresIn);
    } else {
      this.logout(true);
    }
  }

  private clearAuthTimer() {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
  }

  logout(sessionExpired = false): void {
    this.clearAuthTimer();
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    
    if (sessionExpired) {
      this.toastr.error('Session expired. Please log in again.');
    } else {
      this.toastr.success('Logout successfully');
    }
    
    void this.router.navigate(['/auth/login']);
  }
}
