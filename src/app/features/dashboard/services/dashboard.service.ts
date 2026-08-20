import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../core/models/api-response.model';
import { DASHBOARD_API } from '../constants/dashboard.api';
import { AdminDashboardResponse, StaffDashboardResponse } from '../models/dashboard.model';
import { Role } from '../../../core/auth/enums/role.enum';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // Reactive State Signals
  adminData = signal<AdminDashboardResponse | null>(null);
  staffData = signal<StaffDashboardResponse | null>(null);
  isLoading = signal<boolean>(false);
  isRefreshing = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  lastUpdated = signal<Date | null>(null);

  /**
   * Fetch Admin Dashboard Data from Backend
   */
  getAdminDashboard(): Observable<ApiResponse<AdminDashboardResponse>> {
    return this.http.get<ApiResponse<AdminDashboardResponse>>(DASHBOARD_API.ADMIN);
  }

  /**
   * Fetch Staff Dashboard Data from Backend
   */
  getStaffDashboard(): Observable<ApiResponse<StaffDashboardResponse>> {
    return this.http.get<ApiResponse<StaffDashboardResponse>>(DASHBOARD_API.STAFF);
  }

  /**
   * Load Admin Dashboard and update signal state
   */
  loadAdminDashboard(isSilentRefresh: boolean = false): void {
    if (isSilentRefresh) {
      this.isRefreshing.set(true);
    } else {
      this.isLoading.set(true);
    }
    this.hasError.set(false);
    this.errorMessage.set('');

    this.getAdminDashboard()
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.adminData.set(response.data);
            this.lastUpdated.set(new Date());
            if (isSilentRefresh) {
              this.toastr.success('Dashboard metrics refreshed');
            }
          }
        }),
        catchError((error) => {
          this.hasError.set(true);
          const message = error?.error?.message || 'Failed to load admin dashboard data.';
          this.errorMessage.set(message);
          this.toastr.error(message);
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.isRefreshing.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Load Staff Dashboard and update signal state
   */
  loadStaffDashboard(isSilentRefresh: boolean = false): void {
    if (isSilentRefresh) {
      this.isRefreshing.set(true);
    } else {
      this.isLoading.set(true);
    }
    this.hasError.set(false);
    this.errorMessage.set('');

    this.getStaffDashboard()
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.staffData.set(response.data);
            this.lastUpdated.set(new Date());
            if (isSilentRefresh) {
              this.toastr.success('Dashboard metrics refreshed');
            }
          }
        }),
        catchError((error) => {
          this.hasError.set(true);
          const message = error?.error?.message || 'Failed to load staff dashboard data.';
          this.errorMessage.set(message);
          this.toastr.error(message);
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.isRefreshing.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Unified refresh based on role
   */
  refreshDashboard(role: Role | string | null): void {
    if (role === Role.ADMIN || role === 'ADMIN') {
      this.loadAdminDashboard(true);
    } else if (role === Role.STAFF || role === 'STAFF') {
      this.loadStaffDashboard(true);
    }
  }
}
