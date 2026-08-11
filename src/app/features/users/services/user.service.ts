import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { UserProfile, UpdateProfileRequest, CreateStaffRequest, CreateStaffResponse } from '../models/user-profile.model';
import { UserFilterParams } from '../models/user-filter.model';
import { USER_API } from '../constants/user.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

const EMPTY_PAGE: PageResponse<UserProfile> = {
  content: [],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State Signals
  users = signal<UserProfile[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0); // 0-based
  pageSize = signal<number>(10);
  isFirst = signal<boolean>(true);
  isLast = signal<boolean>(true);
  hasNext = signal<boolean>(false);
  hasPrevious = signal<boolean>(false);

  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);

  loadUsers(params?: UserFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    const httpParams = this.buildHttpParams(params);

    this.http.get<ApiResponse<PageResponse<UserProfile>>>(USER_API.GET_ALL, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load users');
          this.toastr.error('Failed to load users');
          return of({
            status: 500,
            success: false,
            message: 'Failed to load users',
            data: EMPTY_PAGE
          } as ApiResponse<PageResponse<UserProfile>>);
        })
      )
      .subscribe(res => {
        const page = (res.success && res.data) ? res.data : EMPTY_PAGE;
        this.applyPageState(page);
      });
  }

  getProfile(userId: number): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(USER_API.BY_ID(userId));
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserProfile>> {
    return this.http.patch<ApiResponse<UserProfile>>(USER_API.UPDATE_PROFILE, data);
  }

  createStaff(data: CreateStaffRequest): Observable<ApiResponse<CreateStaffResponse>> {
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

  activateStaff(staffId: number): Observable<ApiResponse<void>> {
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

  deactivateStaff(staffId: number): Observable<ApiResponse<void>> {
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

  deleteStaff(staffId: number): Observable<ApiResponse<void>> {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(USER_API.DELETE_STAFF(staffId))
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.users.update(users => users.filter(u => u.userID !== staffId));
            this.totalElements.update(count => Math.max(0, count - 1));
            this.toastr.success(res.message || 'Staff deleted successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to delete staff');
          return throwError(() => err);
        })
      );
  }

  private buildHttpParams(params?: UserFilterParams): HttpParams {
    let p = new HttpParams();
    if (!params) return p;

    if (params.page != null) p = p.set('page', params.page.toString());
    if (params.size != null) p = p.set('size', params.size.toString());
    if (params.sortBy) p = p.set('sortBy', params.sortBy);
    if (params.sortDir) p = p.set('sortDir', params.sortDir);
    if (params.search?.trim()) p = p.set('search', params.search.trim());
    if (params.role && params.role !== 'ALL') p = p.set('role', params.role);
    if (params.status && params.status !== 'ALL') p = p.set('status', params.status);

    return p;
  }

  private applyPageState(page: PageResponse<UserProfile>): void {
    this.users.set(page.content ?? []);
    this.totalElements.set(page.totalElements ?? 0);
    this.totalPages.set(page.totalPages ?? 0);
    this.currentPage.set(page.pageNumber ?? 0);
    this.pageSize.set(page.pageSize ?? 10);
    this.isFirst.set(page.first);
    this.isLast.set(page.last);
    this.hasNext.set(page.hasNext);
    this.hasPrevious.set(page.hasPrevious);
  }
}
