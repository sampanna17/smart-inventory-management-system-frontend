import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    HasRoleDirective,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroPencilSquare, heroTrash })],
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent implements OnInit {
  categoryService = inject(CategoryService);
  private authService = inject(AuthService);

  readonly Role = Role;

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedCategory = signal<Category | null>(null);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.loadCategories();
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
      }
    });
  }
}
