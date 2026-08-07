import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Supplier } from '../../../core/models/supplier.model';
import { CreateSupplierRequest, UpdateSupplierRequest } from '../models/supplier-request.model';
import { SUPPLIER_API } from '../constants/supplier.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { PRODUCT_SUPPLIER_API } from '../../products/constants/product-supplier.api';
import { ProductSummary } from '../../../core/models/supplier.model';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State
  suppliers = signal<Supplier[]>([]);
  supplierProducts = signal<ProductSummary[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoadingProducts = signal<boolean>(false);
  error = signal<string | null>(null);

  loadSuppliers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse<Supplier[]>>(SUPPLIER_API.GET_ALL)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load suppliers');
          this.toastr.error('Failed to load suppliers');
          return throwError(() => err);
        })
      )
      .subscribe(res => {
        if (res.success) {
          this.suppliers.set(res.data);
        }
      });
  }

  getSupplierById(id: number) {
    return this.http.get<ApiResponse<Supplier>>(`${SUPPLIER_API.GET_ALL}/${id}`);
  }

  loadSupplierProducts(supplierId: number): void {
    this.isLoadingProducts.set(true);
    this.supplierProducts.set([]);
    this.http.get<ApiResponse<ProductSummary[]>>(PRODUCT_SUPPLIER_API.GET_PRODUCTS_BY_SUPPLIER(supplierId)).pipe(
      finalize(() => this.isLoadingProducts.set(false)),
      catchError(() => of({ success: false, data: [] as ProductSummary[] } as ApiResponse<ProductSummary[]>))
    ).subscribe(res => {
      if (res.success && res.data) {
        this.supplierProducts.set(res.data);
      }
    });
  }

  createSupplier(data: CreateSupplierRequest) {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<Supplier>>(SUPPLIER_API.CREATE, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.suppliers.update(suppliers => [...suppliers, res.data]);
            this.toastr.success(res.message || 'Supplier created successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to create supplier');
          return throwError(() => err);
        })
      );
  }

  updateSupplier(id: number, data: UpdateSupplierRequest) {
    this.isSubmitting.set(true);

    return this.http.put<ApiResponse<Supplier>>(SUPPLIER_API.UPDATE(id), data).pipe(
      finalize(() => this.isSubmitting.set(false)),
      tap((res) => {
        if (res.success) {
          this.suppliers.update((suppliers) =>
            suppliers.map((s) => (s.supplierID === id ? res.data : s))
          );
          this.toastr.success(res.message || 'Supplier updated successfully');
        }
      }),
      catchError((err) => {
        this.toastr.error(err.error?.message || 'Failed to update supplier');
        return throwError(() => err);
      }),
    );
  }

  deleteSupplier(id: number) {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(SUPPLIER_API.DELETE(id))
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.suppliers.update(suppliers => suppliers.filter(s => s.supplierID !== id));
            this.toastr.success(res.message || 'Supplier deleted successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to delete supplier');
          return throwError(() => err);
        })
      );
  }
}

