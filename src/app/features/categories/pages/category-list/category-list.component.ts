import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Category } from '../../../../core/models/category.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPencilSquare, heroTrash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    CategoryFormComponent,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroPencilSquare, heroTrash })],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">

      <app-page-header
        title="Categories"
        subtitle="Manage product categories and classifications"
        [showAction]="isAdmin()"
        actionLabel="Add Category"
        (action)="openCreateModal()"
      ></app-page-header>

      <!-- Main Content Area -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        <!-- Loading State -->
        @if (categoryService.isLoading()) {
          <div class="p-6">
            <app-skeleton-loader type="table"></app-skeleton-loader>
          </div>
        }
        <!-- Error State -->
        @else if (categoryService.error()) {
          <div class="p-6">
            <app-error-state
              [message]="categoryService.error()!"
              (retry)="loadCategories()"
            ></app-error-state>
          </div>
        }
        <!-- Empty State -->
        @else if (categoryService.categories().length === 0) {
          <div class="p-6">
            <app-empty-state
              title="No categories found"
              message="Get started by creating your first category."
              [showAction]="isAdmin()"
              (action)="openCreateModal()"
            ></app-empty-state>
          </div>
        }
        <!-- Data Table -->
        @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Name</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                  @if (isAdmin()) {
                    <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  }
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                @for (category of categoryService.categories(); track category.categoryID) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {{ category.categoryID }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-slate-900">{{ category.categoryName }}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell max-w-xs truncate">
                      {{ category.description || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">
                      {{ category.createdAt | date:'mediumDate' }}
                    </td>

                    @if (isAdmin()) {
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex justify-end gap-2">
                          <button
                            (click)="openEditModal(category)"
                            class="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Edit Category">
                            <ng-icon name="heroPencilSquare" class="text-lg"></ng-icon>
                          </button>
                          <button
                            (click)="openDeleteConfirm(category)"
                            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Category">
                            <ng-icon name="heroTrash" class="text-lg"></ng-icon>
                          </button>
                        </div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <!-- Modals -->
    <app-category-form
      [isOpen]="isFormModalOpen()"
      [category]="selectedCategory()"
      (close)="closeFormModal()"
      (saved)="loadCategories()"
    ></app-category-form>

    <app-confirm-dialog
      [isOpen]="isDeleteModalOpen()"
      title="Delete Category"
      message="Are you sure you want to delete '{{ selectedCategory()?.categoryName }}'? This action cannot be undone."
      confirmLabel="Delete"
      type="danger"
      [isLoading]="categoryService.isSubmitting()"
      (confirm)="confirmDelete()"
      (cancel)="closeDeleteModal()"
    ></app-confirm-dialog>
  `
})
export class CategoryListComponent implements OnInit {
  categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedCategory = signal<Category | null>(null);

  isAdmin = computed(() => {
    const user = this.authService.currentUser();
    return user?.role === 'ADMIN';
  });

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.loadCategories();
  }

  openCreateModal() {
    if (!this.isAdmin()) return;
    this.selectedCategory.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(category: Category) {
    if (!this.isAdmin()) return;
    this.selectedCategory.set(category);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    // Delay clearing selected to prevent flicker during close animation
    setTimeout(() => this.selectedCategory.set(null), 200);
  }

  openDeleteConfirm(category: Category) {
    if (!this.isAdmin()) return;
    this.selectedCategory.set(category);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedCategory.set(null), 200);
  }

  confirmDelete() {
    const category = this.selectedCategory();
    if (!category || !this.isAdmin()) return;

    this.categoryService.deleteCategory(category.categoryID).subscribe({
      next: () => {
        this.closeDeleteModal();
      }
    });
  }
}
