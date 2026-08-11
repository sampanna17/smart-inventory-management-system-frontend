import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { Unit } from '../../../core/models/unit.model';
import { CreateUnitRequest, UpdateUnitRequest } from '../models/unit-request.model';
import { UnitFilterParams } from '../models/unit-filter.model';
import { UNIT_API } from '../constants/unit.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State
  units = signal<Unit[]>([]);
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

  loadUnits(params?: UnitFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined && params.page !== null) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.size !== undefined && params.size !== null) {
        httpParams = httpParams.set('size', params.size.toString());
      }
      if (params.sortBy) {
        httpParams = httpParams.set('sortBy', params.sortBy);
      }
      if (params.sortDir) {
        httpParams = httpParams.set('sortDir', params.sortDir);
      }
      if (params.search && params.search.trim()) {
        httpParams = httpParams.set('search', params.search.trim());
      }
      if (params.unitName && params.unitName.trim()) {
        httpParams = httpParams.set('unitName', params.unitName.trim());
      }
    }

    this.http.get<ApiResponse<PageResponse<Unit>>>(UNIT_API.GET_ALL, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load units');
          this.toastr.error('Failed to load units');
          return of({
            status: 500,
            success: false,
            message: 'Failed to load units',
            data: {
              content: [] as Unit[],
              pageNumber: 0,
              pageSize: 10,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false
            }
          } as ApiResponse<PageResponse<Unit>>);
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.units.set(res.data.content || []);
          this.totalElements.set(res.data.totalElements || 0);
          this.totalPages.set(res.data.totalPages || 0);
          this.currentPage.set(res.data.pageNumber || 0);
          this.pageSize.set(res.data.pageSize || 10);
          this.isFirst.set(res.data.first);
          this.isLast.set(res.data.last);
          this.hasNext.set(res.data.hasNext);
          this.hasPrevious.set(res.data.hasPrevious);
        } else {
          this.units.set([]);
          this.totalElements.set(0);
          this.totalPages.set(0);
        }
      });
  }

  createUnit(data: CreateUnitRequest) {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<Unit>>(UNIT_API.CREATE, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Unit created successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to create unit');
          return throwError(() => err);
        })
      );
  }

  updateUnit(id: number, data: UpdateUnitRequest) {
    this.isSubmitting.set(true);

    return this.http.put<ApiResponse<Unit>>(UNIT_API.UPDATE(id), data).pipe(
      finalize(() => this.isSubmitting.set(false)),
      tap((res) => {
        if (res.success) {
          this.toastr.success(res.message || 'Unit updated successfully');
        }
      }),
      catchError((err) => {
        this.toastr.error(err.error?.message || 'Failed to update unit');
        return throwError(() => err);
      }),
    );
  }

  deleteUnit(id: number) {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(UNIT_API.DELETE(id))
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Unit deleted successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to delete unit');
          return throwError(() => err);
        })
      );
  }
}
