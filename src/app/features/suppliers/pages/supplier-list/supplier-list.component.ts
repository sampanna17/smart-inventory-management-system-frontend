import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SupplierService } from '../../services/supplier.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Supplier } from '../../../../core/models/supplier.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SupplierFormComponent } from '../../components/supplier-form/supplier-form.component';
import { SupplierDetailModalComponent } from '../../components/supplier-detail-modal/supplier-detail-modal.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare, heroTrash, heroEye, heroMagnifyingGlass,
  heroBuildingStorefront, heroPhone, heroEnvelope, heroMapPin,
  heroBarsArrowDown, heroBarsArrowUp, heroChevronLeft, heroChevronRight
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-supplier-list',
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
    SupplierFormComponent,
    SupplierDetailModalComponent,
    HasRoleDirective,
    CustomSelectComponent,
    DateTimeComponent,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroPencilSquare,
      heroTrash,
      heroEye,
      heroMagnifyingGlass,
      heroBuildingStorefront,
      heroPhone,
      heroEnvelope,
      heroMapPin,
      heroBarsArrowDown,
      heroBarsArrowUp,
      heroChevronLeft,
      heroChevronRight
    })
  ],
  templateUrl: './supplier-list.component.html'
})
export class SupplierListComponent implements OnInit {
  supplierService = inject(SupplierService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  readonly Role = Role;
  readonly Math = Math;

  // Search, Filter, Sort & Pagination States
  searchQuery = signal<string>('');
  sortBy = signal<'name' | 'phone' | 'date'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions: number[] = [5, 10, 25, 50];

  sortOptions = [
    { label: 'Supplier Name', value: 'name' },
    { label: 'Phone Number', value: 'phone' },
    { label: 'Date Added', value: 'date' }
  ];

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedSupplier = signal<Supplier | null>(null);

  // Server-fed data accessors
  suppliers = computed(() => this.supplierService.suppliers());
  totalElements = computed(() => this.supplierService.totalElements());
  totalPages = computed(() => Math.max(1, this.supplierService.totalPages()));

  // Top Metrics
  totalSuppliersCount = computed(() => this.supplierService.totalElements());

  suppliersWithEmailCount = computed(() =>
    this.supplierService.suppliers().filter(s => !!s.email).length
  );

  suppliersWithAddressCount = computed(() =>
    this.supplierService.suppliers().filter(s => !!s.address).length
  );

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadSuppliers();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadSuppliers();
    });
  }

  loadSuppliers(): void {
    this.supplierService.loadSuppliers({
      page: this.currentPage() - 1, // backend is 0-indexed
      size: this.pageSize(),
      search: this.searchQuery(),
      sortBy: this.sortBy(),
      sortDir: this.sortOrder(),
    });
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy as 'name' | 'phone' | 'date');
    this.loadSuppliers();
  }

  toggleSortOrder(): void {
    this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    this.loadSuppliers();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadSuppliers();
  }

  openCreateModal() {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedSupplier.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(supplier: Supplier) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedSupplier.set(supplier);
    this.isFormModalOpen.set(true);
  }

  openDetailModal(supplier: Supplier) {
    this.selectedSupplier.set(supplier);
    this.isDetailModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => {
      if (!this.isFormModalOpen() && !this.isDetailModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedSupplier.set(null);
      }
    }, 200);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    setTimeout(() => {
      if (!this.isFormModalOpen() && !this.isDetailModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedSupplier.set(null);
      }
    }, 200);
  }

  onEditFromDetail(supplier: Supplier) {
    this.isDetailModalOpen.set(false);
    this.openEditModal(supplier);
  }

  openDeleteConfirm(supplier: Supplier) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedSupplier.set(supplier);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => {
      if (!this.isFormModalOpen() && !this.isDetailModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedSupplier.set(null);
      }
    }, 200);
  }

  confirmDelete() {
    const supplier = this.selectedSupplier();
    if (!supplier || !this.authService.hasRole(Role.ADMIN)) return;

    this.supplierService.deleteSupplier(supplier.supplierID).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadSuppliers();
      }
    });
  }
}
