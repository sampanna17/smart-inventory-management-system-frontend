import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { StockMovementService } from '../../services/stock-movement.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { StockMovement, MovementType } from '../../models/stock-movement.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StockMovementFormComponent } from '../../components/stock-movement-form/stock-movement-form.component';
import { StockMovementDetailModalComponent } from '../../components/stock-movement-detail-modal/stock-movement-detail-modal.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowsRightLeft,
  heroArrowDownTray,
  heroArrowUpTray,
  heroAdjustmentsHorizontal,
  heroEye,
  heroTrash,
  heroMagnifyingGlass,
  heroXMark,
  heroBarsArrowDown,
  heroBarsArrowUp,
  heroChevronLeft,
  heroChevronRight
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-stock-movement-list',
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
    StockMovementFormComponent,
    StockMovementDetailModalComponent,
    HasRoleDirective,
    CustomSelectComponent,
    DateTimeComponent,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroArrowsRightLeft,
      heroArrowDownTray,
      heroArrowUpTray,
      heroAdjustmentsHorizontal,
      heroEye,
      heroTrash,
      heroMagnifyingGlass,
      heroXMark,
      heroBarsArrowDown,
      heroBarsArrowUp,
      heroChevronLeft,
      heroChevronRight
    })
  ],
  templateUrl: './stock-movement-list.component.html'
})
export class StockMovementListComponent implements OnInit {
  stockMovementService = inject(StockMovementService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  readonly Role = Role;
  readonly MovementType = MovementType;
  readonly Math = Math;

  // Search, Filter, Sort & Pagination States
  searchQuery = signal<string>('');
  selectedTypeFilter = signal<string>('ALL');
  sortBy = signal<string>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions: number[] = [5, 10, 25, 50];

  typeFilterOptions = [
    { label: 'All Movements', value: 'ALL' },
    { label: 'Purchases (In)', value: MovementType.PURCHASE },
    { label: 'Sales (Out)', value: MovementType.SALE },
    { label: 'Adjustments', value: MovementType.ADJUSTMENT },
    { label: 'Returns (In)', value: MovementType.RETURN }
  ];

  sortOptions = [
    { label: 'Date & Time', value: 'date' },
    { label: 'Product Name', value: 'product' },
    { label: 'Quantity', value: 'quantity' },
    { label: 'Movement Type', value: 'type' }
  ];

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedMovement = signal<StockMovement | null>(null);

  // Server-fed data accessors
  movements = computed(() => this.stockMovementService.movements());
  totalElements = computed(() => this.stockMovementService.totalElements());
  totalPages = computed(() => Math.max(1, this.stockMovementService.totalPages()));
  totalMovementsCount = computed(() => this.stockMovementService.totalElements());

  inflowTotal = computed(() =>
    this.stockMovementService.movements()
      .filter(m => m.movementType === MovementType.PURCHASE || m.movementType === MovementType.RETURN)
      .reduce((acc, m) => acc + (m.quantity || 0), 0)
  );

  outflowTotal = computed(() =>
    this.stockMovementService.movements()
      .filter(m => m.movementType === MovementType.SALE)
      .reduce((acc, m) => acc + (m.quantity || 0), 0)
  );

  adjustmentsCount = computed(() =>
    this.stockMovementService.movements()
      .filter(m => m.movementType === MovementType.ADJUSTMENT).length
  );

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadMovements();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadMovements();
    });
  }

  loadMovements(): void {
    this.stockMovementService.loadMovements({
      page: this.currentPage() - 1, // backend is 0-indexed
      size: this.pageSize(),
      search: this.searchQuery(),
      movementType: this.selectedTypeFilter(),
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
    this.loadMovements();
  }

  setTypeFilter(type: string): void {
    this.selectedTypeFilter.set(type);
    this.currentPage.set(1);
    this.loadMovements();
  }

  onTypeFilterChange(type: string): void {
    this.selectedTypeFilter.set(type);
    this.currentPage.set(1);
    this.loadMovements();
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy);
    this.loadMovements();
  }

  toggleSortOrder(): void {
    this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    this.loadMovements();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadMovements();
  }

  openCreateModal() {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
  }

  openDetailModal(m: StockMovement) {
    this.selectedMovement.set(m);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    setTimeout(() => {
      if (!this.isDeleteModalOpen()) {
        this.selectedMovement.set(null);
      }
    }, 200);
  }

  openDeleteConfirm(m: StockMovement) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedMovement.set(m);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => {
      if (!this.isDetailModalOpen()) {
        this.selectedMovement.set(null);
      }
    }, 200);
  }

  confirmDelete() {
    const m = this.selectedMovement();
    if (!m || !this.authService.hasRole(Role.ADMIN)) return;

    this.stockMovementService.deleteStockMovement(m.movementId).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadMovements();
      }
    });
  }
}
