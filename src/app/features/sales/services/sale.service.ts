import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import {
  SaleSummary,
  SaleDetail,
  SaleResponse,
  CreateSaleRequest,
  UpdateSaleRequest,
  UpdateSaleStatusRequest,
  SaleStatus
} from '../models/sale.model';
import { SaleFilterParams } from '../models/sale-filter.model';
import { SALE_API } from '../constants/sale.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

/** Empty page state used as a fallback on error */
const EMPTY_PAGE: PageResponse<SaleSummary> = {
  content: [],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false
};

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State Signals
  sales = signal<SaleSummary[]>([]);
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

  loadSales(params?: SaleFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    const httpParams = this.buildHttpParams(params);

    this.http.get<ApiResponse<PageResponse<SaleSummary>>>(SALE_API.GET_ALL, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load sales');
          this.toastr.error('Failed to load sales');
          return of({ status: 500, success: false, message: 'Failed to load sales', data: EMPTY_PAGE } as ApiResponse<PageResponse<SaleSummary>>);
        })
      )
      .subscribe(res => {
        const page = (res.success && res.data) ? res.data : EMPTY_PAGE;
        this.applyPageState(page);
      });
  }

  getSaleById(id: number): Observable<ApiResponse<SaleDetail>> {
    return this.http.get<ApiResponse<SaleDetail>>(SALE_API.GET_BY_ID(id));
  }

  createSale(data: CreateSaleRequest): Observable<ApiResponse<SaleResponse>> {
    return this.mutate(
      this.http.post<ApiResponse<SaleResponse>>(SALE_API.CREATE, data),
      'Sale created successfully',
      'Failed to create sale'
    );
  }

  updateSale(id: number, data: UpdateSaleRequest): Observable<ApiResponse<SaleResponse>> {
    return this.mutate(
      this.http.put<ApiResponse<SaleResponse>>(SALE_API.UPDATE(id), data),
      'Sale updated successfully',
      'Failed to update sale'
    );
  }

  updateSaleStatus(id: number, status: SaleStatus): Observable<ApiResponse<SaleResponse>> {
    const body: UpdateSaleStatusRequest = { status };
    return this.mutate(
      this.http.patch<ApiResponse<SaleResponse>>(SALE_API.UPDATE_STATUS(id), body),
      `Sale status updated to ${status}`,
      'Failed to update status'
    );
  }

  deleteSale(id: number): Observable<ApiResponse<void>> {
    return this.mutate(
      this.http.delete<ApiResponse<void>>(SALE_API.DELETE(id)),
      'Sale deleted successfully',
      'Failed to delete sale'
    );
  }

  private buildHttpParams(params?: SaleFilterParams): HttpParams {
    let p = new HttpParams();
    if (!params) return p;

    if (params.page != null)           p = p.set('page',          params.page.toString());
    if (params.size != null)           p = p.set('size',          params.size.toString());
    if (params.sortBy)                 p = p.set('sortBy',        params.sortBy);
    if (params.sortDir)                p = p.set('sortDir',       params.sortDir);
    if (params.search?.trim())         p = p.set('search',        params.search.trim());
    if (params.invoiceNumber?.trim())  p = p.set('invoiceNumber', params.invoiceNumber.trim());
    if (params.customerId != null)     p = p.set('customerId',    params.customerId.toString());
    if (params.status && params.status !== 'ALL') p = p.set('status', params.status);
    if (params.startDate)              p = p.set('startDate',     params.startDate);
    if (params.endDate)                p = p.set('endDate',       params.endDate);
    if (params.minAmount != null)      p = p.set('minAmount',     params.minAmount.toString());
    if (params.maxAmount != null)      p = p.set('maxAmount',     params.maxAmount.toString());

    return p;
  }

  /** Write a PageResponse into the reactive state signals. */
  private applyPageState(page: PageResponse<SaleSummary>): void {
    this.sales.set(page.content ?? []);
    this.totalElements.set(page.totalElements ?? 0);
    this.totalPages.set(page.totalPages ?? 0);
    this.currentPage.set(page.pageNumber ?? 0);
    this.pageSize.set(page.pageSize ?? 10);
    this.isFirst.set(page.first);
    this.isLast.set(page.last);
    this.hasNext.set(page.hasNext);
    this.hasPrevious.set(page.hasPrevious);
  }

  private mutate<T>(
    source$: Observable<ApiResponse<T>>,
    successMsg: string,
    failMsg: string
  ): Observable<ApiResponse<T>> {
    this.isSubmitting.set(true);
    return source$.pipe(
      finalize(() => this.isSubmitting.set(false)),
      tap(res => { if (res.success) this.toastr.success(res.message || successMsg); }),
      catchError(err => {
        this.toastr.error(err.error?.message || failMsg);
        return throwError(() => err);
      })
    );
  }
}
