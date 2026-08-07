import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    SupplierFormComponent,
    SupplierDetailModalComponent,
    HasRoleDirective,
    CustomSelectComponent,
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

  readonly Role = Role;
  readonly Math = Math;

  // Search, Filter, Sort & Pagination States
  searchQuery = signal<string>('');
  sortBy = signal<'name' | 'phone' | 'date'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  sortOptions = [
    { label: 'Supplier Name', value: 'name' },
    { label: 'Phone Number', value: 'phone' },
    { label: 'Date Added', value: 'date' }
  ];

  pageSizeOptions = [
    { label: '5 per page', value: 5 },
    { label: '10 per page', value: 10 },
    { label: '25 per page', value: 25 },
    { label: '50 per page', value: 50 }
  ];

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedSupplier = signal<Supplier | null>(null);

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.supplierService.loadSuppliers();
  }

  // Filtered Suppliers Computed
  filteredSuppliers = computed(() => {
    const list = this.supplierService.suppliers();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return list;

    return list.filter(s =>
      s.supplierName.toLowerCase().includes(query) ||
      (s.phone && s.phone.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query)) ||
      (s.address && s.address.toLowerCase().includes(query))
    );
  });

  // Sorted Suppliers Computed
  sortedSuppliers = computed(() => {
    const list = [...this.filteredSuppliers()];
    const field = this.sortBy();
    const order = this.sortOrder() === 'asc' ? 1 : -1;

    return list.sort((a, b) => {
      if (field === 'name') {
        return a.supplierName.localeCompare(b.supplierName) * order;
      } else if (field === 'phone') {
        return (a.phone || '').localeCompare(b.phone || '') * order;
      } else if (field === 'date') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (dateA - dateB) * order;
      }
      return 0;
    });
  });

  // Paginated Suppliers Computed
  paginatedSuppliers = computed(() => {
    const list = this.sortedSuppliers();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.sortedSuppliers().length / this.pageSize()) || 1);

  // Top Metrics
  totalSuppliersCount = computed(() => this.supplierService.suppliers().length);

  suppliersWithEmailCount = computed(() =>
    this.supplierService.suppliers().filter(s => !!s.email).length
  );

  suppliersWithAddressCount = computed(() =>
    this.supplierService.suppliers().filter(s => !!s.address).length
  );

  // Handlers
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleSortOrder() {
    this.sortOrder.update(o => o === 'asc' ? 'desc' : 'asc');
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
      }
    });
  }
}
