import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { Customer } from '../../../core/models/customer.model';
import { CreateCustomerRequest, UpdateCustomerRequest } from '../models/customer-request.model';
import { CustomerFilterParams } from '../models/customer-filter.model';
import { CUSTOMER_API } from '../constants/customer.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State
  customers = signal<Customer[]>([]);
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

  loadCustomers(params?: CustomerFilterParams): void {
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
      if (params.customerName && params.customerName.trim()) {
        httpParams = httpParams.set('customerName', params.customerName.trim());
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

    this.http.get<ApiResponse<PageResponse<Customer>>>(CUSTOMER_API.GET_ALL, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load customers');
          this.toastr.error('Failed to load customers');
          return of({
            status: 500,
            success: false,
            message: 'Failed to load customers',
            data: {
              content: [] as Customer[],
              pageNumber: 0,
              pageSize: 10,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false
            }
          } as ApiResponse<PageResponse<Customer>>);
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.customers.set(res.data.content || []);
          this.totalElements.set(res.data.totalElements || 0);
          this.totalPages.set(res.data.totalPages || 0);
          this.currentPage.set(res.data.pageNumber || 0);
          this.pageSize.set(res.data.pageSize || 10);
          this.isFirst.set(res.data.first);
          this.isLast.set(res.data.last);
          this.hasNext.set(res.data.hasNext);
          this.hasPrevious.set(res.data.hasPrevious);
        } else {
          this.customers.set([]);
          this.totalElements.set(0);
          this.totalPages.set(0);
        }
      });
  }

  getAllCustomersList(): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(CUSTOMER_API.GET_ALL_LIST);
  }

  createCustomer(data: CreateCustomerRequest) {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<Customer>>(CUSTOMER_API.CREATE, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Customer created successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to create customer');
          return throwError(() => err);
        })
      );
  }

  updateCustomer(id: number, data: UpdateCustomerRequest) {
    this.isSubmitting.set(true);

    return this.http.put<ApiResponse<Customer>>(CUSTOMER_API.UPDATE(id), data).pipe(
      finalize(() => this.isSubmitting.set(false)),
      tap((res) => {
        if (res.success) {
          this.toastr.success(res.message || 'Customer updated successfully');
        }
      }),
      catchError((err) => {
        this.toastr.error(err.error?.message || 'Failed to update customer');
        return throwError(() => err);
      }),
    );
  }

  deleteCustomer(id: number) {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(CUSTOMER_API.DELETE(id))
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.toastr.success(res.message || 'Customer deleted successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to delete customer');
          return throwError(() => err);
        })
      );
  }
}
