import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../../categories/services/category.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Product } from '../../../../core/models/product.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductDetailModalComponent } from '../../components/product-detail-modal/product-detail-modal.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare, heroTrash, heroEye, heroMagnifyingGlass, heroFunnel,
  heroSquares2x2, heroListBullet, heroExclamationTriangle, heroArchiveBox,
  heroCurrencyDollar, heroTag, heroBarsArrowDown, heroBarsArrowUp,
  heroChevronLeft, heroChevronRight, heroPhoto
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    ProductFormComponent,
    ProductDetailModalComponent,
    HasRoleDirective,
    NgIconComponent,
    NgOptimizedImage,
    NprCurrencyPipe,
    CustomSelectComponent,
  ],
  viewProviders: [
    provideIcons({
      heroPencilSquare,
      heroTrash,
      heroEye,
      heroMagnifyingGlass,
      heroFunnel,
      heroSquares2x2,
      heroListBullet,
      heroExclamationTriangle,
      heroArchiveBox,
      heroCurrencyDollar,
      heroTag,
      heroBarsArrowDown,
      heroBarsArrowUp,
      heroChevronLeft,
      heroChevronRight,
      heroPhoto
    }),
  ],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  readonly Role = Role;
  readonly Math = Math;

  // View Layout Mode
  viewMode = signal<'table' | 'grid'>('table');

  // Filter & Search States
  searchQuery = signal<string>('');
  selectedCategoryId = signal<string>('all');
  stockStatusFilter = signal<'all' | 'instock' | 'lowstock' | 'outofstock'>('all');

  // Sorting & Pagination States
  sortBy = signal<'name' | 'price' | 'stock' | 'date'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Filter Dropdown Options
  categoryOptions = computed(() => [
    { label: 'All Categories', value: 'all' },
    ...this.categoryService.categories().map(c => ({
      label: c.categoryName,
      value: String(c.categoryID)
    }))
  ]);

  stockStatusOptions = [
    { label: 'All Stock Status', value: 'all' },
    { label: 'In Stock', value: 'instock' },
    { label: 'Low Stock Alert', value: 'lowstock' },
    { label: 'Out of Stock', value: 'outofstock' }
  ];

  sortOptions = [
    { label: 'Product Name', value: 'name' },
    { label: 'Selling Price', value: 'price' },
    { label: 'Stock Level', value: 'stock' },
    { label: 'Date Added', value: 'date' }
  ];

  pageSizeOptions = [
    { label: '5 per page', value: 5 },
    { label: '10 per page', value: 10 },
    { label: '25 per page', value: 25 },
    { label: '50 per page', value: 50 }
  ];

  // Modal States
  isFormModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedProduct = signal<Product | null>(null);

  // Server-fed data accessors
  products = computed(() => this.productService.products());
  totalElements = computed(() => this.productService.totalElements());
  totalPages = computed(() => Math.max(1, this.productService.totalPages()));
  startItemIndex = computed(() => {
    if (this.totalElements() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  endItemIndex = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalElements());
  });

  // Top KPI Metrics
  totalProductsCount = computed(() => this.productService.totalElements());

  totalInventoryValue = computed(() => {
    return this.productService
      .products()
      .reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0);
  });

  lowStockAlertsCount = computed(() => {
    return this.productService.products().filter((p) => p.stockQuantity <= p.reorderLevel).length;
  });

  categoriesCount = computed(() => this.categoryService.categories().length);

  ngOnInit() {
    this.setupSearchDebounce();
    this.categoryService.loadCategories();
    this.loadProducts();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadProducts();
    });
  }

  loadData(): void {
    this.loadProducts();
    this.categoryService.loadCategories();
  }

  loadProducts(): void {
    this.productService.loadProducts({
      page: this.currentPage() - 1, // backend uses 0-based page index
      size: this.pageSize(),
      search: this.searchQuery(),
      categoryId: this.selectedCategoryId() !== 'all' ? Number(this.selectedCategoryId()) : undefined,
      stockStatus: this.stockStatusFilter() !== 'all' ? this.stockStatusFilter() : undefined,
      sortBy: this.sortBy(),
      sortDir: this.sortOrder(),
    });
  }

  // Filter Handlers
  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onCategoryChange(catId: string): void {
    this.selectedCategoryId.set(catId);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onStockStatusChange(status: string): void {
    this.stockStatusFilter.set(status as 'all' | 'instock' | 'lowstock' | 'outofstock');
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy as 'name' | 'price' | 'stock' | 'date');
    this.loadProducts();
  }

  toggleSortOrder(): void {
    this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    this.loadProducts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  // Modal handlers
  openCreateModal() {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedProduct.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(product: Product) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedProduct.set(product);
    this.isFormModalOpen.set(true);
  }

  openDetailModal(product: Product) {
    this.selectedProduct.set(product);
    this.isDetailModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => {
      if (!this.isFormModalOpen() && !this.isDetailModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedProduct.set(null);
      }
    }, 200);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    setTimeout(() => {
      if (!this.isFormModalOpen() && !this.isDetailModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedProduct.set(null);
      }
    }, 200);
  }

  onEditFromDetail(product: Product) {
    this.isDetailModalOpen.set(false);
    this.openEditModal(product);
  }

  openDeleteConfirm(product: Product) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedProduct.set(product);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => {
      if (!this.isFormModalOpen() && !this.isDetailModalOpen() && !this.isDeleteModalOpen()) {
        this.selectedProduct.set(null);
      }
    }, 200);
  }

  confirmDelete() {
    const product = this.selectedProduct();
    if (!product || !this.authService.hasRole(Role.ADMIN)) return;

    this.productService.deleteProduct(product.productId).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadProducts();
      },
    });
  }
}
