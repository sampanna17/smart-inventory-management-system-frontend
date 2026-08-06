import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Customer } from '../../../core/models/customer.model';
import { CreateCustomerRequest, UpdateCustomerRequest } from '../models/customer-request.model';
import { CUSTOMER_API } from '../constants/customer.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State
  customers = signal<Customer[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);

  loadCustomers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse<Customer[]>>(CUSTOMER_API.GET_ALL)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load customers');
          this.toastr.error('Failed to load customers');
          return throwError(() => err);
        })
      )
      .subscribe(res => {
        if (res.success) {
          this.customers.set(res.data);
        }
      });
  }

  createCustomer(data: CreateCustomerRequest) {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<Customer>>(CUSTOMER_API.CREATE, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.customers.update(custs => [...custs, res.data]);
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
          this.customers.update((custs) =>
            custs.map((c) => (c.customerID === id ? res.data : c))
          );
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
            this.customers.update(custs => custs.filter(c => c.customerID !== id));
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
