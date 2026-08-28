import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../core/models/api-response.model';
import { REPORT_API } from '../constants/report.api';
import {
  SalesReportFilterParams,
  SalesReportResponse,
  InventoryReportFilterParams,
  InventoryReportResponse,
  PurchaseReportFilterParams,
  PurchaseReportResponse,
  AnalyticsFilterParams,
  ProductAnalyticsResponse,
  CustomerAnalyticsResponse,
  StaffPerformanceReportResponse
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // Reactive State Signals
  salesReport = signal<SalesReportResponse | null>(null);
  inventoryReport = signal<InventoryReportResponse | null>(null);
  purchaseReport = signal<PurchaseReportResponse | null>(null);
  productAnalytics = signal<ProductAnalyticsResponse | null>(null);
  customerAnalytics = signal<CustomerAnalyticsResponse | null>(null);
  staffReport = signal<StaffPerformanceReportResponse | null>(null);

  isLoading = signal<boolean>(false);
  isExporting = signal<boolean>(false);
  error = signal<string | null>(null);

  loadSalesReport(params?: SalesReportFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    const httpParams = this.buildSalesHttpParams(params);

    this.http.get<ApiResponse<SalesReportResponse>>(REPORT_API.SALES, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load sales report');
          this.toastr.error('Failed to load sales report');
          return of({ status: 500, success: false, message: 'Failed to load sales report', data: null as any });
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.salesReport.set(res.data);
        }
      });
  }

  loadInventoryReport(params?: InventoryReportFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    const httpParams = this.buildInventoryHttpParams(params);

    this.http.get<ApiResponse<InventoryReportResponse>>(REPORT_API.INVENTORY, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load inventory report');
          this.toastr.error('Failed to load inventory report');
          return of({ status: 500, success: false, message: 'Failed to load inventory report', data: null as any });
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.inventoryReport.set(res.data);
        }
      });
  }

  loadPurchaseReport(params?: PurchaseReportFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    const httpParams = this.buildPurchaseHttpParams(params);

    this.http.get<ApiResponse<PurchaseReportResponse>>(REPORT_API.PURCHASES, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load purchase report');
          this.toastr.error('Failed to load purchase report');
          return of({ status: 500, success: false, message: 'Failed to load purchase report', data: null as any });
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.purchaseReport.set(res.data);
        }
      });
  }

  loadProductAnalytics(params?: AnalyticsFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    const httpParams = this.buildAnalyticsHttpParams(params);

    this.http.get<ApiResponse<ProductAnalyticsResponse>>(REPORT_API.ANALYTICS_PRODUCTS, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load product analytics');
          return of({ status: 500, success: false, message: 'Failed to load product analytics', data: null as any });
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.productAnalytics.set(res.data);
        }
      });
  }

  loadCustomerAnalytics(params?: AnalyticsFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    const httpParams = this.buildAnalyticsHttpParams(params);

    this.http.get<ApiResponse<CustomerAnalyticsResponse>>(REPORT_API.ANALYTICS_CUSTOMERS, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load customer analytics');
          return of({ status: 500, success: false, message: 'Failed to load customer analytics', data: null as any });
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.customerAnalytics.set(res.data);
        }
      });
  }

  loadStaffReport(params?: AnalyticsFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    const httpParams = this.buildAnalyticsHttpParams(params);

    this.http.get<ApiResponse<StaffPerformanceReportResponse>>(REPORT_API.STAFF, { params: httpParams })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load staff performance report');
          return of({ status: 500, success: false, message: 'Failed to load staff performance report', data: null as any });
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.staffReport.set(res.data);
        }
      });
  }

  exportSalesReport(params?: SalesReportFilterParams): void {
    this.isExporting.set(true);
    const httpParams = this.buildSalesHttpParams(params);

    this.http.get(REPORT_API.EXPORT_SALES, { params: httpParams, responseType: 'blob' })
      .pipe(finalize(() => this.isExporting.set(false)))
      .subscribe({
        next: (blob) => this.downloadBlob(blob, `sales-report-${this.getTimestamp()}.csv`),
        error: () => this.toastr.error('Failed to export sales report')
      });
  }

  exportInventoryReport(params?: InventoryReportFilterParams): void {
    this.isExporting.set(true);
    const httpParams = this.buildInventoryHttpParams(params);

    this.http.get(REPORT_API.EXPORT_INVENTORY, { params: httpParams, responseType: 'blob' })
      .pipe(finalize(() => this.isExporting.set(false)))
      .subscribe({
        next: (blob) => this.downloadBlob(blob, `inventory-report-${this.getTimestamp()}.csv`),
        error: () => this.toastr.error('Failed to export inventory report')
      });
  }

  exportPurchaseReport(params?: PurchaseReportFilterParams): void {
    this.isExporting.set(true);
    const httpParams = this.buildPurchaseHttpParams(params);

    this.http.get(REPORT_API.EXPORT_PURCHASES, { params: httpParams, responseType: 'blob' })
      .pipe(finalize(() => this.isExporting.set(false)))
      .subscribe({
        next: (blob) => this.downloadBlob(blob, `purchases-report-${this.getTimestamp()}.csv`),
        error: () => this.toastr.error('Failed to export purchase report')
      });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.toastr.success('Report exported successfully');
  }

  private getTimestamp(): string {
    return new Date().toISOString().split('T')[0];
  }

  private buildSalesHttpParams(params?: SalesReportFilterParams): HttpParams {
    let p = new HttpParams();
    if (!params) return p;
    if (params.startDate) p = p.set('startDate', params.startDate);
    if (params.endDate) p = p.set('endDate', params.endDate);
    if (params.customerId != null) p = p.set('customerId', params.customerId.toString());
    if (params.userId != null) p = p.set('userId', params.userId.toString());
    if (params.status && params.status !== 'ALL') p = p.set('status', params.status);
    if (params.groupBy) p = p.set('groupBy', params.groupBy);
    return p;
  }

  private buildInventoryHttpParams(params?: InventoryReportFilterParams): HttpParams {
    let p = new HttpParams();
    if (!params) return p;
    if (params.categoryId != null) p = p.set('categoryId', params.categoryId.toString());
    if (params.stockStatus && params.stockStatus !== 'ALL') p = p.set('stockStatus', params.stockStatus);
    if (params.search?.trim()) p = p.set('search', params.search.trim());
    if (params.movementStartDate) p = p.set('movementStartDate', params.movementStartDate);
    if (params.movementEndDate) p = p.set('movementEndDate', params.movementEndDate);
    return p;
  }

  private buildPurchaseHttpParams(params?: PurchaseReportFilterParams): HttpParams {
    let p = new HttpParams();
    if (!params) return p;
    if (params.startDate) p = p.set('startDate', params.startDate);
    if (params.endDate) p = p.set('endDate', params.endDate);
    if (params.supplierId != null) p = p.set('supplierId', params.supplierId.toString());
    if (params.status && params.status !== 'ALL') p = p.set('status', params.status);
    return p;
  }

  private buildAnalyticsHttpParams(params?: AnalyticsFilterParams): HttpParams {
    let p = new HttpParams();
    if (!params) return p;
    if (params.startDate) p = p.set('startDate', params.startDate);
    if (params.endDate) p = p.set('endDate', params.endDate);
    if (params.limit != null) p = p.set('limit', params.limit.toString());
    return p;
  }
}
