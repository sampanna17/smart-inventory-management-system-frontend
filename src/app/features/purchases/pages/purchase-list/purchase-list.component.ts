import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PurchaseService } from '../../services/purchase.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Purchase, PurchaseStatus } from '../../models/purchase.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PurchaseFormComponent } from '../../components/purchase-form/purchase-form.component';
import { PurchaseDetailModalComponent } from '../../components/purchase-detail-modal/purchase-detail-modal.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroShoppingCart,
  heroCurrencyDollar,
  heroCheckCircle,
  heroClock,
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
  selector: 'app-purchase-list',
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
    PurchaseFormComponent,
    PurchaseDetailModalComponent,
    HasRoleDirective,
    CustomSelectComponent,
    DateTimeComponent,
    NprCurrencyPipe,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroShoppingCart,
      heroCurrencyDollar,
      heroCheckCircle,
      heroClock,
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
  templateUrl: './purchase-list.component.html'
})
export class PurchaseListComponent implements OnInit {
  purchaseService = inject(PurchaseService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  readonly Role = Role;
  readonly PurchaseStatus = PurchaseStatus;
  readonly Math = Math;

  // Search, Filter, Sort & Pagination States
  searchQuery = signal<string>('');
  selectedStatusFilter = signal<string>('ALL');
  sortBy = signal<'date' | 'number' | 'amount'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions: number[] = [5, 10, 25, 50];

  sortOptions = [
    { label: 'Purchase Date', value: 'date' },
    { label: 'PO Number', value: 'number' },
    { label: 'Total Amount', value: 'amount' }
  ];

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  isStatusModalOpen = signal<boolean>(false);

  selectedPurchase = signal<Purchase | null>(null);
  targetStatus = signal<PurchaseStatus | null>(null);

  // Server-fed data accessors
  purchases = computed(() => this.purchaseService.purchases());
  totalElements = computed(() => this.purchaseService.totalElements());
  totalPages = computed(() => Math.max(1, this.purchaseService.totalPages()));
  totalPurchasesCount = computed(() => this.purchaseService.totalElements());

  totalSpentAmount = computed(() =>
    this.purchaseService.purchases().reduce((acc, p) => acc + (p.totalAmount || 0), 0)
  );
  receivedPurchasesCount = computed(() =>
    this.purchaseService.purchases().filter(p => p.status === PurchaseStatus.RECEIVED).length
  );
  pendingPurchasesCount = computed(() =>
    this.purchaseService.purchases().filter(p => p.status === PurchaseStatus.PENDING).length
  );

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadPurchases();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadPurchases();
    });
  }

  loadPurchases(): void {
    this.purchaseService.loadPurchases({
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
    this.loadPurchases();
  }

  setStatusFilter(status: string): void {
    this.selectedStatusFilter.set(status);
    this.currentPage.set(1);
    this.loadPurchases();
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy as 'date' | 'number' | 'amount');
    this.loadPurchases();
  }

  toggleSortOrder(): void {
    this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    this.loadPurchases();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadPurchases();
  }

  // Create / Edit Modal
  openCreateModal() {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedPurchase.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(p: Purchase) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedPurchase.set(p);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => {
      if (!this.isDetailModalOpen() && !this.isStatusModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedPurchase.set(null);
      }
    }, 200);
  }

  // Detail Modal
  openDetailModal(p: Purchase) {
    this.selectedPurchase.set(p);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    setTimeout(() => {
      if (!this.isStatusModalOpen() && !this.isFormModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedPurchase.set(null);
      }
    }, 200);
  }

  // Delete Modal
  openDeleteConfirm(p: Purchase) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedPurchase.set(p);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => {
      if (!this.isDetailModalOpen() && !this.isFormModalOpen() && !this.isStatusModalOpen()) {
        this.selectedPurchase.set(null);
      }
    }, 200);
  }

  confirmDelete() {
    const p = this.selectedPurchase();
    if (!p || !this.authService.hasRole(Role.ADMIN)) return;

    this.purchaseService.deletePurchase(p.purchaseId).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadPurchases();
      }
    });
  }

  // Status Modal
  openStatusModal(p: Purchase, newStatus: PurchaseStatus) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedPurchase.set(p);
    this.targetStatus.set(newStatus);
    this.isStatusModalOpen.set(true);
  }

  onDetailStatusChange(event: { id: number; status: PurchaseStatus }) {
    const p = this.purchaseService.purchases().find(item => item.purchaseId === event.id);
    if (p) {
      this.isDetailModalOpen.set(false);
      this.openStatusModal(p, event.status);
    }
  }

  closeStatusModal() {
    this.isStatusModalOpen.set(false);
    setTimeout(() => {
      if (!this.isDetailModalOpen() && !this.isFormModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedPurchase.set(null);
        this.targetStatus.set(null);
      }
    }, 200);
  }

  confirmStatusChange() {
    const p = this.selectedPurchase();
    const status = this.targetStatus();
    if (!p || !status || !this.authService.hasRole(Role.ADMIN)) return;

    this.purchaseService.updatePurchaseStatus(p.purchaseId, status).subscribe({
      next: () => {
        this.closeStatusModal();
        this.loadPurchases();
      }
    });
  }

  getStatusMessage(): string {
    const p = this.selectedPurchase();
    const status = this.targetStatus();
    if (!p || !status) return 'Are you sure you want to update the status?';

    if (status === PurchaseStatus.RECEIVED) {
      return `Changing status of '${p.purchaseNumber}' to RECEIVED will automatically add item quantities to your product inventory stock.`;
    } else if (p.status === PurchaseStatus.RECEIVED) {
      return `Changing status of '${p.purchaseNumber}' from RECEIVED to ${status} will reverse and subtract line item quantities from your product inventory stock.`;
    } else if (status === PurchaseStatus.CANCELLED) {
      return `Are you sure you want to cancel purchase order '${p.purchaseNumber}'?`;
    }
    return `Change status of PO '${p.purchaseNumber}' to ${status}?`;
  }
}
