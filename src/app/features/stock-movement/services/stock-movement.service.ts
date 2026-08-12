import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import {
  StockMovement,
  CreateStockMovementRequest,
  MovementType
} from '../models/stock-movement.model';
import { StockMovementFilterParams } from '../models/stock-movement-filter.model';
import { STOCK_MOVEMENT_API } from '../constants/stock-movement.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State Signals
  movements = signal<StockMovement[]>([]);
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

  loadMovements(params?: StockMovementFilterParams): void {
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
      if (params.productId !== undefined && params.productId !== null) {
        httpParams = httpParams.set('productId', params.productId.toString());
      }
      if (params.userId !== undefined && params.userId !== null) {
        httpParams = httpParams.set('userId', params.userId.toString());
      }
      if (params.movementType && params.movementType !== 'ALL') {
        httpParams = httpParams.set('movementType', params.movementType);
      }
      if (params.startDate) {
        httpParams = httpParams.set('startDate', params.startDate);
      }
      if (params.endDate) {
        httpParams = httpParams.set('endDate', params.endDate);
      }
      if (params.minQuantity !== undefined && params.minQuantity !== null) {
        httpParams = httpParams.set('minQuantity', params.minQuantity.toString());
      }
      if (params.maxQuantity !== undefined && params.maxQuantity !== null) {
        httpParams = httpParams.set('maxQuantity', params.maxQuantity.toString());
      }
    }

    this.http.get<ApiResponse<PageResponse<StockMovement>>>(STOCK_MOVEMENT_API.GET_ALL, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load stock movements');
          this.toastr.error('Failed to load stock movements');
          return of({
            status: 500,
            success: false,
            message: 'Failed to load stock movements',
            data: {
              content: [] as StockMovement[],
              pageNumber: 0,
              pageSize: 10,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false
            }
          } as ApiResponse<PageResponse<StockMovement>>);
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.movements.set(res.data.content || []);
          this.totalElements.set(res.data.totalElements || 0);
          this.totalPages.set(res.data.totalPages || 0);
          this.currentPage.set(res.data.pageNumber || 0);
          this.pageSize.set(res.data.pageSize || 10);
          this.isFirst.set(res.data.first);
          this.isLast.set(res.data.last);
          this.hasNext.set(res.data.hasNext);
          this.hasPrevious.set(res.data.hasPrevious);
        } else {
          this.movements.set([]);
          this.totalElements.set(0);
          this.totalPages.set(0);
        }
      });
  }

  getAllMovementsList(): Observable<ApiResponse<StockMovement[]>> {
    return this.http.get<ApiResponse<StockMovement[]>>(STOCK_MOVEMENT_API.GET_ALL_LIST);
  }

  getStockMovementById(id: number): Observable<ApiResponse<StockMovement>> {
    return this.http.get<ApiResponse<StockMovement>>(STOCK_MOVEMENT_API.GET_BY_ID(id));
  }

  createStockMovement(data: CreateStockMovementRequest): Observable<ApiResponse<StockMovement>> {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<StockMovement>>(STOCK_MOVEMENT_API.CREATE, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Stock movement recorded successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to record stock movement');
          return throwError(() => err);
        })
      );
  }

  deleteStockMovement(id: number): Observable<ApiResponse<void>> {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(STOCK_MOVEMENT_API.DELETE(id))
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Stock movement deleted successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to delete stock movement');
          return throwError(() => err);
        })
      );
  }
}
