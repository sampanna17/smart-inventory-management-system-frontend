import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { UserProfile, UpdateProfileRequest, CreateStaffRequest, CreateStaffResponse } from '../models/user-profile.model';
import { USER_API } from '../constants/user.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State
  users = signal<UserProfile[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);

  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse<UserProfile[]>>(USER_API.GET_ALL)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load users');
          this.toastr.error('Failed to load users');
          return throwError(() => err);
        })
      )
      .subscribe(res => {
        if (res.success) {
          this.users.set(res.data);
        }
      });
  }

  getProfile(userId: number): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(USER_API.BY_ID(userId));
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserProfile>> {
    return this.http.patch<ApiResponse<UserProfile>>(USER_API.UPDATE_PROFILE, data);
  }

  createStaff(data: CreateStaffRequest) {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<CreateStaffResponse>>(USER_API.CREATE_STAFF, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Staff created successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to create staff');
          return throwError(() => err);
        })
      );
  }

  activateStaff(staffId: number) {
    this.isSubmitting.set(true);

    return this.http.patch<ApiResponse<void>>(USER_API.ACTIVATE_STAFF(staffId), {})
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.users.update(users =>
              users.map(u => u.userID === staffId ? { ...u, status: 'ACTIVE' } : u)
            );
            this.toastr.success(res.message || 'Staff activated successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to activate staff');
          return throwError(() => err);
        })
      );
  }

  deactivateStaff(staffId: number) {
    this.isSubmitting.set(true);

    return this.http.patch<ApiResponse<void>>(USER_API.DEACTIVATE_STAFF(staffId), {})
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.users.update(users =>
              users.map(u => u.userID === staffId ? { ...u, status: 'INACTIVE' } : u)
            );
            this.toastr.success(res.message || 'Staff deactivated successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to deactivate staff');
          return throwError(() => err);
        })
      );
  }

  deleteStaff(staffId: number) {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(USER_API.DELETE_STAFF(staffId))
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.users.update(users => users.filter(u => u.userID !== staffId));
            this.toastr.success(res.message || 'Staff deleted successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to delete staff');
          return throwError(() => err);
        })
      );
  }
}
