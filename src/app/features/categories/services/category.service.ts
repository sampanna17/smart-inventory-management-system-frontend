import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { Category } from '../../../core/models/category.model';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../models/category-request.model';
import { CategoryFilterParams } from '../models/category-filter.model';
import { CATEGORY_API } from '../constants/category.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State
  categories = signal<Category[]>([]);
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

  loadCategories(params?: CategoryFilterParams): void {
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
      if (params.categoryName && params.categoryName.trim()) {
        httpParams = httpParams.set('categoryName', params.categoryName.trim());
      }
      if (params.description && params.description.trim()) {
        httpParams = httpParams.set('description', params.description.trim());
      }
    }

    this.http.get<ApiResponse<PageResponse<Category>>>(CATEGORY_API.GET_ALL, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load categories');
          this.toastr.error('Failed to load categories');
          return of({
            status: 500,
            success: false,
            message: 'Failed to load categories',
            data: {
              content: [] as Category[],
              pageNumber: 0,
              pageSize: 10,
              totalElements: 0,
              totalPages: 0,
              first: true,
              last: true,
              hasNext: false,
              hasPrevious: false
            }
          } as ApiResponse<PageResponse<Category>>);
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.categories.set(res.data.content || []);
          this.totalElements.set(res.data.totalElements || 0);
          this.totalPages.set(res.data.totalPages || 0);
          this.currentPage.set(res.data.pageNumber || 0);
          this.pageSize.set(res.data.pageSize || 10);
          this.isFirst.set(res.data.first);
          this.isLast.set(res.data.last);
          this.hasNext.set(res.data.hasNext);
          this.hasPrevious.set(res.data.hasPrevious);
        } else {
          this.categories.set([]);
          this.totalElements.set(0);
          this.totalPages.set(0);
        }
      });
  }

  getAllCategoriesList(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(CATEGORY_API.GET_ALL_LIST);
  }

  createCategory(data: CreateCategoryRequest) {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<Category>>(CATEGORY_API.CREATE, data)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
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

    return this.http.put<ApiResponse<Category>>(CATEGORY_API.UPDATE(id), data).pipe(
      finalize(() => this.isSubmitting.set(false)),
      tap((res) => {
        if (res.success) {
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

    return this.http.delete<ApiResponse<void>>(CATEGORY_API.DELETE(id))
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        tap(res => {
          if (res.success) {
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
