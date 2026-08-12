import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Customer } from '../../../../core/models/customer.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CustomerFormComponent } from '../../components/customer-form/customer-form.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare, heroTrash, heroEye, heroMagnifyingGlass,
  heroBarsArrowDown, heroBarsArrowUp, heroChevronLeft, heroChevronRight
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-customer-list',
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
    CustomerFormComponent,
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
      heroBarsArrowDown,
      heroBarsArrowUp,
      heroChevronLeft,
      heroChevronRight
    })
  ],
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  customerService = inject(CustomerService);
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
    { label: 'Customer Name', value: 'name' },
    { label: 'Phone Number', value: 'phone' },
    { label: 'Date Added', value: 'date' }
  ];

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedCustomer = signal<Customer | null>(null);

  // Server-fed data accessors
  customers = computed(() => this.customerService.customers());
  totalElements = computed(() => this.customerService.totalElements());
  totalPages = computed(() => Math.max(1, this.customerService.totalPages()));
  totalCustomersCount = computed(() => this.customerService.totalElements());

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadCustomers();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadCustomers();
    });
  }

  loadCustomers(): void {
    this.customerService.loadCustomers({
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
    this.loadCustomers();
  }

  toggleSortOrder(): void {
    this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    this.loadCustomers();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadCustomers();
  }

  openCreateModal() {
    this.selectedCustomer.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => this.selectedCustomer.set(null), 200);
  }

  openDeleteConfirm(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedCustomer.set(null), 200);
  }

  confirmDelete() {
    const customer = this.selectedCustomer();
    if (!customer) return;

    this.customerService.deleteCustomer(customer.customerID).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadCustomers();
      }
    });
  }
}
