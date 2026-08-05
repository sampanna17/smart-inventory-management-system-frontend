import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../core/models/category.model';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private baseUrl = `${environment.apiUrl}/categories`;

  // State
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);

  loadCategories(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse<Category[]>>(this.baseUrl)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load categories');
          this.toastr.error('Failed to load categories');
          return throwError(() => err);
        })
      )
      .subscribe(res => {
        if (res.success) {
          this.categories.set(res.data);
        }
      });
  }

  createCategory(data: CreateCategoryRequest) {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<Category>>(`${this.baseUrl}/create`, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.categories.update(cats => [...cats, res.data]);
            this.toastr.success(res.message || 'Category created successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to create category');
          return throwError(() => err);
        })
      );
  }

  updateCategory(id: number, data: UpdateCategoryRequest) {
    this.isSubmitting.set(true);

    return this.http.put<ApiResponse<Category>>(`${this.baseUrl}/update/${id}`, data).pipe(
      finalize(() => this.isSubmitting.set(false)),
      tap((res) => {
        if (res.success) {
          this.categories.update((cats) => cats.map((c) => (c.categoryID === id ? res.data : c)));
          this.toastr.success(res.message || 'Category updated successfully');
        }
      }),
      catchError((err) => {
        this.toastr.error(err.error?.message || 'Failed to update category');
        return throwError(() => err);
      }),
    );
  }

  deleteCategory(id: number) {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
            this.categories.update(cats => cats.filter(c => c.categoryID !== id));
            this.toastr.success(res.message || 'Category deleted successfully');
          }
        }),
        catchError(err => {
          this.toastr.error(err.error?.message || 'Failed to delete category');
          return throwError(() => err);
        })
      );
  }
}
