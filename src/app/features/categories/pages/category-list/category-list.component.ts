import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Category } from '../../../../core/models/category.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare, heroTrash, heroEye, heroMagnifyingGlass,
  heroTag, heroBarsArrowDown, heroBarsArrowUp, heroChevronLeft, heroChevronRight
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-category-list',
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
    CategoryFormComponent,
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
      heroTag,
      heroBarsArrowDown,
      heroBarsArrowUp,
      heroChevronLeft,
      heroChevronRight
    })
  ],
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent implements OnInit {
  categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  readonly Role = Role;
  readonly Math = Math;

  // Search, Filter, Sort & Pagination States
  searchQuery = signal<string>('');
  sortBy = signal<'name' | 'date'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions: number[] = [5, 10, 25, 50];

  sortOptions = [
    { label: 'Category Name', value: 'name' },
    { label: 'Date Added', value: 'date' }
  ];

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedCategory = signal<Category | null>(null);

  // Server-fed data accessors
  categories = computed(() => this.categoryService.categories());
  totalElements = computed(() => this.categoryService.totalElements());
  totalPages = computed(() => Math.max(1, this.categoryService.totalPages()));
  totalCategoriesCount = computed(() => this.categoryService.totalElements());

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadCategories();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.categoryService.loadCategories({
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
    this.sortBy.set(sortBy as 'name' | 'date');
    this.loadCategories();
  }

  toggleSortOrder(): void {
    this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    this.loadCategories();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadCategories();
  }

  openCreateModal() {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedCategory.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(category: Category) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedCategory.set(category);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => this.selectedCategory.set(null), 200);
  }

  openDeleteConfirm(category: Category) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedCategory.set(category);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedCategory.set(null), 200);
  }

  confirmDelete() {
    const category = this.selectedCategory();
    if (!category || !this.authService.hasRole(Role.ADMIN)) return;

    this.categoryService.deleteCategory(category.categoryID).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadCategories();
      }
    });
  }
}
