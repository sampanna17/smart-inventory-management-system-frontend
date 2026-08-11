import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import {
  Purchase,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  UpdatePurchaseStatusRequest,
  PurchaseStatus,
  SupplierProductSummary
} from '../models/purchase.model';
import { PurchaseFilterParams } from '../models/purchase-filter.model';
import { PURCHASE_API } from '../constants/purchase.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State Signals
  purchases = signal<Purchase[]>([]);
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

  loadPurchases(params?: PurchaseFilterParams): void {
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
      if (params.purchaseNumber && params.purchaseNumber.trim()) {
        httpParams = httpParams.set('purchaseNumber', params.purchaseNumber.trim());
      }
      if (params.supplierId !== undefined && params.supplierId !== null) {
        httpParams = httpParams.set('supplierId', params.supplierId.toString());
      }
      if (params.status && params.status !== 'ALL') {
        httpParams = httpParams.set('status', params.status);
      }
      if (params.startDate) {
        httpParams = httpParams.set('startDate', params.startDate);
      }
      if (params.endDate) {
        httpParams = httpParams.set('endDate', params.endDate);
      }
      if (params.minAmount !== undefined && params.minAmount !== null) {
        httpParams = httpParams.set('minAmount', params.minAmount.toString());
      }
      if (params.maxAmount !== undefined && params.maxAmount !== null) {
        httpParams = httpParams.set('maxAmount', params.maxAmount.toString());
      }
    }

    this.http.get<ApiResponse<PageResponse<Purchase>>>(PURCHASE_API.GET_ALL, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load purchases');
          this.toastr.error('Failed to load purchases');
          return of({
            status: 500,
            success: false,
            message: 'Failed to load purchases',
            data: {
              content: [] as Purchase[],
              pageNumber: 0,
              pageSize: 10,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false
            }
          } as ApiResponse<PageResponse<Purchase>>);
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.purchases.set(res.data.content || []);
          this.totalElements.set(res.data.totalElements || 0);
          this.totalPages.set(res.data.totalPages || 0);
          this.currentPage.set(res.data.pageNumber || 0);
          this.pageSize.set(res.data.pageSize || 10);
          this.isFirst.set(res.data.first);
          this.isLast.set(res.data.last);
          this.hasNext.set(res.data.hasNext);
          this.hasPrevious.set(res.data.hasPrevious);
        } else {
          this.purchases.set([]);
          this.totalElements.set(0);
          this.totalPages.set(0);
        }
      });
  }

  getAllPurchasesList(): Observable<ApiResponse<Purchase[]>> {
    return this.http.get<ApiResponse<Purchase[]>>(PURCHASE_API.GET_ALL_LIST);
  }

  getPurchaseById(id: number): Observable<ApiResponse<Purchase>> {
    return this.http.get<ApiResponse<Purchase>>(PURCHASE_API.GET_BY_ID(id));
  }

  createPurchase(data: CreatePurchaseRequest): Observable<ApiResponse<Purchase>> {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<Purchase>>(PURCHASE_API.CREATE, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Purchase created successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to create purchase');
          return throwError(() => err);
        })
      );
  }

  updatePurchase(id: number, data: UpdatePurchaseRequest): Observable<ApiResponse<Purchase>> {
    this.isSubmitting.set(true);

    return this.http.put<ApiResponse<Purchase>>(PURCHASE_API.UPDATE(id), data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Purchase updated successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to update purchase');
          return throwError(() => err);
        })
      );
  }

  updatePurchaseStatus(id: number, status: PurchaseStatus): Observable<ApiResponse<Purchase>> {
    this.isSubmitting.set(true);
    const body: UpdatePurchaseStatusRequest = { status };

    return this.http.patch<ApiResponse<Purchase>>(PURCHASE_API.UPDATE_STATUS(id), body)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || `Purchase status updated to ${status}`);
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to update status');
          return throwError(() => err);
        })
      );
  }

  deletePurchase(id: number): Observable<ApiResponse<void>> {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(PURCHASE_API.DELETE(id))
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Purchase deleted successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to delete purchase');
          return throwError(() => err);
        })
      );
  }

  getProductsBySupplier(supplierId: number): Observable<ApiResponse<SupplierProductSummary[]>> {
    return this.http.get<ApiResponse<SupplierProductSummary[]>>(
      PURCHASE_API.GET_PRODUCTS_BY_SUPPLIER(supplierId)
    );
  }
}
