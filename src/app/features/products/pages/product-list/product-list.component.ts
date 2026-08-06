import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare, heroTrash, heroEye, heroMagnifyingGlass, heroFunnel,
  heroSquares2x2, heroListBullet, heroExclamationTriangle, heroArchiveBox,
  heroCurrencyDollar, heroTag
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
    }),
  ],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  readonly Role = Role;

  // View Layout Mode
  viewMode = signal<'table' | 'grid'>('table');

  // Filter States
  searchQuery = signal<string>('');
  selectedCategoryId = signal<string>('all');
  stockStatusFilter = signal<'all' | 'instock' | 'lowstock' | 'outofstock'>('all');

  // Modal States
  isFormModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedProduct = signal<Product | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.productService.loadProducts();
    this.categoryService.loadCategories();
  }

  // Filtered Products Computed
  filteredProducts = computed(() => {
    const list = this.productService.products();
    const query = this.searchQuery().toLowerCase().trim();
    const catId = this.selectedCategoryId();
    const stockFilter = this.stockStatusFilter();

    return list.filter((p) => {
      // Search filter
      const matchesSearch =
        !query ||
        p.productName.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(query)) ||
        (p.unitName && p.unitName.toLowerCase().includes(query));

      // Category filter
      const matchesCategory = catId === 'all' || p.categoryId === Number(catId);

      // Stock status filter
      let matchesStock = true;
      if (stockFilter === 'instock') {
        matchesStock = p.stockQuantity > p.reorderLevel;
      } else if (stockFilter === 'lowstock') {
        matchesStock = p.stockQuantity > 0 && p.stockQuantity <= p.reorderLevel;
      } else if (stockFilter === 'outofstock') {
        matchesStock = p.stockQuantity <= 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  });

  // Top KPI Metrics
  totalProductsCount = computed(() => this.productService.products().length);

  totalInventoryValue = computed(() => {
    return this.productService
      .products()
      .reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0);
  });

  lowStockAlertsCount = computed(() => {
    return this.productService.products().filter((p) => p.stockQuantity <= p.reorderLevel).length;
  });

  categoriesCount = computed(() => this.categoryService.categories().length);

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
    setTimeout(() => this.selectedProduct.set(null), 200);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    setTimeout(() => this.selectedProduct.set(null), 200);
  }

  openDeleteConfirm(product: Product) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedProduct.set(product);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedProduct.set(null), 200);
  }

  confirmDelete() {
    const product = this.selectedProduct();
    if (!product || !this.authService.hasRole(Role.ADMIN)) return;

    this.productService.deleteProduct(product.productId).subscribe({
      next: () => {
        this.closeDeleteModal();
      },
    });
  }
}
