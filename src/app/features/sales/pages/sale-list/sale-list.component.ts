import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SaleService } from '../../services/sale.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { SaleSummary, SaleDetail, SaleStatus } from '../../models/sale.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SaleFormComponent } from '../../components/sale-form/sale-form.component';
import { SaleDetailModalComponent } from '../../components/sale-detail-modal/sale-detail-modal.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroCurrencyDollar,
  heroBanknotes,
  heroCheckCircle,
  heroArrowPath,
  heroEye,
  heroPencilSquare,
  heroTrash,
  heroMagnifyingGlass,
  heroXMark,
  heroBarsArrowDown,
  heroBarsArrowUp,
  heroChevronLeft,
  heroChevronRight
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    SaleFormComponent,
    SaleDetailModalComponent,
    HasRoleDirective,
    CustomSelectComponent,
    DateTimeComponent,
    NprCurrencyPipe,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroCurrencyDollar,
      heroBanknotes,
      heroCheckCircle,
      heroArrowPath,
      heroEye,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
      heroXMark,
      heroBarsArrowDown,
      heroBarsArrowUp,
      heroChevronLeft,
      heroChevronRight
    })
  ],
  templateUrl: './sale-list.component.html'
})
export class SaleListComponent implements OnInit {
  saleService = inject(SaleService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  readonly Role = Role;
  readonly SaleStatus = SaleStatus;
  readonly Math = Math;

  // Search, Filter, Sort & Pagination States
  searchQuery = signal<string>('');
  selectedStatusFilter = signal<string>('ALL');
  sortBy = signal<'date' | 'invoice' | 'amount'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions: number[] = [5, 10, 25, 50];

  sortOptions = [
    { label: 'Sale Date', value: 'date' },
    { label: 'Invoice Number', value: 'invoice' },
    { label: 'Total Amount', value: 'amount' }
  ];

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  isStatusModalOpen = signal<boolean>(false);

  selectedSale = signal<SaleSummary | null>(null);
  selectedSaleDetail = signal<SaleDetail | null>(null);
  isFetchingDetail = signal<boolean>(false);
  targetStatus = signal<SaleStatus | null>(null);

  // Server-fed data accessors
  sales = computed(() => this.saleService.sales());
  totalElements = computed(() => this.saleService.totalElements());
  totalPages = computed(() => Math.max(1, this.saleService.totalPages()));
  totalSalesCount = computed(() => this.saleService.totalElements());

  totalRevenue = computed(() =>
    this.saleService.sales().filter(s => s.status === SaleStatus.COMPLETED).reduce((acc, s) => acc + (s.totalAmount || 0), 0)
  );
  completedSalesCount = computed(() =>
    this.saleService.sales().filter(s => s.status === SaleStatus.COMPLETED).length
  );
  refundedSalesCount = computed(() =>
    this.saleService.sales().filter(s => s.status === SaleStatus.REFUNDED).length
  );

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadSales();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadSales();
    });
  }

  loadSales(): void {
    this.saleService.loadSales({
      page: this.currentPage() - 1, // backend is 0-indexed
      size: this.pageSize(),
      search: this.searchQuery(),
      status: this.selectedStatusFilter(),
      sortBy: this.sortBy(),
      sortDir: this.sortOrder()
    });
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadSales();
  }

  setStatusFilter(status: string): void {
    this.selectedStatusFilter.set(status);
    this.currentPage.set(1);
    this.loadSales();
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy as 'date' | 'invoice' | 'amount');
    this.loadSales();
  }

  toggleSortOrder(): void {
    this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    this.loadSales();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadSales();
  }

  // Create / Edit Modal
  openCreateModal() {
    this.selectedSale.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(s: SaleSummary) {
    this.selectedSale.set(s);
    this.selectedSaleDetail.set(null);
    this.isFetchingDetail.set(true);

    this.saleService.getSaleById(s.saleId).subscribe({
      next: res => {
        this.isFetchingDetail.set(false);
        if (res.success && res.data) {
          this.selectedSaleDetail.set(res.data);
          this.isFormModalOpen.set(true);
        }
      },
      error: () => {
        this.isFetchingDetail.set(false);
      }
    });
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => {
      if (!this.isDetailModalOpen() && !this.isStatusModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedSale.set(null);
        this.selectedSaleDetail.set(null);
      }
    }, 200);
  }

  // Detail Modal
  openDetailModal(s: SaleSummary) {
    this.selectedSale.set(s);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    setTimeout(() => {
      if (!this.isStatusModalOpen() && !this.isFormModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedSale.set(null);
      }
    }, 200);
  }

  // Delete Modal
  openDeleteConfirm(s: SaleSummary) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedSale.set(s);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => {
      if (!this.isDetailModalOpen() && !this.isFormModalOpen() && !this.isStatusModalOpen()) {
        this.selectedSale.set(null);
      }
    }, 200);
  }

  confirmDelete() {
    const s = this.selectedSale();
    if (!s || !this.authService.hasRole(Role.ADMIN)) return;

    this.saleService.deleteSale(s.saleId).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadSales();
      }
    });
  }

  // Status Modal
  openStatusModal(s: SaleSummary, newStatus: SaleStatus) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedSale.set(s);
    this.targetStatus.set(newStatus);
    this.isStatusModalOpen.set(true);
  }

  onDetailStatusChange(event: { id: number; status: SaleStatus }) {
    const s = this.saleService.sales().find(item => item.saleId === event.id);
    if (s) {
      this.isDetailModalOpen.set(false);
      this.openStatusModal(s, event.status);
    }
  }

  closeStatusModal() {
    this.isStatusModalOpen.set(false);
    setTimeout(() => {
      if (!this.isDetailModalOpen() && !this.isFormModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedSale.set(null);
        this.targetStatus.set(null);
      }
    }, 200);
  }

  confirmStatusChange() {
    const s = this.selectedSale();
    const status = this.targetStatus();
    if (!s || !status || !this.authService.hasRole(Role.ADMIN)) return;

    this.saleService.updateSaleStatus(s.saleId, status).subscribe({
      next: () => {
        this.closeStatusModal();
        this.loadSales();
      }
    });
  }

  getStatusMessage(): string {
    const s = this.selectedSale();
    const status = this.targetStatus();
    if (!s || !status) return 'Are you sure you want to update the status?';

    if (status === SaleStatus.REFUNDED) {
      return `Refunding sale invoice '${s.invoiceNumber}' will automatically restore sold product quantities back to inventory stock.`;
    } else if (status === SaleStatus.CANCELLED) {
      return `Cancelling sale invoice '${s.invoiceNumber}' will restore product stock back to inventory.`;
    }
    return `Change status of invoice '${s.invoiceNumber}' to ${status}?`;
  }
}
