import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  Purchase,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  UpdatePurchaseStatusRequest,
  PurchaseStatus,
  SupplierProductSummary
} from '../models/purchase.model';
import { PURCHASE_API } from '../constants/purchase.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // Signals
  purchases = signal<Purchase[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);

  loadPurchases(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse<Purchase[]>>(PURCHASE_API.GET_ALL)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load purchases');
          this.toastr.error('Failed to load purchases');
          return throwError(() => err);
        })
      )
      .subscribe(res => {
        if (res.success) {
          this.purchases.set(res.data || []);
        }
      });
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
            this.purchases.update(items => [res.data, ...items]);
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
            this.purchases.update(items =>
              items.map(p => p.purchaseId === id ? res.data : p)
            );
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
            this.purchases.update(items =>
              items.map(p => p.purchaseId === id ? res.data : p)
            );
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
            this.purchases.update(items => items.filter(p => p.purchaseId !== id));
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
