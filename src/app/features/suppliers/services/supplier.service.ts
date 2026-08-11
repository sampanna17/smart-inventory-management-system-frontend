import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { Supplier, ProductSummary } from '../../../core/models/supplier.model';
import { CreateSupplierRequest, UpdateSupplierRequest } from '../models/supplier-request.model';
import { SupplierFilterParams } from '../models/supplier-filter.model';
import { SUPPLIER_API } from '../constants/supplier.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { PRODUCT_SUPPLIER_API } from '../../products/constants/product-supplier.api';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State
  suppliers = signal<Supplier[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0); // 0-based
  pageSize = signal<number>(10);
  isFirst = signal<boolean>(true);
  isLast = signal<boolean>(true);
  hasNext = signal<boolean>(false);
  hasPrevious = signal<boolean>(false);

  supplierProducts = signal<ProductSummary[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoadingProducts = signal<boolean>(false);
  error = signal<string | null>(null);

  loadSuppliers(params?: SupplierFilterParams): void {
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
      if (params.supplierName && params.supplierName.trim()) {
        httpParams = httpParams.set('supplierName', params.supplierName.trim());
      }
      if (params.email && params.email.trim()) {
        httpParams = httpParams.set('email', params.email.trim());
      }
      if (params.phone && params.phone.trim()) {
        httpParams = httpParams.set('phone', params.phone.trim());
      }
      if (params.address && params.address.trim()) {
        httpParams = httpParams.set('address', params.address.trim());
      }
    }

    this.http.get<ApiResponse<PageResponse<Supplier>>>(SUPPLIER_API.GET_ALL, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load suppliers');
          this.toastr.error('Failed to load suppliers');
          return of({
            status: 500,
            success: false,
            message: 'Failed to load suppliers',
            data: {
              content: [] as Supplier[],
              pageNumber: 0,
              pageSize: 10,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false
            }
          } as ApiResponse<PageResponse<Supplier>>);
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.suppliers.set(res.data.content || []);
          this.totalElements.set(res.data.totalElements || 0);
          this.totalPages.set(res.data.totalPages || 0);
          this.currentPage.set(res.data.pageNumber || 0);
          this.pageSize.set(res.data.pageSize || 10);
          this.isFirst.set(res.data.first);
          this.isLast.set(res.data.last);
          this.hasNext.set(res.data.hasNext);
          this.hasPrevious.set(res.data.hasPrevious);
        } else {
          this.suppliers.set([]);
          this.totalElements.set(0);
          this.totalPages.set(0);
        }
      });
  }

  getAllSuppliersList(): Observable<ApiResponse<Supplier[]>> {
    return this.http.get<ApiResponse<Supplier[]>>(SUPPLIER_API.GET_ALL_LIST);
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
