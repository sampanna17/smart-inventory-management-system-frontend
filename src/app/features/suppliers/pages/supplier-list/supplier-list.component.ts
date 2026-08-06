import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPencilSquare, heroTrash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    SupplierFormComponent,
    HasRoleDirective,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroPencilSquare, heroTrash })],
  templateUrl: './supplier-list.component.html'
})
export class SupplierListComponent implements OnInit {
  supplierService = inject(SupplierService);
  private authService = inject(AuthService);

  readonly Role = Role;

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedSupplier = signal<Supplier | null>(null);

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.supplierService.loadSuppliers();
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

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => this.selectedSupplier.set(null), 200);
  }

  openDeleteConfirm(supplier: Supplier) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedSupplier.set(supplier);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedSupplier.set(null), 200);
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
