import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UnitService } from '../../services/unit.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Unit } from '../../../../core/models/unit.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UnitFormComponent } from '../../components/unit-form/unit-form.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare, heroTrash, heroEye, heroMagnifyingGlass,
  heroBarsArrowDown, heroBarsArrowUp, heroChevronLeft, heroChevronRight
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-unit-list',
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
    UnitFormComponent,
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
      heroBarsArrowDown,
      heroBarsArrowUp,
      heroChevronLeft,
      heroChevronRight
    })
  ],
  templateUrl: './unit-list.component.html'
})
export class UnitListComponent implements OnInit {
  unitService = inject(UnitService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  readonly Role = Role;
  readonly Math = Math;

  // Search, Filter, Sort & Pagination States
  searchQuery = signal<string>('');
  sortBy = signal<'id' | 'name'>('id');
  sortOrder = signal<'asc' | 'desc'>('asc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions: number[] = [5, 10, 25, 50];

  sortOptions = [
    { label: 'Unit ID', value: 'id' },
    { label: 'Unit Name', value: 'name' }
  ];

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedUnit = signal<Unit | null>(null);

  // Server-fed data accessors
  units = computed(() => this.unitService.units());
  totalElements = computed(() => this.unitService.totalElements());
  totalPages = computed(() => Math.max(1, this.unitService.totalPages()));
  totalUnitsCount = computed(() => this.unitService.totalElements());

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadUnits();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadUnits();
    });
  }

  loadUnits(): void {
    this.unitService.loadUnits({
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
    this.sortBy.set(sortBy as 'id' | 'name');
    this.loadUnits();
  }

  toggleSortOrder(): void {
    this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    this.loadUnits();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadUnits();
  }

  openCreateModal() {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedUnit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(unit: Unit) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedUnit.set(unit);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => this.selectedUnit.set(null), 200);
  }

  openDeleteConfirm(unit: Unit) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedUnit.set(unit);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedUnit.set(null), 200);
  }

  confirmDelete() {
    const unit = this.selectedUnit();
    if (!unit || !this.authService.hasRole(Role.ADMIN)) return;

    this.unitService.deleteUnit(unit.unitId).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadUnits();
      }
    });
  }
}
